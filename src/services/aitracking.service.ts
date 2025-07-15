// Create new service for AI 
// 
// 
// 

import { PrismaClient } from "@prisma/client";

// usage tracking
const prisma = new PrismaClient();
export class AIUsageService {
    private static instance: AIUsageService;
    private usageCache = new Map<string, { count: number, resetDate: Date }>();

    public static getInstance(): AIUsageService {
        if (!AIUsageService.instance) {
            AIUsageService.instance = new AIUsageService();
        }
        return AIUsageService.instance;
    }

    async trackAIUsage(userId: string, type: 'reply' | 'intent' | 'competitor'): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return false;

        const limits = this.getAILimits(user.plan);
        const usage = await this.getCurrentUsage(userId, type);
        
        if (usage >= limits[type]) {
            console.log(`❌ AI usage limit exceeded for user ${userId} (${type})`);
            return false;
        }

        await this.incrementUsage(userId, type);
        return true;
    }

    private getAILimits(plan: string): Record<string, number> {
        switch (plan) {
            case 'free': return { reply: 0, intent: 0, competitor: 0 };
            case 'starter': return { reply: 75, intent: 200, competitor: 0 };
            case 'pro': return { reply: 300, intent: 1000, competitor: 100 };
            default: return { reply: 0, intent: 0, competitor: 0 };
        }
    }

    private async getCurrentUsage(userId: string, type: string): Promise<number> {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const usage = await prisma.aIUsage.findUnique({
            where: {
                userId_month_type: {
                    userId,
                    month: currentMonth,
                    type
                }
            }
        });

        return usage?.count || 0;
    }

    private async incrementUsage(userId: string, type: string): Promise<void> {
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        await prisma.aIUsage.upsert({
            where: {
                userId_month_type: {
                    userId,
                    month: currentMonth,
                    type
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                userId,
                month: currentMonth,
                type,
                count: 1
            }
        });
    }
}