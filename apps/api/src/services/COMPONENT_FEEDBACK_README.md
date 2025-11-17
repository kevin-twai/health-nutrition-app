# 成分識別反饋系統

## 概述

成分識別反饋系統專門用於收集和分析用戶對亞洲料理成分識別結果的反饋，幫助持續改進識別準確率。

## 功能特性

### 1. 反饋類型

系統支持以下成分識別反饋類型：

- **INCORRECT_COMPONENT**: 成分識別錯誤
- **MISSING_COMPONENT**: 遺漏的成分
- **WRONG_COMPONENT_PORTION**: 成分份量錯誤
- **WRONG_COMPONENT_CATEGORY**: 成分類別錯誤
- **COMPONENT_NUTRITION_ERROR**: 成分營養資訊錯誤

### 2. 反饋資料結構

```typescript
interface ComponentFeedbackData {
  imageId: string;              // 圖片ID
  userId?: string;              // 用戶ID（可選）
  sessionId: string;            // 會話ID
  recognitionResult: ComponentDetectionResult;  // 識別結果
  componentCorrections: {
    correctComponents: CorrectComponent[];           // 正確的成分
    incorrectComponents: IncorrectComponent[];       // 錯誤的成分
    missingComponents: MissingComponent[];           // 遺漏的成分
    componentPortionCorrections: ComponentPortionCorrection[];  // 份量修正
    componentCategoryCorrections: ComponentCategoryCorrection[]; // 類別修正
    componentNutritionCorrections: ComponentNutritionCorrection[]; // 營養修正
  };
  additionalComments?: string;  // 附加評論
}
```

## 使用方法

### 1. 提交成分識別反饋

```typescript
import { ComponentFeedbackCollector } from './ComponentFeedbackCollector';
import { FeedbackRepository } from '../repositories/FeedbackRepository';

// 初始化
const feedbackRepository = new FeedbackRepository(db, redis);
const componentFeedbackCollector = new ComponentFeedbackCollector(feedbackRepository);

// 提交反饋
const feedback = await componentFeedbackCollector.submitComponentFeedback({
  imageId: 'img_123',
  userId: 'user_456',
  sessionId: 'session_789',
  recognitionResult: componentDetectionResult,
  componentCorrections: {
    correctComponents: [
      {
        id: 'comp_1',
        name: '白飯',
        portion: 200,
        category: 'grain'
      }
    ],
    incorrectComponents: [
      {
        identifiedAs: '炒蛋',
        actualComponent: '蒸蛋',
        reason: '烹飪方式識別錯誤',
        identifiedPortion: 50,
        actualPortion: 80
      }
    ],
    missingComponents: [
      {
        name: '青蔥',
        portion: 10,
        category: 'garnish',
        importance: 'medium',
        reason: '圖片中可見但未識別'
      }
    ],
    componentPortionCorrections: [
      {
        componentId: 'comp_2',
        componentName: '雞肉',
        identifiedPortion: 100,
        actualPortion: 150,
        reason: '份量估計偏低'
      }
    ],
    componentCategoryCorrections: [],
    componentNutritionCorrections: []
  },
  additionalComments: '整體識別不錯，但份量估計需要改進'
});

console.log('反饋已提交:', feedback.id);
```

### 2. 獲取成分反饋統計

```typescript
const stats = await componentFeedbackCollector.getComponentFeedbackStats();

console.log('成分反饋統計:', {
  總反饋數: stats.totalFeedbacks,
  錯誤成分: stats.incorrectComponents,
  遺漏成分: stats.missingComponents,
  份量錯誤: stats.portionErrors,
  類別錯誤: stats.categoryErrors,
  營養錯誤: stats.nutritionErrors,
  平均準確率: `${stats.averageComponentAccuracy.toFixed(2)}%`
});

// 查看最常見的錯誤
stats.mostCommonMistakes.forEach(mistake => {
  console.log(`${mistake.incorrectComponent} → ${mistake.correctComponent}: ${mistake.frequency}次`);
});
```

### 3. 查詢特定成分的反饋歷史

```typescript
const history = await componentFeedbackCollector.getComponentFeedbackHistory('雞蛋');

console.log('雞蛋的反饋歷史:', {
  總提及次數: history.totalMentions,
  錯誤識別次數: history.incorrectIdentifications,
  遺漏次數: history.missingOccurrences,
  份量問題: history.portionIssues,
  平均信心度: history.averageConfidence,
  常見錯誤: history.commonMistakes,
  改進建議: history.suggestions
});
```

### 4. 分析料理類型的成分識別準確率

```typescript
const accuracy = await componentFeedbackCollector.getDishTypeComponentAccuracy('fried_rice');

console.log('炒飯類成分識別準確率:', {
  料理類型: accuracy.dishType,
  總反饋數: accuracy.totalFeedbacks,
  平均檢測成分數: accuracy.averageComponentsDetected,
  平均遺漏成分數: accuracy.averageComponentsMissing,
  平均錯誤成分數: accuracy.averageComponentsIncorrect,
  準確率: `${accuracy.accuracyRate.toFixed(2)}%`,
  常見問題: accuracy.commonIssues
});
```

## API 端點

### 提交成分反饋

```http
POST /api/feedback/component
Content-Type: application/json
Authorization: Bearer <token>

{
  "imageId": "img_123",
  "sessionId": "session_789",
  "recognitionResult": { ... },
  "componentCorrections": {
    "incorrectComponents": [
      {
        "identifiedAs": "炒蛋",
        "actualComponent": "蒸蛋",
        "reason": "烹飪方式錯誤"
      }
    ],
    "missingComponents": [
      {
        "name": "青蔥",
        "portion": 10,
        "importance": "medium"
      }
    ]
  },
  "additionalComments": "整體不錯"
}
```

### 獲取成分反饋統計

```http
GET /api/feedback/component/stats
Authorization: Bearer <token>
```

### 查詢成分反饋歷史

```http
GET /api/feedback/component/history/:componentName
Authorization: Bearer <token>
```

### 查詢料理類型準確率

```http
GET /api/feedback/component/accuracy/:dishType
Authorization: Bearer <token>
```

## 反饋分析

### 錯誤模式分析

系統會自動分析常見的成分識別錯誤模式：

```typescript
interface ComponentMistakePattern {
  incorrectComponent: string;    // 錯誤識別的成分
  correctComponent: string;      // 正確的成分
  frequency: number;             // 出現頻率
  dishTypes: string[];           // 相關料理類型
  averageConfidence: number;     // 平均信心度
  lastOccurrence: Date;          // 最後出現時間
}
```

### 改進建議生成

基於反饋數據，系統會自動生成改進建議：

1. **高信心度錯誤**: 建議優化 prompt 中的視覺特徵描述
2. **低信心度錯誤**: 建議在知識庫中添加更多參考資料
3. **頻繁遺漏**: 建議在料理-成分映射中標記為常見成分
4. **份量估計不準**: 建議調整知識庫中的典型份量範圍

## 最佳實踐

### 1. 反饋提交時機

- 用戶確認識別結果後立即提交
- 用戶手動調整成分後提交
- 用戶對識別結果不滿意時提交

### 2. 反饋資料完整性

- 盡可能提供詳細的修正原因
- 標記遺漏成分的重要程度
- 提供準確的份量修正值

### 3. 反饋分析頻率

- 每日分析新增反饋
- 每週生成統計報告
- 每月執行持續改進流程

### 4. 隱私保護

- 不儲存用戶的原始圖片（除非用戶同意）
- 匿名化統計數據
- 遵守數據保護法規

## 整合示例

### 在 PhotoController 中整合

```typescript
import { ComponentFeedbackCollector } from '../services/ComponentFeedbackCollector';

class PhotoController {
  private componentFeedbackCollector: ComponentFeedbackCollector;

  async recognizeWithComponents(req: Request, res: Response) {
    // ... 執行成分識別 ...

    // 返回結果時提供反饋端點
    res.json({
      success: true,
      data: componentDetectionResult,
      feedbackUrl: `/api/feedback/component?sessionId=${sessionId}`
    });
  }

  async submitComponentFeedback(req: Request, res: Response) {
    try {
      const feedback = await this.componentFeedbackCollector.submitComponentFeedback({
        imageId: req.body.imageId,
        userId: req.user?.id,
        sessionId: req.body.sessionId,
        recognitionResult: req.body.recognitionResult,
        componentCorrections: req.body.componentCorrections,
        additionalComments: req.body.additionalComments
      });

      res.status(201).json({
        success: true,
        message: '反饋提交成功',
        data: feedback
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}
```

## 監控和維護

### 關鍵指標

- 反饋提交率
- 平均成分識別準確率
- 最常見的錯誤類型
- 反饋處理時間

### 定期任務

1. 每日檢查高優先級反饋
2. 每週分析錯誤模式
3. 每月更新知識庫
4. 每季度評估改進效果

## 故障排除

### 常見問題

1. **反饋提交失敗**
   - 檢查資料格式是否正確
   - 確認會話ID是否有效
   - 驗證用戶權限

2. **統計數據不準確**
   - 清除快取後重新計算
   - 檢查資料庫索引
   - 驗證聚合查詢邏輯

3. **性能問題**
   - 啟用快取機制
   - 優化資料庫查詢
   - 使用批量處理

## 未來擴展

- [ ] 機器學習模型訓練整合
- [ ] 自動化改進流程
- [ ] 視覺化反饋儀表板
- [ ] 多語言反饋支持
- [ ] 反饋獎勵機制

## 相關文件

- [Feedback Model](../models/Feedback.ts)
- [Feedback Repository](../repositories/FeedbackRepository.ts)
- [Component Detection Types](../types/ComponentDetection.ts)
- [Component Detection Engine](./ComponentDetectionEngine.ts)
