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


export const findLeadsOnReddit = async (keywords: string[], subreddits: string[]) => {
    try {
        // --- FIX: Always get a verified instance before searching ---
        const reddit = await getAppAuthenticatedInstance();
        const searchQuery = keywords.map(k => `"${k}"`).join(' OR ');
        const allPosts: any[] = [];

        console.log(`Starting Reddit search for ${subreddits.length} subreddits.`);
        console.log(`  -> Using search query: ${searchQuery}`);

        for (const subreddit of subreddits) {
            try {
                const searchResults = await reddit.getSubreddit(subreddit).search({ 
                    query: searchQuery, 
                    sort: 'new', 
                    time: 'month' 
                });
                const resultsArray = await searchResults.fetchAll();
                allPosts.push(...resultsArray);
            } catch (error: any) {
                console.warn(`⚠️  Could not search subreddit 'r/${subreddit}'. It might be private, banned, or non-existent. Skipping.`);
            }
        }

        console.log(`Reddit search complete. Found ${allPosts.length} total posts before filtering.`);

        return allPosts.map((post: any) => ({
            id: post.id,
            title: post.title,
            author: post.author?.name ?? '[deleted]',
            subreddit: post.subreddit?.display_name ?? '[unknown]',
            url: post.permalink ? `https://reddit.com${post.permalink}` : `https://www.reddit.com/r/${post.subreddit?.display_name ?? 'unknown'}/comments/${post.id}`,
            body: post.selftext,
            createdAt: post.created_utc,
            numComments: post.num_comments ?? 0,
            upvoteRatio: post.upvote_ratio ?? 0.5,
        }));

    } catch (error) {
        // If authentication failed, this will catch it and prevent the worker from crashing.
        console.error("Could not perform Reddit search due to an error.", error);
        return []; // Return an empty array to allow the worker to continue gracefully.
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
