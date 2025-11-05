import { FoodModel } from '../Food';
import { FoodCategory, MealType, LogSource } from '@health-tracker/shared-types';

describe('FoodModel', () => {
  const mockNutritionData = {
    calories: 100,
    protein: 20,
    carbohydrates: 10,
    fat: 5,
    fiber: 3,
    sugar: 2,
    sodium: 100,
    vitamins: {
      vitaminA: 10, vitaminC: 15, vitaminD: 2, vitaminE: 1, vitaminK: 5,
      thiamine: 0.1, riboflavin: 0.2, niacin: 2, vitaminB6: 0.3, folate: 50, vitaminB12: 1
    },
    minerals: {
      calcium: 50, iron: 2, magnesium: 25, phosphorus: 100, potassium: 200,
      sodium: 100, zinc: 1, copper: 0.1, manganese: 0.5, selenium: 10
    }
  };

  describe('驗證功能', () => {
    describe('validateNutritionData', () => {
      it('應該驗證有效的營養資料', () => {
        const { error, value } = FoodModel.validateNutritionData(mockNutritionData);

        expect(error).toBeUndefined();
        expect(value?.calories).toBe(100);
        expect(value?.protein).toBe(20);
      });

      it('應該拒絕負數熱量', () => {
        const invalidData = {
          ...mockNutritionData,
          calories: -50
        };

        const { error } = FoodModel.validateNutritionData(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('熱量不能為負數');
      });

      it('應該拒絕過高的熱量', () => {
        const invalidData = {
          ...mockNutritionData,
          calories: 10000
        };

        const { error } = FoodModel.validateNutritionData(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('熱量不能超過9000大卡');
      });

      it('應該拒絕負數蛋白質', () => {
        const invalidData = {
          ...mockNutritionData,
          protein: -5
        };

        const { error } = FoodModel.validateNutritionData(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('蛋白質不能為負數');
      });

      it('應該設定預設值', () => {
        const minimalData = {
          calories: 100,
          protein: 10,
          carbohydrates: 15,
          fat: 5
        };

        const { error, value } = FoodModel.validateNutritionData(minimalData);

        expect(error).toBeUndefined();
        expect(value?.fiber).toBe(0);
        expect(value?.sugar).toBe(0);
        expect(value?.sodium).toBe(0);
        expect(value?.vitamins).toBeDefined();
        expect(value?.minerals).toBeDefined();
      });
    });

    describe('validateFoodItem', () => {
      const validFoodItem = {
        name: '雞胸肉',
        category: FoodCategory.PROTEINS,
        nutritionPer100g: mockNutritionData,
        commonPortions: [
          { name: '100公克', weight: 100, description: '標準份量' }
        ],
        tags: ['高蛋白', '低脂']
      };

      it('應該驗證有效的食物項目', () => {
        const { error, value } = FoodModel.validateFoodItem(validFoodItem);

        expect(error).toBeUndefined();
        expect(value?.name).toBe('雞胸肉');
        expect(value?.category).toBe(FoodCategory.PROTEINS);
      });

      it('應該拒絕空的食物名稱', () => {
        const invalidData = {
          ...validFoodItem,
          name: ''
        };

        const { error } = FoodModel.validateFoodItem(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('食物名稱不能為空');
      });

      it('應該拒絕無效的食物分類', () => {
        const invalidData = {
          ...validFoodItem,
          category: 'invalid_category' as any
        };

        const { error } = FoodModel.validateFoodItem(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('食物分類必須是有效的選項');
      });

      it('應該要求至少一個常見份量', () => {
        const invalidData = {
          ...validFoodItem,
          commonPortions: []
        };

        const { error } = FoodModel.validateFoodItem(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('至少需要提供一個常見份量');
      });

      it('應該設定預設值', () => {
        const minimalData = {
          name: '測試食物',
          category: FoodCategory.FRUITS,
          nutritionPer100g: mockNutritionData,
          commonPortions: [
            { name: '100公克', weight: 100, description: '標準份量' }
          ]
        };

        const { error, value } = FoodModel.validateFoodItem(minimalData);

        expect(error).toBeUndefined();
        expect(value?.tags).toEqual([]);
        expect(value?.verified).toBe(false);
        expect(value?.source).toBe('manual');
      });
    });

    describe('validateFoodLog', () => {
      const validFoodLog = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        foodId: 'food123',
        portion: 150,
        mealType: MealType.LUNCH,
        timestamp: new Date(),
        source: LogSource.MANUAL_INPUT
      };

      it('應該驗證有效的食物記錄', () => {
        const { error, value } = FoodModel.validateFoodLog(validFoodLog);

        expect(error).toBeUndefined();
        expect(value?.userId).toBe(validFoodLog.userId);
        expect(value?.portion).toBe(150);
      });

      it('應該拒絕無效的用戶 ID', () => {
        const invalidData = {
          ...validFoodLog,
          userId: 'invalid-uuid'
        };

        const { error } = FoodModel.validateFoodLog(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('用戶ID格式不正確');
      });

      it('應該拒絕負數份量', () => {
        const invalidData = {
          ...validFoodLog,
          portion: -50
        };

        const { error } = FoodModel.validateFoodLog(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('份量必須為正數');
      });

      it('應該拒絕過大的份量', () => {
        const invalidData = {
          ...validFoodLog,
          portion: 15000
        };

        const { error } = FoodModel.validateFoodLog(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('份量不能超過10000公克');
      });

      it('應該拒絕無效的餐點類型', () => {
        const invalidData = {
          ...validFoodLog,
          mealType: 'invalid_meal' as any
        };

        const { error } = FoodModel.validateFoodLog(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('餐點類型必須是有效的選項');
      });

      it('應該拒絕未來時間', () => {
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const invalidData = {
          ...validFoodLog,
          timestamp: futureDate
        };

        const { error } = FoodModel.validateFoodLog(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('記錄時間不能是未來時間');
      });

      it('應該驗證信心度範圍', () => {
        const invalidData = {
          ...validFoodLog,
          confidence: 1.5 // 超過1
        };

        const { error } = FoodModel.validateFoodLog(invalidData);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('信心度不能大於1');
      });
    });

    describe('validateSearch', () => {
      it('應該驗證有效的搜尋參數', () => {
        const validSearch = {
          query: '雞肉',
          category: FoodCategory.PROTEINS,
          limit: 20,
          offset: 0
        };

        const { error, value } = FoodModel.validateSearch(validSearch);

        expect(error).toBeUndefined();
        expect(value?.query).toBe('雞肉');
        expect(value?.limit).toBe(20);
      });

      it('應該拒絕空的搜尋關鍵字', () => {
        const invalidSearch = {
          query: ''
        };

        const { error } = FoodModel.validateSearch(invalidSearch);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('搜尋關鍵字不能為空');
      });

      it('應該拒絕過長的搜尋關鍵字', () => {
        const invalidSearch = {
          query: 'a'.repeat(101) // 超過100個字符
        };

        const { error } = FoodModel.validateSearch(invalidSearch);

        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('搜尋關鍵字不能超過100個字符');
      });

      it('應該設定預設值', () => {
        const minimalSearch = {
          query: '測試'
        };

        const { error, value } = FoodModel.validateSearch(minimalSearch);

        expect(error).toBeUndefined();
        expect(value?.limit).toBe(20);
        expect(value?.offset).toBe(0);
      });
    });
  });

  describe('計算功能', () => {
    describe('calculateActualNutrition', () => {
      it('應該正確計算實際營養攝取量', () => {
        const portion = 150; // 150公克
        const actual = FoodModel.calculateActualNutrition(mockNutritionData, portion);

        expect(actual.calories).toBe(150); // 100 * 1.5
        expect(actual.protein).toBe(30); // 20 * 1.5
        expect(actual.carbohydrates).toBe(15); // 10 * 1.5
        expect(actual.fat).toBe(7.5); // 5 * 1.5
      });

      it('應該處理小數點精度', () => {
        const portion = 33.33; // 33.33公克
        const actual = FoodModel.calculateActualNutrition(mockNutritionData, portion);

        // 檢查結果是否正確四捨五入
        expect(actual.calories).toBe(33.3);
        expect(actual.protein).toBe(6.7);
      });

      it('應該處理零份量', () => {
        const portion = 0;
        const actual = FoodModel.calculateActualNutrition(mockNutritionData, portion);

        expect(actual.calories).toBe(0);
        expect(actual.protein).toBe(0);
        expect(actual.carbohydrates).toBe(0);
        expect(actual.fat).toBe(0);
      });
    });

    describe('calculateNutritionDensityScore', () => {
      it('應該計算營養密度分數', () => {
        const score = FoodModel.calculateNutritionDensityScore(mockNutritionData);

        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(typeof score).toBe('number');
      });

      it('應該對零熱量食物返回0分', () => {
        const zeroCalorieData = {
          ...mockNutritionData,
          calories: 0
        };

        const score = FoodModel.calculateNutritionDensityScore(zeroCalorieData);
        expect(score).toBe(0);
      });

      it('應該對高蛋白食物給予較高分數', () => {
        const highProteinData = {
          ...mockNutritionData,
          protein: 50 // 高蛋白
        };

        const normalScore = FoodModel.calculateNutritionDensityScore(mockNutritionData);
        const highProteinScore = FoodModel.calculateNutritionDensityScore(highProteinData);

        expect(highProteinScore).toBeGreaterThan(normalScore);
      });

      it('應該對高纖維食物給予較高分數', () => {
        const highFiberData = {
          ...mockNutritionData,
          fiber: 15 // 高纖維
        };

        const normalScore = FoodModel.calculateNutritionDensityScore(mockNutritionData);
        const highFiberScore = FoodModel.calculateNutritionDensityScore(highFiberData);

        expect(highFiberScore).toBeGreaterThan(normalScore);
      });
    });

    describe('categorizeHealthLevel', () => {
      it('應該正確分類健康等級', () => {
        // 測試優秀等級
        const excellentData = {
          ...mockNutritionData,
          protein: 30,
          fiber: 10,
          vitamins: {
            ...mockNutritionData.vitamins,
            vitaminC: 100,
            vitaminA: 500
          }
        };

        const excellentLevel = FoodModel.categorizeHealthLevel(excellentData);
        expect(['excellent', 'good']).toContain(excellentLevel);

        // 測試較差等級
        const poorData = {
          calories: 500,
          protein: 2,
          carbohydrates: 60,
          fat: 25,
          fiber: 0,
          sugar: 40,
          sodium: 1000,
          vitamins: {
            vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
            thiamine: 0, riboflavin: 0, niacin: 0, vitaminB6: 0, folate: 0, vitaminB12: 0
          },
          minerals: {
            calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0,
            sodium: 1000, zinc: 0, copper: 0, manganese: 0, selenium: 0
          }
        };

        const poorLevel = FoodModel.categorizeHealthLevel(poorData);
        expect(['poor', 'fair']).toContain(poorLevel);
      });
    });

    describe('generateFoodTags', () => {
      it('應該生成正確的食物標籤', () => {
        const tags = FoodModel.generateFoodTags(mockNutritionData);

        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBeGreaterThan(0);
      });

      it('應該為低熱量食物添加標籤', () => {
        const lowCalorieData = {
          ...mockNutritionData,
          calories: 30
        };

        const tags = FoodModel.generateFoodTags(lowCalorieData);
        expect(tags).toContain('低熱量');
      });

      it('應該為高熱量食物添加標籤', () => {
        const highCalorieData = {
          ...mockNutritionData,
          calories: 400
        };

        const tags = FoodModel.generateFoodTags(highCalorieData);
        expect(tags).toContain('高熱量');
      });

      it('應該為高蛋白食物添加標籤', () => {
        const highProteinData = {
          ...mockNutritionData,
          protein: 25
        };

        const tags = FoodModel.generateFoodTags(highProteinData);
        expect(tags).toContain('高蛋白');
      });

      it('應該為高纖維食物添加標籤', () => {
        const highFiberData = {
          ...mockNutritionData,
          fiber: 8
        };

        const tags = FoodModel.generateFoodTags(highFiberData);
        expect(tags).toContain('高纖維');
      });

      it('應該為高鈉食物添加標籤', () => {
        const highSodiumData = {
          ...mockNutritionData,
          sodium: 800
        };

        const tags = FoodModel.generateFoodTags(highSodiumData);
        expect(tags).toContain('高鈉');
      });

      it('應該為低鈉食物添加標籤', () => {
        const lowSodiumData = {
          ...mockNutritionData,
          sodium: 50
        };

        const tags = FoodModel.generateFoodTags(lowSodiumData);
        expect(tags).toContain('低鈉');
      });

      it('應該為高糖食物添加標籤', () => {
        const highSugarData = {
          ...mockNutritionData,
          sugar: 20
        };

        const tags = FoodModel.generateFoodTags(highSugarData);
        expect(tags).toContain('高糖');
      });

      it('應該為低糖食物添加標籤', () => {
        const lowSugarData = {
          ...mockNutritionData,
          sugar: 2
        };

        const tags = FoodModel.generateFoodTags(lowSugarData);
        expect(tags).toContain('低糖');
      });

      it('應該為高脂肪食物添加標籤', () => {
        const highFatData = {
          ...mockNutritionData,
          fat: 25
        };

        const tags = FoodModel.generateFoodTags(highFatData);
        expect(tags).toContain('高脂肪');
      });

      it('應該為低脂肪食物添加標籤', () => {
        const lowFatData = {
          ...mockNutritionData,
          fat: 1
        };

        const tags = FoodModel.generateFoodTags(lowFatData);
        expect(tags).toContain('低脂肪');
      });

      it('應該包含健康等級標籤', () => {
        const tags = FoodModel.generateFoodTags(mockNutritionData);
        
        const healthTags = ['營養豐富', '營養良好', '營養普通', '營養較少'];
        const hasHealthTag = tags.some(tag => healthTags.includes(tag));
        expect(hasHealthTag).toBe(true);
      });
    });
  });
});