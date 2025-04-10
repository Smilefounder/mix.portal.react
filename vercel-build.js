#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting low-memory Vercel build process...');

// Set memory limit for Vercel free tier
const memoryLimit = 950; // Just under 1GB for Vercel free tier
console.log(`Setting Node.js memory limit to ${memoryLimit}MB`);

// Clean up previous build artifacts
try {
  console.log('Cleaning previous build artifacts...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next');
  }
  if (fs.existsSync('node_modules/.cache')) {
    execSync('rm -rf node_modules/.cache');
  }
} catch (error) {
  console.warn('Warning: Could not clean up all artifacts', error.message);
}

// Don't create custom .babelrc for Next.js 15
// Instead, set environment variables for minimal build

// Set environment variables for minimal memory usage
const buildEnv = {
  NEXT_TELEMETRY_DISABLED: '1',
  NODE_OPTIONS: `--max_old_space_size=${memoryLimit}`,
  NEXT_IGNORE_TYPE_CHECK: 'true',
  NEXT_MINIMAL_BUILD: '1', // Minimize extra features
};

// Display build environment
console.log('Building with the following environment:');
Object.entries(buildEnv).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
  process.env[key] = value;
});

console.log('\nStarting Next.js build...');

try {
  // Execute simple build command without extra configs or plugins
  execSync('npx next build --no-lint', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      ...buildEnv
    }
  });
  
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} 