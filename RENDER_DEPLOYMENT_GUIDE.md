# 🚀 Render 部署指南 - 食物識別準確度改進

## 📋 部署前準備

### 1. 確認本地部署成功

```bash
# 驗證文件已複製
ls -la apps/api/src/services/AsianCuisineKnowledgeBase.ts
ls -la apps/api/src/data/asianFoodItems.ts

# 確認部署成功
bash verify-deployment-package.sh
```

### 2. 提交代碼到 Git

```bash
# 添加新文件
git add apps/api/src/services/AsianCuisineKnowledgeBase.ts
git add apps/api/src/services/EnhancedPromptGenerator.ts
git add apps/api/src/services/MultiStageRecognitionEngine.ts
git add apps/api/src/services/ResultValidator.ts
git add apps/api/src/services/*ValidationRules.ts
git add apps/api/src/services/Feedback*.ts
git add apps/api/src/services/FoodRecognition*.ts
git add apps/api/src/services/RecognitionResultCache.ts
git add apps/api/src/services/KnowledgeBaseQueryOptimizer.ts

# 添加數據文件
git add apps/api/src/data/asianFoodItems.ts
git add apps/api/src/data/asianFoodItemsExtended.ts
git add apps/api/src/data/dishPatterns.ts
git add apps/api/src/data/index.ts

# 添加類型定義
git add apps/api/src/types/AsianCuisineKnowledgeBase.ts

# 提交
git commit -m "feat: 部署食物識別準確度改進功能

- 添加亞洲料理知識庫 (200+ 食材)
- 添加增強型 Prompt 生成器
- 添加多階段識別引擎
- 添加結果驗證系統
- 添加反饋學習機制
- 添加性能監控系統
"

# 推送到遠端
git push origin main
```

---

## 🌐 Render 部署步驟

### 步驟 1: 登入 Render

1. 前往 https://render.com
2. 登入您的帳號
3. 進入 Dashboard

### 步驟 2: 更新環境變數

1. 在 Render Dashboard 中找到您的 API 服務
2. 點擊服務名稱進入設置頁面
3. 點擊左側的 "Environment" 標籤
4. 添加/更新以下環境變數：

```env
# OpenAI 配置（必需）
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o

# 識別配置
RECOGNITION_CONFIDENCE_THRESHOLD=85

# 性能監控（可選）
PERFORMANCE_MONITORING_ENABLED=true
SLOW_OPERATION_THRESHOLD=1000

# 快取配置（可選）
CACHE_ENABLED=true
CACHE_TTL=3600

# 日誌配置（可選）
LOG_LEVEL=info
```

5. 點擊 "Save Changes"

### 步驟 3: 觸發部署

有兩種方式觸發部署：

#### 方式 A: 自動部署（推薦）

如果您已經設置了自動部署，推送代碼後 Render 會自動開始部署。

#### 方式 B: 手動部署

1. 在服務頁面點擊右上角的 "Manual Deploy"
2. 選擇 "Deploy latest commit"
3. 等待部署完成

### 步驟 4: 監控部署進度

1. 在服務頁面點擊 "Logs" 標籤
2. 觀察部署日誌
3. 確認沒有錯誤訊息

預期看到的日誌：
```
==> Building...
==> Installing dependencies...
==> Building TypeScript...
==> Starting server...
✓ Server started on port 3001
```

### 步驟 5: 驗證部署

部署完成後，測試新功能：

```bash
# 設置 API URL
export API_URL="https://your-app.onrender.com"

# 測試健康檢查
curl $API_URL/health

# 測試知識庫端點（如果有暴露）
curl $API_URL/api/food-recognition/knowledge-base/stats
```

---

## 🧪 測試部署的功能

### 測試 1: 基本健康檢查

```bash
curl https://your-app.onrender.com/health
```

預期響應：
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T12:00:00.000Z"
}
```

### 測試 2: 食物識別功能

創建測試腳本 `test-render-deployment.sh`:

```bash
#!/bin/bash

API_URL="https://your-app.onrender.com"

echo "🧪 測試 Render 部署..."
echo ""

# 1. 健康檢查
echo "1️⃣ 測試健康檢查..."
curl -s $API_URL/health | jq .
echo ""

# 2. 測試照片識別（需要有測試圖片）
echo "2️⃣ 測試照片識別..."
# 這裡需要實際的圖片上傳測試

echo ""
echo "✅ 測試完成！"
```

### 測試 3: 使用 Web 界面測試

1. 前往您的 Web 應用
2. 登入帳號
3. 上傳一張食物照片
4. 觀察識別結果是否使用了新的知識庫

預期改進：
- ✅ 更準確的亞洲料理識別
- ✅ 更詳細的食材分析
- ✅ 更合理的營養估算
- ✅ 更快的響應時間（有快取）

---

## 📊 監控部署狀態

### 在 Render Dashboard 中監控

1. **Metrics 標籤**
   - CPU 使用率
   - 記憶體使用率
   - 請求數量
   - 響應時間

2. **Logs 標籤**
   - 應用日誌
   - 錯誤日誌
   - 部署日誌

3. **Events 標籤**
   - 部署歷史
   - 服務重啟記錄

### 使用性能監控端點

如果您啟用了性能監控，可以訪問：

```bash
# 獲取性能指標
curl https://your-app.onrender.com/api/monitoring/metrics

# 獲取食物識別性能
curl https://your-app.onrender.com/api/food-recognition/monitoring/performance
```

---

## 🔧 故障排除

### 問題 1: 部署失敗

**症狀**: 部署過程中出現錯誤

**解決方案**:
```bash
# 檢查 Render 日誌
# 常見問題：
# 1. 缺少依賴 - 確認 package.json 包含 openai
# 2. TypeScript 編譯錯誤 - 本地先運行 npm run build
# 3. 環境變數缺失 - 檢查 OPENAI_API_KEY 是否設置
```

### 問題 2: 服務啟動但功能異常

**症狀**: 服務運行但食物識別不工作

**解決方案**:
```bash
# 1. 檢查環境變數
# 在 Render Dashboard 確認 OPENAI_API_KEY 已設置

# 2. 檢查日誌
# 查看是否有 API 調用錯誤

# 3. 測試 OpenAI 連接
curl https://your-app.onrender.com/api/test/openai
```

### 問題 3: 記憶體不足

**症狀**: 服務頻繁重啟或 OOM 錯誤

**解決方案**:
1. 升級 Render 計劃以獲得更多記憶體
2. 啟用快取以減少 API 調用
3. 優化知識庫載入（延遲載入）

### 問題 4: 響應時間過長

**症狀**: API 響應緩慢

**解決方案**:
```bash
# 1. 啟用快取
# 在環境變數中設置：
CACHE_ENABLED=true
CACHE_TTL=3600

# 2. 優化 Prompt 生成
# 減少不必要的知識庫查詢

# 3. 使用更快的 OpenAI 模型
OPENAI_MODEL=gpt-4o-mini  # 更快但可能準確度略低
```

---

## 📈 性能優化建議

### 1. 啟用快取

```env
CACHE_ENABLED=true
CACHE_TTL=3600
```

### 2. 使用 Redis（如果可用）

在 Render 中添加 Redis 服務：
1. 創建新的 Redis 服務
2. 獲取 Redis URL
3. 在 API 服務中添加環境變數：
   ```env
   REDIS_URL=redis://...
   ```

### 3. 監控性能指標

```env
PERFORMANCE_MONITORING_ENABLED=true
SLOW_OPERATION_THRESHOLD=1000
```

### 4. 優化日誌級別

生產環境使用：
```env
LOG_LEVEL=warn  # 只記錄警告和錯誤
```

---

## ✅ 部署檢查清單

部署到 Render 前確認：

- [ ] 本地部署成功
- [ ] 所有文件已提交到 Git
- [ ] 代碼已推送到遠端倉庫
- [ ] Render 環境變數已設置
- [ ] OPENAI_API_KEY 已配置
- [ ] 部署觸發成功
- [ ] 部署日誌無錯誤
- [ ] 健康檢查通過
- [ ] 功能測試通過
- [ ] 性能監控正常

---

## 🎉 部署完成後

### 驗證新功能

1. **測試亞洲料理識別**
   - 上傳滷肉飯照片
   - 確認識別準確
   - 檢查營養資訊

2. **測試多階段識別**
   - 上傳複雜料理照片
   - 觀察識別過程
   - 確認結果驗證

3. **測試反饋系統**
   - 提交用戶反饋
   - 確認反饋被記錄
   - 檢查改進建議

### 監控運行狀態

```bash
# 定期檢查性能
curl https://your-app.onrender.com/api/monitoring/metrics

# 檢查錯誤率
curl https://your-app.onrender.com/api/monitoring/errors

# 檢查識別準確度
curl https://your-app.onrender.com/api/food-recognition/monitoring/accuracy
```

---

## 📞 獲取幫助

### Render 相關問題
- Render 文檔: https://render.com/docs
- Render 支援: https://render.com/support

### 應用相關問題
- 查看部署文檔: `cat DEPLOYMENT_STEP_BY_STEP.md`
- 查看用戶指南: `cat deploy-minimal/docs/USER_GUIDE.md`
- 查看技術文檔: `cat deploy-minimal/docs/TECHNICAL_DOCUMENTATION.md`

---

## 🎊 恭喜！

您已成功將食物識別準確度改進功能部署到 Render！

**下一步**:
1. 監控性能指標
2. 收集用戶反饋
3. 持續優化改進

**祝您使用愉快！** 🚀
