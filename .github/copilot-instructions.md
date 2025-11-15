# GitHub Copilot Instructions - ConstructAI Platform

## Project Overview
ConstructAI is a production-grade, multi-tenant construction management platform with AI-driven automation, real-time synchronization, and offline-capable field operations. The platform features 9 specialized AI agents for construction automation and management.

## Project Structure
This is a pnpm workspace monorepo with three main packages:
- `packages/backend` - Node.js/Express REST API with TypeScript
- `packages/frontend` - React 19 + TypeScript PWA application
- `packages/shared` - Shared types and SDK

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Prisma ORM
- **Cache**: Redis, ioredis client
- **Real-Time**: Socket.IO
- **Authentication**: JWT + Passport.js (OAuth2)
- **Validation**: Zod schemas
- **Testing**: Vitest
- **Logging**: Winston

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand for state management
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Maps**: Leaflet/React-Leaflet
- **PWA**: Service Worker + Manifest (offline-first)
- **Testing**: Vitest

## Coding Standards

### TypeScript
- Always use TypeScript for all new files (.ts for backend, .tsx for React components)
- Enable strict mode - no implicit any
- Define proper types and interfaces
- Use type imports: `import type { Type } from 'module'`
- Follow the patterns in existing code

### Code Style
- Use ES modules (`type: "module"` in package.json)
- Use 2 spaces for indentation
- Follow ESLint configuration in `eslint.config.js`
- No semicolons required (configured in ESLint)
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for classes, types, and React components
- Use UPPER_SNAKE_CASE for constants

### React Best Practices
- Functional components with hooks only (no class components)
- Import React not required (React 19)
- Use proper hook dependencies
- Follow React Hooks rules
- Use Zustand for global state management
- Prefer composition over inheritance
- Use TypeScript for prop types (no PropTypes)

## File Organization

### Backend Structure
```
packages/backend/src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, RBAC
├── routes/          # API route definitions (versioned under v1/)
├── services/        # Business logic
│   └── aiAgents/    # 9 AI agents (procurement, safety, compliance, etc.)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Frontend Structure
```
packages/frontend/src/
├── components/      # Reusable React components
├── pages/           # Page components (34+ pages)
├── services/        # API clients and external services
├── hooks/           # Custom React hooks
├── contexts/        # React context providers
└── utils/           # Utility functions
```

## API Conventions
- All production APIs under `/api/v1/` prefix (versioned)
- Use RESTful conventions (GET, POST, PUT, DELETE, PATCH)
- Return consistent JSON response format
- Use proper HTTP status codes
- Implement proper error handling
- Use Zod for request validation
- Apply RBAC middleware for protected routes

## Database & ORM
- Use Prisma as the ORM for MongoDB
- Schema defined in `packages/backend/prisma/schema.prisma`
- Always run `npm run prisma:generate` after schema changes
- Use transactions for multi-step operations
- Implement proper data isolation for multi-tenancy (organizationId scoping)
- Never expose sensitive data in API responses

## Testing Guidelines
- Use Vitest for all tests
- Test files: `*.test.ts` or `*.spec.ts`
- Place backend tests in `packages/backend/tests/` (unit/ and integration/ subdirs)
- Place frontend tests alongside components
- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Mock external dependencies
- Aim for meaningful test coverage
- Use `describe`, `it`, `expect`, `beforeEach`, `beforeAll` from Vitest
- Tests may be conditionally run using environment variables (see existing tests)

## Security Best Practices
- Never commit secrets, API keys, or passwords
- Use environment variables for configuration
- Validate all user inputs with Zod
- Implement proper authentication and authorization (JWT)
- Use RBAC (4 roles: Super Admin, Company Admin, Supervisor, Operative)
- Enforce multi-tenant data isolation (organizationId)
- Use helmet.js for security headers
- Implement rate limiting
- Set secure cookie options: `httpOnly`, `secure`, `sameSite: 'strict'`
- Sanitize user inputs to prevent XSS
- Use Prisma to prevent SQL injection
- Log security events with Winston

## Error Handling
- Use try-catch blocks in async functions
- Create custom error classes when appropriate
- Return appropriate HTTP status codes
- Log errors with Winston (backend)
- Display user-friendly error messages (frontend)
- Never expose internal errors to clients
- Use proper error boundaries in React

## Logging
- **Backend**: Use Winston logger, never `console.log`
- **Frontend**: Use `console.log` for development, remove before production
- Log levels: error, warn, info, debug
- Include context in log messages (userId, organizationId, etc.)

## Dependencies
- Use pnpm for package management
- Add dependencies at the appropriate package level
- Check for security vulnerabilities before adding packages
- Keep dependencies up to date
- Prefer well-maintained packages with active communities

## Real-Time Features
- Use Socket.IO for real-time communication
- Implement proper connection/disconnection handling
- Use rooms for multi-tenant isolation
- Handle offline scenarios gracefully

## PWA & Offline Support
- Service worker located at `packages/frontend/public/sw.js`
- Manifest at `packages/frontend/public/manifest.json`
- Implement offline queue for field operations
- Sync when connection restored
- Handle conflict resolution

## Multi-Tenancy
- All data must be scoped by `organizationId`
- Enforce data isolation at database query level
- Validate organization access in middleware
- Never mix data between organizations

## AI Agents
The platform includes 9 specialized AI agents in `packages/backend/src/services/aiAgents/`:
1. Procurement Agent - Vendor selection, bid analysis
2. Compliance Agent - Regulation monitoring
3. Safety Agent - Incident prediction, hazard analysis
4. Resource Agent - Workforce optimization
5. Document Agent - OCR processing, categorization
6. Decision Agent - Risk assessment
7. Communication Agent - NLP, sentiment analysis
8. Due Diligence Agent - Vendor verification
9. Scheduling Agent - Timeline optimization

When working with AI agents, follow the orchestrator pattern and maintain consistent interfaces.

## Documentation
- Update README.md for major changes
- Use JSDoc comments for public functions and classes
- Document API endpoints
- Keep inline comments minimal and meaningful
- Update relevant .md files in project root

## Git & Version Control
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issue numbers in commits
- Don't commit build artifacts or node_modules
- Follow .gitignore patterns

## Build & Deployment
- Backend builds to `dist/` directory
- Frontend builds with Vite to `dist/` directory
- Docker support with docker-compose.yml
- Production deployment scripts in project root
- Environment variables managed via .env files (never commit .env)
- Vercel configuration in vercel.json and packages/frontend/vercel.json

## Commands Reference
```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start both frontend and backend
pnpm dev:frontend     # Frontend only
pnpm dev:backend      # Backend only

# Build
pnpm build            # Build all packages
pnpm build:production # Production build

# Testing
pnpm test:unit        # Run all unit tests

# Linting & Type Checking
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking

# Prisma
cd packages/backend
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed       # Seed database
```

## Additional Notes
- This is a production-grade platform - prioritize code quality and security
- Follow existing patterns and conventions in the codebase
- When in doubt, refer to similar existing implementations
- Consider offline scenarios for field operations features
- Maintain backward compatibility for API changes
