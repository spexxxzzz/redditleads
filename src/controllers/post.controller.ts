
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MINIMUM_KARMA_TO_POST = 1;

import { checkKarmaThreshold, getUserKarma, postReplyAsUser } from '../services/reddit.service';
import { RequestHandler } from 'express';

export const postReplyToLead: RequestHandler = async (req, res, next) => {
    const userId = req.headers['x-user-id'] as string;
    const { leadId, content } = req.body;

    if (!leadId || !content) {
        res.status(400).json({ message: 'leadId and content are required.' });
        return;
    }

    try {
        // 1. Fetch user and lead data
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!user || !lead) {
            res.status(404).json({ message: 'User or Lead not found.' });
            return;
        }

        // 2. Check if user has Reddit connected
        if (!user.redditRefreshToken) {
            res.status(403).json({ 
                message: 'Reddit account not connected. Please connect your account in settings.',
                requiresRedditAuth: true 
            });
            return;
        }

        console.log(`Attempting to post as user: ${user.redditUsername}`);
        console.log(`Lead Reddit ID: ${lead.redditId}`);

        // 3. Check karma threshold
        const hasEnoughKarma = await checkKarmaThreshold(user.redditRefreshToken, MINIMUM_KARMA_TO_POST);
        if (!hasEnoughKarma) {
            const currentKarma = await getUserKarma(user.redditRefreshToken);
            res.status(403).json({ 
                message: `Your Reddit karma is too low. You need at least ${MINIMUM_KARMA_TO_POST} karma to post.`,
                currentKarma: currentKarma
            });
            return;
        }

        // 4. Post the reply using user's own account
        const newRedditPostId = await postReplyAsUser(lead.redditId, content, user.redditRefreshToken);

        // 5. Record the action
        await prisma.scheduledReply.create({
            data: {
                content,
                status: 'POSTED',
                scheduledAt: new Date(),
                postedAt: new Date(),
                redditPostId: newRedditPostId,
                leadId: lead.id,
                userId: user.id,
            }
        });
        
        // 6. Update lead status
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: 'replied' }
        });

        res.status(201).json({ 
            message: 'Reply posted successfully!', 
            redditPostId: newRedditPostId,
            postedAs: user.redditUsername
        });

    } catch (error: any) {
        console.error('❌ [Post Reply] Error posting reply:', error);
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        // Handle specific Reddit errors
        if (error.message.includes('403')) {
            res.status(403).json({ 
                message: 'Reddit blocked this post. Your account may be restricted, shadowbanned, or banned from this subreddit.',
                error: 'REDDIT_FORBIDDEN',
                redditUrl: `https://reddit.com/r/${lead?.subreddit}/comments/${lead?.redditId?.replace('t1_', '')}`
            });
        } else if (error.message.includes('429')) {
            res.status(429).json({ 
                message: 'Rate limited by Reddit. Please wait before posting again.',
                error: 'REDDIT_RATE_LIMIT'
            });
        } else {
            res.status(500).json({ 
                message: 'Failed to post reply to Reddit',
                error: error.message
            });
        }
    }
};