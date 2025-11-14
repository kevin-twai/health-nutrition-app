/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-app-w3zm.onrender.com',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  generateBuildId: async () => {
    return 'build-id'
  },
  // Completely disable static error page generation
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent styled-jsx SSR issues
      config.externals = config.externals || []
    }
    return config
  },
  // Skip error page prerendering
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig