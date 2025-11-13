/**
 * 食物識別監控路由
 * Food Recognition Monitoring Routes
 */

import { Router, Request, Response } from 'express';
import { foodRecognitionPerformanceMonitor } from '../services/FoodRecognitionPerformanceMonitor';
import { foodRecognitionLogger } from '../services/FoodRecognitionLogger';
import { recognitionResultCache } from '../services/RecognitionResultCache';
import { knowledgeBaseQueryOptimizer } from '../services/KnowledgeBaseQueryOptimizer';
import { requireAuth } from '../middleware/auth';

const router = Router();
const auth = requireAuth();

/**
 * GET /api/food-recognition/monitoring/performance
 * 獲取性能統計
 */
router.get('/performance', auth, async (req: Request, res: Response) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow as string) || 300000; // 預設 5 分鐘

    const stats = foodRecognitionPerformanceMonitor.getPerformanceStatistics(timeWindow);
    const apiStats = foodRecognitionPerformanceMonitor.getApiCallStatistics(timeWindow);
    const kbStats = foodRecognitionPerformanceMonitor.getKnowledgeBaseStatistics(timeWindow);
    const memoryTrend = foodRecognitionPerformanceMonitor.getMemoryUsageTrend();

    res.json({
      success: true,
      data: {
        timeWindow: timeWindow / 1000, // 轉換為秒
        recognition: stats,
        apiCalls: apiStats,
        knowledgeBase: kbStats,
        memory: memoryTrend,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'MONITORING_ERROR',
        message: error instanceof Error ? error.message : '獲取性能統計失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/performance/report
 * 獲取性能報告
 */
router.get('/performance/report', auth, async (req: Request, res: Response) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow as string) || 300000;
    const report = foodRecognitionPerformanceMonitor.generatePerformanceReport(timeWindow);

    res.type('text/plain').send(report);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error instanceof Error ? error.message : '生成性能報告失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/performance/slowest
 * 獲取最慢的識別會話
 */
router.get('/performance/slowest', auth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const slowestSessions = foodRecognitionPerformanceMonitor.getSlowestSessions(limit);

    res.json({
      success: true,
      data: {
        sessions: slowestSessions,
        count: slowestSessions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'MONITORING_ERROR',
        message: error instanceof Error ? error.message : '獲取最慢會話失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/logs
 * 獲取識別日誌
 */
router.get('/logs', auth, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const recognitionLogs = foodRecognitionLogger.getRecentRecognitionLogs(limit);
    const errorLogs = foodRecognitionLogger.getRecentErrorLogs(limit);

    res.json({
      success: true,
      data: {
        recognitionLogs,
        errorLogs,
        recognitionCount: recognitionLogs.length,
        errorCount: errorLogs.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOG_ERROR',
        message: error instanceof Error ? error.message : '獲取日誌失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/logs/statistics
 * 獲取日誌統計
 */
router.get('/logs/statistics', auth, async (req: Request, res: Response) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow as string) || 3600000; // 預設 1 小時
    const stats = foodRecognitionLogger.getLogStatistics(timeWindow);

    res.json({
      success: true,
      data: {
        timeWindow: timeWindow / 1000 / 60, // 轉換為分鐘
        ...stats,
        errorsByType: Array.from(stats.errorsByType.entries()).map(([type, count]) => ({
          type,
          count
        })),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'STATISTICS_ERROR',
        message: error instanceof Error ? error.message : '獲取日誌統計失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/logs/report
 * 獲取日誌報告
 */
router.get('/logs/report', auth, async (req: Request, res: Response) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow as string) || 3600000;
    const report = foodRecognitionLogger.generateLogReport(timeWindow);

    res.type('text/plain').send(report);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error instanceof Error ? error.message : '生成日誌報告失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/cache
 * 獲取緩存統計
 */
router.get('/cache', auth, async (req: Request, res: Response) => {
  try {
    const resultCacheStats = recognitionResultCache.getStatistics();
    const kbCacheStats = knowledgeBaseQueryOptimizer.getCacheStatistics();

    res.json({
      success: true,
      data: {
        resultCache: resultCacheStats,
        knowledgeBaseCache: kbCacheStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CACHE_ERROR',
        message: error instanceof Error ? error.message : '獲取緩存統計失敗'
      }
    });
  }
});

/**
 * POST /api/food-recognition/monitoring/cache/clear
 * 清空緩存（需要認證）
 */
router.post('/cache/clear', auth, async (req: Request, res: Response) => {
  try {
    // 檢查是否已認證
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要認證才能清空緩存'
        }
      });
    }

    recognitionResultCache.clear();
    knowledgeBaseQueryOptimizer.clearCache();

    res.json({
      success: true,
      message: '緩存已清空',
      clearedBy: req.user.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CACHE_CLEAR_ERROR',
        message: error instanceof Error ? error.message : '清空緩存失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/dashboard
 * 獲取監控儀表板數據
 */
router.get('/dashboard', auth, async (req: Request, res: Response) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow as string) || 300000; // 5 分鐘

    // 收集所有監控數據
    const performanceStats = foodRecognitionPerformanceMonitor.getPerformanceStatistics(timeWindow);
    const apiStats = foodRecognitionPerformanceMonitor.getApiCallStatistics(timeWindow);
    const kbStats = foodRecognitionPerformanceMonitor.getKnowledgeBaseStatistics(timeWindow);
    const memoryTrend = foodRecognitionPerformanceMonitor.getMemoryUsageTrend();
    const logStats = foodRecognitionLogger.getLogStatistics(timeWindow);
    const resultCacheStats = recognitionResultCache.getStatistics();
    const kbCacheStats = knowledgeBaseQueryOptimizer.getCacheStatistics();
    const slowestSessions = foodRecognitionPerformanceMonitor.getSlowestSessions(5);

    res.json({
      success: true,
      data: {
        timeWindow: timeWindow / 1000, // 秒
        overview: {
          totalSessions: performanceStats.totalSessions,
          successRate: performanceStats.totalSessions > 0
            ? (performanceStats.successfulSessions / performanceStats.totalSessions) * 100
            : 0,
          averageDuration: performanceStats.averageDuration,
          averageConfidence: performanceStats.averageConfidence * 100,
          averageApiCalls: performanceStats.averageApiCalls
        },
        performance: {
          slowSessions: performanceStats.slowSessions,
          slowSessionRate: performanceStats.totalSessions > 0
            ? (performanceStats.slowSessions / performanceStats.totalSessions) * 100
            : 0,
          stageDistribution: performanceStats.stageUsageDistribution,
          apiCallDistribution: performanceStats.apiCallDistribution
        },
        quality: {
          lowConfidenceRecognitions: logStats.lowConfidenceRecognitions,
          lowConfidenceRate: logStats.totalRecognitions > 0
            ? (logStats.lowConfidenceRecognitions / logStats.totalRecognitions) * 100
            : 0,
          averageConfidence: logStats.averageConfidence * 100
        },
        api: {
          totalCalls: apiStats.totalCalls,
          successRate: apiStats.totalCalls > 0
            ? (apiStats.successfulCalls / apiStats.totalCalls) * 100
            : 0,
          averageDuration: apiStats.averageDuration,
          slowCalls: apiStats.slowCalls,
          callsByApi: Array.from(apiStats.callsByApi.entries()).map(([api, count]) => ({
            api,
            count
          }))
        },
        knowledgeBase: {
          totalQueries: kbStats.totalQueries,
          averageDuration: kbStats.averageDuration,
          cacheHitRate: kbStats.cacheHitRate * 100,
          averageItemsSearched: kbStats.averageItemsSearched,
          averageItemsMatched: kbStats.averageItemsMatched
        },
        cache: {
          resultCache: {
            size: resultCacheStats.totalEntries,
            hitRate: resultCacheStats.hitRate * 100,
            totalHits: resultCacheStats.totalHits,
            totalMisses: resultCacheStats.totalMisses
          },
          knowledgeBaseCache: {
            queryCache: {
              size: kbCacheStats.query.cacheSize,
              hitRate: kbCacheStats.query.hitRate * 100
            },
            matchCache: {
              size: kbCacheStats.match.cacheSize,
              hitRate: kbCacheStats.match.hitRate * 100
            }
          }
        },
        memory: memoryTrend,
        errors: {
          totalErrors: logStats.failedRecognitions,
          errorRate: (logStats.totalRecognitions + logStats.failedRecognitions) > 0
            ? (logStats.failedRecognitions / (logStats.totalRecognitions + logStats.failedRecognitions)) * 100
            : 0,
          errorsByType: Array.from(logStats.errorsByType.entries()).map(([type, count]) => ({
            type,
            count
          }))
        },
        slowestSessions: slowestSessions.slice(0, 5),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_ERROR',
        message: error instanceof Error ? error.message : '獲取儀表板數據失敗'
      }
    });
  }
});

/**
 * GET /api/food-recognition/monitoring/health
 * 健康檢查端點
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const performanceStats = foodRecognitionPerformanceMonitor.getPerformanceStatistics(60000); // 1 分鐘
    const memoryTrend = foodRecognitionPerformanceMonitor.getMemoryUsageTrend();
    const cacheStats = recognitionResultCache.getStatistics();

    // 判斷健康狀態
    const isHealthy = 
      performanceStats.averageDuration < 10000 && // 平均處理時間 < 10 秒
      memoryTrend.currentMemoryMB < 1024 && // 內存使用 < 1GB
      (performanceStats.totalSessions === 0 || 
       performanceStats.successfulSessions / performanceStats.totalSessions > 0.9); // 成功率 > 90%

    res.status(isHealthy ? 200 : 503).json({
      success: true,
      status: isHealthy ? 'healthy' : 'degraded',
      checks: {
        performance: {
          status: performanceStats.averageDuration < 10000 ? 'pass' : 'fail',
          averageDuration: performanceStats.averageDuration,
          threshold: 10000
        },
        memory: {
          status: memoryTrend.currentMemoryMB < 1024 ? 'pass' : 'fail',
          currentMemoryMB: memoryTrend.currentMemoryMB,
          threshold: 1024
        },
        successRate: {
          status: performanceStats.totalSessions === 0 || 
                  performanceStats.successfulSessions / performanceStats.totalSessions > 0.9 
                  ? 'pass' : 'fail',
          rate: performanceStats.totalSessions > 0 
                ? (performanceStats.successfulSessions / performanceStats.totalSessions) * 100 
                : 100,
          threshold: 90
        },
        cache: {
          status: 'pass',
          hitRate: cacheStats.hitRate * 100,
          size: cacheStats.totalEntries
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: {
        code: 'HEALTH_CHECK_ERROR',
        message: error instanceof Error ? error.message : '健康檢查失敗'
      }
    });
  }
});

export default router;
