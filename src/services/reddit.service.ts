import snoowrap from 'snoowrap';
import { RawLead } from '../types/reddit.types';
import pLimit from 'p-limit';

// This singleton instance remains, as it's a good pattern.
let r: snoowrap | null = null;

// Your original, working authentication function is preserved.
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

/**
 * [NEW] Builds a more advanced, precise search query for Reddit.
 * This is the core of the new logic to find higher-quality leads.
 */
const buildAdvancedSearchQuery = (
    keywords: string[],
    negativeKeywords: string[] = [],
    subreddits: string[] = []
): string => {
    const highIntentPhrases = [
        "looking for", "recommend", "suggestion", "alternative to", "best way to",
        "how to choose", "ui library", "component library", "design system", "help with",
        "any good", "thoughts on", "what is the best", "compare"
    ];

    const keywordQuery = keywords.map(k => `"${k.trim()}"`).join(' OR ');
    const intentQuery = highIntentPhrases.map(p => `"${p.trim()}"`).join(' OR ');
    let query = `(${keywordQuery}) AND (${intentQuery})`;

    if (subreddits.length > 0) {
        const subredditQuery = subreddits.map(sub => `subreddit:${sub.trim()}`).join(' OR ');
        query = `(${query}) AND (${subredditQuery})`;
    }

    if (negativeKeywords.length > 0) {
        const negativeQuery = negativeKeywords.map(nk => `NOT "${nk.trim()}"`).join(' ');
        query = `${query} ${negativeQuery}`;
    }

    return query;
};

// [NEW] Helper function to transform Reddit API post data into our RawLead format.
const transformPostToRawLead = (post: any): RawLead => ({
    id: post.id,
    title: post.title,
    author: post.author.name,
    subreddit: post.subreddit.display_name,
    url: `https://www.reddit.com${post.permalink}`,
    body: post.selftext,
    createdAt: post.created_utc,
    numComments: post.num_comments,
    upvoteRatio: post.upvote_ratio,
    authorKarma: (post.author.link_karma || 0) + (post.author.comment_karma || 0),
    type: 'DIRECT_LEAD'
});


/**
 * [NEW] A unified search function that executes the advanced query.
 */
const executeAdvancedSearch = async (query: string): Promise<RawLead[]> => {
    try {
        const reddit = await getAppAuthenticatedInstance();
        console.log(`[Reddit Service] Executing advanced search: ${query.substring(0, 120)}...`);
        
        const searchResults = await reddit.search({
            query: query,
            sort: 'new',
            time: 'month',
            limit: 100,
        });

        const uniqueLeads = new Map<string, RawLead>();
        searchResults.forEach(post => {
            if (!uniqueLeads.has(post.id)) {
                uniqueLeads.set(post.id, transformPostToRawLead(post));
            }
        });

        const leadsArray = Array.from(uniqueLeads.values());
        console.log(`[Reddit Service] Found ${leadsArray.length} unique posts from advanced search.`);
        return leadsArray;

    } catch (error) {
        console.error('[Reddit Service] A critical error occurred during advanced search.', error);
        return [];
    }
};

/**
 * [UPGRADED] findLeadsGlobally now uses the new, more intelligent search logic.
 * The old, complex multi-query logic has been replaced.
 */
export const findLeadsGlobally = async (
    keywords: string[],
    negativeKeywords: string[],
    subredditBlacklist: string[],
    businessDescription?: string // Kept for signature compatibility
): Promise<RawLead[]> => {
    console.log(`[Global Search] Starting comprehensive Reddit search with new advanced logic.`);
    const allNegativeKeywords = [
        ...negativeKeywords,
        ...subredditBlacklist.map(sub => `-subreddit:${sub.trim()}`)
    ];
    const query = buildAdvancedSearchQuery(keywords, allNegativeKeywords);
    return executeAdvancedSearch(query);
};

/**
 * [UPGRADED] findLeadsOnReddit now uses the new, more intelligent search logic.
 */
export const findLeadsOnReddit = async (keywords: string[], subreddits: string[]): Promise<RawLead[]> => {
    console.log(`Starting targeted Reddit search for ${subreddits.length} subreddits with new advanced logic.`);
    const query = buildAdvancedSearchQuery(keywords, [], subreddits);
    return executeAdvancedSearch(query);
};


// --- ALL FUNCTIONS BELOW ARE PRESERVED FROM YOUR ORIGINAL FILE ---
// --- This ensures no existing functionality is broken. ---

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
