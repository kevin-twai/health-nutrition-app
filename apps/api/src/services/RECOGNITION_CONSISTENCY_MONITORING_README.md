# 識別一致性性能監控

## 概述

`RecognitionConsistencyMonitor` 是專門用於監控 recognition-description-mismatch-fix 的性能指標系統。它追蹤以下關鍵指標：

- **處理時間**：總處理時間、基礎識別時間、成分檢測時間
- **Vision API 調用次數**：實際調用次數和避免的調用次數
- **一致性檢查結果**：基礎識別與成分識別的一致性
- **錯誤率**：失敗會話的統計和錯誤類型分佈

## 功能特性

### 1. 自動性能追蹤

監控器會自動記錄每個識別會話的性能指標，包括：

- 會話 ID 和時間戳
- 處理時間分解（基礎識別、成分檢測）
- Vision API 調用統計
- 一致性檢查結果
- 檢測方法（vision_api、knowledge_base、hybrid、pre_recognized）
- 成功/失敗狀態

### 2. 實時統計分析

提供多種統計指標：

- **會話統計**：總會話數、成功率、失敗率
- **處理時間統計**：平均值、中位數、P95、P99
- **Vision API 統計**：調用次數、減少率、使用預識別食物的比例
- **一致性統計**：平均匹配率、完美一致性比例、缺失/額外成分統計
- **檢測方法分佈**：各種檢測方法的使用比例
- **錯誤分佈**：錯誤類型和頻率

### 3. 性能報告生成

自動生成格式化的性能報告，包含所有關鍵指標和趨勢分析。

### 4. 問題診斷工具

提供多種查詢方法：

- 獲取最慢的會話
- 獲取一致性最差的會話
- 獲取錯誤會話列表

## 使用方法

### 在 PhotoController 中集成

監控器已經集成到 `PhotoController.recognizeWithComponents` 方法中：

```typescript
import { recognitionConsistencyMonitor, RecognitionSessionMetrics, ConsistencyCheckResult } from '../services/RecognitionConsistencyMonitor';

// 在識別完成後記錄指標
const consistencyCheckResult: ConsistencyCheckResult = {
  passed: consistencyCheckPassed,
  baseRecognitionFoodCount: multiStageResult.foods?.length || 0,
  componentDetectionCount: componentResult.components.length,
  missingFoodsCount,
  extraComponentsCount,
  missingFoods: [...],
  extraComponents: [...],
  matchRate: ...
};

const sessionMetrics: RecognitionSessionMetrics = {
  sessionId,
  userId: req.user?.id,
  timestamp: new Date(),
  totalProcessingTime,
  baseRecognitionTime,
  componentDetectionTime,
  visionApiCalls: usedPreRecognizedFoods ? 0 : 1,
  visionApiCallsAvoided: usedPreRecognizedFoods ? 1 : 0,
  usedPreRecognizedFoods,
  consistencyCheck: consistencyCheckResult,
  detectionMethod: componentResult.metadata.detectionMethod,
  success: true,
  recognizedFoodsCount: multiStageResult.foods?.length || 0,
  componentsDetectedCount: componentResult.components.length
};

recognitionConsistencyMonitor.recordSession(sessionMetrics);
```

### API 端點

#### 1. 獲取性能統計

```bash
GET /api/v1/recognition-monitoring/statistics?timeWindow=300000
```

返回指定時間窗口內的統計數據（預設 5 分鐘）。

**回應範例：**

```json
{
  "success": true,
  "data": {
    "timeWindow": 300000,
    "totalSessions": 150,
    "successfulSessions": 145,
    "failedSessions": 5,
    "successRate": 0.967,
    "averageTotalProcessingTime": 4523,
    "averageBaseRecognitionTime": 2100,
    "averageComponentDetectionTime": 2423,
    "medianTotalProcessingTime": 4200,
    "p95TotalProcessingTime": 6800,
    "p99TotalProcessingTime": 8500,
    "totalVisionApiCalls": 45,
    "totalVisionApiCallsAvoided": 105,
    "visionApiCallReductionRate": 0.7,
    "sessionsUsingPreRecognizedFoods": 105,
    "preRecognizedFoodsUsageRate": 0.7,
    "averageConsistencyMatchRate": 0.95,
    "sessionsWithPerfectConsistency": 120,
    "perfectConsistencyRate": 0.8,
    "averageMissingFoodsCount": 0.15,
    "averageExtraComponentsCount": 0.25,
    "detectionMethodDistribution": {
      "vision_api": 30,
      "knowledge_base": 10,
      "hybrid": 5,
      "pre_recognized": 105
    },
    "errorDistribution": [
      { "error": "VISION_API_ERROR", "count": 3 },
      { "error": "TIMEOUT_ERROR", "count": 2 }
    ],
    "errorRate": 0.033,
    "averageTimeReduction": 5477,
    "averageTimeReductionPercentage": 54.77
  }
}
```

#### 2. 生成性能報告

```bash
# 文本格式
GET /api/v1/recognition-monitoring/report?timeWindow=300000&format=text

# JSON 格式
GET /api/v1/recognition-monitoring/report?timeWindow=300000&format=json
```

**文本格式範例：**

```
=== 識別一致性性能報告 ===
時間窗口: 300 秒

【會話統計】
- 總會話數: 150
- 成功會話: 145 (96.7%)
- 失敗會話: 5 (3.3%)

【處理時間統計】
- 平均總處理時間: 4523ms
- 中位數處理時間: 4200ms
- P95 處理時間: 6800ms
- P99 處理時間: 8500ms
- 平均基礎識別時間: 2100ms
- 平均成分檢測時間: 2423ms

【Vision API 調用統計】
- 總 API 調用: 45 次
- 避免的 API 調用: 105 次
- API 調用減少率: 70.0%
- 使用預識別食物的會話: 105 (70.0%)

【一致性檢查統計】
- 平均一致性匹配率: 95.0%
- 完美一致性會話: 120 (80.0%)
- 平均缺失食物數: 0.15
- 平均額外成分數: 0.25

【檢測方法分佈】
- Vision API: 30 (20.0%)
- 知識庫: 10 (6.7%)
- 混合模式: 5 (3.3%)
- 預識別: 105 (70.0%)

【性能改善】
- 相比基準時間減少: 5477ms
- 時間減少百分比: 54.8%

【錯誤分佈】
- VISION_API_ERROR: 3 次 (2.0%)
- TIMEOUT_ERROR: 2 次 (1.3%)

生成時間: 2025-11-19T10:30:00.000Z
========================
```

#### 3. 獲取最慢的會話

```bash
GET /api/v1/recognition-monitoring/slowest-sessions?limit=10
```

返回處理時間最長的會話列表。

#### 4. 獲取一致性最差的會話

```bash
GET /api/v1/recognition-monitoring/worst-consistency-sessions?limit=10
```

返回一致性匹配率最低的會話列表。

#### 5. 獲取錯誤會話

```bash
GET /api/v1/recognition-monitoring/error-sessions?limit=10
```

返回最近失敗的會話列表。

#### 6. 重置監控指標

```bash
POST /api/v1/recognition-monitoring/reset
```

清除所有歷史指標數據（謹慎使用）。

#### 7. 健康檢查

```bash
GET /api/v1/recognition-monitoring/health
```

檢查監控系統的健康狀態。

## 關鍵指標說明

### 1. Vision API 調用減少率

```
visionApiCallReductionRate = totalVisionApiCallsAvoided / (totalVisionApiCalls + totalVisionApiCallsAvoided)
```

這個指標顯示通過使用預識別食物避免了多少 Vision API 調用。

**目標值**：> 60%

### 2. 一致性匹配率

```
matchRate = (baseRecognitionFoodCount - missingFoodsCount) / baseRecognitionFoodCount
```

這個指標顯示基礎識別的食物有多少在成分識別中被正確保留。

**目標值**：> 90%

### 3. 完美一致性率

```
perfectConsistencyRate = sessionsWithPerfectConsistency / totalSessions
```

這個指標顯示有多少會話達到了完美一致性（matchRate = 1.0）。

**目標值**：> 80%

### 4. 處理時間減少百分比

```
averageTimeReductionPercentage = (BASELINE_PROCESSING_TIME - averageTotalProcessingTime) / BASELINE_PROCESSING_TIME * 100
```

這個指標顯示相比舊版本（基準時間 10000ms）的性能改善。

**目標值**：> 30%

## 性能優化建議

### 1. 提高預識別食物使用率

如果 `preRecognizedFoodsUsageRate` < 60%，檢查：

- 基礎識別是否正常工作
- 預識別食物是否正確傳遞給成分檢測引擎
- 是否有錯誤導致降級到 Vision API

### 2. 改善一致性匹配率

如果 `averageConsistencyMatchRate` < 90%，檢查：

- 食物名稱匹配邏輯是否正確
- 是否有食物在轉換過程中丟失
- 混合模式是否正確合併結果

### 3. 減少處理時間

如果 `averageTotalProcessingTime` > 6000ms，檢查：

- 知識庫查詢是否優化
- 營養計算是否有瓶頸
- 是否有不必要的 API 調用

### 4. 降低錯誤率

如果 `errorRate` > 5%，檢查：

- 錯誤分佈中最常見的錯誤類型
- 是否需要改進錯誤處理和降級邏輯
- Vision API 配額和限制

## 監控最佳實踐

### 1. 定期檢查報告

建議每天檢查性能報告，關注：

- 成功率是否穩定
- 處理時間是否在合理範圍
- 一致性是否保持高水平
- 是否有新的錯誤類型出現

### 2. 設置告警閾值

建議設置以下告警：

- 成功率 < 95%
- 平均處理時間 > 8000ms
- 一致性匹配率 < 85%
- 錯誤率 > 5%

### 3. 分析慢會話

定期查看最慢的會話，找出性能瓶頸：

```bash
curl http://localhost:3000/api/v1/recognition-monitoring/slowest-sessions?limit=10
```

### 4. 分析一致性問題

定期查看一致性最差的會話，改進匹配邏輯：

```bash
curl http://localhost:3000/api/v1/recognition-monitoring/worst-consistency-sessions?limit=10
```

## 測試

運行測試：

```bash
npm test -- RecognitionConsistencyMonitor.test.ts
```

測試覆蓋：

- 會話記錄
- 統計計算
- 報告生成
- 查詢方法
- 重置功能

## 故障排除

### 問題：統計數據為空

**原因**：時間窗口內沒有會話數據

**解決方案**：
- 增加時間窗口參數
- 確認識別流程正在運行
- 檢查監控器是否正確集成

### 問題：一致性匹配率異常低

**原因**：食物名稱匹配邏輯有問題

**解決方案**：
- 檢查 `isSimilarComponent` 方法
- 查看一致性最差的會話詳情
- 改進名稱標準化邏輯

### 問題：處理時間異常高

**原因**：可能有性能瓶頸

**解決方案**：
- 查看最慢的會話
- 檢查各階段的處理時間分解
- 優化慢的階段

## 相關文件

- `RecognitionConsistencyMonitor.ts` - 監控器實現
- `recognition-monitoring.ts` - API 路由
- `PhotoController.ts` - 集成點
- `RecognitionConsistencyMonitor.test.ts` - 測試

## 未來改進

1. **持久化存儲**：將指標存儲到資料庫以支持長期分析
2. **可視化儀表板**：創建 Web 界面顯示實時指標
3. **自動告警**：當指標超出閾值時發送通知
4. **趨勢分析**：分析指標隨時間的變化趨勢
5. **A/B 測試支持**：比較不同版本的性能
