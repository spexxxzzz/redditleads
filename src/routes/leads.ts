import express, { Request, Response } from 'express';
import { deleteAllLeads, deleteLeadsByStatus, deleteSingleLead, getLeadsForCampaign, runManualDiscovery, runTargetedDiscovery, updateLeadStatus } from '../controllers/lead.controller';
import { summarizeLead } from '../controllers/post.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const leadRouter = express.Router();

// Get the "inbox" of saved leads for a specific campaign (Pro feature)
leadRouter.get('/campaign/:campaignId', gateKeeper, getLeadsForCampaign);

// Manually trigger a new search for a campaign (Pro feature)
leadRouter.post('/discover/manual/:campaignId', gateKeeper, runManualDiscovery);

// Update a lead's status (Pro feature)
leadRouter.patch('/:leadId/status', gateKeeper, updateLeadStatus);

// Summarize a lead using AI (Pro feature)
leadRouter.post('/:id/summarize', gateKeeper, summarizeLead);
leadRouter.delete('/campaign/:campaignId/all', deleteAllLeads);
leadRouter.delete('/campaign/:campaignId/status', deleteLeadsByStatus);
leadRouter.post('/campaign/:campaignId/discover/targeted', runTargetedDiscovery);
leadRouter.delete('/:leadId', gateKeeper, deleteSingleLead);


export default leadRouter;