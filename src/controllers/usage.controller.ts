// src/controllers/usage.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UsageData {
  leads: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  projects: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  aiSummaries: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  aiReplies: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  plan: string;
  planName: string;
}

export class UsageController {
  /**
   * Reset usage data for a user (useful when switching accounts)
   */
  static async resetUserUsage(userId: string): Promise<void> {
    try {
      console.log(`[Usage Reset] Resetting usage data for user ${userId}`);
      
      // Get current month
      const month = new Date().toISOString().slice(0, 7);
      
      // Delete all AI usage records for this user and month
      await prisma.aIUsage.deleteMany({
        where: {
          userId: userId,
          month: month
        }
      });
      
      console.log(`[Usage Reset] Cleared AI usage records for user ${userId} in ${month}`);
    } catch (error) {
      console.error(`[Usage Reset] Error resetting usage for user ${userId}:`, error);
    }
  }

  /**
   * Get user's current usage data for a specific project
   */
  async getProjectUsage(req: any, res: Response) {
    try {
      const auth = await req.auth();
      const userId = auth?.userId;
      const { projectId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      // Check if user exists, create if not (fallback for webhook issues)
      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          plan: true, 
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          email: true
        }
      });

      console.log(`[Project Usage] User ${userId} found in database:`, user);

      if (!user) {
        console.log(`[Project Usage] User ${userId} not found in database, creating user...`);
        
        // Create a basic user record as fallback
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: `user-${userId}@placeholder.local`, // Unique placeholder - will be updated when webhook fires
              firstName: '',
              lastName: '',
              plan: 'basic',
              subscriptionStatus: 'active',
              subscriptionStartDate: new Date(),
              subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            }
          });
          console.log(`[Project Usage] Created fallback user for ${userId}`);
        } catch (createError) {
          console.error(`[Project Usage] Failed to create fallback user:`, createError);
          return res.status(500).json({
            success: false,
            error: 'Failed to create user record'
          });
        }
      }

      const plan = user.plan;
      console.log(`[Project Usage] User plan: ${plan}, subscription status: ${user.subscriptionStatus}`);
      
      const planLimits = UsageController.getPlanLimits(plan);
      console.log(`[Project Usage] Plan limits for ${plan}:`, planLimits);

      // Get current usage counts for this project
      const [projectLeadsCount, projectsCount, aiSummariesCount, aiRepliesCount] = await Promise.all([
        UsageController.getProjectLeadsCount(userId, projectId),
        UsageController.getProjectsCount(userId),
        UsageController.getAISummariesCount(userId),
        UsageController.getAIRepliesCount(userId)
      ]);

      // Calculate usage data
      const usageData: UsageData = {
        leads: UsageController.calculateUsage(projectLeadsCount, planLimits.leadsPerMonth),
        projects: UsageController.calculateUsage(projectsCount, planLimits.projects),
        aiSummaries: UsageController.calculateUsage(aiSummariesCount, planLimits.aiSummaries),
        aiReplies: UsageController.calculateUsage(aiRepliesCount, planLimits.aiReplies),
        plan: plan,
        planName: UsageController.getPlanName(plan)
      };

      // Add cache control headers to prevent stale data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.json({
        success: true,
        data: usageData
      });
    } catch (error: any) {
      console.error('Error getting project usage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get project usage data'
      });
    }
  }

  /**
   * Get user's current usage data
   */
  async getUserUsage(req: any, res: Response) {
    try {
      const auth = await req.auth();
      const userId = auth?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Check if user exists, create if not (fallback for webhook issues)
      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          plan: true, 
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          email: true
        }
      });

      console.log(`[Usage] User ${userId} found in database:`, user);

      if (!user) {
        console.log(`[Usage] User ${userId} not found in database, creating user...`);
        
        // Create a basic user record as fallback
        try {
          user = await prisma.user.create({
            data: {
              id: userId,
              email: `user-${userId}@placeholder.local`, // Unique placeholder - will be updated when webhook fires
              firstName: '',
              lastName: '',
              subscriptionStatus: 'inactive',
              plan: 'basic',
            },
            select: { 
              plan: true, 
              subscriptionStatus: true,
              subscriptionStartDate: true,
              subscriptionEndDate: true,
              email: true
            }
          });
          console.log(`[Usage] Created user ${userId} with basic (free) plan`);
        } catch (createError) {
          console.error(`[Usage] Failed to create user ${userId}:`, createError);
          return res.status(500).json({
            success: false,
            error: 'Failed to create user account'
          });
        }
      }

      const plan = user.plan;
      console.log(`[Usage] User plan: ${plan}, subscription status: ${user.subscriptionStatus}`);
      
      const planLimits = UsageController.getPlanLimits(plan);
      console.log(`[Usage] Plan limits for ${plan}:`, planLimits);

      // Get current usage counts
      const [leadsCount, projectsCount, aiSummariesCount, aiRepliesCount] = await Promise.all([
        UsageController.getLeadsCount(userId),
        UsageController.getProjectsCount(userId),
        UsageController.getAISummariesCount(userId),
        UsageController.getAIRepliesCount(userId)
      ]);

      // Calculate usage data
      const usageData: UsageData = {
        leads: UsageController.calculateUsage(leadsCount, planLimits.leadsPerMonth),
        projects: UsageController.calculateUsage(projectsCount, planLimits.projects),
        aiSummaries: UsageController.calculateUsage(aiSummariesCount, planLimits.aiSummaries),
        aiReplies: UsageController.calculateUsage(aiRepliesCount, planLimits.aiReplies),
        plan: plan,
        planName: UsageController.getPlanName(plan)
      };

      // Add cache control headers to prevent stale data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.json({
        success: true,
        data: usageData
      });
    } catch (error: any) {
      console.error('Error getting user usage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get usage data'
      });
    }
  }

  /**
   * Get plan limits based on plan type
   */
  private static getPlanLimits(plan: string): {
    leadsPerMonth: number | 'unlimited';
    projects: number | 'unlimited';
    aiSummaries: number | 'unlimited';
    aiReplies: number | 'unlimited';
  } {
    const limits = {
      // Basic plan (free)
      basic: {
        leadsPerMonth: 25 as number | 'unlimited',
        projects: 3 as number | 'unlimited',
        aiSummaries: 5 as number | 'unlimited',
        aiReplies: 5 as number | 'unlimited'
      },
      // Starter plan
      'pdt_2A3SVJeAnBgj8XjLeoiaR': {
        leadsPerMonth: 500 as number | 'unlimited',
        projects: 1 as number | 'unlimited',
        aiSummaries: 'unlimited' as number | 'unlimited',
        aiReplies: 'unlimited' as number | 'unlimited'
      },
      // Pro plan
      'pdt_jhcgzC7RawLnUVJr4bn0a': {
        leadsPerMonth: 5000 as number | 'unlimited',
        projects: 5 as number | 'unlimited',
        aiSummaries: 'unlimited' as number | 'unlimited',
        aiReplies: 'unlimited' as number | 'unlimited'
      },
      // Ultimate plan
      'pdt_mXpMfglw1fhJpQGW2AFnj': {
        leadsPerMonth: 'unlimited' as number | 'unlimited',
        projects: 'unlimited' as number | 'unlimited',
        aiSummaries: 'unlimited' as number | 'unlimited',
        aiReplies: 'unlimited' as number | 'unlimited'
      }
    };

    return limits[plan as keyof typeof limits] || limits.basic;
  }

  /**
   * Get plan display name
   */
  private static getPlanName(plan: string): string {
    const planNames = {
      basic: 'Basic',
      'pdt_2A3SVJeAnBgj8XjLeoiaR': 'Starter',
      'pdt_jhcgzC7RawLnUVJr4bn0a': 'Pro',
      'pdt_mXpMfglw1fhJpQGW2AFnj': 'Ultimate'
    };
    return planNames[plan as keyof typeof planNames] || 'Basic';
  }

  /**
   * Calculate usage data for a specific feature
   */
  private static calculateUsage(current: number, limit: number | 'unlimited'): {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  } {
    if (limit === 'unlimited') {
      return {
        current,
        limit: 'unlimited' as 'unlimited',
        percentage: 0,
        isUnlimited: true
      };
    }

    const percentage = Math.min((current / limit) * 100, 100);
    
    return {
      current,
      limit,
      percentage: Math.round(percentage),
      isUnlimited: false
    };
  }

  /**
   * Get leads count for current month
   */
  private static async getLeadsCount(userId: string): Promise<number> {
    // Count ALL leads for the user, not just current month
    // This ensures sync with the main dashboard which shows all leads
    return await prisma.lead.count({
      where: {
        userId
      }
    });
  }

  /**
   * Get leads count for a specific project
   */
  private static async getProjectLeadsCount(userId: string, projectId: string): Promise<number> {
    return await prisma.lead.count({
      where: {
        userId,
        projectId
      }
    });
  }

  /**
   * Get projects count
   */
  private static async getProjectsCount(userId: string): Promise<number> {
    return await prisma.project.count({
      where: { userId }
    });
  }

  /**
   * Get AI summaries count for current month
   */
  private static async getAISummariesCount(userId: string): Promise<number> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const usage = await prisma.aIUsage.findFirst({
      where: {
        userId,
        month: currentMonth,
        type: 'summary'
      }
    });

    return usage?.count || 0;
  }

  /**
   * Get AI replies count for current month
   */
  private static async getAIRepliesCount(userId: string): Promise<number> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const usage = await prisma.aIUsage.findFirst({
      where: {
        userId,
        month: currentMonth,
        type: 'reply'
      }
    });

    return usage?.count || 0;
  }
}

export const usageController = new UsageController();
