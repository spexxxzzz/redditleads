import { RequestHandler } from 'express';
import { generateReplyOptions } from '../services/ai.service';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getReplyOptions: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { leadId } = req.body;

    console.log(`[GET REPLIES] Request received - User: ${userId}, LeadId: ${leadId}`);

    if (!userId) {
        console.log(`[GET REPLIES] User not authenticated`);
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!leadId) {
        console.log(`[GET REPLIES] LeadId not provided`);
        return res.status(400).json({ message: 'LeadId is required.' });
    }

    try {
        console.log(`[GET REPLIES] User ${userId} requesting reply options for lead ${leadId}`);
        const replies = await generateReplyOptions(leadId);
        console.log(`[GET REPLIES] Successfully generated ${replies.length} replies`);
        return res.status(200).json({ replies });
    } catch (error: any) {
        console.error('❌ [GET REPLIES] Error getting reply options:', error);
        console.error('❌ [GET REPLIES] Error message:', error.message);
        console.error('❌ [GET REPLIES] Error stack:', error.stack);
        
        if (error.message.includes('quota exceeded') || error.message.includes('limit reached')) {
            return res.status(429).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Failed to generate reply options.', error: error.message });
    }
};



/**
 * Creates a placeholder reply record so the worker can track a manually posted reply.
 */
export const prepareReplyForTracking: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { leadId, content } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!leadId || !content) {
        return res.status(400).json({ message: 'leadId and content are required.' });
    }

    try {
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, userId: userId }
        });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found.' });
        }

        // Create a reply record with a PENDING status
        await prisma.scheduledReply.create({
            data: {
                content,
                status: "POSTED",
                scheduledAt: new Date(), // Add scheduledAt as required
                lead: { connect: { id: lead.id } },
                user: { connect: { id: userId } },
                // Other fields like redditPostId and postedAt will be null initially
            }
        });

        // Update the lead's status to 'replied'
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: 'replied' }
        });

        res.status(200).json({ message: 'Reply is now being tracked. Please post it on Reddit.' });
    } catch (error) {
        console.error('❌ [Prepare Tracking] Error:', error);
        next(error);
    }
};