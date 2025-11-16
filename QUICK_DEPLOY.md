# 🚀 Quick Deployment Guide

This is a quick reference for deploying the ConstructAI platform. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites

- Node.js 20+
- pnpm 8+
- MongoDB 7.0+
- Redis 7+
- Docker (optional, for containerized deployment)

## Quick Deploy

### 1. Using Deployment Script (Recommended)

```bash
# Make script executable (first time only)
chmod +x deploy-production.sh

# Run deployment script
./deploy-production.sh
```

The script will guide you through:
- Prerequisites check
- Environment setup
- Dependency installation
- Building the application
- Choosing deployment method (Docker, PM2, or standalone)

### 2. Manual Deployment

#### Step 1: Setup Environment

```bash
# Copy environment template
cp .env.production.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

#### Step 2: Install & Build

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd packages/backend && pnpm prisma:generate && cd ../..

# Build all packages
pnpm build:production
```

#### Step 3: Deploy

Choose one of the following:

**Option A: Docker Compose**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Option B: PM2**
```bash
# Install PM2
npm install -g pm2

# Start services
cd packages/backend && pm2 start dist/index.js --name backend
cd ../frontend && pm2 start npm --name frontend -- start
pm2 save
```

**Option C: Node.js**
```bash
# Terminal 1 - Backend
cd packages/backend
NODE_ENV=production node dist/index.js

# Terminal 2 - Frontend
cd packages/frontend
pnpm start
```

## Access Points

After deployment:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## Environment Variables

### Required

- `DATABASE_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `FRONTEND_URL` - Frontend URL
- `VITE_API_URL` - Backend API URL (for frontend)

### Optional

- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GCS_BUCKET_NAME` - Google Cloud Storage
- `OPENAI_API_KEY` - OpenAI for AI agents
- `SENTRY_DSN` - Error tracking

## Cloud Deployments

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd packages/frontend
vercel --prod
```

### Heroku (Backend)

```bash
# Create app
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab

# Deploy
git subtree push --prefix packages/backend heroku main
```

## Docker Commands

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Rebuild
docker-compose -f docker-compose.prod.yml build
```

## PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Delete
pm2 delete all
```

## Troubleshooting

### Build fails with Prisma errors
```bash
cd packages/backend
pnpm prisma:generate
```

### Port already in use
```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>
```

### Database connection fails
- Check MongoDB is running
- Verify DATABASE_URL in .env
- Ensure network connectivity

### Docker build fails
```bash
# Clean and rebuild
docker-compose down -v
docker system prune -a
docker-compose -f docker-compose.prod.yml build --no-cache
```

## CI/CD

The project includes GitHub Actions workflow for automated deployment:

- **File:** `.github/workflows/deploy.yml`
- **Triggers:** Push to main/develop, Pull requests
- **Features:** Testing, building, Docker, Vercel deployment

### Required GitHub Secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Expected: {"status":"ok","timestamp":"..."}
```

## Next Steps

1. ✅ Deploy application
2. ✅ Verify health endpoints
3. ✅ Set up monitoring (Sentry, etc.)
4. ✅ Configure backups
5. ✅ Set up SSL/TLS
6. ✅ Configure domain names
7. ✅ Enable auto-scaling (if needed)

## Support

- **Full Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **README:** [README.md](./README.md)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)

---

**Quick Reference Card**

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Build | `pnpm build:production` |
| Start dev | `pnpm dev` |
| Deploy script | `./deploy-production.sh` |
| Docker up | `docker-compose -f docker-compose.prod.yml up -d` |
| PM2 start | `pm2 start packages/backend/dist/index.js` |
| Health check | `curl http://localhost:3001/health` |
