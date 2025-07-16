// src/middleware/gateKeeper.ts
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const activePlans = ['pro'];

export const gateKeeper: RequestHandler = async (req: any, res, next) => {
    // Get userId from Clerk's auth object attached by the middleware
    const { userId } = req.auth;

    if (!userId) {
         res.status(401).json({ message: 'Unauthorized: You must be signed in.' });
         return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
             res.status(404).json({ message: 'User not found.' });
             return;
        }

        if (user.plan && activePlans.includes(user.plan) && user.subscriptionStatus === 'active') {
            next();
        } else {
             res.status(403).json({
                message: 'Forbidden: This feature requires a Pro subscription.',
                upgradeUrl: '/billing'
            });
            return;
        }
    } catch (error) {
        next(error);
    }
};