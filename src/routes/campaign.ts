import express from 'express';
import { getCampaignsForUser, getCampaignById, deleteCampaignById, updateCampaignById } from '../controllers/campaign.controller';

const campaignRouter = express.Router();

// Get all campaigns for the currently authenticated user
// The controller now gets the userId from req.auth, so we don't need it in the URL.
campaignRouter.get('/', getCampaignsForUser);

// Get a specific campaign by ID
// The controller for this route already verifies ownership.
campaignRouter.get('/:campaignId', getCampaignById);
campaignRouter.delete('/:campaignId', deleteCampaignById);
campaignRouter.patch('/:campaignId', updateCampaignById);

export default campaignRouter;