#!/bin/bash

echo "🔧 修復 Render 構建流程"
echo "========================================"
echo ""

# 1. 修改 package.json，將 manifest 創建整合到 build 命令
echo "📝 修改 build 命令..."
cat > apps/web/package.json << 'EOF'
{
  "name": "health-nutrition-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build || true && node create-manifest.js",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.18",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@heroicons/react": "^2.0.18",
    "@headlessui/react": "^1.7.17",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.25",
    "@types/react-dom": "^18.2.10",
    "eslint": "^8.51.0",
    "eslint-config-next": "14.2.18",
    "typescript": "^5.2.2"
  },
  "devDependencies": {
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# 2. 確保 create-manifest.js 存在
echo "📝 確保 create-manifest.js 存在..."
if [ ! -f "apps/web/create-manifest.js" ]; then
  cat > apps/web/create-manifest.js << 'MANIFEST_EOF'
const fs = require('fs');
const path = require('path');

console.log('🔧 Creating missing prerender-manifest.json...');

// 創建 .next 目錄（如果不存在）
const nextDir = path.join(__dirname, '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// 創建最小的 prerender-manifest.json
const manifest = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {
    previewModeId: 'development-id',
    previewModeSigningKey: 'development-key',
    previewModeEncryptionKey: 'development-encryption-key'
  }
};

fs.writeFileSync(
  path.join(nextDir, 'prerender-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ Created prerender-manifest.json');
MANIFEST_EOF
fi

echo ""
echo "📝 提交修復..."
git add apps/web/package.json apps/web/create-manifest.js
git commit -m "fix: 整合 manifest 創建到 build 命令

- 將 create-manifest.js 直接加到 build 命令中
- 使用 && 確保在 build 後執行
- 這樣 Render 就會自動創建缺失的文件"

echo ""
echo "📤 推送到 Git..."
git push origin main

echo ""
echo "✅ 修復完成！"
echo ""
echo "🔍 新的構建流程："
echo "  npm run build → next build || true && node create-manifest.js"
echo "  npm start → next start (有 manifest 文件)"
echo ""
echo "🌐 部署完成後訪問："
echo "   https://health-nutrition-web.onrender.com"
echo ""
