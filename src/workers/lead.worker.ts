import { PrismaClient, LeadType, User, Campaign } from '@prisma/client';
import { findLeadsInSubmissions, findLeadsInComments, RawLead } from '../services/reddit.service';
import { enrichLeadsForUser, EnrichedLead } from '../services/enrichment.service';
import { analyzeSentiment } from '../services/ai.service';
import { calculateLeadScore } from '../services/scoring.service';
import { webhookService } from '../services/webhook.service';
import { AIUsageService } from '../services/aitracking.service';

const prisma = new PrismaClient();
const BATCH_SIZE = 50; // Process 50 campaigns at a time
const MAX_RETRIES = 3;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const saveLeadsToDatabase = async (
    leads: EnrichedLead[],
    campaignId: string,
    userId: string,
    leadType: LeadType
): Promise<number> => {
    let savedCount = 0;
    const highQualityLeads: EnrichedLead[] = [];

    for (const lead of leads) {
        try {
            const savedLead = await prisma.lead.upsert({
                where: { url: lead.url },
                update: {},
                create: {
                    redditId: lead.id,
                    title: lead.title,
                    author: lead.author,
                    subreddit: lead.subreddit,
                    url: lead.url,
                    body: lead.body,
                    postedAt: new Date(lead.createdAt * 1000),
                    opportunityScore: lead.opportunityScore,
                    campaignId: campaignId,
                    userId: userId,
                    type: leadType,
                    intent: lead.intent,
                    sentiment: (lead as any).sentiment || null,
                }
            });
            savedCount++;

            if (lead.opportunityScore >= 70) {
                highQualityLeads.push({ ...lead, id: savedLead.id });
            }
        } catch (error: any) {
            // P2002 is the unique constraint violation code, which is expected and can be ignored.
            if (error.code !== 'P2002') {
                console.error(`Failed to save lead ${lead.id}:`, error.message);
            }
        }
    }

    // Broadcast high-quality leads via webhooks
    for (const lead of highQualityLeads) {
        try {
            await webhookService.broadcastEvent('lead.discovered', {
                title: lead.title,
                subreddit: lead.subreddit,
                author: lead.author,
                opportunityScore: lead.opportunityScore,
                intent: lead.intent,
                url: lead.url,
                numComments: (lead as any).numComments,
                upvoteRatio: (lead as any).upvoteRatio,
                createdAt: lead.createdAt,
                body: lead.body,
                id: lead.id,
                campaignId: campaignId
            }, userId, campaignId, getPriorityFromScore(lead.opportunityScore));
        } catch (webhookError) {
            console.error(`Failed to broadcast webhook for lead ${lead.id}:`, webhookError);
        }
    }

    return savedCount;
};

const getPriorityFromScore = (score: number): 'low' | 'medium' | 'high' | 'urgent' => {
    if (score >= 90) return 'urgent';
    if (score >= 80) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
};

export const runLeadDiscoveryWorker = async (): Promise<void> => {
    console.log('Starting lead discovery worker run...');
    let cursor: string | null = null;

    while (true) {
        const campaigns: (Campaign & { user: User })[] = await prisma.campaign.findMany({
            take: BATCH_SIZE,
            ...(cursor && { skip: 1, cursor: { id: cursor } }),
            where: {
                isActive: true,
                user: {
                    subscriptionStatus: { in: ['active', 'trialing'] }
                }
            },
            include: { user: true },
            orderBy: { id: 'asc' }
        });

        if (campaigns.length === 0) {
            console.log('No more active campaigns to process. Worker run finished.');
            break;
        }

        for (const campaign of campaigns) {
            let retries = 0;
            while (retries < MAX_RETRIES) {
                try {
                    const user = campaign.user;
                    if (!user) {
                        console.log(`Skipping campaign ${campaign.id} as it has no associated user.`);
                        break;
                    }

                    const currentLeadCount = await getCurrentMonthLeadCount(user.id);
                    const leadLimit = getUserLeadLimit(user);

                    if (currentLeadCount >= leadLimit) {
                        console.log(`⚠️  User ${user.id} has reached lead limit (${currentLeadCount}/${leadLimit})`);
                        break;
                    }

                    console.log(`Processing campaign ${campaign.id} for user ${user.id}`);
                    
                    // FIX: The automatic global search logic has been removed from this worker.
                    // This worker now only handles automatic competitor discovery for pro users.
                    // Global and targeted discovery are now triggered manually by the user from the frontend.

                    // --- COMPETITOR DISCOVERY: Uses targeted search for precision (can run more frequently) ---
                    if (user.plan === 'pro' && campaign.competitors && campaign.competitors.length > 0) {
                        const aiUsage = AIUsageService.getInstance();
                        // Note: The usage type here is 'competitor', not 'manual_discovery'.
                        // This is a separate, automatic check.
                        const canUseCompetitorAI = await aiUsage.trackAIUsage(user.id, 'competitor', user.plan);
                        if (canUseCompetitorAI) {
                            console.log(`[Worker] Running TARGETED competitor search for campaign ${campaign.id}...`);
                            const [submissionLeads, commentLeads] = await Promise.all([
                                findLeadsInSubmissions(campaign.competitors, campaign.targetSubreddits),
                                findLeadsInComments(campaign.competitors, campaign.targetSubreddits)
                            ]);

                            const competitorLeads = [...submissionLeads, ...commentLeads];
                            const uniqueCompetitorLeadsMap = new Map<string, RawLead>();
                            competitorLeads.forEach(lead => {
                                if(!uniqueCompetitorLeadsMap.has(lead.url)) {
                                    uniqueCompetitorLeadsMap.set(lead.url, lead);
                                }
                            });
                            const uniqueCompetitorLeads = Array.from(uniqueCompetitorLeadsMap.values());

                            if (uniqueCompetitorLeads.length > 0) {
                                const enrichedCompetitorLeads = await Promise.all(
                                    uniqueCompetitorLeads.map(async (lead): Promise<EnrichedLead> => {
                                        const sentiment = await analyzeSentiment(lead.title, lead.body, user.id, user.plan);
                                        const opportunityScore = calculateLeadScore({ ...lead, sentiment, type: 'COMPETITOR_MENTION' });
                                        return { ...lead, sentiment, opportunityScore, intent: 'competitor_mention' };
                                    })
                                );
                                const saved = await saveLeadsToDatabase(enrichedCompetitorLeads, campaign.id, user.id, 'COMPETITOR_MENTION');
                                console.log(`  -> Saved ${saved} competitor leads for user ${user.id}`);
                            } else {
                                console.log(`  -> No new competitor leads found for campaign ${campaign.id}`);
                            }
                        } else {
                            console.log(`[Worker] Skipping competitor search for user ${user.id} due to usage limits.`);
                        }
                    }

                    break; // Success, exit retry loop
                } catch (error) {
                    retries++;
                    console.error(`Error processing campaign ${campaign.id} (attempt ${retries}/${MAX_RETRIES}):`, error);
                    if (retries >= MAX_RETRIES) {
                        console.error(`Failed to process campaign ${campaign.id} after ${MAX_RETRIES} attempts.`);
                    } else {
                        await delay(1000 * Math.pow(2, retries)); // Exponential backoff
                    }
                }
            }
        }
        cursor = campaigns[campaigns.length - 1].id;
    }
};

async function getCurrentMonthLeadCount(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return await prisma.lead.count({
        where: {
            userId,
            createdAt: { gte: startOfMonth }
        }
    });
}

const getUserLeadLimit = (user: User): number => {
    switch (user.plan) {
        case 'free': return 25;
        case 'starter': return 200;
        case 'pro': return 1000;
        default: return 25;
    }
};