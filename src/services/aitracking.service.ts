import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USAGE_LIMITS = {
    reply:    { 
      basic: 5, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 999999,  // Starter - unlimited
      'pdt_jhcgzC7RawLnUVJr4bn0a': 999999,  // Pro - unlimited
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999   // Ultimate - unlimited
    },
    intent:   { 
      basic: 0, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 500, 
      'pdt_jhcgzC7RawLnUVJr4bn0a': 5000, 
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999 
    },
    sentiment:{ 
      basic: 0, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 500, 
      'pdt_jhcgzC7RawLnUVJr4bn0a': 5000, 
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999 
    },
    keywords: { 
      basic: 5, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 30, 
      'pdt_jhcgzC7RawLnUVJr4bn0a': 200, 
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999 
    },
    competitor: { 
      basic: 0, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 0, 
      'pdt_jhcgzC7RawLnUVJr4bn0a': 3000, 
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999 
    },
    manual_discovery: { 
      basic: 1, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 25, 
      'pdt_jhcgzC7RawLnUVJr4bn0a': 1000, 
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999 
    },
    scheduled_discovery: { 
      basic: 0, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 200, 
      'pdt_jhcgzC7RawLnUVJr4bn0a': 5000, 
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999 
    },
    summary: { 
      basic: 5, 
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 999999,  // Starter - unlimited
      'pdt_jhcgzC7RawLnUVJr4bn0a': 999999,  // Pro - unlimited
      'pdt_mXpMfglw1fhJpQGW2AFnj': 999999   // Ultimate - unlimited
    }
  };

type AIUsageType = 'intent' | 'sentiment' | 'reply' | 'keywords' | 'competitor' | 'manual_discovery' | 'scheduled_discovery' | 'summary';

export class AIUsageService {
    private static instance: AIUsageService;

    private constructor() {}

    public static getInstance(): AIUsageService {
        if (!AIUsageService.instance) {
            AIUsageService.instance = new AIUsageService();
        }
        return AIUsageService.instance;
    }

    private getLimit(plan: string, type: AIUsageType): number {
        const planKey = plan as 'basic' | 'pdt_2A3SVJeAnBgj8XjLeoiaR' | 'pdt_jhcgzC7RawLnUVJr4bn0a' | 'pdt_mXpMfglw1fhJpQGW2AFnj';
        return USAGE_LIMITS[type][planKey] ?? 0;
    }

    public async trackAIUsage(userId: string, type: AIUsageType, userPlan: string): Promise<boolean> {
        console.log(`[AI Usage] Tracking ${type} for user ${userId} with plan ${userPlan}`);
        
        // First, let's verify the user's actual plan from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true, subscriptionStatus: true }
        });
        
        if (user) {
            console.log(`[AI Usage] User ${userId} actual plan from DB: ${user.plan}, subscription: ${user.subscriptionStatus}`);
            // Use the actual plan from database, not the passed parameter
            userPlan = user.plan;
        } else {
            console.log(`[AI Usage] User ${userId} not found in database, using passed plan: ${userPlan}`);
        }
        
        const limit = this.getLimit(userPlan, type);
        console.log(`[AI Usage] Limit for ${type} on plan ${userPlan}: ${limit}`);
        
        if (limit === 0) {
            console.log(`[AI Usage] Limit is 0 for ${type} on plan ${userPlan}, returning false`);
            return false;
        }

        const month = new Date().toISOString().slice(0, 7); // YYYY-MM format
        console.log(`[AI Usage] Checking usage for month ${month}`);

        try {
            // First, get or create the usage record
            const usage = await prisma.aIUsage.upsert({
                where: { userId_month_type: { userId, month, type } },
                update: {},
                create: { userId, month, type, count: 0 },
            });

            console.log(`[AI Usage] Current usage: ${usage.count}/${limit}`);

            // Check if limit is already reached
            if (usage.count >= limit) {
                console.log(`[Usage Limit] User ${userId} reached limit for ${type} (${usage.count}/${limit})`);
                return false; // Limit reached
            }

            // Atomically increment the count and check if it exceeds the limit
            const updatedUsage = await prisma.aIUsage.update({
                where: { userId_month_type: { userId, month, type } },
                data: { count: { increment: 1 } },
            });

            console.log(`[AI Usage] Updated usage: ${updatedUsage.count}/${limit}`);

            // Double-check if we exceeded the limit after increment
            if (updatedUsage.count > limit) {
                console.log(`[Usage Limit] User ${userId} exceeded limit for ${type} (${updatedUsage.count}/${limit})`);
                // Rollback the increment
                await prisma.aIUsage.update({
                    where: { userId_month_type: { userId, month, type } },
                    data: { count: { decrement: 1 } },
                });
                return false;
            }

            console.log(`[AI Usage] Successfully tracked ${type} for user ${userId}`);
            return true; // Within limit
        } catch (error) {
            console.error(`[AI Usage] Error tracking usage for ${type}:`, error);
            return false; // Fail safe - don't allow usage if tracking fails
        }
    }

    public async canUse(userId: string, type: AIUsageType, userPlan: string): Promise<boolean> {
        const limit = this.getLimit(userPlan, type);
        if (limit === 0 && type !== 'manual_discovery') return false; // Allow free discovery runs
        if (limit === 0 && type === 'manual_discovery' && userPlan !== 'free') return true; // Pro/Starter have higher limits

        const month = new Date().toISOString().slice(0, 7);

        const usage = await prisma.aIUsage.findUnique({
            where: { userId_month_type: { userId, month, type } },
        });

        return !usage || usage.count < limit;
    }
}