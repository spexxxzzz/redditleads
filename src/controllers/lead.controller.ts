import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { findLeadsGlobally, findLeadsInSubmissions, findLeadsInComments, RawLead } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { summarizeTextContent } from '../services/summarisation.service';

const prisma = new PrismaClient();

export const runManualDiscovery: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;

    if (!campaignId) {
         res.status(400).json({ message: 'Campaign ID is required.' });
         return;
    }

    try {
        console.log(`🔍 [Manual Discovery] Starting for campaign: ${campaignId}`);
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { user: true }
        });

        if (!campaign || !campaign.user) {
             res.status(404).json({ message: 'Campaign or associated user not found.' });
             return;
        }

        const user = campaign.user;
        
        // --- MODIFIED: Manual discovery now uses the powerful global search ---
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
                    where: { url: lead.url }, // Assumes URL is a unique field in your schema
                    update: {}, // Don't update if it exists
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
         
    } catch (error) {
        next(error);
    }
};

export const getLeadsForCampaign: RequestHandler = async (req, res, next) => {
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

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        console.log(`📋 [Get Leads] Fetching leads for campaign: ${campaignId}`);

        const where: any = { campaignId };
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
    } catch (error) {
        console.error(`❌ [Get Leads] Error:`, error);
        next(error);
    }
};

export const updateLeadStatus: RequestHandler = async (req, res, next) => {
    const { leadId } = req.params;
    const { status } = req.body;

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
        console.log(`📝 [Update Lead] Updating lead ${leadId} status to: ${status}`);

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: { status }
        });

        const transformedLead = {
            id: updatedLead.id,
            title: updatedLead.title,
            author: updatedLead.author,
            subreddit: updatedLead.subreddit,
            url: updatedLead.url,
            body: updatedLead.body,
            createdAt: Math.floor(updatedLead.postedAt.getTime() / 1000),
            numComments: 0,
            upvoteRatio: 0.67,
            intent: updatedLead.intent || 'information_seeking',
            opportunityScore: updatedLead.opportunityScore,
            status: updatedLead.status
        };

        console.log(`✅ [Update Lead] Successfully updated lead status`);
        res.status(200).json(transformedLead);
    } catch (error) {
        console.error('❌ [Update Lead] Error updating lead status:', error);
        next(error);
    }
};

export const summarizeLead: RequestHandler = async (req, res, next) => {
    const { id } = req.params;

    try {
        const lead = await prisma.lead.findUnique({
            where: { id },
        });

        if (!lead) {
             res.status(404).json({ message: 'Lead not found.' });
             return;
        }

        if (!lead.body || lead.body.trim().length === 0) {
             res.status(400).json({ message: 'Lead has no content to summarize.' });
             return;
        }

        console.log(`[SUMMARIZE] Request for lead ${id}, using internal text.`);
        const summary = await summarizeTextContent(lead.body);

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: { summary },
        });

        res.status(200).json({ summary: updatedLead.summary });

    } catch (error) {
        next(error);
    }
};