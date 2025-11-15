# Vercel Deployment Guide

This document provides instructions for deploying the frontend application to Vercel.

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/adrianstanca1/project-perplexy)

## Manual Deployment

### Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Vercel CLI installed: `npm install -g vercel`

### Deployment Steps

#### Option 1: Deploy via Vercel CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy to Preview**
   ```bash
   vercel
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Option 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Configure the following settings:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm --filter shared build && pnpm --filter frontend build`
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Output Directory**: `packages/frontend/dist`
5. Click "Deploy"

### Environment Variables

If your frontend requires environment variables, add them in the Vercel dashboard:

1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add the following variables (if needed):
   - `VITE_API_URL` - Your backend API URL
   - `VITE_WS_URL` - Your WebSocket URL
   - Other environment variables as needed

### Configuration

The deployment is configured via `vercel.json` in the root directory:

```json
{
  "buildCommand": "pnpm --filter shared build && pnpm --filter frontend build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": "packages/frontend/dist",
  "framework": "vite"
}
```

### Backend Deployment

**Note**: Vercel is designed for frontend applications. The backend (Express API) should be deployed separately to a service like:

- **Heroku**: For Node.js backend
- **Railway**: For full-stack deployments
- **Render**: For Node.js services
- **AWS/GCP/Azure**: For more control
- **DigitalOcean**: For VPS deployment

Ensure your frontend environment variables point to your deployed backend URL.

### Troubleshooting

#### Build Fails

- Check that all dependencies are listed in `package.json`
- Verify the build command works locally
- Check Vercel build logs for specific errors

#### 404 on Refresh

This is handled by the `rewrites` configuration in `vercel.json` which redirects all routes to `index.html` for client-side routing.

#### Large Bundle Size Warning

The frontend bundle is ~1.1MB (297KB gzipped). Consider:
- Using dynamic imports for code splitting
- Lazy loading routes and components
- Analyzing bundle with `vite-bundle-visualizer`

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

### Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## Local Preview

To preview the production build locally:

```bash
pnpm --filter frontend build
pnpm --filter frontend preview
```

## Support

For issues with Vercel deployment, consult:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
