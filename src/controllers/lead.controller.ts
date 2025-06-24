import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

import { findLeadsOnReddit } from '../services/reddit.service';
import { calculateLeadScore } from '../services/scoring.service';
// --- LAYER 2: Import the AI Context Analyzer ---
import { analyzeLeadIntent } from '../services/ai.service';

const prisma = new PrismaClient();

/**
 * Manually triggers a lead discovery for a specific campaign.
 * This is useful for immediate results without waiting for the scheduled worker.
 * It enriches each found lead with an AI-generated intent classification.
 */
export const runManualDiscovery: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;

    if (!campaignId) {
          res.status(400).json({ message: 'Campaign ID is required.' });
          return;
    }

    try {
        // 1. Fetch the specific campaign from the database
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
              res.status(404).json({ message: 'Campaign not found.' });
              return;
        }

        if (campaign.targetSubreddits.length === 0) {
              res.status(400).json({ message: 'Campaign has no target subreddits configured.' });
              return;
        }

        // 2. Fetch raw leads from Reddit using campaign-specific data
        const leads = await findLeadsOnReddit(campaign.generatedKeywords, campaign.targetSubreddits);

        // --- LAYER 2: Enrich leads with intent and score in parallel ---
        const enrichedLeads = await Promise.all(leads.map(async (lead) => {
            const intent = await analyzeLeadIntent(lead.title, lead.body);
            const opportunityScore = calculateLeadScore(lead);
            return {
                ...lead,
                intent, // Add the AI-generated intent
                opportunityScore,
            };
        }));

        // 4. Sort the enriched leads by score
        const sortedLeads = enrichedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);

        // 5. Return the prioritized list
        res.status(200).json(sortedLeads);

    } catch (error) {
        next(error);
    }
};


/**
 * Fetches saved leads from the database for a specific campaign's "Lead Inbox".
 * Results are paginated and sorted by the highest opportunity score.
 */
export const getLeadsForCampaign: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!campaignId) {
          res.status(400).json({ message: 'Campaign ID is required.' });
          return;
    }

    try {
        const leads = await prisma.lead.findMany({
            where: { 
                campaignId: campaignId,
                status: 'new' // Only show new, un-actioned leads
            },
            orderBy: {
                opportunityScore: 'desc' // Show the best leads first
            },
            take: limit,
            skip: skip,
        });

        const totalLeads = await prisma.lead.count({
            where: { campaignId: campaignId, status: 'new' }
        });

        res.status(200).json({
            data: leads,
            pagination: {
                total: totalLeads,
                page,
                limit,
                totalPages: Math.ceil(totalLeads / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};