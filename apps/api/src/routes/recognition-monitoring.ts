/**
 * 識別一致性監控 API 路由
 * Recognition Consistency Monitoring API Routes
 */

import { Router, Request, Response } from 'express';
import { recognitionConsistencyMonitor } from '../services/RecognitionConsistencyMonitor';
import { ApiResponse } from '../types/shared';

const router = Router();

/**
 * 獲取性能統計
 * GET /api/v1/recognition-monitoring/statistics
 * 
 * 查詢參數：
 * - timeWindow: number - 時間窗口（毫秒），預設 300000 (5分鐘)
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const timeWindow = req.query.timeWindow 
      ? parseInt(req.query.timeWindow as string) 
      : 300000;
    
    const statistics = recognitionConsistencyMonitor.getStatistics(timeWindow);
    
    res.status(200).json({
      success: true,
      data: {
        ...statistics,
        errorDistribution: Array.from(statistics.errorDistribution.entries()).map(
          ([error, count]) => ({ error, count })
        )
      },
      timestamp: new Date()
    } as ApiResponse<any>);
  } catch (error) {
    console.error('獲取性能統計失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATISTICS_FAILED',
        message: error instanceof Error ? error.message : '獲取性能統計失敗'
      },
      timestamp: new Date()
    } as ApiResponse<null>);
  }
});

/**
 * 生成性能報告
 * GET /api/v1/recognition-monitoring/report
 * 
 * 查詢參數：
 * - timeWindow: number - 時間窗口（毫秒），預設 300000 (5分鐘)
 * - format: 'text' | 'json' - 報告格式，預設 'text'
 */
router.get('/report', async (req: Request, res: Response) => {
  try {
    const timeWindow = req.query.timeWindow 
      ? parseInt(req.query.timeWindow as string) 
      : 300000;
    
    const format = (req.query.format as string) || 'text';
    
    if (format === 'json') {
      const statistics = recognitionConsistencyMonitor.getStatistics(timeWindow);
      res.status(200).json({
        success: true,
        data: {
          ...statistics,
          errorDistribution: Array.from(statistics.errorDistribution.entries()).map(
            ([error, count]) => ({ error, count })
          )
        },
        timestamp: new Date()
      } as ApiResponse<any>);
    } else {
      const report = recognitionConsistencyMonitor.generateReport(timeWindow);
      res.status(200).type('text/plain').send(report);
    }
  } catch (error) {
    console.error('生成性能報告失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REPORT_FAILED',
        message: error instanceof Error ? error.message : '生成性能報告失敗'
      },
      timestamp: new Date()
    } as ApiResponse<null>);
  }
});

/**
 * 獲取最慢的會話
 * GET /api/v1/recognition-monitoring/slowest-sessions
 * 
 * 查詢參數：
 * - limit: number - 返回數量，預設 10
 */
router.get('/slowest-sessions', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit 
      ? parseInt(req.query.limit as string) 
      : 10;
    
    const sessions = recognitionConsistencyMonitor.getSlowestSessions(limit);
    
    res.status(200).json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      },
      timestamp: new Date()
    } as ApiResponse<any>);
  } catch (error) {
    console.error('獲取最慢會話失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SLOWEST_SESSIONS_FAILED',
        message: error instanceof Error ? error.message : '獲取最慢會話失敗'
      },
      timestamp: new Date()
    } as ApiResponse<null>);
  }
});

/**
 * 獲取一致性最差的會話
 * GET /api/v1/recognition-monitoring/worst-consistency-sessions
 * 
 * 查詢參數：
 * - limit: number - 返回數量，預設 10
 */
router.get('/worst-consistency-sessions', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit 
      ? parseInt(req.query.limit as string) 
      : 10;
    
    const sessions = recognitionConsistencyMonitor.getWorstConsistencySessions(limit);
    
    res.status(200).json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      },
      timestamp: new Date()
    } as ApiResponse<any>);
  } catch (error) {
    console.error('獲取一致性最差會話失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WORST_CONSISTENCY_FAILED',
        message: error instanceof Error ? error.message : '獲取一致性最差會話失敗'
      },
      timestamp: new Date()
    } as ApiResponse<null>);
  }
});

/**
 * 獲取錯誤會話
 * GET /api/v1/recognition-monitoring/error-sessions
 * 
 * 查詢參數：
 * - limit: number - 返回數量，預設 10
 */
router.get('/error-sessions', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit 
      ? parseInt(req.query.limit as string) 
      : 10;
    
    const sessions = recognitionConsistencyMonitor.getErrorSessions(limit);
    
    res.status(200).json({
      success: true,
      data: {
        sessions,
        count: sessions.length
      },
      timestamp: new Date()
    } as ApiResponse<any>);
  } catch (error) {
    console.error('獲取錯誤會話失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ERROR_SESSIONS_FAILED',
        message: error instanceof Error ? error.message : '獲取錯誤會話失敗'
      },
      timestamp: new Date()
    } as ApiResponse<null>);
  }
});

/**
 * 重置監控指標
 * POST /api/v1/recognition-monitoring/reset
 * 
 * 注意：此操作會清除所有歷史指標數據
 */
router.post('/reset', async (req: Request, res: Response) => {
  try {
    recognitionConsistencyMonitor.reset();
    
    res.status(200).json({
      success: true,
      data: {
        message: '監控指標已重置'
      },
      timestamp: new Date()
    } as ApiResponse<any>);
  } catch (error) {
    console.error('重置監控指標失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_FAILED',
        message: error instanceof Error ? error.message : '重置監控指標失敗'
      },
      timestamp: new Date()
    } as ApiResponse<null>);
  }
});

/**
 * 健康檢查
 * GET /api/v1/recognition-monitoring/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const statistics = recognitionConsistencyMonitor.getStatistics(60000); // 最近1分鐘
    
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        monitoring: {
          enabled: true,
          recentSessions: statistics.totalSessions,
          successRate: statistics.successRate,
          averageProcessingTime: statistics.averageTotalProcessingTime
        }
      },
      timestamp: new Date()
    } as ApiResponse<any>);
  } catch (error) {
    console.error('健康檢查失敗:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: error instanceof Error ? error.message : '健康檢查失敗'
      },
      timestamp: new Date()
    } as ApiResponse<null>);
  }
});

export default router;
