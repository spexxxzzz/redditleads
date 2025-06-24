import { User } from '@prisma/client';
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
 * Takes raw leads and a user, and performs tier-aware enrichment.
 * This is the single source of truth for applying plan-based logic.
 * @param rawLeads An array of raw leads from a source like Reddit.
 * @param user The user object, containing their plan and subscription status.
 * @returns A promise that resolves to an array of fully enriched leads.
 */
export const enrichLeadsForUser = async (rawLeads: RawLead[], user: User): Promise<EnrichedLead[]> => {
    // --- TIER-AWARE PROCESSING ---
    if (user.plan === 'pro' && user.subscriptionStatus === 'active') {
        // PRO TIER: Perform full AI analysis and get advanced scores
        return Promise.all(rawLeads.map(async (lead) => {
            const intent = await analyzeLeadIntent(lead.title, lead.body);
            const opportunityScore = calculateLeadScore({ ...lead, intent });
            return { ...lead, intent, opportunityScore };
        }));
    } else {
        // FREE TIER: Perform basic scoring only, no parallel processing needed
        return rawLeads.map(lead => {
            const opportunityScore = calculateLeadScore(lead); // No intent is passed
            return { ...lead, opportunityScore, intent: 'general_discussion' };
        });
    }
};