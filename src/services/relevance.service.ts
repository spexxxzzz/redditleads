import { RawLead } from "./reddit.service";

interface RelevanceScore {
    score: number;
    reasons: string[];
    isRelevant: boolean;
}

export const calculateContentRelevance = (
    lead: RawLead,
    businessKeywords: string[],
    businessDescription: string
): RelevanceScore => {
    let score = 0;
    const reasons: string[] = [];
    
    const titleLower = lead.title.toLowerCase();
    const bodyLower = (lead.body || '').toLowerCase();
    const combinedText = `${titleLower} ${bodyLower}`;
    
    // 🎯 INTENT SIGNALS (High Value)
    const solutionSeekingSignals = [
        'looking for', 'need help', 'recommendations', 'suggest', 'advice',
        'best tool', 'best software', 'alternatives', 'what should i use',
        'help me find', 'anyone know', 'suggestions for'
    ];
    
    const painPointSignals = [
        'struggling with', 'problem with', 'issue with', 'frustrated',
        'not working', 'broken', 'terrible', 'hate using', 'fed up'
    ];
    
    const buyingSignals = [
        'budget', 'pricing', 'cost', 'price', 'expensive', 'cheap',
        'worth it', 'pay for', 'subscription', 'free trial', 'demo'
    ];

    // Check for solution-seeking intent
    const foundSolutionSignals = solutionSeekingSignals.filter(signal => 
        combinedText.includes(signal)
    );
    if (foundSolutionSignals.length > 0) {
        score += 40;
        reasons.push(`Solution-seeking: ${foundSolutionSignals.join(', ')}`);
    }

    // Check for pain point mentions
    const foundPainSignals = painPointSignals.filter(signal => 
        combinedText.includes(signal)
    );
    if (foundPainSignals.length > 0) {
        score += 35;
        reasons.push(`Pain points: ${foundPainSignals.join(', ')}`);
    }

    // Check for buying intent
    const foundBuyingSignals = buyingSignals.filter(signal => 
        combinedText.includes(signal)
    );
    if (foundBuyingSignals.length > 0) {
        score += 25;
        reasons.push(`Buying intent: ${foundBuyingSignals.join(', ')}`);
    }

    // 🎯 KEYWORD RELEVANCE
    const exactKeywordMatches = businessKeywords.filter(keyword =>
        combinedText.includes(keyword.toLowerCase())
    );
    if (exactKeywordMatches.length > 0) {
        score += exactKeywordMatches.length * 15;
        reasons.push(`Keyword matches: ${exactKeywordMatches.join(', ')}`);
    }

    // 🎯 ENGAGEMENT QUALITY
    if (lead.numComments >= 5) {
        score += 10;
        reasons.push(`Active discussion (${lead.numComments} comments)`);
    }

    if (lead.upvoteRatio >= 0.8) {
        score += 5;
        reasons.push(`High engagement (${(lead.upvoteRatio * 100).toFixed(0)}% upvoted)`);
    }

    // 🎯 CONTENT QUALITY CHECKS
    const minContentLength = 50;
    if ((lead.body || '').length < minContentLength && lead.title.length < 20) {
        score -= 20;
        reasons.push('Too short/low effort content');
    }

    // Check for spam indicators
    const spamIndicators = ['dm me', 'check my profile', 'link in bio', 'visit my', 'click here'];
    const foundSpamSignals = spamIndicators.filter(spam => 
        combinedText.includes(spam)
    );
    if (foundSpamSignals.length > 0) {
        score -= 30;
        reasons.push(`Spam indicators: ${foundSpamSignals.join(', ')}`);
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        reasons,
        isRelevant: score >= 50 // Require at least 50 points to be considered relevant
    };
};