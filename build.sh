#!/bin/bash

# Exit on error
set -e

echo "Starting optimized build process..."

# Clean up previous build artifacts
echo "Cleaning up previous build..."
rm -rf .next
rm -rf node_modules/.cache

# Set up swap file if on Linux (comment this out if on macOS)
# if [[ $(uname) == "Linux" ]]; then
#   echo "Setting up temporary swap space..."
#   sudo fallocate -l 4G /swapfile
#   sudo chmod 600 /swapfile
#   sudo mkswap /swapfile
#   sudo swapon /swapfile
#   echo "Swap space added"
# fi

# Environment setup
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=8192"
export NEXT_IGNORE_TYPE_CHECK=true

# Step 1: First clean the cache and prune dependencies
echo "Cleaning pnpm cache..."
pnpm store prune

# Step 2: Initialize the build with no analysis
echo "Initializing build..."
ANALYZE=false npx next build --no-lint || true

# Step 3: Perform the final build with optimizations
echo "Performing final build with optimizations..."
NODE_ENV=production npx next build --no-lint

# Clean up swap if on Linux
# if [[ $(uname) == "Linux" ]]; then
#   echo "Removing temporary swap space..."
#   sudo swapoff /swapfile
#   sudo rm /swapfile
# fi

echo "Build completed successfully!"

# To run the production build
echo "To start the server, run: pnpm start" 