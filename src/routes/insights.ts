import express from 'express';
import { getInsightsForProject, updateInsightStatus, addCompetitorToProject } from '../controllers/insight.controller';

const insightRouter = express.Router();

// Get the "Market Insights" for a specific project (Pro feature)
insightRouter.get('/project/:projectId', getInsightsForProject);

// Update insight status (acknowledge, ignore, etc.) (Pro feature)
insightRouter.patch('/:insightId/status', updateInsightStatus);

// Add discovered competitor to project (Pro feature)
insightRouter.post('/:insightId/add-competitor', addCompetitorToProject);

export default insightRouter;