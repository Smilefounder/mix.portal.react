#!/bin/bash

# Exit on error
set -e

echo "Starting optimized build process..."

# Clean up previous build artifacts
echo "Cleaning up previous build..."
rm -rf .next
rm -rf node_modules/.cache

# Environment setup
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=8192"
export NEXT_IGNORE_TYPE_CHECK=true

# Step 1: Build with reduced features first
echo "Building with minimal configuration..."
NODE_ENV=production npx next build --no-lint

echo "Build completed successfully!"

# To run the production build
echo "To start the server, run: npm start" 