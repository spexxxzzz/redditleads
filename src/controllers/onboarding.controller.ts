// src/controllers/onboarding.controller.ts

import { RequestHandler } from 'express';
import {
    scrapeWebsiteTextSimple,
    scrapeWebsiteTextAdvanced
} from '../services/scraper.service';
import { generateKeywords, generateDescription, generateSubredditSuggestions } from '../services/ai.service';
import { PrismaClient } from '@prisma/client';

const MIN_CONTENT_LENGTH = 300;
const prisma = new PrismaClient();

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


export const completeOnboarding: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID from Clerk's middleware
    const { userId } = req.auth;
    const {
        websiteUrl,
        generatedKeywords,
        generatedDescription,
        competitors
    } = req.body;

    // --- SECURITY: Ensure user is authenticated before proceeding ---
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    // --- VALIDATION: Ensure all required fields are present ---
    if (!websiteUrl || !generatedKeywords || !generatedDescription) {
        res.status(400).json({ message: 'Missing required onboarding data.' });
        return;
    }

    try {
        console.log(`[Onboarding] Completing for user: ${userId}`);

        // Generate subreddit suggestions. The AI service now returns a string array directly.
        const subredditArray = await generateSubredditSuggestions(generatedDescription);

        console.log(`[Onboarding] Generated ${subredditArray.length} subreddit suggestions.`);

        // Create a new campaign linked to the authenticated user.
        const newCampaign = await prisma.campaign.create({
            data: {
                userId, // Link to the authenticated user
                analyzedUrl: websiteUrl,
                generatedKeywords,
                generatedDescription,
                targetSubreddits: subredditArray, // Use the array directly
                competitors: competitors || [], // Use provided competitors or default to an empty array
                isActive: true
            }
        });

        console.log(`[Onboarding] Successfully created campaign ${newCampaign.id} for user ${userId}`);

        res.status(201).json(newCampaign);
        return;

    } catch (error) {
        // Pass any database or other errors to the global error handler.
        next(error);
    }
};
