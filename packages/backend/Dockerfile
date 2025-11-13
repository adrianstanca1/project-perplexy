FROM node:18-alpine

WORKDIR /app

# Install Python for code execution
RUN apk add --no-cache python3 py3-pip wget

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
COPY packages/backend ./packages/backend

# Create storage directories
RUN mkdir -p packages/backend/storage/uploads packages/backend/storage/drawings packages/backend/storage/maps

# Build shared package first, then backend
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/packages/backend
RUN pnpm build

# Set working directory to backend
WORKDIR /app/packages/backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start server
CMD ["pnpm", "start"]

