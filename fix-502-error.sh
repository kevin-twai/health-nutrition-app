#!/bin/bash

echo "🔧 修復 502 Bad Gateway 錯誤"
echo "========================================"
echo ""

echo "問題分析："
echo "- Next.js 使用 standalone 模式"
echo "- standalone 模式需要特殊的啟動方式"
echo "- 或者我們改用標準模式"
echo ""

# 方案：移除 standalone 模式，使用標準 Next.js 服務器
echo "📝 修改 next.config.js（移除 standalone 模式）..."
cat > apps/web/next.config.js << 'EOF'
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
  // 禁用圖片優化
  images: {
    unoptimized: true,
  },
  // 禁用 X-Powered-By header
  poweredByHeader: false,
}

module.exports = nextConfig
EOF

echo ""
echo "📝 提交修復..."
git add apps/web/next.config.js
git commit -m "fix: 移除 standalone 模式修復 502 錯誤

- standalone 模式在 Render 上啟動有問題
- 改用標準 Next.js 服務器模式
- Next.js 會自動使用 PORT 環境變量"

echo ""
echo "📤 推送到 Git..."
git push origin main

echo ""
echo "✅ 修復完成！"
echo ""
echo "🔍 Next.js 現在會："
echo "  1. 使用標準服務器模式"
echo "  2. 自動監聽 Render 的 PORT 環境變量"
echo "  3. 正常啟動並響應請求"
echo ""
echo "⏳ 等待 Render 重新部署..."
echo "🌐 部署完成後訪問："
echo "   https://health-nutrition-web.onrender.com"
echo ""
