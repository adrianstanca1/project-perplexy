# Build and Deploy Locally for Testing

Complete guide for building and deploying the Code Interpreter application with Live Project Map locally for testing.

## Quick Start

The fastest way to get started:

```bash
# Make scripts executable
chmod +x build.sh deploy-local.sh

# Build and start development servers
pnpm dev

# Or build for production and deploy
./deploy-local.sh
```

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
docker --version  # Optional, for Docker deployment
```

## Development Build

For development, the application runs in development mode with hot reloading.

### Step 1: Install Dependencies

```bash
# From project root
pnpm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root (optional for development):

```bash
# Backend .env (packages/backend/.env)
NODE_ENV=development
PORT=3001
FILE_STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760

# Frontend .env (packages/frontend/.env)
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
```

### Step 3: Start Development Servers

```bash
# Start both frontend and backend
pnpm dev

# Or start them separately
pnpm dev:frontend  # Frontend only (port 3000)
pnpm dev:backend   # Backend only (port 3001)
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001/ws
- **Health Check**: http://localhost:3001/health

### Features Available in Development

- **Code Interpreter**: http://localhost:3000/
- **File Manager**: http://localhost:3000/files
- **Live Project Map**: http://localhost:3000/map
- **Hot Module Replacement (HMR)** - Instant updates without losing state
- **React Fast Refresh** - Component updates preserve React state
- **TypeScript Compiler** - Real-time error checking
- **Source Maps** - Debug original TypeScript code

## Production Build

For production, build all packages and run them in production mode.

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

### Step 3: Start Production Servers

```bash
# Start both frontend and backend in production mode
pnpm start

# Or start them separately
pnpm start:backend   # Backend on port 3001
pnpm start:frontend  # Frontend on port 3000
```

## Local Production Deployment

### Option 1: Automated Deployment Script

```bash
# Run the deployment script
./deploy-local.sh
```

This script will:
1. Check prerequisites
2. Install dependencies
3. Build the application
4. Create storage directories
5. Start production servers

### Option 2: Manual Deployment

#### Start Backend

```bash
cd packages/backend
NODE_ENV=production pnpm start
# or
node dist/index.js
```

#### Start Frontend

```bash
cd packages/frontend
pnpm start
# or
pnpm preview --port 3000 --host
```

### Option 3: Docker Deployment (Recommended)

Docker provides the easiest way to deploy the application locally in a production-like environment.

#### Step 1: Build Docker Images

```bash
# Build all services
docker-compose build

# Or build specific service
docker-compose build backend
docker-compose build frontend
```

#### Step 2: Start Services

```bash
# Start all services
docker-compose up -d

# Or start in foreground (to see logs)
docker-compose up
```

#### Step 3: Check Status

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

#### Step 5: Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Environment Variables

### Backend Environment Variables

Create `packages/backend/.env`:

```env
NODE_ENV=production
PORT=3001
FILE_STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=py,js,ts,jsx,tsx,json,csv,txt,md,pdf
```

### Frontend Environment Variables

Create `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
```

### Docker Environment Variables

Environment variables are set in `docker-compose.yml`:

```yaml
environment:
  NODE_ENV: production
  PORT: 3001
  VITE_API_URL: http://localhost:3001
  VITE_WS_URL: ws://localhost:3001/ws
```

## Testing the Application

Once running, verify these **core features**:

### Code Interpreter
- Navigate to http://localhost:3000/
- Write and execute Python/JavaScript code
- View output in real-time
- Save and load files

### File Manager
- Navigate to http://localhost:3000/files
- Create, edit, and delete files
- Organize files in folders
- Save changes

### Live Project Map
- Navigate to http://localhost:3000/map
- Upload construction drawing PDFs
- View virtual map (from drawings)
- View real map (from GPS)
- Toggle between map views
- See active users with role-based colors
- Track user locations in real-time
- Select UK regions
- View weather conditions
- Create and select projects

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
mkdir -p packages/backend/storage/uploads
mkdir -p packages/backend/storage/drawings
mkdir -p packages/backend/storage/maps
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

### WebSocket Connection Issues

**WebSocket not connecting:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Check WebSocket endpoint
wscat -c ws://localhost:3001/ws
```

### Geolocation Issues

**Location not updating:**
- Ensure browser has location permissions
- Check HTTPS is enabled (required for geolocation in production)
- Test in development mode (http://localhost)

## Performance Optimization

### Frontend
1. Enable gzip compression
2. Use CDN for static assets
3. Enable caching for static files
4. Minify assets (already done by Vite build)

### Backend
1. Enable compression middleware
2. Optimize database queries (when using database)
3. Enable request caching
4. Set up load balancing (for production)

## Monitoring

### Logs

```bash
# Backend logs (development)
# Logs are displayed in the terminal

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

## Available Scripts

### Root Level Scripts

```bash
pnpm dev              # Start development servers
pnpm build            # Build all packages
pnpm build:production # Build for production
pnpm start            # Start production servers
pnpm type-check       # Type check all packages
pnpm lint             # Lint all packages
pnpm test:unit        # Run unit tests
pnpm clean            # Clean all packages
```

### Frontend Scripts

```bash
cd packages/frontend
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm start            # Start production server
pnpm type-check       # Type check
pnpm lint             # Lint code
```

### Backend Scripts

```bash
cd packages/backend
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm type-check       # Type check
pnpm lint             # Lint code
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

- [README.md](./README.md) - Main documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview
- [BUILD_AND_DEPLOY.md](./BUILD_AND_DEPLOY.md) - Detailed build guide
- [COMPLETE_IMPLEMENTATION.md](./COMPLETE_IMPLEMENTATION.md) - Implementation details

---

## Quick Reference

### Development
```bash
pnpm install
pnpm dev
# Access at http://localhost:3000
```

### Production
```bash
pnpm build
pnpm start
# Access at http://localhost:3000
```

### Docker
```bash
docker-compose up -d
# Access at http://localhost:3000
```

### Stop Services
```bash
# Development: Ctrl+C
# Production: pkill -f "node dist/index.js" && pkill -f "vite preview"
# Docker: docker-compose down
```

