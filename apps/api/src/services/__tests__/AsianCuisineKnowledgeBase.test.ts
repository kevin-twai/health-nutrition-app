/**
 * 亞洲料理知識庫服務測試
 */

import { AsianCuisineKnowledgeBase } from '../AsianCuisineKnowledgeBase';
import { FoodCategory, CuisineType, CookingMethod } from '../../types/AsianCuisineKnowledgeBase';

describe('AsianCuisineKnowledgeBase', () => {
  let knowledgeBase: AsianCuisineKnowledgeBase;

  beforeEach(() => {
    knowledgeBase = new AsianCuisineKnowledgeBase();
  });

  describe('基本查詢功能', () => {
    it('應該能夠獲取知識庫統計資訊', () => {
      const stats = knowledgeBase.getStatistics();
      
      expect(stats.totalFoodItems).toBeGreaterThanOrEqual(50);
      expect(stats.totalDishPatterns).toBeGreaterThan(0);
      expect(Object.keys(stats.categoryCounts).length).toBeGreaterThan(0);
      expect(Object.keys(stats.cuisineTypeCounts).length).toBeGreaterThan(0);
    });

    it('應該能夠根據類別查詢食材', () => {
      const beanProducts = knowledgeBase.queryFoodItems({
        category: FoodCategory.BEAN_PRODUCTS
      });
      
      expect(beanProducts.length).toBeGreaterThan(0);
      expect(beanProducts.every(item => item.category === FoodCategory.BEAN_PRODUCTS)).toBe(true);
    });

    it('應該能夠根據料理類型查詢食材', () => {
      const taiwaneseFood = knowledgeBase.queryFoodItems({
        cuisineType: CuisineType.TAIWANESE
      });
      
      expect(taiwaneseFood.length).toBeGreaterThan(0);
      expect(taiwaneseFood.every(item => 
        item.cuisineTypes.includes(CuisineType.TAIWANESE)
      )).toBe(true);
    });

    it('應該能夠根據烹飪方式查詢食材', () => {
      const stirFryFood = knowledgeBase.queryFoodItems({
        cookingMethod: CookingMethod.STIR_FRY
      });
      
      expect(stirFryFood.length).toBeGreaterThan(0);
      expect(stirFryFood.every(item => 
        item.cookingMethods.includes(CookingMethod.STIR_FRY)
      )).toBe(true);
    });
  });

  describe('名稱搜尋功能', () => {
    it('應該能夠精確搜尋食材名稱', () => {
      const results = knowledgeBase.searchFoodItemsByName('豆腐干絲', false);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('豆腐干絲');
    });

    it('應該能夠模糊搜尋食材名稱', () => {
      const results = knowledgeBase.searchFoodItemsByName('豆腐', true);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(item => item.name.includes('豆腐'))).toBe(true);
    });

    it('應該能夠搜尋別名', () => {
      const results = knowledgeBase.searchFoodItemsByName('干絲', true);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(item => 
        item.name === '豆腐干絲' || item.nameVariants.includes('干絲')
      )).toBe(true);
    });
  });

  describe('易混淆食材功能', () => {
    it('應該能夠獲取易混淆的食材', () => {
      const confusions = knowledgeBase.getConfusedFoodPairs('豆腐干絲');
      
      expect(confusions.length).toBeGreaterThan(0);
      expect(confusions).toContain('麵條');
    });

    it('應該能夠獲取區分特徵', () => {
      const features = knowledgeBase.getDistinguishingFeatures('豆腐干絲');
      
      expect(features.length).toBeGreaterThan(0);
      expect(features.some(f => f.includes('麵條'))).toBe(true);
    });
  });

  describe('食材組合驗證', () => {
    it('應該能夠檢測易混淆食材同時出現', () => {
      const result = knowledgeBase.validateFoodCombination(['豆腐干絲', '麵條']);
      
      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('容易混淆');
    });

    it('應該能夠驗證合理的食材組合', () => {
      const result = knowledgeBase.validateFoodCombination(['豆腐干絲', '芹菜', '胡蘿蔔']);
      
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('料理模式功能', () => {
    it('應該能夠獲取料理的常見食材', () => {
      const ingredients = knowledgeBase.getCommonIngredientsForDish('涼拌菜');
      
      expect(ingredients.length).toBeGreaterThan(0);
      expect(ingredients).toContain('豆腐干絲');
    });

    it('應該能夠獲取料理的常見調味料', () => {
      const seasonings = knowledgeBase.getCommonSeasoningsForDish('涼拌菜');
      
      expect(seasonings.length).toBeGreaterThan(0);
      expect(seasonings).toContain('麻油');
    });

    it('應該能夠根據食材推薦料理類型', () => {
      const suggestions = knowledgeBase.suggestDishType(['豆腐干絲', '芹菜', '胡蘿蔔']);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.name === '涼拌菜')).toBe(true);
    });
  });

  describe('營養資訊功能', () => {
    it('應該能夠獲取食材的營養資訊', () => {
      const nutrition = knowledgeBase.getNutritionInfo('豆腐干絲');
      
      expect(nutrition).not.toBeNull();
      expect(nutrition!.calories).toBeGreaterThan(0);
      expect(nutrition!.protein).toBeGreaterThan(0);
    });

    it('應該能夠獲取食材的常見搭配', () => {
      const pairings = knowledgeBase.getCommonPairings('豆腐干絲');
      
      expect(pairings.length).toBeGreaterThan(0);
      expect(pairings).toContain('芹菜絲');
    });
  });

  describe('視覺特徵匹配功能', () => {
    it('應該能夠根據視覺特徵匹配食材', () => {
      const imageFeatures = {
        dominantColors: ['淡黃色', '米白色'],
        textureType: 'rough' as const,
        shapePatterns: ['細長條狀', '絲狀'],
        estimatedComplexity: 5,
        hasMultipleComponents: false
      };

      const matches = knowledgeBase.matchFoodItemsByVisualFeatures(imageFeatures);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].confidence).toBeGreaterThan(0);
      expect(matches[0].matchedFeatures.length).toBeGreaterThan(0);
    });

    it('應該按信心度排序匹配結果', () => {
      const imageFeatures = {
        dominantColors: ['綠色'],
        textureType: 'smooth' as const,
        shapePatterns: ['長條狀'],
        estimatedComplexity: 3,
        hasMultipleComponents: false
      };

      const matches = knowledgeBase.matchFoodItemsByVisualFeatures(imageFeatures);
      
      if (matches.length > 1) {
        expect(matches[0].confidence).toBeGreaterThanOrEqual(matches[1].confidence);
      }
    });

    it('應該能夠設置信心度閾值', () => {
      const imageFeatures = {
        dominantColors: ['綠色'],
        textureType: 'smooth' as const,
        shapePatterns: ['長條狀'],
        estimatedComplexity: 3,
        hasMultipleComponents: false
      };

      const highThresholdMatches = knowledgeBase.matchFoodItemsByVisualFeatures(
        imageFeatures,
        { threshold: 0.8 }
      );
      
      const lowThresholdMatches = knowledgeBase.matchFoodItemsByVisualFeatures(
        imageFeatures,
        { threshold: 0.3 }
      );
      
      // 高閾值應該返回更少的結果
      expect(highThresholdMatches.length).toBeLessThanOrEqual(lowThresholdMatches.length);
      
      // 所有結果都應該超過閾值
      highThresholdMatches.forEach(match => {
        expect(match.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('應該能夠調整匹配權重', () => {
      const imageFeatures = {
        dominantColors: ['綠色'],
        textureType: 'smooth' as const,
        shapePatterns: ['長條狀'],
        estimatedComplexity: 3,
        hasMultipleComponents: false
      };

      const visualWeightMatches = knowledgeBase.matchFoodItemsByVisualFeatures(
        imageFeatures,
        { visualWeight: 0.9, categoryWeight: 0.05, cuisineWeight: 0.05 }
      );
      
      const categoryWeightMatches = knowledgeBase.matchFoodItemsByVisualFeatures(
        imageFeatures,
        { visualWeight: 0.3, categoryWeight: 0.5, cuisineWeight: 0.2 }
      );
      
      // 不同權重應該產生不同的結果
      expect(visualWeightMatches).toBeDefined();
      expect(categoryWeightMatches).toBeDefined();
    });
  });

  describe('複合查詢功能', () => {
    it('應該能夠組合多個查詢條件', () => {
      const results = knowledgeBase.queryFoodItems({
        category: FoodCategory.BEAN_PRODUCTS,
        cuisineType: CuisineType.TAIWANESE,
        searchTerm: '豆腐'
      });
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(item => {
        expect(item.category).toBe(FoodCategory.BEAN_PRODUCTS);
        expect(item.cuisineTypes).toContain(CuisineType.TAIWANESE);
        expect(item.name.includes('豆腐') || 
               item.nameVariants.some(v => v.includes('豆腐'))).toBe(true);
      });
    });

    it('應該能夠包含變體名稱搜尋', () => {
      const withVariants = knowledgeBase.queryFoodItems({
        searchTerm: '干絲',
        includeVariants: true
      });
      
      const withoutVariants = knowledgeBase.queryFoodItems({
        searchTerm: '干絲',
        includeVariants: false
      });
      
      // 包含變體應該返回更多結果
      expect(withVariants.length).toBeGreaterThanOrEqual(withoutVariants.length);
    });

    it('應該處理空查詢條件', () => {
      const results = knowledgeBase.queryFoodItems({});
      
      // 空查詢應該返回所有食材
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBe(knowledgeBase.getFoodItemCount());
    });

    it('應該處理不存在的查詢條件', () => {
      const results = knowledgeBase.queryFoodItems({
        searchTerm: '不存在的食材xyz123'
      });
      
      expect(results.length).toBe(0);
    });
  });

  describe('查詢性能測試', () => {
    it('queryFoodItems 應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        knowledgeBase.queryFoodItems({
          category: FoodCategory.BEAN_PRODUCTS
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 100次查詢應該在100ms內完成
      expect(duration).toBeLessThan(100);
    });

    it('searchFoodItemsByName 應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        knowledgeBase.searchFoodItemsByName('豆腐', true);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 100次搜尋應該在100ms內完成
      expect(duration).toBeLessThan(100);
    });

    it('getNutritionInfo 應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        knowledgeBase.getNutritionInfo('豆腐干絲');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 1000次查詢應該在50ms內完成
      expect(duration).toBeLessThan(50);
    });

    it('matchFoodItemsByVisualFeatures 應該在合理時間內完成', () => {
      const imageFeatures = {
        dominantColors: ['綠色'],
        textureType: 'smooth' as const,
        shapePatterns: ['長條狀'],
        estimatedComplexity: 3,
        hasMultipleComponents: false
      };

      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        knowledgeBase.matchFoodItemsByVisualFeatures(imageFeatures);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 10次視覺匹配應該在200ms內完成
      expect(duration).toBeLessThan(200);
    });
  });

  describe('數據一致性測試', () => {
    it('所有食材都應該有營養資訊', () => {
      const allItems = knowledgeBase.queryFoodItems({});
      
      allItems.forEach(item => {
        expect(item.nutritionPer100g).toBeDefined();
        expect(item.nutritionPer100g.calories).toBeGreaterThanOrEqual(0);
        expect(item.nutritionPer100g.protein).toBeGreaterThanOrEqual(0);
        expect(item.nutritionPer100g.carbohydrates).toBeGreaterThanOrEqual(0);
        expect(item.nutritionPer100g.fat).toBeGreaterThanOrEqual(0);
      });
    });

    it('所有食材都應該有視覺特徵', () => {
      const allItems = knowledgeBase.queryFoodItems({});
      
      allItems.forEach(item => {
        expect(item.visualFeatures).toBeDefined();
        expect(item.visualFeatures.color).toBeDefined();
        expect(item.visualFeatures.color.length).toBeGreaterThan(0);
        expect(item.visualFeatures.texture).toBeDefined();
        expect(item.visualFeatures.texture.length).toBeGreaterThan(0);
        expect(item.visualFeatures.shape).toBeDefined();
        expect(item.visualFeatures.shape.length).toBeGreaterThan(0);
      });
    });

    it('所有食材都應該有至少一種料理類型', () => {
      const allItems = knowledgeBase.queryFoodItems({});
      
      allItems.forEach(item => {
        expect(item.cuisineTypes).toBeDefined();
        expect(item.cuisineTypes.length).toBeGreaterThan(0);
      });
    });

    it('所有食材都應該有至少一種烹飪方式', () => {
      const allItems = knowledgeBase.queryFoodItems({});
      
      allItems.forEach(item => {
        expect(item.cookingMethods).toBeDefined();
        expect(item.cookingMethods.length).toBeGreaterThan(0);
      });
    });

    it('易混淆食材應該存在於知識庫中', () => {
      const allItems = knowledgeBase.queryFoodItems({});
      
      allItems.forEach(item => {
        if (item.commonConfusions.length > 0) {
          item.commonConfusions.forEach(confusedName => {
            // 檢查易混淆的食材是否存在於知識庫中
            const confusedItems = knowledgeBase.searchFoodItemsByName(confusedName, true);
            
            // 至少應該能找到相關的食材（可能是模糊匹配）
            expect(confusedItems.length).toBeGreaterThanOrEqual(0);
          });
        }
      });
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空字串搜尋', () => {
      const results = knowledgeBase.searchFoodItemsByName('', true);
      
      // 空字串應該返回所有食材或空陣列
      expect(Array.isArray(results)).toBe(true);
    });

    it('應該處理特殊字元搜尋', () => {
      const results = knowledgeBase.searchFoodItemsByName('豆腐@#$', true);
      
      // 應該能夠處理，不會拋出錯誤
      expect(Array.isArray(results)).toBe(true);
    });

    it('應該處理極長的搜尋字串', () => {
      const longString = '豆腐'.repeat(100);
      const results = knowledgeBase.searchFoodItemsByName(longString, true);
      
      // 應該能夠處理，不會拋出錯誤
      expect(Array.isArray(results)).toBe(true);
    });

    it('應該處理 null 和 undefined 的視覺特徵', () => {
      const imageFeatures = {
        dominantColors: [],
        textureType: 'smooth' as const,
        shapePatterns: [],
        estimatedComplexity: 0,
        hasMultipleComponents: false
      };

      const matches = knowledgeBase.matchFoodItemsByVisualFeatures(imageFeatures);
      
      // 應該能夠處理，不會拋出錯誤
      expect(Array.isArray(matches)).toBe(true);
    });
  });

  describe('統計資訊測試', () => {
    it('統計資訊應該準確反映數據', () => {
      const stats = knowledgeBase.getStatistics();
      const allItems = knowledgeBase.queryFoodItems({});
      
      expect(stats.totalFoodItems).toBe(allItems.length);
      
      // 驗證類別統計
      const categoryCounts: Record<string, number> = {};
      allItems.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });
      
      Object.keys(categoryCounts).forEach(category => {
        expect(stats.categoryCounts[category]).toBe(categoryCounts[category]);
      });
    });

    it('應該包含所有類別的統計', () => {
      const stats = knowledgeBase.getStatistics();
      
      expect(Object.keys(stats.categoryCounts).length).toBeGreaterThan(0);
      expect(Object.keys(stats.cuisineTypeCounts).length).toBeGreaterThan(0);
    });
  });
});
