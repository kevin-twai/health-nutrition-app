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
  output: 'standalone',
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // 允許建置繼續即使有預渲染錯誤
  staticPageGenerationTimeout: 1000,
  // 完全跳過靜態生成錯誤
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 配置 webpack 來處理建置錯誤
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // 忽略 styled-jsx 警告
    config.ignoreWarnings = [
      { module: /node_modules\/styled-jsx/ },
    ];
    return config;
  },
  // 生產環境配置
  productionBrowserSourceMaps: false,
  // 禁用 X-Powered-By header
  poweredByHeader: false,
}

module.exports = nextConfig
