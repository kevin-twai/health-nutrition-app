# 🚀 Railway 部署指南

## 快速部署步驟

### 1. 準備 OpenAI API 金鑰

1. 前往 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 建立新的 API 金鑰
3. 複製金鑰 (格式：`sk-...`)

### 2. 安裝 Railway CLI

```bash
# 如果還沒安裝
npm install -g @railway/cli
```

### 3. 登入 Railway

```bash
railway login
```

### 4. 初始化專案

```bash
# 在專案根目錄執行
railway init

# 選擇 "Create a new project"
# 輸入專案名稱：health-nutrition-tracker
```

### 5. 添加 PostgreSQL 資料庫 (可選)

```bash
railway add --database postgresql
```

### 6. 設定環境變數

```bash
# 設定 OpenAI API 金鑰 (必填)
railway variables set OPENAI_API_KEY=sk-your-openai-api-key-here

# 設定 JWT 秘密
railway variables set JWT_SECRET=$(openssl rand -base64 64)

# 設定 Node.js 環境
railway variables set NODE_ENV=production

# 如果有 Google Vision API 金鑰 (可選)
railway variables set GOOGLE_VISION_API_KEY=your-google-vision-api-key
```

### 7. 部署應用程式

```bash
railway deploy
```

### 8. 取得應用程式 URL

```bash
railway domain
```

## 🔧 環境變數說明

### 必填變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `OPENAI_API_KEY` | OpenAI API 金鑰 | `sk-...` |
| `JWT_SECRET` | JWT 簽名秘密 | 自動生成 |
| `NODE_ENV` | Node.js 環境 | `production` |

### 可選變數

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `GOOGLE_VISION_API_KEY` | Google Vision API | 無 |
| `PORT` | 應用程式端口 | Railway 自動設定 |

## 📋 部署後檢查

### 1. 檢查應用程式狀態

```bash
railway status
```

### 2. 查看日誌

```bash
railway logs
```

### 3. 測試健康檢查

```bash
# 替換為你的實際 URL
curl https://your-app.railway.app/health
```

### 4. 測試照片上傳功能

前往你的應用程式 URL，測試照片上傳和分析功能。

## 🚨 常見問題

### Q: 部署失敗怎麼辦？

A: 檢查以下項目：
1. OpenAI API 金鑰是否正確
2. 查看部署日誌：`railway logs`
3. 確認所有必要的環境變數已設定

### Q: 如何更新應用程式？

A: 修改程式碼後，再次執行：
```bash
railway deploy
```

### Q: 如何查看環境變數？

A: 執行以下命令：
```bash
railway variables
```

### Q: 如何刪除專案？

A: 在 Railway 控制台中刪除專案，或執行：
```bash
railway project delete
```

## 💰 費用說明

- **免費額度**：每月 $5 USD 免費額度
- **付費方案**：超出免費額度後按使用量計費
- **資料庫**：PostgreSQL 免費額度包含在內

## 🔗 有用連結

- [Railway 官方文檔](https://docs.railway.app/)
- [Railway 控制台](https://railway.app/dashboard)
- [OpenAI API 文檔](https://platform.openai.com/docs)

---

## 🎉 部署完成！

部署成功後，你的健康營養追蹤系統將可以通過 Railway 提供的 URL 存取。

記得測試以下功能：
- ✅ 首頁載入
- ✅ 健康檢查端點 (`/health`)
- ✅ 照片上傳功能 (`/photo`)
- ✅ AI 食材識別功能