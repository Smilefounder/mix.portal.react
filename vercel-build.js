#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('Starting low-memory Vercel build process...');

// Determine available memory
const totalMem = Math.floor(os.totalmem() / (1024 * 1024)); // in MB
console.log(`System total memory: ${totalMem}MB`);

// Set memory limit just under Vercel's limit
const memoryLimit = Math.min(totalMem - 100, 950); // Leave 100MB overhead, max 950MB
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

// Create .babelrc to ensure minimal transpilation
const babelConfig = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          targets: {
            browsers: ['defaults']
          },
          useBuiltIns: false,
          loose: true,
        }
      }
    ]
  ]
};

try {
  fs.writeFileSync('.babelrc', JSON.stringify(babelConfig, null, 2));
  console.log('Created optimized .babelrc');
} catch (error) {
  console.warn('Warning: Could not create .babelrc', error.message);
}

// Run the builds in sequence with extremely low memory settings
console.log('Starting incremental build process...');

// Define build phases - break down into smaller chunks
const buildPhases = [
  // Phase 1: Build only non-dynamic routes with minimal features
  {
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_OPTIONS: `--max_old_space_size=${memoryLimit}`,
      NEXT_MINIMAL_BUILD: '1',
      NEXT_IGNORE_TYPE_CHECK: 'true',
      ANALYZE: 'false'
    },
    command: 'npx next build --no-lint'
  }
];

// Execute each phase
for (const [index, phase] of buildPhases.entries()) {
  console.log(`\n[Phase ${index + 1}/${buildPhases.length}] Running build...`);
  
  try {
    // Set environment variables for this phase
    Object.entries(phase.env).forEach(([key, value]) => {
      process.env[key] = value;
    });
    
    // Execute the command
    execSync(phase.command, { 
      stdio: 'inherit',
      env: { ...process.env, ...phase.env }
    });
    
    console.log(`[Phase ${index + 1}] Completed successfully!`);
  } catch (error) {
    console.error(`[Phase ${index + 1}] Build failed:`, error.message);
    if (index === buildPhases.length - 1) {
      // If the last phase fails, exit with error
      process.exit(1);
    } else {
      // Otherwise continue to the next phase
      console.log('Continuing to next phase...');
    }
  }
}

// Clean up .babelrc
try {
  if (fs.existsSync('.babelrc')) {
    fs.unlinkSync('.babelrc');
    console.log('Removed temporary .babelrc');
  }
} catch (error) {
  console.warn('Warning: Could not remove .babelrc', error.message);
}

console.log('\n✅ Vercel-optimized build completed successfully!'); 