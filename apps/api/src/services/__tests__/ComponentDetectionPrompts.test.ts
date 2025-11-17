/**
 * 成分識別 Prompt 測試
 */

import {
  generateSoupComponentPrompt,
  generateFriedRiceComponentPrompt,
  generateBentoComponentPrompt,
  generateNoodlesComponentPrompt,
  generateGenericComponentPrompt,
  generateComponentRefinementPrompt
} from '../ComponentDetectionPrompts';

describe('ComponentDetectionPrompts', () => {
  describe('generateSoupComponentPrompt', () => {
    it('應該生成中文湯品成分識別 prompt', () => {
      const prompt = generateSoupComponentPrompt('zh-TW');
      
      expect(prompt).toContain('湯品');
      expect(prompt).toContain('配料');
      expect(prompt).toContain('豆腐');
      expect(prompt).toContain('份量');
      expect(prompt).toContain('JSON');
    });

    it('應該生成英文湯品成分識別 prompt', () => {
      const prompt = generateSoupComponentPrompt('en');
      
      expect(prompt).toContain('soup');
      expect(prompt).toContain('ingredients');
      expect(prompt.toLowerCase()).toContain('protein');
      expect(prompt).toContain('portion');
      expect(prompt).toContain('JSON');
    });
  });

  describe('generateFriedRiceComponentPrompt', () => {
    it('應該生成中文炒飯成分識別 prompt', () => {
      const prompt = generateFriedRiceComponentPrompt('zh-TW');
      
      expect(prompt).toContain('炒飯');
      expect(prompt).toContain('米飯');
      expect(prompt).toContain('蛋白質');
      expect(prompt).toContain('蔬菜');
    });

    it('應該生成英文炒飯成分識別 prompt', () => {
      const prompt = generateFriedRiceComponentPrompt('en');
      
      expect(prompt).toContain('fried rice');
      expect(prompt).toContain('rice');
      expect(prompt).toContain('protein');
      expect(prompt).toContain('vegetables');
    });
  });

  describe('generateBentoComponentPrompt', () => {
    it('應該生成中文便當成分識別 prompt', () => {
      const prompt = generateBentoComponentPrompt('zh-TW');
      
      expect(prompt).toContain('便當');
      expect(prompt).toContain('主食區');
      expect(prompt).toContain('主菜區');
      expect(prompt).toContain('配菜區');
    });

    it('應該生成英文便當成分識別 prompt', () => {
      const prompt = generateBentoComponentPrompt('en');
      
      expect(prompt).toContain('bento');
      expect(prompt).toContain('staple');
      expect(prompt).toContain('main dish');
      expect(prompt).toContain('side dish');
    });
  });

  describe('generateNoodlesComponentPrompt', () => {
    it('應該生成中文麵食成分識別 prompt', () => {
      const prompt = generateNoodlesComponentPrompt('zh-TW');
      
      expect(prompt).toContain('麵食');
      expect(prompt).toContain('麵條');
      expect(prompt).toContain('湯底');
      expect(prompt).toContain('配料');
    });

    it('應該生成英文麵食成分識別 prompt', () => {
      const prompt = generateNoodlesComponentPrompt('en');
      
      expect(prompt).toContain('noodle');
      expect(prompt.toLowerCase()).toContain('soup');
      expect(prompt.toLowerCase()).toContain('topping');
    });
  });

  describe('generateGenericComponentPrompt', () => {
    it('應該生成中文通用成分識別 prompt', () => {
      const prompt = generateGenericComponentPrompt('宮保雞丁', 'zh-TW');
      
      expect(prompt).toContain('宮保雞丁');
      expect(prompt).toContain('成分');
      expect(prompt).toContain('主要成分');
      expect(prompt).toContain('份量');
    });

    it('應該生成英文通用成分識別 prompt', () => {
      const prompt = generateGenericComponentPrompt('Kung Pao Chicken', 'en');
      
      expect(prompt).toContain('Kung Pao Chicken');
      expect(prompt).toContain('components');
      expect(prompt).toContain('main components');
      expect(prompt).toContain('portion');
    });
  });

  describe('generateComponentRefinementPrompt', () => {
    it('應該生成中文成分精煉 prompt', () => {
      const initialComponents = [
        { name: '豆腐', confidence: 0.95, estimatedPortion: 50 },
        { name: '海帶', confidence: 0.65, estimatedPortion: 20 },
        { name: '蔥花', confidence: 0.80, estimatedPortion: 5 }
      ];

      const prompt = generateComponentRefinementPrompt({
        initialComponents,
        dishContext: '味噌湯',
        language: 'zh-TW'
      });

      expect(prompt).toContain('豆腐');
      expect(prompt).toContain('海帶');
      expect(prompt).toContain('蔥花');
      expect(prompt).toContain('味噌湯');
      expect(prompt).toContain('信心度');
      expect(prompt).toContain('65%');
    });

    it('應該生成英文成分精煉 prompt', () => {
      const initialComponents = [
        { name: 'tofu', confidence: 0.95, estimatedPortion: 50 },
        { name: 'kelp', confidence: 0.65, estimatedPortion: 20 }
      ];

      const prompt = generateComponentRefinementPrompt({
        initialComponents,
        dishContext: 'miso soup',
        language: 'en'
      });

      expect(prompt).toContain('tofu');
      expect(prompt).toContain('kelp');
      expect(prompt).toContain('miso soup');
      expect(prompt).toContain('confidence');
      expect(prompt).toContain('65%');
    });

    it('應該標記低信心度成分', () => {
      const initialComponents = [
        { name: '豆腐', confidence: 0.95, estimatedPortion: 50 },
        { name: '海帶', confidence: 0.60, estimatedPortion: 20 }
      ];

      const prompt = generateComponentRefinementPrompt({
        initialComponents,
        dishContext: '味噌湯',
        language: 'zh-TW'
      });

      expect(prompt).toContain('70%');
      expect(prompt).toContain('特別');
    });
  });

  describe('Prompt 內容完整性', () => {
    it('所有 prompt 都應該包含 JSON 格式要求', () => {
      const prompts = [
        generateSoupComponentPrompt('zh-TW'),
        generateFriedRiceComponentPrompt('zh-TW'),
        generateBentoComponentPrompt('zh-TW'),
        generateNoodlesComponentPrompt('zh-TW'),
        generateGenericComponentPrompt('測試料理', 'zh-TW')
      ];

      prompts.forEach(prompt => {
        expect(prompt).toContain('JSON');
        expect(prompt).toContain('components');
      });
    });

    it('所有 prompt 都應該包含份量估算指導', () => {
      const prompts = [
        generateSoupComponentPrompt('zh-TW'),
        generateFriedRiceComponentPrompt('zh-TW'),
        generateBentoComponentPrompt('zh-TW'),
        generateNoodlesComponentPrompt('zh-TW')
      ];

      prompts.forEach(prompt => {
        expect(prompt).toContain('份量');
        expect(prompt).toContain('估');
      });
    });

    it('所有 prompt 都應該包含特別注意事項', () => {
      const prompts = [
        generateSoupComponentPrompt('zh-TW'),
        generateFriedRiceComponentPrompt('zh-TW'),
        generateBentoComponentPrompt('zh-TW'),
        generateNoodlesComponentPrompt('zh-TW')
      ];

      prompts.forEach(prompt => {
        expect(prompt).toContain('特別注意');
      });
    });
  });
});
