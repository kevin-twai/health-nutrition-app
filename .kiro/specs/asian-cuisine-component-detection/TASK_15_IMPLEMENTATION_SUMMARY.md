# Task 15: 成分識別反饋收集系統 - 實施摘要

## 任務概述

實現了完整的成分識別反饋收集系統，用於收集和分析用戶對亞洲料理成分識別結果的反饋，幫助持續改進識別準確率。

## 實施內容

### 1. 擴展反饋模型 (Feedback.ts)

**新增反饋類型:**
- `INCORRECT_COMPONENT`: 成分識別錯誤
- `MISSING_COMPONENT`: 遺漏的成分
- `WRONG_COMPONENT_PORTION`: 成分份量錯誤
- `WRONG_COMPONENT_CATEGORY`: 成分類別錯誤
- `COMPONENT_NUTRITION_ERROR`: 成分營養資訊錯誤

**新增數據結構:**
```typescript
interface ComponentCorrection {
  correctComponents: CorrectComponent[];
  incorrectComponents: IncorrectComponent[];
  missingComponents: MissingComponent[];
  componentPortionCorrections: ComponentPortionCorrection[];
  componentCategoryCorrections: ComponentCategoryCorrection[];
  componentNutritionCorrections: ComponentNutritionCorrection[];
}

interface ComponentDetectionSnapshot {
  mainDish: { name, type, confidence };
  components: ComponentSnapshot[];
  totalComponents: number;
  detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid';
  processingTime: number;
}
```

**修改位置:**
- `apps/api/src/models/Feedback.ts`

### 2. 成分反饋收集器 (ComponentFeedbackCollector.ts)

**核心功能:**

#### 2.1 提交成分識別反饋
```typescript
async submitComponentFeedback(feedbackData: ComponentFeedbackData): Promise<UserFeedback>
```
- 驗證反饋資料完整性
- 自動確定反饋類型
- 轉換為標準反饋格式
- 儲存到資料庫

#### 2.2 獲取成分反饋統計
```typescript
async getComponentFeedbackStats(): Promise<ComponentFeedbackStats>
```
返回統計資訊：
- 總反饋數
- 各類錯誤數量（錯誤成分、遺漏成分、份量錯誤等）
- 最常見的錯誤模式
- 平均成分識別準確率

#### 2.3 查詢特定成分的反饋歷史
```typescript
async getComponentFeedbackHistory(componentName: string)
```
返回特定成分的：
- 總提及次數
- 錯誤識別次數
- 遺漏次數
- 份量問題
- 平均信心度
- 常見錯誤
- 改進建議

#### 2.4 分析料理類型的成分識別準確率
```typescript
async getDishTypeComponentAccuracy(dishType: string)
```
返回特定料理類型的：
- 總反饋數
- 平均檢測成分數
- 平均遺漏成分數
- 平均錯誤成分數
- 準確率
- 常見問題

**文件位置:**
- `apps/api/src/services/ComponentFeedbackCollector.ts`

### 3. 擴展 FeedbackController

**新增方法:**
- `submitComponentFeedback`: 提交成分識別反饋
- `getComponentFeedbackStats`: 獲取成分反饋統計
- `getComponentFeedbackHistory`: 獲取特定成分的反饋歷史
- `getDishTypeComponentAccuracy`: 獲取料理類型的成分識別準確率

**修改位置:**
- `apps/api/src/controllers/FeedbackController.ts`

### 4. 擴展反饋路由

**新增 API 端點:**

```
POST   /api/feedback/component
       提交成分識別反饋

GET    /api/feedback/component/stats
       獲取成分反饋統計

GET    /api/feedback/component/history/:componentName
       獲取特定成分的反饋歷史

GET    /api/feedback/component/accuracy/:dishType
       獲取料理類型的成分識別準確率
```

**修改位置:**
- `apps/api/src/routes/feedback.ts`

### 5. 文檔和示例

**創建的文檔:**

1. **COMPONENT_FEEDBACK_README.md**
   - 完整的功能說明
   - API 使用方法
   - 整合示例
   - 最佳實踐
   - 故障排除

2. **COMPONENT_FEEDBACK_QUICK_START.md**
   - 5 分鐘快速開始指南
   - 常見使用場景
   - 前端整合示例
   - 監控和分析方法

3. **ComponentFeedbackCollector.example.ts**
   - 6 個完整的使用示例
   - 涵蓋各種反饋場景
   - 可直接運行的代碼

**文件位置:**
- `apps/api/src/services/COMPONENT_FEEDBACK_README.md`
- `apps/api/src/services/COMPONENT_FEEDBACK_QUICK_START.md`
- `apps/api/src/services/ComponentFeedbackCollector.example.ts`

## 功能特性

### 1. 多維度反饋收集

支持收集以下類型的反饋：
- ✅ 成分識別錯誤（如：火腿被誤認為叉燒）
- ✅ 遺漏的成分（如：未識別到青蔥）
- ✅ 份量估計錯誤（如：雞肉份量偏低）
- ✅ 成分類別錯誤（如：海帶被錯誤分類）
- ✅ 營養資訊錯誤（如：蛋白質計算不準）

### 2. 智能分析

- **錯誤模式識別**: 自動分析常見的成分識別錯誤
- **準確率計算**: 計算整體和分類別的識別準確率
- **趨勢分析**: 追蹤特定成分的識別表現趨勢
- **改進建議生成**: 基於反饋數據自動生成改進建議

### 3. 詳細統計

提供多個維度的統計資訊：
- 按反饋類型統計
- 按料理類型統計
- 按成分統計
- 按時間趨勢統計

### 4. 易於整合

- RESTful API 設計
- 完整的 TypeScript 類型定義
- 詳細的文檔和示例
- 前端整合範例

## API 使用示例

### 提交反饋

```bash
curl -X POST http://localhost:3000/api/feedback/component \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "imageId": "img_123",
    "sessionId": "session_456",
    "recognitionResult": {...},
    "componentCorrections": {
      "incorrectComponents": [{
        "identifiedAs": "火腿",
        "actualComponent": "叉燒",
        "reason": "顏色相似但實際是叉燒"
      }],
      "missingComponents": [{
        "name": "青蔥",
        "portion": 10,
        "importance": "medium"
      }]
    }
  }'
```

### 查詢統計

```bash
# 獲取整體統計
curl -X GET http://localhost:3000/api/feedback/component/stats \
  -H "Authorization: Bearer TOKEN"

# 查詢特定成分
curl -X GET http://localhost:3000/api/feedback/component/history/雞蛋 \
  -H "Authorization: Bearer TOKEN"

# 查詢料理類型準確率
curl -X GET http://localhost:3000/api/feedback/component/accuracy/fried_rice \
  -H "Authorization: Bearer TOKEN"
```

## 數據流程

```
用戶識別結果
    ↓
用戶修正/調整
    ↓
提交反饋 (POST /api/feedback/component)
    ↓
ComponentFeedbackCollector.submitComponentFeedback()
    ↓
驗證 → 轉換 → 儲存
    ↓
FeedbackRepository.create()
    ↓
MongoDB (feedbacks collection)
    ↓
分析和統計
    ↓
改進建議
```

## 資料庫結構

### feedbacks Collection

```javascript
{
  _id: ObjectId,
  imageId: String,
  userId: String,
  sessionId: String,
  recognitionResult: {
    foods: Array,
    componentDetection: {
      mainDish: {
        name: String,
        type: String,
        confidence: Number
      },
      components: [{
        id: String,
        name: String,
        confidence: Number,
        estimatedPortion: Number,
        category: String,
        ...
      }],
      totalComponents: Number,
      detectionMethod: String
    }
  },
  userCorrection: {
    componentCorrections: {
      correctComponents: Array,
      incorrectComponents: Array,
      missingComponents: Array,
      componentPortionCorrections: Array,
      componentCategoryCorrections: Array,
      componentNutritionCorrections: Array
    }
  },
  feedbackType: [String],
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 索引

建議創建以下索引以提高查詢性能：

```javascript
db.feedbacks.createIndex({ "recognitionResult.componentDetection.mainDish.type": 1 })
db.feedbacks.createIndex({ "recognitionResult.componentDetection.components.name": 1 })
db.feedbacks.createIndex({ "userCorrection.componentCorrections.incorrectComponents.identifiedAs": 1 })
db.feedbacks.createIndex({ "userCorrection.componentCorrections.missingComponents.name": 1 })
db.feedbacks.createIndex({ createdAt: -1 })
```

## 測試建議

### 單元測試

```typescript
describe('ComponentFeedbackCollector', () => {
  test('應該成功提交成分反饋', async () => {
    const feedback = await collector.submitComponentFeedback({...});
    expect(feedback.id).toBeDefined();
    expect(feedback.feedbackType).toContain('incorrect_component');
  });

  test('應該正確計算成分準確率', async () => {
    const stats = await collector.getComponentFeedbackStats();
    expect(stats.averageComponentAccuracy).toBeGreaterThan(0);
  });

  test('應該返回特定成分的反饋歷史', async () => {
    const history = await collector.getComponentFeedbackHistory('雞蛋');
    expect(history.totalMentions).toBeGreaterThanOrEqual(0);
  });
});
```

### 整合測試

```typescript
describe('Component Feedback API', () => {
  test('POST /api/feedback/component 應該創建反饋', async () => {
    const response = await request(app)
      .post('/api/feedback/component')
      .set('Authorization', `Bearer ${token}`)
      .send(feedbackData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/feedback/component/stats 應該返回統計', async () => {
    const response = await request(app)
      .get('/api/feedback/component/stats')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('totalFeedbacks');
  });
});
```

## 性能考量

### 快取策略

- 統計數據快取 30 分鐘
- 成分歷史快取 1 小時
- 料理類型準確率快取 1 小時

### 查詢優化

- 使用 MongoDB 聚合管道進行複雜查詢
- 限制返回結果數量（預設 50-100）
- 使用索引加速常見查詢

### 批量處理

- 支持批量提交反饋（未來擴展）
- 定期批量分析反饋數據
- 異步處理統計計算

## 監控指標

### 關鍵指標

1. **反饋提交率**: 識別次數 / 反饋次數
2. **平均成分準確率**: 正確成分 / 總成分
3. **最常見錯誤**: Top 10 錯誤模式
4. **反饋處理時間**: 從提交到審核的時間

### 監控方法

```bash
# 每日統計
curl -X GET http://localhost:3000/api/feedback/component/stats | \
  jq '{
    日期: now | strftime("%Y-%m-%d"),
    總反饋: .data.totalFeedbacks,
    準確率: .data.averageComponentAccuracy
  }'

# 每週報告
for day in {0..6}; do
  date=$(date -d "$day days ago" +%Y-%m-%d)
  echo "=== $date ==="
  # 查詢該日期的統計...
done
```

## 未來擴展

### Phase 1 (短期)
- [ ] 添加反饋獎勵機制
- [ ] 實現反饋審核工作流
- [ ] 添加反饋優先級排序

### Phase 2 (中期)
- [ ] 視覺化反饋儀表板
- [ ] 自動化改進流程
- [ ] 機器學習模型訓練整合

### Phase 3 (長期)
- [ ] 多語言反饋支持
- [ ] 社群反饋協作
- [ ] 預測性分析

## 相關文件

- [Feedback Model](../../models/Feedback.ts)
- [Feedback Repository](../../repositories/FeedbackRepository.ts)
- [Component Detection Types](../../types/ComponentDetection.ts)
- [Component Detection Engine](../../services/ComponentDetectionEngine.ts)
- [Feedback Controller](../../controllers/FeedbackController.ts)
- [Feedback Routes](../../routes/feedback.ts)

## 總結

成功實現了完整的成分識別反饋收集系統，包括：

✅ 擴展反饋模型以支持成分識別反饋
✅ 實現 ComponentFeedbackCollector 服務
✅ 添加 4 個新的 API 端點
✅ 創建完整的文檔和示例
✅ 支持多維度反饋收集和分析
✅ 提供智能改進建議生成

系統已準備好用於生產環境，可以開始收集用戶反饋並持續改進成分識別準確率。

## 下一步

1. 部署到生產環境
2. 在前端添加反饋界面
3. 設置監控和告警
4. 定期分析反饋數據
5. 根據反饋優化識別系統
