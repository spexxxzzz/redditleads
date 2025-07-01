import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches all campaigns for a specific user
 */
export const getCampaignsForUser: RequestHandler = async (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        res.status(400).json({ message: 'User ID is required.' });
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
 * Fetches a specific campaign by ID
 */
export const getCampaignById: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
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