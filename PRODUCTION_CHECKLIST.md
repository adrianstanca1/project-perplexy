# Production Deployment Checklist - ConstructAI Platform

Use this checklist to ensure your deployment is production-ready, secure, and optimized.

## Pre-Deployment Checklist

### ✅ Environment Configuration

- [ ] **Environment file created**
  - Copy `.env.example` to `.env`
  - All required variables set
  
- [ ] **Security credentials configured**
  - [ ] `JWT_SECRET` - Secure random string (64+ characters)
  - [ ] `JWT_REFRESH_SECRET` - Different from JWT_SECRET
  - [ ] `SESSION_SECRET` - Unique secure random string
  - [ ] `MONGO_PASSWORD` - Strong database password (12+ characters)
  - [ ] `REDIS_PASSWORD` - Strong cache password
  
- [ ] **Database configuration**
  - [ ] `DATABASE_URL` - Valid MongoDB connection string
  - [ ] Database accessible from application server
  - [ ] Database has sufficient storage allocated
  
- [ ] **Cache configuration**
  - [ ] `REDIS_URL` - Valid Redis connection string
  - [ ] Redis accessible from application server
  
- [ ] **Application URLs**
  - [ ] `FRONTEND_URL` - Production frontend URL
  - [ ] `VITE_API_URL` - Production backend API URL
  - [ ] URLs use HTTPS in production
  
- [ ] **OAuth configuration** (if using)
  - [ ] `GOOGLE_CLIENT_ID` configured
  - [ ] `GOOGLE_CLIENT_SECRET` configured
  - [ ] Callback URLs registered in Google Console

### ✅ Security

- [ ] **Secrets Management**
  - [ ] No default passwords in use
  - [ ] Secrets not committed to version control
  - [ ] `.env` in `.gitignore`
  - [ ] Secrets rotated from development values
  
- [ ] **SSL/TLS**
  - [ ] SSL certificate obtained (Let's Encrypt or commercial)
  - [ ] HTTPS enabled for frontend
  - [ ] HTTPS enabled for backend API
  - [ ] HTTP to HTTPS redirect configured
  - [ ] Certificate auto-renewal configured
  
- [ ] **CORS Configuration**
  - [ ] `CORS_ORIGIN` set to production domains only
  - [ ] Wildcard origins disabled in production
  
- [ ] **Rate Limiting**
  - [ ] Rate limiting enabled
  - [ ] Appropriate limits configured
  - [ ] DDoS protection in place (CloudFlare, AWS Shield, etc.)
  
- [ ] **Security Headers**
  - [ ] Helmet.js configured
  - [ ] CSP (Content Security Policy) configured
  - [ ] XSS protection enabled
  
- [ ] **Authentication**
  - [ ] JWT expiration configured appropriately
  - [ ] Refresh token rotation enabled
  - [ ] Secure cookie settings (`httpOnly`, `secure`, `sameSite`)

### ✅ Build & Code Quality

- [ ] **Build Verification**
  ```bash
  pnpm install --frozen-lockfile
  pnpm type-check
  pnpm lint
  pnpm build
  ```
  
- [ ] **Tests**
  ```bash
  pnpm test:unit
  ```
  - [ ] All critical tests passing
  - [ ] Test coverage acceptable
  
- [ ] **Dependencies**
  - [ ] No critical security vulnerabilities (`pnpm audit`)
  - [ ] Dependencies up to date
  - [ ] Unused dependencies removed
  
- [ ] **Code Quality**
  - [ ] TypeScript strict mode enabled
  - [ ] No ESLint errors
  - [ ] Code reviewed and approved

### ✅ Database Setup

- [ ] **MongoDB**
  - [ ] MongoDB 7.0+ installed or cloud service configured
  - [ ] Database created
  - [ ] User with appropriate permissions created
  - [ ] Authentication enabled
  - [ ] Network access configured (IP whitelisting)
  - [ ] Connection string tested
  
- [ ] **Prisma**
  ```bash
  cd packages/backend
  pnpm prisma generate
  pnpm prisma migrate deploy
  ```
  - [ ] Prisma client generated
  - [ ] All migrations applied
  - [ ] Database schema validated
  
- [ ] **Seeding** (optional)
  ```bash
  pnpm prisma db seed
  ```
  - [ ] Initial data seeded if required
  
- [ ] **Redis**
  - [ ] Redis 7+ installed or cloud service configured
  - [ ] Password authentication enabled
  - [ ] Connection tested
  - [ ] Persistence configured (RDB/AOF)

### ✅ File Storage

- [ ] **Local Storage**
  - [ ] `FILE_STORAGE_PATH` directory created
  - [ ] Directory has write permissions
  - [ ] Sufficient disk space allocated
  
- [ ] **Cloud Storage** (Production Recommended)
  - [ ] Google Cloud Storage bucket created
  - [ ] Service account credentials configured
  - [ ] `GCS_BUCKET_NAME` set
  - [ ] `GCS_PROJECT_ID` set
  - [ ] `GCS_KEYFILE_PATH` set and accessible
  - [ ] Bucket permissions configured
  - [ ] CORS configured for bucket

### ✅ Infrastructure

- [ ] **Server Resources**
  - [ ] Minimum 2 CPU cores
  - [ ] Minimum 4GB RAM
  - [ ] Minimum 20GB disk space
  - [ ] Network bandwidth sufficient
  
- [ ] **Docker** (if using containers)
  - [ ] Docker 20.10+ installed
  - [ ] Docker Compose v2+ installed
  - [ ] Docker daemon running
  - [ ] Sufficient disk space for images
  
- [ ] **Reverse Proxy** (Recommended)
  - [ ] Nginx or similar installed and configured
  - [ ] SSL termination configured
  - [ ] Proxy pass to backend API
  - [ ] Static file serving for frontend
  - [ ] WebSocket support enabled
  - [ ] Compression enabled (gzip/brotli)
  
- [ ] **Load Balancer** (if scaling horizontally)
  - [ ] Load balancer configured
  - [ ] Health checks enabled
  - [ ] Session affinity configured (if needed)

### ✅ Monitoring & Logging

- [ ] **Application Logging**
  - [ ] Winston logger configured
  - [ ] Log level appropriate for production (`info` or `warn`)
  - [ ] Log rotation configured
  - [ ] Centralized logging setup (optional)
  
- [ ] **Error Tracking**
  - [ ] Sentry or similar service configured
  - [ ] Error notifications enabled
  
- [ ] **Performance Monitoring**
  - [ ] APM solution configured (New Relic, Datadog, etc.)
  - [ ] Database query monitoring enabled
  
- [ ] **Health Checks**
  - [ ] Backend health endpoint accessible
  - [ ] Monitoring service configured
  - [ ] Alerts configured for downtime
  
- [ ] **Uptime Monitoring**
  - [ ] External uptime monitor configured (Pingdom, UptimeRobot, etc.)
  - [ ] Alert contacts configured

### ✅ Backup & Disaster Recovery

- [ ] **Database Backups**
  - [ ] Automated daily backups configured
  - [ ] Backup retention policy defined
  - [ ] Backup restoration tested
  - [ ] Off-site backup storage configured
  
- [ ] **File Backups**
  - [ ] Uploaded files backed up regularly
  - [ ] Backup location defined
  - [ ] Restoration procedure documented
  
- [ ] **Configuration Backups**
  - [ ] Environment variables documented
  - [ ] Infrastructure as Code (if applicable)
  - [ ] Disaster recovery plan documented

### ✅ Performance Optimization

- [ ] **Frontend**
  - [ ] Production build optimized
  - [ ] Code splitting configured
  - [ ] Assets minified
  - [ ] Images optimized
  - [ ] CDN configured for static assets
  - [ ] Service worker registered (PWA)
  - [ ] Caching headers configured
  
- [ ] **Backend**
  - [ ] Node.js clustering enabled (or PM2)
  - [ ] Database indexes created
  - [ ] Query optimization performed
  - [ ] Response compression enabled
  - [ ] API caching configured
  
- [ ] **Database**
  - [ ] Indexes on frequently queried fields
  - [ ] Slow query log reviewed
  - [ ] Connection pooling configured
  
- [ ] **Redis**
  - [ ] Cache hit ratio monitored
  - [ ] Cache eviction policy configured
  - [ ] Memory limits set appropriately

## Deployment Checklist

### ✅ Pre-Deployment

- [ ] **Code**
  - [ ] Latest code pulled from version control
  - [ ] Code review completed
  - [ ] All tests passing
  - [ ] No merge conflicts
  
- [ ] **Version**
  - [ ] Version number updated
  - [ ] Changelog updated
  - [ ] Git tag created
  
- [ ] **Notifications**
  - [ ] Team notified of deployment
  - [ ] Users notified if downtime expected

### ✅ Deployment

- [ ] **Backup**
  - [ ] Database backup completed
  - [ ] File backup completed
  - [ ] Configuration backup completed
  
- [ ] **Deploy Application**
  
  **Docker Compose:**
  ```bash
  docker compose -f docker-compose.prod.yml build
  docker compose -f docker-compose.prod.yml up -d
  ```
  
  **Manual:**
  ```bash
  pnpm install --frozen-lockfile
  pnpm build
  pm2 restart all
  ```
  
- [ ] **Database Migrations**
  ```bash
  cd packages/backend
  pnpm prisma migrate deploy
  ```
  
- [ ] **Health Checks**
  ```bash
  ./health-check.sh
  ```

### ✅ Post-Deployment

- [ ] **Verification**
  - [ ] Frontend loads correctly
  - [ ] Backend API responding
  - [ ] Database connectivity confirmed
  - [ ] Redis connectivity confirmed
  - [ ] Authentication working
  - [ ] File uploads working
  - [ ] WebSocket connections working
  - [ ] PWA features working offline
  
- [ ] **Testing**
  - [ ] Smoke tests passed
  - [ ] Critical user flows tested
  - [ ] Performance benchmarks met
  
- [ ] **Monitoring**
  - [ ] Error rates normal
  - [ ] Response times acceptable
  - [ ] Resource usage within limits
  - [ ] No new errors in logs
  
- [ ] **Rollback Plan**
  - [ ] Rollback procedure documented
  - [ ] Database rollback plan defined
  - [ ] Previous version accessible

## Production Maintenance Checklist

### Daily

- [ ] Check error logs
- [ ] Review monitoring dashboards
- [ ] Verify backups completed
- [ ] Check disk space usage

### Weekly

- [ ] Review performance metrics
- [ ] Check security alerts
- [ ] Review error trends
- [ ] Update dependencies (if needed)

### Monthly

- [ ] Security audit
- [ ] Dependency updates
- [ ] Database optimization
- [ ] Backup restoration test
- [ ] SSL certificate renewal check
- [ ] Log rotation verification
- [ ] Cost optimization review

### Quarterly

- [ ] Disaster recovery test
- [ ] Security penetration testing
- [ ] Performance load testing
- [ ] Infrastructure review
- [ ] Documentation updates

## Quick Reference Commands

### Health Checks

```bash
# Run comprehensive health check
./health-check.sh

# Check backend
curl https://api.your-domain.com/health

# Check frontend
curl https://your-domain.com
```

### Logs

```bash
# Docker logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# PM2 logs
pm2 logs
pm2 logs backend
pm2 logs frontend

# System logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database

```bash
# MongoDB backup
mongodump --uri="mongodb://user:pass@localhost:27017/constructai" --out=/backup

# MongoDB restore
mongorestore --uri="mongodb://user:pass@localhost:27017/constructai" /backup

# Prisma migrations
cd packages/backend
pnpm prisma migrate deploy
pnpm prisma migrate status
```

### Service Management

```bash
# Docker
docker compose ps
docker compose restart backend
docker compose down
docker compose up -d

# PM2
pm2 list
pm2 restart all
pm2 stop all
pm2 start all
pm2 save

# Systemd
sudo systemctl status constructai
sudo systemctl restart constructai
```

## Troubleshooting

Common issues and solutions:

### Application won't start

1. Check logs: `docker compose logs` or `pm2 logs`
2. Verify environment variables: `cat .env`
3. Check port availability: `lsof -i :3000` and `lsof -i :3001`
4. Verify build artifacts: `ls -la packages/*/dist`

### Database connection issues

1. Verify MongoDB is running
2. Check DATABASE_URL in .env
3. Test connection: `mongosh "mongodb://..."`
4. Check network connectivity
5. Verify authentication credentials

### High resource usage

1. Check Docker stats: `docker stats`
2. Review application logs for errors
3. Analyze slow database queries
4. Check for memory leaks
5. Review cache configuration

### Performance issues

1. Check response times: `curl -w "@curl-format.txt" -o /dev/null -s https://api.your-domain.com/health`
2. Review database query performance
3. Check cache hit rates
4. Analyze network latency
5. Review CDN configuration

## Support Resources

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) - Cloud platform guides
- [README.md](./README.md) - Main documentation
- [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md) - Build instructions

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Platform**: ConstructAI Construction Management Platform
