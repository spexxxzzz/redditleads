# 🚀 RedditLeads Deployment Guide
## Vercel (Frontend) + Google Cloud Run (Backend) + Supabase (Database)

This guide will walk you through deploying your RedditLeads application using the best-in-class architecture.

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       User Traffic                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               Vercel (Frontend)                          │
│  - Next.js Application                                   │
│  - Automatic SSL                                         │
│  - CDN & Edge Functions                                  │
│  - URL: https://yourdomain.vercel.app                   │
└───────────────────────┬─────────────────────────────────┘
                        │ API Calls
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Google Cloud Run (Backend)                       │
│  - Express.js API                                        │
│  - Auto-scaling (0-10 instances)                         │
│  - Container-based deployment                            │
│  - URL: https://redditleads-backend-xxx.run.app         │
└───────────────────────┬─────────────────────────────────┘
                        │ Database Queries
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (Database)                         │
│  - PostgreSQL Database                                   │
│  - Automatic backups                                     │
│  - Connection pooling                                    │
│  - URL: db.xxx.supabase.co                              │
└─────────────────────────────────────────────────────────┘
```

## 💰 Cost Estimate

| Service | Plan | Cost/Month |
|---------|------|------------|
| **Vercel** | Hobby (Free) | $0 |
| **Google Cloud Run** | Pay-per-use | $0-15 |
| **Supabase** | Free/Pro | $0-25 |
| **Total** | | **$0-40** |

---

## 📋 Pre-Deployment Checklist

### 1️⃣ **Supabase Setup**
- [ ] Create Supabase project
- [ ] Note down database URL
- [ ] Enable connection pooling
- [ ] Run database migrations

### 2️⃣ **Google Cloud Setup**
- [ ] Create Google Cloud project
- [ ] Enable Cloud Run API
- [ ] Enable Container Registry API
- [ ] Install Google Cloud CLI

### 3️⃣ **Vercel Setup**
- [ ] Create Vercel account
- [ ] Install Vercel CLI (optional)
- [ ] Connect GitHub repository

### 4️⃣ **Environment Variables Ready**
- [ ] Clerk API keys
- [ ] Reddit API credentials
- [ ] OpenAI/Gemini API keys
- [ ] Resend API key
- [ ] SERPER API key
- [ ] Dodo Payments keys

---

## 🎯 DEPLOYMENT STEPS

## Part 1: Deploy Database (Supabase)

### Step 1: Create Supabase Project
```bash
# 1. Go to https://supabase.com/dashboard
# 2. Click "New Project"
# 3. Fill in details:
#    - Name: redditleads
#    - Database Password: [secure password]
#    - Region: [closest to your users]
# 4. Wait for project to be created (~2 minutes)
```

### Step 2: Get Connection String
```bash
# 1. In Supabase dashboard, go to Settings > Database
# 2. Copy "Connection string" under "Connection pooling"
# 3. It should look like:
#    postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 3: Run Database Migrations
```bash
# On your local machine:
cd /path/to/RedLead

# Set database URL
export DATABASE_URL="your_supabase_connection_string"

# Run migrations
npx prisma migrate deploy

# Verify migration
npx prisma db pull
```

---

## Part 2: Deploy Backend (Google Cloud Run)

### Step 1: Install Google Cloud CLI
```bash
# macOS
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash

# Windows
# Download from: https://cloud.google.com/sdk/docs/install

# Initialize
gcloud init
```

### Step 2: Create Google Cloud Project
```bash
# Create project
gcloud projects create redditleads-prod --name="RedditLeads Production"

# Set as active project
gcloud config set project redditleads-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.gcr.io
gcloud services enable cloudbuild.googleapis.com
```

### Step 3: Configure Environment Variables
```bash
# Create .env.production file (DO NOT COMMIT THIS!)
cp .env.example .env.production

# Edit .env.production with your values
nano .env.production
```

### Step 4: Build and Deploy Backend
```bash
# Make sure you're in the project root
cd /path/to/RedLead

# Build Docker image
docker build -t gcr.io/redditleads-prod/backend:v1 .

# Push to Google Container Registry
docker push gcr.io/redditleads-prod/backend:v1

# Deploy to Cloud Run
gcloud run deploy redditleads-backend \
  --image gcr.io/redditleads-prod/backend:v1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=3001" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest"
```

### Step 5: Set Environment Variables in Cloud Run
```bash
# Option 1: Using gcloud CLI
gcloud run services update redditleads-backend \
  --update-env-vars DATABASE_URL="your_supabase_url" \
  --update-env-vars CLERK_SECRET_KEY="your_clerk_secret" \
  --update-env-vars OPENAI_API_KEY="your_openai_key" \
  --update-env-vars GEMINI_API_KEY="your_gemini_key" \
  --update-env-vars REDDIT_CLIENT_ID="your_reddit_id" \
  --update-env-vars REDDIT_CLIENT_SECRET="your_reddit_secret" \
  --update-env-vars RESEND_API_KEY="your_resend_key" \
  --update-env-vars SERPER_API_KEY="your_serper_key" \
  --region us-central1

# Option 2: Using Google Cloud Console
# 1. Go to Cloud Run console
# 2. Click on "redditleads-backend"
# 3. Click "Edit & Deploy New Revision"
# 4. Go to "Variables & Secrets" tab
# 5. Add all environment variables
# 6. Click "Deploy"
```

### Step 6: Get Backend URL
```bash
# Get the deployed URL
gcloud run services describe redditleads-backend \
  --region us-central1 \
  --format 'value(status.url)'

# Output will be something like:
# https://redditleads-backend-xxxxx-uc.a.run.app

# Test the backend
curl https://redditleads-backend-xxxxx-uc.a.run.app/
# Should return: "Reddit SaaS backend is running 🚀"
```

---

## Part 3: Deploy Frontend (Vercel)

### Step 1: Prepare Frontend for Deployment
```bash
cd /path/to/RedLead/frontend

# Create .env.production file
cp .env.example .env.production

# Update with production values
nano .env.production
```

Add these values:
```env
NEXT_PUBLIC_API_URL=https://redditleads-backend-xxxxx-uc.a.run.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
```

### Step 2: Deploy to Vercel (Option 1: Web Interface)
```bash
# 1. Go to https://vercel.com/new
# 2. Import your GitHub repository
# 3. Vercel will auto-detect Next.js
# 4. Configure:
#    - Framework Preset: Next.js
#    - Root Directory: frontend
#    - Build Command: npm run build
#    - Output Directory: .next
# 5. Add environment variables:
#    - NEXT_PUBLIC_API_URL
#    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#    - CLERK_SECRET_KEY
# 6. Click "Deploy"
```

### Step 3: Deploy to Vercel (Option 2: CLI)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? redditleads
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production

# Redeploy with environment variables
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)
```bash
# 1. Go to Vercel dashboard
# 2. Select your project
# 3. Go to Settings > Domains
# 4. Add your domain (e.g., www.redditleads.net)
# 5. Follow DNS configuration instructions
```

---

## Part 4: Update CORS and Backend Configuration

### Step 1: Update Backend CORS
```typescript
// In src/index.ts, update allowedOrigins:
const allowedOrigins = [
  'https://your-vercel-domain.vercel.app',
  'https://www.yourdomain.com', // if using custom domain
  'http://localhost:3000' // for local development
];
```

### Step 2: Redeploy Backend
```bash
# Rebuild and push
docker build -t gcr.io/redditleads-prod/backend:v2 .
docker push gcr.io/redditleads-prod/backend:v2

# Deploy new version
gcloud run deploy redditleads-backend \
  --image gcr.io/redditleads-prod/backend:v2 \
  --region us-central1
```

---

## Part 5: Configure Webhooks

### Step 1: Clerk Webhooks
```bash
# 1. Go to Clerk Dashboard > Webhooks
# 2. Click "Add Endpoint"
# 3. Endpoint URL: https://redditleads-backend-xxxxx.run.app/api/clerk-webhooks
# 4. Subscribe to events:
#    - user.created
#    - user.updated
#    - user.deleted
# 5. Copy webhook secret
# 6. Add to Cloud Run environment variables:
gcloud run services update redditleads-backend \
  --update-env-vars CLERK_WEBHOOK_SECRET="whsec_your_secret" \
  --region us-central1
```

### Step 2: Dodo Payments Webhooks (if using)
```bash
# 1. Go to Dodo Payments Dashboard > Webhooks
# 2. Add webhook URL: https://redditleads-backend-xxxxx.run.app/api/payment/webhook
# 3. Save webhook secret to Cloud Run
```

---

## 🧪 Testing Your Deployment

### Step 1: Test Backend
```bash
# Health check
curl https://redditleads-backend-xxxxx.run.app/api/health

# Test API endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://redditleads-backend-xxxxx.run.app/api/projects
```

### Step 2: Test Frontend
```bash
# 1. Open https://your-vercel-domain.vercel.app
# 2. Sign up for an account
# 3. Create a test project
# 4. Run lead discovery
# 5. Check dashboard analytics
```

### Step 3: Monitor Logs
```bash
# Backend logs (Google Cloud Run)
gcloud run services logs tail redditleads-backend \
  --region us-central1

# Frontend logs (Vercel)
# Go to: https://vercel.com/your-username/redditleads/logs
```

---

## 🔄 Continuous Deployment

### Auto-Deploy Frontend (Vercel)
Vercel automatically deploys on every push to your GitHub repository.

### Auto-Deploy Backend (Google Cloud Build)
```bash
# 1. Connect GitHub repository to Cloud Build
gcloud builds triggers create github \
  --repo-name=RedLead \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# 2. Now every push to main branch will auto-deploy backend
```

---

## 🔐 Security Best Practices

1. **Use Secret Manager for sensitive data**:
```bash
# Store secrets in Google Secret Manager
echo -n "your_database_url" | gcloud secrets create DATABASE_URL --data-file=-

# Update Cloud Run to use secrets
gcloud run services update redditleads-backend \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest" \
  --region us-central1
```

2. **Enable HTTPS only** (both Vercel and Cloud Run do this by default)

3. **Set up rate limiting** (already implemented in your backend)

4. **Enable Cloud Run authentication** (optional, for additional security)

---

## 📊 Monitoring & Scaling

### Google Cloud Run Metrics
```bash
# View metrics in Google Cloud Console
# Go to: Cloud Run > redditleads-backend > Metrics

# Or use gcloud:
gcloud monitoring dashboards create \
  --config-from-file=monitoring-dashboard.json
```

### Vercel Analytics
```bash
# Enable in Vercel dashboard:
# Project Settings > Analytics > Enable
```

### Supabase Monitoring
```bash
# Go to Supabase Dashboard > Database > Usage
# Monitor:
# - Active connections
# - Database size
# - Query performance
```

---

## 🐛 Troubleshooting

### Issue: Backend not receiving requests
```bash
# Check Cloud Run logs
gcloud run services logs tail redditleads-backend --region us-central1

# Check CORS configuration
curl -H "Origin: https://your-vercel-domain.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -X OPTIONS \
  https://redditleads-backend-xxxxx.run.app/api/projects
```

### Issue: Database connection errors
```bash
# Test database connection
npx prisma db pull

# Check connection pooling
# Make sure Supabase URL includes: ?pgbouncer=true&connection_limit=1
```

### Issue: Frontend build fails
```bash
# Check Vercel build logs
# Go to: Vercel Dashboard > Project > Deployments > [Latest] > View Logs

# Common fixes:
# - Ensure all environment variables are set
# - Check for TypeScript errors
# - Verify Next.js version compatibility
```

---

## 💡 Optimization Tips

1. **Enable Cloud Run concurrency**:
```bash
gcloud run services update redditleads-backend \
  --concurrency=80 \
  --region us-central1
```

2. **Use Vercel Edge Functions** for improved performance

3. **Enable Supabase read replicas** for better database performance

4. **Set up CDN caching** for static assets

---

## 🎉 You're Done!

Your RedditLeads application is now deployed with:
- ✅ Auto-scaling backend
- ✅ Global CDN for frontend
- ✅ Managed database with backups
- ✅ SSL/HTTPS enabled
- ✅ Continuous deployment
- ✅ Production monitoring

**Total cost: $0-40/month** (depending on usage)

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Supabase Docs**: https://supabase.com/docs
- **Your codebase**: Everything is already configured!

---

## 🔄 Updating Your Deployment

### Update Frontend
```bash
# Just push to GitHub - Vercel will auto-deploy
git add .
git commit -m "Update frontend"
git push origin main
```

### Update Backend
```bash
# Build and deploy new version
docker build -t gcr.io/redditleads-prod/backend:v3 .
docker push gcr.io/redditleads-prod/backend:v3
gcloud run deploy redditleads-backend \
  --image gcr.io/redditleads-prod/backend:v3 \
  --region us-central1
```

### Update Database Schema
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Deploy to production
export DATABASE_URL="your_supabase_url"
npx prisma migrate deploy
```

