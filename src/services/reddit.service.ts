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
    try {
        const queries = new Set<string>();
        const { naturalLanguageVocabulary: vocab, customerProfile, geographicalFocus } = dna || {};

        // Add variation based on variationLevel (0-2)
        const painPointCount = Math.min(8 + variationLevel * 2, vocab?.painPoints?.length || 0);
        const solutionCount = Math.min(6 + variationLevel * 2, vocab?.solutionKeywords?.length || 0);
        const competitorCount = Math.min(4 + variationLevel, vocab?.competitors?.length || 0);

        // Pain Point Queries (Highest Priority) - with business context
        if (vocab?.painPoints && Array.isArray(vocab.painPoints)) {
            const shuffledPainPoints = [...vocab.painPoints].sort(() => Math.random() - 0.5);
            shuffledPainPoints.slice(0, painPointCount).forEach((pain: string) => {
                if (pain && typeof pain === 'string') {
                    queries.add(`"${pain}"`);
                    if (variationLevel > 0) {
                        queries.add(`struggling with ${pain}`);
                        queries.add(`need help with ${pain}`);
                    }
                }
            });
        }

        // Solution-Oriented Queries - with business context
        if (vocab?.solutionKeywords && Array.isArray(vocab.solutionKeywords)) {
            const shuffledSolutions = [...vocab.solutionKeywords].sort(() => Math.random() - 0.5);
            shuffledSolutions.slice(0, solutionCount).forEach((solution: string) => {
                if (solution && typeof solution === 'string') {
                    const commonTitles = customerProfile?.commonTitles;
                    const jobTitle = (Array.isArray(commonTitles) && commonTitles.length > 0) 
                        ? commonTitles[Math.floor(Math.random() * commonTitles.length)]
                        : 'business';
                    queries.add(`best ${solution} for ${jobTitle}`);
                    queries.add(`${solution}`);
                    
                    // Add variation queries
                    if (variationLevel > 0) {
                        queries.add(`need ${solution}`);
                        queries.add(`looking for ${solution}`);
                    }
                }
            });
        }

        // Competitor Queries - with variation
        if (vocab?.competitors && Array.isArray(vocab.competitors)) {
            const shuffledCompetitors = [...vocab.competitors].sort(() => Math.random() - 0.5);
            shuffledCompetitors.slice(0, competitorCount).forEach((competitor: string) => {
                if (competitor && typeof competitor === 'string') {
                    queries.add(`alternative to ${competitor}`);
                    queries.add(`${competitor}`);
                    if (variationLevel > 0) {
                        queries.add(`${competitor} vs`);
                        queries.add(`better than ${competitor}`);
                    }
                }
            });
        }

        // Add time-based variation queries
        if (variationLevel > 0) {
            const timeVariations = ['recently', 'lately', 'this year', '2024'];
            const randomTime = timeVariations[Math.floor(Math.random() * timeVariations.length)];
            const currentQueries = Array.from(queries);
            currentQueries.forEach(q => queries.add(`${q} ${randomTime}`));
        }
        
        // Geo-targeted Queries
        if (geographicalFocus && geographicalFocus.toLowerCase() !== 'global' && queries.size > 0) {
            const geoQueries = new Set<string>();
            queries.forEach(q => geoQueries.add(`${q} ${geographicalFocus}`));
            return Array.from(geoQueries);
        }

        return Array.from(queries);
    } catch (error) {
        console.error('❌ [Query Generation] Error in generateQueriesFromDNA:', error);
        // Return basic fallback queries
        return [`"${dna?.businessName || 'business'}"`, 'help', 'solution', 'problem'];
    }
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

// Helper function to add timeout to Reddit API calls
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Reddit API call timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
};

export const findLeadsWithBusinessIntelligence = async (businessDNA: any, subredditBlacklist: string[] = [], variationLevel: number = 0, userRedditToken: string): Promise<RawLead[]> => {
    try {
        // REQUIRED: Use user's Reddit account for discovery
        if (!userRedditToken) {
            throw new Error('User Reddit token is required for lead discovery');
        }
        
        console.log(`🔍 [Lead Discovery] Using user Reddit account for discovery`);
        
        // Add timeout to Reddit instance creation to prevent hanging
        const reddit = await withTimeout(
            Promise.resolve(getUserRedditInstance(userRedditToken)), 
            10000 // 10 second timeout for Reddit instance creation
        );
        
        // Test Reddit instance with a simple API call to ensure it's working
        console.log(`🔍 [Lead Discovery] Testing Reddit instance connectivity...`);
        try {
            await withTimeout(
                reddit.getMe().then(() => console.log(`✅ [Lead Discovery] Reddit instance verified`)),
                15000 // 15 second timeout for Reddit connectivity test
            );
        } catch (error: any) {
            console.error(`❌ [Lead Discovery] Reddit instance test failed: ${error.message}`);
            throw new Error(`Reddit authentication failed: ${error.message}`);
        }
        const oneYearAgo = Math.floor(Date.now() / 1000) - 31536000;
        const uniqueLeads = new Map<string, RawLead>();
        
        // Generate both static and dynamic queries for maximum diversity
        console.log(`🔍 [Lead Discovery] Generating search queries...`);
        let staticQueries: string[] = [];
        try {
            console.log(`🔍 [Lead Discovery] Starting static query generation...`);
            staticQueries = await withTimeout(
                Promise.resolve(generateQueriesFromDNA(businessDNA, variationLevel)),
                5000 // Reduced to 5 second timeout for static query generation
            );
            console.log(`✅ [Lead Discovery] Generated ${staticQueries.length} static queries`);
        } catch (error: any) {
            console.error(`❌ [Lead Discovery] Static query generation failed: ${error.message}`);
            // Fallback to basic queries if generation fails
            console.log(`🔄 [Lead Discovery] Using fallback basic queries...`);
            staticQueries = [`"${businessDNA.businessName || 'business'}"`, 'help', 'solution', 'problem'];
        }
        let dynamicQueries: string[] = [];
        try {
            dynamicQueries = await withTimeout(generateDynamicSearchQueries(businessDNA, variationLevel), 30000); // 30 second timeout for AI query generation
        } catch (error: any) {
            console.log(`⚠️ [Lead Discovery] AI query generation timed out, using static queries only: ${error.message}`);
            dynamicQueries = [];
        }
        const semanticQueries = [...staticQueries, ...dynamicQueries];
        
        // Track search success/failure rates
        let totalSearches = 0;
        let successfulSearches = 0;
        let failedSearches = 0;
        
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

        // High-performance scraping strategy: Maximum parallel processing for speed
        const TARGET_RAW_POSTS = 2000; // Increased target for maximum lead quality
        const PARALLEL_CHUNK_SIZE = 12; // Increased for maximum parallel processing speed
        const queryChunks = [];
        for (let i = 0; i < semanticQueries.length; i += PARALLEL_CHUNK_SIZE) {
            queryChunks.push(semanticQueries.slice(i, i + PARALLEL_CHUNK_SIZE));
        }

        console.log(`🚀 [Lead Discovery] HIGH-PERFORMANCE Strategy: Targeting ${TARGET_RAW_POSTS} raw posts`);
        console.log(`🚀 [Lead Discovery] Processing ${queryChunks.length} chunks of queries with MAXIMUM PARALLELISM...`);
        console.log(`🚀 [Lead Discovery] Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        
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
                                totalSearches++;
                                const results = await withTimeout(reddit.search({ 
                                    query: query, 
                                    subreddit: correctedSubreddit,
                                    sort: strategy.sort, 
                                    time: strategy.time, 
                                    limit: Math.max(25, Math.floor((100 + (variationLevel * 20)) / targetSubreddits.length)) // Increased limits for speed
                                }), 15000); // 15 second timeout for subreddit searches
                                successfulSearches++;
                                console.log(`✅ [Lead Discovery] Found ${results.length} posts in r/${correctedSubreddit}`);
                                return results;
                            } catch (error: any) {
                                failedSearches++;
                                console.log(`⚠️ [Lead Discovery] Error searching r/${correctedSubreddit}: ${error.message.substring(0, 100)}...`);
                                return []; // Return empty array for failed searches
                            }
                        })
                        : [withTimeout(reddit.search({ 
                            query: [query, blacklistQuery].filter(Boolean).join(' '), 
                            sort: strategy.sort, 
                            time: strategy.time, 
                            limit: 100 + (variationLevel * 20) // Increased limits for speed
                        }), 15000).then(results => {
                            totalSearches++;
                            successfulSearches++;
                            return results;
                        }).catch(error => {
                            totalSearches++;
                            failedSearches++;
                            console.log(`⚠️ [Lead Discovery] Error in general search: ${error.message?.substring(0, 100) || 'Unknown error'}...`);
                            return [];
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
            
            // Minimal delay for maximum speed
            await new Promise(resolve => setTimeout(resolve, 50)); // Minimal delay for maximum speed
        }
        
        const finalLeads = Array.from(uniqueLeads.values());
        console.log(`🎉 [Lead Discovery] Discovery completed! Found ${finalLeads.length} total unique leads`);
        console.log(`📈 [Lead Discovery] Lead breakdown:`, {
            total: finalLeads.length,
            subreddits: [...new Set(finalLeads.map(l => l.subreddit))].length,
            avgScore: Math.round(finalLeads.reduce((sum, l) => sum + (l.score || 0), 0) / finalLeads.length),
            avgComments: Math.round(finalLeads.reduce((sum, l) => sum + (l.commentCount || 0), 0) / finalLeads.length)
        });
        
        console.log(`📊 [Lead Discovery] Search statistics:`, {
            totalSearches,
            successfulSearches,
            failedSearches,
            successRate: totalSearches > 0 ? Math.round((successfulSearches / totalSearches) * 100) : 0
        });
        
        // If most searches failed, provide helpful feedback
        if (totalSearches > 0 && failedSearches > successfulSearches) {
            console.log(`⚠️ [Lead Discovery] WARNING: ${failedSearches}/${totalSearches} searches failed. This may indicate Reddit API rate limits or subreddit access issues.`);
        }
        
        return finalLeads;
    } catch (error: any) {
        console.error(`❌ [Lead Discovery] Error during discovery:`, error);
        
        // Provide more specific error information
        if (error.message?.includes('429')) {
            console.error(`❌ [Lead Discovery] Reddit API rate limit exceeded. Please wait before retrying.`);
        } else if (error.message?.includes('403')) {
            console.error(`❌ [Lead Discovery] Reddit API access forbidden. Check subreddit permissions.`);
        } else if (error.message?.includes('404')) {
            console.error(`❌ [Lead Discovery] Reddit API endpoint not found. Check subreddit names.`);
        } else {
            console.error(`❌ [Lead Discovery] Unknown error: ${error.message || 'Unknown error occurred'}`);
        }
        
        return [];
    }
};

export { RawLead };