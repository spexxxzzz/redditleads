import { RequestHandler } from 'express';
import { 
    scrapeWebsiteTextSimple, 
    scrapeWebsiteTextAdvanced 
} from '../services/scraper.service';
import { generateKeywords, generateDescription, generateSubredditSuggestions } from '../services/ai.service';
import { PrismaClient } from '@prisma/client';

console.log("--- [CONTROLLER LOG] Top of onboarding.controller.ts reached.");

const MIN_CONTENT_LENGTH = 300;

const prisma = new PrismaClient();
console.log("--- [CONTROLLER LOG] PrismaClient instantiated in onboarding.controller.ts.");

export const analyzeWebsite: RequestHandler = async (req, res, next) => {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
          res.status(400).json({ message: 'Website URL is required.' });
          return; // This satisfies the RequestHandler type (returns void)
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

        // Immediately return the generated data. Do NOT save.
        res.status(200).json({
            websiteUrl,
            generatedKeywords: keywords,
            generatedDescription: description
        });
     
    } catch (error) {
        next(error);
    }
};

// ...existing imports...

// ... existing analyzeWebsite function ...

export const completeOnboarding: RequestHandler = async (req, res, next) => {
    const { userId, websiteUrl, generatedKeywords, generatedDescription } = req.body;

    if (!userId || !websiteUrl || !generatedKeywords || !generatedDescription) {
         res.status(400).json({ message: 'All onboarding data is required.' });
         return;
    }

    try {
        // --- DEBUG LOG 1 ---
        console.log(`[1/4] Entering completeOnboarding for user: ${userId}`);

        // --- DEBUG LOG 2 ---
        console.log('[2/4] Calling AI to generate subreddit suggestions...');
        const subreddits = await generateSubredditSuggestions(generatedDescription);
        
        // --- DEBUG LOG 3 ---
        console.log(`[3/4] AI call successful. Received ${subreddits.length} subreddits.`);

        const newCampaign = await prisma.campaign.create({
            data: {
                userId,
                analyzedUrl: websiteUrl,
                generatedKeywords,
                generatedDescription,
                targetSubreddits: subreddits,
            }
        });

        // --- DEBUG LOG 4 ---
        console.log(`[4/4] Campaign ${newCampaign.id} saved. Sending response.`);
        res.status(201).json(newCampaign);

    } catch (error) {
        // --- CRITICAL: Log the actual error ---
        console.error("!!! ERROR in completeOnboarding:", error);
        next(error); // Pass the error to the default error handler
    }
};