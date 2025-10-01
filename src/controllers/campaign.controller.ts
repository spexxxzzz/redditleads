import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches all projects for the currently authenticated user
 */
export const getProjectsForUser: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    try {
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        next(error);
    }
};

/**
 * Fetches a specific project by ID, ensuring it belongs to the authenticated user
 */
export const getProjectById: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { projectId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!projectId) {
        res.status(400).json({ message: 'Project ID is required.' });
        return;
    }

    try {
        const project = await prisma.project.findFirst({
            where: { 
                id: projectId,
                userId: userId 
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        if (!project) {
            res.status(404).json({ message: 'Project not found.' });
            return;
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        next(error);
    }
};

/**
 * Updates a project by ID, ensuring it belongs to the authenticated user
 */
export const updateProjectById: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { projectId } = req.params;
    const {
        name,
        analyzedUrl,
        generatedDescription,
        generatedKeywords,
        targetSubreddits,
        competitors,
        isActive
    } = req.body;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!projectId) {
        res.status(400).json({ message: 'Project ID is required.' });
        return;
    }

    try {
        // First verify the project exists and belongs to the user
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: userId
            }
        });

        if (!existingProject) {
            res.status(404).json({ message: 'Project not found or you do not have permission to update it.' });
            return;
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (analyzedUrl !== undefined) updateData.analyzedUrl = analyzedUrl;
        if (generatedDescription !== undefined) updateData.generatedDescription = generatedDescription;
        if (generatedKeywords !== undefined) {
            updateData.generatedKeywords = Array.isArray(generatedKeywords) 
                ? generatedKeywords 
                : [];
        }
        if (targetSubreddits !== undefined) {
            updateData.targetSubreddits = Array.isArray(targetSubreddits) 
                ? targetSubreddits 
                : [];
        }
        if (competitors !== undefined) {
            updateData.competitors = Array.isArray(competitors) 
                ? competitors 
                : [];
        }
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        console.log(`✅ [Project Update] Successfully updated project ${projectId} for user ${userId}`);
        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project: updatedProject
        });

    } catch (error) {
        console.error(`❌ [Project Update] Error updating project ${projectId}:`, error);
        next(error);
    }
};

/**
 * Deletes a project by ID, ensuring it belongs to the authenticated user
 */
export const deleteProjectById: RequestHandler = async (req: any, res, next) => {
    const auth = await req.auth();
    const userId = auth?.userId;
    const { projectId } = req.params;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!projectId) {
        res.status(400).json({ message: 'Project ID is required.' });
        return;
    }

    try {
        // First verify the project exists and belongs to the user
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: userId
            },
            include: {
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        if (!existingProject) {
            res.status(404).json({ message: 'Project not found or you do not have permission to delete it.' });
            return;
        }

        // Delete all associated leads first (cascade should handle this, but being explicit)
        const deletedLeadsCount = await prisma.lead.deleteMany({
            where: {
                projectId: projectId,
                userId: userId
            }
        });

        // Delete all associated market insights
        await prisma.marketInsight.deleteMany({
            where: {
                projectId: projectId
            }
        });

        // Delete all associated scheduled replies
        await prisma.scheduledReply.deleteMany({
            where: {
                lead: {
                    projectId: projectId,
                    userId: userId
                }
            }
        });

        // Finally delete the project
        const deletedProject = await prisma.project.delete({
            where: { id: projectId }
        });

        console.log(`✅ [Project Delete] Successfully deleted project ${projectId} and ${deletedLeadsCount.count} associated leads for user ${userId}`);
        
        res.status(200).json({
            success: true,
            message: `Project deleted successfully. ${deletedLeadsCount.count} associated leads were also removed.`,
            deletedProject: {
                id: deletedProject.id,
                name: deletedProject.name || 'Unnamed Project'
            },
            deletedLeadsCount: deletedLeadsCount.count
        });

    } catch (error) {
        console.error(`❌ [Project Delete] Error deleting project ${projectId}:`, error);
        next(error);
    }
};