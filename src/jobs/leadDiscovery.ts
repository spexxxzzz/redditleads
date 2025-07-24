import cron from 'node-cron';
import { runLeadDiscoveryWorker } from '../workers/lead.worker';
import { runSubredditAnalysisWorker } from '../workers/subreddit.worker';
// FIX: Import the two new, specific worker functions instead of the old one
import { findPendingRepliesWorker, trackPostedReplyPerformanceWorker } from '../workers/replyTracking.worker';
import { runMarketInsightWorker } from '../workers/marketInsight.worker';

/**
 * Initializes and starts all scheduled background jobs for the application.
 */
export const initializeScheduler = () => {
    console.log('Scheduler is initializing...');

    // --- JOB 1: Lead Discovery Worker ---
    // Runs every 15 minutes.
    cron.schedule('*/15 * * * *', () => {
        console.log('-------------------------------------');
        console.log('Triggering scheduled lead discovery run...');
        runLeadDiscoveryWorker().catch((err: any) => { // FIX: Add type to err
            console.error('A critical error occurred during the lead discovery worker run:', err);
        });
    });

    // --- JOB 2: Subreddit Intelligence Worker ---
    // Runs once per day at 2:00 AM.
    cron.schedule('0 2 * * *', () => {
        console.log('-------------------------------------');
        console.log('Triggering daily subreddit intelligence analysis...');
        runSubredditAnalysisWorker().catch((err: any) => { // FIX: Add type to err
            console.error('A critical error occurred during the subreddit analysis worker run:', err);
        });
    });

    // --- JOB 3: High-Frequency Reply Finder ---
    // Runs every minute to find manually posted replies quickly.
    cron.schedule('* * * * *', () => {
        console.log('-------------------------------------');
        console.log('⚡ Triggering high-frequency reply finder...');
        findPendingRepliesWorker().catch((err: any) => { // FIX: Add type to err
            console.error('A critical error occurred during the pending reply finder run:', err);
        });
    });

    // --- JOB 4: Low-Frequency Performance Tracker ---
    // Runs every hour to update stats for already-found replies.
    cron.schedule('0 * * * *', () => {
        console.log('-------------------------------------');
        console.log('📊 Triggering hourly reply performance tracking...');
        trackPostedReplyPerformanceWorker().catch((err: any) => { // FIX: Add type to err
            console.error('A critical error occurred during the reply performance tracking run:', err);
        });
    });

    // --- JOB 5: Market Insight Worker ---
    // Runs every hour at the 5-minute mark.
    cron.schedule('5 * * * *', () => {
        console.log('-------------------------------------');
        console.log('Triggering hourly market insight discovery...');
        runMarketInsightWorker().catch((err: any) => { // FIX: Add type to err
            console.error('A critical error occurred during the market insight worker run:', err);
        });
    });

    console.log('✅ Scheduler initialized with all jobs.');
};