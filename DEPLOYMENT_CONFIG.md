# Deployment Configuration Guide

## Environment Setup

This document provides the complete configuration needed for deploying the ConstructAI platform.

## Quick Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended for Production

**Frontend (Vercel):**
- Automatically deploys from GitHub
- Configure environment variables in Vercel dashboard
- Build command: `npm run build` (from root)
- Output directory: `packages/frontend/dist`

**Backend (Railway):**
- Deploys from GitHub
- Root directory: `packages/backend`
- Automatically provisions MongoDB and Redis
- Configure environment variables in Railway dashboard

### Option 2: Docker Compose - Local/Self-Hosted

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configurations
# Then deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: AWS/GCP/Azure - Enterprise

See individual cloud provider guides in CLOUD_DEPLOYMENT.md

---

## Environment Variables

### Backend Required Variables

**Security Note:** Never commit credentials (such as database usernames or passwords) to version control. Always use environment-specific secret management for production deployments (e.g., Railway secrets, AWS Secrets Manager, etc.).

```env
# Node Environment
NODE_ENV=production
PORT=3001

# Database (MongoDB)
DATABASE_URL=mongodb://user:password@host:27017/constructai?authSource=admin

# Cache (Redis)
REDIS_URL=redis://host:6379

# Security (IMPORTANT: Change these!)
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-secure-random-string>
SESSION_SECRET=<generate-secure-random-string>

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# OAuth2 (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/v1/auth/google/callback

# Email (Optional - SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@constructai.com

# File Storage
FILE_STORAGE_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=py,js,ts,jsx,tsx,json,csv,txt,md,pdf,doc,docx,xls,xlsx

# Cloud Storage (Optional - Google Cloud)
GCS_BUCKET_NAME=your-bucket
GCS_PROJECT_ID=your-project-id
GCS_KEYFILE_PATH=/path/to/keyfile.json

# Payments (Optional - Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend Required Variables

```env
# Backend API URL
VITE_API_URL=https://your-backend-domain.com

# For Docker deployments (using nginx proxy)
# VITE_API_URL=
```

---

## Generating Secure Secrets

Use these commands to generate secure random strings:

```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Platform-Specific Deployment

### Vercel Frontend Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy from frontend directory:**
```bash
cd packages/frontend
vercel --prod
```

4. **Or use GitHub integration:**
   - Connect repository to Vercel
   - Set build settings:
     - Root Directory: Leave blank (use project root)
     - Build Command: `npm install --legacy-peer-deps && npm run build`
     - Output Directory: `packages/frontend/dist`
     - Install Command: `npm install --legacy-peer-deps`

5. **Configure environment variables in Vercel dashboard:**
   - `VITE_API_URL`: Your backend URL (e.g., https://api.constructai.com)

### Railway Backend Deployment

1. **Create Railway Project:**
   - Go to railway.app
   - Connect GitHub repository
   - Select backend service

2. **Configure Service:**
   - Root Directory: `packages/backend`
   - Build Command: `npm install --legacy-peer-deps && cd packages/backend && npm run build`
   - Start Command: `cd packages/backend && npm start`

3. **Add Database Services:**
   - Add MongoDB plugin
   - Add Redis plugin
   - Railway automatically sets DATABASE_URL and REDIS_URL

4. **Set Environment Variables:**
   - Copy variables from Backend Required Variables section above
   - Use Railway's variable references: `${{MongoDB.DATABASE_URL}}`

5. **Run Migrations (Safe Production Approach):**
   - Use Railway's one-time job feature or Railway CLI to run migrations before starting your backend service:
   
   **Option 1: Railway CLI (Recommended):**
   ```bash
   railway run npx prisma migrate deploy
   ```
   
   **Option 2: Railway Dashboard:**
   - In the Railway dashboard, go to your backend service
   - Click "New" → "Job" → "One-Time Job"
   - Set the job command to: `cd packages/backend && npx prisma migrate deploy`
   - Run the job and verify migration success in the logs
   - Once migrations are complete, start your backend service with the standard start command
   
   **Important:** Do NOT run migrations as part of the start command in production, as this can cause downtime or race conditions with multiple instances.
   
   See [Prisma production migration docs](https://www.prisma.io/docs/orm/prisma-migrate/workflows#production) for more details.

### Docker Deployment

1. **Production Docker Compose:**
```bash
# From project root
docker-compose -f docker-compose.prod.yml up -d
```

2. **Health Check:**
```bash
./health-check.sh
```

3. **View Logs:**
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

4. **Stop Services:**
```bash
docker-compose -f docker-compose.prod.yml down
```

---

## Database Setup

### MongoDB

**Local Development:**
```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=changeme \
  -e MONGO_INITDB_DATABASE=constructai \
  --name constructai-mongodb \
  mongo:7.0
```

**Production:**
- MongoDB Atlas (Recommended)
- Railway MongoDB
- Self-hosted MongoDB cluster

**Connection String Format:**
```
mongodb://username:password@host:port/database?authSource=admin
```

### Redis

**Local Development:**
```bash
docker run -d -p 6379:6379 \
  --name constructai-redis \
  redis:7-alpine
```

**Production:**
- Redis Cloud (Recommended)
- Railway Redis
- AWS ElastiCache
- Self-hosted Redis cluster

**Connection String Format:**
```
redis://host:port
redis://:password@host:port  # With password
```

### Database Migrations

```bash
cd packages/backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

---

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Redis connection working
- [ ] Backend health check passing: `/health`
- [ ] Frontend loads successfully
- [ ] API endpoints responding: `/api/v1/auth/health`
- [ ] Socket.IO connection working
- [ ] Authentication flow working
- [ ] File upload working
- [ ] PWA manifest and service worker loading
- [ ] CORS configured correctly
- [ ] SSL/TLS certificates configured (production)
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented

---

## Health Checks

### Backend Health Check
```bash
curl https://your-backend-domain.com/health
# Expected: {"status":"ok","timestamp":"<ISO-8601-timestamp>"}
```

### Frontend Health Check
```bash
curl https://your-frontend-domain.com
# Expected: HTML page with ConstructAI
```

### API Health Check
```bash
curl https://your-backend-domain.com/api/v1/auth/health
# Expected: API response
```

### Socket.IO Check
Use browser console:
```javascript
const socket = io('https://your-backend-domain.com')
socket.on('connect', () => console.log('Connected!'))
```

---

## Monitoring

### Recommended Tools
- **Application Monitoring**: New Relic, DataDog, or AppDynamics
- **Error Tracking**: Sentry
- **Logs**: LogDNA, Papertrail, or CloudWatch
- **Uptime**: Pingdom, UptimeRobot

### Key Metrics to Monitor
- API response times
- Database query performance
- Redis hit/miss ratio
- Error rates
- Active Socket.IO connections
- Memory usage
- CPU usage
- Disk usage

---

## Troubleshooting

### Backend won't start
1. Check DATABASE_URL is correct
2. Check REDIS_URL is correct
3. Verify Prisma client is generated
4. Check logs for errors

### Frontend shows API errors
1. Verify VITE_API_URL is correct
2. Check CORS settings on backend
3. Verify backend is running and accessible
4. Check network tab in browser dev tools

### Database connection issues
1. Verify MongoDB is running
2. Check connection string format
3. Verify network access (firewall, security groups)
4. Test connection with MongoDB Compass

### Redis connection issues
1. Verify Redis is running
2. Check connection string format
3. Test connection with redis-cli

---

## Security Best Practices

1. **Change all default secrets** before deploying to production
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** for all production deployments
4. **Configure CORS** to allow only your frontend domain
5. **Use secure cookies** (httpOnly, secure, sameSite)
6. **Implement rate limiting** (already configured)
7. **Regular security audits** with `npm audit`
8. **Keep dependencies updated**
9. **Monitor logs** for suspicious activity
10. **Backup database regularly**

---

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple backend instances behind a load balancer
- Use Redis for session storage (shared across instances)
- Configure Socket.IO with Redis adapter for multi-instance support

### Database Scaling
- MongoDB replica sets for high availability
- Read replicas for read-heavy workloads
- Sharding for very large datasets

### Caching Strategy
- Redis for session data
- Redis for frequently accessed data
- CDN for static assets

---

## Support

For deployment issues, check:
1. GitHub Issues
2. Deployment logs
3. Health check script output
4. Application logs

For urgent production issues, contact the development team.
