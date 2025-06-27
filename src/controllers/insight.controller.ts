import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches market insights (like discovered competitors) for a campaign.
 * Results are paginated and sorted by discovery date.
 */
export const getInsightsForCampaign: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!campaignId) {
         res.status(400).json({ message: 'Campaign ID is required.' });
         return
    }

    try {
        const insights = await prisma.marketInsight.findMany({
            where: { 
                campaignId: campaignId,
                status: 'NEW' // Only show new, un-actioned insights
            },
            orderBy: {
                discoveredAt: 'desc'
            },
            take: limit,
            skip: skip,
        });

        const totalInsights = await prisma.marketInsight.count({
            where: { campaignId: campaignId, status: 'NEW' }
        });

        res.status(200).json({
            data: insights,
            pagination: {
                total: totalInsights,
                page,
                limit,
                totalPages: Math.ceil(totalInsights / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};