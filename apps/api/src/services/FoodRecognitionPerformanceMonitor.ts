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
 * 成分識別性能指標
 */
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
  
  // API 調用
  visionApiCalls: number;
  visionApiSuccess: boolean;
  
  // 知識庫查詢
  knowledgeBaseQueries: number;
  knowledgeBaseCacheHits: number;
  
  // 營養計算
  nutritionCalculations: number;
  
  // 結果
  averageConfidence: number;
  detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid';
  success: boolean;
  errorMessage?: string;
  
  timestamp: Date;
}

/**
 * 成分識別階段性能
 */
export interface ComponentDetectionStageMetrics {
  stageName: 'vision_api' | 'knowledge_base' | 'nutrition_calculation' | 'validation';
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  itemsProcessed: number;
  errorMessage?: string;
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
  private componentDetectionMetrics: ComponentDetectionMetrics[] = [];
  
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
  
  // 當前成分識別會話追蹤
  private currentComponentSessions: Map<string, {
    sessionId: string;
    userId?: string;
    dishName: string;
    dishType: string;
    startTime: number;
    stages: ComponentDetectionStageMetrics[];
    visionApiCalls: number;
    knowledgeBaseQueries: number;
    knowledgeBaseCacheHits: number;
    nutritionCalculations: number;
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
    const initialComponentCount = this.componentDetectionMetrics.length;

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

    // 清理成分識別指標
    this.componentDetectionMetrics = this.componentDetectionMetrics.filter(
      c => c.timestamp.getTime() >= cutoff
    );

    const removedSessions = initialSessionCount - this.sessionMetrics.length;
    const removedApiCalls = initialApiCallCount - this.apiCallMetrics.length;
    const removedKbQueries = initialKbQueryCount - this.knowledgeBaseMetrics.length;
    const removedComponents = initialComponentCount - this.componentDetectionMetrics.length;

    if (removedSessions > 0 || removedApiCalls > 0 || removedKbQueries > 0 || removedComponents > 0) {
      logger.debug('清理舊的性能指標', {
        removedSessions,
        removedApiCalls,
        removedKbQueries,
        removedComponents,
        remainingSessions: this.sessionMetrics.length,
        remainingApiCalls: this.apiCallMetrics.length,
        remainingKbQueries: this.knowledgeBaseMetrics.length,
        remainingComponents: this.componentDetectionMetrics.length
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
    const componentStats = this.getComponentDetectionStatistics(timeWindow);

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

【成分識別統計】
- 總會話數: ${componentStats.totalSessions}
- 成功會話: ${componentStats.successfulSessions} (${componentStats.totalSessions > 0 ? ((componentStats.successfulSessions / componentStats.totalSessions) * 100).toFixed(1) : 0}%)
- 平均處理時間: ${componentStats.averageDuration.toFixed(0)}ms
- 平均識別成分數: ${componentStats.averageComponentsDetected.toFixed(1)}
- Vision API 成功率: ${(componentStats.visionApiSuccessRate * 100).toFixed(1)}%
- 知識庫緩存命中率: ${(componentStats.knowledgeBaseCacheHitRate * 100).toFixed(1)}%

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
   * 開始成分識別會話
   */
  startComponentDetectionSession(
    sessionId: string,
    dishName: string,
    dishType: string,
    userId?: string
  ): void {
    this.currentComponentSessions.set(sessionId, {
      sessionId,
      userId,
      dishName,
      dishType,
      startTime: Date.now(),
      stages: [],
      visionApiCalls: 0,
      knowledgeBaseQueries: 0,
      knowledgeBaseCacheHits: 0,
      nutritionCalculations: 0
    });

    logger.debug('開始成分識別會話', {
      sessionId,
      dishName,
      dishType,
      userId
    });
  }

  /**
   * 記錄成分識別階段
   */
  recordComponentDetectionStage(
    sessionId: string,
    stageName: 'vision_api' | 'knowledge_base' | 'nutrition_calculation' | 'validation',
    startTime: number,
    endTime: number,
    itemsProcessed: number,
    success: boolean,
    errorMessage?: string
  ): void {
    const session = this.currentComponentSessions.get(sessionId);
    if (!session) {
      logger.warn('找不到成分識別會話', { sessionId });
      return;
    }

    const stageMetrics: ComponentDetectionStageMetrics = {
      stageName,
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      itemsProcessed,
      errorMessage
    };

    session.stages.push(stageMetrics);

    // 更新計數器
    if (stageName === 'vision_api' && success) {
      session.visionApiCalls++;
    } else if (stageName === 'knowledge_base') {
      session.knowledgeBaseQueries++;
    } else if (stageName === 'nutrition_calculation') {
      session.nutritionCalculations += itemsProcessed;
    }

    // 記錄到性能日誌
    performanceLogger.info('成分識別階段完成', {
      sessionId,
      ...stageMetrics
    });

    // 檢查慢階段
    const thresholds = {
      vision_api: 3000,
      knowledge_base: 500,
      nutrition_calculation: 1000,
      validation: 500
    };

    if (stageMetrics.duration > thresholds[stageName]) {
      logger.warn('成分識別階段過慢', {
        sessionId,
        stageName,
        duration: stageMetrics.duration,
        threshold: thresholds[stageName],
        itemsProcessed
      });
    }
  }

  /**
   * 記錄成分識別知識庫緩存命中
   */
  recordComponentKnowledgeBaseCacheHit(sessionId: string): void {
    const session = this.currentComponentSessions.get(sessionId);
    if (session) {
      session.knowledgeBaseCacheHits++;
    }
  }

  /**
   * 結束成分識別會話
   */
  endComponentDetectionSession(
    sessionId: string,
    componentsDetected: number,
    averageConfidence: number,
    detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid',
    success: boolean,
    errorMessage?: string
  ): void {
    const session = this.currentComponentSessions.get(sessionId);
    if (!session) {
      logger.warn('找不到成分識別會話', { sessionId });
      return;
    }

    const endTime = Date.now();
    const totalDuration = endTime - session.startTime;

    // 計算各階段耗時
    const visionApiStages = session.stages.filter(s => s.stageName === 'vision_api');
    const knowledgeBaseStages = session.stages.filter(s => s.stageName === 'knowledge_base');
    const nutritionStages = session.stages.filter(s => s.stageName === 'nutrition_calculation');
    const validationStages = session.stages.filter(s => s.stageName === 'validation');

    const visionApiDuration = visionApiStages.reduce((sum, s) => sum + s.duration, 0);
    const knowledgeBaseDuration = knowledgeBaseStages.reduce((sum, s) => sum + s.duration, 0);
    const nutritionCalculationDuration = nutritionStages.reduce((sum, s) => sum + s.duration, 0);
    const validationDuration = validationStages.reduce((sum, s) => sum + s.duration, 0);

    const visionApiSuccess = visionApiStages.length > 0 && visionApiStages.every(s => s.success);

    const metrics: ComponentDetectionMetrics = {
      sessionId,
      userId: session.userId,
      dishName: session.dishName,
      dishType: session.dishType,
      totalDuration,
      componentsDetected,
      visionApiDuration,
      knowledgeBaseDuration,
      nutritionCalculationDuration,
      validationDuration,
      visionApiCalls: session.visionApiCalls,
      visionApiSuccess,
      knowledgeBaseQueries: session.knowledgeBaseQueries,
      knowledgeBaseCacheHits: session.knowledgeBaseCacheHits,
      nutritionCalculations: session.nutritionCalculations,
      averageConfidence,
      detectionMethod,
      success,
      errorMessage,
      timestamp: new Date()
    };

    // 添加到全局指標
    this.componentDetectionMetrics.push(metrics);

    // 保持指標數量在限制內
    if (this.componentDetectionMetrics.length > this.MAX_METRICS_HISTORY) {
      const removeCount = Math.floor(this.MAX_METRICS_HISTORY * 0.2);
      this.componentDetectionMetrics.splice(0, removeCount);
    }

    // 記錄到性能日誌
    performanceLogger.info('成分識別會話完成', metrics);

    // 檢查慢會話
    if (totalDuration > 8000) {
      logger.warn('成分識別會話過慢', {
        sessionId,
        totalDuration,
        threshold: 8000,
        componentsDetected,
        visionApiDuration,
        knowledgeBaseDuration,
        nutritionCalculationDuration
      });
    }

    // 檢查失敗的會話
    if (!success) {
      logger.error('成分識別會話失敗', {
        sessionId,
        errorMessage,
        totalDuration,
        componentsDetected
      });
    }

    // 清理當前會話
    this.currentComponentSessions.delete(sessionId);
  }

  /**
   * 獲取成分識別性能統計
   */
  getComponentDetectionStatistics(timeWindow: number = 300000): {
    totalSessions: number;
    successfulSessions: number;
    failedSessions: number;
    averageDuration: number;
    averageComponentsDetected: number;
    averageConfidence: number;
    
    // 各階段平均耗時
    averageVisionApiDuration: number;
    averageKnowledgeBaseDuration: number;
    averageNutritionCalculationDuration: number;
    averageValidationDuration: number;
    
    // API 和查詢統計
    totalVisionApiCalls: number;
    visionApiSuccessRate: number;
    totalKnowledgeBaseQueries: number;
    knowledgeBaseCacheHitRate: number;
    totalNutritionCalculations: number;
    
    // 檢測方法分佈
    detectionMethodDistribution: {
      vision_api: number;
      knowledge_base: number;
      hybrid: number;
    };
    
    // 料理類型分佈
    dishTypeDistribution: Map<string, number>;
    
    slowSessions: number;
    timeWindow: number;
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;

    const recentSessions = this.componentDetectionMetrics.filter(
      s => s.timestamp.getTime() >= windowStart
    );

    if (recentSessions.length === 0) {
      return {
        totalSessions: 0,
        successfulSessions: 0,
        failedSessions: 0,
        averageDuration: 0,
        averageComponentsDetected: 0,
        averageConfidence: 0,
        averageVisionApiDuration: 0,
        averageKnowledgeBaseDuration: 0,
        averageNutritionCalculationDuration: 0,
        averageValidationDuration: 0,
        totalVisionApiCalls: 0,
        visionApiSuccessRate: 0,
        totalKnowledgeBaseQueries: 0,
        knowledgeBaseCacheHitRate: 0,
        totalNutritionCalculations: 0,
        detectionMethodDistribution: {
          vision_api: 0,
          knowledge_base: 0,
          hybrid: 0
        },
        dishTypeDistribution: new Map(),
        slowSessions: 0,
        timeWindow
      };
    }

    const successfulSessions = recentSessions.filter(s => s.success);
    const failedSessions = recentSessions.filter(s => !s.success);

    // 計算平均值
    const totalDuration = recentSessions.reduce((sum, s) => sum + s.totalDuration, 0);
    const totalComponents = recentSessions.reduce((sum, s) => sum + s.componentsDetected, 0);
    const totalConfidence = successfulSessions.reduce((sum, s) => sum + s.averageConfidence, 0);
    
    const totalVisionApiDuration = recentSessions.reduce((sum, s) => sum + s.visionApiDuration, 0);
    const totalKnowledgeBaseDuration = recentSessions.reduce((sum, s) => sum + s.knowledgeBaseDuration, 0);
    const totalNutritionCalculationDuration = recentSessions.reduce((sum, s) => sum + s.nutritionCalculationDuration, 0);
    const totalValidationDuration = recentSessions.reduce((sum, s) => sum + s.validationDuration, 0);

    const totalVisionApiCalls = recentSessions.reduce((sum, s) => sum + s.visionApiCalls, 0);
    const successfulVisionApiCalls = recentSessions.filter(s => s.visionApiSuccess).length;
    const totalKnowledgeBaseQueries = recentSessions.reduce((sum, s) => sum + s.knowledgeBaseQueries, 0);
    const totalKnowledgeBaseCacheHits = recentSessions.reduce((sum, s) => sum + s.knowledgeBaseCacheHits, 0);
    const totalNutritionCalculations = recentSessions.reduce((sum, s) => sum + s.nutritionCalculations, 0);

    // 檢測方法分佈
    const detectionMethodDistribution = {
      vision_api: recentSessions.filter(s => s.detectionMethod === 'vision_api').length,
      knowledge_base: recentSessions.filter(s => s.detectionMethod === 'knowledge_base').length,
      hybrid: recentSessions.filter(s => s.detectionMethod === 'hybrid').length
    };

    // 料理類型分佈
    const dishTypeDistribution = new Map<string, number>();
    recentSessions.forEach(session => {
      const count = dishTypeDistribution.get(session.dishType) || 0;
      dishTypeDistribution.set(session.dishType, count + 1);
    });

    const slowSessions = recentSessions.filter(s => s.totalDuration > 8000).length;

    return {
      totalSessions: recentSessions.length,
      successfulSessions: successfulSessions.length,
      failedSessions: failedSessions.length,
      averageDuration: totalDuration / recentSessions.length,
      averageComponentsDetected: totalComponents / recentSessions.length,
      averageConfidence: successfulSessions.length > 0 
        ? totalConfidence / successfulSessions.length 
        : 0,
      averageVisionApiDuration: totalVisionApiDuration / recentSessions.length,
      averageKnowledgeBaseDuration: totalKnowledgeBaseDuration / recentSessions.length,
      averageNutritionCalculationDuration: totalNutritionCalculationDuration / recentSessions.length,
      averageValidationDuration: totalValidationDuration / recentSessions.length,
      totalVisionApiCalls,
      visionApiSuccessRate: totalVisionApiCalls > 0 
        ? successfulVisionApiCalls / totalVisionApiCalls 
        : 0,
      totalKnowledgeBaseQueries,
      knowledgeBaseCacheHitRate: totalKnowledgeBaseQueries > 0 
        ? totalKnowledgeBaseCacheHits / totalKnowledgeBaseQueries 
        : 0,
      totalNutritionCalculations,
      detectionMethodDistribution,
      dishTypeDistribution,
      slowSessions,
      timeWindow
    };
  }

  /**
   * 生成成分識別性能報告
   */
  generateComponentDetectionReport(timeWindow: number = 300000): string {
    const stats = this.getComponentDetectionStatistics(timeWindow);

    const report = `
=== 成分識別性能報告 ===
時間窗口: ${timeWindow / 1000} 秒

【識別會話統計】
- 總會話數: ${stats.totalSessions}
- 成功會話: ${stats.successfulSessions} (${((stats.successfulSessions / stats.totalSessions) * 100).toFixed(1)}%)
- 失敗會話: ${stats.failedSessions} (${((stats.failedSessions / stats.totalSessions) * 100).toFixed(1)}%)
- 平均處理時間: ${stats.averageDuration.toFixed(0)}ms
- 平均識別成分數: ${stats.averageComponentsDetected.toFixed(1)}
- 平均信心度: ${(stats.averageConfidence * 100).toFixed(1)}%
- 慢會話數: ${stats.slowSessions} (>8000ms)

【各階段平均耗時】
- Vision API: ${stats.averageVisionApiDuration.toFixed(0)}ms (${((stats.averageVisionApiDuration / stats.averageDuration) * 100).toFixed(1)}%)
- 知識庫查詢: ${stats.averageKnowledgeBaseDuration.toFixed(0)}ms (${((stats.averageKnowledgeBaseDuration / stats.averageDuration) * 100).toFixed(1)}%)
- 營養計算: ${stats.averageNutritionCalculationDuration.toFixed(0)}ms (${((stats.averageNutritionCalculationDuration / stats.averageDuration) * 100).toFixed(1)}%)
- 驗證: ${stats.averageValidationDuration.toFixed(0)}ms (${((stats.averageValidationDuration / stats.averageDuration) * 100).toFixed(1)}%)

【API 和查詢統計】
- Vision API 調用: ${stats.totalVisionApiCalls} 次
- Vision API 成功率: ${(stats.visionApiSuccessRate * 100).toFixed(1)}%
- 知識庫查詢: ${stats.totalKnowledgeBaseQueries} 次
- 知識庫緩存命中率: ${(stats.knowledgeBaseCacheHitRate * 100).toFixed(1)}%
- 營養計算次數: ${stats.totalNutritionCalculations}

【檢測方法分佈】
- Vision API: ${stats.detectionMethodDistribution.vision_api} (${((stats.detectionMethodDistribution.vision_api / stats.totalSessions) * 100).toFixed(1)}%)
- 知識庫: ${stats.detectionMethodDistribution.knowledge_base} (${((stats.detectionMethodDistribution.knowledge_base / stats.totalSessions) * 100).toFixed(1)}%)
- 混合: ${stats.detectionMethodDistribution.hybrid} (${((stats.detectionMethodDistribution.hybrid / stats.totalSessions) * 100).toFixed(1)}%)

【料理類型分佈】
${Array.from(stats.dishTypeDistribution.entries())
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- ${type}: ${count} (${((count / stats.totalSessions) * 100).toFixed(1)}%)`)
  .join('\n') || '無數據'}

生成時間: ${new Date().toISOString()}
========================
`;

    return report;
  }

  /**
   * 獲取最慢的成分識別會話
   */
  getSlowestComponentDetectionSessions(limit: number = 10): ComponentDetectionMetrics[] {
    return [...this.componentDetectionMetrics]
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, limit);
  }

  /**
   * 重置所有指標
   */
  reset(): void {
    this.sessionMetrics = [];
    this.apiCallMetrics = [];
    this.knowledgeBaseMetrics = [];
    this.componentDetectionMetrics = [];
    this.currentSessions.clear();
    this.currentComponentSessions.clear();
    logger.info('性能監控指標已重置');
  }
}

// 導出單例實例
export const foodRecognitionPerformanceMonitor = FoodRecognitionPerformanceMonitor.getInstance();
