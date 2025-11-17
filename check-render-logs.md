# 502 Bad Gateway 診斷指南

## 問題
部署成功但訪問 https://health-nutrition-web.onrender.com 出現 502 Bad Gateway

## 可能原因

### 1. 服務器沒有監聽正確的端口
Render 要求應用監聽 `PORT` 環境變量（默認 10000）

### 2. 服務器啟動失敗
應用在啟動過程中崩潰

### 3. 健康檢查失敗
Render 無法連接到應用

## 診斷步驟

### 步驟 1: 檢查 Render 日誌
1. 登入 Render Dashboard
2. 進入 `health-nutrition-web` 服務
3. 點擊 "Logs" 標籤
4. 查看最新的日誌，特別是 `npm start` 之後的輸出

### 步驟 2: 查找關鍵錯誤信息
查找以下錯誤：
- `Error: ENOENT` - 文件缺失
- `EADDRINUSE` - 端口被占用
- `Cannot find module` - 模組缺失
- 任何 JavaScript 錯誤堆疊

### 步驟 3: 檢查端口配置
Next.js 默認監聽 3000，但 Render 需要監聽 `process.env.PORT`

## 快速修復

如果日誌顯示端口問題，需要確保 Next.js 使用正確的端口：

```bash
# 在 Render Dashboard 中設置環境變量
PORT=10000
```

或修改啟動命令：
```bash
PORT=10000 npm start
```

## 請提供
請複製 Render 日誌中 `==> Running 'npm start'` 之後的所有輸出，這樣我可以準確診斷問題。
