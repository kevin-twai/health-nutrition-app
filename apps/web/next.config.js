/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // 在構建時注入環境變數
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com',
  },
  // 公開環境變數給客戶端
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用圖片優化
  images: {
    unoptimized: true,
  },
  // 禁用 X-Powered-By header
  poweredByHeader: false,
}

module.exports = nextConfig
