import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches reply performance metrics for a user
 */
export const getReplyPerformance: RequestHandler = async (req, res, next) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!userId) {
        res.status(400).json({ message: 'User ID is required.' });
        return;
    }

    try {
        console.log(`📊 [Performance] Fetching reply performance for user: ${userId}`);

        const replies = await prisma.scheduledReply.findMany({
            where: { 
                lead: {
                    userId: userId
                }
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        title: true,
                        subreddit: true,
                        url: true,
                        author: true
                    }
                }
            },
            orderBy: {
                postedAt: 'desc'
            },
            take: limit,
            skip: skip,
        });

        const totalReplies = await prisma.scheduledReply.count({
            where: { 
                lead: {
                    userId: userId
                }
            }
        });

        // Calculate performance metrics
        const totalUpvotes = replies.reduce((sum, reply) => sum + (reply.upvotes || 0), 0);
        const repliesWithAuthorResponse = replies.filter(reply => reply.authorReplied).length;
        const averageUpvotes = replies.length > 0 ? totalUpvotes / replies.length : 0;
        const responseRate = replies.length > 0 ? (repliesWithAuthorResponse / replies.length) * 100 : 0;

        console.log(`📊 [Performance] Found ${replies.length} replies with ${totalUpvotes} total upvotes`);

        res.status(200).json({
            data: replies,
            pagination: {
                total: totalReplies,
                page,
                limit,
                totalPages: Math.ceil(totalReplies / limit)
            },
            metrics: {
                totalReplies,
                totalUpvotes,
                averageUpvotes: Math.round(averageUpvotes * 10) / 10,
                responseRate: Math.round(responseRate * 10) / 10,
                repliesWithAuthorResponse
            }
        });
    } catch (error) {
        console.error('❌ [Performance] Error fetching reply performance:', error);
        next(error);
    }
};

/**
 * Fetches detailed performance for a specific reply
 */
export const getReplyDetails: RequestHandler = async (req, res, next) => {
    const { replyId } = req.params;

    if (!replyId) {
        res.status(400).json({ message: 'Reply ID is required.' });
        return;
    }

    try {
        const reply = await prisma.scheduledReply.findUnique({
            where: { id: replyId },
            include: {
                lead: {
                    include: {
                        campaign: {
                            select: {
                                id: true,
                                name: true,
                                generatedDescription: true
                            }
                        }
                    }
                }
            }
        });

        if (!reply) {
            res.status(404).json({ message: 'Reply not found.' });
            return;
        }

        res.status(200).json(reply);
    } catch (error) {
        console.error('❌ [Performance] Error fetching reply details:', error);
        next(error);
    }
};