#!/bin/bash

# Local Production Deployment Script
# This script builds and deploys the application locally in production mode

set -e

echo "🚀 Code Interpreter - Local Production Deployment"
echo "================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher. Current: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) installed"
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm 8+"
        exit 1
    fi
    print_success "pnpm $(pnpm -v) installed"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. Code execution may not work."
    else
        print_success "Python $(python3 --version) installed"
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    pnpm install
    print_success "Dependencies installed"
    echo ""
}

# Build application
build_application() {
    print_info "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build all packages
    pnpm build
    
    print_success "Build complete"
    echo ""
}

# Create storage directory
create_storage() {
    print_info "Creating storage directory..."
    mkdir -p storage
    chmod 755 storage
    print_success "Storage directory created"
    echo ""
}

# Start services
start_services() {
    print_info "Starting services..."
    echo ""
    print_success "Starting backend on port 3001..."
    print_success "Starting frontend on port 3000..."
    echo ""
    print_info "Press Ctrl+C to stop services"
    echo ""
    
    # Start services in background
    cd packages/backend && pnpm start > ../../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ../..
    
    cd packages/frontend && pnpm start > ../../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait a bit for services to start
    sleep 3
    
    # Check if services are running
    if ps -p $BACKEND_PID > /dev/null; then
        print_success "Backend started (PID: $BACKEND_PID)"
    else
        print_error "Backend failed to start. Check backend.log for details."
        exit 1
    fi
    
    if ps -p $FRONTEND_PID > /dev/null; then
        print_success "Frontend started (PID: $FRONTEND_PID)"
    else
        print_error "Frontend failed to start. Check frontend.log for details."
        exit 1
    fi
    
    echo ""
    print_success "Services started successfully!"
    echo ""
    echo "Access points:"
    echo "  Frontend:  ${BLUE}http://localhost:3000${NC}"
    echo "  Backend:   ${BLUE}http://localhost:3001${NC}"
    echo "  Health:    ${BLUE}http://localhost:3001/health${NC}"
    echo ""
    echo "Logs:"
    echo "  Backend:   tail -f backend.log"
    echo "  Frontend:  tail -f frontend.log"
    echo ""
    echo "To stop services:"
    echo "  kill $BACKEND_PID $FRONTEND_PID"
    echo ""
    
    # Trap to cleanup on exit
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    
    # Wait for user to stop
    wait
}

# Main execution
main() {
    clear
    echo "🚀 Code Interpreter - Local Production Deployment"
    echo "================================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    build_application
    create_storage
    start_services
}

# Run main function
main


