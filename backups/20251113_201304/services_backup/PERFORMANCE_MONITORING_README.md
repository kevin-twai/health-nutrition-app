# 食物識別性能監控系統

## 概述

本系統為食物識別功能提供全面的性能監控、日誌記錄和優化功能。

## 核心組件

### 1. FoodRecognitionPerformanceMonitor（性能監控器）

**位置**: `apps/api/src/services/FoodRecognitionPerformanceMonitor.ts`

**功能**:
- 記錄每個識別階段的處理時間
- 監控 API 調用次數和響應時間
- 追蹤內存使用情況
- 生成性能統計報告

**使用方式**:
```typescript
import { foodRecognitionPerformanceMonitor } from './FoodRecognitionPerformanceMonitor';

// 開始會話
foodRecognitionPerformanceMonitor.startRecognitionSession(
  sessionId,
  imageSize,
  imageFormat,
  userId
);

// 記錄階段
foodRecognitionPerformanceMonitor.recordRecognitionStage(
  sessionId,
  stageName,
  stageNumber,
  startTime,
  endTime,
  apiCalls,
  confidence,
  foodsDetected,
  success
);

// 記錄 API 調用
foodRecognitionPerformanceMonitor.recordApiCall(
  sessionId,
  apiName,
  startTime,
  endTime,
  success,
  options
);

// 結束會話
foodRecognitionPerformanceMonitor.endRecognitionSession(
  sessionId,
  finalConfidence,
  finalFoodsCount,
  success
);

// 獲取統計
const stats = foodRecognitionPerformanceMonitor.getPerformanceStatistics(timeWindow);
```

### 2. RecognitionResultCache（結果緩存）

**位置**: `apps/api/src/services/RecognitionResultCache.ts`

**功能**:
- 緩存識別結果，避免重複的 API 調用
- 基於圖片哈希值的智能緩存
- 自動過期和清理機制
- 緩存命中率統計

**配置**:
- 最大緩存大小: 500 個結果
- 緩存 TTL: 24 小時
- 自動清理間隔: 每小時

**使用方式**:
```typescript
import { recognitionResultCache } from './RecognitionResultCache';

// 檢查緩存
const cachedResult = recognitionResultCache.get(imageBuffer);
if (cachedResult) {
  return cachedResult;
}

// 設置緩存
recognitionResultCache.set(imageBuffer, result);

// 獲取統計
const stats = recognitionResultCache.getStatistics();
```

### 3. KnowledgeBaseQueryOptimizer（知識庫查詢優化器）

**位置**: `apps/api/src/services/KnowledgeBaseQueryOptimizer.ts`

**功能**:
- 緩存知識庫查詢結果
- 優化視覺特徵匹配性能
- 減少重複的知識庫搜索
- 預熱常用查詢

**配置**:
- 緩存 TTL: 5 分鐘
- 最大緩存大小: 200 個查詢
- 自動清理間隔: 1 分鐘

**使用方式**:
```typescript
import { knowledgeBaseQueryOptimizer } from './KnowledgeBaseQueryOptimizer';

// 查詢食材（帶緩存）
const items = knowledgeBaseQueryOptimizer.queryFoodItems(options);

// 視覺特徵匹配（帶緩存）
const matches = knowledgeBaseQueryOptimizer.matchFoodItemsByVisualFeatures(
  imageFeatures,
  options
);

// 預熱緩存
knowledgeBaseQueryOptimizer.warmupCache();

// 獲取統計
const stats = knowledgeBaseQueryOptimizer.getCacheStatistics();
```

### 4. FoodRecognitionLogger（日誌記錄器）

**位置**: `apps/api/src/services/FoodRecognitionLogger.ts`

**功能**:
- 記錄詳細的識別日誌
- 錯誤追蹤和分析
- 生成日誌報告
- 日誌統計和趨勢分析

**使用方式**:
```typescript
import { foodRecognitionLogger } from './FoodRecognitionLogger';

// 記錄會話開始
foodRecognitionLogger.logRecognitionStart(sessionId, imageSize, imageFormat, userId);

// 記錄階段
foodRecognitionLogger.logRecognitionStage(
  sessionId,
  stageNumber,
  stageName,
  duration,
  apiCalls,
  confidence,
  foodsDetected
);

// 記錄完成
foodRecognitionLogger.logRecognitionComplete(sessionId, result, userId);

// 記錄錯誤
foodRecognitionLogger.logRecognitionError(sessionId, error, context);

// 獲取統計
const stats = foodRecognitionLogger.getLogStatistics(timeWindow);

// 生成報告
const report = foodRecognitionLogger.generateLogReport(timeWindow);
```

## 監控 API 端點

**基礎路徑**: `/api/v1/food-recognition/monitoring`

### 性能監控端點

#### GET /performance
獲取性能統計數據

**查詢參數**:
- `timeWindow`: 時間窗口（毫秒），預設 300000（5 分鐘）

**響應**:
```json
{
  "success": true,
  "data": {
    "timeWindow": 300,
    "recognition": {
      "totalSessions": 100,
      "successfulSessions": 95,
      "failedSessions": 5,
      "averageDuration": 3500,
      "averageApiCalls": 1.2,
      "averageConfidence": 0.87,
      "averageStages": 1.3,
      "slowSessions": 5
    },
    "apiCalls": {
      "totalCalls": 120,
      "successfulCalls": 118,
      "failedCalls": 2,
      "averageDuration": 2800,
      "slowCalls": 3
    },
    "knowledgeBase": {
      "totalQueries": 30,
      "averageDuration": 45,
      "cacheHitRate": 0.6,
      "averageItemsSearched": 150,
      "averageItemsMatched": 5
    },
    "memory": {
      "currentMemoryMB": 256,
      "averageMemoryMB": 240,
      "maxMemoryMB": 280,
      "minMemoryMB": 220
    }
  }
}
```

#### GET /performance/report
獲取性能報告（純文本格式）

#### GET /performance/slowest
獲取最慢的識別會話

**查詢參數**:
- `limit`: 返回數量，預設 10

### 日誌端點

#### GET /logs
獲取識別日誌

**查詢參數**:
- `limit`: 返回數量，預設 50

#### GET /logs/statistics
獲取日誌統計

**查詢參數**:
- `timeWindow`: 時間窗口（毫秒），預設 3600000（1 小時）

#### GET /logs/report
獲取日誌報告（純文本格式）

### 緩存端點

#### GET /cache
獲取緩存統計

**響應**:
```json
{
  "success": true,
  "data": {
    "resultCache": {
      "totalEntries": 150,
      "totalHits": 300,
      "totalMisses": 100,
      "hitRate": 0.75,
      "averageAge": 120
    },
    "knowledgeBaseCache": {
      "query": {
        "cacheSize": 50,
        "hits": 200,
        "misses": 80,
        "hitRate": 0.71
      },
      "match": {
        "cacheSize": 30,
        "hits": 100,
        "misses": 50,
        "hitRate": 0.67
      }
    }
  }
}
```

#### POST /cache/clear
清空所有緩存（需要認證）

### 儀表板端點

#### GET /dashboard
獲取完整的監控儀表板數據

**查詢參數**:
- `timeWindow`: 時間窗口（毫秒），預設 300000（5 分鐘）

**響應**: 包含所有監控數據的綜合視圖

### 健康檢查端點

#### GET /health
檢查食物識別系統的健康狀態

**響應**:
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "performance": {
      "status": "pass",
      "averageDuration": 3500,
      "threshold": 10000
    },
    "memory": {
      "status": "pass",
      "currentMemoryMB": 256,
      "threshold": 1024
    },
    "successRate": {
      "status": "pass",
      "rate": 95,
      "threshold": 90
    },
    "cache": {
      "status": "pass",
      "hitRate": 75,
      "size": 150
    }
  }
}
```

## 性能優化策略

### 1. 結果緩存
- 相同圖片的識別結果會被緩存 24 小時
- 基於 SHA-256 哈希值進行緩存鍵生成
- 自動驅逐最少使用的緩存項

### 2. 知識庫查詢優化
- 常用查詢結果緩存 5 分鐘
- 視覺特徵匹配結果緩存
- 預熱機制加載常用類別和料理類型

### 3. API 調用優化
- 第一階段信心度足夠時直接返回，避免後續 API 調用
- 智能選擇 prompt 類型，減少不必要的重試
- 知識庫匹配作為最後手段，不調用外部 API

### 4. 內存管理
- 定期清理過期的緩存和日誌
- 限制緩存和日誌的最大數量
- 自動監控內存使用並發出警告

## 監控指標

### 關鍵性能指標（KPI）

1. **平均處理時間**: 目標 < 5 秒
2. **API 調用次數**: 目標平均 < 1.5 次/會話
3. **識別成功率**: 目標 > 90%
4. **平均信心度**: 目標 > 85%
5. **緩存命中率**: 目標 > 60%

### 質量指標

1. **慢會話比例**: 目標 < 10%（處理時間 > 8 秒）
2. **低信心度比例**: 目標 < 15%（信心度 < 70%）
3. **錯誤率**: 目標 < 5%

### 資源使用指標

1. **內存使用**: 目標 < 512MB
2. **知識庫查詢時間**: 目標 < 100ms
3. **API 調用時間**: 目標 < 3 秒

## 整合到 MultiStageRecognitionEngine

MultiStageRecognitionEngine 已經整合了所有性能監控功能：

```typescript
// 自動使用緩存
const cachedResult = recognitionResultCache.get(imageBuffer);
if (cachedResult) {
  return cachedResult;
}

// 自動記錄性能指標
foodRecognitionPerformanceMonitor.startRecognitionSession(...);
foodRecognitionPerformanceMonitor.recordRecognitionStage(...);
foodRecognitionPerformanceMonitor.recordApiCall(...);
foodRecognitionPerformanceMonitor.endRecognitionSession(...);

// 自動記錄日誌
foodRecognitionLogger.logRecognitionStart(...);
foodRecognitionLogger.logRecognitionStage(...);
foodRecognitionLogger.logRecognitionComplete(...);

// 使用優化的知識庫查詢
const matches = knowledgeBaseQueryOptimizer.matchFoodItemsByVisualFeatures(...);
```

## 最佳實踐

1. **定期檢查監控儀表板**: 每天查看 `/dashboard` 端點
2. **設置警報**: 當錯誤率或慢會話比例超過閾值時發送通知
3. **分析慢會話**: 定期查看 `/performance/slowest` 找出性能瓶頸
4. **監控緩存效率**: 確保緩存命中率保持在 60% 以上
5. **定期清理**: 在低峰時段清理緩存和日誌
6. **預熱緩存**: 在系統啟動或重啟後執行緩存預熱

## 故障排除

### 性能下降
1. 檢查 API 調用時間是否異常
2. 查看內存使用是否過高
3. 檢查緩存命中率是否下降
4. 分析最慢的會話找出共同點

### 高錯誤率
1. 查看錯誤日誌找出錯誤類型
2. 檢查 API 調用失敗率
3. 驗證知識庫數據完整性
4. 檢查網絡連接和外部服務狀態

### 內存洩漏
1. 監控內存使用趨勢
2. 檢查緩存大小是否超過限制
3. 驗證自動清理機制是否正常運行
4. 查看日誌存儲是否過大

## 未來改進

1. **實時監控儀表板**: 使用 WebSocket 推送實時數據
2. **機器學習優化**: 基於歷史數據預測最佳 prompt 選擇
3. **分佈式緩存**: 使用 Redis 實現跨實例緩存共享
4. **自動調優**: 根據性能指標自動調整配置參數
5. **詳細的追蹤**: 實現分佈式追蹤（如 OpenTelemetry）
