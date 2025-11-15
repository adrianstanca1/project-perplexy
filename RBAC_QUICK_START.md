# RBAC Quick Start Guide

## 🚀 Getting Started

### 1. Database Setup

```bash
cd packages/backend
pnpm prisma generate
pnpm prisma migrate dev --name add_rbac_and_tasks
```

### 2. Environment Variables

Ensure your `.env` file includes:
```env
DATABASE_URL=mongodb://localhost:27017/constructai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Start Services

```bash
# Terminal 1: Backend
cd packages/backend
pnpm dev

# Terminal 2: Frontend
cd packages/frontend
pnpm dev

# Terminal 3: Redis (if not running)
redis-server
```

### 4. Create Test Users

You can create users via the registration endpoint or directly in the database:

```typescript
// Super Admin
POST /api/auth/register
{
  "email": "admin@constructai.com",
  "password": "password123",
  "name": "Super Admin",
  "role": "SUPER_ADMIN"
}

// Company Admin
POST /api/auth/register
{
  "email": "company@constructai.com",
  "password": "password123",
  "name": "Company Admin",
  "role": "COMPANY_ADMIN",
  "organizationId": "org-id"
}

// Supervisor
POST /api/auth/register
{
  "email": "supervisor@constructai.com",
  "password": "password123",
  "name": "Supervisor",
  "role": "SUPERVISOR",
  "organizationId": "org-id",
  "projectIds": ["project-id"]
}

// Operative
POST /api/auth/register
{
  "email": "operative@constructai.com",
  "password": "password123",
  "name": "Operative",
  "role": "OPERATIVE",
  "organizationId": "org-id",
  "projectIds": ["project-id"]
}
```

## 📋 Testing Checklist

### Super Admin
- [ ] Can access `/super-admin-dashboard`
- [ ] Can see all companies and users
- [ ] Can access system settings
- [ ] Can view audit logs
- [ ] Can see all users on map

### Company Admin
- [ ] Can access `/company-dashboard`
- [ ] Can create projects
- [ ] Can manage team members
- [ ] Can assign tasks
- [ ] Can approve timesheets
- [ ] Can see all company users on map

### Supervisor
- [ ] Can access `/supervisor-dashboard`
- [ ] Can create tasks
- [ ] Can assign tasks to operatives
- [ ] Can upload drawings
- [ ] Can approve timesheets
- [ ] Can see team members on map
- [ ] Cannot create projects

### Operative
- [ ] Can access `/operative-dashboard`
- [ ] Can view assigned tasks
- [ ] Can submit task updates
- [ ] Can log time
- [ ] Can report safety issues
- [ ] Can only see own location on map
- [ ] Cannot create tasks

## 🔑 Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Refresh token

### Tasks
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create task (requires SUPERVISOR+)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/assign` - Assign task
- `POST /api/tasks/:id/update` - Submit update
- `POST /api/tasks/:id/timesheet/approve` - Approve timesheet
- `POST /api/tasks/:id/safety` - Report safety issue

## 🎯 Common Use Cases

### Assign Task to All Operatives
```typescript
POST /api/tasks
{
  "title": "Install fixtures",
  "projectId": "project-123",
  "assignedToRoles": ["OPERATIVE"],
  "targetRoles": ["OPERATIVE", "SUPERVISOR"],
  "priority": "HIGH"
}
```

### Submit Task Update (Operative)
```typescript
POST /api/tasks/:taskId/update
{
  "update": "Completed installation of all fixtures",
  "timeLog": {
    "hours": 4.5,
    "notes": "Worked on main floor"
  }
}
```

### Approve Timesheet (Supervisor)
```typescript
POST /api/tasks/:taskId/timesheet/approve
{
  "approved": true
}
```

## 🐛 Troubleshooting

### Issue: "Unauthorized" errors
- Check that JWT token is being sent in Authorization header
- Verify token hasn't expired
- Check user role in database

### Issue: Can't see tasks
- Verify user has `projectIds` set in database
- Check task `assignedToRoles` or `assignedTo` field
- Verify task `targetRoles` includes user's role

### Issue: Map shows no users
- Check role-based filtering logic
- Verify users have updated their location
- Check WebSocket connection

### Issue: Permission denied
- Verify user role in database
- Check permission requirements in `ROLE_PERMISSIONS`
- Ensure route has correct `requiredPermission` prop

## 📚 Additional Resources

- See `RBAC_IMPLEMENTATION.md` for detailed implementation notes
- See `SCOPE_UNDERSTANDING.md` for complete platform scope
- See `IMPLEMENTATION_STATUS.md` for feature status

