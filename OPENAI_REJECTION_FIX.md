# OpenAI Vision API 拒絕問題修復

## 問題描述

某些食物圖片會被 OpenAI Vision API 拒絕，返回 "I'm sorry, I can't help with that." 錯誤訊息。

### 被拒絕的案例
- IMG_3843.JPG - 被拒絕（咖喱料理）
- IMG_1791.JPG - 之前被拒絕，現在成功（生蠔）

## 解決方案

### 1. 添加重試機制

在 `apps/api/src/simple-server.js` 中添加了自動重試功能：

```javascript
async function callChatGPTVisionAPI(imageBuffer, retryCount = 0) {
  const MAX_RETRIES = 2;
  
  // 如果被拒絕，自動重試最多 2 次
  if (content.includes("I'm sorry") || content.includes("I can't help")) {
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 嘗試重試 (${retryCount + 1}/${MAX_RETRIES})`);
      return callChatGPTVisionAPIWithStrongerPrompt(imageBuffer, retryCount + 1);
    }
  }
}
```

### 2. 使用更強的 Prompt

創建了 `callChatGPTVisionAPIWithStrongerPrompt` 函數，使用更明確的 prompt：

**改進點：**
- 明確說明這是用於「營養追蹤」和「健康監測」目的
- 使用英文 prompt（OpenAI 對英文的理解更準確）
- 強調這是「個人健康監測」和「飲食記錄」
- 使用更專業的語氣（professional nutritionist AI assistant）

**原 Prompt（中文）：**
```
你是一個營養追蹤助手，幫助用戶記錄他們的飲食。
請分析這張食物照片...
```

**新 Prompt（英文，用於重試）：**
```
You are a professional nutritionist AI assistant helping users track their meals 
for health and dietary purposes. Your role is to analyze food photos and provide 
detailed nutritional information to support healthy eating habits.

I need your help analyzing this meal photo for nutritional tracking purposes. 
This is for personal health monitoring and dietary logging.
```

### 3. 工作流程

```
圖片上傳
    ↓
使用原始 Prompt（中文，詳細）
    ↓
被拒絕？
    ├─ 否 → 返回結果 ✅
    └─ 是 → 重試 1（等待 1 秒）
            ↓
        使用更強 Prompt（英文，簡潔）
            ↓
        被拒絕？
            ├─ 否 → 返回結果 ✅
            └─ 是 → 重試 2（等待 1 秒）
                    ↓
                使用更強 Prompt（英文，簡潔）
                    ↓
                被拒絕？
                    ├─ 否 → 返回結果 ✅
                    └─ 是 → 回退到模擬數據 ⚠️
```

## 測試方法

### 方式 1: 使用測試腳本
```bash
./test-rejected-image.sh
```

### 方式 2: 使用 Python 腳本
```bash
python3 test-oyster.py /Users/kevinhktw/Downloads/image/IMG_3843.JPG
```

### 方式 3: 使用 curl
```bash
curl -X POST \
  https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
  -F "photo=@/path/to/image.jpg" \
  -F "maxResults=10" \
  -F "minConfidence=0.3" \
  -F "language=zh-TW"
```

## 預期結果

### 成功案例
```json
{
  "success": true,
  "data": {
    "apiUsed": "ChatGPT Vision API",
    "recognition": {
      "suggestions": [...]
    }
  }
}
```

### 重試成功案例（Render 日誌）
```
❌ OpenAI 拒絕分析此圖片
   拒絕原因: I'm sorry, I can't help with that.
   當前重試次數: 0
🔄 嘗試重試 (1/2)，使用更明確的 prompt...
🔄 使用更強 prompt 重試 (嘗試 1/2)
✅ ChatGPT Vision API 重試成功！
✅ 重試版本 JSON 解析成功
```

### 失敗案例（回退到模擬數據）
```json
{
  "success": true,
  "data": {
    "apiUsed": "Mock Data",
    "recognition": {
      "suggestions": [...]
    }
  }
}
```

## 為什麼某些圖片會被拒絕？

OpenAI 的內容政策可能會誤判某些圖片，常見原因：

1. **圖片中包含人物或手部**
   - 即使只是拿著食物的手也可能觸發
   
2. **圖片角度或光線問題**
   - 某些角度可能讓 AI 無法確定圖片內容
   
3. **圖片質量問題**
   - 模糊、過暗、過亮的圖片
   
4. **食物外觀問題**
   - 某些食物的外觀可能觸發安全檢查
   - 例如：生食、內臟、特殊質地的食物

5. **隨機性**
   - OpenAI 的內容政策有時會有隨機性
   - 同一張圖片可能第一次被拒絕，第二次成功

## 改進效果

### 之前
- 被拒絕的圖片直接回退到模擬數據
- 成功率：約 85%（6/7）

### 現在
- 被拒絕的圖片會自動重試 2 次
- 使用不同的 prompt 策略
- 預期成功率：約 95%+

## 部署

修改已經提交到 `apps/api/src/simple-server.js`。

要部署到 Render：
```bash
git add apps/api/src/simple-server.js
git commit -m "feat: Add retry mechanism for OpenAI Vision API rejections"
git push
```

Render 會自動檢測到更改並重新部署。

## 監控

查看 Render 日誌以監控重試情況：
```
https://dashboard.render.com/web/[your-service-id]/logs
```

關鍵日誌訊息：
- `❌ OpenAI 拒絕分析此圖片` - 初次被拒絕
- `🔄 嘗試重試` - 開始重試
- `✅ ChatGPT Vision API 重試成功！` - 重試成功
- `❌ 重試後仍被拒絕` - 重試失敗，回退到模擬數據

## 未來改進

1. **更多重試策略**
   - 嘗試不同的溫度參數
   - 嘗試不同的模型版本
   
2. **圖片預處理**
   - 自動裁剪掉人物或手部
   - 調整亮度和對比度
   
3. **回退到其他 API**
   - Google Vision API
   - Azure Computer Vision
   
4. **用戶反饋機制**
   - 讓用戶標記被錯誤拒絕的圖片
   - 收集數據以改進 prompt
