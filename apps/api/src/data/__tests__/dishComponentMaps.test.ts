/**
 * 料理-成分映射數據測試
 * Dish-Component Mapping Data Tests
 */

import {
  DISH_COMPONENT_MAPS,
  findDishComponentMap,
  findDishComponentMapsByType,
  findDishComponentMapsByRegion
} from '../dishComponentMaps';
import { DishType, ComponentCategory } from '../../types/ComponentDetection';

describe('料理-成分映射數據', () => {
  describe('數據完整性', () => {
    it('應該包含至少 5 種料理的映射', () => {
      expect(DISH_COMPONENT_MAPS.length).toBeGreaterThanOrEqual(5);
    });

    it('每個料理映射應該有必要的屬性', () => {
      DISH_COMPONENT_MAPS.forEach(dishMap => {
        expect(dishMap.dishName).toBeDefined();
        expect(dishMap.dishType).toBeDefined();
        expect(dishMap.region).toBeDefined();
        expect(dishMap.commonComponents).toBeDefined();
        expect(dishMap.typicalPortionRange).toBeDefined();
        
        expect(Array.isArray(dishMap.region)).toBe(true);
        expect(Array.isArray(dishMap.commonComponents)).toBe(true);
        expect(dishMap.commonComponents.length).toBeGreaterThan(0);
      });
    });

    it('每個成分應該有必要的屬性', () => {
      DISH_COMPONENT_MAPS.forEach(dishMap => {
        dishMap.commonComponents.forEach(component => {
          expect(component.name).toBeDefined();
          expect(component.category).toBeDefined();
          expect(component.typicalPortion).toBeDefined();
          expect(component.portionRange).toBeDefined();
          expect(component.frequency).toBeDefined();
          expect(component.cookingMethods).toBeDefined();
          
          expect(component.typicalPortion).toBeGreaterThan(0);
          expect(component.frequency).toBeGreaterThan(0);
          expect(component.frequency).toBeLessThanOrEqual(1);
          expect(component.portionRange.min).toBeLessThanOrEqual(component.portionRange.max);
        });
      });
    });

    it('份量範圍應該合理', () => {
      DISH_COMPONENT_MAPS.forEach(dishMap => {
        expect(dishMap.typicalPortionRange.min).toBeGreaterThan(0);
        expect(dishMap.typicalPortionRange.max).toBeGreaterThan(dishMap.typicalPortionRange.min);
        expect(dishMap.typicalPortionRange.typical).toBeGreaterThanOrEqual(dishMap.typicalPortionRange.min);
        expect(dishMap.typicalPortionRange.typical).toBeLessThanOrEqual(dishMap.typicalPortionRange.max);
      });
    });
  });

  describe('findDishComponentMap', () => {
    it('應該能找到蛋炒飯的映射', () => {
      const dishMap = findDishComponentMap('蛋炒飯');
      
      expect(dishMap).toBeDefined();
      expect(dishMap?.dishName).toBe('蛋炒飯');
      expect(dishMap?.dishType).toBe(DishType.FRIED_RICE);
    });

    it('應該能找到味噌湯的映射', () => {
      const dishMap = findDishComponentMap('味噌湯');
      
      expect(dishMap).toBeDefined();
      expect(dishMap?.dishName).toBe('味噌湯');
      expect(dishMap?.dishType).toBe(DishType.SOUP);
    });

    it('應該能找到台式便當的映射', () => {
      const dishMap = findDishComponentMap('台式便當');
      
      expect(dishMap).toBeDefined();
      expect(dishMap?.dishName).toBe('台式便當');
      expect(dishMap?.dishType).toBe(DishType.BENTO);
    });

    it('應該能找到拉麵的映射', () => {
      const dishMap = findDishComponentMap('拉麵');
      
      expect(dishMap).toBeDefined();
      expect(dishMap?.dishName).toBe('拉麵');
      expect(dishMap?.dishType).toBe(DishType.NOODLES);
    });

    it('應該對未知料理返回 undefined', () => {
      const dishMap = findDishComponentMap('未知料理');
      
      expect(dishMap).toBeUndefined();
    });

    it('應該支持精確匹配', () => {
      const dishMap = findDishComponentMap('蛋炒飯');
      
      // 應該能精確匹配到蛋炒飯
      expect(dishMap).toBeDefined();
      expect(dishMap?.dishType).toBe(DishType.FRIED_RICE);
      expect(dishMap?.dishName).toBe('蛋炒飯');
    });
  });

  describe('findDishComponentMapsByType', () => {
    it('應該能找到所有湯品類料理', () => {
      const soupDishes = findDishComponentMapsByType(DishType.SOUP);
      
      expect(soupDishes.length).toBeGreaterThan(0);
      soupDishes.forEach(dish => {
        expect(dish.dishType).toBe(DishType.SOUP);
      });
    });

    it('應該能找到所有炒飯類料理', () => {
      const friedRiceDishes = findDishComponentMapsByType(DishType.FRIED_RICE);
      
      expect(friedRiceDishes.length).toBeGreaterThan(0);
      friedRiceDishes.forEach(dish => {
        expect(dish.dishType).toBe(DishType.FRIED_RICE);
      });
    });

    it('應該能找到所有便當類料理', () => {
      const bentoDishes = findDishComponentMapsByType(DishType.BENTO);
      
      expect(bentoDishes.length).toBeGreaterThan(0);
      bentoDishes.forEach(dish => {
        expect(dish.dishType).toBe(DishType.BENTO);
      });
    });

    it('應該能找到所有麵食類料理', () => {
      const noodlesDishes = findDishComponentMapsByType(DishType.NOODLES);
      
      expect(noodlesDishes.length).toBeGreaterThan(0);
      noodlesDishes.forEach(dish => {
        expect(dish.dishType).toBe(DishType.NOODLES);
      });
    });

    it('對於沒有的料理類型應該返回空陣列', () => {
      const unknownDishes = findDishComponentMapsByType(DishType.UNKNOWN);
      
      expect(Array.isArray(unknownDishes)).toBe(true);
      expect(unknownDishes.length).toBe(0);
    });
  });

  describe('findDishComponentMapsByRegion', () => {
    it('應該能找到台灣料理', () => {
      const taiwanDishes = findDishComponentMapsByRegion('taiwan');
      
      expect(taiwanDishes.length).toBeGreaterThan(0);
      taiwanDishes.forEach(dish => {
        expect(dish.region).toContain('taiwan');
      });
    });

    it('應該能找到日本料理', () => {
      const japanDishes = findDishComponentMapsByRegion('japan');
      
      expect(japanDishes.length).toBeGreaterThan(0);
      japanDishes.forEach(dish => {
        expect(dish.region).toContain('japan');
      });
    });

    it('應該能找到中國料理', () => {
      const chinaDishes = findDishComponentMapsByRegion('china');
      
      expect(chinaDishes.length).toBeGreaterThan(0);
      chinaDishes.forEach(dish => {
        expect(dish.region).toContain('china');
      });
    });

    it('對於沒有的地區應該返回空陣列', () => {
      const unknownDishes = findDishComponentMapsByRegion('unknown');
      
      expect(Array.isArray(unknownDishes)).toBe(true);
      expect(unknownDishes.length).toBe(0);
    });
  });

  describe('成分數據質量', () => {
    it('蛋炒飯應該包含米飯和雞蛋', () => {
      const dishMap = findDishComponentMap('蛋炒飯');
      
      expect(dishMap).toBeDefined();
      
      const hasRice = dishMap!.commonComponents.some(c => 
        c.name.includes('飯') || c.name.includes('rice')
      );
      const hasEgg = dishMap!.commonComponents.some(c => 
        c.name.includes('蛋') || c.name.includes('egg')
      );
      
      expect(hasRice).toBe(true);
      expect(hasEgg).toBe(true);
    });

    it('味噌湯應該包含味噌和豆腐', () => {
      const dishMap = findDishComponentMap('味噌湯');
      
      expect(dishMap).toBeDefined();
      
      const hasMiso = dishMap!.commonComponents.some(c => 
        c.name.includes('味噌') || c.name.includes('miso')
      );
      const hasTofu = dishMap!.commonComponents.some(c => 
        c.name.includes('豆腐') || c.name.includes('tofu')
      );
      
      expect(hasMiso).toBe(true);
      expect(hasTofu).toBe(true);
    });

    it('便當應該包含主食、主菜和配菜', () => {
      const dishMap = findDishComponentMap('台式便當');
      
      expect(dishMap).toBeDefined();
      
      const hasGrain = dishMap!.commonComponents.some(c => 
        c.category === ComponentCategory.GRAIN
      );
      const hasProtein = dishMap!.commonComponents.some(c => 
        c.category === ComponentCategory.PROTEIN
      );
      const hasVegetable = dishMap!.commonComponents.some(c => 
        c.category === ComponentCategory.VEGETABLE
      );
      
      expect(hasGrain).toBe(true);
      expect(hasProtein).toBe(true);
      expect(hasVegetable).toBe(true);
    });

    it('拉麵應該包含麵條和湯底', () => {
      const dishMap = findDishComponentMap('拉麵');
      
      expect(dishMap).toBeDefined();
      
      const hasNoodles = dishMap!.commonComponents.some(c => 
        c.name.includes('麵') || c.name.includes('noodle')
      );
      const hasBroth = dishMap!.commonComponents.some(c => 
        c.name.includes('湯') || c.name.includes('broth') || c.category === ComponentCategory.SAUCE
      );
      
      expect(hasNoodles).toBe(true);
      expect(hasBroth).toBe(true);
    });
  });

  describe('地域變化', () => {
    it('應該包含地域變化資訊', () => {
      const dishesWithVariations = DISH_COMPONENT_MAPS.filter(
        dish => dish.regionalVariations && dish.regionalVariations.length > 0
      );
      
      expect(dishesWithVariations.length).toBeGreaterThan(0);
    });

    it('地域變化應該有文化註解', () => {
      DISH_COMPONENT_MAPS.forEach(dishMap => {
        if (dishMap.regionalVariations) {
          dishMap.regionalVariations.forEach(variation => {
            expect(variation.region).toBeDefined();
            expect(variation.components).toBeDefined();
            expect(variation.culturalNotes).toBeDefined();
            expect(variation.culturalNotes.length).toBeGreaterThan(0);
          });
        }
      });
    });

    it('蛋炒飯應該有台灣和中國的變化', () => {
      const dishMap = findDishComponentMap('蛋炒飯');
      
      expect(dishMap).toBeDefined();
      expect(dishMap!.regionalVariations).toBeDefined();
      
      const hasTaiwanVariation = dishMap!.regionalVariations?.some(v => 
        v.region === 'taiwan'
      );
      const hasChinaVariation = dishMap!.regionalVariations?.some(v => 
        v.region === 'china'
      );
      
      expect(hasTaiwanVariation || hasChinaVariation).toBe(true);
    });
  });

  describe('營養影響數據', () => {
    it('應該包含烹飪方式的營養影響', () => {
      const componentsWithImpact = DISH_COMPONENT_MAPS.flatMap(dish => 
        dish.commonComponents.filter(c => 
          c.nutritionImpact && c.nutritionImpact.length > 0
        )
      );
      
      expect(componentsWithImpact.length).toBeGreaterThan(0);
    });

    it('營養影響應該有合理的倍數', () => {
      DISH_COMPONENT_MAPS.forEach(dishMap => {
        dishMap.commonComponents.forEach(component => {
          if (component.nutritionImpact) {
            component.nutritionImpact.forEach(impact => {
              expect(impact.calorieMultiplier).toBeGreaterThan(0);
              expect(impact.calorieMultiplier).toBeLessThan(3);
              expect(impact.fatMultiplier).toBeGreaterThan(0);
              expect(impact.fatMultiplier).toBeLessThan(5);
              expect(impact.proteinRetention).toBeGreaterThan(0);
              expect(impact.proteinRetention).toBeLessThanOrEqual(1);
              expect(impact.vitaminRetention).toBeGreaterThan(0);
              expect(impact.vitaminRetention).toBeLessThanOrEqual(1);
            });
          }
        });
      });
    });

    it('油炸應該有較高的熱量和脂肪倍數', () => {
      const deepFriedComponents = DISH_COMPONENT_MAPS.flatMap(dish => 
        dish.commonComponents.filter(c => 
          c.nutritionImpact?.some(impact => 
            impact.method === 'deep_fried'
          )
        )
      );
      
      expect(deepFriedComponents.length).toBeGreaterThan(0);
      
      deepFriedComponents.forEach(component => {
        const deepFriedImpact = component.nutritionImpact?.find(
          impact => impact.method === 'deep_fried'
        );
        
        if (deepFriedImpact) {
          expect(deepFriedImpact.calorieMultiplier).toBeGreaterThan(1.5);
          expect(deepFriedImpact.fatMultiplier).toBeGreaterThan(2);
        }
      });
    });
  });

  describe('查詢性能', () => {
    it('findDishComponentMap 應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        findDishComponentMap('蛋炒飯');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 100次查詢應該在100ms內完成
      expect(duration).toBeLessThan(100);
    });

    it('findDishComponentMapsByType 應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        findDishComponentMapsByType(DishType.SOUP);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 100次查詢應該在100ms內完成
      expect(duration).toBeLessThan(100);
    });

    it('findDishComponentMapsByRegion 應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        findDishComponentMapsByRegion('taiwan');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 100次查詢應該在100ms內完成
      expect(duration).toBeLessThan(100);
    });
  });

  describe('數據覆蓋範圍', () => {
    it('應該涵蓋多種料理類型', () => {
      const dishTypes = new Set(DISH_COMPONENT_MAPS.map(d => d.dishType));
      
      expect(dishTypes.has(DishType.SOUP)).toBe(true);
      expect(dishTypes.has(DishType.FRIED_RICE)).toBe(true);
      expect(dishTypes.has(DishType.BENTO)).toBe(true);
      expect(dishTypes.has(DishType.NOODLES)).toBe(true);
    });

    it('應該涵蓋多個地區', () => {
      const regions = new Set(DISH_COMPONENT_MAPS.flatMap(d => d.region));
      
      expect(regions.has('taiwan')).toBe(true);
      expect(regions.has('japan')).toBe(true);
      expect(regions.has('china')).toBe(true);
    });

    it('應該涵蓋多種成分類別', () => {
      const categories = new Set(
        DISH_COMPONENT_MAPS.flatMap(dish => 
          dish.commonComponents.map(c => c.category)
        )
      );
      
      expect(categories.has(ComponentCategory.GRAIN)).toBe(true);
      expect(categories.has(ComponentCategory.PROTEIN)).toBe(true);
      expect(categories.has(ComponentCategory.VEGETABLE)).toBe(true);
      expect(categories.has(ComponentCategory.SEASONING)).toBe(true);
    });

    it('應該涵蓋多種烹飪方式', () => {
      const cookingMethods = new Set(
        DISH_COMPONENT_MAPS.flatMap(dish => 
          dish.commonComponents.flatMap(c => c.cookingMethods)
        )
      );
      
      expect(cookingMethods.size).toBeGreaterThan(3);
    });
  });
});
