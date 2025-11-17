# 湯品配料識別改進

## 當前狀況

✅ **已修復：** 味噌湯能正確識別並顯示營養資訊
- 熱量：53 kcal
- 蛋白質：3.8g
- 碳水：6g
- 脂肪：1.5g

❌ **待改進：** 湯品配料（豆腐、青蔥）未單獨列出

## 問題分析

### OpenAI Vision API 的識別結果

當前 API 返回：
```json
{
  "foods": [
    {
      "name": "味噌湯",
      "confidence": 0.95,
      "portion": 150
    }
  ]
}
```

### 期望的識別結果

理想情況應該返回：
```json
{
  "foods": [
    {
      "name": "味噌湯",
      "confidence": 0.95,
      "portion": 150,
      "ingredients": ["豆腐", "青蔥", "海帶芽"]
    }
  ]
}
```

或者分別列出：
```json
{
  "foods": [
    {
      "name": "味噌湯",
      "confidence": 0.95,
      "portion": 150
    },
    {
      "name": "豆腐",
      "confidence": 0.90,
      "portion": 30
    },
    {
      "name": "青蔥",
      "confidence": 0.85,
      "portion": 5
    }
  ]
}
```

## 解決方案選項

### 選項 A：改進 Prompt（推薦）

修改 `EnhancedPromptGenerator` 的 prompt，明確要求識別湯品配料。

**優點：**
- 不需要額外的 API 調用
- OpenAI 已經能看到配料
- 只需要更好的指示

**實施：**
```typescript
// 在 prompt 中添加
"對於湯品，請同時識別可見的配料（如豆腐、蔥花、海帶等）"
```

### 選項 B：後處理分析

在識別到湯品後，使用知識庫中的常見配料進行二次分析。

**優點：**
- 不依賴 OpenAI 的配料識別
- 可以提供標準化的配料列表

**缺點：**
- 可能不準確（實際圖片中可能沒有某些配料）

### 選項 C：混合方案（最佳）

1. 改進 prompt 要求識別配料
2. 使用知識庫驗證和補充
3. 提供配料的營養資訊

## 推薦實施方案

### 1. 改進 Prompt

**文件：** `apps/api/src/services/EnhancedPromptGenerator.ts`

在湯品識別的 prompt 中添加：

```typescript
對於湯品類食物，請：
1. 識別湯品的主要名稱（如：味噌湯）
2. 列出可見的配料（如：豆腐、蔥花、海帶芽）
3. 估計每種配料的份量

返回格式：
{
  "foods": [
    {
      "name": "味噌湯（湯底）",
      "portion": 120,
      "confidence": 0.95
    },
    {
      "name": "豆腐",
      "portion": 30,
      "confidence": 0.90
    },
    {
      "name": "青蔥",
      "portion": 5,
      "confidence": 0.85
    }
  ]
}
```

### 2. 更新知識庫

在味噌湯的數據中添加常見配料：

```typescript
'味噌湯': {
  // ... 現有數據
  commonIngredients: ['豆腐', '海帶芽', '青蔥', '味噌'],
  ingredientPortions: {
    '豆腐': 30,
    '海帶芽': 5,
    '青蔥': 5,
    '味噌湯底': 110
  }
}
```

### 3. 添加配料識別邏輯

**文件：** `apps/api/src/services/MultiStageRecognitionEngine.ts`

```typescript
private async detectSoupIngredients(
  soupName: string,
  imageBuffer: Buffer
): Promise<DetectedFood[]> {
  // 從知識庫獲取常見配料
  const soupInfo = this.knowledgeBase.getFoodItemByName(soupName);
  if (!soupInfo || !soupInfo.commonIngredients) {
    return [];
  }

  // 使用專門的 prompt 識別配料
  const ingredientPrompt = `
    這是一碗${soupName}。
    請識別圖片中可見的以下配料：${soupInfo.commonIngredients.join('、')}
    
    對於每個可見的配料，返回：
    - name: 配料名稱
    - visible: true/false
    - portion: 估計份量（克）
  `;

  // 調用 Vision API
  const result = await this.callVisionAPI(imageBuffer, ingredientPrompt);
  
  // 轉換為 DetectedFood 格式
  return this.parseIngredients(result, soupInfo);
}
```

## 快速修復（最小改動）

如果只想快速改進，可以在前端顯示時添加配料說明：

**文件：** `apps/web/src/app/photo/page.tsx`

```typescript
// 檢測是否為湯品
if (food.name.includes('湯')) {
  // 顯示常見配料提示
  const commonIngredients = {
    '味噌湯': ['豆腐', '海帶芽', '青蔥'],
    '蛋花湯': ['雞蛋', '蔥花'],
    '貢丸湯': ['貢丸', '芹菜', '蔥花']
  };
  
  const ingredients = commonIngredients[food.name] || [];
  
  return (
    <div>
      <h3>{food.name}</h3>
      <p>常見配料：{ingredients.join('、')}</p>
      <p>營養資訊（整碗）：...</p>
    </div>
  );
}
```

## 用戶期望管理

### 當前系統能力

✅ 識別湯品整體
✅ 提供整碗湯的營養資訊
✅ 高準確度（95%+）

### 限制

⚠️ 配料識別需要額外的 prompt 改進
⚠️ 配料份量估計可能不準確
⚠️ 小配料（如蔥花）可能難以精確識別

### 建議的用戶體驗

**選項 1：顯示整體 + 配料提示**
```
味噌湯 (95% 信心度)
份量：150g
熱量：53 kcal

常見配料：
• 豆腐 (~30g)
• 海帶芽 (~5g)
• 青蔥 (~5g)
• 味噌湯底 (~110g)

💡 提示：實際配料可能有所不同
```

**選項 2：分別列出（需要 prompt 改進）**
```
識別的食物：

1. 味噌湯（湯底） - 110g
   熱量：35 kcal

2. 豆腐 - 30g
   熱量：15 kcal

3. 青蔥 - 5g
   熱量：2 kcal

總計：150g, 52 kcal
```

## 下一步行動

### 立即可做（無需部署）

1. 在前端添加配料提示
2. 更新用戶說明文檔
3. 設定合理的用戶期望

### 短期改進（需要部署）

1. 改進 prompt 以識別配料
2. 更新知識庫添加配料資訊
3. 測試配料識別準確度

### 長期改進

1. 訓練專門的配料識別模型
2. 建立配料資料庫
3. 支持用戶手動調整配料

## 結論

**當前狀態：** ✅ 味噌湯識別和營養資訊已修復

**配料識別：** 這是一個獨立的功能改進，需要：
1. Prompt 優化
2. 知識庫擴展
3. 額外的處理邏輯

**建議：** 
- 短期：在前端顯示常見配料提示
- 長期：實施完整的配料識別系統

您想要我實施哪個方案？
1. 快速修復（前端顯示配料提示）
2. 完整實施（prompt 改進 + 配料識別）
3. 先保持現狀，專注於其他功能
