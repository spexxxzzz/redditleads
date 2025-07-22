import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { summarizeTextContent } from '../services/summarisation.service';
import axios from 'axios'; // <-- IMPORT AXIOS

const prisma = new PrismaClient();

// The internal URL for your Python worker service on Render.
// 'lead-generator' should be the name you give your Python service on Render.
const PYTHON_WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://lead-generator:10000/trigger-scan';

/**
 * --- MODIFIED FOR PYTHON WORKER ---
 * Triggers the external Python worker to perform a lead discovery scan.
 */
export const runManualDiscovery: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { campaignId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!campaignId) {
        return res.status(400).json({ message: 'Campaign ID is required.' });
    }

    try {
        console.log(`[Manual Discovery] User ${userId} triggered scan for campaign ${campaignId}. Forwarding to Python worker...`);

        // Call the Python worker's API endpoint
        // We pass the campaignId so the python worker knows which campaign to scan for.
        const response = await axios.post(PYTHON_WORKER_URL, {
            campaignId: campaignId,
        });

        console.log('[Manual Discovery] Response from Python worker:', response.data);

        // Immediately fetch the latest leads from the database to give the user fresh data.
        // This is a better user experience than just returning a success message.
        const leads = await prisma.lead.findMany({
            where: { campaignId, userId },
            orderBy: { discoveredAt: 'desc' },
            take: 50 // Return the 50 most recent leads
        });

        res.status(200).json({ 
            message: "Successfully triggered lead discovery.",
            workerResponse: response.data,
            updatedLeads: leads // Optionally send back the latest leads
        });

    } catch (error: any) {
        console.error("Error triggering manual lead discovery:", error.message);
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data);
        }
        return res.status(500).json({ 
            error: 'Failed to trigger the lead discovery worker.',
            details: error.message
        });
    }
};


// --- UNCHANGED FUNCTIONS ---

export const getLeadsForCampaign: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { campaignId } = req.params;
    const {
        page = '1',
        limit = '20',
        sortBy = 'opportunityScore',
        sortOrder = 'desc',
        status,
        intent,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        console.log(`📋 [Get Leads] User ${userId} fetching leads for campaign: ${campaignId}`);

        const where: any = { 
            campaignId,
            userId: userId
        };
        if (status && status !== 'all') {
            where.status = status as string;
        }
        if (intent && intent !== 'all') {
            where.intent = intent as string;
        }

        const orderBy: any = { [sortBy as string]: sortOrder as string };

        const leads = await prisma.lead.findMany({
            where,
            orderBy,
            take: limitNum,
            skip,
        });

        const totalLeads = await prisma.lead.count({ where });

        console.log(`📋 [Get Leads] Found ${leads.length} leads (${totalLeads} total) matching criteria`);

        const transformedLeads = leads.map(lead => ({
            id: lead.id,
            title: lead.title,
            author: lead.author,
            subreddit: lead.subreddit,
            url: lead.url,
            body: lead.body,
            createdAt: Math.floor(lead.postedAt.getTime() / 1000),
            numComments: 0, 
            upvoteRatio: 0.67,
            intent: lead.intent || 'information_seeking',
            opportunityScore: lead.opportunityScore,
            status: lead.status,
            isGoogleRanked: false,
        }));

        res.status(200).json({
            data: transformedLeads,
            pagination: {
                total: totalLeads,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalLeads / limitNum)
            }
        });
        return;
    } catch (error) {
        console.error(`❌ [Get Leads] Error:`, error);
        next(error);
    }
};

export const updateLeadStatus: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { leadId } = req.params;
    const { status } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!leadId || !status) {
        res.status(400).json({ message: 'Lead ID and status are required.' });
        return;
    }

    const validStatuses = ['new', 'replied', 'saved', 'ignored'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid status. Must be one of: new, replied, saved, ignored' });
        return;
    }

    try {
        console.log(`📝 [Update Lead] User ${userId} updating lead ${leadId} status to: ${status}`);

        const result = await prisma.lead.updateMany({
            where: { 
                id: leadId,
                userId: userId
            },
            data: { status }
        });

        if (result.count === 0) {
            res.status(404).json({ message: 'Lead not found or you do not have permission to update it.' });
            return;
        }

        console.log(`✅ [Update Lead] Successfully updated lead status`);
        res.status(200).json({ message: 'Lead status updated successfully.' });
        return;

    } catch (error) {
        console.error('❌ [Update Lead] Error updating lead status:', error);
        next(error);
    }
};

export const summarizeLead: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { id: leadId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        const lead = await prisma.lead.findFirst({
            where: { 
                id: leadId,
                userId: userId
            },
        });

        if (!lead) {
             res.status(404).json({ message: 'Lead not found or you do not have permission to access it.' });
             return;
        }

        if (!lead.body || lead.body.trim().length === 0) {
             res.status(400).json({ message: 'Lead has no content to summarize.' });
             return;
        }

        console.log(`[SUMMARIZE] User ${userId} requesting summary for lead ${leadId}`);
        const summary = await summarizeTextContent(lead.body);

        await prisma.lead.update({
            where: { id: leadId },
            data: { summary },
        });

        res.status(200).json({ summary });
        return;

    } catch (error) {
        next(error);
    }
};

export const deleteAllLeads: RequestHandler = async (req: any, res, next) => {
    try {
      const { campaignId } = req.params;
      const userId = req.auth.userId;
  
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }
  
      if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
      }
  
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id: campaignId,
          userId: userId 
        }
      });
  
      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found or you do not have permission to access it.' });
        return;
      }
  
      const deleteResult = await prisma.lead.deleteMany({
        where: {
          campaignId,
          userId
        }
      });
  
      console.log(`Deleted ${deleteResult.count} leads for campaign ${campaignId} (user: ${userId})`);
  
      res.json({ 
        success: true, 
        message: `Successfully deleted ${deleteResult.count} leads`,
        deletedCount: deleteResult.count
      });
  
    } catch (error) {
      console.error('Error deleting leads:', error);
      next(error);
    }
  };
  
  export const deleteLeadsByStatus: RequestHandler = async (req: any, res, next) => {
    try {
      const { campaignId } = req.params;
      const { status } = req.body;
      const userId = req.auth.userId;
  
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }
  
      if (!campaignId || !status) {
        res.status(400).json({ message: 'Campaign ID and status are required.' });
        return;
      }
  
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id: campaignId,
          userId: userId 
        }
      });
  
      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found or you do not have permission to access it.' });
        return;
      }
  
      const deleteResult = await prisma.lead.deleteMany({
        where: {
          campaignId,
          userId,
          status
        }
      });
  
      console.log(`Deleted ${deleteResult.count} ${status} leads for campaign ${campaignId}`);
  
      res.json({ 
        success: true, 
        message: `Successfully deleted ${deleteResult.count} ${status} leads`,
        deletedCount: deleteResult.count
      });
  
    } catch (error) {
      console.error('Error deleting leads by status:', error);
      next(error);
    }
  };
