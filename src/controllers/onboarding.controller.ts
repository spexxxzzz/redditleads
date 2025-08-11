import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { findLeadsOnReddit, findLeadsOnRedditWithUserAccount } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { calculateContentRelevance } from '../services/relevance.service';import { generateKeywords, generateDescription, generateSubredditSuggestions } from '../services/ai.service';

const MIN_CONTENT_LENGTH = 300;
import { scrapeWebsiteTextSimple, scrapeWebsiteTextAdvanced } from '../services/scraper.service';
const prisma = new PrismaClient();
import { getUserAuthenticatedInstance } from '../services/reddit.service';
import { sendNewLeadsNotification } from '../services/email.service';

export const completeOnboarding: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const {
        websiteUrl,
        generatedKeywords,
        generatedDescription,
        competitors
    } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        console.log(`[Onboarding] Completing for user: ${userId}`);

        // Check if user exists and has Reddit connected
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        if (!user.redditRefreshToken) {
            res.status(403).json({ 
                message: 'Reddit account not connected. Please connect your Reddit account first.',
                requiresRedditAuth: true 
            });
            return;
        }

        // Generate subreddit suggestions
        const subredditArray = await generateSubredditSuggestions(generatedDescription);
        console.log(`[Onboarding] Generated ${subredditArray.length} subreddit suggestions.`);

        // Create campaign
        const newCampaign = await prisma.campaign.create({
            data: {
                userId,
                analyzedUrl: websiteUrl,
                generatedKeywords: Array.isArray(generatedKeywords) 
                    ? generatedKeywords 
                    : generatedKeywords.split(',').map((k: string) => k.trim()),
                generatedDescription,
                targetSubreddits: subredditArray,
                competitors: competitors || [],
                isActive: true,
                name: `Campaign for ${websiteUrl}`
            }
        });

        const campaignName = newCampaign.analyzedUrl;

        console.log(`[Onboarding] Campaign created: ${newCampaign.id}`);

        // Run lead discovery using USER'S Reddit account
        let leadsFound = 0;
        try {
            console.log(`[Onboarding] Running lead discovery with user's Reddit account...`);
            
            // Use user's Reddit account for lead discovery
            const rawLeads = await findLeadsOnRedditWithUserAccount(
                newCampaign.generatedKeywords,
                newCampaign.targetSubreddits,
                user.redditRefreshToken // Use user's token
            );

            console.log(`[Onboarding] Found ${rawLeads.length} raw leads using user account.`);

            // Filter for relevance
            const relevantLeads = rawLeads.filter(lead => {
                const relevance = calculateContentRelevance(
                    lead, 
                    newCampaign.generatedKeywords, 
                    newCampaign.generatedDescription
                );
                return relevance.score >= 15;
            });

            console.log(`[Onboarding] Filtered to ${relevantLeads.length} relevant leads.`);

            // Enrich leads
            const enrichedLeads = await enrichLeadsForUser(relevantLeads, user);

            // Save leads
            const savedLeads = [];
            for (const lead of enrichedLeads) {
                try {
                    const savedLead = await prisma.lead.upsert({
                        where: { 
                            redditId_campaignId: { 
                                redditId: lead.id, 
                                campaignId: newCampaign.id 
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
                            postedAt: new Date(lead.createdAt ? lead.createdAt * 1000 : Date.now()),
                            userId: user.id,
                            campaignId: newCampaign.id,
                            opportunityScore: lead.opportunityScore || 0,
                            intent: lead.intent || 'general_discussion',
                            status: 'new',
                            type: 'DIRECT_LEAD',
                            isGoogleRanked: lead.isGoogleRanked || false,
                        }
                    });
                    savedLeads.push(savedLead);
                } catch (leadError) {
                    console.warn(`[Onboarding] Failed to save lead ${lead.id}:`, leadError);
                }
            }

            leadsFound = savedLeads.length;

            // Update campaign with discovery timestamp
            await prisma.campaign.update({
                where: { id: newCampaign.id },
                data: { 
                    lastManualDiscoveryAt: new Date(),
                    lastTargetedDiscoveryAt: new Date()
                }
            });

           

            console.log(`[Onboarding] Saved ${savedLeads.length} leads for new campaign.`);

            // Send email notification with leads
            if (savedLeads.length > 0) {
                try {
                    await sendNewLeadsNotification(user, savedLeads, campaignName);
                    console.log(`[Onboarding] Email notification sent to ${user.email}`);
                } catch (emailError) {
                    console.error(`[Onboarding] Failed to send email notification:`, emailError);
                }
            }

        } catch (discoveryError) {
            console.error(`[Onboarding] Lead discovery failed:`, discoveryError);
            // Don't fail onboarding if discovery fails, but log it
        }

        res.status(201).json({
            success: true,
            campaign: newCampaign,
            leadsFound,
            message: leadsFound > 0 
                ? `Onboarding completed! Found ${leadsFound} leads and sent them to your email.`
                : 'Onboarding completed! We\'ll continue monitoring for leads.',
        });

    } catch (error) {
        console.error('[Onboarding] Error:', error);
        next(error);
    }
};

export const quickSetup: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;
    const { industry, description, keywords, targetSubreddits } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        const campaign = await prisma.campaign.create({
            data: {
                userId,
                name: `${industry} Campaign`,
                analyzedUrl: `https://example.com`, // Provide default URL
                generatedDescription: description,
                generatedKeywords: Array.isArray(keywords) ? keywords : [keywords],
                targetSubreddits: Array.isArray(targetSubreddits) ? targetSubreddits : [],
                isActive: true
            }
        });

        res.json({ success: true, campaignId: campaign.id });
    } catch (error) {
        console.error('[Quick Setup] Error:', error);
        next(error);
    }
};

// This function can remain public as it's the first step of the onboarding
// process and does not interact with user-specific data.
export const analyzeWebsite: RequestHandler = async (req, res, next) => {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
         res.status(400).json({ message: 'Website URL is required.' });
         return;
    }

    try {
        let scrapedText = '';
        // First, try a simple scrape.
        scrapedText = await scrapeWebsiteTextSimple(websiteUrl);

        // If the content is too short, fall back to the advanced scraper.
        if (scrapedText.length < MIN_CONTENT_LENGTH) {
            scrapedText = await scrapeWebsiteTextAdvanced(websiteUrl);
        }

        // Generate keywords and description in parallel for efficiency.
        const [keywords, description] = await Promise.all([
            generateKeywords(scrapedText),
            generateDescription(scrapedText)
        ]);

        res.status(200).json({
            websiteUrl,
            generatedKeywords: keywords,
            generatedDescription: description
        });
        return;

    } catch (error) {
        // Pass any errors to the global error handler.
        next(error);
    }
}; 