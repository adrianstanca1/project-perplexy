FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files (for workspace setup)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies (this will install all workspace dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3001
ARG VITE_WS_URL=ws://localhost:3001/ws

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Build shared package first, then frontend
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/packages/frontend
RUN pnpm build

# Copy nginx configuration to builder (so it's available in production stage)
COPY packages/frontend/nginx.conf /app/packages/frontend/nginx.conf

# Production stage
FROM nginx:alpine

# Copy built files from frontend
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx configuration from builder
COPY --from=builder /app/packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

