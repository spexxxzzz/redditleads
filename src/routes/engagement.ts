import express from 'express';
import { getReplyOptions, postRefineReply, prepareReplyForTracking } from '../controllers/engagement.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const engagementRouter = express.Router();

// Generate AI reply options (Pro feature)
engagementRouter.post('/generate', gateKeeper, getReplyOptions);

// Refine an AI reply (Pro feature)
engagementRouter.post('/refine', gateKeeper, postRefineReply);

// Prepare a reply for manual posting and tracking (Pro feature)
engagementRouter.post('/prepare-tracking', gateKeeper, prepareReplyForTracking);

export default engagementRouter;