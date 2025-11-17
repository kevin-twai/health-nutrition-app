# Render 前端部署修復 - Export 模式

## 🔍 問題分析

### 錯誤日誌顯示的問題：

1. **無效的 next.config.js 配置**
   ```
   ⚠ Invalid next.config.js options detected:
   ⚠     Unrecognized key(s) in object: 'onError'
   ```

2. **styled-jsx SSR 錯誤**
   ```
   TypeError: Cannot read properties of null (reading 'useContext')
   at StyleRegistry (/opt/render/project/src/node_modules/styled-jsx/dist/index/index.js:450:30)
   ```

3. **構建失敗但顯示成功**
   ```
   Error occurred prerendering page "/404"
   Error occurred prerendering page "/500"
   npm error code 1
   ```

4. **缺少 prerender-manifest.json**
   ```
   Error: ENOENT: no such file or directory, open '.next/prerender-manifest.json'
   ```

## ✅ 解決方案

### 使用 Next.js Export 模式

將 Next.js 配置改為 `output: 'export'`，這樣可以：

- ✓ 生成純靜態文件（HTML/CSS/JS）
- ✓ 完全避免 SSR 相關問題
- ✓ 不需要 Node.js 服務器
- ✓ 繞過 styled-jsx 的 SSR 錯誤
- ✓ 簡化部署流程

## 🔧 修復步驟

### 1. 執行修復腳本

```bash
./fix-render-export-mode.sh
```

這會：
- 提交新的 next.config.js 配置
- 推送到 Git 倉庫

### 2. 更新 Render Dashboard 設置

進入 Render Dashboard > health-nutrition-web 服務：

#### Build Command
```bash
apps/web/ $ npm install && npm run build
```

#### Publish Directory
```
apps/web/out
```

#### 環境變量（保持不變）
```
NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com
```

### 3. 觸發部署

點擊 "Manual Deploy" > "Deploy latest commit"

## 📝 新的 next.config.js 配置

```javascript
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
```

## 🎯 關鍵變更

### 移除的配置
- ❌ `output: 'standalone'` - 需要 Node.js 服務器
- ❌ `onError` - 無效的配置選項
- ❌ `experimental.workerThreads` - 不需要
- ❌ `experimental.cpus` - 不需要
- ❌ `staticPageGenerationTimeout` - export 模式不需要
- ❌ `onDemandEntries` - 只用於開發模式
- ❌ `webpack` 自定義配置 - 簡化配置

### 新增的配置
- ✅ `output: 'export'` - 生成靜態文件
- ✅ `trailingSlash: true` - 支持靜態托管
- ✅ `images.unoptimized: true` - export 模式必需
- ✅ `generateBuildId` - 簡化構建 ID

## 🔄 部署流程

```
本地修復 → Git Push → Render 自動構建 → 靜態文件部署
```

### 構建輸出
```
apps/web/out/
├── index.html
├── auth.html
├── dashboard.html
├── photo.html
├── chat.html
├── reports.html
├── gamification.html
├── profile.html
├── _next/
│   ├── static/
│   └── ...
└── ...
```

## 🌐 部署後驗證

### 1. 檢查部署狀態
訪問：https://health-nutrition-web.onrender.com

### 2. 檢查頁面
- `/` - 首頁
- `/auth` - 登入頁
- `/dashboard` - 儀表板
- `/photo` - 拍照識別
- `/chat` - AI 對話
- `/reports` - 報告
- `/gamification` - 遊戲化
- `/profile` - 個人資料

### 3. 檢查 API 連接
打開瀏覽器控制台，確認：
- API URL 正確指向 `https://health-nutrition-api.onrender.com`
- 沒有 CORS 錯誤
- API 請求正常

## 💡 為什麼 Export 模式可以解決問題

### 1. 避免 SSR 錯誤
- Export 模式在構建時生成所有頁面
- 不在運行時進行服務器端渲染
- styled-jsx 的 `useContext` 錯誤不會發生

### 2. 簡化部署
- 不需要 Node.js 服務器
- 只需要靜態文件服務
- Render 的 Static Site 服務更穩定

### 3. 提高性能
- 所有頁面都是預生成的 HTML
- 更快的首次加載
- 更好的 SEO

### 4. 降低成本
- 靜態托管比 Node.js 服務器便宜
- 更少的資源消耗

## ⚠️ Export 模式的限制

### 不支持的功能
- ❌ API Routes（需要後端服務器）
- ❌ Server-Side Rendering (SSR)
- ❌ Incremental Static Regeneration (ISR)
- ❌ Image Optimization（需要設置 `unoptimized: true`）

### 我們的應用
- ✅ 所有 API 都在獨立的後端服務（health-nutrition-api）
- ✅ 前端只是靜態頁面 + 客戶端 JavaScript
- ✅ 完全適合 export 模式

## 🎉 預期結果

部署成功後，你應該看到：

```
==> Build successful 🎉
==> Deploying...
==> Your service is live 🎉
    https://health-nutrition-web.onrender.com
```

沒有任何錯誤！

## 🆘 如果還有問題

### 檢查構建日誌
確認沒有以下錯誤：
- ❌ `Invalid next.config.js options`
- ❌ `TypeError: Cannot read properties of null`
- ❌ `Error occurred prerendering page`
- ❌ `ENOENT: no such file or directory`

### 檢查 Publish Directory
確認設置為：`apps/web/out`

### 檢查構建輸出
確認 `apps/web/out` 目錄存在且包含 HTML 文件

### 聯繫支持
如果問題持續，提供：
- 完整的構建日誌
- Render Dashboard 截圖
- next.config.js 內容
