import { ReportScheduler } from '../ReportScheduler';
import { DataAggregator } from '../DataAggregator';
import { TrendAnalyzer } from '../TrendAnalyzer';
import { UserRepository } from '../../repositories/UserRepository';
import { DeliveryManager } from '../DeliveryManager';
import { ReportFrequency, DeliveryMethod } from '../../types/shared';

// Mock dependencies
jest.mock('../DataAggregator');
jest.mock('../TrendAnalyzer');
jest.mock('../../repositories/UserRepository');
jest.mock('../DeliveryManager');
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn()
  })
}));

describe('ReportScheduler', () => {
  let reportScheduler: ReportScheduler;
  let mockDataAggregator: jest.Mocked<DataAggregator>;
  let mockTrendAnalyzer: jest.Mocked<TrendAnalyzer>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockDeliveryManager: jest.Mocked<DeliveryManager>;

  beforeEach(() => {
    mockDataAggregator = new DataAggregator(null as any, null as any) as jest.Mocked<DataAggregator>;
    mockTrendAnalyzer = new TrendAnalyzer(null as any, null as any) as jest.Mocked<TrendAnalyzer>;
    mockUserRepository = new UserRepository(null as any, null as any) as jest.Mocked<UserRepository>;
    mockDeliveryManager = new DeliveryManager() as jest.Mocked<DeliveryManager>;

    reportScheduler = new ReportScheduler(
      mockDataAggregator,
      mockTrendAnalyzer,
      mockUserRepository,
      mockDeliveryManager
    );
  });

  afterEach(() => {
    reportScheduler.shutdown();
  });

  describe('createSchedule', () => {
    it('應該建立週報排程', async () => {
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      const task = await reportScheduler.createSchedule(
        userId,
        ReportFrequency.WEEKLY,
        settings
      );

      expect(task.userId).toBe(userId);
      expect(task.frequency).toBe(ReportFrequency.WEEKLY);
      expect(task.isActive).toBe(true);
      expect(task.id).toContain(userId);
      expect(task.nextRunTime).toBeInstanceOf(Date);
    });

    it('應該建立月報排程', async () => {
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.MONTHLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.IN_APP],
        customSections: []
      };

      const task = await reportScheduler.createSchedule(
        userId,
        ReportFrequency.MONTHLY,
        settings
      );

      expect(task.frequency).toBe(ReportFrequency.MONTHLY);
      expect(task.settings.deliveryMethod).toContain(DeliveryMethod.IN_APP);
    });

    it('應該為同一用戶建立多個排程', async () => {
      const userId = 'test-user-id';
      const weeklySettings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };
      const monthlySettings = {
        frequency: ReportFrequency.MONTHLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.IN_APP],
        customSections: []
      };

      await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, weeklySettings);
      await reportScheduler.createSchedule(userId, ReportFrequency.MONTHLY, monthlySettings);

      const userSchedules = reportScheduler.getUserSchedules(userId);
      expect(userSchedules).toHaveLength(2);
      expect(userSchedules.map(s => s.frequency)).toContain(ReportFrequency.WEEKLY);
      expect(userSchedules.map(s => s.frequency)).toContain(ReportFrequency.MONTHLY);
    });
  });

  describe('updateSchedule', () => {
    it('應該更新排程設定', async () => {
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      const task = await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, settings);
      
      const updatedTask = await reportScheduler.updateSchedule(task.id, {
        includeCharts: false,
        deliveryMethod: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH_NOTIFICATION]
      });

      expect(updatedTask).not.toBeNull();
      expect(updatedTask!.settings.includeCharts).toBe(false);
      expect(updatedTask!.settings.deliveryMethod).toEqual([DeliveryMethod.IN_APP, DeliveryMethod.PUSH_NOTIFICATION]);
      expect(updatedTask!.updatedAt).toBeInstanceOf(Date);
    });

    it('應該在任務不存在時返回 null', async () => {
      const result = await reportScheduler.updateSchedule('non-existent-task', {
        includeCharts: false
      });

      expect(result).toBeNull();
    });
  });

  describe('deactivateSchedule', () => {
    it('應該停用排程', async () => {
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      const task = await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, settings);
      const result = await reportScheduler.deactivateSchedule(task.id);

      expect(result).toBe(true);
      
      const userSchedules = reportScheduler.getUserSchedules(userId);
      const deactivatedTask = userSchedules.find(t => t.id === task.id);
      expect(deactivatedTask?.isActive).toBe(false);
    });

    it('應該在任務不存在時返回 false', async () => {
      const result = await reportScheduler.deactivateSchedule('non-existent-task');
      expect(result).toBe(false);
    });
  });

  describe('reactivateSchedule', () => {
    it('應該重新啟用已停用的排程', async () => {
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      const task = await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, settings);
      await reportScheduler.deactivateSchedule(task.id);
      
      const result = await reportScheduler.reactivateSchedule(task.id);

      expect(result).toBe(true);
      
      const userSchedules = reportScheduler.getUserSchedules(userId);
      const reactivatedTask = userSchedules.find(t => t.id === task.id);
      expect(reactivatedTask?.isActive).toBe(true);
      expect(reactivatedTask?.nextRunTime).toBeInstanceOf(Date);
    });

    it('應該在任務不存在或已啟用時返回 false', async () => {
      const result1 = await reportScheduler.reactivateSchedule('non-existent-task');
      expect(result1).toBe(false);

      // 測試已啟用的任務
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      const task = await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, settings);
      const result2 = await reportScheduler.reactivateSchedule(task.id);
      expect(result2).toBe(false);
    });
  });

  describe('executeReportNow', () => {
    it('應該立即執行報告生成', async () => {
      const userId = 'test-user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        profile: {
          name: 'Test User',
          age: 30,
          gender: 'male' as const,
          height: 175,
          weight: 70,
          activityLevel: 'moderately_active' as any
        },
        preferences: {
          language: 'zh-TW',
          timezone: 'Asia/Taipei',
          notifications: {
            email: true,
            push: true,
            sms: false,
            weeklyReport: true,
            achievements: true
          },
          privacy: {
            dataSharing: false,
            analytics: true,
            thirdPartyIntegration: true
          }
        },
        healthGoals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockAggregatedData = {
        period: { start: new Date(), end: new Date() },
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

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockDataAggregator.aggregateNutritionData.mockResolvedValue(mockAggregatedData);
      mockTrendAnalyzer.analyzeHealthTrends.mockResolvedValue(mockTrendAnalysis);
      mockDeliveryManager.deliverReport.mockResolvedValue([
        {
          method: DeliveryMethod.IN_APP,
          success: true,
          message: '發送成功',
          timestamp: new Date()
        }
      ]);

      const report = await reportScheduler.executeReportNow(userId, ReportFrequency.WEEKLY);

      expect(report).not.toBeNull();
      expect(report!.userId).toBe(userId);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockDataAggregator.aggregateNutritionData).toHaveBeenCalled();
      expect(mockTrendAnalyzer.analyzeHealthTrends).toHaveBeenCalled();
      expect(mockDeliveryManager.deliverReport).toHaveBeenCalled();
    });

    it('應該在用戶不存在時返回 null', async () => {
      const userId = 'non-existent-user';
      mockUserRepository.findById.mockResolvedValue(null);

      const report = await reportScheduler.executeReportNow(userId, ReportFrequency.WEEKLY);

      expect(report).toBeNull();
    });
  });

  describe('getUserSchedules', () => {
    it('應該返回用戶的所有排程', async () => {
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, settings);
      await reportScheduler.createSchedule(userId, ReportFrequency.MONTHLY, {
        ...settings,
        frequency: ReportFrequency.MONTHLY
      });

      const schedules = reportScheduler.getUserSchedules(userId);
      expect(schedules).toHaveLength(2);
    });

    it('應該在用戶沒有排程時返回空陣列', () => {
      const schedules = reportScheduler.getUserSchedules('non-existent-user');
      expect(schedules).toEqual([]);
    });
  });

  describe('getSchedulerStats', () => {
    it('應該返回排程器統計資訊', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      await reportScheduler.createSchedule(userId1, ReportFrequency.WEEKLY, settings);
      await reportScheduler.createSchedule(userId1, ReportFrequency.MONTHLY, {
        ...settings,
        frequency: ReportFrequency.MONTHLY
      });
      const task = await reportScheduler.createSchedule(userId2, ReportFrequency.WEEKLY, settings);
      await reportScheduler.deactivateSchedule(task.id);

      const stats = reportScheduler.getSchedulerStats();

      expect(stats.totalTasks).toBe(3);
      expect(stats.activeTasks).toBe(2);
      expect(stats.tasksByFrequency[ReportFrequency.WEEKLY]).toBe(2);
      expect(stats.tasksByFrequency[ReportFrequency.MONTHLY]).toBe(1);
    });
  });

  describe('時間計算', () => {
    it('應該正確計算下次執行時間', async () => {
      const userId = 'test-user-id';
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      const task = await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, settings);
      
      expect(task.nextRunTime).toBeInstanceOf(Date);
      expect(task.nextRunTime.getTime()).toBeGreaterThan(Date.now());
    });

    it('應該為不同頻率設定正確的執行時間', async () => {
      const userId = 'test-user-id';
      const baseSettings = {
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      const dailyTask = await reportScheduler.createSchedule(userId, ReportFrequency.DAILY, {
        ...baseSettings,
        frequency: ReportFrequency.DAILY
      });
      const weeklyTask = await reportScheduler.createSchedule(userId, ReportFrequency.WEEKLY, {
        ...baseSettings,
        frequency: ReportFrequency.WEEKLY
      });
      const monthlyTask = await reportScheduler.createSchedule(userId, ReportFrequency.MONTHLY, {
        ...baseSettings,
        frequency: ReportFrequency.MONTHLY
      });

      // 所有任務都應該設定為早上8點執行
      expect(dailyTask.nextRunTime.getHours()).toBe(8);
      expect(weeklyTask.nextRunTime.getHours()).toBe(8);
      expect(monthlyTask.nextRunTime.getHours()).toBe(8);

      // 週報應該在週日執行
      expect(weeklyTask.nextRunTime.getDay()).toBe(0);

      // 月報應該在每月1號執行
      expect(monthlyTask.nextRunTime.getDate()).toBe(1);
    });
  });
});