# 🌐 前端 Web 應用程式部署指南

現在我們來部署前端 Next.js 應用程式到 Render！

## 🚀 前端部署步驟

### 第一步：推送更新到 GitHub

```bash
git add .
git commit -m "Add frontend deployment configuration"
git push origin main
```

### 第二步：在 Render 建立前端服務

1. **前往 [Render Dashboard](https://dashboard.render.com)**
2. **點擊 "New +" → "Web Service"**
3. **選擇你的 `kevin-twai/health-nutrition-app` 倉庫**
4. **點擊 "Connect"**

### 第三步：配置前端服務

填入以下設定：

| 設定項目 | 值 |
|---------|---|
| **Name** | `health-nutrition-web` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Root Directory** | `apps/web` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 第四步：設定環境變數

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://health-nutrition-app-w3zm.onrender.com` |

### 第五步：部署

1. **點擊 "Create Web Service"**
2. **等待建置完成**（約 5-10 分鐘）
3. **取得前端 URL**

## 🎯 預期結果

部署成功後，你會有：

1. **後端 API**：`https://health-nutrition-app-w3zm.onrender.com`
   - 提供 API 服務和簡單的照片上傳頁面

2. **前端 Web**：`https://health-nutrition-web-xxx.onrender.com`
   - 完整的 Next.js 前端界面
   - 美觀的用戶界面
   - 響應式設計

## 📱 前端功能

前端應用程式包含以下頁面：

- **首頁** (`/`) - 系統介紹和功能展示
- **認證頁面** (`/auth`) - 用戶登入/註冊
- **儀表板** (`/dashboard`) - 主要控制面板
- **照片上傳** (`/photo`) - 拍照辨識功能
- **AI 聊天** (`/chat`) - 健康顧問聊天
- **報告** (`/reports`) - 健康報告查看
- **遊戲化** (`/gamification`) - 任務和成就
- **個人資料** (`/profile`) - 用戶設定

## 🔗 整合測試

前端部署完成後，測試以下功能：

1. **前端首頁**：應該顯示系統介紹
2. **API 整合**：前端應該能正常調用後端 API
3. **照片上傳**：前端的照片上傳功能應該正常
4. **響應式設計**：在手機和桌面都能正常顯示

## 💡 小提示

- 前端建置時間較長（5-10 分鐘），請耐心等待
- 如果建置失敗，檢查 Node.js 版本是否為 18+
- 前端會自動連接到你的後端 API

現在開始部署前端吧！