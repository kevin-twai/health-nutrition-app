/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 禁用嚴格模式以避免 SSR 問題
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
  // 完全禁用靜態優化
  generateBuildId: async () => {
    return 'build-id'
  },
  // 禁用靜態錯誤頁面生成
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig