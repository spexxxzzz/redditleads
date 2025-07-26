import { RawLead } from '../types/reddit.types';

// Lists of words that help determine the context and intent of a post.
const INTENT_KEYWORDS = [
    'recommend', 'recommendation', 'advice', 'help', 'suggest', 'suggestion',
    'looking for', 'alternative', 'best', 'top', 'how to', 'choose', 'choosing',
    'compare', 'vs', 'versus', 'which is better', 'what is the best'
];

const PAIN_POINT_KEYWORDS = [
    'problem', 'issue', 'struggling', 'frustrated', 'hate', 'annoying',
    'bug', 'error', 'slow', 'difficult', 'hard to use'
];

const NEGATIVE_KEYWORDS = [
    'hiring', 'job', 'for hire', 'tutorial', 'guide', 'news', 'article',
    'giveaway', 'freebie', 'course', 'learn'
];

interface RelevanceScore {
    score: number;
    reasons: string[];
    isRelevant: boolean;
}

/**
 * Calculates a more accurate relevance score for a lead based on a variety of factors.
 * This new algorithm prioritizes title matches and specific intent keywords.
 */
export const calculateContentRelevance = (
    lead: RawLead,
    businessKeywords: string[],
    businessDescription: string // Kept for signature compatibility
): RelevanceScore => {
    let score = 0;
    const reasons: string[] = [];
    
    const title = lead.title.toLowerCase();
    const body = lead.body?.toLowerCase() || '';
    const combinedText = `${title} ${body}`;

    // 1. Strongest Signal: Campaign keywords in the title
    businessKeywords.forEach(keyword => {
        if (title.includes(keyword.toLowerCase())) {
            score += 30; // Adjusted from 35
            reasons.push(`+30 (Title contains campaign keyword: "${keyword}")`);
        }
    });

    // 2. Strong Signal: Intent keywords in the title
    INTENT_KEYWORDS.forEach(keyword => {
        if (title.includes(keyword)) {
            score += 20; // Adjusted from 25
            reasons.push(`+20 (Title contains intent keyword: "${keyword}")`);
        }
    });

    // 3. Medium Signal: Pain point keywords are present
    if (PAIN_POINT_KEYWORDS.some(keyword => combinedText.includes(keyword))) {
        score += 15; // Adjusted from 20
        reasons.push(`+15 (Contains a pain point)`);
    }

    // 4. Medium Signal: Campaign keywords in the body
    businessKeywords.forEach(keyword => {
        if (body.includes(keyword.toLowerCase())) {
            score += 15; // Increased from 10 to give more value to body content
            reasons.push(`+15 (Body contains campaign keyword: "${keyword}")`);
        }
    });

    // 5. Penalty: Negative keywords that indicate low relevance
    if (NEGATIVE_KEYWORDS.some(keyword => title.includes(keyword))) {
        score -= 30; // Adjusted from -40
        reasons.push(`-30 (Contains a negative keyword in title)`);
    }

    // 6. Bonus for engagement (indicates an active, valuable discussion)
    if (lead.numComments > 5) { // Lowered threshold from 10
        score += 5;
        reasons.push(`+5 (Good engagement: ${lead.numComments} comments)`);
    }

    // Normalize the score to be between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score));

    console.log(`[Relevance] Lead "${lead.title.substring(0,30)}..." scored ${finalScore}. Reasons: [${reasons.join(', ')}]`);

    return {
        score: finalScore,
        reasons: reasons,
        isRelevant: finalScore >= 30 // Lowered threshold from 45 to 30
    };
};
