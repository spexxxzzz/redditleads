import { RequestHandler } from 'express';
import { generateReplyOptions, refineReply } from '../services/engagement.service';

/**
 * Handles the request to generate initial reply options for a lead.
 */
export const getReplyOptions: RequestHandler = async (req, res, next) => {
    const { leadId } = req.body;

    if (!leadId) {
         res.status(400).json({ message: 'A leadId is required.' });
         return;
    }

    try {
        const replies = await generateReplyOptions(leadId);
        res.status(200).json({ replies });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles the request to refine an existing reply based on an instruction.
 */
export const postRefineReply: RequestHandler = async (req, res, next) => {
    const { originalReply, instruction } = req.body;

    if (!originalReply || !instruction) {
         res.status(400).json({ message: 'Both originalReply and instruction are required.' });
         return;
    }

    try {
        const refinedReply = await refineReply(originalReply, instruction);
        res.status(200).json({ refinedReply });
    } catch (error) {
        next(error);
    }
};