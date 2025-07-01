import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches market insights (like discovered competitors) for a campaign.
 * Results are paginated and sorted by discovery date.
 */
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

/**
 * Updates the status of a market insight (acknowledge, ignore, etc.)
 */
export const updateInsightStatus: RequestHandler = async (req, res, next) => {
    const { insightId } = req.params;
    const { status } = req.body;

    if (!insightId || !status) {
        res.status(400).json({ message: 'Insight ID and status are required.' });
        return;
    }

    // Validate status values
    const validStatuses = ['NEW', 'VIEWED', 'ACTIONED', 'IGNORED'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid status. Must be one of: NEW, VIEWED, ACTIONED, IGNORED' });
        return;
    }

    try {
        console.log(`📝 [Update Insight] Updating insight ${insightId} status to: ${status}`);

        const updatedInsight = await prisma.marketInsight.update({
            where: { id: insightId },
            data: { status }
        });

        console.log(`✅ [Update Insight] Successfully updated insight status`);
        res.status(200).json(updatedInsight);
    } catch (error) {
        console.error('❌ [Update Insight] Error updating insight status:', error);
        next(error);
    }
};

/**
 * Adds a discovered competitor to the campaign's competitor list
 */
export const addCompetitorToCampaign: RequestHandler = async (req, res, next) => {
    const { insightId } = req.params;

    if (!insightId) {
        res.status(400).json({ message: 'Insight ID is required.' });
        return;
    }

    try {
        console.log(`🏢 [Add Competitor] Processing insight ${insightId}`);

        // Get the insight first
        const insight = await prisma.marketInsight.findUnique({
            where: { id: insightId },
            include: { campaign: true }
        });

        if (!insight) {
            res.status(404).json({ message: 'Insight not found.' });
            return;
        }

        // Check if competitor is already in the list (case-insensitive)
        const currentCompetitors = insight.campaign.competitors.map(c => c.toLowerCase());
        const newCompetitorLower = insight.discoveredCompetitorName.toLowerCase();

        if (currentCompetitors.includes(newCompetitorLower)) {
            res.status(400).json({ message: 'Competitor is already being monitored.' });
            return;
        }

        // Add the competitor to the campaign
        const updatedCampaign = await prisma.campaign.update({
            where: { id: insight.campaignId },
            data: {
                competitors: {
                    push: insight.discoveredCompetitorName
                }
            }
        });

        // Mark the insight as actioned
        await prisma.marketInsight.update({
            where: { id: insightId },
            data: { status: 'ACTIONED' }
        });

        console.log(`✅ [Add Competitor] Added "${insight.discoveredCompetitorName}" to campaign competitors`);
        res.status(200).json({
            message: 'Competitor added to campaign successfully',
            campaign: updatedCampaign,
            insight: { ...insight, status: 'ACTIONED' }
        });
    } catch (error) {
        console.error('❌ [Add Competitor] Error adding competitor to campaign:', error);
        next(error);
    }
};