import { User } from '@prisma/client';
import { analyzeLeadIntent } from './ai.service';
import { calculateLeadScore } from './scoring.service';
import { checkGoogleRanking } from "../services/serp.sevice"
import { RawLead } from "../types/reddit.types";


interface EnrichedLead  extends RawLead{
    intent?: string;
    opportunityScore: number;
    isGoogleRanked?: boolean;
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

export const enrichLeadsForUser = async (rawLeads: RawLead[], user: User): Promise<EnrichedLead[]> => {
    const processLead = async (lead: RawLead): Promise<EnrichedLead> => {
        if (user.plan === 'pro' && user.subscriptionStatus === 'active') {
            console.log(`  -> [Pro] Analyzing intent for lead: "${lead.title.substring(0, 30)}..."`);
            const [intent, isGoogleRanked] = await Promise.all([
                analyzeLeadIntent(lead.title, lead.body),
                checkGoogleRanking(lead.title, lead.url)
            ]);
            const opportunityScore = calculateLeadScore({ ...lead, intent, isGoogleRanked });
            return { ...lead, intent, opportunityScore, isGoogleRanked };
        } else {
            console.log(`  -> [Basic] Scoring lead: "${lead.title.substring(0, 30)}..."`);
            const opportunityScore = calculateLeadScore(lead);
            return { ...lead, opportunityScore };
        }
    };

    // --- Process leads in chunks of 10, with a 60-second delay between chunks ---
    // This ensures we stay under the 15 requests/minute Gemini free tier limit.
    return processInChunks(rawLeads, processLead, 10, 60000);
};