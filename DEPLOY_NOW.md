# 🚀 立即部署到 Render

## 快速開始（3 步驟）

### 1️⃣ 運行部署腳本

```bash
./deploy-to-render.sh
```

這會自動：
- 提交所有更改
- 推送到 Git
- 觸發 Render 自動部署

### 2️⃣ 在 Render Dashboard 設置環境變量

1. 訪問：https://dashboard.render.com/
2. 找到你的服務：`health-nutrition-app`
3. 進入 **Environment** 標籤
4. 添加環境變量：
   ```
   OPENAI_API_KEY = sk-your-actual-api-key-here
   ```
5. 點擊 **Save Changes**

### 3️⃣ 驗證部署

```bash
./verify-render-deployment.sh https://your-app.onrender.com
```

---

## ✅ 預期結果

部署成功後，你應該看到：

1. **在 Render Logs 中**：
   ```
   ✅ 成功導入 EnhancedPromptGenerator
   🚀 健康營養追蹤系統 API 運行於 port 3001
   ```

2. **健康檢查返回**：
   ```json
   {
     "status": "healthy",
     "aiVisionAPI": {
       "chatgpt": {
         "configured": true,
         "keyPresent": true
       }
     }
   }
   ```

3. **照片識別使用增強版 prompt**

---

## 📋 重要文件

- `render.yaml` - Render 配置（已更新包含 TypeScript 編譯）
- `RENDER_DEPLOYMENT_ENHANCED_PROMPT.md` - 詳細部署指南
- `deploy-to-render.sh` - 自動部署腳本
- `verify-render-deployment.sh` - 部署驗證腳本

---

## 🆘 遇到問題？

查看詳細故障排除指南：
```bash
cat RENDER_DEPLOYMENT_ENHANCED_PROMPT.md
```

或檢查 Render Dashboard 的 Logs 標籤。

---

## 🎯 關鍵變更

這次部署包含以下重要更新：

1. ✅ TypeScript 編譯整合到構建流程
2. ✅ EnhancedPromptGenerator 成功導入
3. ✅ 增強版食物識別 prompt
4. ✅ 支持亞洲料理專業識別
5. ✅ 數量計數準確性檢查

---

**準備好了嗎？運行 `./deploy-to-render.sh` 開始部署！** 🚀
