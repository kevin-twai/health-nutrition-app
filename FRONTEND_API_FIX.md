# 🔧 前端 API 連接修復

**修復時間**: 2025-11-16  
**前端 URL**: https://health-nutrition-web.onrender.com  
**後端 URL**: https://health-nutrition-api.onrender.com

---

## ✅ 已修復的問題

### 1. API URL 配置錯誤
**問題**: 前端配置指向錯誤的後端 URL
- ❌ 舊 URL: `https://health-nutrition-app-w3zm.onrender.com`
- ✅ 新 URL: `https://health-nutrition-api.onrender.com`

**修復文件**:
- `apps/web/next.config.js` - 更新環境變數默認值
- `apps/web/src/app/page.tsx` - 更新首頁顯示的 API URL
- `apps/web/src/app/photo/page.tsx` - 更新照片辨識 API 調用
- `apps/web/src/app/reports/page.tsx` - 更新報告 API 調用

### 2. 創建統一 API 配置
**新文件**: `apps/web/src/lib/api.ts`

提供統一的 API 調用接口：
- 自動處理認證 token
- 統一錯誤處理
- 類型安全的 API 方法

---

## 📋 修復內容詳情

### 1. Next.js 配置 (`apps/web/next.config.js`)
```javascript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com',
},
```

### 2. 照片辨識頁面 (`apps/web/src/app/photo/page.tsx`)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'
const response = await fetch(`${API_URL}/api/v1/photo/recognize`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData,
})
```

### 3. 報告頁面 (`apps/web/src/app/reports/page.tsx`)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'
const response = await fetch(`${API_URL}/api/v1/reports/weekly`)
```

### 4. 統一 API 工具 (`apps/web/src/lib/api.ts`)
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com';

export const api = {
  register: (data) => apiRequest('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  searchFood: (query) => apiRequest(`/api/v1/food/search?q=${encodeURIComponent(query)}`),
  recognizePhoto: (formData) => apiRequest('/api/v1/photo/recognize', { method: 'POST', body: formData }),
  chat: (message) => apiRequest('/api/v1/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  getWeeklyReport: () => apiRequest('/api/v1/reports/weekly'),
  getGamificationProfile: () => apiRequest('/api/v1/gamification/profile'),
  healthCheck: () => apiRequest('/health'),
};
```

---

## 🚀 部署到 Render

### 方法 1: 自動部署（推薦）
Render 會自動檢測 Git 推送並重新部署：

```bash
# 提交修改
git add apps/web/
git commit -m "fix: 更新前端 API URL 連接到正確的後端"
git push origin main
```

Render 會自動：
1. 檢測到代碼變更
2. 重新構建前端
3. 部署新版本

### 方法 2: 手動觸發部署
在 Render Dashboard:
1. 進入你的 Web Service (health-nutrition-web)
2. 點擊 "Manual Deploy" 按鈕
3. 選擇 "Deploy latest commit"

---

## 🔍 驗證修復

### 1. 檢查前端是否正常運行
```bash
curl https://health-nutrition-web.onrender.com
```

### 2. 檢查前端能否連接後端
在瀏覽器中打開：
```
https://health-nutrition-web.onrender.com
```

然後打開瀏覽器開發者工具 (F12)，查看 Network 標籤，確認：
- API 請求指向 `https://health-nutrition-api.onrender.com`
- 請求狀態為 200 OK

### 3. 測試各個功能頁面
- ✅ 首頁: https://health-nutrition-web.onrender.com
- ✅ 照片辨識: https://health-nutrition-web.onrender.com/photo
- ✅ 報告: https://health-nutrition-web.onrender.com/reports
- ✅ 聊天: https://health-nutrition-web.onrender.com/chat
- ✅ 遊戲化: https://health-nutrition-web.onrender.com/gamification

---

## 📊 Render 環境變數設置

在 Render Dashboard 中設置環境變數（可選）：

1. 進入 Web Service 設置
2. 找到 "Environment" 部分
3. 添加環境變數：

```
NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com
```

這樣可以覆蓋代碼中的默認值。

---

## 🐛 常見問題排查

### 問題 1: 前端無法連接後端
**症狀**: Network 錯誤，CORS 錯誤

**解決方案**:
1. 確認後端 API 正常運行：
   ```bash
   curl https://health-nutrition-api.onrender.com/health
   ```

2. 檢查後端 CORS 設置（應該允許前端域名）

3. 查看 Render 日誌了解詳細錯誤

### 問題 2: 前端構建失敗
**症狀**: Render 部署失敗

**解決方案**:
1. 查看 Render 構建日誌
2. 確認 `package.json` 中的依賴正確
3. 確認 Next.js 配置正確

### 問題 3: API 請求 404
**症狀**: API 端點找不到

**解決方案**:
1. 確認 API 端點路徑正確（應該是 `/api/v1/...`）
2. 確認後端已部署最新代碼
3. 測試後端 API 是否正常：
   ```bash
   curl https://health-nutrition-api.onrender.com/api/v1
   ```

---

## 📝 後續優化建議

### 1. 使用環境變數
在 Render 中設置不同環境的 API URL：
- Development: `http://localhost:3001`
- Staging: `https://staging-api.onrender.com`
- Production: `https://health-nutrition-api.onrender.com`

### 2. 添加 API 錯誤處理
在 `apps/web/src/lib/api.ts` 中添加更詳細的錯誤處理和重試邏輯

### 3. 添加 Loading 狀態
為所有 API 調用添加 loading 指示器

### 4. 添加錯誤提示
使用 Toast 或 Alert 組件顯示 API 錯誤

---

## ✅ 檢查清單

部署前確認：
- [ ] 所有硬編碼的 API URL 已更新
- [ ] `next.config.js` 中的 API URL 正確
- [ ] 代碼已提交到 Git
- [ ] Render 自動部署已觸發
- [ ] 前端構建成功
- [ ] 前端可以訪問
- [ ] API 請求指向正確的後端
- [ ] 各個功能頁面正常工作

---

## 🎯 測試腳本

創建一個簡單的測試腳本：

```bash
#!/bin/bash

echo "🧪 測試前端 API 連接"
echo "================================"

FRONTEND_URL="https://health-nutrition-web.onrender.com"
BACKEND_URL="https://health-nutrition-api.onrender.com"

# 1. 測試前端是否運行
echo "1️⃣ 測試前端..."
curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL
echo ""

# 2. 測試後端是否運行
echo "2️⃣ 測試後端..."
curl -s $BACKEND_URL/health | jq '.status'
echo ""

# 3. 測試 API 端點
echo "3️⃣ 測試 API 端點..."
curl -s $BACKEND_URL/api/v1 | jq '.version'
echo ""

echo "================================"
echo "✅ 測試完成"
```

---

**總結**: 前端 API 連接已修復，指向正確的後端 URL。提交代碼後 Render 會自動重新部署前端。
