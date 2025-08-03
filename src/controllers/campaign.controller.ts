import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches all campaigns for the currently authenticated user
 */
export const getCampaignsForUser: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        const campaigns = await prisma.campaign.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        res.status(200).json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        next(error);
    }
};

/**
 * Fetches a specific campaign by ID, ensuring it belongs to the authenticated user
 */
export const getCampaignById: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { campaignId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        const campaign = await prisma.campaign.findFirst({
            where: { 
                id: campaignId,
                userId: userId 
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        if (!campaign) {
            res.status(404).json({ message: 'Campaign not found.' });
            return;
        }

        res.status(200).json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        next(error);
    }
};

/**
 * Updates a campaign by ID, ensuring it belongs to the authenticated user
 */
export const updateCampaignById: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { campaignId } = req.params;
    const {
        name,
        analyzedUrl,
        generatedDescription,
        generatedKeywords,
        targetSubreddits,
        competitors,
        isActive
    } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        // First verify the campaign exists and belongs to the user
        const existingCampaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                userId: userId
            }
        });

        if (!existingCampaign) {
            res.status(404).json({ message: 'Campaign not found or you do not have permission to update it.' });
            return;
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (analyzedUrl !== undefined) updateData.analyzedUrl = analyzedUrl;
        if (generatedDescription !== undefined) updateData.generatedDescription = generatedDescription;
        if (generatedKeywords !== undefined) {
            updateData.generatedKeywords = Array.isArray(generatedKeywords) 
                ? generatedKeywords 
                : [];
        }
        if (targetSubreddits !== undefined) {
            updateData.targetSubreddits = Array.isArray(targetSubreddits) 
                ? targetSubreddits 
                : [];
        }
        if (competitors !== undefined) {
            updateData.competitors = Array.isArray(competitors) 
                ? competitors 
                : [];
        }
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaignId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        console.log(`✅ [Campaign Update] Successfully updated campaign ${campaignId} for user ${userId}`);
        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            campaign: updatedCampaign
        });

    } catch (error) {
        console.error(`❌ [Campaign Update] Error updating campaign ${campaignId}:`, error);
        next(error);
    }
};

/**
 * Deletes a campaign by ID, ensuring it belongs to the authenticated user
 */
export const deleteCampaignById: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { campaignId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        // First verify the campaign exists and belongs to the user
        const existingCampaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                userId: userId
            },
            include: {
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        if (!existingCampaign) {
            res.status(404).json({ message: 'Campaign not found or you do not have permission to delete it.' });
            return;
        }

        // Delete all associated leads first (cascade should handle this, but being explicit)
        const deletedLeadsCount = await prisma.lead.deleteMany({
            where: {
                campaignId: campaignId,
                userId: userId
            }
        });

        // Delete all associated market insights
        await prisma.marketInsight.deleteMany({
            where: {
                campaignId: campaignId
            }
        });

        // Delete all associated scheduled replies
        await prisma.scheduledReply.deleteMany({
            where: {
                lead: {
                    campaignId: campaignId,
                    userId: userId
                }
            }
        });

        // Finally delete the campaign
        const deletedCampaign = await prisma.campaign.delete({
            where: { id: campaignId }
        });

        console.log(`✅ [Campaign Delete] Successfully deleted campaign ${campaignId} and ${deletedLeadsCount.count} associated leads for user ${userId}`);
        
        res.status(200).json({
            success: true,
            message: `Campaign deleted successfully. ${deletedLeadsCount.count} associated leads were also removed.`,
            deletedCampaign: {
                id: deletedCampaign.id,
                name: deletedCampaign.name || 'Unnamed Campaign'
            },
            deletedLeadsCount: deletedLeadsCount.count
        });

    } catch (error) {
        console.error(`❌ [Campaign Delete] Error deleting campaign ${campaignId}:`, error);
        next(error);
    }
};