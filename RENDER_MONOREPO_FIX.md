# 🔧 Render Monorepo 依賴修復

## 問題診斷

錯誤：
```
npm error 404  '@health-tracker/shared-types@*' is not in this registry.
```

**根本原因**：
- `@health-tracker/shared-types` 是本地 monorepo package
- Render 設置了 Root Directory 為 `apps/api`，看不到 `packages/` 目錄
- npm 無法找到這個本地依賴

---

## ✅ 解決方案

### 方案 1：移除 Root Directory 設置（推薦）

這樣 Render 可以看到整個 monorepo 結構。

#### 步驟：

1. **前往 Render Dashboard** → 選擇 API 服務 → Settings

2. **清空 Root Directory**
   - 將 Root Directory 設置為空（或刪除）

3. **更新 Build Command**：
   ```bash
   npm install && cd apps/api && npm install && npm run build
   ```

4. **更新 Start Command**：
   ```bash
   cd apps/api && npm start
   ```

5. **保存並重新部署**
   - 點擊 "Save Changes"
   - 點擊 "Manual Deploy" → "Clear build cache & deploy"

---

### 方案 2：使用 simple-server.js（快速臨時方案）

如果您只是想快速測試，可以暫時使用 simple-server：

#### Build Command
```bash
echo "No build needed"
```

#### Start Command
```bash
cd apps/api && node src/simple-server.js
```

**注意**：這個方案不會使用新的食物識別引擎！

---

### 方案 3：內聯 shared-types（已準備好）

我已經創建了 `apps/api/src/types/shared.ts`，包含所有共享類型。

但需要更新所有 import 語句（約 50+ 個文件），這需要時間。

---

## 🎯 推薦執行方案 1

這是最簡單且最正確的方法：

### 配置摘要：

| 設置 | 值 |
|------|-----|
| Root Directory | *留空* |
| Build Command | `npm install && cd apps/api && npm install && npm run build` |
| Start Command | `cd apps/api && npm start` |

### 為什麼這樣可以工作？

1. Render 在項目根目錄執行命令
2. `npm install` 會安裝根目錄的依賴（包括設置 workspace）
3. `cd apps/api && npm install` 會正確解析本地 workspace 依賴
4. `npm run build` 編譯 TypeScript
5. `npm start` 啟動服務器

---

## 📊 預期結果

### Build 日誌
```
==> Installing dependencies
npm install
✓ Workspace dependencies linked

==> Building API
cd apps/api && npm install
✓ @health-tracker/shared-types linked from workspace
npm run build
✓ TypeScript compilation successful
```

### Start 日誌
```
==> Starting application
cd apps/api && npm start
✓ PhotoController 初始化完成 - 使用增強型識別引擎
✓ Server running on port 3001
```

---

## ❓ 常見問題

### Q: 為什麼不能只設置 Root Directory？

**A:** 因為 `@health-tracker/shared-types` 在 `packages/` 目錄，如果 Root Directory 是 `apps/api`，Render 看不到 `packages/`。

### Q: 方案 1 會增加 build 時間嗎？

**A:** 會稍微增加（約 10-20 秒），因為需要安裝根目錄的依賴。但這是正確的做法。

### Q: 可以使用 pnpm 或 yarn workspaces 嗎？

**A:** 可以，但需要確保 Render 環境支持。npm workspaces 是最簡單的選擇。

---

## 🚀 立即執行

1. 前往 https://dashboard.render.com
2. 選擇 API 服務 → Settings
3. **清空 Root Directory**
4. Build Command: `npm install && cd apps/api && npm install && npm run build`
5. Start Command: `cd apps/api && npm start`
6. Save Changes → Manual Deploy → Clear build cache & deploy

等待 3-5 分鐘，部署應該就會成功！🎉
