# ComponentDetectionEngine - 成分檢測引擎

## 概述

`ComponentDetectionEngine` 是亞洲料理成分識別系統的核心引擎，負責識別料理中的個別成分，包括：

- 🔍 **自動料理類型判斷**：自動識別料理類型（湯品、炒飯、便當、麵食等）
- 🎯 **成分提取**：使用 OpenAI Vision API 識別圖片中的所有成分
- 📚 **知識庫增強**：利用內建知識庫補充可能缺失的常見成分
- ✅ **成分驗證**：驗證識別結果的合理性和一致性

## 功能特點

### 1. 料理類型自動判斷

引擎能夠自動判斷料理類型，支持以下類型：

- `SOUP` - 湯品類（味噌湯、蛋花湯、貢丸湯等）
- `FRIED_RICE` - 炒飯類
- `STIR_FRY` - 炒菜類
- `BENTO` - 便當類
- `NOODLES` - 麵食類（拉麵、烏龍麵、米粉等）
- `DUMPLING` - 點心類（小籠包、餃子、燒賣等）
- `BARBECUE` - 燒烤類
- `HOT_POT` - 火鍋類
- `UNKNOWN` - 未知類型

### 2. 智能成分提取

根據不同料理類型使用專門的 prompt 模板：

- **湯品類**：識別湯底、配料、份量
- **炒飯類**：識別米飯、蛋白質、蔬菜、調味料
- **便當類**：識別主食、主菜、配菜的區域劃分
- **麵食類**：識別麵條類型、湯底、配料
- **通用模板**：適用於其他料理類型

### 3. 知識庫增強

當 Vision API 識別不完整時，系統會：

- 查找料理的常見成分映射
- 補充高頻率出現的成分（頻率 ≥ 0.7）
- 標記知識庫匹配的成分
- 提供相似成分建議

### 4. 成分驗證

驗證識別結果的合理性：

- 檢查是否有成分被識別
- 警告低信心度成分（< 0.5）
- 檢查成分與料理類型的一致性
- 驗證份量是否合理

## 使用方法

### 基本使用

```typescript
import { ComponentDetectionEngine } from './services/ComponentDetectionEngine';
import { DishType } from './types/ComponentDetection';
import fs from 'fs';

// 創建引擎實例
const engine = new ComponentDetectionEngine('zh-TW');

// 讀取圖片
const imageBuffer = fs.readFileSync('path/to/food-image.jpg');

// 方法 1: 使用新的 options 參數（推薦）
const result = await engine.detectComponents(imageBuffer, {
  dishName: '蛋炒飯',
  dishType: DishType.FRIED_RICE
});

// 方法 2: 使用舊版 API（向後兼容）
const result = await engine.detectComponents(
  imageBuffer,
  '蛋炒飯',  // 可選：料理名稱
  DishType.FRIED_RICE  // 可選：料理類型
);

console.log('檢測結果:', result);
```

### 使用預識別食物列表（推薦）

當您已經有基礎識別結果時，可以直接傳遞預識別的食物列表，避免重複調用 Vision API：

```typescript
import { RecognizedFood } from './types/ComponentDetection';

// 假設您已經從 MultiStageRecognitionEngine 獲得識別結果
const recognizedFoods: RecognizedFood[] = [
  {
    id: 'food-1',
    name: '白飯',
    nameEn: 'White Rice',
    confidence: 0.95,
    portion: 200,
    unit: 'g',
    category: 'staple'
  },
  {
    id: 'food-2',
    name: '炸豬排',
    nameEn: 'Fried Pork Cutlet',
    confidence: 0.90,
    portion: 150,
    unit: 'g',
    category: 'protein'
  },
  {
    id: 'food-3',
    name: '滷蛋',
    nameEn: 'Braised Egg',
    confidence: 0.85,
    portion: 60,
    unit: 'g',
    category: 'protein'
  }
];

// 使用預識別食物列表
const result = await engine.detectComponents(imageBuffer, {
  dishName: '便當',
  dishType: DishType.BENTO,
  preRecognizedFoods: recognizedFoods  // 傳遞預識別食物
});

// 結果將包含所有預識別的食物，並保留其屬性
console.log('成分數量:', result.components.length);  // 3
console.log('檢測方法:', result.metadata.detectionMethod);  // 'pre_recognized'
console.log('來自預識別:', result.metadata.componentsFromPreRecognition);  // 3
```

**優點：**
- ✅ 避免重複調用 Vision API，節省時間和成本
- ✅ 確保基礎識別和成分識別結果一致
- ✅ 保留所有原始食物屬性（名稱、份量、信心度、營養資訊）
- ✅ 處理速度更快（< 1 秒）

### 自動判斷料理類型

如果不提供料理名稱和類型，引擎會自動判斷：

```typescript
const result = await engine.detectComponents(imageBuffer);

console.log('料理名稱:', result.mainDish.name);
console.log('料理類型:', result.mainDish.type);
console.log('信心度:', result.mainDish.confidence);
```

### 完整的 Options 參數

```typescript
interface DetectComponentsOptions {
  dishName?: string;              // 料理名稱（可選）
  dishType?: DishType;            // 料理類型（可選）
  preRecognizedFoods?: RecognizedFood[];  // 預識別食物列表（可選）
}

// 使用所有選項
const result = await engine.detectComponents(imageBuffer, {
  dishName: '便當',
  dishType: DishType.BENTO,
  preRecognizedFoods: [
    { id: '1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' },
    { id: '2', name: '炸豬排', confidence: 0.90, portion: 150, unit: 'g' }
  ]
});

// 只使用預識別食物
const result = await engine.detectComponents(imageBuffer, {
  preRecognizedFoods: recognizedFoods
});

// 只使用料理名稱
const result = await engine.detectComponents(imageBuffer, {
  dishName: '蛋炒飯'
});
```

### 訪問檢測結果

```typescript
// 主料理資訊
console.log('料理:', result.mainDish.name);
console.log('總份量:', result.mainDish.estimatedTotalPortion, 'g');

// 成分列表
result.components.forEach(component => {
  console.log(`- ${component.name}: ${component.estimatedPortion}g (信心度: ${component.confidence})`);
  
  if (component.knowledgeBaseMatch) {
    console.log('  (來自知識庫)');
  }
});

// 檢測元數據
console.log('處理時間:', result.metadata.processingTime, 'ms');
console.log('檢測方法:', result.metadata.detectionMethod);
console.log('整體信心度:', result.metadata.confidenceScore);

// 用戶建議
if (result.suggestions.possibleMissingComponents.length > 0) {
  console.log('可能缺失的成分:', result.suggestions.possibleMissingComponents);
}
```

### 成分驗證

```typescript
// 手動驗證成分
const validationResult = engine.validateComponents(
  result.components,
  result.mainDish.type
);

if (!validationResult.isValid) {
  console.log('驗證錯誤:', validationResult.errors);
}

if (validationResult.warnings.length > 0) {
  console.log('驗證警告:', validationResult.warnings);
}

if (validationResult.suggestions.length > 0) {
  console.log('建議:', validationResult.suggestions);
}
```

### 知識庫增強

```typescript
// 手動使用知識庫增強成分
const visionComponents = [
  {
    id: '1',
    name: '白飯',
    confidence: 0.9,
    estimatedPortion: 200
  }
];

const enrichedComponents = await engine.enrichWithKnowledgeBase(
  visionComponents,
  '蛋炒飯',
  DishType.FRIED_RICE
);

console.log('增強後的成分數量:', enrichedComponents.length);
```

## 回應格式

### ComponentDetectionResult

```typescript
{
  mainDish: {
    name: string;              // 料理名稱
    type: DishType;            // 料理類型
    confidence: number;        // 信心度 (0-1)
    estimatedTotalPortion: number;  // 總份量（克）
  },
  components: [
    {
      id: string;              // 成分 ID
      name: string;            // 成分名稱
      nameEn?: string;         // 英文名稱
      confidence: number;      // 信心度 (0-1)
      estimatedPortion: number;  // 估計份量（克）
      cookingMethod?: CookingMethod;  // 烹飪方式
      category?: ComponentCategory;   // 成分類別
      visualFeatures?: {       // 視覺特徵
        color: string[];
        shape: string;
        texture: string;
        position: string;
      },
      knowledgeBaseMatch?: boolean;  // 是否來自知識庫
      similarComponents?: string[];  // 相似成分
      sourceType?: 'vision_api' | 'pre_recognized' | 'knowledge_base';  // 成分來源
      originalFoodId?: string;  // 如果來自預識別，記錄原始食物 ID
    }
  ],
  nutritionSummary: {
    // 營養摘要（由 ComponentNutritionCalculator 計算）
  },
  metadata: {
    processingTime: number;    // 處理時間（毫秒）
    confidenceScore: number;   // 整體信心度
    detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid' | 'pre_recognized';
    componentsDetected: number;  // 檢測到的成分數量
    componentsFromKB: number;    // 來自知識庫的成分數量
    componentsFromVision: number;  // 來自 Vision API 的成分數量
    componentsFromPreRecognition: number;  // 來自預識別的成分數量（新增）
  },
  suggestions: {
    possibleMissingComponents: string[];  // 可能缺失的成分
    portionAdjustments: Array<{
      component: string;
      suggestedPortion: number;
      reason: string;
    }>;
    alternativeInterpretations: Array<{
      dishName: string;
      components: DetectedComponent[];
      confidence: number;
    }>;
  }
}
```

## 配置

### 環境變數

```bash
# OpenAI API Key（必需）
OPENAI_API_KEY=your-api-key-here
```

### 語言設置

```typescript
// 繁體中文（預設）
const engine = new ComponentDetectionEngine('zh-TW');

// 英文
const engine = new ComponentDetectionEngine('en');
```

## 錯誤處理

```typescript
try {
  const result = await engine.detectComponents(imageBuffer);
  // 處理結果
} catch (error) {
  if (error.message.includes('OpenAI API')) {
    console.error('Vision API 調用失敗');
  } else if (error.message.includes('成分檢測失敗')) {
    console.error('成分檢測過程出錯');
  } else {
    console.error('未知錯誤:', error);
  }
}
```

## 性能考量

### 處理時間

- **簡單料理**（1-3 成分）：< 3 秒
- **中等複雜料理**（4-6 成分）：< 5 秒
- **複雜料理**（7+ 成分）：< 8 秒

### 優化建議

1. **使用適當的圖片大小**：建議 1024x1024 以下
2. **批量處理**：如需處理多張圖片，考慮使用隊列
3. **緩存結果**：對於相同料理，可以緩存識別結果
4. **降級策略**：當 Vision API 不可用時，完全依賴知識庫

## 向後兼容性

引擎支持兩種 API 調用方式：

### 舊版 API（仍然支持）

```typescript
// 方式 1: 只傳圖片
await engine.detectComponents(imageBuffer);

// 方式 2: 傳圖片和料理名稱
await engine.detectComponents(imageBuffer, '蛋炒飯');

// 方式 3: 傳圖片、料理名稱和類型
await engine.detectComponents(imageBuffer, '蛋炒飯', DishType.FRIED_RICE);
```

### 新版 API（推薦）

```typescript
// 使用 options 對象
await engine.detectComponents(imageBuffer, {
  dishName: '蛋炒飯',
  dishType: DishType.FRIED_RICE,
  preRecognizedFoods: recognizedFoods
});
```

**遷移建議：**
- 現有代碼無需修改，舊版 API 將繼續工作
- 新功能（如預識別食物）只能通過新版 API 使用
- 建議逐步遷移到新版 API 以獲得更好的靈活性

## 限制和注意事項

1. **需要 OpenAI API Key**：沒有 API Key 時只能使用知識庫或預識別食物
2. **料理類型支持**：目前主要支持亞洲料理
3. **成分識別準確率**：目標 > 75%，實際取決於圖片質量
4. **份量估算**：存在 ±25% 的誤差範圍
5. **知識庫覆蓋**：目前包含 5 種常見料理的映射
6. **預識別食物**：使用預識別食物時，不會調用 Vision API 進行二次識別

## 測試

```bash
# 運行單元測試
npm test -- ComponentDetectionEngine.test.ts

# 運行測試並查看覆蓋率
npm test -- ComponentDetectionEngine.test.ts --coverage
```

## 相關文件

- `ComponentDetection.ts` - 類型定義
- `ComponentDetectionPrompts.ts` - Prompt 模板
- `dishComponentMaps.ts` - 料理-成分映射數據
- `ComponentNutritionCalculator.ts` - 營養計算器（待實現）

## 未來改進

- [ ] 支持更多料理類型
- [ ] 改進成分識別準確率
- [ ] 添加成分精煉功能（二次確認）
- [ ] 支持用戶反饋學習
- [ ] 添加成分圖片分割功能
- [ ] 支持多語言（日文、韓文等）

## 版本歷史

### v1.1.0 (2024-11-19)
- ✅ 新增預識別食物支持
- ✅ 新增 `DetectComponentsOptions` 接口
- ✅ 新增 `preRecognizedFoods` 參數
- ✅ 新增 `sourceType` 和 `originalFoodId` 屬性
- ✅ 改進向後兼容性
- ✅ 優化處理速度（使用預識別食物時 < 1 秒）
- ✅ 確保識別結果一致性

### v1.0.0 (2024-11-16)
- ✅ 初始版本
- ✅ 實現基礎引擎類
- ✅ 實現成分提取邏輯
- ✅ 實現知識庫增強
- ✅ 實現成分驗證
- ✅ 添加單元測試

## 授權

MIT License
