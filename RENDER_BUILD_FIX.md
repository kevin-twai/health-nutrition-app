# 🔧 Render Build 修復方案

## 問題診斷

錯誤信息：
```
Error: Cannot find module '/opt/render/project/src/apps/api/dist/index.js'
```

**根本原因**：
1. Build 命令沒有正確執行 TypeScript 編譯
2. `dist` 目錄沒有被創建
3. Render 的工作目錄可能不正確

---

## ✅ 解決方案

### 方案 1：修正 Render 配置（推薦）

在 Render Dashboard 中更新配置：

#### Root Directory
```
apps/api
```

#### Build Command
```bash
npm install && npm run build
```

#### Start Command
```bash
npm start
```

### 方案 2：使用完整路徑命令

如果方案 1 不行，使用這個：

#### Build Command
```bash
cd apps/api && npm install && npm run build
```

#### Start Command
```bash
cd apps/api && node dist/index.js
```

### 方案 3：創建 render.yaml（最穩定）

在項目根目錄創建 `render.yaml`：

```yaml
services:
  - type: web
    name: health-nutrition-app-api
    env: node
    plan: free
    region: singapore
    rootDir: apps/api
    buildCommand: npm install && npm run build
    startCommand: npm start
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
```

---

## 🔍 驗證步驟

### 1. 檢查 Build 日誌

部署時應該看到：
```
✓ TypeScript compilation successful
✓ dist/index.js created
```

### 2. 檢查啟動日誌

應該看到：
```
✓ PhotoController 初始化完成 - 使用增強型識別引擎
Server running on port 3001
```

---

## 🚀 立即修復步驟

### 步驟 1：更新 Render 配置

1. 前往 https://dashboard.render.com
2. 選擇您的 API 服務
3. 點擊 "Settings"
4. 找到 "Root Directory" 設置為：`apps/api`
5. 更新 "Build Command"：`npm install && npm run build`
6. 更新 "Start Command"：`npm start`
7. 點擊 "Save Changes"

### 步驟 2：清除快取並重新部署

1. 點擊 "Manual Deploy"
2. 選擇 "Clear build cache & deploy"
3. 等待部署完成（約 3-5 分鐘）

### 步驟 3：驗證部署

檢查日誌中是否出現：
- ✅ TypeScript 編譯成功
- ✅ dist 目錄已創建
- ✅ PhotoController 初始化完成

---

## 📊 預期結果

### Build 階段
```
==> Installing dependencies
npm install
✓ Dependencies installed

==> Building application
npm run build
✓ TypeScript compilation successful
✓ Created dist/index.js
```

### Start 階段
```
==> Starting application
npm start
✓ PhotoController 初始化完成 - 使用增強型識別引擎
  - 多階段識別引擎已啟用
  - 亞洲料理知識庫已載入
  - 結果驗證器已啟用
✓ Server running on port 3001
```

---

## ❓ 常見問題

### Q: 為什麼需要設置 Root Directory？

**A:** Render 默認在項目根目錄執行命令，但我們的 API 在 `apps/api` 子目錄中。設置 Root Directory 可以讓 Render 在正確的目錄執行命令。

### Q: Build 還是失敗怎麼辦？

**A:** 
1. 確認 Root Directory 設置正確
2. 清除 build cache
3. 檢查 package.json 中的 build script
4. 查看完整的 build 日誌

### Q: 如何確認 dist 目錄已創建？

**A:** 在 Render 日誌中搜索 "tsc" 或 "TypeScript"，應該看到編譯成功的消息。

---

## 🎯 總結

**問題**：Build 命令沒有在正確的目錄執行，導致 dist 目錄未創建

**解決方案**：設置 Root Directory 為 `apps/api`

**關鍵配置**：
- Root Directory: `apps/api`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

修復後，您的 API 將正確編譯並使用新的食物識別引擎！🎉
