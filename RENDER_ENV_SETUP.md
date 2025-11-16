# Render 環境變數設置指南

## 問題
前端無法連接到後端 API，出現 503 錯誤。

## 解決方案

### 1. 在 Render Dashboard 設置環境變數

#### Web 服務 (health-nutrition-web)
1. 登入 Render Dashboard
2. 選擇 `health-nutrition-web` 服務
3. 點擊 "Environment" 標籤
4. 添加以下環境變數：

```
NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com
NODE_ENV=production
PORT=10000
```

5. 點擊 "Save Changes"
6. Render 會自動重新部署

### 2. 驗證設置

部署完成後，訪問：
```
https://health-nutrition-web.onrender.com/photo
```

打開瀏覽器控制台，應該看到：
```
🔗 API URL: https://health-nutrition-api.onrender.com
```

### 3. 測試 API 連接

在瀏覽器控制台執行：
```javascript
fetch('https://health-nutrition-api.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('API 健康檢查:', d))
```

應該返回：
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## 常見問題

### Q: 為什麼需要 NEXT_PUBLIC_ 前綴？
A: Next.js 只會將 `NEXT_PUBLIC_` 開頭的環境變數暴露給客戶端代碼。

### Q: 修改環境變數後需要重新部署嗎？
A: 是的，Render 會自動觸發重新部署。

### Q: 如何確認環境變數生效？
A: 查看頁面右下角的調試信息，或打開瀏覽器控制台查看日誌。
