# 成分識別性能監控 (Component Detection Performance Monitoring)

## 概述

成分識別性能監控擴展了現有的 `FoodRecognitionPerformanceMonitor`，專門用於追蹤和分析成分識別功能的性能指標。

## 功能特性

### 1. 會話追蹤
- 追蹤完整的成分識別會話
- 記錄各個階段的執行時間
- 監控 API 調用和知識庫查詢

### 2. 階段性能監控
監控以下四個主要階段：
- **Vision API**: OpenAI Vision API 調用時間
- **知識庫查詢**: 從知識庫獲取成分資訊的時間
- **營養計算**: 計算成分營養值的時間
- **驗證**: 驗證識別結果的時間

### 3. 統計分析
- 成功率統計
- 平均處理時間
- 各階段耗時分佈
- 檢測方法分佈（Vision API、知識庫、混合）
- 料理類型分佈

### 4. 性能報告
- 生成詳細的性能報告
- 識別慢會話（>8秒）
- 追蹤緩存命中率
- 監控 API 成功率

## 使用方法

### 基本使用

```typescript
import { foodRecognitionPerformanceMonitor } from '../services/FoodRecognitionPerformanceMonitor';

// 1. 開始成分識別會話
const sessionId = 'unique-session-id';
foodRecognitionPerformanceMonitor.startComponentDetectionSession(
  sessionId,
  '蛋炒飯',
  'fried_rice',
  'user-123'
);

// 2. 記錄 Vision API 階段
const visionApiStart = Date.now();
// ... Vision API 調用 ...
const visionApiEnd = Date.now();
foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId,
  'vision_api',
  visionApiStart,
  visionApiEnd,
  1, // API 調用次數
  true, // 成功
);

// 3. 記錄知識庫查詢階段
const kbStart = Date.now();
// ... 知識庫查詢 ...
const kbEnd = Date.now();
foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId,
  'knowledge_base',
  kbStart,
  kbEnd,
  5, // 查詢的項目數
  true
);

// 記錄緩存命中
foodRecognitionPerformanceMonitor.recordComponentKnowledgeBaseCacheHit(sessionId);

// 4. 記錄營養計算階段
const nutritionStart = Date.now();
// ... 營養計算 ...
const nutritionEnd = Date.now();
foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId,
  'nutrition_calculation',
  nutritionStart,
  nutritionEnd,
  5, // 計算的成分數
  true
);

// 5. 記錄驗證階段
const validationStart = Date.now();
// ... 驗證 ...
const validationEnd = Date.now();
foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
  sessionId,
  'validation',
  validationStart,
  validationEnd,
  5, // 驗證的成分數
  true
);

// 6. 結束會話
foodRecognitionPerformanceMonitor.endComponentDetectionSession(
  sessionId,
  5, // 識別的成分數
  0.85, // 平均信心度
  'hybrid', // 檢測方法
  true // 成功
);
```

### 在 ComponentDetectionEngine 中整合

```typescript
export class ComponentDetectionEngine {
  async detectComponents(
    image: Buffer,
    dishName: string,
    dishType?: DishType
  ): Promise<ComponentDetectionResult> {
    const sessionId = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 開始監控
    foodRecognitionPerformanceMonitor.startComponentDetectionSession(
      sessionId,
      dishName,
      dishType || DishType.UNKNOWN
    );

    try {
      // Vision API 階段
      const visionApiStart = Date.now();
      const visionResult = await this.callVisionApi(image, dishName);
      const visionApiEnd = Date.now();
      
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId,
        'vision_api',
        visionApiStart,
        visionApiEnd,
        1,
        true
      );

      // 知識庫階段
      const kbStart = Date.now();
      const enrichedComponents = await this.enrichWithKnowledgeBase(
        visionResult.components,
        dishName
      );
      const kbEnd = Date.now();
      
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId,
        'knowledge_base',
        kbStart,
        kbEnd,
        enrichedComponents.length,
        true
      );

      // 營養計算階段
      const nutritionStart = Date.now();
      const componentsWithNutrition = await this.calculateNutrition(enrichedComponents);
      const nutritionEnd = Date.now();
      
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId,
        'nutrition_calculation',
        nutritionStart,
        nutritionEnd,
        componentsWithNutrition.length,
        true
      );

      // 驗證階段
      const validationStart = Date.now();
      const validatedComponents = this.validateComponents(componentsWithNutrition, dishType);
      const validationEnd = Date.now();
      
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId,
        'validation',
        validationStart,
        validationEnd,
        validatedComponents.length,
        true
      );

      // 計算平均信心度
      const avgConfidence = validatedComponents.reduce((sum, c) => sum + c.confidence, 0) / validatedComponents.length;

      // 結束監控
      foodRecognitionPerformanceMonitor.endComponentDetectionSession(
        sessionId,
        validatedComponents.length,
        avgConfidence,
        'hybrid',
        true
      );

      return {
        components: validatedComponents,
        // ... 其他結果
      };
    } catch (error) {
      // 記錄失敗
      foodRecognitionPerformanceMonitor.endComponentDetectionSession(
        sessionId,
        0,
        0,
        'vision_api',
        false,
        error.message
      );
      throw error;
    }
  }
}
```

## 獲取統計數據

### 獲取成分識別統計

```typescript
// 獲取最近 5 分鐘的統計
const stats = foodRecognitionPerformanceMonitor.getComponentDetectionStatistics(300000);

console.log('總會話數:', stats.totalSessions);
console.log('成功率:', (stats.successfulSessions / stats.totalSessions * 100).toFixed(1) + '%');
console.log('平均處理時間:', stats.averageDuration.toFixed(0) + 'ms');
console.log('平均識別成分數:', stats.averageComponentsDetected.toFixed(1));
console.log('Vision API 成功率:', (stats.visionApiSuccessRate * 100).toFixed(1) + '%');
console.log('知識庫緩存命中率:', (stats.knowledgeBaseCacheHitRate * 100).toFixed(1) + '%');

// 各階段耗時
console.log('Vision API 平均耗時:', stats.averageVisionApiDuration.toFixed(0) + 'ms');
console.log('知識庫平均耗時:', stats.averageKnowledgeBaseDuration.toFixed(0) + 'ms');
console.log('營養計算平均耗時:', stats.averageNutritionCalculationDuration.toFixed(0) + 'ms');
console.log('驗證平均耗時:', stats.averageValidationDuration.toFixed(0) + 'ms');

// 檢測方法分佈
console.log('Vision API:', stats.detectionMethodDistribution.vision_api);
console.log('知識庫:', stats.detectionMethodDistribution.knowledge_base);
console.log('混合:', stats.detectionMethodDistribution.hybrid);

// 料理類型分佈
stats.dishTypeDistribution.forEach((count, type) => {
  console.log(`${type}: ${count}`);
});
```

### 生成性能報告

```typescript
// 生成成分識別專用報告
const componentReport = foodRecognitionPerformanceMonitor.generateComponentDetectionReport(300000);
console.log(componentReport);

// 生成完整性能報告（包含成分識別統計）
const fullReport = foodRecognitionPerformanceMonitor.generatePerformanceReport(300000);
console.log(fullReport);
```

### 獲取最慢的會話

```typescript
// 獲取最慢的 10 個成分識別會話
const slowestSessions = foodRecognitionPerformanceMonitor.getSlowestComponentDetectionSessions(10);

slowestSessions.forEach((session, index) => {
  console.log(`${index + 1}. ${session.dishName} (${session.dishType})`);
  console.log(`   總時間: ${session.totalDuration}ms`);
  console.log(`   Vision API: ${session.visionApiDuration}ms`);
  console.log(`   知識庫: ${session.knowledgeBaseDuration}ms`);
  console.log(`   營養計算: ${session.nutritionCalculationDuration}ms`);
  console.log(`   成分數: ${session.componentsDetected}`);
});
```

## 性能閾值

系統會自動檢測並警告超過以下閾值的操作：

- **Vision API**: > 3000ms
- **知識庫查詢**: > 500ms
- **營養計算**: > 1000ms
- **驗證**: > 500ms
- **總會話時間**: > 8000ms

## 數據清理

- 自動清理 30 分鐘前的舊數據
- 保持最多 1000 條歷史記錄
- 每 10 分鐘執行一次清理

## API 端點

可以通過 API 端點訪問性能數據：

```
GET /api/monitoring/component-detection/statistics?timeWindow=300000
GET /api/monitoring/component-detection/report?timeWindow=300000
GET /api/monitoring/component-detection/slowest?limit=10
```

## 最佳實踐

1. **始終記錄所有階段**: 確保記錄 Vision API、知識庫、營養計算和驗證階段
2. **記錄緩存命中**: 當使用緩存時，調用 `recordComponentKnowledgeBaseCacheHit()`
3. **處理錯誤**: 在 catch 塊中調用 `endComponentDetectionSession()` 並標記為失敗
4. **使用唯一 sessionId**: 確保每個會話有唯一的 ID
5. **定期檢查報告**: 定期生成和檢查性能報告以識別瓶頸

## 監控指標說明

### 關鍵指標

- **totalDuration**: 完整成分識別的總時間
- **visionApiDuration**: Vision API 調用的總時間
- **knowledgeBaseDuration**: 知識庫查詢的總時間
- **nutritionCalculationDuration**: 營養計算的總時間
- **validationDuration**: 驗證的總時間
- **componentsDetected**: 識別的成分數量
- **averageConfidence**: 平均信心度
- **detectionMethod**: 使用的檢測方法（vision_api、knowledge_base、hybrid）

### 性能目標

- 簡單料理（1-3 成分）: < 3 秒
- 中等複雜料理（4-6 成分）: < 5 秒
- 複雜料理（7+ 成分）: < 8 秒
- 知識庫查詢: < 100ms
- 緩存命中率: > 60%

## 故障排除

### 慢會話診斷

如果發現慢會話，檢查：
1. Vision API 是否響應緩慢
2. 知識庫查詢是否未使用緩存
3. 營養計算是否處理過多成分
4. 是否有網絡延遲

### 低緩存命中率

如果緩存命中率低：
1. 檢查緩存配置
2. 確認 TTL 設置合理
3. 檢查料理名稱是否標準化
4. 考慮增加緩存容量

## 相關文件

- `FoodRecognitionPerformanceMonitor.ts`: 主要監控器實現
- `ComponentDetectionEngine.ts`: 成分識別引擎
- `RecognitionResultCache.ts`: 緩存實現
- `ComponentNutritionCalculator.ts`: 營養計算器
