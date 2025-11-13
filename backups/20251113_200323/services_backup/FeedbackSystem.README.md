# 用戶反饋系統

## 概述

用戶反饋系統是食物識別準確度改進功能的重要組成部分。它允許用戶對識別結果提供反饋，系統會自動分析這些反饋並生成改進建議，最終實現持續優化。

## 系統架構

```
用戶反饋 → 反饋收集 → 反饋分析 → 持續改進 → 系統優化
```

### 核心組件

1. **FeedbackCollector（反饋收集器）**
   - 收集和管理用戶反饋
   - 提供反饋查詢和統計功能
   - 支持反饋審核流程

2. **FeedbackAnalyzer（反饋分析器）**
   - 分析常見識別錯誤
   - 識別錯誤模式
   - 生成改進建議

3. **FeedbackImprover（反饋改進器）**
   - 根據反饋更新知識庫
   - 優化 Prompt 模板
   - 調整驗證規則

## 數據模型

### UserFeedback（用戶反饋）

```typescript
interface UserFeedback {
  id: string;
  imageId: string;
  userId?: string;
  sessionId: string;
  recognitionResult: RecognitionResultSnapshot;
  userCorrection: UserCorrection;
  feedbackType: FeedbackType[];
  additionalComments?: string;
  status: FeedbackStatus;
  createdAt: Date;
}
```

### UserCorrection（用戶修正）

```typescript
interface UserCorrection {
  correctFoods: CorrectFood[];
  incorrectFoods: IncorrectFood[];
  missingFoods: MissingFood[];
  portionCorrections: PortionCorrection[];
  cookingMethodCorrection?: string;
  cuisineTypeCorrection?: string;
}
```

## API 端點

### 反饋提交和管理

#### 提交反饋
```http
POST /api/v1/feedback
Authorization: Bearer <token>

{
  "imageId": "img_123",
  "sessionId": "session_456",
  "recognitionResult": { ... },
  "userCorrection": {
    "incorrectFoods": [
      {
        "identifiedAs": "麵條",
        "actualFood": "豆腐干絲",
        "reason": "質地和顏色不同"
      }
    ],
    "missingFoods": [
      {
        "name": "芹菜絲",
        "portion": "50克"
      }
    ]
  },
  "feedbackType": ["incorrect_food", "missing_food"]
}
```

#### 獲取反饋詳情
```http
GET /api/v1/feedback/:id
Authorization: Bearer <token>
```

#### 獲取用戶反饋列表
```http
GET /api/v1/feedback/user/:userId?limit=50
Authorization: Bearer <token>
```

### 反饋搜索和統計

#### 搜索反饋
```http
GET /api/v1/feedback/search/query?foodName=豆腐干絲&status=pending
Authorization: Bearer <token>
```

#### 獲取反饋統計
```http
GET /api/v1/feedback/stats/overview
Authorization: Bearer <token>
```

#### 獲取常見錯誤
```http
GET /api/v1/feedback/stats/mistakes?limit=20
Authorization: Bearer <token>
```

#### 獲取反饋報告
```http
GET /api/v1/feedback/stats/report?days=30
Authorization: Bearer <token>
```

### 反饋分析

#### 分析錯誤模式
```http
GET /api/v1/feedback/analysis/patterns
Authorization: Bearer <token>
```

#### 分析食材準確度
```http
GET /api/v1/feedback/analysis/food/豆腐干絲
Authorization: Bearer <token>
```

#### 生成詳細分析報告
```http
GET /api/v1/feedback/analysis/detailed?days=30
Authorization: Bearer <token>
```

### 持續改進

#### 執行持續改進
```http
POST /api/v1/feedback/improve/execute
Authorization: Bearer <token>

{
  "analyzeDays": 7,
  "autoApply": false,
  "minFeedbackCount": 5
}
```

#### 獲取改進歷史
```http
GET /api/v1/feedback/improve/history?limit=50
Authorization: Bearer <token>
```

## 使用示例

### 1. 提交反饋

```typescript
// 用戶識別結果不正確時提交反饋
const feedback = await fetch('/api/v1/feedback', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageId: recognitionResult.imageId,
    sessionId: recognitionResult.sessionId,
    recognitionResult: {
      foods: recognitionResult.foods,
      overallConfidence: recognitionResult.confidence,
      description: recognitionResult.description,
      cookingMethod: recognitionResult.cookingMethod,
      cuisineType: recognitionResult.cuisineType,
      recognitionStages: recognitionResult.stages,
      processingTime: recognitionResult.processingTime
    },
    userCorrection: {
      incorrectFoods: [
        {
          identifiedAs: '麵條',
          actualFood: '豆腐干絲',
          reason: '這是豆製品，不是麵條'
        }
      ],
      missingFoods: [
        {
          name: '芹菜絲',
          portion: '約50克'
        }
      ],
      portionCorrections: [],
      cookingMethodCorrection: '涼拌',
      cuisineTypeCorrection: '台式'
    },
    feedbackType: ['incorrect_food', 'missing_food', 'wrong_cooking_method'],
    additionalComments: '這是一道涼拌干絲，應該要識別出所有配菜'
  })
});
```

### 2. 查看反饋統計

```typescript
// 獲取反饋統計數據
const stats = await fetch('/api/v1/feedback/stats/overview', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await stats.json();
console.log('總反饋數:', data.data.totalFeedbacks);
console.log('待審核:', data.data.pendingReviews);
console.log('最常見錯誤:', data.data.mostCommonMistakes);
```

### 3. 執行持續改進

```typescript
// 管理員執行持續改進流程
const improvement = await fetch('/api/v1/feedback/improve/execute', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    analyzeDays: 7,
    autoApply: false, // 先不自動應用，僅生成建議
    minFeedbackCount: 5
  })
});

const result = await improvement.json();
console.log('知識庫更新建議:', result.data.knowledgeBaseUpdates);
console.log('Prompt 優化建議:', result.data.promptOptimizations);
console.log('驗證規則更新建議:', result.data.validationRuleUpdates);
```

## 反饋類型

系統支持以下反饋類型：

- `incorrect_food`: 食材識別錯誤
- `missing_food`: 遺漏食材
- `wrong_portion`: 份量錯誤
- `wrong_cooking_method`: 烹飪方式錯誤
- `wrong_cuisine_type`: 料理類型錯誤
- `other`: 其他問題

## 反饋狀態

反饋會經歷以下狀態：

1. `pending`: 待審核
2. `reviewed`: 已審核
3. `applied`: 已應用（改進已實施）
4. `rejected`: 已拒絕

## 改進流程

### 自動改進流程

系統會定期（建議每週）執行自動改進流程：

1. **收集反饋**：獲取最近一段時間的已審核反饋
2. **分析錯誤**：識別常見錯誤模式和高頻問題
3. **生成建議**：
   - 知識庫更新建議
   - Prompt 優化建議
   - 驗證規則更新建議
4. **審核建議**：管理員審核改進建議
5. **應用改進**：將批准的改進應用到系統
6. **評估效果**：監控改進後的識別準確度

### 手動改進流程

管理員也可以手動觸發改進流程：

```bash
# 分析最近7天的反饋並生成建議（不自動應用）
POST /api/v1/feedback/improve/execute
{
  "analyzeDays": 7,
  "autoApply": false
}

# 審核建議後，可以選擇性應用
# （實際應用邏輯需要在後續版本中實現）
```

## 監控和報告

### 關鍵指標

系統會追蹤以下關鍵指標：

- **反饋數量**：總反饋數、待審核數、已應用數
- **錯誤率**：識別錯誤的比例
- **常見錯誤**：最頻繁出現的錯誤模式
- **改進效果**：應用改進前後的準確度對比

### 報告類型

1. **每日報告**：當天的反饋統計
2. **每週報告**：一週的錯誤趨勢和改進建議
3. **每月報告**：月度準確度分析和改進效果評估

## 最佳實踐

### 對於用戶

1. **提供詳細信息**：在反饋中盡可能詳細地描述問題
2. **及時反饋**：發現錯誤時立即提交反饋
3. **準確修正**：確保提供的正確答案是準確的

### 對於管理員

1. **定期審核**：每週審核待處理的反饋
2. **優先處理高頻錯誤**：重點關注出現頻率高的問題
3. **測試改進效果**：應用改進後監控準確度變化
4. **持續優化**：根據效果評估調整改進策略

## 數據庫索引

系統會自動創建以下 MongoDB 索引以優化查詢性能：

```javascript
// 基本索引
db.feedbacks.createIndex({ imageId: 1 })
db.feedbacks.createIndex({ userId: 1 })
db.feedbacks.createIndex({ sessionId: 1 }, { unique: true })
db.feedbacks.createIndex({ status: 1 })
db.feedbacks.createIndex({ createdAt: -1 })

// 複合索引
db.feedbacks.createIndex({ status: 1, createdAt: -1 })
db.feedbacks.createIndex({ userId: 1, createdAt: -1 })

// 文本搜索索引
db.feedbacks.createIndex({
  'recognitionResult.foods.name': 'text',
  'userCorrection.incorrectFoods.identifiedAs': 'text',
  'userCorrection.incorrectFoods.actualFood': 'text',
  'userCorrection.missingFoods.name': 'text',
  additionalComments: 'text'
})
```

## 故障排除

### 常見問題

1. **反饋提交失敗**
   - 檢查 MongoDB 連接
   - 確認反饋數據格式正確
   - 檢查是否已存在相同 sessionId 的反饋

2. **統計數據不準確**
   - 清除 Redis 快取：`redis-cli FLUSHDB`
   - 重新計算統計數據

3. **改進建議生成失敗**
   - 確認有足夠的反饋數據（至少5條）
   - 檢查反饋狀態是否為 `reviewed`

## 未來擴展

計劃中的功能：

1. **機器學習整合**：使用反饋數據訓練專門的分類模型
2. **A/B 測試**：測試不同改進策略的效果
3. **用戶貢獻獎勵**：為提供高質量反饋的用戶提供獎勵
4. **自動化改進**：完全自動化的改進流程（需要更多測試）
5. **多語言支持**：支持其他語言的反饋和分析

## 相關文檔

- [AsianCuisineKnowledgeBase.README.md](./AsianCuisineKnowledgeBase.README.md)
- [EnhancedPromptGenerator.README.md](./EnhancedPromptGenerator.README.md)
- [MultiStageRecognitionEngine.README.md](./MultiStageRecognitionEngine.README.md)
- [ResultValidator.README.md](./ResultValidator.README.md)
