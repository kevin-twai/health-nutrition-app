import { RecommendationEngine } from '../RecommendationEngine';
import { 
  UserProfile,
  HealthGoal,
  NutritionContextData,
  GoalType,
  ActivityLevel,
  GoalStatus,
  RecommendationType,
  Priority,
  MealType
} from '@health-tracker/shared-types';

describe('RecommendationEngine', () => {
  let recommendationEngine: RecommendationEngine;

  beforeEach(() => {
    recommendationEngine = new RecommendationEngine();
  });

  const mockUserProfile: UserProfile = {
    name: '測試用戶',
    age: 30,
    gender: 'female',
    height: 165,
    weight: 60,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE
  };

  const mockHealthGoals: HealthGoal[] = [
    {
      id: 'goal-1',
      type: GoalType.WEIGHT_LOSS,
      target: 55,
      current: 60,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 天後
      status: GoalStatus.ACTIVE
    }
  ];

  const mockNutritionData: NutritionContextData[] = [
    {
      date: new Date(),
      totalCalories: 1800,
      macros: {
        protein: 80,
        carbohydrates: 200,
        fat: 60,
        fiber: 20
      },
      meals: []
    },
    {
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      totalCalories: 2000,
      macros: {
        protein: 70,
        carbohydrates: 250,
        fat: 70,
        fiber: 18
      },
      meals: []
    }
  ];

  describe('generatePersonalizedRecommendations', () => {
    it('應該生成個人化建議', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData
      );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(8);

      // 檢查建議結構
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('actionable');
        expect(rec).toHaveProperty('relatedGoals');
      });
    });

    it('應該基於健康目標生成相關建議', async () => {
      const weightLossGoals: HealthGoal[] = [
        {
          id: 'goal-1',
          type: GoalType.WEIGHT_LOSS,
          target: 55,
          current: 60,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          status: GoalStatus.ACTIVE
        }
      ];

      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        weightLossGoals,
        mockNutritionData
      );

      const weightLossRecommendations = recommendations.filter(rec => 
        rec.relatedGoals.includes('goal-1') || 
        rec.title.includes('減重') ||
        rec.description.includes('減重')
      );

      expect(weightLossRecommendations.length).toBeGreaterThan(0);
    });

    it('應該基於用戶檔案生成適合的建議', async () => {
      const elderlyProfile: UserProfile = {
        ...mockUserProfile,
        age: 65
      };

      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        elderlyProfile,
        [],
        mockNutritionData
      );

      const ageSpecificRecommendations = recommendations.filter(rec => 
        rec.title.includes('中高齡') || 
        rec.description.includes('鈣質') ||
        rec.description.includes('維生素D')
      );

      expect(ageSpecificRecommendations.length).toBeGreaterThan(0);
    });

    it('應該基於活動水平生成建議', async () => {
      const sedentaryProfile: UserProfile = {
        ...mockUserProfile,
        activityLevel: ActivityLevel.SEDENTARY
      };

      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        sedentaryProfile,
        [],
        mockNutritionData
      );

      const activityRecommendations = recommendations.filter(rec => 
        rec.type === RecommendationType.EXERCISE ||
        rec.description.includes('運動') ||
        rec.description.includes('活動')
      );

      expect(activityRecommendations.length).toBeGreaterThan(0);
    });

    it('應該在沒有營養資料時仍能生成建議', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        []
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('應該基於上下文生成建議', async () => {
      const context = {
        recentChallenges: ['外食頻繁'],
        preferences: ['素食'],
        timeConstraints: ['忙碌']
      };

      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData,
        context
      );

      const contextRecommendations = recommendations.filter(rec => 
        rec.description.includes('外食') ||
        rec.description.includes('忙碌') ||
        rec.title.includes('忙碌')
      );

      expect(contextRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('generateMealRecommendations', () => {
    it('應該為早餐生成適當建議', async () => {
      const recommendations = recommendationEngine.generateMealRecommendations(
        MealType.BREAKFAST,
        mockUserProfile,
        mockHealthGoals
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const breakfastRec = recommendations.find(rec => rec.title.includes('早餐'));
      expect(breakfastRec).toBeDefined();
      expect(breakfastRec?.description).toContain('蛋白質');
    });

    it('應該為午餐生成適當建議', async () => {
      const recommendations = recommendationEngine.generateMealRecommendations(
        MealType.LUNCH,
        mockUserProfile,
        mockHealthGoals
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const lunchRec = recommendations.find(rec => rec.title.includes('午餐'));
      expect(lunchRec).toBeDefined();
      expect(lunchRec?.description).toContain('蛋白質');
    });

    it('應該為晚餐生成適當建議', async () => {
      const recommendations = recommendationEngine.generateMealRecommendations(
        MealType.DINNER,
        mockUserProfile,
        mockHealthGoals
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const dinnerRec = recommendations.find(rec => rec.title.includes('晚餐'));
      expect(dinnerRec).toBeDefined();
      expect(dinnerRec?.description).toContain('易消化');
    });

    it('應該為點心生成適當建議', async () => {
      const recommendations = recommendationEngine.generateMealRecommendations(
        MealType.SNACK,
        mockUserProfile,
        mockHealthGoals
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const snackRec = recommendations.find(rec => rec.title.includes('點心'));
      expect(snackRec).toBeDefined();
      expect(snackRec?.description).toContain('營養密度');
    });
  });

  describe('generateSeasonalRecommendations', () => {
    it('應該為春季生成適當建議', () => {
      const recommendations = recommendationEngine.generateSeasonalRecommendations('spring');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const springRec = recommendations.find(rec => rec.title.includes('春季'));
      expect(springRec).toBeDefined();
      expect(springRec?.description).toContain('綠色蔬菜');
    });

    it('應該為夏季生成適當建議', () => {
      const recommendations = recommendationEngine.generateSeasonalRecommendations('summer');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const summerRec = recommendations.find(rec => rec.title.includes('夏季'));
      expect(summerRec).toBeDefined();
      expect(summerRec?.description).toContain('水分');
    });

    it('應該為秋季生成適當建議', () => {
      const recommendations = recommendationEngine.generateSeasonalRecommendations('autumn');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const autumnRec = recommendations.find(rec => rec.title.includes('秋季'));
      expect(autumnRec).toBeDefined();
      expect(autumnRec?.description).toContain('白色食物');
    });

    it('應該為冬季生成適當建議', () => {
      const recommendations = recommendationEngine.generateSeasonalRecommendations('winter');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const winterRec = recommendations.find(rec => rec.title.includes('冬季'));
      expect(winterRec).toBeDefined();
      expect(winterRec?.description).toContain('溫熱');
    });
  });

  describe('建議優先級排序', () => {
    // 輔助方法：將優先級轉換為數值
    const getPriorityValue = (priority: Priority): number => {
      switch (priority) {
        case Priority.URGENT: return 4;
        case Priority.HIGH: return 3;
        case Priority.MEDIUM: return 2;
        case Priority.LOW: return 1;
        default: return 0;
      }
    };

    it('應該正確排序建議優先級', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData
      );

      // 檢查建議是否按優先級排序
      for (let i = 0; i < recommendations.length - 1; i++) {
        const currentPriority = getPriorityValue(recommendations[i].priority);
        const nextPriority = getPriorityValue(recommendations[i + 1].priority);
        expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
      }
    });
  });

  describe('建議類型分布', () => {
    it('應該生成多種類型的建議', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData
      );

      const types = new Set(recommendations.map(rec => rec.type));
      expect(types.size).toBeGreaterThan(1); // 應該有多種類型的建議
    });

    it('應該包含營養調整類型的建議', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData
      );

      const nutritionRecommendations = recommendations.filter(rec => 
        rec.type === RecommendationType.NUTRITION_ADJUSTMENT
      );

      expect(nutritionRecommendations.length).toBeGreaterThan(0);
    });

    it('應該包含習慣養成類型的建議', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData
      );

      const habitRecommendations = recommendations.filter(rec => 
        rec.type === RecommendationType.HABIT_FORMATION
      );

      expect(habitRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('建議可執行性', () => {
    it('應該生成可執行的建議', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData
      );

      const actionableRecommendations = recommendations.filter(rec => rec.actionable);
      expect(actionableRecommendations.length).toBeGreaterThan(0);
    });

    it('應該提供具體的行動指導', async () => {
      const recommendations = await recommendationEngine.generatePersonalizedRecommendations(
        mockUserProfile,
        mockHealthGoals,
        mockNutritionData
      );

      recommendations.forEach(rec => {
        expect(rec.description.length).toBeGreaterThan(10); // 描述應該足夠詳細
        expect(rec.title.length).toBeGreaterThan(3); // 標題應該有意義
      });
    });
  });
});