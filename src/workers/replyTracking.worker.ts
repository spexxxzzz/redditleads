import { PrismaClient } from '@prisma/client';
import { getCommentById } from '../services/reddit.service';

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
        take: 50, // Process in batches
    });

    if (repliesToTrack.length === 0) {
        console.log('No replies to track. Worker run finished.');
        return;
    }

    console.log(`Found ${repliesToTrack.length} replies to track.`);

    // 2. Process each reply.
    for (const reply of repliesToTrack) {
        try {
            if (!reply.redditPostId) continue;

            // 3. Fetch the latest comment data from Reddit
            const redditComment = await getCommentById(reply.redditPostId);
            const upvotes = redditComment.score;

            // 4. Check if the original author of the lead has replied to our comment
            const repliesFromAuthor = await redditComment.replies.fetchAll({
                filter: (r: any) => r.author.name === reply.lead.author
            });
            const authorReplied = repliesFromAuthor.length > 0;

            // 5. Update our database with the new performance metrics
            await prisma.scheduledReply.update({
                where: { id: reply.id },
                data: {
                    upvotes,
                    authorReplied,
                    lastCheckedAt: new Date(),
                }
            });
            console.log(`✅ Tracked reply ${reply.id}: Upvotes=${upvotes}, Author Replied=${authorReplied}`);

        } catch (error: any) {
            console.error(`❌ Failed to track reply ${reply.id}:`, error.message);
            // Update lastCheckedAt even on failure to avoid retrying a deleted/invalid comment
            await prisma.scheduledReply.update({
                where: { id: reply.id },
                data: { lastCheckedAt: new Date() }
            });
        }
    }

    console.log('Reply tracking worker run finished.');
};