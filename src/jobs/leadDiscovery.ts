import cron from 'node-cron';
import { runLeadDiscoveryWorker } from '../workers/lead.worker';
import { runSubredditAnalysisWorker } from '../workers/subreddit.worker';

/**
 * Initializes and starts all scheduled background jobs for the application.
 * This is the central place to manage cron jobs.
 */
export const initializeScheduler = () => {
    console.log('Initializing scheduler...');

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

    console.log('✅ All jobs have been scheduled.');
};