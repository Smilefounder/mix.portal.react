/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  // Disable TypeScript checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize memory usage
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Minimize bundle size
  productionBrowserSourceMaps: false,
  memoryLimit: 1024, // in MB - set to 1GB for Vercel free tier
  poweredByHeader: false,
  images: {
    // Optimize image handling
    minimumCacheTTL: 60,
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: ''
      }
    ]
  },
  async headers() {
    return [
      {
        // Allow CORS for all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          }
        ]
      }
    ];
  },
  experimental: {
    // This setting is no longer needed in Next.js 15+ as App Router is now the default
  },
  transpilePackages: ['geist'],
  // Add these settings to help with build issues
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false
      };
    }
    
    // Disable source maps in production to reduce memory usage
    if (!dev) {
      config.devtool = false;
      
      // Optimize chunk size
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // Use lowest memory settings for Vercel
        minimizer: [
          '...',
          new (require('css-minimizer-webpack-plugin'))({
            minimizerOptions: {
              preset: ['default', { discardComments: { removeAll: true } }],
            },
          }),
        ],
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 10, // Reduced from 25
          maxAsyncRequests: 10,   // Added to limit concurrent requests
          minSize: 50000,         // Increased to reduce number of small chunks
          maxSize: 150000,        // Reduced chunk size for Vercel
          cacheGroups: {
            // Single vendor chunk to reduce memory usage
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 10
            },
            common: {
              test: /[\\/](components|lib)[\\/]/,
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        },
        runtimeChunk: 'single'
      };
      
      // Aggressive tree shaking for smaller bundle
      config.optimization.usedExports = true;
      
      // For small builds, lower watch options polling
      config.watchOptions = {
        ...config.watchOptions,
        poll: false,
      };
      
      // Limit parallel operations
      config.parallelism = 1;
    }
    
    return config;
  },
  // Enable React strict mode for development
  reactStrictMode: true,
  
  // Add trailing slashes to URLs
  trailingSlash: false,
  
  // Custom rewrites to handle route groups
 
};

module.exports = nextConfig;
