/**
 * 湯品類成分識別測試
 * 
 * 測試湯品專用的成分識別邏輯，包括：
 * - 液體和固體成分的份量估計
 * - 湯品成分驗證
 * - 湯品專用建議生成
 */

import { ComponentDetectionEngine } from '../ComponentDetectionEngine';
import {
  DishType,
  ComponentCategory,
  DetectedComponent,
  EnrichedComponent
} from '../../types/ComponentDetection';

describe('ComponentDetectionEngine - 湯品類識別', () => {
  let engine: ComponentDetectionEngine;

  beforeEach(() => {
    engine = new ComponentDetectionEngine('zh-TW');
  });

  describe('湯品份量調整', () => {
    it('應該正確區分液體和固體成分', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '味噌湯底',
          confidence: 0.9,
          estimatedPortion: 100,
          category: ComponentCategory.SAUCE,
          knowledgeBaseMatch: true
        },
        {
          id: '2',
          name: '豆腐',
          confidence: 0.85,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          knowledgeBaseMatch: true
        },
        {
          id: '3',
          name: '海帶芽',
          confidence: 0.8,
          estimatedPortion: 10,
          category: ComponentCategory.VEGETABLE,
          knowledgeBaseMatch: true
        }
      ];

      // 使用反射訪問私有方法進行測試
      const adjustedComponents = (engine as any).adjustSoupComponentPortions(
        components,
        250 // 典型味噌湯份量
      );

      // 檢查液體成分（湯底）份量應該較大
      const broth = adjustedComponents.find((c: any) => c.name === '味噌湯底');
      expect(broth).toBeDefined();
      expect(broth.estimatedPortion).toBeGreaterThan(150); // 應該佔 60%+ 

      // 檢查固體成分份量合理
      const tofu = adjustedComponents.find((c: any) => c.name === '豆腐');
      expect(tofu).toBeDefined();
      expect(tofu.estimatedPortion).toBeGreaterThan(0);
      expect(tofu.estimatedPortion).toBeLessThan(100);

      // 檢查成分類型標記
      expect((broth as any).componentType).toBe('liquid');
      expect((tofu as any).componentType).toBe('solid');
    });

    it('應該保持液體和固體的合理比例', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '雞湯',
          confidence: 0.9,
          estimatedPortion: 50,
          category: ComponentCategory.SAUCE,
          knowledgeBaseMatch: true
        },
        {
          id: '2',
          name: '雞蛋',
          confidence: 0.85,
          estimatedPortion: 200, // 故意設置過大
          category: ComponentCategory.PROTEIN,
          knowledgeBaseMatch: true
        }
      ];

      const adjustedComponents = (engine as any).adjustSoupComponentPortions(
        components,
        300
      );

      const totalLiquid = adjustedComponents
        .filter((c: any) => (c as any).componentType === 'liquid')
        .reduce((sum: number, c: any) => sum + c.estimatedPortion, 0);

      const totalSolid = adjustedComponents
        .filter((c: any) => (c as any).componentType === 'solid')
        .reduce((sum: number, c: any) => sum + c.estimatedPortion, 0);

      // 液體應該佔大部分（60-85%）
      const liquidRatio = totalLiquid / (totalLiquid + totalSolid);
      expect(liquidRatio).toBeGreaterThan(0.6);
      expect(liquidRatio).toBeLessThan(0.9);
    });
  });

  describe('湯品成分驗證', () => {
    it('應該警告缺少湯底的情況', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '豆腐',
          confidence: 0.85,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          knowledgeBaseMatch: true
        }
      ];

      const warnings = (engine as any).validateSoupComponents(components);
      
      expect(warnings).toContain('湯品中未檢測到湯底，可能識別不完整');
    });

    it('應該警告液體份量過少的情況', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '高湯',
          confidence: 0.9,
          estimatedPortion: 50,
          category: ComponentCategory.SAUCE,
          knowledgeBaseMatch: true,
          componentType: 'liquid'
        } as any,
        {
          id: '2',
          name: '豆腐',
          confidence: 0.85,
          estimatedPortion: 200,
          category: ComponentCategory.PROTEIN,
          knowledgeBaseMatch: true,
          componentType: 'solid'
        } as any
      ];

      const warnings = (engine as any).validateSoupComponents(components);
      
      expect(warnings.some((w: string) => w.includes('湯底份量似乎過少'))).toBe(true);
    });

    it('應該警告配料過少的情況', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '清湯',
          confidence: 0.9,
          estimatedPortion: 280,
          category: ComponentCategory.SAUCE,
          knowledgeBaseMatch: true,
          componentType: 'liquid'
        } as any,
        {
          id: '2',
          name: '青蔥',
          confidence: 0.8,
          estimatedPortion: 5,
          category: ComponentCategory.GARNISH,
          knowledgeBaseMatch: true,
          componentType: 'solid'
        } as any
      ];

      const warnings = (engine as any).validateSoupComponents(components);
      
      expect(warnings.some((w: string) => w.includes('配料份量似乎過少'))).toBe(true);
    });
  });

  describe('湯品專用建議', () => {
    it('應該為味噌湯提供特定建議', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '味噌',
          confidence: 0.9,
          estimatedPortion: 15,
          category: ComponentCategory.SEASONING,
          knowledgeBaseMatch: true
        }
      ];

      const suggestions = (engine as any).generateSoupSpecificSuggestions(
        components,
        '味噌湯'
      );

      expect(suggestions).toContain('味噌湯通常包含豆腐，您可能需要添加');
      expect(suggestions).toContain('味噌湯通常包含海帶芽，您可能需要添加');
    });

    it('應該為蛋花湯提供特定建議', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '雞湯',
          confidence: 0.9,
          estimatedPortion: 250,
          category: ComponentCategory.SAUCE,
          knowledgeBaseMatch: true
        }
      ];

      const suggestions = (engine as any).generateSoupSpecificSuggestions(
        components,
        '蛋花湯'
      );

      expect(suggestions).toContain('蛋花湯的主要成分是雞蛋，請確認是否遺漏');
    });

    it('應該為貢丸湯提供特定建議', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '清湯',
          confidence: 0.9,
          estimatedPortion: 250,
          category: ComponentCategory.SAUCE,
          knowledgeBaseMatch: true
        }
      ];

      const suggestions = (engine as any).generateSoupSpecificSuggestions(
        components,
        '貢丸湯'
      );

      expect(suggestions).toContain('貢丸湯的主要成分是貢丸，請確認是否遺漏');
    });

    it('應該為酸辣湯提供特定建議', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '酸辣湯底',
          confidence: 0.9,
          estimatedPortion: 250,
          category: ComponentCategory.SAUCE,
          knowledgeBaseMatch: true
        }
      ];

      const suggestions = (engine as any).generateSoupSpecificSuggestions(
        components,
        '酸辣湯'
      );

      expect(suggestions.some((s: string) => s.includes('豆腐'))).toBe(true);
      expect(suggestions.some((s: string) => s.includes('木耳') || s.includes('菇'))).toBe(true);
    });

    it('應該建議添加湯底成分', () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '豆腐',
          confidence: 0.85,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          knowledgeBaseMatch: true
        }
      ];

      const suggestions = (engine as any).generateSoupSpecificSuggestions(
        components,
        '味噌湯'
      );

      expect(suggestions).toContain('建議添加湯底成分（如高湯、清湯等）');
    });
  });

  describe('知識庫映射', () => {
    it('應該正確載入味噌湯的成分映射', () => {
      const { findDishComponentMap } = require('../../data/dishComponentMaps');
      const misoSoupMap = findDishComponentMap('味噌湯');

      expect(misoSoupMap).toBeDefined();
      expect(misoSoupMap.dishType).toBe(DishType.SOUP);
      expect(misoSoupMap.commonComponents.length).toBeGreaterThan(0);
      
      // 檢查常見成分
      const componentNames = misoSoupMap.commonComponents.map((c: any) => c.name);
      expect(componentNames).toContain('味噌');
      expect(componentNames).toContain('豆腐');
      expect(componentNames).toContain('海帶芽');
    });

    it('應該正確載入蛋花湯的成分映射', () => {
      const { findDishComponentMap } = require('../../data/dishComponentMaps');
      const eggSoupMap = findDishComponentMap('蛋花湯');

      expect(eggSoupMap).toBeDefined();
      expect(eggSoupMap.dishType).toBe(DishType.SOUP);
      
      const componentNames = eggSoupMap.commonComponents.map((c: any) => c.name);
      expect(componentNames).toContain('雞蛋');
      expect(componentNames).toContain('雞湯');
    });

    it('應該正確載入貢丸湯的成分映射', () => {
      const { findDishComponentMap } = require('../../data/dishComponentMaps');
      const meatballSoupMap = findDishComponentMap('貢丸湯');

      expect(meatballSoupMap).toBeDefined();
      expect(meatballSoupMap.dishType).toBe(DishType.SOUP);
      
      const componentNames = meatballSoupMap.commonComponents.map((c: any) => c.name);
      expect(componentNames).toContain('貢丸');
      expect(componentNames).toContain('清湯');
    });

    it('應該正確載入酸辣湯的成分映射', () => {
      const { findDishComponentMap } = require('../../data/dishComponentMaps');
      const hotSourSoupMap = findDishComponentMap('酸辣湯');

      expect(hotSourSoupMap).toBeDefined();
      expect(hotSourSoupMap.dishType).toBe(DishType.SOUP);
      
      const componentNames = hotSourSoupMap.commonComponents.map((c: any) => c.name);
      expect(componentNames).toContain('豆腐');
      expect(componentNames).toContain('木耳');
      expect(componentNames).toContain('筍絲');
      expect(componentNames).toContain('雞蛋');
    });
  });

  describe('湯品份量範圍', () => {
    it('味噌湯的份量範圍應該合理', () => {
      const { findDishComponentMap } = require('../../data/dishComponentMaps');
      const misoSoupMap = findDishComponentMap('味噌湯');

      expect(misoSoupMap.typicalPortionRange.typical).toBeGreaterThan(200);
      expect(misoSoupMap.typicalPortionRange.typical).toBeLessThan(400);
      expect(misoSoupMap.typicalPortionRange.min).toBeLessThan(misoSoupMap.typicalPortionRange.typical);
      expect(misoSoupMap.typicalPortionRange.max).toBeGreaterThan(misoSoupMap.typicalPortionRange.typical);
    });

    it('所有湯品的液體成分份量應該大於固體成分', () => {
      const { DISH_COMPONENT_MAPS } = require('../../data/dishComponentMaps');
      const soupMaps = DISH_COMPONENT_MAPS.filter((m: any) => m.dishType === DishType.SOUP);

      for (const soupMap of soupMaps) {
        const liquidComponents = soupMap.commonComponents.filter((c: any) => 
          c.category === ComponentCategory.SAUCE ||
          c.name.includes('湯') ||
          c.name.includes('高湯')
        );

        const solidComponents = soupMap.commonComponents.filter((c: any) => 
          c.category !== ComponentCategory.SAUCE &&
          !c.name.includes('湯') &&
          !c.name.includes('高湯')
        );

        if (liquidComponents.length > 0 && solidComponents.length > 0) {
          const totalLiquid = liquidComponents.reduce((sum: number, c: any) => 
            sum + c.typicalPortion, 0
          );
          const totalSolid = solidComponents.reduce((sum: number, c: any) => 
            sum + c.typicalPortion, 0
          );

          expect(totalLiquid).toBeGreaterThan(totalSolid);
        }
      }
    });
  });
});
