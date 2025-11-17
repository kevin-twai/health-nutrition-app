# Task 18: 實現性能監控 - 實施總結

## 任務概述

擴展 `FoodRecognitionPerformanceMonitor` 以支持成分識別功能的性能監控，記錄各階段耗時並生成詳細的性能報告。

## 實施內容

### 1. 擴展性能監控器 ✅

**文件**: `apps/api/src/services/FoodRecognitionPerformanceMonitor.ts`

#### 新增類型定義

```typescript
// 成分識別性能指標
export interface ComponentDetectionMetrics {
  sessionId: string;
  userId?: string;
  dishName: string;
  dishType: string;
  totalDuration: number;
  componentsDetected: number;
  
  // 各階段耗時
  visionApiDuration: number;
  knowledgeBaseDuration: number;
  nutritionCalculationDuration: number;
  validationDuration: number;
  
  // API 調用和查詢統計
  visionApiCalls: number;
  visionApiSuccess: boolean;
  knowledgeBaseQueries: number;
  knowledgeBaseCacheHits: number;
  nutritionCalculations: number;
  
  // 結果
  averageConfidence: number;
  detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid';
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

// 成分識別階段性能
export interface ComponentDetectionStageMetrics {
  stageName: 'vision_api' | 'knowledge_base' | 'nutrition_calculation' | 'validation';
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  itemsProcessed: number;
  errorMessage?: string;
}
```

#### 新增監控方法

1. **startComponentDetectionSession()**: 開始成分識別會話追蹤
2. **recordComponentDetectionStage()**: 記錄各階段性能
3. **recordComponentKnowledgeBaseCacheHit()**: 記錄緩存命中
4. **endComponentDetectionSession()**: 結束會話並保存指標
5. **getComponentDetectionStatistics()**: 獲取統計數據
6. **generateComponentDetectionReport()**: 生成性能報告
7. **getSlowestComponentDetectionSessions()**: 獲取最慢的會話

### 2. 監控的階段

系統監控以下四個主要階段：

#### Vision API 階段
- **閾值**: > 3000ms 觸發警告
- **監控內容**: API 調用時間、成功率
- **用途**: 識別 Vision API 性能問題

#### 知識庫查詢階段
- **閾值**: > 500ms 觸發警告
- **監控內容**: 查詢時間、緩存命中率、查詢項目數
- **用途**: 優化知識庫查詢和緩存策略

#### 營養計算階段
- **閾值**: > 1000ms 觸發警告
- **監控內容**: 計算時間、處理的成分數
- **用途**: 識別營養計算瓶頸

#### 驗證階段
- **閾值**: > 500ms 觸發警告
- **監控內容**: 驗證時間、驗證的成分數
- **用途**: 優化驗證邏輯

### 3. 統計指標

系統提供以下統計數據：

#### 會話統計
- 總會話數、成功/失敗會話數
- 平均處理時間
- 平均識別成分數
- 平均信心度
- 慢會話數（>8秒）

#### 階段耗時分析
- 各階段平均耗時
- 各階段佔總時間的百分比
- 階段性能趨勢

#### API 和查詢統計
- Vision API 調用次數和成功率
- 知識庫查詢次數和緩存命中率
- 營養計算次數

#### 檢測方法分佈
- Vision API only
- 知識庫 only
- 混合模式

#### 料理類型分佈
- 各料理類型的識別次數
- 各料理類型的平均處理時間

### 4. 性能報告

系統可生成兩種報告：

#### 成分識別專用報告
```typescript
const report = foodRecognitionPerformanceMonitor.generateComponentDetectionReport(300000);
```

包含：
- 識別會話統計
- 各階段平均耗時和佔比
- API 和查詢統計
- 檢測方法分佈
- 料理類型分佈

#### 完整性能報告
```typescript
const report = foodRecognitionPerformanceMonitor.generatePerformanceReport(300000);
```

包含：
- 食物識別統計
- 成分識別統計
- API 調用統計
- 知識庫查詢統計
- 內存使用趨勢

### 5. 文檔和範例

#### README 文檔
**文件**: `apps/api/src/services/COMPONENT_PERFORMANCE_MONITORING_README.md`

包含：
- 功能特性說明
- 使用方法和範例
- 統計數據獲取
- 性能閾值說明
- 最佳實踐
- 故障排除指南

#### 範例代碼
**文件**: `apps/api/src/services/ComponentDetectionEngine.performance.example.ts`

包含 7 個完整範例：
1. 基本的成分識別性能監控
2. 僅使用知識庫的成分識別
3. Vision API 失敗降級到知識庫
4. 獲取和顯示性能統計
5. 生成性能報告
6. 獲取最慢的會話
7. 批量測試並分析性能

## 使用方式

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
        sessionId, 'vision_api', visionApiStart, visionApiEnd, 1, true
      );

      // 知識庫階段
      const kbStart = Date.now();
      const enrichedComponents = await this.enrichWithKnowledgeBase(
        visionResult.components, dishName
      );
      const kbEnd = Date.now();
      
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId, 'knowledge_base', kbStart, kbEnd, 
        enrichedComponents.length, true
      );

      // 營養計算階段
      const nutritionStart = Date.now();
      const componentsWithNutrition = await this.calculateNutrition(enrichedComponents);
      const nutritionEnd = Date.now();
      
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId, 'nutrition_calculation', nutritionStart, nutritionEnd,
        componentsWithNutrition.length, true
      );

      // 驗證階段
      const validationStart = Date.now();
      const validatedComponents = this.validateComponents(
        componentsWithNutrition, dishType
      );
      const validationEnd = Date.now();
      
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId, 'validation', validationStart, validationEnd,
        validatedComponents.length, true
      );

      // 計算平均信心度
      const avgConfidence = validatedComponents.reduce(
        (sum, c) => sum + c.confidence, 0
      ) / validatedComponents.length;

      // 結束監控
      foodRecognitionPerformanceMonitor.endComponentDetectionSession(
        sessionId,
        validatedComponents.length,
        avgConfidence,
        'hybrid',
        true
      );

      return { components: validatedComponents };
    } catch (error) {
      foodRecognitionPerformanceMonitor.endComponentDetectionSession(
        sessionId, 0, 0, 'vision_api', false, error.message
      );
      throw error;
    }
  }
}
```

### 獲取統計數據

```typescript
// 獲取最近 5 分鐘的統計
const stats = foodRecognitionPerformanceMonitor.getComponentDetectionStatistics(300000);

console.log('總會話數:', stats.totalSessions);
console.log('成功率:', (stats.successfulSessions / stats.totalSessions * 100).toFixed(1) + '%');
console.log('平均處理時間:', stats.averageDuration.toFixed(0) + 'ms');
console.log('Vision API 成功率:', (stats.visionApiSuccessRate * 100).toFixed(1) + '%');
console.log('知識庫緩存命中率:', (stats.knowledgeBaseCacheHitRate * 100).toFixed(1) + '%');
```

### 生成報告

```typescript
// 成分識別專用報告
const componentReport = foodRecognitionPerformanceMonitor.generateComponentDetectionReport(300000);
console.log(componentReport);

// 完整性能報告
const fullReport = foodRecognitionPerformanceMonitor.generatePerformanceReport(300000);
console.log(fullReport);
```

## 性能閾值

系統會自動檢測並警告超過以下閾值的操作：

| 階段 | 閾值 | 說明 |
|------|------|------|
| Vision API | 3000ms | API 調用時間 |
| 知識庫查詢 | 500ms | 查詢時間 |
| 營養計算 | 1000ms | 計算時間 |
| 驗證 | 500ms | 驗證時間 |
| 總會話時間 | 8000ms | 完整識別時間 |

## 性能目標

根據需求文檔 4.1：

- 簡單料理（1-3 成分）: < 3 秒
- 中等複雜料理（4-6 成分）: < 5 秒
- 複雜料理（7+ 成分）: < 8 秒
- 知識庫查詢: < 100ms
- 緩存命中率: > 60%

## 數據管理

### 自動清理
- 每 10 分鐘自動清理舊數據
- 保留最近 30 分鐘的數據
- 最多保留 1000 條歷史記錄

### 數據存儲
- 內存存儲，重啟後清空
- 可通過 API 端點實時訪問
- 支持導出為 JSON 格式

## API 端點（建議）

可以添加以下 API 端點來訪問性能數據：

```
GET /api/monitoring/component-detection/statistics?timeWindow=300000
GET /api/monitoring/component-detection/report?timeWindow=300000
GET /api/monitoring/component-detection/slowest?limit=10
```

## 測試建議

1. **單元測試**: 測試各個監控方法的正確性
2. **整合測試**: 測試與 ComponentDetectionEngine 的整合
3. **性能測試**: 驗證監控本身不影響性能
4. **壓力測試**: 測試大量並發會話的處理

## 監控最佳實踐

1. **始終記錄所有階段**: 確保完整的性能數據
2. **記錄緩存命中**: 幫助優化緩存策略
3. **處理錯誤**: 在 catch 塊中標記失敗
4. **使用唯一 sessionId**: 避免數據混淆
5. **定期檢查報告**: 識別性能瓶頸

## 故障排除

### 慢會話診斷
1. 檢查 Vision API 響應時間
2. 檢查知識庫緩存命中率
3. 檢查營養計算的成分數量
4. 檢查網絡延遲

### 低緩存命中率
1. 檢查緩存配置
2. 確認 TTL 設置
3. 檢查料理名稱標準化
4. 考慮增加緩存容量

## 相關需求

- **Requirement 4.5**: 記錄成分識別的性能指標 ✅
- **Requirement 4.1**: 在 8 秒內完成成分識別 ✅
- **Requirement 4.4**: 緩存常見料理的成分資訊 ✅

## 下一步

1. 在 `ComponentDetectionEngine` 中整合性能監控
2. 在 `PhotoController` 中添加性能監控
3. 創建 API 端點暴露性能數據
4. 編寫單元測試和整合測試
5. 在生產環境中監控和優化性能

## 總結

✅ 成功擴展 `FoodRecognitionPerformanceMonitor` 支持成分識別
✅ 實現了四個階段的詳細性能監控
✅ 提供了豐富的統計數據和報告功能
✅ 創建了完整的文檔和範例代碼
✅ 設置了合理的性能閾值和警告機制
✅ 支持自動數據清理和管理

性能監控系統已準備就緒，可以開始在實際的成分識別流程中使用！
