import express, { Request, Response } from 'express';
import { gateKeeper } from '../middleware/gateKeeper';
import { 
  getLeadTrends, 
  getSubredditPerformance, 
  getAnalyticsMetrics, 
  getWeeklyActivity, 
  getOpportunityDistribution 
} from  '../controllers/analytics.controller';

const analyticsRouter = express.Router();

// Lead trends over time for a campaign
analyticsRouter.get('/trends/:campaignId', gateKeeper, getLeadTrends);

// Subreddit performance for a campaign
analyticsRouter.get('/subreddit-performance/:campaignId', gateKeeper, getSubredditPerformance);

// Analytics metrics (changes, trends, etc.)
analyticsRouter.get('/metrics/:campaignId', gateKeeper, getAnalyticsMetrics);

// Weekly activity patterns
analyticsRouter.get('/weekly-activity/:campaignId', gateKeeper, getWeeklyActivity);

// Opportunity score distribution
analyticsRouter.get('/opportunity-distribution/:campaignId', gateKeeper, getOpportunityDistribution);

export default analyticsRouter;