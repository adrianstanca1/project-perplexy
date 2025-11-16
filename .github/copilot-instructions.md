# GitHub Copilot Instructions - ConstructAI Platform

## 🎯 Quick Reference

**Project Type**: Production-grade, multi-tenant construction management platform  
**Architecture**: Monorepo with 3 npm workspaces (backend, frontend, shared)  
**Primary Languages**: TypeScript, React 19  
**Key Technologies**: Node.js, Express, MongoDB (Prisma), Redis, Socket.IO  

## Project Overview

ConstructAI is a production-grade, multi-tenant construction management platform with AI-driven automation, real-time synchronization, and offline-capable field operations. The platform features 9 specialized AI agents for construction automation and management.

### Key Characteristics
- **Multi-tenant**: All data must be scoped by `organizationId`
- **Real-time**: Socket.IO for live updates
- **Offline-first**: PWA with service worker for field operations
- **AI-powered**: 9 specialized agents for automation
- **Type-safe**: Strict TypeScript throughout
- **Production-ready**: Security, RBAC, rate limiting, monitoring

## Project Structure
This is an npm workspace monorepo with three main packages:
- `packages/backend` - Node.js/Express REST API with TypeScript
- `packages/frontend` - React 19 + TypeScript PWA application
- `packages/shared` - Shared types and SDK

## Environment Setup
When working on this project, follow these setup steps:

1. **Install dependencies**: This project uses npm for package management
   ```bash
   npm install
   ```

2. **Generate Prisma Client**: After installing dependencies, generate the Prisma client
   ```bash
   cd packages/backend
   npx prisma generate
   ```

3. **Setup environment variables**: Copy `.env.example` files and configure them
   - Backend: `packages/backend/.env`
   - Frontend: `packages/frontend/.env`

4. **Verify setup**: Run lint and type-check to ensure everything is configured correctly
   ```bash
   npm run lint
   npm run type-check
   ```

**Note**: This project uses `npm` with workspace support. All commands should use `npm` or `npm run`.

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
- Always run `npm run prisma:generate` (from backend directory) after schema changes
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
- Use npm for package management
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
npm install

# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Build
npm run build            # Build all packages
npm run build:production # Production build

# Testing
npm run test:unit        # Run all unit tests

# Linting & Type Checking
npm run lint             # Lint all packages
npm run type-check       # TypeScript type checking

# Prisma
cd packages/backend
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed       # Seed database
```

## 🔍 Testing Guidelines (Detailed)

### Test Structure
- **Backend unit tests**: `packages/backend/tests/unit/*.test.ts`
- **Backend integration tests**: `packages/backend/tests/integration/*.test.ts`
- **Frontend tests**: Colocate with components (e.g., `Button.test.tsx` next to `Button.tsx`)

### Writing Tests
```typescript
// Example backend service test
import { describe, it, expect, beforeEach } from 'vitest'
import { MyService } from '../services/MyService'

describe('MyService', () => {
  let service: MyService
  
  beforeEach(() => {
    service = new MyService()
  })
  
  it('should perform expected behavior', () => {
    const result = service.doSomething()
    expect(result).toBe(expectedValue)
  })
})

// Example React component test
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Test Coverage Goals
- Aim for 70%+ coverage on service/business logic
- 100% coverage on security-critical code (auth, RBAC, data isolation)
- Test edge cases and error conditions
- Mock external dependencies (database, APIs, Redis)

### Running Tests
```bash
# Run all tests
npm run test:unit

# Run tests for specific package
npm run test --workspace=backend
npm run test --workspace=frontend

# Run with coverage
npm run test:coverage --workspace=backend

# Run in watch mode during development
npm run test:watch --workspace=backend
```

## 🔒 Security Guidelines (Detailed)

### Critical Security Rules
1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Input validation**: Validate ALL user inputs with Zod schemas before processing
3. **Multi-tenant isolation**: ALWAYS scope queries by `organizationId`
4. **Authentication**: Use JWT tokens with proper expiration
5. **Authorization**: Apply RBAC middleware to all protected routes

### Security Checklist for New Features
- [ ] User input validated with Zod
- [ ] Authentication required (JWT middleware)
- [ ] Authorization checked (RBAC middleware)
- [ ] Data scoped by organizationId (multi-tenant)
- [ ] Sensitive data not logged
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS prevented (sanitized inputs)
- [ ] Rate limiting applied to endpoints
- [ ] CORS configured correctly

### Example Security Patterns
```typescript
// Example: Protected route with RBAC
router.post('/api/v1/projects', 
  authenticate,  // Verify JWT
  authorize(['Company Admin', 'Supervisor']),  // Check role
  validateRequest(createProjectSchema),  // Validate input
  async (req, res) => {
    // Ensure multi-tenant isolation
    const { organizationId } = req.user
    const project = await prisma.project.create({
      data: {
        ...req.body,
        organizationId  // Always scope by org
      }
    })
    res.json(project)
  }
)

// Example: Zod validation schema
const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  budget: z.number().positive()
})
```

## 🐛 Troubleshooting Common Issues

### Build Issues
**Problem**: TypeScript errors in Prisma client  
**Solution**: Run `cd packages/backend && npm run prisma:generate`

**Problem**: Module not found errors  
**Solution**: Run `npm install` from root directory

**Problem**: Port already in use  
**Solution**: Kill process on port 3001 (backend) or 3000 (frontend)
```bash
# Kill backend port
lsof -ti:3001 | xargs kill -9
# Kill frontend port  
lsof -ti:3000 | xargs kill -9
```

### Database Issues
**Problem**: Prisma connection error  
**Solution**: Ensure MongoDB is running and DATABASE_URL is set in .env

**Problem**: Schema out of sync  
**Solution**: Run migrations
```bash
cd packages/backend
npm run prisma:migrate
npm run prisma:generate
```

### Development Issues
**Problem**: Changes not reflected in browser  
**Solution**: Hard refresh (Ctrl+Shift+R) or clear service worker cache

**Problem**: Socket.IO not connecting  
**Solution**: Check CORS settings and ensure backend URL is correct in frontend .env

## 📝 Common Task Patterns

### Adding a New API Endpoint
1. Define Zod validation schema in `backend/src/types/schemas.ts`
2. Create controller in `backend/src/controllers/`
3. Add route in `backend/src/routes/v1/`
4. Apply authentication and RBAC middleware
5. Write integration tests in `backend/tests/integration/`
6. Update API documentation

### Adding a New Page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Create any needed API client methods in `frontend/src/services/`
4. Add to navigation if needed
5. Implement responsive design with Tailwind
6. Test offline behavior if field operations page

### Adding a New Database Model
1. Update `backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Run `npm run prisma:generate`
4. Create service in `backend/src/services/`
5. Add CRUD operations with proper multi-tenant scoping
6. Write unit tests for the service

### Working with AI Agents
1. Review existing agents in `backend/src/services/aiAgents/`
2. Follow the orchestrator pattern
3. Maintain consistent interface: input validation, processing, output format
4. Log all agent executions for audit trail
5. Handle errors gracefully with fallbacks

## 🚀 Performance Best Practices

### Backend
- Use Redis for caching frequently accessed data
- Implement pagination for list endpoints (max 100 items)
- Use database indexes on frequently queried fields
- Batch database operations when possible
- Use connection pooling for database and Redis

### Frontend
- Lazy load pages with React.lazy()
- Use React.memo() for expensive components
- Implement virtual scrolling for large lists
- Cache API responses in Zustand store
- Optimize images (use Sharp for processing)

### Real-Time
- Use Socket.IO rooms for multi-tenant isolation
- Throttle high-frequency events
- Implement exponential backoff for reconnection
- Clean up listeners on component unmount

## 📦 Dependency Management

### Adding Dependencies
```bash
# Add to specific package
npm install package-name --workspace=backend
npm install package-name --workspace=frontend
npm install package-name --workspace=shared

# Add dev dependency
npm install -D package-name --workspace=backend
```

### Before Adding a Dependency
- Check if functionality exists in current dependencies
- Verify package is actively maintained (recent commits)
- Check for security vulnerabilities
- Consider bundle size impact (especially frontend)
- Ensure license compatibility

### Common Dependencies Used
- **Validation**: Zod (not Joi, Yup)
- **Dates**: Native Date or date-fns (not moment)
- **HTTP client**: axios (frontend), native fetch (backend)
- **State management**: Zustand (not Redux)
- **Forms**: Native React state (not Formik, React Hook Form)

## 🎨 Code Quality Standards

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] No `any` types (use proper types or `unknown`)
- [ ] ESLint passes with no warnings
- [ ] Meaningful variable and function names
- [ ] Functions are focused and single-purpose
- [ ] Complex logic is commented
- [ ] No console.log in production code
- [ ] No hardcoded values (use constants or env vars)
- [ ] Proper error handling with try-catch
- [ ] Tests written and passing

### Naming Conventions
```typescript
// Variables and functions: camelCase
const userName = 'John'
function getUserById(id: string) {}

// Classes, Types, Interfaces: PascalCase
class UserService {}
type User = {}
interface IProject {}

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5_000_000
const API_BASE_URL = process.env.API_URL

// React Components: PascalCase
function ProjectCard() {}
export const UserProfile = () => {}

// Files: Match export name
// UserService.ts exports class UserService
// useAuth.ts exports function useAuth
```

## Additional Notes
- This is a production-grade platform - prioritize code quality and security
- Follow existing patterns and conventions in the codebase
- When in doubt, refer to similar existing implementations
- Consider offline scenarios for field operations features
- Maintain backward compatibility for API changes
- Always test multi-tenant scenarios to prevent data leakage
- Document breaking changes in commit messages
