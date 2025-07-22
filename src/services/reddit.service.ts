import snoowrap from 'snoowrap';
import { RawLead } from '../types/reddit.types';
import pLimit from 'p-limit';

let r: snoowrap | null = null;

const MAX_PAGES_TO_FETCH = 5; // Safety valve for global search

export const getAppAuthenticatedInstance = async (): Promise<snoowrap> => {
    if (r) {
        return r;
    }

    console.log('Initializing and verifying Reddit application credentials...');
    try {
        const tempR = new snoowrap({
            userAgent: process.env.REDDIT_USER_AGENT!,
            clientId: process.env.REDDIT_CLIENT_ID!,
            clientSecret: process.env.REDDIT_CLIENT_SECRET!,
            refreshToken: process.env.REDDIT_REFRESH_TOKEN!
        });
        //@ts-expect-error
        const me = await tempR.getMe();
        console.log(`✅ Reddit credentials verified for user: u/${me.name}`);
        
        r = tempR;
        return tempR;

    } catch (error: any) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('!!! CRITICAL ERROR: FAILED TO AUTHENTICATE WITH REDDIT !!!');
        console.error('!!! This is likely due to an invalid REDDIT_REFRESH_TOKEN in your .env file.');
        console.error('!!! Please check your credentials on https://www.reddit.com/prefs/apps');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        throw new Error(`Reddit Authentication Failed: ${error.message}`);
    }
};

export const findLeadsInSubmissions = async (keywords: string[], subreddits: string[]): Promise<RawLead[]> => {
    try {
        const reddit = await getAppAuthenticatedInstance();
        console.log(`[Submissions] Starting search in ${subreddits.length} subreddits.`);

        const searchQuery = keywords.join(' OR ');
        const searchPromises = subreddits.map(async (subreddit) => {
            try {
                const searchResults = await reddit.getSubreddit(subreddit).search({
                    query: searchQuery,
                    sort: 'new',
                    time: 'month',
                });
                return searchResults.map((post): RawLead => ({
                    id: post.id,
                    title: post.title,
                    author: post.author.name,
                    subreddit: post.subreddit.display_name,
                    url: `https://www.reddit.com${post.permalink}`,
                    body: post.selftext,
                    createdAt: post.created_utc,
                    numComments: post.num_comments,
                    upvoteRatio: post.upvote_ratio,
                    authorKarma: post.author.link_karma + post.author.comment_karma,
                    type: 'DIRECT_LEAD'
                }));
            } catch (error) {
                console.warn(`[Submissions] Could not search r/${subreddit}. Skipping.`);
                return [];
            }
        });

        const results = await Promise.all(searchPromises);
        return results.flat();
    } catch (error) {
        console.error('[Submissions] Could not perform search due to an error.', error);
        return [];
    }
};

export const findLeadsInComments = async (keywords: string[], subreddits: string[]): Promise<RawLead[]> => {
    try {
        const reddit = await getAppAuthenticatedInstance();
        console.log(`[Comments] Starting search in ${subreddits.length} subreddits.`);
        const lowerCaseKeywords = keywords.map(k => k.toLowerCase());
        const limiter = pLimit(5);
        let leads: RawLead[] = [];

        const searchPromises = subreddits.map(subreddit => limiter(async () => {
            try {
                const comments = await reddit.getNewComments(subreddit, { limit: 100 });
                for (const comment of comments) {
                    const commentBodyLower = comment.body.toLowerCase();
                    if (lowerCaseKeywords.some(keyword => commentBodyLower.includes(keyword))) {
                        const submissionId = comment.link_id.replace('t3_', '');
                        //@ts-expect-error
                        const submission = await reddit.getSubmission(submissionId).fetch();
                        leads.push({
                            id: comment.id,
                            title: `Comment in: "${submission.title}"`,
                            author: comment.author.name,
                            subreddit: comment.subreddit.display_name,
                            url: `https://www.reddit.com${comment.permalink}`,
                            body: comment.body,
                            createdAt: comment.created_utc,
                            numComments: submission.num_comments,
                            upvoteRatio: submission.upvote_ratio,
                            authorKarma: comment.author.link_karma + comment.author.comment_karma,
                            type: 'DIRECT_LEAD'
                        });
                    }
                }
            } catch (error) {
                console.warn(`[Comments] Could not fetch comments from r/${subreddit}. Skipping.`);
            }
        }));

        await Promise.all(searchPromises);
        return leads;
    } catch (error) {
        console.error('[Comments] Could not perform comment search due to an error.', error);
        return [];
    }
};

export const findLeadsGlobally = async (
    keywords: string[],
    negativeKeywords: string[],
    subredditBlacklist: string[],
    businessDescription?: string // Add business context
): Promise<RawLead[]> => {
    try {
        const reddit = await getAppAuthenticatedInstance();
        console.log(`[Global Search] Starting Reddit-wide search with enhanced relevance filtering.`);

        // 🎯 IMPROVED: Create more targeted search queries
        const primaryKeywords = keywords.slice(0, 3); // Use top 3 most important keywords
        const secondaryKeywords = keywords.slice(3);
        
        // Create multiple focused queries instead of one broad OR query
        const targetedQueries = primaryKeywords.map(keyword => {
            const contextualTerms = [
                `"${keyword}" (help OR recommend OR suggest OR advice OR best OR looking for)`,
                `"${keyword}" (problem OR issue OR struggling OR need OR want)`,
                `"${keyword}" (alternative OR better OR comparison OR vs OR versus)`
            ];
            return contextualTerms;
        }).flat();

        const negativeKeywordQuery = negativeKeywords.map(kw => `-title:"${kw}" -selftext:"${kw}"`).join(' ');
        const blacklistQuery = subredditBlacklist.map(sub => `-subreddit:${sub.trim().toLowerCase()}`).join(' ');

        let allLeads: RawLead[] = [];
        const uniqueLeads = new Map<string, RawLead>();

        // 🎯 IMPROVED: Search with multiple targeted queries
        for (const query of targetedQueries.slice(0, 5)) { // Limit to 5 most relevant queries
            try {
                const finalQuery = `${query} ${negativeKeywordQuery} ${blacklistQuery}`.trim();
                console.log(`[Global Search] Targeted query: ${finalQuery}`);

                const searchResults = await reddit.search({
                    query: finalQuery,
                    sort: 'relevance', // Changed from 'new' to 'relevance'
                    time: 'week', // Changed from 'month' to 'week' for more recent content
                    limit: 25, // Reduced from 100 to get higher quality results
                });

                searchResults.forEach((post) => {
                    if (!uniqueLeads.has(post.id)) {
                        uniqueLeads.set(post.id, {
                            id: post.id,
                            title: post.title,
                            author: post.author.name,
                            subreddit: post.subreddit.display_name,
                            url: `https://www.reddit.com${post.permalink}`,
                            body: post.selftext,
                            createdAt: post.created_utc,
                            numComments: post.num_comments,
                            upvoteRatio: post.upvote_ratio,
                            authorKarma: post.author.link_karma + post.author.comment_karma,
                            type: 'DIRECT_LEAD'
                        });
                    }
                });

                // Add delay between queries to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.warn(`[Global Search] Query failed: ${query}. Continuing with next query.`);
            }
        }

        const leads = Array.from(uniqueLeads.values());
        console.log(`[Global Search] Found ${leads.length} unique leads across ${targetedQueries.length} targeted queries.`);
        
        return leads;

    } catch (error) {
        console.error('[Global Search] A critical error occurred during global search.', error);
        return [];
    }
};

export const findLeadsOnReddit = async (keywords: string[], subreddits: string[]): Promise<RawLead[]> => {
    try {
        const reddit = await getAppAuthenticatedInstance();
        console.log(`Starting Reddit search for ${subreddits.length} subreddits.`);

        const searchQuery = keywords.join(' OR ');
        console.log(`  -> Using search query: "${searchQuery}"`);

        const searchPromises = subreddits.map(async (subreddit) => {
            try {
                const searchResults = await reddit.getSubreddit(subreddit).search({
                    query: searchQuery,
                    sort: 'new',
                    time: 'year',
                });
                return searchResults.map((post): RawLead => ({
                    id: post.id,
                    title: post.title,
                    author: post.author.name,
                    subreddit: post.subreddit.display_name,
                    url: post.url,
                    body: post.selftext,
                    createdAt: post.created_utc,
                    numComments: post.num_comments,
                    upvoteRatio: post.upvote_ratio,
                    authorKarma: post.author.link_karma,
                    type: 'DIRECT_LEAD'
                }));
            } catch (error) {
                console.warn(`⚠️  Could not search subreddit 'r/${subreddit}'. It might be private, banned, or non-existent. Skipping.`);
                return [];
            }
        });

        const results = await Promise.all(searchPromises);
        const flattenedResults = results.flat();
        console.log(`Reddit search complete. Found ${flattenedResults.length} total posts before filtering.`);
        return flattenedResults;

    } catch (error) {
        console.error('Could not perform Reddit search due to an error.', error);
        return [];
    }
};

export const getCommentById = async (commentId: string): Promise<any> => {
    try {
        const reddit = await getAppAuthenticatedInstance();
        const comment = await (reddit.getComment(commentId).fetch() as Promise<any>);
        return comment;
    } catch (error: any) {
        console.error(`Failed to fetch comment ${commentId}:`, error.message);
        throw new Error(`Reddit API Error: Could not fetch comment ${commentId}.`);
    }
};

export const postReply = async (parentId: string, text: string, userRefreshToken: string): Promise<string> => {
    try {
        const userR = getUserAuthenticatedInstance(userRefreshToken);
        const newComment = await (userR.getComment(parentId).reply(text) as Promise<any>);
        return newComment.name as string;
    } catch (error: any) {
        console.error(`Failed to post reply to ${parentId}:`, error);
        throw new Error(`Reddit API Error: ${error.message}`);
    }
};

export const getOptimalPostingDelay = (subredditName: string): number => {
    const popularSubreddits = ['askreddit', 'todayilearned', 'worldnews', 'pics'];
    if (popularSubreddits.includes(subredditName.toLowerCase())) {
        return 0;
    } else {
        return Math.floor(Math.random() * 10) + 5;
    }
};

export const getUserAuthenticatedInstance = (userRefreshToken: string) => {
    return new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT!,
        clientId: process.env.REDDIT_CLIENT_ID!,
        clientSecret: process.env.REDDIT_CLIENT_SECRET!,
        refreshToken: userRefreshToken,
    });
};

export const postReplyAsUser = async (parentId: string, text: string, userRefreshToken: string): Promise<string> => {
    try {
        const userR = getUserAuthenticatedInstance(userRefreshToken);
        const newComment = await (userR.getComment(parentId).reply(text) as Promise<any>);
        return newComment.name as string;
    } catch (error: any) {
        console.error(`Failed to post reply to ${parentId}:`, error);
        throw new Error(`Reddit API Error: ${error.message}`);
    }
};

export const getUserKarma = async (userRefreshToken: string): Promise<number> => {
    try {
        const userR = getUserAuthenticatedInstance(userRefreshToken);
        const me = await (userR.getMe() as Promise<any>);
        return (me.link_karma || 0) + (me.comment_karma || 0);
    } catch (error: any) {
        console.error(`Failed to fetch user karma:`, error);
        throw new Error(`Reddit API Error while fetching karma: ${error.message}`);
    }
};

export const checkKarmaThreshold = async (userRefreshToken: string, minimumKarma: number = 10): Promise<boolean> => {
    try {
        const karma = await getUserKarma(userRefreshToken);
        return karma >= minimumKarma;
    } catch (error) {
        console.error('Failed to check karma threshold:', error);
        return false;
    }
};

export { RawLead };