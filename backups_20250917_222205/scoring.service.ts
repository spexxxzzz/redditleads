interface LeadData {
    createdAt: number;
    numComments: number;
    upvoteRatio: number;
    intent?: string;
    sentiment?: string;
    type?: string;
    isGoogleRanked?: boolean;
    authorKarma?: number;
}

const sentimentMultiplier: { [key: string]: number } = {
    negative: 2.0,
    neutral: 0.9,
    positive: 0.7,
    default: 1.0,
};

const intentWeights: { [key: string]: number } = {
    'solution_seeking': 1.5,
    'pain_point': 1.4,
    'brand_comparison': 1.2,
    'general_discussion': 0.8,
    'default': 1.0,
};

const WEIGHTS = {
    RECENCY: 0.4,
    COMMENTS: 0.35,
    UPVOTES: 0.25,
};
const RECENCY_HALF_LIFE_HOURS = 24;

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

    if (lead.type === 'COMPETITOR_MENTION' && lead.sentiment) {
        const multiplier = sentimentMultiplier[lead.sentiment] || sentimentMultiplier.default;
        finalScore *= multiplier;
    } else if (lead.type === 'DIRECT_LEAD' && lead.intent) {
        const multiplier = intentWeights[lead.intent] || intentWeights.default;
        finalScore *= multiplier;
    }
    if (lead.isGoogleRanked) {
        finalScore *= 1.5;
    }
    
    if (lead.authorKarma && lead.authorKarma > 1000) {
        finalScore *= 1.05; // 5% boost for high karma
    }

    return Math.min(Math.round(finalScore * 100), 100);
};