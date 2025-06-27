import { PrismaClient } from '@prisma/client';
import { discoverCompetitorsInText } from '../services/ai.service';
import pLimit from 'p-limit';

const prisma = new PrismaClient();

/**
 * A background worker that analyzes recent, high-intent leads to discover
 * new potential competitors for the user.
 */
export const runMarketInsightWorker = async (): Promise<void> => {
    console.log('Starting market insight worker run...');

    // 1. Find recent, high-quality leads that have NOT been analyzed yet.
    const leadsToAnalyze = await prisma.lead.findMany({
        where: {
            insightAnalysisRan: false,
            type: 'DIRECT_LEAD',
            intent: { in: ['solution_seeking', 'brand_comparison'] }
        },
        include: {
            campaign: true, // We need the campaign for context and competitor list
            user: true,     // We need the user to check their plan
        },
        take: 100, // Process in batches to avoid overwhelming the system
    });

    if (leadsToAnalyze.length === 0) {
        console.log('No new leads to analyze for market insights. Worker run finished.');
        return;
    }

    console.log(`Found ${leadsToAnalyze.length} leads to analyze for new competitors.`);
    const limiter = pLimit(3); // Limit concurrent AI calls for this intensive task

    // 2. Process each lead to discover competitors.
    for (const lead of leadsToAnalyze) {
        if (lead.user.plan !== 'pro') {
            // Mark as analyzed even for free users so we don't check them again.
            await prisma.lead.update({ where: { id: lead.id }, data: { insightAnalysisRan: true } });
            continue;
        }

        try {
            const discoveredNames = await limiter(() => discoverCompetitorsInText(
                `${lead.title} ${lead.body}`,
                lead.campaign.generatedDescription
            ));

            // --- THIS IS THE FIX ---
            // Normalize the user's list of monitored competitors for a case-insensitive check.
            const monitoredCompetitorsLower = lead.campaign.competitors.map(c => c.toLowerCase());

            for (const name of discoveredNames) {
                // Normalize the discovered name.
                const discoveredNameLower = name.toLowerCase();

                // If the user is already monitoring this competitor, skip it.
                if (monitoredCompetitorsLower.includes(discoveredNameLower)) {
                    continue; // Do not create an insight for something already known.
                }

                // Create the insight record only if it's a truly new discovery.
                await prisma.marketInsight.upsert({
                    where: { 
                        // Use a unique constraint to prevent duplicate insights for the same competitor/campaign
                        campaignId_discoveredCompetitorName: {
                            campaignId: lead.campaignId,
                            discoveredCompetitorName: name
                        }
                    },
                    update: {}, // Do nothing if it already exists
                    create: {
                        userId: lead.userId,
                        campaignId: lead.campaignId,
                        discoveredCompetitorName: name,
                        sourceUrl: lead.url,
                        sourceTextSnippet: lead.body?.substring(0, 200) || lead.title,
                        context: `Discovered in a post titled: "${lead.title}"`
                    },
                });
                console.log(`  -> Discovered new competitor "${name}" for campaign ${lead.campaignId}`);
            }
        } catch (error: any) {
            console.error(`Failed to analyze lead ${lead.id} for insights:`, error.message);
        } finally {
            // 3. ALWAYS mark the lead as processed to prevent re-analysis, even on error.
            await prisma.lead.update({
                where: { id: lead.id },
                data: { insightAnalysisRan: true }
            });
        }
    }

    console.log('Market insight worker run finished.');
};