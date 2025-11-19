/**
 * 識別一致性性能監控器
 * Recognition Consistency Performance Monitor
 * 
 * 專門用於監控 recognition-description-mismatch-fix 的性能指標
 * 追蹤處理時間、Vision API 調用次數、一致性檢查結果和錯誤率
 */

import { performanceLogger, logger } from '../config/logging';

/**
 * 一致性檢查結果
 */
export interface ConsistencyCheckResult {
  passed: boolean;
  baseRecognitionFoodCount: number;
  componentDetectionCount: number;
  missingFoodsCount: number;
  extraComponentsCount: number;
  missingFoods: string[];
  extraComponents: string[];
  matchRate: number; // 匹配率 (0-1)
}

/**
 * 識別會話性能指標
 */
export interface RecognitionSessionMetrics {
  sessionId: string;
  userId?: string;
  timestamp: Date;
  
  // 處理時間
  totalProcessingTime: number;
  baseRecognitionTime: number;
  componentDetectionTime: number;
  
  // Vision API 調用
  visionApiCalls: number;
  visionApiCallsAvoided: number; // 因使用預識別食物而避免的調用
  usedPreRecognizedFoods: boolean;
  
  // 一致性檢查
  consistencyCheck: ConsistencyCheckResult;
  
  // 檢測方法
  detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid' | 'pre_recognized';
  
  // 結果
  success: boolean;
  errorType?: string;
  errorMessage?: string;
  
  // 食物數量
  recognizedFoodsCount: number;
  componentsDetectedCount: number;
}

/**
 * 性能統計摘要
 */
export interface PerformanceStatistics {
  // 時間窗口
  timeWindow: number;
  
  // 會話統計
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  successRate: number;
  
  // 處理時間統計
  averageTotalProcessingTime: number;
  averageBaseRecognitionTime: number;
  averageComponentDetectionTime: number;
  medianTotalProcessingTime: number;
  p95TotalProcessingTime: number;
  p99TotalProcessingTime: number;
  
  // Vision API 統計
  totalVisionApiCalls: number;
  totalVisionApiCallsAvoided: number;
  visionApiCallReductionRate: number; // 減少率
  sessionsUsingPreRecognizedFoods: number;
  preRecognizedFoodsUsageRate: number;
  
  // 一致性統計
  averageConsistencyMatchRate: number;
  sessionsWithPerfectConsistency: number;
  perfectConsistencyRate: number;
  averageMissingFoodsCount: number;
  averageExtraComponentsCount: number;
  
  // 檢測方法分佈
  detectionMethodDistribution: {
    vision_api: number;
    knowledge_base: number;
    hybrid: number;
    pre_recognized: number;
  };
  
  // 錯誤統計
  errorDistribution: Map<string, number>;
  errorRate: number;
  
  // 性能改善指標
  averageTimeReduction: number; // 相比舊版本的時間減少（毫秒）
  averageTimeReductionPercentage: number; // 時間減少百分比
}

/**
 * 識別一致性性能監控器類
 */
export class RecognitionConsistencyMonitor {
  private static instance: RecognitionConsistencyMonitor;
  
  // 性能指標存儲
  private sessionMetrics: RecognitionSessionMetrics[] = [];
  
  // 配置
  private readonly MAX_METRICS_HISTORY = 1000;
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10分鐘
  private readonly SLOW_SESSION_THRESHOLD = 8000; // 8秒
  
  // 基準時間（用於計算改善）
  private readonly BASELINE_PROCESSING_TIME = 10000; // 舊版本平均處理時間（毫秒）

  private constructor() {
    this.setupAutoCleanup();
    console.log('✅ RecognitionConsistencyMonitor 已初始化');
  }

  static getInstance(): RecognitionConsistencyMonitor {
    if (!RecognitionConsistencyMonitor.instance) {
      RecognitionConsistencyMonitor.instance = new RecognitionConsistencyMonitor();
    }
    return RecognitionConsistencyMonitor.instance;
  }

  /**
   * 設置自動清理機制
   */
  private setupAutoCleanup(): void {
    setInterval(() => {
      this.cleanupOldMetrics();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 記錄識別會話
   */
  recordSession(metrics: RecognitionSessionMetrics): void {
    // 添加到指標列表
    this.sessionMetrics.push(metrics);
    
    // 保持指標數量在限制內
    if (this.sessionMetrics.length > this.MAX_METRICS_HISTORY) {
      const removeCount = Math.floor(this.MAX_METRICS_HISTORY * 0.2);
      this.sessionMetrics.splice(0, removeCount);
    }
    
    // 記錄到性能日誌
    performanceLogger.info('識別會話完成', {
      sessionId: metrics.sessionId,
      totalProcessingTime: metrics.totalProcessingTime,
      usedPreRecognizedFoods: metrics.usedPreRecognizedFoods,
      visionApiCallsAvoided: metrics.visionApiCallsAvoided,
      consistencyMatchRate: metrics.consistencyCheck.matchRate,
      success: metrics.success
    });
    
    // 檢查慢會話
    if (metrics.totalProcessingTime > this.SLOW_SESSION_THRESHOLD) {
      logger.warn('識別會話過慢', {
        sessionId: metrics.sessionId,
        totalProcessingTime: metrics.totalProcessingTime,
        threshold: this.SLOW_SESSION_THRESHOLD
      });
    }
    
    // 檢查一致性問題
    if (!metrics.consistencyCheck.passed) {
      logger.warn('一致性檢查未通過', {
        sessionId: metrics.sessionId,
        matchRate: metrics.consistencyCheck.matchRate,
        missingFoods: metrics.consistencyCheck.missingFoods,
        extraComponents: metrics.consistencyCheck.extraComponents
      });
    }
    
    // 檢查失敗的會話
    if (!metrics.success) {
      logger.error('識別會話失敗', {
        sessionId: metrics.sessionId,
        errorType: metrics.errorType,
        errorMessage: metrics.errorMessage
      });
    }
    
    // 記錄 Vision API 調用減少
    if (metrics.visionApiCallsAvoided > 0) {
      logger.info('Vision API 調用已優化', {
        sessionId: metrics.sessionId,
        callsAvoided: metrics.visionApiCallsAvoided,
        usedPreRecognizedFoods: metrics.usedPreRecognizedFoods
      });
    }
  }

  /**
   * 獲取性能統計
   */
  getStatistics(timeWindow: number = 300000): PerformanceStatistics {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    // 過濾時間窗口內的會話
    const recentSessions = this.sessionMetrics.filter(
      s => s.timestamp.getTime() >= windowStart
    );
    
    if (recentSessions.length === 0) {
      return this.getEmptyStatistics(timeWindow);
    }
    
    // 成功和失敗的會話
    const successfulSessions = recentSessions.filter(s => s.success);
    const failedSessions = recentSessions.filter(s => !s.success);
    
    // 處理時間統計
    const processingTimes = recentSessions.map(s => s.totalProcessingTime).sort((a, b) => a - b);
    const totalProcessingTime = processingTimes.reduce((sum, t) => sum + t, 0);
    const averageTotalProcessingTime = totalProcessingTime / recentSessions.length;
    const medianTotalProcessingTime = this.calculateMedian(processingTimes);
    const p95TotalProcessingTime = this.calculatePercentile(processingTimes, 95);
    const p99TotalProcessingTime = this.calculatePercentile(processingTimes, 99);
    
    const totalBaseRecognitionTime = recentSessions.reduce((sum, s) => sum + s.baseRecognitionTime, 0);
    const averageBaseRecognitionTime = totalBaseRecognitionTime / recentSessions.length;
    
    const totalComponentDetectionTime = recentSessions.reduce((sum, s) => sum + s.componentDetectionTime, 0);
    const averageComponentDetectionTime = totalComponentDetectionTime / recentSessions.length;
    
    // Vision API 統計
    const totalVisionApiCalls = recentSessions.reduce((sum, s) => sum + s.visionApiCalls, 0);
    const totalVisionApiCallsAvoided = recentSessions.reduce((sum, s) => sum + s.visionApiCallsAvoided, 0);
    const visionApiCallReductionRate = totalVisionApiCalls + totalVisionApiCallsAvoided > 0
      ? totalVisionApiCallsAvoided / (totalVisionApiCalls + totalVisionApiCallsAvoided)
      : 0;
    
    const sessionsUsingPreRecognizedFoods = recentSessions.filter(s => s.usedPreRecognizedFoods).length;
    const preRecognizedFoodsUsageRate = sessionsUsingPreRecognizedFoods / recentSessions.length;
    
    // 一致性統計
    const totalMatchRate = recentSessions.reduce((sum, s) => sum + s.consistencyCheck.matchRate, 0);
    const averageConsistencyMatchRate = totalMatchRate / recentSessions.length;
    
    const sessionsWithPerfectConsistency = recentSessions.filter(
      s => s.consistencyCheck.matchRate === 1.0
    ).length;
    const perfectConsistencyRate = sessionsWithPerfectConsistency / recentSessions.length;
    
    const totalMissingFoods = recentSessions.reduce((sum, s) => sum + s.consistencyCheck.missingFoodsCount, 0);
    const averageMissingFoodsCount = totalMissingFoods / recentSessions.length;
    
    const totalExtraComponents = recentSessions.reduce((sum, s) => sum + s.consistencyCheck.extraComponentsCount, 0);
    const averageExtraComponentsCount = totalExtraComponents / recentSessions.length;
    
    // 檢測方法分佈
    const detectionMethodDistribution = {
      vision_api: recentSessions.filter(s => s.detectionMethod === 'vision_api').length,
      knowledge_base: recentSessions.filter(s => s.detectionMethod === 'knowledge_base').length,
      hybrid: recentSessions.filter(s => s.detectionMethod === 'hybrid').length,
      pre_recognized: recentSessions.filter(s => s.detectionMethod === 'pre_recognized').length
    };
    
    // 錯誤分佈
    const errorDistribution = new Map<string, number>();
    failedSessions.forEach(session => {
      if (session.errorType) {
        const count = errorDistribution.get(session.errorType) || 0;
        errorDistribution.set(session.errorType, count + 1);
      }
    });
    
    // 性能改善指標
    const averageTimeReduction = this.BASELINE_PROCESSING_TIME - averageTotalProcessingTime;
    const averageTimeReductionPercentage = (averageTimeReduction / this.BASELINE_PROCESSING_TIME) * 100;
    
    return {
      timeWindow,
      totalSessions: recentSessions.length,
      successfulSessions: successfulSessions.length,
      failedSessions: failedSessions.length,
      successRate: successfulSessions.length / recentSessions.length,
      averageTotalProcessingTime,
      averageBaseRecognitionTime,
      averageComponentDetectionTime,
      medianTotalProcessingTime,
      p95TotalProcessingTime,
      p99TotalProcessingTime,
      totalVisionApiCalls,
      totalVisionApiCallsAvoided,
      visionApiCallReductionRate,
      sessionsUsingPreRecognizedFoods,
      preRecognizedFoodsUsageRate,
      averageConsistencyMatchRate,
      sessionsWithPerfectConsistency,
      perfectConsistencyRate,
      averageMissingFoodsCount,
      averageExtraComponentsCount,
      detectionMethodDistribution,
      errorDistribution,
      errorRate: failedSessions.length / recentSessions.length,
      averageTimeReduction,
      averageTimeReductionPercentage
    };
  }

  /**
   * 生成性能報告
   */
  generateReport(timeWindow: number = 300000): string {
    const stats = this.getStatistics(timeWindow);
    
    const report = `
=== 識別一致性性能報告 ===
時間窗口: ${timeWindow / 1000} 秒

【會話統計】
- 總會話數: ${stats.totalSessions}
- 成功會話: ${stats.successfulSessions} (${(stats.successRate * 100).toFixed(1)}%)
- 失敗會話: ${stats.failedSessions} (${(stats.errorRate * 100).toFixed(1)}%)

【處理時間統計】
- 平均總處理時間: ${stats.averageTotalProcessingTime.toFixed(0)}ms
- 中位數處理時間: ${stats.medianTotalProcessingTime.toFixed(0)}ms
- P95 處理時間: ${stats.p95TotalProcessingTime.toFixed(0)}ms
- P99 處理時間: ${stats.p99TotalProcessingTime.toFixed(0)}ms
- 平均基礎識別時間: ${stats.averageBaseRecognitionTime.toFixed(0)}ms
- 平均成分檢測時間: ${stats.averageComponentDetectionTime.toFixed(0)}ms

【Vision API 調用統計】
- 總 API 調用: ${stats.totalVisionApiCalls} 次
- 避免的 API 調用: ${stats.totalVisionApiCallsAvoided} 次
- API 調用減少率: ${(stats.visionApiCallReductionRate * 100).toFixed(1)}%
- 使用預識別食物的會話: ${stats.sessionsUsingPreRecognizedFoods} (${(stats.preRecognizedFoodsUsageRate * 100).toFixed(1)}%)

【一致性檢查統計】
- 平均一致性匹配率: ${(stats.averageConsistencyMatchRate * 100).toFixed(1)}%
- 完美一致性會話: ${stats.sessionsWithPerfectConsistency} (${(stats.perfectConsistencyRate * 100).toFixed(1)}%)
- 平均缺失食物數: ${stats.averageMissingFoodsCount.toFixed(2)}
- 平均額外成分數: ${stats.averageExtraComponentsCount.toFixed(2)}

【檢測方法分佈】
- Vision API: ${stats.detectionMethodDistribution.vision_api} (${((stats.detectionMethodDistribution.vision_api / stats.totalSessions) * 100).toFixed(1)}%)
- 知識庫: ${stats.detectionMethodDistribution.knowledge_base} (${((stats.detectionMethodDistribution.knowledge_base / stats.totalSessions) * 100).toFixed(1)}%)
- 混合模式: ${stats.detectionMethodDistribution.hybrid} (${((stats.detectionMethodDistribution.hybrid / stats.totalSessions) * 100).toFixed(1)}%)
- 預識別: ${stats.detectionMethodDistribution.pre_recognized} (${((stats.detectionMethodDistribution.pre_recognized / stats.totalSessions) * 100).toFixed(1)}%)

【性能改善】
- 相比基準時間減少: ${stats.averageTimeReduction.toFixed(0)}ms
- 時間減少百分比: ${stats.averageTimeReductionPercentage.toFixed(1)}%

【錯誤分佈】
${Array.from(stats.errorDistribution.entries())
  .map(([error, count]) => `- ${error}: ${count} 次 (${((count / stats.totalSessions) * 100).toFixed(1)}%)`)
  .join('\n') || '無錯誤'}

生成時間: ${new Date().toISOString()}
========================
`;
    
    return report;
  }

  /**
   * 獲取最慢的會話
   */
  getSlowestSessions(limit: number = 10): RecognitionSessionMetrics[] {
    return [...this.sessionMetrics]
      .sort((a, b) => b.totalProcessingTime - a.totalProcessingTime)
      .slice(0, limit);
  }

  /**
   * 獲取一致性最差的會話
   */
  getWorstConsistencySessions(limit: number = 10): RecognitionSessionMetrics[] {
    return [...this.sessionMetrics]
      .sort((a, b) => a.consistencyCheck.matchRate - b.consistencyCheck.matchRate)
      .slice(0, limit);
  }

  /**
   * 獲取錯誤會話
   */
  getErrorSessions(limit: number = 10): RecognitionSessionMetrics[] {
    return this.sessionMetrics
      .filter(s => !s.success)
      .slice(-limit);
  }

  /**
   * 清理舊的指標數據
   */
  private cleanupOldMetrics(maxAge: number = 1800000): void {
    const cutoff = Date.now() - maxAge;
    const initialCount = this.sessionMetrics.length;
    
    this.sessionMetrics = this.sessionMetrics.filter(
      s => s.timestamp.getTime() >= cutoff
    );
    
    const removedCount = initialCount - this.sessionMetrics.length;
    
    if (removedCount > 0) {
      logger.debug('清理舊的性能指標', {
        removedCount,
        remainingCount: this.sessionMetrics.length
      });
    }
  }

  /**
   * 計算中位數
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * 計算百分位數
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    
    return sorted[Math.max(0, index)];
  }

  /**
   * 獲取空統計數據
   */
  private getEmptyStatistics(timeWindow: number): PerformanceStatistics {
    return {
      timeWindow,
      totalSessions: 0,
      successfulSessions: 0,
      failedSessions: 0,
      successRate: 0,
      averageTotalProcessingTime: 0,
      averageBaseRecognitionTime: 0,
      averageComponentDetectionTime: 0,
      medianTotalProcessingTime: 0,
      p95TotalProcessingTime: 0,
      p99TotalProcessingTime: 0,
      totalVisionApiCalls: 0,
      totalVisionApiCallsAvoided: 0,
      visionApiCallReductionRate: 0,
      sessionsUsingPreRecognizedFoods: 0,
      preRecognizedFoodsUsageRate: 0,
      averageConsistencyMatchRate: 0,
      sessionsWithPerfectConsistency: 0,
      perfectConsistencyRate: 0,
      averageMissingFoodsCount: 0,
      averageExtraComponentsCount: 0,
      detectionMethodDistribution: {
        vision_api: 0,
        knowledge_base: 0,
        hybrid: 0,
        pre_recognized: 0
      },
      errorDistribution: new Map(),
      errorRate: 0,
      averageTimeReduction: 0,
      averageTimeReductionPercentage: 0
    };
  }

  /**
   * 重置所有指標
   */
  reset(): void {
    this.sessionMetrics = [];
    logger.info('識別一致性性能監控指標已重置');
  }
}

// 導出單例實例
export const recognitionConsistencyMonitor = RecognitionConsistencyMonitor.getInstance();
