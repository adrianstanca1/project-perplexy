# 🚀 ConstructAI Platform - Complete Deployment Guide

This guide provides comprehensive instructions for deploying the ConstructAI construction management platform in various environments.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Local Development](#local-development)
4. [Production Deployment Options](#production-deployment-options)
   - [Docker Compose (Recommended)](#docker-compose-deployment)
   - [Manual Deployment](#manual-deployment)
   - [Cloud Platforms](#cloud-platform-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Checklist](#security-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

Deploy the entire application with Docker in under 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd project-perplexy

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your configuration (see Environment Configuration section)

# 3. Deploy with Docker
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## Prerequisites

### Required Software

- **Node.js**: Version 20 or higher
- **npm**: Version 8 or higher
- **Docker & Docker Compose**: Latest stable version (for containerized deployment)

### Optional Requirements

- **MongoDB**: Version 7.0+ (if not using Docker)
- **Redis**: Version 7+ (if not using Docker)
- **Python 3**: For code execution features
- **Nginx**: For production reverse proxy

### Verify Installation

```bash
node --version    # Should be v20.0.0+
npm --version     # Should be 8.0.0+
docker --version  # Latest stable
```

---

## Local Development

### Step 1: Install Dependencies

```bash
# Install all workspace dependencies
npm install --legacy-peer-deps

# Generate Prisma client
cd packages/backend
npm run prisma:generate
cd ../..
```

### Step 2: Start Infrastructure Services

Using Docker:

```bash
# Start MongoDB and Redis only
docker-compose up -d mongodb redis
```

Or install MongoDB and Redis locally:
- MongoDB: https://www.mongodb.com/docs/manual/installation/
- Redis: https://redis.io/docs/getting-started/

### Step 3: Configure Environment

```bash
# Copy the environment template
cp .env.example .env

# Update .env with your local configuration
# For development, you can keep most default values
```

### Step 4: Start Development Servers

```bash
# Option 1: Start all services together
npm run dev

# Option 2: Start services separately
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

---

## Production Deployment Options

### Docker Compose Deployment

**Recommended for:** Quick production deployments, testing, small to medium scale

#### Step 1: Prepare Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and update ALL security-sensitive values:
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - SESSION_SECRET
# - MONGO_PASSWORD
# - REDIS_PASSWORD
```

#### Step 2: Build and Deploy

```bash
# Using standard docker-compose.yml (development/staging)
docker-compose up -d

# OR using production configuration
docker-compose -f docker-compose.prod.yml up -d
```

#### Step 3: Initialize Database

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Optional: Seed database with initial data
docker-compose exec backend npm run prisma db seed
```

#### Step 4: Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoints
curl http://localhost:3001/health
curl http://localhost:3000
```

#### Managing the Deployment

```bash
# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a specific service
docker-compose restart backend

# Update and redeploy
git pull
docker-compose build
docker-compose up -d
```

---

### Manual Deployment

**Recommended for:** Custom server setups, advanced configurations

#### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

#### Step 2: Generate Prisma Client

```bash
cd packages/backend
npm run prisma:generate
cd ../..
```

#### Step 3: Build All Packages

```bash
# Build with production optimizations
NODE_ENV=production npm run build
```

#### Step 4: Configure Environment

Ensure `.env` file is configured with production values.

#### Step 5: Start MongoDB and Redis

**Option A: Using Docker**

```bash
docker-compose up -d mongodb redis
```

**Option B: Native Installation**

Follow platform-specific guides:
- MongoDB: https://www.mongodb.com/docs/manual/installation/
- Redis: https://redis.io/docs/getting-started/installation/

#### Step 6: Run Database Migrations

```bash
cd packages/backend
npx prisma migrate deploy
cd ../..
```

#### Step 7: Start Application

**Option A: Using Process Manager (Recommended)**

Using PM2:

```bash
# Install PM2
npm install -g pm2

# Start backend
cd packages/backend
pm2 start dist/index.js --name constructai-backend

# Start frontend (using a static server)
cd ../frontend
pm2 start "npx serve -s dist -l 3000" --name constructai-frontend

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

**Option B: Manual Start**

```bash
# Terminal 1: Backend
cd packages/backend
NODE_ENV=production node dist/index.js

# Terminal 2: Frontend
cd packages/frontend
npx serve -s dist -l 3000
```

#### Step 8: Setup Nginx Reverse Proxy (Optional but Recommended)

Create `/etc/nginx/sites-available/constructai`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
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

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/constructai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Cloud Platform Deployment

#### Vercel (Frontend Only)

**Best for:** Frontend hosting with global CDN

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd packages/frontend
vercel --prod
```

Configuration is in `packages/frontend/vercel.json`.

**Backend hosting needed separately** (see Railway, Render, or AWS options below).

#### Railway

**Best for:** Full-stack deployment with database

1. Install Railway CLI:
```bash
npm i -g railway
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add services:
- MongoDB: Add from Railway marketplace
- Redis: Add from Railway marketplace
- Backend: Deploy from `packages/backend`
- Frontend: Deploy from `packages/frontend`

4. Configure environment variables in Railway dashboard

5. Deploy:
```bash
railway up
```

#### Render

**Best for:** Easy deployment with managed databases

1. Create account at https://render.com

2. Create services:
   - **Web Service** for backend (from `packages/backend`)
   - **Static Site** for frontend (from `packages/frontend`)
   - **PostgreSQL** or **MongoDB** database
   - **Redis** instance

3. Configure build commands:
   - Backend: `npm install --legacy-peer-deps && npm run build`
   - Frontend: `npm install --legacy-peer-deps && npm run build`

4. Set environment variables in Render dashboard

#### AWS (Advanced)

**Best for:** Enterprise-scale deployments

Services needed:
- **EC2** or **ECS**: Application hosting
- **DocumentDB**: MongoDB-compatible database
- **ElastiCache**: Redis caching
- **S3**: File storage
- **CloudFront**: CDN for frontend
- **Route 53**: DNS management
- **Load Balancer**: Traffic distribution

Deployment approaches:
1. **ECS with Fargate**: Containerized deployment
2. **EC2 with Docker**: Self-managed containers
3. **Elastic Beanstalk**: Platform-as-a-Service
4. **Lambda + API Gateway**: Serverless (requires code modifications)

#### Google Cloud Platform

Services needed:
- **Cloud Run**: Container hosting
- **Cloud Storage**: File storage
- **Cloud MongoDB Atlas**: Managed MongoDB
- **Memorystore**: Redis caching

#### Microsoft Azure

Services needed:
- **App Service**: Application hosting
- **Cosmos DB**: MongoDB API
- **Azure Cache for Redis**: Redis caching
- **Blob Storage**: File storage

---

## Environment Configuration

### Critical Security Variables

**⚠️ MUST be changed in production:**

```env
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>
SESSION_SECRET=<generate-64-char-random-string>
MONGO_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
```

Generate secure secrets:

```bash
# Generate random secrets (64 characters)
openssl rand -hex 32
```

### Application Configuration

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com
```

### Database Configuration

```env
# For Docker setup
DATABASE_URL=mongodb://admin:password@mongodb:27017/constructai?authSource=admin

# For external MongoDB (MongoDB Atlas)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/constructai

# Redis
REDIS_URL=redis://localhost:6379
# With password
REDIS_URL=redis://:password@localhost:6379
```

### File Storage

```env
FILE_STORAGE_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=py,js,ts,jsx,tsx,json,csv,txt,md,pdf,doc,docx
```

For production, use Google Cloud Storage:

```env
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-project-id
GCS_KEYFILE_PATH=/path/to/keyfile.json
```

### OAuth Configuration

Google OAuth (optional):

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://api.your-domain.com/api/v1/auth/google/callback
```

---

## Database Setup

### MongoDB

#### Using Docker

MongoDB is automatically configured in docker-compose.yml.

#### Manual Setup

1. Install MongoDB 7.0+
2. Create database and user:

```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["root"]
})

use constructai
db.createUser({
  user: "constructai_user",
  pwd: "your-secure-password",
  roles: ["readWrite"]
})
```

#### MongoDB Atlas (Cloud)

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update `DATABASE_URL` in `.env`

### Prisma Migrations

```bash
# Development: Create and apply migrations
cd packages/backend
npm run prisma migrate dev

# Production: Apply existing migrations
npx prisma migrate deploy

# Generate Prisma Client
npm run prisma:generate

# View database in Prisma Studio
npm run prisma:studio
```

### Redis

#### Using Docker

Redis is automatically configured in docker-compose.yml.

#### Manual Setup

**Linux/macOS:**

```bash
# Install
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                  # macOS

# Start
redis-server

# With password
redis-server --requirepass your-password
```

---

## Monitoring & Logging

### Application Logs

**Docker deployment:**

```bash
# View all logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

**Manual deployment:**

Logs are written to `logs/` directory (configure in `.env`).

```bash
# View logs
tail -f logs/app.log
tail -f logs/error.log
```

### Health Monitoring

#### Built-in Health Endpoints

```bash
# Backend health
curl http://localhost:3001/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

#### Monitoring Tools

**Recommended monitoring solutions:**

1. **Prometheus + Grafana**: Metrics and dashboards
2. **Winston**: Logging (already integrated)
3. **Sentry**: Error tracking
4. **New Relic**: Application performance monitoring
5. **Datadog**: Full-stack monitoring

### Database Monitoring

```bash
# MongoDB status
mongosh --eval "db.serverStatus()"

# Redis status
redis-cli info

# Docker stats
docker stats
```

---

## Security Checklist

### Pre-Deployment Security

- [ ] Change all default passwords
- [ ] Generate secure JWT secrets (64+ characters)
- [ ] Enable HTTPS/SSL in production
- [ ] Configure CORS properly
- [ ] Set secure cookie options
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Disable unnecessary ports
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Enable Redis password protection
- [ ] Keep dependencies updated
- [ ] Run security audits

### Security Commands

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update --save
```

### SSL/TLS Setup

**Using Let's Encrypt with Nginx:**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Firewall Configuration

**Using UFW (Ubuntu):**

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

---

## Troubleshooting

### Build Errors

**Prisma client not found:**

```bash
cd packages/backend
npm run prisma:generate
```

**TypeScript errors:**

```bash
# Clean and rebuild
npm run clean
npm install --legacy-peer-deps
npm run build
```

**Missing dependencies:**

```bash
npm install --legacy-peer-deps
```

### Runtime Errors

**Port already in use:**

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

**MongoDB connection failed:**

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check logs
docker-compose logs mongodb

# Verify connection string in .env
```

**Redis connection failed:**

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
```

### Docker Issues

**Services not starting:**

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

**Database persistence issues:**

```bash
# Check volumes
docker volume ls

# Recreate volumes (⚠️ deletes data)
docker-compose down -v
docker-compose up -d
```

**Container disk space:**

```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

### Performance Issues

**High CPU usage:**

```bash
# Check Docker stats
docker stats

# Check Node.js processes
pm2 monit
```

**High memory usage:**

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 node dist/index.js
```

**Slow database queries:**

```bash
# Enable MongoDB profiling
mongosh
db.setProfilingLevel(2)
db.system.profile.find().pretty()
```

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to MongoDB" | MongoDB not running or wrong URL | Check `DATABASE_URL`, start MongoDB |
| "Redis connection timeout" | Redis not running | Start Redis service |
| "Port 3000 already in use" | Another process using port | Kill process or change port |
| "Prisma Client not found" | Client not generated | Run `npm run prisma:generate` (from backend dir) |
| "Module not found" | Missing dependencies | Run `npm install --legacy-peer-deps` |
| "401 Unauthorized" | Invalid JWT or expired token | Check JWT_SECRET, clear cookies |
| "CORS error" | CORS not configured | Update CORS_ORIGIN in .env |

---

## Production Best Practices

### Performance Optimization

1. **Enable compression:**
   - Gzip/Brotli in Nginx
   - Express compression middleware

2. **Use CDN:**
   - CloudFlare, AWS CloudFront, or Vercel for static assets

3. **Database indexing:**
   - Add indexes to frequently queried fields
   - Monitor slow queries

4. **Caching:**
   - Redis for session storage
   - Cache frequently accessed data

5. **Load balancing:**
   - Use Nginx or cloud load balancers
   - Horizontal scaling for backend

### Backup Strategy

**Database backups:**

```bash
# MongoDB backup
mongodump --uri="mongodb://user:pass@localhost:27017/constructai" --out=/backup

# MongoDB restore
mongorestore --uri="mongodb://user:pass@localhost:27017/constructai" /backup

# Automated daily backups (cron)
0 2 * * * /usr/bin/mongodump --uri="..." --out=/backup/$(date +\%Y-\%m-\%d)
```

**File backups:**

```bash
# Backup uploads directory
tar -czf uploads-$(date +%Y-%m-%d).tar.gz uploads/

# Sync to cloud storage
aws s3 sync ./uploads s3://your-bucket/backups/uploads/
```

### Scaling Considerations

**Horizontal Scaling:**

- Deploy multiple backend instances behind load balancer
- Use Redis for shared session storage
- Use sticky sessions or JWT for authentication

**Vertical Scaling:**

- Increase server resources (CPU, RAM)
- Optimize database queries
- Use caching extensively

**Database Scaling:**

- MongoDB sharding for large datasets
- Read replicas for read-heavy workloads
- MongoDB Atlas auto-scaling

---

## Support & Resources

### Documentation

- [README.md](./README.md) - Project overview
- [API Documentation](http://localhost:3001/api/v1) - API reference
- [Prisma Docs](https://www.prisma.io/docs/) - Database ORM

### Community

- GitHub Issues: Report bugs and feature requests
- GitHub Discussions: Ask questions and share ideas

### Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                 # Start dev servers
npm run build               # Build for production
npm start                   # Start production servers
npm run test:unit           # Run tests
npm run lint                # Lint code
npm run type-check          # Type checking

# Docker
docker-compose up -d                      # Start all services
docker-compose down                       # Stop all services
docker-compose logs -f                    # View logs
docker-compose exec backend sh            # Backend shell
docker-compose restart backend            # Restart service

# Database
npm run prisma:generate                   # Generate Prisma client (from backend dir)
npm run prisma migrate dev                # Create migration (from backend dir)
npx prisma migrate deploy                 # Apply migrations (from backend dir)
npm run prisma:studio                     # Database GUI (from backend dir)

# Process Management (PM2)
pm2 start dist/index.js                   # Start app
pm2 list                                  # List processes
pm2 logs                                  # View logs
pm2 restart all                           # Restart all
pm2 stop all                              # Stop all
```

### Default Ports

- Frontend: 3000
- Backend: 3001
- MongoDB: 27017
- Redis: 6379
- Nginx: 80, 443

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Platform**: ConstructAI Construction Management Platform

For issues or questions, please open an issue on GitHub.
