import { User } from '@prisma/client';
import pLimit from 'p-limit';
import { analyzeLeadIntent } from './ai.service';
import { calculateLeadScore } from './scoring.service';

// Define the shape of the raw lead data coming from the Reddit service
interface RawLead {
    id: string;
    title: string;
    body: string | null;
    createdAt: number;
    numComments: number;
    upvoteRatio: number;
    [key: string]: any; // Allow other properties
}

// Define the shape of the final, enriched lead
interface EnrichedLead extends RawLead {
    opportunityScore: number;
    intent: string;
}

/**
 * Takes raw leads and a user, and performs tier-aware, rate-limited enrichment.
 * This is the single source of truth for applying plan-based logic and technical constraints.
 * @param rawLeads An array of raw leads from a source like Reddit.
 * @param user The user object, containing their plan and subscription status.
 * @returns A promise that resolves to an array of fully enriched leads.
 */
export const enrichLeadsForUser = async (rawLeads: RawLead[], user: User): Promise<EnrichedLead[]> => {
    // --- TIER-AWARE PROCESSING ---
    if (user.plan === 'pro' && user.subscriptionStatus === 'active') {
        // PRO TIER: Perform full AI analysis with rate limiting.
        
        // The limiter is defined here, where it's actually used for batch processing.
        const limiter = pLimit(5); // Concurrency of 5 to stay safely under the 10 RPM limit.

        const enrichmentPromises = rawLeads.map(lead => {
            // Wrap the AI call in the limiter. It will manage the queue automatically.
            return limiter(async () => {
                console.log(`  -> [Pro] Analyzing intent for lead: "${lead.title.substring(0, 30)}..."`);
                const intent = await analyzeLeadIntent(lead.title, lead.body);
                const opportunityScore = calculateLeadScore({ ...lead, intent });
                return { ...lead, intent, opportunityScore };
            });
        });
        return Promise.all(enrichmentPromises);

    } else {
        // FREE TIER: Perform basic scoring only. No AI calls, no limiter needed.
        return rawLeads.map(lead => {
            const opportunityScore = calculateLeadScore(lead); // No intent is passed
            return { ...lead, opportunityScore, intent: 'general_discussion' };
        });
    }
};