# Docker Deployment Guide

Complete guide for building and deploying the Code Interpreter application with Live Project Map using Docker.

## Quick Start

The fastest way to get started with Docker:

```bash
# Make scripts executable
chmod +x docker-build-local.sh

# Build and start Docker containers
./docker-build-local.sh

# Or use docker-compose directly
docker-compose up -d
```

## Prerequisites

Before building and deploying, ensure you have:

- **Docker** installed (version 20.10+)
- **Docker Compose** installed (version 2.0+)
- **Docker Desktop** running (for macOS/Windows)

### Verify Installation

```bash
docker --version
docker-compose --version
docker info
```

## Docker Architecture

The application uses a multi-container Docker setup:

- **Backend Container**: Node.js backend service (port 3001)
- **Frontend Container**: Nginx serving React frontend (port 3000)
- **Network**: Docker bridge network for inter-container communication
- **Volumes**: Persistent storage for uploaded files and drawings

## Building Docker Images

### Option 1: Using the Build Script

```bash
./docker-build-local.sh
```

This script will:
1. Check prerequisites
2. Create storage directories
3. Build Docker images
4. Start Docker containers
5. Show service status

### Option 2: Using Docker Compose

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build with no cache (clean build)
docker-compose build --no-cache
```

## Starting Services

### Start Services in Background

```bash
docker-compose up -d
```

### Start Services in Foreground (with logs)

```bash
docker-compose up
```

### Start Specific Services

```bash
docker-compose up -d backend
docker-compose up -d frontend
```

## Managing Services

### View Service Status

```bash
docker-compose ps
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100
```

### Stop Services

```bash
# Stop services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers and volumes
docker-compose down -v
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## Access Points

Once the services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **WebSocket**: ws://localhost:3000/ws (proxied through nginx)

## Environment Variables

### Backend Environment Variables

Set in `docker-compose.yml`:

```yaml
environment:
  NODE_ENV: production
  PORT: 3001
  FILE_STORAGE_PATH: /app/packages/backend/storage
  MAX_FILE_SIZE: 10485760
```

### Frontend Environment Variables

Set as build arguments in `docker-compose.yml`:

```yaml
args:
  VITE_API_URL: ""  # Empty string = relative URLs (proxied through nginx)
  VITE_WS_URL: ""    # Empty string = relative URLs (proxied through nginx)
```

## Storage

### Storage Directories

The application uses the following storage directories:

- `packages/backend/storage/uploads` - Uploaded files
- `packages/backend/storage/drawings` - Construction drawings
- `packages/backend/storage/maps` - Generated maps

### Persistent Storage

Storage directories are mounted as volumes in `docker-compose.yml`:

```yaml
volumes:
  - ./packages/backend/storage:/app/packages/backend/storage
```

## Network Configuration

### Docker Network

Services communicate through a Docker bridge network:

```yaml
networks:
  app-network:
    driver: bridge
```

### Service Communication

- Frontend (nginx) proxies `/api` requests to `http://backend:3001`
- Frontend (nginx) proxies `/ws` WebSocket connections to `http://backend:3001`
- Services communicate using service names (e.g., `backend:3001`)

## Nginx Configuration

The frontend container uses Nginx to serve the React app and proxy API/WebSocket requests.

### API Proxy

```nginx
location /api {
    proxy_pass http://backend:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    ...
}
```

### WebSocket Proxy

```nginx
location /ws {
    proxy_pass http://backend:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ...
}
```

## Health Checks

Both services have health checks configured:

### Backend Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Frontend Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Troubleshooting

### Build Errors

**Docker build fails:**
```bash
# Clean build (no cache)
docker-compose build --no-cache

# Check Docker logs
docker-compose logs
```

**Missing dependencies:**
```bash
# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Runtime Errors

**Services not starting:**
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check health
curl http://localhost:3001/health
curl http://localhost:3000
```

**Port already in use:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Change ports in docker-compose.yml
ports:
  - "3002:3000"  # Frontend
  - "3003:3001"  # Backend
```

**Storage permission errors:**
```bash
# Fix storage permissions
chmod -R 755 packages/backend/storage

# Recreate storage directories
mkdir -p packages/backend/storage/{uploads,drawings,maps}
chmod -R 755 packages/backend/storage
```

### WebSocket Connection Issues

**WebSocket not connecting:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Check nginx logs
docker-compose logs frontend

# Test WebSocket connection
wscat -c ws://localhost:3000/ws
```

### Network Issues

**Services can't communicate:**
```bash
# Check network
docker network ls
docker network inspect <network-name>

# Restart services
docker-compose restart
```

## Production Deployment

For production deployment:

1. **Set environment variables** in `docker-compose.yml` or `.env` file
2. **Use HTTPS** - Configure SSL/TLS certificates
3. **Set up reverse proxy** - Use Nginx or Traefik
4. **Configure domain** - Set up DNS records
5. **Enable monitoring** - Set up logging and monitoring
6. **Backup storage** - Regular backups of storage volumes
7. **Security** - Update Docker images regularly
8. **Resource limits** - Set CPU and memory limits

## Dockerfile Structure

### Backend Dockerfile

```dockerfile
FROM node:18-alpine
# Install Python for code execution
# Install pnpm
# Copy workspace files
# Install dependencies
# Build packages
# Start server
```

### Frontend Dockerfile

```dockerfile
# Builder stage
FROM node:18-alpine as builder
# Install pnpm
# Copy workspace files
# Install dependencies
# Build packages

# Production stage
FROM nginx:alpine
# Copy built files
# Copy nginx configuration
# Start nginx
```

## Useful Commands

```bash
# View container logs
docker-compose logs -f

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# View container resource usage
docker stats

# Remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean Docker system
docker system prune -a
```

## Next Steps

- Set up CI/CD pipeline
- Configure production environment variables
- Set up SSL/TLS certificates
- Configure domain and DNS
- Set up monitoring and logging
- Configure backup strategies
- Set up load balancing
- Configure auto-scaling

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

