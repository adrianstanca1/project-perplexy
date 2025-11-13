#!/bin/bash

# Start Local Development Servers
# This script starts both frontend and backend development servers

set -e

echo "🚀 Starting Code Interpreter Application"
echo "========================================="
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

# Check if services are already running
check_ports() {
    print_info "Checking if ports are available..."
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port 3000 is already in use"
        print_info "Please stop the process using port 3000 or change the port"
        exit 1
    fi
    
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Port 3001 is already in use"
        print_info "Please stop the process using port 3001 or change the port"
        exit 1
    fi
    
    print_success "Ports 3000 and 3001 are available"
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
    print_success "Storage directories ready"
    echo ""
}

# Start services
start_services() {
    print_info "Starting development servers..."
    echo ""
    print_success "Starting backend on port 3001..."
    print_success "Starting frontend on port 3000..."
    echo ""
    print_info "Press Ctrl+C to stop all services"
    echo ""
    
    # Start services using pnpm dev (concurrently)
    pnpm dev
}

# Main execution
main() {
    clear
    echo "🚀 Starting Code Interpreter Application"
    echo "========================================="
    echo ""
    
    check_ports
    create_storage
    start_services
}

# Trap to cleanup on exit
trap 'echo ""; print_info "Stopping services..."; exit' INT TERM

# Run main function
main

