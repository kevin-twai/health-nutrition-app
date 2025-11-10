# Render Web Service 部署指南

## 問題診斷

你的 Web Service 出現 502 錯誤，原因是：
- Render 在根目錄執行構建命令
- 但 Next.js 應用在 `apps/web` 子目錄中
- 需要正確配置工作目錄

## 解決方案

### 方案 1：在 Render Dashboard 中配置（推薦）

1. 登入 Render Dashboard: https://dashboard.render.com
2. 找到 `health-nutrition-web` 服務
3. 點擊 "Settings"
4. 修改以下設置：

**Root Directory:**
```
apps/web
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Environment Variables:**
- `NODE_ENV` = `production`
- `NEXT_PUBLIC_API_URL` = `https://health-nutrition-app-w3zm.onrender.com`
- `PORT` = `10000`

5. 點擊 "Save Changes"
6. 點擊 "Manual Deploy" → "Deploy latest commit"

### 方案 2：使用 Monorepo 根目錄部署

如果方案 1 不行，可以修改根目錄的 package.json：

在根目錄創建 `package.json` 的 web 相關腳本：

```json
{
  "scripts": {
    "web:install": "cd apps/web && npm install",
    "web:build": "cd apps/web && npm run build",
    "web:start": "cd apps/web && npm start"
  }
}
```

然後在 Render 中設置：
- Build Command: `npm run web:install && npm run web:build`
- Start Command: `npm run web:start`

### 方案 3：創建獨立的 Web 服務 Repository

最簡單的方案是將 `apps/web` 獨立部署：

1. 在 Render 中創建新的 Web Service
2. 連接到同一個 GitHub repository
3. 設置 Root Directory 為 `apps/web`
4. 其他設置同方案 1

## 驗證部署

部署完成後（約 3-5 分鐘），訪問：
- https://health-nutrition-web.onrender.com

應該看到 Next.js 應用的首頁，而不是 502 錯誤。

## 當前狀態

- ❌ Web Service: 502 Bad Gateway（未正確配置）
- ✅ API Service: 正常運行

## 下一步

1. 按照方案 1 在 Render Dashboard 中配置
2. 等待部署完成
3. 測試 Web 應用是否正常運行
