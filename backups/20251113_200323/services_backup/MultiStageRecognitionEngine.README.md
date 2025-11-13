# MultiStageRecognitionEngine - 多階段識別引擎

## 概述

`MultiStageRecognitionEngine` 是一個增強的食物識別引擎，通過多階段識別流程來提升亞洲料理和複雜食材的識別準確度。

## 核心特性

### 🎯 三階段識別流程

1. **第一階段：標準識別**
   - 使用基礎亞洲料理 prompt
   - 調用 OpenAI Vision API (GPT-4o)
   - 信心度 >= 85% 時直接返回結果

2. **第二階段：增強識別**
   - 分析第一階段結果
   - 選擇專門的 prompt 模板（豆製品、麵食、蔬菜等）
   - 使用更詳細的識別指引
   - 信心度 >= 75% 時返回結果

3. **第三階段：知識庫匹配**
   - 提取圖片視覺特徵
   - 在亞洲料理知識庫中搜索匹配項
   - 生成多個可能的選項
   - 提供替代方案供用戶選擇

### 🔧 可配置選項

- `minConfidenceThreshold`: 最低信心度閾值（預設 0.85）
- `enhancedThreshold`: 進入增強階段的閾值（預設 0.75）
- `maxStages`: 最大階段數（預設 3）
- `enableKnowledgeBase`: 是否啟用知識庫匹配（預設 true）
- `language`: 語言設定（'zh-TW' 或 'en'）

### 📊 增強的結果格式

```typescript
interface EnhancedRecognitionResult {
  foods: DetectedFood[];              // 識別到的食物
  confidence: number;                 // 整體信心度
  processingTime: number;             // 處理時間
  description?: string;               // 描述
  apiUsed?: string;                   // 使用的 API
  suggestions?: FoodSuggestion[];     // 前端格式的建議
  alternatives?: FoodSuggestion[][];  // 替代選項
  stages: RecognitionStage[];         // 所有識別階段
  finalStage: number;                 // 最終使用的階段
  totalProcessingTime: number;        // 總處理時間
  totalApiCalls: number;              // 總 API 調用次數
}
```

## 使用方法

### 基本使用

```typescript
import { MultiStageRecognitionEngine } from './MultiStageRecognitionEngine';
import * as fs from 'fs';

// 1. 創建引擎實例
const engine = new MultiStageRecognitionEngine();

// 2. 讀取圖片
const imageBuffer = fs.readFileSync('path/to/image.jpg');

// 3. 執行識別
const result = await engine.recognize(imageBuffer);

// 4. 查看結果
console.log(`識別到 ${result.foods.length} 個食物`);
console.log(`整體信心度: ${(result.confidence * 100).toFixed(1)}%`);
console.log(`使用階段: ${result.finalStage}`);
console.log(`處理時間: ${result.totalProcessingTime}ms`);

result.foods.forEach(food => {
  console.log(`- ${food.name} (${(food.confidence * 100).toFixed(1)}%)`);
});
```

### 自定義配置

```typescript
const engine = new MultiStageRecognitionEngine({
  minConfidenceThreshold: 0.90,  // 提高信心度要求
  enhancedThreshold: 0.80,        // 提高增強階段閾值
  maxStages: 2,                   // 只使用兩個階段
  enableKnowledgeBase: false,     // 禁用知識庫匹配
  language: 'zh-TW'               // 使用繁體中文
});
```

### 查看替代選項

```typescript
const result = await engine.recognize(imageBuffer);

// 如果信心度較低，會提供替代選項
if (result.alternatives && result.alternatives.length > 0) {
  console.log('替代選項：');
  result.alternatives.forEach((alternatives, index) => {
    console.log(`\n食物 ${index + 1} 的其他可能：`);
    alternatives.forEach((alt, altIndex) => {
      console.log(`  ${altIndex + 1}. ${alt.food.name} (${(alt.confidence * 100).toFixed(1)}%)`);
    });
  });
}
```

### 分析各階段結果

```typescript
const result = await engine.recognize(imageBuffer);

result.stages.forEach(stage => {
  console.log(`\n階段 ${stage.attempt} (${stage.promptType}):`);
  console.log(`  處理時間: ${stage.processingTime}ms`);
  console.log(`  信心度: ${(stage.confidence * 100).toFixed(1)}%`);
  console.log(`  識別到: ${stage.result.foods.length} 個食物`);
  
  if (stage.result.cuisineType) {
    console.log(`  料理類型: ${stage.result.cuisineType}`);
  }
  if (stage.result.cookingMethod) {
    console.log(`  烹飪方式: ${stage.result.cookingMethod}`);
  }
});
```

### 健康檢查

```typescript
const health = await engine.healthCheck();

console.log(`狀態: ${health.status}`);
console.log(`OpenAI 已配置: ${health.details.openaiConfigured}`);
console.log(`知識庫食材數: ${health.details.knowledgeBaseItems}`);
console.log(`料理模式數: ${health.details.dishPatterns}`);
```

## 工作流程

```
用戶上傳圖片
    ↓
階段 1: 標準識別
    ├─ 使用基礎亞洲料理 prompt
    ├─ 調用 OpenAI Vision API
    └─ 信心度 >= 85%？
        ├─ 是 → 返回結果 ✅
        └─ 否 → 進入階段 2
            ↓
階段 2: 增強識別
    ├─ 分析第一階段結果
    ├─ 選擇專門 prompt（豆製品/麵食/蔬菜等）
    ├─ 再次調用 OpenAI Vision API
    └─ 信心度 >= 75%？
        ├─ 是 → 返回結果（含替代選項）✅
        └─ 否 → 進入階段 3
            ↓
階段 3: 知識庫匹配
    ├─ 提取圖片視覺特徵
    ├─ 在知識庫中搜索匹配項
    ├─ 計算相似度分數
    └─ 返回前 3-5 個匹配結果 ✅
```

## 優勢

### 🎯 提升準確度
- 針對亞洲料理優化的多階段識別
- 專門的 prompt 模板處理易混淆食材
- 知識庫輔助識別特殊食材

### 🔄 智能重試
- 根據第一階段結果智能選擇 prompt
- 避免不必要的 API 調用
- 漸進式提升識別精度

### 📊 詳細資訊
- 記錄每個階段的詳細資訊
- 提供替代選項供用戶選擇
- 追蹤處理時間和 API 使用

### 🛠️ 靈活配置
- 可調整信心度閾值
- 可選擇啟用/禁用知識庫
- 支援多語言

## 與現有系統整合

### 替換現有的 FoodRecognitionEngine

```typescript
// 舊代碼
import { FoodRecognitionEngine } from './FoodRecognitionEngine';
const engine = new FoodRecognitionEngine();
const result = await engine.recognizeFood(imageBuffer);

// 新代碼
import { MultiStageRecognitionEngine } from './MultiStageRecognitionEngine';
const engine = new MultiStageRecognitionEngine();
const result = await engine.recognize(imageBuffer);
```

### 在 Controller 中使用

```typescript
import { MultiStageRecognitionEngine } from '../services/MultiStageRecognitionEngine';

class PhotoController {
  private recognitionEngine: MultiStageRecognitionEngine;

  constructor() {
    this.recognitionEngine = new MultiStageRecognitionEngine({
      minConfidenceThreshold: 0.85,
      language: 'zh-TW'
    });
  }

  async recognizeFood(req: Request, res: Response) {
    try {
      const imageBuffer = req.file.buffer;
      const result = await this.recognitionEngine.recognize(imageBuffer);

      res.json({
        success: true,
        data: {
          foods: result.suggestions,  // 前端格式
          confidence: result.confidence,
          alternatives: result.alternatives,
          processingTime: result.totalProcessingTime,
          stages: result.stages.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

## 性能考量

### 處理時間
- 第一階段：約 2-4 秒
- 第二階段：約 2-4 秒（如需要）
- 第三階段：< 100ms（知識庫查詢）
- 總計：2-8 秒（取決於需要幾個階段）

### API 使用
- 最少：1 次 API 調用（第一階段成功）
- 最多：2 次 API 調用（需要增強識別）
- 知識庫匹配不消耗 API 配額

### 優化建議
1. 對於高信心度的圖片，第一階段即可完成
2. 使用緩存減少重複識別
3. 批次處理時考慮並發限制
4. 監控 API 使用量和成本

## 錯誤處理

```typescript
try {
  const result = await engine.recognize(imageBuffer);
  // 處理成功結果
} catch (error) {
  if (error.message.includes('OpenAI API')) {
    // API 錯誤
    console.error('API 調用失敗:', error);
  } else if (error.message.includes('未初始化')) {
    // 配置錯誤
    console.error('引擎未正確配置:', error);
  } else {
    // 其他錯誤
    console.error('識別失敗:', error);
  }
}
```

## 測試

```bash
# 執行單元測試
npm test -- MultiStageRecognitionEngine.test.ts

# 執行範例
npx tsx src/services/MultiStageRecognitionEngine.example.ts
```

## 依賴

- `openai`: OpenAI API 客戶端
- `EnhancedPromptGenerator`: 增強 Prompt 生成器
- `AsianCuisineKnowledgeBase`: 亞洲料理知識庫
- `FoodRepository`: 食物資料庫

## 環境變數

```bash
# 必需
OPENAI_API_KEY=your-openai-api-key

# 可選
NODE_ENV=production
```

## 未來改進

- [ ] 支援更多料理類型（泰式、越式等）
- [ ] 機器學習模型整合
- [ ] 實時相機識別
- [ ] 用戶反饋學習機制
- [ ] 性能優化和緩存策略
- [ ] 更詳細的錯誤分類和處理

## 相關文件

- [EnhancedPromptGenerator.README.md](./EnhancedPromptGenerator.README.md)
- [AsianCuisineKnowledgeBase 文檔](../data/README.md)
- [設計文檔](../../../.kiro/specs/food-recognition-accuracy/design.md)
- [需求文檔](../../../.kiro/specs/food-recognition-accuracy/requirements.md)

## 授權

MIT License
