import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { extractBusinessDNA } from '../services/ai.service';
import { scrapeAndProcessWebsite } from '../utils/scraping';
import { dodoPaymentsService } from '../services/dodo-payments.service';

const MIN_CONTENT_LENGTH = 300;
const prisma = new PrismaClient();

export const completeOnboarding: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const {
        websiteUrl,
        businessDNA,
    } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }
    
    if (!businessDNA || !businessDNA.businessName) {
        return res.status(400).json({ message: 'Business DNA is required to complete onboarding.' });
    }

    try {
        console.log(`[Onboarding] Completing for user: ${userId}`);

        // Check if user exists, create if not (fallback for webhook issues)
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.log(`[Onboarding] User ${userId} not found in database, creating user...`);
            
            // Get user info from Clerk (we'll create a basic user record)
            try {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: `user-${userId}@placeholder.local`, // Unique placeholder - will be updated when webhook fires
                        firstName: '',
                        lastName: '',
                        subscriptionStatus: 'inactive',
                        plan: 'basic',
                    },
                });
                console.log(`[Onboarding] Created user ${userId} with basic (free) plan`);
            } catch (createError) {
                console.error(`[Onboarding] Failed to create user ${userId}:`, createError);
                res.status(500).json({ message: 'Failed to create user account.' });
                return;
            }
        }

        // Check project limits before creating a new project
        const canCreateProject = await dodoPaymentsService.checkPlanLimits(userId, 'projects');
        if (!canCreateProject) {
            console.log(`[Onboarding] User ${userId} has reached project limit for their plan`);
            return res.status(403).json({ 
                message: 'Project limit reached. Please upgrade your plan to create more projects.',
                requiresUpgrade: true,
                limitType: 'projects'
            });
        }

        // For testing purposes, make Reddit connection optional
        // if (!user.redditRefreshToken) {
        //     res.status(403).json({ 
        //         message: 'Reddit account not connected. Please connect your Reddit account first.',
        //         requiresRedditAuth: true 
        //     });
        //     return;
        // }
        
        if (!user.redditRefreshToken) {
            console.log(`[Onboarding] User ${userId} doesn't have Reddit connected, proceeding without Reddit integration`);
        }

        // Ensure subreddits are in the correct format (remove 'r/')
        const subredditArray = Array.isArray(businessDNA.suggestedSubreddits)
            ? businessDNA.suggestedSubreddits.map((sub: string) => sub.replace(/^r\//, ''))
            : [];
            
        console.log(`[Onboarding] Creating project for user ${userId} with ${subredditArray.length} subreddits.`);
        console.log(`[Onboarding] Business DNA extracted:`, JSON.stringify(businessDNA, null, 2));
        console.log(`[Onboarding] Business Name: "${businessDNA.businessName}"`);

        // 🚀 NEW: Create project directly from the provided data
        const newCampaign = await prisma.project.create({
            data: {
                userId,
                analyzedUrl: websiteUrl,
                businessDNA: businessDNA as any, // Save the entire DNA object
                generatedKeywords: businessDNA.naturalLanguageVocabulary.solutionKeywords || [],
                generatedDescription: `${businessDNA.oneLiner}\n\n**Core Problem:**\n${businessDNA.coreProblem}`,
                targetSubreddits: subredditArray,
                competitors: businessDNA.naturalLanguageVocabulary.competitors || [],
                isActive: true,
                name: businessDNA.businessName || `Campaign for ${websiteUrl}`
            }
        });

        console.log(`[Onboarding] Campaign created: ${newCampaign.id}`);

        // The rest of the lead discovery logic is now triggered MANUALLY from the frontend
        // after the project is created. This makes the onboarding flow faster and more reliable.
        
        res.status(201).json({
            message: 'Campaign created successfully!',
            projectId: newCampaign.id
        });

    } catch (error) {
        console.error(`[Onboarding] Error completing onboarding for user ${userId}:`, error);
        next(error);
    }
};

export const quickSetup: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { industry, description, keywords, targetSubreddits } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        // Check project limits before creating a new project
        const canCreateProject = await dodoPaymentsService.checkPlanLimits(userId, 'projects');
        if (!canCreateProject) {
            console.log(`[Quick Setup] User ${userId} has reached project limit for their plan`);
            return res.status(403).json({ 
                message: 'Project limit reached. Please upgrade your plan to create more projects.',
                requiresUpgrade: true,
                limitType: 'projects'
            });
        }

        const project = await prisma.project.create({
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

        res.json({ success: true, projectId: project.id });
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
        return res.status(400).json({ message: 'Website URL is required.' });
    }

    try {
        console.log(`[Website Analysis] Starting analysis for: ${websiteUrl}`);
        
        // Use a single function to get all website text
        const scrapedText = await scrapeAndProcessWebsite(websiteUrl);

        console.log(`[Website Analysis] Starting Business DNA extraction...`);

        // 🚀 NEW APPROACH: One single call to extract all business intelligence
        const businessDNA = await extractBusinessDNA(scrapedText);

        console.log(`[Website Analysis] ✅ Business DNA extraction complete.`);

        // The old analysisResult structure is maintained for frontend compatibility for now
        res.status(200).json({
            websiteUrl,
            generatedKeywords: businessDNA.naturalLanguageVocabulary.solutionKeywords,
            generatedDescription: `${businessDNA.oneLiner}\n\n**Core Problem:**\n${businessDNA.coreProblem}\n\n**Solution:**\n${businessDNA.solutionValue}`,
            targetSubreddits: businessDNA.suggestedSubreddits,
            // We can pass the full DNA object to the frontend if needed later
            businessDNA: businessDNA 
        });

    } catch (error) {
        console.error(`[Website Analysis] Error during analysis for ${websiteUrl}:`, error);
        next(error);
    }
}; 