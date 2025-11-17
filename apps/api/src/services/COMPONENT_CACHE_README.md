# 成分識別緩存系統

## 概述

成分識別緩存系統擴展了現有的 `RecognitionResultCache`，增加了兩種新的緩存類型：

1. **料理-成分映射緩存**：緩存常見料理的成分列表
2. **營養計算緩存**：緩存成分的營養計算結果

這些緩存可以顯著提高成分識別和營養計算的性能，減少重複計算和知識庫查詢。

## 功能特性

### 1. 料理-成分映射緩存

- **目的**：緩存常見料理的成分列表，避免重複查詢知識庫
- **TTL**：24 小時
- **最大容量**：200 個料理映射
- **驅逐策略**：LRU（最少使用）

#### 使用方法

```typescript
import { recognitionResultCache } from './RecognitionResultCache';
import { DishType, DetectedComponent } from '../types/ComponentDetection';

// 設置緩存
const components: DetectedComponent[] = [
  {
    id: '1',
    name: '白飯',
    confidence: 0.95,
    estimatedPortion: 200,
    category: ComponentCategory.GRAIN,
    cookingMethod: CookingMethod.STIR_FRIED
  },
  // ... 更多成分
];

recognitionResultCache.setComponentsForDish('蛋炒飯', DishType.FRIED_RICE, components);

// 獲取緩存
const cachedComponents = recognitionResultCache.getComponentsForDish('蛋炒飯', DishType.FRIED_RICE);

if (cachedComponents) {
  console.log('從緩存獲取成分:', cachedComponents.length);
} else {
  console.log('緩存未命中，需要查詢知識庫');
}
```

### 2. 營養計算緩存

- **目的**：緩存成分的營養計算結果，避免重複計算
- **TTL**：24 小時
- **最大容量**：1000 個營養計算結果
- **驅逐策略**：LRU（最少使用）
- **緩存鍵**：成分名稱 + 份量 + 烹飪方式

#### 使用方法

```typescript
import { recognitionResultCache } from './RecognitionResultCache';
import { NutritionData, CookingMethod } from '../types/ComponentDetection';

// 設置緩存
const nutrition: NutritionData = {
  calories: 75,
  protein: 6.5,
  carbohydrates: 0.5,
  fat: 5.0
};

recognitionResultCache.setNutritionForComponent(
  '雞蛋',
  50,  // 份量（克）
  nutrition,
  CookingMethod.STIR_FRIED
);

// 獲取緩存
const cachedNutrition = recognitionResultCache.getNutritionForComponent(
  '雞蛋',
  50,
  CookingMethod.STIR_FRIED
);

if (cachedNutrition) {
  console.log('從緩存獲取營養數據:', cachedNutrition);
} else {
  console.log('緩存未命中，需要計算營養');
}
```

## 整合到現有服務

### ComponentDetectionEngine

`ComponentDetectionEngine` 在 `enrichWithKnowledgeBase` 方法中自動使用成分映射緩存：

```typescript
async enrichWithKnowledgeBase(
  visionComponents: DetectedComponent[],
  dishName: string,
  dishType: DishType
): Promise<EnrichedComponent[]> {
  // 1. 嘗試從緩存獲取
  const cachedComponents = recognitionResultCache.getComponentsForDish(dishName, dishType);
  
  if (cachedComponents && cachedComponents.length > 0) {
    console.log(`從緩存獲取成分映射: ${dishName}`);
    // 使用緩存的成分
    return mergeWithVisionComponents(visionComponents, cachedComponents);
  }
  
  // 2. 緩存未命中，查詢知識庫
  const dishMap = findDishComponentMap(dishName);
  const enrichedComponents = processKnowledgeBase(dishMap, visionComponents);
  
  // 3. 將結果存入緩存
  const kbComponents = enrichedComponents.filter(c => c.knowledgeBaseMatch);
  if (kbComponents.length > 0) {
    recognitionResultCache.setComponentsForDish(dishName, dishType, kbComponents);
  }
  
  return enrichedComponents;
}
```

### ComponentNutritionCalculator

`ComponentNutritionCalculator` 在 `calculateComponentNutrition` 方法中自動使用營養計算緩存：

```typescript
async calculateComponentNutrition(
  component: DetectedComponent,
  cookingMethod?: CookingMethod
): Promise<NutritionData> {
  const finalCookingMethod = cookingMethod || component.cookingMethod || CookingMethod.RAW;
  
  // 1. 嘗試從緩存獲取
  const cachedNutrition = recognitionResultCache.getNutritionForComponent(
    component.name,
    component.estimatedPortion,
    finalCookingMethod
  );
  
  if (cachedNutrition) {
    return cachedNutrition;
  }
  
  // 2. 緩存未命中，進行計算
  const baseNutrition = getBaseNutrition(component);
  const cookedNutrition = applyCookingEffects(baseNutrition, finalCookingMethod);
  const result = calculatePortionNutrition(cookedNutrition, component.estimatedPortion);
  
  // 3. 將結果存入緩存
  recognitionResultCache.setNutritionForComponent(
    component.name,
    component.estimatedPortion,
    result,
    finalCookingMethod
  );
  
  return result;
}
```

## 緩存統計

### 獲取統計資訊

```typescript
const stats = recognitionResultCache.getStatistics();

console.log('識別結果緩存:', stats.totalEntries);
console.log('成分映射緩存:', stats.componentCacheEntries);
console.log('營養計算緩存:', stats.nutritionCacheEntries);
console.log('總命中率:', stats.hitRate);
console.log('平均緩存年齡:', stats.averageAge, '分鐘');
```

### 獲取各類緩存的命中率

```typescript
// 成分緩存命中率
const componentHitRate = recognitionResultCache.getComponentCacheHitRate();
console.log('成分緩存命中率:', (componentHitRate * 100).toFixed(1) + '%');

// 營養緩存命中率
const nutritionHitRate = recognitionResultCache.getNutritionCacheHitRate();
console.log('營養緩存命中率:', (nutritionHitRate * 100).toFixed(1) + '%');
```

### 獲取緩存大小

```typescript
console.log('識別結果緩存大小:', recognitionResultCache.size());
console.log('成分映射緩存大小:', recognitionResultCache.componentCacheSize());
console.log('營養計算緩存大小:', recognitionResultCache.nutritionCacheSize());
```

## 緩存管理

### 清空所有緩存

```typescript
recognitionResultCache.clear();
console.log('所有緩存已清空');
```

### 自動清理

緩存系統會自動清理過期的緩存項：

- **清理間隔**：每小時
- **過期時間**：24 小時
- **清理範圍**：所有三種類型的緩存

## 性能優化建議

### 1. 預熱緩存

在系統啟動時，可以預先加載常見料理的成分映射：

```typescript
async function warmupCache() {
  const commonDishes = [
    { name: '蛋炒飯', type: DishType.FRIED_RICE },
    { name: '味噌湯', type: DishType.SOUP },
    { name: '台式便當', type: DishType.BENTO },
    // ... 更多常見料理
  ];
  
  for (const dish of commonDishes) {
    const dishMap = findDishComponentMap(dish.name);
    if (dishMap) {
      const components = dishMap.commonComponents.map(comp => ({
        id: `kb-${comp.name}`,
        name: comp.name,
        nameEn: comp.nameEn,
        confidence: comp.frequency,
        estimatedPortion: comp.typicalPortion,
        cookingMethod: comp.cookingMethods[0],
        category: comp.category
      }));
      
      recognitionResultCache.setComponentsForDish(dish.name, dish.type, components);
    }
  }
  
  console.log('緩存預熱完成');
}
```

### 2. 監控緩存效能

定期監控緩存命中率，以評估緩存效果：

```typescript
setInterval(() => {
  const componentHitRate = recognitionResultCache.getComponentCacheHitRate();
  const nutritionHitRate = recognitionResultCache.getNutritionCacheHitRate();
  
  console.log('緩存性能報告:');
  console.log('  成分緩存命中率:', (componentHitRate * 100).toFixed(1) + '%');
  console.log('  營養緩存命中率:', (nutritionHitRate * 100).toFixed(1) + '%');
  
  // 如果命中率低於目標，可能需要調整緩存策略
  if (componentHitRate < 0.6) {
    console.warn('成分緩存命中率低於目標 (60%)');
  }
  if (nutritionHitRate < 0.6) {
    console.warn('營養緩存命中率低於目標 (60%)');
  }
}, 60 * 60 * 1000); // 每小時檢查一次
```

### 3. 調整緩存大小

根據實際使用情況，可以調整緩存大小：

```typescript
// 在 RecognitionResultCache 類中
private readonly MAX_COMPONENT_CACHE_SIZE = 200;  // 可根據需要調整
private readonly MAX_NUTRITION_CACHE_SIZE = 1000; // 可根據需要調整
```

## 測試

運行緩存功能測試：

```bash
npm test -- RecognitionResultCache.component.test.ts
```

測試涵蓋：
- ✅ 料理-成分映射緩存的設置和獲取
- ✅ 營養計算緩存的設置和獲取
- ✅ 不同烹飪方式的營養數據區分
- ✅ 緩存命中率計算
- ✅ 緩存統計資訊
- ✅ 緩存清理功能

## 性能指標

根據設計目標：

- **成分緩存命中率目標**：> 60%
- **營養緩存命中率目標**：> 60%
- **緩存查詢時間**：< 1ms
- **知識庫查詢時間節省**：約 50-100ms
- **營養計算時間節省**：約 10-20ms

## 注意事項

1. **緩存一致性**：當知識庫更新時，需要清空相關緩存
2. **記憶體使用**：監控緩存大小，避免記憶體溢出
3. **緩存鍵設計**：確保緩存鍵能夠唯一標識數據
4. **過期策略**：24 小時 TTL 適合大多數場景，可根據需要調整

## 未來改進

1. **持久化緩存**：將緩存存儲到 Redis，支持分散式部署
2. **智能預熱**：根據使用頻率自動預熱熱門料理
3. **緩存分層**：實現多級緩存（記憶體 + Redis）
4. **緩存預測**：使用機器學習預測可能需要的緩存項

## 相關文件

- `RecognitionResultCache.ts` - 緩存實現
- `ComponentDetectionEngine.ts` - 成分識別引擎（使用成分緩存）
- `ComponentNutritionCalculator.ts` - 營養計算器（使用營養緩存）
- `RecognitionResultCache.component.test.ts` - 緩存測試
