# Task 5 實現摘要：添加錯誤處理和降級邏輯

## 完成日期
2025-11-19

## 實現概述

成功為 ComponentDetectionEngine 添加了完整的錯誤處理和降級邏輯，確保系統在各種異常情況下都能穩定運行。

## 實現的功能

### 5.1 處理預識別食物為空的情況 ✅

**實現位置**: `apps/api/src/services/ComponentDetectionEngine.ts` (detectComponents 方法)

**功能**:
- 在處理預識別食物之前檢測空列表
- 記錄警告訊息
- 自動降級至 Vision API 識別
- 設置 `usedFallback` 標記追蹤降級情況

**代碼片段**:
```typescript
// 處理預識別食物為空的情況
if (options.preRecognizedFoods !== undefined && options.preRecognizedFoods.length === 0) {
  console.warn('   ⚠️ 預識別食物列表為空，降級至 Vision API 識別');
  usedFallback = true;
  options.preRecognizedFoods = undefined;
}
```

### 5.2 處理預識別食物格式錯誤 ✅

**實現位置**: `apps/api/src/services/ComponentDetectionEngine.ts`

**新增方法**: `validatePreRecognizedFoods(foods: RecognizedFood[]): RecognizedFood[]`

**功能**:
- 驗證每個預識別食物的必要欄位（name, confidence, portion）
- 自動修正無效的數值（設置合理的預設值）
- 過濾掉完全無效的食物項目
- 記錄詳細的驗證警告和錯誤
- 驗證營養資訊的有效性

**驗證規則**:
1. **name**: 必須存在且為字串
2. **confidence**: 必須是 0-1 之間的數字，無效時預設為 0.7
3. **portion**: 必須是正數，無效時預設為 100g
4. **nutrition**: 如果存在，calories 必須是非負數

**錯誤處理**:
```typescript
try {
  // 驗證預識別食物格式
  const validFoods = this.validatePreRecognizedFoods(options.preRecognizedFoods);
  
  if (validFoods.length === 0) {
    throw new Error('所有預識別食物格式無效');
  }
  
  if (validFoods.length < options.preRecognizedFoods.length) {
    console.warn(`   ⚠️ ${options.preRecognizedFoods.length - validFoods.length} 個預識別食物格式無效，已過濾`);
  }
  
  // 轉換預識別食物為成分格式
  const preRecognizedComponents = this.convertRecognizedFoodsToComponents(validFoods);
  
  // ... 後續處理
  
} catch (error) {
  console.error('   ❌ 處理預識別食物失敗，降級至 Vision API 識別');
  console.error('   錯誤詳情:', error instanceof Error ? error.message : String(error));
  
  // 記錄錯誤堆疊以便調試
  if (error instanceof Error && error.stack) {
    console.error('   錯誤堆疊:', error.stack);
  }
  
  // 降級至 Vision API 識別
  usedFallback = true;
  options.preRecognizedFoods = undefined;
}
```

### 5.3 實現混合模式（可選）✅

**實現位置**: `apps/api/src/services/ComponentDetectionEngine.ts`

**新增方法**:
1. `shouldUseHybridMode(components: EnrichedComponent[], dishType: DishType): boolean`
2. `mergeComponents(preRecognizedComponents: EnrichedComponent[], visionComponents: DetectedComponent[]): EnrichedComponent[]`

**功能**:

#### 混合模式判斷邏輯
根據料理類型和成分數量自動判斷是否需要補充 Vision API 識別：

**最小成分數量閾值**:
- 湯品 (SOUP): 3個（湯底 + 2個配料）
- 炒飯 (FRIED_RICE): 4個（飯 + 3個配料）
- 炒菜 (STIR_FRY): 3個（主菜 + 2個配料）
- 便當 (BENTO): 5個（飯 + 4個菜）
- 麵食 (NOODLES): 4個（麵 + 3個配料）
- 點心 (DUMPLING): 2個（主食 + 1個配料）
- 燒烤 (BARBECUE): 3個（主食 + 2個配料）
- 火鍋 (HOT_POT): 5個（湯底 + 4個配料）
- 咖哩 (CURRY): 4個（咖哩醬 + 3個配料）

**關鍵成分檢查**:
- 炒飯/便當: 必須有主食類成分
- 湯品: 必須有湯底成分
- 炒菜: 必須有蔬菜或蛋白質成分

#### 成分合併邏輯
- 保留所有預識別的成分（優先級最高）
- 添加 Vision API 識別的新成分（避免重複）
- 使用 `isSimilarComponent` 方法判斷成分相似度
- 記錄合併過程和結果

**混合模式流程**:
```typescript
// 檢查是否需要混合模式
const shouldUseHybridMode = this.shouldUseHybridMode(components, detectedDishType!);

if (shouldUseHybridMode) {
  console.log(`   🔄 預識別食物數量較少 (${components.length} 個)，啟用混合模式補充 Vision API 識別`);
  
  try {
    // 使用 Vision API 補充識別
    const visionComponents = await this.extractComponentsFromVision(
      image,
      detectedDishName!,
      detectedDishType!
    );
    
    componentsFromVision = visionComponents.length;
    
    // 合併結果，避免重複
    const mergedComponents = this.mergeComponents(components, visionComponents);
    components = mergedComponents;
    
    detectionMethod = 'hybrid';
    console.log(`   ✅ 混合模式完成，共 ${components.length} 個成分`);
  } catch (visionError) {
    console.warn('   ⚠️ Vision API 補充識別失敗，僅使用預識別食物:', visionError);
    detectionMethod = 'pre_recognized';
  }
}
```

## 日誌記錄改進

### 新增的日誌訊息

1. **空列表警告**:
   ```
   ⚠️ 預識別食物列表為空，降級至 Vision API 識別
   ```

2. **格式驗證警告**:
   ```
   ⚠️ 預識別食物缺少有效的 name 欄位
   ⚠️ 預識別食物 "白飯" 的 confidence 無效: -0.5
   ⚠️ X 個預識別食物格式無效，已過濾
   ```

3. **錯誤處理日誌**:
   ```
   ❌ 處理預識別食物失敗，降級至 Vision API 識別
   錯誤詳情: [具體錯誤訊息]
   錯誤堆疊: [堆疊追蹤]
   ```

4. **混合模式日誌**:
   ```
   🔄 預識別食物數量較少 (2 個)，啟用混合模式補充 Vision API 識別
   料理類型 SOUP 需要至少 3 個成分，當前只有 2 個
   🔀 合併成分: 2 個預識別 + 3 個 Vision API
   ➕ 添加 Vision API 成分: 豆腐
   ⏭️  跳過重複成分: 白飯
   ✅ 合併完成: 共 4 個成分 (新增 2 個)
   ```

## 錯誤處理流程

```
開始成分檢測
    ↓
檢查預識別食物是否為空
    ├─ 是 → 記錄警告 → 降級至 Vision API
    └─ 否 → 繼續
    ↓
驗證預識別食物格式
    ├─ 全部無效 → 拋出錯誤 → 降級至 Vision API
    ├─ 部分無效 → 記錄警告 → 過濾無效項目 → 繼續
    └─ 全部有效 → 繼續
    ↓
轉換為成分格式
    ├─ 成功 → 繼續
    └─ 失敗 → 記錄錯誤 → 降級至 Vision API
    ↓
檢查是否需要混合模式
    ├─ 是 → 調用 Vision API 補充
    │   ├─ 成功 → 合併成分
    │   └─ 失敗 → 記錄警告 → 僅使用預識別
    └─ 否 → 使用預識別成分
    ↓
返回結果
```

## 測試建議

### 單元測試場景

1. **空列表測試**:
   ```typescript
   it('應該處理空的預識別食物列表', async () => {
     const options = { preRecognizedFoods: [] };
     // 應該降級至 Vision API
   });
   ```

2. **格式錯誤測試**:
   ```typescript
   it('應該過濾格式無效的預識別食物', async () => {
     const options = {
       preRecognizedFoods: [
         { name: '白飯', confidence: 0.9, portion: 200 }, // 有效
         { name: '', confidence: 0.8, portion: 100 },      // 無效：name 為空
         { name: '炸豬排', confidence: -0.5, portion: 150 }, // 無效：confidence < 0
         { name: '滷蛋', confidence: 0.85, portion: -60 }   // 無效：portion < 0
       ]
     };
     // 應該只保留有效的食物
   });
   ```

3. **混合模式測試**:
   ```typescript
   it('應該在成分數量不足時啟用混合模式', async () => {
     const options = {
       preRecognizedFoods: [
         { name: '白飯', confidence: 0.9, portion: 200 }
       ],
       dishType: DishType.BENTO // 便當需要至少 5 個成分
     };
     // 應該補充 Vision API 識別
   });
   ```

4. **成分合併測試**:
   ```typescript
   it('應該避免重複的成分', async () => {
     const preRecognized = [
       { name: '白飯', confidence: 0.9, portion: 200 }
     ];
     const vision = [
       { name: '白飯', confidence: 0.85, portion: 180 }, // 重複
       { name: '炸豬排', confidence: 0.8, portion: 150 }  // 新成分
     ];
     // 應該只添加炸豬排，跳過重複的白飯
   });
   ```

### 整合測試場景

1. **完整降級流程測試**:
   - 提供無效的預識別食物
   - 驗證系統降級至 Vision API
   - 確認最終返回有效結果

2. **混合模式端到端測試**:
   - 提供少量預識別食物
   - 驗證系統啟用混合模式
   - 確認結果包含預識別和 Vision API 的成分

## 性能影響

### 正面影響
- **減少不必要的 API 調用**: 只在需要時才調用 Vision API
- **提高系統穩定性**: 錯誤處理確保系統不會崩潰
- **改善用戶體驗**: 即使部分數據無效，系統仍能返回結果

### 潛在開銷
- **格式驗證**: 每個預識別食物都需要驗證（開銷很小）
- **混合模式**: 在成分不足時會額外調用 Vision API（但這是必要的）

## 符合的需求

- ✅ **Requirement 2.3**: 實現降級邏輯，確保系統在預識別食物不可用時仍能正常工作
- ✅ **Requirement 3.2**: 支持混合模式，在需要時補充 Vision API 識別
- ✅ **Requirement 4.1-4.4**: 完整的日誌記錄，便於追蹤和調試

## 後續建議

1. **監控降級頻率**: 追蹤系統降級至 Vision API 的頻率，識別數據質量問題
2. **優化混合模式閾值**: 根據實際使用情況調整各料理類型的最小成分數量
3. **添加性能指標**: 記錄混合模式的處理時間和成本
4. **用戶反饋**: 收集用戶對混合模式結果的反饋，持續改進

## 總結

成功實現了完整的錯誤處理和降級邏輯，包括：
- ✅ 空列表檢測和處理
- ✅ 格式驗證和自動修正
- ✅ 智能混合模式
- ✅ 成分去重合併
- ✅ 詳細的日誌記錄

系統現在能夠優雅地處理各種異常情況，確保在任何情況下都能為用戶提供有用的結果。
