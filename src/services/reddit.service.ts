import snoowrap from 'snoowrap';
import { RawLead } from '../types/reddit.types';
import { generateDynamicSearchQueries } from './ai.service';
import { getUserRedditInstance } from './userReddit.service';

let requestCount = 0;
let requestWindowStart = Date.now();

const monitorRateLimit = () => {
    const now = Date.now();
    const windowElapsed = now - requestWindowStart;
    if (windowElapsed >= 60000) {
        requestCount = 0;
        requestWindowStart = now;
    }
    requestCount++;
};

// System Reddit instance removed - all Reddit API calls now use user accounts

export const generateQueriesFromDNA = (dna: any, variationLevel: number = 0): string[] => {
    const queries = new Set<string>();
    const { naturalLanguageVocabulary: vocab, customerProfile, geographicalFocus } = dna;

    // Add variation based on variationLevel (0-2)
    const painPointCount = Math.min(8 + variationLevel * 2, vocab.painPoints?.length || 0);
    const solutionCount = Math.min(6 + variationLevel * 2, vocab.solutionKeywords?.length || 0);
    const competitorCount = Math.min(4 + variationLevel, vocab.competitors?.length || 0);

    // Pain Point Queries (Highest Priority) - with business context
    if (vocab.painPoints) {
        const shuffledPainPoints = [...vocab.painPoints].sort(() => Math.random() - 0.5);
        shuffledPainPoints.slice(0, painPointCount).forEach((pain: string) => {
            queries.add(`"${pain}"`);
            if (variationLevel > 0) {
                queries.add(`struggling with ${pain}`);
                queries.add(`need help with ${pain}`);
            }
        });
    }

    // Solution-Oriented Queries - with business context
    if (vocab.solutionKeywords) {
        const shuffledSolutions = [...vocab.solutionKeywords].sort(() => Math.random() - 0.5);
        shuffledSolutions.slice(0, solutionCount).forEach((solution: string) => {
            const jobTitle = customerProfile?.commonTitles?.[Math.floor(Math.random() * (customerProfile.commonTitles.length || 1))] || 'call center';
            queries.add(`best ${solution} for ${jobTitle}`);
            queries.add(`${solution}`);
            
            // Add variation queries
            if (variationLevel > 0) {
                queries.add(`need ${solution}`);
                queries.add(`looking for ${solution}`);
            }
        });
    }

    // Competitor Queries - with variation
    if (vocab.competitors) {
        const shuffledCompetitors = [...vocab.competitors].sort(() => Math.random() - 0.5);
        shuffledCompetitors.slice(0, competitorCount).forEach((competitor: string) => {
            queries.add(`alternative to ${competitor}`);
            queries.add(`${competitor}`);
            if (variationLevel > 0) {
                queries.add(`${competitor} vs`);
                queries.add(`better than ${competitor}`);
            }
        });
    }

    // Add time-based variation queries
    if (variationLevel > 0) {
        const timeVariations = ['recently', 'lately', 'this year', '2024'];
        const randomTime = timeVariations[Math.floor(Math.random() * timeVariations.length)];
        queries.forEach(q => queries.add(`${q} ${randomTime}`));
    }
    
    // Geo-targeted Queries
    if (geographicalFocus && geographicalFocus.toLowerCase() !== 'global' && queries.size > 0) {
        const geoQueries = new Set<string>();
        queries.forEach(q => geoQueries.add(`${q} ${geographicalFocus}`));
        return Array.from(geoQueries);
    }

    return Array.from(queries);
};

async function isQualityPost(post: any, oneYearAgo: number): Promise<boolean> {
    if (post.created_utc < oneYearAgo) return false;
    if (post.score < 1 && post.num_comments < 2) return false;
    if (!post.title || post.title.length < 15) return false;
    const combinedText = `${post.title} ${post.selftext || ''}`.toLowerCase();
    const spamPatterns = [/looking for a job/i, /resume review/i, /career advice/i, /hiring/i, /free trial|discount/i];
    if (spamPatterns.some(pattern => pattern.test(combinedText))) {
        return false;
    }
    return true;
}

export const findLeadsWithBusinessIntelligence = async (businessDNA: any, subredditBlacklist: string[] = [], variationLevel: number = 0, userRedditToken: string): Promise<RawLead[]> => {
    try {
        // REQUIRED: Use user's Reddit account for discovery
        if (!userRedditToken) {
            throw new Error('User Reddit token is required for lead discovery');
        }
        
        const reddit = getUserRedditInstance(userRedditToken);
        console.log(`🔍 [Lead Discovery] Using user Reddit account for discovery`);
        const oneYearAgo = Math.floor(Date.now() / 1000) - 31536000;
        const uniqueLeads = new Map<string, RawLead>();
        // Generate both static and dynamic queries for maximum diversity
        const staticQueries = generateQueriesFromDNA(businessDNA, variationLevel);
        const dynamicQueries = await generateDynamicSearchQueries(businessDNA, variationLevel);
        const semanticQueries = [...staticQueries, ...dynamicQueries];
        
        console.log(`🔍 [Lead Discovery] Starting discovery process...`);
        console.log(`🔍 [Lead Discovery] Generated ${staticQueries.length} static + ${dynamicQueries.length} dynamic = ${semanticQueries.length} total queries`);
        console.log(`🔍 [Lead Discovery] Business DNA:`, businessDNA.businessName || 'Unknown');
        console.log(`🔍 [Lead Discovery] Target Subreddits:`, businessDNA.suggestedSubreddits || []);
        console.log(`🔍 [Lead Discovery] Blacklist:`, subredditBlacklist.length, 'subreddits');
        const blacklistQuery = subredditBlacklist.map(sub => `-subreddit:${sub}`).join(' ');

        // Add different search strategies based on variation level
        const searchStrategies: Array<{ sort: 'relevance' | 'new' | 'top' | 'hot' | 'comments'; time: 'year' | 'month' | 'hour' | 'day' | 'week' | 'all' }> = [
            { sort: 'relevance', time: 'year' },
            { sort: 'new', time: 'month' },
            { sort: 'top', time: 'month' }
        ];

        // Enhanced scraping strategy: Collect 1000-2000 raw posts for better quality
        const TARGET_RAW_POSTS = 1500; // Target 1500 raw posts for optimal quality
        const PARALLEL_CHUNK_SIZE = 8; // Increased for more aggressive scraping
        const queryChunks = [];
        for (let i = 0; i < semanticQueries.length; i += PARALLEL_CHUNK_SIZE) {
            queryChunks.push(semanticQueries.slice(i, i + PARALLEL_CHUNK_SIZE));
        }

        console.log(`🔍 [Lead Discovery] Enhanced Strategy: Targeting ${TARGET_RAW_POSTS} raw posts`);
        console.log(`🔍 [Lead Discovery] Processing ${queryChunks.length} chunks of queries...`);
        
        for (let chunkIndex = 0; chunkIndex < queryChunks.length; chunkIndex++) {
            const chunk = queryChunks[chunkIndex];
            console.log(`🔍 [Lead Discovery] Processing chunk ${chunkIndex + 1}/${queryChunks.length} with ${chunk.length} queries...`);
            
            const searchPromises = chunk.map(async (query: string, index: number) => {
                try {
                    monitorRateLimit();
                    // Use different search strategies for variation
                    const strategy = searchStrategies[index % searchStrategies.length];
                    // Target specific subreddits for better relevance
                    const targetSubreddits = businessDNA.suggestedSubreddits || [];
                    
                    // Search each subreddit separately since Reddit doesn't support OR in subreddit filters
                    const subredditSearchPromises = targetSubreddits.length > 0 
                        ? targetSubreddits.map(async (subreddit: string) => {
                            // Fix common subreddit name issues
                            const correctedSubreddit = subreddit === 'artificialintelligence' ? 'MachineLearning' : subreddit;
                            
                            console.log(`🔍 [Lead Discovery] Searching subreddit: r/${correctedSubreddit} with query: "${query}"`);
                            
                            try {
                                const results = await reddit.search({ 
                                    query: query, 
                                    subreddit: correctedSubreddit,
                                    sort: strategy.sort, 
                                    time: strategy.time, 
                                    limit: Math.max(15, Math.floor((50 + (variationLevel * 10)) / targetSubreddits.length))
                                });
                                console.log(`✅ [Lead Discovery] Found ${results.length} posts in r/${correctedSubreddit}`);
                                return results;
    } catch (error: any) {
                                console.log(`⚠️ [Lead Discovery] Error searching r/${correctedSubreddit}: ${error.message.substring(0, 100)}...`);
                                return []; // Return empty array for failed searches
                            }
                        })
                        : [reddit.search({ 
                            query: [query, blacklistQuery].filter(Boolean).join(' '), 
                            sort: strategy.sort, 
                            time: strategy.time, 
                            limit: 50 + (variationLevel * 10)
                        })];
                    
                    const subredditResults = await Promise.all(subredditSearchPromises);
                    const searchResults = subredditResults.flat();
                    const qualityChecks = await Promise.all(searchResults.map(async (post: any) => ({ post, isQuality: !uniqueLeads.has(post.id) && await isQualityPost(post, oneYearAgo) })));
                    return qualityChecks.filter(({ isQuality }) => isQuality).map(({ post }): RawLead => ({
                    id: post.id,
                    title: post.title,
                    author: post.author.name,
                    subreddit: post.subreddit.display_name,
                    url: `https://www.reddit.com${post.permalink}`,
                    body: post.selftext,
                    createdAt: post.created_utc,
                    numComments: post.num_comments,
                        score: post.score,
                        commentCount: post.num_comments,
                    type: 'DIRECT_LEAD'
                }));
                } catch (error) { return []; }
            });
            const chunkResults = await Promise.all(searchPromises);
            const newLeadsFromChunk = chunkResults.flat();
            const beforeCount = uniqueLeads.size;
            newLeadsFromChunk.forEach((lead: RawLead) => { if (!uniqueLeads.has(lead.id)) uniqueLeads.set(lead.id, lead); });
            const afterCount = uniqueLeads.size;
            const newLeadsAdded = afterCount - beforeCount;
            
            console.log(`✅ [Lead Discovery] Chunk ${chunkIndex + 1} completed: Found ${newLeadsFromChunk.length} leads, ${newLeadsAdded} new unique leads added`);
            console.log(`📊 [Lead Discovery] Total unique leads so far: ${afterCount}`);
            
            // Early termination if we've collected enough raw posts
            if (afterCount >= TARGET_RAW_POSTS) {
                console.log(`🎯 [Lead Discovery] Target reached! Collected ${afterCount} raw posts, stopping early for efficiency`);
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200)); // Further reduced for faster processing
        }
        
        const finalLeads = Array.from(uniqueLeads.values());
        console.log(`🎉 [Lead Discovery] Discovery completed! Found ${finalLeads.length} total unique leads`);
        console.log(`📈 [Lead Discovery] Lead breakdown:`, {
            total: finalLeads.length,
            subreddits: [...new Set(finalLeads.map(l => l.subreddit))].length,
            avgScore: Math.round(finalLeads.reduce((sum, l) => sum + (l.score || 0), 0) / finalLeads.length),
            avgComments: Math.round(finalLeads.reduce((sum, l) => sum + (l.commentCount || 0), 0) / finalLeads.length)
        });
        
        return finalLeads;
    } catch (error) {
        console.error(`❌ [Lead Discovery] Error during discovery:`, error);
        return [];
    }
};

export { RawLead };