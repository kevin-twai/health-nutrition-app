# 🚀 Render 部署指南 (推薦)

由於 Railway 建置有問題，我們改用 Render 部署，這是最簡單的方法！

## 📋 Render 部署步驟

### 1. 前往 Render
1. 開啟 [Render.com](https://render.com)
2. 使用 GitHub 帳號註冊/登入

### 2. 建立新服務
1. 點擊 "New +" → "Web Service"
2. 選擇 "Build and deploy from a Git repository"
3. 點擊 "Connect" 連接你的 GitHub 帳號
4. 選擇 `kevin-twai/health-nutrition-app` 倉庫

### 3. 配置服務
填入以下設定：

| 欄位 | 值 |
|------|---|
| **Name** | `health-nutrition-app` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### 4. 設定環境變數
在 "Environment Variables" 區域添加：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `sk-your-openai-api-key-here` ⚠️ |
| `JWT_SECRET` | `rEqZVPew8NlZL+76E2gT7PMDDVQvlzGP96/mj6ZmCZHld09y3EyQPRiL1F+ETOww eRMDYFtPH6H/UxheEsjN7g==` |

⚠️ **重要**：記得將 `OPENAI_API_KEY` 替換為你的真實 OpenAI API 金鑰！

### 5. 部署
1. 點擊 "Create Web Service"
2. 等待建置和部署完成（約 3-5 分鐘）
3. 部署成功後會得到一個 URL：`https://health-nutrition-app.onrender.com`

## 🧪 測試部署

部署完成後，測試以下端點：
- **健康檢查**：`https://your-app.onrender.com/health`
- **照片上傳頁面**：`https://your-app.onrender.com/photo`

## 💡 Render 的優勢

- ✅ **免費方案**：每月 750 小時免費
- ✅ **自動 HTTPS**：自動提供 SSL 憑證
- ✅ **簡單部署**：直接從 GitHub 部署
- ✅ **自動重啟**：服務異常時自動重啟
- ✅ **日誌查看**：內建日誌查看功能

## 🔧 如果需要 OpenAI API 金鑰

1. 前往 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 建立新的 API 金鑰
3. 複製金鑰 (格式：`sk-...`)
4. 在 Render 的環境變數中設定

## 📊 監控和維護

- **查看日誌**：在 Render 控制台的 "Logs" 標籤
- **重新部署**：推送新程式碼到 GitHub 會自動觸發部署
- **服務狀態**：在 Render 控制台查看服務狀態

---

## 🎉 完成！

使用 Render 部署比 Railway 更簡單穩定，通常 5 分鐘內就能完成部署！