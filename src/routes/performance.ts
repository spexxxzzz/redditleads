import express from 'express';
import { getReplyPerformance, getReplyDetails } from '../controllers/performance.controller';

const performanceRouter = express.Router();

// Get reply performance metrics for a user
performanceRouter.get('/user/:userId', getReplyPerformance);

// Get detailed information about a specific reply
performanceRouter.get('/reply/:replyId', getReplyDetails);

export default performanceRouter;