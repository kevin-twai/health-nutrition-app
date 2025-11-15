# Render 服務超時問題修正

## 🔍 問題描述

當前 Render 服務無法響應請求，所有 API 調用都超時。

### 症狀
- `/health` 端點超時（30秒無響應）
- `/api/v1/photo/recognize` 端點超時
- Render 日誌顯示服務已啟動，但無法處理請求

### Render 日誌顯示
```
✅ 所有路由註冊完成
✓ PhotoController 初始化完成 - 使用增強型識別引擎
```

## 🎯 可能原因

### 1. Render 免費方案休眠
- 免費方案在 15 分鐘無活動後會休眠
- 第一次請求需要等待服務喚醒（可能需要 30-60 秒）

### 2. 服務啟動後崩潰
- 可能在處理第一個請求時崩潰
- 需要檢查 Render 完整日誌

### 3. 端口綁定問題
- Render 需要服務監聽 `process.env.PORT`
- 如果端口配置錯誤，服務無法接收請求

### 4. 健康檢查失敗
- Render 可能在等待健康檢查通過
- 如果健康檢查一直失敗，服務會被標記為不健康

## 🔧 解決方案

### 方案 1：等待服務喚醒（推薦先嘗試）

Render 免費方案需要時間喚醒，請：

1. **等待 60-90 秒**
2. **重新測試**：
   ```bash
   curl -X GET https://health-nutrition-app.onrender.com/health --max-time 90
   ```

### 方案 2：檢查 Render Dashboard

1. 登入 Render Dashboard: https://dashboard.render.com
2. 找到服務 "health-nutrition-app"
3. 查看 "Logs" 標籤
4. 檢查是否有錯誤訊息

### 方案 3：檢查端口配置

確認 `apps/api/src/index.ts` 中的端口配置：

```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 方案 4：簡化健康檢查

如果健康檢查太複雜導致超時，簡化 `/health` 端點：

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### 方案 5：手動重啟服務

在 Render Dashboard 中：
1. 進入服務頁面
2. 點擊 "Manual Deploy" → "Clear build cache & deploy"
3. 等待重新部署完成

## 📊 診斷步驟

### 1. 測試基本連接
```bash
# 測試 DNS 解析
nslookup health-nutrition-app.onrender.com

# 測試 TCP 連接
nc -zv health-nutrition-app.onrender.com 443
```

### 2. 測試健康檢查（長超時）
```bash
# 給予 90 秒超時時間
curl -X GET https://health-nutrition-app.onrender.com/health --max-time 90 -v
```

### 3. 測試根端點
```bash
# 測試根路徑
curl -X GET https://health-nutrition-app.onrender.com/ --max-time 90
```

### 4. 檢查 Render 服務狀態
```bash
# 查看 Render 狀態頁面
open https://status.render.com
```

## 🚀 下一步行動

### 立即執行：

1. **等待 2 分鐘**，讓服務有時間完全啟動
2. **重新測試健康檢查**：
   ```bash
   curl -X GET https://health-nutrition-app.onrender.com/health --max-time 90
   ```
3. **如果仍然超時**，檢查 Render Dashboard 的完整日誌
4. **如果日誌顯示錯誤**，根據錯誤訊息修正代碼
5. **如果沒有錯誤但仍超時**，嘗試手動重啟服務

### 如果問題持續：

可能需要：
- 升級到 Render 付費方案（避免休眠問題）
- 或使用其他部署平台（如 Railway, Fly.io）
- 或在本地運行服務進行測試

## 📝 當前狀態

- ✅ 代碼已推送到 GitHub
- ✅ Render 已檢測到新提交
- ⏳ 等待服務完全啟動
- ❌ 服務無法響應請求（超時）

## 🔗 相關資源

- Render Dashboard: https://dashboard.render.com
- Render 文檔: https://render.com/docs
- Render 狀態: https://status.render.com
