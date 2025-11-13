# 食物識別準確度改進 - 技術文檔

## 目錄

1. [系統概述](#系統概述)
2. [知識庫結構和使用方法](#知識庫結構和使用方法)
3. [Prompt 模板設計原則](#prompt-模板設計原則)
4. [驗證規則邏輯](#驗證規則邏輯)
5. [API 接口文檔](#api-接口文檔)
6. [部署指南](#部署指南)
7. [故障排除](#故障排除)

---

## 系統概述

### 架構簡介

食物識別準確度改進系統是一個多階段的圖像識別解決方案，專門針對亞洲料理和食材的識別。系統由以下核心組件組成：

- **AsianCuisineKnowledgeBase**: 亞洲料理知識庫
- **EnhancedPromptGenerator**: 增強 Prompt 生成器
- **MultiStageRecognitionEngine**: 多階段識別引擎
- **ResultValidator**: 結果驗證器
- **FeedbackCollector**: 用戶反饋收集器
- **PerformanceMonitor**: 性能監控器

### 識別流程

```
用戶上傳圖片
    ↓
圖片預處理（格式轉換、壓縮）
    ↓
第一階段：標準識別（基礎 Prompt）
    ↓
信心度檢查（>= 85%？）
    ↓ 否
第二階段：增強識別（專用 Prompt）
    ↓
信心度檢查（>= 75%？）
    ↓ 否
第三階段：知識庫匹配
    ↓
結果驗證和後處理
    ↓
返回識別結果
```


---

## 知識庫結構和使用方法

### 1. 知識庫概述

亞洲料理知識庫（AsianCuisineKnowledgeBase）是系統的核心數據源，包含：

- **食材數據庫**: 超過 200 種亞洲食材的詳細資訊
- **料理模式庫**: 常見亞洲料理的特徵和搭配規則
- **易混淆食材對照表**: 相似食材的區分特徵

### 2. 食材數據結構

每個食材條目包含以下資訊：

```typescript
interface FoodItem {
  id: string;                      // 唯一識別碼
  name: string;                    // 食材名稱（繁體中文）
  nameVariants: string[];          // 別名和地方方言
  category: FoodCategory;          // 食材類別
  subcategory?: string;            // 子類別
  visualFeatures: VisualFeatures;  // 視覺特徵
  nutritionPer100g: NutritionInfo; // 營養資訊
  commonConfusions: string[];      // 易混淆食材
  distinguishingFeatures: string[];// 區分特徵
  cookingMethods: string[];        // 常見烹飪方式
  cuisineTypes: CuisineType[];     // 料理類型
  regionalVariants?: RegionalVariant[]; // 地方變體
  commonPairings?: string[];       // 常見搭配
  seasonality?: string[];          // 季節性
}
```

### 3. 視覺特徵定義

```typescript
interface VisualFeatures {
  color: string[];                 // 顏色（如：['淡黃色', '米白色']）
  shape: string[];                 // 形狀（如：['細長條狀', '絲狀']）
  texture: string[];               // 質地（如：['有韌性', '略粗糙']）
  size: string;                    // 尺寸描述
  appearance: string;              // 整體外觀
  surfaceCharacteristics: string[];// 表面特徵
  crossSectionAppearance?: string; // 切面外觀
}
```

### 4. 使用知識庫

#### 4.1 初始化知識庫

```typescript
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';

const knowledgeBase = new AsianCuisineKnowledgeBase();
```

#### 4.2 查詢食材資訊

```typescript
// 根據名稱查詢
const foodItem = knowledgeBase.getFoodByName('豆腐干絲');

// 根據類別查詢
const beanProducts = knowledgeBase.getFoodsByCategory(FoodCategory.BEAN_PRODUCTS);

// 查詢易混淆食材
const confusions = knowledgeBase.getConfusableFoods('豆腐干絲');
// 返回: ['麵條', '米粉', '粉絲', '金針菇']
```

#### 4.3 查詢料理模式

```typescript
// 查詢料理特徵
const pattern = knowledgeBase.getDishPattern('涼拌菜');
console.log(pattern.commonIngredients); // ['豆腐干絲', '芹菜', '胡蘿蔔'...]
console.log(pattern.commonSeasonings);  // ['麻油', '醬油', '醋'...]
```

#### 4.4 相似度匹配

```typescript
// 根據視覺特徵匹配食材
const matches = knowledgeBase.findSimilarFoods({
  color: ['淡黃色', '米白色'],
  shape: ['細長條狀'],
  texture: ['有韌性']
});
```

### 5. 擴展知識庫

#### 5.1 添加新食材

在 `apps/api/src/data/asianFoodItemsExtended.ts` 中添加：

```typescript
export const ASIAN_FOOD_ITEMS: Record<string, FoodItem> = {
  // ... 現有食材
  
  '新食材名稱': {
    id: 'unique_id',
    name: '新食材名稱',
    nameVariants: ['別名1', '別名2'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['顏色描述'],
      shape: ['形狀描述'],
      texture: ['質地描述'],
      size: '尺寸描述',
      appearance: '外觀描述',
      surfaceCharacteristics: ['表面特徵']
    },
    nutritionPer100g: {
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 2,
      fiber: 3,
      sodium: 50
    },
    commonConfusions: ['易混淆食材1', '易混淆食材2'],
    distinguishingFeatures: [
      '區分特徵1',
      '區分特徵2'
    ],
    cookingMethods: ['烹飪方式1', '烹飪方式2'],
    cuisineTypes: [CuisineType.TAIWANESE]
  }
};
```

#### 5.2 添加料理模式

在 `apps/api/src/data/dishPatterns.ts` 中添加：

```typescript
export const DISH_PATTERNS: Record<string, DishPattern> = {
  // ... 現有模式
  
  '新料理類型': {
    commonIngredients: ['常見食材1', '常見食材2'],
    commonSeasonings: ['調味料1', '調味料2'],
    visualCharacteristics: [
      '視覺特徵1',
      '視覺特徵2'
    ],
    cookingMethod: '烹飪方式',
    cuisineTypes: [CuisineType.TAIWANESE]
  }
};
```

### 6. 知識庫維護

#### 6.1 驗證知識庫完整性

```bash
npm run verify-knowledge-base
```

這會執行 `apps/api/src/scripts/verifyKnowledgeBase.ts`，檢查：
- 所有食材是否有完整的必填欄位
- 易混淆食材是否存在於知識庫中
- 營養資訊是否合理
- 視覺特徵描述是否完整

#### 6.2 知識庫統計

```typescript
const stats = knowledgeBase.getStatistics();
console.log(`總食材數: ${stats.totalFoods}`);
console.log(`食材類別分布:`, stats.categoryDistribution);
console.log(`料理類型分布:`, stats.cuisineTypeDistribution);
```


---

## Prompt 模板設計原則

### 1. Prompt 設計哲學

我們的 Prompt 設計遵循以下核心原則：

1. **明確性**: 清楚說明識別目標和要求
2. **結構化**: 使用結構化格式輸出，便於解析
3. **文化敏感性**: 包含亞洲料理的文化背景知識
4. **區分性**: 強調易混淆食材的區分特徵
5. **完整性**: 要求識別所有可見食材和調味料

### 2. Prompt 模板類型

#### 2.1 基礎 Prompt 模板

用於第一階段的標準識別：

```typescript
const basePrompt = `
請分析這張食物圖片，並以繁體中文提供詳細的食材識別。

要求：
1. 識別所有可見的食材（包括主食材、配菜、調味料）
2. 估算每種食材的份量
3. 判斷烹飪方式（如：涼拌、清蒸、快炒、油炸等）
4. 識別料理類型（如：中式、台式、日式、韓式等）
5. 提供信心度評分（0-100%）

特別注意：
- 這是亞洲料理，請特別注意亞洲特色食材
- 仔細區分相似食材（如：豆腐干絲 vs 麵條、米粉 vs 粉絲）
- 注意食材的質地、顏色、形狀等視覺特徵

輸出格式：JSON
`;
```

#### 2.2 豆製品專用 Prompt

當檢測到可能是豆製品時使用：

```typescript
const beanProductPrompt = `
這張圖片中可能包含豆製品。請特別注意以下區分：

豆腐干絲 vs 麵條：
- 豆腐干絲：淡黃色或米白色，表面略粗糙，有豆製品特有的質感，不光滑
- 麵條：較白或偏黃，表面光滑有光澤，有彈性

豆腐干絲 vs 米粉：
- 豆腐干絲：較粗（2-3mm），有韌性，不透明
- 米粉：較細（0.5-2mm），較脆，純白色

豆腐干絲 vs 粉絲：
- 豆腐干絲：不透明，較粗，有豆香
- 粉絲：透明或半透明，極細（0.3-0.8mm），滑溜

請根據以上特徵仔細判斷，並說明判斷依據。
`;
```

#### 2.3 涼拌菜專用 Prompt

當檢測到涼拌菜時使用：

```typescript
const coldDishPrompt = `
這是一道涼拌菜。涼拌菜的特徵：
- 通常包含多種食材（3種以上）
- 食材切成絲狀或片狀
- 顏色豐富多彩
- 表面可見油光（通常是麻油）

常見涼拌菜食材組合：
- 豆腐干絲 + 芹菜絲 + 胡蘿蔔絲
- 海蜇皮 + 黃瓜絲 + 香菜
- 木耳 + 洋蔥 + 彩椒

請識別：
1. 所有可見的食材（不要遺漏任何一種）
2. 調味料（麻油、醬油、醋、蒜末等）
3. 每種食材的大致份量
4. 食材的切法（絲、片、塊等）
`;
```

#### 2.4 台式熱炒專用 Prompt

```typescript
const taiwaneseStirFryPrompt = `
這是台式熱炒料理。台式熱炒的特徵：
- 大火快炒，食材略帶焦香（鍋氣）
- 油亮的外觀
- 常見配料：蒜片、辣椒、九層塔

常見台式熱炒食材：
- 糯米椒（細長、有皺褶）vs 青椒（較大、光滑）
- 豆乾、肉絲、海鮮
- 玉米筍（整根細長）vs 筍子（較粗、切片）

請特別注意：
1. 糯米椒和青椒的區分
2. 蒜片和辣椒（台式熱炒必備）
3. 食材的炒製程度
`;
```

### 3. Prompt 增強技巧

#### 3.1 添加易混淆警告

```typescript
function addConfusionWarnings(prompt: string, confusedPairs: string[][]): string {
  let enhanced = prompt + '\n\n⚠️ 特別注意以下易混淆食材：\n';
  
  for (const [food1, food2] of confusedPairs) {
    const item1 = knowledgeBase.getFoodByName(food1);
    const item2 = knowledgeBase.getFoodByName(food2);
    
    enhanced += `\n${food1} vs ${food2}：\n`;
    enhanced += `- ${food1}: ${item1.distinguishingFeatures.join('、')}\n`;
    enhanced += `- ${food2}: ${item2.distinguishingFeatures.join('、')}\n`;
  }
  
  return enhanced;
}
```

#### 3.2 添加地方特色背景

```typescript
function addRegionalContext(prompt: string, region: string): string {
  const regionalInfo = {
    '台灣': `
台灣料理特色：
- 融合閩南、客家、原住民、日式等多元文化
- 常見烹飪方式：滷、炒、蒸、涼拌
- 特色食材：糯米椒、過貓、馬告、刺蔥
- 常見調味：麻油、醬油膏、烏醋、沙茶
`,
    '原住民': `
原住民料理特色：
- 使用山林野菜和香料
- 特色食材：小米、馬告（山胡椒）、刺蔥、過貓、山蘇
- 烹飪方式：烤、蒸、煮
- 風味：清淡、原味、香料香氣
`
  };
  
  return prompt + '\n\n' + (regionalInfo[region] || '');
}
```

#### 3.3 動態調整 Prompt 詳細程度

```typescript
function adjustPromptDetail(config: PromptConfig): string {
  let prompt = basePrompt;
  
  // 第一次嘗試：使用簡潔 prompt
  if (config.attempt === 1) {
    return prompt;
  }
  
  // 第二次嘗試：添加詳細說明
  if (config.attempt === 2) {
    prompt = addConfusionWarnings(prompt, config.suspectedConfusions);
    prompt = addVisualFeatureGuidance(prompt);
  }
  
  // 第三次嘗試：添加所有可用資訊
  if (config.attempt >= 3) {
    prompt = addRegionalContext(prompt, config.detectedRegion);
    prompt = addSeasonalContext(prompt, config.season);
    prompt = addHistoricalErrors(prompt, config.userFeedback);
  }
  
  return prompt;
}
```

### 4. Prompt 輸出格式規範

#### 4.1 標準 JSON 格式

```json
{
  "foods": [
    {
      "name": "食材名稱",
      "category": "食材類別",
      "portion": "份量描述（含數字和單位）",
      "confidence": 85,
      "visualDescription": "視覺描述",
      "distinguishingFeatures": ["特徵1", "特徵2"]
    }
  ],
  "cookingMethod": "烹飪方式",
  "cuisineType": "料理類型",
  "overallConfidence": 88,
  "description": "整體描述",
  "alternatives": [
    {
      "name": "替代選項",
      "confidence": 75,
      "reason": "選擇理由"
    }
  ]
}
```

#### 4.2 信心度評分標準

- **90-100%**: 非常確定，視覺特徵明確
- **80-89%**: 確定，但有少量不確定因素
- **70-79%**: 較確定，但存在相似食材
- **60-69%**: 不太確定，需要提供替代選項
- **< 60%**: 不確定，應進入下一階段識別

### 5. Prompt 測試和優化

#### 5.1 測試 Prompt 效果

```typescript
// 使用測試工具
import { testPromptGenerator } from './services/test-prompt-generator';

const results = await testPromptGenerator({
  promptType: 'beanProduct',
  testImages: ['test1.jpg', 'test2.jpg'],
  expectedResults: [
    { name: '豆腐干絲', confidence: 85 }
  ]
});

console.log(`準確率: ${results.accuracy}%`);
console.log(`平均信心度: ${results.avgConfidence}%`);
```

#### 5.2 基於反饋優化 Prompt

```typescript
// 分析用戶反饋，找出常見錯誤
const mistakes = await feedbackAnalyzer.getCommonMistakes();

// 為常見錯誤添加特別說明
for (const mistake of mistakes) {
  if (mistake.frequency > 10) {
    promptGenerator.addSpecialGuidance(
      mistake.incorrectIdentification,
      mistake.correctIdentification,
      mistake.distinguishingFeatures
    );
  }
}
```

### 6. Prompt 最佳實踐

1. **使用具體描述**: 避免模糊詞彙，使用具體的視覺特徵描述
2. **提供對比**: 明確說明相似食材的區別
3. **結構化輸出**: 要求 JSON 格式，便於程式解析
4. **包含範例**: 在 prompt 中提供識別範例
5. **文化背景**: 包含料理的文化背景知識
6. **迭代優化**: 根據實際效果持續調整 prompt


---

## 驗證規則邏輯

### 1. 驗證系統概述

ResultValidator 負責驗證識別結果的合理性，確保結果符合亞洲料理的常見模式和營養學原則。

### 2. 驗證規則架構

```typescript
interface ValidationRule {
  name: string;                    // 規則名稱
  check: (result: RecognitionResult) => ValidationResult; // 檢查函數
  severity: 'error' | 'warning' | 'info'; // 嚴重程度
  applicableCuisines?: CuisineType[]; // 適用料理類型
}

interface ValidationResult {
  passed: boolean;                 // 是否通過
  message: string;                 // 訊息
  suggestions?: string[];          // 改進建議
  affectedFoods?: string[];        // 受影響的食材
}
```

### 3. 內建驗證規則

#### 3.1 相似食材互斥檢查

**目的**: 防止同時識別出易混淆的食材

**邏輯**:
```typescript
const confusionPairs = [
  ['豆腐干絲', '麵條'],
  ['米粉', '粉絲'],
  ['玉米筍', '筍子'],
  ['糯米椒', '青椒'],
  ['過貓', '空心菜']
];

// 檢查是否同時出現互斥食材
for (const [food1, food2] of confusionPairs) {
  const hasFood1 = result.foods.some(f => f.food.name.includes(food1));
  const hasFood2 = result.foods.some(f => f.food.name.includes(food2));
  
  if (hasFood1 && hasFood2) {
    return {
      passed: false,
      message: `同時識別到 ${food1} 和 ${food2}，這兩者容易混淆`,
      suggestions: [
        `檢查視覺特徵：${food1} vs ${food2}`,
        '確認烹飪方式和料理類型'
      ]
    };
  }
}
```

**嚴重程度**: Warning

#### 3.2 涼拌菜完整性檢查

**目的**: 確保涼拌菜包含所有必要組成部分

**邏輯**:
```typescript
if (result.cookingMethod === '涼拌') {
  const hasMainIngredient = result.foods.some(f => 
    ['豆腐干絲', '海蜇皮', '木耳', '黃瓜'].some(ing => f.food.name.includes(ing))
  );
  const hasVegetables = result.foods.some(f => 
    f.food.category === FoodCategory.VEGETABLES
  );
  const hasSeasoning = result.foods.some(f => 
    ['麻油', '醬油', '醋'].some(s => f.food.name.includes(s))
  );
  
  const missing = [];
  if (!hasMainIngredient) missing.push('主食材');
  if (!hasVegetables) missing.push('配菜');
  if (!hasSeasoning) missing.push('調味料');
  
  if (missing.length > 0) {
    return {
      passed: false,
      message: `涼拌菜缺少：${missing.join('、')}`,
      suggestions: ['檢查是否有遺漏的食材']
    };
  }
}
```

**嚴重程度**: Warning  
**適用料理**: 中式、台式

#### 3.3 台式熱炒常見搭配檢查

**目的**: 驗證台式熱炒是否包含典型配料

**邏輯**:
```typescript
if (result.cuisineType === CuisineType.TAIWANESE && 
    result.cookingMethod === '快炒') {
  const hasGarlic = result.foods.some(f => f.food.name.includes('蒜'));
  const hasChili = result.foods.some(f => 
    f.food.name.includes('辣椒') || f.food.name.includes('糯米椒')
  );
  
  if (!hasGarlic && !hasChili) {
    return {
      passed: false,
      message: '台式熱炒通常會有蒜片或辣椒',
      suggestions: ['檢查是否有蒜片或辣椒']
    };
  }
}
```

**嚴重程度**: Info  
**適用料理**: 台式

#### 3.4 營養值合理性檢查

**目的**: 確保營養值在合理範圍內

**邏輯**:
```typescript
for (const food of result.foods) {
  const nutrition = food.food;
  
  // 檢查熱量範圍（每100g）
  if (nutrition.calories < 0 || nutrition.calories > 900) {
    return {
      passed: false,
      message: `${nutrition.name} 的熱量值不合理: ${nutrition.calories} kcal`,
      affectedFoods: [nutrition.name]
    };
  }
  
  // 檢查三大營養素總和
  const macroCalories = 
    nutrition.protein * 4 + 
    nutrition.carbs * 4 + 
    nutrition.fat * 9;
  
  const diff = Math.abs(macroCalories - nutrition.calories);
  if (diff > nutrition.calories * 0.2) { // 允許20%誤差
    return {
      passed: false,
      message: `${nutrition.name} 的營養素計算不一致`,
      suggestions: ['重新計算營養值']
    };
  }
}
```

**嚴重程度**: Error

#### 3.5 份量描述完整性檢查

**目的**: 確保份量描述包含具體數字

**邏輯**:
```typescript
for (const food of result.foods) {
  const portion = food.food.portion;
  
  // 檢查是否包含數字
  if (!portion.match(/\d+/)) {
    return {
      passed: false,
      message: `${food.food.name} 的份量描述不夠具體: "${portion}"`,
      suggestions: ['份量應包含具體數字和單位，如：50克、1碗、3片'],
      affectedFoods: [food.food.name]
    };
  }
  
  // 檢查是否包含單位
  const units = ['克', 'g', '公克', '碗', '盤', '片', '條', '根', '顆', '個', '匙', '湯匙', '茶匙'];
  const hasUnit = units.some(unit => portion.includes(unit));
  
  if (!hasUnit) {
    return {
      passed: false,
      message: `${food.food.name} 的份量缺少單位`,
      suggestions: ['添加適當的單位（克、碗、片等）']
    };
  }
}
```

**嚴重程度**: Warning

#### 3.6 料理類型一致性檢查

**目的**: 確保食材與料理類型相符

**邏輯**:
```typescript
// 日式料理特徵檢查
if (result.cuisineType === CuisineType.JAPANESE) {
  const japaneseIngredients = ['味噌', '海苔', '柴魚', '醬油', '味醂', '清酒'];
  const hasJapaneseIngredient = result.foods.some(f =>
    japaneseIngredients.some(ing => f.food.name.includes(ing))
  );
  
  if (!hasJapaneseIngredient && result.foods.length > 2) {
    return {
      passed: false,
      message: '標記為日式料理，但未檢測到典型日式食材',
      suggestions: ['重新確認料理類型']
    };
  }
}

// 原住民料理特徵檢查
const indigenousIngredients = ['小米', '馬告', '刺蔥', '過貓', '山蘇'];
const hasIndigenousFood = result.foods.some(f =>
  indigenousIngredients.some(ing => f.food.name.includes(ing))
);

if (hasIndigenousFood && result.cuisineType !== CuisineType.INDIGENOUS) {
  return {
    passed: false,
    message: '檢測到原住民特色食材，但料理類型未標記為原住民料理',
    suggestions: ['確認料理類型是否應為原住民料理']
  };
}
```

**嚴重程度**: Info

#### 3.7 季節性一致性檢查

**目的**: 檢查食材是否符合當前季節

**邏輯**:
```typescript
const currentMonth = new Date().getMonth() + 1;
const currentSeason = getSeason(currentMonth);

for (const food of result.foods) {
  const foodItem = knowledgeBase.getFoodByName(food.food.name);
  
  if (foodItem.seasonality && foodItem.seasonality.length > 0) {
    if (!foodItem.seasonality.includes(currentSeason)) {
      return {
        passed: false,
        message: `${food.food.name} 不是 ${currentSeason} 的當季食材`,
        suggestions: ['確認食材識別是否正確'],
        affectedFoods: [food.food.name]
      };
    }
  }
}
```

**嚴重程度**: Info

### 4. 自定義驗證規則

#### 4.1 添加新規則

```typescript
const validator = new ResultValidator(knowledgeBase);

// 添加自定義規則
validator.addRule({
  name: '湯品完整性檢查',
  check: (result) => {
    if (result.cookingMethod === '煮湯' || result.description.includes('湯')) {
      const hasLiquid = result.foods.some(f => 
        f.food.name.includes('湯') || f.food.name.includes('水')
      );
      
      if (!hasLiquid) {
        return {
          passed: false,
          message: '湯品應包含湯汁或水分',
          suggestions: ['確認是否有湯汁成分']
        };
      }
    }
    return { passed: true, message: 'OK' };
  },
  severity: 'warning'
});
```

#### 4.2 規則優先級

規則按以下順序執行：
1. Error 級別規則（營養值、必填欄位）
2. Warning 級別規則（完整性、合理性）
3. Info 級別規則（建議性檢查）

### 5. 驗證結果處理

#### 5.1 驗證流程

```typescript
const validator = new ResultValidator(knowledgeBase);
const validationResults = validator.validate(recognitionResult);

// 處理驗證結果
const errors = validationResults.filter(r => !r.passed && r.severity === 'error');
const warnings = validationResults.filter(r => !r.passed && r.severity === 'warning');
const infos = validationResults.filter(r => !r.passed && r.severity === 'info');

if (errors.length > 0) {
  // 有嚴重錯誤，需要重新識別
  console.error('識別結果有嚴重錯誤:', errors);
  return { success: false, errors };
}

if (warnings.length > 0) {
  // 有警告，記錄但繼續
  console.warn('識別結果有警告:', warnings);
  // 可以選擇進入下一階段識別
}

if (infos.length > 0) {
  // 有建議，僅供參考
  console.info('識別建議:', infos);
}
```

#### 5.2 自動修正

某些驗證錯誤可以自動修正：

```typescript
class ResultValidator {
  autoFix(result: RecognitionResult, validationResults: ValidationResult[]): RecognitionResult {
    let fixed = { ...result };
    
    for (const validation of validationResults) {
      if (!validation.passed && validation.autoFixable) {
        fixed = this.applyFix(fixed, validation);
      }
    }
    
    return fixed;
  }
  
  private applyFix(result: RecognitionResult, validation: ValidationResult): RecognitionResult {
    // 例如：自動添加缺少的調味料
    if (validation.message.includes('涼拌菜缺少調味料')) {
      result.foods.push({
        food: {
          name: '麻油',
          category: '調味料',
          portion: '1茶匙',
          // ... 其他欄位
        },
        confidence: 70,
        note: '根據涼拌菜特徵自動添加'
      });
    }
    
    return result;
  }
}
```

### 6. 驗證規則測試

```typescript
describe('ResultValidator', () => {
  it('should detect mutually exclusive foods', () => {
    const result = {
      foods: [
        { food: { name: '豆腐干絲' } },
        { food: { name: '麵條' } }
      ]
    };
    
    const validations = validator.validate(result);
    const failed = validations.find(v => !v.passed);
    
    expect(failed).toBeDefined();
    expect(failed.message).toContain('容易混淆');
  });
  
  it('should validate cold dish completeness', () => {
    const result = {
      cookingMethod: '涼拌',
      foods: [
        { food: { name: '豆腐干絲', category: 'BEAN_PRODUCTS' } }
        // 缺少配菜和調味料
      ]
    };
    
    const validations = validator.validate(result);
    const warnings = validations.filter(v => !v.passed && v.severity === 'warning');
    
    expect(warnings.length).toBeGreaterThan(0);
  });
});
```

### 7. 驗證規則維護

#### 7.1 定期審查

- 每月審查驗證規則的觸發頻率
- 分析誤報和漏報情況
- 根據用戶反饋調整規則

#### 7.2 規則更新流程

1. 收集用戶反饋和錯誤案例
2. 分析錯誤模式
3. 設計新的驗證規則
4. 編寫測試案例
5. 部署並監控效果


---

## API 接口文檔

### 1. 照片識別 API

#### 端點
```
POST /api/photos/recognize
```

#### 請求

**Headers**:
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body**:
```
image: File (JPEG, PNG, HEIC)
userId: string (optional)
```

#### 響應

**成功響應** (200 OK):
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "food": {
          "id": "tofu_strips",
          "name": "豆腐干絲",
          "calories": 120,
          "protein": 12,
          "carbs": 5,
          "fat": 6,
          "fiber": 2,
          "sodium": 300,
          "category": "豆製品",
          "portion": "50克",
          "description": "涼拌豆腐干絲",
          "cooking_method": "涼拌",
          "cuisine_type": "台式",
          "visualDescription": "淡黃色細長條狀，表面略粗糙",
          "distinguishingFeatures": ["比麵條更粗", "有豆製品質感"],
          "alternatives": ["麵條", "米粉"]
        },
        "confidence": 88,
        "recognitionStage": 2,
        "matchedFeatures": ["顏色", "形狀", "質地"],
        "uncertaintyReasons": []
      }
    ],
    "overallConfidence": 85,
    "description": "這是一道涼拌菜，包含豆腐干絲、芹菜絲和胡蘿蔔絲",
    "cookingMethod": "涼拌",
    "cuisineType": "台式",
    "alternatives": [
      [
        {
          "name": "麵條",
          "confidence": 75,
          "reason": "形狀相似但質地不同"
        }
      ]
    ],
    "processingTime": 3200,
    "stages": 2
  }
}
```

**錯誤響應**:

- **400 Bad Request**: 圖片格式錯誤或缺少必要參數
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE_FORMAT",
    "message": "不支援的圖片格式，請使用 JPEG、PNG 或 HEIC"
  }
}
```

- **413 Payload Too Large**: 圖片過大
```json
{
  "success": false,
  "error": {
    "code": "IMAGE_TOO_LARGE",
    "message": "圖片大小超過限制（最大 10MB）"
  }
}
```

- **429 Too Many Requests**: API 調用頻率超限
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API 調用頻率超限，請稍後再試"
  }
}
```

- **500 Internal Server Error**: 識別失敗
```json
{
  "success": false,
  "error": {
    "code": "RECOGNITION_FAILED",
    "message": "圖片識別失敗，請重試",
    "details": "OpenAI API 錯誤"
  }
}
```

### 2. 用戶反饋 API

#### 提交反饋

**端點**:
```
POST /api/feedback
```

**請求**:
```json
{
  "imageId": "img_123456",
  "recognitionResult": {
    "foods": [...]
  },
  "userCorrection": {
    "correctFoods": ["豆腐干絲", "芹菜"],
    "incorrectFoods": ["麵條"],
    "missingFoods": ["胡蘿蔔絲", "麻油"]
  },
  "userId": "user_123"
}
```

**響應**:
```json
{
  "success": true,
  "message": "感謝您的反饋，這將幫助我們改進識別準確度",
  "feedbackId": "feedback_123456"
}
```

#### 查詢反饋統計

**端點**:
```
GET /api/feedback/stats
```

**響應**:
```json
{
  "success": true,
  "data": {
    "totalFeedbacks": 1250,
    "averageAccuracy": 87.5,
    "commonMistakes": [
      {
        "incorrectIdentification": "麵條",
        "correctIdentification": "豆腐干絲",
        "frequency": 45,
        "lastOccurrence": "2025-11-10T10:30:00Z"
      }
    ],
    "improvementTrend": [
      { "date": "2025-11-01", "accuracy": 82 },
      { "date": "2025-11-08", "accuracy": 87.5 }
    ]
  }
}
```

### 3. 性能監控 API

#### 查詢識別性能

**端點**:
```
GET /api/monitoring/recognition-performance
```

**查詢參數**:
```
startDate: string (ISO 8601)
endDate: string (ISO 8601)
```

**響應**:
```json
{
  "success": true,
  "data": {
    "totalRequests": 5000,
    "successRate": 96.5,
    "averageConfidence": 85.2,
    "averageProcessingTime": 3200,
    "stageDistribution": {
      "stage1": 3500,
      "stage2": 1200,
      "stage3": 300
    },
    "topRecognizedFoods": [
      { "name": "白飯", "count": 800 },
      { "name": "雞肉", "count": 650 }
    ]
  }
}
```

---

## 部署指南

### 1. 環境需求

#### 系統需求
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- MongoDB >= 6.0
- Redis >= 7.0

#### 環境變數

在 `.env` 文件中配置：

```bash
# OpenAI API
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# 資料庫
DATABASE_URL=postgresql://user:password@localhost:5432/nutrition_db
MONGODB_URI=mongodb://localhost:27017/nutrition_db
REDIS_URL=redis://localhost:6379

# 應用配置
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.example.com

# 圖片處理
MAX_IMAGE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_FORMATS=jpeg,jpg,png,heic

# 識別配置
RECOGNITION_CONFIDENCE_THRESHOLD=85
RECOGNITION_MAX_RETRIES=3
RECOGNITION_TIMEOUT=30000  # 30秒

# 快取配置
CACHE_TTL=3600  # 1小時
CACHE_MAX_SIZE=1000

# 監控
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=info
```

### 2. 部署步驟

#### 2.1 安裝依賴

```bash
# 安裝所有依賴
npm install

# 建置專案
npm run build
```

#### 2.2 資料庫遷移

```bash
# PostgreSQL 遷移
npm run migrate:postgres

# MongoDB 索引初始化
npm run init:mongodb-indexes

# 初始化知識庫數據
npm run seed:knowledge-base
```

#### 2.3 驗證配置

```bash
# 驗證環境變數
npm run verify:env

# 驗證知識庫
npm run verify:knowledge-base

# 測試 API 連接
npm run test:api-connection
```

#### 2.4 啟動服務

```bash
# 開發環境
npm run dev

# 生產環境
npm run start

# 使用 PM2（推薦）
pm2 start ecosystem.config.js
```

### 3. Docker 部署

#### 3.1 建置 Docker 映像

```bash
# 建置 API 映像
docker build -f docker/api/Dockerfile -t nutrition-api:latest .

# 建置 Web 映像
docker build -f docker/web/Dockerfile -t nutrition-web:latest .
```

#### 3.2 使用 Docker Compose

```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f api

# 停止服務
docker-compose down
```

### 4. Kubernetes 部署

```bash
# 應用配置
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 部署資料庫
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# 部署應用
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml

# 配置 Ingress
kubectl apply -f k8s/ingress.yaml
```

### 5. 監控和日誌

#### 5.1 日誌配置

日誌存儲在 `apps/api/logs/` 目錄：
- `combined.log`: 所有日誌
- `error.log`: 錯誤日誌
- `access.log`: API 訪問日誌
- `performance.log`: 性能日誌

#### 5.2 監控儀表板

訪問監控儀表板：
```
http://your-domain/api/monitoring/dashboard
```

#### 5.3 健康檢查

```bash
# API 健康檢查
curl http://localhost:3000/health

# 詳細健康狀態
curl http://localhost:3000/health/detailed
```

### 6. 備份和恢復

#### 6.1 資料庫備份

```bash
# PostgreSQL 備份
npm run backup:postgres

# MongoDB 備份
npm run backup:mongodb

# 完整備份
npm run backup:all
```

#### 6.2 恢復資料

```bash
# 從備份恢復
npm run restore:postgres -- --file=backup-2025-11-13.sql
npm run restore:mongodb -- --file=backup-2025-11-13.archive
```

### 7. 效能優化

#### 7.1 快取策略

- 識別結果快取：1小時
- 知識庫查詢快取：24小時
- API 響應快取：5分鐘

#### 7.2 負載平衡

使用 Nginx 進行負載平衡：

```nginx
upstream api_backend {
    least_conn;
    server api1:3000;
    server api2:3000;
    server api3:3000;
}

server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 故障排除

### 1. 常見問題

#### 問題：OpenAI API 調用失敗

**症狀**:
```
Error: OpenAI API request failed with status 429
```

**解決方案**:
1. 檢查 API 配額是否用盡
2. 實施請求限流
3. 增加重試延遲時間
4. 考慮使用多個 API 金鑰輪換

#### 問題：圖片識別準確度低

**症狀**:
- 信心度持續低於 75%
- 頻繁進入第三階段識別

**解決方案**:
1. 檢查圖片品質（解析度、光線）
2. 審查 prompt 模板是否需要優化
3. 更新知識庫數據
4. 分析用戶反饋，找出常見錯誤模式

#### 問題：識別速度慢

**症狀**:
- 處理時間超過 10 秒
- 頻繁超時

**解決方案**:
1. 檢查圖片大小，確保壓縮正常
2. 優化知識庫查詢索引
3. 啟用結果快取
4. 增加 API 超時時間
5. 考慮使用 CDN 加速圖片上傳

#### 問題：記憶體使用過高

**症狀**:
```
FATAL ERROR: Reached heap limit
```

**解決方案**:
1. 增加 Node.js 記憶體限制：
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start
```
2. 實施圖片處理後的記憶體清理
3. 限制並發請求數量
4. 使用串流處理大型圖片

### 2. 除錯工具

#### 2.1 測試 Prompt 生成器

```bash
npm run test:prompt-generator
```

#### 2.2 驗證知識庫

```bash
npm run verify:knowledge-base
```

#### 2.3 測試識別流程

```bash
# 使用測試圖片
npm run test:recognition -- --image=test-images/liangban-gansi.jpg

# 批次測試
npm run test:recognition-batch -- --dir=test-images/
```

#### 2.4 查看詳細日誌

```bash
# 即時查看日誌
tail -f apps/api/logs/combined.log

# 查看錯誤日誌
tail -f apps/api/logs/error.log

# 查看性能日誌
tail -f apps/api/logs/performance.log
```

### 3. 效能分析

#### 3.1 識別效能分析

```bash
# 生成效能報告
npm run analyze:performance

# 查看瓶頸
npm run analyze:bottlenecks
```

#### 3.2 記憶體分析

```bash
# 生成記憶體快照
npm run profile:memory

# 分析記憶體洩漏
npm run analyze:memory-leaks
```

### 4. 聯絡支援

如果問題無法解決，請提供以下資訊：

1. 錯誤訊息和堆疊追蹤
2. 相關日誌片段
3. 環境配置（隱藏敏感資訊）
4. 重現步驟
5. 系統資源使用情況

---

## 附錄

### A. 食材類別列表

- 豆製品 (BEAN_PRODUCTS)
- 蔬菜 (VEGETABLES)
- 葉菜類 (LEAFY_GREENS)
- 根莖類 (ROOT_VEGETABLES)
- 菇類 (MUSHROOMS)
- 蛋白質 (PROTEINS)
- 海鮮 (SEAFOOD)
- 穀物 (GRAINS)
- 麵食 (NOODLES)
- 米製品 (RICE_PRODUCTS)
- 醬汁 (SAUCES)
- 調味料 (CONDIMENTS)
- 醃漬物 (PICKLES)
- 混合菜餚 (MIXED_DISH)
- 湯品 (SOUP)
- 台灣特色 (TAIWANESE_SPECIALTY)
- 原住民食材 (INDIGENOUS_FOOD)

### B. 料理類型列表

- 中式 (CHINESE)
- 台式 (TAIWANESE)
- 日式 (JAPANESE)
- 韓式 (KOREAN)
- 泰式 (THAI)
- 越式 (VIETNAMESE)
- 粵菜 (CANTONESE)
- 川菜 (SICHUAN)
- 客家菜 (HAKKA)
- 原住民料理 (INDIGENOUS)

### C. 烹飪方式列表

- 涼拌
- 清蒸
- 快炒
- 油炸
- 煮湯
- 滷
- 紅燒
- 烤
- 燉
- 炸
- 煎

### D. 版本歷史

- **v1.0.0** (2025-11-13): 初始版本
  - 實現基礎知識庫
  - 實現多階段識別引擎
  - 實現結果驗證器

### E. 參考資料

- [OpenAI Vision API 文檔](https://platform.openai.com/docs/guides/vision)
- [台灣食材資料庫](https://example.com)
- [亞洲料理百科](https://example.com)

---

**文檔版本**: 1.0.0  
**最後更新**: 2025-11-13  
**維護者**: 開發團隊
