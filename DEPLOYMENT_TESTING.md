# Deployment Testing & Execution Guide

This guide outlines the actual deployment steps that can be performed now that all configuration is complete.

## ✅ Pre-Deployment Verification (Complete)

All of the following have been completed:
- [x] Dependencies installed
- [x] Prisma client generated
- [x] TypeScript compilation verified
- [x] ESLint validation passed
- [x] Production build tested
- [x] Bundle size optimized (60% reduction)
- [x] Docker configurations updated
- [x] Environment templates created
- [x] Deployment documentation written
- [x] Validation scripts created
- [x] Security scan passed (CodeQL)

## 🚀 Next Steps: Actual Deployment

### Option 1: Test Docker Deployment Locally

You can test the full Docker deployment immediately:

```bash
# 1. Create environment file
cp .env.example .env

# 2. Edit .env with local test values (optional - defaults work for local testing)
nano .env

# 3. Build and start all services
docker compose -f docker-compose.prod.yml up -d

# 4. Monitor the deployment
docker compose -f docker-compose.prod.yml logs -f

# 5. Check service health
docker compose -f docker-compose.prod.yml ps

# 6. Test the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Health check: http://localhost:3001/health

# 7. Run health check script
./health-check.sh
```

**Expected Results:**
- MongoDB container running and healthy
- Redis container running and healthy
- Backend container running and healthy (responds on port 3001)
- Frontend container running and healthy (responds on port 3000)
- All health checks pass

### Option 2: Deploy to Vercel + Railway

This requires cloud platform accounts and credentials.

#### A. Deploy Backend to Railway

1. **Sign up/Login to Railway:**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select `adrianstanca1/project-perplexy`
   - Railway will detect `railway.json` configuration

3. **Add Database Services:**
   - Click "New" → "Database" → "Add MongoDB"
   - Click "New" → "Database" → "Add Redis"
   - Railway automatically configures DATABASE_URL and REDIS_URL

4. **Configure Environment Variables:**
   In Railway dashboard, add these variables:
   ```
   NODE_ENV=production
   DATABASE_URL=${{MongoDB.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=<generate with: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
   SESSION_SECRET=<generate with: openssl rand -base64 32>
   FRONTEND_URL=<will be filled after Vercel deployment>
   ```

5. **Deploy:**
   - Railway auto-deploys on git push
   - Note the deployment URL (e.g., https://your-app.up.railway.app)

6. **Run Migrations:**
   - In Railway dashboard: Settings → Deploy
   - One-time: Change start command to include migration
   - After migration, restore original start command

#### B. Deploy Frontend to Vercel

1. **Sign up/Login to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Import Git Repository: `adrianstanca1/project-perplexy`

3. **Configure Build Settings:**
   - Framework Preset: Other
   - Build Command: `cd ../.. && npm install --legacy-peer-deps && npm run build`
   - Output Directory: `packages/frontend/dist`
   - Install Command: `npm install --legacy-peer-deps`

4. **Add Environment Variables:**
   ```
   VITE_API_URL=<your-railway-backend-url>
   ```

5. **Deploy:**
   - Click "Deploy"
   - Note the deployment URL (e.g., https://your-app.vercel.app)

6. **Update Backend FRONTEND_URL:**
   - Go back to Railway
   - Update FRONTEND_URL to your Vercel URL
   - Redeploy backend

#### C. Verify Deployment

```bash
# Set your deployment URLs
export BACKEND_URL="https://your-app.up.railway.app"
export FRONTEND_URL="https://your-app.vercel.app"

# Check backend health
curl $BACKEND_URL/health

# Check API
curl $BACKEND_URL/api/v1/auth/health

# Visit frontend in browser
open $FRONTEND_URL
```

### Option 3: Deploy to AWS/GCP/Azure

Follow the platform-specific guides in CLOUD_DEPLOYMENT.md

## 📋 Post-Deployment Checklist

After deploying to any platform, verify:

- [ ] Backend health endpoint responds: `/health`
- [ ] Frontend loads successfully
- [ ] API endpoints respond: `/api/v1/*`
- [ ] Database connection working
- [ ] Redis connection working
- [ ] CORS configured correctly (frontend can call backend)
- [ ] Socket.IO connection established
- [ ] Authentication flow works
- [ ] File upload functionality works
- [ ] PWA manifest and service worker load correctly
- [ ] SSL/TLS enabled (HTTPS)
- [ ] Environment variables all set correctly

## 🔍 Testing Endpoints

### Backend Endpoints to Test

```bash
# Health check
curl https://your-backend/health

# API v1 endpoints (examples)
curl https://your-backend/api/v1/auth/health
curl https://your-backend/api/v1/projects
curl https://your-backend/api/v1/field
```

### Frontend Features to Test

1. Load the application in browser
2. Check browser console for errors
3. Test navigation between pages
4. Verify API calls in Network tab
5. Test authentication (if configured)
6. Check PWA installation prompt
7. Test offline functionality (disconnect network)
8. Verify Socket.IO connection in console

## 🐛 Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Rebuild without cache
docker compose -f docker-compose.prod.yml build --no-cache

# Check disk space
df -h

# Prune old containers
docker system prune -a
```

**Port already in use:**
```bash
# Find process using port
lsof -i :3001  # Backend
lsof -i :3000  # Frontend

# Kill process or change port in docker-compose.yml
```

### Vercel Issues

**Build fails:**
- Check build logs in Vercel dashboard
- Verify build command is correct
- Ensure install command includes --legacy-peer-deps
- Check Node.js version is 20+

**Frontend can't connect to backend:**
- Verify VITE_API_URL is set correctly
- Check CORS configuration on backend
- Ensure FRONTEND_URL is set on backend
- Check browser console for CORS errors

### Railway Issues

**Backend won't start:**
- Check deployment logs
- Verify DATABASE_URL and REDIS_URL are set
- Ensure Prisma client is generated (check build logs)
- Check environment variables are correct

**Database connection fails:**
- Verify MongoDB plugin is running
- Check DATABASE_URL format
- Ensure network access is allowed
- Check Railway logs for connection errors

## 📊 Monitoring

After deployment, set up monitoring for:

1. **Application Logs:**
   - Backend application logs
   - Frontend access logs
   - Error logs

2. **Performance Metrics:**
   - API response times
   - Database query performance
   - Frontend load times
   - Bundle sizes

3. **System Metrics:**
   - CPU usage
   - Memory usage
   - Disk space
   - Network traffic

4. **Application Metrics:**
   - Active users
   - API request rate
   - Socket.IO connections
   - Error rates

## 🔐 Security Post-Deployment

After deploying, ensure:

1. **All secrets are changed from defaults**
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - SESSION_SECRET
   - Database passwords

2. **HTTPS is enabled**
   - Vercel: Automatic
   - Railway: Automatic
   - Docker: Configure SSL certificates

3. **CORS is properly configured**
   - Only allow your frontend domain

4. **Rate limiting is active**
   - Already configured in backend

5. **Regular security updates**
   ```bash
   npm audit
   npm audit fix
   ```

## 📚 Additional Resources

- [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) - Complete configuration reference
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker deployment details
- [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md) - Quick reference guide
- [DEPLOYMENT_VERCEL_RAILWAY.md](./DEPLOYMENT_VERCEL_RAILWAY.md) - Cloud deployment

## ✅ Success Criteria

Deployment is successful when:

1. ✅ All services are running
2. ✅ Health checks pass
3. ✅ Frontend loads without errors
4. ✅ API calls work correctly
5. ✅ Database operations succeed
6. ✅ Real-time features work (Socket.IO)
7. ✅ Authentication flow works
8. ✅ File uploads work
9. ✅ PWA features work (service worker, manifest)
10. ✅ No console errors

## 🎉 Deployment Complete!

Once all checks pass, your ConstructAI platform is successfully deployed and ready for use!

Remember to:
- Monitor logs regularly
- Set up automated backups
- Configure monitoring and alerting
- Keep dependencies updated
- Review security regularly

---

For support or issues, refer to the troubleshooting guides or open an issue on GitHub.
