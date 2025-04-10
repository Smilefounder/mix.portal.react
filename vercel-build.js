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

// Pre-optimization: copy package.json and create a temporary version for build
const pkgPath = path.join(process.cwd(), 'package.json');
const tempPkgPath = path.join(process.cwd(), 'temp-package.json');

try {
  if (fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath);
    // Make a copy of the original package.json
    const originalPkg = { ...pkg };
    fs.writeFileSync(path.join(process.cwd(), 'original-package.json'), JSON.stringify(originalPkg, null, 2));
    
    // Create a minimal version for building
    // Keep only the essential dependencies
    console.log('Creating optimized package.json for build...');
    delete pkg.devDependencies;
    fs.writeFileSync(tempPkgPath, JSON.stringify(pkg, null, 2));
  }
} catch (error) {
  console.warn('Warning: Could not optimize package.json', error.message);
}

// Set environment variables for minimal memory usage
const buildEnv = {
  NEXT_TELEMETRY_DISABLED: '1',
  NODE_OPTIONS: `--max_old_space_size=${memoryLimit}`,
  NEXT_IGNORE_TYPE_CHECK: 'true',
  NEXT_RUNTIME: 'nodejs', // Use Node.js runtime
  NODE_ENV: 'production',
};

// Display build environment
console.log('Building with the following environment:');
Object.entries(buildEnv).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
  process.env[key] = value;
});

// Build in two phases to reduce peak memory usage
console.log('\nPhase 1: Initial build with minimal features...');

try {
  // Execute with --no-mangling to reduce memory usage
  execSync('npx next build --no-lint', { 
    stdio: 'inherit',
    env: { ...process.env, ...buildEnv }
  });
  
  console.log('\n✅ Build completed successfully!');
  
  // Restore original package.json
  try {
    if (fs.existsSync(path.join(process.cwd(), 'original-package.json'))) {
      fs.copyFileSync(
        path.join(process.cwd(), 'original-package.json'), 
        pkgPath
      );
      fs.unlinkSync(path.join(process.cwd(), 'original-package.json'));
      console.log('Restored original package.json');
    }
    
    if (fs.existsSync(tempPkgPath)) {
      fs.unlinkSync(tempPkgPath);
    }
  } catch (error) {
    console.warn('Warning: Could not restore package.json', error.message);
  }
} catch (error) {
  // Restore original package.json even if build fails
  try {
    if (fs.existsSync(path.join(process.cwd(), 'original-package.json'))) {
      fs.copyFileSync(
        path.join(process.cwd(), 'original-package.json'), 
        pkgPath
      );
      fs.unlinkSync(path.join(process.cwd(), 'original-package.json'));
    }
    
    if (fs.existsSync(tempPkgPath)) {
      fs.unlinkSync(tempPkgPath);
    }
  } catch (restoreError) {
    console.warn('Warning: Could not restore package.json', restoreError.message);
  }
  
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
} 