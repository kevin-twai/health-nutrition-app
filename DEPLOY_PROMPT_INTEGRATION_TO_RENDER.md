# 部署 Prompt 整合到 Render

## 🎯 部署目標

將整合後的 prompt 系統部署到 Render，使生產環境使用最新的改進。

## ✅ 整合完成狀態

- ✅ 代碼整合完成
- ✅ 測試全部通過
- ✅ 文檔已更新
- ✅ 準備部署

## 📋 部署前檢查清單

### 1. 確認整合的文件
```bash
# 主要修改的文件
apps/api/src/utils/simpleVisionHelper.js  # 已更新

# 相關文件（無需修改）
apps/api/src/simple-server.js              # 已使用 simpleVisionHelper
apps/api/src/services/EnhancedPromptGenerator.ts  # 保持不變
```

### 2. 確認環境變量
確保 Render 上已設置：
- `OPENAI_API_KEY` - OpenAI API 密鑰

### 3. 測試本地運行
```bash
# 測試整合
node test-prompt-integration.js

# 啟動服務器測試
node apps/api/src/simple-server.js
```

## 🚀 部署步驟

### 方法 1：Git Push 自動部署（推薦）

```bash
# 1. 提交更改
git add apps/api/src/utils/simpleVisionHelper.js
git add PROMPT_INTEGRATION_*.md
git add INTEGRATION_*.md
git add test-prompt-integration.js

# 2. 創建提交
git commit -m "feat: integrate prompt systems for improved food recognition

- Integrated EnhancedPromptGenerator and simple-server prompt logic
- Added detailed counting accuracy warnings
- Added mandatory checklist (eggs, soups, staples, vegetables, seasonings)
- Added portion calculation guidelines
- Added indigenous cuisine identification support
- All tests passing

Key improvements:
- Better counting accuracy for countable items
- Reduced missing ingredients through mandatory checklist
- More accurate portion estimation
- Support for Taiwanese indigenous cuisine"

# 3. 推送到遠程倉庫
git push origin main

# Render 會自動檢測到更改並開始部署
```

### 方法 2：手動部署

如果自動部署未觸發：

1. 登入 Render Dashboard: https://dashboard.render.com
2. 找到你的 API 服務
3. 點擊 "Manual Deploy" > "Deploy latest commit"
4. 等待部署完成

## 📊 部署後驗證

### 1. 檢查部署狀態

```bash
# 檢查 Render 服務狀態
curl https://your-api.onrender.com/health

# 預期回應應包含：
# {
#   "status": "healthy",
#   "aiVisionAPI": {
#     "chatgpt": {
#       "configured": true
#     }
#   }
# }
```

### 2. 測試 Prompt 整合

創建測試腳本 `test-render-prompt-integration.sh`:

```bash
#!/bin/bash

API_URL="https://your-api.onrender.com"

echo "🧪 測試 Render 上的 Prompt 整合..."
echo ""

# 測試 1: 健康檢查
echo "📝 測試 1: 健康檢查"
curl -s "$API_URL/health" | jq '.status, .aiVisionAPI.chatgpt.configured'
echo ""

# 測試 2: 上傳測試圖片
echo "📝 測試 2: 食物識別測試"
echo "請手動測試: $API_URL/test-vision-api"
echo ""

echo "✅ 測試完成！"
```

### 3. 功能驗證

訪問測試頁面：
```
https://your-api.onrender.com/test-vision-api
```

上傳測試圖片，驗證：
- ✅ 計數準確性（可數食材如蛋、餃子等）
- ✅ 完整性（是否識別了湯汁、主食、蔬菜等）
- ✅ 份量估算（是否使用標準份量參考）
- ✅ 原住民料理識別（如果適用）

## 🔍 監控和日誌

### 查看部署日誌

1. 在 Render Dashboard 中
2. 選擇你的服務
3. 點擊 "Logs" 標籤
4. 查找以下關鍵信息：

```
✅ 成功啟動的標誌：
🚀 健康營養追蹤系統 API 運行於 port 3001

⚠️ 需要注意的警告：
⚠️ 無法導入 EnhancedPromptGenerator，使用回退方案
（這是正常的，因為 TypeScript 可能未編譯）

✅ Prompt 生成成功：
✅ 成功生成 prompt
📏 Prompt 長度: 2721 字元
```

### 監控 API 調用

```bash
# 查看最近的 API 調用
curl https://your-api.onrender.com/api/v1/monitoring/stats

# 查看錯誤日誌
curl https://your-api.onrender.com/api/v1/monitoring/errors
```

## 🐛 故障排除

### 問題 1: 部署失敗

**症狀**: Render 顯示部署失敗

**解決方案**:
```bash
# 檢查 package.json 中的啟動命令
cat apps/api/package.json | grep "start"

# 確保啟動命令正確
"start": "node src/simple-server.js"
```

### 問題 2: Prompt 未生效

**症狀**: 食物識別結果沒有改進

**解決方案**:
1. 檢查 `simpleVisionHelper.js` 是否正確部署
2. 查看日誌確認 prompt 生成成功
3. 驗證 OpenAI API 密鑰是否正確設置

```bash
# 檢查環境變量
curl https://your-api.onrender.com/health | jq '.aiVisionAPI'
```

### 問題 3: TypeScript 編譯錯誤

**症狀**: EnhancedPromptGenerator 無法導入

**解決方案**:
這是預期行為。系統會自動回退到 `generateFallbackPrompt()`，
該函數已經整合了所有改進。

```javascript
// simpleVisionHelper.js 會自動處理
if (EnhancedPromptGenerator) {
  // 使用 TypeScript 版本
} else {
  // 使用回退方案（已整合所有改進）
  return generateFallbackPrompt(retryCount);
}
```

## 📈 預期改進

部署後，你應該看到以下改進：

### 1. 計數準確性提升
- ❌ 之前：可能將 5 個生蠔誤報為 10 個
- ✅ 現在：準確計數為 5 個

### 2. 減少遺漏
- ❌ 之前：可能遺漏蛋類、湯汁、調味料
- ✅ 現在：通過強制檢查清單確保識別

### 3. 更準確的份量估算
- ❌ 之前：模糊的份量描述
- ✅ 現在：基於標準份量參考的精確估算

### 4. 文化適應性
- ❌ 之前：無法識別原住民料理
- ✅ 現在：支援小米阿粨、馬告、竹筒飯等

## 📊 A/B 測試建議

如果想比較整合前後的效果：

1. **保留舊版本的備份**
   ```bash
   git tag v1.0-before-prompt-integration
   ```

2. **收集數據**
   - 識別準確率
   - 用戶反饋
   - 常見錯誤類型

3. **比較結果**
   - 計數錯誤減少率
   - 遺漏食材減少率
   - 用戶滿意度提升

## 🎉 部署完成檢查

- [ ] Git 提交已推送
- [ ] Render 部署成功
- [ ] 健康檢查通過
- [ ] 測試頁面可訪問
- [ ] 上傳測試圖片驗證功能
- [ ] 日誌顯示正常
- [ ] 監控數據正常

## 📝 部署記錄

**部署時間**: _______________
**部署版本**: _______________
**部署人員**: _______________
**測試結果**: _______________

## 🔗 相關資源

- **整合指南**: PROMPT_INTEGRATION_GUIDE.md
- **整合總結**: INTEGRATION_COMPLETE.md
- **測試腳本**: test-prompt-integration.js
- **Render Dashboard**: https://dashboard.render.com

---

**部署狀態**: 準備就緒 ✅
**預計部署時間**: 5-10 分鐘
**風險等級**: 低（向後兼容，已測試）
