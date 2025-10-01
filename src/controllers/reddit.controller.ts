// src/controllers/reddit.controller.ts
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import snoowrap from 'snoowrap';
import { clerkClient } from '@clerk/express';
import crypto from 'crypto';
import { postReplyToReddit, isUserRedditConnected } from '../services/userReddit.service';

const prisma = new PrismaClient();

// This function now generates a secure, random state and stores it.
export const getRedditAuthUrl: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        const state = crypto.randomBytes(16).toString('hex');
        await prisma.user.update({
            where: { id: userId },
            data: { redditAuthState: state }
        });

        const authUrl = snoowrap.getAuthUrl({
            clientId: process.env.REDDIT_CLIENT_ID!,
            scope: ['identity', 'read', 'submit', 'history', 'edit'], // Added 'edit' scope
            redirectUri: process.env.REDDIT_REDIRECT_URI!,
            permanent: true,
            state: state
        });

        res.json({ authUrl });
        return;
    } catch (error) {
        next(error);
    }
};

// This function now securely verifies the state and stores the refresh token.
export const handleRedditCallback: RequestHandler = async (req, res, next) => {
    const { code, state } = req.query;
    if (!code || !state) {
        res.status(400).json({ message: 'Missing authorization code or state' });
        return;
    }

    try {
        const user = await prisma.user.findFirst({
            where: { redditAuthState: state as string }
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid state parameter. Authentication failed.' });
            return;
        }

        const r = await snoowrap.fromAuthCode({
            code: code as string,
            userAgent: process.env.REDDIT_USER_AGENT!,
            clientId: process.env.REDDIT_CLIENT_ID!,
            clientSecret: process.env.REDDIT_CLIENT_SECRET!,
            redirectUri: process.env.REDDIT_REDIRECT_URI!
        });
        //@ts-expect-error
        const me = await r.getMe();
        
        // Update user with tokens and mark reddit as connected
        await prisma.user.update({
            where: { id: user.id },
            data: {
                redditUsername: me.name,
                redditRefreshToken: r.refreshToken,
                redditAuthState: null, // Clear the state
                hasConnectedReddit: true // Mark as connected
            }
        });
        // Update Clerk's public metadata to reflect Reddit connection
        await clerkClient.users.updateUser(user.id, {
            publicMetadata: {
                hasConnectedReddit: true, // Set the flag here
                redditUsername: me.name,
            }
        });
        const metadataPayload = {
            publicMetadata: {
                hasConnectedReddit: true,
                redditUsername: me.name,
            }
        };

        console.log(`[LOG] Backend: Attempting to update Clerk metadata for user ${user.id} with payload:`, metadataPayload);

        
        // Also update Clerk's public metadata for easy frontend access
        await clerkClient.users.updateUser(user.id, {
            publicMetadata: {
                redditUsername: me.name,
            }
        });

        console.log(`[LOG] Backend: Successfully called clerkClient.users.updateUser for user ${user.id}.`);
        

        console.log(`✅ Reddit account connected for user ${user.id}: u/${me.name}`);
        res.redirect(`${process.env.FRONTEND_URL}/connect-reddit?status=success`);
        return;
        
    } catch (error) {
        console.error('Error in Reddit callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard/settings?error=reddit`);
        return;
    }
};

/**
 * Disconnects user's Reddit account
 */
export const disconnectReddit: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                redditUsername: null,
                redditRefreshToken: null,
                redditKarma: null,
                lastKarmaCheck: null,
                hasConnectedReddit: false
            }
        });

        // Update Clerk metadata
        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                hasConnectedReddit: false,
                redditUsername: null,
            }
        });

        res.json({ message: 'Reddit account disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting Reddit:', error);
        next(error);
    }
};

/**
 * Posts a reply to Reddit automatically
 */
export const postReply: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { leadId, content } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!leadId || !content) {
        return res.status(400).json({ message: 'leadId and content are required.' });
    }

    try {
        // Check if user has Reddit connected
        const isConnected = await isUserRedditConnected(userId);
        if (!isConnected) {
            return res.status(400).json({ message: 'Reddit account not connected. Please connect your Reddit account first.' });
        }

        // Get the lead
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, userId: userId }
        });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found.' });
        }

        // Get user's Reddit token
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { redditRefreshToken: true }
        });

        if (!user?.redditRefreshToken) {
            return res.status(400).json({ message: 'Reddit authentication not available.' });
        }

        // Post the reply
        const redditCommentId = await postReplyToReddit(
            user.redditRefreshToken,
            lead.redditId,
            content
        );

        // Create scheduled reply record
        const scheduledReply = await prisma.scheduledReply.create({
            data: {
                content,
                status: 'POSTED',
                scheduledAt: new Date(),
                postedAt: new Date(),
                redditPostId: redditCommentId,
                lead: { connect: { id: lead.id } },
                user: { connect: { id: userId } },
            }
        });

        // Update lead status
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: 'replied' }
        });

        // Broadcast reply posted webhook event
        try {
            const { webhookService } = await import('../services/webhook.service');
            await webhookService.broadcastEvent('lead.replied', {
                leadId: lead.id,
                replyText: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                projectId: lead.projectId,
                subreddit: lead.subreddit,
                redditCommentId: redditCommentId,
                leadTitle: lead.title,
                leadUrl: lead.url
            }, userId, lead.projectId, 'low');
            console.log(`📡 [Post Reply] Reply posted webhook broadcasted for lead ${leadId}`);
        } catch (webhookError) {
            console.error(`❌ [Post Reply] Failed to broadcast reply posted webhook:`, webhookError);
        }

        res.json({ 
            message: 'Reply posted successfully',
            redditCommentId,
            scheduledReplyId: scheduledReply.id
        });

    } catch (error: any) {
        console.error('❌ [Post Reply] Error:', error);
        
        // Create failed reply record
        try {
            await prisma.scheduledReply.create({
                data: {
                    content,
                    status: 'FAILED',
                    failReason: error.message,
                    scheduledAt: new Date(),
                    lead: { connect: { id: leadId } },
                    user: { connect: { id: userId } },
                }
            });
        } catch (dbError) {
            console.error('Failed to create failed reply record:', dbError);
        }

        next(error);
    }
};