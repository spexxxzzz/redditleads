import express from 'express';
import { getReplyOptions, postRefineReply } from '../controllers/engagement.controller';
import { checkSubscription } from '../middleware/gateKeeper';
import { postReplyToLead } from '../controllers/post.controller';

const engagementRouter = express.Router();

// --- All routes in this file are for Pro users and require an active subscription ---
engagementRouter.use(checkSubscription);

// Route to generate the initial set of reply options for a lead
engagementRouter.post('/generate', getReplyOptions);

// Route to refine an existing reply
engagementRouter.post('/refine', postRefineReply);

engagementRouter.post('/post-reply', postReplyToLead);

export default engagementRouter;