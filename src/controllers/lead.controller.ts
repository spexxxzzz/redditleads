import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { findLeadsGlobally, findLeadsOnReddit } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { summarizeTextContent } from '../services/summarisation.service';
import { calculateContentRelevance } from '../services/relevance.service';
import { AIUsageService } from '../services/aitracking.service';
import { sendNewLeadsNotification } from '../services/email.service';

const prisma = new PrismaClient();

export const runManualDiscovery: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { campaignId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        console.log(`🌍 [Global Discovery] User ${userId} starting for campaign: ${campaignId}`);
        
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

        // Check cooldown for global discovery (using correct schema field name)
        if (campaign.lastGlobalDiscoverAt) {
            const lastGlobal = new Date(campaign.lastGlobalDiscoverAt);
            const now = new Date();
            const timeDiff = now.getTime() - lastGlobal.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff < 10) {
                const remainingTime = 10 - hoursDiff;
                const hours = Math.floor(remainingTime);
                const minutes = Math.floor((remainingTime - hours) * 60);
                
                res.status(429).json({ 
                    message: `Global discovery is on cooldown. Please wait ${hours}h ${minutes}m before running again.`,
                    cooldownRemaining: remainingTime * 60 * 60 * 1000 // in milliseconds
                });
                return;
            }
        }

        const user = campaign.user;
        const usageService = AIUsageService.getInstance();
        const canRun = await usageService.trackAIUsage(userId, 'manual_discovery', user.plan);
        if (!canRun) {
            res.status(429).json({ message: "You've reached your monthly discovery limit. Please upgrade your plan for more." });
            return;
        }

        console.log(`[Global Discovery] Running GLOBAL search...`);
        
        const rawLeads = await findLeadsGlobally(
            campaign.generatedKeywords,
            [],
            ['test', 'circlejerk'], 
            campaign.generatedDescription
        );
        
        console.log(`[Global Discovery] Found ${rawLeads.length} unique global leads.`);

        const relevantLeads = rawLeads.filter(lead => {
            const relevance = calculateContentRelevance(
                lead, 
                campaign.generatedKeywords, 
                campaign.generatedDescription
            );
            return relevance.score >= 25;
        });

        console.log(`[Global Discovery] Filtered to ${relevantLeads.length} relevant global leads`);

        const enrichedLeads = await enrichLeadsForUser(relevantLeads, user);// 6 chunks for global
        
        const savedLeads = [];
        for (const lead of enrichedLeads) {
            try {
                const savedLead = await prisma.lead.upsert({
                    where: { 
                        redditId_campaignId: { 
                            redditId: lead.id, 
                            campaignId: campaignId 
                        } 
                    },
                    update: {
                        opportunityScore: lead.opportunityScore,
                        intent: lead.intent,
                        isGoogleRanked: lead.isGoogleRanked,
                    },
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
            } catch (leadError) {
                console.warn(`[Global Discovery] Failed to save lead ${lead.id}:`, leadError);
            }
        }

        if (savedLeads.length > 0) {
            console.log(`[Global Discovery] Found ${savedLeads.length} new leads. Triggering email notification.`);
            sendNewLeadsNotification(user, savedLeads, campaign.name || 'Your Campaign').catch(err => {
                console.error(`[Global Discovery] Failed to send email notification for campaign ${campaign.id}:`, err);
            });
        }

        // Update discovery timestamps (using correct schema field names)
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { 
                lastManualDiscoveryAt: new Date(),
                lastGlobalDiscoverAt: new Date() // Correct field name from schema
            }
        });

        const sortedLeads = savedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);
        res.status(200).json(sortedLeads);
        return;
         
    } catch (error) {
        next(error);
    }
};

export const runTargetedDiscovery: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { campaignId } = req.params;
  
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }
  
    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }
  
    try {
        console.log(`🎯 [Targeted Discovery] User ${userId} starting for campaign: ${campaignId}`);
        
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

        // Check cooldown for targeted discovery
        if (campaign.lastTargetedDiscoveryAt) {
            const lastTargeted = new Date(campaign.lastTargetedDiscoveryAt);
            const now = new Date();
            const timeDiff = now.getTime() - lastTargeted.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff < 10) {
                const remainingTime = 10 - hoursDiff;
                const hours = Math.floor(remainingTime);
                const minutes = Math.floor((remainingTime - hours) * 60);
                
                res.status(429).json({ 
                    message: `Targeted discovery is on cooldown. Please wait ${hours}h ${minutes}m before running again.`,
                    cooldownRemaining: remainingTime * 60 * 60 * 1000 // in milliseconds
                });
                return;
            }
        }
  
        const user = campaign.user;
        const usageService = AIUsageService.getInstance();
        const canRun = await usageService.trackAIUsage(userId, 'manual_discovery', user.plan);
        if (!canRun) {
            res.status(429).json({ message: "You've reached your monthly discovery limit. Please upgrade your plan for more." });
            return;
        }
  
        if (!campaign.targetSubreddits || campaign.targetSubreddits.length === 0) {
            res.status(400).json({ 
                message: 'No target subreddits configured for this campaign. Please add target subreddits first.',
                needsSubreddits: true 
            });
            return;
        }
        
        console.log(`[Targeted Discovery] Running TARGETED search in ${campaign.targetSubreddits.length} subreddits...`);
  
        const rawLeads = await findLeadsOnReddit(
            campaign.generatedKeywords,
            campaign.targetSubreddits
        );
        
        console.log(`[Targeted Discovery] Found ${rawLeads.length} unique targeted leads.`);
  
        const relevantLeads = rawLeads.filter(lead => {
            const relevance = calculateContentRelevance(
                lead, 
                campaign.generatedKeywords, 
                campaign.generatedDescription
            );
            return relevance.score >= 15;
        });
  
        console.log(`[Targeted Discovery] Filtered to ${relevantLeads.length} relevant targeted leads`);
  
        const enrichedLeads = await enrichLeadsForUser(relevantLeads, user); // 10 chunks for targeted
        
        const savedLeads = [];
        for (const lead of enrichedLeads) {
            try {
                const savedLead = await prisma.lead.upsert({
                    where: { 
                        redditId_campaignId: { 
                            redditId: lead.id, 
                            campaignId: campaignId 
                        } 
                    },
                    update: {
                        opportunityScore: lead.opportunityScore,
                        intent: lead.intent,
                        isGoogleRanked: lead.isGoogleRanked,
                    },
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
            } catch (leadError) {
                console.warn(`[Targeted Discovery] Failed to save lead ${lead.id}:`, leadError);
            }
        }
  
        if (savedLeads.length > 0) {
            console.log(`[Targeted Discovery] Found ${savedLeads.length} new leads. Triggering email notification.`);
            sendNewLeadsNotification(user, savedLeads, campaign.name || 'Your Campaign').catch(err => {
                console.error(`[Targeted Discovery] Failed to send email notification for campaign ${campaign.id}:`, err);
            });
        }

        // Update discovery timestamps
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { 
                lastManualDiscoveryAt: new Date(),
                lastTargetedDiscoveryAt: new Date()
            }
        });
  
        const sortedLeads = savedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);
        
        console.log(`✅ [Targeted Discovery] Completed for campaign ${campaignId}. Saved ${savedLeads.length} leads.`);
        
        res.status(200).json({
            success: true,
            message: `Found ${savedLeads.length} targeted leads from ${campaign.targetSubreddits.length} subreddits`,
            leads: sortedLeads,
            searchType: 'targeted',
            subredditsSearched: campaign.targetSubreddits
        });
        return;
         
    } catch (error) {
        console.error('❌ [Targeted Discovery] Error:', error);
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
            createdAt: Math.floor(lead.postedAt.getTime() / 1000), // Converting postedAt to createdAt for frontend
            intent: lead.intent || 'information_seeking',
            summary: lead.summary,
            opportunityScore: lead.opportunityScore,
            status: lead.status,
            isGoogleRanked: lead.isGoogleRanked ?? false,
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

    const validStatuses = ["new", "replied", "saved", "ignored"]; // Using correct schema values
    if (!validStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid status provided.' });
        return;
    }

    try {
        console.log(`[Lead Status] User ${userId} updating lead ${leadId} to status: ${status}`);

        const lead = await prisma.lead.findFirst({
            where: {
                id: leadId,
                userId: userId,
            },
        });

        if (!lead) {
            res.status(404).json({ message: 'Lead not found or you do not have permission.' });
            return;
        }

        const updatedLead = await prisma.lead.update({
            where: {
                id: leadId,
            },
            data: {
                status: status,
            },
        });

        console.log(`✅ [Lead Status] Successfully updated lead ${leadId}`);
        res.status(200).json({
            success: true,
            message: 'Lead status updated successfully.',
            lead: updatedLead,
        });
    } catch (error) {
        console.error(`❌ [Lead Status] Error updating lead ${leadId}:`, error);
        next(error);
    }
};

export const deleteSingleLead: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { leadId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        const lead = await prisma.lead.findFirst({
            where: {
                id: leadId,
                userId: userId,
            },
        });

        if (!lead) {
            res.status(404).json({ message: 'Lead not found or you do not have permission to delete it.' });
            return;
        }

        await prisma.lead.delete({
            where: { id: leadId },
        });

        res.status(200).json({ success: true, message: 'Lead deleted successfully.' });
    } catch (error) {
        console.error(`[Delete Lead] Error deleting lead ${leadId}:`, error);
        next(error);
    }
};