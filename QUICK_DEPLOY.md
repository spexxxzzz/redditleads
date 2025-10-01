# ⚡ QUICK DEPLOYMENT GUIDE - VERCEL + GOOGLE CLOUD

## 🎯 TL;DR - 3 Simple Steps

Your codebase is **already perfectly structured** for this deployment. No code changes needed!

### ✅ What You Have:
```
RedLead/
├── frontend/     → Deploy to Vercel (already separated!)
├── src/          → Deploy to Google Cloud (already separated!)
└── prisma/       → Works with Supabase (already configured!)
```

---

## 📋 DEPLOYMENT CHECKLIST

### 1️⃣ Database (5 minutes)
```bash
□ Create Supabase project: https://supabase.com/dashboard
□ Copy database URL
□ Run: npx prisma migrate deploy
```

### 2️⃣ Backend (10 minutes)
```bash
□ Install gcloud CLI
□ Run: gcloud init
□ Run: docker build -t gcr.io/PROJECT_ID/backend:v1 .
□ Run: docker push gcr.io/PROJECT_ID/backend:v1
□ Run: gcloud run deploy (copy the URL you get)
□ Add environment variables in Cloud Run console
```

### 3️⃣ Frontend (5 minutes)
```bash
□ Go to: https://vercel.com/new
□ Import GitHub repository
□ Root Directory: frontend
□ Add environment variable: NEXT_PUBLIC_API_URL=YOUR_CLOUD_RUN_URL
□ Click Deploy
```

**Done! 🎉 Your app is live!**

---

## 💰 COST BREAKDOWN

| Service | Cost | Why It's Cheap |
|---------|------|----------------|
| **Vercel** | $0 | Free tier is generous |
| **Cloud Run** | $0-15/mo | Pay only when requests come in |
| **Supabase** | $0-25/mo | Free tier: 500MB database |
| **TOTAL** | **$0-40/mo** | Scales automatically! |

---

## 🔧 REQUIRED CHANGES TO YOUR CODE

### **NONE!** 🎉

Your code is already perfect. Just update environment variables:

#### Frontend (.env.local on Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

#### Backend (Environment Variables in Cloud Run):
```env
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
CLERK_SECRET_KEY=sk_live_xxx
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx
REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
RESEND_API_KEY=re_xxx
SERPER_API_KEY=xxx
```

That's it! No code modifications needed.

---

## 🚀 DEPLOYMENT COMMANDS

### Deploy Database (Supabase)
```bash
# 1. Get your Supabase database URL
export DATABASE_URL="your_supabase_connection_string"

# 2. Run migrations
cd /path/to/RedLead
npx prisma migrate deploy

# ✅ Done! Database is ready.
```

### Deploy Backend (Google Cloud Run)
```bash
# 1. Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/backend:v1 .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/backend:v1

# 3. Deploy to Cloud Run
gcloud run deploy redditleads-backend \
  --image gcr.io/YOUR_PROJECT_ID/backend:v1 \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --min-instances 1 \
  --max-instances 10

# 4. Get your backend URL
gcloud run services describe redditleads-backend \
  --region us-central1 \
  --format 'value(status.url)'

# Output: https://redditleads-backend-xxxxx.run.app
# ✅ Copy this URL for Vercel!
```

### Deploy Frontend (Vercel)
```bash
# Option 1: Web Interface (Easiest)
# 1. Go to: https://vercel.com/new
# 2. Import your GitHub repo
# 3. Set Root Directory: frontend
# 4. Add env var: NEXT_PUBLIC_API_URL=YOUR_CLOUD_RUN_URL
# 5. Click Deploy

# Option 2: CLI
cd frontend
vercel --prod
# ✅ Done! Your frontend is live.
```

---

## 🧪 TESTING YOUR DEPLOYMENT

### Test Backend
```bash
# Replace with your Cloud Run URL
curl https://redditleads-backend-xxxxx.run.app/

# Expected: "Reddit SaaS backend is running 🚀"
```

### Test Frontend
```bash
# 1. Open your Vercel URL
# 2. Sign up for an account
# 3. Create a test project
# 4. Run lead discovery
# 5. Check dashboard

# ✅ If everything works, you're live!
```

---

## 🐛 TROUBLESHOOTING

### Backend not receiving requests?
```bash
# Check CORS configuration in src/index.ts
# Make sure your Vercel URL is in allowedOrigins array

const allowedOrigins = [
  'https://your-vercel-domain.vercel.app', // ← Add this!
  'http://localhost:3000'
];
```

### Frontend can't connect to backend?
```bash
# Check environment variable in Vercel
# Go to: Vercel Dashboard > Settings > Environment Variables
# Verify: NEXT_PUBLIC_API_URL is set correctly
```

### Database connection errors?
```bash
# Make sure your connection string includes:
# ?pgbouncer=true&connection_limit=1

# Test connection:
export DATABASE_URL="your_url"
npx prisma db pull
```

---

## 📊 MONITORING

### Google Cloud Run
```bash
# View logs
gcloud run services logs tail redditleads-backend --region us-central1

# View in browser
# https://console.cloud.google.com/run
```

### Vercel
```bash
# View logs in dashboard
# https://vercel.com/your-username/redditleads/logs
```

### Supabase
```bash
# View in dashboard
# https://supabase.com/dashboard/project/YOUR_PROJECT/database/usage
```

---

## 🔄 UPDATING YOUR APP

### Update Frontend
```bash
# Just push to GitHub - auto-deploys!
git add .
git commit -m "Update frontend"
git push
```

### Update Backend
```bash
# Rebuild and deploy
docker build -t gcr.io/PROJECT_ID/backend:v2 .
docker push gcr.io/PROJECT_ID/backend:v2
gcloud run deploy redditleads-backend \
  --image gcr.io/PROJECT_ID/backend:v2 \
  --region us-central1
```

---

## ✅ ADVANTAGES OF THIS APPROACH

1. **Zero code changes** - Your app is already structured perfectly
2. **Auto-scaling** - Both Vercel and Cloud Run scale automatically
3. **Cost-effective** - Pay only for what you use
4. **Global CDN** - Vercel serves your frontend from edge locations
5. **Easy updates** - Push to GitHub and you're done
6. **Managed database** - Supabase handles backups and maintenance
7. **SSL/HTTPS** - Automatic on both Vercel and Cloud Run
8. **No server management** - Everything is serverless/managed

---

## 🎉 YOU'RE READY!

Your RedditLeads app is production-ready with:
- ✅ Scalable infrastructure
- ✅ Global CDN
- ✅ Automatic backups
- ✅ SSL certificates
- ✅ Continuous deployment
- ✅ Cost-effective pricing

**Need the detailed guide?** See `DEPLOYMENT_GUIDE.md`

**Questions?** Check the troubleshooting section above or refer to:
- Vercel Docs: https://vercel.com/docs
- Cloud Run Docs: https://cloud.google.com/run/docs
- Supabase Docs: https://supabase.com/docs

