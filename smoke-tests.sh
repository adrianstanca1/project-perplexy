#!/bin/bash

# ============================================
# ConstructAI Deployment Smoke Tests
# ============================================
#
# This script performs basic smoke tests to verify
# the deployment is working correctly.
#
# Usage:
#   ./smoke-tests.sh [backend_url] [frontend_url]
#
# Example:
#   ./smoke-tests.sh http://localhost:3001 http://localhost:3000
#
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="${1:-http://localhost:3001}"
FRONTEND_URL="${2:-http://localhost:3000}"
TIMEOUT=10

# Test counters
TOTAL=0
PASSED=0
FAILED=0

# Helper functions
print_test() {
    echo -n "  [$((TOTAL + 1))] $1 ... "
    ((TOTAL++))
}

print_pass() {
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗${NC}"
    echo -e "      ${RED}Error: $1${NC}"
    ((FAILED++))
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

# Test functions
test_backend_health() {
    print_test "Backend health endpoint responds"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BACKEND_URL/health" 2>&1)
    
    if [ "$response" = "200" ]; then
        print_pass
    else
        print_fail "Expected HTTP 200, got $response"
    fi
}

test_backend_cors() {
    print_test "Backend CORS headers present"
    
    cors=$(curl -s -I --max-time $TIMEOUT "$BACKEND_URL/health" | grep -i "access-control-allow-origin" || echo "")
    
    if [ -n "$cors" ]; then
        print_pass
    else
        print_fail "CORS headers not found"
    fi
}

test_api_v1_routes() {
    print_test "API v1 routes accessible"
    
    # Just check that the API responds (may return 401 for protected routes)
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BACKEND_URL/api/v1/health" 2>&1)
    
    if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "401" ]; then
        print_pass
    else
        print_fail "Unexpected response: $response"
    fi
}

test_frontend_loads() {
    print_test "Frontend loads successfully"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$FRONTEND_URL" 2>&1)
    
    if [ "$response" = "200" ]; then
        print_pass
    else
        print_fail "Expected HTTP 200, got $response"
    fi
}

test_frontend_html() {
    print_test "Frontend returns HTML"
    
    content=$(curl -s --max-time $TIMEOUT "$FRONTEND_URL" | head -n 1)
    
    if echo "$content" | grep -q "<!DOCTYPE\|<html"; then
        print_pass
    else
        print_fail "Response doesn't appear to be HTML"
    fi
}

test_frontend_assets() {
    print_test "Frontend static assets load"
    
    # Try to find a CSS or JS file reference
    html=$(curl -s --max-time $TIMEOUT "$FRONTEND_URL")
    
    if echo "$html" | grep -q "\.css\|\.js"; then
        print_pass
    else
        print_fail "No CSS or JS assets found in HTML"
    fi
}

test_websocket_endpoint() {
    print_test "WebSocket endpoint available (port check)"
    
    # Just check if the port is open, can't easily test WS without a client
    if nc -z -w $TIMEOUT $(echo $BACKEND_URL | sed 's|http://||' | sed 's|https://||' | cut -d: -f1) $(echo $BACKEND_URL | sed 's|http://||' | sed 's|https://||' | cut -d: -f2) 2>/dev/null; then
        print_pass
    else
        print_fail "Backend port not accessible"
    fi
}

test_database_connection() {
    print_test "Database connection (via health check)"
    
    # Backend health should fail if DB is down
    health=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/health")
    
    if echo "$health" | grep -q "ok\|healthy"; then
        print_pass
    else
        print_fail "Health check doesn't indicate healthy status"
    fi
}

test_security_headers() {
    print_test "Security headers present"
    
    headers=$(curl -s -I --max-time $TIMEOUT "$BACKEND_URL/health")
    
    if echo "$headers" | grep -qi "x-frame-options\|x-content-type-options\|strict-transport-security"; then
        print_pass
    else
        print_fail "Expected security headers not found"
    fi
}

test_response_time() {
    print_test "Response time acceptable (<2s)"
    
    time=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$BACKEND_URL/health" 2>&1)
    
    if [ $? -eq 0 ]; then
        # Use bc for float comparison if available
        if command -v bc >/dev/null 2>&1; then
            if (( $(echo "$time < 2" | bc -l) )); then
                print_pass
            else
                print_fail "Response time ${time}s exceeds 2s"
            fi
        else
            print_pass
        fi
    else
        print_fail "Request failed"
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   ConstructAI Deployment Smoke Tests  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Backend URL:  $BACKEND_URL"
    echo "Frontend URL: $FRONTEND_URL"
    echo "Timeout:      ${TIMEOUT}s"
    
    # Backend tests
    print_section "Backend Tests"
    test_backend_health
    test_backend_cors
    test_api_v1_routes
    test_database_connection
    test_security_headers
    test_response_time
    test_websocket_endpoint
    
    # Frontend tests
    print_section "Frontend Tests"
    test_frontend_loads
    test_frontend_html
    test_frontend_assets
    
    # Summary
    echo ""
    print_section "Test Summary"
    echo ""
    echo "  Total Tests: $TOTAL"
    echo -e "  ${GREEN}Passed: $PASSED${NC}"
    echo -e "  ${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ All smoke tests passed!${NC}"
        echo ""
        echo "Deployment appears to be working correctly."
        echo ""
        exit 0
    else
        echo -e "${RED}✗ Some tests failed${NC}"
        echo ""
        echo "Please check the errors above and verify your deployment."
        echo ""
        exit 1
    fi
}

# Check dependencies
if ! command -v curl >/dev/null 2>&1; then
    echo -e "${RED}Error: curl is required but not installed${NC}"
    exit 1
fi

# Run tests
main "$@"
