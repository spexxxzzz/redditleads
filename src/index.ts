import 'dotenv/config'; 
import express from 'express';
import leadRouter from './routes/leads';
import { initializeScheduler } from '../src/jobs/leadDiscovery'; // Import the new scheduler initializer
import onboardingRouter from './routes/onboarding';
import engagementRouter from './routes/engagement';
// --- NEW: Import the new insight router ---
import insightRouter from './routes/insights';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Reddit SaaS backend is running 🚀');
});

app.use('/api/leads', leadRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/engagement', engagementRouter);
app.use('/api/insights', insightRouter);

app.get("/api/auth/reddit/callback", async (req, res) => {
    const code = req.query.code;
    // Exchange `code` for access_token via Reddit API
    // Save access_token, use it to fetch threads, post replies, etc.
    res.redirect("/dashboard"); // or wherever you want
  });
  
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(401).json({ 
        error: 'Unauthenticated!',
        message: err.message 
    });
});

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  
    // Initialize all scheduled background jobs
    // initializeScheduler();
  });