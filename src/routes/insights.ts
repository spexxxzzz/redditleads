import express from 'express';
import { getInsightsForCampaign, updateInsightStatus, addCompetitorToCampaign } from '../controllers/insight.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const insightRouter = express.Router();

// Get the "Market Insights" for a specific campaign (Pro feature)
insightRouter.get('/campaign/:campaignId', gateKeeper, getInsightsForCampaign);

// Update insight status (acknowledge, ignore, etc.) (Pro feature)
insightRouter.patch('/:insightId/status', gateKeeper, updateInsightStatus);

// Add discovered competitor to campaign (Pro feature)
insightRouter.post('/:insightId/add-competitor', gateKeeper, addCompetitorToCampaign);

export default insightRouter;