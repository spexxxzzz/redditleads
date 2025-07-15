import { PrismaClient } from '@prisma/client';
import { getAppAuthenticatedInstance } from '../services/reddit.service';
import snoowrap from 'snoowrap';

const prisma = new PrismaClient();
const CHECK_INTERVAL_HOURS = 4; // How often to check a reply's status

/**
 * A background worker that checks the performance of previously posted replies.
 */
export const runReplyTrackingWorker = async (): Promise<void> => {
    console.log('Starting reply tracking worker run...');

    const checkCutoff = new Date();
    checkCutoff.setHours(checkCutoff.getHours() - CHECK_INTERVAL_HOURS);

    // 1. Find all posted replies that haven't been checked recently.
    const repliesToTrack = await prisma.scheduledReply.findMany({
        where: {
            status: 'POSTED',
            redditPostId: { not: null },
            OR: [
                { lastCheckedAt: null },
                { lastCheckedAt: { lte: checkCutoff } }
            ]
        },
        include: {
            lead: true // We need the lead to know who the original author was
        },
        take: 100, // Process in batches of 100
    });

    if (repliesToTrack.length === 0) {
        console.log('No replies to track. Worker run finished.');
        return;
    }

    console.log(`Found ${repliesToTrack.length} replies to track.`);

    // --- BATCH FETCHING LOGIC ---
    try {
        const r = await getAppAuthenticatedInstance();
        const replyIds = repliesToTrack.map(reply => reply.redditPostId).filter((id): id is string => id !== null);

        if (replyIds.length === 0) {
            console.log('No valid Reddit post IDs to track.');
            return;
        }

        // 2. Fetch all comments individually (snoowrap does not support batch get)
        const redditComments: snoowrap.Comment[] = [];
        for (const id of replyIds) {
            try {
                //@ts-ignore
                const comment = await r.getComment(id).fetch();
                redditComments.push(comment);
            } catch (err) {
                // If fetching fails, skip this comment
                console.warn(`Failed to fetch comment with ID ${id}:`, err);
            }
        }
        const commentsMap = new Map<string, snoowrap.Comment>(redditComments.map(c => [c.name, c]));

        // 3. Process each reply using the fetched data
        for (const reply of repliesToTrack) {
            const redditComment = commentsMap.get(reply.redditPostId!);

            if (!redditComment) {
                // Comment might have been deleted or is otherwise inaccessible
                await prisma.scheduledReply.update({
                    where: { id: reply.id },
                    data: { 
                        lastCheckedAt: new Date(), 
                        status: 'FAILED', 
                        failReason: 'Comment not found on Reddit (likely deleted).' 
                    }
                });
                console.warn(`Could not find reply ${reply.id} (Reddit ID: ${reply.redditPostId}). Marked as failed.`);
                continue;
            }

            const upvotes = redditComment.score;
            
            // Fetch replies to our comment to check for author's response
            const repliesFromAuthor = await (redditComment as any).replies.fetchAll();
            const authorReplied = repliesFromAuthor.some((r: any) => r.author.name === reply.lead.author);

            // 4. Update our database with the new performance metrics
            await prisma.scheduledReply.update({
                where: { id: reply.id },
                data: {
                    upvotes,
                    authorReplied,
                    lastCheckedAt: new Date(),
                }
            });
            console.log(`✅ Tracked reply ${reply.id}: Upvotes=${upvotes}, Author Replied=${authorReplied}`);
        }
    } catch (error: any) {
        console.error('❌ A critical error occurred during the batch reply tracking:', error.message);
        // If the whole batch fails, we should handle it gracefully, perhaps by logging
        // the error and trying again on the next worker run. We won't update `lastCheckedAt`
        // on a batch failure to ensure the replies are re-checked.
    }

    console.log('Reply tracking worker run finished.');
};