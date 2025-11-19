# 🚀 Quick Start Guide - ConstructAI Platform

Get the ConstructAI platform running in under 5 minutes!

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed ([Download here](https://nodejs.org/))
- **Docker & Docker Compose** installed ([Get Docker](https://docs.docker.com/get-docker/))

---

## Option 1: One-Command Deployment (Easiest) ⚡

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd project-perplexy

# Run one-command deployment
./deploy.sh
```

Follow the interactive prompts to:
1. Choose deployment type (Docker/Manual/Development)
2. Configure environment (auto-generated or custom)
3. Deploy all services

**That's it!** The script handles everything automatically.

---

## Option 2: Docker Compose (Recommended) 🐳

### Step 1: Clone and Configure

```bash
# Clone repository
git clone <repository-url>
cd project-perplexy

# The .env file is already configured with secure defaults
# Optionally, customize it for your needs:
nano .env  # or use your preferred editor
```

### Step 2: Deploy

```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
docker compose up -d
```

### Step 3: Verify

```bash
# Check services are running
docker compose ps

# Run health check
./health-check.sh
```

### Step 4: Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

**Done!** Your platform is now running.

---

## Option 3: Manual Setup (Advanced) 🛠️

### Step 1: Install Dependencies

```bash
# Install project dependencies
npm install --legacy-peer-deps
```

### Step 2: Setup Database

```bash
# Start MongoDB and Redis with Docker
docker compose up -d mongodb redis

# OR install them locally (see DEPLOYMENT_GUIDE.md)
```

### Step 3: Configure Environment

```bash
# .env file is already configured
# Verify it has the correct values:
cat .env
```

### Step 4: Generate Prisma Client

```bash
cd packages/backend
npm run prisma:generate
cd ../..
```

### Step 5: Build Application

```bash
npm run build
```

### Step 6: Run Database Migrations

```bash
cd packages/backend
npx prisma migrate deploy
cd ../..
```

### Step 7: Start Application

```bash
# Start both frontend and backend
npm start

# OR start separately:
# Terminal 1:
npm run start:backend

# Terminal 2:
npm run start:frontend
```

**Done!** Access the app at http://localhost:3000

---

## Option 4: Development Mode 👨‍💻

For development with hot-reloading:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start MongoDB and Redis
docker compose up -d mongodb redis

# Generate Prisma client
cd packages/backend && npm run prisma:generate && cd ../..

# Start development servers
npm run dev
```

This starts:
- Backend at http://localhost:3001 (with auto-reload)
- Frontend at http://localhost:3000 (with HMR)

---

## Verification Steps

After deployment, verify everything is working:

### 1. Check Services

```bash
# For Docker deployment
docker compose ps

# For manual deployment
ps aux | grep node
```

### 2. Test Endpoints

```bash
# Backend health
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000

# API endpoint
curl http://localhost:3001/api/v1
```

### 3. Run Automated Health Check

```bash
./health-check.sh
```

You should see:
- ✓ All services running
- ✓ Database connected
- ✓ Redis connected
- ✓ Backend healthy
- ✓ Frontend accessible

---

## First-Time Setup

### Create Your First User

1. Navigate to http://localhost:3000
2. Click "Sign Up" or "Register"
3. Choose a role:
   - **Super Admin**: Full platform access
   - **Company Admin**: Organization management
   - **Supervisor**: Project oversight
   - **Operative**: Field operations
4. Complete registration

### Explore the Platform

**Key Features to Try:**

1. **Dashboard** - Real-time metrics and KPIs
2. **Projects** - Create and manage construction projects
3. **Field Operations** - Mobile-friendly task management
4. **AI Agents** - 9 specialized AI assistants
5. **Documents** - Upload and manage project files
6. **Compliance** - Regulation monitoring
7. **Safety** - Incident reporting and tracking
8. **Procurement** - Vendor and bid management

---

## Common Commands

### Docker Deployment

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart specific service
docker compose restart backend

# Rebuild and restart
docker compose up -d --build
```

### Manual Deployment

```bash
# Start all
npm start

# Start individually
npm run start:backend
npm run start:frontend

# Build
npm run build

# Test
npm run test:unit

# Lint
npm run lint

# Type check
npm run type-check
```

### Development

```bash
# Start dev servers
npm run dev

# Individual dev servers
npm run dev:backend
npm run dev:frontend

# Database management
cd packages/backend
npm run prisma:studio        # GUI for database
npm run prisma:migrate       # Create migration
npm run prisma:seed          # Seed data
```

---

## Troubleshooting

### Services Won't Start

**Docker:**
```bash
# Check Docker is running
docker ps

# Check logs
docker compose logs

# Clean restart
docker compose down -v
docker compose up -d
```

**Manual:**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3001

# Kill processes if needed
kill -9 <PID>
```

### Database Connection Issues

```bash
# Verify MongoDB is running
docker compose ps mongodb

# Check connection string
cat .env | grep DATABASE_URL

# Test connection
mongosh "your-connection-string"
```

### Build Errors

```bash
# Clean and rebuild
npm run clean
rm -rf node_modules
rm -rf packages/*/node_modules
npm install --legacy-peer-deps
npm run build
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change ports in .env
PORT=3002
FRONTEND_PORT=3003
```

---

## Next Steps

### Production Deployment

Ready for production? See:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) - Cloud platform guides
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-deployment checklist

### Customization

- Configure OAuth: Update Google Client ID/Secret in `.env`
- Enable email: Add SendGrid API key
- Cloud storage: Configure Google Cloud Storage
- Payments: Add Stripe credentials

### Documentation

- [README.md](./README.md) - Main documentation
- [API_SUMMARY.md](./API_SUMMARY.md) - API documentation
- [RBAC_IMPLEMENTATION.md](./RBAC_IMPLEMENTATION.md) - Role-based access control

---

## Support

### Getting Help

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check the docs folder

### Useful Links

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health
- Prisma Studio: `cd packages/backend && npm run prisma studio`

---

## Summary of Commands

```bash
# Quick Start (Docker)
./deploy.sh                          # One-command deployment
docker compose up -d                 # Start all services
./health-check.sh                    # Verify deployment

# Development
npm install --legacy-peer-deps       # Install dependencies
npm run dev                          # Start dev servers
npm run build                        # Build for production
npm run test:unit                    # Run tests

# Database
cd packages/backend
npm run prisma:generate              # Generate client
npx prisma migrate deploy            # Run migrations
npm run prisma:studio                # Database GUI

# Production
npm run build                        # Build
npm start                            # Start production
pm2 start dist/index.js              # With PM2
```

---

**Need Help?** Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

**Ready for Production?** Review the [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).

**Want to Deploy to Cloud?** See [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) for platform-specific guides.

---

**Happy Building! 🏗️**

Built with ❤️ for the construction industry
