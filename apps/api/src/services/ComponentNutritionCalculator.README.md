# ComponentNutritionCalculator 使用指南

## 概述

`ComponentNutritionCalculator` 是亞洲料理成分識別系統的營養計算核心服務。它負責：

1. 從知識庫獲取成分的基礎營養數據
2. 根據烹飪方式調整營養值（考慮油炸、炒、蒸等對營養的影響）
3. 聚合整道料理的營養資訊
4. 計算各成分的營養佔比
5. 提供營養建議和健康評分

## 主要功能

### 1. 計算單個成分的營養價值

```typescript
import { componentNutritionCalculator } from './ComponentNutritionCalculator';
import { DetectedComponent, CookingMethod, ComponentCategory } from '../types/ComponentDetection';

const component: DetectedComponent = {
  id: 'comp-1',
  name: '雞蛋',
  confidence: 0.9,
  estimatedPortion: 50, // 50克
  cookingMethod: CookingMethod.STIR_FRIED,
  category: ComponentCategory.PROTEIN,
  nutritionPer100g: {
    calories: 143,
    protein: 12.6,
    carbohydrates: 0.7,
    fat: 9.5,
    fiber: 0,
    sodium: 124
  }
};

// 計算營養（會自動應用烹飪方式的影響）
const nutrition = await componentNutritionCalculator.calculateComponentNutrition(
  component,
  CookingMethod.STIR_FRIED
);

console.log(nutrition);
// {
//   calories: 86,      // 50克炒蛋的熱量（已考慮炒製增加的油脂）
//   protein: 6.0,      // 蛋白質
//   carbohydrates: 0.3,
//   fat: 7.1,          // 脂肪（炒製會增加）
//   fiber: 0,
//   sodium: 162
// }
```

### 2. 應用烹飪方式的營養影響

```typescript
import { NutritionData, CookingMethod, ComponentCategory } from '../types/ComponentDetection';

const baseNutrition: NutritionData = {
  calories: 100,
  protein: 10,
  carbohydrates: 15,
  fat: 2,
  fiber: 3,
  sodium: 50
};

// 應用炒製的影響
const stirFriedNutrition = componentNutritionCalculator.applyCookingEffects(
  baseNutrition,
  CookingMethod.STIR_FRIED,
  ComponentCategory.VEGETABLE
);

console.log(stirFriedNutrition);
// {
//   calories: 155,     // 增加約55%熱量（炒製加油）
//   protein: 9.5,      // 蛋白質略微減少
//   carbohydrates: 14.3,
//   fat: 8.5,          // 脂肪大幅增加（加油）
//   fiber: 3,
//   sodium: 300        // 鈉增加（調味）
// }

// 應用蒸製的影響（最健康）
const steamedNutrition = componentNutritionCalculator.applyCookingEffects(
  baseNutrition,
  CookingMethod.STEAMED,
  ComponentCategory.VEGETABLE
);

console.log(steamedNutrition);
// {
//   calories: 100,     // 熱量不變
//   protein: 9.8,      // 蛋白質保留98%
//   carbohydrates: 14.7,
//   fat: 2,            // 脂肪不變
//   fiber: 3,
//   sodium: 50         // 鈉不變
// }

// 應用油炸的影響（最不健康）
const deepFriedNutrition = componentNutritionCalculator.applyCookingEffects(
  baseNutrition,
  CookingMethod.DEEP_FRIED,
  ComponentCategory.PROTEIN
);

console.log(deepFriedNutrition);
// {
//   calories: 300,     // 熱量增加約200%
//   protein: 9.0,      // 蛋白質保留90%
//   carbohydrates: 13.8,
//   fat: 21.0,         // 脂肪增加約10倍
//   fiber: 3,
//   sodium: 200
// }
```

### 3. 聚合整道料理的營養資訊

```typescript
import { EnrichedComponent } from '../types/ComponentDetection';

const components: EnrichedComponent[] = [
  {
    id: 'comp-1',
    name: '白飯',
    confidence: 0.95,
    estimatedPortion: 150,
    cookingMethod: CookingMethod.STEAMED,
    category: ComponentCategory.GRAIN,
    nutritionPer100g: {
      calories: 130,
      protein: 2.7,
      carbohydrates: 28.7,
      fat: 0.3,
      fiber: 0.4,
      sodium: 1
    }
  },
  {
    id: 'comp-2',
    name: '雞蛋',
    confidence: 0.9,
    estimatedPortion: 50,
    cookingMethod: CookingMethod.STIR_FRIED,
    category: ComponentCategory.PROTEIN,
    nutritionPer100g: {
      calories: 143,
      protein: 12.6,
      carbohydrates: 0.7,
      fat: 9.5,
      fiber: 0,
      sodium: 124
    }
  },
  {
    id: 'comp-3',
    name: '青蔥',
    confidence: 0.85,
    estimatedPortion: 10,
    cookingMethod: CookingMethod.STIR_FRIED,
    category: ComponentCategory.GARNISH,
    nutritionPer100g: {
      calories: 32,
      protein: 1.8,
      carbohydrates: 7.3,
      fat: 0.2,
      fiber: 2.6,
      sodium: 16
    }
  }
];

// 聚合營養資訊
const summary = await componentNutritionCalculator.aggregateDishNutrition(components);

console.log(summary);
// {
//   total: {
//     calories: 285,
//     protein: 10.8,
//     carbohydrates: 43.5,
//     fat: 8.2,
//     fiber: 0.9,
//     sodium: 315
//   },
//   byComponent: [
//     {
//       component: { name: '白飯', ... },
//       rawNutrition: { ... },
//       cookedNutrition: { ... },
//       portionNutrition: { calories: 195, ... },
//       percentageOfTotal: {
//         calories: 68.4,  // 白飯佔總熱量的68.4%
//         protein: 37.5,
//         carbs: 99.1,
//         fat: 5.5
//       }
//     },
//     // ... 其他成分
//   ],
//   byCategory: [
//     {
//       category: ComponentCategory.GRAIN,
//       totalNutrition: { calories: 195, ... },
//       components: ['白飯'],
//       percentageOfDish: 50.0  // 主食佔整道料理的50%
//     },
//     {
//       category: ComponentCategory.PROTEIN,
//       totalNutrition: { calories: 86, ... },
//       components: ['雞蛋'],
//       percentageOfDish: 16.7
//     },
//     // ... 其他類別
//   ],
//   cookingImpact: [
//     {
//       method: CookingMethod.STIR_FRIED,
//       caloriesAdded: 30,
//       fatAdded: 3.3,
//       notes: '快炒（雞蛋、青蔥）：增加約30%卡路里和3倍脂肪，但因時間短維生素保留較好'
//     },
//     // ... 其他烹飪方式
//   ]
// }
```

### 4. 獲取營養建議

```typescript
// 獲取營養建議
const advice = componentNutritionCalculator.getNutritionAdvice(summary);

console.log(advice);
// [
//   '蛋白質含量較低，建議增加蛋白質來源（如肉類、蛋、豆腐）',
//   '纖維含量較低，建議增加蔬菜或全穀類',
//   '鈉含量較高，請注意控制鹽分攝取，多喝水'
// ]
```

### 5. 獲取成分的健康評分

```typescript
const component: EnrichedComponent = {
  id: 'comp-1',
  name: '青江菜',
  confidence: 0.9,
  estimatedPortion: 80,
  cookingMethod: CookingMethod.STEAMED,
  category: ComponentCategory.VEGETABLE,
  nutritionPer100g: {
    calories: 13,
    protein: 1.5,
    carbohydrates: 2.2,
    fat: 0.2,
    fiber: 1.0,
    sodium: 65
  }
};

const healthScore = componentNutritionCalculator.getComponentHealthScore(component);

console.log(healthScore); // 8.5 (1-10分，分數越高越健康)
```

## 烹飪方式對營養的影響

### 營養保留率

| 烹飪方式 | 熱量倍數 | 脂肪倍數 | 蛋白質保留 | 維生素保留 | 健康評分 |
|---------|---------|---------|-----------|-----------|---------|
| 生食 (RAW) | 1.0x | 1.0x | 100% | 100% | 10/10 |
| 蒸 (STEAMED) | 1.0x | 1.0x | 98% | 90% | 9/10 |
| 煮 (BOILED) | 1.0x | 1.0x | 95% | 70% | 8/10 |
| 烤 (GRILLED) | 1.1x | 1.2x | 92% | 75% | 7/10 |
| 滷/燉 (BRAISED) | 1.15x | 1.3x | 93% | 75% | 6/10 |
| 炒 (FRIED) | 1.25x | 2.5x | 95% | 80% | 5/10 |
| 快炒 (STIR_FRIED) | 1.3x | 3.0x | 95% | 85% | 5/10 |
| 醃製 (PICKLED) | 1.0x | 1.0x | 95% | 60% | 4/10 |
| 炸 (DEEP_FRIED) | 1.8x | 4.0x | 90% | 60% | 3/10 |

### 額外營養添加（每100g）

| 烹飪方式 | 增加熱量 | 增加脂肪 | 增加鈉 |
|---------|---------|---------|-------|
| 生食 | 0 kcal | 0 g | 0 mg |
| 蒸 | 0 kcal | 0 g | 0 mg |
| 煮 | 0 kcal | 0 g | 0 mg |
| 烤 | 20 kcal | 2 g | 100 mg |
| 滷/燉 | 30 kcal | 3 g | 400 mg |
| 炒 | 40 kcal | 4.5 g | 200 mg |
| 快炒 | 50 kcal | 5.5 g | 250 mg |
| 醃製 | 10 kcal | 0 g | 800 mg |
| 炸 | 120 kcal | 13 g | 150 mg |

## 特定食材類別的調整

某些食材類別在特定烹飪方式下會有不同的營養影響：

### 主食類（GRAIN）
- **炒製**：吸油較多，熱量增加35%，脂肪增加3.5倍
- **油炸**：吸油極多，熱量增加100%，脂肪增加5倍

### 蛋白質類（PROTEIN）
- **油炸**：吸油較多，熱量增加90%，脂肪增加4.5倍
- **燒烤**：流失部分脂肪，熱量減少5%
- **蒸製**：營養保留最好，蛋白質保留99%

### 蔬菜類（VEGETABLE）
- **水煮**：流失較多水溶性維生素，保留65%
- **快炒**：吸油較多但維生素保留較好，保留82%
- **蒸製**：最佳烹調方式，維生素保留92%

## 實際應用範例

### 範例 1：蛋炒飯的營養分析

```typescript
const eggFriedRiceComponents: EnrichedComponent[] = [
  {
    id: '1',
    name: '白飯',
    estimatedPortion: 200,
    cookingMethod: CookingMethod.STIR_FRIED,
    category: ComponentCategory.GRAIN,
    confidence: 0.95,
    nutritionPer100g: { calories: 130, protein: 2.7, carbohydrates: 28.7, fat: 0.3, fiber: 0.4, sodium: 1 }
  },
  {
    id: '2',
    name: '雞蛋',
    estimatedPortion: 50,
    cookingMethod: CookingMethod.STIR_FRIED,
    category: ComponentCategory.PROTEIN,
    confidence: 0.9,
    nutritionPer100g: { calories: 143, protein: 12.6, carbohydrates: 0.7, fat: 9.5, fiber: 0, sodium: 124 }
  },
  {
    id: '3',
    name: '青蔥',
    estimatedPortion: 10,
    cookingMethod: CookingMethod.STIR_FRIED,
    category: ComponentCategory.GARNISH,
    confidence: 0.85,
    nutritionPer100g: { calories: 32, protein: 1.8, carbohydrates: 7.3, fat: 0.2, fiber: 2.6, sodium: 16 }
  },
  {
    id: '4',
    name: '火腿',
    estimatedPortion: 30,
    cookingMethod: CookingMethod.STIR_FRIED,
    category: ComponentCategory.PROTEIN,
    confidence: 0.8,
    nutritionPer100g: { calories: 145, protein: 18.5, carbohydrates: 1.5, fat: 7.2, fiber: 0, sodium: 1200 }
  }
];

const summary = await componentNutritionCalculator.aggregateDishNutrition(eggFriedRiceComponents);
const advice = componentNutritionCalculator.getNutritionAdvice(summary);

console.log('蛋炒飯營養分析：');
console.log('總熱量:', summary.total.calories, 'kcal');
console.log('總蛋白質:', summary.total.protein, 'g');
console.log('總脂肪:', summary.total.fat, 'g');
console.log('總鈉:', summary.total.sodium, 'mg');
console.log('\n營養建議:');
advice.forEach(a => console.log('- ' + a));
```

### 範例 2：比較不同烹飪方式

```typescript
const baseComponent: DetectedComponent = {
  id: 'test',
  name: '雞胸肉',
  confidence: 0.9,
  estimatedPortion: 100,
  category: ComponentCategory.PROTEIN,
  nutritionPer100g: {
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    fiber: 0,
    sodium: 74
  }
};

// 蒸雞胸肉
const steamed = componentNutritionCalculator.applyCookingEffects(
  baseComponent.nutritionPer100g!,
  CookingMethod.STEAMED,
  ComponentCategory.PROTEIN
);

// 烤雞胸肉
const grilled = componentNutritionCalculator.applyCookingEffects(
  baseComponent.nutritionPer100g!,
  CookingMethod.GRILLED,
  ComponentCategory.PROTEIN
);

// 炸雞胸肉
const deepFried = componentNutritionCalculator.applyCookingEffects(
  baseComponent.nutritionPer100g!,
  CookingMethod.DEEP_FRIED,
  ComponentCategory.PROTEIN
);

console.log('雞胸肉烹飪方式比較（每100g）：');
console.log('蒸:', steamed.calories, 'kcal,', steamed.fat, 'g 脂肪');
console.log('烤:', grilled.calories, 'kcal,', grilled.fat, 'g 脂肪');
console.log('炸:', deepFried.calories, 'kcal,', deepFried.fat, 'g 脂肪');
```

## 注意事項

1. **營養數據來源**：
   - 優先使用成分自帶的 `nutritionPer100g` 數據
   - 如果沒有，會從知識庫查詢
   - 如果知識庫也沒有，返回空營養數據

2. **烹飪方式影響**：
   - 所有營養計算都會考慮烹飪方式的影響
   - 不同食材類別在相同烹飪方式下可能有不同的影響
   - 影響係數基於營養學研究和實際測量數據

3. **份量計算**：
   - 所有營養數據基於每100g計算
   - 實際營養值會根據 `estimatedPortion` 按比例調整
   - 份量估計的準確性會影響最終營養計算的準確性

4. **營養建議**：
   - 建議基於一般營養學原則
   - 不考慮個人特殊需求（如過敏、疾病等）
   - 僅供參考，不能替代專業營養師建議

## 相關文件

- [ComponentDetection.ts](../types/ComponentDetection.ts) - 類型定義
- [cookingMethodEffects.ts](../data/cookingMethodEffects.ts) - 烹飪方式影響數據
- [AsianCuisineKnowledgeBase.ts](./AsianCuisineKnowledgeBase.ts) - 知識庫服務
- [ComponentDetectionEngine.ts](./ComponentDetectionEngine.ts) - 成分識別引擎

## 測試

運行測試：

```bash
npm test -- ComponentNutritionCalculator.test.ts
```

測試覆蓋：
- ✅ 單個成分營養計算
- ✅ 烹飪方式影響應用
- ✅ 整道料理營養聚合
- ✅ 營養佔比計算
- ✅ 類別分組統計
- ✅ 營養建議生成
- ✅ 健康評分計算
