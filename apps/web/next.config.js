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
  // 使用 export 模式生成靜態文件，避免 SSR 問題
  output: 'export',
  // 添加尾部斜杠以支持靜態托管
  trailingSlash: true,
  // 禁用圖片優化（export 模式需要）
  images: {
    unoptimized: true,
  },
  // 簡化構建 ID
  generateBuildId: () => 'build',
  // 禁用 X-Powered-By header
  poweredByHeader: false,
}

module.exports = nextConfig
