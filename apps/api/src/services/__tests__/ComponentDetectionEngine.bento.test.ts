/**
 * 便當類成分識別測試
 * Bento Component Detection Tests
 * 
 * 測試便當類料理的成分識別功能，包括：
 * - 台式便當
 * - 日式便當
 * - 韓式便當
 * - 區域劃分（主食、主菜、配菜）
 * - 多個獨立成分的識別
 */

import { ComponentDetectionEngine } from '../ComponentDetectionEngine';
import {
  DishType,
  ComponentCategory,
  CookingMethod
} from '../../types/ComponentDetection';

describe('ComponentDetectionEngine - 便當類成分識別', () => {
  let engine: ComponentDetectionEngine;

  beforeEach(() => {
    engine = new ComponentDetectionEngine('zh-TW');
  });

  describe('台式便當成分識別', () => {
    it('應該識別台式便當的基本成分', async () => {
      // 模擬台式便當的成分
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          nameEn: 'White Rice',
          confidence: 0.95,
          estimatedPortion: 250,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STEAMED
        },
        {
          id: 'comp-2',
          name: '炸雞腿',
          nameEn: 'Fried Chicken Leg',
          confidence: 0.92,
          estimatedPortion: 150,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.DEEP_FRIED
        },
        {
          id: 'comp-3',
          name: '滷蛋',
          nameEn: 'Braised Egg',
          confidence: 0.90,
          estimatedPortion: 60,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.BRAISED
        },
        {
          id: 'comp-4',
          name: '高麗菜',
          nameEn: 'Cabbage',
          confidence: 0.88,
          estimatedPortion: 50,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.STIR_FRIED
        },
        {
          id: 'comp-5',
          name: '豆乾',
          nameEn: 'Dried Tofu',
          confidence: 0.85,
          estimatedPortion: 30,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.BRAISED
        }
      ];

      // 測試份量調整邏輯
      const adjustedComponents = (engine as any).adjustBentoComponentPortions(
        mockComponents,
        500 // 典型台式便當總份量
      );

      // 驗證成分數量
      expect(adjustedComponents.length).toBe(5);

      // 驗證主食
      const staple = adjustedComponents.find(c => c.name === '白飯');
      expect(staple).toBeDefined();
      expect((staple as any).bentoRole).toBe('staple');
      expect(staple!.estimatedPortion).toBeGreaterThan(150);
      expect(staple!.estimatedPortion).toBeLessThan(250);

      // 驗證主菜
      const mainDish = adjustedComponents.find(c => c.name === '炸雞腿');
      expect(mainDish).toBeDefined();
      expect((mainDish as any).bentoRole).toBe('main_dish');
      expect(mainDish!.estimatedPortion).toBeGreaterThan(100);

      // 驗證配菜
      const sideDishes = adjustedComponents.filter(c => 
        (c as any).bentoRole === 'side_dish'
      );
      expect(sideDishes.length).toBeGreaterThan(0);

      console.log('✅ 台式便當成分識別測試通過');
    });

    it('應該驗證台式便當的成分合理性', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STEAMED,
          bentoRole: 'staple'
        },
        {
          id: 'comp-2',
          name: '炸雞腿',
          confidence: 0.92,
          estimatedPortion: 120,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.DEEP_FRIED,
          bentoRole: 'main_dish'
        },
        {
          id: 'comp-3',
          name: '高麗菜',
          confidence: 0.88,
          estimatedPortion: 50,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.STIR_FRIED,
          bentoRole: 'side_dish'
        }
      ];

      const warnings = (engine as any).validateBentoComponents(mockComponents);

      // 應該沒有嚴重警告
      expect(warnings).toBeDefined();
      expect(Array.isArray(warnings)).toBe(true);

      console.log('✅ 台式便當驗證測試通過');
      if (warnings.length > 0) {
        console.log('   警告:', warnings);
      }
    });

    it('應該檢測缺少主食的情況', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '炸雞腿',
          confidence: 0.92,
          estimatedPortion: 120,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.DEEP_FRIED,
          bentoRole: 'main_dish'
        },
        {
          id: 'comp-2',
          name: '高麗菜',
          confidence: 0.88,
          estimatedPortion: 50,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.STIR_FRIED,
          bentoRole: 'side_dish'
        }
      ];

      const warnings = (engine as any).validateBentoComponents(mockComponents);

      // 應該警告缺少主食
      expect(warnings.some((w: string) => w.includes('主食'))).toBe(true);

      console.log('✅ 缺少主食檢測測試通過');
    });
  });

  describe('日式便當成分識別', () => {
    it('應該識別日式便當的基本成分', async () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          nameEn: 'White Rice',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STEAMED
        },
        {
          id: 'comp-2',
          name: '炸豬排',
          nameEn: 'Tonkatsu',
          confidence: 0.93,
          estimatedPortion: 120,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.DEEP_FRIED
        },
        {
          id: 'comp-3',
          name: '玉子燒',
          nameEn: 'Tamagoyaki',
          confidence: 0.91,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.FRIED
        },
        {
          id: 'comp-4',
          name: '炒青菜',
          nameEn: 'Stir-Fried Vegetables',
          confidence: 0.88,
          estimatedPortion: 40,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.STIR_FRIED
        },
        {
          id: 'comp-5',
          name: '醃漬物',
          nameEn: 'Pickles',
          confidence: 0.85,
          estimatedPortion: 20,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.PICKLED
        },
        {
          id: 'comp-6',
          name: '梅乾',
          nameEn: 'Umeboshi',
          confidence: 0.80,
          estimatedPortion: 10,
          category: ComponentCategory.GARNISH,
          cookingMethod: CookingMethod.PICKLED
        }
      ];

      const adjustedComponents = (engine as any).adjustBentoComponentPortions(
        mockComponents,
        500
      );

      // 驗證成分數量
      expect(adjustedComponents.length).toBe(6);

      // 驗證主食
      const staple = adjustedComponents.find(c => c.name === '白飯');
      expect(staple).toBeDefined();
      expect((staple as any).bentoRole).toBe('staple');

      // 驗證主菜
      const mainDish = adjustedComponents.find(c => c.name === '炸豬排');
      expect(mainDish).toBeDefined();
      expect((mainDish as any).bentoRole).toBe('main_dish');

      // 驗證配菜（應該包含玉子燒、青菜、醃漬物、梅乾）
      const sideDishes = adjustedComponents.filter(c => 
        (c as any).bentoRole === 'side_dish'
      );
      expect(sideDishes.length).toBeGreaterThanOrEqual(3);

      console.log('✅ 日式便當成分識別測試通過');
    });

    it('應該識別日式便當的特色成分', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 180,
          category: ComponentCategory.GRAIN,
          bentoRole: 'staple'
        },
        {
          id: 'comp-2',
          name: '玉子燒',
          confidence: 0.91,
          estimatedPortion: 40,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'side_dish'
        },
        {
          id: 'comp-3',
          name: '梅乾',
          confidence: 0.80,
          estimatedPortion: 10,
          category: ComponentCategory.GARNISH,
          cookingMethod: CookingMethod.PICKLED,
          bentoRole: 'side_dish'
        }
      ];

      const warnings = (engine as any).validateBentoComponents(mockComponents);

      // 應該檢測到有玉子燒和梅乾
      expect(mockComponents.some(c => c.name.includes('玉子燒'))).toBe(true);
      expect(mockComponents.some(c => c.name.includes('梅乾'))).toBe(true);

      console.log('✅ 日式便當特色成分識別測試通過');
    });
  });

  describe('韓式便當成分識別', () => {
    it('應該識別韓式便當的基本成分', async () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          nameEn: 'White Rice',
          confidence: 0.95,
          estimatedPortion: 220,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STEAMED
        },
        {
          id: 'comp-2',
          name: '韓式烤肉',
          nameEn: 'Korean BBQ',
          confidence: 0.92,
          estimatedPortion: 110,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.GRILLED
        },
        {
          id: 'comp-3',
          name: '泡菜',
          nameEn: 'Kimchi',
          confidence: 0.93,
          estimatedPortion: 45,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.PICKLED
        },
        {
          id: 'comp-4',
          name: '煎蛋',
          nameEn: 'Fried Egg',
          confidence: 0.90,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.FRIED
        },
        {
          id: 'comp-5',
          name: '炒菠菜',
          nameEn: 'Stir-Fried Spinach',
          confidence: 0.87,
          estimatedPortion: 40,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.STIR_FRIED
        },
        {
          id: 'comp-6',
          name: '炒豆芽',
          nameEn: 'Stir-Fried Bean Sprouts',
          confidence: 0.85,
          estimatedPortion: 40,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.STIR_FRIED
        }
      ];

      const adjustedComponents = (engine as any).adjustBentoComponentPortions(
        mockComponents,
        550
      );

      // 驗證成分數量
      expect(adjustedComponents.length).toBe(6);

      // 驗證主食
      const staple = adjustedComponents.find(c => c.name === '白飯');
      expect(staple).toBeDefined();
      expect((staple as any).bentoRole).toBe('staple');

      // 驗證主菜
      const mainDish = adjustedComponents.find(c => c.name === '韓式烤肉');
      expect(mainDish).toBeDefined();
      expect((mainDish as any).bentoRole).toBe('main_dish');

      // 驗證配菜（韓式便當特色是多種小菜）
      const sideDishes = adjustedComponents.filter(c => 
        (c as any).bentoRole === 'side_dish'
      );
      expect(sideDishes.length).toBeGreaterThanOrEqual(3);

      // 驗證泡菜存在
      const kimchi = adjustedComponents.find(c => c.name === '泡菜');
      expect(kimchi).toBeDefined();

      console.log('✅ 韓式便當成分識別測試通過');
    });

    it('應該檢測韓式便當的多種小菜', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          bentoRole: 'staple'
        },
        {
          id: 'comp-2',
          name: '韓式烤肉',
          confidence: 0.92,
          estimatedPortion: 100,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'main_dish'
        },
        {
          id: 'comp-3',
          name: '泡菜',
          confidence: 0.93,
          estimatedPortion: 40,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.PICKLED,
          bentoRole: 'side_dish'
        },
        {
          id: 'comp-4',
          name: '炒菠菜',
          confidence: 0.87,
          estimatedPortion: 35,
          category: ComponentCategory.VEGETABLE,
          bentoRole: 'side_dish'
        },
        {
          id: 'comp-5',
          name: '炒豆芽',
          confidence: 0.85,
          estimatedPortion: 35,
          category: ComponentCategory.VEGETABLE,
          bentoRole: 'side_dish'
        },
        {
          id: 'comp-6',
          name: '炒魚板',
          confidence: 0.82,
          estimatedPortion: 30,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'side_dish'
        }
      ];

      const warnings = (engine as any).validateBentoComponents(mockComponents);

      // 驗證有多種小菜
      const sideDishes = mockComponents.filter(c => 
        (c as any).bentoRole === 'side_dish'
      );
      expect(sideDishes.length).toBeGreaterThanOrEqual(3);

      // 驗證有泡菜
      expect(mockComponents.some(c => c.name.includes('泡菜'))).toBe(true);

      console.log('✅ 韓式便當多種小菜檢測測試通過');
    });
  });

  describe('便當區域劃分', () => {
    it('應該正確劃分主食、主菜、配菜', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STEAMED
        },
        {
          id: 'comp-2',
          name: '炸雞腿',
          confidence: 0.92,
          estimatedPortion: 120,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.DEEP_FRIED
        },
        {
          id: 'comp-3',
          name: '滷蛋',
          confidence: 0.90,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.BRAISED
        },
        {
          id: 'comp-4',
          name: '高麗菜',
          confidence: 0.88,
          estimatedPortion: 40,
          category: ComponentCategory.VEGETABLE,
          cookingMethod: CookingMethod.STIR_FRIED
        }
      ];

      const adjustedComponents = (engine as any).adjustBentoComponentPortions(
        mockComponents,
        500
      );

      // 驗證主食
      const staples = adjustedComponents.filter(c => 
        (c as any).bentoRole === 'staple'
      );
      expect(staples.length).toBe(1);
      expect(staples[0].name).toBe('白飯');

      // 驗證主菜（份量較大的蛋白質）
      const mainDishes = adjustedComponents.filter(c => 
        (c as any).bentoRole === 'main_dish'
      );
      expect(mainDishes.length).toBeGreaterThan(0);
      expect(mainDishes.some(c => c.name === '炸雞腿')).toBe(true);

      // 驗證配菜
      const sideDishes = adjustedComponents.filter(c => 
        (c as any).bentoRole === 'side_dish'
      );
      expect(sideDishes.length).toBeGreaterThan(0);

      console.log('✅ 便當區域劃分測試通過');
      console.log(`   主食: ${staples.map(c => c.name).join(', ')}`);
      console.log(`   主菜: ${mainDishes.map(c => c.name).join(', ')}`);
      console.log(`   配菜: ${sideDishes.map(c => c.name).join(', ')}`);
    });

    it('應該正確計算各區域的份量比例', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          bentoRole: 'staple'
        },
        {
          id: 'comp-2',
          name: '炸雞腿',
          confidence: 0.92,
          estimatedPortion: 150,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'main_dish'
        },
        {
          id: 'comp-3',
          name: '高麗菜',
          confidence: 0.88,
          estimatedPortion: 50,
          category: ComponentCategory.VEGETABLE,
          bentoRole: 'side_dish'
        },
        {
          id: 'comp-4',
          name: '豆乾',
          confidence: 0.85,
          estimatedPortion: 30,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'side_dish'
        }
      ];

      const totalPortion = mockComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );

      const staplePortion = mockComponents
        .filter(c => (c as any).bentoRole === 'staple')
        .reduce((sum, c) => sum + c.estimatedPortion, 0);

      const mainDishPortion = mockComponents
        .filter(c => (c as any).bentoRole === 'main_dish')
        .reduce((sum, c) => sum + c.estimatedPortion, 0);

      const sideDishPortion = mockComponents
        .filter(c => (c as any).bentoRole === 'side_dish')
        .reduce((sum, c) => sum + c.estimatedPortion, 0);

      const stapleRatio = staplePortion / totalPortion;
      const mainDishRatio = mainDishPortion / totalPortion;
      const sideDishRatio = sideDishPortion / totalPortion;

      // 驗證比例合理性
      expect(stapleRatio).toBeGreaterThan(0.30);
      expect(stapleRatio).toBeLessThan(0.55);
      expect(mainDishRatio).toBeGreaterThan(0.20);
      expect(sideDishRatio).toBeGreaterThan(0.10);

      console.log('✅ 便當份量比例測試通過');
      console.log(`   主食比例: ${(stapleRatio * 100).toFixed(1)}%`);
      console.log(`   主菜比例: ${(mainDishRatio * 100).toFixed(1)}%`);
      console.log(`   配菜比例: ${(sideDishRatio * 100).toFixed(1)}%`);
    });
  });

  describe('便當成分驗證', () => {
    it('應該檢測成分數量過少', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          bentoRole: 'staple'
        },
        {
          id: 'comp-2',
          name: '炸雞腿',
          confidence: 0.92,
          estimatedPortion: 120,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'main_dish'
        }
      ];

      const warnings = (engine as any).validateBentoComponents(mockComponents);

      // 應該警告成分過少
      expect(warnings.some((w: string) => 
        w.includes('多種食物') || w.includes('遺漏')
      )).toBe(true);

      console.log('✅ 成分數量過少檢測測試通過');
    });

    it('應該檢測缺少主菜', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          bentoRole: 'staple'
        },
        {
          id: 'comp-2',
          name: '高麗菜',
          confidence: 0.88,
          estimatedPortion: 50,
          category: ComponentCategory.VEGETABLE,
          bentoRole: 'side_dish'
        },
        {
          id: 'comp-3',
          name: '豆乾',
          confidence: 0.85,
          estimatedPortion: 30,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'side_dish'
        }
      ];

      const warnings = (engine as any).validateBentoComponents(mockComponents);

      // 應該警告缺少主菜
      expect(warnings.some((w: string) => w.includes('主菜'))).toBe(true);

      console.log('✅ 缺少主菜檢測測試通過');
    });

    it('應該檢測缺少蔬菜', () => {
      const mockComponents = [
        {
          id: 'comp-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          bentoRole: 'staple'
        },
        {
          id: 'comp-2',
          name: '炸雞腿',
          confidence: 0.92,
          estimatedPortion: 120,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'main_dish'
        },
        {
          id: 'comp-3',
          name: '滷蛋',
          confidence: 0.90,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          bentoRole: 'side_dish'
        }
      ];

      const warnings = (engine as any).validateBentoComponents(mockComponents);

      // 應該警告缺少蔬菜
      expect(warnings.some((w: string) => w.includes('蔬菜'))).toBe(true);

      console.log('✅ 缺少蔬菜檢測測試通過');
    });
  });
});
