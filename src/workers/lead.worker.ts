import { PrismaClient } from '@prisma/client';
import { findLeadsOnReddit } from '../services/reddit.service';
import { calculateLeadScore } from '../services/scoring.service';
import { analyzeLeadIntent } from '../services/ai.service';

const prisma = new PrismaClient();

export const runLeadDiscoveryWorker = async () => {
    console.log('Starting lead discovery worker run...');

    // 1. Fetch all active campaigns from the database
    const campaigns = await prisma.campaign.findMany({
        // In the future, you could add a filter here, e.g., where: { isActive: true }
    });

    if (campaigns.length === 0) {
        console.log('No active campaigns to process. Worker run finished.');
        return;
    }

    console.log(`Found ${campaigns.length} campaigns to process.`);
    let totalNewLeads = 0;

    // 2. Process each campaign individually
    for (const campaign of campaigns) {
         // If a campaign has no specific subreddits, skip it to avoid errors and wasted API calls.
        if (!campaign.targetSubreddits || campaign.targetSubreddits.length === 0) {
            console.log(`Skipping campaign ${campaign.id}: No target subreddits are configured.`);
            continue; // Move to the next campaign
        }

        try {
            console.log(`Processing campaign: ${campaign.id} for user: ${campaign.userId}`);
            
            const leadsFromReddit = await findLeadsOnReddit(
                campaign.generatedKeywords, 
                campaign.targetSubreddits
            );

            // --- LAYER 2: Enrich leads with intent and score in parallel ---
            const enrichedLeads = await Promise.all(leadsFromReddit.map(async (lead) => {
                const intent = await analyzeLeadIntent(lead.title, lead.body);
                const opportunityScore = calculateLeadScore(lead);
                return {
                    ...lead,
                    intent, // Add the AI-generated intent
                    opportunityScore,
                };
            }));
            for (const lead of enrichedLeads) {
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
                            campaignId: campaign.id,
                            intent: lead.intent, // Save the new intent field
                        }
                    });
                    totalNewLeads++;
                    console.log(`  -> Saved new lead: "${lead.title.substring(0, 40)}..."`);
                } catch (error: any) {
                    // This error is expected if the lead already exists due to the @unique constraint
                    if (error.code === 'P2002') {
                        // It's a duplicate, so we can safely ignore it.
                    } else {
                        // It's a different error, so we should log it.
                        console.error(`Failed to save lead ${lead.id}:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to process campaign ${campaign.id}:`, error);
        }
    }

    console.log(`Worker run finished. Found and saved ${totalNewLeads} new leads.`);
};