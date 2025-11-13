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
  });
});
