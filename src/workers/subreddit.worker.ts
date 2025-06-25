import { PrismaClient } from '@prisma/client';
import { analyzeAndSaveSubredditProfile } from '../services/subreddit.service';

const prisma = new PrismaClient();
// We will only re-analyze a subreddit if its profile is older than this many days.
const ANALYSIS_EXPIRATION_DAYS = 7;

/**
 * A background worker that finds all unique subreddits targeted by active campaigns
 * and creates or updates their intelligence profiles.
 */
export const runSubredditAnalysisWorker = async (): Promise<void> => {
    console.log('Starting subreddit analysis worker run...');

    // 1. Get all unique subreddit names from all campaigns.
    const campaigns = await prisma.campaign.findMany({
        select: {
            targetSubreddits: true
        }
    });

    // Using a Set is a highly efficient way to get a list of unique values.
    const uniqueSubreddits = new Set<string>();
    campaigns.forEach(campaign => {
        campaign.targetSubreddits.forEach(sub => uniqueSubreddits.add(sub));
    });

    const subredditsToProcess = Array.from(uniqueSubreddits);
    if (subredditsToProcess.length === 0) {
        console.log('No subreddits to analyze. Worker run finished.');
        return;
    }

    console.log(`Found ${subredditsToProcess.length} unique subreddits to process.`);

    // 2. Process each subreddit one by one.
    // A simple for...of loop is perfect here. It processes sequentially, which naturally
    // prevents us from overwhelming the Reddit or AI APIs.
    for (const subredditName of subredditsToProcess) {
        try {
            // 3. Check if we need to analyze this subreddit.
            const existingProfile = await prisma.subredditProfile.findUnique({
                where: { name: subredditName }
            });

            if (existingProfile) {
                const profileAge = Date.now() - existingProfile.lastAnalyzedAt.getTime();
                const expirationPeriod = ANALYSIS_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

                if (profileAge < expirationPeriod) {
                    console.log(`  -> Skipping r/${subredditName}, profile is still fresh.`);
                    continue; // Skip to the next subreddit
                }
            }

            // 4. If the profile doesn't exist or is stale, analyze it.
            await analyzeAndSaveSubredditProfile(subredditName);

        } catch (error) {
            console.error(`An unexpected error occurred while processing r/${subredditName}:`, error);
        }
    }

    console.log('Subreddit analysis worker run finished.');
};