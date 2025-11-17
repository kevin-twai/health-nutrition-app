# 成分識別性能監控快速參考

## 快速開始

### 1. 基本使用模式

```typescript
import { foodRecognitionPerformanceMonitor } from './FoodRecognitionPerformanceMonitor';

// 生成唯一 session ID
const sessionId = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 開始監控
foodRecognitionPerformanceMonitor.startComponentDetectionSession(
  sessionId,
  '蛋炒飯',      // 料理名稱
  'fried_rice',  // 料理類型
  'user-123'     // 用戶 ID（可選）
);

// 記錄各階段
const start = Date.now();
// ... 執行操作 ...
const end = Date.now();

foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId,
  'vision_api',  // 階段名稱
  start,
  end,
  1,            // 處理的項目數
  true          // 是否成功
);

// 結束監控
foodRecognitionPerformanceMonitor.endComponentDetectionSession(
  sessionId,
  5,            // 識別的成分數
  0.85,         // 平均信心度
  'hybrid',     // 檢測方法
  true          // 是否成功
);
```

## 四個監控階段

### Vision API
```typescript
const visionApiStart = Date.now();
// Vision API 調用
const visionApiEnd = Date.now();

foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId, 'vision_api', visionApiStart, visionApiEnd, 1, true
);
```

### 知識庫查詢
```typescript
const kbStart = Date.now();
// 知識庫查詢
const kbEnd = Date.now();

foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId, 'knowledge_base', kbStart, kbEnd, 5, true
);

// 如果使用了緩存
foodRecognitionPerformanceMonitor.recordComponentKnowledgeBaseCacheHit(sessionId);
```

### 營養計算
```typescript
const nutritionStart = Date.now();
// 營養計算
const nutritionEnd = Date.now();

foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId, 'nutrition_calculation', nutritionStart, nutritionEnd, 5, true
);
```

### 驗證
```typescript
const validationStart = Date.now();
// 驗證
const validationEnd = Date.now();

foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId, 'validation', validationStart, validationEnd, 5, true
);
```

## 錯誤處理

```typescript
try {
  // ... 成分識別邏輯 ...
  
  foodRecognitionPerformanceMonitor.endComponentDetectionSession(
    sessionId, componentsCount, avgConfidence, 'hybrid', true
  );
} catch (error) {
  // 記錄失敗
  foodRecognitionPerformanceMonitor.endComponentDetectionSession(
    sessionId, 0, 0, 'vision_api', false, error.message
  );
  throw error;
}
```

## 獲取統計數據

```typescript
// 最近 5 分鐘的統計
const stats = foodRecognitionPerformanceMonitor.getComponentDetectionStatistics(300000);

// 關鍵指標
console.log('總會話:', stats.totalSessions);
console.log('成功率:', (stats.successfulSessions / stats.totalSessions * 100).toFixed(1) + '%');
console.log('平均時間:', stats.averageDuration.toFixed(0) + 'ms');
console.log('平均成分數:', stats.averageComponentsDetected.toFixed(1));
console.log('Vision API 成功率:', (stats.visionApiSuccessRate * 100).toFixed(1) + '%');
console.log('緩存命中率:', (stats.knowledgeBaseCacheHitRate * 100).toFixed(1) + '%');
```

## 生成報告

```typescript
// 成分識別報告
const report = foodRecognitionPerformanceMonitor.generateComponentDetectionReport(300000);
console.log(report);

// 完整報告
const fullReport = foodRecognitionPerformanceMonitor.generatePerformanceReport(300000);
console.log(fullReport);
```

## 獲取最慢會話

```typescript
const slowest = foodRecognitionPerformanceMonitor.getSlowestComponentDetectionSessions(10);

slowest.forEach(session => {
  console.log(`${session.dishName}: ${session.totalDuration}ms`);
  console.log(`  Vision API: ${session.visionApiDuration}ms`);
  console.log(`  知識庫: ${session.knowledgeBaseDuration}ms`);
  console.log(`  營養計算: ${session.nutritionCalculationDuration}ms`);
});
```

## 性能閾值

| 階段 | 閾值 | 觸發警告 |
|------|------|----------|
| Vision API | 3000ms | ⚠️ |
| 知識庫查詢 | 500ms | ⚠️ |
| 營養計算 | 1000ms | ⚠️ |
| 驗證 | 500ms | ⚠️ |
| 總時間 | 8000ms | ⚠️ |

## 檢測方法

- `'vision_api'`: 僅使用 Vision API
- `'knowledge_base'`: 僅使用知識庫
- `'hybrid'`: 混合使用（推薦）

## 常見模式

### 完整流程
```typescript
const sessionId = generateSessionId();

foodRecognitionPerformanceMonitor.startComponentDetectionSession(
  sessionId, dishName, dishType, userId
);

try {
  // 1. Vision API
  const visionResult = await measureStage(sessionId, 'vision_api', async () => {
    return await callVisionApi();
  });

  // 2. 知識庫
  const enriched = await measureStage(sessionId, 'knowledge_base', async () => {
    return await enrichWithKB(visionResult);
  });

  // 3. 營養計算
  const withNutrition = await measureStage(sessionId, 'nutrition_calculation', async () => {
    return await calculateNutrition(enriched);
  });

  // 4. 驗證
  const validated = await measureStage(sessionId, 'validation', async () => {
    return await validate(withNutrition);
  });

  foodRecognitionPerformanceMonitor.endComponentDetectionSession(
    sessionId, validated.length, avgConfidence, 'hybrid', true
  );
} catch (error) {
  foodRecognitionPerformanceMonitor.endComponentDetectionSession(
    sessionId, 0, 0, 'hybrid', false, error.message
  );
}
```

### 輔助函數
```typescript
async function measureStage<T>(
  sessionId: string,
  stageName: 'vision_api' | 'knowledge_base' | 'nutrition_calculation' | 'validation',
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const end = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId, stageName, start, end, 1, true
    );
    
    return result;
  } catch (error) {
    const end = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId, stageName, start, end, 0, false, error.message
    );
    
    throw error;
  }
}
```

## 時間窗口

常用時間窗口值：

- `60000` = 1 分鐘
- `300000` = 5 分鐘（默認）
- `600000` = 10 分鐘
- `1800000` = 30 分鐘
- `3600000` = 1 小時

## 最佳實踐

✅ **DO**
- 始終記錄所有四個階段
- 使用唯一的 session ID
- 在 catch 塊中記錄失敗
- 記錄緩存命中
- 定期檢查性能報告

❌ **DON'T**
- 不要重複使用 session ID
- 不要忘記調用 endComponentDetectionSession
- 不要在生產環境中記錄過多詳細信息
- 不要阻塞主要業務邏輯

## 調試技巧

### 查看當前活動會話
```typescript
// 監控器內部有 currentComponentSessions Map
// 可以檢查是否有未完成的會話
```

### 檢查慢會話
```typescript
const slowest = foodRecognitionPerformanceMonitor.getSlowestComponentDetectionSessions(5);
// 分析最慢的會話找出瓶頸
```

### 分析階段耗時
```typescript
const stats = foodRecognitionPerformanceMonitor.getComponentDetectionStatistics(300000);

// 計算各階段佔比
const total = stats.averageDuration;
console.log('Vision API:', (stats.averageVisionApiDuration / total * 100).toFixed(1) + '%');
console.log('知識庫:', (stats.averageKnowledgeBaseDuration / total * 100).toFixed(1) + '%');
console.log('營養計算:', (stats.averageNutritionCalculationDuration / total * 100).toFixed(1) + '%');
console.log('驗證:', (stats.averageValidationDuration / total * 100).toFixed(1) + '%');
```

## 相關文件

- 詳細文檔: `COMPONENT_PERFORMANCE_MONITORING_README.md`
- 範例代碼: `ComponentDetectionEngine.performance.example.ts`
- 實施總結: `.kiro/specs/asian-cuisine-component-detection/TASK_18_IMPLEMENTATION_SUMMARY.md`
