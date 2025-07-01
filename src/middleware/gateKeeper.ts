import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A list of plans that are considered "active" and paid.
const activePlans = ['pro']; 

export const gateKeeper: RequestHandler = async (req, res, next) => {
    // NOTE: In a real app, you would get userId from a JWT token or session.
    // For now, we will assume it's passed in a header for testing.
    const userId = "clerk_test_user_123";

    if (!userId) {
         res.status(401).json({ message: 'Unauthorized: User ID not provided.' });
         return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
             res.status(404).json({ message: 'User not found.' });
             return;
        }

        // Check if the user's plan is in the list of active, paid plans.
        if (user.plan && activePlans.includes(user.plan) && user.subscriptionStatus === 'active') {
            // User has an active subscription, allow them to proceed.
            next();
        } else {
            // User is on a free plan or their subscription is inactive.
             res.status(403).json({ 
                message: 'Forbidden: This feature requires a Pro subscription.',
                upgradeUrl: '/billing' // A helpful link for the frontend
            });
            return;
        }
    } catch (error) {
        next(error);
    }
};