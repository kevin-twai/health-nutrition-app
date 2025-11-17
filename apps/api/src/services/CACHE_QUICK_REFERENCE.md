# 緩存系統快速參考

## 快速開始

### 導入緩存

```typescript
import { recognitionResultCache } from './RecognitionResultCache';
```

## 成分映射緩存

### 設置緩存

```typescript
recognitionResultCache.setComponentsForDish(
  '蛋炒飯',                    // 料理名稱
  DishType.FRIED_RICE,        // 料理類型
  components                   // 成分列表
);
```

### 獲取緩存

```typescript
const cached = recognitionResultCache.getComponentsForDish(
  '蛋炒飯',
  DishType.FRIED_RICE
);

if (cached) {
  // 使用緩存的成分
} else {
  // 查詢知識庫
}
```

## 營養計算緩存

### 設置緩存

```typescript
recognitionResultCache.setNutritionForComponent(
  '雞蛋',                      // 成分名稱
  50,                          // 份量（克）
  nutrition,                   // 營養數據
  CookingMethod.STIR_FRIED    // 烹飪方式（可選）
);
```

### 獲取緩存

```typescript
const cached = recognitionResultCache.getNutritionForComponent(
  '雞蛋',
  50,
  CookingMethod.STIR_FRIED
);

if (cached) {
  // 使用緩存的營養數據
} else {
  // 計算營養
}
```

## 緩存統計

### 獲取命中率

```typescript
// 成分緩存命中率
const componentHitRate = recognitionResultCache.getComponentCacheHitRate();
console.log(`成分緩存命中率: ${(componentHitRate * 100).toFixed(1)}%`);

// 營養緩存命中率
const nutritionHitRate = recognitionResultCache.getNutritionCacheHitRate();
console.log(`營養緩存命中率: ${(nutritionHitRate * 100).toFixed(1)}%`);
```

### 獲取緩存大小

```typescript
console.log('成分緩存:', recognitionResultCache.componentCacheSize());
console.log('營養緩存:', recognitionResultCache.nutritionCacheSize());
```

### 獲取完整統計

```typescript
const stats = recognitionResultCache.getStatistics();
console.log('統計:', {
  識別結果: stats.totalEntries,
  成分映射: stats.componentCacheEntries,
  營養計算: stats.nutritionCacheEntries,
  命中率: (stats.hitRate * 100).toFixed(1) + '%',
  平均年齡: stats.averageAge.toFixed(1) + ' 分鐘'
});
```

## 緩存管理

### 清空所有緩存

```typescript
recognitionResultCache.clear();
```

## 配置

- **成分緩存容量**: 200 個料理映射
- **營養緩存容量**: 1000 個計算結果
- **TTL**: 24 小時
- **清理間隔**: 每小時
- **驅逐策略**: LRU（最少使用）

## 性能目標

- 成分緩存命中率: > 60%
- 營養緩存命中率: > 60%
- 緩存查詢時間: < 1ms
- 知識庫查詢節省: 50-100ms
- 營養計算節省: 10-20ms

## 常見模式

### 模式 1: 先查緩存，再查知識庫

```typescript
async function getComponents(dishName: string, dishType: DishType) {
  // 1. 嘗試緩存
  let components = recognitionResultCache.getComponentsForDish(dishName, dishType);
  
  if (!components) {
    // 2. 查詢知識庫
    components = await queryKnowledgeBase(dishName);
    
    // 3. 存入緩存
    recognitionResultCache.setComponentsForDish(dishName, dishType, components);
  }
  
  return components;
}
```

### 模式 2: 先查緩存，再計算

```typescript
async function getNutrition(
  componentName: string,
  portion: number,
  cookingMethod: CookingMethod
) {
  // 1. 嘗試緩存
  let nutrition = recognitionResultCache.getNutritionForComponent(
    componentName,
    portion,
    cookingMethod
  );
  
  if (!nutrition) {
    // 2. 計算營養
    nutrition = await calculateNutrition(componentName, portion, cookingMethod);
    
    // 3. 存入緩存
    recognitionResultCache.setNutritionForComponent(
      componentName,
      portion,
      nutrition,
      cookingMethod
    );
  }
  
  return nutrition;
}
```

### 模式 3: 批量預熱

```typescript
async function warmupCache() {
  const commonDishes = [
    { name: '蛋炒飯', type: DishType.FRIED_RICE },
    { name: '味噌湯', type: DishType.SOUP },
    // ... 更多
  ];
  
  for (const dish of commonDishes) {
    const components = await getComponentsFromKB(dish.name);
    recognitionResultCache.setComponentsForDish(
      dish.name,
      dish.type,
      components
    );
  }
}
```

## 監控範例

```typescript
// 每小時監控一次
setInterval(() => {
  const componentHitRate = recognitionResultCache.getComponentCacheHitRate();
  const nutritionHitRate = recognitionResultCache.getNutritionCacheHitRate();
  
  console.log('📊 緩存性能:');
  console.log(`  成分: ${(componentHitRate * 100).toFixed(1)}%`);
  console.log(`  營養: ${(nutritionHitRate * 100).toFixed(1)}%`);
  
  if (componentHitRate < 0.6) {
    console.warn('⚠️ 成分緩存命中率低');
  }
  if (nutritionHitRate < 0.6) {
    console.warn('⚠️ 營養緩存命中率低');
  }
}, 60 * 60 * 1000);
```

## 注意事項

⚠️ **緩存鍵唯一性**
- 成分緩存：料理名稱 + 料理類型
- 營養緩存：成分名稱 + 份量 + 烹飪方式

⚠️ **記憶體使用**
- 監控緩存大小，避免溢出
- 預期使用約 1.5MB 記憶體

⚠️ **緩存一致性**
- 知識庫更新時需清空相關緩存
- 考慮實現版本控制

## 測試

```bash
npm test -- RecognitionResultCache.component.test.ts
```

## 更多資訊

詳細文檔：`COMPONENT_CACHE_README.md`
