import { PrismaClient } from '../../generated/prisma';
import { findLeadsOnReddit } from '../services/reddit.service';
import { calculateLeadScore } from '../services/scoring.service';

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

    // 2. Process each campaign
    for (const campaign of campaigns) {
        try {
            console.log(`Processing campaign: ${campaign.id} for user: ${campaign.userId}`);
            
            // 3. Find leads using the services we already built
            const leadsFromReddit = await findLeadsOnReddit(campaign.generatedKeywords, ['forhire', 'jobbit']); // You can make subreddits dynamic later
            const scoredLeads = leadsFromReddit.map(lead => ({
                ...lead,
                opportunityScore: calculateLeadScore(lead)
            }));

            // 4. Save new leads to the database, skipping duplicates
            for (const lead of scoredLeads) {
                try {
                    await prisma.lead.create({
                        data: {
                            redditId: lead.id,
                            title: lead.title,
                            author: lead.author,
                            subreddit: lead.subreddit,
                            url: lead.url,
                            body: lead.body,
                            postedAt: new Date(lead.createdAt * 1000), // Convert Unix timestamp to DateTime
                            opportunityScore: lead.opportunityScore,
                            campaignId: campaign.id,
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