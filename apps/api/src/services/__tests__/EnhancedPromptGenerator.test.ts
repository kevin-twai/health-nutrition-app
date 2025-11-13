/**
 * EnhancedPromptGenerator 測試
 */

import { EnhancedPromptGenerator, PromptTemplateType } from '../EnhancedPromptGenerator';
import { CuisineType, FoodCategory } from '../../types/AsianCuisineKnowledgeBase';

describe('EnhancedPromptGenerator', () => {
  let generator: EnhancedPromptGenerator;

  beforeEach(() => {
    generator = new EnhancedPromptGenerator('zh-TW');
  });

  describe('基礎功能', () => {
    it('應該能創建生成器實例', () => {
      expect(generator).toBeDefined();
    });

    it('應該能生成標準 prompt', () => {
      const prompt = generator.generatePrompt();
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('營養分析助手');
    });

    it('應該能獲取所有可用的模板類型', () => {
      const types = generator.getAvailableTemplateTypes();
      expect(types).toBeDefined();
      expect(types.length).toBeGreaterThan(0);
      expect(types).toContain(PromptTemplateType.STANDARD);
      expect(types).toContain(PromptTemplateType.ASIAN_CUISINE);
    });
  });

  describe('亞洲料理專用 Prompt', () => {
    it('應該能生成中式料理 prompt', () => {
      const prompt = generator.generateChinesePrompt();
      expect(prompt).toContain('中式料理');
      expect(prompt).toContain('烹飪方式');
      expect(prompt).toContain('豆製品');
    });

    it('應該能生成台式料理 prompt', () => {
      const prompt = generator.generateTaiwanesePrompt();
      expect(prompt).toContain('台式料理');
      expect(prompt).toContain('豆腐干絲');
      expect(prompt).toContain('糯米椒');
      expect(prompt).toContain('原住民');
    });

    it('應該能生成日式料理 prompt', () => {
      const prompt = generator.generateJapanesePrompt();
      expect(prompt).toContain('日式料理');
      expect(prompt).toContain('壽司');
      expect(prompt).toContain('刺身');
    });

    it('應該能生成韓式料理 prompt', () => {
      const prompt = generator.generateKoreanPrompt();
      expect(prompt).toContain('韓式料理');
      expect(prompt).toContain('泡菜');
      expect(prompt).toContain('辣椒醬');
    });
  });

  describe('食材類別專用 Prompt', () => {
    it('應該能生成豆製品識別 prompt', () => {
      const prompt = generator.generateBeanProductPrompt();
      expect(prompt).toContain('豆製品');
      expect(prompt).toContain('豆腐干絲');
      expect(prompt).toContain('麵條');
      expect(prompt).toContain('區分');
    });

    it('應該能生成麵食類識別 prompt', () => {
      const prompt = generator.generateNoodleTypePrompt();
      expect(prompt).toContain('麵食');
      expect(prompt).toContain('米粉');
      expect(prompt).toContain('粉絲');
      expect(prompt).toContain('透明度');
    });

    it('應該能生成蔬菜類識別 prompt', () => {
      const prompt = generator.generateVegetablePrompt();
      expect(prompt).toContain('蔬菜');
      expect(prompt).toContain('玉米筍');
      expect(prompt).toContain('糯米椒');
      expect(prompt).toContain('青椒');
    });

    it('應該能生成原住民食材 prompt', () => {
      const prompt = generator.generateIndigenousFoodPrompt();
      expect(prompt).toContain('原住民');
      expect(prompt).toContain('馬告');
      expect(prompt).toContain('刺蔥');
      expect(prompt).toContain('小米');
    });
  });

  describe('菜餚類型專用 Prompt', () => {
    it('應該能生成涼拌菜 prompt', () => {
      const prompt = generator.generateColdDishPrompt();
      expect(prompt).toContain('涼拌菜');
      expect(prompt).toContain('豆腐干絲');
      expect(prompt).toContain('芹菜');
      expect(prompt).toContain('麻油');
    });

    it('應該能生成熱炒 prompt', () => {
      const prompt = generator.generateStirFryPrompt();
      expect(prompt).toContain('熱炒');
      expect(prompt).toContain('蒜片');
      expect(prompt).toContain('鍋氣');
    });

    it('應該能生成湯品 prompt', () => {
      const prompt = generator.generateSoupPrompt();
      expect(prompt).toContain('湯品');
      expect(prompt).toContain('清湯');
      expect(prompt).toContain('濃湯');
    });

    it('應該能生成混合菜餚 prompt', () => {
      const prompt = generator.generateMixedDishPrompt();
      expect(prompt).toContain('混合菜餚');
      expect(prompt).toContain('多種食材');
    });
  });

  describe('Prompt 增強功能', () => {
    it('應該能添加易混淆食材警告', () => {
      const basePrompt = '基礎 prompt';
      const confusedPairs = [['豆腐干絲', '麵條'], ['米粉', '粉絲']];
      const enhanced = generator.addConfusionWarnings(basePrompt, confusedPairs);
      
      expect(enhanced).toContain('易混淆');
      expect(enhanced).toContain('豆腐干絲');
      expect(enhanced).toContain('麵條');
      expect(enhanced).toContain('米粉');
      expect(enhanced).toContain('粉絲');
    });

    it('應該能添加地方特色背景知識', () => {
      const basePrompt = '基礎 prompt';
      const enhanced = generator.addRegionalContext(basePrompt, '台南');
      
      expect(enhanced).toContain('台南');
      expect(enhanced).toContain('牛肉湯');
    });

    it('應該能添加季節性食材提示', () => {
      const basePrompt = '基礎 prompt';
      const enhanced = generator.addSeasonalContext(basePrompt, '春');
      
      expect(enhanced).toContain('春季');
      expect(enhanced).toContain('竹筍');
    });

    it('應該能組合多個增強功能', () => {
      const basePrompt = '基礎 prompt';
      const enhanced = generator.enhancePromptWithContext(basePrompt, {
        confusedPairs: [['豆腐干絲', '麵條']],
        region: '台南',
        season: '春'
      });
      
      expect(enhanced).toContain('易混淆');
      expect(enhanced).toContain('台南');
      expect(enhanced).toContain('春季');
    });
  });

  describe('動態 Prompt 生成', () => {
    it('應該根據料理類型選擇適當的模板', () => {
      const prompt = generator.generatePrompt({
        detectedCuisineType: CuisineType.TAIWANESE
      });
      
      expect(prompt).toContain('台式');
    });

    it('應該根據食材類別選擇適當的模板', () => {
      const prompt = generator.generatePrompt({
        suspectedFoodCategories: [FoodCategory.BEAN_PRODUCTS]
      });
      
      expect(prompt).toContain('豆製品');
    });

    it('應該在重試時使用增強模板', () => {
      const prompt = generator.generatePrompt({
        previousAttempts: 1
      });
      
      expect(prompt).toContain('亞洲料理');
    });

    it('應該能添加用戶反饋學習', () => {
      const prompt = generator.generatePrompt({
        userFeedback: [
          { incorrectFood: '麵條', correctFood: '豆腐干絲' }
        ]
      });
      
      expect(prompt).toContain('麵條');
      expect(prompt).toContain('豆腐干絲');
    });
  });

  describe('智能 Prompt 生成', () => {
    it('應該能生成智能 prompt', () => {
      const prompt = generator.generateSmartPrompt({
        detectedCuisineType: CuisineType.TAIWANESE,
        confusedPairs: [['豆腐干絲', '麵條']],
        region: '台南'
      });
      
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('台式');
      expect(prompt).toContain('易混淆');
      expect(prompt).toContain('台南');
    });
  });

  describe('英文模板', () => {
    it('應該能生成英文 prompt', () => {
      const enGenerator = new EnhancedPromptGenerator('en');
      const prompt = enGenerator.generatePrompt();
      
      expect(prompt).toContain('nutrition');
      expect(prompt).toContain('food');
    });

    it('應該能生成英文台式料理 prompt', () => {
      const enGenerator = new EnhancedPromptGenerator('en');
      const prompt = enGenerator.generateTaiwanesePrompt();
      
      expect(prompt).toContain('Taiwanese');
      expect(prompt).toContain('dried tofu strips');
    });
  });
});
