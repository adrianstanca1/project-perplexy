# Full Stack Deployment Guide - ConstructAI

This guide will help you deploy the complete ConstructAI platform with frontend on Vercel and backend on Railway.

## Prerequisites

- Node.js 20+ installed
- npm installed
- Git repository access
- Vercel account (free tier available)
- Railway account (free tier available)

## Architecture

- **Frontend**: Deployed to Vercel (React PWA)
- **Backend**: Deployed to Railway (Node.js + Express)
- **Database**: MongoDB on Railway
- **Cache**: Redis on Railway

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select this repository

### Step 2: Add Database Services

1. In your Railway project, click "New" → "Database" → "Add MongoDB"
2. Click "New" → "Database" → "Add Redis"
3. Railway will automatically provision these databases

### Step 3: Configure Backend Service

1. In Railway dashboard, select your backend service
2. Go to "Settings" → "Root Directory" and set it to: `packages/backend`
3. Go to "Settings" → "Build Command" and set it to:
   ```
   npm install --legacy-peer-deps && npm run build --workspace=backend
   ```
4. Go to "Settings" → "Start Command" and set it to:
   ```
   npm run start --workspace=backend
   ```

### Step 4: Set Environment Variables

In Railway, go to your backend service → "Variables" and add:

```env
NODE_ENV=production
PORT=3001

# Get these from Railway's MongoDB and Redis plugins
DATABASE_URL=${{MongoDB.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Generate secure secrets (use: openssl rand -base64 32)
JWT_SECRET=your-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-here
SESSION_SECRET=your-secure-session-secret-here

# Will be updated after Vercel deployment
FRONTEND_URL=https://your-app.vercel.app

# Optional: Add these if using external services
SENDGRID_API_KEY=your-sendgrid-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 5: Deploy Backend

1. Railway will automatically deploy when you push to your GitHub repository
2. Once deployed, copy your backend URL (e.g., `https://your-app.up.railway.app`)
3. Test the health endpoint: `https://your-app.up.railway.app/health`

### Step 6: Run Database Migrations

In Railway dashboard:
1. Select your backend service
2. Go to "Settings" → "Deploy" → "Custom Start Command"
3. Temporarily change start command to: `npx prisma migrate deploy && npm start`
4. Redeploy the service
5. After successful migration, change start command back to: `npm start`

## Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Configure Frontend Environment

Create a `.env.production` file in `packages/frontend/`:

```env
# Backend API URL from Railway
VITE_API_URL=https://your-app.up.railway.app

# WebSocket URL (same as API URL)
VITE_WS_URL=wss://your-app.up.railway.app
```

### Step 3: Deploy to Vercel

From the root directory:

```bash
# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel --prod
```

Or use the Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the `vercel.json` configuration
5. Click "Deploy"

### Step 4: Set Environment Variables in Vercel

In Vercel dashboard:
1. Go to your project → "Settings" → "Environment Variables"
2. Add the following variables:

```env
VITE_API_URL=https://your-app.up.railway.app
VITE_WS_URL=wss://your-app.up.railway.app
```

3. Click "Redeploy" to apply the changes

### Step 5: Update Backend FRONTEND_URL

1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` variable with your Vercel deployment URL
3. Redeploy the backend service

## Part 3: Verify Deployment

### Frontend Checks

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Verify the application loads
3. Check browser console for errors
4. Test PWA functionality (Add to Home Screen)

### Backend Checks

1. Visit `https://your-app.up.railway.app/health`
2. Should return: `{"status":"ok","timestamp":"..."}`
3. Test API endpoint: `https://your-app.up.railway.app/api/v1/health` (if exists)

### Integration Checks

1. Try logging in to the application
2. Test real-time features (if Socket.IO is working)
3. Create a test project or resource
4. Verify data persistence

## Troubleshooting

### Frontend Issues

**Problem**: Application shows "Cannot connect to server"
- Check that `VITE_API_URL` is set correctly in Vercel
- Verify backend is running on Railway
- Check CORS settings in backend

**Problem**: 404 on refresh
- This is already handled by the `vercel.json` rewrites configuration

**Problem**: Service Worker not updating
- Clear browser cache
- Check `sw.js` has proper cache-control headers

### Backend Issues

**Problem**: Database connection errors
- Verify `DATABASE_URL` in Railway variables
- Check MongoDB plugin is running
- Test connection string locally

**Problem**: "Module not found" errors
- Ensure build command includes `npm install --legacy-peer-deps`
- Check that all dependencies are in `package.json`

**Problem**: Migrations not applied
- Run migrations manually using Railway CLI:
  ```bash
  railway run npx prisma migrate deploy
  ```

## Post-Deployment

### Enable Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Railway:**
1. Go to Service Settings → Networking
2. Add custom domain
3. Update DNS records

### Set up Monitoring

1. Enable Vercel Analytics in project settings
2. Set up Railway monitoring and alerts
3. Configure error tracking (e.g., Sentry)

### Security Checklist

- [ ] All environment variables use secure secrets
- [ ] CORS is configured with specific origins (not `*`)
- [ ] Database is not publicly accessible
- [ ] HTTPS is enabled on all services
- [ ] Rate limiting is active
- [ ] Sessions are secure with `httpOnly` cookies

## Continuous Deployment

Both Vercel and Railway support automatic deployments:

- **Vercel**: Automatically deploys on push to `main` branch
- **Railway**: Automatically deploys on push to connected branch

To deploy updates:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both services will automatically build and deploy your changes.

## Alternative: One-Command Local Deployment

If you prefer to deploy locally first:

```bash
# Deploy frontend to Vercel
cd packages/frontend
vercel --prod

# Deploy backend to Railway
cd ../backend
railway up
```

## Costs

- **Vercel Free Tier**: 100GB bandwidth, unlimited deployments
- **Railway Free Tier**: $5 free credit/month, ~500 hours runtime
- **Scaling**: Both platforms offer paid plans for production workloads

## Support

For deployment issues:
- Vercel: https://vercel.com/support
- Railway: https://railway.app/help
- GitHub Issues: Open an issue in this repository
