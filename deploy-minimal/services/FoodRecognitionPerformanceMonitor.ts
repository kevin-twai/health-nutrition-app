/**
 * 食物識別性能監控器
 * Food Recognition Performance Monitor
 * 
 * 專門用於監控食物識別系統的性能指標
 */

import { performanceLogger, logger } from '../config/logging';
import { PerformanceMonitor } from './PerformanceMonitor';

/**
 * 識別階段性能指標
 */
export interface RecognitionStageMetrics {
  stageName: string;
  stageNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  apiCalls: number;
  confidence: number;
  foodsDetected: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * 完整識別會話性能指標
 */
export interface RecognitionSessionMetrics {
  sessionId: string;
  userId?: string;
  imageSize: number;
  imageFormat: string;
  totalDuration: number;
  totalApiCalls: number;
  stagesExecuted: number;
  finalConfidence: number;
  finalFoodsCount: number;
  stages: RecognitionStageMetrics[];
  memoryUsedMB: number;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}

/**
 * API 調用性能指標
 */
export interface ApiCallMetrics {
  apiName: string;
  endpoint?: string;
  startTime: number;
  endTime: number;
  duration: number;
  requestSize?: number;
  responseSize?: number;
  statusCode?: number;
  success: boolean;
  errorMessage?: string;
  retryCount?: number;
}

/**
 * 知識庫查詢性能指標
 */
export interface KnowledgeBaseQueryMetrics {
  queryType: string;
  itemsSearched: number;
  itemsMatched: number;
  duration: number;
  cacheHit: boolean;
  timestamp: Date;
}

/**
 * 性能統計摘要
 */
export interface PerformanceStatistics {
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  averageDuration: number;
  averageApiCalls: number;
  averageConfidence: number;
  averageStages: number;
  slowSessions: number; // 超過閾值的會話數
  apiCallDistribution: {
    stage1: number;
    stage2: number;
    stage3: number;
  };
  stageUsageDistribution: {
    stage1Only: number;
    stage2: number;
    stage3: number;
  };
  errorDistribution: Map<string, number>;
  timeWindow: number; // 統計時間窗口（毫秒）
}

/**
 * 食物識別性能監控器類
 */
export class FoodRecognitionPerformanceMonitor {
  private static instance: FoodRecognitionPerformanceMonitor;
  private performanceMonitor: PerformanceMonitor;
  
  // 性能指標存儲
  private sessionMetrics: RecognitionSessionMetrics[] = [];
  private apiCallMetrics: ApiCallMetrics[] = [];
  private knowledgeBaseMetrics: KnowledgeBaseQueryMetrics[] = [];
  
  // 配置
  private readonly MAX_METRICS_HISTORY = 1000;
  private readonly SLOW_SESSION_THRESHOLD = 8000; // 8秒
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10分鐘
  
  // 當前會話追蹤
  private currentSessions: Map<string, {
    sessionId: string;
    startTime: number;
    stages: RecognitionStageMetrics[];
    apiCalls: ApiCallMetrics[];
    imageSize: number;
    imageFormat: string;
    userId?: string;
  }> = new Map();

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.setupAutoCleanup();
    console.log('✅ FoodRecognitionPerformanceMonitor 已初始化');
  }

  static getInstance(): FoodRecognitionPerformanceMonitor {
    if (!FoodRecognitionPerformanceMonitor.instance) {
      FoodRecognitionPerformanceMonitor.instance = new FoodRecognitionPerformanceMonitor();
    }
    return FoodRecognitionPerformanceMonitor.instance;
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
   * 開始識別會話
   */
  startRecognitionSession(
    sessionId: string,
    imageSize: number,
    imageFormat: string,
    userId?: string
  ): void {
    this.currentSessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      stages: [],
      apiCalls: [],
      imageSize,
      imageFormat,
      userId
    });

    logger.debug('開始識別會話', {
      sessionId,
      imageSize,
      imageFormat,
      userId
    });
  }

  /**
   * 記錄識別階段
   */
  recordRecognitionStage(
    sessionId: string,
    stageName: string,
    stageNumber: number,
    startTime: number,
    endTime: number,
    apiCalls: number,
    confidence: number,
    foodsDetected: number,
    success: boolean,
    errorMessage?: string
  ): void {
    const session = this.currentSessions.get(sessionId);
    if (!session) {
      logger.warn('找不到識別會話', { sessionId });
      return;
    }

    const stageMetrics: RecognitionStageMetrics = {
      stageName,
      stageNumber,
      startTime,
      endTime,
      duration: endTime - startTime,
      apiCalls,
      confidence,
      foodsDetected,
      success,
      errorMessage
    };

    session.stages.push(stageMetrics);

    // 記錄到性能日誌
    performanceLogger.info('識別階段完成', {
      sessionId,
      ...stageMetrics
    });

    // 檢查慢階段
    if (stageMetrics.duration > 5000) {
      logger.warn('識別階段過慢', {
        sessionId,
        stageName,
        duration: stageMetrics.duration,
        threshold: 5000
      });
    }
  }

  /**
   * 記錄 API 調用
   */
  recordApiCall(
    sessionId: string,
    apiName: string,
    startTime: number,
    endTime: number,
    success: boolean,
    options?: {
      endpoint?: string;
      requestSize?: number;
      responseSize?: number;
      statusCode?: number;
      errorMessage?: string;
      retryCount?: number;
    }
  ): void {
    const apiMetrics: ApiCallMetrics = {
      apiName,
      endpoint: options?.endpoint,
      startTime,
      endTime,
      duration: endTime - startTime,
      requestSize: options?.requestSize,
      responseSize: options?.responseSize,
      statusCode: options?.statusCode,
      success,
      errorMessage: options?.errorMessage,
      retryCount: options?.retryCount
    };

    // 添加到會話
    const session = this.currentSessions.get(sessionId);
    if (session) {
      session.apiCalls.push(apiMetrics);
    }

    // 添加到全局指標
    this.apiCallMetrics.push(apiMetrics);

    // 記錄到性能日誌
    performanceLogger.info('API 調用完成', {
      sessionId,
      ...apiMetrics
    });

    // 檢查慢 API 調用
    if (apiMetrics.duration > 3000) {
      logger.warn('API 調用過慢', {
        sessionId,
        apiName,
        duration: apiMetrics.duration,
        threshold: 3000
      });
    }

    // 檢查失敗的 API 調用
    if (!success) {
      logger.error('API 調用失敗', {
        sessionId,
        apiName,
        errorMessage: options?.errorMessage,
        retryCount: options?.retryCount
      });
    }
  }

  /**
   * 記錄知識庫查詢
   */
  recordKnowledgeBaseQuery(
    queryType: string,
    itemsSearched: number,
    itemsMatched: number,
    duration: number,
    cacheHit: boolean = false
  ): void {
    const metrics: KnowledgeBaseQueryMetrics = {
      queryType,
      itemsSearched,
      itemsMatched,
      duration,
      cacheHit,
      timestamp: new Date()
    };

    this.knowledgeBaseMetrics.push(metrics);

    // 記錄到性能日誌
    performanceLogger.info('知識庫查詢完成', metrics);

    // 檢查慢查詢
    if (duration > 100) {
      logger.warn('知識庫查詢過慢', {
        queryType,
        duration,
        threshold: 100,
        itemsSearched
      });
    }
  }

  /**
   * 結束識別會話
   */
  endRecognitionSession(
    sessionId: string,
    finalConfidence: number,
    finalFoodsCount: number,
    success: boolean,
    errorType?: string
  ): void {
    const session = this.currentSessions.get(sessionId);
    if (!session) {
      logger.warn('找不到識別會話', { sessionId });
      return;
    }

    const endTime = Date.now();
    const totalDuration = endTime - session.startTime;
    const totalApiCalls = session.apiCalls.length;
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    const sessionMetrics: RecognitionSessionMetrics = {
      sessionId,
      userId: session.userId,
      imageSize: session.imageSize,
      imageFormat: session.imageFormat,
      totalDuration,
      totalApiCalls,
      stagesExecuted: session.stages.length,
      finalConfidence,
      finalFoodsCount,
      stages: session.stages,
      memoryUsedMB,
      timestamp: new Date(),
      success,
      errorType
    };

    // 添加到全局指標
    this.sessionMetrics.push(sessionMetrics);

    // 保持指標數量在限制內
    if (this.sessionMetrics.length > this.MAX_METRICS_HISTORY) {
      const removeCount = Math.floor(this.MAX_METRICS_HISTORY * 0.2);
      this.sessionMetrics.splice(0, removeCount);
    }

    // 記錄到性能日誌
    performanceLogger.info('識別會話完成', sessionMetrics);

    // 檢查慢會話
    if (totalDuration > this.SLOW_SESSION_THRESHOLD) {
      logger.warn('識別會話過慢', {
        sessionId,
        totalDuration,
        threshold: this.SLOW_SESSION_THRESHOLD,
        stagesExecuted: session.stages.length,
        totalApiCalls
      });
    }

    // 檢查失敗的會話
    if (!success) {
      logger.error('識別會話失敗', {
        sessionId,
        errorType,
        totalDuration,
        stagesExecuted: session.stages.length
      });
    }

    // 清理當前會話
    this.currentSessions.delete(sessionId);
  }

  /**
   * 獲取性能統計
   */
  getPerformanceStatistics(timeWindow: number = 300000): PerformanceStatistics {
    const now = Date.now();
    const windowStart = now - timeWindow;

    // 過濾時間窗口內的會話
    const recentSessions = this.sessionMetrics.filter(
      s => s.timestamp.getTime() >= windowStart
    );

    if (recentSessions.length === 0) {
      return {
        totalSessions: 0,
        successfulSessions: 0,
        failedSessions: 0,
        averageDuration: 0,
        averageApiCalls: 0,
        averageConfidence: 0,
        averageStages: 0,
        slowSessions: 0,
        apiCallDistribution: { stage1: 0, stage2: 0, stage3: 0 },
        stageUsageDistribution: { stage1Only: 0, stage2: 0, stage3: 0 },
        errorDistribution: new Map(),
        timeWindow
      };
    }

    // 計算統計數據
    const successfulSessions = recentSessions.filter(s => s.success);
    const failedSessions = recentSessions.filter(s => !s.success);
    
    const totalDuration = recentSessions.reduce((sum, s) => sum + s.totalDuration, 0);
    const totalApiCalls = recentSessions.reduce((sum, s) => sum + s.totalApiCalls, 0);
    const totalConfidence = successfulSessions.reduce((sum, s) => sum + s.finalConfidence, 0);
    const totalStages = recentSessions.reduce((sum, s) => sum + s.stagesExecuted, 0);
    
    const slowSessions = recentSessions.filter(
      s => s.totalDuration > this.SLOW_SESSION_THRESHOLD
    ).length;

    // API 調用分佈
    const apiCallDistribution = {
      stage1: 0,
      stage2: 0,
      stage3: 0
    };

    // 階段使用分佈
    const stageUsageDistribution = {
      stage1Only: 0,
      stage2: 0,
      stage3: 0
    };

    recentSessions.forEach(session => {
      if (session.stagesExecuted === 1) {
        stageUsageDistribution.stage1Only++;
      } else if (session.stagesExecuted === 2) {
        stageUsageDistribution.stage2++;
      } else if (session.stagesExecuted >= 3) {
        stageUsageDistribution.stage3++;
      }

      // 統計每個階段的 API 調用
      session.stages.forEach(stage => {
        if (stage.stageNumber === 1) {
          apiCallDistribution.stage1 += stage.apiCalls;
        } else if (stage.stageNumber === 2) {
          apiCallDistribution.stage2 += stage.apiCalls;
        } else if (stage.stageNumber === 3) {
          apiCallDistribution.stage3 += stage.apiCalls;
        }
      });
    });

    // 錯誤分佈
    const errorDistribution = new Map<string, number>();
    failedSessions.forEach(session => {
      if (session.errorType) {
        const count = errorDistribution.get(session.errorType) || 0;
        errorDistribution.set(session.errorType, count + 1);
      }
    });

    return {
      totalSessions: recentSessions.length,
      successfulSessions: successfulSessions.length,
      failedSessions: failedSessions.length,
      averageDuration: totalDuration / recentSessions.length,
      averageApiCalls: totalApiCalls / recentSessions.length,
      averageConfidence: successfulSessions.length > 0 
        ? totalConfidence / successfulSessions.length 
        : 0,
      averageStages: totalStages / recentSessions.length,
      slowSessions,
      apiCallDistribution,
      stageUsageDistribution,
      errorDistribution,
      timeWindow
    };
  }

  /**
   * 獲取最慢的會話
   */
  getSlowestSessions(limit: number = 10): RecognitionSessionMetrics[] {
    return [...this.sessionMetrics]
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, limit);
  }

  /**
   * 獲取 API 調用統計
   */
  getApiCallStatistics(timeWindow: number = 300000): {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageDuration: number;
    slowCalls: number;
    callsByApi: Map<string, number>;
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;

    const recentCalls = this.apiCallMetrics.filter(
      c => c.startTime >= windowStart
    );

    if (recentCalls.length === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageDuration: 0,
        slowCalls: 0,
        callsByApi: new Map()
      };
    }

    const successfulCalls = recentCalls.filter(c => c.success);
    const failedCalls = recentCalls.filter(c => !c.success);
    const totalDuration = recentCalls.reduce((sum, c) => sum + c.duration, 0);
    const slowCalls = recentCalls.filter(c => c.duration > 3000).length;

    // 按 API 分組
    const callsByApi = new Map<string, number>();
    recentCalls.forEach(call => {
      const count = callsByApi.get(call.apiName) || 0;
      callsByApi.set(call.apiName, count + 1);
    });

    return {
      totalCalls: recentCalls.length,
      successfulCalls: successfulCalls.length,
      failedCalls: failedCalls.length,
      averageDuration: totalDuration / recentCalls.length,
      slowCalls,
      callsByApi
    };
  }

  /**
   * 獲取知識庫查詢統計
   */
  getKnowledgeBaseStatistics(timeWindow: number = 300000): {
    totalQueries: number;
    averageDuration: number;
    cacheHitRate: number;
    averageItemsSearched: number;
    averageItemsMatched: number;
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;

    const recentQueries = this.knowledgeBaseMetrics.filter(
      q => q.timestamp.getTime() >= windowStart
    );

    if (recentQueries.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        cacheHitRate: 0,
        averageItemsSearched: 0,
        averageItemsMatched: 0
      };
    }

    const totalDuration = recentQueries.reduce((sum, q) => sum + q.duration, 0);
    const cacheHits = recentQueries.filter(q => q.cacheHit).length;
    const totalItemsSearched = recentQueries.reduce((sum, q) => sum + q.itemsSearched, 0);
    const totalItemsMatched = recentQueries.reduce((sum, q) => sum + q.itemsMatched, 0);

    return {
      totalQueries: recentQueries.length,
      averageDuration: totalDuration / recentQueries.length,
      cacheHitRate: cacheHits / recentQueries.length,
      averageItemsSearched: totalItemsSearched / recentQueries.length,
      averageItemsMatched: totalItemsMatched / recentQueries.length
    };
  }

  /**
   * 獲取內存使用趨勢
   */
  getMemoryUsageTrend(): {
    averageMemoryMB: number;
    maxMemoryMB: number;
    minMemoryMB: number;
    currentMemoryMB: number;
  } {
    if (this.sessionMetrics.length === 0) {
      const currentMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      return {
        averageMemoryMB: currentMemory,
        maxMemoryMB: currentMemory,
        minMemoryMB: currentMemory,
        currentMemoryMB: currentMemory
      };
    }

    const memoryValues = this.sessionMetrics.map(s => s.memoryUsedMB);
    const totalMemory = memoryValues.reduce((sum, m) => sum + m, 0);
    const currentMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    return {
      averageMemoryMB: totalMemory / memoryValues.length,
      maxMemoryMB: Math.max(...memoryValues),
      minMemoryMB: Math.min(...memoryValues),
      currentMemoryMB: currentMemory
    };
  }

  /**
   * 清理舊的指標數據
   */
  private cleanupOldMetrics(maxAge: number = 1800000): void {
    const cutoff = Date.now() - maxAge;
    
    const initialSessionCount = this.sessionMetrics.length;
    const initialApiCallCount = this.apiCallMetrics.length;
    const initialKbQueryCount = this.knowledgeBaseMetrics.length;

    // 清理會話指標
    this.sessionMetrics = this.sessionMetrics.filter(
      s => s.timestamp.getTime() >= cutoff
    );

    // 清理 API 調用指標
    this.apiCallMetrics = this.apiCallMetrics.filter(
      c => c.startTime >= cutoff
    );

    // 清理知識庫查詢指標
    this.knowledgeBaseMetrics = this.knowledgeBaseMetrics.filter(
      q => q.timestamp.getTime() >= cutoff
    );

    const removedSessions = initialSessionCount - this.sessionMetrics.length;
    const removedApiCalls = initialApiCallCount - this.apiCallMetrics.length;
    const removedKbQueries = initialKbQueryCount - this.knowledgeBaseMetrics.length;

    if (removedSessions > 0 || removedApiCalls > 0 || removedKbQueries > 0) {
      logger.debug('清理舊的性能指標', {
        removedSessions,
        removedApiCalls,
        removedKbQueries,
        remainingSessions: this.sessionMetrics.length,
        remainingApiCalls: this.apiCallMetrics.length,
        remainingKbQueries: this.knowledgeBaseMetrics.length
      });
    }
  }

  /**
   * 生成性能報告
   */
  generatePerformanceReport(timeWindow: number = 300000): string {
    const stats = this.getPerformanceStatistics(timeWindow);
    const apiStats = this.getApiCallStatistics(timeWindow);
    const kbStats = this.getKnowledgeBaseStatistics(timeWindow);
    const memoryTrend = this.getMemoryUsageTrend();

    const report = `
=== 食物識別性能報告 ===
時間窗口: ${timeWindow / 1000} 秒

【識別會話統計】
- 總會話數: ${stats.totalSessions}
- 成功會話: ${stats.successfulSessions} (${((stats.successfulSessions / stats.totalSessions) * 100).toFixed(1)}%)
- 失敗會話: ${stats.failedSessions} (${((stats.failedSessions / stats.totalSessions) * 100).toFixed(1)}%)
- 平均處理時間: ${stats.averageDuration.toFixed(0)}ms
- 平均 API 調用: ${stats.averageApiCalls.toFixed(1)} 次
- 平均信心度: ${(stats.averageConfidence * 100).toFixed(1)}%
- 平均階段數: ${stats.averageStages.toFixed(1)}
- 慢會話數: ${stats.slowSessions} (>${this.SLOW_SESSION_THRESHOLD}ms)

【階段使用分佈】
- 僅階段1: ${stats.stageUsageDistribution.stage1Only} (${((stats.stageUsageDistribution.stage1Only / stats.totalSessions) * 100).toFixed(1)}%)
- 到階段2: ${stats.stageUsageDistribution.stage2} (${((stats.stageUsageDistribution.stage2 / stats.totalSessions) * 100).toFixed(1)}%)
- 到階段3: ${stats.stageUsageDistribution.stage3} (${((stats.stageUsageDistribution.stage3 / stats.totalSessions) * 100).toFixed(1)}%)

【API 調用統計】
- 總調用數: ${apiStats.totalCalls}
- 成功調用: ${apiStats.successfulCalls} (${((apiStats.successfulCalls / apiStats.totalCalls) * 100).toFixed(1)}%)
- 失敗調用: ${apiStats.failedCalls} (${((apiStats.failedCalls / apiStats.totalCalls) * 100).toFixed(1)}%)
- 平均調用時間: ${apiStats.averageDuration.toFixed(0)}ms
- 慢調用數: ${apiStats.slowCalls} (>3000ms)

【知識庫查詢統計】
- 總查詢數: ${kbStats.totalQueries}
- 平均查詢時間: ${kbStats.averageDuration.toFixed(0)}ms
- 緩存命中率: ${(kbStats.cacheHitRate * 100).toFixed(1)}%
- 平均搜索項目: ${kbStats.averageItemsSearched.toFixed(0)}
- 平均匹配項目: ${kbStats.averageItemsMatched.toFixed(0)}

【內存使用】
- 當前內存: ${memoryTrend.currentMemoryMB}MB
- 平均內存: ${memoryTrend.averageMemoryMB.toFixed(0)}MB
- 最大內存: ${memoryTrend.maxMemoryMB}MB
- 最小內存: ${memoryTrend.minMemoryMB}MB

【錯誤分佈】
${Array.from(stats.errorDistribution.entries())
  .map(([error, count]) => `- ${error}: ${count} 次`)
  .join('\n') || '無錯誤'}

生成時間: ${new Date().toISOString()}
========================
`;

    return report;
  }

  /**
   * 重置所有指標
   */
  reset(): void {
    this.sessionMetrics = [];
    this.apiCallMetrics = [];
    this.knowledgeBaseMetrics = [];
    this.currentSessions.clear();
    logger.info('性能監控指標已重置');
  }
}

// 導出單例實例
export const foodRecognitionPerformanceMonitor = FoodRecognitionPerformanceMonitor.getInstance();
