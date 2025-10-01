import express from 'express';
import { getReplyOptions, prepareReplyForTracking } from '../controllers/engagement.controller';

const engagementRouter = express.Router();

// Generate AI reply options (Pro feature)
engagementRouter.post('/generate', getReplyOptions);

// Prepare a reply for manual posting and tracking (Pro feature)
engagementRouter.post('/prepare-tracking', prepareReplyForTracking);

export default engagementRouter;