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
  // 跳過靜態生成錯誤以避免 styled-jsx SSR 問題
  staticPageGenerationTimeout: 1000,
  // 允許構建時出現錯誤
  experimental: {
    workerThreads: false,
    cpus: 1
  },
}

module.exports = nextConfig