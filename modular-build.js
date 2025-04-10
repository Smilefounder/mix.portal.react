#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMP_CONFIG_PATH = path.join(__dirname, 'temp-next.config.js');
const ORIGINAL_CONFIG_PATH = path.join(__dirname, 'next.config.js');

// Read the original config
const originalConfig = fs.readFileSync(ORIGINAL_CONFIG_PATH, 'utf8');

// Define paths to exclude from initial build
const EXCLUSION_PATTERNS = [
  // Add specific high-memory routes that should be built separately
  '/dashboard/analytics',
  '/dashboard/mixdb',
  // Add more paths as needed
];

// Create a temporary config that excludes specific routes
function createTemporaryConfig(excludePaths) {
  const modifiedConfig = originalConfig.replace(
    'module.exports = nextConfig;',
    `
// Modified by modular build script
nextConfig.experimental = {
  ...nextConfig.experimental,
  // Exclude routes from initial build
  excludeRoutes: ${JSON.stringify(excludePaths)},
};

module.exports = nextConfig;
    `
  );

  fs.writeFileSync(TEMP_CONFIG_PATH, modifiedConfig, 'utf8');
  console.log('Created temporary config with route exclusions');
}

// Restore original config
function restoreOriginalConfig() {
  if (fs.existsSync(TEMP_CONFIG_PATH)) {
    fs.unlinkSync(TEMP_CONFIG_PATH);
    console.log('Restored original config');
  }
}

// Execute command and return promise
function execPromise(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.error(`stderr: ${stderr}`);
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Clean up function for unexpected exits
function cleanup() {
  restoreOriginalConfig();
  console.log('Cleanup completed');
}

// Main build function
async function runModularBuild() {
  try {
    // Set up cleanup for unexpected exits
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', (e) => {
      console.error('Uncaught exception:', e);
      cleanup();
      process.exit(1);
    });

    // Clean up previous build artifacts
    console.log('Cleaning up previous build...');
    await execPromise('rm -rf .next');
    await execPromise('rm -rf node_modules/.cache');

    // Step 1: Build core app excluding heavy routes
    console.log('Building core application (excluding heavy routes)...');
    createTemporaryConfig(EXCLUSION_PATTERNS);
    
    // Use the temporary config for the initial build
    const tempConfigParam = `--config ${TEMP_CONFIG_PATH}`;
    try {
      await execPromise(`NODE_OPTIONS="--max-old-space-size=6144" NEXT_TELEMETRY_DISABLED=1 npx next build ${tempConfigParam} --no-lint`);
    } catch (e) {
      console.error('Error during core build, but continuing with remaining steps:', e);
    }

    // Step 2: Restore original config and build excluded routes
    restoreOriginalConfig();
    console.log('Building remaining routes...');
    await execPromise('NODE_OPTIONS="--max-old-space-size=8192" NEXT_TELEMETRY_DISABLED=1 npx next build --no-lint');

    console.log('Modular build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    cleanup();
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Run the build
runModularBuild(); 