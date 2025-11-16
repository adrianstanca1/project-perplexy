#!/bin/bash

# ============================================
# ConstructAI Production Deployment Script
# ============================================

set -e

echo "🚀 Starting ConstructAI Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required commands exist
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 20+"
    exit 1
fi
print_status "Node.js found: $(node --version)"

if ! command_exists pnpm; then
    print_error "pnpm is not installed. Installing..."
    npm install -g pnpm
fi
print_status "pnpm found: $(pnpm --version)"

if ! command_exists docker; then
    print_warning "Docker not found. Skipping Docker deployment."
    SKIP_DOCKER=true
else
    print_status "Docker found: $(docker --version)"
fi

echo ""

# Check for .env file
echo "🔍 Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found"
    if [ -f .env.production.example ]; then
        echo "Would you like to create one from .env.production.example? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp .env.production.example .env
            print_status "Created .env from template"
            print_warning "Please edit .env with your production values before continuing"
            echo "Press Enter when ready to continue..."
            read -r
        else
            print_error "Cannot proceed without .env file"
            exit 1
        fi
    else
        print_error "No .env.production.example found"
        exit 1
    fi
else
    print_status ".env file found"
fi

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile || pnpm install
print_status "Dependencies installed"

echo ""

# Generate Prisma Client
echo "🔨 Generating Prisma Client..."
cd packages/backend
pnpm prisma:generate
cd ../..
print_status "Prisma Client generated"

echo ""

# Build all packages
echo "🏗️  Building all packages..."
pnpm build:production
print_status "Build completed successfully"

echo ""

# Ask about deployment method
echo "📦 Select deployment method:"
echo "  1) Docker Compose (Recommended)"
echo "  2) Node.js with PM2"
echo "  3) Node.js standalone"
echo "  4) Build only (manual deployment)"
echo ""
echo -n "Enter your choice (1-4): "
read -r choice

case $choice in
    1)
        # Docker Compose deployment
        if [ "$SKIP_DOCKER" = true ]; then
            print_error "Docker is not available"
            exit 1
        fi
        
        echo ""
        echo "🐳 Deploying with Docker Compose..."
        
        # Build Docker images
        echo "Building Docker images..."
        docker-compose -f docker-compose.prod.yml build
        print_status "Docker images built"
        
        # Start services
        echo "Starting services..."
        docker-compose -f docker-compose.prod.yml up -d
        print_status "Services started"
        
        # Wait for services to be ready
        echo "Waiting for services to be ready..."
        sleep 10
        
        # Run migrations
        echo "Running database migrations..."
        docker-compose -f docker-compose.prod.yml exec -T backend npm run prisma:migrate || print_warning "Migrations failed or already applied"
        
        # Show status
        echo ""
        echo "📊 Service Status:"
        docker-compose -f docker-compose.prod.yml ps
        
        echo ""
        print_status "Docker deployment completed!"
        echo ""
        echo "🌐 Access points:"
        echo "  - Frontend: http://localhost:3000"
        echo "  - Backend: http://localhost:3001"
        echo "  - Health: http://localhost:3001/health"
        echo ""
        echo "📝 Useful commands:"
        echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
        echo "  - Stop: docker-compose -f docker-compose.prod.yml down"
        echo "  - Restart: docker-compose -f docker-compose.prod.yml restart"
        ;;
        
    2)
        # PM2 deployment
        echo ""
        echo "🔄 Deploying with PM2..."
        
        if ! command_exists pm2; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        
        # Stop existing processes
        pm2 delete constructai-backend constructai-frontend 2>/dev/null || true
        
        # Start backend
        echo "Starting backend..."
        cd packages/backend
        pm2 start dist/index.js --name constructai-backend
        cd ../..
        
        # Start frontend
        echo "Starting frontend..."
        cd packages/frontend
        pm2 start npm --name constructai-frontend -- start
        cd ../..
        
        # Save PM2 configuration
        pm2 save
        
        print_status "PM2 deployment completed!"
        echo ""
        echo "📝 Useful commands:"
        echo "  - View status: pm2 status"
        echo "  - View logs: pm2 logs"
        echo "  - Restart: pm2 restart all"
        echo "  - Stop: pm2 stop all"
        echo ""
        echo "💡 To enable auto-start on system boot, run: pm2 startup"
        ;;
        
    3)
        # Standalone Node.js
        echo ""
        echo "🚀 Deploying with standalone Node.js..."
        
        # Create start script
        cat > start-production.sh << 'EOF'
#!/bin/bash
# Start backend
cd packages/backend
NODE_ENV=production node dist/index.js &
BACKEND_PID=$!
cd ../..

# Start frontend
cd packages/frontend
pnpm start &
FRONTEND_PID=$!
cd ../..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Processes started. Press Ctrl+C to stop."

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Wait for processes
wait
EOF
        chmod +x start-production.sh
        
        print_status "Created start-production.sh script"
        echo ""
        echo "To start the application, run:"
        echo "  ./start-production.sh"
        echo ""
        echo "Or start manually:"
        echo "  Backend: cd packages/backend && node dist/index.js"
        echo "  Frontend: cd packages/frontend && pnpm start"
        ;;
        
    4)
        # Build only
        echo ""
        print_status "Build completed! Ready for manual deployment."
        echo ""
        echo "📦 Build artifacts:"
        echo "  - Backend: packages/backend/dist/"
        echo "  - Frontend: packages/frontend/dist/"
        echo ""
        echo "📝 Next steps:"
        echo "  1. Copy build artifacts to your server"
        echo "  2. Set up environment variables"
        echo "  3. Start the services"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "============================================"
echo "🎉 Deployment process completed!"
echo "============================================"
echo ""
echo "📚 For more information, see:"
echo "  - DEPLOYMENT_GUIDE.md"
echo "  - README.md"
echo ""
