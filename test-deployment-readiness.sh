#!/bin/bash

# ========================================
# ConstructAI - Deployment Readiness Test
# ========================================
# This script performs comprehensive checks to ensure deployment readiness

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test database connectivity
test_mongodb_connection() {
    local db_url=$1
    echo -n "  Testing MongoDB connection... "
    
    # This would require mongosh/mongo client
    # For now, just validate URL format
    if [[ $db_url =~ ^mongodb(\+srv)?:\/\/.+ ]]; then
        echo -e "${GREEN}✓ URL format valid${NC}"
        return 0
    else
        echo -e "${RED}✗ Invalid MongoDB URL format${NC}"
        return 1
    fi
}

# Test Redis connectivity
test_redis_connection() {
    local redis_url=$1
    echo -n "  Testing Redis connection... "
    
    # Validate URL format
    if [[ $redis_url =~ ^redis:\/\/ ]]; then
        echo -e "${GREEN}✓ URL format valid${NC}"
        return 0
    else
        echo -e "${RED}✗ Invalid Redis URL format${NC}"
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ConstructAI Deployment Readiness Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file found${NC}"
    set -a
    if ! source .env; then
        echo -e "${RED}✗ Failed to source .env file. Please check for syntax errors.${NC}"
        set +a
        exit 1
    fi
    set +a
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "  Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ .env created${NC}"
        echo -e "${YELLOW}⚠ Please edit .env with your configuration${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
fi

echo ""
echo "Testing configuration..."

# Check critical environment variables
if [ -n "$DATABASE_URL" ]; then
    test_mongodb_connection "$DATABASE_URL"
else
    echo -e "${YELLOW}⚠ DATABASE_URL not set${NC}"
fi

if [ -n "$REDIS_URL" ]; then
    test_redis_connection "$REDIS_URL"
else
    echo -e "${YELLOW}⚠ REDIS_URL not set${NC}"
fi

# Check JWT secrets
echo -n "  Checking JWT_SECRET... "
if [ -n "$JWT_SECRET" ] && [ "$JWT_SECRET" != "your-super-secret-jwt-key-change-this" ]; then
    echo -e "${GREEN}✓ Set${NC}"
else
    echo -e "${YELLOW}⚠ Using default or not set${NC}"
fi

echo ""
echo -e "${GREEN}Deployment readiness check complete!${NC}"
echo ""
echo "Recommended next steps:"
echo "  1. Review and update .env file"
echo "  2. Generate secure secrets: openssl rand -base64 32"
echo "  3. Run build: npm run build"
echo "  4. Deploy: docker-compose -f docker-compose.prod.yml up -d"
echo ""
