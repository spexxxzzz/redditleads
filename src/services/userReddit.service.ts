import snoowrap from 'snoowrap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    try {
        const r = getUserRedditInstance(userRefreshToken);
        const submission = r.getSubmission(redditPostId);
        const comment: any = await submission.reply(content);
        return comment.name; // Reddit comment ID
    } catch (error: any) {
        console.error(`[User Reddit] Failed to post reply:`, error.message);
        throw new Error(`Failed to post reply: ${error.message}`);
    }
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
