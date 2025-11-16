#!/bin/bash

# ========================================
# Full Stack Deployment Script
# Frontend: Vercel | Backend: Railway
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main deployment script
main() {
    print_header "ConstructAI Full Stack Deployment"
    
    echo "This script will deploy:"
    echo "  - Frontend to Vercel"
    echo "  - Backend to Railway (optional)"
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 20+"
        exit 1
    fi
    print_success "Node.js $(node -v) installed"
    
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm -v) installed"
    
    # Check if in correct directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run from project root."
        exit 1
    fi
    
    # Ask what to deploy
    echo ""
    echo "What would you like to deploy?"
    echo "  1) Frontend only (Vercel)"
    echo "  2) Backend only (Railway)"
    echo "  3) Both Frontend and Backend"
    echo ""
    read -p "Enter choice (1-3): " choice
    echo ""
    
    case $choice in
        1)
            deploy_frontend
            ;;
        2)
            deploy_backend
            ;;
        3)
            deploy_backend
            echo ""
            deploy_frontend
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
}

deploy_frontend() {
    print_header "Deploying Frontend to Vercel"
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    print_success "Vercel CLI installed"
    
    # Check for environment variables
    print_info "Checking environment configuration..."
    if [ ! -f "packages/frontend/.env.production" ]; then
        print_warning ".env.production not found in packages/frontend/"
        print_info "Creating template .env.production..."
        
        cat > packages/frontend/.env.production << EOF
# Backend API URL (update with your Railway URL)
VITE_API_URL=https://your-backend.up.railway.app

# WebSocket URL (same as API URL)
VITE_WS_URL=wss://your-backend.up.railway.app
EOF
        
        print_warning "Please update packages/frontend/.env.production with your backend URL"
        read -p "Press Enter after updating the file, or Ctrl+C to exit..."
    fi
    
    # Build frontend locally to verify
    print_info "Building frontend locally to verify..."
    cd packages/frontend
    npm run build
    cd ../..
    print_success "Frontend build successful"
    
    # Deploy to Vercel
    print_info "Deploying to Vercel..."
    print_warning "You may be asked to login to Vercel if not already logged in"
    
    vercel --prod
    
    print_success "Frontend deployed to Vercel!"
    echo ""
    print_info "Next steps:"
    echo "  1. Note your Vercel URL"
    echo "  2. Update backend FRONTEND_URL environment variable with this URL"
    echo "  3. Set environment variables in Vercel dashboard if not already set"
}

deploy_backend() {
    print_header "Deploying Backend to Railway"
    
    # Check if Railway CLI is installed
    if ! command_exists railway; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    print_success "Railway CLI installed"
    
    # Check if logged in
    print_info "Checking Railway authentication..."
    if ! railway whoami >/dev/null 2>&1; then
        print_warning "Not logged in to Railway. Starting login process..."
        railway login
    fi
    print_success "Logged in to Railway"
    
    # Check if project is linked
    if [ ! -f ".railway/project.json" ]; then
        print_warning "Project not linked to Railway"
        print_info "Initializing Railway project..."
        railway init
    fi
    
    # Deploy backend
    print_info "Deploying backend to Railway..."
    cd packages/backend
    railway up
    cd ../..
    
    print_success "Backend deployed to Railway!"
    echo ""
    print_info "Next steps:"
    echo "  1. Add MongoDB and Redis plugins in Railway dashboard"
    echo "  2. Set environment variables in Railway dashboard:"
    echo "     - JWT_SECRET"
    echo "     - JWT_REFRESH_SECRET"
    echo "     - SESSION_SECRET"
    echo "     - FRONTEND_URL (your Vercel URL)"
    echo "  3. Run database migrations: railway run npx prisma migrate deploy"
}

# Run main function
main
