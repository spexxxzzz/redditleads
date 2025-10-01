import { Router } from 'express';
import { subscribeToNewsletter, getNewsletterStats } from '../controllers/newsletter.controller';

const newsletterRouter = Router();

// Subscribe to newsletter
newsletterRouter.post('/subscribe', subscribeToNewsletter);

// Get newsletter statistics (admin only)
newsletterRouter.get('/stats', getNewsletterStats);

export default newsletterRouter;
