/**
 * 炒菜類成分識別測試
 * Stir-Fry Component Detection Tests
 */

import { ComponentDetectionEngine } from '../ComponentDetectionEngine';
import { DishType, ComponentCategory, CookingMethod } from '../../types/ComponentDetection';

describe('ComponentDetectionEngine - 炒菜類識別', () => {
  let engine: ComponentDetectionEngine;

  beforeEach(() => {
    engine = new ComponentDetectionEngine('zh-TW');
  });

  describe('炒麵成分識別', () => {
    it('應該識別炒麵的主要成分', async () => {
      // 模擬炒麵圖片（實際測試需要真實圖片）
      const mockImage = Buffer.from('mock-image-data');
      
      // 這個測試需要 OpenAI API key 才能運行
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ 跳過測試：需要 OPENAI_API_KEY');
        return;
      }

      const result = await engine.detectComponents(
        mockImage,
        '炒麵',
        DishType.STIR_FRY
      );

      // 驗證基本結構
      expect(result.mainDish.type).toBe(DishType.STIR_FRY);
      expect(result.components.length).toBeGreaterThan(0);

      // 驗證應該包含麵條
      const hasNoodles = result.components.some(c => 
        c.name.includes('麵') && c.category === ComponentCategory.GRAIN
      );
      expect(hasNoodles).toBe(true);

      // 驗證烹飪方式
      const stirFriedComponents = result.components.filter(c => 
        c.cookingMethod === CookingMethod.STIR_FRIED
      );
      expect(stirFriedComponents.length).toBeGreaterThan(0);
    });
  });

  describe('炒青菜成分識別', () => {
    it('應該識別炒青菜的主要成分', async () => {
      const mockImage = Buffer.from('mock-image-data');
      
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ 跳過測試：需要 OPENAI_API_KEY');
        return;
      }

      const result = await engine.detectComponents(
        mockImage,
        '炒青菜',
        DishType.STIR_FRY
      );

      // 驗證應該包含蔬菜
      const hasVegetable = result.components.some(c => 
        c.category === ComponentCategory.VEGETABLE
      );
      expect(hasVegetable).toBe(true);

      // 驗證應該包含蒜頭
      const hasGarlic = result.components.some(c => 
        c.name.includes('蒜')
      );
      expect(hasGarlic).toBe(true);
    });
  });

  describe('宮保雞丁成分識別', () => {
    it('應該識別宮保雞丁的主要成分', async () => {
      const mockImage = Buffer.from('mock-image-data');
      
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ 跳過測試：需要 OPENAI_API_KEY');
        return;
      }

      const result = await engine.detectComponents(
        mockImage,
        '宮保雞丁',
        DishType.STIR_FRY
      );

      // 驗證應該包含雞肉
      const hasChicken = result.components.some(c => 
        c.name.includes('雞') && c.category === ComponentCategory.PROTEIN
      );
      expect(hasChicken).toBe(true);

      // 驗證應該包含花生
      const hasPeanuts = result.components.some(c => 
        c.name.includes('花生')
      );
      expect(hasPeanuts).toBe(true);

      // 驗證應該包含辣椒
      const hasChili = result.components.some(c => 
        c.name.includes('辣椒')
      );
      expect(hasChili).toBe(true);
    });
  });

  describe('混合成分識別', () => {
    it('應該能識別炒菜中混合的多種成分', async () => {
      const mockImage = Buffer.from('mock-image-data');
      
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ 跳過測試：需要 OPENAI_API_KEY');
        return;
      }

      const result = await engine.detectComponents(
        mockImage,
        '炒麵',
        DishType.STIR_FRY
      );

      // 炒菜類應該識別出多種成分
      expect(result.components.length).toBeGreaterThanOrEqual(3);

      // 應該包含不同類別的成分
      const categories = new Set(result.components.map(c => c.category));
      expect(categories.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('份量調整', () => {
    it('應該合理調整炒菜類成分的份量', async () => {
      const mockImage = Buffer.from('mock-image-data');
      
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ 跳過測試：需要 OPENAI_API_KEY');
        return;
      }

      const result = await engine.detectComponents(
        mockImage,
        '炒麵',
        DishType.STIR_FRY
      );

      // 主要食材應該佔較大份量
      const mainIngredients = result.components.filter(c => 
        c.category === ComponentCategory.GRAIN ||
        c.category === ComponentCategory.VEGETABLE
      );
      
      const mainTotal = mainIngredients.reduce((sum, c) => sum + c.estimatedPortion, 0);
      const totalPortion = result.components.reduce((sum, c) => sum + c.estimatedPortion, 0);
      
      // 主要食材應該佔 40% 以上
      expect(mainTotal / totalPortion).toBeGreaterThan(0.4);

      // 調味料應該是小份量
      const seasonings = result.components.filter(c => 
        c.category === ComponentCategory.SEASONING
      );
      
      seasonings.forEach(s => {
        expect(s.estimatedPortion).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('驗證功能', () => {
    it('應該驗證炒菜類成分的合理性', async () => {
      const mockImage = Buffer.from('mock-image-data');
      
      if (!process.env.OPENAI_API_KEY) {
        console.log('⚠️ 跳過測試：需要 OPENAI_API_KEY');
        return;
      }

      const result = await engine.detectComponents(
        mockImage,
        '炒青菜',
        DishType.STIR_FRY
      );

      // 應該有建議或警告（如果有問題）
      expect(result.suggestions).toBeDefined();
      
      // 元數據應該包含信心度
      expect(result.metadata.confidenceScore).toBeGreaterThan(0);
      expect(result.metadata.confidenceScore).toBeLessThanOrEqual(1);
    });
  });
});
