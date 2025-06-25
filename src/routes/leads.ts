import express, { Request, Response } from 'express'
import { getLeadsForCampaign, runManualDiscovery } from '../controllers/lead.controller';
// Middleware to ensure the user is authenticated
const leadRouter = express.Router()

//Get the "inbox" of saved leads for a specific campaign
leadRouter.get('/campaign/:campaignId',  getLeadsForCampaign);

// Manually trigger a new search for a campaign
leadRouter.post('/discover/manual/:campaignId', runManualDiscovery);
export default leadRouter;