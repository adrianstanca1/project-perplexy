#!/bin/bash

# Docker Build and Deploy Locally for Testing
# This script builds Docker images and starts the application locally

set -e

echo "🐳 Code Interpreter - Docker Build and Deploy Locally"
echo "====================================================="
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
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker"
        exit 1
    fi
    print_success "Docker $(docker --version | cut -d ' ' -f 3 | cut -d ',' -f 1) installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose"
        exit 1
    fi
    print_success "Docker Compose installed"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker"
        exit 1
    fi
    print_success "Docker is running"
    
    echo ""
}

# Create storage directories
create_storage() {
    print_info "Creating storage directories..."
    mkdir -p packages/backend/storage/uploads
    mkdir -p packages/backend/storage/drawings
    mkdir -p packages/backend/storage/maps
    chmod -R 755 packages/backend/storage 2>/dev/null || true
    print_success "Storage directories created"
    echo ""
}

# Build Docker images
build_images() {
    print_info "Building Docker images..."
    echo ""
    
    # Build backend
    print_info "Building backend image..."
    if docker-compose build backend; then
        print_success "Backend image built"
    else
        print_error "Failed to build backend image"
        exit 1
    fi
    echo ""
    
    # Build frontend
    print_info "Building frontend image..."
    if docker-compose build frontend; then
        print_success "Frontend image built"
    else
        print_error "Failed to build frontend image"
        exit 1
    fi
    echo ""
}

# Start services
start_services() {
    print_info "Starting Docker services..."
    echo ""
    
    # Stop existing services
    print_info "Stopping existing services..."
    docker-compose down 2>/dev/null || true
    echo ""
    
    # Start services
    print_info "Starting services..."
    if docker-compose up -d; then
        print_success "Services started"
    else
        print_error "Failed to start services"
        exit 1
    fi
    echo ""
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 5
    
    # Check service status
    if docker-compose ps | grep -q "Up (healthy)"; then
        print_success "Services are healthy"
    else
        print_warning "Some services may not be healthy yet. Check logs with: docker-compose logs"
    fi
    echo ""
}

# Show status
show_status() {
    print_info "Service status:"
    docker-compose ps
    echo ""
    
    print_success "✅ Docker deployment complete!"
    echo ""
    echo "Access points:"
    echo "  Frontend:  ${BLUE}http://localhost:3000${NC}"
    echo "  Backend:   ${BLUE}http://localhost:3001${NC}"
    echo "  Health:    ${BLUE}http://localhost:3001/health${NC}"
    echo ""
    echo "Useful commands:"
    echo "  View logs:        ${BLUE}docker-compose logs -f${NC}"
    echo "  Stop services:    ${BLUE}docker-compose down${NC}"
    echo "  Restart services: ${BLUE}docker-compose restart${NC}"
    echo "  View status:      ${BLUE}docker-compose ps${NC}"
    echo ""
}

# Main execution
main() {
    clear
    echo "🐳 Code Interpreter - Docker Build and Deploy Locally"
    echo "====================================================="
    echo ""
    
    check_prerequisites
    create_storage
    build_images
    start_services
    show_status
}

# Run main function
main

