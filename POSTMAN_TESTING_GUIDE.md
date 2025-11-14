# Postman API 測試指南

## 🚀 快速開始

### 1. 匯入 Postman Collection

1. 開啟 Postman
2. 點擊左上角 "Import"
3. 選擇 `POSTMAN_COLLECTION.json` 檔案
4. Collection 會自動匯入

### 2. 設定環境變數

Collection 已包含變數：
- `base_url`: `https://health-nutrition-api.onrender.com`
- `jwt_token`: (登入後自動設定)

## 📝 測試步驟

### Step 1: 健康檢查 ✅

**請求：** `GET /health`

**預期回應：**
```json
{
  "status": "healthy",
  "database": "connected",
  "checks": {
    "database": true,
    "redis": true,
    "external_apis": true
  }
}
```

---

### Step 2: 註冊用戶 👤

**請求：** `POST /api/auth/register`

**Body：**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "測試用戶"
}
```

**預期回應：**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "測試用戶"
  }
}
```

**注意：** 如果用戶已存在，會返回錯誤。可以換個 email 或繼續下一步登入。

---

### Step 3: 登入用戶 🔐

**請求：** `POST /api/auth/login`

**Body：**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**預期回應：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "測試用戶"
  }
}
```

**重要：** Token 會自動儲存到 `jwt_token` 變數中，後續請求會自動使用。

---

### Step 4: 獲取用戶資料 📋

**請求：** `GET /api/users/profile`

**Headers：** `Authorization: Bearer {{jwt_token}}`

**預期回應：**
```json
{
  "id": "...",
  "email": "test@example.com",
  "name": "測試用戶",
  "createdAt": "..."
}
```

---

### Step 5: 上傳食物圖片 📸

**請求：** `POST /api/photo/recognize`

**Headers：** `Authorization: Bearer {{jwt_token}}`

**Body：** `form-data`
- Key: `image`
- Type: `File`
- Value: 選擇一張食物圖片

**測試圖片建議：**
- 清晰的食物照片
- 單一或多個食物
- 常見食物（如：飯、麵、肉、菜等）

**預期回應：**
```json
{
  "success": true,
  "recognitionId": "...",
  "foods": [
    {
      "name": "白飯",
      "chineseName": "白飯",
      "confidence": 0.95,
      "portion": {
        "amount": 1,
        "unit": "碗",
        "grams": 200
      },
      "nutrition": {
        "calories": 280,
        "protein": 5.2,
        "carbs": 62,
        "fat": 0.6,
        "fiber": 0.4
      }
    }
  ],
  "totalNutrition": {
    "calories": 280,
    "protein": 5.2,
    "carbs": 62,
    "fat": 0.6
  },
  "timestamp": "2024-11-14T12:00:00.000Z"
}
```

---

### Step 6: 查看識別歷史 📜

**請求：** `GET /api/photo/history`

**Headers：** `Authorization: Bearer {{jwt_token}}`

**預期回應：**
```json
{
  "history": [
    {
      "id": "...",
      "foods": [...],
      "timestamp": "...",
      "totalCalories": 280
    }
  ],
  "total": 1
}
```

---

### Step 7: AI 聊天測試 💬

**請求：** `POST /api/chat/message`

**Headers：** `Authorization: Bearer {{jwt_token}}`

**Body：**
```json
{
  "message": "我今天吃了什麼？營養均衡嗎？"
}
```

**預期回應：**
```json
{
  "response": "根據您今天的飲食記錄...",
  "conversationId": "...",
  "timestamp": "..."
}
```

**測試問題建議：**
- "我今天吃了什麼？"
- "我的蛋白質攝取夠嗎？"
- "給我一些健康飲食建議"
- "我應該多吃什麼食物？"

---

### Step 8: 營養報告 📊

**請求：** `GET /api/reports/nutrition?period=week`

**Headers：** `Authorization: Bearer {{jwt_token}}`

**Query Parameters：**
- `period`: `day` | `week` | `month`

**預期回應：**
```json
{
  "period": "week",
  "summary": {
    "totalCalories": 1400,
    "avgCaloriesPerDay": 200,
    "totalProtein": 26,
    "totalCarbs": 310,
    "totalFat": 3
  },
  "dailyBreakdown": [...],
  "recommendations": [...]
}
```

---

### Step 9: 遊戲化資料 🎮

**請求：** `GET /api/gamification/profile`

**Headers：** `Authorization: Bearer {{jwt_token}}`

**預期回應：**
```json
{
  "points": 100,
  "level": 1,
  "achievements": [
    {
      "id": "first_photo",
      "name": "第一張照片",
      "description": "上傳第一張食物照片",
      "unlocked": true
    }
  ],
  "streak": 1
}
```

---

## 🧪 測試場景

### 場景 1：新用戶完整流程

1. Health Check
2. Register User
3. Login User
4. Get User Profile
5. Upload Food Image
6. Get Food History
7. Send Chat Message
8. Get Nutrition Report
9. Get Gamification Profile

### 場景 2：食物識別測試

準備不同類型的食物圖片：
- 中式料理（飯、麵、炒菜）
- 西式料理（漢堡、披薩、沙拉）
- 日式料理（壽司、拉麵）
- 水果和零食

每張圖片測試：
1. 上傳圖片
2. 檢查識別結果
3. 查看營養資訊
4. 確認歷史記錄

### 場景 3：AI 聊天測試

測試不同類型的問題：
- 查詢類："我今天吃了什麼？"
- 分析類："我的營養均衡嗎？"
- 建議類："給我一些健康飲食建議"
- 比較類："我這週比上週吃得更健康嗎？"

---

## 🔧 故障排除

### 問題 1：401 Unauthorized

**原因：** Token 過期或無效

**解決：**
1. 重新執行 "Login User"
2. 確認 Token 已儲存到變數
3. 檢查 Authorization header

### 問題 2：食物識別失敗

**可能原因：**
- 圖片格式不支援
- 圖片太大
- OpenAI API 配額用完

**解決：**
1. 使用 JPG/PNG 格式
2. 圖片大小 < 5MB
3. 檢查 Render 日誌

### 問題 3：500 Internal Server Error

**解決：**
1. 查看 Render Dashboard 日誌
2. 檢查資料庫連接
3. 確認環境變數設定

---

## 📊 測試結果記錄

建議記錄每個測試的結果：

| 測試項目 | 狀態 | 回應時間 | 備註 |
|---------|------|---------|------|
| Health Check | ✅ | 200ms | 正常 |
| Register | ✅ | 500ms | 成功 |
| Login | ✅ | 300ms | Token 已獲取 |
| Upload Food | ✅ | 3000ms | 識別成功 |
| AI Chat | ✅ | 2000ms | 回應正確 |

---

## 🎯 下一步

測試完成後：
1. 記錄所有成功的端點
2. 記錄任何錯誤或問題
3. 準備前端整合
4. 或繼續測試其他功能

---

**API Base URL:** `https://health-nutrition-api.onrender.com`

**需要幫助？** 查看 Render Dashboard 的日誌或聯繫開發團隊。
