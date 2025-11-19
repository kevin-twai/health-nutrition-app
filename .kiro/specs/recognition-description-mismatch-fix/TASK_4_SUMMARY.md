# 任務 4 實現摘要

## 任務概述
修改 PhotoController.recognizeWithComponents 方法，實現預識別食物的傳遞和一致性驗證。

## 完成的子任務

### 4.1 更新參數傳遞邏輯 ✅

**實現內容：**
- 構建 `DetectComponentsOptions` 對象，包含 `dishName`、`dishType` 和 `preRecognizedFoods`
- 傳遞完整的 `multiStageResult.foods` 列表給成分檢測引擎
- 添加 `inferDishType` 輔助方法，根據食物名稱推斷料理類型

**代碼變更：**
```typescript
// 構建完整的 DetectComponentsOptions 對象
const detectOptions: DetectComponentsOptions = {
  dishName,
  dishType,
  preRecognizedFoods: multiStageResult.foods // 傳遞完整的 multiStageResult.foods 列表
};

// 使用新的 options 參數調用成分檢測引擎
componentResult = await this.componentDetectionEngine.detectComponents(
  req.file.buffer,
  detectOptions
);
```

**新增方法：**
- `inferDishType(foods?: RecognizedFood[]): DishType | undefined` - 根據食物列表推斷料理類型

### 4.2 添加一致性驗證 ✅

**實現內容：**
- 比較基礎識別和成分識別的食物名稱
- 檢測缺失的食物（在基礎識別中但不在成分列表中）
- 檢測額外的成分（在成分列表中但不在基礎識別中）
- 記錄一致性檢查結果

**代碼變更：**
```typescript
// 比較基礎識別和成分識別的食物名稱
const recognizedFoodNames = new Set(multiStageResult.foods.map(f => f.name));
const componentNames = new Set(componentResult.components.map(c => c.name));

// 檢查缺失的食物
const missingFoods = Array.from(recognizedFoodNames).filter(
  name => !componentNames.has(name)
);

// 檢查額外的成分
const extraComponents = Array.from(componentNames).filter(
  name => !recognizedFoodNames.has(name)
);

if (missingFoods.length > 0) {
  console.warn(`[${sessionId}] ⚠️ 一致性警告: 以下食物在成分列表中缺失:`, missingFoods);
}
```

### 4.3 更新日誌記錄 ✅

**實現內容：**
- 記錄傳遞給成分檢測引擎的參數（dishName、dishType、preRecognizedFoods）
- 記錄預識別食物列表的詳細信息
- 記錄一致性檢查結果（基礎識別食物數、成分識別數量、缺失食物數、額外成分數）

**日誌示例：**
```
[session_xxx] 傳遞給成分檢測引擎的參數:
[session_xxx]   - dishName: 白飯
[session_xxx]   - dishType: bento
[session_xxx]   - preRecognizedFoods: 3 個食物
[session_xxx] 預識別食物列表:
[session_xxx]   1. 白飯 (信心度: 95.0%, 份量: 200g)
[session_xxx]   2. 炸豬排 (信心度: 90.0%, 份量: 150g)
[session_xxx]   3. 滷蛋 (信心度: 85.0%, 份量: 60g)
[session_xxx] 一致性檢查結果:
[session_xxx]   - 基礎識別食物數: 3
[session_xxx]   - 成分識別數量: 3
[session_xxx]   - 缺失食物數: 0
[session_xxx]   - 額外成分數: 0
[session_xxx] ✓ 一致性檢查通過：基礎識別與成分識別完全一致
```

### 4.4 編寫 PhotoController 的整合測試 ✅

**測試文件：**
`apps/api/src/controllers/__tests__/PhotoController.recognizeWithComponents.test.ts`

**測試覆蓋：**

1. **任務 4.1 測試：**
   - ✅ 應該構建 DetectComponentsOptions 對象並傳遞完整的 preRecognizedFoods 列表
   - ✅ 應該正確推斷料理類型（湯品、炒飯、麵食、便當等）

2. **任務 4.2 測試：**
   - ✅ 應該驗證基礎識別和成分識別的食物名稱一致
   - ✅ 應該記錄缺失食物的警告

3. **任務 4.3 測試：**
   - ✅ 應該記錄傳遞給成分檢測引擎的參數

4. **降級處理測試：**
   - ✅ 應該在成分識別失敗時降級至基礎識別

## 代碼變更摘要

### 修改的文件

1. **apps/api/src/controllers/PhotoController.ts**
   - 導入新類型：`DetectComponentsOptions`, `DishType`, `RecognizedFood`
   - 修改 `recognizeWithComponents` 方法，實現預識別食物傳遞
   - 添加一致性驗證邏輯
   - 增強日誌記錄
   - 新增 `inferDishType` 輔助方法

2. **apps/api/src/controllers/__tests__/PhotoController.test.ts**
   - 添加 `recognizeWithComponents` 方法的整合測試

### 新增的文件

1. **apps/api/src/controllers/__tests__/PhotoController.recognizeWithComponents.test.ts**
   - 專門針對任務 4 的整合測試文件
   - 包含所有子任務的測試用例

## 驗證結果

### 類型檢查
```bash
✅ 無診斷錯誤
```

### 測試覆蓋
- ✅ 參數傳遞邏輯測試
- ✅ 料理類型推斷測試
- ✅ 一致性驗證測試
- ✅ 日誌記錄測試
- ✅ 降級處理測試

## 符合的需求

### Requirement 1.2
✅ "WHEN THE System 收到基礎識別結果時，THE System SHALL 將所有識別出的食物傳遞給成分檢測引擎"
- 實現：通過 `preRecognizedFoods` 參數傳遞完整的 `multiStageResult.foods` 列表

### Requirement 1.5
✅ "WHEN THE System 返回識別結果時，THE System SHALL 確保 recognition description 與檢測到的成分一致"
- 實現：添加一致性驗證邏輯，比較基礎識別和成分識別的食物名稱

### Requirement 3.1
✅ "WHEN 基礎識別檢測到多個食物時，THE System SHALL 將所有食物傳遞給成分檢測引擎"
- 實現：傳遞完整的食物列表，不僅僅是第一個食物

### Requirement 4.1, 4.2, 4.3, 4.4
✅ 系統管理員可以追蹤識別流程的每個步驟
- 實現：詳細的日誌記錄，包括參數、預識別食物列表、一致性檢查結果

## 下一步

任務 4 已完成。可以繼續執行：
- 任務 5: 添加錯誤處理和降級邏輯
- 任務 6: 更新文檔和日誌
- 任務 7: 測試和驗證
- 任務 8: 部署和監控
- 任務 9: 文檔和清理

## 注意事項

1. **向後兼容性**：現有的 API 調用仍然可以正常工作，因為 `preRecognizedFoods` 是可選參數
2. **降級處理**：如果成分識別失敗，系統會自動降級至基礎識別模式
3. **日誌詳細度**：所有關鍵步驟都有詳細的日誌記錄，便於調試和監控
4. **測試覆蓋**：所有子任務都有對應的測試用例，確保功能正確性
