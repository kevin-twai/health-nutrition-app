# 部署到 Render - EnhancedPromptGenerator 整合版

## 📋 部署前檢查清單

### ✅ 已完成的準備工作
- [x] TypeScript 文件已編譯到 `apps/api/dist` 目錄
- [x] `simpleVisionHelper.js` 已更新為從 `dist` 目錄導入
- [x] `EnhancedPromptGenerator` 成功整合

### 🔧 需要在 Render 上配置的環境變量

1. **OPENAI_API_KEY** (必需)
   - 你的 OpenAI API Key
   - 格式：`sk-...`

2. **NODE_ENV** (已配置)
   - 值：`production`

3. **JWT_SECRET** (已配置為自動生成)

---

## 📦 部署步驟

### 步驟 1：更新 render.yaml 配置

我們需要確保 Render 在部署時編譯 TypeScript 文件。

```yaml
services:
  - type: web
    name: health-nutrition-app
    env: node
    plan: free
    buildCommand: |
      npm install
      cd apps/api && npx tsc
    startCommand: node apps/api/src/simple-server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: OPENAI_API_KEY
        sync: false
```

### 步驟 2：提交更改到 Git

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 整合 EnhancedPromptGenerator 並準備部署到 Render"

# 推送到遠程倉庫
git push origin main
```

### 步驟 3：在 Render Dashboard 配置

1. 登入 [Render Dashboard](https://dashboard.render.com/)

2. 找到你的服務 `health-nutrition-app`

3. 進入 **Environment** 設置

4. 添加/更新環境變量：
   ```
   OPENAI_API_KEY = sk-your-actual-api-key-here
   ```

5. 點擊 **Save Changes**

6. Render 會自動觸發重新部署

### 步驟 4：驗證部署

部署完成後，檢查以下內容：

1. **檢查日誌**
   - 在 Render Dashboard 的 **Logs** 標籤中
   - 應該看到：`✅ 成功導入 EnhancedPromptGenerator`
   - 不應該看到：`⚠️ 無法導入 EnhancedPromptGenerator`

2. **測試健康檢查**
   ```bash
   curl https://your-app.onrender.com/health | jq
   ```
   
   應該返回：
   ```json
   {
     "status": "healthy",
     "aiVisionAPI": {
       "chatgpt": {
         "configured": true,
         "keyPresent": true,
         "keyType": "real"
       }
     }
   }
   ```

3. **測試照片識別 API**
   ```bash
   curl -X POST https://your-app.onrender.com/api/v1/photo/recognize \
     -F "photo=@test-image.jpg"
   ```

---

## 🔍 故障排除

### 問題 1：顯示「無法導入 EnhancedPromptGenerator」

**原因**：TypeScript 文件沒有編譯

**解決方案**：
1. 檢查 `render.yaml` 中的 `buildCommand` 是否包含 `cd apps/api && npx tsc`
2. 在 Render Dashboard 中手動觸發重新部署
3. 檢查構建日誌，確認 TypeScript 編譯成功

### 問題 2：OpenAI API Key 未配置

**原因**：環境變量沒有設置或設置錯誤

**解決方案**：
1. 在 Render Dashboard 的 Environment 設置中檢查 `OPENAI_API_KEY`
2. 確保值以 `sk-` 開頭
3. 保存後重新部署

### 問題 3：找不到 dist 目錄

**原因**：編譯失敗或路徑錯誤

**解決方案**：
1. 檢查 `apps/api/tsconfig.json` 配置
2. 確認 `outDir` 設置為 `"./dist"`
3. 在本地測試編譯：`cd apps/api && npx tsc`

---

## 📊 部署後驗證清單

- [ ] 服務狀態為 "Live"
- [ ] 日誌中顯示 "✅ 成功導入 EnhancedPromptGenerator"
- [ ] 健康檢查返回 `configured: true`
- [ ] 照片識別 API 正常工作
- [ ] 使用增強版 prompt（檢查 API 響應中的 `apiUsed` 字段）

---

## 🚀 快速部署命令

如果你已經配置好所有環境變量，可以使用以下命令快速部署：

```bash
# 1. 提交更改
git add .
git commit -m "feat: 整合 EnhancedPromptGenerator"
git push origin main

# 2. Render 會自動部署

# 3. 等待幾分鐘後測試
curl https://your-app.onrender.com/health | jq '.aiVisionAPI'
```

---

## 📝 重要提示

1. **TypeScript 編譯時間**
   - 首次編譯可能需要 1-2 分鐘
   - Render 的免費方案可能會超時，如果發生請重試

2. **dist 目錄**
   - `dist` 目錄不應該提交到 Git（已在 .gitignore 中）
   - Render 會在每次部署時重新編譯

3. **環境變量**
   - 確保 `OPENAI_API_KEY` 在 Render Dashboard 中正確設置
   - 不要在代碼中硬編碼 API Key

4. **監控**
   - 部署後監控 Render 的日誌
   - 檢查是否有任何錯誤或警告

---

## 🎯 預期結果

部署成功後，你的應用將：

1. ✅ 使用增強版的 `EnhancedPromptGenerator`
2. ✅ 提供更智能、更詳細的食物識別 prompt
3. ✅ 支持亞洲料理的專業識別
4. ✅ 包含數量計數準確性檢查
5. ✅ 提供台灣原住民料理識別

---

## 📞 需要幫助？

如果遇到問題，請檢查：
1. Render Dashboard 的 Logs 標籤
2. 健康檢查端點：`/health`
3. 本文檔的故障排除部分
