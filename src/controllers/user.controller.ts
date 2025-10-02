// src/controllers/user.controller.ts
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/express';

const prisma = new PrismaClient();

export const deleteCurrentUser: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        console.log(`✅ Successfully deleted user ${userId} from local database.`);

        await clerkClient.users.deleteUser(userId);
        console.log(`✅ Successfully deleted user ${userId} from Clerk.`);

        res.status(200).json({ message: 'User account deleted successfully.' });
        return;

    } catch (error) {
        console.error(`❌ Error deleting user ${userId}:`, error);
        next(error);
    }
};

export const updateCurrentUser: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { firstName, lastName, publicMetadata } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        // Update Clerk user
        const clerkUser = await clerkClient.users.updateUser(userId, {
            firstName,
            lastName,
            publicMetadata,
        });

        // Update your database
        const dbUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
            },
        });

        res.status(200).json({ clerkUser, dbUser });
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        next(error);
    }
};

export const syncRedditConnection: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        // Get user data from database
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                hasConnectedReddit: true,
                redditUsername: true,
                redditKarma: true
            }
        });

        if (!dbUser) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        // Sync Clerk metadata with database state
        const metadataPayload = {
            publicMetadata: {
                hasConnectedReddit: dbUser.hasConnectedReddit,
                redditUsername: dbUser.redditUsername,
                redditKarma: dbUser.redditKarma
            }
        };

        console.log(`[Sync] Syncing Reddit connection for user ${userId}:`, metadataPayload);

        await clerkClient.users.updateUser(userId, metadataPayload);

        res.status(200).json({ 
            message: 'Reddit connection synced successfully',
            hasConnectedReddit: dbUser.hasConnectedReddit,
            redditUsername: dbUser.redditUsername,
            redditKarma: dbUser.redditKarma
        });
    } catch (error) {
        console.error(`Error syncing Reddit connection for user ${userId}:`, error);
        next(error);
    }
};