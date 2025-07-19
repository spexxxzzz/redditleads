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
    subredditBlacklist: string[]
): Promise<RawLead[]> => {
    try {
        const reddit = await getAppAuthenticatedInstance();
        console.log(`[Global Search] Starting Reddit-wide search.`);

        const keywordQuery = keywords.map(k => `"${k}"`).join(' OR ');
        const negativeKeywordQuery = negativeKeywords.map(kw => `-title:${kw} -selftext:${kw}`).join(' ');
        const blacklistQuery = subredditBlacklist.map(sub => `-subreddit:${sub.trim().toLowerCase()}`).join(' ');

        const finalQuery = `${keywordQuery} ${negativeKeywordQuery} ${blacklistQuery}`.trim();
        console.log(`  -> Global query: ${finalQuery}`);

        let after: string | undefined = undefined;
        let pagesFetched = 0;
        const uniqueLeads = new Map<string, RawLead>();

        while (pagesFetched < MAX_PAGES_TO_FETCH) {
            console.log(`[Global Search] Fetching page ${pagesFetched + 1}...`);
            const searchResults = await reddit.search({
                query: finalQuery,
                sort: 'new',
                time: 'month',
                limit: 100,
                after: after,
            });

            if (searchResults.length === 0) {
                break; 
            }
            
            searchResults.forEach((post) => {
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
            });

            after = searchResults[searchResults.length - 1].name;
            pagesFetched++;
        }

        if (pagesFetched >= MAX_PAGES_TO_FETCH) {
            console.log(`[Global Search] Reached max page limit (${MAX_PAGES_TO_FETCH}). Halting search.`);
        }

        return Array.from(uniqueLeads.values());

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