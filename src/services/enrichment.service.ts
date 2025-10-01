import { generateContentWithFallback } from './ai.service';
import { User } from '@prisma/client';
import { RawLead, EnrichedLead } from '../types/reddit.types';
import { checkSerpRanking } from './serp.service';
import { processInChunks } from '../utils/chunkProcessor';

const getChunkSize = (plan: string): number => {
    switch (plan) {
        case 'free': return 2; // Further reduced for faster processing
        case 'starter': return 3; // Further reduced for faster processing
        case 'pro': return 4; // Further reduced for faster processing
        default: return 2;
    }
};

const getDelay = (plan: string): number => {
    switch (plan) {
        case 'free': return 25; // Further reduced delay
        case 'starter': return 25; // Further reduced delay
        case 'pro': return 25; // Further reduced delay
        default: return 25;
    }
};

interface ScoredLead extends EnrichedLead {
    relevanceScore: number;
    relevanceReasoning: string;
}

const BATCH_SEMANTIC_RELEVANCE_SCORING_PROMPT = `
=== ROLE ===
You are an expert Business Analyst. Your task is to score multiple Reddit posts' relevance to a specific business based on its "Business DNA."

=== BUSINESS DNA (CONTEXT) ===
{businessDNA}

=== REDDIT POSTS TO ANALYZE ===
{postsData}

=== MISSION ===
For each post, on a scale of 0 to 100, how closely does the post's author's problem align with the core problem this business solves? Provide a score and a brief justification for each post.

=== SCORING RUBRIC ===
- **90-100 (Perfect Match):** The author is describing the EXACT core problem the business solves. They are an ideal customer, actively seeking a solution.
- **75-89 (Hot Lead):** The author fits the Customer Profile and is either (A) explicitly stating a Core Problem the business solves, OR (B) is engaged in a deep, intellectual discussion about a Core Concept. This is a high-value conversation.
- **60-74 (Good Match):** The author is in the right target audience and is discussing challenges related to the business's domain, or is asking questions about a Core Concept. This is a potential customer who may need education.
- **45-59 (Potential Match):** The post is related to the business's domain or target audience, even if not directly discussing the core problem. Could be a warm lead with proper outreach.
- **30-44 (Weak Match):** The post is tangentially related to the business's domain but shows some interest in the general area.
- **0-29 (Irrelevant):** The post is off-topic, spam, a job post, outside the business's geographical focus, matches a negative keyword/disqualifier, OR is a general discussion thread.

=== DISCUSSION THREAD FILTER ===
**CRITICAL:** Exclude discussion threads with a score of 0-14. Discussion threads include:
- General "What do you think about..." posts
- "Discussion" or "Discussion Thread" in title
- "Let's discuss..." or "Thoughts on..." posts
- General opinion polls or surveys
- "What's your experience with..." (without specific problems)
- Meta discussions about the subreddit itself
- "Anyone else..." without specific pain points
- General advice requests without specific problems
- "How do you feel about..." posts
- Posts that are purely conversational without actionable intent

=== IMPORTANT SCORING GUIDELINES ===
- Be SELECTIVE and QUALITY-FOCUSED - prioritize true problem-solution matches
- Only give 60+ scores to posts where people are actively seeking solutions or describing specific problems
- Be conservative with 45-59 range - only for posts with clear business relevance
- Use 30-44 range sparingly - only for posts with some business domain connection
- **PRIORITY:** Focus on posts where people are actively seeking solutions, asking for help, or describing specific problems
- **AVOID:** General discussion threads, opinion polls, meta discussions, or purely conversational posts
- **QUALITY OVER QUANTITY:** It's better to have fewer high-quality leads than many mediocre ones

=== OUTPUT FORMAT ===
You MUST return ONLY a valid, raw JSON object. Do NOT wrap it in Markdown backticks.
Example:
{
  "scores": [
    {
      "postId": "abc123",
      "score": 95,
      "reasoning": "The author is struggling with manual sales data entry, which is the exact core problem SalesFlow CRM solves."
    },
    {
      "postId": "def456", 
      "score": 23,
      "reasoning": "This post is about golf equipment, completely unrelated to the business domain."
    }
  ]
}
`;

// Calculate optimal batch size based on content length
function calculateBatchSize(leads: RawLead[]): number {
    // Use 100 posts per batch for ALL post types
    // Token analysis shows we can safely handle 100 posts even for very long content
    // This maximizes performance and consistency across all scenarios
    return 100;
}

// Batch scoring function for multiple leads
async function scoreLeadsBatch(leads: RawLead[], businessDNA: any): Promise<Map<string, { score: number; reasoning: string }>> {
    const results = new Map<string, { score: number; reasoning: string }>();
    
    try {
        // Prepare posts data for the prompt
        const postsData = leads.map(lead => ({
            postId: lead.id,
            title: lead.title,
            content: lead.body || '(No content)'
        }));
        
        const prompt = BATCH_SEMANTIC_RELEVANCE_SCORING_PROMPT
            .replace('{businessDNA}', JSON.stringify(businessDNA, null, 2))
            .replace('{postsData}', JSON.stringify(postsData, null, 2));

        console.log(`🚀 [Batch AI Scoring] Starting batch scoring for ${leads.length} leads...`);
        console.log(`🚀 [Batch AI Scoring] Business: ${businessDNA.businessName || 'Unknown'}`);
        
        const response = await generateContentWithFallback(
            prompt,
            true, // Expect JSON
            `batch_relevance_score:${businessDNA.businessName}:${leads.length}_posts`
        );
        
        console.log(`✅ [Batch AI Scoring] AI response received for ${leads.length} leads`);
        
        // Parse the batch response
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanedResponse);
        
        // Process each score in the batch
        if (result.scores && Array.isArray(result.scores)) {
            result.scores.forEach((item: any) => {
                if (item.postId && item.score !== undefined) {
                    results.set(item.postId, {
                        score: item.score,
                        reasoning: item.reasoning || 'No reasoning provided.'
                    });
                }
            });
        }
        
        console.log(`✅ [Batch AI Scoring] Successfully scored ${results.size}/${leads.length} leads in batch`);
        
    } catch (error: any) {
        console.error(`❌ [Batch AI Scoring] Failed to score batch:`, error);
        
        // If batch fails, mark all leads as failed (score 0)
        leads.forEach(lead => {
            results.set(lead.id, {
                score: 0,
                reasoning: 'Batch AI scoring failed - lead filtered out to maintain quality.'
            });
        });
    }
    
    return results;
}

// Legacy single lead scoring (kept for fallback)
async function scoreLeadRelevance(lead: RawLead, businessDNA: any): Promise<{ score: number; reasoning: string }> {
    try {
        const prompt = BATCH_SEMANTIC_RELEVANCE_SCORING_PROMPT
            .replace('{businessDNA}', JSON.stringify(businessDNA, null, 2))
            .replace('{postsData}', JSON.stringify([{
                postId: lead.id,
                title: lead.title,
                content: lead.body || '(No content)'
            }], null, 2));

        try {
            console.log(`🔍 [AI Scoring] Starting AI scoring for lead: ${lead.title.substring(0, 50)}...`);
            console.log(`🔍 [AI Scoring] Calling AI service for lead ${lead.id}...`);
            
            const response = await generateContentWithFallback(
                prompt,
                true, // Expect JSON
                `relevance_score:${businessDNA.businessName}:${lead.id}`
            );
            
            console.log(`✅ [AI Scoring] AI response received for lead ${lead.id}:`, response.substring(0, 100) + '...');
            
            // More robust JSON cleaning
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanedResponse);
            
            // Handle batch response format
            if (result.scores && Array.isArray(result.scores) && result.scores.length > 0) {
                const scoreData = result.scores[0];
                return {
                    score: scoreData.score || 0,
                    reasoning: scoreData.reasoning || 'No reasoning provided.'
                };
            }
            
            // Fallback to old format
            const finalScore = result.score !== undefined ? result.score : 0;
            console.log(`✅ [AI Scoring] Lead ${lead.id} scored: ${finalScore} - ${result.reasoning || 'No reasoning provided.'}`);

            return {
                score: finalScore,
                reasoning: result.reasoning || 'No reasoning provided.'
            };
        } catch (error: any) {
            console.log(`⚠️ [Semantic Scoring] Failed to score lead ${lead.id}, using default score:`, error.message);
            console.log(`⚠️ [Semantic Scoring] Error details:`, error);
            
            // If AI fails, don't use fallback scoring - return 0 to filter out
            return {
                score: 0,
                reasoning: 'AI scoring failed - lead filtered out to maintain quality.'
            };
        }
    } catch (error: any) {
        console.error(`[Semantic Scoring] Failed to score lead ${lead.id}:`, error);
        
        // If AI fails for any reason, filter out the lead to maintain quality
        console.log(`[Semantic Scoring] AI scoring failed for lead ${lead.id}, filtering out to maintain quality`);
        return { score: 0, reasoning: 'AI scoring failed - lead filtered out to maintain quality.' };
    }
}

function fallbackScoring(lead: RawLead, businessDNA: any): { score: number; reasoning: string } {
    const title = lead.title.toLowerCase();
    const body = (lead.body || '').toLowerCase();
    const content = `${title} ${body}`;
    
    let score = 0;
    const reasons: string[] = [];
    
    // Check for business name mentions
    if (businessDNA.businessName) {
        const businessName = businessDNA.businessName.toLowerCase();
        if (content.includes(businessName)) {
            score += 20;
            reasons.push(`Mentions business name: ${businessDNA.businessName}`);
        }
    }
    
    // Check for core problem keywords
    if (businessDNA.coreProblem && typeof businessDNA.coreProblem === 'string') {
        const problemKeywords = businessDNA.coreProblem.toLowerCase().split(/\s+/);
        const problemMatches = problemKeywords.filter((keyword: string) => 
            keyword.length > 3 && content.includes(keyword)
        );
        if (problemMatches.length > 0) {
            score += Math.min(problemMatches.length * 5, 25);
            reasons.push(`Mentions problem keywords: ${problemMatches.join(', ')}`);
        }
    }
    
    // Check for solution keywords
    if (businessDNA.solution && typeof businessDNA.solution === 'string') {
        const solutionKeywords = businessDNA.solution.toLowerCase().split(/\s+/);
        const solutionMatches = solutionKeywords.filter((keyword: string) => 
            keyword.length > 3 && content.includes(keyword)
        );
        if (solutionMatches.length > 0) {
            score += Math.min(solutionMatches.length * 5, 25);
            reasons.push(`Mentions solution keywords: ${solutionMatches.join(', ')}`);
        }
    }
    
    // Check for customer profile keywords
    if (businessDNA.customerProfile && typeof businessDNA.customerProfile === 'string') {
        const customerKeywords = businessDNA.customerProfile.toLowerCase().split(/\s+/);
        const customerMatches = customerKeywords.filter((keyword: string) => 
            keyword.length > 3 && content.includes(keyword)
        );
        if (customerMatches.length > 0) {
            score += Math.min(customerMatches.length * 3, 15);
            reasons.push(`Mentions customer keywords: ${customerMatches.join(', ')}`);
        }
    }
    
    // Check for pain points
    if (businessDNA.painPoints && Array.isArray(businessDNA.painPoints)) {
        const painPointMatches = businessDNA.painPoints.filter((painPoint: string) => 
            content.includes(painPoint.toLowerCase())
        );
        if (painPointMatches.length > 0) {
            score += Math.min(painPointMatches.length * 4, 20);
            reasons.push(`Mentions pain points: ${painPointMatches.join(', ')}`);
        }
    }
    
    // Check for solution keywords
    if (businessDNA.solutionKeywords && Array.isArray(businessDNA.solutionKeywords)) {
        const solutionKeywordMatches = businessDNA.solutionKeywords.filter((keyword: string) => 
            content.includes(keyword.toLowerCase())
        );
        if (solutionKeywordMatches.length > 0) {
            score += Math.min(solutionKeywordMatches.length * 3, 15);
            reasons.push(`Mentions solution keywords: ${solutionKeywordMatches.join(', ')}`);
        }
    }
    
    // Cap the score at 100
    score = Math.min(score, 100);

    return {
        score,
        reasoning: reasons.length > 0 
            ? `Fallback scoring: ${reasons.join('; ')}` 
            : 'Fallback scoring: No keyword matches found'
    };
}

// Pre-filter function to remove obvious discussion threads
function filterDiscussionThreads(leads: RawLead[]): RawLead[] {
    const discussionPatterns = [
        /discussion thread/i,
        /let's discuss/i,
        /thoughts on/i,
        /what do you think about/i,
        /how do you feel about/i,
        /anyone else/i,
        /what's your experience with/i,
        /general discussion/i,
        /open discussion/i,
        /free discussion/i,
        /weekly discussion/i,
        /daily discussion/i,
        /monthly discussion/i,
        /meta discussion/i,
        /subreddit discussion/i,
        /community discussion/i,
        /opinion poll/i,
        /survey/i,
        /what's everyone's/i,
        /does anyone else/i,
        /am i the only one/i,
        /unpopular opinion/i,
        /hot take/i,
        /controversial opinion/i
    ];
    
    return leads.filter(lead => {
        const title = lead.title.toLowerCase();
        const body = (lead.body || '').toLowerCase();
        const content = `${title} ${body}`;
        
        // Check if it matches any discussion thread pattern
        const isDiscussionThread = discussionPatterns.some(pattern => pattern.test(content));
        
        if (isDiscussionThread) {
            console.log(`🚫 [Pre-filter] Filtered out discussion thread: "${lead.title}"`);
            return false;
        }
        
        return true;
    });
}

export const enrichLeadsForUser = async (rawLeads: RawLead[], user: User, businessDNA: any): Promise<ScoredLead[]> => {
    // Pre-filter out discussion threads before AI processing
    const filteredLeads = filterDiscussionThreads(rawLeads);
    console.log(`🚫 [Pre-filter] Filtered out ${rawLeads.length - filteredLeads.length} discussion threads`);
    
    // Enhanced processing: Handle larger volumes efficiently
    const leadsToProcess = filteredLeads;
    
    console.log(`🚀 [Enhanced Lead Enrichment] Processing ${leadsToProcess.length} raw posts for maximum quality`);
    console.log(`🚀 [Enhanced Lead Enrichment] User plan: ${user.plan}, Business: ${businessDNA.businessName || 'Unknown'}`);
    
    // Use smaller batches for better reliability and timeout handling
    const batchSize = Math.min(50, calculateBatchSize(leadsToProcess)); // Max 50 posts per batch
    console.log(`🚀 [Enhanced Lead Enrichment] Using batch size: ${batchSize} posts per API call`);
    console.log(`🚀 [Enhanced Lead Enrichment] Expected API calls: ${Math.ceil(leadsToProcess.length / batchSize)}`);
    
    // Split leads into batches
    const batches: RawLead[][] = [];
    for (let i = 0; i < leadsToProcess.length; i += batchSize) {
        batches.push(leadsToProcess.slice(i, i + batchSize));
    }
    
    console.log(`🚀 [Enhanced Lead Enrichment] Processing ${batches.length} batches of ${batchSize} leads each`);
    console.log(`🚀 [Enhanced Lead Enrichment] Total processing capacity: ${batches.length * batchSize} posts`);
    
    const allScoredLeads: ScoredLead[] = [];
    
    // Process each batch with enhanced progress tracking
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const progress = ((batchIndex + 1) / batches.length * 100).toFixed(1);
        console.log(`🚀 [Batch ${batchIndex + 1}/${batches.length}] Processing ${batch.length} leads... (${progress}% complete)`);
        
        try {
            // Score the entire batch with one API call
            const batchScores = await scoreLeadsBatch(batch, businessDNA);
            
            // Process each lead in the batch
            for (const lead of batch) {
                const scoreData = batchScores.get(lead.id);
                if (scoreData) {
                    const isGoogleRanked = user.plan === 'pro' ? await checkSerpRanking(lead.url, lead.title) : false;
                    
                    const scoredLead: ScoredLead = {
                        ...lead,
                        relevanceScore: scoreData.score,
                        relevanceReasoning: scoreData.reasoning,
                        isGoogleRanked,
                        intent: scoreData.score > 75 ? 'high_intent_prospect' : (scoreData.score > 50 ? 'medium_intent_prospect' : 'low_intent_prospect'),
                        opportunityScore: scoreData.score 
                    };
                    
                    allScoredLeads.push(scoredLead);
                }
            }
            
            console.log(`✅ [Batch ${batchIndex + 1}/${batches.length}] Completed: ${batch.length} leads processed`);
            
            // Small delay between batches to avoid rate limits
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
        } catch (error: any) {
            console.error(`❌ [Batch ${batchIndex + 1}/${batches.length}] Failed to process batch:`, error);
            
            // Check if it's a critical error that should stop processing
            if (error.message && (
                error.message.includes('Failed to generate content after 5 retries') ||
                error.message.includes('Service Unavailable') ||
                error.message.includes('quota')
            )) {
                console.error(`🚨 [Circuit Breaker] Critical error detected, stopping batch processing: ${error.message}`);
                
                // Mark remaining batches as failed
                for (let remainingBatchIndex = batchIndex; remainingBatchIndex < batches.length; remainingBatchIndex++) {
                    const remainingBatch = batches[remainingBatchIndex];
                    for (const lead of remainingBatch) {
                        const scoredLead: ScoredLead = {
                            ...lead,
                            relevanceScore: 0,
                            relevanceReasoning: `Processing stopped due to critical error: ${error.message}`,
                            isGoogleRanked: false,
                            opportunityScore: 0
                        };
                        allScoredLeads.push(scoredLead);
                    }
                }
                break; // Exit the batch processing loop
            }
            
            // Continue with next batch for non-critical errors
        }
    }
    
    // Sort by relevance score
    allScoredLeads.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`🎉 [Enhanced Lead Enrichment] Processing completed!`);
    console.log(`📊 [Enhanced Lead Enrichment] Final Results:`);
    console.log(`   - Raw posts collected: ${rawLeads.length}`);
    console.log(`   - After discussion filter: ${filteredLeads.length}`);
    console.log(`   - Successfully scored: ${allScoredLeads.length}`);
    console.log(`   - API calls made: ${batches.length}`);
    console.log(`   - Quality distribution:`, {
        high_intent: allScoredLeads.filter(l => l.intent === 'high_intent_prospect').length,
        medium_intent: allScoredLeads.filter(l => l.intent === 'medium_intent_prospect').length,
        low_intent: allScoredLeads.filter(l => l.intent === 'low_intent_prospect').length,
        topScore: allScoredLeads[0]?.relevanceScore || 'N/A',
        avgScore: Math.round(allScoredLeads.reduce((sum, l) => sum + l.relevanceScore, 0) / allScoredLeads.length) || 'N/A'
    });
    
    return allScoredLeads;
};
