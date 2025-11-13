import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { createAuthMiddleware } from '../middleware/auth';
import { DataAggregator } from '../services/DataAggregator';
import { TrendAnalyzer } from '../services/TrendAnalyzer';
import { ReportScheduler } from '../services/ReportScheduler';
import { DeliveryManager } from '../services/DeliveryManager';
import { LogRepository } from '../repositories/LogRepository';
import { UserRepository } from '../repositories/UserRepository';
import { db } from '../database/connection';
import { mongodb } from '../database/mongodb';
import { redisConnection } from '../database/redis';

const authMiddleware = createAuthMiddleware();
const router = Router();

// 初始化依賴項（在實際應用中，這些應該通過依賴注入容器管理）
let reportController: ReportController;

const initializeController = async () => {
  if (!reportController) {
    const pgPool = db.getPool();
    const mongoDb = mongodb.getDb();
    const redis = redisConnection.getClient() || undefined;

    const logRepository = new LogRepository(pgPool, mongoDb, redis);
    const userRepository = new UserRepository(pgPool, redis);
    
    const dataAggregator = new DataAggregator(logRepository, userRepository);
    const trendAnalyzer = new TrendAnalyzer(dataAggregator, userRepository);
    const deliveryManager = new DeliveryManager();
    const reportScheduler = new ReportScheduler(
      dataAggregator,
      trendAnalyzer,
      userRepository,
      deliveryManager
    );

    reportController = new ReportController(
      dataAggregator,
      trendAnalyzer,
      reportScheduler,
      deliveryManager
    );
  }
  return reportController;
};

// 中間件：確保控制器已初始化
const ensureController = async (req: any, res: any, next: any) => {
  try {
    await initializeController();
    next();
  } catch (error) {
    console.error('初始化報告控制器失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INITIALIZATION_ERROR',
        message: '服務初始化失敗'
      }
    });
  }
};

// 應用認證中間件到所有路由
router.use(authMiddleware);
router.use(ensureController);

/**
 * @route POST /api/reports/generate
 * @desc 生成即時報告
 * @access Private
 */
router.post('/generate', async (req, res) => {
  await reportController.generateReport(req, res);
});

/**
 * @route GET /api/reports/history
 * @desc 獲取報告歷史
 * @access Private
 */
router.get('/history', async (req, res) => {
  await reportController.getReportHistory(req, res);
});

/**
 * @route GET /api/reports/:reportId
 * @desc 獲取特定報告
 * @access Private
 */
router.get('/:reportId', async (req, res) => {
  await reportController.getReport(req, res);
});

/**
 * @route GET /api/reports/:reportId/download
 * @desc 下載報告（PDF/HTML 格式）
 * @access Private
 */
router.get('/:reportId/download', async (req, res) => {
  await reportController.downloadReport(req, res);
});

/**
 * @route POST /api/reports/schedule
 * @desc 建立報告排程
 * @access Private
 */
router.post('/schedule', async (req, res) => {
  await reportController.createSchedule(req, res);
});

/**
 * @route GET /api/reports/schedules
 * @desc 獲取用戶的報告排程
 * @access Private
 */
router.get('/schedules', async (req, res) => {
  await reportController.getSchedules(req, res);
});

/**
 * @route PUT /api/reports/schedules/:scheduleId
 * @desc 更新報告排程
 * @access Private
 */
router.put('/schedules/:scheduleId', async (req, res) => {
  await reportController.updateSchedule(req, res);
});

/**
 * @route DELETE /api/reports/schedules/:scheduleId
 * @desc 停用報告排程
 * @access Private
 */
router.delete('/schedules/:scheduleId', async (req, res) => {
  await reportController.deactivateSchedule(req, res);
});

/**
 * @route POST /api/reports/execute
 * @desc 立即執行報告生成
 * @access Private
 */
router.post('/execute', async (req, res) => {
  await reportController.executeReportNow(req, res);
});

export default router;