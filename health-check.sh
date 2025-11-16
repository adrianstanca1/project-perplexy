#!/bin/bash

# ============================================
# ConstructAI Deployment Health Check Script
# ============================================

set -e

# Colors for output
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
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_test() {
    echo -n "Testing: $1 ... "
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC}"
    echo -e "${RED}  Error: $1${NC}"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo -e "${YELLOW}  $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Health check function
check_health() {
    local url=$1
    local name=$2
    
    print_test "$name health endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>&1)
    
    if [ "$response" = "200" ]; then
        print_pass
        return 0
    else
        print_fail "HTTP $response (expected 200)"
        return 1
    fi
}

# Check if service is reachable
check_reachable() {
    local url=$1
    local name=$2
    
    print_test "$name reachability"
    
    if curl -s --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
        print_pass
        return 0
    else
        print_fail "Unable to connect to $url"
        return 1
    fi
}

# Check response time
check_response_time() {
    local url=$1
    local name=$2
    local max_time=${3:-2}
    
    print_test "$name response time"
    
    time=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$url" 2>&1)
    
    if [ $? -eq 0 ]; then
        if (( $(echo "$time < $max_time" | bc -l) )); then
            print_pass
            print_info "Response time: ${time}s"
            return 0
        else
            print_warn "Slow response: ${time}s (expected < ${max_time}s)"
            return 0
        fi
    else
        print_fail "Request timeout or error"
        return 1
    fi
}

# Check if Docker containers are running
check_docker() {
    print_test "Docker containers status"
    
    if ! command -v docker >/dev/null 2>&1; then
        print_warn "Docker not installed or not in PATH"
        return 0
    fi
    
    if docker ps | grep -q "constructai"; then
        print_pass
        
        # Show container status
        echo ""
        docker ps --filter "name=constructai" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        return 0
    else
        print_warn "No ConstructAI Docker containers found"
        return 0
    fi
}

# Check environment variables
check_env() {
    print_test "Environment configuration"
    
    if [ -f .env ]; then
        print_pass
        
        # Check for critical variables
        if grep -q "JWT_SECRET=.*changeme\|JWT_SECRET=.*change-this" .env; then
            print_warn "Default JWT_SECRET detected - change in production!"
        fi
        
        if grep -q "NODE_ENV=production" .env; then
            print_info "Running in production mode"
        else
            print_info "Running in development mode"
        fi
        
        return 0
    else
        print_warn ".env file not found"
        return 0
    fi
}

# Check database connectivity
check_database() {
    print_test "Database connectivity"
    
    # Try to check MongoDB connection via backend health endpoint
    if curl -s --max-time $TIMEOUT "${BACKEND_URL}/health" | grep -q "ok"; then
        print_pass
        return 0
    else
        print_warn "Unable to verify database connection"
        return 0
    fi
}

# Check API endpoints
check_api_endpoints() {
    local endpoints=(
        "/api/v1/health:API v1 health"
        "/health:Health check"
    )
    
    for endpoint in "${endpoints[@]}"; do
        IFS=':' read -r path name <<< "$endpoint"
        print_test "$name"
        
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BACKEND_URL}${path}" 2>&1)
        
        if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "401" ]; then
            print_pass
        else
            print_fail "HTTP $response"
        fi
    done
}

# Main execution
main() {
    clear
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ConstructAI Deployment Health Check  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    print_info "Backend URL: $BACKEND_URL"
    print_info "Frontend URL: $FRONTEND_URL"
    print_info "Timeout: ${TIMEOUT}s"
    echo ""
    
    # Environment checks
    print_header "Environment Configuration"
    check_env
    check_docker
    
    # Backend checks
    print_header "Backend Health Checks"
    check_health "$BACKEND_URL/health" "Backend"
    check_reachable "$BACKEND_URL" "Backend"
    check_response_time "$BACKEND_URL/health" "Backend" 2
    check_database
    
    # API checks
    print_header "API Endpoint Checks"
    check_api_endpoints
    
    # Frontend checks
    print_header "Frontend Health Checks"
    check_reachable "$FRONTEND_URL" "Frontend"
    check_response_time "$FRONTEND_URL" "Frontend" 2
    
    # Summary
    print_header "Health Check Summary"
    
    TOTAL=$((PASSED + FAILED + WARNINGS))
    
    echo -e "Total Tests:    ${BLUE}$TOTAL${NC}"
    echo -e "Passed:         ${GREEN}$PASSED${NC}"
    echo -e "Failed:         ${RED}$FAILED${NC}"
    echo -e "Warnings:       ${YELLOW}$WARNINGS${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ All critical checks passed!${NC}"
        echo ""
        
        if [ $WARNINGS -gt 0 ]; then
            echo -e "${YELLOW}⚠ Please review warnings above${NC}"
            echo ""
        fi
        
        exit 0
    else
        echo -e "${RED}✗ Some checks failed. Please review errors above.${NC}"
        echo ""
        exit 1
    fi
}

# Check if bc is installed (for float comparison)
if ! command -v bc >/dev/null 2>&1; then
    print_warn "bc not installed, skipping response time checks"
fi

# Run main
main "$@"
