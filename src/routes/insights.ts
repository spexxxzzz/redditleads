import express from 'express';
import { getInsightsForCampaign, updateInsightStatus, addCompetitorToCampaign } from '../controllers/insight.controller';

const insightRouter = express.Router();

// Get the "Market Insights" for a specific campaign
insightRouter.get('/campaign/:campaignId', getInsightsForCampaign);

// Update insight status (acknowledge, ignore, etc.)
insightRouter.patch('/:insightId/status', updateInsightStatus);

// Add discovered competitor to campaign
insightRouter.post('/:insightId/add-competitor', addCompetitorToCampaign);

export default insightRouter;