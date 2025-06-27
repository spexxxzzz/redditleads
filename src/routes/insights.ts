import express from 'express';
import { getInsightsForCampaign } from '../controllers/insight.controller';

const insightRouter = express.Router();

// Get the "Market Insights" for a specific campaign
insightRouter.get('/campaign/:campaignId', getInsightsForCampaign);

export default insightRouter;