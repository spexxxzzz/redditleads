import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import leadRouter from './routes/leads';
import { initializeScheduler } from './jobs/leadDiscovery';
import onboardingRouter from './routes/onboarding';
import engagementRouter from './routes/engagement';
import insightRouter from './routes/insights';
import performanceRouter from './routes/performance';
import { clerkMiddleware } from '@clerk/express';




// --- NEW: Import projects router ---
import projectRouter from './routes/project';
import redditRouter from './routes/reddit';
import webhookRouter from './routes/webhook';
import { getUserUsage } from './controllers/aiusage.controller';
import { RequestHandler } from 'express';
import userRouter from './routes/user';
import clerkWebhookRouter from './routes/clerk.webhook';
import analyticsRouter from './routes/analytics';
import paymentRouter from './routes/payment';
import paymentManagementRouter from './routes/payment-management';
import healthRouter from './routes/health';
import usageRouter from './routes/usage';
import newsletterRouter from './routes/newsletter';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './utils/logger';
import emailRouter from './routes/email';


const app = express();
const PORT = process.env.PORT || 3001;

// --- CORRECT CORS CONFIGURATION ---
const allowedOrigins = [
  'https://red-lead.vercel.app',
  'https://redditleads-phi.vercel.app',
  'http://localhost:3000',
  'https://www.redditleads.org',
  'https://redditleads.org',
  // Allow all Vercel preview deployments (for PR previews)
  /^https:\/\/.*\.vercel\.app$/
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any string or regex pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      // RegExp pattern for Vercel preview deployments
      return allowedOrigin.test(origin);
    });
    
    if (!isAllowed) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
// --- END CORS CONFIGURATION ---


app.use('/api/clerk-webhooks', clerkWebhookRouter);

// Middleware order is critical. Body parser must come before auth.
app.use(express.json());

// Add request logging
app.use(logger.requestLogger());

// Add route debugging middleware
app.use((req, res, next) => {
  if (req.path.includes('/discover/') || req.path.includes('/leads/')) {
    console.log('🔍 [Route Debug]', req.method, req.originalUrl, '->', req.path);
  }
  next();
});

// Configure Clerk middleware
app.use(clerkMiddleware());


app.get('/', (_req, res) => {
  res.send('Reddit SaaS backend is running 🚀');
});


app.use('/api/leads', leadRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/engagement', engagementRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/insights', insightRouter);
app.use('/api/email', emailRouter);


// --- NEW: Add projects router ---
app.use('/api/projects', projectRouter);
app.use('/api/reddit', redditRouter);
app.get('/api/users/:userId/usage', getUserUsage as RequestHandler);
app.use('/api/webhook', webhookRouter);
app.use('/api/user', userRouter); // Add the new user router
app.use('/api/analytics', analyticsRouter); // Add this line
app.use('/api/payment', paymentRouter); // Add payment router
app.use('/api/payment-management', paymentManagementRouter); // Add payment management router
app.use('/api/health', healthRouter); // Add health check router
app.use('/api/usage', usageRouter); // Add usage tracking router
app.use('/api/newsletter', newsletterRouter); // Add newsletter router

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initializeScheduler();
});