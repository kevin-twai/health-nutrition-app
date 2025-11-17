# 批次測試詳細報告

測試時間: 2025-11-15 18:56:04
測試資料夾: /Users/kevinhktw/Downloads/Testimg
圖片數量: 89

---

## 1. 100599e653dc508b.webp

- **狀態**: ❌ 失敗 (HTTP 404)

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/v1/photo/recognize</pre>
</body>
</html>
```

---

## 2. 518f4f7e91cfafd549795e80da04437d_t.jpeg

- **狀態**: ❌ 失敗 - 回應格式錯誤

```
{
  "success": true,
  "data": {
    "sessionId": "session_1763204168304_7w3a0nwf9",
    "imageInfo": {
      "imageId": "d8fc7148-bd47-4765-8745-315ea3ecf5a1",
      "originalUrl": "https://res.cloudinary.com/dzbixd1eo/image/upload/v1763204169/health-nutrition-app/food-images/d8fc7148-bd47-4765-8745-315ea3ecf5a1_1763204168304.jpg",
      "processedUrl": "https://res.cloudinary.com/dzbixd1eo/image/upload/v1763204169/health-nutrition-app/food-images/d8fc7148-bd47-4765-8745-315ea3ecf5a1_1763204168304.jpg",
      "metadata": {
        "originalSize": 24423,
        "processedSize": 27644,
        "width": 511,
        "height": 340,
        "format": "jpeg",
        "uploadedAt": "2025-11-15T10:56:10.126Z",
        "features": {
          "dominantColors": [
            "#84796c"
          ],
          "brightness": 0.47172879466049106,
          "contrast": 0.4850235433847098,
          "sharpness": 1,
          "hasMultipleObjects": false
        }
      }
    },
    "recognition": {
      "foods": [
        {
          "id": "temp-1763203871530-0.6859025898253454",
          "name": "小籠包",
          "confidence": 0.95,
          "estimatedPortion": 150,
          "nutrition": {
            "calories": 0,
            "protein": 0,
            "carbohydrates": 0,
            "fat": 0,
            "fiber": 0,
            "sugar": 0,
            "sodium": 0,
            "vitamins": {
              "vitamin_a_mcg": 0,
              "vitamin_c_mg": 0,
              "vitamin_d_mcg": 0,
              "vitamin_e_mg": 0,
              "vitamin_k_mcg": 0,
              "vitamin_b1_mg": 0,
              "vitamin_b2_mg": 0,
              "vitamin_b3_mg": 0,
              "vitamin_b6_mg": 0,
              "vitamin_b12_mcg": 0,
              "folate_mcg": 0
            },
            "minerals": {
              "calcium_mg": 0,
              "iron_mg": 0,
              "magnesium_mg": 0,
              "phosphorus_mg": 0,
              "potassium_mg": 0,
              "zinc_mg": 0
            }
          }
        }
      ],
      "confidence": 0.95,
      "description": "這是一籠中式小籠包，擺放在竹製蒸籠中，周圍有配菜如青菜和麵條。",
      "suggestions": [
        {
          "food": {
            "id": "temp-1763203871530-0.6859025898253454",
            "name": "小籠包",
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "sodium": 0,
            "category": "食材",
            "portion": "150g",
            "description": "多階段識別結果（階段 1）",
            "cuisine_type": "中式"
          },
          "confidence": 0.95,
          "recognitionStage": 1
        }
      ],
      "processingTime": 1823,
      "confidenceLevel": "very_high",
      "needsUserConfirmation": false
    },
    "multiStageInfo": {
      "totalStages": 1,
      "stagesExecuted": [
        {
          "stage": 1,
          "promptType": "standard",
          "confidence": 0.95,
          "timestamp": "2025-11-15T10:51:11.530Z"
        }
      ],
      "finalConfidence": 0.95,
      "finalStage": 1
    },
    "validation": {
      "passed": true,
      "hasWarnings": false,
      "errors": [],
      "warnings": [],
      "infos": []
    },
    "alternatives": {
      "available": false,
      "message": "識別信心度足夠，無需提供替代選項"
    },
    "processingTime": 1823
  },
  "timestamp": "2025-11-15T10:56:10.127Z"
}
```

---

## 3. 9019df1931032a94.webp

- **狀態**: ❌ 失敗 (HTTP 404)

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/v1/photo/recognize</pre>
</body>
</html>
```

---

## 4. images-10.jpeg

- **狀態**: ❌ 失敗 (HTTP 404)

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/v1/photo/recognize</pre>
</body>
</html>
```

---

## 5. images-11.jpeg

- **狀態**: ❌ 失敗 (HTTP 404)

```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/v1/photo/recognize</pre>
</body>
</html>
```

---

## 測試統計

| 項目 | 數值 |
|------|------|
| 總測試數 | 0 |
| 成功 | 0 |
| 失敗 | 0 |
| 成功率 | 0% |
| 總食物數 | 0 |
| 平均每張 | 0 個 |
| 總熱量 | 0 kcal |
| 平均熱量 | 0 kcal |
| 平均處理時間 | 0ms |

