# 食物識別準確度改進 v1.0.0

> 🎯 專為亞洲料理優化的高準確度食物識別系統

## 📦 這是什麼？

這是一個**最小化部署包**，包含了食物識別準確度改進的所有核心功能，可以獨立使用或整合到現有系統中。

### ✨ 核心特性

- 🌏 **亞洲料理專精** - 200+ 種食材，50+ 種料理模式
- 🎯 **高準確度** - 多階段識別流程，目標準確度 85%+
- 🚀 **高性能** - 智能快取、查詢優化、異步處理
- 📈 **持續改進** - 反饋學習機制，自動分析優化
- 🔍 **智能驗證** - 自動驗證識別結果的合理性
- 📊 **性能監控** - 實時追蹤準確度和性能指標

## 🚀 快速開始

### 5 分鐘快速部署

```bash
# 1. 解壓（如果還沒解壓）
tar -xzf food-recognition-accuracy-v1.0.0.tar.gz
cd deploy-minimal

# 2. 查看快速開始指南
cat QUICK_START.md

# 3. 整合到您的項目
cp -r services/* /path/to/your/project/src/services/
cp -r data/* /path/to/your/project/src/data/
cp -r types/* /path/to/your/project/src/types/
```

### 基本使用

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

// 識別食物
const result = await recognitionEngine.recognize(imageBuffer);
console.log(result);
```

## 📚 文檔導航

### 🎯 開始使用
- **[QUICK_START.md](./QUICK_START.md)** - 5 分鐘快速上手指南
- **[DEPLOYMENT_MANIFEST.md](./DEPLOYMENT_MANIFEST.md)** - 完整部署清單

### 📖 深入學習
- **[docs/USER_GUIDE.md](./docs/USER_GUIDE.md)** - 完整用戶指南
- **[docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md)** - 技術架構文檔
- **[docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** - 生產環境部署指南

### 🔧 開發參考
- **[docs/requirements.md](./docs/requirements.md)** - 功能需求文檔
- **[docs/design.md](./docs/design.md)** - 系統設計文檔
- **[docs/tasks.md](./docs/tasks.md)** - 實施任務清單

### 📊 狀態報告
- **[docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)** - 實施總結
- **[docs/BUILD_STATUS.md](./docs/BUILD_STATUS.md)** - 建置狀態
- **[docs/CONTINUOUS_IMPROVEMENT.md](./docs/CONTINUOUS_IMPROVEMENT.md)** - 持續改進流程

## 📂 目錄結構

```
deploy-minimal/
├── README.md                      # 本文件
├── QUICK_START.md                 # 快速開始指南
├── DEPLOYMENT_MANIFEST.md         # 部署清單
│
├── services/                      # 核心服務 (13 個文件)
│   ├── AsianCuisineKnowledgeBase.ts          # 知識庫系統
│   ├── EnhancedPromptGenerator.ts            # Prompt 生成器
│   ├── MultiStageRecognitionEngine.ts        # 多階段識別引擎
│   ├── ResultValidator.ts                    # 結果驗證器
│   ├── AsianCuisineValidationRules.ts        # 亞洲料理驗證規則
│   ├── NutritionValidationRules.ts           # 營養驗證規則
│   ├── FeedbackCollector.ts                  # 反饋收集器
│   ├── FeedbackAnalyzer.ts                   # 反饋分析器
│   ├── FeedbackImprover.ts                   # 反饋改進器
│   ├── FoodRecognitionPerformanceMonitor.ts  # 性能監控
│   ├── FoodRecognitionLogger.ts              # 日誌記錄
│   ├── RecognitionResultCache.ts             # 結果快取
│   └── KnowledgeBaseQueryOptimizer.ts        # 查詢優化
│
├── data/                          # 數據文件 (4 個文件)
│   ├── asianFoodItems.ts          # 基礎食材數據 (200+ 種)
│   ├── asianFoodItemsExtended.ts  # 擴展食材數據
│   ├── dishPatterns.ts            # 料理模式數據 (50+ 種)
│   ├── index.ts                   # 數據導出
│   └── README.md                  # 數據說明
│
├── types/                         # 類型定義 (1 個文件)
│   └── AsianCuisineKnowledgeBase.ts
│
└── docs/                          # 完整文檔 (11 個文件)
    ├── USER_GUIDE.md
    ├── TECHNICAL_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    ├── CONTINUOUS_IMPROVEMENT.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── BUILD_STATUS.md
    ├── QUICK_START.md
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

## 🎯 核心組件

### 1. 知識庫系統
**文件**: `services/AsianCuisineKnowledgeBase.ts`

提供 200+ 種亞洲食材和 50+ 種料理模式的結構化知識。

```typescript
const kb = new AsianCuisineKnowledgeBase();
const ingredients = kb.getAllIngredients();
const patterns = kb.getDishPatterns();
```

### 2. Prompt 生成器
**文件**: `services/EnhancedPromptGenerator.ts`

根據上下文動態生成最佳提示詞，支援多語言。

```typescript
const generator = new EnhancedPromptGenerator('zh-TW');
const prompt = generator.generateInitialPrompt();
```

### 3. 識別引擎
**文件**: `services/MultiStageRecognitionEngine.ts`

多階段識別流程：初步識別 → 詳細分析 → 結果驗證。

```typescript
const engine = new MultiStageRecognitionEngine(kb, generator);
const result = await engine.recognize(imageBuffer);
```

### 4. 結果驗證器
**文件**: `services/ResultValidator.ts`

自動驗證識別結果的合理性，包含營養和料理規則。

```typescript
const validator = new ResultValidator();
const validated = await validator.validate(result);
```

### 5. 反饋系統
**文件**: `services/FeedbackCollector.ts`, `FeedbackAnalyzer.ts`, `FeedbackImprover.ts`

收集用戶反饋，自動分析並持續改進系統。

```typescript
const collector = new FeedbackCollector();
await collector.collectFeedback({
  recognitionId: result.id,
  userCorrection: '這是滷肉飯',
  rating: 5
});
```

### 6. 性能監控
**文件**: `services/FoodRecognitionPerformanceMonitor.ts`

實時追蹤識別準確度和性能指標。

```typescript
const monitor = new FoodRecognitionPerformanceMonitor();
monitor.trackRecognition(result);
const metrics = monitor.getMetrics();
```

## 🔧 環境配置

### 必需的環境變數

```env
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o
RECOGNITION_CONFIDENCE_THRESHOLD=85
```

### 可選的環境變數

```env
# 性能監控
PERFORMANCE_MONITORING_ENABLED=true
SLOW_OPERATION_THRESHOLD=1000

# 快取配置
CACHE_ENABLED=true
CACHE_TTL=3600

# 日誌配置
LOG_LEVEL=info
LOG_DIR=logs
```

## 📊 功能統計

- **服務文件**: 13 個
- **數據文件**: 4 個
- **類型文件**: 1 個
- **文檔文件**: 11 個
- **總代碼行數**: ~5,000 行
- **食材數量**: 200+ 種
- **料理模式**: 50+ 種
- **驗證規則**: 30+ 條

## 🎓 使用建議

### 初學者路徑
1. 閱讀 `QUICK_START.md` 快速上手
2. 運行基本範例了解用法
3. 查看 `docs/USER_GUIDE.md` 學習所有功能

### 進階用戶路徑
1. 閱讀 `docs/TECHNICAL_DOCUMENTATION.md` 了解架構
2. 查看 `docs/design.md` 理解設計決策
3. 整合進階功能（反饋、監控、優化）

### 開發者路徑
1. 閱讀 `docs/requirements.md` 了解需求
2. 查看 `docs/tasks.md` 了解實施過程
3. 閱讀源代碼深入理解實現

## 🔍 驗證部署

### 檢查文件完整性

```bash
# 檢查服務文件
ls services/*.ts | wc -l
# 預期: 13

# 檢查數據文件
ls data/*.ts | wc -l
# 預期: 4
```

### 測試基本功能

```bash
# 測試知識庫
npx tsx -e "
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase.ts';
const kb = new AsianCuisineKnowledgeBase();
console.log('✓ 知識庫載入成功');
console.log('食材數量:', kb.getAllIngredients().length);
"

# 測試 Prompt 生成器
npx tsx -e "
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator.ts';
const gen = new EnhancedPromptGenerator('zh-TW');
console.log('✓ Prompt 生成器初始化成功');
"
```

## 🐛 故障排除

### 常見問題

**Q: 找不到模組？**
```bash
npm install openai
```

**Q: TypeScript 編譯錯誤？**
確保 `tsconfig.json` 配置正確：
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true
  }
}
```

**Q: OpenAI API 錯誤？**
```bash
# 檢查 API Key
echo $OPENAI_API_KEY
```

更多問題請參考 `docs/USER_GUIDE.md` 的故障排除章節。

## 📞 支援

### 文檔資源
- **快速開始**: `QUICK_START.md`
- **技術文檔**: `docs/TECHNICAL_DOCUMENTATION.md`
- **用戶指南**: `docs/USER_GUIDE.md`
- **部署指南**: `docs/DEPLOYMENT_GUIDE.md`

### 獲取幫助
1. 查看相關文檔
2. 檢查環境配置
3. 確認依賴項已安裝

## 📝 版本資訊

- **版本**: 1.0.0
- **發布日期**: 2025-11-13
- **部署類型**: 最小化部署（僅新功能）
- **狀態**: ✅ 生產就緒

## 📄 授權

MIT License

## 🙏 致謝

感謝您使用食物識別準確度改進系統！

---

**開始使用**: 查看 [QUICK_START.md](./QUICK_START.md)  
**技術支援**: 查看 [docs/USER_GUIDE.md](./docs/USER_GUIDE.md)  
**深入了解**: 查看 [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md)

**祝您使用愉快！** 🎉
