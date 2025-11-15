# Deployment Guide

This document provides step-by-step instructions for deploying the ConstructAI platform.

## Quick Start with Docker Compose

The easiest way to deploy the application is using Docker Compose:

### 1. Prerequisites

- Docker 20.10 or higher
- Docker Compose v2.0 or higher
- At least 4GB of RAM
- 10GB of free disk space

### 2. Setup Environment

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

**Important:** Update the following in `.env`:
- `JWT_SECRET` - Use a strong random string
- `JWT_REFRESH_SECRET` - Use a strong random string  
- `SESSION_SECRET` - Use a strong random string
- `MONGO_PASSWORD` - Set a strong database password

### 3. Deploy with Docker Compose

```bash
# Build and start all services
docker compose up -d
```

This will start:
- MongoDB (port 27017)
- Redis (port 6379)
- Backend API (port 3001)
- Frontend (port 3000)

### 4. Verify Deployment

Check that all services are running:

```bash
docker compose ps
```

Test the health endpoints:

```bash
# Backend health check
curl http://localhost:3001/health

# Frontend should be accessible at
curl http://localhost:3000
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api/v1

## Manual Deployment (Without Docker)

### Prerequisites

- Node.js 20+
- pnpm 8+
- MongoDB 7.0+
- Redis 7+

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Generate Prisma Client

```bash
cd packages/backend
pnpm prisma:generate
```

### 3. Build the Project

```bash
# From root directory
pnpm build
```

### 4. Start the Application

```bash
# Start both frontend and backend
pnpm start
```

## Troubleshooting

### Build Failures

If build fails with Prisma errors:

```bash
cd packages/backend
pnpm prisma:generate
```

### Container Issues

Clean rebuild:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## Support

For more documentation, see [README.md](./README.md)
