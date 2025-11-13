#!/bin/bash

# Build and Deploy Locally for Testing
# This script builds the application locally for testing

set -e

echo "🚀 Building Code Interpreter Application for Local Testing"
echo "=========================================================="
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
        print_info "Install pnpm: npm install -g pnpm"
        exit 1
    fi
    print_success "pnpm $(pnpm -v) installed"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. Code execution may not work."
        print_info "Install Python: brew install python3 (macOS) or sudo apt-get install python3 (Linux)"
    else
        print_success "Python $(python3 --version) installed"
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    if pnpm install; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    echo ""
}

# Create storage directories
create_storage() {
    print_info "Creating storage directories..."
    mkdir -p storage
    mkdir -p packages/backend/storage/uploads
    mkdir -p packages/backend/storage/drawings
    mkdir -p packages/backend/storage/maps
    chmod -R 755 storage packages/backend/storage 2>/dev/null || true
    print_success "Storage directories created"
    echo ""
}

# Build application
build_application() {
    print_info "Building application..."
    
    # Build shared package
    print_info "Building shared package..."
    if pnpm --filter shared build; then
        print_success "Shared package built"
    else
        print_error "Failed to build shared package"
        exit 1
    fi
    
    # Build backend
    print_info "Building backend..."
    if pnpm --filter backend build; then
        print_success "Backend built"
    else
        print_error "Failed to build backend"
        exit 1
    fi
    
    # Build frontend
    print_info "Building frontend..."
    if pnpm --filter frontend build; then
        print_success "Frontend built"
    else
        print_error "Failed to build frontend"
        exit 1
    fi
    
    echo ""
    print_success "Build complete!"
    echo ""
}

# Verify build
verify_build() {
    print_info "Verifying build..."
    
    # Check backend build
    if [ -d "packages/backend/dist" ] && [ -f "packages/backend/dist/index.js" ]; then
        print_success "Backend build verified"
    else
        print_error "Backend build not found"
        exit 1
    fi
    
    # Check frontend build
    if [ -d "packages/frontend/dist" ] && [ -f "packages/frontend/dist/index.html" ]; then
        print_success "Frontend build verified"
    else
        print_error "Frontend build not found"
        exit 1
    fi
    
    echo ""
}

# Main execution
main() {
    clear
    echo "🚀 Building Code Interpreter Application for Local Testing"
    echo "=========================================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    create_storage
    build_application
    verify_build
    
    echo ""
    print_success "✅ Build completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Start development servers: ${BLUE}pnpm dev${NC}"
    echo "  2. Start production servers: ${BLUE}pnpm start${NC}"
    echo "  3. Deploy with Docker: ${BLUE}docker-compose up -d${NC}"
    echo ""
    echo "Access points:"
    echo "  Frontend:  ${BLUE}http://localhost:3000${NC}"
    echo "  Backend:   ${BLUE}http://localhost:3001${NC}"
    echo "  Health:    ${BLUE}http://localhost:3001/health${NC}"
    echo ""
}

# Run main function
main

