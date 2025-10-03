import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { findLeadsWithBusinessIntelligence } from '../services/reddit.service';
import { enrichLeadsForUser } from '../services/enrichment.service';
import { extractBusinessDNA } from '../services/ai.service';
import { scrapeAndProcessWebsite } from '../utils/scraping';
import { isUserRedditConnected } from '../services/userReddit.service';

const prisma = new PrismaClient();

export const runManualDiscovery: RequestHandler = async (req: any, res, next) => {
    console.log('🔍 [Manual Discovery] Starting discovery process...');
    console.log('🔍 [Manual Discovery] Request headers:', req.headers);
    console.log('🔍 [Manual Discovery] Authorization header:', req.headers.authorization);
    
    const auth = await req.auth();
    const userId = auth?.userId;
    const { projectId } = req.params;

    console.log('🔍 [Manual Discovery] Auth object:', auth);
    console.log('🔍 [Manual Discovery] User ID:', userId);
    console.log('🔍 [Manual Discovery] Project ID:', projectId);

    if (!userId) {
        console.log('❌ [Manual Discovery] Missing userId');
        return res.status(401).json({ message: 'User authentication required.' });
    }
    
    if (!projectId) {
        console.log('❌ [Manual Discovery] Missing projectId');
        return res.status(400).json({ message: 'Project ID is required.' });
    }

    // Set a timeout for the entire discovery process
    const discoveryTimeout = setTimeout(() => {
        console.log('⏰ [Manual Discovery] Process timeout reached (5 minutes)');
        if (!res.headersSent) {
            res.status(408).json({ 
                message: 'Discovery process timed out. Please try again with a smaller scope or try again later.',
                timeout: true
            });
        }
    }, 300000); // 5 minutes timeout

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: userId },
            include: { user: true }
        });

        if (!project || !project.user) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        const user = project.user;
        const discoveryStartTime = Date.now();
        
        // Check if discovery is already running for this project
        const existingDiscovery = await prisma.project.findFirst({
            where: { 
                id: projectId, 
                userId: userId,
                discoveryStatus: 'running'
            }
        });

        if (existingDiscovery) {
            return res.status(409).json({ 
                message: 'Discovery is already running for this project.',
                discoveryInProgress: true
            });
        }
        
        // Initialize discovery progress tracking
        try {
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    discoveryStatus: 'running',
                    discoveryStartedAt: new Date(),
                    discoveryProgress: {
                        stage: 'initializing',
                        leadsFound: 0,
                        message: 'Starting discovery process...'
                    }
                }
            });
        } catch (progressError) {
            console.error('❌ [Manual Discovery] Failed to initialize progress tracking:', progressError);
            // Continue with discovery even if progress initialization fails
        }
        
        // Check if user has Reddit connected - REQUIRED for discovery
        const isRedditConnected = await isUserRedditConnected(userId);
        
        if (!isRedditConnected) {
            return res.status(400).json({ 
                message: 'Reddit account connection required for lead discovery. Please connect your Reddit account in Settings.',
                requiresRedditConnection: true
            });
        }
        
        const userRedditToken = user.redditRefreshToken;
        if (!userRedditToken) {
            return res.status(400).json({ 
                message: 'Reddit refresh token not available. Please reconnect your Reddit account.',
                requiresRedditConnection: true
            });
        }
        
        console.log(`🔍 [Manual Discovery] Using user Reddit account for discovery`);
        
        let businessDNA = project.businessDNA as any;
        if (!businessDNA || !businessDNA.businessName) {
            const websiteText = await scrapeAndProcessWebsite(project.analyzedUrl);
            businessDNA = await extractBusinessDNA(websiteText);
        await prisma.project.update({
            where: { id: projectId },
                data: { businessDNA: businessDNA as any },
            });
        }

        // Get variation level based on how many times discovery has been run recently
        const lastDiscovery = project.lastManualDiscoveryAt;
        const hoursSinceLastDiscovery = lastDiscovery ? (Date.now() - new Date(lastDiscovery).getTime()) / (1000 * 60 * 60) : 24;
        const variationLevel = hoursSinceLastDiscovery < 6 ? 2 : hoursSinceLastDiscovery < 24 ? 1 : 0;
        
        console.log(`[Global Discovery] Using variation level ${variationLevel} (${hoursSinceLastDiscovery.toFixed(1)} hours since last discovery)`);
        
        const targetSubreddits = project.targetSubreddits || [];
        
        // Update progress: Starting Reddit search
        try {
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    discoveryProgress: {
                        stage: 'searching',
                        leadsFound: 0,
                        message: `Searching ${targetSubreddits.length} subreddits for relevant posts...`
                    }
                }
            });
        } catch (progressError) {
            console.error('❌ [Manual Discovery] Failed to update search progress:', progressError);
            // Continue with discovery even if progress update fails
        }
        
        const rawLeads = await findLeadsWithBusinessIntelligence(businessDNA, project.subredditBlacklist as string[], variationLevel, userRedditToken);
        
        // Check if we found any raw leads
        if (rawLeads.length === 0) {
            console.log('❌ [Manual Discovery] No raw leads found - likely due to Reddit API errors or no matching content');
            
            // Update progress: Discovery failed due to no raw leads
            try {
                await prisma.project.update({
                    where: { id: projectId },
                    data: {
                        discoveryStatus: 'failed',
                        discoveryProgress: {
                            stage: 'failed',
                            leadsFound: 0,
                            message: 'Discovery failed: No posts found. This may be due to Reddit API rate limits or no matching content in target subreddits.'
                        }
                    }
                });
            } catch (progressError) {
                console.error('❌ [Manual Discovery] Failed to update failure progress:', progressError);
            }
            
            return res.status(200).json({ 
                message: 'Discovery completed but no leads found. This may be due to Reddit API rate limits or no matching content in your target subreddits.',
                leadsFound: 0,
                discoveryCompleted: true
            });
        }
        
        // Update progress: Found raw leads, starting analysis
        try {
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    discoveryProgress: {
                        stage: 'analyzing',
                        leadsFound: rawLeads.length,
                        message: `Found ${rawLeads.length} posts, analyzing quality and relevance...`
                    }
                }
            });
        } catch (progressError) {
            console.error('❌ [Manual Discovery] Failed to update analysis progress:', progressError);
            // Continue with discovery even if progress update fails
        }
        
        const scoredLeads = await enrichLeadsForUser(rawLeads, user, businessDNA);
        
        // Debug: Show score distribution
        console.log(`🔍 [Manual Discovery] Score distribution:`, {
            total: scoredLeads.length,
            scores: scoredLeads.map((l: any) => l.relevanceScore).sort((a: number, b: number) => b - a),
            min: Math.min(...scoredLeads.map((l: any) => l.relevanceScore)),
            max: Math.max(...scoredLeads.map((l: any) => l.relevanceScore)),
            avg: Math.round(scoredLeads.reduce((sum: number, l: any) => sum + l.relevanceScore, 0) / scoredLeads.length)
        });
        
        // QUALITY-FIRST LEAD SELECTION: Guarantee exactly 10-12 leads with maximum quality
        let qualifiedLeads: any[] = [];
        let threshold = 70; // Start with high quality threshold
        const MAX_LEADS = 12;
        const MIN_LEADS = 10;
        const MIN_QUALITY_SCORE = 35; // Minimum acceptable quality
        
        console.log(`🎯 [Manual Discovery] Starting quality-first selection...`);
        console.log(`🎯 [Manual Discovery] Target: ${MIN_LEADS}-${MAX_LEADS} leads, Min quality: ${MIN_QUALITY_SCORE}`);
        
        // Strategy 1: Try high-quality thresholds first (70+ scores)
        for (let testThreshold = 70; testThreshold >= 50; testThreshold -= 5) {
            const testQualified = scoredLeads.filter(lead => lead.relevanceScore >= testThreshold);
            if (testQualified.length >= MIN_LEADS && testQualified.length <= MAX_LEADS) {
                qualifiedLeads = testQualified;
                threshold = testThreshold;
                console.log(`✅ [Manual Discovery] Found ${qualifiedLeads.length} high-quality leads at threshold ${threshold}`);
                break;
            }
        }
        
        // Strategy 2: If high-quality didn't work, try medium quality (45-65 scores)
        if (qualifiedLeads.length < MIN_LEADS) {
            for (let testThreshold = 65; testThreshold >= 40; testThreshold -= 5) {
                const testQualified = scoredLeads.filter(lead => lead.relevanceScore >= testThreshold);
                if (testQualified.length >= MIN_LEADS) {
                    // Take only the top 12 to maintain quality
                    qualifiedLeads = testQualified.slice(0, MAX_LEADS);
                    threshold = testThreshold;
                    console.log(`✅ [Manual Discovery] Found ${qualifiedLeads.length} medium-quality leads at threshold ${threshold}`);
                    break;
                }
            }
        }
        
        // Strategy 3: Fallback - take best available leads (minimum quality filter)
        if (qualifiedLeads.length < MIN_LEADS) {
            const highQualityLeads = scoredLeads.filter(lead => lead.relevanceScore >= MIN_QUALITY_SCORE);
            if (highQualityLeads.length >= MIN_LEADS) {
                qualifiedLeads = highQualityLeads.slice(0, MAX_LEADS);
                threshold = qualifiedLeads[qualifiedLeads.length - 1]?.relevanceScore || 0;
                console.log(`⚠️ [Manual Discovery] Fallback: Using ${qualifiedLeads.length} best available leads (min score: ${threshold})`);
            } else {
                // Last resort: take top 10-12 regardless of score
                qualifiedLeads = scoredLeads.slice(0, MAX_LEADS);
                threshold = qualifiedLeads[qualifiedLeads.length - 1]?.relevanceScore || 0;
                console.log(`🚨 [Manual Discovery] Last resort: Using top ${qualifiedLeads.length} leads (lowest score: ${threshold})`);
            }
        }
        
        // Final quality check and adjustment
        if (qualifiedLeads.length > MAX_LEADS) {
            qualifiedLeads = qualifiedLeads.slice(0, MAX_LEADS);
            console.log(`✂️ [Manual Discovery] Trimmed to exactly ${MAX_LEADS} leads for consistency`);
        }
        
        // Final validation: Ensure we have exactly 10-12 leads
        if (qualifiedLeads.length < MIN_LEADS) {
            console.log(`⚠️ [Manual Discovery] WARNING: Only found ${qualifiedLeads.length} leads (minimum: ${MIN_LEADS})`);
            console.log(`   This may indicate low-quality raw data or overly strict filtering`);
        } else if (qualifiedLeads.length > MAX_LEADS) {
            console.log(`⚠️ [Manual Discovery] WARNING: Found ${qualifiedLeads.length} leads (maximum: ${MAX_LEADS})`);
            qualifiedLeads = qualifiedLeads.slice(0, MAX_LEADS);
            console.log(`   Trimmed to exactly ${MAX_LEADS} leads`);
        } else {
            console.log(`✅ [Manual Discovery] SUCCESS: Found exactly ${qualifiedLeads.length} leads within target range`);
        }
        
        // Quality metrics and validation
        const avgScore = qualifiedLeads.length > 0 ? 
            Math.round(qualifiedLeads.reduce((sum, lead) => sum + lead.relevanceScore, 0) / qualifiedLeads.length) : 0;
        const minScore = qualifiedLeads.length > 0 ? 
            Math.min(...qualifiedLeads.map(lead => lead.relevanceScore)) : 0;
        const maxScore = qualifiedLeads.length > 0 ? 
            Math.max(...qualifiedLeads.map(lead => lead.relevanceScore)) : 0;
        
        console.log(`🎯 [Manual Discovery] QUALITY METRICS:`);
        console.log(`   📊 Applied threshold: ${threshold}`);
        console.log(`   📈 Found leads: ${qualifiedLeads.length} (target: ${MIN_LEADS}-${MAX_LEADS})`);
        console.log(`   ⭐ Average score: ${avgScore}`);
        console.log(`   📉 Min score: ${minScore}`);
        console.log(`   📈 Max score: ${maxScore}`);
        console.log(`   ✅ Quality status: ${qualifiedLeads.length >= MIN_LEADS ? 'SUCCESS' : 'WARNING'}`);
        
        console.log("\n--- [LEAD DELIVERY] ---");
        console.log(`🎉 Delivering ${qualifiedLeads.length} high-quality leads to user...`);
        qualifiedLeads.forEach((lead, index) => {
            console.log(`\n[Lead #${index + 1}] Score: ${lead.relevanceScore}`);
            console.log(`   Title: ${lead.title.substring(0, 60)}...`);
            console.log(`   Subreddit: r/${lead.subreddit} | Author: u/${lead.author}`);
        });
        
        // Update progress: Starting to save leads
        try {
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    discoveryProgress: {
                        stage: 'saving',
                        leadsFound: qualifiedLeads.length,
                        message: `Saving ${qualifiedLeads.length} qualified leads to your dashboard...`
                    }
                }
            });
        } catch (progressError) {
            console.error('❌ [Manual Discovery] Failed to update saving progress:', progressError);
            // Continue with discovery even if progress update fails
        }
        
        console.log(`💾 [Manual Discovery] Saving ${qualifiedLeads.length} qualified leads to database...`);
        
        const savedLeads = [];
        for (let i = 0; i < qualifiedLeads.length; i++) {
            const lead = qualifiedLeads[i];
            try {
                console.log(`💾 [Manual Discovery] Saving lead ${i + 1}/${qualifiedLeads.length}: ${lead.title.substring(0, 50)}...`);
                
                const savedLead = await prisma.lead.upsert({
                    where: { redditId_projectId: { redditId: lead.id, projectId: projectId } },
                    update: {
                        opportunityScore: lead.relevanceScore,
                        intent: lead.intent,
                        isGoogleRanked: lead.isGoogleRanked,
                        relevanceReasoning: lead.relevanceReasoning,
                        updatedAt: new Date(),
                        user: { connect: { id: user.id } },
                    },
                    create: {
                        redditId: lead.id,
                        title: lead.title,
                        author: lead.author,
                        subreddit: lead.subreddit,
                        url: lead.url,
                        body: lead.body || '',
                        user: { connect: { id: user.id } },
                        project: { connect: { id: projectId } },
                        opportunityScore: lead.relevanceScore,
                        intent: lead.intent || null,
                        status: 'new',
                        postedAt: new Date(lead.createdAt * 1000),
                        type: 'DIRECT_LEAD',
                        isGoogleRanked: lead.isGoogleRanked || false,
                        relevanceReasoning: lead.relevanceReasoning,
                    }
                });
                savedLeads.push(savedLead);
                console.log(`✅ [Manual Discovery] Lead ${i + 1}/${qualifiedLeads.length} saved successfully`);
            } catch (error) {
                console.error(`❌ [Manual Discovery] Failed to save lead ${i + 1}/${qualifiedLeads.length} (${lead.id}):`, error);
            }
        }

        // Update progress: Discovery completed successfully
        try {
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    discoveryStatus: 'completed',
                    discoveryProgress: {
                        stage: 'completed',
                        leadsFound: savedLeads.length,
                        message: `Discovery completed! Found and saved ${savedLeads.length} qualified leads.`
                    },
                    lastManualDiscoveryAt: new Date()
                }
            });
        } catch (progressError) {
            console.error('❌ [Manual Discovery] Failed to update completion progress:', progressError);
            // Discovery is still successful even if progress update fails
        }
        
        console.log(`🎉 [Manual Discovery] DISCOVERY COMPLETED!`);
        console.log(`📊 [Manual Discovery] Final Results:`, {
            rawLeads: rawLeads.length,
            scoredLeads: scoredLeads.length,
            qualifiedLeads: qualifiedLeads.length,
            savedLeads: savedLeads.length,
            successRate: `${Math.round((savedLeads.length / rawLeads.length) * 100)}%`
        });

        // Broadcast discovery completion webhook event
        try {
            const { webhookService } = await import('../services/webhook.service');
            await webhookService.broadcastEvent('discovery.completed', {
                projectId: projectId,
                leadsFound: savedLeads.length,
                discoveryType: 'manual',
                duration: Date.now() - discoveryStartTime,
                subreddits: targetSubreddits,
                successRate: Math.round((savedLeads.length / rawLeads.length) * 100),
                rawLeads: rawLeads.length,
                qualifiedLeads: qualifiedLeads.length
            }, user.id, projectId, 'medium');
            console.log(`📡 [Manual Discovery] Discovery completion webhook broadcasted`);
        } catch (webhookError) {
            console.error(`❌ [Manual Discovery] Failed to broadcast discovery completion webhook:`, webhookError);
        }
        
        // Clear the timeout since we're responding successfully
        clearTimeout(discoveryTimeout);
        
        res.status(200).json({
            message: `Discovery complete! Found and saved ${savedLeads.length} new leads.`,
            leads: savedLeads
        });
         
    } catch (error) {
        // Clear the timeout on error
        clearTimeout(discoveryTimeout);
        
        // Update progress: Discovery failed
        try {
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    discoveryStatus: 'failed',
                    discoveryProgress: {
                        stage: 'failed',
                        leadsFound: 0,
                        message: 'Discovery failed due to an error. Please try again.'
                    }
                }
            });
        } catch (updateError) {
            console.error('❌ [Manual Discovery] Failed to update discovery status on error:', updateError);
        }
        
        console.error('❌ [Manual Discovery] Error during discovery:', error);
        next(error);
    }
};

// You can add back other controller functions here if needed by the frontend,
// ensuring they use the new types and logic.
// For example:
export const getDiscoveryProgress: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { projectId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required.' });
    }

    try {
        const project = await prisma.project.findFirst({
            where: { 
                id: projectId,
                userId: userId
            },
            select: {
                id: true,
                discoveryStatus: true,
                discoveryProgress: true,
                discoveryStartedAt: true,
                lastManualDiscoveryAt: true
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // If no discovery is running, return not started status
        if (!project.discoveryStatus || project.discoveryStatus === 'completed') {
            // Get actual leads count for this project
            const leadsCount = await prisma.lead.count({
                where: { projectId: projectId }
            });
            
            // If there are existing leads, show completed status
            if (leadsCount > 0) {
                return res.status(200).json({
                    status: 'completed',
                    stage: 'completed',
                    leadsFound: leadsCount,
                    message: `Discovery completed! Found ${leadsCount} leads.`,
                    estimatedTimeLeft: 0
                });
            } else {
                // No leads found yet, show not started status
                return res.status(200).json({
                    status: 'not_started',
                    stage: 'not_started',
                    leadsFound: 0,
                    message: 'Discovery not started yet. Click the discovery button to begin.',
                    estimatedTimeLeft: 0
                });
            }
        }

        // If discovery failed, return failed status
        if (project.discoveryStatus === 'failed') {
            // Get actual leads count for this project
            const leadsCount = await prisma.lead.count({
                where: { projectId: projectId }
            });
            
            return res.status(200).json({
                status: 'failed',
                stage: 'failed',
                leadsFound: leadsCount,
                message: `Discovery failed. Found ${leadsCount} leads before failure.`,
                estimatedTimeLeft: 0
            });
        }

        // Parse progress data
        const progressData = project.discoveryProgress as any || {};
        const startedAt = project.discoveryStartedAt ? new Date(project.discoveryStartedAt).getTime() : Date.now();
        const elapsedTime = Date.now() - startedAt;
        const estimatedTimeLeft = Math.max(0, 300000 - elapsedTime); // 5 minutes total

        res.status(200).json({
            status: project.discoveryStatus,
            stage: progressData.stage || 'initializing',
            leadsFound: progressData.leadsFound || 0,
            message: progressData.message || 'Starting discovery...',
            estimatedTimeLeft: Math.round(estimatedTimeLeft / 1000) // Convert to seconds
        });

    } catch (error) {
        console.error('❌ [Discovery Progress] Error getting progress:', error);
        next(error);
    }
};

export const updateLeadStatus: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { leadId } = req.params;
    const { status } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!leadId || !status) {
        return res.status(400).json({ message: 'Lead ID and status are required.' });
    }

    try {
        const updatedLead = await prisma.lead.updateMany({
            where: { 
                id: leadId,
                userId: userId
            },
            data: { status }
        });

        if (updatedLead.count === 0) {
            return res.status(404).json({ message: 'Lead not found or you do not have permission to update it.' });
        }

        res.status(200).json({ message: 'Lead status updated successfully.' });
    } catch (error) {
        next(error);
    }
};

export const deleteLead: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { leadId } = req.params;

        if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
        }

    if (!leadId) {
        return res.status(400).json({ message: 'Lead ID is required.' });
        }

    try {
        const deletedLead = await prisma.lead.deleteMany({
            where: { 
                id: leadId,
                userId: userId 
            }
        });

        if (deletedLead.count === 0) {
            return res.status(404).json({ message: 'Lead not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'Lead deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

export const deleteLeadsByStatus: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { projectId } = req.params;
    const { status } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!projectId || !status) {
        return res.status(400).json({ message: 'Project ID and status are required.' });
    }

    try {
        const deletedLeads = await prisma.lead.deleteMany({
            where: {
                projectId: projectId,
                userId: userId,
                status: status
            }
        });

        res.status(200).json({
            message: `${deletedLeads.count} leads with status '${status}' deleted successfully.`,
            deletedCount: deletedLeads.count
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAllLeads: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { projectId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required.' });
    }

    try {
        const deletedLeads = await prisma.lead.deleteMany({
            where: {
                projectId: projectId,
                userId: userId
            }
        });

        res.status(200).json({ 
            message: `All ${deletedLeads.count} leads deleted successfully.`,
            deletedCount: deletedLeads.count
        });
    } catch (error) {
        next(error);
    }
};