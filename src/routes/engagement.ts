import express from 'express';
import { getReplyOptions, postRefineReply } from '../controllers/engagement.controller';
import { postReplyToLead } from '../controllers/post.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const engagementRouter = express.Router();

// Generate AI reply options (Pro feature)
engagementRouter.post('/generate', gateKeeper, getReplyOptions);

// Refine an AI reply (Pro feature)
engagementRouter.post('/refine', gateKeeper, postRefineReply);

// Post reply to Reddit (Pro feature)
// Added gateKeeper to ensure only subscribed users can post
engagementRouter.post('/post-reply', gateKeeper, postReplyToLead);

export default engagementRouter;