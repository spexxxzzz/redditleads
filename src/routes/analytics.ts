import express, { Request, Response } from 'express';
import { 
  getLeadTrends, 
  getSubredditPerformance, 
  getAnalyticsMetrics, 
  getWeeklyActivity, 
  getOpportunityDistribution 
} from  '../controllers/analytics.controller';

const analyticsRouter = express.Router();

// Lead trends over time for a project
analyticsRouter.get('/trends/:projectId', getLeadTrends);

// Subreddit performance for a project
analyticsRouter.get('/subreddit-performance/:projectId', getSubredditPerformance);

// Analytics metrics (changes, trends, etc.)
analyticsRouter.get('/metrics/:projectId', getAnalyticsMetrics);

// Weekly activity patterns
analyticsRouter.get('/weekly-activity/:projectId', getWeeklyActivity);

// Opportunity score distribution
analyticsRouter.get('/opportunity-distribution/:projectId', getOpportunityDistribution);

export default analyticsRouter;