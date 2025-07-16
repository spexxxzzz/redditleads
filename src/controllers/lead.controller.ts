import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { findLeadsGlobally } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { summarizeTextContent } from '../services/summarisation.service';

const prisma = new PrismaClient();

export const runManualDiscovery: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID from Clerk
    const { userId } = req.auth;
    const { campaignId } = req.params;

    // Ensure the user is authenticated
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!campaignId) {
         res.status(400).json({ message: 'Campaign ID is required.' });
         return;
    }

    try {
        console.log(`🔍 [Manual Discovery] User ${userId} starting for campaign: ${campaignId}`);
        
        // Securely find the campaign, ensuring it belongs to the authenticated user
        const campaign = await prisma.campaign.findFirst({
            where: { 
                id: campaignId,
                userId: userId 
            },
            include: { user: true }
        });

        if (!campaign || !campaign.user) {
             res.status(404).json({ message: 'Campaign not found or you do not have permission to access it.' });
             return;
        }

        const user = campaign.user;
        
        console.log(`[Manual Discovery] Running GLOBAL search for campaign ${campaign.id}...`);
        const rawLeads = await findLeadsGlobally(
            campaign.generatedKeywords,
            campaign.negativeKeywords || [],
            campaign.subredditBlacklist || []
        );
        
        console.log(`[Manual Discovery] Found ${rawLeads.length} unique raw leads.`);

        const enrichedLeads = await enrichLeadsForUser(rawLeads, user);
        
        const savedLeads = [];
        for (const lead of enrichedLeads) {
            try {
                const savedLead = await prisma.lead.upsert({
                    where: { url: lead.url },
                    update: {}, 
                    create: {
                        redditId: lead.id,
                        title: lead.title,
                        author: lead.author,
                        subreddit: lead.subreddit,
                        url: lead.url,
                        body: lead.body || '',
                        userId: user.id,
                        campaignId: campaignId,
                        opportunityScore: lead.opportunityScore,
                        intent: lead.intent || null,
                        status: 'new',
                        postedAt: new Date(lead.createdAt ? lead.createdAt * 1000 : Date.now()),
                        type: 'DIRECT_LEAD',
                    }
                });
                savedLeads.push(savedLead);
            } catch (error) {
                console.error(`❌ [Manual Discovery] Error saving lead "${lead.title}":`, error);
            }
        }

        const sortedLeads = savedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);
        res.status(200).json(sortedLeads);
        return;
         
    } catch (error) {
        next(error);
    }
};

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

        // Securely build the where clause
        const where: any = { 
            campaignId,
            userId: userId // Ensure leads belong to the authenticated user
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

        // Securely update the lead only if it belongs to the authenticated user
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
        // Securely find the lead, ensuring it belongs to the authenticated user
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