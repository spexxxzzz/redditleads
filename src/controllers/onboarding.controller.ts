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
        scrapedText = await scrapeWebsiteTextSimple(websiteUrl);

        if (scrapedText.length < MIN_CONTENT_LENGTH) {
            scrapedText = await scrapeWebsiteTextAdvanced(websiteUrl);
        }

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
        next(error);
    }
};


export const completeOnboarding: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID from Clerk's middleware
    const { userId } = req.auth;
    const { websiteUrl, generatedKeywords, generatedDescription, competitors } = req.body;

    // Ensure the user is authenticated
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!websiteUrl || !generatedKeywords || !generatedDescription) {
          res.status(400).json({ message: 'All onboarding data is required.' });
          return;
    }

    try {
        console.log(`[1/3] Entering completeOnboarding for user: ${userId}`);

        console.log('[2/3] Calling AI to generate subreddit suggestions...');
        const subreddits = await generateSubredditSuggestions(generatedDescription);
        
        console.log(`[3/3] AI call successful. Received ${subreddits.length} subreddits.`);

        const newCampaign = await prisma.campaign.create({
            data: {
                userId, // Use the secure, authenticated userId
                analyzedUrl: websiteUrl,
                generatedKeywords,
                generatedDescription,
                targetSubreddits: subreddits,
                competitors: competitors || [],
            }
        });

        res.status(201).json(newCampaign);
        return;

    } catch (error) {
        console.error("!!! ERROR in completeOnboarding:", error);
        next(error);
    }
};