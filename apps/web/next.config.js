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
  // 禁用 styled-jsx 編譯器以避免 SSR 錯誤
  compiler: {
    styledComponents: false,
    emotion: false,
    removeConsole: false,
  },
  // 配置 webpack 來完全跳過 styled-jsx
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-jsx/style': false,
      'styled-jsx': false,
    }
    return config
  },
}

module.exports = nextConfig
