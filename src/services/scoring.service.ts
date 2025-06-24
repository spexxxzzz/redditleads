// Define the structure of the lead data we expect for scoring
interface LeadData {
    createdAt: number;      // Unix timestamp (seconds)
    numComments: number;
    upvoteRatio: number;
    // THIS IS THE KEY: The intent is optional.
    // Pro users will have it, Free users will not.
    intent?: string;        
}

// --- LAYER 1 CONFIGURATION (FOR FREE TIER) ---
const WEIGHTS = {
    RECENCY: 0.4,
    COMMENTS: 0.35,
    UPVOTES: 0.25,
};
const RECENCY_HALF_LIFE_HOURS = 24;

// --- LAYER 2 CONFIGURATION (FOR PRO TIER) ---
// These weights act as a MULTIPLIER for Pro users based on the lead's intent.
const intentWeights: { [key: string]: number } = {
    'solution_seeking': 1.5,   // 50% score boost
    'pain_point': 1.4,         // 40% score boost
    'brand_comparison': 1.2,   // 20% score boost
    'general_discussion': 0.8, // 20% score reduction
    'default': 1.0,
};

/**
 * Calculates a lead's "Opportunity Score".
 * - If `intent` is NOT provided, it returns the basic "Layer 1" score.
 * - If `intent` IS provided, it returns the advanced "Layer 2" score.
 * @param lead The lead object. May or may not have an `intent`.
 * @returns A score from 0 to 100.
 */
export const calculateLeadScore = (lead: LeadData): number => {
    // 1. Calculate the "Layer 1" base score from engagement, which everyone gets.
    const hoursAgo = (Date.now() / 1000 - lead.createdAt) / 3600;
    const recencyScore = Math.exp(-0.693 * hoursAgo / RECENCY_HALF_LIFE_HOURS);
    const commentScore = Math.log1p(lead.numComments) / Math.log1p(100);
    const upvoteScore = lead.upvoteRatio;

    const baseScore = 
        (recencyScore * WEIGHTS.RECENCY) +
        (commentScore * WEIGHTS.COMMENTS) +
        (upvoteScore * WEIGHTS.UPVOTES);

    // 2. Check if this is a "Layer 2" calculation.
    // If an intent is provided (for a Pro user), apply the AI-powered multiplier.
    if (lead.intent) {
        const intentMultiplier = intentWeights[lead.intent] || intentWeights['default'];
        const finalScore = baseScore * intentMultiplier;
        return Math.min(Math.round(finalScore * 100), 100);
    }

    // 3. If no intent was provided, this is a "Layer 1" calculation.
    // Return the basic score.
    return Math.min(Math.round(baseScore * 100), 100);
};