import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

import { findLeadsOnReddit } from '../services/reddit.service';
// --- DRY PRINCIPLE: Import the new centralized enrichment service ---
// We no longer need to import calculateLeadScore or analyzeLeadIntent here.
import { enrichLeadsForUser } from '../services/enrichment.service';
import { summarizeTextContent } from '../services/summarisation.service';

const prisma = new PrismaClient();

/**
 * Manually triggers a lead discovery for a specific campaign.
 * This is useful for immediate results without waiting for the scheduled worker.
 * The quality of the analysis depends on the user's subscription plan.
 */
export const runManualDiscovery: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        console.log(`🔍 [Manual Discovery] Starting for campaign: ${campaignId}`);

        // 1. Fetch the campaign and include the user to check their plan
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { user: true } // Eager load the user object
        });

        if (!campaign || !campaign.user) {
            res.status(404).json({ message: 'Campaign or associated user not found.' });
            return;
        }

        if (campaign.targetSubreddits.length === 0) {
            res.status(400).json({ message: 'Campaign has no target subreddits configured.' });
            return;
        }

        const user = campaign.user;

        // 2. Fetch raw leads from Reddit
        console.log(`🔍 [Manual Discovery] Fetching leads from Reddit...`);
        const rawLeads = await findLeadsOnReddit(campaign.generatedKeywords, campaign.targetSubreddits);
        console.log(`🔍 [Manual Discovery] Found ${rawLeads.length} raw leads`);

        // --- DRY PRINCIPLE: All tier-aware logic is now handled by a single service call ---
        const enrichedLeads = await enrichLeadsForUser(rawLeads, user);
        console.log(`🔍 [Manual Discovery] Enriched ${enrichedLeads.length} leads`);

        // 3. Save leads to database (with duplicate prevention)
        const savedLeads = [];
        for (const lead of enrichedLeads) {
            try {
                // Check if lead already exists (prevent duplicates)
                const existingLead = await prisma.lead.findFirst({
                    where: {
                        campaignId: campaignId,
                        url: lead.url // Using the Reddit URL as unique identifier (matches your schema)
                    }
                });

                if (!existingLead) {
                    // Map the enriched lead data to your database schema
                    // IMPORTANT: These field names match your actual Prisma schema
                    const savedLead = await prisma.lead.create({
                        data: {
                            // Required fields from your schema
                            redditId: lead.id || `reddit_${Date.now()}_${Math.random()}`, // Your schema requires this
                            title: lead.title, // Your schema field name
                            author: lead.author,
                            subreddit: lead.subreddit,
                            url: lead.url, // Your schema field name
                            body: lead.body || '', // Your schema field name
                            
                            // Relationship fields
                            userId: user.id, // Required in your schema
                            campaignId: campaignId,
                            
                            // Scoring and classification
                            opportunityScore: lead.opportunityScore,
                            intent: lead.intent || null,
                            status: 'new',
                            
                            // Timestamps - using current time for postedAt since Reddit data might not have it
                            postedAt: new Date(lead.createdAt ? lead.createdAt * 1000 : Date.now()),
                            
                            // Optional fields with defaults
                            type: 'DIRECT_LEAD', // Default from your schema enum
                            sentiment: null,
                        }
                    });
                    savedLeads.push(savedLead);
                    console.log(`💾 [Manual Discovery] Saved lead: ${lead.title}`);
                } else {
                    console.log(`⚠️  [Manual Discovery] Lead already exists, skipping: ${lead.title}`);
                    savedLeads.push(existingLead);
                }
            } catch (error) {
                console.error(`❌ [Manual Discovery] Error saving lead "${lead.title}":`, error);
                // Continue with other leads even if one fails
            }
        }

        // 4. Sort the saved leads by score
        const sortedLeads = savedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);

        console.log(`✅ [Manual Discovery] Completed. Saved ${savedLeads.length} leads to database`);

        // 5. Transform the response to match frontend expectations
        const transformedLeads = sortedLeads.map(lead => ({
            id: lead.id,
            title: lead.title, // Using actual schema field names
            author: lead.author,
            subreddit: lead.subreddit,
            url: lead.url,
            body: lead.body,
            createdAt: Math.floor(lead.postedAt.getTime() / 1000), // Convert to Unix timestamp
            numComments: 0, // You might want to store this separately
            upvoteRatio: 0.67, // You might want to store this separately
            intent: lead.intent || 'information_seeking',
            opportunityScore: lead.opportunityScore,
            status: lead.status
        }));

        // 6. Return the transformed leads
        res.status(200).json(transformedLeads);
         
    } catch (error) {
        console.error(`❌ [Manual Discovery] Error:`, error);
        next(error);
    }
};


/**
 * Fetches saved leads from the database for a specific campaign's "Lead Inbox".
 * Results are paginated and sorted by the highest opportunity score.
 */
export const getLeadsForCampaign: RequestHandler = async (req, res, next) => {
    const { campaignId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!campaignId) {
        res.status(400).json({ message: 'Campaign ID is required.' });
        return;
    }

    try {
        console.log(`📋 [Get Leads] Fetching leads for campaign: ${campaignId}`);

        const leads = await prisma.lead.findMany({
            where: { 
                campaignId: campaignId
                // Removed the status filter so frontend can handle all statuses
            },
            orderBy: {
                opportunityScore: 'desc' // Show the best leads first
            },
            take: limit,
            skip: skip,
        });

        const totalLeads = await prisma.lead.count({
            where: { campaignId: campaignId }
        });

        console.log(`📋 [Get Leads] Found ${leads.length} leads (${totalLeads} total)`);

        // Transform the data to match what your frontend expects
        // Using the ACTUAL field names from your schema
        const transformedLeads = leads.map(lead => ({
            id: lead.id,
            title: lead.title, // Schema field name (not postTitle)
            author: lead.author,
            subreddit: lead.subreddit,
            url: lead.url, // Schema field name (not postUrl)
            body: lead.body, // Schema field name (not postContent)
            createdAt: Math.floor(lead.postedAt.getTime() / 1000), // Convert postedAt to Unix timestamp
            numComments: 0, // You might want to store this separately
            upvoteRatio: 0.67, // You might want to store this separately
            intent: lead.intent || 'information_seeking',
            opportunityScore: lead.opportunityScore,
            status: lead.status
        }));

        res.status(200).json({
            data: transformedLeads,
            pagination: {
                total: totalLeads,
                page,
                limit,
                totalPages: Math.ceil(totalLeads / limit)
            }
        });
    } catch (error) {
        console.error(`❌ [Get Leads] Error:`, error);
        next(error);
    }
};

/**
 * Updates the status of a lead (new, replied, saved, ignored)
 */
export const updateLeadStatus: RequestHandler = async (req, res, next) => {
    const { leadId } = req.params;
    const { status } = req.body;

    if (!leadId || !status) {
        res.status(400).json({ message: 'Lead ID and status are required.' });
        return;
    }

    // Validate status values
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

        // Transform the response to match frontend expectations
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
             return
        }

        // --- Use the lead's body text instead of the URL ---
        if (!lead.body || lead.body.trim().length === 0) {
             res.status(400).json({ message: 'Lead has no content to summarize.' });
             return
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