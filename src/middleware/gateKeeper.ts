import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const activePlans = ['basic', 'pdt_2A3SVJeAnBgj8XjLeoiaR', 'pdt_jhcgzC7RawLnUVJr4bn0a', 'pdt_mXpMfglw1fhJpQGW2AFnj'];

// Simple authentication middleware that just checks for userId
export const authenticateUser: RequestHandler = async (req: any, res, next) => {
    try {
        // Check if req.auth exists and has userId - use req.auth() as a function
        const auth = await req.auth();
        const userId = auth?.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User ID not provided.' });
            return;
        }

        // Add user to request object
        req.user = { id: userId };
        next();
    } catch (error) {
        console.error('🔍 Auth Error:', error);
        res.status(401).json({ message: 'Unauthorized: Authentication failed.' });
        return;
    }
}; 

export const gateKeeper: RequestHandler = async (req: any, res, next) => {
    try {
        // Check if req.auth exists and has userId - use req.auth() as a function
        const auth = await req.auth();
        const userId = auth?.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: User ID not provided.' });
            return;
        }
        

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
             res.status(404).json({ message: 'User not found.' });
             return;
        }
        // Allow access for basic plan users regardless of subscription status (it's free)
        // For paid plans, require active subscription status
        const hasAccess = user.plan && activePlans.includes(user.plan) && 
            (user.plan === 'basic' || user.subscriptionStatus === 'active');

        if (hasAccess) {
            next();
        } else {
             res.status(403).json({
                message: 'Forbidden: This feature requires a Pro subscription.',
                upgradeUrl: '/billing'
            });
            return;
        }
    } catch (error) {
        console.error('❌ [ERROR] GateKeeper crashed:', error);
        console.error('❌ [ERROR] GateKeeper Error Stack:', error instanceof Error ? error.stack : 'No stack trace available');
        res.status(500).json({ message: 'Internal server error during authentication.' });
        return;
    }
};