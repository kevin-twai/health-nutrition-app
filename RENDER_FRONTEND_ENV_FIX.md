# Render 前端環境變數設置指南

## 問題
前端請求超時（60秒），後端沒有收到請求記錄。

## 根本原因
1. **超時時間太短** - OpenAI Vision API 需要較長處理時間
2. **環境變數未在 Render 上設置** - 前端可能使用錯誤的 API URL
3. **Render 免費版限制** - 可能有請求大小或處理時間限制

## 解決方案

### 1. 在 Render Dashboard 設置前端環境變數

登入 Render Dashboard → 選擇 `health-nutrition-web` 服務 → Environment

添加以下環境變數：

```
NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com
```

**重要：** Next.js 的環境變數必須以 `NEXT_PUBLIC_` 開頭才能在瀏覽器中使用！

### 2. 代碼修改

已修改前端代碼：
- ✅ 增加超時時間從 60 秒到 120 秒
- ✅ 添加後端連接測試
- ✅ 改進錯誤處理和日誌
- ✅ 添加 API URL 日誌輸出

### 3. 部署步驟

```bash
# 提交代碼更改
git add apps/web/src/app/photo/page.tsx
git commit -m "fix: 增加 API 請求超時時間到 120 秒並改進錯誤處理"
git push origin main
```

### 4. 在 Render Dashboard 檢查

1. **前端服務 (health-nutrition-web)**
   - 確認環境變數 `NEXT_PUBLIC_API_URL` 已設置
   - 查看部署日誌，確認構建成功
   - 檢查服務狀態是否為 "Live"

2. **後端服務 (health-nutrition-api)**
   - 查看日誌，確認服務正常運行
   - 檢查是否有錯誤或警告
   - 確認服務狀態是否為 "Live"

### 5. 測試步驟

部署完成後，在瀏覽器控制台測試：

```javascript
// 1. 測試後端連接
fetch('https://health-nutrition-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// 2. 檢查前端環境變數
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)

// 3. 測試照片上傳
// 在前端頁面上傳一張照片，查看控制台日誌
```

### 6. 預期結果

上傳照片後，控制台應該顯示：

```
📤 發送請求到後端 API...
🌐 API URL: https://health-nutrition-api.onrender.com
🔍 測試後端連接...
✅ 後端連接正常，狀態: 200
📤 發送照片識別請求...
📥 收到後端回應，狀態: 200
✅ OpenAI Vision API 識別成功
```

### 7. 如果還是超時

可能的原因：

1. **Render 免費版限制**
   - 免費版有 512MB 內存限制
   - 請求處理時間可能受限
   - 考慮升級到付費版

2. **圖片文件太大**
   - 壓縮圖片到 1MB 以下
   - 在前端添加圖片壓縮功能

3. **OpenAI API 響應慢**
   - OpenAI Vision API 在高峰時段可能較慢
   - 考慮添加重試機制
   - 或使用本地分析作為備選方案

### 8. 臨時解決方案

如果問題持續，可以：

1. **使用本地分析** - 前端已有本地分析功能作為備選
2. **減少圖片大小** - 在上傳前壓縮圖片
3. **增加重試次數** - 自動重試失敗的請求

## 下一步

1. 在 Render Dashboard 設置環境變數
2. 等待前端重新部署（約 2-3 分鐘）
3. 測試照片上傳功能
4. 查看瀏覽器控制台和 Render 日誌

## 監控

部署後，持續監控：
- Render Dashboard 的服務狀態
- 瀏覽器控制台的錯誤日誌
- Render 日誌中的請求記錄
