import { PrismaClient, LeadType, User, Project, Lead } from '@prisma/client';
import { findLeadsWithBusinessIntelligence, RawLead } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { webhookService } from '../services/webhook.service';
import { AIUsageService } from '../services/aitracking.service';
// Import the email notification service
import { sendNewLeadsNotification } from '../services/email.service';
import { isUserRedditConnected } from '../services/userReddit.service';


const prisma = new PrismaClient();
const BATCH_SIZE = 10; // Process 10 projects at a time
const MAX_RETRIES = 3;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Saves leads to the database, sends webhooks, and returns the successfully saved leads.
 * @returns A promise that resolves to an array of the leads that were saved.
 */
const saveLeadsToDatabase = async (
    leads: (RawLead & { relevanceScore: number; relevanceReasoning: string; intent?: string; isGoogleRanked?: boolean, id: string })[],
    project: Project,
    userId: string
): Promise<Lead[]> => {
    const savedLeads: Lead[] = [];
    const highQualityLeadsForWebhook: Lead[] = [];

    for (const lead of leads) {
        try {
            const savedLead = await prisma.lead.upsert({
                where: { redditId_projectId: { redditId: lead.id, projectId: project.id } },
                update: {
                    opportunityScore: lead.relevanceScore,
                    intent: lead.intent,
                    isGoogleRanked: lead.isGoogleRanked,
                    relevanceReasoning: lead.relevanceReasoning,
                    updatedAt: new Date(),
                    user: { connect: { id: userId } }
                },
                create: {
                    redditId: lead.id,
                    title: lead.title,
                    author: lead.author,
                    subreddit: lead.subreddit,
                    url: lead.url,
                    body: lead.body || '',
                    postedAt: new Date(lead.createdAt * 1000),
                    opportunityScore: lead.relevanceScore,
                    project: { connect: { id: project.id } },
                    user: { connect: { id: userId } },
                    type: 'DIRECT_LEAD',
                    intent: lead.intent || 'general_discussion',
                    relevanceReasoning: lead.relevanceReasoning,
                    isGoogleRanked: lead.isGoogleRanked || false
                }
            });
            
            savedLeads.push(savedLead);

            if (lead.relevanceScore >= 70) {
                highQualityLeadsForWebhook.push(savedLead);
            }
        } catch (error: any) {
            if (error.code !== 'P2002') { // Ignore unique constraint violations
                console.error(`[Worker] Failed to save lead ${lead.id}:`, error.message);
            }
        }
    }

    // Broadcast high-quality leads via webhooks
    for (const lead of highQualityLeadsForWebhook) {
        try {
            await webhookService.broadcastEvent('lead.discovered', {
                ...lead,
                projectId: project.id,
            }, userId, project.id, getPriorityFromScore(lead.opportunityScore));
        } catch (webhookError) {
            console.error(`[Worker] Failed to broadcast webhook for lead ${lead.id}:`, webhookError);
        }
    }

    return savedLeads;
};

const getPriorityFromScore = (score: number): 'low' | 'medium' | 'high' | 'urgent' => {
    if (score >= 90) return 'urgent';
    if (score >= 80) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
};

export const runLeadDiscoveryWorker = async (): Promise<void> => {
    console.log('Starting lead discovery worker run...');
    let cursor: string | null = null;

    while (true) {
        const projects: (Project & { user: User })[] = await prisma.project.findMany({
            take: BATCH_SIZE,
            ...(cursor && { skip: 1, cursor: { id: cursor } }),
            where: {
                isActive: true,
                user: {
                    subscriptionStatus: { in: ['active', 'trialing'] }
                }
            },
            include: { user: true },
            orderBy: { id: 'asc' }
        });

        if (projects.length === 0) {
            console.log('No more active projects to process. Worker run finished.');
            break;
        }

        for (const project of projects) {
            let retries = 0;
            while (retries < MAX_RETRIES) {
                try {
                    const user = project.user;
                    if (!user || !project.businessDNA) {
                        console.log(`[Worker] Skipping project ${project.id} due to missing user or Business DNA.`);
                        break;
                    }

                    const aiUsage = AIUsageService.getInstance();
                    const canUseAI = await aiUsage.trackAIUsage(user.id, 'scheduled_discovery', user.plan);
                    if (!canUseAI) {
                        console.log(`[Worker] Skipping project ${project.id} for user ${user.id} due to usage limits.`);
                        break;
                    }

                    console.log(`[Worker] Running discovery for project ${project.id} for user ${user.id}`);

                    // Check if user has Reddit connected - REQUIRED for discovery
                    const isRedditConnected = await isUserRedditConnected(user.id);
                    
                    if (!isRedditConnected) {
                        console.log(`[Worker] Skipping project ${project.id} for user ${user.id} - Reddit connection required`);
                        break;
                    }
                    
                    const userRedditToken = user.redditRefreshToken;
                    if (!userRedditToken) {
                        console.log(`[Worker] Skipping project ${project.id} for user ${user.id} - Reddit token not available`);
                        break;
                    }
                    
                    console.log(`[Worker] Using user Reddit account for discovery for user ${user.id}`);

                    const rawLeads = await findLeadsWithBusinessIntelligence(project.businessDNA as any, project.subredditBlacklist, 0, userRedditToken);
                    const scoredLeads = await enrichLeadsForUser(rawLeads, user, project.businessDNA as any);
                    const qualifiedLeads = scoredLeads.filter(lead => lead.relevanceScore >= 50);

                    if (qualifiedLeads.length > 0) {
                        const savedLeads = await saveLeadsToDatabase(qualifiedLeads, project, user.id);
                        console.log(`[Worker]  -> Saved ${savedLeads.length} new leads for project ${project.id}.`);
                        if (savedLeads.length > 0) {
                            await sendNewLeadsNotification(user, savedLeads, project.name);
                        }
                    } else {
                        console.log(`[Worker]  -> No new qualified leads found for project ${project.id}.`);
                    }

                    break; // Success, exit retry loop
                } catch (error) {
                    retries++;
                    console.error(`Error processing project ${project.id} (attempt ${retries}/${MAX_RETRIES}):`, error);
                    if (retries >= MAX_RETRIES) {
                        console.error(`Failed to process project ${project.id} after ${MAX_RETRIES} attempts.`);
                    } else {
                        await delay(1000 * Math.pow(2, retries)); // Exponential backoff
                    }
                }
            }
        }
        cursor = projects[projects.length - 1].id;
    }
};