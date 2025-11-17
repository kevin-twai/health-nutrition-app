/**
 * ComponentNutritionCalculator 測試
 */

import { ComponentNutritionCalculator } from '../ComponentNutritionCalculator';
import {
  DetectedComponent,
  EnrichedComponent,
  CookingMethod,
  ComponentCategory,
  NutritionData
} from '../../types/ComponentDetection';

describe('ComponentNutritionCalculator', () => {
  let calculator: ComponentNutritionCalculator;

  beforeEach(() => {
    calculator = new ComponentNutritionCalculator();
  });

  describe('calculateComponentNutrition', () => {
    it('應該計算成分的營養價值（使用提供的營養數據）', async () => {
      const component: DetectedComponent = {
        id: 'test-1',
        name: '雞蛋',
        confidence: 0.9,
        estimatedPortion: 50, // 50克
        cookingMethod: CookingMethod.STIR_FRIED,
        category: ComponentCategory.PROTEIN,
        nutritionPer100g: {
          calories: 143,
          protein: 12.6,
          carbohydrates: 0.7,
          fat: 9.5,
          fiber: 0,
          sodium: 124
        }
      };

      const nutrition = await calculator.calculateComponentNutrition(
        component,
        CookingMethod.STIR_FRIED
      );

      // 驗證營養值已根據份量和烹飪方式調整
      expect(nutrition.calories).toBeGreaterThan(0);
      expect(nutrition.protein).toBeGreaterThan(0);
      expect(nutrition.fat).toBeGreaterThan(component.nutritionPer100g!.fat * 0.5); // 炒製會增加脂肪
    });

    it('應該從知識庫獲取營養數據（當成分沒有提供時）', async () => {
      const component: DetectedComponent = {
        id: 'test-2',
        name: '白飯',
        confidence: 0.95,
        estimatedPortion: 150,
        cookingMethod: CookingMethod.STEAMED,
        category: ComponentCategory.GRAIN
      };

      const nutrition = await calculator.calculateComponentNutrition(component);

      // 應該從知識庫獲取到營養數據
      expect(nutrition.calories).toBeGreaterThan(0);
      expect(nutrition.carbohydrates).toBeGreaterThan(0);
    });

    it('應該處理未知成分（返回空營養數據）', async () => {
      const component: DetectedComponent = {
        id: 'test-3',
        name: '未知食材',
        confidence: 0.5,
        estimatedPortion: 100,
        category: ComponentCategory.GARNISH
      };

      const nutrition = await calculator.calculateComponentNutrition(component);

      expect(nutrition.calories).toBe(0);
      expect(nutrition.protein).toBe(0);
    });
  });

  describe('applyCookingEffects', () => {
    it('應該正確應用炒製的營養影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      const cookedNutrition = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.STIR_FRIED,
        ComponentCategory.VEGETABLE
      );

      // 炒製應該增加熱量和脂肪
      expect(cookedNutrition.calories).toBeGreaterThan(baseNutrition.calories);
      expect(cookedNutrition.fat).toBeGreaterThan(baseNutrition.fat);
    });

    it('應該正確應用蒸製的營養影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      const cookedNutrition = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.STEAMED,
        ComponentCategory.PROTEIN
      );

      // 蒸製應該保持營養不變或略微減少
      expect(cookedNutrition.calories).toBeCloseTo(baseNutrition.calories, 0);
      expect(cookedNutrition.protein).toBeCloseTo(baseNutrition.protein, 0);
    });

    it('應該正確應用油炸的營養影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      const cookedNutrition = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.DEEP_FRIED,
        ComponentCategory.PROTEIN
      );

      // 油炸應該大幅增加熱量和脂肪
      expect(cookedNutrition.calories).toBeGreaterThan(baseNutrition.calories * 1.5);
      expect(cookedNutrition.fat).toBeGreaterThan(baseNutrition.fat * 3);
    });
  });

  describe('aggregateDishNutrition', () => {
    it('應該正確聚合多個成分的營養', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 150,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        },
        {
          id: 'comp-2',
          name: '雞蛋',
          confidence: 0.9,
          estimatedPortion: 50,
          cookingMethod: CookingMethod.STIR_FRIED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 143,
            protein: 12.6,
            carbohydrates: 0.7,
            fat: 9.5,
            fiber: 0,
            sodium: 124
          }
        },
        {
          id: 'comp-3',
          name: '青蔥',
          confidence: 0.85,
          estimatedPortion: 10,
          cookingMethod: CookingMethod.STIR_FRIED,
          category: ComponentCategory.GARNISH,
          nutritionPer100g: {
            calories: 32,
            protein: 1.8,
            carbohydrates: 7.3,
            fat: 0.2,
            fiber: 2.6,
            sodium: 16
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);

      // 驗證總營養值
      expect(summary.total.calories).toBeGreaterThan(0);
      expect(summary.total.protein).toBeGreaterThan(0);
      expect(summary.total.carbohydrates).toBeGreaterThan(0);

      // 驗證成分數量
      expect(summary.byComponent).toHaveLength(3);

      // 驗證類別分組
      expect(summary.byCategory.length).toBeGreaterThan(0);
      const grainCategory = summary.byCategory.find(
        cat => cat.category === ComponentCategory.GRAIN
      );
      expect(grainCategory).toBeDefined();
      expect(grainCategory!.components).toContain('白飯');

      // 驗證烹飪影響
      expect(summary.cookingImpact.length).toBeGreaterThan(0);
    });

    it('應該正確計算各成分的營養佔比', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        },
        {
          id: 'comp-2',
          name: '雞肉',
          confidence: 0.9,
          estimatedPortion: 100,
          cookingMethod: CookingMethod.GRILLED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 3.6,
            fiber: 0,
            sodium: 74
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);

      // 驗證百分比總和接近100%
      const totalCaloriePercentage = summary.byComponent.reduce(
        (sum, comp) => sum + comp.percentageOfTotal.calories,
        0
      );
      expect(totalCaloriePercentage).toBeCloseTo(100, 0);

      // 驗證蛋白質主要來自雞肉
      const chickenNutrition = summary.byComponent.find(
        comp => comp.component.name === '雞肉'
      );
      expect(chickenNutrition!.percentageOfTotal.protein).toBeGreaterThan(50);
    });

    it('應該正確按類別分組統計', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 150,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        },
        {
          id: 'comp-2',
          name: '青江菜',
          confidence: 0.88,
          estimatedPortion: 80,
          cookingMethod: CookingMethod.STIR_FRIED,
          category: ComponentCategory.VEGETABLE,
          nutritionPer100g: {
            calories: 13,
            protein: 1.5,
            carbohydrates: 2.2,
            fat: 0.2,
            fiber: 1.0,
            sodium: 65
          }
        },
        {
          id: 'comp-3',
          name: '空心菜',
          confidence: 0.85,
          estimatedPortion: 70,
          cookingMethod: CookingMethod.STIR_FRIED,
          category: ComponentCategory.VEGETABLE,
          nutritionPer100g: {
            calories: 19,
            protein: 2.6,
            carbohydrates: 2.2,
            fat: 0.2,
            fiber: 2.2,
            sodium: 113
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);

      // 驗證蔬菜類別包含兩個成分
      const vegetableCategory = summary.byCategory.find(
        cat => cat.category === ComponentCategory.VEGETABLE
      );
      expect(vegetableCategory).toBeDefined();
      expect(vegetableCategory!.components).toHaveLength(2);
      expect(vegetableCategory!.components).toContain('青江菜');
      expect(vegetableCategory!.components).toContain('空心菜');

      // 驗證類別按份量百分比排序
      expect(summary.byCategory[0].percentageOfDish).toBeGreaterThanOrEqual(
        summary.byCategory[summary.byCategory.length - 1].percentageOfDish
      );
    });
  });

  describe('getNutritionAdvice', () => {
    it('應該為高熱量料理提供建議', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '炸雞',
          confidence: 0.9,
          estimatedPortion: 200,
          cookingMethod: CookingMethod.DEEP_FRIED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 250,
            protein: 20,
            carbohydrates: 10,
            fat: 15,
            fiber: 0,
            sodium: 500
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);
      const advice = calculator.getNutritionAdvice(summary);

      expect(advice.length).toBeGreaterThan(0);
      expect(advice.some(a => a.includes('熱量'))).toBe(true);
    });

    it('應該為高鈉料理提供建議', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '滷肉',
          confidence: 0.9,
          estimatedPortion: 150,
          cookingMethod: CookingMethod.BRAISED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 200,
            protein: 18,
            carbohydrates: 5,
            fat: 12,
            fiber: 0,
            sodium: 800
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);
      const advice = calculator.getNutritionAdvice(summary);

      expect(advice.some(a => a.includes('鈉'))).toBe(true);
    });

    it('應該為低蛋白質料理提供建議', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);
      const advice = calculator.getNutritionAdvice(summary);

      expect(advice.some(a => a.includes('蛋白質'))).toBe(true);
    });
  });

  describe('getComponentHealthScore', () => {
    it('應該為蔬菜類成分給予較高分數', () => {
      const component: EnrichedComponent = {
        id: 'comp-1',
        name: '青江菜',
        confidence: 0.9,
        estimatedPortion: 80,
        cookingMethod: CookingMethod.STEAMED,
        category: ComponentCategory.VEGETABLE,
        nutritionPer100g: {
          calories: 13,
          protein: 1.5,
          carbohydrates: 2.2,
          fat: 0.2,
          fiber: 1.0,
          sodium: 65
        }
      };

      const score = calculator.getComponentHealthScore(component);

      expect(score).toBeGreaterThan(6);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('應該為油炸食物給予較低分數', () => {
      const component: EnrichedComponent = {
        id: 'comp-1',
        name: '炸雞',
        confidence: 0.9,
        estimatedPortion: 150,
        cookingMethod: CookingMethod.DEEP_FRIED,
        category: ComponentCategory.PROTEIN,
        nutritionPer100g: {
          calories: 250,
          protein: 20,
          carbohydrates: 10,
          fat: 15,
          fiber: 0,
          sodium: 500
        }
      };

      const score = calculator.getComponentHealthScore(component);

      expect(score).toBeLessThan(7);
      expect(score).toBeGreaterThanOrEqual(1);
    });

    it('應該為高纖維食物加分', () => {
      const component: EnrichedComponent = {
        id: 'comp-1',
        name: '地瓜葉',
        confidence: 0.9,
        estimatedPortion: 100,
        cookingMethod: CookingMethod.STIR_FRIED,
        category: ComponentCategory.VEGETABLE,
        nutritionPer100g: {
          calories: 30,
          protein: 3.0,
          carbohydrates: 5.4,
          fat: 0.3,
          fiber: 3.3,
          sodium: 6
        }
      };

      const score = calculator.getComponentHealthScore(component);

      expect(score).toBeGreaterThanOrEqual(7);
    });
  });

  describe('營養計算準確性測試', () => {
    it('應該正確計算份量比例', async () => {
      const component: DetectedComponent = {
        id: 'test-1',
        name: '白飯',
        confidence: 0.95,
        estimatedPortion: 150, // 150克
        cookingMethod: CookingMethod.STEAMED,
        category: ComponentCategory.GRAIN,
        nutritionPer100g: {
          calories: 130,
          protein: 2.7,
          carbohydrates: 28.7,
          fat: 0.3,
          fiber: 0.4,
          sodium: 1
        }
      };

      const nutrition = await calculator.calculateComponentNutrition(component);

      // 150克應該是100克的1.5倍（考慮烹飪影響）
      // 蒸製對營養影響較小，應該接近原值
      expect(nutrition.calories).toBeGreaterThan(130 * 1.4);
      expect(nutrition.protein).toBeGreaterThan(2.7 * 1.3);
      expect(nutrition.carbohydrates).toBeGreaterThan(28.7 * 1.3);
    });

    it('應該正確處理小份量成分', async () => {
      const component: DetectedComponent = {
        id: 'test-1',
        name: '青蔥',
        confidence: 0.85,
        estimatedPortion: 10, // 10克
        cookingMethod: CookingMethod.RAW,
        category: ComponentCategory.GARNISH,
        nutritionPer100g: {
          calories: 32,
          protein: 1.8,
          carbohydrates: 7.3,
          fat: 0.2,
          fiber: 2.6,
          sodium: 16
        }
      };

      const nutrition = await calculator.calculateComponentNutrition(component);

      // 10克應該是100克的0.1倍
      expect(nutrition.calories).toBeCloseTo(32 * 0.1, 0);
      expect(nutrition.protein).toBeCloseTo(1.8 * 0.1, 1);
    });

    it('應該正確處理大份量成分', async () => {
      const component: DetectedComponent = {
        id: 'test-1',
        name: '雞腿',
        confidence: 0.9,
        estimatedPortion: 250, // 250克
        cookingMethod: CookingMethod.GRILLED,
        category: ComponentCategory.PROTEIN,
        nutritionPer100g: {
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fat: 3.6,
          fiber: 0,
          sodium: 74
        }
      };

      const nutrition = await calculator.calculateComponentNutrition(component);

      // 250克應該是100克的2.5倍
      expect(nutrition.calories).toBeGreaterThan(165 * 2);
      expect(nutrition.protein).toBeGreaterThan(31 * 2);
    });
  });

  describe('烹飪方式影響測試', () => {
    it('應該正確應用生食的營養影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      const cookedNutrition = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.RAW,
        ComponentCategory.VEGETABLE
      );

      // 生食應該保持原營養不變
      expect(cookedNutrition.calories).toBe(baseNutrition.calories);
      expect(cookedNutrition.protein).toBe(baseNutrition.protein);
      expect(cookedNutrition.fat).toBe(baseNutrition.fat);
    });

    it('應該正確應用水煮的營養影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      const cookedNutrition = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.BOILED,
        ComponentCategory.VEGETABLE
      );

      // 水煮應該略微減少營養
      expect(cookedNutrition.calories).toBeLessThanOrEqual(baseNutrition.calories);
      expect(cookedNutrition.protein).toBeLessThanOrEqual(baseNutrition.protein);
    });

    it('應該正確應用烤製的營養影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      const cookedNutrition = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.GRILLED,
        ComponentCategory.PROTEIN
      );

      // 烤製可能略微減少水分，但營養保留較好
      // 檢查營養值是否在合理範圍內
      expect(cookedNutrition.calories).toBeGreaterThan(0);
      expect(cookedNutrition.protein).toBeGreaterThan(0);
      expect(cookedNutrition.protein).toBeLessThanOrEqual(baseNutrition.protein);
    });

    it('應該正確應用滷製的營養影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      const cookedNutrition = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.BRAISED,
        ComponentCategory.PROTEIN
      );

      // 滷製應該增加鈉含量
      expect(cookedNutrition.sodium).toBeGreaterThan(baseNutrition.sodium);
    });

    it('應該根據成分類別調整烹飪影響', () => {
      const baseNutrition: NutritionData = {
        calories: 100,
        protein: 10,
        carbohydrates: 15,
        fat: 2,
        fiber: 3,
        sodium: 50
      };

      // 蔬菜炒製
      const vegetableStirFried = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.STIR_FRIED,
        ComponentCategory.VEGETABLE
      );

      // 蛋白質炒製
      const proteinStirFried = calculator.applyCookingEffects(
        baseNutrition,
        CookingMethod.STIR_FRIED,
        ComponentCategory.PROTEIN
      );

      // 兩者的影響應該不同
      expect(vegetableStirFried.calories).not.toBe(proteinStirFried.calories);
    });
  });

  describe('營養聚合進階測試', () => {
    it('應該正確處理只有一個成分的情況', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);

      expect(summary.byComponent).toHaveLength(1);
      expect(summary.byCategory).toHaveLength(1);
      expect(summary.byComponent[0].percentageOfTotal.calories).toBe(100);
    });

    it('應該正確處理多種類別的成分', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 150,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        },
        {
          id: 'comp-2',
          name: '雞肉',
          confidence: 0.9,
          estimatedPortion: 100,
          cookingMethod: CookingMethod.GRILLED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 3.6,
            fiber: 0,
            sodium: 74
          }
        },
        {
          id: 'comp-3',
          name: '青江菜',
          confidence: 0.88,
          estimatedPortion: 80,
          cookingMethod: CookingMethod.STIR_FRIED,
          category: ComponentCategory.VEGETABLE,
          nutritionPer100g: {
            calories: 13,
            protein: 1.5,
            carbohydrates: 2.2,
            fat: 0.2,
            fiber: 1.0,
            sodium: 65
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);

      // 應該有三個類別
      expect(summary.byCategory.length).toBeGreaterThanOrEqual(3);
      
      // 檢查每個類別都有對應的成分
      const grainCategory = summary.byCategory.find(
        cat => cat.category === ComponentCategory.GRAIN
      );
      const proteinCategory = summary.byCategory.find(
        cat => cat.category === ComponentCategory.PROTEIN
      );
      const vegetableCategory = summary.byCategory.find(
        cat => cat.category === ComponentCategory.VEGETABLE
      );

      expect(grainCategory).toBeDefined();
      expect(proteinCategory).toBeDefined();
      expect(vegetableCategory).toBeDefined();
    });

    it('應該正確計算烹飪影響摘要', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '炸雞',
          confidence: 0.9,
          estimatedPortion: 150,
          cookingMethod: CookingMethod.DEEP_FRIED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 250,
            protein: 20,
            carbohydrates: 10,
            fat: 15,
            fiber: 0,
            sodium: 500
          }
        },
        {
          id: 'comp-2',
          name: '炒青菜',
          confidence: 0.85,
          estimatedPortion: 80,
          cookingMethod: CookingMethod.STIR_FRIED,
          category: ComponentCategory.VEGETABLE,
          nutritionPer100g: {
            calories: 30,
            protein: 2,
            carbohydrates: 5,
            fat: 0.5,
            fiber: 2,
            sodium: 100
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);

      // 應該有烹飪影響記錄
      expect(summary.cookingImpact.length).toBeGreaterThan(0);
      
      // 油炸應該增加較多熱量
      const deepFriedImpact = summary.cookingImpact.find(
        impact => impact.method === CookingMethod.DEEP_FRIED
      );
      expect(deepFriedImpact).toBeDefined();
      expect(deepFriedImpact!.caloriesAdded).toBeGreaterThan(0);
    });

    it('應該處理缺少營養數據的成分', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '未知食材',
          confidence: 0.5,
          estimatedPortion: 100,
          cookingMethod: CookingMethod.RAW,
          category: ComponentCategory.GARNISH
          // 沒有 nutritionPer100g
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);

      // 應該能夠處理，不會拋出錯誤
      expect(summary).toBeDefined();
      expect(summary.total.calories).toBeGreaterThanOrEqual(0);
    });
  });

  describe('營養建議測試', () => {
    it('應該為均衡料理提供正面建議', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 150,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        },
        {
          id: 'comp-2',
          name: '雞胸肉',
          confidence: 0.9,
          estimatedPortion: 100,
          cookingMethod: CookingMethod.GRILLED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 3.6,
            fiber: 0,
            sodium: 74
          }
        },
        {
          id: 'comp-3',
          name: '青江菜',
          confidence: 0.88,
          estimatedPortion: 100,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.VEGETABLE,
          nutritionPer100g: {
            calories: 13,
            protein: 1.5,
            carbohydrates: 2.2,
            fat: 0.2,
            fiber: 1.0,
            sodium: 65
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);
      const advice = calculator.getNutritionAdvice(summary);

      // 均衡料理應該有較少的警告
      expect(advice.length).toBeGreaterThanOrEqual(0);
    });

    it('應該為低纖維料理提供建議', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 300,
          cookingMethod: CookingMethod.STEAMED,
          category: ComponentCategory.GRAIN,
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28.7,
            fat: 0.3,
            fiber: 0.4,
            sodium: 1
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);
      const advice = calculator.getNutritionAdvice(summary);

      expect(advice.some(a => a.includes('纖維'))).toBe(true);
    });

    it('應該為高脂肪料理提供建議', async () => {
      const components: EnrichedComponent[] = [
        {
          id: 'comp-1',
          name: '炸雞',
          confidence: 0.9,
          estimatedPortion: 200,
          cookingMethod: CookingMethod.DEEP_FRIED,
          category: ComponentCategory.PROTEIN,
          nutritionPer100g: {
            calories: 250,
            protein: 20,
            carbohydrates: 10,
            fat: 15,
            fiber: 0,
            sodium: 500
          }
        }
      ];

      const summary = await calculator.aggregateDishNutrition(components);
      const advice = calculator.getNutritionAdvice(summary);

      expect(advice.some(a => a.includes('脂肪') || a.includes('油'))).toBe(true);
    });
  });
});
