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
    // --- THIS IS THE FIX ---
    // We are collecting submissions into a simple array, so the type should be Submission[].
    const allPosts: snoowrap.Submission[] = [];

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
            // The searchResults is a Listing, which is array-like. We spread its contents into our simple array.
            allPosts.push(...searchResults);
        } catch (error: any) {
            // If a single subreddit fails, log a warning and continue to the next one.
            console.warn(`⚠️  Could not search subreddit 'r/${subreddit}'. It might be private, banned, or non-existent. Skipping.`);
            // For deeper debugging, you can uncomment the line below:
            // console.error(`   Reddit API error for r/${subreddit}:`, error.message);
        }
    }

    console.log(`Reddit search complete. Found ${allPosts.length} total posts before filtering.`);

    // Map the raw post data to our desired Lead format.
    return allPosts.map(post => ({
        id: post.id,
        title: post.title,
        author: post.author?.name ?? '[deleted]',
        subreddit: post.subreddit?.display_name ?? '[unknown]',
        // Provide a fallback for the URL if permalink is missing
        url: post.permalink ? `https://reddit.com${post.permalink}` : `https://www.reddit.com/r/${post.subreddit?.display_name ?? 'unknown'}/comments/${post.id}`,
        body: post.selftext,
        createdAt: post.created_utc,
        // Provide default values for numeric fields to prevent NaN scores
        numComments: post.num_comments ?? 0,
        upvoteRatio: post.upvote_ratio ?? 0.5, // Default to a neutral 50%
    }));
};