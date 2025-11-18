/**
 * 測試亞洲料理通用模板的修復
 * 驗證 prompt 是否包含新的結構元素並移除了限制性語句
 */

import { EnhancedPromptGenerator, PromptTemplateType } from '../EnhancedPromptGenerator';

describe('EnhancedPromptGenerator - Asian Cuisine Template Fix', () => {
  let generator: EnhancedPromptGenerator;

  beforeEach(() => {
    generator = new EnhancedPromptGenerator('zh-TW');
  });

  describe('createAsianCuisineTemplate - 中文版本', () => {
    it('應該包含核心任務說明', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('核心任務');
      expect(template).toContain('首要任務');
      expect(template).toContain('識別並列出所有可見的食材');
    });

    it('應該包含識別步驟', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('識別步驟');
      expect(template).toContain('步驟 1：仔細觀察圖片');
      expect(template).toContain('步驟 2：識別每一種食材');
      expect(template).toContain('步驟 3：估算份量');
      expect(template).toContain('步驟 4：撰寫描述');
    });

    it('應該包含完整性檢查清單', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('完整性檢查清單');
      expect(template).toContain('已識別所有可見的主要食材');
      expect(template).toContain('已識別所有可見的配菜');
      expect(template).toContain('已識別所有可見的小配料');
    });

    it('應該移除限制性語句', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      // 不應該包含舊的限制性語句
      expect(template).not.toContain('foods 列表必須包含 description 中提到的食材');
      expect(template).not.toContain('如果你在 description 或 overallDescription 中提到了某個食材，那麼該食材也必須出現在 foods 列表中');
    });

    it('應該強調 foods 列表的獨立性', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('foods 列表是獨立的結構化數據');
      expect(template).toContain('即使某個食材在 description 中未提及，只要在圖片中可見，就必須加入 foods 列表');
      expect(template).toContain('description 不應限制或影響 foods 列表的內容');
    });

    it('應該包含範例說明', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('範例');
      expect(template).toContain('涼拌干絲');
      expect(template).toContain('味噌湯');
      expect(template).toContain('不要只回應');
      expect(template).toContain('必須列出所有可見的食材');
    });

    it('應該將食材識別放在最前面', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      const coreTaskIndex = template.indexOf('核心任務');
      const jsonFormatIndex = template.indexOf('JSON 格式');
      
      // 核心任務應該在 JSON 格式說明之前
      expect(coreTaskIndex).toBeLessThan(jsonFormatIndex);
      expect(coreTaskIndex).toBeGreaterThan(0);
    });

    it('應該包含份量估算參考標準', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('份量估算');
      expect(template).toContain('豆腐：每塊約 30-50g');
      expect(template).toContain('蔬菜絲：每份約 20-30g');
      expect(template).toContain('蔥花、香菜：約 5-10g');
    });
  });

  describe('createAsianCuisineTemplate - 英文版本', () => {
    beforeEach(() => {
      generator = new EnhancedPromptGenerator('en');
    });

    it('應該包含核心任務說明', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('Core Task');
      expect(template).toContain('primary task');
      expect(template).toContain('identify and list ALL visible ingredients');
    });

    it('應該包含識別步驟', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('Identification Steps');
      expect(template).toContain('Step 1: Carefully Observe the Image');
      expect(template).toContain('Step 2: Identify Every Ingredient');
      expect(template).toContain('Step 3: Estimate Portions');
      expect(template).toContain('Step 4: Write Description');
    });

    it('應該包含完整性檢查清單', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('Completeness Checklist');
      expect(template).toContain('Identified all visible main ingredients');
      expect(template).toContain('Identified all visible side dishes');
    });

    it('應該強調 foods 列表的獨立性', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      expect(template).toContain('The foods list is independent structured data');
      expect(template).toContain('Even if an ingredient is not mentioned in the description');
      expect(template).toContain('Description should not limit or affect the content of the foods list');
    });
  });

  describe('generatePrompt - 整合測試', () => {
    it('應該能夠生成包含新結構的 prompt', () => {
      const prompt = generator.generatePrompt({});
      
      // 應該使用亞洲料理模板（預設）
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('識別步驟');
      expect(prompt).toContain('完整性檢查清單');
    });

    it('應該在重試時使用增強模板', () => {
      const prompt = generator.generatePrompt({
        previousAttempts: 1
      });
      
      // 第二次嘗試應該使用亞洲料理模板
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('識別步驟');
    });
  });
});
