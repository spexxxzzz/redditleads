import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const activePlans = ['pro', 'starter']; 

export const gateKeeper: RequestHandler = async (req: any, res, next) => {
    
    const { userId } = req.auth;

    if (!userId) {
        
        res.status(401).json({ message: 'Unauthorized: User ID not provided.' });
        return
    }
    
    console.log(`[LOG] GateKeeper Check: Authenticated with userId: ${userId}`);

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
             res.status(404).json({ message: 'User not found.' });
             return
        }
        const hasAccess = user.plan && activePlans.includes(user.plan) && user.subscriptionStatus === 'active';

        if (hasAccess) {
           
            next();
        } else {
             res.status(403).json({
                message: 'Forbidden: This feature requires a Pro subscription.',
                upgradeUrl: '/billing'
            });return;
        }
    } catch (error) {
        console.error('❌ [ERROR] GateKeeper crashed:', error);
        next(error);
    }
};