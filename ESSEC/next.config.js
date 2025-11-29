/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable SWC minification for faster builds and smaller bundles
  swcMinify: true,
  // Compress output
  compress: true,
  images: {
    domains: ['localhost'],
    // Disable optimization in development to avoid 400 errors for missing images
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Custom webpack config to handle image loading errors and HMR issues
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
      
      // Fix HMR removeChild error in development
      if (dev) {
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
        }
      }
    }
    return config
  },
  // Suppress CSS preload warnings (they're harmless but noisy)
  onDemandEntries: {
    // Period of time in ms to keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig

