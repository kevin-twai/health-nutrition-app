# EnhancedPromptGenerator - 增強 Prompt 生成器

## 概述

`EnhancedPromptGenerator` 是一個專為亞洲料理食物識別設計的智能 Prompt 生成系統。它能根據不同的料理類型、食材類別、菜餚類型和上下文信息，動態生成最適合的 OpenAI Vision API prompt。

## 主要功能

### 1. 多種專用 Prompt 模板

#### 料理類型專用模板
- **中式料理** (`generateChinesePrompt()`)
  - 識別粵菜、川菜、湘菜等不同菜系
  - 注重烹飪方式和醬料識別
  
- **台式料理** (`generateTaiwanesePrompt()`)
  - 包含台灣特色食材（豆腐干絲、糯米椒、過貓等）
  - 支持原住民料理識別
  - 強調台式熱炒特徵
  
- **日式料理** (`generateJapanesePrompt()`)
  - 識別壽司、刺身、拉麵等
  - 注重日式定食完整性
  
- **韓式料理** (`generateKoreanPrompt()`)
  - 識別泡菜、辣椒醬等特色
  - 注重小菜（banchan）識別

#### 食材類別專用模板
- **豆製品** (`generateBeanProductPrompt()`)
  - 重點區分：豆腐干絲 vs 麵條
  - 詳細的視覺特徵對比
  
- **麵食類** (`generateNoodleTypePrompt()`)
  - 區分：米粉 vs 粉絲 vs 麵條
  - 透明度是關鍵特徵
  
- **蔬菜類** (`generateVegetablePrompt()`)
  - 區分：玉米筍 vs 筍子
  - 區分：糯米椒 vs 青椒
  - 包含台灣特色野菜
  
- **原住民食材** (`generateIndigenousFoodPrompt()`)
  - 識別馬告、刺蔥、小米等
  - 包含文化背景知識

#### 菜餚類型專用模板
- **涼拌菜** (`generateColdDishPrompt()`)
  - 強調多種食材識別
  - 檢查完整性（主食材、配菜、調味料）
  
- **熱炒** (`generateStirFryPrompt()`)
  - 台式熱炒特徵（蒜片、鍋氣）
  - 常見搭配識別
  
- **湯品** (`generateSoupPrompt()`)
  - 區分清湯、濃湯、羹湯
  - 識別湯中配料
  
- **混合菜餚** (`generateMixedDishPrompt()`)
  - 逐一識別多種食材
  - 注意不同層次的食材

### 2. Prompt 增強功能

#### 易混淆食材警告
```typescript
generator.addConfusionWarnings(prompt, [
  ['豆腐干絲', '麵條'],
  ['米粉', '粉絲']
]);
```

#### 地方特色背景知識
```typescript
generator.addRegionalContext(prompt, '台南');
// 添加台南特色：牛肉湯、擔仔麵等
```

#### 季節性食材提示
```typescript
generator.addSeasonalContext(prompt, '春');
// 添加春季食材：竹筍、蘆筍等
```

#### 歷史錯誤學習
```typescript
generator.addHistoricalErrorContext(prompt, [
  { incorrect: '麵條', correct: '豆腐干絲', frequency: 5 }
]);
```

### 3. 智能 Prompt 生成

推薦使用 `generateSmartPrompt()` 方法，它會自動：
1. 選擇最適合的基礎模板
2. 添加易混淆食材警告
3. 添加地方特色
4. 添加季節性提示
5. 添加歷史錯誤學習

```typescript
const smartPrompt = generator.generateSmartPrompt({
  detectedCuisineType: CuisineType.TAIWANESE,
  suspectedFoodCategories: [FoodCategory.BEAN_PRODUCTS],
  confusedPairs: [['豆腐干絲', '麵條']],
  region: '台南',
  commonErrors: [
    { incorrect: '麵條', correct: '豆腐干絲', frequency: 5 }
  ]
});
```

## 使用方式

### 基本使用

```typescript
import { EnhancedPromptGenerator } from './EnhancedPromptGenerator';

// 創建生成器（支持繁體中文和英文）
const generator = new EnhancedPromptGenerator('zh-TW');

// 生成標準 prompt
const prompt = generator.generatePrompt();
```

### 針對特定場景

```typescript
// 場景 1: 識別台式涼拌菜
const coldDishPrompt = generator.generateColdDishPrompt();

// 場景 2: 區分豆腐干絲和麵條
const beanPrompt = generator.generateBeanProductPrompt();

// 場景 3: 動態選擇模板
const dynamicPrompt = generator.generatePrompt({
  detectedCuisineType: CuisineType.TAIWANESE,
  suspectedFoodCategories: [FoodCategory.BEAN_PRODUCTS],
  previousAttempts: 1
});
```

### 多階段識別

```typescript
// 第一次嘗試
let prompt = generator.generatePrompt({ previousAttempts: 0 });
let result = await callOpenAIVision(imageBuffer, prompt);

// 如果信心度低，使用增強 prompt 重試
if (result.confidence < 0.85) {
  prompt = generator.generateSmartPrompt({
    previousAttempts: 1,
    detectedCuisineType: detectCuisineType(result),
    suspectedFoodCategories: detectFoodCategories(result),
    confusedPairs: getCommonConfusions(),
    region: userRegion
  });
  result = await callOpenAIVision(imageBuffer, prompt);
}
```

## 支持的模板類型

總共 15 種專用模板：

1. `STANDARD` - 標準模板
2. `ASIAN_CUISINE` - 亞洲料理通用
3. `CHINESE` - 中式料理
4. `TAIWANESE` - 台式料理
5. `JAPANESE` - 日式料理
6. `KOREAN` - 韓式料理
7. `BEAN_PRODUCTS` - 豆製品
8. `NOODLES` - 麵食類
9. `VEGETABLES` - 蔬菜類
10. `SEAFOOD` - 海鮮類
11. `INDIGENOUS` - 原住民食材
12. `COLD_DISH` - 涼拌菜
13. `STIR_FRY` - 熱炒
14. `SOUP` - 湯品
15. `MIXED_DISH` - 混合菜餚

## 設計原則

1. **專業性**：每個模板都包含詳細的識別重點和區分特徵
2. **可擴展性**：支持註冊自定義模板
3. **智能化**：根據上下文自動選擇最適合的模板
4. **學習能力**：支持基於用戶反饋和歷史錯誤的持續改進
5. **多語言**：支持繁體中文和英文

## 測試

運行測試腳本：
```bash
npx tsx src/services/test-prompt-generator.ts
```

查看使用示例：
```bash
npx tsx src/services/EnhancedPromptGenerator.example.ts
```

## 相關文件

- `EnhancedPromptGenerator.ts` - 主要實現
- `EnhancedPromptGenerator.test.ts` - 單元測試
- `EnhancedPromptGenerator.example.ts` - 使用示例
- `../types/AsianCuisineKnowledgeBase.ts` - 類型定義

## 下一步

這個 Prompt 生成器是任務 2 的實現。接下來的任務包括：

- **任務 3**：實現多階段識別引擎（`MultiStageRecognitionEngine`）
- **任務 4**：實現結果驗證器（`ResultValidator`）
- **任務 5**：優化現有 API 端點

## 貢獻

如需添加新的料理類型或食材類別模板，請：
1. 在 `PromptTemplateType` 枚舉中添加新類型
2. 創建對應的 `create*Prompt()` 方法
3. 在 `initializeTemplates()` 中註冊模板
4. 添加對應的測試用例
