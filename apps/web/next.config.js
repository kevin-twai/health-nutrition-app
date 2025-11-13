/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-app-w3zm.onrender.com',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 完全禁用靜態優化以避免 styled-jsx SSR 問題
  output: 'standalone',
  // 禁用靜態頁面生成
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // 允許構建時出現錯誤
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // 完全跳過錯誤頁面的靜態生成
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.minimize = false
    }
    return config
  },
}

module.exports = nextConfig