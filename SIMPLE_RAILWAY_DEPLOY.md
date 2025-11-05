# 🚀 Railway 簡單部署指南 (Web 界面)

由於 CLI 登入問題，我們使用 Railway 的 Web 界面進行部署，這樣更簡單！

## 📋 準備工作

### 1. 取得 OpenAI API 金鑰
1. 前往 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 建立新的 API 金鑰
3. 複製金鑰 (格式：`sk-...`)

### 2. 將程式碼推送到 GitHub
```bash
# 如果還沒有 Git 倉庫
git init
git add .
git commit -m "Initial commit for Railway deployment"

# 在 GitHub 建立新倉庫，然後推送
git remote add origin https://github.com/your-username/health-nutrition-app.git
git branch -M main
git push -u origin main
```

## 🌐 Railway Web 部署步驟

### 1. 前往 Railway
1. 開啟 [Railway.app](https://railway.app)
2. 點擊 "Login" 並使用 GitHub 帳號登入

### 2. 建立新專案
1. 點擊 "New Project"
2. 選擇 "Deploy from GitHub repo"
3. 選擇你的 `health-nutrition-app` 倉庫
4. 點擊 "Deploy Now"

### 3. 設定環境變數
1. 在專案頁面，點擊你的服務
2. 前往 "Variables" 標籤
3. 添加以下環境變數：

| 變數名稱 | 值 |
|---------|---|
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `sk-your-openai-api-key-here` |
| `JWT_SECRET` | `your-super-secret-jwt-key-at-least-32-characters-long` |

### 4. 等待部署完成
- Railway 會自動檢測到 Node.js 專案
- 部署通常需要 2-5 分鐘
- 你可以在 "Deployments" 標籤查看進度

### 5. 取得應用程式 URL
1. 前往 "Settings" 標籤
2. 在 "Domains" 區域，點擊 "Generate Domain"
3. 複製生成的 URL (格式：`https://your-app.railway.app`)

## 🧪 測試部署

部署完成後，測試以下端點：

1. **健康檢查**：`https://your-app.railway.app/health`
2. **照片上傳頁面**：`https://your-app.railway.app/photo`
3. **API 端點**：`https://your-app.railway.app/api/v1`

## 🔧 故障排除

### 如果部署失敗：

1. **檢查日誌**：
   - 在 Railway 專案頁面，前往 "Deployments" 標籤
   - 點擊失敗的部署，查看錯誤日誌

2. **常見問題**：
   - 確認 `package.json` 中的 `start` 腳本正確
   - 確認 OpenAI API 金鑰格式正確 (以 `sk-` 開頭)
   - 確認所有必要的環境變數都已設定

3. **重新部署**：
   - 修改程式碼後推送到 GitHub
   - Railway 會自動觸發新的部署

## 💡 優化建議

### 添加資料庫 (可選)
1. 在專案頁面，點擊 "New" → "Database" → "Add PostgreSQL"
2. Railway 會自動設定 `DATABASE_URL` 環境變數

### 自訂域名 (可選)
1. 前往 "Settings" → "Domains"
2. 點擊 "Custom Domain"
3. 輸入你的域名並按照指示設定 DNS

## 📊 監控和維護

### 查看應用程式狀態
- **日誌**：在 Railway 專案頁面查看即時日誌
- **指標**：查看 CPU、記憶體使用情況
- **部署歷史**：追蹤所有部署記錄

### 更新應用程式
1. 修改程式碼
2. 推送到 GitHub：`git push origin main`
3. Railway 會自動部署新版本

## 🎉 完成！

恭喜！你的健康營養追蹤系統現在已經部署到網際網路上了！

**你的應用程式 URL**：`https://your-app.railway.app`

記得測試所有功能：
- ✅ 首頁載入
- ✅ 健康檢查端點
- ✅ 照片上傳功能
- ✅ AI 食材識別功能

---

## 🆘 需要幫助？

如果遇到任何問題：
1. 檢查 Railway 專案的日誌
2. 確認環境變數設定正確
3. 查看 [Railway 文檔](https://docs.railway.app/)
4. 或者聯繫我獲得進一步協助