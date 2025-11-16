# 🚀 ConstructAI Platform - Complete Deployment Guide

This guide covers all deployment options for the ConstructAI platform, from local development to production cloud deployments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Local Deployment](#local-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [CI/CD Setup](#cicd-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** & Docker Compose (for containerized deployment)
- **MongoDB** 7.0+ (or use MongoDB Atlas)
- **Redis** 7+ (or use Redis Cloud)

### Optional Services

- **Vercel Account** (for frontend hosting)
- **Google Cloud Platform** (for file storage)
- **OpenAI API Key** (for AI agents)
- **Sentry Account** (for error tracking)

### Verify Installation

```bash
node --version    # Should be v20.0.0 or higher
pnpm --version    # Should be 8.0.0 or higher
docker --version  # For containerized deployment
```

---

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd project-perplexy
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set required values
# At minimum, set DATABASE_URL and JWT secrets
```

### 3. Database Setup

```bash
# Generate Prisma client
cd packages/backend
pnpm prisma:generate

# Run migrations (if needed)
pnpm prisma:migrate

# Optional: Seed database with sample data
pnpm prisma:seed
```

### 4. Start Development Servers

```bash
# From project root
pnpm dev

# Or start separately
pnpm dev:backend   # Runs on port 3001
pnpm dev:frontend  # Runs on port 3000
```

### 5. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

---

## Environment Configuration

### Development Environment

Create a `.env` file in the project root:

```env
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/constructai
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001
```

### Production Environment

For production, use `.env.production.example` as template:

```env
NODE_ENV=production
DATABASE_URL=mongodb://username:password@host:27017/constructai?authSource=admin
REDIS_URL=redis://:password@host:6379
JWT_SECRET=<secure-random-string-min-32-chars>
JWT_REFRESH_SECRET=<another-secure-random-string>
FRONTEND_URL=https://app.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `DATABASE_URL` | MongoDB connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `VITE_API_URL` | Backend API URL (for frontend) | Yes |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |
| `GCS_BUCKET_NAME` | Google Cloud Storage bucket | - |
| `OPENAI_API_KEY` | OpenAI API key for AI agents | - |
| `SENTRY_DSN` | Sentry error tracking DSN | - |

---

## Local Deployment

### Option 1: Standard Node.js

```bash
# 1. Build all packages
pnpm build:production

# 2. Start backend
cd packages/backend
pnpm start

# 3. Start frontend (in another terminal)
cd packages/frontend
pnpm start
```

### Option 2: Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Build application
pnpm build:production

# Start with PM2
pm2 start packages/backend/dist/index.js --name constructai-backend
pm2 start packages/frontend --name constructai-frontend -- pnpm start

# Save PM2 configuration
pm2 save

# Enable startup script
pm2 startup
```

### Option 3: Nginx + Node.js

1. **Build the application:**
   ```bash
   pnpm build:production
   ```

2. **Configure Nginx** (`/etc/nginx/sites-available/constructai`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       # Frontend
       location / {
           root /path/to/project-perplexy/packages/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # WebSocket
       location /socket.io {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

3. **Enable and restart Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/constructai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Start backend:**
   ```bash
   cd packages/backend
   NODE_ENV=production pnpm start
   ```

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Step-by-Step Docker Deployment

#### 1. Create Environment File

```bash
cp .env.production.example .env
# Edit .env with your production values
```

#### 2. Build Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

#### 3. Start Services

```bash
# Start in detached mode
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

#### 4. Initialize Database

```bash
# Run Prisma migrations
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:seed
```

#### 5. Verify Deployment

```bash
# Check health endpoints
curl http://localhost:3001/health
curl http://localhost:3000
```

### Docker Production Best Practices

1. **Use multi-stage builds** (already configured in Dockerfiles)
2. **Enable health checks** (configured in docker-compose.prod.yml)
3. **Use Docker secrets** for sensitive data
4. **Set resource limits:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

---

## Cloud Deployment

### Vercel (Frontend)

Vercel is recommended for frontend deployment.

#### Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd packages/frontend
   vercel --prod
   ```

#### Environment Variables (Vercel)

Set in Vercel Dashboard or via CLI:
```bash
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production
```

#### Automatic Deployments

The GitHub Actions workflow (`.github/workflows/deploy.yml`) includes Vercel deployment.

**Required Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Backend Deployment Options

#### Option 1: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git subtree push --prefix packages/backend heroku main
```

#### Option 2: AWS (EC2)

1. **Launch EC2 Instance** (Ubuntu 22.04)
2. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm mongodb-org redis
   npm install -g pnpm
   ```

3. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd project-perplexy
   pnpm install
   pnpm build:production
   ```

4. **Configure environment and start with PM2**

#### Option 3: Google Cloud Run (Serverless)

1. **Build Docker image:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/constructai-backend packages/backend
   ```

2. **Deploy:**
   ```bash
   gcloud run deploy constructai-backend \
     --image gcr.io/PROJECT_ID/constructai-backend \
     --platform managed \
     --allow-unauthenticated
   ```

#### Option 4: DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - **Build Command:** `cd packages/backend && pnpm install && pnpm build`
   - **Run Command:** `cd packages/backend && pnpm start`
3. Set environment variables
4. Deploy

---

## CI/CD Setup

### GitHub Actions Workflow

The project includes a complete CI/CD pipeline (`.github/workflows/deploy.yml`):

#### Features

- ✅ Automated testing on push/PR
- ✅ Code quality checks (lint, type-check)
- ✅ Build verification
- ✅ Docker image building
- ✅ Vercel deployment (frontend)
- ✅ Deployment notifications

#### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions:**

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `DOCKER_USERNAME` | Docker Hub username (optional) |
| `DOCKER_PASSWORD` | Docker Hub password (optional) |

#### Workflow Triggers

- **Push to `main`:** Full CI/CD + deployment
- **Push to `develop`:** CI/CD without deployment
- **Pull requests:** CI/CD only

### Manual Deployment

Trigger manual deployment:
```bash
# Using GitHub CLI
gh workflow run deploy.yml

# Or via GitHub UI: Actions → Deploy → Run workflow
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Logs

#### Development
```bash
# Backend logs (console)
cd packages/backend
pnpm dev

# Frontend logs (console)
cd packages/frontend
pnpm dev
```

#### Production (PM2)
```bash
# View logs
pm2 logs constructai-backend
pm2 logs constructai-frontend

# Log file locations
~/.pm2/logs/
```

#### Docker
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Database Maintenance

```bash
# Backup MongoDB
mongodump --uri="mongodb://username:password@host:27017/constructai" --out=backup/

# Restore MongoDB
mongorestore --uri="mongodb://username:password@host:27017/constructai" backup/constructai/

# Run migrations
cd packages/backend
pnpm prisma:migrate
```

### Performance Monitoring

Consider integrating:
- **Sentry** for error tracking
- **New Relic** or **DataDog** for APM
- **LogRocket** for frontend monitoring
- **MongoDB Atlas** monitoring dashboard

---

## Troubleshooting

### Build Errors

**Error: Cannot find module '@prisma/client'**
```bash
cd packages/backend
pnpm prisma:generate
```

**Error: pnpm-lock.yaml is not compatible**
```bash
pnpm install --no-frozen-lockfile
```

### Runtime Errors

**Port already in use**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

**Database connection failed**
- Verify MongoDB is running: `mongosh`
- Check DATABASE_URL in .env
- Ensure network connectivity

**Redis connection failed**
- Verify Redis is running: `redis-cli ping`
- Check REDIS_URL in .env

### Docker Issues

**Build fails**
```bash
# Clean cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
```

**Container exits immediately**
```bash
# Check logs
docker-compose logs backend

# Inspect container
docker inspect constructai-backend
```

### Deployment Issues

**Vercel build fails**
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure all dependencies are in `package.json`

**502 Bad Gateway (Nginx)**
- Check backend is running
- Verify proxy_pass URL
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

---

## Production Checklist

Before deploying to production:

### Security
- [ ] Change all default secrets (JWT, MongoDB, Redis passwords)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Review Prisma schema for sensitive data

### Performance
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up Redis caching
- [ ] Optimize database indexes
- [ ] Enable database connection pooling

### Monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Set up logging aggregation
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure alerts for critical errors

### Backup & Recovery
- [ ] Set up automated database backups
- [ ] Test backup restoration process
- [ ] Document recovery procedures
- [ ] Configure data retention policies

### Documentation
- [ ] Update API documentation
- [ ] Document deployment procedures
- [ ] Create runbooks for common issues
- [ ] Document environment variables

---

## Support

For issues and questions:
- **GitHub Issues:** [Create an issue](https://github.com/your-repo/issues)
- **Documentation:** [README.md](./README.md)
- **Email:** support@yourdomain.com

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Last Updated:** 2024-11-16  
**Version:** 1.0.0
