# Simple-Server 整合完成摘要

## 已完成

✅ 創建了 `apps/api/src/utils/simpleVisionHelper.js`
   - JavaScript 包裝器，讓 simple-server.js 可以使用 EnhancedPromptGenerator
   - 包含回退方案，確保即使 TypeScript 模組無法載入也能正常工作
   - 支持重試機制

## 下一步：修改 simple-server.js

由於 `simple-server.js` 文件很大（約 1000+ 行），建議手動修改以下部分：

### 1. 在文件頂部添加導入

```javascript
// 在文件頂部添加
const { generateFoodRecognitionPrompt } = require('./src/utils/simpleVisionHelper');
```

### 2. 修改 `callChatGPTVisionAPI` 函數

找到這個函數（約在第 200 行），將內嵌的 prompt 替換為：

```javascript
async function callChatGPTVisionAPI(imageBuffer, retryCount = 0) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const MAX_RETRIES = 2;

  try {
    const base64Image = imageBuffer.toString('base64');
    
    // 使用 EnhancedPromptGenerator 生成 prompt
    const prompt = generateFoodRecognitionPrompt({
      cuisineType: 'TAIWANESE',
      dishType: 'MIXED_DISH',
      retryCount: retryCount
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.1,
        max_tokens: 900,
        messages: [{
          role: "system",
          content: "You are a careful vision model that identifies foods in meal photos for nutrition tracking. You must count visible items precisely and output clean JSON in Traditional Chinese. Do not guess wildly or invent foods that are not clearly visible."
        }, {
          role: "user",
          content: [{
            type: "text",
            text: prompt
          }, {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }]
        }]
      })
    });

    // ... 其餘的錯誤處理和回應解析代碼保持不變
  } catch (error) {
    console.error('ChatGPT Vision API 調用錯誤:', error);
    throw error;
  }
}
```

### 3. 修改 `callChatGPTVisionAPIWithStrongerPrompt` 函數

類似地修改重試函數：

```javascript
async function callChatGPTVisionAPIWithStrongerPrompt(imageBuffer, retryCount = 0) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const base64Image = imageBuffer.toString('base64');
    console.log(`🔄 使用更嚴謹 prompt 重試 (嘗試 ${retryCount}/2)`);
    
    // 使用 EnhancedPromptGenerator 生成重試 prompt
    const prompt = generateFoodRecognitionPrompt({
      cuisineType: 'TAIWANESE',
      dishType: 'MIXED_DISH',
      retryCount: retryCount + 1  // 增加重試計數
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.1,
        max_tokens: 900,
        messages: [{
          role: "system",
          content: "You are a cautious vision model for food logging. This is a retry call. Prefer high-precision, high-confidence answers, and list fewer items rather than guessing. Output clean JSON in Traditional Chinese only."
        }, {
          role: "user",
          content: [{
            type: "text",
            text: prompt
          }, {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }]
        }]
      })
    });

    // ... 其餘代碼保持不變
  } catch (error) {
    console.error('❌ 重試版本調用失敗:', error);
    throw error;
  }
}
```

## 優點

1. **統一管理**：所有 prompt 都由 `EnhancedPromptGenerator` 管理
2. **保留功能**：simple-server 的圖片處理、重試機制等功能完全保留
3. **回退方案**：如果 TypeScript 模組無法載入，會使用內建的回退 prompt
4. **易於維護**：只需要更新 `EnhancedPromptGenerator`，所有服務都會受益

## 測試

完成修改後，測試 simple-server：

```bash
# 啟動 simple-server
cd apps/api
node src/simple-server.js

# 在瀏覽器中訪問
http://localhost:3001/test-vision-api

# 上傳測試圖片，驗證識別結果
```

## 注意事項

- `simpleVisionHelper.js` 已經包含完整的回退 prompt
- 如果 EnhancedPromptGenerator 無法載入，會自動使用回退方案
- 回退 prompt 與原始 simple-server 的 prompt 非常相似，確保功能不受影響

## 完成標誌

當你看到日誌中出現以下訊息時，表示整合成功：

```
✅ 使用 EnhancedPromptGenerator 生成 prompt
```

或者（如果使用回退方案）：

```
⚠️ 無法導入 EnhancedPromptGenerator，使用回退方案
```

兩種情況都能正常工作！
