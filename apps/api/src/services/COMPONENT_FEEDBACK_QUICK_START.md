# 成分識別反饋系統 - 快速入門

## 5 分鐘快速開始

### 1. 提交成分識別反饋

```bash
curl -X POST http://localhost:3000/api/feedback/component \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageId": "img_123",
    "sessionId": "session_456",
    "recognitionResult": {
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
          "confidence": 0.95,
          "estimatedPortion": 200,
          "category": "grain"
        },
        {
          "id": "comp_2",
          "name": "雞蛋",
          "confidence": 0.88,
          "estimatedPortion": 50,
          "category": "protein"
        }
      ],
      "nutritionSummary": {
        "total": {
          "calories": 377,
          "protein": 15,
          "carbohydrates": 57.4,
          "fat": 9
        }
      },
      "metadata": {
        "processingTime": 2500,
        "confidenceScore": 0.86,
        "detectionMethod": "hybrid",
        "componentsDetected": 2,
        "componentsFromKB": 1,
        "componentsFromVision": 1
      },
      "suggestions": {
        "possibleMissingComponents": ["青蔥"],
        "portionAdjustments": [],
        "alternativeInterpretations": []
      }
    },
    "componentCorrections": {
      "correctComponents": [
        {
          "id": "comp_1",
          "name": "白飯",
          "portion": 200
        }
      ],
      "incorrectComponents": [
        {
          "identifiedAs": "雞蛋",
          "actualComponent": "鴨蛋",
          "reason": "實際使用的是鴨蛋"
        }
      ],
      "missingComponents": [
        {
          "name": "青蔥",
          "portion": 10,
          "category": "garnish",
          "importance": "medium"
        }
      ],
      "componentPortionCorrections": [],
      "componentCategoryCorrections": [],
      "componentNutritionCorrections": []
    },
    "additionalComments": "整體識別不錯"
  }'
```

### 2. 查看成分反饋統計

```bash
curl -X GET http://localhost:3000/api/feedback/component/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**回應範例:**
```json
{
  "success": true,
  "data": {
    "totalFeedbacks": 150,
    "incorrectComponents": 45,
    "missingComponents": 78,
    "portionErrors": 32,
    "categoryErrors": 12,
    "nutritionErrors": 8,
    "averageComponentAccuracy": 82.5,
    "mostCommonMistakes": [
      {
        "incorrectComponent": "火腿",
        "correctComponent": "叉燒",
        "frequency": 12,
        "dishTypes": ["fried_rice", "bento"],
        "averageConfidence": 0.75
      }
    ]
  }
}
```

### 3. 查詢特定成分的反饋歷史

```bash
curl -X GET "http://localhost:3000/api/feedback/component/history/雞蛋" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**回應範例:**
```json
{
  "success": true,
  "data": {
    "totalMentions": 45,
    "incorrectIdentifications": 5,
    "missingOccurrences": 8,
    "portionIssues": 12,
    "averageConfidence": 0.88,
    "commonMistakes": [
      "被誤認為 鴨蛋",
      "被誤認為 鵪鶉蛋"
    ],
    "suggestions": [
      "雞蛋的份量估計經常不準確，建議調整知識庫中的典型份量範圍"
    ]
  }
}
```

### 4. 查詢料理類型的準確率

```bash
curl -X GET http://localhost:3000/api/feedback/component/accuracy/fried_rice \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**回應範例:**
```json
{
  "success": true,
  "data": {
    "dishType": "fried_rice",
    "totalFeedbacks": 50,
    "averageComponentsDetected": 4.2,
    "averageComponentsMissing": 1.5,
    "averageComponentsIncorrect": 0.8,
    "accuracyRate": 75.5,
    "commonIssues": [
      "小份量配菜經常被遺漏",
      "火腿和叉燒容易混淆"
    ]
  }
}
```

## 常見使用場景

### 場景 1: 用戶修正錯誤的成分

```typescript
// 用戶看到識別結果後，發現「火腿」實際是「叉燒」
await componentFeedbackCollector.submitComponentFeedback({
  imageId: 'img_001',
  sessionId: 'session_001',
  recognitionResult: originalResult,
  componentCorrections: {
    incorrectComponents: [
      {
        identifiedAs: '火腿',
        actualComponent: '叉燒',
        reason: '顏色和質地相似但實際是叉燒',
        identifiedPortion: 30,
        actualPortion: 40
      }
    ],
    // 其他修正...
  }
});
```

### 場景 2: 用戶添加遺漏的成分

```typescript
// 用戶發現系統遺漏了「青蔥」
await componentFeedbackCollector.submitComponentFeedback({
  imageId: 'img_002',
  sessionId: 'session_002',
  recognitionResult: originalResult,
  componentCorrections: {
    missingComponents: [
      {
        name: '青蔥',
        portion: 10,
        category: 'garnish',
        importance: 'medium',
        reason: '圖片中可見但未識別'
      }
    ],
    // 其他修正...
  }
});
```

### 場景 3: 用戶修正份量估計

```typescript
// 用戶認為「雞肉」的份量估計偏低
await componentFeedbackCollector.submitComponentFeedback({
  imageId: 'img_003',
  sessionId: 'session_003',
  recognitionResult: originalResult,
  componentCorrections: {
    componentPortionCorrections: [
      {
        componentId: 'comp_2',
        componentName: '雞肉',
        identifiedPortion: 80,
        actualPortion: 120,
        reason: '實際份量明顯更多'
      }
    ],
    // 其他修正...
  }
});
```

## 整合到前端

### React 示例

```typescript
import { useState } from 'react';

function ComponentFeedbackForm({ recognitionResult, sessionId, imageId }) {
  const [corrections, setCorrections] = useState({
    incorrectComponents: [],
    missingComponents: [],
    componentPortionCorrections: []
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/feedback/component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageId,
          sessionId,
          recognitionResult,
          componentCorrections: corrections,
          additionalComments: comments
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('反饋提交成功！感謝您的幫助。');
      }
    } catch (error) {
      console.error('提交反饋失敗:', error);
    }
  };

  return (
    <div>
      <h3>成分識別反饋</h3>
      
      {/* 錯誤成分修正 */}
      <section>
        <h4>錯誤的成分</h4>
        {recognitionResult.components.map(comp => (
          <div key={comp.id}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  // 添加到錯誤成分列表
                }
              }}
            />
            <span>{comp.name}</span>
            <input
              type="text"
              placeholder="實際成分"
              onChange={(e) => {
                // 更新實際成分
              }}
            />
          </div>
        ))}
      </section>

      {/* 遺漏成分 */}
      <section>
        <h4>遺漏的成分</h4>
        <button onClick={() => {
          // 添加遺漏成分輸入框
        }}>
          + 添加遺漏成分
        </button>
      </section>

      <button onClick={handleSubmit}>提交反饋</button>
    </div>
  );
}
```

## 監控和分析

### 定期檢查統計

```bash
# 每日檢查成分反饋統計
curl -X GET http://localhost:3000/api/feedback/component/stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.data | {
      總反饋數: .totalFeedbacks,
      平均準確率: .averageComponentAccuracy,
      最常見錯誤: .mostCommonMistakes[0]
    }'
```

### 分析特定成分

```bash
# 分析「雞蛋」的識別表現
curl -X GET "http://localhost:3000/api/feedback/component/history/雞蛋" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.data | {
      總提及: .totalMentions,
      錯誤率: (.incorrectIdentifications / .totalMentions * 100),
      遺漏率: (.missingOccurrences / .totalMentions * 100),
      建議: .suggestions
    }'
```

### 比較不同料理類型

```bash
# 比較炒飯和便當的準確率
for dish_type in fried_rice bento; do
  echo "=== $dish_type ==="
  curl -X GET "http://localhost:3000/api/feedback/component/accuracy/$dish_type" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    | jq '.data.accuracyRate'
done
```

## 最佳實踐

### 1. 鼓勵用戶提供反饋

- 在識別結果頁面顯著位置放置「提供反饋」按鈕
- 提供簡單直觀的反饋界面
- 感謝用戶的貢獻

### 2. 及時處理反饋

- 每日查看新增反饋
- 優先處理高頻錯誤
- 定期更新知識庫

### 3. 追蹤改進效果

- 記錄每次改進前後的準確率
- 監控特定成分的識別趨勢
- 評估用戶滿意度變化

## 故障排除

### 問題 1: 反饋提交失敗

```bash
# 檢查服務狀態
curl -X GET http://localhost:3000/api/health

# 檢查認證
curl -X GET http://localhost:3000/api/feedback/component/stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

### 問題 2: 統計數據為空

```bash
# 檢查是否有反饋數據
curl -X GET http://localhost:3000/api/feedback/search/query?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 問題 3: 性能問題

```bash
# 清除快取
redis-cli FLUSHDB

# 重建索引
mongo health_nutrition_app --eval "db.feedbacks.createIndex({createdAt: -1})"
```

## 下一步

1. 閱讀完整文檔: [COMPONENT_FEEDBACK_README.md](./COMPONENT_FEEDBACK_README.md)
2. 查看使用示例: [ComponentFeedbackCollector.example.ts](./ComponentFeedbackCollector.example.ts)
3. 整合到您的應用: 參考 [PhotoController](../controllers/PhotoController.ts)
4. 設置監控: 使用 [FoodRecognitionPerformanceMonitor](./FoodRecognitionPerformanceMonitor.ts)

## 支持

如有問題，請查看:
- [GitHub Issues](https://github.com/your-repo/issues)
- [API 文檔](../docs/API.md)
- [常見問題](../docs/FAQ.md)
