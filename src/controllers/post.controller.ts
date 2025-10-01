import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';
import { summarizeText } from '../services/ai.service';
import { AIUsageService } from '../services/aitracking.service';

const prisma = new PrismaClient();

export const summarizeLead: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { id: leadId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    try {
        const lead = await prisma.lead.findFirst({
            where: { 
                id: leadId,
                userId: userId
            },
            include: {
                project: true // Include the project to access businessDNA
            }
        });

        if (!lead) {
              return res.status(404).json({ message: 'Lead not found or you do not have permission to access it.' });
        }

        if (!lead.project?.businessDNA) {
            return res.status(400).json({ message: 'Campaign data (Business DNA) is missing for this lead and is required for a summary.' });
        }

        if (!lead.body || lead.body.trim().length === 0) {
             return res.status(400).json({ message: 'Lead has no content to summarize.' });
        }

        console.log(`[SUMMARIZE] User ${userId} requesting summary for lead ${leadId}`);
        
        // Track AI usage for summary generation
        try {
            const aiUsageService = AIUsageService.getInstance();
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { plan: true }
            });
            
            if (!user) {
                console.log(`[SUMMARIZE] User ${userId} not found, creating user...`);
                // Create user if not found (fallback)
                await prisma.user.create({
                    data: {
                        id: userId,
                        email: `user-${userId}@placeholder.local`,
                        firstName: '',
                        lastName: '',
                        subscriptionStatus: 'inactive',
                        plan: 'basic',
                    }
                });
                console.log(`[SUMMARIZE] Created user ${userId} with basic plan`);
            }
            
            const userPlan = user?.plan || 'basic';
            console.log(`[SUMMARIZE] User plan: ${userPlan}`);
            
            const canUseAI = await aiUsageService.trackAIUsage(userId, 'summary', userPlan);
            if (!canUseAI) {
                console.log(`[SUMMARIZE] User ${userId} reached AI summary limit for plan ${userPlan}`);
                return res.status(429).json({ 
                    message: 'AI summary limit reached for your plan. Please upgrade to generate more summaries.' 
                });
            }
            
            console.log(`[SUMMARIZE] AI usage tracked successfully for user ${userId}`);
        } catch (usageError) {
            console.error(`[SUMMARIZE] Error tracking AI usage:`, usageError);
            // Continue with summary generation even if usage tracking fails
        }
        
        const summary = await summarizeText(lead.body, lead.project.businessDNA);

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: { summary },
        });

        console.log(`[SUMMARIZE] Successfully generated summary for lead ${leadId}`);
        return res.status(200).json({ summary: updatedLead.summary });

    } catch (error) {
        next(error);
    }
};