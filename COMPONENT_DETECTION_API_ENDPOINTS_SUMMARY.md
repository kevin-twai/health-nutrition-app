# 成分識別 API 端點總結

## 📋 端點概覽

| 端點 | 方法 | 認證 | 描述 |
|------|------|------|------|
| `/api/v1/photo/recognize-with-components` | POST | ✅ | 識別食物並分析成分 |
| `/api/v1/component-adjustment/add` | POST | ✅ | 添加成分 |
| `/api/v1/component-adjustment/remove` | POST | ✅ | 移除成分 |
| `/api/v1/component-adjustment/update-portion` | POST | ✅ | 調整份量 |
| `/api/v1/component-adjustment/recalculate` | POST | ✅ | 重新計算營養 |
| `/api/v1/component-adjustment/session/:id` | GET | ✅ | 獲取會話狀態 |
| `/api/v1/component-adjustment/history/:id` | GET | ✅ | 獲取調整歷史 |

---

## 🔍 詳細端點說明

### 1. 識別食物並分析成分

```
POST /api/v1/photo/recognize-with-components?includeComponents=true
```

**用途：** 上傳食物圖片，識別料理並分析個別成分

**請求：**
- Content-Type: `multipart/form-data`
- Body: `image` (file)
- Query: `includeComponents` (boolean, default: true)

**回應：**
```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_...",
    "componentDetection": {
      "success": true,
      "mainDish": {...},
      "components": [...],
      "nutritionSummary": {...}
    }
  }
}
```

**處理時間：** 3-8 秒

---

### 2. 添加成分

```
POST /api/v1/component-adjustment/add
```

**用途：** 向識別結果添加缺失的成分

**請求：**
```json
{
  "sessionId": "component_session_...",
  "component": {
    "name": "青蔥",
    "estimatedPortion": 10,
    "cookingMethod": "stir_fried",
    "category": "garnish"
  }
}
```

**回應：**
```json
{
  "success": true,
  "data": {
    "addedComponent": {...},
    "updatedNutrition": {...}
  }
}
```

---

### 3. 移除成分

```
POST /api/v1/component-adjustment/remove
```

**用途：** 從識別結果移除錯誤的成分

**請求：**
```json
{
  "sessionId": "component_session_...",
  "componentId": "comp_3"
}
```

**回應：**
```json
{
  "success": true,
  "data": {
    "removedComponent": {...},
    "updatedNutrition": {...}
  }
}
```

---

### 4. 調整份量

```
POST /api/v1/component-adjustment/update-portion
```

**用途：** 調整成分的份量

**請求：**
```json
{
  "sessionId": "component_session_...",
  "componentId": "comp_2",
  "newPortion": 60
}
```

**回應：**
```json
{
  "success": true,
  "data": {
    "updatedComponent": {...},
    "updatedNutrition": {...}
  }
}
```

---

### 5. 重新計算營養

```
POST /api/v1/component-adjustment/recalculate
```

**用途：** 重新計算調整後的營養資訊

**請求：**
```json
{
  "sessionId": "component_session_..."
}
```

**回應：**
```json
{
  "success": true,
  "data": {
    "nutritionSummary": {
      "total": {...},
      "byComponent": [...],
      "byCategory": [...]
    }
  }
}
```

---

### 6. 獲取會話狀態

```
GET /api/v1/component-adjustment/session/:sessionId
```

**用途：** 獲取識別會話的當前狀態

**回應：**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "mainDish": {...},
    "components": [...],
    "nutritionSummary": {...},
    "adjustmentCount": 3,
    "lastModified": "2024-11-17T10:38:00.000Z"
  }
}
```

---

### 7. 獲取調整歷史

```
GET /api/v1/component-adjustment/history/:sessionId
```

**用途：** 獲取會話的所有調整記錄

**回應：**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "adjustments": [
      {
        "id": "adj_1",
        "type": "add_component",
        "timestamp": "...",
        "details": {...}
      }
    ],
    "totalAdjustments": 3
  }
}
```

---

## 🔐 認證

所有端點都需要 JWT Token 認證（目前暫時開放測試）：

```
Authorization: Bearer YOUR_JWT_TOKEN
```

獲取 Token：
```bash
curl -X POST "https://health-nutrition-api.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"P@55w0rd"}'
```

---

## 📊 查詢參數

### includeComponents

**端點：** `/api/v1/photo/recognize-with-components`

**類型：** boolean

**預設值：** true

**說明：** 是否包含成分識別

**範例：**
```
?includeComponents=true  # 啟用成分識別
?includeComponents=false # 停用成分識別（僅基礎識別）
```

---

## 🎯 使用流程

### 標準流程

```
1. 登入系統
   ↓
2. 上傳圖片並識別成分
   ↓
3. 檢查識別結果
   ↓
4. (可選) 添加缺失的成分
   ↓
5. (可選) 調整不準確的份量
   ↓
6. (可選) 移除錯誤的成分
   ↓
7. 重新計算營養資訊
   ↓
8. 查看最終結果
```

### 快速流程（無調整）

```
1. 登入系統
   ↓
2. 上傳圖片並識別成分
   ↓
3. 直接使用識別結果
```

---

## ⚡ 性能指標

| 操作 | 平均時間 | 最大時間 |
|------|---------|---------|
| 成分識別 | 3-5 秒 | 8 秒 |
| 添加成分 | < 500ms | 1 秒 |
| 調整份量 | < 300ms | 500ms |
| 移除成分 | < 300ms | 500ms |
| 重算營養 | < 500ms | 1 秒 |
| 查看狀態 | < 200ms | 500ms |

---

## 🚨 錯誤代碼

| 代碼 | HTTP | 描述 |
|------|------|------|
| `NO_FILE_UPLOADED` | 400 | 未上傳圖片 |
| `INVALID_SESSION_ID` | 400 | 無效的會話 ID |
| `COMPONENT_NOT_FOUND` | 404 | 找不到成分 |
| `SESSION_EXPIRED` | 410 | 會話已過期 |
| `COMPONENT_DETECTION_ERROR` | 500 | 成分識別失敗 |

---

## 📝 請求範例

### cURL

```bash
# 識別食物
curl -X POST "https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components?includeComponents=true" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./fried-rice.jpg"

# 添加成分
curl -X POST "https://health-nutrition-api.onrender.com/api/v1/component-adjustment/add" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"...","component":{"name":"青蔥","estimatedPortion":10}}'
```

### JavaScript

```javascript
// 識別食物
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(
  'https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components?includeComponents=true',
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  }
);

// 添加成分
const addResponse = await fetch(
  'https://health-nutrition-api.onrender.com/api/v1/component-adjustment/add',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: sessionId,
      component: {
        name: '青蔥',
        estimatedPortion: 10
      }
    })
  }
);
```

### Python

```python
import requests

# 識別食物
url = "https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components"
headers = {"Authorization": f"Bearer {token}"}
files = {"image": open("fried-rice.jpg", "rb")}
params = {"includeComponents": "true"}

response = requests.post(url, headers=headers, files=files, params=params)

# 添加成分
add_url = "https://health-nutrition-api.onrender.com/api/v1/component-adjustment/add"
data = {
    "sessionId": session_id,
    "component": {
        "name": "青蔥",
        "estimatedPortion": 10
    }
}

add_response = requests.post(add_url, headers=headers, json=data)
```

---

## 🔗 相關文檔

- **完整 API 文檔：** `COMPONENT_DETECTION_API_DOCUMENTATION.md`
- **快速測試指南：** `COMPONENT_DETECTION_QUICK_TEST_GUIDE.md`
- **Postman Collection：** `POSTMAN_COLLECTION_UPDATED.json`

---

**最後更新：** 2024-11-17  
**API 版本：** v1.0.0
