import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import snoowrap, { RedditUser } from 'snoowrap';

const prisma = new PrismaClient();

/**
 * Generates the Reddit OAuth URL for user authentication
 */
export const getRedditAuthUrl: RequestHandler = async (req, res, next) => {
    const { userId } = req.params;
    
    if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
    }

    try {
        // Generate a unique state parameter for security
        const state = `${userId}-${Date.now()}`;
        
        const authUrl = snoowrap.getAuthUrl({
            clientId: process.env.REDDIT_CLIENT_ID!,
            scope: ['identity', 'read', 'submit', 'history'],
            redirectUri: process.env.REDDIT_REDIRECT_URI!,
            permanent: true,
            state: state
        });

        // Store the state temporarily (you might want to use Redis in production)
        await prisma.user.update({
            where: { id: userId },
            data: { 
                // Store state in a temporary field for verification
                redditUsername: state // We'll use this temporarily
            }
        });

        res.json({ authUrl });
    } catch (error) {
        console.error('Error generating Reddit auth URL:', error);
        next(error);
    }
};

/**
 * Handles the Reddit OAuth callback
 */
export const handleRedditCallback: RequestHandler = async (req, res, next) => {
    const { code, state } = req.query;

    if (!code || !state) {
        res.status(400).json({ message: 'Missing authorization code or state' });
        return;
    }

    try {
        // Extract userId from state
        const [userId] = (state as string).split('-');
        
        // Verify state matches what we stored
        const user  = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.redditUsername !== state) {
            res.status(400).json({ message: 'Invalid state parameter' });
            return;
        }

        // Exchange code for tokens
        const r = await snoowrap.fromAuthCode({
            code: code as string,
            userAgent: process.env.REDDIT_USER_AGENT!,
            clientId: process.env.REDDIT_CLIENT_ID!,
            clientSecret: process.env.REDDIT_CLIENT_SECRET!,
            redirectUri: process.env.REDDIT_REDIRECT_URI!
        });

        // Get user info
        //@ts-expect-error (todo)
        const me = await r.getMe() as RedditUser;

        
        // Store tokens and user info
        await prisma.user.update({
            where: { id: userId },
            data: {
                redditUsername: me.name,
                redditRefreshToken: r.refreshToken,
                redditKarma: (me.link_karma || 0) + (me.comment_karma || 0),
                lastKarmaCheck: new Date()
            }
        });

        console.log(`✅ Reddit account connected for user ${userId}: u/${me.name}`);
        
        // Redirect to dashboard with success message
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?reddit=connected`);
        
    } catch (error) {
        console.error('Error in Reddit callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?reddit=error`);
    }
};

/**
 * Disconnects user's Reddit account
 */
export const disconnectReddit: RequestHandler = async (req, res, next) => {
    const { userId } = req.params;
    
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                redditUsername: null,
                redditRefreshToken: null,
                redditKarma: null,
                lastKarmaCheck: null
            }
        });

        res.json({ message: 'Reddit account disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting Reddit:', error);
        next(error);
    }
};