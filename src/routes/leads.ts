import express from 'express';
import {
    runManualDiscovery,
    updateLeadStatus,
    deleteLead,
    deleteLeadsByStatus,
    deleteAllLeads
} from '../controllers/lead.controller';
import { getLeadsForTable } from '../controllers/analytics.controller';
import { summarizeLead } from '../controllers/post.controller';

const leadRouter = express.Router();

// Get the "inbox" of saved leads for a specific project (Pro feature)
leadRouter.get('/project/:projectId', getLeadsForTable);

// Manually trigger a new search for a project (Pro feature)
leadRouter.post('/discover/manual/:projectId', runManualDiscovery);

// Update a lead's status (Pro feature)
leadRouter.patch('/:leadId/status', updateLeadStatus);

// Summarize a lead using AI (Pro feature)
leadRouter.post('/:id/summarize', summarizeLead);

// Delete individual lead
leadRouter.delete('/:leadId', deleteLead);

// Delete leads by status (bulk operation)
leadRouter.post('/project/:projectId/delete-by-status', deleteLeadsByStatus);

// Delete all leads for a project
leadRouter.delete('/project/:projectId/all', deleteAllLeads);

export default leadRouter;