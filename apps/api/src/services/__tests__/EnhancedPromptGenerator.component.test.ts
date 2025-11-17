/**
 * EnhancedPromptGenerator 成分識別功能測試
 */

import { EnhancedPromptGenerator } from '../EnhancedPromptGenerator';
import { DishType } from '../../types/ComponentDetection';

describe('EnhancedPromptGenerator - Component Detection', () => {
  let generator: EnhancedPromptGenerator;

  beforeEach(() => {
    generator = new EnhancedPromptGenerator('zh-TW');
  });

  describe('generateComponentDetectionPrompt', () => {
    it('應該為湯品生成成分識別 prompt', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '味噌湯',
        DishType.SOUP
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('湯品');
      expect(prompt).toContain('配料');
      expect(prompt).toContain('通用識別指導');
    });

    it('應該為炒飯生成成分識別 prompt', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '蛋炒飯',
        DishType.FRIED_RICE
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('炒飯');
      expect(prompt).toContain('米飯');
      expect(prompt).toContain('通用識別指導');
    });

    it('應該為便當生成成分識別 prompt', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '台式便當',
        DishType.BENTO
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('便當');
      expect(prompt).toContain('主食區');
      expect(prompt).toContain('通用識別指導');
    });

    it('應該為麵食生成成分識別 prompt', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '拉麵',
        DishType.NOODLES
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('麵食');
      expect(prompt).toContain('麵條');
      expect(prompt).toContain('通用識別指導');
    });

    it('應該為未知類型生成通用成分識別 prompt', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '宮保雞丁',
        DishType.UNKNOWN
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('宮保雞丁');
      expect(prompt).toContain('成分');
      expect(prompt).toContain('通用識別指導');
    });

    it('應該支持添加地區背景知識', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '牛肉湯',
        DishType.SOUP,
        '台南'
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('台南');
    });

    it('應該在英文模式下生成英文 prompt', () => {
      const enGenerator = new EnhancedPromptGenerator('en');
      const prompt = enGenerator.generateComponentDetectionPrompt(
        'Miso Soup',
        DishType.SOUP
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('soup');
      expect(prompt).toContain('ingredients');
      expect(prompt).toContain('General Recognition Guidance');
    });
  });

  describe('generateComponentRefinementPrompt', () => {
    it('應該生成成分精煉 prompt', () => {
      const initialComponents = [
        { name: '豆腐', confidence: 0.95, estimatedPortion: 50 },
        { name: '海帶', confidence: 0.65, estimatedPortion: 20 },
        { name: '蔥花', confidence: 0.80, estimatedPortion: 5 }
      ];

      const prompt = generator.generateComponentRefinementPrompt(
        initialComponents,
        '味噌湯'
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('豆腐');
      expect(prompt).toContain('海帶');
      expect(prompt).toContain('蔥花');
      expect(prompt).toContain('味噌湯');
      expect(prompt).toContain('信心度');
    });

    it('應該列出所有初步識別的成分', () => {
      const initialComponents = [
        { name: '豆腐', confidence: 0.95, estimatedPortion: 50 },
        { name: '海帶', confidence: 0.70, estimatedPortion: 20 }
      ];

      const prompt = generator.generateComponentRefinementPrompt(
        initialComponents,
        '味噌湯'
      );

      expect(prompt).toContain('95%');
      expect(prompt).toContain('70%');
      expect(prompt).toContain('50g');
      expect(prompt).toContain('20g');
    });

    it('應該提供精煉指導', () => {
      const initialComponents = [
        { name: '豆腐', confidence: 0.95, estimatedPortion: 50 }
      ];

      const prompt = generator.generateComponentRefinementPrompt(
        initialComponents,
        '味噌湯'
      );

      expect(prompt).toContain('重新檢查');
      expect(prompt).toContain('確認');
      expect(prompt).toContain('遺漏');
    });

    it('應該在英文模式下生成英文精煉 prompt', () => {
      const enGenerator = new EnhancedPromptGenerator('en');
      const initialComponents = [
        { name: 'tofu', confidence: 0.95, estimatedPortion: 50 },
        { name: 'kelp', confidence: 0.65, estimatedPortion: 20 }
      ];

      const prompt = enGenerator.generateComponentRefinementPrompt(
        initialComponents,
        'miso soup'
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('tofu');
      expect(prompt).toContain('kelp');
      expect(prompt).toContain('miso soup');
      expect(prompt).toContain('confidence');
    });

    it('應該處理空成分列表', () => {
      const prompt = generator.generateComponentRefinementPrompt(
        [],
        '味噌湯'
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('味噌湯');
    });

    it('應該處理單個成分', () => {
      const initialComponents = [
        { name: '豆腐', confidence: 0.95, estimatedPortion: 50 }
      ];

      const prompt = generator.generateComponentRefinementPrompt(
        initialComponents,
        '味噌湯'
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain('豆腐');
      expect(prompt).toContain('95%');
    });
  });

  describe('Prompt 質量檢查', () => {
    it('所有成分識別 prompt 都應該包含必要的指導', () => {
      const dishTypes = [
        DishType.SOUP,
        DishType.FRIED_RICE,
        DishType.BENTO,
        DishType.NOODLES,
        DishType.STIR_FRY,
        DishType.UNKNOWN
      ];

      dishTypes.forEach(dishType => {
        const prompt = generator.generateComponentDetectionPrompt(
          '測試料理',
          dishType
        );

        expect(prompt).toContain('JSON');
        expect(prompt).toContain('components');
        expect(prompt).toContain('通用識別指導');
      });
    });

    it('prompt 應該包含份量估算指導', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '味噌湯',
        DishType.SOUP
      );

      expect(prompt).toContain('份量');
      expect(prompt).toContain('估');
    });

    it('prompt 應該包含視覺特徵指導', () => {
      const prompt = generator.generateComponentDetectionPrompt(
        '味噌湯',
        DishType.SOUP
      );

      expect(prompt).toContain('顏色');
      expect(prompt).toContain('形狀');
      expect(prompt).toContain('質地');
    });
  });

  describe('語言支持', () => {
    it('應該支持中文模式', () => {
      const zhGenerator = new EnhancedPromptGenerator('zh-TW');
      const prompt = zhGenerator.generateComponentDetectionPrompt(
        '味噌湯',
        DishType.SOUP
      );

      expect(prompt).toContain('湯品');
      expect(prompt).toContain('配料');
    });

    it('應該支持英文模式', () => {
      const enGenerator = new EnhancedPromptGenerator('en');
      const prompt = enGenerator.generateComponentDetectionPrompt(
        'Miso Soup',
        DishType.SOUP
      );

      expect(prompt).toContain('soup');
      expect(prompt).toContain('ingredients');
    });
  });
});
