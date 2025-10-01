# RedditLeads - Complete Setup Guide

## What is RedditLeads?

RedditLeads is an AI-powered Reddit lead generation SaaS platform that helps businesses find and engage with potential customers on Reddit. It analyzes your website, monitors relevant subreddits, and provides AI-generated responses to help you convert Reddit users into leads.

## Architecture Overview

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI Services**: OpenAI, Google Generative AI, Perplexity
- **Email**: Resend
- **Lead Generation**: Python script with PRAW (Python Reddit API Wrapper)

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **PostgreSQL** database
4. **Git**

## Step 1: Database Setup

1. Install PostgreSQL:
   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql

   # Create database
   createdb redditleads_db
   ```

2. Update your database connection string in the environment files.

## Step 2: Environment Variables Setup

### Main Backend (.env file in root directory):
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/redditleads_db"

# Reddit API Configuration
REDDIT_CLIENT_ID="your_reddit_client_id"
REDDIT_CLIENT_SECRET="your_reddit_client_secret"
REDDIT_USER_AGENT="RedditLeads/1.0 by your_reddit_username"
REDDIT_REFRESH_TOKEN="your_reddit_refresh_token"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret"

# AI Services
OPENAI_API_KEY="sk-your_openai_api_key"
GOOGLE_GENERATIVE_AI_API_KEY="your_google_ai_api_key"
PERPLEXITY_API_KEY="your_perplexity_api_key"

# Email Service
RESEND_API_KEY="re_your_resend_api_key"
FROM_EMAIL="noreply@yourdomain.com"

# Application URLs
FRONTEND_URL="http://localhost:3000"
PORT=5000

# Payment Processing (if using DodoPayments)
DODO_PAYMENTS_API_KEY="your_dodo_payments_key"

# Webhook Configuration
WEBHOOK_SECRET="your_webhook_secret"
```

### Frontend (.env.local file in frontend directory):
```env
# Clerk Authentication (Frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"

# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### Lead Generator (.env file in lead-generator directory):
```env
# Database (same as main .env)
DATABASE_URL="postgresql://username:password@localhost:5432/redditleads_db"

# Reddit API Configuration
REDDIT_CLIENT_ID="your_reddit_client_id"
REDDIT_CLIENT_SECRET="your_reddit_client_secret"
REDDIT_USER_AGENT="RedditLeads/1.0 by your_reddit_username"

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5001
```

## Step 3: External Services Setup

### 1. Reddit API Setup
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Note down your client ID and secret
5. Generate a refresh token using the provided `generate-token.js` script

### 2. Clerk Authentication
1. Go to https://clerk.com and create an account
2. Create a new application
3. Copy the publishable and secret keys
4. Set up webhooks if needed

### 3. AI Services
- **OpenAI**: Get API key from https://platform.openai.com/api-keys
- **Google AI**: Get API key from https://makersuite.google.com/app/apikey
- **Perplexity**: Get API key from https://www.perplexity.ai/settings/api

### 4. Email Service (Resend)
1. Go to https://resend.com and create an account
2. Get your API key from the dashboard
3. Set up a domain for sending emails

## Step 4: Installation and Setup

### 1. Install Backend Dependencies
```bash
cd /Users/neelshah/Downloads/RedditLeads
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Install Lead Generator Dependencies
```bash
cd lead-generator
pip install -r requirements.txt
```

### 4. Database Setup
```bash
# From the root directory
npx prisma generate
npx prisma db push
```

## Step 5: Running the Application

### Terminal 1: Backend Server
```bash
cd /Users/neelshah/Downloads/RedditLeads
npm run dev
```
This will start the backend server on http://localhost:5000

### Terminal 2: Frontend Server
```bash
cd frontend
npm run dev
```
This will start the frontend server on http://localhost:3000

### Terminal 3: Lead Generator (Optional)
```bash
cd lead-generator
python main.py
```
This will start the Python lead generation service on http://localhost:5001

## Step 6: Testing the Setup

1. Open http://localhost:3000 in your browser
2. You should see the RedditLeads landing page
3. Try signing up with Clerk authentication
4. Complete the onboarding flow
5. Check if leads are being discovered (if lead generator is running)

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**: Ensure PostgreSQL is running and the connection string is correct
2. **Reddit API Issues**: Verify your Reddit credentials and refresh token
3. **Clerk Authentication Issues**: Check that your Clerk keys are correct and webhooks are set up
4. **AI Service Issues**: Verify your API keys have sufficient credits/quota

### Logs to Check:
- Backend logs: Check the terminal running `npm run dev`
- Frontend logs: Check browser console and terminal running Next.js
- Lead generator logs: Check the Python terminal output

## Development Notes

- The application uses TypeScript throughout
- Database migrations are managed with Prisma
- Authentication is handled by Clerk
- AI services are used for lead analysis and response generation
- The lead generator runs as a separate Python service
- Webhooks are supported for real-time notifications

## Next Steps

Once everything is running:
1. Test the complete user flow from signup to lead discovery
2. Verify AI-powered features are working
3. Test Reddit integration
4. Set up monitoring and logging for production use
