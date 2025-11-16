# Build and Setup Guide

This guide will help you build and run the complete ConstructAI platform with all parts, scripts, and functions.

## Prerequisites

- Node.js 18+ (preferably 20+)
- npm 8+
- MongoDB instance (local or cloud)
- Redis instance (local or cloud)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for the workspace (shared, backend, and frontend packages).

### 2. Generate Prisma Client

```bash
cd packages/backend
npx prisma generate
```

This generates the Prisma Client from your schema, which is required for the backend to work with MongoDB.

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
DATABASE_URL=mongodb://admin:password@localhost:27017/constructai?authSource=admin

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001

# OAuth2 Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 4. Build the Application

Build all packages (shared, backend, and frontend):

```bash
npm run build
```

This will:
- Build the shared package (type definitions and SDK)
- Build the backend (TypeScript → JavaScript in `dist/`)
- Build the frontend (React → optimized bundle in `dist/`)

### 5. Run the Application

#### Development Mode (with hot reload)

Run both frontend and backend in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

#### Production Mode

Start the built application:

```bash
npm run start
```

Or separately:

```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

## Complete Build Pipeline

### Step-by-Step Build Process

1. **Clean previous builds** (optional):
   ```bash
   npm run clean
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Generate Prisma Client**:
   ```bash
   cd packages/backend
   npx prisma generate
   cd ../..
   ```

4. **Type-check all packages**:
   ```bash
   npm run type-check
   ```

5. **Lint all packages**:
   ```bash
   npm run lint
   ```

6. **Build all packages**:
   ```bash
   npm run build
   ```

7. **Run tests** (optional):
   ```bash
   npm run test:unit
   ```

## Database Setup

### Initial Migration

If this is your first time setting up the database:

```bash
cd packages/backend
npx prisma migrate dev --name init
```

### Seed Database

Populate the database with initial data:

```bash
cd packages/backend
npm run prisma:seed
```

### Prisma Studio

View and edit your database with Prisma Studio:

```bash
cd packages/backend
npm run prisma:studio
```

This will open a web interface at `http://localhost:5555`.

## Available Scripts

### Root Level

- `npm run dev` - Run frontend and backend in development mode
- `npm run dev:frontend` - Run frontend only in development mode
- `npm run dev:backend` - Run backend only in development mode
- `npm run build` - Build all packages
- `npm run build:production` - Build for production with optimizations
- `npm run start` - Start all packages in production mode
- `npm run start:frontend` - Start frontend in production mode
- `npm run start:backend` - Start backend in production mode
- `npm run type-check` - Type-check all packages
- `npm run lint` - Lint all packages
- `npm run test:unit` - Run unit tests for all packages
- `npm run clean` - Clean build artifacts and node_modules

### Backend Package

- `npm run dev --workspace=backend` - Run backend with hot reload
- `npm run build --workspace=backend` - Build backend
- `npm run start --workspace=backend` - Start built backend
- `npm run prisma:generate --workspace=backend` - Generate Prisma Client
- `npm run prisma:migrate --workspace=backend` - Run database migrations
- `npm run prisma:studio --workspace=backend` - Open Prisma Studio
- `npm run prisma:seed --workspace=backend` - Seed database

### Frontend Package

- `npm run dev --workspace=frontend` - Run frontend with hot reload
- `npm run build --workspace=frontend` - Build frontend
- `npm run start --workspace=frontend` - Start built frontend

## Docker Deployment

### Using Docker Compose

Build and run the entire stack with Docker:

```bash
docker-compose up -d
```

This will start:
- MongoDB container
- Redis container
- Backend API container
- Frontend web container

### Production Docker Build

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Deployment Scripts

The repository includes several deployment scripts:

- `./build.sh` - Build all packages
- `./deploy.sh` - Deploy to production
- `./deploy-local.sh` - Deploy locally for testing
- `./deploy-full-stack.sh` - Full stack deployment
- `./health-check.sh` - Check application health
- `./validate-deployment.sh` - Validate deployment

## Authentication Flow

The platform supports multiple authentication methods:

### Email/Password Login

```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth

```typescript
GET /api/auth/google
// Redirects to Google OAuth consent screen
```

### Token Refresh

```typescript
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

## API Endpoints

All API endpoints are documented in `API_SUMMARY.md`.

### Main API Routes

- `/api/auth` - Authentication (login, register, OAuth)
- `/api/v1/auth` - Versioned authentication API
- `/api/projects` - Project management
- `/api/tasks` - Task management
- `/api/files` - File upload/download
- `/api/team` - Team management
- `/api/analytics` - Analytics and reports
- `/api/ai-tools` - AI agent execution

## AI Agents

The platform includes 9 specialized AI agents:

1. **Procurement Agent** - Vendor selection and bid analysis
2. **Compliance Agent** - Regulation monitoring
3. **Safety Agent** - Incident prediction and hazard analysis
4. **Resource Agent** - Workforce optimization
5. **Document Agent** - OCR processing and categorization
6. **Decision Agent** - Risk assessment
7. **Communication Agent** - NLP and sentiment analysis
8. **Due Diligence Agent** - Vendor verification
9. **Scheduling Agent** - Timeline optimization

Access AI agents via:

```typescript
POST /api/v1/ai-agents/execute
{
  "agentType": "SAFETY",
  "context": {},
  "input": {
    "action": "predict_risks"
  }
}
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing types:

```bash
npm install
cd packages/backend
npx prisma generate
cd ../..
npm run type-check
```

### Build Fails

1. Clean everything:
   ```bash
   npm run clean
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

3. Regenerate Prisma Client:
   ```bash
   cd packages/backend && npx prisma generate
   ```

4. Try building again:
   ```bash
   npm run build
   ```

### Database Connection Issues

1. Verify MongoDB is running:
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```

2. Check your `DATABASE_URL` in `.env`

3. Verify Redis is running:
   ```bash
   redis-cli ping
   ```

### Port Already in Use

If ports 3000 or 3001 are already in use:

1. Find the process using the port:
   ```bash
   lsof -i :3001  # or :3000 for frontend
   ```

2. Kill the process or change the port in `.env`:
   ```env
   PORT=3002  # Backend
   VITE_PORT=3001  # Frontend
   ```

## Production Deployment

### Vercel (Frontend)

```bash
vercel deploy --prod
```

### Railway (Backend)

```bash
railway up
```

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Testing

### Run All Tests

```bash
npm run test:unit
```

### Run Backend Tests Only

```bash
npm run test --workspace=backend
```

### Run Frontend Tests Only

```bash
npm run test --workspace=frontend
```

## Security Best Practices

1. **Never commit secrets** - Always use environment variables
2. **Change default secrets** - Update JWT_SECRET, etc. in production
3. **Use HTTPS** - Always use HTTPS in production
4. **Enable rate limiting** - Already configured in the backend
5. **Regular updates** - Keep dependencies up to date
6. **RBAC** - Use role-based access control (4 roles: Super Admin, Company Admin, Supervisor, Operative)

## Multi-Tenancy

All data is scoped by `organizationId` to ensure proper data isolation:

```typescript
// All queries automatically filter by organization
const projects = await prisma.project.findMany({
  where: {
    organizationId: user.organizationId
  }
})
```

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T16:00:00.000Z"
}
```

### Logs

Backend logs are managed by Winston:

- Development: Console output
- Production: File-based logging in `logs/` directory

## Support

For issues or questions:

1. Check the documentation files in the repository
2. Review the code comments and JSDoc
3. Open an issue on GitHub

## License

See LICENSE file for details.
