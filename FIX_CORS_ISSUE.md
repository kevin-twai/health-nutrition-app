# 修復 CORS 問題

## 問題
前端請求超時，後端沒有收到請求。這是因為 CORS 配置沒有包含前端的 Render URL。

## 解決方案

### 在 Render Dashboard 添加環境變數

1. **登入 Render Dashboard**: https://dashboard.render.com
2. **選擇 `health-nutrition-api` 服務**（後端 API）
3. **點擊 "Environment" 標籤**
4. **添加新的環境變數**:

```
Key: ALLOWED_ORIGINS
Value: http://localhost:3000,http://localhost:3001,https://health-nutrition-web.onrender.com
```

5. **點擊 "Save Changes"**
6. **等待自動重新部署**（約 2-3 分鐘）

## 為什麼需要這個？

後端的 CORS 配置（`apps/api/src/config/gateway.ts`）從環境變數讀取允許的來源：

```typescript
allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://health-tracker.local'
]
```

默認配置只包含本地開發環境的 URL，沒有包含 Render 的前端 URL。

## 驗證修復

部署完成後，測試 CORS：

```bash
curl -X OPTIONS https://health-nutrition-api.onrender.com/api/v1/photo/recognize \
  -H "Origin: https://health-nutrition-web.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v 2>&1 | grep "access-control-allow-origin"
```

應該看到：
```
< access-control-allow-origin: https://health-nutrition-web.onrender.com
```

## 測試照片辨識

1. 訪問 https://health-nutrition-web.onrender.com/photo
2. 上傳食物照片
3. 點擊「開始分析」
4. 應該能看到分析結果

## 其他需要的環境變數

確保 API 服務還有這些環境變數：

```
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=<your-openai-key>
MONGODB_URI=<your-mongodb-uri>
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://health-nutrition-web.onrender.com
```

## 如果還有問題

檢查 Render 日誌：
1. 進入 `health-nutrition-api` 服務
2. 點擊 "Logs" 標籤
3. 查找 CORS 相關錯誤

或者在瀏覽器控制台查看詳細錯誤訊息。
