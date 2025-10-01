# 🚀 STEP-BY-STEP DEPLOYMENT GUIDE
## Simple Approach: Vercel Frontend + Google Cloud VM Backend + PostgreSQL

---

## 📋 OVERVIEW

We'll deploy your app in this order:
1. **Prepare & Push to GitHub** (10 minutes)
2. **Deploy Frontend to Vercel** (5 minutes)
3. **Set up Google Cloud VM** (15 minutes)
4. **Deploy Backend to VM** (10 minutes)
5. **Test Everything** (5 minutes)

**Total Time: ~45 minutes**

---

## 🎯 STEP 1: PREPARE FILES FOR GITHUB (Current Step)

### What we need to add to GitHub:

**Essential deployment files:**
- ✅ `Dockerfile` (for VM deployment)
- ✅ `.dockerignore` (optimize Docker builds)
- ✅ `.gitignore` (updated to exclude sensitive files)
- ✅ `DEPLOYMENT_STEPS.md` (this file - your guide!)

**Optional but helpful:**
- ℹ️ `DEPLOYMENT_GUIDE.md` (detailed reference)
- ℹ️ `QUICK_DEPLOY.md` (quick reference)
- ℹ️ `DEPLOYMENT_SUMMARY.md` (technical overview)

### Step 1.1: Check if Git is initialized

Open your terminal and run:

```bash
cd /Users/neelshah/Downloads/RedLead
git status
```

**If you see:** "fatal: not a git repository"
**Then run:**
```bash
git init
```

**If you see:** list of files
**Then:** Git is already initialized ✅

---

### Step 1.2: Add essential files to Git

Run these commands one by one:

```bash
# Add the updated .gitignore
git add .gitignore

# Add backend CORS configuration (updated for Vercel)
git add src/index.ts

# Add deployment files
git add Dockerfile
git add .dockerignore

# Add this guide
git add DEPLOYMENT_STEPS.md

# Check what will be committed
git status
```

---

### Step 1.3: Commit the changes

```bash
git commit -m "Add deployment configuration files for Vercel + Google Cloud"
```

---

### Step 1.4: Check if you have a GitHub repository

**Option A: You already have a GitHub repo**
```bash
git remote -v
```
- If you see a GitHub URL, you're good! Skip to Step 1.6

**Option B: You need to create a new GitHub repo**
1. Go to: https://github.com/new
2. Repository name: `RedLead` (or any name you prefer)
3. Keep it **Private** (recommended for now)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

---

### Step 1.5: Connect your local repo to GitHub

After creating the GitHub repo, you'll see commands. Run these:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/RedLead.git

# Rename branch to main (if needed)
git branch -M main
```

---

### Step 1.6: Push to GitHub

```bash
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Create token at: https://github.com/settings/tokens
  - Select scopes: `repo` (full control)

---

## ✅ CHECKPOINT 1: Verify GitHub Push

Go to your GitHub repository URL:
`https://github.com/YOUR_USERNAME/RedLead`

**You should see:**
- ✅ `frontend/` folder
- ✅ `src/` folder  
- ✅ `prisma/` folder
- ✅ `Dockerfile`
- ✅ `.dockerignore`
- ✅ `package.json`

**If you see these files, you're ready for Step 2!** 🎉

---

## 🎯 STEP 2: DEPLOY FRONTEND TO VERCEL

### Step 2.1: Sign up for Vercel

1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

---

### Step 2.2: Import your project

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find `RedLead` in your repository list
3. Click **"Import"**

---

### Step 2.3: Configure the project

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** 
- Click "Edit"
- Select `frontend/`
- ✅ This is important!

**Build and Output Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

---

### Step 2.4: Add environment variables

Click **"Environment Variables"** and add these:

**Variable 1:**
- Name: `NEXT_PUBLIC_API_URL`
- Value: `http://localhost:3001` (we'll update this later)

**Variable 2:**
- Name: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Value: `your_clerk_publishable_key` (copy from your .env.local)

**Variable 3:**
- Name: `CLERK_SECRET_KEY`
- Value: `your_clerk_secret_key` (copy from your .env.local)

---

### Step 2.5: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment to complete
3. You'll see "🎉 Congratulations!"
4. **Copy your Vercel URL** (looks like: `https://red-lead-xxx.vercel.app`)

---

## ✅ CHECKPOINT 2: Verify Vercel Deployment

1. Visit your Vercel URL
2. You should see your landing page
3. Try to sign up - it should work!
4. Dashboard won't work yet (no backend) - that's expected

**If you see your landing page, you're ready for Step 3!** 🎉

---

## 🎯 STEP 3: SET UP GOOGLE CLOUD VM

### Step 3.1: Install Google Cloud CLI (if not installed)

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
Download from: https://cloud.google.com/sdk/docs/install

---

### Step 3.2: Initialize gcloud

```bash
gcloud init
```

Follow the prompts:
1. Log in to your Google account
2. Create a new project or select existing one
3. Choose a default region (e.g., `us-central1`)

---

### Step 3.3: Create a VM instance

```bash
gcloud compute instances create redditleads-vm \
  --zone=us-central1-a \
  --machine-type=e2-standard-2 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server
```

**This creates:**
- VM name: `redditleads-vm`
- Type: e2-standard-2 (2 vCPU, 8GB RAM)
- OS: Ubuntu 20.04
- Disk: 50GB
- Cost: ~$24/month

---

### Step 3.4: Configure firewall rules

```bash
# Allow HTTP traffic
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server

# Allow HTTPS traffic  
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --target-tags=https-server

# Allow backend port
gcloud compute firewall-rules create allow-backend \
  --allow=tcp:3001 \
  --target-tags=http-server

# Allow frontend port (for testing)
gcloud compute firewall-rules create allow-frontend \
  --allow=tcp:3000 \
  --target-tags=http-server
```

---

### Step 3.5: Get your VM's external IP

```bash
gcloud compute instances describe redditleads-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Copy this IP address!** You'll need it.

Example output: `34.123.45.67`

---

## ✅ CHECKPOINT 3: Verify VM Creation

Run:
```bash
gcloud compute instances list
```

**You should see:**
- Name: `redditleads-vm`
- Status: `RUNNING`
- External IP: Your IP address

**If you see this, you're ready for Step 4!** 🎉

---

## 🎯 STEP 4: DEPLOY BACKEND TO VM

### Step 4.1: Connect to your VM

```bash
gcloud compute ssh redditleads-vm --zone=us-central1-a
```

**You're now inside your VM!** The prompt will change.

---

### Step 4.2: Install Node.js

```bash
# Update package list
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

---

### Step 4.3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify it's running
sudo systemctl status postgresql
```

---

### Step 4.4: Create database and user

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt, run these commands:
CREATE DATABASE redditleads;
CREATE USER redditleads_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE redditleads TO redditleads_user;
\q
```

**Save your password!** You'll need it for the DATABASE_URL.

---

### Step 4.5: Clone your repository

```bash
# Install git if not present
sudo apt install git -y

# Clone your repository
git clone https://github.com/YOUR_USERNAME/RedLead.git

# Enter the project directory
cd RedLead
```

---

### Step 4.6: Create .env file for backend

```bash
# Create .env file
nano .env
```

**Paste this content** (replace values with your actual keys):

```env
# Database
DATABASE_URL="postgresql://redditleads_user:your_secure_password_here@localhost:5432/redditleads"

# Server
PORT=3001
NODE_ENV=production

# Clerk
CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=RedditLeads/1.0

# AI Services
OPENAI_API_KEY=sk-your_openai_key
GEMINI_API_KEY=your_gemini_key

# Email
RESEND_API_KEY=re_your_resend_key

# SERP
SERPER_API_KEY=your_serper_key

# Payments
DODO_API_KEY=your_dodo_key
DODO_PRODUCT_IDS=prod_xxx,prod_yyy

# CORS - Frontend URL
FRONTEND_URL=https://your-vercel-url.vercel.app
```

**Save with:** `Ctrl + X`, then `Y`, then `Enter`

---

### Step 4.7: Install backend dependencies

```bash
# Install dependencies
npm install

# Install PM2 globally (for process management)
sudo npm install -g pm2

# Install Prisma CLI
npm install -g prisma
```

---

### Step 4.8: Run database migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

---

### Step 4.9: Build the backend

```bash
# Build TypeScript to JavaScript
npm run build
```

---

### Step 4.10: Start the backend with PM2

```bash
# Start backend
pm2 start dist/index.js --name redditleads-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command it shows you (copy and paste it)
```

---

### Step 4.11: Verify backend is running

```bash
# Check PM2 status
pm2 status

# Check backend logs
pm2 logs redditleads-backend --lines 50

# Test backend endpoint
curl http://localhost:3001/
# Should output: "Reddit SaaS backend is running 🚀"
```

---

### Step 4.12: Get your VM's external IP (from inside VM)

```bash
curl -H "Metadata-Flavor: Google" \
  http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip
```

**Copy this IP!** This is your backend URL.

---

## ✅ CHECKPOINT 4: Verify Backend Deployment

From your local machine, test the backend:

```bash
# Replace with your VM's external IP
curl http://YOUR_VM_IP:3001/

# Should output: "Reddit SaaS backend is running 🚀"
```

**If you see this message, your backend is live!** 🎉

---

## 🎯 STEP 5: UPDATE FRONTEND WITH BACKEND URL

### Step 5.1: Update Vercel environment variable

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_API_URL`
5. Click **Edit**
6. Change value to: `http://YOUR_VM_IP:3001`
7. Click **Save**

---

### Step 5.2: Redeploy frontend

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~2 minutes)

---

## ✅ CHECKPOINT 5: Test Full Application

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Sign up for an account
3. Complete onboarding
4. Create a test project
5. Try running lead discovery
6. Check dashboard analytics

**If everything works, congratulations! Your app is deployed!** 🎉🎉🎉

---

## 📊 DEPLOYMENT SUMMARY

| Component | Platform | URL/IP | Status |
|-----------|----------|--------|--------|
| **Frontend** | Vercel | https://your-app.vercel.app | ✅ |
| **Backend** | Google Cloud VM | http://YOUR_VM_IP:3001 | ✅ |
| **Database** | VM (PostgreSQL) | localhost:5432 | ✅ |

---

## 🔧 COMMON ISSUES & SOLUTIONS

### Issue 1: Frontend can't connect to backend
**Solution:** 
1. Check CORS in `src/index.ts` - add your Vercel URL to `allowedOrigins`
2. Push changes to GitHub
3. On VM: `cd RedLead && git pull && npm run build && pm2 restart redditleads-backend`

### Issue 2: Database connection errors
**Solution:**
1. Check DATABASE_URL in .env file
2. Verify PostgreSQL is running: `sudo systemctl status postgresql`
3. Test connection: `psql -U redditleads_user -d redditleads -h localhost`

### Issue 3: PM2 not starting on reboot
**Solution:**
```bash
pm2 startup
# Run the command it shows
pm2 save
```

---

## 📱 MONITORING YOUR APP

### Check backend logs
```bash
# SSH into VM
gcloud compute ssh redditleads-vm --zone=us-central1-a

# View logs
pm2 logs redditleads-backend

# Check status
pm2 status
```

### Check frontend logs
1. Go to Vercel dashboard
2. Select your project
3. Go to **Deployments**
4. Click on a deployment
5. View **Function Logs** or **Build Logs**

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Set up custom domain** (optional)
   - Add domain to Vercel
   - Point A record to Vercel

2. **Enable SSL for backend** (recommended)
   - Install Nginx on VM
   - Configure Let's Encrypt SSL
   - Proxy backend through Nginx

3. **Set up monitoring**
   - Enable Google Cloud Monitoring
   - Set up alerts for downtime

4. **Configure backups**
   - Set up automated PostgreSQL backups
   - Use Google Cloud snapshots

---

## 💰 MONTHLY COSTS

| Service | Cost |
|---------|------|
| Vercel (Hobby) | $0 |
| Google Cloud VM | $24 |
| **Total** | **$24/month** |

---

## 🎉 YOU'RE DONE!

Your RedditLeads app is now live and accessible to users worldwide!

**Need help?** Refer to:
- This guide for step-by-step instructions
- `DEPLOYMENT_GUIDE.md` for detailed technical reference
- `QUICK_DEPLOY.md` for quick commands reference

---

## 📞 USEFUL COMMANDS

### VM Management
```bash
# Start VM
gcloud compute instances start redditleads-vm --zone=us-central1-a

# Stop VM (saves money when not in use)
gcloud compute instances stop redditleads-vm --zone=us-central1-a

# SSH into VM
gcloud compute ssh redditleads-vm --zone=us-central1-a
```

### Backend Management (inside VM)
```bash
# Check status
pm2 status

# View logs
pm2 logs redditleads-backend

# Restart backend
pm2 restart redditleads-backend

# Stop backend
pm2 stop redditleads-backend

# Update code
cd RedLead
git pull
npm install
npm run build
pm2 restart redditleads-backend
```

### Database Management (inside VM)
```bash
# Connect to database
psql -U redditleads_user -d redditleads -h localhost

# Backup database
pg_dump -U redditleads_user redditleads > backup_$(date +%Y%m%d).sql

# Restore database
psql -U redditleads_user redditleads < backup_20250101.sql
```

---

**Ready to start? Let's begin with Step 1!** 🚀

