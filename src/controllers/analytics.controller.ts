import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeadTrends: RequestHandler = async (req: any, res, next) => {
  try {
    const { projectId } = req.params;
    const auth = await req.auth();
    const userId = auth?.userId;

    // Authentication check
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: 'Project ID is required.' });
      return;
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: userId 
      }
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found or you do not have permission to access it.' });
      return;
    }

    // Get leads from last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leads = await prisma.lead.findMany({
      where: {
        projectId,
        userId: userId, // Additional security check
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Group by date
    const trendsMap = new Map<string, number>();
    
    // Initialize with 0 for all days in the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendsMap.set(dateStr, 0);
    }

    // Count leads per day
    leads.forEach(lead => {
      const dateStr = lead.createdAt.toISOString().split('T')[0];
      trendsMap.set(dateStr, (trendsMap.get(dateStr) || 0) + 1);
    });

    // Convert to array format expected by frontend
    const trends = Array.from(trendsMap.entries()).map(([date, leads]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      leads
    }));

    console.log(`📊 [Analytics] User ${userId} fetched lead trends for project ${projectId}`);
    res.json({ data: trends });
  } catch (error) {
    console.error('Error fetching lead trends:', error);
    next(error);
  }
};
export const getAnalyticsMetrics: RequestHandler = async (req: any, res, next) => {
  try {
    const { projectId } = req.params;
    const auth = await req.auth();
    const userId = auth?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: 'Project ID is required.' });
      return;
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: userId 
      }
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found or you do not have permission to access it.' });
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get current period stats (last 30 days)
    const currentPeriodLeads = await prisma.lead.findMany({
      where: {
        projectId,
        userId: userId, // Additional security check
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get previous period stats (30-60 days ago)
    const previousPeriodLeads = await prisma.lead.findMany({
      where: {
        projectId,
        userId: userId, // Additional security check
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });

    // Calculate metrics
    const currentTotal = currentPeriodLeads.length;
    const previousTotal = previousPeriodLeads.length;
    const totalChange = previousTotal > 0 
      ? `${((currentTotal - previousTotal) / previousTotal * 100).toFixed(1)}%`
      : currentTotal > 0 ? '+100%' : '+0%';

    const currentNew = currentPeriodLeads.filter(l => l.status === 'new').length;
    const previousNew = previousPeriodLeads.filter(l => l.status === 'new').length;
    const newChange = previousNew > 0 
      ? `${((currentNew - previousNew) / previousNew * 100).toFixed(1)}%`
      : currentNew > 0 ? '+100%' : '+0%';

    const currentReplied = currentPeriodLeads.filter(l => l.status === 'replied').length;
    const previousReplied = previousPeriodLeads.filter(l => l.status === 'replied').length;
    const currentConversion = currentTotal > 0 ? (currentReplied / currentTotal * 100) : 0;
    const previousConversion = previousTotal > 0 ? (previousReplied / previousTotal * 100) : 0;
    const conversionChange = `${(currentConversion - previousConversion).toFixed(1)}%`;

    // FIX: Opportunity score calculation - clamp to 0-10 range
    const currentAvgScore = currentPeriodLeads.length > 0 
      ? Math.min(10, Math.max(0, currentPeriodLeads.reduce((sum, lead) => sum + lead.opportunityScore, 0) / currentPeriodLeads.length))
      : 0;
    const previousAvgScore = previousPeriodLeads.length > 0 
      ? Math.min(10, Math.max(0, previousPeriodLeads.reduce((sum, lead) => sum + lead.opportunityScore, 0) / previousPeriodLeads.length))
      : 0;
    const opportunityChange = `${(currentAvgScore - previousAvgScore).toFixed(1)}`;

    const metrics = {
      totalLeadsChange: totalChange.startsWith('-') ? totalChange : `+${totalChange}`,
      totalLeadsDescription: currentTotal > previousTotal ? "Growing this month" : currentTotal < previousTotal ? "Declining this month" : "No change",
      totalLeadsTrend: currentTotal > previousTotal ? 'up' as const : currentTotal < previousTotal ? 'down' as const : 'steady' as const,
      
      newLeadsChange: newChange.startsWith('-') ? newChange : `+${newChange}`,
      newLeadsDescription: currentNew > previousNew ? "More discoveries" : currentNew < previousNew ? "Fewer discoveries" : "Steady discovery rate",
      newLeadsTrend: currentNew > previousNew ? 'up' as const : currentNew < previousNew ? 'down' as const : 'steady' as const,
      
      conversionChange: conversionChange.startsWith('-') ? conversionChange : `+${conversionChange}`,
      conversionDescription: currentConversion > previousConversion ? "Improving engagement" : currentConversion < previousConversion ? "Lower engagement" : "Consistent engagement",
      conversionTrend: currentConversion > previousConversion ? 'up' as const : currentConversion < previousConversion ? 'down' as const : 'steady' as const,
      
      opportunityChange: opportunityChange.startsWith('-') ? opportunityChange : `+${opportunityChange}`,
      opportunityDescription: currentAvgScore > previousAvgScore ? "Higher quality leads" : currentAvgScore < previousAvgScore ? "Lower quality leads" : "Consistent quality",
      opportunityTrend: currentAvgScore > previousAvgScore ? 'up' as const : currentAvgScore < previousAvgScore ? 'down' as const : 'steady' as const
    };

    console.log(`📊 [Analytics] User ${userId} fetched metrics for project ${projectId}`);
    res.json({ data: metrics });
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    next(error);
  }
};

export const getWeeklyActivity: RequestHandler = async (req: any, res, next) => {
  try {
    const { projectId } = req.params;
    const auth = await req.auth();
    const userId = auth?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: 'Project ID is required.' });
      return;
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: userId 
      }
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found or you do not have permission to access it.' });
      return;
    }

    // Get leads from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const leads = await prisma.lead.findMany({
      where: {
        projectId,
        userId: userId, // Additional security check
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Group by day of week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityMap = new Map<string, number>();
    
    // Initialize all days with 0
    daysOfWeek.forEach(day => activityMap.set(day, 0));

    // Count leads per day
    leads.forEach(lead => {
      const dayName = daysOfWeek[lead.createdAt.getDay()];
      activityMap.set(dayName, (activityMap.get(dayName) || 0) + 1);
    });

    // Convert to array format
    const activity = daysOfWeek.map(day => ({
      day,
      activity: activityMap.get(day) || 0
    }));

    console.log(`📊 [Analytics] User ${userId} fetched weekly activity for project ${projectId}`);
    res.json({ data: activity });
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    next(error);
  }
};

export const getOpportunityDistribution: RequestHandler = async (req: any, res, next) => {
  try {
    const { projectId } = req.params;
    const auth = await req.auth();
    const userId = auth?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: 'Project ID is required.' });
      return;
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: userId 
      }
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found or you do not have permission to access it.' });
      return;
    }

    // Get all leads for this project
    const leads = await prisma.lead.findMany({
      where: {
        projectId,
        userId: userId // Additional security check
      },
      select: {
        opportunityScore: true
      }
    });

    if (leads.length === 0) {
      res.json({ 
        data: [
          { name: 'High', value: 0, color: '#22c55e' },
          { name: 'Medium', value: 0, color: '#f59e0b' },
          { name: 'Low', value: 0, color: '#ef4444' }
        ] 
      });
      return;
    }

    // FIX: Normalize opportunity scores to 0-10 range if needed
    const normalizedLeads = leads.map(lead => ({
      ...lead,
      opportunityScore: Math.min(10, Math.max(0, lead.opportunityScore / 10)) // Assuming scores are 0-100, normalize to 0-10
    }));

    // Categorize by opportunity score (0-10 scale)
    const high = normalizedLeads.filter(l => l.opportunityScore >= 7).length;
    const medium = normalizedLeads.filter(l => l.opportunityScore >= 4 && l.opportunityScore < 7).length;
    const low = normalizedLeads.filter(l => l.opportunityScore < 4).length;
    const total = leads.length;

    const distribution = [
      { 
        name: 'High', 
        value: Math.round((high / total) * 100), 
        color: '#22c55e' 
      },
      { 
        name: 'Medium', 
        value: Math.round((medium / total) * 100), 
        color: '#f59e0b' 
      },
      { 
        name: 'Low', 
        value: Math.round((low / total) * 100), 
        color: '#ef4444' 
      }
    ];

    console.log(`📊 [Analytics] User ${userId} fetched opportunity distribution for project ${projectId}`);
    res.json({ data: distribution });
  } catch (error) {
    console.error('Error fetching opportunity distribution:', error);
    next(error);
  }
};
export const getSubredditPerformance: RequestHandler = async (req: any, res, next) => {
    try {
      const { projectId } = req.params;
      const auth = await req.auth();
    const userId = auth?.userId;
  
      if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }
  
      if (!projectId) {
        res.status(400).json({ message: 'Project ID is required.' });
        return;
      }
  
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: { 
          id: projectId,
          userId: userId 
        }
      });
  
      if (!project) {
        res.status(404).json({ message: 'Project not found or you do not have permission to access it.' });
        return;
      }
  
      // Get lead count by subreddit (with user validation)
      const subredditStats = await prisma.lead.groupBy({
        by: ['subreddit'],
        where: {
          projectId,
          userId: userId,
          subreddit: {
            not: undefined
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      });
  
      console.log('Raw subreddit stats:', JSON.stringify(subredditStats, null, 2));
  
      // Convert to format expected by frontend - FIXED FORMAT
      const colors = ['#ff4500', '#ff6a00', '#ff8c00', '#ffa500', '#ffb347', '#ffc266', '#ffd285', '#ffe4a3', '#fff6c2', '#fffde7'];
      
      const performance = subredditStats.map((stat, index) => ({
        name: stat.subreddit, // Remove 'r/' prefix - frontend will add it
        //@ts-ignore
        leads: stat._count?.id,
        color: colors[index % colors.length]
      }));
  
      console.log('Formatted performance data:', JSON.stringify(performance, null, 2));
  
      res.json({ 
        success: true,
        data: performance 
      });
    } catch (error) {
      console.error('Error fetching subreddit performance:', error);
      next(error);
    }
  };

export const getLeadsForTable: RequestHandler = async (req: any, res, next) => {
    try {
        console.log('🔍 [Get Leads] Starting leads fetch...');
        console.log('🔍 [Get Leads] Request headers:', req.headers);
        console.log('🔍 [Get Leads] Authorization header:', req.headers.authorization);
        
        const auth = await req.auth();
        const userId = auth?.userId;
        const { projectId } = req.params;

        console.log('🔍 [Get Leads] Auth object:', auth);
        console.log('🔍 [Get Leads] User ID:', userId);
        console.log('🔍 [Get Leads] Project ID:', projectId);

        if (!userId || !projectId) {
            console.log('❌ [Get Leads] Missing userId or projectId');
            return res.status(400).json({ message: 'User and Project ID are required.' });
        }

        // Check if user exists, create if not (fallback for webhook issues)
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            console.log(`[Analytics] User ${userId} not found in database, creating user...`);
            
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
                    select: { id: true }
                });
                console.log(`[Analytics] Created user ${userId} with basic (free) plan`);
            } catch (createError) {
                console.error(`[Analytics] Failed to create user ${userId}:`, createError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create user account'
                });
            }
        }

        const leads = await prisma.lead.findMany({
            where: {
                userId: userId,
                projectId: projectId,
            },
            orderBy: {
                postedAt: 'desc',
            },
        });

        res.status(200).json({ data: leads });
    } catch (error) {
        console.error('Error fetching leads for table:', error);
        next(error);
    }
};