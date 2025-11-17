# 成分識別數據結構說明

## 概述

本目錄包含了亞洲料理成分識別系統所需的核心數據結構，包括：

1. **料理-成分映射** (`dishComponentMaps.ts`)
2. **烹飪方式營養影響** (`cookingMethodEffects.ts`)
3. **成分資訊擴展** (`componentInfoExtensions.ts`)
4. **擴展食材數據** (`asianFoodItemsExtended.ts`)

## 文件說明

### 1. dishComponentMaps.ts

定義了各種亞洲料理的常見成分映射。

**包含的料理：**
- 蛋炒飯 (Egg Fried Rice)
- 味噌湯 (Miso Soup)
- 台式便當 (Taiwanese Bento)
- 拉麵 (Ramen)
- 小籠包 (Xiaolongbao)

**數據結構：**
```typescript
interface DishComponentMap {
  dishName: string;              // 料理名稱
  dishType: DishType;            // 料理類型
  region: string[];              // 地區
  commonComponents: ComponentInfo[];  // 常見成分
  regionalVariations: RegionalVariation[];  // 地域變化
  typicalPortionRange: {...};    // 典型份量範圍
}
```

**使用範例：**
```typescript
import { findDishComponentMap } from './dishComponentMaps';

const eggFriedRice = findDishComponentMap('蛋炒飯');
console.log(eggFriedRice.commonComponents);
```

### 2. cookingMethodEffects.ts

定義了各種烹飪方式對營養價值的影響係數。

**包含的烹飪方式：**
- 生食 (Raw)
- 煮 (Boiled)
- 炒 (Fried)
- 快炒 (Stir-Fried)
- 炸 (Deep-Fried)
- 蒸 (Steamed)
- 烤 (Grilled)
- 滷/燉 (Braised)
- 醃製 (Pickled)

**營養影響係數：**
- `calorieMultiplier`: 卡路里倍數
- `fatMultiplier`: 脂肪倍數
- `proteinRetention`: 蛋白質保留率
- `vitaminRetention`: 維生素保留率
- `addedCalories`: 增加的卡路里
- `addedFat`: 增加的脂肪

**使用範例：**
```typescript
import { calculateCookedNutrition, CookingMethod } from './cookingMethodEffects';

const rawNutrition = {
  calories: 100,
  protein: 10,
  carbohydrates: 20,
  fat: 5
};

const cookedNutrition = calculateCookedNutrition(
  rawNutrition,
  CookingMethod.STIR_FRIED,
  ComponentCategory.VEGETABLE,
  100  // 份量（克）
);

console.log(`炒製後: ${cookedNutrition.calories} kcal`);
```

**營養影響範例：**

| 烹飪方式 | 卡路里變化 | 脂肪變化 | 維生素保留 | 健康評分 |
|---------|-----------|---------|-----------|---------|
| 蒸 | 0% | 0% | 90% | 9/10 |
| 煮 | 0% | 0% | 70% | 8/10 |
| 快炒 | +30% | +200% | 85% | 5/10 |
| 油炸 | +80% | +300% | 60% | 3/10 |

### 3. componentInfoExtensions.ts

為已存在的食材添加成分識別相關資訊。

**包含的成分類別：**
- 蛋白質類：雞蛋、豆腐、豆乾、豬肉、雞肉、蝦
- 主食類：白飯、麵條、米粉
- 蔬菜類：高麗菜、胡蘿蔔、青江菜、空心菜、青椒、玉米筍
- 菇類：香菇、金針菇、木耳
- 調味料：青蔥、蒜、薑、醬油、麻油

**數據結構：**
```typescript
interface ComponentInfo {
  category: ComponentCategory;   // 成分類別
  isCommonComponent: boolean;    // 是否為常見成分
  typicalDishes: string[];       // 常見料理
  cookingMethods: CookingMethod[]; // 常見烹飪方式
  portionRanges: {               // 份量範圍
    min: number;
    max: number;
    typical: number;
  };
}
```

**使用範例：**
```typescript
import { getComponentInfo, isCommonComponent } from './componentInfoExtensions';

const eggInfo = getComponentInfo('egg');
console.log(eggInfo.typicalDishes);  // ['蛋炒飯', '番茄炒蛋', ...]

const isCommon = isCommonComponent('egg');  // true
```

### 4. asianFoodItemsExtended.ts

擴展的亞洲食材數據庫，包含新增的食材和 componentInfo 屬性。

**新增食材：**
- 海帶芽 (Wakame)

**擴展屬性：**
```typescript
interface FoodItem {
  // ... 原有屬性
  componentInfo?: ComponentInfo;  // 成分識別資訊
}
```

## 數據統計

### 料理覆蓋
- **總料理數**: 5 種
- **料理類型**: 炒飯、湯品、便當、麵食、點心
- **地域覆蓋**: 台灣、中國、日本

### 成分覆蓋
- **總成分數**: 23 個常見成分
- **蛋白質類**: 6 個
- **主食類**: 3 個
- **蔬菜類**: 9 個
- **調味料**: 5 個

### 烹飪方式
- **總烹飪方式**: 9 種
- **健康烹飪**: 蒸、煮、烤
- **中等烹飪**: 炒、快炒、滷
- **高油烹飪**: 炸

## 使用流程

### 完整的成分識別流程

```typescript
import { findDishComponentMap } from './dishComponentMaps';
import { calculateCookedNutrition } from './cookingMethodEffects';
import { getComponentInfo } from './componentInfoExtensions';

// 1. 識別料理
const dish = findDishComponentMap('蛋炒飯');

// 2. 獲取成分列表
const components = dish.commonComponents;

// 3. 計算每個成分的營養
components.forEach(component => {
  // 獲取基礎營養資訊（從知識庫）
  const baseNutrition = getNutritionFromKB(component.name);
  
  // 計算烹飪後的營養
  const cookedNutrition = calculateCookedNutrition(
    baseNutrition,
    component.cookingMethods[0],
    component.category,
    component.typicalPortion
  );
  
  console.log(`${component.name}: ${cookedNutrition.calories} kcal`);
});

// 4. 聚合總營養
const totalNutrition = aggregateNutrition(components);
```

## 驗證測試

運行驗證腳本以確保數據結構正確：

```bash
npx ts-node apps/api/src/data/verify-component-data.ts
```

**預期輸出：**
- ✅ 5 種料理映射
- ✅ 9 種烹飪方式
- ✅ 23 個常見成分
- ✅ 營養計算正確
- ✅ 整合測試通過

## 擴展指南

### 添加新料理

在 `dishComponentMaps.ts` 中添加：

```typescript
{
  dishName: '新料理',
  dishNameEn: 'New Dish',
  dishType: DishType.STIR_FRY,
  region: ['taiwan'],
  commonComponents: [
    {
      name: '成分名',
      category: ComponentCategory.PROTEIN,
      typicalPortion: 50,
      portionRange: { min: 30, max: 80 },
      frequency: 0.9,
      alternatives: [],
      cookingMethods: [CookingMethod.STIR_FRIED],
      nutritionImpact: []
    }
  ],
  regionalVariations: [],
  typicalPortionRange: { min: 200, max: 400, typical: 300 }
}
```

### 添加新成分

在 `componentInfoExtensions.ts` 中添加：

```typescript
'new_ingredient': {
  category: ComponentCategory.VEGETABLE,
  isCommonComponent: true,
  typicalDishes: ['料理1', '料理2'],
  cookingMethods: [CookingMethod.STIR_FRIED],
  portionRanges: {
    min: 20,
    max: 80,
    typical: 40
  }
}
```

### 添加新烹飪方式

在 `cookingMethodEffects.ts` 中添加：

```typescript
[CookingMethod.NEW_METHOD]: {
  method: CookingMethod.NEW_METHOD,
  displayName: '新烹飪方式',
  displayNameEn: 'New Method',
  calorieMultiplier: 1.0,
  fatMultiplier: 1.0,
  proteinRetention: 0.95,
  carbRetention: 0.95,
  vitaminRetention: 0.85,
  mineralRetention: 0.90,
  addedCalories: 0,
  addedFat: 0,
  addedSodium: 0,
  description: '描述',
  healthImpact: '健康影響',
  commonUses: ['用途1', '用途2']
}
```

## 注意事項

1. **份量單位**: 所有份量使用克（g）為單位
2. **營養單位**: 
   - 卡路里: kcal
   - 蛋白質/脂肪/碳水化合物: g
   - 鈉: mg
3. **信心度**: 使用 0-1 的浮點數表示
4. **頻率**: 使用 0-1 的浮點數表示出現頻率
5. **保留率**: 使用 0-1 的浮點數表示營養保留率

## 相關文件

- `../types/ComponentDetection.ts` - 成分識別類型定義
- `../types/AsianCuisineKnowledgeBase.ts` - 食材知識庫類型定義
- `./asianFoodItems.ts` - 基礎食材數據
- `./dishPatterns.ts` - 料理模式數據

## 更新日誌

### 2024-11-16
- ✅ 創建料理-成分映射數據（5 種料理）
- ✅ 創建烹飪方式營養影響數據（9 種方式）
- ✅ 創建成分資訊擴展（23 個成分）
- ✅ 擴展食材數據庫（添加 componentInfo）
- ✅ 添加驗證測試腳本
- ✅ 完成任務 2 的所有子任務
