import snoowrap from 'snoowrap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sleep utility for delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            
            // Don't retry on authentication errors
            if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
                throw error;
            }
            
            // Don't retry on the last attempt
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Calculate delay with exponential backoff
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`[User Reddit] Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms delay`);
            await sleep(delay);
        }
    }
    
    throw lastError;
};

/**
 * Creates a Reddit instance authenticated with a specific user's refresh token
 */
export const getUserRedditInstance = (refreshToken: string): snoowrap => {
    return new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT!,
        clientId: process.env.REDDIT_CLIENT_ID!,
        clientSecret: process.env.REDDIT_CLIENT_SECRET!,
        refreshToken: refreshToken
    });
};

/**
 * Posts a reply to a Reddit post using the user's Reddit account
 */
export const postReplyToReddit = async (
    userRefreshToken: string,
    redditPostId: string,
    content: string
): Promise<string> => {
    return retryWithBackoff(async () => {
        try {
            const r = getUserRedditInstance(userRefreshToken);
            const submission = r.getSubmission(redditPostId);
            // @ts-ignore - snoowrap type issue with reply method
            const comment = await submission.reply(content);
            return comment.name; // Reddit comment ID
        } catch (error: any) {
            console.error(`[User Reddit] Failed to post reply:`, error.message);
            
            // Handle specific Reddit API errors
            if (error.message && error.message.includes('429')) {
                throw new Error('Reddit rate limit exceeded. Please wait 1-2 minutes before posting again. Reddit allows 1 comment per minute per account.');
            } else if (error.message && error.message.includes('403')) {
                throw new Error('Reddit access denied. Your Reddit account may need to verify email or have sufficient karma.');
            } else if (error.message && error.message.includes('401')) {
                throw new Error('Reddit authentication failed. Please reconnect your Reddit account.');
            }
            
            throw new Error(`Failed to post reply: ${error.message}`);
        }
    }, 2, 2000); // 2 retries with 2 second base delay
};

/**
 * Gets user's Reddit instance for background workers
 */
export const getAppAuthenticatedInstance = async (userId: string): Promise<snoowrap | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { redditRefreshToken: true }
        });

        if (!user?.redditRefreshToken) {
            console.log(`[User Reddit] No Reddit token found for user ${userId}`);
            return null;
        }

        return getUserRedditInstance(user.redditRefreshToken);
    } catch (error: any) {
        console.error(`[User Reddit] Failed to get user Reddit instance:`, error.message);
        return null;
    }
};

/**
 * Checks if a user has Reddit connected
 */
export const isUserRedditConnected = async (userId: string): Promise<boolean> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { hasConnectedReddit: true, redditRefreshToken: true }
        });

        return !!(user?.hasConnectedReddit && user?.redditRefreshToken);
    } catch (error: any) {
        console.error(`[User Reddit] Failed to check Reddit connection:`, error.message);
        return false;
    }
};

/**
 * Gets user's Reddit username
 */
export const getUserRedditUsername = async (userId: string): Promise<string | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { redditUsername: true }
        });

        return user?.redditUsername || null;
    } catch (error: any) {
        console.error(`[User Reddit] Failed to get Reddit username:`, error.message);
        return null;
    }
};
