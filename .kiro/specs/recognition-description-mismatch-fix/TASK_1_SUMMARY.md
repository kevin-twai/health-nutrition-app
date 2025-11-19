# Task 1 實施摘要：更新類型定義

## 完成時間
2025-11-19

## 實施內容

### 1. 新增 RecognizedFood 接口
在 `apps/api/src/types/ComponentDetection.ts` 中新增了 `RecognizedFood` 接口，用於表示來自基礎識別階段的食物：

```typescript
export interface RecognizedFood {
  id: string;                       // 食物唯一識別碼
  name: string;                     // 食物中文名稱
  nameEn?: string;                  // 食物英文名稱
  confidence: number;               // 信心度 (0-1)
  estimatedPortion?: number;        // 估計份量（克）
  portion?: number;                 // 份量（克）- 別名
  unit?: string;                    // 單位
  category?: string;                // 食物類別
  nutrition?: {                     // 營養資訊
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
  };
}
```

### 2. 新增 DetectComponentsOptions 接口
創建了 `DetectComponentsOptions` 接口，用於傳遞成分檢測的選項參數：

```typescript
export interface DetectComponentsOptions {
  dishName?: string;                // 料理名稱
  dishType?: DishType;              // 料理類型
  preRecognizedFoods?: RecognizedFood[]; // 預識別的食物列表
}
```

### 3. 更新 EnrichedComponent 接口
在 `EnrichedComponent` 接口中添加了兩個新屬性：

```typescript
export interface EnrichedComponent extends DetectedComponent {
  // ... 現有屬性 ...
  sourceType?: 'vision_api' | 'pre_recognized' | 'knowledge_base'; // 成分來源類型
  originalFoodId?: string;          // 如果來自預識別，記錄原始食物 ID
}
```

### 4. 更新 DetectionMetadata 接口
在 `DetectionMetadata` 接口中：
- 在 `detectionMethod` 中添加了 `'pre_recognized'` 選項
- 添加了 `componentsFromPreRecognition` 可選屬性

```typescript
export interface DetectionMetadata {
  // ... 現有屬性 ...
  detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid' | 'pre_recognized';
  componentsFromPreRecognition?: number; // 來自預識別的成分數量
  // ... 其他屬性 ...
}
```

## 測試結果

創建了完整的類型測試文件 `apps/api/src/types/__tests__/ComponentDetection.types.test.ts`，包含：

- ✅ RecognizedFood 接口測試（2 個測試）
- ✅ DetectComponentsOptions 接口測試（3 個測試）
- ✅ EnrichedComponent 接口測試（2 個測試）
- ✅ DetectionMetadata 接口測試（3 個測試）
- ✅ 類型兼容性測試（1 個測試）

**測試結果：11/11 通過 ✅**

## 驗證

- ✅ TypeScript 編譯無錯誤
- ✅ 所有相關文件（ComponentDetectionEngine.ts, PhotoController.ts）無診斷錯誤
- ✅ 類型定義符合需求文檔（Requirements 1.1, 2.1, 2.5）

## 影響範圍

### 修改的文件
1. `apps/api/src/types/ComponentDetection.ts` - 核心類型定義

### 新增的文件
1. `apps/api/src/types/__tests__/ComponentDetection.types.test.ts` - 類型測試

### 相關文件（無需修改，但會使用新類型）
1. `apps/api/src/services/ComponentDetectionEngine.ts`
2. `apps/api/src/controllers/PhotoController.ts`

## 下一步

Task 1 已完成，可以繼續執行 Task 2：實現食物轉換邏輯

Task 2 將包括：
- 2.1 在 ComponentDetectionEngine 中實現 convertRecognizedFoodsToComponents 方法
- 2.2 實現類別和烹飪方式的推斷邏輯
- 2.3 編寫 convertRecognizedFoodsToComponents 的單元測試

## 備註

所有類型定義都遵循了 EARS 和 INCOSE 標準，並且：
- 使用清晰的命名約定
- 提供完整的 JSDoc 註釋
- 支持向後兼容
- 包含適當的可選屬性
- 通過完整的單元測試驗證
