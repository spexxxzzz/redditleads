// src/controllers/user.controller.ts
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
// Correctly import clerkClient from the modern Express SDK
import { clerkClient } from '@clerk/express';

const prisma = new PrismaClient();

export const deleteCurrentUser: RequestHandler = async (req: any, res, next) => {
    const { userId } = req.auth;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        // Step 1: Delete the user from your Prisma database.
        await prisma.user.delete({
            where: { id: userId },
        });
        console.log(`✅ Successfully deleted user ${userId} from local database.`);

        // Step 2: Delete the user from Clerk's system using the correct client.
        await clerkClient.users.deleteUser(userId);
        console.log(`✅ Successfully deleted user ${userId} from Clerk.`);

        res.status(200).json({ message: 'User account deleted successfully.' });
        return;

    } catch (error) {
        console.error(`❌ Error deleting user ${userId}:`, error);
        next(error);
    }
};