import { TrendAnalyzer } from '../TrendAnalyzer';
import { DataAggregator } from '../DataAggregator';
import { UserRepository } from '../../repositories/UserRepository';
import { MealType, InsightType, RecommendationType } from '@health-tracker/shared-types';

// Mock dependencies
jest.mock('../DataAggregator');
jest.mock('../../repositories/UserRepository');

describe('TrendAnalyzer', () => {
  let trendAnalyzer: TrendAnalyzer;
  let mockDataAggregator: jest.Mocked<DataAggregator>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockDataAggregator = new DataAggregator(null as any, null as any) as jest.Mocked<DataAggregator>;
    mockUserRepository = new UserRepository(null as any, null as any) as jest.Mocked<UserRepository>;
    trendAnalyzer = new TrendAnalyzer(mockDataAggregator, mockUserRepository);
  });

  describe('analyzeHealthTrends', () => {
    it('應該分析健康趨勢並返回完整結果', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const mockAggregatedData = {
        period,
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
            calories: 180,
            protein: 9,
            carbohydrates: 22.5,
            fat: 6,
            fiber: 3,
            mealCounts: {
              [MealType.BREAKFAST]: 1,
              [MealType.LUNCH]: 1,
              [MealType.DINNER]: 1,
              [MealType.SNACK]: 0
            }
          },
          {
            date: new Date('2024-01-02'),
            calories: 220,
            protein: 11,
            carbohydrates: 27.5,
            fat: 7.5,
            fiber: 3.5,
            mealCounts: {
              [MealType.BREAKFAST]: 1,
              [MealType.LUNCH]: 1,
              [MealType.DINNER]: 1,
              [MealType.SNACK]: 1
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

      mockDataAggregator.aggregateNutritionData.mockResolvedValue(mockAggregatedData);

      const result = await trendAnalyzer.analyzeHealthTrends(userId, period);

      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.trends)).toBe(true);
      expect(Array.isArray(result.insights)).toBe(true);
      expect(Array.isArray(result.predictions)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('應該處理比較期間的趨勢分析', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-08'),
        end: new Date('2024-01-14')
      };
      const comparisonPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const currentData = {
        period,
        totalCalories: 1600,
        avgDailyCalories: 228.6,
        macronutrients: { protein: 80, carbohydrates: 200, fat: 53, fiber: 24 },
        micronutrients: { vitamins: {}, minerals: {} },
        mealDistribution: { breakfast: 0.25, lunch: 0.375, dinner: 0.375, snack: 0 },
        dailyBreakdown: [],
        weeklyAverages: []
      };

      const comparisonData = {
        period: comparisonPeriod,
        totalCalories: 1400,
        avgDailyCalories: 200,
        macronutrients: { protein: 70, carbohydrates: 175, fat: 47, fiber: 21 },
        micronutrients: { vitamins: {}, minerals: {} },
        mealDistribution: { breakfast: 0.25, lunch: 0.375, dinner: 0.375, snack: 0 },
        dailyBreakdown: [],
        weeklyAverages: []
      };

      mockDataAggregator.aggregateNutritionData
        .mockResolvedValueOnce(currentData)
        .mockResolvedValueOnce(comparisonData);

      const result = await trendAnalyzer.analyzeHealthTrends(userId, period, comparisonPeriod);

      expect(result.trends.length).toBeGreaterThan(0);
      
      // 檢查是否有熱量趨勢
      const caloriesTrend = result.trends.find(t => t.metric === 'calories');
      expect(caloriesTrend).toBeDefined();
      expect(caloriesTrend?.direction).toBe('up'); // 從200增加到228.6
    });
  });

  describe('營養平衡分析', () => {
    it('應該檢測營養素比例異常', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      // 創建蛋白質比例過高的資料
      const mockData = {
        period,
        totalCalories: 1400,
        avgDailyCalories: 200,
        macronutrients: {
          protein: 140, // 140g * 4 = 560 kcal (40% 熱量來自蛋白質，過高)
          carbohydrates: 105, // 105g * 4 = 420 kcal (30%)
          fat: 47, // 47g * 9 = 423 kcal (30%)
          fiber: 25 // 添加缺失的 fiber 屬性
        },
        micronutrients: { vitamins: {}, minerals: {} },
        mealDistribution: { breakfast: 0.25, lunch: 0.375, dinner: 0.375, snack: 0 },
        dailyBreakdown: [],
        weeklyAverages: []
      };

      mockDataAggregator.aggregateNutritionData.mockResolvedValue(mockData);

      const result = await trendAnalyzer.analyzeHealthTrends(userId, period);

      const balanceInsight = result.insights.find(i => i.type === InsightType.NUTRITIONAL_BALANCE);
      expect(balanceInsight).toBeDefined();
      expect(balanceInsight?.severity).toBe('warning');
      expect(balanceInsight?.description).toContain('蛋白質比例過高');
    });
  });

  describe('異常檢測', () => {
    it('應該檢測熱量攝取異常', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const mockData = {
        period,
        totalCalories: 1400,
        avgDailyCalories: 200,
        macronutrients: { protein: 70, carbohydrates: 175, fat: 47, fiber: 21 },
        micronutrients: { vitamins: {}, minerals: {} },
        mealDistribution: { breakfast: 0.25, lunch: 0.375, dinner: 0.375, snack: 0 },
        dailyBreakdown: [
          { date: new Date('2024-01-01'), calories: 200, protein: 10, carbohydrates: 25, fat: 6.7, fiber: 3, mealCounts: {} as any },
          { date: new Date('2024-01-02'), calories: 180, protein: 9, carbohydrates: 22.5, fat: 6, fiber: 3, mealCounts: {} as any },
          { date: new Date('2024-01-03'), calories: 220, protein: 11, carbohydrates: 27.5, fat: 7.5, fiber: 3.5, mealCounts: {} as any },
          { date: new Date('2024-01-04'), calories: 500, protein: 25, carbohydrates: 62.5, fat: 16.7, fiber: 7.5, mealCounts: {} as any }, // 異常高值
          { date: new Date('2024-01-05'), calories: 190, protein: 9.5, carbohydrates: 23.75, fat: 6.3, fiber: 2.8, mealCounts: {} as any },
          { date: new Date('2024-01-06'), calories: 60, protein: 3, carbohydrates: 7.5, fat: 2, fiber: 1, mealCounts: {} as any }, // 異常低值
          { date: new Date('2024-01-07'), calories: 210, protein: 10.5, carbohydrates: 26.25, fat: 7, fiber: 3.2, mealCounts: {} as any }
        ],
        weeklyAverages: []
      };

      mockDataAggregator.aggregateNutritionData.mockResolvedValue(mockData);

      const result = await trendAnalyzer.analyzeHealthTrends(userId, period);

      const anomalyInsight = result.insights.find(i => i.type === InsightType.ANOMALY_DETECTION);
      expect(anomalyInsight).toBeDefined();
      expect(anomalyInsight?.title).toContain('熱量攝取異常');
    });
  });

  describe('習慣形成分析', () => {
    it('應該分析餐點規律性', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const mockData = {
        period,
        totalCalories: 1400,
        avgDailyCalories: 200,
        macronutrients: { protein: 70, carbohydrates: 175, fat: 47, fiber: 21 },
        micronutrients: { vitamins: {}, minerals: {} },
        mealDistribution: { breakfast: 0.25, lunch: 0.375, dinner: 0.375, snack: 0 },
        dailyBreakdown: [
          {
            date: new Date('2024-01-01'),
            calories: 200,
            protein: 10,
            carbohydrates: 25,
            fat: 6.7,
            fiber: 3,
            mealCounts: {
              [MealType.BREAKFAST]: 0, // 沒有早餐
              [MealType.LUNCH]: 1,
              [MealType.DINNER]: 1,
              [MealType.SNACK]: 0
            }
          },
          {
            date: new Date('2024-01-02'),
            calories: 200,
            protein: 10,
            carbohydrates: 25,
            fat: 6.7,
            fiber: 3,
            mealCounts: {
              [MealType.BREAKFAST]: 0, // 沒有早餐
              [MealType.LUNCH]: 1,
              [MealType.DINNER]: 1,
              [MealType.SNACK]: 0
            }
          },
          {
            date: new Date('2024-01-03'),
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
        weeklyAverages: []
      };

      mockDataAggregator.aggregateNutritionData.mockResolvedValue(mockData);

      const result = await trendAnalyzer.analyzeHealthTrends(userId, period);

      const habitInsight = result.insights.find(i => i.type === InsightType.HABIT_FORMATION);
      expect(habitInsight).toBeDefined();
      expect(habitInsight?.description).toContain('早餐記錄不規律');
    });
  });

  describe('建議生成', () => {
    it('應該根據趨勢生成相應建議', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const mockData = {
        period,
        totalCalories: 1400,
        avgDailyCalories: 200,
        macronutrients: { protein: 35, carbohydrates: 175, fat: 47, fiber: 10 }, // 蛋白質和纖維偏低
        micronutrients: { vitamins: {}, minerals: {} },
        mealDistribution: { breakfast: 0.25, lunch: 0.375, dinner: 0.375, snack: 0 },
        dailyBreakdown: [
          { date: new Date('2024-01-01'), calories: 250, protein: 5, carbohydrates: 31.25, fat: 8.4, fiber: 1.4, mealCounts: {} as any },
          { date: new Date('2024-01-02'), calories: 200, protein: 5, carbohydrates: 25, fat: 6.7, fiber: 1.4, mealCounts: {} as any },
          { date: new Date('2024-01-03'), calories: 180, protein: 5, carbohydrates: 22.5, fat: 6, fiber: 1.4, mealCounts: {} as any },
          { date: new Date('2024-01-04'), calories: 160, protein: 5, carbohydrates: 20, fat: 5.3, fiber: 1.4, mealCounts: {} as any },
          { date: new Date('2024-01-05'), calories: 140, protein: 5, carbohydrates: 17.5, fat: 4.7, fiber: 1.4, mealCounts: {} as any },
          { date: new Date('2024-01-06'), calories: 120, protein: 5, carbohydrates: 15, fat: 4, fiber: 1.4, mealCounts: {} as any },
          { date: new Date('2024-01-07'), calories: 100, protein: 5, carbohydrates: 12.5, fat: 3.3, fiber: 1.4, mealCounts: {} as any }
        ],
        weeklyAverages: []
      };

      mockDataAggregator.aggregateNutritionData.mockResolvedValue(mockData);

      const result = await trendAnalyzer.analyzeHealthTrends(userId, period);

      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // 應該有增加蛋白質的建議
      const proteinRecommendation = result.recommendations.find(r => 
        r.relatedTrends.includes('protein') && r.type === RecommendationType.MEAL_PLANNING
      );
      expect(proteinRecommendation).toBeDefined();
      
      // 應該有增加纖維的建議
      const fiberRecommendation = result.recommendations.find(r => 
        r.relatedTrends.includes('fiber')
      );
      expect(fiberRecommendation).toBeDefined();
    });
  });
});