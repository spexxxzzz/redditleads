// /src/workers/lead.worker.ts

import { PrismaClient, LeadType, User, Campaign } from '@prisma/client';
import { findLeadsGlobally, findLeadsInSubmissions, findLeadsInComments, RawLead } from '../services/reddit.service';
import { enrichLeadsForUser, EnrichedLead } from '../services/enrichment.service';
import { analyzeSentiment } from '../services/ai.service';
import { calculateLeadScore } from '../services/scoring.service';
import { webhookService } from '../services/webhook.service';
import { AIUsageService } from '../services/aitracking.service';
import { calculateContentRelevance } from '../services/relevance.service';
import { sendEmail } from '../services/email.service';

const prisma = new PrismaClient();
const BATCH_SIZE = 50; // Process 50 campaigns at a time
const MAX_RETRIES = 3;
const GLOBAL_SEARCH_INTERVAL_HOURS = 30; // Set the desired interval in hours

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
                numComments: lead.numComments,
                upvoteRatio: lead.upvoteRatio,
                createdAt: lead.createdAt,
                body: lead.body,
                id: lead.id,
                campaignId: campaignId
            }, userId, campaignId, getPriorityFromScore(lead.opportunityScore));
        } catch (webhookError) {
            console.error(`Failed to broadcast webhook for lead ${lead.id}:`, webhookError);
        }
    }

    if (savedCount > 0) {
        const userSettings = await prisma.emailNotificationSetting.findUnique({
            where: { userId },
        });

        if (userSettings && userSettings.enabled) {
            await sendEmail(
                userSettings.email,
                `${savedCount} new leads discovered!`,
                `<h1>You have ${savedCount} new leads waiting for you in RedLead.</h1>`
            );
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
    const GLOBAL_SEARCH_INTERVAL_MS = GLOBAL_SEARCH_INTERVAL_HOURS * 60 * 60 * 1000;

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
                    const now = new Date();

                    // --- PRIMARY LEAD DISCOVERY: Use Global Search with Time Gate ---
                    const lastSearch = campaign.lastGlobalSearchAt;
                    const isDueForGlobalSearch = !lastSearch || (now.getTime() - lastSearch.getTime()) > GLOBAL_SEARCH_INTERVAL_MS;


// Update the worker logic section
if (isDueForGlobalSearch) {
    if (campaign.generatedKeywords && campaign.generatedKeywords.length > 0) {
        console.log(`[Worker] Running GLOBAL search for campaign ${campaign.id}...`);
        const rawLeads = await findLeadsGlobally(
            campaign.generatedKeywords,
            campaign.negativeKeywords || [],
            campaign.subredditBlacklist || [],
            campaign.generatedDescription
        );

        console.log(`[Worker] Found ${rawLeads.length} potential global leads.`);

        // 🎯 IMPROVED: Filter for relevance with fallback strategy
        const relevantLeads = rawLeads.filter(lead => {
            const relevance = calculateContentRelevance(
                lead,
                campaign.generatedKeywords,
                campaign.generatedDescription
            );

            if (relevance.isRelevant) {
                console.log(`✅ Relevant lead: "${lead.title.substring(0, 50)}..." (Score: ${relevance.score})`);
                console.log(`   Reasons: ${relevance.reasons.join('; ')}`);
                return true;
            } else {
                console.log(`❌ Filtered out: "${lead.title.substring(0, 50)}..." (Score: ${relevance.score})`);
                return false;
            }
        });

        console.log(`[Worker] Filtered to ${relevantLeads.length} relevant leads (${rawLeads.length > 0 ? ((relevantLeads.length / rawLeads.length) * 100).toFixed(1) : 0}% relevance rate)`);

        // 🎯 NEW: Fallback strategy if we got too few relevant leads
        let leadsToProcess = relevantLeads;
        if (relevantLeads.length < 3 && rawLeads.length > 0) {
            console.log(`[Worker] Too few relevant leads (${relevantLeads.length}). Using fallback strategy...`);

            // Sort by a simple score and take top ones as fallback
            const fallbackLeads = rawLeads
                .sort((a, b) => {
                    // Simple fallback scoring: comments + keyword matches
                    const aScore = a.numComments + (a.title.toLowerCase().includes(campaign.generatedKeywords[0]?.toLowerCase() || '') ? 10 : 0);
                    const bScore = b.numComments + (b.title.toLowerCase().includes(campaign.generatedKeywords[0]?.toLowerCase() || '') ? 10 : 0);
                    return bScore - aScore;
                })
                .slice(0, Math.max(5, Math.floor(rawLeads.length * 0.3))); // Take top 30% or at least 5

            console.log(`[Worker] Using ${fallbackLeads.length} leads from fallback strategy`);
            leadsToProcess = fallbackLeads;
        }

        if (leadsToProcess.length > 0) {
            const enrichedLeads = await enrichLeadsForUser(leadsToProcess, user);
            const saved = await saveLeadsToDatabase(enrichedLeads, campaign.id, user.id, 'DIRECT_LEAD');
            console.log(`  -> Saved ${saved} leads for user ${user.id} (${relevantLeads.length} high-relevance + ${leadsToProcess.length - relevantLeads.length} fallback)`);
        } else {
            console.log(`  -> No leads to process for campaign ${campaign.id}`);
        }

        // Update the timestamp after a successful run
        await prisma.campaign.update({
            where: { id: campaign.id },
            data: { lastGlobalSearchAt: now },
        });
        console.log(`  -> Updated last global search time for campaign ${campaign.id}`);
    }
}
else {
                        const hoursSinceLastSearch = ((now.getTime() - lastSearch.getTime()) / (1000 * 60 * 60)).toFixed(2);
                        console.log(`[Worker] Skipping GLOBAL search for campaign ${campaign.id}. Last ran ${hoursSinceLastSearch} hours ago (next run in ~${(GLOBAL_SEARCH_INTERVAL_HOURS - parseFloat(hoursSinceLastSearch)).toFixed(2)} hours).`);
                    }

                    // --- COMPETITOR DISCOVERY: Uses targeted search for precision (can run more frequently) ---
                    if (user.plan === 'pro' && campaign.competitors && campaign.competitors.length > 0) {
                        const aiUsage = AIUsageService.getInstance();
                        const canUseCompetitorAI = await aiUsage.trackAIUsage(user.id, 'competitor');
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

                            const enrichedCompetitorLeads = await Promise.all(
                                uniqueCompetitorLeads.map(async (lead): Promise<EnrichedLead> => {
                                    const sentiment = await analyzeSentiment(lead.title, lead.body, user.id);
                                    const opportunityScore = calculateLeadScore({ ...lead, sentiment, type: 'COMPETITOR_MENTION' });
                                    return { ...lead, sentiment, opportunityScore, intent: 'competitor_mention' };
                                })
                            );
                            const saved = await saveLeadsToDatabase(enrichedCompetitorLeads, campaign.id, user.id, 'COMPETITOR_MENTION');
                            console.log(`  -> Saved ${saved} competitor leads for user ${user.id}`);
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