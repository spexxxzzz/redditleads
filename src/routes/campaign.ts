import express from 'express';
import { getCampaignsForUser, getCampaignById } from '../controllers/campaign.controller';

const campaignRouter = express.Router();

// Get all campaigns for a specific user
campaignRouter.get('/user/:userId', getCampaignsForUser);

// Get a specific campaign by ID
campaignRouter.get('/:campaignId', getCampaignById);

export default campaignRouter;