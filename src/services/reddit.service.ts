import snoowrap from 'snoowrap';

const r = new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT!,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN!
});

export const findLeadsOnReddit = async (keywords: string[], subreddits: string[]) => {
    try {
        const searchQuery = keywords.join(' OR ');
        const searchPromises = subreddits.map(subreddit => 
            r.getSubreddit(subreddit).search({ query: searchQuery, sort: 'new', time: 'week' })
        );

        const searchResults = await Promise.all(searchPromises);
        const posts = searchResults.flat();

        return posts.map(post => ({
            id: post.id,
            title: post.title,
            // Use optional chaining (?.) to safely access .name
            // Use nullish coalescing (??) to provide a fallback value
            author: post.author?.name ?? '[deleted]',
            subreddit: post.subreddit?.display_name ?? '[unknown]', // Also make this defensive
            url: `https://reddit.com${post.permalink}`,
            body: post.selftext,
            createdAt: post.created_utc, // Unix timestamp (seconds)
            numComments: post.num_comments,
            upvoteRatio: post.upvote_ratio,
        }));
    
    }catch (error: any) { // Catch the error to inspect it
        // --- IMPROVED LOGGING ---
        // Log the detailed error from the Reddit API to your console
        console.error("--- Reddit API Error Details ---");
        console.error("Status:", error.statusCode); // e.g., 401 for Unauthorized
        console.error("Message:", error.message);   // e.g., "invalid_grant"
        console.error("------------------------------");

        // Throw a more informative error to the controller
        throw new Error(`Failed to fetch from Reddit (Status: ${error.statusCode}). Check console for details.`);
    }
};