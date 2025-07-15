import { User } from '@prisma/client';
import { analyzeLeadIntent } from './ai.service';
import { calculateLeadScore } from './scoring.service';
import { checkGoogleRanking } from "../services/serp.sevice"
import { RawLead } from "../types/reddit.types";


export interface EnrichedLead  extends RawLead{
    intent?: string;
    opportunityScore: number;
    isGoogleRanked?: boolean;
    sentiment?: string; // Optional sentiment analysis result
}

// --- NEW: Helper function to process leads in chunks ---
async function processInChunks<T, R>(items: T[], processor: (item: T) => Promise<R>, chunkSize: number, delay: number): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(processor);
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
        if (i + chunkSize < items.length) {
            console.log(`  -> Processed chunk ${i / chunkSize + 1}. Waiting ${delay / 1000}s before next chunk to respect rate limits.`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return results;
}

// Update the enrichLeadsForUser function (around line 25):

export const enrichLeadsForUser = async (rawLeads: RawLead[], user: User): Promise<EnrichedLead[]> => {
    const processLead = async (lead: RawLead): Promise<EnrichedLead> => {
        if (user.plan === 'free') {
            console.log(`  -> [Free] Basic scoring for lead: "${lead.title.substring(0, 30)}..."`);
            const opportunityScore = calculateBasicLeadScore(lead);
            return { 
                ...lead, 
                intent: 'general_discussion',
                opportunityScore,
                isGoogleRanked: false 
            };
        }
        
        if (user.plan === 'starter') {
            console.log(`  -> [Starter] AI intent analysis for lead: "${lead.title.substring(0, 30)}..."`);
            const intent = await analyzeLeadIntent(lead.title, lead.body, user.id); // Pass user.id
            const opportunityScore = calculateLeadScore({ ...lead, intent });
            return { 
                ...lead, 
                intent, 
                opportunityScore,
                isGoogleRanked: false 
            };
        }
        
        if (user.plan === 'pro') {
            console.log(`  -> [Pro] Full AI analysis for lead: "${lead.title.substring(0, 30)}..."`);
            const [intent, isGoogleRanked] = await Promise.all([
                analyzeLeadIntent(lead.title, lead.body, user.id), // Pass user.id
                checkGoogleRanking(lead.title, lead.url)
            ]);
            const opportunityScore = calculateLeadScore({ ...lead, intent, isGoogleRanked });
            return { ...lead, intent, opportunityScore, isGoogleRanked };
        }
        
        return { ...lead, opportunityScore: calculateBasicLeadScore(lead) };
    };

    const leadLimit = getUserLeadLimit(user.plan);
    const leadsToProcess = rawLeads.slice(0, leadLimit);
    
    return processInChunks(leadsToProcess, processLead, getChunkSize(user.plan), getDelay(user.plan));
};

// Helper functions for plan limits
const getUserLeadLimit = (plan: string): number => {
    switch (plan) {
        case 'free': return 25;
        case 'starter': return 200;
        case 'pro': return 1000;
        default: return 25;
    }
};

const getChunkSize = (plan: string): number => {
    switch (plan) {
        case 'free': return 5;
        case 'starter': return 8;
        case 'pro': return 15;
        default: return 5;
    }
};

const getDelay = (plan: string): number => {
    switch (plan) {
        case 'free': return 120000; // 2 minutes
        case 'starter': return 90000; // 1.5 minutes
        case 'pro': return 45000; // 45 seconds
        default: return 120000;
    }
};

// Add this function at the bottom of the file:

function calculateBasicLeadScore(lead: RawLead): number {
    let score = 50; // Base score
    
    // Title analysis (basic keyword matching)
    const titleLower = lead.title.toLowerCase();
    if (titleLower.includes('help') || titleLower.includes('recommend') || titleLower.includes('suggest')) {
        score += 15;
    }
    if (titleLower.includes('best') || titleLower.includes('better') || titleLower.includes('alternative')) {
        score += 10;
    }
    if (titleLower.includes('problem') || titleLower.includes('issue') || titleLower.includes('struggling')) {
        score += 20;
    }
    
    // Body analysis (if available)
    if (lead.body) {
        const bodyLower = lead.body.toLowerCase();
        if (bodyLower.includes('looking for') || bodyLower.includes('need') || bodyLower.includes('want')) {
            score += 15;
        }
        if (bodyLower.includes('budget') || bodyLower.includes('price') || bodyLower.includes('cost')) {
            score += 10;
        }
        if (bodyLower.includes('urgent') || bodyLower.includes('asap') || bodyLower.includes('immediately')) {
            score += 20;
        }
    }
    
    // Comment and engagement analysis
    if (lead.numComments && lead.numComments > 10) {
        score += 5;
    }
    if (lead.upvoteRatio && lead.upvoteRatio > 0.8) {
        score += 5;
    }
    

    // Author karma bonus
    //@ts-ignore
    if (lead.authorKarma && lead.authorKarma > 1000) {
        score += 5;
    }
    
    // Ensure score stays within bounds
    return Math.min(Math.max(score, 0), 100);
}