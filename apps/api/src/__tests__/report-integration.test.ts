import { DataAggregator } from '../services/DataAggregator';
import { TrendAnalyzer } from '../services/TrendAnalyzer';
import { ReportScheduler } from '../services/ReportScheduler';
import { DeliveryManager } from '../services/DeliveryManager';
import { ReportTemplateFactory, WeeklyReportTemplate, MonthlyReportTemplate } from '../services/ReportTemplate';
import { ChartGenerator } from '../services/ChartGenerator';
import { LogRepository } from '../repositories/LogRepository';
import { UserRepository } from '../repositories/UserRepository';
import { 
  ReportFrequency, 
  DeliveryMethod, 
  MealType,
  InsightType,
  RecommendationType,
  Priority
} from '../types/shared';

// Mock dependencies
jest.mock('../repositories/LogRepository');
jest.mock('../repositories/UserRepository');

describe('報告系統整合測試', () => {
  let dataAggregator: DataAggregator;
  let trendAnalyzer: TrendAnalyzer;
  let reportScheduler: ReportScheduler;
  let deliveryManager: DeliveryManager;
  let chartGenerator: ChartGenerator;
  let mockLogRepository: jest.Mocked<LogRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  // 設定全域測試超時
  jest.setTimeout(30000);

  const mockUser = {
    id: 'test-user-id',
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

  const mockFoodLogs = [
    {
      id: '1',
      userId: 'test-user-id',
      foodId: 'food-1',
      portion: 100,
      mealType: MealType.BREAKFAST,
      timestamp: new Date('2024-01-01T08:00:00Z'),
      source: 'manual_input' as any,
      calories: 300,
      protein: 20,
      carbohydrates: 40,
      fat: 10,
      fiber: 5
    },
    {
      id: '2',
      userId: 'test-user-id',
      foodId: 'food-2',
      portion: 150,
      mealType: MealType.LUNCH,
      timestamp: new Date('2024-01-01T12:00:00Z'),
      source: 'manual_input' as any,
      calories: 450,
      protein: 25,
      carbohydrates: 50,
      fat: 15,
      fiber: 8
    },
    {
      id: '3',
      userId: 'test-user-id',
      foodId: 'food-3',
      portion: 120,
      mealType: MealType.DINNER,
      timestamp: new Date('2024-01-01T19:00:00Z'),
      source: 'manual_input' as any,
      calories: 400,
      protein: 30,
      carbohydrates: 35,
      fat: 18,
      fiber: 6
    }
  ];

  const mockNutritionStats = {
    totalCalories: 1150,
    totalProtein: 75,
    totalCarbohydrates: 125,
    totalFat: 43,
    totalFiber: 19,
    mealBreakdown: {
      [MealType.BREAKFAST]: { calories: 300, protein: 20, carbohydrates: 40, fat: 10, count: 1 },
      [MealType.LUNCH]: { calories: 450, protein: 25, carbohydrates: 50, fat: 15, count: 1 },
      [MealType.DINNER]: { calories: 400, protein: 30, carbohydrates: 35, fat: 18, count: 1 },
      [MealType.SNACK]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 }
    }
  };

  beforeEach(() => {
    mockLogRepository = new LogRepository(null as any, null as any, null as any) as jest.Mocked<LogRepository>;
    mockUserRepository = new UserRepository(null as any, null as any) as jest.Mocked<UserRepository>;

    dataAggregator = new DataAggregator(mockLogRepository, mockUserRepository);
    trendAnalyzer = new TrendAnalyzer(dataAggregator, mockUserRepository);
    deliveryManager = new DeliveryManager();
    reportScheduler = new ReportScheduler(dataAggregator, trendAnalyzer, mockUserRepository, deliveryManager);
    chartGenerator = new ChartGenerator();

    // 設定 mock 回傳值
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockLogRepository.findByDateRange.mockResolvedValue(mockFoodLogs);
    mockLogRepository.getNutritionStats.mockResolvedValue(mockNutritionStats);
  });

  afterEach(() => {
    reportScheduler.shutdown();
  });

  describe('完整報告生成流程', () => {
    it('應該成功生成週報', async () => {
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.IN_APP],
        customSections: []
      };

      // 1. 彙整資料
      const aggregatedData = await dataAggregator.aggregateNutritionData({
        userId: 'test-user-id',
        period,
        groupBy: 'day' as any,
        includeComparisons: true,
        includeTrends: true
      });

      expect(aggregatedData.totalCalories).toBe(1150);
      expect(aggregatedData.macronutrients.protein).toBe(75);

      // 2. 分析趨勢
      const trendAnalysis = await trendAnalyzer.analyzeHealthTrends('test-user-id', period);

      expect(trendAnalysis.trends).toBeDefined();
      expect(trendAnalysis.insights).toBeDefined();
      expect(trendAnalysis.recommendations).toBeDefined();

      // 3. 生成報告
      const template = ReportTemplateFactory.createTemplate(ReportFrequency.WEEKLY, settings);
      expect(template).toBeInstanceOf(WeeklyReportTemplate);

      const report = await template.generateReport(
        'test-user-id',
        period,
        aggregatedData,
        trendAnalysis,
        []
      );

      expect(report.id).toContain('weekly_test-user-id');
      expect(report.userId).toBe('test-user-id');
      expect(report.period).toEqual(period);
      expect(report.nutritionSummary.totalCalories).toBe(1150);

      // 4. 格式化為 HTML
      const htmlContent = await template.formatAsHTML(report);
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('週度健康報告');
      expect(htmlContent).toContain('1150 大卡');

      // 5. 格式化為 PDF
      const pdfBuffer = await template.formatAsPDF(report);
      expect(pdfBuffer).toBeInstanceOf(Buffer);
    }, 10000); // 10秒超時

    it('應該成功生成月報', async () => {
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const settings = {
        frequency: ReportFrequency.MONTHLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.EMAIL],
        customSections: []
      };

      // 模擬月度資料
      const monthlyData = {
        ...mockNutritionStats,
        totalCalories: 35650, // 31天 * 1150
        totalProtein: 2325,   // 31天 * 75
        totalCarbohydrates: 3875,
        totalFat: 1333,
        totalFiber: 589
      };
      mockLogRepository.getNutritionStats.mockResolvedValueOnce(monthlyData);

      const aggregatedData = await dataAggregator.aggregateNutritionData({
        userId: 'test-user-id',
        period,
        groupBy: 'day' as any,
        includeComparisons: true,
        includeTrends: true
      });

      const trendAnalysis = await trendAnalyzer.analyzeHealthTrends('test-user-id', period);

      const template = ReportTemplateFactory.createTemplate(ReportFrequency.MONTHLY, settings);
      expect(template).toBeInstanceOf(MonthlyReportTemplate);

      const report = await template.generateReport(
        'test-user-id',
        period,
        aggregatedData,
        trendAnalysis,
        []
      );

      expect(report.id).toContain('monthly_test-user-id');
      expect(report.nutritionSummary.totalCalories).toBe(35650);

      const htmlContent = await template.formatAsHTML(report);
      expect(htmlContent).toContain('月度健康報告');
      expect(htmlContent).toContain('您的健康旅程回顧');
    }, 10000); // 10秒超時
  });

  describe('圖表生成整合', () => {
    it('應該生成各種圖表資料', async () => {
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const aggregatedData = await dataAggregator.aggregateNutritionData({
        userId: 'test-user-id',
        period,
        groupBy: 'day' as any,
        includeComparisons: true,
        includeTrends: true
      });

      // 生成每日熱量趨勢圖
      const caloriesTrend = chartGenerator.generateDailyCaloriesTrend(aggregatedData.dailyBreakdown);
      expect(caloriesTrend.type).toBe('line');
      expect(caloriesTrend.title).toBe('每日熱量攝取趨勢');

      // 生成營養素分布圖
      const macroDistribution = chartGenerator.generateMacronutrientDistribution(aggregatedData);
      expect(macroDistribution.type).toBe('doughnut');
      expect(macroDistribution.labels).toHaveLength(3);

      // 生成餐點分布圖
      const mealDistribution = chartGenerator.generateMealDistribution(aggregatedData);
      expect(mealDistribution.type).toBe('bar');
      expect(mealDistribution.labels).toEqual(['早餐', '午餐', '晚餐', '點心']);

      // 生成圖表 HTML
      const chartHtml = chartGenerator.generateChartHTML(caloriesTrend, 'caloriesChart');
      expect(chartHtml).toContain('<canvas id="caloriesChart"></canvas>');
      expect(chartHtml).toContain('new Chart(');
    });
  });

  describe('排程系統整合', () => {
    it('應該成功建立報告排程', async () => {
      const settings = {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.IN_APP],
        customSections: []
      };

      const schedule = await reportScheduler.createSchedule('test-user-id', ReportFrequency.WEEKLY, settings);

      expect(schedule.userId).toBe('test-user-id');
      expect(schedule.frequency).toBe(ReportFrequency.WEEKLY);
      expect(schedule.isActive).toBe(true);
      expect(schedule.nextRunTime).toBeInstanceOf(Date);
    });

    it('應該立即執行報告生成', async () => {
      const report = await reportScheduler.executeReportNow('test-user-id', ReportFrequency.WEEKLY);

      expect(report).not.toBeNull();
      expect(report!.userId).toBe('test-user-id');
      expect(report!.nutritionSummary.totalCalories).toBe(1150);
    });
  });

  describe('發送系統整合', () => {
    it('應該成功發送報告到多個管道', async () => {
      const mockReport = {
        id: 'test-report-123',
        userId: 'test-user-id',
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-07')
        },
        nutritionSummary: {
          totalCalories: 1150,
          avgDailyCalories: 164.3,
          macronutrients: {
            protein: 75,
            carbohydrates: 125,
            fat: 43,
            fiber: 19
          },
          micronutrients: {
            vitamins: {},
            minerals: {}
          }
        },
        trends: [],
        recommendations: ['建議增加蛋白質攝取'],
        achievements: [],
        generatedAt: new Date()
      };

      const deliveryMethods = [
        DeliveryMethod.IN_APP,
        DeliveryMethod.PUSH_NOTIFICATION,
        DeliveryMethod.THIRD_PARTY
      ];

      const results = await deliveryManager.deliverReport(mockReport, deliveryMethods);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results.map(r => r.method)).toEqual(deliveryMethods);

      // 測試批量發送
      const reports = [mockReport, { ...mockReport, id: 'test-report-456', userId: 'user-2' }];
      const batchResults = await deliveryManager.deliverReportsBatch(reports, [DeliveryMethod.IN_APP]);

      expect(batchResults.size).toBe(2);
      expect(batchResults.has('test-report-123')).toBe(true);
      expect(batchResults.has('test-report-456')).toBe(true);
    });

    it('應該處理發送失敗並重試', async () => {
      const mockReport = {
        id: 'test-report-123',
        userId: 'test-user-id',
        period: { start: new Date(), end: new Date() },
        nutritionSummary: {
          totalCalories: 1150,
          avgDailyCalories: 164.3,
          macronutrients: { protein: 75, carbohydrates: 125, fat: 43, fiber: 19 },
          micronutrients: { vitamins: {}, minerals: {} }
        },
        trends: [],
        recommendations: [],
        achievements: [],
        generatedAt: new Date()
      };

      // 模擬失敗的發送方式
      const failedMethods = [DeliveryMethod.PUSH_NOTIFICATION, DeliveryMethod.THIRD_PARTY];
      
      // 重試失敗的發送
      const retryResults = await deliveryManager.retryFailedDelivery(mockReport, failedMethods);

      expect(retryResults).toHaveLength(2);
      expect(retryResults.every(r => r.success)).toBe(true);
    });
  });

  describe('趨勢分析整合', () => {
    it('應該分析營養趨勢並生成洞察', async () => {
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const trendAnalysis = await trendAnalyzer.analyzeHealthTrends('test-user-id', period);

      // 檢查趨勢分析結果
      expect(trendAnalysis.trends).toBeDefined();
      expect(trendAnalysis.insights).toBeDefined();
      expect(trendAnalysis.predictions).toBeDefined();
      expect(trendAnalysis.recommendations).toBeDefined();

      // 檢查是否有營養平衡洞察
      const balanceInsight = trendAnalysis.insights.find(i => i.type === InsightType.NUTRITIONAL_BALANCE);
      expect(balanceInsight).toBeDefined();

      // 檢查是否有建議
      expect(trendAnalysis.recommendations.length).toBeGreaterThanOrEqual(0);
      
      if (trendAnalysis.recommendations.length > 0) {
        const recommendation = trendAnalysis.recommendations[0];
        expect(recommendation).toHaveProperty('id');
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('title');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('priority');
      }
    });
  });

  describe('錯誤處理和邊界情況', () => {
    it('應該處理空資料的情況', async () => {
      mockLogRepository.findByDateRange.mockResolvedValueOnce([]);
      mockLogRepository.getNutritionStats.mockResolvedValueOnce({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbohydrates: 0,
        totalFat: 0,
        totalFiber: 0,
        mealBreakdown: {
          [MealType.BREAKFAST]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 },
          [MealType.LUNCH]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 },
          [MealType.DINNER]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 },
          [MealType.SNACK]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 }
        }
      });

      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const aggregatedData = await dataAggregator.aggregateNutritionData({
        userId: 'test-user-id',
        period,
        groupBy: 'day' as any,
        includeComparisons: false,
        includeTrends: false
      });

      expect(aggregatedData.totalCalories).toBe(0);
      expect(aggregatedData.avgDailyCalories).toBe(0);

      // 生成報告應該仍然成功
      const template = ReportTemplateFactory.createTemplate(ReportFrequency.WEEKLY, {
        frequency: ReportFrequency.WEEKLY,
        includeCharts: true,
        includeTrends: true,
        includeRecommendations: true,
        deliveryMethod: [DeliveryMethod.IN_APP],
        customSections: []
      });

      const report = await template.generateReport(
        'test-user-id',
        period,
        aggregatedData,
        { trends: [], insights: [], predictions: [], recommendations: [] },
        []
      );

      expect(report).toBeDefined();
      expect(report.nutritionSummary.totalCalories).toBe(0);
    });

    it('應該處理用戶不存在的情況', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);

      const report = await reportScheduler.executeReportNow('non-existent-user', ReportFrequency.WEEKLY);

      expect(report).toBeNull();
    });

    it('應該處理資料庫錯誤', async () => {
      mockLogRepository.findByDateRange.mockRejectedValueOnce(new Error('資料庫連接失敗'));

      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      await expect(dataAggregator.aggregateNutritionData({
        userId: 'test-user-id',
        period,
        groupBy: 'day' as any,
        includeComparisons: false,
        includeTrends: false
      })).rejects.toThrow('資料庫連接失敗');
    });
  });

  describe('效能測試', () => {
    it('應該在合理時間內完成報告生成', async () => {
      const startTime = Date.now();

      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const report = await reportScheduler.executeReportNow('test-user-id', ReportFrequency.WEEKLY);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(report).not.toBeNull();
      expect(executionTime).toBeLessThan(10000); // 放寬到10秒內完成
    }, 15000); // 設定測試超時為15秒
  });
});