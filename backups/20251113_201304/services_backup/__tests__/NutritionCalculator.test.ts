import { NutritionCalculator } from '../NutritionCalculator';
import { FoodRepository } from '../../repositories/FoodRepository';
import { NutritionData } from '@health-tracker/shared-types';

// Mock FoodRepository
jest.mock('../../repositories/FoodRepository');
const mockFoodRepository = {
  findById: jest.fn()
};
(FoodRepository as jest.Mock).mockImplementation(() => mockFoodRepository);

describe('NutritionCalculator', () => {
  let nutritionCalculator: NutritionCalculator;
  let mockNutritionData: NutritionData;

  beforeEach(() => {
    nutritionCalculator = new NutritionCalculator();
    
    // 重置所有 mocks
    jest.clearAllMocks();
    
    // 建立模擬營養資料
    mockNutritionData = {
      calories: 130,
      protein: 2.7,
      carbohydrates: 28,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      sodium: 5,
      vitamins: {
        vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
        thiamine: 0.07, riboflavin: 0.015, niacin: 1.6, vitaminB6: 0.164,
        folate: 8, vitaminB12: 0
      },
      minerals: {
        calcium: 28, iron: 0.8, magnesium: 25, phosphorus: 115,
        potassium: 115, sodium: 5, zinc: 1.09, copper: 0.22,
        manganese: 1.088, selenium: 15.1
      }
    };

    // Mock 食物資料
    mockFoodRepository.findById.mockResolvedValue({
      id: 'food-1',
      name: '白米飯',
      nutritionPer100g: mockNutritionData
    });
  });

  describe('estimatePortion', () => {
    it('應該基於用戶輸入估算份量', async () => {
      const options = {
        userInput: {
          estimatedWeight: 200
        }
      };

      const result = await nutritionCalculator.estimatePortion('白米飯', options);

      expect(result.portion).toBe(200);
      expect(result.confidence).toBe(0.9);
      expect(result.method).toBe('user_input');
    });

    it('應該基於圖片分析估算份量', async () => {
      const options = {
        imageAnalysis: {
          plateSize: 'large' as const,
          foodCoverage: 0.8,
          density: 'medium' as const
        }
      };

      const result = await nutritionCalculator.estimatePortion('白米飯', options);

      expect(result.portion).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.method).toBe('image_analysis');
    });

    it('應該基於份量描述估算份量', async () => {
      const options = {
        userInput: {
          portionDescription: 'large bowl'
        }
      };

      const result = await nutritionCalculator.estimatePortion('白米飯', options);

      expect(result.portion).toBeGreaterThan(150); // 應該比標準份量大
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('應該根據用餐時間調整份量', async () => {
      const breakfastOptions = {
        contextualClues: {
          mealType: 'breakfast' as const
        }
      };

      const dinnerOptions = {
        contextualClues: {
          mealType: 'dinner' as const
        }
      };

      const breakfastResult = await nutritionCalculator.estimatePortion('白米飯', breakfastOptions);
      const dinnerResult = await nutritionCalculator.estimatePortion('白米飯', dinnerOptions);

      expect(dinnerResult.portion).toBeGreaterThan(breakfastResult.portion);
    });

    it('應該根據用餐地點調整份量', async () => {
      const homeOptions = {
        contextualClues: {
          eatingLocation: 'home' as const
        }
      };

      const restaurantOptions = {
        contextualClues: {
          eatingLocation: 'restaurant' as const
        }
      };

      const homeResult = await nutritionCalculator.estimatePortion('白米飯', homeOptions);
      const restaurantResult = await nutritionCalculator.estimatePortion('白米飯', restaurantOptions);

      expect(restaurantResult.portion).toBeGreaterThan(homeResult.portion);
    });
  });

  describe('calculateNutritionForPortion', () => {
    it('應該正確計算指定份量的營養成分', () => {
      const portionInGrams = 150; // 150g
      const result = nutritionCalculator.calculateNutritionForPortion(
        mockNutritionData,
        portionInGrams
      );

      // 150g 應該是 100g 的 1.5 倍
      expect(result.calories).toBe(Math.round(130 * 1.5)); // 195
      expect(result.protein).toBe(Math.round(2.7 * 1.5 * 10) / 10); // 4.1
      expect(result.carbohydrates).toBe(Math.round(28 * 1.5 * 10) / 10); // 42
    });

    it('應該處理小份量計算', () => {
      const portionInGrams = 50; // 50g
      const result = nutritionCalculator.calculateNutritionForPortion(
        mockNutritionData,
        portionInGrams
      );

      // 50g 應該是 100g 的 0.5 倍
      expect(result.calories).toBe(Math.round(130 * 0.5)); // 65
      expect(result.protein).toBe(Math.round(2.7 * 0.5 * 10) / 10); // 1.4
    });

    it('應該正確計算維生素和礦物質', () => {
      const portionInGrams = 200; // 200g
      const result = nutritionCalculator.calculateNutritionForPortion(
        mockNutritionData,
        portionInGrams
      );

      expect(result.vitamins.thiamine).toBe(Math.round(0.07 * 2 * 10) / 10); // 0.1
      expect(result.minerals.calcium).toBe(Math.round(28 * 2 * 10) / 10); // 56
    });
  });

  describe('calculateNutrition', () => {
    it('應該成功計算營養成分', async () => {
      const foodId = 'food-1';
      const options = {
        userInput: {
          estimatedWeight: 150
        }
      };

      const result = await nutritionCalculator.calculateNutrition(foodId, options);

      expect(result).toHaveProperty('totalNutrition');
      expect(result).toHaveProperty('portionUsed');
      expect(result).toHaveProperty('calculationMethod');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('warnings');

      expect(result.portionUsed).toBe(150);
      expect(result.calculationMethod).toBe('exact');
      expect(result.confidence).toBe(0.9);
    });

    it('應該在找不到食物時拋出錯誤', async () => {
      mockFoodRepository.findById.mockResolvedValue(null);

      const foodId = 'non-existent-food';
      
      await expect(nutritionCalculator.calculateNutrition(foodId))
        .rejects.toThrow('找不到食物 ID: non-existent-food');
    });

    it('應該生成適當的警告', async () => {
      const options = {
        imageAnalysis: {
          plateSize: 'small' as const,
          foodCoverage: 0.3, // 低覆蓋率，可能導致低信心度
          density: 'low' as const
        }
      };

      const result = await nutritionCalculator.calculateNutrition('food-1', options);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('應該在份量過大時發出警告', async () => {
      const options = {
        userInput: {
          estimatedWeight: 600 // 很大的份量
        }
      };

      const result = await nutritionCalculator.calculateNutrition('food-1', options);

      expect(result.warnings).toContain('估算份量較大，請確認是否正確');
    });

    it('應該在熱量過高時發出警告', async () => {
      // Mock 高熱量食物
      mockFoodRepository.findById.mockResolvedValue({
        id: 'high-calorie-food',
        name: '高熱量食物',
        nutritionPer100g: {
          ...mockNutritionData,
          calories: 800 // 高熱量
        }
      });

      const options = {
        userInput: {
          estimatedWeight: 150
        }
      };

      const result = await nutritionCalculator.calculateNutrition('high-calorie-food', options);

      expect(result.warnings).toContain('熱量較高，請注意飲食均衡');
    });
  });

  describe('calculateMultipleFoodsNutrition', () => {
    beforeEach(() => {
      // Mock 多個食物
      mockFoodRepository.findById
        .mockResolvedValueOnce({
          id: 'food-1',
          name: '白米飯',
          nutritionPer100g: mockNutritionData
        })
        .mockResolvedValueOnce({
          id: 'food-2',
          name: '雞胸肉',
          nutritionPer100g: {
            ...mockNutritionData,
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 3.6
          }
        });
    });

    it('應該計算多個食物的總營養成分', async () => {
      const foods = [
        {
          foodId: 'food-1',
          options: {
            userInput: { estimatedWeight: 150 }
          }
        },
        {
          foodId: 'food-2',
          options: {
            userInput: { estimatedWeight: 100 }
          }
        }
      ];

      const result = await nutritionCalculator.calculateMultipleFoodsNutrition(foods);

      expect(result).toHaveProperty('totalNutrition');
      expect(result).toHaveProperty('individualResults');
      expect(result).toHaveProperty('overallConfidence');
      expect(result).toHaveProperty('warnings');

      expect(result.individualResults).toHaveLength(2);
      expect(result.totalNutrition.calories).toBeGreaterThan(0);
      expect(result.totalNutrition.protein).toBeGreaterThan(0);
    });

    it('應該處理計算失敗的情況', async () => {
      mockFoodRepository.findById
        .mockResolvedValueOnce({
          id: 'food-1',
          name: '白米飯',
          nutritionPer100g: mockNutritionData
        })
        .mockRejectedValueOnce(new Error('Food not found'));

      const foods = [
        { foodId: 'food-1' },
        { foodId: 'invalid-food' }
      ];

      const result = await nutritionCalculator.calculateMultipleFoodsNutrition(foods);

      expect(result.individualResults).toHaveLength(1); // 只有一個成功
      expect(result.warnings.length).toBeGreaterThan(0); // 應該有錯誤警告
    });
  });

  describe('getNutritionAdvice', () => {
    it('應該為高熱量餐點提供建議', () => {
      const highCalorieNutrition = {
        ...mockNutritionData,
        calories: 900
      };

      const advice = nutritionCalculator.getNutritionAdvice(highCalorieNutrition);

      expect(advice).toContain('這餐熱量較高，建議搭配運動或調整其他餐次');
    });

    it('應該為低熱量餐點提供建議', () => {
      const lowCalorieNutrition = {
        ...mockNutritionData,
        calories: 150
      };

      const advice = nutritionCalculator.getNutritionAdvice(lowCalorieNutrition);

      expect(advice).toContain('這餐熱量較低，可能需要增加份量或營養密度');
    });

    it('應該為低蛋白質餐點提供建議', () => {
      const lowProteinNutrition = {
        ...mockNutritionData,
        protein: 5
      };

      const advice = nutritionCalculator.getNutritionAdvice(lowProteinNutrition);

      expect(advice).toContain('蛋白質含量較低，建議增加蛋白質來源');
    });

    it('應該為低纖維餐點提供建議', () => {
      const lowFiberNutrition = {
        ...mockNutritionData,
        fiber: 1
      };

      const advice = nutritionCalculator.getNutritionAdvice(lowFiberNutrition);

      expect(advice).toContain('纖維含量較低，建議增加蔬菜或全穀類');
    });

    it('應該為高鈉餐點提供建議', () => {
      const highSodiumNutrition = {
        ...mockNutritionData,
        sodium: 1200
      };

      const advice = nutritionCalculator.getNutritionAdvice(highSodiumNutrition);

      expect(advice).toContain('鈉含量較高，請注意控制鹽分攝取');
    });

    it('應該為均衡餐點提供較少建議', () => {
      const balancedNutrition = {
        calories: 400,
        protein: 20,
        carbohydrates: 50,
        fat: 15,
        fiber: 8,
        sugar: 5,
        sodium: 300,
        vitamins: mockNutritionData.vitamins,
        minerals: mockNutritionData.minerals
      };

      const advice = nutritionCalculator.getNutritionAdvice(balancedNutrition);

      expect(advice.length).toBe(0); // 均衡的餐點應該沒有警告
    });
  });
});