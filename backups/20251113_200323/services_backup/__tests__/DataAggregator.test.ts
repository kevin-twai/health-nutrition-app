import { DataAggregator } from '../DataAggregator';
import { LogRepository } from '../../repositories/LogRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { MealType, GroupByPeriod, LogSource, ActivityLevel } from '@health-tracker/shared-types';

// Mock repositories
jest.mock('../../repositories/LogRepository');
jest.mock('../../repositories/UserRepository');

describe('DataAggregator', () => {
  let dataAggregator: DataAggregator;
  let mockLogRepository: jest.Mocked<LogRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockLogRepository = new LogRepository(null as any, null as any, null as any) as jest.Mocked<LogRepository>;
    mockUserRepository = new UserRepository(null as any, null as any) as jest.Mocked<UserRepository>;
    dataAggregator = new DataAggregator(mockLogRepository, mockUserRepository);
  });

  describe('aggregateNutritionData', () => {
    it('應該正確彙整營養資料', async () => {
      // 準備測試資料
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const mockFoodLogs = [
        {
          id: '1',
          userId,
          foodId: 'food-1',
          portion: 100,
          mealType: MealType.BREAKFAST,
          timestamp: new Date('2024-01-01T08:00:00Z'),
          source: LogSource.MANUAL_INPUT,
          calories: 300,
          protein: 20,
          carbohydrates: 40,
          fat: 10,
          fiber: 5
        },
        {
          id: '2',
          userId,
          foodId: 'food-2',
          portion: 150,
          mealType: MealType.LUNCH,
          timestamp: new Date('2024-01-01T12:00:00Z'),
          source: LogSource.MANUAL_INPUT,
          calories: 450,
          protein: 25,
          carbohydrates: 50,
          fat: 15,
          fiber: 8
        }
      ];

      const mockNutritionStats = {
        totalCalories: 750,
        totalProtein: 45,
        totalCarbohydrates: 90,
        totalFat: 25,
        totalFiber: 13,
        mealBreakdown: {
          [MealType.BREAKFAST]: { calories: 300, protein: 20, carbohydrates: 40, fat: 10, count: 1 },
          [MealType.LUNCH]: { calories: 450, protein: 25, carbohydrates: 50, fat: 15, count: 1 },
          [MealType.DINNER]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 },
          [MealType.SNACK]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 }
        }
      };

      // 設定 mock 回傳值
      mockLogRepository.findByDateRange.mockResolvedValue(mockFoodLogs);
      mockLogRepository.getNutritionStats.mockResolvedValue(mockNutritionStats);

      // 執行測試
      const result = await dataAggregator.aggregateNutritionData({
        userId,
        period,
        groupBy: GroupByPeriod.DAY,
        includeComparisons: false,
        includeTrends: false
      });

      // 驗證結果
      expect(result.totalCalories).toBe(750);
      expect(result.macronutrients.protein).toBe(45);
      expect(result.macronutrients.carbohydrates).toBe(90);
      expect(result.macronutrients.fat).toBe(25);
      expect(result.macronutrients.fiber).toBe(13);
      expect(result.mealDistribution.breakfast).toBeCloseTo(0.4); // 300/750
      expect(result.mealDistribution.lunch).toBeCloseTo(0.6); // 450/750
    });

    it('應該處理空資料的情況', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      mockLogRepository.findByDateRange.mockResolvedValue([]);
      mockLogRepository.getNutritionStats.mockResolvedValue({
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

      const result = await dataAggregator.aggregateNutritionData({
        userId,
        period,
        groupBy: GroupByPeriod.DAY,
        includeComparisons: false,
        includeTrends: false
      });

      expect(result.totalCalories).toBe(0);
      expect(result.avgDailyCalories).toBe(0);
      expect(result.dailyBreakdown).toHaveLength(7); // 7天的資料
    });
  });

  describe('compareNutritionPeriods', () => {
    it('應該正確比較兩個期間的營養資料', async () => {
      const userId = 'test-user-id';
      const currentPeriod = {
        start: new Date('2024-01-08'),
        end: new Date('2024-01-14')
      };
      const comparisonPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      // Mock 當前期間資料
      mockLogRepository.findByDateRange
        .mockResolvedValueOnce([]) // 第一次調用（當前期間）
        .mockResolvedValueOnce([]); // 第二次調用（比較期間）

      mockLogRepository.getNutritionStats
        .mockResolvedValueOnce({
          totalCalories: 1400,
          totalProtein: 70,
          totalCarbohydrates: 180,
          totalFat: 50,
          totalFiber: 25,
          mealBreakdown: {
            [MealType.BREAKFAST]: { calories: 350, protein: 17.5, carbohydrates: 45, fat: 12.5, count: 7 },
            [MealType.LUNCH]: { calories: 525, protein: 26.25, carbohydrates: 67.5, fat: 18.75, count: 7 },
            [MealType.DINNER]: { calories: 525, protein: 26.25, carbohydrates: 67.5, fat: 18.75, count: 7 },
            [MealType.SNACK]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 }
          }
        })
        .mockResolvedValueOnce({
          totalCalories: 1050,
          totalProtein: 52.5,
          totalCarbohydrates: 135,
          totalFat: 37.5,
          totalFiber: 18.75,
          mealBreakdown: {
            [MealType.BREAKFAST]: { calories: 262.5, protein: 13.125, carbohydrates: 33.75, fat: 9.375, count: 7 },
            [MealType.LUNCH]: { calories: 393.75, protein: 19.6875, carbohydrates: 50.625, fat: 14.0625, count: 7 },
            [MealType.DINNER]: { calories: 393.75, protein: 19.6875, carbohydrates: 50.625, fat: 14.0625, count: 7 },
            [MealType.SNACK]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 }
          }
        });

      const result = await dataAggregator.compareNutritionPeriods(userId, currentPeriod, comparisonPeriod);

      expect(result.changes.calories).toBeCloseTo(50); // (1400/7) - (1050/7) = 200 - 150 = 50
      expect(result.changes.protein).toBeCloseTo(2.5); // (70/7) - (52.5/7) = 10 - 7.5 = 2.5
    });
  });

  describe('getNutritionGoalProgress', () => {
    it('應該計算營養目標達成率', async () => {
      const userId = 'test-user-id';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        profile: {
          name: 'Test User',
          weight: 70,
          height: 175,
          age: 30,
          gender: 'male' as const,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE
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

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockLogRepository.findByDateRange.mockResolvedValue([]);
      mockLogRepository.getNutritionStats.mockResolvedValue({
        totalCalories: 1400,
        totalProtein: 84,
        totalCarbohydrates: 175,
        totalFat: 47,
        totalFiber: 21,
        mealBreakdown: {
          [MealType.BREAKFAST]: { calories: 350, protein: 21, carbohydrates: 43.75, fat: 11.75, count: 7 },
          [MealType.LUNCH]: { calories: 525, protein: 31.5, carbohydrates: 65.625, fat: 17.625, count: 7 },
          [MealType.DINNER]: { calories: 525, protein: 31.5, carbohydrates: 65.625, fat: 17.625, count: 7 },
          [MealType.SNACK]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 }
        }
      });

      const result = await dataAggregator.getNutritionGoalProgress(userId, period);

      expect(result.calories.actual).toBe(1400);
      expect(result.protein.actual).toBe(84);
      expect(result.calories.progress).toBeGreaterThan(0);
      expect(result.protein.progress).toBeGreaterThan(0);
    });

    it('應該在用戶不存在時拋出錯誤', async () => {
      const userId = 'non-existent-user';
      const period = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(dataAggregator.getNutritionGoalProgress(userId, period))
        .rejects.toThrow('用戶不存在');
    });
  });
});