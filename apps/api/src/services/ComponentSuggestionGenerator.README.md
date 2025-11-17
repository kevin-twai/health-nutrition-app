# ComponentSuggestionGenerator - 成分建議生成器

## 概述

`ComponentSuggestionGenerator` 負責為成分識別結果生成智能建議，幫助用戶更好地理解和調整識別結果。

## 功能

### 1. 可能缺失的成分建議

根據料理類型和已檢測的成分，推測可能缺失的常見成分。

**邏輯：**
- 從知識庫獲取該料理的常見成分列表
- 檢查哪些高頻率成分（frequency > 0.7）未被檢測到
- 根據料理類型添加特定建議
- 限制建議數量（最多 5 個）

**範例：**
```typescript
// 炒飯識別結果缺少雞蛋
possibleMissingComponents: ['雞蛋', '青蔥']
```

### 2. 份量調整建議

檢查檢測到的份量是否合理，並提供調整建議。

**檢查項目：**
- 份量是否在合理範圍內（min-max）
- 識別信心度是否足夠（< 0.7 時建議使用典型份量）
- 總份量是否合理（與料理典型份量比較）

**範例：**
```typescript
portionAdjustments: [
  {
    component: '白飯',
    suggestedPortion: 200,
    reason: '檢測到的份量（150g）低於典型範圍（180-250g），建議調整為典型份量'
  }
]
```

### 3. 替代解釋建議

當識別信心度較低時（< 0.85），提供其他可能的料理解釋。

**邏輯：**
- 根據檢測到的成分，尋找相似的料理
- 計算與其他料理的相似度
- 生成替代料理的成分列表
- 按信心度排序，限制數量（最多 2 個）

**範例：**
```typescript
alternativeInterpretations: [
  {
    dishName: '揚州炒飯',
    components: [...],
    confidence: 0.78
  },
  {
    dishName: '蝦仁炒飯',
    components: [...],
    confidence: 0.72
  }
]
```

## 使用方式

### 基本使用

```typescript
import { ComponentSuggestionGenerator } from './ComponentSuggestionGenerator';

const generator = new ComponentSuggestionGenerator();

// 生成建議
const suggestions = generator.generateSuggestions(
  mainDish,
  detectedComponents,
  confidenceScore
);

console.log('可能缺失的成分:', suggestions.possibleMissingComponents);
console.log('份量調整建議:', suggestions.portionAdjustments);
console.log('替代解釋:', suggestions.alternativeInterpretations);
```

### 生成建議摘要

```typescript
// 生成用戶友好的建議摘要
const summary = generator.generateSuggestionSummary(suggestions);
console.log(summary);
// 輸出: "可能缺失的成分：雞蛋、青蔥；有 2 個成分的份量建議調整"
```

## 料理類型特定建議

### 炒飯類 (FRIED_RICE)
- 檢查是否有主食（米飯）
- 檢查是否有蛋白質（雞蛋）
- 檢查是否有蔬菜（青蔥）

### 湯品類 (SOUP)
- 檢查是否有湯底
- 檢查是否有蛋白質（豆腐）

### 便當類 (BENTO)
- 檢查是否有主食（白飯）
- 檢查是否有主菜（肉類或魚類）
- 檢查是否有配菜（蔬菜）

### 麵食類 (NOODLES)
- 檢查是否有麵條

### 炒菜類 (STIR_FRY)
- 檢查是否有調味料

## 相似度計算

### 料理相似度

```typescript
相似度 = 匹配的成分數量 / 檢測到的成分總數
```

**範例：**
- 檢測到的成分：['白飯', '雞蛋', '青蔥']
- 料理 A 的成分：['白飯', '雞蛋', '青蔥', '火腿']
- 相似度 = 3 / 3 = 1.0

### 成分名稱相似度

使用簡單的字串包含檢查：
- 完全匹配
- 一個名稱包含另一個
- 在替代名稱列表中

## 建議限制

為了避免資訊過載，各類建議都有數量限制：

- **缺失成分建議**：最多 5 個
- **份量調整建議**：最多 3 個
- **替代解釋**：最多 2 個

## 整合到 ComponentDetectionEngine

```typescript
// 在 ComponentDetectionEngine 中
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

## API 回應範例

```json
{
  "success": true,
  "data": {
    "componentDetection": {
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
        "alternativeInterpretations": [
          {
            "dishName": "揚州炒飯",
            "components": [...],
            "confidence": 0.78
          }
        ]
      }
    }
  }
}
```

## 需求對應

此功能實現了以下需求：

- **Requirement 3.6**: 支持用戶手動調整或移除識別的成分
  - 提供缺失成分建議，幫助用戶添加成分
  - 提供份量調整建議，幫助用戶修正份量
  - 提供替代解釋，幫助用戶選擇正確的料理

## 未來改進

1. **機器學習增強**
   - 使用歷史數據訓練模型
   - 個性化建議（基於用戶偏好）

2. **更智能的相似度計算**
   - 使用詞向量（word embeddings）
   - 考慮成分的語義相似度

3. **動態調整建議數量**
   - 根據信心度動態調整建議數量
   - 高信心度時減少建議，低信心度時增加建議

4. **用戶反饋學習**
   - 收集用戶對建議的反饋
   - 持續改進建議質量
