import { PrismaClient } from '@prisma/client';
import { findLeadsOnReddit } from '../services/reddit.service';
// --- DRY PRINCIPLE: Import the new centralized enrichment service ---
import { enrichLeadsForUser } from '../services/enrichment.service';

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
        if (!campaign.targetSubreddits || campaign.targetSubreddits.length === 0) {
            console.log(`Skipping campaign ${campaign.id}: No target subreddits are configured.`);
            continue;
        }

        try {
            // --- TIER-AWARE LOGIC: Fetch the user to check their plan ---
            const user = await prisma.user.findUnique({ where: { id: campaign.userId } });

            if (!user) {
                console.warn(`Skipping campaign ${campaign.id}: Associated user not found.`);
                continue;
            }

            console.log(`Processing campaign: ${campaign.id} for user: ${user.id} (Plan: ${user.plan})`);
            
            const rawLeads = await findLeadsOnReddit(
                campaign.generatedKeywords, 
                campaign.targetSubreddits
            );

            // --- DRY PRINCIPLE: All tier-aware logic is now handled by a single service call ---
            const enrichedLeads = await enrichLeadsForUser(rawLeads, user);

            // 3. Loop through the fully enriched leads and save them to the database
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
                            intent: lead.intent,
                            // --- FIX IS HERE ---
                            // We now correctly provide the ID of the user who owns this lead.
                            userId: user.id,
                        }
                    });
                    totalNewLeads++;
                    console.log(`  -> Saved new lead: "${lead.title.substring(0, 40)}..." (Score: ${lead.opportunityScore}, Plan: ${user.plan})`);
                } catch (error: any) {
                    if (error.code === 'P2002') {
                        // It's a duplicate, so we can safely ignore it.
                    } else {
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