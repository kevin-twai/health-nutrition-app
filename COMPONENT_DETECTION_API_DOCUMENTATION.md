# 亞洲料理成分識別 API 文檔

## 📋 目錄

1. [概述](#概述)
2. [成分識別端點](#成分識別端點)
3. [成分調整端點](#成分調整端點)
4. [請求/回應範例](#請求回應範例)
5. [錯誤處理](#錯誤處理)
6. [最佳實踐](#最佳實踐)

---

## 概述

亞洲料理成分識別系統擴展了現有的食物識別功能，能夠識別料理中的個別成分（如炒飯中的蛋、青菜、火腿；湯品中的豆腐、青蔥等），並為每個成分提供獨立的營養資訊。

### 主要功能

- ✅ 識別料理中的個別成分
- ✅ 估計每個成分的份量
- ✅ 計算成分的營養資訊
- ✅ 支持用戶手動調整成分
- ✅ 提供烹飪方式資訊
- ✅ 支持多種亞洲料理類型
- ✅ **確保識別結果一致性**（v1.1.0 新增）
- ✅ **優化處理速度**（v1.1.0 新增）

### 識別流程改進 (v1.1.0)

系統現在採用**兩階段識別流程**，確保基礎識別和成分識別的結果完全一致：

1. **階段一：基礎識別**
   - 使用 MultiStageRecognitionEngine 識別料理中的所有食物
   - 獲得食物列表、信心度、份量等資訊

2. **階段二：成分識別**
   - **直接使用**階段一的識別結果作為成分基礎
   - **不再重複調用** Vision API 進行二次識別
   - 保留所有原始食物屬性（名稱、份量、信心度、營養資訊）
   - 處理速度提升 60-80%

**一致性保證：**
- ✅ 成分列表與基礎識別結果完全一致
- ✅ 避免識別結果不匹配的問題
- ✅ 自動進行一致性驗證並記錄日誌
- ✅ 節省 API 調用成本和處理時間

### 支持的料理類型

- 湯品類：味噌湯、蛋花湯、貢丸湯、酸辣湯、火鍋
- 炒菜類：炒飯、炒麵、炒青菜、宮保雞丁
- 便當類：台式便當、日式便當、韓式便當
- 麵食類：拉麵、烏龍麵、米粉、河粉
- 點心類：小籠包、餃子、燒賣、春捲
- 燒烤類：烤肉、燒雞、烤魚

---

## 識別流程說明 (v1.1.0)

### 傳統流程 vs 新流程

#### 傳統流程（v1.0.0）
```
用戶上傳照片
    ↓
基礎識別 (MultiStageRecognitionEngine)
    → 識別出：[白飯, 炸豬排, 滷蛋, 豆腐, 酸菜]
    ↓
成分識別 (ComponentDetectionEngine)
    → 重新調用 Vision API
    → 可能返回：[白飯, 炒高麗菜, 辣椒炒肉末]  ❌ 不一致！
```

**問題：**
- ❌ 重複調用 Vision API，浪費時間和成本
- ❌ 基礎識別和成分識別結果可能不一致
- ❌ 用戶看到的描述與成分列表不匹配

#### 新流程（v1.1.0）
```
用戶上傳照片
    ↓
基礎識別 (MultiStageRecognitionEngine)
    → 識別出：[白飯, 炸豬排, 滷蛋, 豆腐, 酸菜]
    ↓
成分識別 (ComponentDetectionEngine)
    → 直接使用基礎識別結果
    → 不調用 Vision API
    → 返回：[白飯, 炸豬排, 滷蛋, 豆腐, 酸菜]  ✅ 完全一致！
```

**優點：**
- ✅ 只調用一次 Vision API，節省時間和成本
- ✅ 確保識別結果完全一致
- ✅ 處理速度提升 60-80%
- ✅ 保留所有原始食物屬性

### 一致性驗證

系統會自動進行一致性檢查並記錄以下資訊：

```json
{
  "consistencyCheck": {
    "passed": true,
    "baseRecognitionFoodCount": 5,
    "componentDetectionCount": 5,
    "missingFoodsCount": 0,
    "extraComponentsCount": 0,
    "matchRate": "100%"
  }
}
```

**日誌範例：**
```
[session_123] ✓ 一致性檢查:
[session_123]   - 狀態: 通過 ✓
[session_123]   - 基礎識別食物: 5
[session_123]   - 成分識別數量: 5
[session_123]   - 缺失食物: 0
[session_123]   - 額外成分: 0
[session_123]   - 匹配率: 100%
```

### 性能監控

每次識別都會記錄詳細的性能指標：

```
[session_123] ========== 性能監控報告 ==========
[session_123] 📊 使用預識別食物: 是
[session_123] 📋 預識別食物數量: 5
[session_123] ⚡ 時間節省: 2200ms (73.3%)
[session_123] ⏱️  處理時間對比:
[session_123]   - 基礎識別: 3500ms
[session_123]   - 成分識別: 800ms
[session_123]   - 圖片上傳: 500ms
[session_123]   - 總計: 4800ms
[session_123] 🔍 檢測方法: pre_recognized
[session_123] 📦 成分來源統計:
[session_123]   - 預識別: 5
[session_123]   - Vision API: 0
[session_123]   - 知識庫: 0
[session_123]   - 總計: 5
[session_123] =====================================
```

---

## 成分識別端點

### 1. 帶成分識別的食物辨識

識別食物並分析其成分。

**端點：** `POST /api/v1/photo/recognize-with-components`

**認證：** 需要 JWT Token

**Content-Type：** `multipart/form-data`


#### 請求參數

**Form Data:**
- `image` (required): 食物圖片檔案
  - 支持格式：JPG, PNG, HEIC, HEIF, WebP
  - 最大大小：10MB
  - 建議解析度：1024x1024 或更高

**Query Parameters:**
- `includeComponents` (optional): 是否包含成分識別
  - 類型：boolean
  - 預設值：true
  - 範例：`?includeComponents=true`

**Body Parameters (可選):**
- `quality` (optional): 圖片品質 (1-100)
- `maxWidth` (optional): 最大寬度 (像素)
- `maxHeight` (optional): 最大高度 (像素)
- `format` (optional): 輸出格式 (jpeg, png, webp)

#### 回應格式

```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_1234567890_abc123",
    "imageInfo": {
      "imageId": "img_abc123",
      "originalUrl": "https://...",
      "processedUrl": "https://...",
      "metadata": {
        "originalSize": 2048000,
        "processedSize": 512000,
        "width": 1024,
        "height": 768,
        "format": "jpeg"
      }
    },
    "recognition": {
      "foods": [...],
      "confidence": 0.92,
      "description": "這是一碗蛋炒飯",
      "processingTime": 3500
    },
    "componentDetection": {
      "enabled": true,
      "success": true,
      "mainDish": {
        "name": "蛋炒飯",
        "type": "fried_rice",
        "confidence": 0.92,
        "estimatedTotalPortion": 300
      },
      "components": [
        {
          "id": "comp_1",
          "name": "白飯",
          "nameEn": "White Rice",
          "confidence": 0.95,
          "estimatedPortion": 200,
          "cookingMethod": "stir_fried",
          "category": "grain",
          "visualFeatures": {
            "color": ["白色", "微黃"],
            "shape": "顆粒狀",
            "texture": "鬆散",
            "position": "主體"
          },
          "nutritionPer100g": {
            "calories": 130,
            "protein": 2.7,
            "carbs": 28.2,
            "fat": 0.3
          },
          "actualNutrition": {
            "calories": 260,
            "protein": 5.4,
            "carbs": 56.4,
            "fat": 0.6
          }
        }
      ],
      "nutritionSummary": {
        "total": {
          "calories": 450,
          "protein": 15.2,
          "carbs": 62.4,
          "fat": 12.8
        },
        "byComponent": [...],
        "byCategory": [...],
        "cookingImpact": [...]
      },
      "metadata": {
        "processingTime": 2800,
        "confidenceScore": 0.88,
        "detectionMethod": "pre_recognized",
        "componentsDetected": 5,
        "componentsFromKB": 0,
        "componentsFromVision": 0,
        "componentsFromPreRecognition": 5
      },
      "suggestions": {
        "possibleMissingComponents": ["蔥花", "醬油"],
        "portionAdjustments": [],
        "alternativeInterpretations": []
      }
    },
    "processingTime": 4200
  },
  "timestamp": "2024-11-17T10:30:00.000Z"
}
```


---

## 成分調整端點

### 2. 添加成分

向識別結果中添加新成分。

**端點：** `POST /api/v1/component-adjustment/add`

**認證：** 需要 JWT Token (目前暫時開放測試)

**Content-Type：** `application/json`

#### 請求參數

```json
{
  "sessionId": "component_session_1234567890_abc123",
  "component": {
    "name": "青蔥",
    "estimatedPortion": 10,
    "cookingMethod": "stir_fried",
    "category": "garnish"
  }
}
```

#### 回應格式

```json
{
  "success": true,
  "data": {
    "message": "成分已成功添加",
    "sessionId": "component_session_1234567890_abc123",
    "addedComponent": {
      "id": "comp_6",
      "name": "青蔥",
      "estimatedPortion": 10,
      "cookingMethod": "stir_fried",
      "category": "garnish",
      "actualNutrition": {
        "calories": 3,
        "protein": 0.2,
        "carbs": 0.7,
        "fat": 0.1
      }
    },
    "updatedNutrition": {
      "total": {
        "calories": 453,
        "protein": 15.4,
        "carbs": 63.1,
        "fat": 12.9
      }
    }
  },
  "timestamp": "2024-11-17T10:35:00.000Z"
}
```

---

### 3. 移除成分

從識別結果中移除成分。

**端點：** `POST /api/v1/component-adjustment/remove`

**認證：** 需要 JWT Token (目前暫時開放測試)

**Content-Type：** `application/json`

#### 請求參數

```json
{
  "sessionId": "component_session_1234567890_abc123",
  "componentId": "comp_3"
}
```

#### 回應格式

```json
{
  "success": true,
  "data": {
    "message": "成分已成功移除",
    "sessionId": "component_session_1234567890_abc123",
    "removedComponent": {
      "id": "comp_3",
      "name": "火腿"
    },
    "updatedNutrition": {
      "total": {
        "calories": 400,
        "protein": 12.5,
        "carbs": 60.0,
        "fat": 10.2
      }
    }
  },
  "timestamp": "2024-11-17T10:36:00.000Z"
}
```

---

### 4. 調整份量

調整成分的份量。

**端點：** `POST /api/v1/component-adjustment/update-portion`

**認證：** 需要 JWT Token (目前暫時開放測試)

**Content-Type：** `application/json`

#### 請求參數

```json
{
  "sessionId": "component_session_1234567890_abc123",
  "componentId": "comp_2",
  "newPortion": 60
}
```

#### 回應格式

```json
{
  "success": true,
  "data": {
    "message": "份量已成功更新",
    "sessionId": "component_session_1234567890_abc123",
    "updatedComponent": {
      "id": "comp_2",
      "name": "雞蛋",
      "oldPortion": 50,
      "newPortion": 60,
      "actualNutrition": {
        "calories": 90,
        "protein": 7.6,
        "carbs": 0.7,
        "fat": 6.0
      }
    },
    "updatedNutrition": {
      "total": {
        "calories": 465,
        "protein": 16.0,
        "carbs": 62.7,
        "fat": 13.5
      }
    }
  },
  "timestamp": "2024-11-17T10:37:00.000Z"
}
```


---

### 5. 重新計算營養

重新計算調整後的營養資訊。

**端點：** `POST /api/v1/component-adjustment/recalculate`

**認證：** 需要 JWT Token (目前暫時開放測試)

**Content-Type：** `application/json`

#### 請求參數

```json
{
  "sessionId": "component_session_1234567890_abc123"
}
```

#### 回應格式

```json
{
  "success": true,
  "data": {
    "message": "營養資訊已重新計算",
    "sessionId": "component_session_1234567890_abc123",
    "nutritionSummary": {
      "total": {
        "calories": 465,
        "protein": 16.0,
        "carbs": 62.7,
        "fat": 13.5,
        "fiber": 2.1
      },
      "byComponent": [
        {
          "componentId": "comp_1",
          "name": "白飯",
          "nutrition": {...},
          "percentageOfTotal": {
            "calories": 55.9,
            "protein": 33.8,
            "carbs": 90.0,
            "fat": 4.4
          }
        }
      ],
      "byCategory": [
        {
          "category": "grain",
          "totalNutrition": {...},
          "components": ["白飯"],
          "percentageOfDish": 66.7
        }
      ]
    }
  },
  "timestamp": "2024-11-17T10:38:00.000Z"
}
```

---

### 6. 獲取會話狀態

獲取識別會話的當前狀態。

**端點：** `GET /api/v1/component-adjustment/session/:sessionId`

**認證：** 需要 JWT Token (目前暫時開放測試)

#### 請求參數

- `sessionId` (路徑參數): 識別會話 ID

#### 回應格式

```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_1234567890_abc123",
    "mainDish": {
      "name": "蛋炒飯",
      "type": "fried_rice",
      "confidence": 0.92
    },
    "components": [
      {
        "id": "comp_1",
        "name": "白飯",
        "estimatedPortion": 200,
        "actualNutrition": {...}
      }
    ],
    "nutritionSummary": {...},
    "adjustmentCount": 3,
    "lastModified": "2024-11-17T10:38:00.000Z",
    "createdAt": "2024-11-17T10:30:00.000Z"
  },
  "timestamp": "2024-11-17T10:40:00.000Z"
}
```

---

### 7. 獲取調整歷史

獲取會話的所有調整記錄。

**端點：** `GET /api/v1/component-adjustment/history/:sessionId`

**認證：** 需要 JWT Token (目前暫時開放測試)

#### 請求參數

- `sessionId` (路徑參數): 識別會話 ID

#### 回應格式

```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_1234567890_abc123",
    "adjustments": [
      {
        "id": "adj_1",
        "type": "add_component",
        "timestamp": "2024-11-17T10:35:00.000Z",
        "details": {
          "componentName": "青蔥",
          "portion": 10
        }
      },
      {
        "id": "adj_2",
        "type": "remove_component",
        "timestamp": "2024-11-17T10:36:00.000Z",
        "details": {
          "componentName": "火腿"
        }
      },
      {
        "id": "adj_3",
        "type": "update_portion",
        "timestamp": "2024-11-17T10:37:00.000Z",
        "details": {
          "componentName": "雞蛋",
          "oldPortion": 50,
          "newPortion": 60
        }
      }
    ],
    "totalAdjustments": 3
  },
  "timestamp": "2024-11-17T10:41:00.000Z"
}
```


---

## 請求/回應範例

### 範例 1：識別蛋炒飯並獲取成分

#### cURL 請求

```bash
curl -X POST "https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components?includeComponents=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/fried-rice.jpg"
```

#### JavaScript (Fetch API)

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(
  'https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components?includeComponents=true',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    },
    body: formData
  }
);

const result = await response.json();
console.log('識別結果:', result.data);
console.log('成分列表:', result.data.componentDetection.components);
```

#### Python (Requests)

```python
import requests

url = "https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components"
headers = {
    "Authorization": f"Bearer {jwt_token}"
}
files = {
    "image": open("/path/to/fried-rice.jpg", "rb")
}
params = {
    "includeComponents": "true"
}

response = requests.post(url, headers=headers, files=files, params=params)
result = response.json()

print("識別結果:", result["data"]["recognition"])
print("成分列表:", result["data"]["componentDetection"]["components"])
```

---

### 範例 2：添加缺失的成分

#### cURL 請求

```bash
curl -X POST "https://health-nutrition-api.onrender.com/api/v1/component-adjustment/add" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1234567890_abc123",
    "component": {
      "name": "青蔥",
      "estimatedPortion": 10,
      "cookingMethod": "stir_fried",
      "category": "garnish"
    }
  }'
```

#### JavaScript (Fetch API)

```javascript
const response = await fetch(
  'https://health-nutrition-api.onrender.com/api/v1/component-adjustment/add',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: 'component_session_1234567890_abc123',
      component: {
        name: '青蔥',
        estimatedPortion: 10,
        cookingMethod: 'stir_fried',
        category: 'garnish'
      }
    })
  }
);

const result = await response.json();
console.log('添加結果:', result.data);
```

---

### 範例 3：調整成分份量

#### cURL 請求

```bash
curl -X POST "https://health-nutrition-api.onrender.com/api/v1/component-adjustment/update-portion" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1234567890_abc123",
    "componentId": "comp_2",
    "newPortion": 60
  }'
```

#### JavaScript (Fetch API)

```javascript
const response = await fetch(
  'https://health-nutrition-api.onrender.com/api/v1/component-adjustment/update-portion',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: 'component_session_1234567890_abc123',
      componentId: 'comp_2',
      newPortion: 60
    })
  }
);

const result = await response.json();
console.log('更新結果:', result.data);
```


---

## 錯誤處理

### 錯誤回應格式

所有錯誤回應遵循統一格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤描述",
    "details": {}
  },
  "timestamp": "2024-11-17T10:30:00.000Z"
}
```

### 常見錯誤代碼

| 錯誤代碼 | HTTP 狀態 | 描述 | 解決方案 |
|---------|----------|------|---------|
| `NO_FILE_UPLOADED` | 400 | 未上傳圖片檔案 | 確保請求包含圖片檔案 |
| `INVALID_FILE_TYPE` | 400 | 不支援的檔案類型 | 使用 JPG, PNG, HEIC, HEIF 或 WebP 格式 |
| `FILE_TOO_LARGE` | 400 | 檔案過大 | 壓縮圖片或使用較小的檔案 |
| `MISSING_PARAMETERS` | 400 | 缺少必要參數 | 檢查請求參數是否完整 |
| `INVALID_SESSION_ID` | 400 | 無效的會話 ID | 使用有效的會話 ID |
| `COMPONENT_NOT_FOUND` | 404 | 找不到指定的成分 | 檢查成分 ID 是否正確 |
| `SESSION_NOT_FOUND` | 404 | 找不到指定的會話 | 檢查會話 ID 是否正確 |
| `SESSION_EXPIRED` | 410 | 會話已過期 | 重新進行食物識別 |
| `VISION_API_ERROR` | 500 | Vision API 調用失敗 | 稍後重試或聯繫支援 |
| `COMPONENT_DETECTION_ERROR` | 500 | 成分識別失敗 | 系統會降級至基礎識別模式 |
| `NUTRITION_CALCULATION_ERROR` | 500 | 營養計算失敗 | 稍後重試或聯繫支援 |
| `RECOGNITION_FAILED` | 500 | 食物識別失敗 | 確保圖片清晰並重試 |

### 錯誤處理範例

#### JavaScript

```javascript
try {
  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!result.success) {
    switch (result.error.code) {
      case 'NO_FILE_UPLOADED':
        console.error('請選擇圖片檔案');
        break;
      case 'COMPONENT_DETECTION_ERROR':
        console.warn('成分識別失敗，使用基礎識別結果');
        // 仍可使用 result.data.recognition
        break;
      case 'SESSION_EXPIRED':
        console.error('會話已過期，請重新識別');
        break;
      default:
        console.error('錯誤:', result.error.message);
    }
  }
} catch (error) {
  console.error('網路錯誤:', error);
}
```

#### Python

```python
try:
    response = requests.post(url, headers=headers, files=files)
    result = response.json()
    
    if not result.get('success'):
        error_code = result['error']['code']
        error_message = result['error']['message']
        
        if error_code == 'NO_FILE_UPLOADED':
            print('請選擇圖片檔案')
        elif error_code == 'COMPONENT_DETECTION_ERROR':
            print('成分識別失敗，使用基礎識別結果')
            # 仍可使用 result['data']['recognition']
        elif error_code == 'SESSION_EXPIRED':
            print('會話已過期，請重新識別')
        else:
            print(f'錯誤: {error_message}')
            
except requests.exceptions.RequestException as e:
    print(f'網路錯誤: {e}')
```

---

## 最佳實踐

### 1. 圖片準備

**建議：**
- 使用清晰、光線充足的照片
- 確保食物在畫面中心
- 避免過度模糊或過暗的圖片
- 建議解析度：1024x1024 或更高
- 檔案大小：< 5MB

**範例：**
```javascript
// 壓縮圖片後再上傳
async function compressImage(file, maxWidth = 1024) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = await createImageBitmap(file);
  
  const scale = Math.min(1, maxWidth / img.width);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', 0.85);
  });
}
```

### 2. 會話管理

**建議：**
- 保存 `sessionId` 以便後續調整
- 會話有效期為 1 小時
- 在會話過期前完成所有調整

**範例：**
```javascript
// 保存會話 ID
const sessionId = result.data.sessionId;
localStorage.setItem('currentSession', sessionId);

// 使用會話 ID 進行調整
const savedSessionId = localStorage.getItem('currentSession');
await adjustComponent(savedSessionId, componentData);
```

### 3. 成分調整流程

**建議流程：**
1. 識別食物並獲取成分
2. 檢查識別結果
3. 添加缺失的成分
4. 調整不準確的份量
5. 移除錯誤的成分
6. 重新計算營養資訊

**範例：**
```javascript
// 完整的調整流程
async function adjustRecognitionResult(sessionId, adjustments) {
  // 1. 添加缺失的成分
  for (const component of adjustments.toAdd) {
    await addComponent(sessionId, component);
  }
  
  // 2. 調整份量
  for (const adjustment of adjustments.portionChanges) {
    await updatePortion(sessionId, adjustment.componentId, adjustment.newPortion);
  }
  
  // 3. 移除錯誤的成分
  for (const componentId of adjustments.toRemove) {
    await removeComponent(sessionId, componentId);
  }
  
  // 4. 重新計算營養
  const finalResult = await recalculateNutrition(sessionId);
  return finalResult;
}
```


### 4. 錯誤處理和降級

**建議：**
- 始終檢查 `componentDetection.success` 狀態
- 當成分識別失敗時，使用基礎識別結果
- 提供用戶友好的錯誤訊息

**範例：**
```javascript
async function recognizeFood(imageFile) {
  try {
    const result = await uploadAndRecognize(imageFile);
    
    if (result.data.componentDetection.success) {
      // 成功識別成分
      displayComponents(result.data.componentDetection.components);
    } else {
      // 降級至基礎識別
      console.warn('成分識別失敗，顯示基礎識別結果');
      displayBasicRecognition(result.data.recognition);
      
      // 顯示友好的錯誤訊息
      showMessage('無法識別個別成分，但您仍可查看整體營養資訊');
    }
  } catch (error) {
    console.error('識別失敗:', error);
    showError('食物識別失敗，請重試');
  }
}
```

### 5. 性能優化

**建議：**
- 使用適當的圖片大小（不要過大）
- 實施請求超時機制
- 考慮使用快取機制

**範例：**
```javascript
// 設置請求超時
async function recognizeWithTimeout(imageFile, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('請求超時，請重試');
    }
    throw error;
  }
}
```

### 6. 用戶體驗優化

**建議：**
- 顯示處理進度
- 提供即時反饋
- 允許用戶確認或調整結果

**範例：**
```javascript
// 顯示處理進度
async function recognizeWithProgress(imageFile) {
  showProgress('上傳圖片中...', 0);
  
  const formData = new FormData();
  formData.append('image', imageFile);
  
  showProgress('識別食物中...', 30);
  
  const result = await fetch(url, {
    method: 'POST',
    body: formData
  });
  
  showProgress('分析成分中...', 60);
  
  const data = await result.json();
  
  showProgress('計算營養中...', 90);
  
  // 處理結果
  displayResult(data);
  
  showProgress('完成！', 100);
}
```

---

## 資料類型定義

### ComponentCategory (成分類別)

```typescript
enum ComponentCategory {
  GRAIN = 'grain',           // 穀物類
  PROTEIN = 'protein',       // 蛋白質類
  VEGETABLE = 'vegetable',   // 蔬菜類
  SEASONING = 'seasoning',   // 調味料
  SAUCE = 'sauce',           // 醬料
  GARNISH = 'garnish'        // 裝飾/配菜
}
```

### CookingMethod (烹飪方式)

```typescript
enum CookingMethod {
  RAW = 'raw',                   // 生食
  BOILED = 'boiled',             // 水煮
  FRIED = 'fried',               // 煎
  DEEP_FRIED = 'deep_fried',     // 油炸
  STEAMED = 'steamed',           // 蒸
  GRILLED = 'grilled',           // 烤
  BRAISED = 'braised',           // 滷/燉
  STIR_FRIED = 'stir_fried',     // 炒
  PICKLED = 'pickled'            // 醃製
}
```

### DishType (料理類型)

```typescript
enum DishType {
  SOUP = 'soup',                 // 湯品
  FRIED_RICE = 'fried_rice',     // 炒飯
  STIR_FRY = 'stir_fry',         // 炒菜
  BENTO = 'bento',               // 便當
  NOODLES = 'noodles',           // 麵食
  DUMPLING = 'dumpling',         // 餃子/包子
  BARBECUE = 'barbecue',         // 燒烤
  HOT_POT = 'hot_pot',           // 火鍋
  UNKNOWN = 'unknown'            // 未知
}
```

---

## 測試指南

### 使用 Postman 測試

1. **匯入 Collection**
   - 使用更新後的 `POSTMAN_COLLECTION.json`
   - 設置環境變數 `base_url` 和 `jwt_token`

2. **測試流程**
   ```
   1. Health Check
   2. Register/Login
   3. Upload Food Image with Components
   4. Add Missing Component
   5. Update Component Portion
   6. Remove Component
   7. Recalculate Nutrition
   8. Get Session State
   9. Get Adjustment History
   ```

3. **測試數據**
   - 準備不同類型的食物圖片
   - 測試各種料理類型
   - 驗證成分識別準確性

### 使用 cURL 測試

```bash
# 1. 登入獲取 Token
TOKEN=$(curl -X POST "https://health-nutrition-api.onrender.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"P@55w0rd"}' \
  | jq -r '.token')

# 2. 識別食物（包含成分）
SESSION_ID=$(curl -X POST "https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components?includeComponents=true" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./test-images/fried-rice.jpg" \
  | jq -r '.data.sessionId')

# 3. 添加成分
curl -X POST "https://health-nutrition-api.onrender.com/api/v1/component-adjustment/add" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"component\":{\"name\":\"青蔥\",\"estimatedPortion\":10}}"

# 4. 查看會話狀態
curl -X GET "https://health-nutrition-api.onrender.com/api/v1/component-adjustment/session/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 常見問題 (FAQ)

### Q1: 成分識別需要多長時間？

**A:** 使用新的識別流程（v1.1.0），處理速度大幅提升：
- **使用預識別食物**（推薦）：< 1 秒
- **傳統 Vision API 模式**：
  - 簡單料理（1-3 成分）：< 3 秒
  - 中等複雜（4-6 成分）：< 5 秒
  - 複雜料理（7+ 成分）：< 8 秒

**性能提升：** 新流程比傳統模式快 60-80%

### Q2: 如果成分識別失敗怎麼辦？

**A:** 系統會自動降級至基礎識別模式，您仍可：
- 查看整體料理的營養資訊
- 手動添加成分
- 使用知識庫中的常見成分

### Q3: 會話有效期是多久？

**A:** 會話有效期為 1 小時。在此期間內，您可以：
- 調整成分
- 修改份量
- 重新計算營養

### Q4: 支援哪些料理類型？

**A:** 目前支援：
- 湯品類（味噌湯、蛋花湯等）
- 炒菜類（炒飯、炒麵等）
- 便當類（台式、日式、韓式便當）
- 麵食類（拉麵、烏龍麵等）
- 點心類（小籠包、餃子等）
- 燒烤類（烤肉、燒雞等）

### Q5: 如何提高識別準確度？

**A:** 建議：
- 使用清晰、光線充足的照片
- 確保食物在畫面中心
- 避免過度遮擋或混雜
- 拍攝角度：俯視 45-90 度
- 背景簡潔

### Q6: 可以同時識別多個料理嗎？

**A:** 目前每次請求識別一個主要料理。如需識別多個料理：
- 分別上傳每個料理的照片
- 或使用便當模式（自動識別多個菜色）

### Q7: 營養資訊的準確度如何？

**A:** 營養資訊基於：
- 知識庫中的標準營養數據
- 份量估算（誤差 ±25%）
- 烹飪方式影響係數
- 建議用戶根據實際情況調整

### Q8: 如何確保識別結果的一致性？ (v1.1.0 新增)

**A:** 系統採用兩階段識別流程：
1. **基礎識別**：識別料理中的所有食物
2. **成分識別**：直接使用基礎識別結果，不重複調用 Vision API

**一致性保證：**
- ✅ 成分列表與基礎識別完全一致
- ✅ 自動進行一致性驗證
- ✅ 記錄詳細的性能監控日誌
- ✅ 如有不一致會記錄警告訊息

### Q9: 什麼是 detectionMethod？ (v1.1.0 更新)

**A:** `detectionMethod` 表示成分識別的方法：
- `pre_recognized`：使用預識別食物（推薦，最快）
- `vision_api`：直接調用 Vision API 識別
- `knowledge_base`：完全依賴知識庫
- `hybrid`：混合使用多種方法

**推薦使用 `pre_recognized` 模式以獲得最佳性能和一致性。**

---

## 版本歷史

### v1.1.0 (2024-11-19)
- ✅ **重大改進：識別流程優化**
  - 實現兩階段識別流程
  - 使用預識別食物避免重複 Vision API 調用
  - 確保基礎識別和成分識別結果一致
- ✅ **性能提升**
  - 處理速度提升 60-80%
  - 使用預識別食物時 < 1 秒完成
  - 節省 API 調用成本
- ✅ **新增功能**
  - 添加 `sourceType` 和 `originalFoodId` 屬性
  - 添加 `componentsFromPreRecognition` 統計
  - 新增 `pre_recognized` 檢測方法
  - 添加詳細的性能監控日誌
  - 自動一致性驗證
- ✅ **向後兼容**
  - 保持現有 API 完全兼容
  - 自動選擇最佳識別方法

### v1.0.0 (2024-11-17)
- ✅ 初始版本發布
- ✅ 支援基礎成分識別
- ✅ 支援 6 大料理類型
- ✅ 支援成分調整功能
- ✅ 支援營養計算

### 未來計劃

- 🔄 支援更多地域料理
- 🔄 改進份量估算準確度
- 🔄 添加用戶反饋學習機制
- 🔄 支援批量識別
- 🔄 添加成分替代建議

---

## 支援與聯繫

- **API 文檔：** 本文檔
- **技術支援：** 查看 Render Dashboard 日誌
- **問題回報：** 通過 GitHub Issues
- **API 狀態：** https://health-nutrition-api.onrender.com/health

---

**最後更新：** 2024-11-19  
**API 版本：** v1.1.0  
**文檔版本：** 1.1.0
