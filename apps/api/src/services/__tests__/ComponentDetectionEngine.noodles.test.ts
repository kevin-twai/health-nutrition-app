/**
 * 麵食類成分識別測試
 * Noodle Dish Component Detection Tests
 */

import { ComponentDetectionEngine } from '../ComponentDetectionEngine';
import { DishType, ComponentCategory } from '../../types/ComponentDetection';
import { findDishComponentMap } from '../../data/dishComponentMaps';

describe('ComponentDetectionEngine - 麵食類', () => {
  let engine: ComponentDetectionEngine;

  beforeEach(() => {
    engine = new ComponentDetectionEngine('zh-TW');
  });

  describe('知識庫驗證', () => {
    test('應該有拉麵的成分映射', () => {
      const ramenMap = findDishComponentMap('拉麵');
      
      expect(ramenMap).toBeDefined();
      expect(ramenMap?.dishName).toBe('拉麵');
      expect(ramenMap?.dishType).toBe(DishType.NOODLES);
      expect(ramenMap?.region).toContain('japan');
      
      // 驗證常見成分
      const components = ramenMap?.commonComponents || [];
      expect(components.length).toBeGreaterThan(0);
      
      // 應該包含麵條
      const noodles = components.find(c => c.name === '拉麵');
      expect(noodles).toBeDefined();
      expect(noodles?.category).toBe(ComponentCategory.GRAIN);
      expect(noodles?.typicalPortion).toBeGreaterThan(0);
      
      // 應該包含叉燒
      const chashu = components.find(c => c.name === '叉燒');
      expect(chashu).toBeDefined();
      expect(chashu?.category).toBe(ComponentCategory.PROTEIN);
      
      // 應該包含湯底
      const broth = components.find(c => c.name === '豚骨湯');
      expect(broth).toBeDefined();
      expect(broth?.category).toBe(ComponentCategory.SAUCE);
    });

    test('應該有烏龍麵的成分映射', () => {
      const udonMap = findDishComponentMap('烏龍麵');
      
      expect(udonMap).toBeDefined();
      expect(udonMap?.dishName).toBe('烏龍麵');
      expect(udonMap?.dishType).toBe(DishType.NOODLES);
      expect(udonMap?.region).toContain('japan');
      
      const components = udonMap?.commonComponents || [];
      
      // 應該包含烏龍麵
      const noodles = components.find(c => c.name === '烏龍麵');
      expect(noodles).toBeDefined();
      expect(noodles?.category).toBe(ComponentCategory.GRAIN);
      
      // 應該包含天婦羅
      const tempura = components.find(c => c.name === '天婦羅');
      expect(tempura).toBeDefined();
      expect(tempura?.category).toBe(ComponentCategory.PROTEIN);
      
      // 應該包含柴魚高湯
      const dashi = components.find(c => c.name === '柴魚高湯');
      expect(dashi).toBeDefined();
      expect(dashi?.category).toBe(ComponentCategory.SAUCE);
    });

    test('應該有米粉的成分映射', () => {
      const riceNoodlesMap = findDishComponentMap('米粉');
      
      expect(riceNoodlesMap).toBeDefined();
      expect(riceNoodlesMap?.dishName).toBe('米粉');
      expect(riceNoodlesMap?.dishType).toBe(DishType.NOODLES);
      expect(riceNoodlesMap?.region).toContain('taiwan');
      
      const components = riceNoodlesMap?.commonComponents || [];
      
      // 應該包含米粉
      const noodles = components.find(c => c.name === '米粉');
      expect(noodles).toBeDefined();
      expect(noodles?.category).toBe(ComponentCategory.GRAIN);
      
      // 應該包含豬肉絲
      const pork = components.find(c => c.name === '豬肉絲');
      expect(pork).toBeDefined();
      expect(pork?.category).toBe(ComponentCategory.PROTEIN);
      
      // 應該包含清湯
      const broth = components.find(c => c.name === '清湯');
      expect(broth).toBeDefined();
      expect(broth?.category).toBe(ComponentCategory.SAUCE);
    });

    test('應該有河粉的成分映射', () => {
      const riceSheetMap = findDishComponentMap('河粉');
      
      expect(riceSheetMap).toBeDefined();
      expect(riceSheetMap?.dishName).toBe('河粉');
      expect(riceSheetMap?.dishType).toBe(DishType.NOODLES);
      expect(riceSheetMap?.region).toContain('china');
      
      const components = riceSheetMap?.commonComponents || [];
      
      // 應該包含河粉
      const noodles = components.find(c => c.name === '河粉');
      expect(noodles).toBeDefined();
      expect(noodles?.category).toBe(ComponentCategory.GRAIN);
      
      // 應該包含牛肉片
      const beef = components.find(c => c.name === '牛肉片');
      expect(beef).toBeDefined();
      expect(beef?.category).toBe(ComponentCategory.PROTEIN);
      
      // 應該包含牛骨湯
      const broth = components.find(c => c.name === '牛骨湯');
      expect(broth).toBeDefined();
      expect(broth?.category).toBe(ComponentCategory.SAUCE);
    });
  });

  describe('成分類別驗證', () => {
    test('拉麵應該包含所有必要的成分類別', () => {
      const ramenMap = findDishComponentMap('拉麵');
      const components = ramenMap?.commonComponents || [];
      
      const categories = new Set(components.map(c => c.category));
      
      expect(categories.has(ComponentCategory.GRAIN)).toBe(true); // 麵條
      expect(categories.has(ComponentCategory.PROTEIN)).toBe(true); // 叉燒、蛋
      expect(categories.has(ComponentCategory.GARNISH)).toBe(true); // 青蔥、海苔
      expect(categories.has(ComponentCategory.SAUCE)).toBe(true); // 湯底
    });

    test('烏龍麵應該包含所有必要的成分類別', () => {
      const udonMap = findDishComponentMap('烏龍麵');
      const components = udonMap?.commonComponents || [];
      
      const categories = new Set(components.map(c => c.category));
      
      expect(categories.has(ComponentCategory.GRAIN)).toBe(true);
      expect(categories.has(ComponentCategory.PROTEIN)).toBe(true);
      expect(categories.has(ComponentCategory.GARNISH)).toBe(true);
      expect(categories.has(ComponentCategory.SAUCE)).toBe(true);
    });

    test('米粉應該包含所有必要的成分類別', () => {
      const riceNoodlesMap = findDishComponentMap('米粉');
      const components = riceNoodlesMap?.commonComponents || [];
      
      const categories = new Set(components.map(c => c.category));
      
      expect(categories.has(ComponentCategory.GRAIN)).toBe(true);
      expect(categories.has(ComponentCategory.PROTEIN)).toBe(true);
      expect(categories.has(ComponentCategory.VEGETABLE)).toBe(true);
      expect(categories.has(ComponentCategory.SAUCE)).toBe(true);
    });

    test('河粉應該包含所有必要的成分類別', () => {
      const riceSheetMap = findDishComponentMap('河粉');
      const components = riceSheetMap?.commonComponents || [];
      
      const categories = new Set(components.map(c => c.category));
      
      expect(categories.has(ComponentCategory.GRAIN)).toBe(true);
      expect(categories.has(ComponentCategory.PROTEIN)).toBe(true);
      expect(categories.has(ComponentCategory.VEGETABLE)).toBe(true);
      expect(categories.has(ComponentCategory.GARNISH)).toBe(true);
      expect(categories.has(ComponentCategory.SAUCE)).toBe(true);
    });
  });

  describe('份量範圍驗證', () => {
    test('拉麵的份量範圍應該合理', () => {
      const ramenMap = findDishComponentMap('拉麵');
      
      expect(ramenMap?.typicalPortionRange.min).toBeGreaterThan(0);
      expect(ramenMap?.typicalPortionRange.max).toBeGreaterThan(ramenMap?.typicalPortionRange.min);
      expect(ramenMap?.typicalPortionRange.typical).toBeGreaterThanOrEqual(ramenMap?.typicalPortionRange.min);
      expect(ramenMap?.typicalPortionRange.typical).toBeLessThanOrEqual(ramenMap?.typicalPortionRange.max);
      
      // 拉麵總份量應該在 500-700g 之間
      expect(ramenMap?.typicalPortionRange.typical).toBeGreaterThanOrEqual(500);
      expect(ramenMap?.typicalPortionRange.typical).toBeLessThanOrEqual(700);
    });

    test('烏龍麵的份量範圍應該合理', () => {
      const udonMap = findDishComponentMap('烏龍麵');
      
      expect(udonMap?.typicalPortionRange.min).toBeGreaterThan(0);
      expect(udonMap?.typicalPortionRange.max).toBeGreaterThan(udonMap?.typicalPortionRange.min);
      
      // 烏龍麵總份量應該在 450-650g 之間
      expect(udonMap?.typicalPortionRange.typical).toBeGreaterThanOrEqual(450);
      expect(udonMap?.typicalPortionRange.typical).toBeLessThanOrEqual(650);
    });

    test('米粉的份量範圍應該合理', () => {
      const riceNoodlesMap = findDishComponentMap('米粉');
      
      expect(riceNoodlesMap?.typicalPortionRange.min).toBeGreaterThan(0);
      expect(riceNoodlesMap?.typicalPortionRange.max).toBeGreaterThan(riceNoodlesMap?.typicalPortionRange.min);
      
      // 米粉總份量應該在 350-500g 之間
      expect(riceNoodlesMap?.typicalPortionRange.typical).toBeGreaterThanOrEqual(350);
      expect(riceNoodlesMap?.typicalPortionRange.typical).toBeLessThanOrEqual(500);
    });

    test('河粉的份量範圍應該合理', () => {
      const riceSheetMap = findDishComponentMap('河粉');
      
      expect(riceSheetMap?.typicalPortionRange.min).toBeGreaterThan(0);
      expect(riceSheetMap?.typicalPortionRange.max).toBeGreaterThan(riceSheetMap?.typicalPortionRange.min);
      
      // 河粉總份量應該在 500-700g 之間
      expect(riceSheetMap?.typicalPortionRange.typical).toBeGreaterThanOrEqual(500);
      expect(riceSheetMap?.typicalPortionRange.typical).toBeLessThanOrEqual(700);
    });
  });

  describe('烹飪方式驗證', () => {
    test('拉麵的成分應該有正確的烹飪方式', () => {
      const ramenMap = findDishComponentMap('拉麵');
      const components = ramenMap?.commonComponents || [];
      
      // 麵條應該是水煮
      const noodles = components.find(c => c.name === '拉麵');
      expect(noodles?.cookingMethods).toContain('boiled');
      
      // 叉燒應該是滷製
      const chashu = components.find(c => c.name === '叉燒');
      expect(chashu?.cookingMethods).toContain('braised');
      
      // 蛋應該是水煮
      const egg = components.find(c => c.name === '溏心蛋');
      expect(egg?.cookingMethods).toContain('boiled');
    });

    test('烏龍麵的成分應該有正確的烹飪方式', () => {
      const udonMap = findDishComponentMap('烏龍麵');
      const components = udonMap?.commonComponents || [];
      
      // 麵條應該是水煮
      const noodles = components.find(c => c.name === '烏龍麵');
      expect(noodles?.cookingMethods).toContain('boiled');
      
      // 天婦羅應該是油炸
      const tempura = components.find(c => c.name === '天婦羅');
      expect(tempura?.cookingMethods).toContain('deep_fried');
    });

    test('米粉的成分應該有正確的烹飪方式', () => {
      const riceNoodlesMap = findDishComponentMap('米粉');
      const components = riceNoodlesMap?.commonComponents || [];
      
      // 麵條應該是水煮
      const noodles = components.find(c => c.name === '米粉');
      expect(noodles?.cookingMethods).toContain('boiled');
      
      // 豬肉絲應該是水煮
      const pork = components.find(c => c.name === '豬肉絲');
      expect(pork?.cookingMethods).toContain('boiled');
    });

    test('河粉的成分應該有正確的烹飪方式', () => {
      const riceSheetMap = findDishComponentMap('河粉');
      const components = riceSheetMap?.commonComponents || [];
      
      // 麵條應該是水煮
      const noodles = components.find(c => c.name === '河粉');
      expect(noodles?.cookingMethods).toContain('boiled');
      
      // 牛肉片應該是水煮
      const beef = components.find(c => c.name === '牛肉片');
      expect(beef?.cookingMethods).toContain('boiled');
    });
  });

  describe('地域變化驗證', () => {
    test('拉麵應該有日本地域變化', () => {
      const ramenMap = findDishComponentMap('拉麵');
      
      expect(ramenMap?.regionalVariations).toBeDefined();
      expect(ramenMap?.regionalVariations.length).toBeGreaterThan(0);
      
      const japanVariation = ramenMap?.regionalVariations.find(v => v.region === 'japan');
      expect(japanVariation).toBeDefined();
      expect(japanVariation?.culturalNotes).toBeTruthy();
    });

    test('米粉應該有台灣和中國地域變化', () => {
      const riceNoodlesMap = findDishComponentMap('米粉');
      
      expect(riceNoodlesMap?.regionalVariations).toBeDefined();
      expect(riceNoodlesMap?.regionalVariations.length).toBeGreaterThan(0);
      
      const taiwanVariation = riceNoodlesMap?.regionalVariations.find(v => v.region === 'taiwan');
      expect(taiwanVariation).toBeDefined();
      expect(taiwanVariation?.components.length).toBeGreaterThan(0);
    });

    test('河粉應該有廣東和越南地域變化', () => {
      const riceSheetMap = findDishComponentMap('河粉');
      
      expect(riceSheetMap?.regionalVariations).toBeDefined();
      expect(riceSheetMap?.regionalVariations.length).toBeGreaterThan(0);
      
      const guangdongVariation = riceSheetMap?.regionalVariations.find(v => v.region === 'guangdong');
      expect(guangdongVariation).toBeDefined();
      
      const vietnamVariation = riceSheetMap?.regionalVariations.find(v => v.region === 'vietnam');
      expect(vietnamVariation).toBeDefined();
    });
  });

  describe('營養影響驗證', () => {
    test('拉麵的成分應該有營養影響數據', () => {
      const ramenMap = findDishComponentMap('拉麵');
      const components = ramenMap?.commonComponents || [];
      
      // 麵條應該有營養影響
      const noodles = components.find(c => c.name === '拉麵');
      expect(noodles?.nutritionImpact).toBeDefined();
      expect(noodles?.nutritionImpact.length).toBeGreaterThan(0);
      
      // 叉燒應該有營養影響
      const chashu = components.find(c => c.name === '叉燒');
      expect(chashu?.nutritionImpact).toBeDefined();
      expect(chashu?.nutritionImpact.length).toBeGreaterThan(0);
    });

    test('烏龍麵的天婦羅應該有油炸的營養影響', () => {
      const udonMap = findDishComponentMap('烏龍麵');
      const components = udonMap?.commonComponents || [];
      
      const tempura = components.find(c => c.name === '天婦羅');
      expect(tempura?.nutritionImpact).toBeDefined();
      expect(tempura?.nutritionImpact.length).toBeGreaterThan(0);
      
      const deepFriedImpact = tempura?.nutritionImpact.find(i => i.method === 'deep_fried');
      expect(deepFriedImpact).toBeDefined();
      expect(deepFriedImpact?.calorieMultiplier).toBeGreaterThan(1);
      expect(deepFriedImpact?.fatMultiplier).toBeGreaterThan(1);
    });
  });

  describe('湯麵 vs 乾麵差異', () => {
    test('湯麵應該包含湯底成分', () => {
      const ramenMap = findDishComponentMap('拉麵');
      const components = ramenMap?.commonComponents || [];
      
      const broth = components.find(c => c.category === ComponentCategory.SAUCE);
      expect(broth).toBeDefined();
      expect(broth?.typicalPortion).toBeGreaterThan(200); // 湯底至少 200ml
    });

    test('乾麵（炒麵）不應該有湯底', () => {
      const friedNoodlesMap = findDishComponentMap('炒麵');
      const components = friedNoodlesMap?.commonComponents || [];
      
      const broth = components.find(c => 
        c.category === ComponentCategory.SAUCE && 
        (c.name.includes('湯') || c.name.includes('broth'))
      );
      expect(broth).toBeUndefined();
    });

    test('湯麵的麵條應該是水煮', () => {
      const ramenMap = findDishComponentMap('拉麵');
      const components = ramenMap?.commonComponents || [];
      
      const noodles = components.find(c => c.category === ComponentCategory.GRAIN);
      expect(noodles?.cookingMethods).toContain('boiled');
    });

    test('乾麵的麵條應該是炒製', () => {
      const friedNoodlesMap = findDishComponentMap('炒麵');
      const components = friedNoodlesMap?.commonComponents || [];
      
      const noodles = components.find(c => c.category === ComponentCategory.GRAIN);
      expect(noodles?.cookingMethods).toContain('stir_fried');
    });
  });

  describe('成分頻率驗證', () => {
    test('所有麵食類的麵條頻率應該是 1.0', () => {
      const noodleDishes = ['拉麵', '烏龍麵', '米粉', '河粉'];
      
      noodleDishes.forEach(dishName => {
        const map = findDishComponentMap(dishName);
        const components = map?.commonComponents || [];
        
        const noodles = components.find(c => c.category === ComponentCategory.GRAIN);
        expect(noodles?.frequency).toBe(1.0);
      });
    });

    test('配菜的頻率應該小於 1.0', () => {
      const ramenMap = findDishComponentMap('拉麵');
      const components = ramenMap?.commonComponents || [];
      
      const garnishes = components.filter(c => c.category === ComponentCategory.GARNISH);
      garnishes.forEach(garnish => {
        expect(garnish.frequency).toBeLessThanOrEqual(1.0);
      });
    });
  });

  describe('完整性驗證', () => {
    test('所有麵食類料理都應該有完整的資料', () => {
      const noodleDishes = ['拉麵', '烏龍麵', '米粉', '河粉'];
      
      noodleDishes.forEach(dishName => {
        const map = findDishComponentMap(dishName);
        
        expect(map).toBeDefined();
        expect(map?.dishName).toBeTruthy();
        expect(map?.dishNameEn).toBeTruthy();
        expect(map?.dishType).toBe(DishType.NOODLES);
        expect(map?.region.length).toBeGreaterThan(0);
        expect(map?.commonComponents.length).toBeGreaterThan(0);
        expect(map?.typicalPortionRange).toBeDefined();
        expect(map?.typicalPortionRange.min).toBeGreaterThan(0);
        expect(map?.typicalPortionRange.max).toBeGreaterThan(0);
        expect(map?.typicalPortionRange.typical).toBeGreaterThan(0);
      });
    });

    test('所有成分都應該有必要的屬性', () => {
      const noodleDishes = ['拉麵', '烏龍麵', '米粉', '河粉'];
      
      noodleDishes.forEach(dishName => {
        const map = findDishComponentMap(dishName);
        const components = map?.commonComponents || [];
        
        components.forEach(component => {
          expect(component.name).toBeTruthy();
          expect(component.category).toBeTruthy();
          expect(component.typicalPortion).toBeGreaterThan(0);
          expect(component.portionRange).toBeDefined();
          expect(component.portionRange.min).toBeGreaterThan(0);
          expect(component.portionRange.max).toBeGreaterThan(component.portionRange.min);
          expect(component.frequency).toBeGreaterThan(0);
          expect(component.frequency).toBeLessThanOrEqual(1.0);
          expect(component.cookingMethods.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
