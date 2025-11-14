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
  // Disable static optimization completely
  staticPageGenerationTimeout: 0,
  // Custom webpack config to handle styled-jsx
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals = config.externals || []
    }
    // Ignore styled-jsx errors during build
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_IGNORE_PRERENDER_ERROR': JSON.stringify('true'),
      })
    )
    return config
  },
}

module.exports = nextConfig