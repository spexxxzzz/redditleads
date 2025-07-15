import snoowrap from 'snoowrap';

// This variable will hold our verified snoowrap instance.
let r: snoowrap | null = null;

/**
 * Initializes and verifies the main application-level snoowrap instance.
 * It tries to authenticate and will throw a clear error if credentials are bad.
 * This prevents silent failures where searches return empty results.
 */
const getAppAuthenticatedInstance = async (): Promise<snoowrap> => {
    // If we already have a verified instance, reuse it.
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

        // --- THE CRITICAL VERIFICATION STEP ---
        // We ask Reddit "who am I?". If this fails, the credentials are bad.
        //@ts-expect-error
        const me = await tempR.getMe();
        console.log(`✅ Reddit credentials verified for user: u/${me.name}`);
        
        // Store the verified instance for future use.
        r = tempR;
        // --- FIX: Return the locally scoped constant to break the type inference cycle. ---
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


import { RawLead } from '../types/reddit.types';

// ... (existing code for getAppAuthenticatedInstance) ...

/**
 * Finds leads on Reddit based on a set of keywords and subreddits.
 * @param keywords A list of keywords to search for.
 * @param subreddits A list of subreddits to search within.
 * @returns A promise that resolves to an array of RawLead objects.
 */
export const findLeadsOnReddit = async (keywords: string[], subreddits: string[]): Promise<RawLead[]> => {
    try {
        const r = await getAppAuthenticatedInstance();
        console.log(`Starting Reddit search for ${subreddits.length} subreddits.`);

        const searchQuery = keywords.join(' OR ');
        console.log(`  -> Using search query: "${searchQuery}"`);

        const searchPromises = subreddits.map(async (subreddit) => {
            try {
                const searchResults = await r.getSubreddit(subreddit).search({
                    query: searchQuery,
                    sort: 'new',
                    time: 'month',
                });
                return searchResults.map((post): RawLead => ({ // FIX: Explicitly map to RawLead type
                    id: post.id,
                    title: post.title,
                    author: post.author.name,
                    subreddit: post.subreddit.display_name,
                    url: post.url,
                    body: post.selftext,
                    createdAt: post.created_utc,
                    numComments: post.num_comments,
                    upvoteRatio: post.upvote_ratio,
                    authorKarma: post.author.link_karma > 0, // FIX: Convert karma to boolean
                    type: 'DIRECT_LEAD' // FIX: Add the required 'type' property
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

// ... (rest of the file) ...

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


// ... keep your existing getAppAuthenticatedInstance function ...

/**
 * Creates a user-specific Reddit instance
 */
const getUserAuthenticatedInstance = (userRefreshToken: string) => {
    return new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT!,
        clientId: process.env.REDDIT_CLIENT_ID!,
        clientSecret: process.env.REDDIT_CLIENT_SECRET!,
        refreshToken: userRefreshToken,
    });
};

/**
 * Posts a reply using the user's own Reddit account
 */
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

/**
 * Gets user's current karma using their own tokens
 */
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

/**
 * Checks if user has enough karma to post
 */
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

