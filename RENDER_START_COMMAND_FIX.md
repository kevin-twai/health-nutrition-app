# 🔧 Render 啟動命令修復

## 問題診斷

### 症狀
從 Render 日誌可以看出，系統正在使用 `simple-server.js` 而不是正確的 `PhotoController`：

```
✅ 開始調用 ChatGPT Vision API...
```

這表明請求被 `simple-server.js` 處理，而不是使用新的 `MultiStageRecognitionEngine`。

### 根本原因

Render 上的 API 服務配置了錯誤的啟動命令，可能是：
- ❌ `node src/simple-server.js`
- ❌ `npm run simple-server`

而不是正確的：
- ✅ `npm run build && npm start`
- ✅ `node dist/index.js`

---

## 🔍 驗證問題

### 檢查 Render 配置

1. 前往 Render Dashboard
2. 找到 API 服務
3. 點擊 "Settings"
4. 查看 "Build & Deploy" 部分
5. 檢查 "Start Command"

**錯誤的配置**:
```bash
node src/simple-server.js
```

**正確的配置**:
```bash
npm run build && npm start
```

或者：
```bash
cd apps/api && npm run build && npm start
```

---

## ✅ 修復步驟

### 步驟 1: 更新 Render 啟動命令

1. **登入 Render Dashboard**
   - 網址: https://dashboard.render.com

2. **找到 API 服務**
   - 在服務列表中找到您的 API 服務
   - 通常名稱類似 "health-nutrition-app-api" 或 "health-nutrition-app"

3. **進入設置**
   - 點擊服務名稱
   - 點擊左側的 "Settings" 標籤

4. **更新 Build Command**
   ```bash
   cd apps/api && npm install && npm run build
   ```

5. **更新 Start Command**
   ```bash
   cd apps/api && npm start
   ```

6. **保存更改**
   - 點擊 "Save Changes"

7. **手動觸發重新部署**
   - 點擊 "Manual Deploy" → "Deploy latest commit"

### 步驟 2: 等待部署完成

部署需要約 3-5 分鐘。監控日誌，應該看到：

```
✓ PhotoController 初始化完成 - 使用增強型識別引擎
  - 多階段識別引擎已啟用
  - 亞洲料理知識庫已載入
  - 結果驗證器已啟用
```

而不是：
```
✅ 開始調用 ChatGPT Vision API...
```

### 步驟 3: 驗證修復

部署完成後，測試食物識別：

1. 上傳一張食物照片
2. 檢查 Render 日誌
3. 應該看到多階段識別的日誌

---

## 📊 預期的日誌輸出

### 修復前（錯誤）
```
✅ 開始調用 ChatGPT Vision API...
📝 API Key 前10字元: sk-proj-c9
📦 原始圖片大小: 4134104 bytes
```

### 修復後（正確）
```
✓ PhotoController 初始化完成 - 使用增強型識別引擎
[session_xxx] 開始多階段食物識別流程
[session_xxx] 多階段識別完成，階段數: 2
[session_xxx] 驗證完成 - 警告: false, 錯誤: false
```

---

## 🔧 替代方案：使用 render.yaml

如果您想通過代碼配置 Render，可以創建或更新 `render.yaml`：

```yaml
services:
  # API 服務
  - type: web
    name: health-nutrition-app-api
    env: node
    plan: free
    region: singapore
    buildCommand: cd apps/api && npm install && npm run build
    startCommand: cd apps/api && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        sync: false
      - key: OPENAI_MODEL
        value: gpt-4o
      - key: RECOGNITION_CONFIDENCE_THRESHOLD
        value: 85
      - key: PORT
        value: 3001
    healthCheckPath: /health

  # Web 服務
  - type: web
    name: health-nutrition-app-web
    env: node
    plan: free
    region: singapore
    buildCommand: cd apps/web && npm install && npm run build
    startCommand: cd apps/web && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        value: https://health-nutrition-app-api.onrender.com
```

然後提交並推送：

```bash
git add render.yaml
git commit -m "fix: 更新 Render 配置使用正確的啟動命令"
git push origin main
```

---

## 🧪 測試修復

### 測試 1: 檢查服務啟動

```bash
curl https://your-api.onrender.com/health
```

應該返回：
```json
{
  "status": "healthy",
  "service": "health-nutrition-tracker-api",
  "features": {
    "foodRecognition": true,
    ...
  }
}
```

### 測試 2: 上傳食物照片

1. 登入您的應用
2. 上傳一張麵條照片
3. 檢查識別結果

**預期結果**:
- 食物名稱：「麵條」（正確的中文）
- 信心度：85%+
- 有多階段識別資訊

### 測試 3: 檢查 Render 日誌

在 Render Dashboard 查看日誌，應該看到：
- PhotoController 初始化訊息
- 多階段識別流程
- 知識庫查詢
- 結果驗證

---

## ❓ 常見問題

### Q: 為什麼會使用 simple-server.js？

**A:** 可能的原因：
1. Render 配置了錯誤的啟動命令
2. 之前為了快速測試設置了簡化服務器
3. 環境變數或配置文件指向了錯誤的入口點

### Q: 修改後需要多久生效？

**A:** 
- 保存配置後立即觸發重新部署
- 部署需要 3-5 分鐘
- 部署完成後立即生效

### Q: 如何確認使用了正確的服務器？

**A:** 檢查 Render 日誌：
- ✅ 看到 "PhotoController 初始化完成"
- ✅ 看到 "多階段識別引擎已啟用"
- ❌ 不應該看到 "開始調用 ChatGPT Vision API"

### Q: 修改後還是不行怎麼辦？

**A:** 
1. 確認 Build Command 和 Start Command 都已更新
2. 手動觸發重新部署
3. 清除 Render 的建置快取
4. 檢查環境變數是否正確設置

---

## 📝 檢查清單

部署前：
- [ ] 確認 PhotoController 修復已推送
- [ ] 確認所有新文件都已提交

Render 配置：
- [ ] Build Command 已更新
- [ ] Start Command 已更新
- [ ] 環境變數已設置（OPENAI_API_KEY, OPENAI_MODEL）
- [ ] 手動觸發重新部署

部署後：
- [ ] 檢查部署日誌無錯誤
- [ ] 檢查服務啟動日誌
- [ ] 測試健康檢查端點
- [ ] 測試食物識別功能
- [ ] 確認使用了多階段識別引擎

---

## 🎯 總結

**問題**: Render 使用了 `simple-server.js` 而不是正確的 `index.ts`

**解決方案**: 更新 Render 的 Start Command

**修復步驟**:
1. 前往 Render Dashboard
2. 更新 Build Command: `cd apps/api && npm install && npm run build`
3. 更新 Start Command: `cd apps/api && npm start`
4. 保存並重新部署
5. 測試驗證

**預期結果**: 使用新的 MultiStageRecognitionEngine，識別準確度顯著提升

---

修復完成後，您的食物識別功能將使用正確的引擎和知識庫！🎉
