# Environment Configuration Guide

This guide explains how to configure environment variables for the ConstructAI platform.

## Quick Start

### 1. Backend Configuration

```bash
cd packages/backend
cp .env.example .env
# Edit .env with your configuration
```

**Required Environment Variables:**

- `DATABASE_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for signing JWT tokens (generate with: `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (generate with: `openssl rand -base64 32`)
- `SESSION_SECRET` - Secret for session management (generate with: `openssl rand -base64 32`)
- `FRONTEND_URL` - URL of the frontend application

**Optional Environment Variables:**

- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `SENDGRID_API_KEY` - SendGrid API key for email
- `STRIPE_SECRET_KEY` - Stripe secret key for payments

### 2. Frontend Configuration

```bash
cd packages/frontend
cp .env.example .env
# Edit .env with your configuration
```

**Required Environment Variables:**

- `VITE_API_URL` - Backend API URL

**Optional Environment Variables:**

- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Local Development Setup

### Option 1: Using Docker (Recommended)

1. **Start MongoDB and Redis with Docker Compose:**
   ```bash
   docker-compose up -d mongodb redis
   ```

2. **Use default development configuration:**
   ```bash
   # Backend .env
   DATABASE_URL=mongodb://admin:changeme@localhost:27017/constructai?authSource=admin
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=dev-secret-change-in-production
   JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
   SESSION_SECRET=dev-session-secret-change-in-production
   FRONTEND_URL=http://localhost:3000
   
   # Frontend .env
   VITE_API_URL=http://localhost:3001
   ```

3. **Generate Prisma client and run migrations:**
   ```bash
   cd packages/backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start development servers:**
   ```bash
   # From project root
   npm run dev
   ```

### Option 2: Using Cloud Services

1. **MongoDB Atlas:**
   - Create a cluster at [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
   - Get connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/constructai`
   - Update `DATABASE_URL` in backend `.env`

2. **Redis Cloud:**
   - Create a database at [https://redis.com/try-free/](https://redis.com/try-free/)
   - Get connection string: `redis://default:<password>@<host>:<port>`
   - Update `REDIS_URL` in backend `.env`

## Production Deployment

### Security Checklist

- [ ] Generate strong secrets for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `SESSION_SECRET`
- [ ] Use production MongoDB database (MongoDB Atlas recommended)
- [ ] Use production Redis instance (Redis Cloud recommended)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with specific frontend URL
- [ ] Enable HTTPS/SSL for all connections
- [ ] Configure proper MongoDB connection pooling
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting appropriately

### Vercel Deployment (Frontend)

1. **Configure environment variables in Vercel dashboard:**
   - `VITE_API_URL` - Your backend API URL (e.g., Railway URL)

2. **Deploy:**
   ```bash
   cd packages/frontend
   vercel --prod
   ```

### Railway Deployment (Backend)

1. **Configure environment variables in Railway dashboard:**
   - `DATABASE_URL` - MongoDB connection string
   - `REDIS_URL` - Redis connection string
   - `JWT_SECRET` - Strong random secret
   - `JWT_REFRESH_SECRET` - Strong random secret
   - `SESSION_SECRET` - Strong random secret
   - `FRONTEND_URL` - Your Vercel frontend URL
   - `NODE_ENV=production`

2. **Deploy:**
   ```bash
   cd packages/backend
   railway up
   ```

### AWS/GCP/Azure Deployment

1. **Set up MongoDB:**
   - Use MongoDB Atlas or managed MongoDB service
   - Configure connection string with authentication

2. **Set up Redis:**
   - Use managed Redis service (ElastiCache, Cloud Memorystore, etc.)
   - Configure connection string

3. **Set up application:**
   - Deploy backend as a containerized service (ECS, Cloud Run, Container Instances)
   - Deploy frontend to static hosting (S3+CloudFront, Cloud Storage+CDN, Blob Storage+CDN)
   - Configure environment variables in your cloud platform

4. **Configure DNS and SSL:**
   - Point domain to your services
   - Enable HTTPS with SSL certificates

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Node environment (development/production) |
| `PORT` | No | `3001` | Server port |
| `DATABASE_URL` | Yes | - | MongoDB connection string |
| `REDIS_URL` | Yes | - | Redis connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `JWT_REFRESH_SECRET` | Yes | - | Refresh token signing secret |
| `JWT_EXPIRES_IN` | No | `15m` | JWT expiration time |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiration time |
| `SESSION_SECRET` | Yes | - | Session signing secret |
| `FRONTEND_URL` | Yes | - | Frontend application URL |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth2 client secret |
| `GOOGLE_CALLBACK_URL` | No | `http://localhost:3001/api/auth/google/callback` | OAuth2 callback URL |
| `SENDGRID_API_KEY` | No | - | SendGrid API key for emails |
| `FROM_EMAIL` | No | `noreply@constructai.com` | From email address |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook secret |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | - | Backend API URL |
| `VITE_APP_NAME` | No | `ConstructAI` | Application name |
| `VITE_GOOGLE_MAPS_API_KEY` | No | - | Google Maps API key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | - | Stripe publishable key |

## Testing Configuration

To test your configuration:

1. **Backend health check:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test authentication:**
   ```bash
   # Register a new user
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpassword123",
       "name": "Test User"
     }'
   
   # Login
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpassword123"
     }'
   ```

3. **Test database connection:**
   ```bash
   cd packages/backend
   npm run prisma:studio
   ```

4. **Test Redis connection:**
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

## Troubleshooting

### Common Issues

1. **"Failed to connect to database"**
   - Check `DATABASE_URL` is correct
   - Verify MongoDB is running
   - Check firewall/network rules

2. **"Redis error"**
   - Check `REDIS_URL` is correct
   - Verify Redis is running
   - Check connection limits

3. **"Invalid JWT token"**
   - Ensure `JWT_SECRET` is the same across deployments
   - Check token hasn't expired

4. **"CORS error"**
   - Verify `FRONTEND_URL` matches your frontend URL
   - Check CORS configuration in backend

5. **"Google OAuth not working"**
   - Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
   - Check `GOOGLE_CALLBACK_URL` is correct
   - Verify callback URL is registered in Google Cloud Console

## Additional Resources

- [MongoDB Connection String Documentation](https://docs.mongodb.com/manual/reference/connection-string/)
- [Redis Configuration Documentation](https://redis.io/topics/config)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
