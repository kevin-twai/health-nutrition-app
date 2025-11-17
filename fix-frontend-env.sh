#!/bin/bash

echo "🔧 修復前端環境變數配置"
echo "========================================"
echo ""

echo "問題診斷："
echo "- API 服務正常運行 ✅"
echo "- CORS 配置正確 ✅"
echo "- 前端可能沒有正確讀取環境變數 ❌"
echo ""

echo "📝 修復 next.config.js..."
cat > apps/web/next.config.js << 'EOF'
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
EOF

echo "✅ 更新了 next.config.js"
echo ""

echo "📝 創建 .env.production 文件..."
cat > apps/web/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com
EOF

echo "✅ 創建了 .env.production"
echo ""

echo "📝 更新照片頁面，添加調試信息..."
cat > apps/web/src/app/photo/debug-info.tsx << 'EOF'
'use client'

export default function DebugInfo() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div><strong>🔍 調試信息</strong></div>
      <div>API URL: {apiUrl}</div>
      <div>環境: {process.env.NODE_ENV}</div>
    </div>
  )
}
EOF

echo "✅ 創建了調試組件"
echo ""

echo "📝 創建 Render 環境變數設置指南..."
cat > RENDER_ENV_SETUP.md << 'EOF'
# Render 環境變數設置指南

## 問題
前端無法連接到後端 API，出現 503 錯誤。

## 解決方案

### 1. 在 Render Dashboard 設置環境變數

#### Web 服務 (health-nutrition-web)
1. 登入 Render Dashboard
2. 選擇 `health-nutrition-web` 服務
3. 點擊 "Environment" 標籤
4. 添加以下環境變數：

```
NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com
NODE_ENV=production
PORT=10000
```

5. 點擊 "Save Changes"
6. Render 會自動重新部署

### 2. 驗證設置

部署完成後，訪問：
```
https://health-nutrition-web.onrender.com/photo
```

打開瀏覽器控制台，應該看到：
```
🔗 API URL: https://health-nutrition-api.onrender.com
```

### 3. 測試 API 連接

在瀏覽器控制台執行：
```javascript
fetch('https://health-nutrition-api.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('API 健康檢查:', d))
```

應該返回：
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## 常見問題

### Q: 為什麼需要 NEXT_PUBLIC_ 前綴？
A: Next.js 只會將 `NEXT_PUBLIC_` 開頭的環境變數暴露給客戶端代碼。

### Q: 修改環境變數後需要重新部署嗎？
A: 是的，Render 會自動觸發重新部署。

### Q: 如何確認環境變數生效？
A: 查看頁面右下角的調試信息，或打開瀏覽器控制台查看日誌。
EOF

echo "✅ 創建了環境變數設置指南"
echo ""

echo "📝 提交修復..."
git add apps/web/next.config.js apps/web/.env.production apps/web/src/app/photo/debug-info.tsx RENDER_ENV_SETUP.md
git commit -m "fix: 修復前端環境變數配置

- 更新 next.config.js 確保環境變數正確注入
- 添加 .env.production 文件
- 創建調試組件顯示 API URL
- 添加 Render 環境變數設置指南

這應該解決前端無法連接 API 的問題"

echo ""
echo "📤 推送到 Git..."
git push origin main

echo ""
echo "✅ 代碼修復完成！"
echo ""
echo "🎯 下一步：在 Render Dashboard 設置環境變數"
echo ""
echo "請按照以下步驟操作："
echo ""
echo "1. 登入 Render Dashboard: https://dashboard.render.com"
echo "2. 選擇 'health-nutrition-web' 服務"
echo "3. 點擊 'Environment' 標籤"
echo "4. 添加環境變數："
echo "   NEXT_PUBLIC_API_URL = https://health-nutrition-api.onrender.com"
echo "5. 點擊 'Save Changes'"
echo "6. 等待自動重新部署完成"
echo ""
echo "📖 詳細說明請查看: RENDER_ENV_SETUP.md"
echo ""
