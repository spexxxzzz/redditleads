import { PrismaClient } from '@prisma/client';
import { checkKarmaThreshold, getUserKarma, postReplyAsUser } from '../services/reddit.service';
import { RequestHandler } from 'express';
import { summarizeTextContent } from '../services/summarisation.service';

const prisma = new PrismaClient();
const MINIMUM_KARMA_TO_POST = 1;

export const postReplyToLead: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID from Clerk's middleware
    const { userId } = req.auth;
    const { leadId, content } = req.body;

    // Ensure the user is authenticated
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!leadId || !content) {
        res.status(400).json({ message: 'leadId and content are required.' });
        return;
    }

    try {
        // 1. Fetch user and lead data securely
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        // Find the lead ONLY if it belongs to the authenticated user
        const lead = await prisma.lead.findFirst({ 
            where: { 
                id: leadId,
                userId: userId
            } 
        });

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
        return;

    } catch (error: any) {
        console.error('❌ [Post Reply] Error posting reply:', error);
        
        // Fetch lead again for error context, if it exists
        const leadForError = await prisma.lead.findFirst({ where: { id: leadId, userId: userId } });

        if (error.message.includes('403')) {
            res.status(403).json({ 
                message: 'Reddit blocked this post. Your account may be restricted, shadowbanned, or banned from this subreddit.',
                error: 'REDDIT_FORBIDDEN',
                redditUrl: `https://reddit.com/r/${leadForError?.subreddit}/comments/${leadForError?.redditId?.replace('t1_', '')}`
            });
            return;
        } else if (error.message.includes('429')) {
            res.status(429).json({ 
                message: 'Rate limited by Reddit. Please wait before posting again.',
                error: 'REDDIT_RATE_LIMIT'
            });
            return;
        } else {
            res.status(500).json({ 
                message: 'Failed to post reply to Reddit',
                error: error.message
            });
            return;
        }
    }
};

export const summarizeLead: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { id: leadId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        // Securely find the lead, ensuring it belongs to the authenticated user
        const lead = await prisma.lead.findFirst({
            where: { 
                id: leadId,
                userId: userId
            },
        });

        if (!lead) {
              res.status(404).json({ message: 'Lead not found or you do not have permission to access it.' });
              return;
        }

        if (!lead.body || lead.body.trim().length === 0) {
             res.status(400).json({ message: 'Lead has no content to summarize.' });
             return;
        }

        console.log(`[SUMMARIZE] User ${userId} requesting summary for lead ${leadId}`);
        const summary = await summarizeTextContent(lead.body);

        // Update the lead in the database with the new summary
        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: { summary },
        });

        res.status(200).json({ summary: updatedLead.summary });
        return;

    } catch (error) {
        next(error);
    }
};