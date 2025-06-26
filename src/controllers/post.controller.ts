import { RequestHandler } from 'express';
import { generateReplyOptions, refineReply } from '../services/engagement.service';
import { PrismaClient } from '@prisma/client';
import { postReply, checkKarmaThreshold } from '../services/reddit.service';

const prisma = new PrismaClient();
const MINIMUM_KARMA_TO_POST = 10; // You can make this a setting later

// ... existing getReplyOptions and postRefineReply functions ...

/**
 * Handles the request to post a reply to Reddit immediately.
 * This is a user-triggered action.
 */
export const postReplyToLead: RequestHandler = async (req, res, next) => {
    // In a real app, you'd get this from Clerk/JWT authentication
    const userId = "clzyafrto000012o789rp1234"; // Replace with actual authenticated user ID
    const { leadId, content } = req.body;

    if (!leadId || !content) {
         res.status(400).json({ message: 'leadId and content are required.' });
         return
    }

    try {
        // 1. Fetch all necessary data in one go
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!user || !lead) {
             res.status(404).json({ message: 'User or Lead not found.' });
             return
        }
        if (!user.redditRefreshToken) {
             res.status(403).json({ message: 'Reddit account not connected. Please connect your account in settings.' });
             return
        }

        // 2. Perform Karma Check (Reddit-Specific Automation)
        const hasEnoughKarma = await checkKarmaThreshold(user.redditRefreshToken, MINIMUM_KARMA_TO_POST);
        if (!hasEnoughKarma) {
             res.status(403).json({ message: `Your Reddit karma is too low. You need at least ${MINIMUM_KARMA_TO_POST} karma to post.` });
             return
        }

        // 3. Post the reply via the Reddit Service
        const newRedditPostId = await postReply(lead.redditId, content, user.redditRefreshToken);

        // 4. Record the action in our database for tracking
        await prisma.scheduledReply.create({
            data: {
                content,
                status: 'POSTED',
                scheduledAt: new Date(), // It was scheduled for "now"
                postedAt: new Date(),
                redditPostId: newRedditPostId,
                leadId: lead.id,
                userId: user.id,
            }
        });
        
        // 5. Update the lead's status so it doesn't show as "new" anymore
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: 'contacted' }
        });

        res.status(201).json({ message: 'Reply posted successfully!', redditPostId: newRedditPostId });

    } catch (error) {
        next(error);
    }
};