import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define limits for different usage types and plans
const USAGE_LIMITS = {
    competitor: { free: 0, starter: 0, pro: 1 },
    sentiment: { free: 50, starter: 200, pro: 1000 },
    intent: { free: 25, starter: 100, pro: 500 },
    // FIX: Added limits for manual discovery runs
    manual_discovery: { free: 5, starter: 20, pro: 100 }
};

type UsageType = keyof typeof USAGE_LIMITS;

export class AIUsageService {
    private static instance: AIUsageService;

    private constructor() {}

    public static getInstance(): AIUsageService {
        if (!AIUsageService.instance) {
            AIUsageService.instance = new AIUsageService();
        }
        return AIUsageService.instance;
    }

    private getLimit(plan: string, type: UsageType): number {
        const planKey = plan as keyof typeof USAGE_LIMITS[UsageType];
        return USAGE_LIMITS[type][planKey] ?? 0;
    }

    public async trackAIUsage(userId: string, type: UsageType, userPlan: string): Promise<boolean> {
        const limit = this.getLimit(userPlan, type);
        if (limit === 0) return false;

        const month = new Date().toISOString().slice(0, 7); // YYYY-MM format

        const usage = await prisma.aIUsage.findUnique({
            where: { userId_month_type: { userId, month, type } },
        });

        if (usage && usage.count >= limit) {
            console.log(`[Usage Limit] User ${userId} reached limit for ${type} (${usage.count}/${limit})`);
            return false; // Limit reached
        }

        await prisma.aIUsage.upsert({
            where: { userId_month_type: { userId, month, type } },
            update: { count: { increment: 1 } },
            create: { userId, month, type, count: 1 },
        });

        return true; // Within limit
    }

    public async canUse(userId: string, type: UsageType, userPlan: string): Promise<boolean> {
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