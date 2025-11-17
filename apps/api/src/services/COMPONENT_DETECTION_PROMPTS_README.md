# 成分識別 Prompt 生成器

## 概述

此模組為 `EnhancedPromptGenerator` 添加了成分識別功能，支持為不同類型的亞洲料理生成專門的成分識別 prompt。

## 功能特點

### 1. 支持多種料理類型

- **湯品類** (`DishType.SOUP`): 味噌湯、蛋花湯、貢丸湯等
- **炒飯類** (`DishType.FRIED_RICE`): 蛋炒飯、海鮮炒飯等
- **便當類** (`DishType.BENTO`): 台式便當、日式便當等
- **麵食類** (`DishType.NOODLES`): 拉麵、烏龍麵、米粉等
- **通用類型**: 炒菜、點心、燒烤等

### 2. 成分精煉功能

對於信心度較低的成分，可以生成精煉 prompt 進行二次確認。

### 3. 多語言支持

- 繁體中文 (`zh-TW`)
- 英文 (`en`)

### 4. 地區背景知識

可以添加地區特色資訊（如台北、台南、花蓮等）來增強識別準確度。

## 使用方法

### 基本使用

```typescript
import { EnhancedPromptGenerator } from './EnhancedPromptGenerator';
import { DishType } from '../types/ComponentDetection';

// 創建生成器實例
const generator = new EnhancedPromptGenerator('zh-TW');

// 生成成分識別 prompt
const prompt = generator.generateComponentDetectionPrompt(
  '味噌湯',
  DishType.SOUP
);

// 將 prompt 發送給 Vision API
// const result = await visionAPI.analyze(image, prompt);
```

### 帶地區資訊

```typescript
const prompt = generator.generateComponentDetectionPrompt(
  '牛肉湯',
  DishType.SOUP,
  '台南'  // 添加台南地區背景知識
);
```

### 成分精煉（二次確認）

```typescript
// 假設初步識別結果
const initialComponents = [
  { name: '豆腐', confidence: 0.95, estimatedPortion: 50 },
  { name: '海帶', confidence: 0.65, estimatedPortion: 20 },  // 信心度較低
  { name: '蔥花', confidence: 0.80, estimatedPortion: 5 }
];

// 生成精煉 prompt
const refinementPrompt = generator.generateComponentRefinementPrompt(
  initialComponents,
  '味噌湯'
);

// 將精煉 prompt 發送給 Vision API 進行二次確認
// const refinedResult = await visionAPI.analyze(image, refinementPrompt);
```

### 英文模式

```typescript
const enGenerator = new EnhancedPromptGenerator('en');

const prompt = enGenerator.generateComponentDetectionPrompt(
  'Miso Soup',
  DishType.SOUP
);
```

## Prompt 結構

### 成分識別 Prompt 包含

1. **料理類型特定指導**
   - 湯品：湯底類型、固體配料、份量估算
   - 炒飯：主食、蛋白質、蔬菜、調味料
   - 便當：主食區、主菜區、配菜區
   - 麵食：麵條類型、湯底、配料

2. **視覺特徵指導**
   - 顏色、形狀、質地、位置

3. **份量估算指導**
   - 每種成分的典型份量範圍
   - 視覺比例考量

4. **JSON 格式要求**
   - 結構化的回應格式
   - 必要欄位定義

5. **特別注意事項**
   - 易混淆食材的區分
   - 隱藏成分的識別
   - 小配料的注意

### 精煉 Prompt 包含

1. **初步識別結果回顧**
   - 列出所有已識別的成分
   - 顯示信心度和份量

2. **檢查重點**
   - 成分名稱是否正確
   - 份量估算是否合理
   - 是否有遺漏的成分

3. **精煉指導**
   - 對低信心度成分的特別關注
   - 易混淆食材的再次確認
   - 典型成分組成的參考

## 完整流程範例

```typescript
async function detectDishComponents(
  image: Buffer,
  dishName: string,
  dishType: DishType
) {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  // 步驟 1: 生成初始成分識別 prompt
  const detectionPrompt = generator.generateComponentDetectionPrompt(
    dishName,
    dishType
  );
  
  // 步驟 2: 使用 Vision API 識別成分
  const initialResult = await visionAPI.analyze(image, detectionPrompt);
  const components = parseComponents(initialResult);
  
  // 步驟 3: 檢查是否需要精煉
  const needsRefinement = components.some(c => c.confidence < 0.70);
  
  if (needsRefinement) {
    // 步驟 4: 生成精煉 prompt
    const refinementPrompt = generator.generateComponentRefinementPrompt(
      components,
      dishName
    );
    
    // 步驟 5: 進行二次確認
    const refinedResult = await visionAPI.analyze(image, refinementPrompt);
    return parseRefinedComponents(refinedResult);
  }
  
  return components;
}
```

## 測試

運行測試：

```bash
# 測試成分識別 prompt 生成
npm test -- ComponentDetectionPrompts.test.ts

# 測試 EnhancedPromptGenerator 整合
npm test -- EnhancedPromptGenerator.component.test.ts
```

## 範例

查看完整的使用範例：

```bash
# 運行範例文件
ts-node src/services/ComponentDetectionPrompts.example.ts
```

或在代碼中導入：

```typescript
import {
  example1_SoupComponentDetection,
  example2_FriedRiceComponentDetection,
  example6_ComponentRefinement,
  example7_CompleteFlow
} from './ComponentDetectionPrompts.example';

// 運行特定範例
example1_SoupComponentDetection();
```

## 支持的料理類型詳細說明

### 湯品類 (SOUP)

**適用料理**：
- 味噌湯、蛋花湯、貢丸湯、酸辣湯
- 排骨湯、魚湯、雞湯
- 羹湯、火鍋湯

**識別重點**：
- 湯底類型（清湯、濃湯、味噌、羹湯）
- 固體配料（蛋白質、蔬菜、其他）
- 配料位置（表面、中間、底部）
- 湯量估算

### 炒飯類 (FRIED_RICE)

**適用料理**：
- 蛋炒飯、海鮮炒飯、揚州炒飯
- 泰式炒飯、韓式炒飯

**識別重點**：
- 米飯類型和份量
- 蛋白質成分（蛋、肉類、海鮮）
- 蔬菜配料（青豆、玉米、胡蘿蔔等）
- 調味料痕跡

### 便當類 (BENTO)

**適用料理**：
- 台式便當、日式便當、韓式便當
- 定食、套餐

**識別重點**：
- 區域劃分（主食區、主菜區、配菜區）
- 每個區域的食物識別
- 主菜和配菜的區分
- 各食物的份量

### 麵食類 (NOODLES)

**適用料理**：
- 拉麵、烏龍麵、蕎麥麵
- 米粉、河粉、冬粉
- 湯麵、乾麵、炒麵

**識別重點**：
- 麵條類型
- 湯底類型（如果是湯麵）
- 配料（蛋白質、蔬菜、其他）
- 調味料

## 最佳實踐

### 1. 選擇正確的料理類型

```typescript
// ✅ 正確
const prompt = generator.generateComponentDetectionPrompt(
  '味噌湯',
  DishType.SOUP
);

// ❌ 錯誤
const prompt = generator.generateComponentDetectionPrompt(
  '味噌湯',
  DishType.FRIED_RICE  // 類型不匹配
);
```

### 2. 使用精煉功能提高準確度

```typescript
// 對於信心度低於 70% 的成分，使用精煉 prompt
if (component.confidence < 0.70) {
  const refinementPrompt = generator.generateComponentRefinementPrompt(
    components,
    dishContext
  );
  // 進行二次確認
}
```

### 3. 添加地區資訊

```typescript
// 對於有地方特色的料理，添加地區資訊
const prompt = generator.generateComponentDetectionPrompt(
  '牛肉湯',
  DishType.SOUP,
  '台南'  // 台南牛肉湯有特色
);
```

### 4. 選擇合適的語言

```typescript
// 根據用戶偏好選擇語言
const userLanguage = getUserPreferredLanguage();
const generator = new EnhancedPromptGenerator(userLanguage);
```

## 注意事項

1. **Prompt 長度**：生成的 prompt 可能較長（1000-3000 字元），確保 Vision API 支持
2. **Token 限制**：注意 Vision API 的 token 限制
3. **成本考量**：精煉功能會進行二次 API 調用，增加成本
4. **信心度閾值**：建議使用 0.70 作為精煉的閾值
5. **批量處理**：批量處理時注意 API 速率限制

## 相關文件

- [ComponentDetection.ts](../types/ComponentDetection.ts) - 類型定義
- [ComponentDetectionPrompts.ts](./ComponentDetectionPrompts.ts) - Prompt 生成函數
- [EnhancedPromptGenerator.ts](./EnhancedPromptGenerator.ts) - 主要生成器類
- [ComponentDetectionPrompts.example.ts](./ComponentDetectionPrompts.example.ts) - 使用範例

## 未來改進

- [ ] 添加更多料理類型的專門 prompt
- [ ] 支持更多地區的背景知識
- [ ] 添加季節性食材提示
- [ ] 支持用戶自定義 prompt 模板
- [ ] 添加 prompt 性能分析工具

## 貢獻

如果您想添加新的料理類型或改進現有 prompt，請：

1. 在 `ComponentDetectionPrompts.ts` 中添加新的生成函數
2. 在 `EnhancedPromptGenerator.ts` 中添加對應的調用邏輯
3. 添加測試用例
4. 更新此 README

## 授權

MIT License
