import { RequestHandler } from 'express';
import { generateReplyOptions, refineReply } from '../services/engagement.service';

/**
 * Handles the request to generate initial reply options for a lead.
 * Ensures the lead belongs to the authenticated user.
 */
export const getReplyOptions: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID from Clerk
    const { userId } = req.auth;
    const { leadId } = req.body;

    // Ensure the user is authenticated
    if (!userId) {
         res.status(401).json({ message: 'User not authenticated.' });
         return
    }

    if (!leadId) {
          res.status(400).json({ message: 'A leadId is required.' });
          return
    }

    try {
        // Pass userId to the service to ensure the lead belongs to the user.
        // IMPORTANT: You must update `generateReplyOptions` to accept and use this userId
        // to verify ownership of the lead before proceeding.
        const replies = await generateReplyOptions(leadId, userId);
        res.status(200).json({ replies });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles the request to refine an existing reply based on an instruction.
 * This is a protected action, requiring an authenticated user.
 */
export const postRefineReply: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID to ensure the action is performed by a valid user.
    const { userId } = req.auth;
    const { originalReply, instruction } = req.body;

    // Ensure the user is authenticated
    if (!userId) {
         res.status(401).json({ message: 'User not authenticated.' });
         return
    }

    if (!originalReply || !instruction) {
          res.status(400).json({ message: 'Both originalReply and instruction are required.' });
          return
    }

    try {
        const refinedReply = await refineReply(originalReply, instruction);
        res.status(200).json({ refinedReply });
    } catch (error) {
        next(error);
    }
};