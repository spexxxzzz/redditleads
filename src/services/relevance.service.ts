import { RawLead } from './reddit.service';

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
    
    // 🎯 INTENT SIGNALS (More generous scoring)
    const solutionSeekingSignals = [
        'looking for', 'need help', 'recommendations', 'recommend', 'suggest', 'advice',
        'best tool', 'best software', 'alternatives', 'what should i use', 'which is better',
        'help me find', 'anyone know', 'suggestions for', 'how to', 'thoughts on',
        'experience with', 'opinions on', 'tried', 'using', 'review'
    ];
    
    const painPointSignals = [
        'struggling with', 'problem with', 'issue with', 'frustrated',
        'not working', 'broken', 'terrible', 'hate using', 'fed up',
        'difficult', 'hard to', 'can\'t figure out', 'having trouble',
        'slow', 'expensive', 'complicated', 'confusing'
    ];
    
    const buyingSignals = [
        'budget', 'pricing', 'cost', 'price', 'expensive', 'cheap', 'affordable',
        'worth it', 'pay for', 'subscription', 'free trial', 'demo',
        'purchase', 'buy', 'invest in', 'spend on', 'upgrade', 'switch to'
    ];

    // Check for solution-seeking intent (reduced threshold)
    const foundSolutionSignals = solutionSeekingSignals.filter(signal => 
        combinedText.includes(signal)
    );
    if (foundSolutionSignals.length > 0) {
        score += 25; // Reduced from 40
        reasons.push(`Solution-seeking: ${foundSolutionSignals.slice(0, 2).join(', ')}`);
    }

    // Check for pain point mentions (reduced threshold)  
    const foundPainSignals = painPointSignals.filter(signal => 
        combinedText.includes(signal)
    );
    if (foundPainSignals.length > 0) {
        score += 20; // Reduced from 35
        reasons.push(`Pain points: ${foundPainSignals.slice(0, 2).join(', ')}`);
    }

    // Check for buying intent
    const foundBuyingSignals = buyingSignals.filter(signal => 
        combinedText.includes(signal)
    );
    if (foundBuyingSignals.length > 0) {
        score += 20; // Reduced from 25
        reasons.push(`Buying intent: ${foundBuyingSignals.slice(0, 2).join(', ')}`);
    }

    // 🎯 KEYWORD RELEVANCE (More generous)
    const exactKeywordMatches = businessKeywords.filter(keyword =>
        combinedText.includes(keyword.toLowerCase())
    );
    if (exactKeywordMatches.length > 0) {
        score += exactKeywordMatches.length * 10; // Reduced from 15
        reasons.push(`Keyword matches: ${exactKeywordMatches.slice(0, 3).join(', ')}`);
    }

    // 🎯 PARTIAL KEYWORD MATCHES (NEW - more permissive)
    const partialMatches = businessKeywords.filter(keyword => {
        const keywordWords = keyword.toLowerCase().split(' ');
        return keywordWords.some(word => word.length > 3 && combinedText.includes(word));
    });
    if (partialMatches.length > 0) {
        score += partialMatches.length * 5;
        reasons.push(`Partial keyword matches: ${partialMatches.slice(0, 2).join(', ')}`);
    }

    // 🎯 QUESTION INDICATORS (NEW - questions are usually high-intent)
    const questionIndicators = ['?', 'how do', 'what is', 'which', 'where can', 'who knows'];
    const hasQuestions = questionIndicators.some(indicator => combinedText.includes(indicator));
    if (hasQuestions) {
        score += 15;
        reasons.push('Contains question (high intent)');
    }

    // 🎯 ENGAGEMENT QUALITY (More lenient)
    if (lead.numComments >= 3) { // Reduced from 5
        score += 8; // Reduced from 10
        reasons.push(`Active discussion (${lead.numComments} comments)`);
    }

    if (lead.upvoteRatio >= 0.7) { // Reduced from 0.8
        score += 5;
        reasons.push(`Good engagement (${Math.round(lead.upvoteRatio * 100)}% upvoted)`);
    }

    // 🎯 CONTENT QUALITY CHECKS (More lenient)
    const minContentLength = 30; // Reduced from 50
    if ((lead.body || '').length < minContentLength && lead.title.length < 15) { // Reduced from 20
        score -= 10; // Reduced penalty from -20
        reasons.push('Very short content');
    }

    // Check for spam indicators (more lenient)
    const spamIndicators = [
        'dm me', 'check my profile', 'link in bio', 'visit my website', 
        'upvote this', 'follow me', 'subscribe to my'
    ];
    const foundSpamSignals = spamIndicators.filter(spam => 
        combinedText.includes(spam)
    );
    if (foundSpamSignals.length > 0) {
        score -= 20; // Reduced penalty from -30
        reasons.push(`Possible spam: ${foundSpamSignals.slice(0, 2).join(', ')}`);
    }

    // 🎯 SUBREDDIT QUALITY BONUS (More categories)
    const businessSubreddits = [
        'entrepreneur', 'startups', 'smallbusiness', 'marketing', 'saas',
        'webdev', 'programming', 'business', 'investing', 'personalfinance',
        'freelance', 'digitalnomad', 'ecommerce', 'productivity', 'consulting',
        'agency', 'customerservice', 'sales'
    ];
    
    if (businessSubreddits.includes(lead.subreddit.toLowerCase())) {
        score += 8; // Reduced from 10
        reasons.push(`Business subreddit: r/${lead.subreddit}`);
    }

    // 🎯 GENERAL DISCUSSION BONUS (NEW - for broader reach)
    const generalDiscussionSubs = [
        'askreddit', 'nostupidquestions', 'explainlikeimfive', 'advice',
        'findareddit', 'tipofmytongue', 'helpmefind'
    ];
    if (generalDiscussionSubs.includes(lead.subreddit.toLowerCase())) {
        score += 3;
        reasons.push('General discussion subreddit');
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        reasons,
        isRelevant: score >= 25 // MUCH LOWER threshold from 45 to 25
    };
};