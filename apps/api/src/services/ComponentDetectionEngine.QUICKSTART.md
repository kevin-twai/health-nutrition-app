# ComponentDetectionEngine 快速入門

## 5 分鐘快速上手

### 1. 安裝和配置

```bash
# 設置環境變數
export OPENAI_API_KEY="your-api-key-here"
```

### 2. 基本使用

```typescript
import { ComponentDetectionEngine } from './services/ComponentDetectionEngine';
import { DishType } from './types/ComponentDetection';
import fs from 'fs';

// 創建引擎
const engine = new ComponentDetectionEngine('zh-TW');

// 讀取圖片
const imageBuffer = fs.readFileSync('food-image.jpg');

// 檢測成分
const result = await engine.detectComponents(
  imageBuffer,
  '蛋炒飯',
  DishType.FRIED_RICE
);

// 查看結果
console.log('料理:', result.mainDish.name);
console.log('成分數量:', result.components.length);
result.components.forEach(comp => {
  console.log(`- ${comp.name}: ${comp.estimatedPortion}g`);
});
```

### 3. 自動判斷料理類型

```typescript
// 不提供料理名稱和類型
const result = await engine.detectComponents(imageBuffer);

console.log('自動判斷:', result.mainDish.name);
console.log('類型:', result.mainDish.type);
```

### 4. 驗證結果

```typescript
const validation = engine.validateComponents(
  result.components,
  result.mainDish.type
);

if (!validation.isValid) {
  console.log('錯誤:', validation.errors);
}
```

### 5. 使用建議

```typescript
if (result.suggestions.possibleMissingComponents.length > 0) {
  console.log('可能缺失:', result.suggestions.possibleMissingComponents);
}
```

## 支持的料理類型

| 類型 | 說明 | 範例 |
|------|------|------|
| `SOUP` | 湯品類 | 味噌湯、蛋花湯、貢丸湯 |
| `FRIED_RICE` | 炒飯類 | 蛋炒飯、海鮮炒飯 |
| `BENTO` | 便當類 | 台式便當、日式便當 |
| `NOODLES` | 麵食類 | 拉麵、烏龍麵、米粉 |
| `DUMPLING` | 點心類 | 小籠包、餃子、燒賣 |

## 常見問題

### Q: 沒有 OpenAI API Key 怎麼辦？

A: 系統會自動降級到僅使用知識庫，但功能會受限。

### Q: 如何提高識別準確率？

A: 
1. 使用清晰的圖片
2. 確保光線充足
3. 提供正確的料理名稱和類型
4. 使用適當的圖片大小（建議 1024x1024 以下）

### Q: 如何處理錯誤？

A:
```typescript
try {
  const result = await engine.detectComponents(imageBuffer);
} catch (error) {
  if (error.message.includes('OpenAI API')) {
    // Vision API 錯誤
  } else {
    // 其他錯誤
  }
}
```

### Q: 如何添加新的料理類型？

A:
1. 在 `DishType` 枚舉中添加新類型
2. 在 `dishComponentMaps.ts` 中添加成分映射
3. 在 `ComponentDetectionPrompts.ts` 中添加專用 prompt
4. 更新 `selectPromptForDishType()` 方法

## 性能優化建議

1. **圖片大小**: 壓縮到 1024x1024 以下
2. **批量處理**: 使用隊列處理多張圖片
3. **緩存結果**: 對相同料理緩存識別結果
4. **並行處理**: 多個請求可以並行處理

## 更多資源

- 📖 [完整文檔](./ComponentDetectionEngine.README.md)
- 💡 [使用範例](./ComponentDetectionEngine.example.ts)
- 🧪 [單元測試](./ComponentDetectionEngine.test.ts)
- 📝 [實施總結](../../.kiro/specs/asian-cuisine-component-detection/TASK_4_IMPLEMENTATION_SUMMARY.md)

## 下一步

- 實現 `ComponentNutritionCalculator` 計算營養
- 整合到 `PhotoController` API
- 添加更多料理類型支持
