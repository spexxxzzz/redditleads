import cron from 'node-cron';
import { runLeadDiscoveryWorker } from '../workers/lead.worker';
import { runSubredditAnalysisWorker } from '../workers/subreddit.worker';
import { runReplyTrackingWorker } from '../workers/replyTracking.worker';
// --- NEW: Import the new market insight worker ---
import { runMarketInsightWorker } from '../workers/marketInsight.worker';

/**
 * Initializes and starts all scheduled background jobs for the application.
 */
export const initializeScheduler = () => {
    console.log('Scheduler is initializing...');

    // --- JOB 1: Lead Discovery Worker ---
    // This schedule runs the worker every 15 minutes.
    cron.schedule('*/15 * * * *', () => {
        console.log('-------------------------------------');
        console.log('Triggering scheduled lead discovery run...');
        runLeadDiscoveryWorker().catch(err => {
            console.error('A critical error occurred during the lead discovery worker run:', err);
        });
    });

    // --- JOB 2: Subreddit Intelligence Worker ---
    // This schedule runs once per day at 2:00 AM.
    cron.schedule('0 2 * * *', () => {
        console.log('-------------------------------------');
        console.log('Triggering daily subreddit intelligence analysis...');
        runSubredditAnalysisWorker().catch(err => {
            console.error('A critical error occurred during the subreddit analysis worker run:', err);
        });
    });

    // --- JOB 3: Reply Success Tracking Worker ---
    // This schedule runs every hour.
    cron.schedule('0 * * * *', () => {
        console.log('-------------------------------------');
        console.log('Triggering hourly reply success tracking...');
        runReplyTrackingWorker().catch(err => {
            console.error('A critical error occurred during the reply tracking worker run:', err);
        });
    });

    // --- NEW JOB 4: Market Insight Worker ---
    // This schedule runs every hour at the 5-minute mark.
    cron.schedule('5 * * * *', () => {
        console.log('-------------------------------------');
        console.log('Triggering hourly market insight discovery...');
        runMarketInsightWorker().catch(err => {
            console.error('A critical error occurred during the market insight worker run:', err);
        });
    });

    console.log('✅ All jobs have been scheduled.');
};