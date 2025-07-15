import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import leadRouter from './routes/leads';
import { initializeScheduler } from '../src/jobs/leadDiscovery';
import onboardingRouter from './routes/onboarding';
import engagementRouter from './routes/engagement';
import insightRouter from './routes/insights';
import performanceRouter from './routes/performance';

// --- NEW: Import campaigns router ---
import campaignRouter from './routes/campaign';
import redditRouter from './routes/reddit';
import webhookRouter from './routes/webhook';
import { getUserUsage } from './controllers/aiusage.controller';
import { RequestHandler } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Enable CORS globally ---
app.use(cors());

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Reddit SaaS backend is running 🚀');
});

app.use('/api/leads', leadRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/engagement', engagementRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/insights', insightRouter);
// --- NEW: Add campaigns router ---
app.use('/api/campaigns', campaignRouter);
app.use('/api/reddit', redditRouter);
app.get('/api/users/:userId/usage', getUserUsage as RequestHandler);
app.use('/api/webhook', webhookRouter);


app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(401).json({ 
    error: 'Unauthenticated!',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // initializeScheduler();
});