# Build and Deploy Locally - Complete Guide

This guide covers building and deploying the Code Interpreter application locally for production-like environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Build](#development-build)
3. [Production Build](#production-build)
4. [Local Production Deployment](#local-production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before building and deploying, ensure you have:

- **Node.js 18+** installed
- **pnpm 8+** installed
- **Python 3** installed (for code execution)
- **Docker** (optional, for containerized deployment)

### Verify Installation

```bash
node --version    # Should be v18.0.0 or higher
pnpm --version    # Should be 8.0.0 or higher
python3 --version # Should be 3.x.x
```

## Development Build

For development, the application runs in development mode with hot reloading.

### Start Development Servers

```bash
# Install dependencies (if not already done)
pnpm install

# Start both frontend and backend
pnpm dev

# Or start them separately
pnpm dev:frontend  # Frontend only (port 3000)
pnpm dev:backend   # Backend only (port 3001)
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Production Build

For production, you need to build all packages and run them in production mode.

### Step 1: Build All Packages

```bash
# Build all packages (shared, backend, frontend)
pnpm build

# Or build with production environment
pnpm build:production
```

This will:
1. Build the shared package
2. Build the backend (TypeScript → JavaScript)
3. Build the frontend (React → Static files)

### Step 2: Verify Build Output

```bash
# Check backend build
ls -la packages/backend/dist/

# Check frontend build
ls -la packages/frontend/dist/
```

### Step 3: Update Environment Variables

For production, update your `.env` file:

```bash
NODE_ENV=production
PORT=3001
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
FILE_STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=py,js,ts,jsx,tsx,json,csv,txt,md
```

## Local Production Deployment

### Option 1: Run Built Application Directly

#### Start Backend

```bash
cd packages/backend
pnpm start
# or
node dist/index.js
```

#### Start Frontend

```bash
cd packages/frontend
pnpm start
# or
pnpm preview
```

The frontend will serve the built files from `dist/` directory.

### Option 2: Use Production Scripts

```bash
# From root directory
pnpm start

# This will start both frontend and backend in production mode
```

### Option 3: Serve Frontend with Nginx (Recommended for Production)

#### Install Nginx

**macOS:**
```bash
brew install nginx
```

**Linux:**
```bash
sudo apt-get install nginx
```

#### Configure Nginx

Create nginx configuration file at `/etc/nginx/sites-available/code-interpreter` (Linux) or `/usr/local/etc/nginx/servers/code-interpreter` (macOS):

```nginx
server {
    listen 3000;
    server_name localhost;
    root /path/to/project/perplexy/packages/frontend/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

#### Enable and Start Nginx

**Linux:**
```bash
sudo ln -s /etc/nginx/sites-available/code-interpreter /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

**macOS:**
```bash
sudo nginx -t  # Test configuration
sudo nginx -s reload
```

#### Start Backend

```bash
cd packages/backend
NODE_ENV=production pnpm start
```

## Docker Deployment

Docker provides the easiest way to deploy the application locally in a production-like environment.

### Step 1: Build Docker Images

```bash
# Build all services
docker-compose build

# Or build specific service
docker-compose build backend
docker-compose build frontend
```

### Step 2: Start Services

```bash
# Start all services
docker-compose up -d

# Or start in foreground (to see logs)
docker-compose up
```

### Step 3: Check Status

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Step 5: Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Build Scripts

### Quick Build Script

Use the provided `build.sh` script:

```bash
chmod +x build.sh
./build.sh
```

### Manual Build Process

```bash
# 1. Install dependencies
pnpm install

# 2. Build shared package
pnpm --filter shared build

# 3. Build backend
pnpm --filter backend build

# 4. Build frontend
pnpm --filter frontend build

# 5. Start services
pnpm start
```

## Production Checklist

Before deploying to production, ensure:

- [ ] All environment variables are set correctly
- [ ] `NODE_ENV=production` is set
- [ ] Database connections are configured (if using database)
- [ ] File storage path exists and has write permissions
- [ ] Python 3 is installed and accessible
- [ ] All dependencies are installed
- [ ] Build process completes without errors
- [ ] Frontend static files are generated
- [ ] Backend TypeScript is compiled
- [ ] Security settings are configured (CORS, helmet, etc.)
- [ ] Logging is configured
- [ ] Error handling is in place

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/codeinterpreter
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
FILE_STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=py,js,ts,jsx,tsx,json,csv,txt,md
```

### Frontend (build-time)

Set in `.env` or build command:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Troubleshooting

### Build Errors

**TypeScript compilation errors:**
```bash
# Check TypeScript errors
pnpm type-check

# Fix linting issues
pnpm lint --fix
```

**Missing dependencies:**
```bash
# Reinstall dependencies
pnpm install --frozen-lockfile
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

**Python not found:**
```bash
# Check Python installation
python3 --version

# Install Python (macOS)
brew install python3

# Install Python (Linux)
sudo apt-get install python3
```

**File permission errors:**
```bash
# Fix storage directory permissions
chmod -R 755 storage
```

### Docker Issues

**Build fails:**
```bash
# Clean Docker cache
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

**Services not starting:**
```bash
# Check logs
docker-compose logs

# Check Docker status
docker-compose ps
```

## Performance Optimization

### Frontend

1. **Enable gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Enable caching** for static files
4. **Minify assets** (already done by Vite build)

### Backend

1. **Enable clustering** for Node.js
2. **Use Redis** for caching
3. **Optimize database queries**
4. **Enable compression** middleware
5. **Set up load balancing**

## Monitoring

### Logs

```bash
# Backend logs
tail -f packages/backend/logs/app.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000
```

## Next Steps

- Set up CI/CD pipeline
- Configure production database
- Set up SSL/TLS certificates
- Configure domain name
- Set up monitoring and logging
- Configure backup strategies
- Set up load balancing
- Configure auto-scaling

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

---

For more information, see:
- [README.md](./README.md) - Main documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview


