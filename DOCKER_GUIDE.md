# Docker Deployment Guide for ConstructAI

This guide provides detailed instructions for deploying ConstructAI using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose v2.0+
- At least 4GB RAM available for containers
- 10GB free disk space

## Quick Start

### 1. Development Environment (with hot reload)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- MongoDB: localhost:27017
- Redis: localhost:6379

### 2. Production Environment

```bash
# Set up environment
cp .env.example .env
# Edit .env with production values

# Build and start
docker compose -f docker-compose.prod.yml up -d

# Check health
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Node Environment
NODE_ENV=production

# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=<secure-password>
MONGO_DATABASE=constructai

# Redis
REDIS_PASSWORD=<secure-password>

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=<your-secure-jwt-secret>
JWT_REFRESH_SECRET=<your-secure-refresh-secret>
SESSION_SECRET=<your-secure-session-secret>

# URLs
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001

# Optional: OAuth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional: Email (SendGrid)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@constructai.com
```

## Docker Compose Files

### docker-compose.yml (Development)

Features:
- Hot reload for development
- Direct port exposure
- No authentication on databases
- Simple configuration

Services:
- MongoDB (port 27017)
- Redis (port 6379)
- Backend (port 3001)
- Frontend (port 3000)

### docker-compose.prod.yml (Production)

Features:
- Optimized builds
- Health checks
- Database authentication
- Nginx reverse proxy
- Security hardening

Services:
- MongoDB (authenticated, health checks)
- Redis (password protected, health checks)
- Backend (health checks, non-root user)
- Frontend (Nginx, health checks)
- Nginx (reverse proxy on port 80/443)

## Building Images

### Build All Services

```bash
# Development
docker compose build

# Production
docker compose -f docker-compose.prod.yml build

# Build specific service
docker compose build backend
docker compose build frontend
```

### Build with No Cache

```bash
docker compose build --no-cache
```

### Multi-platform Builds (for deployment)

```bash
# For ARM64 and AMD64
docker buildx build --platform linux/amd64,linux/arm64 -t constructai-backend ./packages/backend
```

## Service Management

### Start Services

```bash
# Start all
docker compose up -d

# Start specific service
docker compose up -d backend

# Start without detaching (see logs)
docker compose up
```

### Stop Services

```bash
# Stop all
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Stop specific service
docker compose stop backend
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

## Logs and Monitoring

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# Since timestamp
docker compose logs --since 2024-01-01T00:00:00
```

### Service Status

```bash
# Check running containers
docker compose ps

# Detailed stats
docker stats
```

### Health Checks

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000

# Use health check script
./health-check.sh
```

## Database Management

### MongoDB

#### Access MongoDB Shell

```bash
# Development (no auth)
docker compose exec mongodb mongosh constructai

# Production (with auth)
docker compose -f docker-compose.prod.yml exec mongodb mongosh \
  -u admin -p <password> --authenticationDatabase admin constructai
```

#### Backup Database

```bash
# Create backup
docker compose exec mongodb mongodump \
  --db constructai \
  --out /data/backup

# Copy backup to host
docker cp constructai-mongodb:/data/backup ./mongodb-backup
```

#### Restore Database

```bash
# Copy backup to container
docker cp ./mongodb-backup constructai-mongodb:/data/restore

# Restore
docker compose exec mongodb mongorestore \
  --db constructai \
  /data/restore/constructai
```

### Redis

#### Access Redis CLI

```bash
# Development
docker compose exec redis redis-cli

# Production (with password)
docker compose -f docker-compose.prod.yml exec redis redis-cli -a <password>
```

#### Monitor Redis

```bash
# Watch commands in real-time
docker compose exec redis redis-cli monitor

# Get info
docker compose exec redis redis-cli info
```

## Troubleshooting

### Container Won't Start

1. Check logs:
```bash
docker compose logs backend
```

2. Check if port is already in use:
```bash
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
```

3. Rebuild container:
```bash
docker compose build --no-cache backend
docker compose up -d backend
```

### Database Connection Issues

1. Check MongoDB is running:
```bash
docker compose ps mongodb
```

2. Test connection:
```bash
docker compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));
"
```

### Performance Issues

1. Check resource usage:
```bash
docker stats
```

2. Increase container resources in Docker Desktop settings

3. Prune unused resources:
```bash
docker system prune -a
```

### Frontend Can't Connect to Backend

1. Check backend is running:
```bash
curl http://localhost:3001/health
```

2. Check CORS configuration in backend

3. Verify VITE_API_URL environment variable

## Production Deployment Best Practices

### 1. Security

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Use Docker secrets for sensitive data
- [ ] Run containers as non-root users (already configured)

### 2. Performance

- [ ] Set appropriate resource limits
- [ ] Enable Redis persistence
- [ ] Configure MongoDB replica set (for HA)
- [ ] Use CDN for static assets
- [ ] Enable gzip compression (already configured in Nginx)

### 3. Monitoring

- [ ] Set up container monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Set up alerts for container failures
- [ ] Monitor disk usage
- [ ] Track API response times

### 4. Backup Strategy

- [ ] Automated MongoDB backups
- [ ] Backup Redis snapshots
- [ ] Backup uploaded files
- [ ] Test restore procedures
- [ ] Off-site backup storage

## Advanced Configuration

### Custom Nginx Configuration

Edit `packages/frontend/nginx.conf` or create `nginx/nginx.conf` for custom reverse proxy configuration.

### SSL/TLS Setup

1. Obtain SSL certificates (Let's Encrypt, etc.)

2. Mount certificates in nginx service:
```yaml
nginx:
  volumes:
    - ./nginx/ssl:/etc/nginx/ssl
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf
```

3. Update nginx.conf to use SSL

### Scaling Services

#### Scale Backend Instances

```bash
docker compose up -d --scale backend=3
```

Requirements:
- Use external load balancer
- Configure Redis for session sharing
- Update Socket.IO with Redis adapter

### External Databases

To use external MongoDB/Redis instead of containers:

1. Remove mongodb and redis services from docker-compose.yml

2. Update environment variables to point to external services

3. Update depends_on in backend service

## Updating Deployment

### Update Code

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose build
docker compose up -d

# Or for zero-downtime (if using multiple instances)
docker compose up -d --no-deps --build backend
```

### Database Migrations

```bash
# Run migrations
docker compose exec backend npm run prisma:migrate

# Or during deployment
docker compose exec backend npx prisma migrate deploy
```

## Cleanup

### Remove All Containers and Volumes

```bash
# WARNING: This deletes all data
docker compose down -v

# Remove images
docker compose down --rmi all
```

### Prune System

```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Support

For deployment issues:
1. Check container logs
2. Verify environment variables
3. Test health endpoints
4. Review this guide
5. Check GitHub issues

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)
