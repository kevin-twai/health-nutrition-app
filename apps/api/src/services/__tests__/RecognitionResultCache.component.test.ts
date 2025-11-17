/**
 * 成分緩存功能測試
 * Component Cache Feature Tests
 */

import { RecognitionResultCache } from '../RecognitionResultCache';
import { DishType, DetectedComponent, NutritionData, CookingMethod, ComponentCategory } from '../../types/ComponentDetection';

describe('RecognitionResultCache - Component Caching', () => {
  let cache: RecognitionResultCache;

  beforeEach(() => {
    cache = RecognitionResultCache.getInstance();
    cache.clear();
  });

  describe('料理-成分映射緩存', () => {
    it('應該能夠緩存和獲取料理的成分列表', () => {
      const dishName = '蛋炒飯';
      const dishType = DishType.FRIED_RICE;
      const components: DetectedComponent[] = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STIR_FRIED
        },
        {
          id: '2',
          name: '雞蛋',
          confidence: 0.90,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.STIR_FRIED
        }
      ];

      // 設置緩存
      cache.setComponentsForDish(dishName, dishType, components);

      // 獲取緩存
      const cachedComponents = cache.getComponentsForDish(dishName, dishType);

      expect(cachedComponents).not.toBeNull();
      expect(cachedComponents).toHaveLength(2);
      expect(cachedComponents![0].name).toBe('白飯');
      expect(cachedComponents![1].name).toBe('雞蛋');
    });

    it('應該在緩存未命中時返回 null', () => {
      const result = cache.getComponentsForDish('不存在的料理', DishType.UNKNOWN);
      expect(result).toBeNull();
    });

    it('應該正確計算成分緩存命中率', () => {
      const dishName = '味噌湯';
      const dishType = DishType.SOUP;
      const components: DetectedComponent[] = [
        {
          id: '1',
          name: '豆腐',
          confidence: 0.90,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN
        }
      ];

      // 設置緩存
      cache.setComponentsForDish(dishName, dishType, components);

      // 命中
      cache.getComponentsForDish(dishName, dishType);
      cache.getComponentsForDish(dishName, dishType);

      // 未命中
      cache.getComponentsForDish('其他料理', DishType.UNKNOWN);

      const hitRate = cache.getComponentCacheHitRate();
      expect(hitRate).toBeCloseTo(0.667, 2); // 2/3
    });
  });

  describe('營養計算緩存', () => {
    it('應該能夠緩存和獲取成分的營養數據', () => {
      const componentName = '雞蛋';
      const portion = 50;
      const cookingMethod = CookingMethod.STIR_FRIED;
      const nutrition: NutritionData = {
        calories: 75,
        protein: 6.5,
        carbohydrates: 0.5,
        fat: 5.0
      };

      // 設置緩存
      cache.setNutritionForComponent(componentName, portion, nutrition, cookingMethod);

      // 獲取緩存
      const cachedNutrition = cache.getNutritionForComponent(componentName, portion, cookingMethod);

      expect(cachedNutrition).not.toBeNull();
      expect(cachedNutrition!.calories).toBe(75);
      expect(cachedNutrition!.protein).toBe(6.5);
    });

    it('應該區分不同烹飪方式的營養數據', () => {
      const componentName = '雞蛋';
      const portion = 50;
      
      const friedNutrition: NutritionData = {
        calories: 90,
        protein: 6.5,
        carbohydrates: 0.5,
        fat: 7.0
      };
      
      const boiledNutrition: NutritionData = {
        calories: 75,
        protein: 6.5,
        carbohydrates: 0.5,
        fat: 5.0
      };

      // 設置不同烹飪方式的緩存
      cache.setNutritionForComponent(componentName, portion, friedNutrition, CookingMethod.DEEP_FRIED);
      cache.setNutritionForComponent(componentName, portion, boiledNutrition, CookingMethod.BOILED);

      // 獲取不同烹飪方式的緩存
      const cachedFried = cache.getNutritionForComponent(componentName, portion, CookingMethod.DEEP_FRIED);
      const cachedBoiled = cache.getNutritionForComponent(componentName, portion, CookingMethod.BOILED);

      expect(cachedFried!.calories).toBe(90);
      expect(cachedBoiled!.calories).toBe(75);
    });

    it('應該正確計算營養緩存命中率', () => {
      const nutrition: NutritionData = {
        calories: 100,
        protein: 5,
        carbohydrates: 10,
        fat: 3
      };

      // 設置緩存
      cache.setNutritionForComponent('白飯', 100, nutrition);

      // 命中
      cache.getNutritionForComponent('白飯', 100);
      cache.getNutritionForComponent('白飯', 100);
      cache.getNutritionForComponent('白飯', 100);

      // 未命中
      cache.getNutritionForComponent('白飯', 200);
      cache.getNutritionForComponent('其他', 100);

      const hitRate = cache.getNutritionCacheHitRate();
      expect(hitRate).toBeCloseTo(0.6, 2); // 3/5
    });
  });

  describe('緩存統計', () => {
    it('應該正確報告所有緩存的統計資訊', () => {
      // 添加識別結果緩存（使用現有方法）
      const imageBuffer = Buffer.from('test-image');
      const mockResult: any = { success: true };
      cache.set(imageBuffer, mockResult);

      // 添加成分緩存
      const components: DetectedComponent[] = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200
        }
      ];
      cache.setComponentsForDish('蛋炒飯', DishType.FRIED_RICE, components);

      // 添加營養緩存
      const nutrition: NutritionData = {
        calories: 100,
        protein: 5,
        carbohydrates: 10,
        fat: 3
      };
      cache.setNutritionForComponent('白飯', 100, nutrition);

      const stats = cache.getStatistics();

      expect(stats.totalEntries).toBe(1); // 識別結果緩存
      expect(stats.componentCacheEntries).toBe(1);
      expect(stats.nutritionCacheEntries).toBe(1);
    });
  });

  describe('緩存清理', () => {
    it('應該清空所有類型的緩存', () => {
      // 添加各種緩存
      const imageBuffer = Buffer.from('test-image');
      const mockResult: any = { success: true };
      cache.set(imageBuffer, mockResult);

      const components: DetectedComponent[] = [
        { id: '1', name: '白飯', confidence: 0.95, estimatedPortion: 200 }
      ];
      cache.setComponentsForDish('蛋炒飯', DishType.FRIED_RICE, components);

      const nutrition: NutritionData = {
        calories: 100,
        protein: 5,
        carbohydrates: 10,
        fat: 3
      };
      cache.setNutritionForComponent('白飯', 100, nutrition);

      // 清空緩存
      cache.clear();

      // 驗證所有緩存都被清空
      expect(cache.size()).toBe(0);
      expect(cache.componentCacheSize()).toBe(0);
      expect(cache.nutritionCacheSize()).toBe(0);
    });
  });
});
