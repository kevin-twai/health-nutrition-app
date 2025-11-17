# 湯品類成分識別功能

## 概述

湯品類成分識別是亞洲料理成分識別系統的一部分，專門處理湯品料理的特殊需求。湯品與其他料理類型的主要區別在於：

1. **液體成分佔比大**：湯底通常佔總份量的 70-85%
2. **固體配料相對少**：配料通常只佔 15-30%
3. **成分類型多樣**：包括湯底、蛋白質、蔬菜、調味料等

## 支持的湯品類型

目前系統支持以下湯品的成分識別：

### 1. 味噌湯 (Miso Soup)
- **地區**：日本
- **常見成分**：味噌、豆腐、海帶芽、青蔥、柴魚高湯
- **典型份量**：250ml
- **特色**：日式經典湯品，營養豐富

### 2. 蛋花湯 (Egg Drop Soup)
- **地區**：中國、台灣
- **常見成分**：雞蛋、雞湯、青蔥、香油
- **典型份量**：300ml
- **特色**：簡單清淡，蛋花飄逸

### 3. 貢丸湯 (Pork Ball Soup)
- **地區**：台灣
- **常見成分**：貢丸、清湯、芹菜、白胡椒粉
- **典型份量**：350ml
- **特色**：台灣小吃經典，Q彈有嚼勁

### 4. 酸辣湯 (Hot and Sour Soup)
- **地區**：中國、台灣
- **常見成分**：豆腐、木耳、筍絲、雞蛋、豬肉絲、酸辣湯底
- **典型份量**：350ml
- **特色**：酸辣開胃，配料豐富

## 核心功能

### 1. 液體和固體成分區分

系統會自動識別並區分液體成分（湯底）和固體成分（配料）：

```typescript
// 液體成分識別規則
const isLiquid = 
  component.category === ComponentCategory.SAUCE ||
  component.name.includes('湯') ||
  component.name.includes('高湯') ||
  component.name.includes('湯底') ||
  component.nameEn?.includes('broth') ||
  component.nameEn?.includes('soup') ||
  component.nameEn?.includes('stock');
```

### 2. 智能份量調整

系統會根據湯品的特性自動調整成分份量：

- **液體成分**：佔總份量的 75%（可調整）
- **固體成分**：佔總份量的 25%（可調整）

```typescript
// 典型調整邏輯
const liquidRatio = 0.75;  // 75% 液體
const solidRatio = 0.25;   // 25% 固體

const estimatedLiquidPortion = totalPortion * liquidRatio;
const estimatedSolidPortion = totalPortion * solidRatio;
```

### 3. 湯品專用驗證

系統會對湯品進行特殊驗證，確保識別結果合理：

#### 驗證項目：
- ✅ 是否包含湯底
- ✅ 液體份量是否合理（應該是最大的）
- ✅ 固體配料是否過少
- ✅ 是否包含常見配料

#### 警告示例：
```
⚠️ 湯品中未檢測到湯底，可能識別不完整
⚠️ 湯底份量似乎過少，可能需要調整
⚠️ 配料份量似乎過少，可能識別不完整
⚠️ 未檢測到常見的湯品配料，建議手動確認
```

### 4. 湯品專用建議

系統會根據湯品類型提供特定的成分建議：

#### 味噌湯建議：
- 通常包含豆腐
- 通常包含海帶芽

#### 蛋花湯建議：
- 主要成分是雞蛋

#### 貢丸湯建議：
- 主要成分是貢丸

#### 酸辣湯建議：
- 通常包含豆腐
- 通常包含木耳或香菇

## 使用示例

### 基本使用

```typescript
import { ComponentDetectionEngine } from './services/ComponentDetectionEngine';
import { DishType } from './types/ComponentDetection';

const engine = new ComponentDetectionEngine('zh-TW');

// 識別湯品成分
const result = await engine.detectComponents(
  imageBuffer,
  '味噌湯',
  DishType.SOUP
);

console.log('檢測到的成分：', result.components);
console.log('營養摘要：', result.nutritionSummary);
console.log('建議：', result.suggestions);
```

### 檢查液體和固體成分

```typescript
const liquidComponents = result.components.filter(c => 
  c.componentType === 'liquid'
);

const solidComponents = result.components.filter(c => 
  c.componentType === 'solid'
);

console.log('液體成分：', liquidComponents);
console.log('固體成分：', solidComponents);
```

### 處理驗證警告

```typescript
if (result.metadata.warnings && result.metadata.warnings.length > 0) {
  console.log('⚠️ 驗證警告：');
  result.metadata.warnings.forEach(warning => {
    console.log(`  - ${warning}`);
  });
}
```

## API 整合

### PhotoController 整合

湯品識別已整合到 PhotoController 中：

```typescript
// 使用成分識別模式
POST /api/photos/recognize?includeComponents=true

// 請求體
{
  "image": "base64_encoded_image",
  "dishName": "味噌湯",  // 可選
  "dishType": "soup"      // 可選
}

// 回應
{
  "success": true,
  "data": {
    "mainDish": {
      "name": "味噌湯",
      "type": "soup",
      "confidence": 0.95,
      "estimatedTotalPortion": 250
    },
    "components": [
      {
        "id": "1",
        "name": "味噌",
        "confidence": 0.9,
        "estimatedPortion": 15,
        "category": "seasoning",
        "componentType": "solid"
      },
      {
        "id": "2",
        "name": "柴魚高湯",
        "confidence": 0.95,
        "estimatedPortion": 200,
        "category": "sauce",
        "componentType": "liquid"
      },
      {
        "id": "3",
        "name": "豆腐",
        "confidence": 0.85,
        "estimatedPortion": 50,
        "category": "protein",
        "componentType": "solid"
      }
    ],
    "suggestions": {
      "possibleMissingComponents": ["海帶芽"],
      "portionAdjustments": [],
      "alternativeInterpretations": []
    }
  }
}
```

## 知識庫數據

### 成分映射結構

每種湯品都有詳細的成分映射：

```typescript
{
  dishName: '味噌湯',
  dishNameEn: 'Miso Soup',
  dishType: DishType.SOUP,
  region: ['japan'],
  commonComponents: [
    {
      name: '味噌',
      category: ComponentCategory.SEASONING,
      typicalPortion: 15,
      portionRange: { min: 10, max: 25 },
      frequency: 1.0,
      cookingMethods: [CookingMethod.BOILED]
    },
    // ... 更多成分
  ],
  typicalPortionRange: {
    min: 200,
    max: 350,
    typical: 250
  }
}
```

### 地域變化

系統支持地域變化的識別：

```typescript
regionalVariations: [
  {
    region: 'japan',
    components: [
      {
        name: '金針菇',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        frequency: 0.5
      }
    ],
    culturalNotes: '日式味噌湯常加入各種菇類增加風味'
  }
]
```

## 測試

### 運行湯品測試

```bash
npm test -- ComponentDetectionEngine.soup.test.ts
```

### 測試覆蓋範圍

- ✅ 液體和固體成分區分
- ✅ 份量調整邏輯
- ✅ 成分驗證
- ✅ 專用建議生成
- ✅ 知識庫映射載入
- ✅ 份量範圍合理性

## 性能指標

### 目標性能

- **簡單湯品**（1-3 種配料）：< 3 秒
- **中等湯品**（4-6 種配料）：< 5 秒
- **複雜湯品**（7+ 種配料）：< 8 秒

### 準確率目標

- **成分識別準確率**：> 75%
- **主要成分識別率**：> 90%
- **份量估計誤差**：< ±25%

## 未來改進

### Phase 2 計劃

1. **更多湯品類型**
   - 火鍋湯底
   - 燉湯類
   - 羹湯類

2. **溫度感知**
   - 識別熱湯 vs 冷湯
   - 調整營養計算

3. **濃度識別**
   - 清湯 vs 濃湯
   - 調整份量估計

4. **配料位置識別**
   - 表面配料 vs 沉底配料
   - 更準確的份量估計

## 常見問題

### Q: 為什麼湯底的份量這麼大？
A: 湯品的主要成分就是湯底，通常佔 70-85%。這是正常的。

### Q: 如何調整液體和固體的比例？
A: 可以在 `adjustSoupComponentPortions` 方法中修改 `liquidRatio` 和 `solidRatio` 參數。

### Q: 系統如何處理濃湯？
A: 目前系統使用固定比例。未來版本會根據圖片識別湯的濃度。

### Q: 可以添加自定義湯品嗎？
A: 可以！在 `dishComponentMaps.ts` 中添加新的映射即可。

## 相關文檔

- [成分識別系統總覽](./ComponentDetectionEngine.README.md)
- [成分檢測 Prompts](./COMPONENT_DETECTION_PROMPTS_README.md)
- [成分營養計算](./ComponentNutritionCalculator.README.md)
- [成分建議生成](./ComponentSuggestionGenerator.README.md)

## 貢獻

如果您想添加新的湯品類型或改進現有功能，請：

1. 在 `dishComponentMaps.ts` 中添加成分映射
2. 在 `ComponentDetectionPrompts.ts` 中添加專用 prompt（如需要）
3. 在 `ComponentDetectionEngine.soup.test.ts` 中添加測試
4. 更新本文檔

## 授權

MIT License
