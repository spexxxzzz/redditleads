import express from 'express';
import { getReplyPerformance, getReplyDetails } from '../controllers/performance.controller';

const performanceRouter = express.Router();

// Get reply performance metrics for the authenticated user (Pro feature)
// The controller now gets the userId from req.auth, so we simplify the route.
performanceRouter.get('/', getReplyPerformance);

// Get detailed information about a specific reply (Pro feature)
performanceRouter.get('/reply/:replyId', getReplyDetails);

export default performanceRouter;