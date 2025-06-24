import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

import { findLeadsOnReddit } from '../services/reddit.service';
// --- DRY PRINCIPLE: Import the new centralized enrichment service ---
// We no longer need to import calculateLeadScore or analyzeLeadIntent here.
import { enrichLeadsForUser } from '../services/enrichment.service';

const prisma = new PrismaClient();

/**
 * Manually triggers a lead discovery for a specific campaign.
 * This is useful for immediate results without waiting for the scheduled worker.
 * The quality of the analysis depends on the user's subscription plan.
 */
export const runManualDiscovery: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;

    if (!campaignId) {
          res.status(400).json({ message: 'Campaign ID is required.' });
          return;
    }

    try {
        // 1. Fetch the campaign and include the user to check their plan
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { user: true } // Eager load the user object
        });

        if (!campaign || !campaign.user) {
              res.status(404).json({ message: 'Campaign or associated user not found.' });
              return
        }

        if (campaign.targetSubreddits.length === 0) {
              res.status(400).json({ message: 'Campaign has no target subreddits configured.' });
              return
        }

        const user = campaign.user;

        // 2. Fetch raw leads from Reddit
        const rawLeads = await findLeadsOnReddit(campaign.generatedKeywords, campaign.targetSubreddits);

        // --- DRY PRINCIPLE: All tier-aware logic is now handled by a single service call ---
        const enrichedLeads = await enrichLeadsForUser(rawLeads, user);

        // 3. Sort the enriched leads by score
        const sortedLeads = enrichedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);

        // 4. Return the prioritized list
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
          return
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