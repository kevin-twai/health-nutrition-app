/**
 * 食物識別日誌記錄器
 * Food Recognition Logger
 * 
 * 專門用於記錄食物識別系統的詳細日誌
 */

import { logger, performanceLogger, auditLogger } from '../config/logging';
import { EnhancedRecognitionResult, RecognitionStage } from './MultiStageRecognitionEngine';

/**
 * 識別日誌條目
 */
export interface RecognitionLogEntry {
  sessionId: string;
  userId?: string;
  timestamp: Date;
  imageSize: number;
  imageFormat: string;
  stages: {
    stageNumber: number;
    stageName: string;
    duration: number;
    apiCalls: number;
    confidence: number;
    foodsDetected: number;
    promptUsed?: string;
    apiResponse?: any;
  }[];
  finalResult: {
    confidence: number;
    foodsCount: number;
    totalDuration: number;
    totalApiCalls: number;
    success: boolean;
  };
  errorInfo?: {
    errorType: string;
    errorMessage: string;
    stack?: string;
  };
}

/**
 * 錯誤日誌條目
 */
export interface ErrorLogEntry {
  sessionId: string;
  userId?: string;
  timestamp: Date;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  context: {
    imageSize?: number;
    stagesCompleted?: number;
    lastStageConfidence?: number;
  };
}

/**
 * 食物識別日誌記錄器類
 */
export class FoodRecognitionLogger {
  private static instance: FoodRecognitionLogger;
  
  // 日誌存儲（用於分析）
  private recognitionLogs: RecognitionLogEntry[] = [];
  private errorLogs: ErrorLogEntry[] = [];
  
  // 配置
  private readonly MAX_LOG_HISTORY = 1000;
  private readonly CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 分鐘

  private constructor() {
    this.setupAutoCleanup();
    logger.info('✅ FoodRecognitionLogger 已初始化');
  }

  static getInstance(): FoodRecognitionLogger {
    if (!FoodRecognitionLogger.instance) {
      FoodRecognitionLogger.instance = new FoodRecognitionLogger();
    }
    return FoodRecognitionLogger.instance;
  }

  /**
   * 設置自動清理
   */
  private setupAutoCleanup(): void {
    setInterval(() => {
      this.cleanupOldLogs();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 記錄識別會話開始
   */
  logRecognitionStart(
    sessionId: string,
    imageSize: number,
    imageFormat: string,
    userId?: string
  ): void {
    logger.info('🔍 識別會話開始', {
      sessionId,
      userId,
      imageSize,
      imageFormat,
      timestamp: new Date().toISOString()
    });

    // 審計日誌
    if (userId) {
      auditLogger.info('食物識別請求', {
        action: 'food_recognition_start',
        userId,
        sessionId,
        imageSize,
        imageFormat
      });
    }
  }

  /**
   * 記錄識別階段
   */
  logRecognitionStage(
    sessionId: string,
    stageNumber: number,
    stageName: string,
    duration: number,
    apiCalls: number,
    confidence: number,
    foodsDetected: number,
    promptUsed?: string,
    apiResponse?: any
  ): void {
    performanceLogger.info('識別階段完成', {
      sessionId,
      stageNumber,
      stageName,
      duration,
      apiCalls,
      confidence,
      foodsDetected,
      timestamp: new Date().toISOString()
    });

    // 詳細日誌（僅在開發環境）
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('識別階段詳細信息', {
        sessionId,
        stageNumber,
        stageName,
        promptUsed: promptUsed?.substring(0, 200) + '...',
        apiResponse: apiResponse ? JSON.stringify(apiResponse).substring(0, 500) + '...' : undefined
      });
    }
  }

  /**
   * 記錄識別會話完成
   */
  logRecognitionComplete(
    sessionId: string,
    result: EnhancedRecognitionResult,
    userId?: string
  ): void {
    const logEntry: RecognitionLogEntry = {
      sessionId,
      userId,
      timestamp: new Date(),
      imageSize: 0, // 將在調用時設置
      imageFormat: 'jpeg',
      stages: result.stages.map(stage => ({
        stageNumber: stage.attempt,
        stageName: stage.promptType,
        duration: stage.processingTime,
        apiCalls: stage.apiCalls,
        confidence: stage.confidence,
        foodsDetected: stage.result.foods.length
      })),
      finalResult: {
        confidence: result.confidence,
        foodsCount: result.foods.length,
        totalDuration: result.totalProcessingTime,
        totalApiCalls: result.totalApiCalls,
        success: true
      }
    };

    // 添加到日誌存儲
    this.recognitionLogs.push(logEntry);

    // 保持日誌數量在限制內
    if (this.recognitionLogs.length > this.MAX_LOG_HISTORY) {
      const removeCount = Math.floor(this.MAX_LOG_HISTORY * 0.2);
      this.recognitionLogs.splice(0, removeCount);
    }

    // 記錄到主日誌
    logger.info('✅ 識別會話完成', {
      sessionId,
      userId,
      confidence: result.confidence,
      foodsCount: result.foods.length,
      totalDuration: result.totalProcessingTime,
      totalApiCalls: result.totalApiCalls,
      stagesExecuted: result.stages.length,
      timestamp: new Date().toISOString()
    });

    // 審計日誌
    if (userId) {
      auditLogger.info('食物識別完成', {
        action: 'food_recognition_complete',
        userId,
        sessionId,
        confidence: result.confidence,
        foodsCount: result.foods.length,
        totalDuration: result.totalProcessingTime
      });
    }

    // 檢查是否為慢會話
    if (result.totalProcessingTime > 8000) {
      logger.warn('⚠️ 識別會話過慢', {
        sessionId,
        totalDuration: result.totalProcessingTime,
        threshold: 8000,
        stagesExecuted: result.stages.length,
        totalApiCalls: result.totalApiCalls
      });
    }

    // 檢查低信心度
    if (result.confidence < 0.7) {
      logger.warn('⚠️ 識別信心度較低', {
        sessionId,
        confidence: result.confidence,
        threshold: 0.7,
        foodsCount: result.foods.length
      });
    }
  }

  /**
   * 記錄識別錯誤
   */
  logRecognitionError(
    sessionId: string,
    error: Error,
    context: {
      userId?: string;
      imageSize?: number;
      stagesCompleted?: number;
      lastStageConfidence?: number;
    }
  ): void {
    const errorEntry: ErrorLogEntry = {
      sessionId,
      userId: context.userId,
      timestamp: new Date(),
      errorType: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      context: {
        imageSize: context.imageSize,
        stagesCompleted: context.stagesCompleted,
        lastStageConfidence: context.lastStageConfidence
      }
    };

    // 添加到錯誤日誌存儲
    this.errorLogs.push(errorEntry);

    // 保持錯誤日誌數量在限制內
    if (this.errorLogs.length > this.MAX_LOG_HISTORY) {
      const removeCount = Math.floor(this.MAX_LOG_HISTORY * 0.2);
      this.errorLogs.splice(0, removeCount);
    }

    // 記錄到主日誌
    logger.error('❌ 識別會話錯誤', {
      sessionId,
      userId: context.userId,
      errorType: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // 審計日誌
    if (context.userId) {
      auditLogger.error('食物識別失敗', {
        action: 'food_recognition_error',
        userId: context.userId,
        sessionId,
        errorType: error.name,
        errorMessage: error.message
      });
    }
  }

  /**
   * 記錄 API 調用
   */
  logApiCall(
    sessionId: string,
    apiName: string,
    duration: number,
    success: boolean,
    details?: {
      endpoint?: string;
      requestSize?: number;
      responseSize?: number;
      statusCode?: number;
      errorMessage?: string;
      retryCount?: number;
    }
  ): void {
    performanceLogger.info('API 調用', {
      sessionId,
      apiName,
      duration,
      success,
      ...details,
      timestamp: new Date().toISOString()
    });

    // 檢查慢 API 調用
    if (duration > 3000) {
      logger.warn('⚠️ API 調用過慢', {
        sessionId,
        apiName,
        duration,
        threshold: 3000,
        endpoint: details?.endpoint
      });
    }

    // 檢查失敗的 API 調用
    if (!success) {
      logger.error('❌ API 調用失敗', {
        sessionId,
        apiName,
        duration,
        errorMessage: details?.errorMessage,
        retryCount: details?.retryCount,
        statusCode: details?.statusCode
      });
    }
  }

  /**
   * 記錄知識庫查詢
   */
  logKnowledgeBaseQuery(
    sessionId: string,
    queryType: string,
    duration: number,
    itemsSearched: number,
    itemsMatched: number,
    cacheHit: boolean
  ): void {
    performanceLogger.info('知識庫查詢', {
      sessionId,
      queryType,
      duration,
      itemsSearched,
      itemsMatched,
      cacheHit,
      timestamp: new Date().toISOString()
    });

    // 檢查慢查詢
    if (duration > 100) {
      logger.warn('⚠️ 知識庫查詢過慢', {
        sessionId,
        queryType,
        duration,
        threshold: 100,
        itemsSearched
      });
    }
  }

  /**
   * 獲取最近的識別日誌
   */
  getRecentRecognitionLogs(limit: number = 50): RecognitionLogEntry[] {
    return this.recognitionLogs.slice(-limit);
  }

  /**
   * 獲取最近的錯誤日誌
   */
  getRecentErrorLogs(limit: number = 50): ErrorLogEntry[] {
    return this.errorLogs.slice(-limit);
  }

  /**
   * 獲取日誌統計
   */
  getLogStatistics(timeWindow: number = 3600000): {
    totalRecognitions: number;
    successfulRecognitions: number;
    failedRecognitions: number;
    averageConfidence: number;
    averageDuration: number;
    averageApiCalls: number;
    errorsByType: Map<string, number>;
    slowRecognitions: number;
    lowConfidenceRecognitions: number;
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;

    // 過濾時間窗口內的日誌
    const recentLogs = this.recognitionLogs.filter(
      log => log.timestamp.getTime() >= windowStart
    );

    const recentErrors = this.errorLogs.filter(
      log => log.timestamp.getTime() >= windowStart
    );

    if (recentLogs.length === 0) {
      return {
        totalRecognitions: 0,
        successfulRecognitions: 0,
        failedRecognitions: recentErrors.length,
        averageConfidence: 0,
        averageDuration: 0,
        averageApiCalls: 0,
        errorsByType: new Map(),
        slowRecognitions: 0,
        lowConfidenceRecognitions: 0
      };
    }

    // 計算統計數據
    const totalConfidence = recentLogs.reduce(
      (sum, log) => sum + log.finalResult.confidence,
      0
    );
    const totalDuration = recentLogs.reduce(
      (sum, log) => sum + log.finalResult.totalDuration,
      0
    );
    const totalApiCalls = recentLogs.reduce(
      (sum, log) => sum + log.finalResult.totalApiCalls,
      0
    );

    const slowRecognitions = recentLogs.filter(
      log => log.finalResult.totalDuration > 8000
    ).length;

    const lowConfidenceRecognitions = recentLogs.filter(
      log => log.finalResult.confidence < 0.7
    ).length;

    // 錯誤分佈
    const errorsByType = new Map<string, number>();
    recentErrors.forEach(error => {
      const count = errorsByType.get(error.errorType) || 0;
      errorsByType.set(error.errorType, count + 1);
    });

    return {
      totalRecognitions: recentLogs.length,
      successfulRecognitions: recentLogs.filter(log => log.finalResult.success).length,
      failedRecognitions: recentErrors.length,
      averageConfidence: totalConfidence / recentLogs.length,
      averageDuration: totalDuration / recentLogs.length,
      averageApiCalls: totalApiCalls / recentLogs.length,
      errorsByType,
      slowRecognitions,
      lowConfidenceRecognitions
    };
  }

  /**
   * 清理舊日誌
   */
  private cleanupOldLogs(maxAge: number = 3600000): void {
    const cutoff = Date.now() - maxAge;

    const initialRecognitionCount = this.recognitionLogs.length;
    const initialErrorCount = this.errorLogs.length;

    // 清理識別日誌
    this.recognitionLogs = this.recognitionLogs.filter(
      log => log.timestamp.getTime() >= cutoff
    );

    // 清理錯誤日誌
    this.errorLogs = this.errorLogs.filter(
      log => log.timestamp.getTime() >= cutoff
    );

    const removedRecognitions = initialRecognitionCount - this.recognitionLogs.length;
    const removedErrors = initialErrorCount - this.errorLogs.length;

    if (removedRecognitions > 0 || removedErrors > 0) {
      logger.debug('清理舊的識別日誌', {
        removedRecognitions,
        removedErrors,
        remainingRecognitions: this.recognitionLogs.length,
        remainingErrors: this.errorLogs.length
      });
    }
  }

  /**
   * 生成日誌報告
   */
  generateLogReport(timeWindow: number = 3600000): string {
    const stats = this.getLogStatistics(timeWindow);

    const report = `
=== 食物識別日誌報告 ===
時間窗口: ${timeWindow / 1000 / 60} 分鐘

【識別統計】
- 總識別次數: ${stats.totalRecognitions}
- 成功識別: ${stats.successfulRecognitions} (${((stats.successfulRecognitions / stats.totalRecognitions) * 100).toFixed(1)}%)
- 失敗識別: ${stats.failedRecognitions} (${((stats.failedRecognitions / (stats.totalRecognitions + stats.failedRecognitions)) * 100).toFixed(1)}%)
- 平均信心度: ${(stats.averageConfidence * 100).toFixed(1)}%
- 平均處理時間: ${stats.averageDuration.toFixed(0)}ms
- 平均 API 調用: ${stats.averageApiCalls.toFixed(1)} 次

【質量指標】
- 慢識別 (>8s): ${stats.slowRecognitions} (${((stats.slowRecognitions / stats.totalRecognitions) * 100).toFixed(1)}%)
- 低信心度 (<70%): ${stats.lowConfidenceRecognitions} (${((stats.lowConfidenceRecognitions / stats.totalRecognitions) * 100).toFixed(1)}%)

【錯誤分佈】
${Array.from(stats.errorsByType.entries())
  .map(([type, count]) => `- ${type}: ${count} 次`)
  .join('\n') || '無錯誤'}

生成時間: ${new Date().toISOString()}
========================
`;

    return report;
  }

  /**
   * 清空所有日誌
   */
  clear(): void {
    this.recognitionLogs = [];
    this.errorLogs = [];
    logger.info('識別日誌已清空');
  }
}

// 導出單例實例
export const foodRecognitionLogger = FoodRecognitionLogger.getInstance();
