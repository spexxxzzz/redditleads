import snoowrap from 'snoowrap';

// Initialize snoowrap with credentials from environment variables
const r = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT!,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN!
});

/**
 * Searches a list of subreddits for posts matching a set of keywords.
 * This function is designed to be resilient and will not crash if one of the
 * subreddits is banned, private, or otherwise inaccessible.
 * 
 * @param keywords An array of keywords to search for.
 * @param subreddits An array of subreddit names (without the 'r/').
 * @returns A promise that resolves to an array of formatted lead objects.
 */
export const findLeadsOnReddit = async (keywords: string[], subreddits: string[]) => {
    const searchQuery = keywords.join(' OR ');
    const allPosts: any[] = [];

    console.log(`Starting Reddit search for ${subreddits.length} subreddits.`);

    // Use a for...of loop to process each subreddit individually.
    // This allows us to handle errors for one subreddit without stopping the entire search.
    for (const subreddit of subreddits) {
        try {
            console.log(`  -> Searching in r/${subreddit}...`);
            const searchResults = await r.getSubreddit(subreddit).search({ 
                query: searchQuery, 
                sort: 'new', 
                time: 'week' 
            });
            // Convert the Listing to array and add to our collection
            const resultsArray = await searchResults.fetchAll();
            allPosts.push(...resultsArray);
        } catch (error: any) {
            // If a single subreddit fails, log a warning and continue to the next one.
            console.warn(`⚠️  Could not search subreddit 'r/${subreddit}'. It might be private, banned, or non-existent. Skipping.`);
        }
    }

    console.log(`Reddit search complete. Found ${allPosts.length} total posts before filtering.`);

    // Map the raw post data to our desired Lead format.
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
};

/**
 * Creates a temporary snoowrap instance authenticated as a specific user.
 * This is critical for performing actions on behalf of a user.
 * @param userRefreshToken The user's securely stored refresh token.
 * @returns A user-authenticated snoowrap instance.
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
 * Posts a reply to a Reddit submission or comment on behalf of a user.
 * @param parentId The full ID of the post or comment to reply to (e.g., 't3_xxxx' or 't1_yyyy').
 * @param text The content of the reply.
 * @param userRefreshToken The refresh token of the user posting the reply.
 * @returns The full ID of the newly created comment.
 */
export const postReply = async (parentId: string, text: string, userRefreshToken: string): Promise<string> => {
    try {
        const userR = getUserAuthenticatedInstance(userRefreshToken);
        
        // Use type assertion to avoid TypeScript recursion issues
        const newComment = await (userR.getComment(parentId).reply(text) as Promise<any>);
        return newComment.name as string;
    } catch (error: any) {
        console.error(`Failed to post reply to ${parentId}:`, error);
        throw new Error(`Reddit API Error: ${error.message}`);
    }
};

/**
 * Fetches the karma for a specific user.
 * @param userRefreshToken The refresh token of the user.
 * @returns The user's combined karma count.
 */
export const getUserKarma = async (userRefreshToken: string): Promise<number> => {
    try {
        const userR = getUserAuthenticatedInstance(userRefreshToken);
        
        // Use type assertion to avoid TypeScript recursion issues
        const me = await (userR.getMe() as Promise<any>);
        return (me.link_karma || 0) + (me.comment_karma || 0);
    } catch (error: any) {
        console.error(`Failed to fetch user karma:`, error);
        throw new Error(`Reddit API Error while fetching karma: ${error.message}`);
    }
};

/**
 * Checks if a user has enough karma to post safely in most subreddits.
 * @param userRefreshToken The refresh token of the user.
 * @param minimumKarma The minimum karma threshold (default: 10).
 * @returns Whether the user meets the karma requirement.
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

/**
 * Gets optimal posting time based on subreddit activity (simplified version).
 * In a real implementation, this would analyze historical data.
 * @param subredditName The name of the subreddit.
 * @returns A delay in minutes before posting for optimal engagement.
 */
export const getOptimalPostingDelay = (subredditName: string): number => {
    // Simplified logic - in production, this would use historical data
    const popularSubreddits = ['askreddit', 'todayilearned', 'worldnews', 'pics'];
    
    if (popularSubreddits.includes(subredditName.toLowerCase())) {
        // For popular subreddits, post immediately as competition is high
        return 0;
    } else {
        // For smaller subreddits, wait 5-15 minutes for better visibility
        return Math.floor(Math.random() * 10) + 5;
    }
};

 
/**
 * Fetches the full details of a specific comment by its ID.
 * @param commentId The full ID of the comment (e.g., 't1_xxxxxx').
 * @returns A snoowrap Comment object.
 */
export const getCommentById = async (commentId: string): Promise<any> => {
    try {
        // We can use the app's global, read-only instance for this.
         const comment = await (r.getComment(commentId).fetch() as Promise<any>);
        return comment;
    } catch (error: any) {
        console.error(`Failed to fetch comment ${commentId}:`, error.message);
        throw new Error(`Reddit API Error: Could not fetch comment ${commentId}.`);
    }
};