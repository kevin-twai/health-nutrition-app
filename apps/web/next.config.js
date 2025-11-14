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
  // 使用 standalone 輸出模式
  output: 'standalone',
  // 減少構建時的記憶體使用
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // 完全禁用靜態優化和錯誤頁面生成
  generateBuildId: async () => {
    return 'build-id'
  },
  // 跳過錯誤頁面的靜態生成
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // 禁用靜態錯誤頁面
  generateEtags: false,
}

module.exports = nextConfig