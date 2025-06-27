// Define the structure of the lead data we expect for scoring
interface LeadData {
    createdAt: number;      // Unix timestamp (seconds)
    numComments: number;
    upvoteRatio: number;
    // These fields are optional as they depend on the lead type and user plan.
    intent?: string;        
    sentiment?: string;
    type?: string;
}

// --- NEW: Multiplier for Opportunity Hijacking ---
// FIX: Add an index signature to allow indexing with a string variable.
const sentimentMultiplier: { [key: string]: number } = {
    negative: 2.0, // 100% score boost for negative competitor mentions!
    neutral: 0.9,  // Slightly deprioritize neutral mentions
    positive: 0.7, // Deprioritize positive mentions
    default: 1.0,
};

// --- LAYER 1 CONFIGURATION (FOR ALL LEADS) ---
const WEIGHTS = {
    RECENCY: 0.4,
    COMMENTS: 0.35,
    UPVOTES: 0.25,
};
const RECENCY_HALF_LIFE_HOURS = 24;

// --- LAYER 2 CONFIGURATION (FOR PRO TIER & DIRECT LEADS) ---
// These weights act as a MULTIPLIER for Pro users based on the lead's intent.
// FIX: Add an index signature here as well for the same reason.
const intentWeights: { [key: string]: number } = {
    'solution_seeking': 1.5,   // 50% score boost
    'pain_point': 1.4,         // 40% score boost
    'brand_comparison': 1.2,   // 20% score boost
    'general_discussion': 0.8, // 20% score reduction
    'default': 1.0,
};

/**
 * Calculates a lead's "Opportunity Score" based on its type and metadata.
 * This function applies different scoring logic for direct leads vs. competitor mentions.
 * @param lead The lead data object.
 * @returns A score from 0 to 100.
 */
export const calculateLeadScore = (lead: LeadData): number => {
    const hoursAgo = (Date.now() / 1000 - lead.createdAt) / 3600;
    const recencyScore = Math.exp(-0.693 * Math.max(0, hoursAgo) / RECENCY_HALF_LIFE_HOURS);
    const commentScore = Math.log1p(lead.numComments) / Math.log1p(100);
    const upvoteScore = lead.upvoteRatio;

    const baseScore = 
        (recencyScore * WEIGHTS.RECENCY) +
        (commentScore * WEIGHTS.COMMENTS) +
        (upvoteScore * WEIGHTS.UPVOTES);

    let finalScore = baseScore;

    // Apply multipliers based on lead type
    if (lead.type === 'COMPETITOR_MENTION' && lead.sentiment) {
        // The error was here. Now TypeScript knows it's safe to use lead.sentiment as an index.
        const multiplier = sentimentMultiplier[lead.sentiment] || sentimentMultiplier.default;
        finalScore *= multiplier;
    } else if (lead.type === 'DIRECT_LEAD' && lead.intent) {
        // And the same error was here for lead.intent.
        const multiplier = intentWeights[lead.intent] || intentWeights.default;
        finalScore *= multiplier;
    }

    // Ensure the final score is a whole number between 0 and 100.
    return Math.min(Math.round(finalScore * 100), 100);
};