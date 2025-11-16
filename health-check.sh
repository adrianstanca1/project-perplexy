#!/bin/bash

# ========================================
# ConstructAI - Deployment Health Check
# ========================================
# This script verifies that the deployment is healthy and working correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TIMEOUT=10

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_check() {
    echo -n "  Checking $1... "
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC} $1"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if URL is accessible
check_url() {
    local url=$1
    local name=$2
    
    print_check "$name"
    
    if curl -f -s -o /dev/null --max-time $TIMEOUT "$url"; then
        print_pass
        return 0
    else
        print_fail "Cannot reach $url"
        return 1
    fi
}

# Check if JSON endpoint returns valid response
check_json_endpoint() {
    local url=$1
    local name=$2
    local expected_field=$3
    
    print_check "$name"
    
    response=$(curl -f -s --max-time $TIMEOUT "$url" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        print_fail "Cannot reach $url"
        return 1
    fi
    
    if echo "$response" | grep -q "$expected_field"; then
        print_pass
        return 0
    else
        print_fail "Invalid response from $url"
        return 1
    fi
}

# Check Docker services
check_docker_services() {
    print_header "Docker Services"
    
    if ! command -v docker >/dev/null 2>&1; then
        print_warning "Docker not installed (skipping Docker checks)"
        return
    fi
    
    # Check if docker-compose is running
    if docker-compose ps >/dev/null 2>&1; then
        print_check "Docker Compose services"
        
        # Get service status
        services=$(docker-compose ps --services)
        running=0
        stopped=0
        
        for service in $services; do
            status=$(docker-compose ps -q "$service" | xargs docker inspect -f '{{.State.Status}}' 2>/dev/null)
            if [ "$status" = "running" ]; then
                running=$((running + 1))
                print_pass "$service is running"
            else
                stopped=$((stopped + 1))
                print_fail "$service is not running (status: $status)"
            fi
        done
        
    else
        print_info "Docker Compose not running (manual deployment or different setup)"
    fi
}

# Check backend health
check_backend() {
    print_header "Backend Health"
    
    # Health endpoint
    check_json_endpoint "$BACKEND_URL/health" "Backend health endpoint" "status"
    
    # API version endpoint
    check_url "$BACKEND_URL/api/v1" "API v1 endpoint"
    
    # Check response time
    print_check "Backend response time"
    response_time=$(curl -o /dev/null -s -w '%{time_total}\n' --max-time $TIMEOUT "$BACKEND_URL/health")
    if [ $? -eq 0 ]; then
        response_time_ms=$(echo "$response_time * 1000" | bc)
        if (( $(echo "$response_time < 1" | bc -l) )); then
            print_pass "Response time: ${response_time_ms}ms"
        elif (( $(echo "$response_time < 3" | bc -l) )); then
            print_warning "Response time: ${response_time_ms}ms (acceptable but could be better)"
        else
            print_fail "Response time: ${response_time_ms}ms (too slow)"
        fi
    else
        print_fail "Could not measure response time"
    fi
}

# Check frontend
check_frontend() {
    print_header "Frontend Health"
    
    # Frontend accessible
    check_url "$FRONTEND_URL" "Frontend is accessible"
    
    # Check if it's serving HTML
    print_check "Frontend serves HTML"
    response=$(curl -s --max-time $TIMEOUT "$FRONTEND_URL")
    if echo "$response" | grep -q "<html"; then
        print_pass
    else
        print_fail "Frontend not serving HTML content"
    fi
    
    # Check for React root
    print_check "React application loaded"
    if echo "$response" | grep -q "root"; then
        print_pass
    else
        print_warning "React root element not found"
    fi
}

# Check database connectivity
check_database() {
    print_header "Database Connectivity"
    
    if command -v docker >/dev/null 2>&1 && docker-compose ps -q mongodb >/dev/null 2>&1; then
        print_check "MongoDB container"
        if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            print_pass "MongoDB is responsive"
        else
            print_fail "MongoDB is not responsive"
        fi
    else
        print_info "MongoDB check skipped (not running in Docker)"
    fi
}

# Check Redis connectivity
check_redis() {
    print_header "Redis Connectivity"
    
    if command -v docker >/dev/null 2>&1 && docker-compose ps -q redis >/dev/null 2>&1; then
        print_check "Redis container"
        if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
            print_pass "Redis is responsive"
        else
            print_fail "Redis is not responsive"
        fi
    else
        print_info "Redis check skipped (not running in Docker)"
    fi
}

# Check environment configuration
check_environment() {
    print_header "Environment Configuration"
    
    print_check ".env file exists"
    if [ -f .env ]; then
        print_pass
        
        # Check for critical variables
        print_check "JWT_SECRET configured"
        if grep -q "^JWT_SECRET=" .env && ! grep -q "^JWT_SECRET=.*changeme" .env; then
            print_pass
        else
            print_fail "JWT_SECRET not configured or using default value"
        fi
        
        print_check "DATABASE_URL configured"
        if grep -q "^DATABASE_URL=" .env; then
            print_pass
        else
            print_fail "DATABASE_URL not configured"
        fi
    else
        print_fail ".env file not found"
    fi
}

# Check build artifacts
check_build() {
    print_header "Build Artifacts"
    
    print_check "Backend build"
    if [ -d packages/backend/dist ]; then
        print_pass "Backend compiled to dist/"
    else
        print_fail "Backend not built (packages/backend/dist not found)"
    fi
    
    print_check "Frontend build"
    if [ -d packages/frontend/dist ]; then
        print_pass "Frontend built to dist/"
    else
        print_fail "Frontend not built (packages/frontend/dist not found)"
    fi
    
    print_check "Prisma client generated"
    if [ -d node_modules/.pnpm/@prisma+client* ] || [ -d node_modules/@prisma/client ]; then
        print_pass
    else
        print_fail "Prisma client not generated"
    fi
}

# Check security
check_security() {
    print_header "Security Configuration"
    
    if [ -f .env ]; then
        # Check for default/weak secrets
        print_check "JWT secrets not using defaults"
        if grep -q "^JWT_SECRET=.*change" .env; then
            print_fail "JWT_SECRET using default value - SECURITY RISK!"
        else
            print_pass
        fi
        
        print_check "Database password not using defaults"
        if grep -q "^MONGO_PASSWORD=changeme" .env; then
            print_fail "MONGO_PASSWORD using default value - SECURITY RISK!"
        else
            print_pass
        fi
    fi
    
    # Check if .env is in .gitignore
    print_check ".env in .gitignore"
    if grep -q "^\.env$" .gitignore 2>/dev/null; then
        print_pass
    else
        print_warning ".env should be in .gitignore to prevent committing secrets"
    fi
}

# Summary
print_summary() {
    print_header "Health Check Summary"
    
    echo "Total Checks:   $TOTAL_CHECKS"
    echo -e "Passed:         ${GREEN}$PASSED_CHECKS${NC}"
    echo -e "Failed:         ${RED}$FAILED_CHECKS${NC}"
    echo -e "Warnings:       ${YELLOW}$WARNING_CHECKS${NC}"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        if [ $WARNING_CHECKS -eq 0 ]; then
            echo -e "${GREEN}✓ All checks passed! Deployment is healthy.${NC}"
            exit 0
        else
            echo -e "${YELLOW}⚠ Deployment is functional but has warnings.${NC}"
            exit 0
        fi
    else
        echo -e "${RED}✗ Deployment has issues that need attention.${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Review failed checks above"
        echo "  2. Check logs: docker-compose logs -f"
        echo "  3. Verify environment configuration in .env"
        echo "  4. See DEPLOYMENT_GUIDE.md for troubleshooting"
        exit 1
    fi
}

# Main execution
main() {
    print_header "ConstructAI Deployment Health Check"
    
    print_info "Backend URL: $BACKEND_URL"
    print_info "Frontend URL: $FRONTEND_URL"
    print_info "Timeout: ${TIMEOUT}s"
    echo ""
    
    # Run all checks
    check_environment
    check_build
    check_docker_services
    check_database
    check_redis
    check_backend
    check_frontend
    check_security
    
    # Print summary
    print_summary
}

# Run main
main
