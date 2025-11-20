import { NutritionCalculator } from '../NutritionCalculator';
import { ComponentDetectionEngine } from '../ComponentDetectionEngine';

describe('豆腐識別修復測試', () => {
  let nutritionCalculator: NutritionCalculator;
  let componentEngine: ComponentDetectionEngine;

  beforeEach(() => {
    nutritionCalculator = new NutritionCalculator();
    componentEngine = new ComponentDetectionEngine();
  });

  describe('營養數據匹配修復', () => {
    it('應該正確匹配「豆腐」而不是「豆腐干絲」', async () => {
      // 模擬營養數據庫查找
      const mockNutritionRepo = {
        findByName: jest.fn().mockResolvedValue(null), // 模擬精確匹配失敗
        findByPartialName: jest.fn().mockResolvedValue([
          { name: '豆腐干絲', nutritionPer100g: { calories: 140, protein: 16.2, carbohydrates: 4.8, fat: 6.2, fiber: 1.8 } },
          { name: '豆腐', nutritionPer100g: { calories: 76, protein: 8.1, carbohydrates: 1.9, fat: 4.8, fiber: 0.4 } },
          { name: '豆腐皮', nutritionPer100g: { calories: 409, protein: 44.6, carbohydrates: 18.8, fat: 17.4, fiber: 1.0 } }
        ])
      };

      // 使用反射設置 mock repository
      (nutritionCalculator as any).foodRepository = mockNutritionRepo;

      // 測試模糊匹配邏輯
      const result = await (nutritionCalculator as any).fuzzyMatchNutrition('豆腐');
      
      expect(result).toBeDefined();
      expect(result.name).toBe('豆腐');
      expect(result.nutritionPer100g.calories).toBe(76);
      expect(result.name).not.toBe('豆腐干絲');
    });

    it('應該優先選擇精確匹配', async () => {
      const mockNutritionRepo = {
        findByName: jest.fn().mockResolvedValue(null),
        findByPartialName: jest.fn().mockResolvedValue([
          { name: '豆腐干絲', nutritionPer100g: { calories: 140, protein: 16.2 } },
          { name: '豆腐', nutritionPer100g: { calories: 76, protein: 8.1 } },
          { name: '油豆腐', nutritionPer100g: { calories: 271, protein: 17.1 } }
        ])
      };

      (nutritionCalculator as any).foodRepository = mockNutritionRepo;

      const bestMatch = (nutritionCalculator as any).findBestMatch('豆腐', [
        { name: '豆腐干絲', nutritionPer100g: { calories: 140 } },
        { name: '豆腐', nutritionPer100g: { calories: 76 } },
        { name: '油豆腐', nutritionPer100g: { calories: 271 } }
      ]);

      expect(bestMatch.name).toBe('豆腐');
      expect(bestMatch.nutritionPer100g.calories).toBe(76);
    });

    it('應該避免選擇包含搜索詞的長名稱', async () => {
      const bestMatch = (nutritionCalculator as any).findBestMatch('豆腐', [
        { name: '豆腐干絲', nutritionPer100g: { calories: 140 } },
        { name: '豆腐皮炒韭菜', nutritionPer100g: { calories: 200 } },
        { name: '豆腐', nutritionPer100g: { calories: 76 } }
      ]);

      expect(bestMatch.name).toBe('豆腐');
    });

    it('當沒有精確匹配時，應該選擇名稱長度最接近的', async () => {
      const bestMatch = (nutritionCalculator as any).findBestMatch('豆腐', [
        { name: '豆腐干絲', nutritionPer100g: { calories: 140 } },
        { name: '油豆腐', nutritionPer100g: { calories: 271 } }
      ]);

      // 「油豆腐」(3字) 比「豆腐干絲」(4字) 更接近「豆腐」(2字)
      expect(bestMatch.name).toBe('油豆腐');
    });
  });

  describe('火鍋場景測試', () => {
    it('應該正確處理火鍋中的豆腐識別', async () => {
      const mockNutritionRepo = {
        findByName: jest.fn().mockResolvedValue(null),
        findByPartialName: jest.fn().mockResolvedValue([
          { name: '豆腐', nutritionPer100g: { calories: 76, protein: 8.1 } },
          { name: '豆腐干絲', nutritionPer100g: { calories: 140, protein: 16.2 } }
        ])
      };

      (nutritionCalculator as any).foodRepository = mockNutritionRepo;

      // 測試豆腐的營養數據查找
      const result = await (nutritionCalculator as any).findNutritionData('豆腐');
      
      expect(result).toBeDefined();
      expect(result.name).toBe('豆腐');
      expect(result.nutritionPer100g.calories).toBe(76);
      expect(result.name).not.toBe('豆腐干絲');
    });
  });

  describe('排序邏輯測試', () => {
    it('應該正確排序部分匹配結果', () => {
      const mockFoods = [
        { name: '豆腐干絲', nutritionPer100g: { calories: 140 } },
        { name: '豆腐皮', nutritionPer100g: { calories: 409 } },
        { name: '豆腐', nutritionPer100g: { calories: 76 } },
        { name: '油豆腐', nutritionPer100g: { calories: 271 } }
      ];

      // 模擬 FoodRepository 的排序邏輯
      const sortedFoods = mockFoods.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const searchTerm = '豆腐';

        // 精確匹配優先
        if (aName === searchTerm && bName !== searchTerm) return -1;
        if (bName === searchTerm && aName !== searchTerm) return 1;

        // 開頭匹配優先
        const aStartsWith = aName.startsWith(searchTerm);
        const bStartsWith = bName.startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (bStartsWith && !aStartsWith) return 1;

        // 長度越短越優先
        return a.name.length - b.name.length;
      });

      // 精確匹配「豆腐」應該排第一
      expect(sortedFoods[0].name).toBe('豆腐');
      // 其他以「豆腐」開頭的按長度排序
      expect(sortedFoods[1].name).toBe('豆腐皮');
      // 「油豆腐」和「豆腐干絲」都是3-4字，順序可能不同
      const remainingNames = [sortedFoods[2].name, sortedFoods[3].name];
      expect(remainingNames).toContain('油豆腐');
      expect(remainingNames).toContain('豆腐干絲');
    });

    it('應該優先選擇開頭匹配的結果', () => {
      const mockFoods = [
        { name: '麻婆豆腐', nutritionPer100g: { calories: 150 } },
        { name: '豆腐湯', nutritionPer100g: { calories: 50 } },
        { name: '豆腐', nutritionPer100g: { calories: 76 } }
      ];

      const sortedFoods = mockFoods.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const searchTerm = '豆腐';

        if (aName === searchTerm && bName !== searchTerm) return -1;
        if (bName === searchTerm && aName !== searchTerm) return 1;

        const aStartsWith = aName.startsWith(searchTerm);
        const bStartsWith = bName.startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (bStartsWith && !aStartsWith) return 1;

        return a.name.length - b.name.length;
      });

      // 精確匹配「豆腐」應該排第一
      expect(sortedFoods[0].name).toBe('豆腐');
      // 開頭匹配「豆腐湯」應該排第二
      expect(sortedFoods[1].name).toBe('豆腐湯');
      // 包含匹配「麻婆豆腐」應該排最後
      expect(sortedFoods[2].name).toBe('麻婆豆腐');
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理空匹配結果', async () => {
      const mockNutritionRepo = {
        findByName: jest.fn().mockResolvedValue(null),
        findByPartialName: jest.fn().mockResolvedValue([])
      };

      (nutritionCalculator as any).foodRepository = mockNutritionRepo;

      const result = await (nutritionCalculator as any).fuzzyMatchNutrition('不存在的食物');
      expect(result).toBeNull();
    });

    it('應該處理只有一個匹配結果的情況', async () => {
      const mockNutritionRepo = {
        findByName: jest.fn().mockResolvedValue(null),
        findByPartialName: jest.fn().mockResolvedValue([
          { name: '豆腐', nutritionPer100g: { calories: 76 } }
        ])
      };

      (nutritionCalculator as any).foodRepository = mockNutritionRepo;

      const result = await (nutritionCalculator as any).fuzzyMatchNutrition('豆腐');
      expect(result).toBeDefined();
      expect(result.name).toBe('豆腐');
    });

    it('應該移除修飾詞進行匹配', async () => {
      const mockNutritionRepo = {
        findByName: jest.fn().mockResolvedValue(null),
        findByPartialName: jest.fn().mockResolvedValue([
          { name: '豆腐', nutritionPer100g: { calories: 76 } }
        ])
      };

      (nutritionCalculator as any).foodRepository = mockNutritionRepo;

      const result = await (nutritionCalculator as any).fuzzyMatchNutrition('新鮮豆腐');
      expect(result).toBeDefined();
      expect(result.name).toBe('豆腐');
      
      // 驗證 findByPartialName 被調用時使用的是清理後的名稱
      expect(mockNutritionRepo.findByPartialName).toHaveBeenCalledWith('豆腐');
    });
  });
});
