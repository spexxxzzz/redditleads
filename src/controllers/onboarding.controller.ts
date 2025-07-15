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

// OPTIMIZATION: This controller now only scrapes text, it does not call the AI.
// The AI calls are moved to the frontend or a later step to avoid costs for non-committed users.
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

        // We now generate the description and keywords on the frontend to give the user control
        // and avoid unnecessary backend API costs. However, you can still do it here if you
        // add logic to check if the user is on a paid plan.
        // For maximum cost saving, we let the frontend handle the initial generation.
        const [keywords, description] = await Promise.all([
            generateKeywords(scrapedText),
            generateDescription(scrapedText)
        ]);

        res.status(200).json({
            websiteUrl,
            generatedKeywords: keywords,
            generatedDescription: description
        });
     
    } catch (error) {
        next(error);
    }
};


export const completeOnboarding: RequestHandler = async (req, res, next) => {
    const { userId, websiteUrl, generatedKeywords, generatedDescription, competitors } = req.body;

    if (!userId || !websiteUrl || !generatedKeywords || !generatedDescription) {
          res.status(400).json({ message: 'All onboarding data is required.' });
          return;
    }

    try {
        console.log(`[1/3] Entering completeOnboarding for user: ${userId}`);

        // OPTIMIZATION: The only AI call made during onboarding is now here, after user confirmation.
        console.log('[2/3] Calling AI to generate subreddit suggestions...');
        const subreddits = await generateSubredditSuggestions(generatedDescription);
        
        console.log(`[3/3] AI call successful. Received ${subreddits.length} subreddits.`);

        const newCampaign = await prisma.campaign.create({
            data: {
                userId,
                analyzedUrl: websiteUrl,
                generatedKeywords,
                generatedDescription,
                targetSubreddits: subreddits,
                competitors: competitors || [],
            }
        });

        res.status(201).json(newCampaign);

    } catch (error) {
        console.error("!!! ERROR in completeOnboarding:", error);
        next(error);
    }
};