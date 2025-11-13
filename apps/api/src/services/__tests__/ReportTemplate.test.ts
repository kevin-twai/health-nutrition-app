import { 
  WeeklyReportTemplate, 
  MonthlyReportTemplate, 
  ReportTemplateFactory 
} from '../ReportTemplate';
import { 
  ReportFrequency, 
  DeliveryMethod, 
  MealType,
  InsightType,
  RecommendationType,
  Priority,
  AchievementType,
  AchievementRarity
} from '../../types/shared';

describe('ReportTemplate', () => {
  const mockReportSettings = {
    frequency: ReportFrequency.WEEKLY,
    includeCharts: true,
    includeTrends: true,
    includeRecommendations: true,
    deliveryMethod: [DeliveryMethod.EMAIL],
    customSections: []
  };

  const mockPeriod = {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-07')
  };

  const mockAggregatedData = {
    period: mockPeriod,
    totalCalories: 1400,
    avgDailyCalories: 200,
    macronutrients: {
      protein: 70,
      carbohydrates: 175,
      fat: 47,
      fiber: 21
    },
    micronutrients: {
      vitamins: {},
      minerals: {}
    },
    mealDistribution: {
      breakfast: 0.25,
      lunch: 0.375,
      dinner: 0.375,
      snack: 0
    },
    dailyBreakdown: [
      {
        date: new Date('2024-01-01'),
        calories: 200,
        protein: 10,
        carbohydrates: 25,
        fat: 6.7,
        fiber: 3,
        mealCounts: {
          [MealType.BREAKFAST]: 1,
          [MealType.LUNCH]: 1,
          [MealType.DINNER]: 1,
          [MealType.SNACK]: 0
        }
      }
    ],
    weeklyAverages: [
      {
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        avgCalories: 200,
        avgProtein: 10,
        avgCarbohydrates: 25,
        avgFat: 6.7,
        avgFiber: 3,
        consistency: 0.85
      }
    ]
  };

  const mockTrends = {
    trends: [
      {
        metric: 'calories',
        change: 5.2,
        direction: 'up' as const,
        significance: 'medium' as const,
        period: mockPeriod,
        description: '熱量攝取增加了 5.2%'
      }
    ],
    insights: [
      {
        type: InsightType.NUTRITIONAL_BALANCE,
        title: '營養平衡分析',
        description: '營養素比例均衡',
        severity: 'info' as const,
        confidence: 0.8,
        relatedMetrics: ['protein', 'carbohydrates', 'fat']
      }
    ],
    predictions: [],
    recommendations: [
      {
        id: 'rec_1',
        type: RecommendationType.NUTRITION_ADJUSTMENT,
        title: '增加蛋白質攝取',
        description: '建議增加瘦肉、魚類、豆類等優質蛋白質',
        priority: Priority.MEDIUM,
        expectedImpact: '改善營養平衡',
        relatedTrends: ['protein']
      }
    ]
  };

  const mockAchievements = [
    {
      id: 'achievement_1',
      name: '連續記錄一週',
      description: '成功記錄了連續7天的飲食',
      icon: '🏆',
      category: 'consistency',
      type: AchievementType.STREAK,
      points: 100,
      rarity: AchievementRarity.COMMON,
      unlockedAt: new Date('2024-01-07')
    }
  ];

  describe('WeeklyReportTemplate', () => {
    let template: WeeklyReportTemplate;

    beforeEach(() => {
      template = new WeeklyReportTemplate(mockReportSettings);
    });

    it('應該生成週報', async () => {
      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        mockAggregatedData,
        mockTrends,
        mockAchievements
      );

      expect(report.id).toContain('weekly_test-user-id');
      expect(report.userId).toBe('test-user-id');
      expect(report.period).toEqual(mockPeriod);
      expect(report.nutritionSummary.totalCalories).toBe(1400);
      expect(report.nutritionSummary.avgDailyCalories).toBe(200);
      expect(report.trends).toHaveLength(1);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.achievements).toHaveLength(1);
    });

    it('應該格式化為 HTML', async () => {
      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        mockAggregatedData,
        mockTrends,
        mockAchievements
      );

      const html = await template.formatAsHTML(report);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('週度健康報告');
      expect(html).toContain('1400 大卡');
      expect(html).toContain('200 大卡');
      expect(html).toContain('熱量攝取增加了 5.2%');
      expect(html).toContain('連續記錄一週');
    });

    it('應該格式化為 PDF', async () => {
      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        mockAggregatedData,
        mockTrends,
        mockAchievements
      );

      const pdf = await template.formatAsPDF(report);

      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.toString()).toContain('PDF Content for report');
    });

    it('應該生成營養分析', async () => {
      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        mockAggregatedData,
        mockTrends,
        mockAchievements
      );

      expect(report.recommendations).toContain('您的每日熱量攝取偏低，建議增加健康的高熱量食物。');
    });
  });

  describe('MonthlyReportTemplate', () => {
    let template: MonthlyReportTemplate;

    beforeEach(() => {
      template = new MonthlyReportTemplate({
        ...mockReportSettings,
        frequency: ReportFrequency.MONTHLY
      });
    });

    it('應該生成月報', async () => {
      const monthlyPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const monthlyData = {
        ...mockAggregatedData,
        period: monthlyPeriod,
        totalCalories: 6200,
        avgDailyCalories: 200
      };

      const report = await template.generateReport(
        'test-user-id',
        monthlyPeriod,
        monthlyData,
        mockTrends,
        mockAchievements
      );

      expect(report.id).toContain('monthly_test-user-id');
      expect(report.period).toEqual(monthlyPeriod);
      expect(report.nutritionSummary.totalCalories).toBe(6200);
    });

    it('應該格式化為月報 HTML', async () => {
      const monthlyPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const monthlyData = {
        ...mockAggregatedData,
        period: monthlyPeriod,
        weeklyAverages: [
          {
            weekStart: new Date('2024-01-01'),
            weekEnd: new Date('2024-01-07'),
            avgCalories: 200,
            avgProtein: 10,
            avgCarbohydrates: 25,
            avgFat: 6.7,
            avgFiber: 3,
            consistency: 0.85
          },
          {
            weekStart: new Date('2024-01-08'),
            weekEnd: new Date('2024-01-14'),
            avgCalories: 210,
            avgProtein: 11,
            avgCarbohydrates: 26,
            avgFat: 7,
            avgFiber: 3.2,
            consistency: 0.82
          }
        ]
      };

      const report = await template.generateReport(
        'test-user-id',
        monthlyPeriod,
        monthlyData,
        mockTrends,
        mockAchievements
      );

      const html = await template.formatAsHTML(report);

      expect(html).toContain('月度健康報告');
      expect(html).toContain('您的健康旅程回顧');
      expect(html).toContain('您本月的飲食習慣非常規律');
    });

    it('應該生成月度洞察', async () => {
      const monthlyData = {
        ...mockAggregatedData,
        weeklyAverages: [
          {
            weekStart: new Date('2024-01-01'),
            weekEnd: new Date('2024-01-07'),
            avgCalories: 200,
            avgProtein: 10,
            avgCarbohydrates: 25,
            avgFat: 6.7,
            avgFiber: 3,
            consistency: 0.9 // 高一致性
          }
        ]
      };

      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        monthlyData,
        mockTrends,
        mockAchievements
      );

      expect(report.recommendations).toContain('您本月的飲食習慣非常規律，請繼續保持！');
    });
  });

  describe('ReportTemplateFactory', () => {
    it('應該創建週報模板', () => {
      const template = ReportTemplateFactory.createTemplate(
        ReportFrequency.WEEKLY,
        mockReportSettings
      );

      expect(template).toBeInstanceOf(WeeklyReportTemplate);
    });

    it('應該創建月報模板', () => {
      const template = ReportTemplateFactory.createTemplate(
        ReportFrequency.MONTHLY,
        mockReportSettings
      );

      expect(template).toBeInstanceOf(MonthlyReportTemplate);
    });

    it('應該為未知頻率返回預設模板', () => {
      const template = ReportTemplateFactory.createTemplate(
        ReportFrequency.DAILY,
        mockReportSettings
      );

      expect(template).toBeInstanceOf(WeeklyReportTemplate);
    });
  });

  describe('營養分析功能', () => {
    let template: WeeklyReportTemplate;

    beforeEach(() => {
      template = new WeeklyReportTemplate(mockReportSettings);
    });

    it('應該檢測低熱量攝取', async () => {
      const lowCalorieData = {
        ...mockAggregatedData,
        avgDailyCalories: 1000 // 低於 1200
      };

      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        lowCalorieData,
        mockTrends,
        mockAchievements
      );

      expect(report.recommendations).toContain('您的每日熱量攝取偏低，建議增加健康的高熱量食物。');
    });

    it('應該檢測高熱量攝取', async () => {
      const highCalorieData = {
        ...mockAggregatedData,
        avgDailyCalories: 3000 // 高於 2500
      };

      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        highCalorieData,
        mockTrends,
        mockAchievements
      );

      expect(report.recommendations).toContain('您的每日熱量攝取較高，建議適度控制份量。');
    });

    it('應該檢測蛋白質不足', async () => {
      const lowProteinData = {
        ...mockAggregatedData,
        macronutrients: {
          ...mockAggregatedData.macronutrients,
          protein: 30 // 平均每日約 4.3g，低於 50g
        }
      };

      const report = await template.generateReport(
        'test-user-id',
        mockPeriod,
        lowProteinData,
        mockTrends,
        mockAchievements
      );

      expect(report.recommendations).toContain('建議增加蛋白質攝取，可選擇瘦肉、魚類、豆類等。');
    });
  });
});