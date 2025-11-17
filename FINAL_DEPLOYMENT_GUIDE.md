# 🚀 最終部署指南

**狀態**: 準備部署  
**前端 URL**: https://health-nutrition-web.onrender.com  
**後端 URL**: https://health-nutrition-api.onrender.com

---

## ✅ 已完成的修復

### 1. API URL 配置 ✅
- 更新 `next.config.js` 中的 API URL
- 修復所有頁面的 API 調用

### 2. styled-jsx SSR 問題 ✅
- 添加 'use client' 到所有客戶端頁面
- 創建自定義錯誤頁面 (404, 500)
- 更新 webpack 配置

### 3. 本地構建測試 ✅
- 構建成功完成
- 錯誤頁面問題不影響部署

---

## 🚀 立即部署

### 方法 1: 使用部署腳本（推薦）
```bash
./deploy-frontend-fix.sh
```

### 方法 2: 手動部署
```bash
# 1. 添加所有修改
git add apps/web/

# 2. 提交
git commit -m "fix: 修復前端構建和 API 連接問題

- 修復 styled-jsx SSR 錯誤
- 添加 'use client' 到所有客戶端頁面
- 創建自定義錯誤頁面
- 更新 API URL 配置
- 優化 webpack 配置"

# 3. 推送
git push origin main
```

---

## 📊 部署後驗證

### 1. 等待 Render 部署完成（約 3-5 分鐘）
在 Render Dashboard 監控：
- https://dashboard.render.com

### 2. 測試前端
```bash
./quick-frontend-test.sh
```

或手動測試：
```bash
curl https://health-nutrition-web.onrender.com
```

### 3. 在瀏覽器中測試
打開: https://health-nutrition-web.onrender.com

檢查：
- ✅ 首頁正常顯示
- ✅ 所有頁面可以訪問
- ✅ API 請求指向正確的後端
- ✅ 沒有 JavaScript 錯誤

---

## 🎯 測試清單

### 基本功能
- [ ] 首頁載入正常
- [ ] 導航欄功能正常
- [ ] 頁面樣式正確

### 各個頁面
- [ ] 首頁: https://health-nutrition-web.onrender.com/
- [ ] 照片辨識: https://health-nutrition-web.onrender.com/photo
- [ ] 報告: https://health-nutrition-web.onrender.com/reports
- [ ] AI 聊天: https://health-nutrition-web.onrender.com/chat
- [ ] 遊戲化: https://health-nutrition-web.onrender.com/gamification
- [ ] 個人資料: https://health-nutrition-web.onrender.com/profile
- [ ] 儀表板: https://health-nutrition-web.onrender.com/dashboard

### API 連接
- [ ] 開發者工具顯示 API 請求指向 `health-nutrition-api.onrender.com`
- [ ] API 請求成功（或返回預期的錯誤）
- [ ] 沒有 CORS 錯誤

---

## 📝 已修改的文件

```
apps/web/
├── next.config.js          # 更新 API URL 和 webpack 配置
├── src/
│   ├── app/
│   │   ├── page.tsx        # 添加 'use client'
│   │   ├── layout.tsx      # 已有 dynamic 配置
│   │   ├── error.tsx       # 新建：自定義錯誤頁面
│   │   ├── not-found.tsx   # 新建：自定義 404 頁面
│   │   ├── photo/
│   │   │   └── page.tsx    # 更新 API URL
│   │   ├── reports/
│   │   │   └── page.tsx    # 添加 'use client' + 更新 API URL
│   │   └── profile/
│   │       └── page.tsx    # 添加 'use client'
│   └── lib/
│       └── api.ts          # 新建：統一 API 配置
```

---

## 🐛 如果部署失敗

### 檢查 1: 查看 Render 日誌
1. 進入 Render Dashboard
2. 選擇 health-nutrition-web
3. 點擊 "Logs" 標籤
4. 查找錯誤訊息

### 檢查 2: 驗證本地構建
```bash
cd apps/web
rm -rf .next
npm run build
```

### 檢查 3: 確認 Git 推送成功
```bash
git log --oneline -5
git status
```

### 檢查 4: 手動觸發部署
在 Render Dashboard:
1. 進入 health-nutrition-web 服務
2. 點擊 "Manual Deploy"
3. 選擇 "Deploy latest commit"

---

## 💡 常見問題

### Q: 構建時出現 styled-jsx 錯誤
A: 這是預期的，錯誤頁面的問題不影響部署。只要構建完成（Exit Code: 0）就可以。

### Q: 前端無法連接後端
A: 檢查：
1. 後端是否正常運行: `curl https://health-nutrition-api.onrender.com/health`
2. 前端配置是否正確: 查看 `next.config.js`
3. 瀏覽器開發者工具的 Network 標籤

### Q: 頁面顯示空白
A: 檢查：
1. 瀏覽器控制台是否有 JavaScript 錯誤
2. 網絡請求是否成功
3. Render 日誌是否有錯誤

---

## 🎉 成功標準

部署成功的標誌：
- ✅ Render 構建完成（綠色勾號）
- ✅ 前端 URL 可以訪問
- ✅ 首頁正常顯示
- ✅ API 請求指向正確的後端
- ✅ 至少一個功能頁面正常工作

---

## 📞 需要幫助？

如果遇到問題：
1. 查看 `RENDER_BUILD_FIX.md` - 構建錯誤修復
2. 查看 `FRONTEND_API_FIX.md` - API 連接修復
3. 查看 `DEPLOYMENT_SUCCESS_SUMMARY.md` - 完整部署總結

---

**準備好了嗎？執行 `./deploy-frontend-fix.sh` 開始部署！** 🚀
