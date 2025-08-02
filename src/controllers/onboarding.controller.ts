import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateSubredditSuggestions } from '../services/ai.service';
import { findLeadsOnReddit } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { calculateContentRelevance } from '../services/relevance.service';

const prisma = new PrismaClient();

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

    if (!websiteUrl || !generatedKeywords || !generatedDescription) {
        res.status(400).json({ message: 'Missing required onboarding data.' });
        return;
    }

    try {
        console.log(`[Onboarding] Completing for user: ${userId}`);

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        // Generate subreddit suggestions
        const subredditArray = await generateSubredditSuggestions(generatedDescription);
        console.log(`[Onboarding] Generated ${subredditArray.length} subreddit suggestions.`);

        // Create campaign with proper field mapping
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
                name: `Campaign for ${websiteUrl}` // Add explicit name
            }
        });

        const campaignId = newCampaign.id;

        console.log(`[Onboarding] Campaign created: ${newCampaign.id}`);

        // Run automatic targeted discovery
        try {
            console.log(`[Onboarding] Running automatic targeted discovery for campaign: ${newCampaign.id}`);
            
            const rawLeads = await findLeadsOnReddit(
                newCampaign.generatedKeywords,
                newCampaign.targetSubreddits
            );

            console.log(`[Onboarding] Found ${rawLeads.length} raw leads.`);

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

            // Enrich leads (limit to 5 chunks for onboarding)
            const enrichedLeads = await enrichLeadsForUser(relevantLeads, user);

            // Save leads with proper field mapping
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
                    console.warn(`[Onboarding] Failed to save lead ${lead.id}:`, leadError);
                }
            }

            // Update campaign with discovery timestamp
            await prisma.campaign.update({
                where: { id: newCampaign.id },
                data: { 
                    lastManualDiscoveryAt: new Date(),
                    lastTargetedDiscoveryAt: new Date()
                }
            });

            console.log(`[Onboarding] Saved ${savedLeads.length} leads for new campaign.`);

        } catch (discoveryError) {
            console.error(`[Onboarding] Automatic discovery failed:`, discoveryError);
            // Don't fail onboarding if discovery fails
        }

        res.status(201).json({
            success: true,
            campaign: newCampaign,
            message: 'Onboarding completed successfully! Your first leads are being discovered.',
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