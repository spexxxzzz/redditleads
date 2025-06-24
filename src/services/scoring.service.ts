// Define the structure of the lead data we expect
interface LeadData {
    createdAt: number;
    numComments: number;
    upvoteRatio: number;
}

// --- CONFIGURATION FOR THE SCORING ALGORITHM ---
// These weights can be adjusted to fine-tune the scoring
const WEIGHTS = {
    RECENCY: 0.4,     // How much recent posts are valued
    COMMENTS: 0.35,   // How much comment volume is valued
    UPVOTES: 0.25,    // How much community approval is valued
};

// The half-life for recency scoring, in hours. A post from 24 hours ago will have half the recency score.
const RECENCY_HALF_LIFE_HOURS = 24;


/**
 * Calculates a lead's "Opportunity Score" based on multiple factors.
 * @param lead The enriched lead object from the reddit.service.
 * @returns A score from 0 to 100.
 */
export const calculateLeadScore = (lead: LeadData): number => {
    // 1. Recency Score (uses an exponential decay formula)
    const hoursAgo = (Date.now() / 1000 - lead.createdAt) / 3600;
    const recencyScore = Math.exp(-0.693 * hoursAgo / RECENCY_HALF_LIFE_HOURS); // 0.693 is ln(2)

    // 2. Comment Score (normalized)
    // We use a logarithm to prevent massive threads from dominating the score.
    // A post with 1 comment gets a score, a post with 100 gets a much higher score, but not 100x higher.
    const commentScore = Math.log1p(lead.numComments) / Math.log1p(100); // Normalizes based on a "high" comment count of 100

    // 3. Upvote Score (already a ratio from 0 to 1)
    const upvoteScore = lead.upvoteRatio;

    // Final Weighted Score
    const totalScore = 
        (recencyScore * WEIGHTS.RECENCY) +
        (commentScore * WEIGHTS.COMMENTS) +
        (upvoteScore * WEIGHTS.UPVOTES);

    // Return as a percentage, ensuring it doesn't exceed 100
    return Math.min(Math.round(totalScore * 100), 100);
};