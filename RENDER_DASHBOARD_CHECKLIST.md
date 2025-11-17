# Render Dashboard 設置檢查清單

## 📋 必須完成的步驟

### ✅ Step 1: 進入服務設置
1. 登入 Render Dashboard
2. 找到 `health-nutrition-web` 服務
3. 點擊服務名稱進入詳情頁
4. 點擊左側的 "Settings" 標籤

---

### ✅ Step 2: 修改 Build Command

找到 "Build Command" 欄位，修改為：

```bash
apps/web/ $ npm install && npm run build
```

**重要提示：**
- 確保路徑是 `apps/web/`（包含最後的斜杠）
- 確保命令是 `npm install && npm run build`
- 不要使用 `exit 0` 或其他額外命令

---

### ✅ Step 3: 修改 Publish Directory

找到 "Publish Directory" 欄位，修改為：

```
apps/web/out
```

**重要提示：**
- 不是 `apps/web/.next`
- 是 `apps/web/out`（export 模式的輸出目錄）
- 沒有前導斜杠

---

### ✅ Step 4: 檢查環境變量

確認 "Environment Variables" 中有：

```
NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com
```

如果沒有，點擊 "Add Environment Variable" 添加。

---

### ✅ Step 5: 保存設置

1. 滾動到頁面底部
2. 點擊 "Save Changes" 按鈕
3. 等待設置保存成功

---

### ✅ Step 6: 觸發部署

1. 回到服務詳情頁（點擊左側的 "Overview"）
2. 點擊右上角的 "Manual Deploy" 按鈕
3. 選擇 "Deploy latest commit"
4. 確認部署

---

## 🔍 部署監控

### 觀察構建日誌

部署開始後，你應該看到：

```
==> Cloning from https://github.com/kevin-twai/health-nutrition-app...
==> Checking out commit 5365487...
==> Running 'npm install && npm run build' in apps/web/
...
▲ Next.js 14.2.18
Creating an optimized production build ...
✓ Compiled successfully
Collecting page data ...
Generating static pages (0/8) ...
Generating static pages (2/8) ...
Generating static pages (5/8) ...
✓ Generating static pages (8/8)
Finalizing page optimization ...
✓ Export successful
==> Build successful 🎉
==> Deploying...
==> Your service is live 🎉
```

### ✅ 成功標誌

- ✓ 沒有 "Invalid next.config.js options" 警告
- ✓ 沒有 "TypeError: Cannot read properties of null" 錯誤
- ✓ 沒有 "Error occurred prerendering page" 錯誤
- ✓ 看到 "Export successful" 消息
- ✓ 看到 "Build successful 🎉"
- ✓ 看到 "Your service is live 🎉"

### ❌ 如果看到錯誤

如果還有錯誤，檢查：

1. **Build Command 是否正確**
   - 必須是：`apps/web/ $ npm install && npm run build`
   - 注意 `apps/web/` 後面有空格和 `$`

2. **Publish Directory 是否正確**
   - 必須是：`apps/web/out`
   - 不是 `apps/web/.next`

3. **代碼是否最新**
   - 確認 Git 已推送最新的 next.config.js
   - 檢查 commit hash 是否是 `5365487`

---

## 🌐 部署完成後測試

### 1. 訪問網站

打開瀏覽器，訪問：
```
https://health-nutrition-web.onrender.com
```

### 2. 測試頁面

依次訪問以下頁面，確認都能正常加載：

- [ ] `/` - 首頁
- [ ] `/auth` - 登入頁
- [ ] `/dashboard` - 儀表板
- [ ] `/photo` - 拍照識別
- [ ] `/chat` - AI 對話
- [ ] `/reports` - 報告
- [ ] `/gamification` - 遊戲化
- [ ] `/profile` - 個人資料

### 3. 測試 API 連接

1. 打開瀏覽器開發者工具（F12）
2. 切換到 "Network" 標籤
3. 嘗試登入或其他 API 操作
4. 確認請求發送到：`https://health-nutrition-api.onrender.com`
5. 確認沒有 CORS 錯誤

### 4. 檢查控制台

打開瀏覽器控制台（F12 > Console），確認：
- [ ] 沒有紅色錯誤
- [ ] API URL 正確
- [ ] 資源加載正常

---

## 📸 截圖參考

### Build Command 設置
```
┌─────────────────────────────────────────┐
│ Build Command                           │
├─────────────────────────────────────────┤
│ apps/web/ $ npm install && npm run build│
└─────────────────────────────────────────┘
```

### Publish Directory 設置
```
┌─────────────────────────────────────────┐
│ Publish Directory                       │
├─────────────────────────────────────────┤
│ apps/web/out                            │
└─────────────────────────────────────────┘
```

### 環境變量設置
```
┌─────────────────────────────────────────────────────────────────┐
│ Environment Variables                                           │
├─────────────────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_API_URL = https://health-nutrition-api.onrender.com│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎉 完成！

如果所有步驟都完成且沒有錯誤，你的前端應該已經成功部署！

訪問：https://health-nutrition-web.onrender.com

享受你的健康營養追蹤應用！🎊
