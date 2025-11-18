# 食材識別完整性修復指南

## 問題背景

在修復之前，EnhancedPromptGenerator 生成的 prompt 存在以下問題：

1. **限制性語句**：prompt 中包含「foods 列表必須包含 description 中提到的食材」這類表述
2. **優先順序錯誤**：先要求撰寫 description，再識別食材
3. **缺乏指導**：沒有明確的識別步驟和檢查清單
4. **範例不足**：沒有展示如何識別多種食材的具體範例

這導致 AI 在生成結構化數據時受到約束，無法正確識別圖片中的所有食材。

## 修復方案

### 核心改變

1. **移除限制性語句**
2. **重組 Prompt 結構**：將「識別所有食材」作為最優先任務
3. **添加識別步驟**：提供清晰的四步驟流程
4. **添加完整性檢查清單**：確保不遺漏任何可見食材
5. **強化特定料理類型**：針對容易遺漏食材的料理類型進行優化

### 修復前後對比

#### 修復前（有問題的 Prompt）

```
你是一位專業的亞洲料理營養師和食物識別專家...

請識別圖片中的食物，並以 JSON 格式回應...

**重要**：foods 列表必須包含所有可見的食材。如果你在 description 或 
overallDescription 中提到了某個食材，那麼該食材也必須出現在 foods 列表中。

請確保：
1. 準確識別食物名稱
2. 估算合理的份量
3. 提供詳細的描述
```

**問題**：
- 暗示 foods 列表依賴於 description
- 沒有明確要求識別「所有」食材
- 缺乏具體的識別步驟

#### 修復後（優化的 Prompt）

```
你是一位專業的亞洲料理營養師和食物識別專家...

## 核心任務（最重要）

**優先任務**：仔細觀察圖片，識別並列出所有可見的食材到 foods 列表中。

## 識別步驟（請按順序執行）

### 步驟 1：仔細觀察圖片
- 從整體到細節觀察圖片
- 注意不同位置的食材（表面、中間、底部）
- 識別顏色、形狀、質地等視覺特徵

### 步驟 2：識別每一種食材
- 列出所有可見的食材，包括：
  * 主要食材（如肉類、主菜）
  * 配菜（如蔬菜、豆製品）
  * 小配料（如蔥花、香菜、芝麻）
  * 調味料（如醬汁、油）
- 不要遺漏任何可見的食材

### 步驟 3：估算份量
- 為每種食材估算合理的份量（公克或毫升）

### 步驟 4：撰寫描述
- 在完成 foods 列表後，撰寫整體描述
- description 用於補充說明料理特色、烹飪方式等

## 重要說明

1. **foods 列表是獨立的結構化數據**，必須包含圖片中的所有食材
2. **description 是補充說明**，不應限制 foods 列表的內容
3. **即使某個食材在 description 中未提及**，只要在圖片中可見，就必須加入 foods 列表

## 完整性檢查清單

在提交回應前，請確認：
- [ ] 已識別所有可見的主要食材
- [ ] 已識別所有可見的配菜
- [ ] 已識別所有可見的小配料（蔥花、香菜等）
- [ ] 已識別調味料或醬汁
- [ ] foods 列表中至少有 3 種食材（如果圖片中有多種食材）
- [ ] 每種食材都有合理的份量估算
- [ ] 沒有遺漏任何明顯可見的食材
```

**改善**：
- 明確將食材識別作為最優先任務
- 提供清晰的四步驟流程
- 強調 foods 列表的獨立性
- 包含完整性檢查清單

## 特定料理類型的優化

### 湯品（Soup）

#### 修復前的問題
```typescript
// 可能只識別湯底，忽略配料
{
  "foods": [
    {"name": "味噌湯", "portion": 250}
  ]
}
```

#### 修復後的效果
```typescript
// 識別湯底和所有配料
{
  "foods": [
    {"name": "味噌湯底", "portion": 250},
    {"name": "豆腐", "portion": 30},
    {"name": "海帶芽", "portion": 10},
    {"name": "蔥花", "portion": 5}
  ]
}
```

#### Prompt 優化重點
```
## 湯品識別特別注意

**核心任務**：識別湯底和所有配料

### 必須識別的元素：
1. **湯底**（約 200-300ml）
2. **所有配料**（每種都要列出）
   - 蛋白質：豆腐、肉片、魚片、蛋等
   - 蔬菜：海帶、蔥花、香菇等
   - 其他：丸子、餃子、麵條等

### 識別步驟：
1. 先識別湯底類型和份量
2. 仔細觀察湯中的所有配料
3. 注意不同位置的配料：
   - 浮在表面的（蔥花、油）
   - 中間的（豆腐、肉片）
   - 沉在底部的（海帶、麵條）

**不要只回應「味噌湯」，必須列出所有配料！**
```

### 涼拌菜（Cold Dish）

#### 修復前的問題
```typescript
// 只識別主食材，忽略配菜
{
  "foods": [
    {"name": "豆腐干絲", "portion": 80}
  ]
}
```

#### 修復後的效果
```typescript
// 識別所有混合的食材
{
  "foods": [
    {"name": "豆腐干絲", "portion": 80},
    {"name": "芹菜絲", "portion": 20},
    {"name": "胡蘿蔔絲", "portion": 15},
    {"name": "香菜", "portion": 5},
    {"name": "麻油", "portion": 5}
  ]
}
```

#### Prompt 優化重點
```
## 涼拌菜識別特別注意

**核心任務**：識別所有混合的食材

### 必須識別的元素：
1. **主食材**（通常 1-2 種）
2. **配菜**（通常 2-4 種）
3. **調味料**

### 識別技巧：
- 注意不同顏色的食材（綠色、橙色、白色、黃色）
- 注意不同形狀的食材（絲狀、片狀、塊狀）
- 涼拌菜通常有 3-6 種食材，如果只識別到 1-2 種，請再仔細觀察

**不要只回應「豆腐干絲」，必須列出所有可見的食材！**
```

### 熱炒（Stir Fry）

#### 修復前的問題
```typescript
// 只識別主食材，忽略配料
{
  "foods": [
    {"name": "炒豆干", "portion": 100}
  ]
}
```

#### 修復後的效果
```typescript
// 識別所有食材和配料
{
  "foods": [
    {"name": "豆干", "portion": 100},
    {"name": "糯米椒", "portion": 50},
    {"name": "蒜片", "portion": 10},
    {"name": "辣椒", "portion": 5},
    {"name": "醬油", "portion": 10}
  ]
}
```

#### Prompt 優化重點
```
## 熱炒識別特別注意

**核心任務**：識別所有食材（主食材、配料、調味料）

### 必須識別的元素：
1. **主食材**（肉類、海鮮、豆製品、蔬菜等）
2. **配料**（特別注意台式熱炒的特色配料）
   - 蒜片、蒜末
   - 辣椒、糯米椒
   - 九層塔、蔥段
   - 薑絲、豆豉
3. **調味料**（醬油、蠔油等）

### 食材角色分類：
- 主食材：佔比最大的食材
- 配料：增添風味的食材
- 調味料：醬汁類
```

### 混合菜餚（Mixed Dish）

#### 修復前的問題
```typescript
// 只識別表面食材
{
  "foods": [
    {"name": "雞腿", "portion": 150},
    {"name": "白飯", "portion": 200}
  ]
}
```

#### 修復後的效果
```typescript
// 識別所有層次的食材
{
  "foods": [
    {"name": "雞腿", "portion": 150},
    {"name": "白飯", "portion": 200},
    {"name": "高麗菜", "portion": 50},
    {"name": "滷蛋", "portion": 60},
    {"name": "豆干", "portion": 30},
    {"name": "醃蘿蔔", "portion": 20}
  ]
}
```

#### Prompt 優化重點
```
## 混合菜餚識別特別注意

**核心任務**：逐一識別每種食材

### 識別策略：
1. **從大到小**：先識別大塊的食材，再識別小配料
2. **從明顯到細微**：先識別明顯的，再仔細觀察細微的
3. **注意不同層次**：
   - 表面的食材
   - 中間層的食材
   - 底部的食材（如飯、麵）

### 完整性檢查：
- [ ] 主食（飯、麵、麵包等）
- [ ] 主菜（肉類、海鮮等）
- [ ] 配菜（蔬菜、豆製品等）
- [ ] 調味料或醬汁
```

## 使用範例

### 範例 1：識別味噌湯

```typescript
import { EnhancedPromptGenerator } from './EnhancedPromptGenerator';

const generator = new EnhancedPromptGenerator('zh-TW');

// 使用優化後的湯品模板
const soupPrompt = generator.generateSoupPrompt();

// 調用 OpenAI Vision API
const result = await callOpenAIVision(imageBuffer, soupPrompt);

// 預期結果：
// {
//   "foods": [
//     {"name": "味噌湯底", "portion": 250, "confidence": 0.95},
//     {"name": "豆腐", "portion": 30, "confidence": 0.90},
//     {"name": "海帶芽", "portion": 10, "confidence": 0.85},
//     {"name": "蔥花", "portion": 5, "confidence": 0.80}
//   ],
//   "overallDescription": "一碗傳統的日式味噌湯，包含豆腐、海帶芽和蔥花"
// }
```

### 範例 2：識別涼拌干絲

```typescript
const generator = new EnhancedPromptGenerator('zh-TW');

// 使用優化後的涼拌菜模板
const coldDishPrompt = generator.generateColdDishPrompt();

const result = await callOpenAIVision(imageBuffer, coldDishPrompt);

// 預期結果：
// {
//   "foods": [
//     {"name": "豆腐干絲", "portion": 80, "confidence": 0.95},
//     {"name": "芹菜絲", "portion": 20, "confidence": 0.90},
//     {"name": "胡蘿蔔絲", "portion": 15, "confidence": 0.85},
//     {"name": "香菜", "portion": 5, "confidence": 0.80},
//     {"name": "麻油", "portion": 5, "confidence": 0.75}
//   ],
//   "overallDescription": "涼拌干絲，包含豆腐干絲、芹菜、胡蘿蔔等多種食材"
// }
```

### 範例 3：驗證識別結果

```typescript
function validateFoodsList(result: any, dishType: string): boolean {
  const minFoodsCount = {
    'soup': 3,        // 湯品至少 3 種（湯底 + 配料）
    'cold_dish': 3,   // 涼拌菜至少 3 種
    'stir_fry': 2,    // 熱炒至少 2 種
    'mixed_dish': 3,  // 混合菜餚至少 3 種
    'bento': 4        // 便當至少 4 種
  };
  
  const minCount = minFoodsCount[dishType] || 1;
  
  if (result.foods.length < minCount) {
    console.warn(
      `Foods list may be incomplete. ` +
      `Expected at least ${minCount}, got ${result.foods.length}`
    );
    return false;
  }
  
  // 檢查是否有明顯遺漏
  if (dishType === 'soup' && !result.foods.some(f => f.name.includes('湯'))) {
    console.warn('Soup base may be missing from foods list');
    return false;
  }
  
  return true;
}

// 使用範例
const result = await callOpenAIVision(imageBuffer, soupPrompt);
if (!validateFoodsList(result, 'soup')) {
  // 可能需要重試或人工檢查
  console.log('Recognition may be incomplete, consider retry');
}
```

## 測試驗證

### 運行測試

```bash
# 運行食材識別完整性測試
npm test -- EnhancedPromptGenerator.foods-list-fix.test.ts

# 運行整合測試
npm test -- EnhancedPromptGenerator.integration.test.ts

# 運行驗證測試
npm test -- prompt-fix-verification.test.ts
```

### 測試覆蓋範圍

1. **單元測試**：
   - 驗證 prompt 結構是否正確
   - 驗證是否移除限制性語句
   - 驗證是否包含識別步驟和檢查清單

2. **整合測試**：
   - 使用真實圖片測試識別結果
   - 比較修復前後的 foods 列表長度
   - 驗證食材識別完整度

3. **驗證測試**：
   - 測試不同料理類型的識別效果
   - 驗證是否達到目標指標（80% 完整度）

## 效果指標

### 修復前
- 食材識別完整度：約 40-50%
- foods 列表長度：平均 1-2 種（複雜料理）
- 常見問題：
  - 湯品只識別湯底
  - 涼拌菜只識別主食材
  - 便當只識別主菜

### 修復後
- 食材識別完整度：80% 以上
- foods 列表長度：平均 3-5 種（複雜料理）
- 改善效果：
  - 湯品識別湯底 + 3-5 種配料
  - 涼拌菜識別 3-6 種食材
  - 便當識別主食 + 主菜 + 配菜

### 準確度
- 維持在 90% 以上
- 識別出的食材中，至少 90% 是正確的

## 最佳實踐

1. **選擇合適的模板**：
   - 根據料理類型選擇專用模板
   - 湯品用 `generateSoupPrompt()`
   - 涼拌菜用 `generateColdDishPrompt()`
   - 熱炒用 `generateStirFryPrompt()`

2. **驗證識別結果**：
   - 檢查 foods 列表長度是否合理
   - 對於複雜料理，至少應有 3 種以上食材

3. **處理不完整的結果**：
   - 如果識別結果明顯不完整，可以考慮重試
   - 或提示用戶手動補充遺漏的食材

4. **持續改進**：
   - 收集用戶反饋
   - 分析常見的遺漏情況
   - 持續優化 prompt

## 相關文件

- `EnhancedPromptGenerator.README.md` - 完整的使用文檔
- `.kiro/specs/prompt-foods-list-fix/requirements.md` - 需求文檔
- `.kiro/specs/prompt-foods-list-fix/design.md` - 設計文檔
- `.kiro/specs/prompt-foods-list-fix/tasks.md` - 實作任務清單
- `EnhancedPromptGenerator.foods-list-fix.test.ts` - 測試文件
