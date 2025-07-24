import { User } from '@prisma/client';
import { analyzeLeadIntent } from './ai.service';
import { calculateLeadScore } from './scoring.service';
import { checkGoogleRanking } from "./serp.sevice";
import { RawLead } from "../types/reddit.types";

export interface EnrichedLead extends RawLead {
    intent?: string;
    opportunityScore: number;
    isGoogleRanked?: boolean;
    sentiment?: string;
}

async function processInChunks<T, R>(items: T[], processor: (item: T) => Promise<R>, chunkSize: number, delay: number): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(processor);
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
        if (i + chunkSize < items.length) {
            console.log(`  -> Processed chunk ${Math.floor(i / chunkSize) + 1}. Waiting ${delay / 1000}s before next chunk to respect rate limits.`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return results;
}

export const enrichLeadsForUser = async (rawLeads: RawLead[], user: User): Promise<EnrichedLead[]> => {
    const processLead = async (lead: RawLead): Promise<EnrichedLead> => {
        try {
            let intent: string = 'general_discussion';
            let isGoogleRanked: boolean = false;
            
            // Starter and Pro plans get AI intent analysis
            if (user.plan === 'pro' || user.plan === 'starter') {
                console.log(`  -> [${user.plan}] AI intent analysis for lead: "${lead.title.substring(0, 30)}..."`);
                intent = await analyzeLeadIntent(lead.title, lead.body, user.id, user.plan);
            }

            // Only Pro plans get the SERP check
            if (user.plan === 'pro') {
                isGoogleRanked = await checkGoogleRanking(lead.title, lead.url);
            }

            const opportunityScore = calculateLeadScore({ ...lead, intent, isGoogleRanked });

            return {
                ...lead,
                intent,
                opportunityScore,
                isGoogleRanked
            };

        } catch (error) {
            // Graceful fallback if any API call fails (e.g., quota exceeded)
            console.error(`❌ Enrichment failed for lead "${lead.title.substring(0, 30)}...". Error: ${(error as Error).message}. Using basic scoring.`);
            
            const opportunityScore = calculateBasicLeadScore(lead);
            return {
                ...lead,
                intent: 'general_discussion', // Default intent on failure
                opportunityScore,
                isGoogleRanked: false
            };
        }
    };

    const leadLimit = getUserLeadLimit(user.plan);
    const leadsToProcess = rawLeads.slice(0, leadLimit);
    
    return processInChunks(leadsToProcess, processLead, getChunkSize(user.plan), getDelay(user.plan));
};

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
        case 'free': return 60000; // 1 minute
        case 'starter': return 60000; // 1 minute
        case 'pro': return 45000; // 45 seconds
        default: return 60000;
    }
};

function calculateBasicLeadScore(lead: RawLead): number {
    let score = 50;
    
    const titleLower = lead.title.toLowerCase();
    if (titleLower.includes('help') || titleLower.includes('recommend') || titleLower.includes('suggest')) score += 15;
    if (titleLower.includes('best') || titleLower.includes('better') || titleLower.includes('alternative')) score += 10;
    if (titleLower.includes('problem') || titleLower.includes('issue') || titleLower.includes('struggling')) score += 20;
    
    if (lead.body) {
        const bodyLower = lead.body.toLowerCase();
        if (bodyLower.includes('looking for') || bodyLower.includes('need') || bodyLower.includes('want')) score += 15;
        if (bodyLower.includes('budget') || bodyLower.includes('price') || bodyLower.includes('cost')) score += 10;
    }
    
    if (lead.numComments && lead.numComments > 10) score += 5;
    if (lead.upvoteRatio && lead.upvoteRatio > 0.8) score += 5;
    
    if (lead.authorKarma && lead.authorKarma > 1000) {
        score += 5;
    }
    
    return Math.min(Math.max(score, 0), 100);
}
