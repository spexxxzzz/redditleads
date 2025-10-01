import { PrismaClient, User } from '@prisma/client';
import { analyzeAndSaveSubredditProfile } from '../services/subreddit.service';

const prisma = new PrismaClient();
const ANALYSIS_EXPIRATION_DAYS = 7;

/**
 * A background worker that finds all unique subreddits targeted by active projects
 * from PAYING users and creates or updates their intelligence profiles.
 */
export const runSubredditAnalysisWorker = async (): Promise<void> => {
    console.log('Starting subreddit analysis worker run...');

    // 1. Get all projects for paying users to find which subreddits to analyze.
    const projects = await prisma.project.findMany({
        where: {
            isActive: true,
            user: {
                plan: { in: ['starter', 'pro'] } // Only analyze for paying users
            }
        },
        select: {
            targetSubreddits: true
        }
    });

    const uniqueSubreddits = new Set<string>();
    projects.forEach(project => {
        project.targetSubreddits.forEach(sub => uniqueSubreddits.add(sub));
    });

    const subredditsToProcess = Array.from(uniqueSubreddits);

    if (subredditsToProcess.length === 0) {
        console.log('No subreddits from paying users to analyze. Worker run finished.');
        return;
    }

    console.log(`Found ${subredditsToProcess.length} unique subreddits from paying users to process.`);

    for (const subredditName of subredditsToProcess) {
        try {
            const existingProfile = await prisma.subredditProfile.findUnique({
                where: { name: subredditName }
            });

            if (existingProfile) {
                const profileAge = Date.now() - existingProfile.lastAnalyzedAt.getTime();
                const expirationPeriod = ANALYSIS_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

                if (profileAge < expirationPeriod) {
                    console.log(`  -> Skipping r/${subredditName}, profile is still fresh.`);
                    continue;
                }
            }

            // If the profile doesn't exist or is stale, analyze it.
            await analyzeAndSaveSubredditProfile(subredditName);

        } catch (error) {
            console.error(`An unexpected error occurred while processing r/${subredditName}:`, error);
        }
    }

    console.log('Subreddit analysis worker run finished.');

    // Send daily performance webhook to all users with active webhooks
    try {
        const { webhookService } = await import('../services/webhook.service');
        
        // Get all users with active webhooks that want daily performance reports
        const usersWithWebhooks = await prisma.user.findMany({
            where: {
                webhooks: {
                    some: {
                        isActive: true,
                        events: { has: 'performance.daily' }
                    }
                }
            },
            include: {
                webhooks: {
                    where: {
                        isActive: true,
                        events: { has: 'performance.daily' }
                    }
                },
                projects: {
                    where: { isActive: true }
                },
                leads: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                        }
                    }
                },
                scheduledReplies: {
                    where: {
                        postedAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                        }
                    }
                }
            }
        });

        for (const user of usersWithWebhooks) {
            const dailyStats = {
                leadsDiscovered: user.leads.length,
                repliesPosted: user.scheduledReplies.length,
                projectsActive: user.projects.length,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                totalLeads: user.leads.length,
                totalReplies: user.scheduledReplies.length
            };

            await webhookService.broadcastEvent('performance.daily', dailyStats, user.id, undefined, 'low');
            console.log(`📡 [Daily Performance] Performance webhook sent to user ${user.id}`);
        }
    } catch (webhookError) {
        console.error(`❌ [Daily Performance] Failed to send daily performance webhooks:`, webhookError);
    }
};