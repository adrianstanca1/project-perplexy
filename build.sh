#!/bin/bash

# Build script for Code Interpreter Web Application

set -e

echo "🚀 Building Code Interpreter Application"
echo "========================================"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm@8
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build all packages
echo "🔨 Building packages..."
pnpm build

echo ""
echo "✅ Build complete!"
echo ""
echo "To start the development server, run:"
echo "  pnpm dev"
echo ""
echo "Or start services individually:"
echo "  pnpm dev:frontend  # Frontend only"
echo "  pnpm dev:backend   # Backend only"
echo ""
