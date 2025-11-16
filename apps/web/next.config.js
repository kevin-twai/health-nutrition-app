/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 使用 standalone 模式（需要 Node.js 服務器，但避免 styled-jsx 問題）
  output: 'standalone',
  // 禁用圖片優化
  images: {
    unoptimized: true,
  },
  // 禁用 X-Powered-By header
  poweredByHeader: false,
}

module.exports = nextConfig
