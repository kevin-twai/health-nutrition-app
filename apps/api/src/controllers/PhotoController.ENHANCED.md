# PhotoController 增強功能說明

## 概述

PhotoController 已經過優化，實現了以下增強功能：

1. **替代選項返回** - 當識別信心度低時，自動提供多個可能的食物選項
2. **用戶選擇接口** - 允許用戶從替代選項中選擇正確的食物
3. **增強圖片預處理** - 提供智能裁剪、特徵提取和質量增強功能

## 新增功能

### 1. 替代選項返回（任務 5.2）

當食物識別的信心度低於 85% 時，系統會自動返回替代選項供用戶選擇。

#### API 回應格式

```json
{
  "success": true,
  "data": {
    "sessionId": "session_1234567890_abc123",
    "recognition": {
      "foods": [...],
      "confidence": 0.72,
      "confidenceLevel": "medium",
      "needsUserConfirmation": true
    },
    "alternatives": {
      "available": true,
      "message": "識別信心度較低，為您提供以下可能的選項，請選擇最符合的食物：",
      "options": [
        {
          "groupId": "alt_group_0",
          "originalFood": "豆腐干絲",
          "options": [
            {
              "optionId": "0_0",
              "food": {
                "id": "tofu_strips",
                "name": "豆腐干絲",
                "portion": "100g",
                "calories": 150,
                "protein": 12.5,
                "carbs": 8.2,
                "fat": 6.8
              },
              "confidence": 0.75,
              "confidencePercentage": 75,
              "reason": "中等信心度識別 | 增強識別結果",
              "recognitionStage": 2,
              "isRecommended": true
            },
            {
              "optionId": "0_1",
              "food": {
                "id": "noodles",
                "name": "麵條",
                "portion": "100g",
                "calories": 138,
                "protein": 4.5,
                "carbs": 28.0,
                "fat": 0.8
              },
              "confidence": 0.65,
              "confidencePercentage": 65,
              "reason": "中等信心度識別 | 標準識別結果",
              "recognitionStage": 1,
              "isRecommended": false
            }
          ]
        }
      ],
      "selectionRequired": true
    }
  }
}
```

#### 信心度等級

- `very_high`: >= 90%
- `high`: >= 85%
- `medium`: >= 75%
- `low`: >= 60%
- `very_low`: < 60%

### 2. 用戶選擇接口（任務 5.2）

新增端點允許用戶選擇正確的食物選項。

#### 端點

```
POST /api/v1/photo/select-alternative
```

#### 請求格式

```json
{
  "sessionId": "session_1234567890_abc123",
  "groupId": "alt_group_0",
  "optionId": "0_0",
  "selectedFood": {
    "id": "tofu_strips",
    "name": "豆腐干絲",
    "portion": "100g",
    "calories": 150,
    "protein": 12.5,
    "carbs": 8.2,
    "fat": 6.8
  }
}
```

#### 回應格式

```json
{
  "success": true,
  "data": {
    "message": "已記錄您的選擇",
    "sessionId": "session_1234567890_abc123",
    "selectedFood": {
      "id": "tofu_strips",
      "name": "豆腐干絲",
      "portion": "100g",
      "nutrition": {
        "calories": 150,
        "protein": 12.5,
        "carbs": 8.2,
        "fat": 6.8
      }
    }
  }
}
```

### 3. 增強圖片預處理（任務 5.3）

新增多個圖片處理選項以提升識別準確度。

#### 新增參數

在 `/api/v1/photo/recognize` 端點中，新增以下可選參數：

- `enableSmartCrop` (boolean, default: false) - 啟用智能裁剪，自動聚焦食物區域
- `extractFeatures` (boolean, default: true) - 提取圖片特徵（顏色、亮度、對比度等）
- `enhanceQuality` (boolean, default: false) - 增強圖片質量（標準化、銳化）

#### 使用範例

```bash
curl -X POST http://localhost:3000/api/v1/photo/recognize \
  -F "photo=@food.jpg" \
  -F "enableSmartCrop=true" \
  -F "extractFeatures=true" \
  -F "enhanceQuality=true" \
  -F "quality=90"
```

#### 圖片特徵

當 `extractFeatures=true` 時，回應中會包含圖片特徵：

```json
{
  "imageInfo": {
    "metadata": {
      "features": {
        "dominantColors": ["綠色", "紅色", "黃色"],
        "brightness": 0.65,
        "contrast": 0.72,
        "sharpness": 0.85,
        "hasMultipleObjects": true
      }
    }
  }
}
```

## 使用建議

### 何時使用智能裁剪

- 圖片中食物不在中心位置
- 圖片包含大量背景或無關物體
- 需要聚焦特定食物區域

### 何時使用質量增強

- 圖片光線不足或過曝
- 圖片模糊或對比度低
- 需要提升整體識別準確度

### 處理替代選項

1. 檢查 `recognition.needsUserConfirmation` 是否為 `true`
2. 如果為 `true`，顯示 `alternatives.options` 給用戶選擇
3. 用戶選擇後，調用 `/api/v1/photo/select-alternative` 記錄選擇
4. 系統會記錄用戶選擇以改進未來的識別準確度

## 性能考量

### 處理時間

- 標準處理：~2-3 秒
- 啟用智能裁剪：+0.5-1 秒
- 啟用質量增強：+0.3-0.5 秒
- 多階段識別（低信心度）：+2-4 秒

### 圖片大小

- 智能裁剪和質量增強會增加處理時間
- 建議在客戶端先進行基本壓縮
- 最大上傳大小：10MB

## 錯誤處理

### 常見錯誤

1. **NO_FILE_UPLOADED** - 未上傳圖片
2. **RECOGNITION_FAILED** - 識別失敗
3. **SELECTION_FAILED** - 選擇替代選項失敗

### 錯誤回應格式

```json
{
  "success": false,
  "error": {
    "code": "RECOGNITION_FAILED",
    "message": "食物辨識失敗",
    "sessionId": "session_1234567890_abc123"
  },
  "timestamp": "2025-11-13T10:30:00.000Z"
}
```

## 監控和日誌

系統會自動記錄以下信息：

1. **識別會話** - 每次識別的詳細信息
2. **用戶選擇** - 用戶從替代選項中的選擇
3. **處理時間** - 各階段的處理時間
4. **API 調用次數** - OpenAI Vision API 的調用次數

這些數據可用於：
- 分析常見識別錯誤
- 改進 prompt 模板
- 更新知識庫
- 調整驗證規則

## 未來改進

1. 實現用戶選擇數據的持久化存儲
2. 基於用戶反饋自動優化識別系統
3. 添加更多圖片預處理選項
4. 實現批量圖片處理
