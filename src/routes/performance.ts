import express from 'express';
import { getReplyPerformance, getReplyDetails } from '../controllers/performance.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const performanceRouter = express.Router();

// Get reply performance metrics for the authenticated user (Pro feature)
// The controller now gets the userId from req.auth, so we simplify the route.
performanceRouter.get('/', gateKeeper, getReplyPerformance);

// Get detailed information about a specific reply (Pro feature)
performanceRouter.get('/reply/:replyId', gateKeeper, getReplyDetails);

export default performanceRouter;