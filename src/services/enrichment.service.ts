import { User } from '@prisma/client';
import { analyzeLeadIntent } from './ai.service';
import { calculateLeadScore } from './scoring.service';
// CORRECTED: The function name is now isRankedOnGoogle
import { isRankedOnGoogle } from "./serp.sevice";
import { RawLead } from "../types/reddit.types";

export interface EnrichedLead extends RawLead {
    intent?: string;
    opportunityScore: number;
    isGoogleRanked?: boolean;
    sentiment?: string;
}

// Updated processInChunks to handle a maximum number of chunks
async function processInChunks<T, R>(items: T[], processor: (item: T) => Promise<R>, chunkSize: number, delay: number, maxChunks?: number): Promise<R[]> {
    const results: R[] = [];
    const totalChunks = Math.ceil(items.length / chunkSize);
    // Determine the number of chunks to iterate over, respecting the maxChunks limit
    const chunksToProcess = maxChunks !== undefined ? Math.min(totalChunks, maxChunks) : totalChunks;

    if (maxChunks !== undefined && totalChunks > maxChunks) {
        console.log(`[Chunk Processing] Limiting processing to ${maxChunks} chunks out of ${totalChunks} total.`);
    }

    for (let i = 0; i < chunksToProcess; i++) {
        const startIndex = i * chunkSize;
        const endIndex = startIndex + chunkSize;
        const chunk = items.slice(startIndex, endIndex);

        const chunkPromises = chunk.map(processor);
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);

        // Delay if it's not the last chunk to be processed
        if (i < chunksToProcess - 1) {
            console.log(`  -> Processed chunk ${i + 1}/${chunksToProcess}. Waiting ${delay / 1000}s before next chunk.`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    console.log(`[Chunk Processing] Finished processing ${chunksToProcess} chunks.`);
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
                // CORRECTED: The function call now matches the imported name
                isGoogleRanked = await isRankedOnGoogle(lead.url, lead.title);
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
    const chunkSize = getChunkSize(user.plan);
    const delay = getDelay(user.plan);
    const MAX_CHUNKS = 6; // Hard limit on the number of chunks to process

    console.log(`[Enrichment] Starting enrichment for ${leadsToProcess.length} leads, with a hard limit of ${MAX_CHUNKS} chunks.`);
    // Pass the maxChunks limit to the processing function
    return processInChunks(leadsToProcess, processLead, chunkSize, delay, MAX_CHUNKS);
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
        case 'starter': return 5;
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
