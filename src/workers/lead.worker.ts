import { PrismaClient, LeadType, User } from '@prisma/client';
import { findLeadsOnReddit, RawLead } from '../services/reddit.service';
import { enrichLeadsForUser, EnrichedLead } from '../services/enrichment.service';
import { analyzeSentiment } from '../services/ai.service';
import { calculateLeadScore } from '../services/scoring.service';
import { webhookService } from '../services/webhook.service';
import { AIUsageService } from '../services/aitracking.service';

const prisma = new PrismaClient();

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
            await prisma.lead.create({
                data: {
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
                    //@ts-ignore
                    sentiment: lead.sentiment || null,
                }
            });
            savedCount++;

            if (lead.opportunityScore >= 70) {
                highQualityLeads.push(lead);
            }
        } catch (error: any) {
            if (error.code !== 'P2002') {
                console.error(`Failed to save lead ${lead.id}:`, error.message);
            }
        }
    }

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

    const campaigns = await prisma.campaign.findMany({
        where: {
            isActive: true,
            user: {
                subscriptionStatus: { in: ['active', 'trialing'] }
            }
        },
        include: { user: true }
    });

    if (campaigns.length === 0) {
        console.log('No active campaigns to process. Worker run finished.');
        return;
    }

    console.log(`Found ${campaigns.length} campaigns to process.`);

    for (const campaign of campaigns) {
        const user = campaign.user;
        if (!user) continue;

        const currentLeadCount = await getCurrentMonthLeadCount(user.id);
        const leadLimit = getUserLeadLimit(user);

        if (currentLeadCount >= leadLimit) {
            console.log(`⚠️  User ${user.id} has reached lead limit (${currentLeadCount}/${leadLimit})`);
            continue;
        }

        const remainingQuota = leadLimit - currentLeadCount;
        console.log(`Processing campaign ${campaign.id} for user ${user.id} (${remainingQuota} leads remaining)`);

        try {
            if (campaign.generatedKeywords && campaign.generatedKeywords.length > 0) {
                const rawLeads: RawLead[] = await findLeadsOnReddit(
                    campaign.generatedKeywords,
                    campaign.targetSubreddits
                );

                const enrichedLeads = await enrichLeadsForUser(rawLeads, user);
                const saved = await saveLeadsToDatabase(enrichedLeads, campaign.id, user.id, 'DIRECT_LEAD');

                console.log(`  -> Saved ${saved} direct leads for user ${user.id}`);
            }
            if (user.plan === 'pro' && campaign.competitors && campaign.competitors.length > 0) {
                const aiUsage = AIUsageService.getInstance();
                const canUseCompetitorAI = await aiUsage.trackAIUsage(user.id, 'competitor');

                if (canUseCompetitorAI) {
                    const competitorLeads: RawLead[] = await findLeadsOnReddit(
                        campaign.competitors,
                        campaign.targetSubreddits
                    );

                    const enrichedCompetitorLeads: EnrichedLead[] = await Promise.all(
                        competitorLeads.map(async (lead: RawLead): Promise<EnrichedLead> => {
                            const sentiment = await analyzeSentiment(lead.title, lead.body || '', user.id);
                            const leadWithSentiment = { ...lead, sentiment, type: 'COMPETITOR_MENTION' };
                            const opportunityScore = calculateLeadScore(leadWithSentiment);
                            return {
                                ...lead,
                                sentiment,
                                opportunityScore,
                                intent: 'competitor_mention'
                            };
                        })
                    );

                    const savedCompetitor = await saveLeadsToDatabase(
                        enrichedCompetitorLeads,
                        campaign.id,
                        user.id,
                        'COMPETITOR_MENTION'
                    );

                    console.log(`  -> Saved ${savedCompetitor} competitor leads for user ${user.id}`);
                }
            }

        } catch (error) {
            console.error(`Error processing campaign ${campaign.id}:`, error);
        }
    }

    console.log(`Worker run finished.`);
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