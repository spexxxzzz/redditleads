import cron from 'node-cron';
import { runLeadDiscoveryWorker } from '..//workers/lead.worker';

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

    // --- FUTURE JOBS CAN BE ADDED HERE ---
    // Example: A job to clean up old data every day at midnight
    // cron.schedule('0 0 * * *', () => {
    //   console.log('Running daily cleanup job...');
    //   runCleanupWorker().catch(err => console.error('Cleanup job failed:', err));
    // });

    console.log('✅ All jobs have been scheduled.');
};