import request from 'supertest';
import express from 'express';
import { ReportController } from '../ReportController';
import { DataAggregator } from '../../services/DataAggregator';
import { TrendAnalyzer } from '../../services/TrendAnalyzer';
import { ReportScheduler } from '../../services/ReportScheduler';
import { DeliveryManager } from '../../services/DeliveryManager';
import { ReportFrequency, DeliveryMethod } from '@health-tracker/shared-types';

// Mock dependencies
jest.mock('../../services/DataAggregator');
jest.mock('../../services/TrendAnalyzer');
jest.mock('../../services/ReportScheduler');
jest.mock('../../services/DeliveryManager');

describe('ReportController', () => {
  let app: express.Application;
  let reportController: ReportController;
  let mockDataAggregator: jest.Mocked<DataAggregator>;
  let mockTrendAnalyzer: jest.Mocked<TrendAnalyzer>;
  let mockReportScheduler: jest.Mocked<ReportScheduler>;
  let mockDeliveryManager: jest.Mocked<DeliveryManager>;

  beforeEach(() => {
    mockDataAggregator = new DataAggregator(null as any, null as any) as jest.Mocked<DataAggregator>;
    mockTrendAnalyzer = new TrendAnalyzer(null as any, null as any) as jest.Mocked<TrendAnalyzer>;
    mockReportScheduler = new ReportScheduler(null as any, null as any, null as any, null as any) as jest.Mocked<ReportScheduler>;
    mockDeliveryManager = new DeliveryManager() as jest.Mocked<DeliveryManager>;

    reportController = new ReportController(
      mockDataAggregator,
      mockTrendAnalyzer,
      mockReportScheduler,
      mockDeliveryManager
    );

    app = express();
    app.use(express.json());
    
    // Mock 認證中間件
    app.use((req: any, res, next) => {
      req.user = { id: 'test-user-id' };
      next();
    });

    // 設定路由（注意順序：具體路由要在通用路由之前）
    app.post('/api/reports/generate', (req, res) => reportController.generateReport(req, res));
    app.get('/api/reports/history', (req, res) => reportController.getReportHistory(req, res));
    app.post('/api/reports/schedule', (req, res) => reportController.createSchedule(req, res));
    app.get('/api/reports/schedules', (req, res) => reportController.getSchedules(req, res));
    app.put('/api/reports/schedules/:scheduleId', (req, res) => reportController.updateSchedule(req, res));
    app.delete('/api/reports/schedules/:scheduleId', (req, res) => reportController.deactivateSchedule(req, res));
    app.post('/api/reports/execute', (req, res) => reportController.executeReportNow(req, res));
    app.get('/api/reports/:reportId', (req, res) => reportController.getReport(req, res));
  });

  describe('POST /api/reports/generate', () => {
    it('應該成功生成報告', async () => {
      const mockAggregatedData = {
        period: { start: new Date('2024-01-01'), end: new Date('2024-01-07') },
        totalCalories: 1400,
        avgDailyCalories: 200,
        macronutrients: { protein: 70, carbohydrates: 175, fat: 47, fiber: 21 },
        micronutrients: { vitamins: {}, minerals: {} },
        mealDistribution: { breakfast: 0.25, lunch: 0.375, dinner: 0.375, snack: 0 },
        dailyBreakdown: [],
        weeklyAverages: []
      };

      const mockTrendAnalysis = {
        trends: [],
        insights: [],
        predictions: [],
        recommendations: []
      };

      mockDataAggregator.aggregateNutritionData.mockResolvedValue(mockAggregatedData);
      mockTrendAnalyzer.analyzeHealthTrends.mockResolvedValue(mockTrendAnalysis);

      const requestBody = {
        frequency: ReportFrequency.WEEKLY,
        period: {
          start: '2024-01-01',
          end: '2024-01-07'
        },
        settings: {
          includeCharts: true,
          includeTrends: true,
          includeRecommendations: true,
          deliveryMethod: [DeliveryMethod.IN_APP]
        }
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.userId).toBe('test-user-id');
      expect(mockDataAggregator.aggregateNutritionData).toHaveBeenCalled();
      expect(mockTrendAnalyzer.analyzeHealthTrends).toHaveBeenCalled();
    });

    it('應該驗證請求參數', async () => {
      const invalidRequestBody = {
        frequency: 'invalid-frequency',
        period: {
          start: '2024-01-01'
          // 缺少 end
        }
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .send(invalidRequestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('應該處理未認證的請求', async () => {
      const appWithoutAuth = express();
      appWithoutAuth.use(express.json());
      appWithoutAuth.post('/api/reports/generate', (req, res) => reportController.generateReport(req, res));

      const response = await request(appWithoutAuth)
        .post('/api/reports/generate')
        .send({
          frequency: ReportFrequency.WEEKLY,
          period: { start: '2024-01-01', end: '2024-01-07' }
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/reports/history', () => {
    it('應該返回報告歷史', async () => {
      const response = await request(app)
        .get('/api/reports/history')
        .query({ limit: 10, offset: 0 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reports');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination.limit).toBe(10);
      expect(response.body.data.pagination.offset).toBe(0);
    });

    it('應該使用預設分頁參數', async () => {
      const response = await request(app)
        .get('/api/reports/history')
        .expect(200);

      expect(response.body.data.pagination.limit).toBe(20);
      expect(response.body.data.pagination.offset).toBe(0);
    });

    it('應該驗證查詢參數', async () => {
      const response = await request(app)
        .get('/api/reports/history')
        .query({ limit: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/reports/:reportId', () => {
    it('應該返回 404 當報告不存在', async () => {
      const response = await request(app)
        .get('/api/reports/non-existent-report')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/reports/schedule', () => {
    it('應該成功建立報告排程', async () => {
      const mockSchedule = {
        id: 'schedule-123',
        userId: 'test-user-id',
        frequency: ReportFrequency.WEEKLY,
        settings: {
          frequency: ReportFrequency.WEEKLY,
          includeCharts: true,
          includeTrends: true,
          includeRecommendations: true,
          deliveryMethod: [DeliveryMethod.EMAIL],
          customSections: []
        },
        nextRunTime: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReportScheduler.createSchedule.mockResolvedValue(mockSchedule);

      const requestBody = {
        frequency: ReportFrequency.WEEKLY,
        settings: {
          includeCharts: true,
          includeTrends: true,
          includeRecommendations: true,
          deliveryMethod: [DeliveryMethod.EMAIL],
          customSections: []
        }
      };

      const response = await request(app)
        .post('/api/reports/schedule')
        .send(requestBody)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('schedule-123');
      expect(mockReportScheduler.createSchedule).toHaveBeenCalledWith(
        'test-user-id',
        ReportFrequency.WEEKLY,
        requestBody.settings
      );
    });

    it('應該驗證排程請求參數', async () => {
      const invalidRequestBody = {
        frequency: 'invalid-frequency'
        // 缺少 settings
      };

      const response = await request(app)
        .post('/api/reports/schedule')
        .send(invalidRequestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/reports/schedules', () => {
    it('應該返回用戶的排程列表', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          userId: 'test-user-id',
          frequency: ReportFrequency.WEEKLY,
          settings: {
            frequency: ReportFrequency.WEEKLY,
            includeCharts: true,
            includeTrends: true,
            includeRecommendations: true,
            deliveryMethod: [DeliveryMethod.EMAIL],
            customSections: []
          },
          nextRunTime: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockReportScheduler.getUserSchedules.mockReturnValue(mockSchedules);

      const response = await request(app)
        .get('/api/reports/schedules')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('schedule-1');
      expect(mockReportScheduler.getUserSchedules).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('PUT /api/reports/schedules/:scheduleId', () => {
    it('應該成功更新排程', async () => {
      const updatedSchedule = {
        id: 'schedule-123',
        userId: 'test-user-id',
        frequency: ReportFrequency.WEEKLY,
        settings: {
          frequency: ReportFrequency.WEEKLY,
          includeCharts: false,
          includeTrends: true,
          includeRecommendations: true,
          deliveryMethod: [DeliveryMethod.IN_APP],
          customSections: []
        },
        nextRunTime: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReportScheduler.updateSchedule.mockResolvedValue(updatedSchedule);

      const updateData = {
        includeCharts: false,
        deliveryMethod: [DeliveryMethod.IN_APP]
      };

      const response = await request(app)
        .put('/api/reports/schedules/schedule-123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settings.includeCharts).toBe(false);
      expect(mockReportScheduler.updateSchedule).toHaveBeenCalledWith('schedule-123', updateData);
    });

    it('應該在排程不存在時返回 404', async () => {
      mockReportScheduler.updateSchedule.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/reports/schedules/non-existent')
        .send({ includeCharts: false })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/reports/schedules/:scheduleId', () => {
    it('應該成功停用排程', async () => {
      mockReportScheduler.deactivateSchedule.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/reports/schedules/schedule-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('排程已停用');
      expect(mockReportScheduler.deactivateSchedule).toHaveBeenCalledWith('schedule-123');
    });

    it('應該在排程不存在時返回 404', async () => {
      mockReportScheduler.deactivateSchedule.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/reports/schedules/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/reports/execute', () => {
    it('應該成功執行報告生成', async () => {
      const mockReport = {
        id: 'report-123',
        userId: 'test-user-id',
        period: { start: new Date(), end: new Date() },
        nutritionSummary: {
          totalCalories: 1400,
          avgDailyCalories: 200,
          macronutrients: { protein: 70, carbohydrates: 175, fat: 47, fiber: 21 },
          micronutrients: { vitamins: {}, minerals: {} }
        },
        trends: [],
        recommendations: [],
        achievements: [],
        generatedAt: new Date()
      };

      mockReportScheduler.executeReportNow.mockResolvedValue(mockReport);

      const response = await request(app)
        .post('/api/reports/execute')
        .send({ frequency: ReportFrequency.WEEKLY })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('report-123');
      expect(mockReportScheduler.executeReportNow).toHaveBeenCalledWith('test-user-id', ReportFrequency.WEEKLY);
    });

    it('應該在執行失敗時返回錯誤', async () => {
      mockReportScheduler.executeReportNow.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/reports/execute')
        .send({ frequency: ReportFrequency.WEEKLY })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EXECUTION_FAILED');
    });

    it('應該驗證執行請求參數', async () => {
      const response = await request(app)
        .post('/api/reports/execute')
        .send({ frequency: 'invalid-frequency' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理服務層拋出的異常', async () => {
      mockDataAggregator.aggregateNutritionData.mockRejectedValue(new Error('資料庫連接失敗'));

      const response = await request(app)
        .post('/api/reports/generate')
        .send({
          frequency: ReportFrequency.WEEKLY,
          period: { start: '2024-01-01', end: '2024-01-07' }
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});