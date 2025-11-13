# 亞洲料理知識庫

## 概述

本知識庫包含50種以上常見亞洲食材的詳細資訊，以及6種常見亞洲料理模式，用於提升食物識別系統的準確度。

## 知識庫內容

### 食材數據 (50種)

包含以下類別的食材：

- **豆製品類** (3種): 豆腐干絲、豆腐、豆乾
- **麵食類** (3種): 米粉、粉絲、麵條
- **蔬菜類** (20種): 玉米筍、糯米椒、青椒、芹菜、胡蘿蔔、空心菜、高麗菜、青江菜、洋蔥、番茄、黃瓜、筍子、絲瓜、苦瓜、茄子、大白菜、菠菜、豆芽、韭菜、海帶
- **菇類** (4種): 香菇、金針菇、木耳、杏鮑菇、鴻喜菇
- **台灣特色食材** (2種): 過貓、山蘇
- **原住民食材** (2種): 馬告、刺蔥
- **調味料** (6種): 麻油、醬油、蒜、薑、蔥、辣椒
- **海鮮類** (2種): 蝦、魚
- **肉類** (3種): 豬肉、雞肉、牛肉
- **蛋類** (1種): 雞蛋
- **穀物** (1種): 白飯
- **其他** (3種): 花生、蝦米

### 料理模式 (6種)

- 涼拌菜
- 台式熱炒
- 日式定食
- 中式湯品
- 韓式拌飯
- 粵式點心

## 食材資訊結構

每種食材包含以下詳細資訊：

- **基本資訊**: ID、名稱、別名
- **分類**: 類別、子類別
- **視覺特徵**: 顏色、形狀、質地、大小、外觀、表面特徵、光澤度、透明度
- **營養資訊**: 卡路里、蛋白質、碳水化合物、脂肪、纖維、鈉等（每100克）
- **識別資訊**: 易混淆食材、區分特徵
- **烹飪資訊**: 常見烹飪方式、料理類型、常見搭配
- **其他**: 標籤、文化註記、地方變體

## 使用方式

### 1. 導入知識庫服務

```typescript
import { asianCuisineKB } from '../services/AsianCuisineKnowledgeBase';
```

### 2. 查詢食材

```typescript
// 根據類別查詢
const beanProducts = asianCuisineKB.queryFoodItems({
  category: FoodCategory.BEAN_PRODUCTS
});

// 根據料理類型查詢
const taiwaneseFood = asianCuisineKB.queryFoodItems({
  cuisineType: CuisineType.TAIWANESE
});

// 根據名稱搜尋（支持模糊匹配）
const results = asianCuisineKB.searchFoodItemsByName('豆腐', true);
```

### 3. 獲取易混淆食材

```typescript
// 獲取易混淆的食材
const confusions = asianCuisineKB.getConfusedFoodPairs('豆腐干絲');
// 返回: ['麵條', '米粉', '粉絲', '金針菇']

// 獲取區分特徵
const features = asianCuisineKB.getDistinguishingFeatures('豆腐干絲');
```

### 4. 視覺特徵匹配

```typescript
const imageFeatures = {
  dominantColors: ['淡黃色', '米白色'],
  textureType: 'rough',
  shapePatterns: ['細長條狀', '絲狀'],
  estimatedComplexity: 5,
  hasMultipleComponents: false
};

const matches = asianCuisineKB.matchFoodItemsByVisualFeatures(imageFeatures);
// 返回按信心度排序的匹配結果
```

### 5. 驗證食材組合

```typescript
const validation = asianCuisineKB.validateFoodCombination([
  '豆腐干絲', 
  '麵條'
]);

if (!validation.valid) {
  console.log('警告:', validation.warnings);
}
```

### 6. 推薦料理類型

```typescript
const suggestions = asianCuisineKB.suggestDishType([
  '豆腐干絲', 
  '芹菜', 
  '胡蘿蔔'
]);
// 可能返回: [涼拌菜]
```

### 7. 獲取營養資訊

```typescript
const nutrition = asianCuisineKB.getNutritionInfo('豆腐干絲');
// 返回每100克的營養資訊
```

### 8. 獲取統計資訊

```typescript
const stats = asianCuisineKB.getStatistics();
console.log(`總食材數: ${stats.totalFoodItems}`);
console.log(`總料理模式: ${stats.totalDishPatterns}`);
```

## 擴展知識庫

### 添加新食材

在 `apps/api/src/data/asianFoodItems.ts` 中添加新的食材條目：

```typescript
'新食材名稱': {
  id: 'unique_id',
  name: '新食材名稱',
  nameVariants: ['別名1', '別名2'],
  category: FoodCategory.VEGETABLES,
  visualFeatures: {
    // ... 視覺特徵
  },
  nutritionPer100g: {
    // ... 營養資訊
  },
  // ... 其他資訊
}
```

### 添加新料理模式

在 `apps/api/src/data/dishPatterns.ts` 中添加新的料理模式：

```typescript
'新料理名稱': {
  name: '新料理名稱',
  commonIngredients: ['食材1', '食材2'],
  commonSeasonings: ['調味料1', '調味料2'],
  visualCharacteristics: ['特徵1', '特徵2'],
  cookingMethod: CookingMethod.STIR_FRY,
  cuisineTypes: [CuisineType.CHINESE],
  // ... 其他資訊
}
```

## 注意事項

1. 所有食材名稱和別名都使用繁體中文
2. 營養資訊以每100克為基準
3. 視覺特徵描述應盡可能詳細和具體
4. 易混淆食材應包含最常見的混淆對象
5. 區分特徵應清晰明確，便於識別

## 未來擴展計劃

- [ ] 增加更多地方特色食材（客家菜、湘菜等）
- [ ] 添加季節性食材資訊
- [ ] 增加食材的地方變體資訊
- [ ] 添加更多料理模式（火鍋、燒烤等）
- [ ] 整合食材的常見份量資訊
- [ ] 添加食材的保存方式和選購技巧
