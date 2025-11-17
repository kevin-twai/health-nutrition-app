# 任務 7 實施摘要：更新 API 回應格式

## 完成日期
2025-11-16

## 實施概述

成功實現了任務 7「更新 API 回應格式」，包括兩個子任務：
1. 擴展回應類型
2. 實現建議生成

## 子任務 7.1：擴展回應類型

### 實施內容

在 `apps/api/src/types/shared.ts` 中添加了完整的成分識別 API 回應類型定義：

#### 新增的核心類型

1. **ComponentRecognitionResponse** - 成分識別 API 回應接口
   - 用於 `/api/v1/photo/recognize-with-components` 端點
   - 包含 success、data、error、timestamp 欄位

2. **ComponentRecognitionData** - 成分識別回應數據
   - sessionId: 會話識別碼
   - imageInfo: 圖片上傳資訊
   - recognition: 基礎識別資訊
   - componentDetection: 成分檢測資訊（可選）
   - validation: 驗證資訊
   - processingTime: 處理時間

3. **ComponentDetectionInfo** - 成分檢測資訊
   - enabled: 是否啟用成分檢測
   - success: 是否成功
   - mainDish: 主料理資訊
   - components: 檢測到的成分列表
   - nutritionSummary: 營養摘要
   - metadata: 檢測元數據
   - suggestions: 用戶建議
   - error/errorCode/fallbackMessage: 錯誤處理

4. **支援類型**
   - MainDishInfo: 主料理資訊
   - DetectedComponentInfo: 檢測到的成分資訊
   - ComponentVisualFeatures: 成分視覺特徵
   - ComponentNutritionSummary: 成分營養摘要
   - ComponentNutritionDetail: 成分營養詳情
   - CategoryNutritionDetail: 類別營養詳情
   - CookingImpactDetail: 烹飪影響詳情
   - ComponentDetectionMetadata: 成分檢測元數據
   - ComponentSuggestions: 成分建議
   - ValidationInfo: 驗證資訊

### 向後兼容性

- 所有新類型都是可選的或獨立的
- 不影響現有的 API 回應格式
- 通過 `includeComponents` 查詢參數控制是否啟用成分檢測

### 文件位置

- `apps/api/src/types/shared.ts` - 新增 200+ 行類型定義

## 子任務 7.2：實現建議生成

### 實施內容

創建了 `ComponentSuggestionGenerator` 服務，負責生成三種類型的智能建議：

#### 1. 可能缺失的成分建議

**功能：**
- 根據料理類型和已檢測的成分，推測可能缺失的常見成分
- 從知識庫獲取該料理的常見成分列表
- 檢查哪些高頻率成分（frequency > 0.7）未被檢測到
- 根據料理類型添加特定建議

**料理類型特定建議：**
- 炒飯類：檢查主食、蛋白質、蔬菜
- 湯品類：檢查湯底、蛋白質
- 便當類：檢查主食、主菜、配菜
- 麵食類：檢查麵條
- 炒菜類：檢查調味料

**限制：** 最多 5 個建議

#### 2. 份量調整建議

**功能：**
- 檢查檢測到的份量是否在合理範圍內
- 檢查識別信心度是否足夠（< 0.7 時建議使用典型份量）
- 檢查總份量是否合理（與料理典型份量比較）

**檢查項目：**
- 份量是否低於最小值
- 份量是否高於最大值
- 信心度是否過低
- 總份量是否明顯偏離典型值

**限制：** 最多 3 個建議

#### 3. 替代解釋建議

**功能：**
- 當識別信心度較低時（< 0.85），提供其他可能的料理解釋
- 根據檢測到的成分，尋找相似的料理
- 計算與其他料理的相似度
- 生成替代料理的成分列表

**相似度計算：**
```
相似度 = 匹配的成分數量 / 檢測到的成分總數
```

**限制：** 最多 2 個替代解釋

### 核心方法

1. **generateSuggestions()** - 生成完整的用戶建議
2. **generateSuggestionSummary()** - 生成用戶友好的建議摘要
3. **generateMissingComponentsSuggestions()** - 生成缺失成分建議
4. **generatePortionAdjustments()** - 生成份量調整建議
5. **generateAlternativeInterpretations()** - 生成替代解釋建議

### 整合到 ComponentDetectionEngine

修改了 `ComponentDetectionEngine` 以使用新的建議生成器：

```typescript
private suggestionGenerator: ComponentSuggestionGenerator;

constructor() {
  this.suggestionGenerator = new ComponentSuggestionGenerator();
}

private generateSuggestions(...): UserSuggestions {
  const mainDish: MainDishInfo = {
    name: dishName,
    type: dishType,
    confidence: this.calculateOverallConfidence(components),
    estimatedTotalPortion: components.reduce((sum, c) => sum + c.estimatedPortion, 0)
  };

  return this.suggestionGenerator.generateSuggestions(
    mainDish,
    components,
    mainDish.confidence
  );
}
```

### 文件結構

```
apps/api/src/services/
├── ComponentSuggestionGenerator.ts           # 主要實現（400+ 行）
├── ComponentSuggestionGenerator.README.md    # 詳細文檔
├── ComponentSuggestionGenerator.example.ts   # 使用範例
└── __tests__/
    └── ComponentSuggestionGenerator.test.ts  # 單元測試
```

## 測試結果

### 單元測試

創建了 8 個測試案例，全部通過：

```
✓ 應該為缺少常見成分的炒飯生成建議
✓ 應該為份量不合理的成分生成調整建議
✓ 應該在低信心度時生成替代解釋
✓ 應該在高信心度時不生成替代解釋
✓ 應該生成包含所有建議類型的摘要
✓ 應該在沒有建議時返回適當的訊息
✓ 應該為便當生成特定的缺失成分建議
✓ 應該為湯品生成特定的缺失成分建議

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### 測試覆蓋範圍

- ✅ 缺失成分建議生成
- ✅ 份量調整建議生成
- ✅ 替代解釋建議生成
- ✅ 建議摘要生成
- ✅ 料理類型特定建議
- ✅ 高/低信心度場景

## API 回應範例

### 成功回應（包含建議）

```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_123",
    "imageInfo": { ... },
    "recognition": { ... },
    "componentDetection": {
      "enabled": true,
      "success": true,
      "mainDish": {
        "name": "蛋炒飯",
        "type": "fried_rice",
        "confidence": 0.92,
        "estimatedTotalPortion": 300
      },
      "components": [ ... ],
      "suggestions": {
        "possibleMissingComponents": [
          "雞蛋",
          "青蔥"
        ],
        "portionAdjustments": [
          {
            "component": "白飯",
            "suggestedPortion": 200,
            "reason": "檢測到的份量（150g）低於典型範圍（180-250g），建議調整為典型份量"
          }
        ],
        "alternativeInterpretations": []
      }
    },
    "validation": { ... },
    "processingTime": 3500
  },
  "timestamp": "2025-11-16T..."
}
```

### 降級回應（成分檢測失敗）

```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_456",
    "imageInfo": { ... },
    "recognition": { ... },
    "componentDetection": {
      "enabled": true,
      "success": false,
      "error": "Vision API 調用失敗",
      "errorCode": "VISION_API_ERROR",
      "fallbackMessage": "已降級至基礎識別模式，您仍可查看料理的整體營養資訊"
    },
    "validation": { ... },
    "processingTime": 2000
  },
  "timestamp": "2025-11-16T..."
}
```

## 需求對應

### Requirement 3.1
✅ 在回應中明確區分料理整體和個別成分
- 通過 `mainDish` 和 `components` 欄位實現

### Requirement 3.6
✅ 支持用戶手動調整或移除識別的成分
- 提供缺失成分建議，幫助用戶添加成分
- 提供份量調整建議，幫助用戶修正份量
- 提供替代解釋，幫助用戶選擇正確的料理

## 技術亮點

1. **智能建議生成**
   - 基於知識庫的缺失成分推測
   - 基於統計範圍的份量驗證
   - 基於相似度計算的替代解釋

2. **料理類型感知**
   - 不同料理類型有不同的建議邏輯
   - 考慮料理的典型結構和成分

3. **信心度驅動**
   - 高信心度時減少建議
   - 低信心度時提供更多選項

4. **用戶友好**
   - 建議數量限制，避免資訊過載
   - 提供清晰的調整原因
   - 生成易讀的建議摘要

## 向後兼容性

- ✅ 所有新功能都是可選的
- ✅ 通過 `includeComponents` 查詢參數控制
- ✅ 不影響現有的 API 端點
- ✅ 降級機制確保基礎功能可用

## 性能考量

- 建議生成在記憶體中完成，無需額外的 API 調用
- 知識庫查詢使用高效的陣列操作
- 相似度計算使用簡單的字串比對
- 建議數量限制避免過度計算

## 未來改進建議

1. **機器學習增強**
   - 使用歷史數據訓練模型
   - 個性化建議（基於用戶偏好）

2. **更智能的相似度計算**
   - 使用詞向量（word embeddings）
   - 考慮成分的語義相似度

3. **動態調整建議數量**
   - 根據信心度動態調整
   - 高信心度時減少，低信心度時增加

4. **用戶反饋學習**
   - 收集用戶對建議的反饋
   - 持續改進建議質量

## 文檔

- ✅ ComponentSuggestionGenerator.README.md - 詳細使用文檔
- ✅ ComponentSuggestionGenerator.example.ts - 5 個實用範例
- ✅ 代碼註釋完整
- ✅ 類型定義清晰

## 總結

任務 7 已成功完成，實現了：

1. **完整的 API 回應類型系統**
   - 15+ 個新類型定義
   - 完整的類型安全
   - 向後兼容

2. **智能建議生成系統**
   - 3 種建議類型
   - 料理類型感知
   - 信心度驅動
   - 用戶友好

3. **全面的測試覆蓋**
   - 8 個單元測試
   - 100% 通過率
   - 多種場景覆蓋

4. **詳細的文檔**
   - README 文檔
   - 使用範例
   - API 回應範例

這為用戶提供了更好的成分識別體驗，幫助他們理解和調整識別結果。
