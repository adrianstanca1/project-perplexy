# Quick Deployment Reference

## Choose Your Deployment Method

### 1. Vercel (Frontend) + Railway (Backend) ⭐ Recommended for Production

**Best for:** Production deployment with minimal configuration

**Steps:**
1. Configure environment variables (see below)
2. Push to GitHub
3. Connect Vercel to GitHub repository
4. Connect Railway to GitHub repository
5. Configure build settings
6. Deploy!

**See:** [DEPLOYMENT_VERCEL_RAILWAY.md](./DEPLOYMENT_VERCEL_RAILWAY.md)

---

### 2. Docker Compose 🐳 Recommended for Self-Hosted

**Best for:** Local development, self-hosted production

**Steps:**
```bash
# Setup
cp .env.example .env
# Edit .env with your configuration

# Deploy
docker compose -f docker-compose.prod.yml up -d

# Health check
./health-check.sh
```

**See:** [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

### 3. AWS/GCP/Azure ☁️ Enterprise

**Best for:** Enterprise deployments with specific cloud requirements

**See:** [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md)

---

## Environment Variables Quick Reference

### Backend (.env)

```env
NODE_ENV=production
PORT=3001

# Database - REQUIRED
DATABASE_URL=mongodb://user:pass@host:27017/constructai?authSource=admin

# Cache - REQUIRED
REDIS_URL=redis://host:6379

# Security - REQUIRED (generate with: openssl rand -base64 32)
JWT_SECRET=<your-secret-here>
JWT_REFRESH_SECRET=<your-secret-here>
SESSION_SECRET=<your-secret-here>

# CORS - REQUIRED
FRONTEND_URL=https://your-frontend-domain.com

# OAuth - Optional
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/v1/auth/google/callback

# Email - Optional
SENDGRID_API_KEY=
FROM_EMAIL=noreply@constructai.com
```

### Frontend (.env)

```env
# Backend API URL - REQUIRED
VITE_API_URL=https://your-backend-domain.com

# For Docker with nginx proxy, leave empty:
# VITE_API_URL=
```

---

## Platform-Specific Quick Start

### Vercel (Frontend)

**Option 1: CLI**
```bash
cd packages/frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option 2: GitHub Integration**
1. Go to [vercel.com](https://vercel.com)
2. Import Git Repository
3. Configure:
   - Build Command: `cd ../.. && npm install --legacy-peer-deps && npm run build`
   - Output Directory: `packages/frontend/dist`
   - Install Command: `npm install --legacy-peer-deps`
4. Add environment variable: `VITE_API_URL=<backend-url>`
5. Deploy

### Railway (Backend)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add MongoDB plugin
5. Add Redis plugin
6. Configure Service:
   - Root Directory: Leave empty (railway.json handles this)
   - Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=${{MongoDB.DATABASE_URL}}
     REDIS_URL=${{Redis.REDIS_URL}}
     JWT_SECRET=<generate-secure-value>
     JWT_REFRESH_SECRET=<generate-secure-value>
     SESSION_SECRET=<generate-secure-value>
     FRONTEND_URL=<your-vercel-url>
     ```
7. Deploy

### Docker

**Development:**
```bash
docker compose up -d
```

**Production:**
```bash
# Setup
cp .env.example .env
nano .env  # Edit with production values

# Deploy
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## Health Check Commands

### Check Backend
```bash
curl https://your-backend-domain.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Check Frontend
```bash
curl https://your-frontend-domain.com
# Expected: HTML page
```

### Check API
```bash
curl https://your-backend-domain.com/api/v1/auth/health
```

### Full Health Check
```bash
./health-check.sh
```

---

## Common Issues & Solutions

### Backend can't connect to database
- ✅ Check DATABASE_URL format
- ✅ Verify MongoDB is running and accessible
- ✅ Check network/firewall settings
- ✅ Test with: `docker compose exec backend npm run prisma:generate`

### Frontend shows API errors
- ✅ Verify VITE_API_URL is correct
- ✅ Check CORS settings on backend (FRONTEND_URL)
- ✅ Ensure backend is running and accessible
- ✅ Check browser console for errors

### Build fails
- ✅ Run `npm install --legacy-peer-deps`
- ✅ Run `cd packages/backend && npm run prisma:generate`
- ✅ Clear cache: `rm -rf node_modules dist && npm install`
- ✅ Check Node.js version (need 20+)

### Docker build fails
- ✅ Check Docker is running
- ✅ Build with no cache: `docker compose build --no-cache`
- ✅ Check disk space: `df -h`
- ✅ Prune old images: `docker system prune -a`

---

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected and migrations run
- [ ] Redis connected
- [ ] Backend health check passing: `/health`
- [ ] Frontend loads successfully
- [ ] API responding: `/api/v1/*`
- [ ] Authentication working
- [ ] Socket.IO connected
- [ ] File uploads working
- [ ] PWA manifest loading
- [ ] CORS configured
- [ ] SSL/TLS enabled (production)
- [ ] Monitoring set up
- [ ] Backups configured

---

## Need Help?

1. **Validation Script:** `./validate-deployment.sh`
2. **Readiness Test:** `./test-deployment-readiness.sh`
3. **Health Check:** `./health-check.sh`
4. **Detailed Guides:**
   - [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) - Complete configuration guide
   - [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker deployment guide
   - [DEPLOYMENT_VERCEL_RAILWAY.md](./DEPLOYMENT_VERCEL_RAILWAY.md) - Cloud deployment
   - [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md) - Build instructions

---

## Security Reminders

⚠️ **Before deploying to production:**
1. Change all default passwords and secrets
2. Use strong random values for JWT secrets: `openssl rand -base64 32`
3. Enable HTTPS
4. Configure proper CORS origins
5. Review security headers
6. Run security audit: `npm audit`
7. Keep dependencies updated
8. Set up monitoring and logging

---

Built with ❤️ for the construction industry
