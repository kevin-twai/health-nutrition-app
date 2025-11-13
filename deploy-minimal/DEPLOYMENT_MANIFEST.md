# 食物識別準確度改進 - 部署清單

## 版本資訊
- **版本**: 1.0.0
- **發布日期**: $(date +%Y-%m-%d)
- **部署類型**: 最小化部署（僅新功能）

## 包含的文件

### 核心服務 (13 個文件)
- AsianCuisineKnowledgeBase.ts - 知識庫系統
- EnhancedPromptGenerator.ts - Prompt 生成器
- MultiStageRecognitionEngine.ts - 多階段識別引擎
- ResultValidator.ts - 結果驗證器
- AsianCuisineValidationRules.ts - 亞洲料理驗證規則
- NutritionValidationRules.ts - 營養驗證規則
- FeedbackCollector.ts - 反饋收集器
- FeedbackAnalyzer.ts - 反饋分析器
- FeedbackImprover.ts - 反饋改進器
- FoodRecognitionPerformanceMonitor.ts - 性能監控
- FoodRecognitionLogger.ts - 日誌記錄
- RecognitionResultCache.ts - 結果快取
- KnowledgeBaseQueryOptimizer.ts - 查詢優化

### 數據文件
- asianFoodItems.ts - 基礎食材數據（200+ 種）
- asianFoodItemsExtended.ts - 擴展食材數據
- dishPatterns.ts - 料理模式數據

### 類型定義
- AsianCuisineKnowledgeBase.ts - 知識庫類型定義

### 文檔
- TECHNICAL_DOCUMENTATION.md - 技術文檔
- USER_GUIDE.md - 用戶指南
- DEPLOYMENT_GUIDE.md - 部署指南
- CONTINUOUS_IMPROVEMENT.md - 持續改進流程
- IMPLEMENTATION_SUMMARY.md - 實施總結
- BUILD_STATUS.md - 建置狀態

## 部署步驟

1. **解壓部署包**
   ```bash
   tar -xzf food-recognition-accuracy-v1.0.0.tar.gz
   cd deploy-minimal
   ```

2. **整合到現有系統**
   - 將 services/ 目錄複製到您的 API 服務中
   - 將 data/ 目錄複製到相應位置
   - 將 types/ 目錄複製到相應位置

3. **配置環境變數**
   確保設置以下環境變數：
   - OPENAI_API_KEY
   - OPENAI_MODEL (建議: gpt-4o)
   - RECOGNITION_CONFIDENCE_THRESHOLD (建議: 85)

4. **驗證部署**
   ```bash
   # 驗證知識庫
   npx tsx services/AsianCuisineKnowledgeBase.ts
   
   # 測試 Prompt 生成
   npx tsx services/EnhancedPromptGenerator.ts
   ```

5. **開始使用**
   參考 TECHNICAL_DOCUMENTATION.md 了解如何使用各個組件

## 使用範例

```typescript
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';
import { MultiStageRecognitionEngine } from './services/MultiStageRecognitionEngine';

// 初始化
const knowledgeBase = new AsianCuisineKnowledgeBase();
const promptGenerator = new EnhancedPromptGenerator('zh-TW');
const recognitionEngine = new MultiStageRecognitionEngine(
  knowledgeBase,
  promptGenerator
);

// 使用
const result = await recognitionEngine.recognize(imageBuffer);
console.log(result);
```

## 注意事項

- 此為最小化部署，僅包含新功能
- 不包含有編譯錯誤的舊代碼
- 可以獨立使用或整合到現有系統
- 建議先在測試環境驗證

## 支援

如有問題，請參考：
- 技術文檔: docs/TECHNICAL_DOCUMENTATION.md
- 用戶指南: docs/USER_GUIDE.md
- 部署指南: docs/DEPLOYMENT_GUIDE.md
