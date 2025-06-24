import { RequestHandler } from 'express';
import { 
    scrapeWebsiteTextSimple, 
    scrapeWebsiteTextAdvanced 
} from '../services/scraper.service';
import { generateKeywords, generateDescription } from '../services/ai.service';
import { PrismaClient } from '../../generated/prisma';
 
 
const MIN_CONTENT_LENGTH = 300;

const prisma = new PrismaClient();
 
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


export const completeOnboarding: RequestHandler = async (req, res, next) => {
    // In a real app, userId would come from auth middleware (e.g., req.user.id)
    const { userId, websiteUrl, generatedKeywords, generatedDescription } = req.body;

    if (!userId || !websiteUrl || !generatedKeywords || !generatedDescription) {
         res.status(400).json({ message: 'All onboarding data is required.' });
         return;
    }

    try {
        // Check if a campaign for this user and URL already exists to avoid duplicates
        const existingCampaign = await prisma.campaign.findFirst({
            where: { userId, analyzedUrl: websiteUrl }
        });

        if (existingCampaign) {
             res.status(409).json({ message: 'Campaign for this website already exists.' });
             return;
        }

        const newCampaign = await prisma.campaign.create({
            data: {
                userId,
                analyzedUrl: websiteUrl,
                generatedKeywords,
                generatedDescription,
            }
        });

        res.status(201).json(newCampaign);
    } catch (error) {
        next(error);
    }
};