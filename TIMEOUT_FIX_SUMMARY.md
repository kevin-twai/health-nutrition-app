# API 請求超時問題修復總結

## 問題描述
上傳圖片分析時出現 API 請求超時（60秒），後端 Render 日誌也沒有收到前端請求的記錄。

## 根本原因分析

1. **超時時間不足** - OpenAI Vision API 處理圖片需要較長時間，60秒可能不夠
2. **環境變數未設置** - 前端可能沒有正確讀取 API URL
3. **缺少連接測試** - 無法判斷是連接問題還是處理超時

## 已實施的修復

### 1. 代碼修改 ✅

**文件：** `apps/web/src/app/photo/page.tsx`

**修改內容：**
- ✅ 超時時間：60秒 → 120秒
- ✅ 添加後端連接測試（5秒超時）
- ✅ 改進錯誤處理和日誌
- ✅ 添加 API URL 日誌輸出
- ✅ 更清晰的錯誤提示

**關鍵代碼：**
```typescript
// 先測試連接
try {
  console.log('🔍 測試後端連接...')
  const healthCheck = await fetch(`${API_URL}/health`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000) // 5秒超時
  })
  console.log('✅ 後端連接正常，狀態:', healthCheck.status)
} catch (healthError) {
  console.error('❌ 後端連接失敗:', healthError)
  throw new Error('無法連接到後端服務器，請檢查網絡連接')
}

// 發送請求，120秒超時
const controller = new AbortController()
const timeoutId = setTimeout(() => {
  console.warn('⏱️ API 請求超時（120秒）')
  controller.abort()
}, 120000)
```

### 2. 診斷工具 ✅

創建了以下診斷腳本：
- `diagnose-timeout-issue.sh` - 全面的連接診斷
- `test-timeout-fix.sh` - 測試修復效果

### 3. 文檔 ✅

創建了詳細的修復指南：
- `RENDER_FRONTEND_ENV_FIX.md` - Render 環境變數設置指南
- `TIMEOUT_FIX_SUMMARY.md` - 本文檔

## 需要手動操作 ⚠️

### 在 Render Dashboard 設置環境變數

這是**最重要**的步驟！

1. 登入 [Render Dashboard](https://dashboard.render.com)
2. 選擇 `health-nutrition-web` 服務
3. 點擊 `Environment` 標籤
4. 添加環境變數：
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://health-nutrition-api.onrender.com
   ```
5. 點擊 `Save Changes`
6. Render 會自動重新部署

**為什麼重要？**
- Next.js 需要 `NEXT_PUBLIC_` 前綴才能在瀏覽器中使用環境變數
- 如果沒有設置，前端可能使用錯誤的 API URL
- 這會導致請求發送到錯誤的地址，造成超時

## 測試步驟

### 1. 等待部署完成
- GitHub 推送後，Render 會自動部署
- 預計 2-3 分鐘完成
- 在 Render Dashboard 查看部署狀態

### 2. 測試後端連接
在瀏覽器控制台執行：
```javascript
fetch('https://health-nutrition-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 3. 測試照片上傳
1. 訪問 https://health-nutrition-web.onrender.com/photo
2. 打開瀏覽器控制台 (F12)
3. 上傳一張食物照片（建議 < 1MB）
4. 查看控制台輸出

### 4. 預期輸出
```
📤 發送請求到後端 API...
🌐 API URL: https://health-nutrition-api.onrender.com
🔍 測試後端連接...
✅ 後端連接正常，狀態: 200
📤 發送照片識別請求...
📥 收到後端回應，狀態: 200
✅ OpenAI Vision API 識別成功
```

## 如果還是失敗

### 檢查清單

1. **環境變數是否設置？**
   - 在 Render Dashboard 檢查
   - 在瀏覽器控制台執行：`console.log(process.env.NEXT_PUBLIC_API_URL)`

2. **後端服務是否正常？**
   - 訪問 https://health-nutrition-api.onrender.com/health
   - 查看 Render 後端日誌

3. **圖片大小是否合適？**
   - 建議 < 1MB
   - 過大的圖片可能導致超時

4. **Render 服務狀態？**
   - 免費版可能有限制
   - 檢查是否處於休眠狀態

### 備選方案

如果 OpenAI API 超時，前端會自動回退到本地分析：
- 使用圖片顏色分析
- 基於本地食物數據庫
- 速度更快，但準確度較低

## 預期改進

| 項目 | 修復前 | 修復後 |
|------|--------|--------|
| 超時時間 | 60秒 | 120秒 |
| 連接測試 | ❌ 無 | ✅ 有（5秒） |
| 錯誤提示 | ❌ 模糊 | ✅ 清晰 |
| 日誌輸出 | ❌ 少 | ✅ 詳細 |
| 備選方案 | ✅ 有 | ✅ 有（改進） |

## 監控建議

部署後持續監控：

1. **Render Dashboard**
   - 查看服務狀態
   - 監控日誌輸出
   - 檢查錯誤率

2. **瀏覽器控制台**
   - 查看請求日誌
   - 檢查錯誤信息
   - 驗證 API URL

3. **用戶反饋**
   - 收集實際使用體驗
   - 記錄失敗案例
   - 優化超時策略

## 下一步優化

如果問題持續，考慮：

1. **圖片壓縮** - 在前端自動壓縮大圖片
2. **重試機制** - 自動重試失敗的請求
3. **進度提示** - 顯示處理進度給用戶
4. **升級服務** - 考慮 Render 付費版
5. **替代 API** - 評估其他圖片識別服務

## 總結

✅ 代碼已修復並推送
✅ 診斷工具已創建
✅ 文檔已完善
⚠️ 需要在 Render Dashboard 設置環境變數
🧪 等待部署完成後測試

**最關鍵的步驟：在 Render Dashboard 設置 `NEXT_PUBLIC_API_URL` 環境變數！**
