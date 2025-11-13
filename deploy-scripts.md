# 🚀 CortexBuild v2.0 - Automated Build & Deploy Script

## Quick Deploy Script

**File: `deploy.sh`**

```bash
#!/bin/bash

# CortexBuild v2.0 - Automated Build & Deploy Script
# Run this script to build and deploy your enhanced CortexBuild project

set -e  # Exit on error

echo "🚀 CortexBuild v2.0 - Build & Deploy"
echo "===================================="
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
        print_warning "pnpm not found. Installing..."
        npm install -g pnpm@8
    fi
    print_success "pnpm $(pnpm -v) installed"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Some features may not work."
    else
        print_success "Docker $(docker -v | cut -d ' ' -f 3 | cut -d ',' -f 1) installed"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git $(git --version | cut -d ' ' -f 3) installed"
    
    echo ""
}

# Backup existing project
backup_project() {
    print_info "Creating backup of existing project..."
    
    if [ -d ".git" ]; then
        BACKUP_BRANCH="backup/pre-v2-$(date +%Y%m%d-%H%M%S)"
        git checkout -b "$BACKUP_BRANCH"
        git add -A
        git commit -m "Backup before v2.0 migration" || true
        git push origin "$BACKUP_BRANCH" || print_warning "Could not push backup branch"
        git checkout main || git checkout master
        print_success "Backup created on branch: $BACKUP_BRANCH"
    else
        print_warning "Not a git repository. Skipping backup."
    fi
    
    echo ""
}

# Create monorepo structure
create_structure() {
    print_info "Creating monorepo structure..."
    
    # Create packages directory
    mkdir -p packages/{frontend,backend,shared}
    mkdir -p .github/workflows
    mkdir -p docs
    
    # Create backend subdirectories
    mkdir -p packages/backend/src/{controllers,services,repositories,routes,middleware,config,utils,types,websocket,agents}
    mkdir -p packages/backend/tests/{unit,integration}
    mkdir -p packages/backend/prisma/migrations
    
    # Create frontend subdirectories
    mkdir -p packages/frontend/src/{components,pages,hooks,contexts,services,utils,types,config,styles}
    mkdir -p packages/frontend/src/components/{common,auth,layout,workflow}
    mkdir -p packages/frontend/tests/{unit,e2e}
    mkdir -p packages/frontend/public
    
    # Create shared subdirectories
    mkdir -p packages/shared/src/{types,utils,constants}
    
    print_success "Directory structure created"
    echo ""
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Check if pnpm-workspace.yaml exists
    if [ ! -f "pnpm-workspace.yaml" ]; then
        echo "packages:" > pnpm-workspace.yaml
        echo "  - 'packages/*'" >> pnpm-workspace.yaml
        print_success "Created pnpm-workspace.yaml"
    fi
    
    pnpm install --frozen-lockfile || pnpm install
    
    print_success "Dependencies installed"
    echo ""
}

# Setup environment
setup_environment() {
    print_info "Setting up environment..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
            print_warning "Please edit .env with your configuration"
        else
            print_warning ".env.example not found. Creating basic .env"
            cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://cortexbuild:cortexbuild_dev@localhost:5432/cortexbuild
REDIS_URL=redis://localhost:6379
JWT_SECRET=change_this_in_production
JWT_REFRESH_SECRET=change_this_in_production_too
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
EOF
            print_success "Created basic .env file"
            print_warning "Please edit .env with your actual configuration"
        fi
    else
        print_success ".env file already exists"
    fi
    
    echo ""
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    cd packages/backend
    
    # Generate Prisma client
    if [ -f "prisma/schema.prisma" ]; then
        print_info "Generating Prisma client..."
        pnpm prisma generate
        print_success "Prisma client generated"
        
        # Run migrations
        print_info "Running database migrations..."
        pnpm prisma migrate dev --name init || print_warning "Migrations may have already been applied"
        print_success "Database migrations complete"
    else
        print_warning "Prisma schema not found. Skipping database setup."
    fi
    
    cd ../..
    echo ""
}

# Build project
build_project() {
    print_info "Building project..."
    
    # Type check
    print_info "Running type check..."
    pnpm type-check || print_warning "Type check had warnings"
    
    # Lint
    print_info "Running linter..."
    pnpm lint || print_warning "Linting had warnings"
    
    # Build
    print_info "Building all packages..."
    pnpm build
    
    print_success "Build complete"
    echo ""
}

# Run tests
run_tests() {
    print_info "Running tests..."
    
    # Unit tests
    print_info "Running unit tests..."
    pnpm test:unit || print_warning "Some tests failed"
    
    print_success "Tests complete"
    echo ""
}

# Start development
start_development() {
    print_info "Starting development servers..."
    
    echo ""
    print_success "Starting Docker services..."
    docker-compose up -d postgres redis || print_warning "Could not start Docker services"
    
    echo ""
    print_success "Development environment ready!"
    echo ""
    echo "To start the development servers, run:"
    echo ""
    echo "  ${GREEN}pnpm dev${NC}         # Start all services"
    echo "  ${GREEN}pnpm dev:frontend${NC}  # Start frontend only"
    echo "  ${GREEN}pnpm dev:backend${NC}   # Start backend only"
    echo ""
    echo "Access points:"
    echo "  Frontend:  ${BLUE}http://localhost:3000${NC}"
    echo "  Backend:   ${BLUE}http://localhost:3001${NC}"
    echo "  API Docs:  ${BLUE}http://localhost:3001/api/docs${NC}"
    echo ""
}

# Deploy to production
deploy_production() {
    print_info "Deploying to production..."
    
    # Check if we're on main/master branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        print_warning "Not on main/master branch. Current branch: $CURRENT_BRANCH"
        read -p "Continue deployment? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    # Build for production
    print_info "Building for production..."
    NODE_ENV=production pnpm build
    
    # Deploy frontend to Vercel
    print_info "Deploying frontend to Vercel..."
    if command -v vercel &> /dev/null; then
        cd packages/frontend
        vercel --prod
        cd ../..
        print_success "Frontend deployed to Vercel"
    else
        print_warning "Vercel CLI not found. Install with: npm i -g vercel"
    fi
    
    # Deploy backend
    print_info "Backend deployment..."
    print_warning "Please deploy backend manually to your hosting provider"
    print_warning "Options: Railway, Render, Heroku, AWS, etc."
    
    echo ""
    print_success "Deployment process complete!"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "  1) Full setup (recommended for new installations)"
    echo "  2) Install dependencies only"
    echo "  3) Setup database"
    echo "  4) Build project"
    echo "  5) Run tests"
    echo "  6) Start development environment"
    echo "  7) Deploy to production"
    echo "  8) Exit"
    echo ""
    read -p "Enter option (1-8): " option
    
    case $option in
        1)
            check_prerequisites
            backup_project
            create_structure
            install_dependencies
            setup_environment
            setup_database
            build_project
            start_development
            ;;
        2)
            check_prerequisites
            install_dependencies
            ;;
        3)
            setup_database
            ;;
        4)
            build_project
            ;;
        5)
            run_tests
            ;;
        6)
            start_development
            ;;
        7)
            deploy_production
            ;;
        8)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Main execution
main() {
    clear
    echo "🚀 CortexBuild v2.0 - Build & Deploy"
    echo "===================================="
    echo ""
    
    show_menu
}

# Run main function
main
```

---

## Windows PowerShell Version

**File: `deploy.ps1`**

```powershell
# CortexBuild v2.0 - Automated Build & Deploy Script (Windows)
# Run with: powershell -ExecutionPolicy Bypass -File deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 CortexBuild v2.0 - Build & Deploy" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

function Print-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Info {
    param($message)
    Write-Host "ℹ $message" -ForegroundColor Blue
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Warning {
    param($message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

# Check prerequisites
function Check-Prerequisites {
    Print-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = (node -v).Replace('v', '').Split('.')[0]
        if ([int]$nodeVersion -lt 18) {
            Print-Error "Node.js version must be 18 or higher"
            exit 1
        }
        Print-Success "Node.js $(node -v) installed"
    } catch {
        Print-Error "Node.js is not installed"
        exit 1
    }
    
    # Check pnpm
    try {
        pnpm -v | Out-Null
        Print-Success "pnpm $(pnpm -v) installed"
    } catch {
        Print-Warning "Installing pnpm..."
        npm install -g pnpm@8
    }
    
    Write-Host ""
}

# Create structure
function Create-Structure {
    Print-Info "Creating monorepo structure..."
    
    $dirs = @(
        "packages/frontend/src/components",
        "packages/frontend/src/pages",
        "packages/frontend/tests",
        "packages/backend/src/controllers",
        "packages/backend/src/services",
        "packages/backend/tests",
        "packages/shared/src",
        ".github/workflows",
        "docs"
    )
    
    foreach ($dir in $dirs) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    Print-Success "Directory structure created"
    Write-Host ""
}

# Install dependencies
function Install-Dependencies {
    Print-Info "Installing dependencies..."
    
    if (-not (Test-Path "pnpm-workspace.yaml")) {
        @"
packages:
  - 'packages/*'
"@ | Out-File -FilePath "pnpm-workspace.yaml" -Encoding utf8
        Print-Success "Created pnpm-workspace.yaml"
    }
    
    pnpm install
    Print-Success "Dependencies installed"
    Write-Host ""
}

# Main menu
function Show-Menu {
    Write-Host ""
    Write-Host "Select an option:"
    Write-Host "  1) Full setup"
    Write-Host "  2) Install dependencies"
    Write-Host "  3) Build project"
    Write-Host "  4) Start development"
    Write-Host "  5) Exit"
    Write-Host ""
    
    $option = Read-Host "Enter option (1-5)"
    
    switch ($option) {
        "1" {
            Check-Prerequisites
            Create-Structure
            Install-Dependencies
            Print-Success "Setup complete!"
        }
        "2" {
            Install-Dependencies
        }
        "3" {
            pnpm build
        }
        "4" {
            Print-Info "Starting development servers..."
            pnpm dev
        }
        "5" {
            exit 0
        }
        default {
            Print-Error "Invalid option"
            Show-Menu
        }
    }
}

# Run
Show-Menu
```

---

## Docker Deploy Script

**File: `docker-deploy.sh`**

```bash
#!/bin/bash

# Quick Docker deployment script

echo "🐳 CortexBuild Docker Deployment"
echo "================================"
echo ""

# Build images
echo "Building Docker images..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 10

# Run migrations
echo "Running database migrations..."
docker-compose exec backend pnpm prisma migrate deploy

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services:"
docker-compose ps
echo ""
echo "Access points:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop:      docker-compose down"
```

---

## Package Installation Order

```bash
# 1. Install root dependencies
pnpm install

# 2. Install shared package
pnpm --filter @cortexbuild/shared install

# 3. Install backend
pnpm --filter @cortexbuild/backend install

# 4. Install frontend
pnpm --filter @cortexbuild/frontend install

# 5. Generate Prisma client
pnpm --filter @cortexbuild/backend prisma generate

# 6. Build all
pnpm build
```
