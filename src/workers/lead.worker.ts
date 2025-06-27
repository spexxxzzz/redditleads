import { PrismaClient, LeadType, User } from '@prisma/client';
import { findLeadsOnReddit } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { analyzeSentiment } from '../services/ai.service';
import { calculateLeadScore } from '../services/scoring.service';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

/**
 * A centralized helper function to save leads to the database.
 * This avoids code repetition and handles duplicate errors gracefully.
 * @param leads The array of enriched leads to save.
 * @param campaignId The ID of the campaign these leads belong to.
 * @param userId The ID of the user who owns these leads.
 * @param leadType The type of lead (DIRECT_LEAD or COMPETITOR_MENTION).
 * @returns The number of new leads successfully saved.
 */
const saveLeadsToDatabase = async (leads: any[], campaignId: string, userId: string, leadType: LeadType): Promise<number> => {
    let savedCount = 0;
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
                    sentiment: lead.sentiment,
                }
            });
            savedCount++;
        } catch (error: any) {
            // Safely ignore errors for leads that already exist in the database.
            if (error.code !== 'P2002') {
                console.error(`Failed to save lead ${lead.id}:`, error.message);
            }
        }
    }
    return savedCount;
};


export const runLeadDiscoveryWorker = async () => {
    console.log('Starting lead discovery worker run...');
    
    // 1. Fetch all campaigns and include the user data to avoid N+1 queries later.
    const campaigns = await prisma.campaign.findMany({ 
        include: { user: true } 
    });

    if (campaigns.length === 0) {
        console.log('No active campaigns to process. Worker run finished.');
        return;
    }

    console.log(`Found ${campaigns.length} campaigns to process.`);

    // 2. Process each campaign individually.
    for (const campaign of campaigns) {
        const { user } = campaign;

        if (!user) {
            console.warn(`Skipping campaign ${campaign.id}: Associated user not found.`);
            continue;
        }
        if (!campaign.targetSubreddits || campaign.targetSubreddits.length === 0) {
            console.log(`Skipping campaign ${campaign.id}: No target subreddits are configured.`);
            continue;
        }

        console.log(`Processing campaign: ${campaign.id} for user: ${user.id} (Plan: ${user.plan})`);
        
        try {
            // --- Step A: Find and Process Direct Leads (Your Keywords) ---
            if (campaign.generatedKeywords.length > 0) {
                const rawDirectLeads = await findLeadsOnReddit(campaign.generatedKeywords, campaign.targetSubreddits);
                const enrichedDirectLeads = await enrichLeadsForUser(rawDirectLeads, user);
                const saved = await saveLeadsToDatabase(enrichedDirectLeads, campaign.id, user.id, 'DIRECT_LEAD');
                console.log(`  -> Found and processed ${saved} new direct leads.`);
            }

            // --- Step B: Find and Process Competitor Mentions (Pro Feature) ---
            if (user.plan === 'pro' && campaign.competitors && campaign.competitors.length > 0) {
                const rawCompetitorLeads = await findLeadsOnReddit(campaign.competitors, campaign.targetSubreddits);
                
                // Use p-limit to control concurrency of AI calls, respecting API limits.
                const limiter = pLimit(5); 
                
                const enrichedCompetitorLeads = await Promise.all(
                    rawCompetitorLeads.map(lead => limiter(async () => {
                        const sentiment = await analyzeSentiment(lead.title, lead.body);
                        const opportunityScore = calculateLeadScore({ ...lead, type: 'COMPETITOR_MENTION', sentiment });
                        return { ...lead, sentiment, opportunityScore };
                    }))
                );
                
                const saved = await saveLeadsToDatabase(enrichedCompetitorLeads, campaign.id, user.id, 'COMPETITOR_MENTION');
                console.log(`  -> Found and processed ${saved} new competitor mentions.`);
            }
        } catch (error) {
            console.error(`An error occurred while processing campaign ${campaign.id}:`, error);
        }
    }

    console.log(`Worker run finished.`);
};