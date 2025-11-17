# ComponentSuggestionGenerator 快速參考

## 快速開始

```typescript
import { ComponentSuggestionGenerator } from './ComponentSuggestionGenerator';

const generator = new ComponentSuggestionGenerator();

const suggestions = generator.generateSuggestions(
  mainDish,      // 主料理資訊
  components,    // 檢測到的成分列表
  confidence     // 整體信心度
);
```

## 建議類型

### 1. 缺失成分建議
```typescript
suggestions.possibleMissingComponents
// ['雞蛋', '青蔥', '醬油']
```

### 2. 份量調整建議
```typescript
suggestions.portionAdjustments
// [
//   {
//     component: '白飯',
//     suggestedPortion: 200,
//     reason: '檢測到的份量（150g）低於典型範圍'
//   }
// ]
```

### 3. 替代解釋建議
```typescript
suggestions.alternativeInterpretations
// [
//   {
//     dishName: '揚州炒飯',
//     components: [...],
//     confidence: 0.78
//   }
// ]
```

## 建議摘要

```typescript
const summary = generator.generateSuggestionSummary(suggestions);
// "可能缺失的成分：雞蛋、青蔥；有 2 個成分的份量建議調整"
```

## 建議觸發條件

| 建議類型 | 觸發條件 |
|---------|---------|
| 缺失成分 | 知識庫中頻率 > 0.7 的成分未被檢測到 |
| 份量調整 | 份量超出範圍或信心度 < 0.7 |
| 替代解釋 | 整體信心度 < 0.85 |

## 建議數量限制

- 缺失成分：最多 5 個
- 份量調整：最多 3 個
- 替代解釋：最多 2 個

## 料理類型特定建議

### 炒飯 (FRIED_RICE)
- 主食（米飯）
- 蛋白質（雞蛋）
- 蔬菜（青蔥）

### 湯品 (SOUP)
- 湯底
- 蛋白質（豆腐）

### 便當 (BENTO)
- 主食（白飯）
- 主菜（肉類/魚類）
- 配菜（蔬菜）

### 麵食 (NOODLES)
- 麵條

### 炒菜 (STIR_FRY)
- 調味料

## API 使用範例

```typescript
// 在 PhotoController 中
const suggestions = this.suggestionGenerator.generateSuggestions(
  {
    name: '蛋炒飯',
    type: DishType.FRIED_RICE,
    confidence: 0.92,
    estimatedTotalPortion: 300
  },
  detectedComponents,
  0.92
);

// 回應中包含建議
res.json({
  success: true,
  data: {
    componentDetection: {
      suggestions: {
        possibleMissingComponents: suggestions.possibleMissingComponents,
        portionAdjustments: suggestions.portionAdjustments,
        alternativeInterpretations: suggestions.alternativeInterpretations,
        summary: generator.generateSuggestionSummary(suggestions)
      }
    }
  }
});
```

## 常見問題

### Q: 為什麼沒有生成替代解釋？
A: 只有當整體信心度 < 0.85 時才會生成替代解釋。

### Q: 如何調整建議數量？
A: 修改各方法中的 `.slice(0, N)` 限制。

### Q: 如何添加新的料理類型建議？
A: 在 `getTypeSpecificMissingSuggestions()` 方法中添加新的 case。

### Q: 建議的準確性如何？
A: 建議基於知識庫的統計數據，準確性取決於知識庫的完整性。

## 相關文件

- `ComponentSuggestionGenerator.README.md` - 詳細文檔
- `ComponentSuggestionGenerator.example.ts` - 使用範例
- `ComponentSuggestionGenerator.test.ts` - 單元測試
