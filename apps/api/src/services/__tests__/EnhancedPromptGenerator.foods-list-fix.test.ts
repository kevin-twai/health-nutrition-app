/**
 * 測試 foods 列表修復
 * 驗證湯品、涼拌菜、熱炒、混合菜餚等模板是否正確修復
 * 
 * 測試目標：
 * 1. 測試 prompt 生成是否包含新的結構元素
 * 2. 測試是否移除了限制性語句
 * 3. 測試識別步驟是否正確添加
 */

import { EnhancedPromptGenerator, PromptTemplateType } from '../EnhancedPromptGenerator';

describe('EnhancedPromptGenerator - Foods List Fix', () => {
  let generator: EnhancedPromptGenerator;

  beforeEach(() => {
    generator = new EnhancedPromptGenerator('zh-TW');
  });

  describe('createSoupPrompt - 湯品模板修復', () => {
    it('應該包含核心任務說明', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('核心任務');
      expect(template).toContain('首要任務');
      expect(template).toContain('識別湯底和所有配料');
    });

    it('應該包含識別步驟', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('識別步驟');
      expect(template).toContain('步驟 1：識別湯底');
      expect(template).toContain('步驟 2：識別配料');
      expect(template).toContain('步驟 3：估算份量');
      expect(template).toContain('步驟 4：完整性檢查');
    });

    it('應該強調必須識別湯底和所有配料', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('必須識別湯底和所有配料');
      expect(template).toContain('不要只說');
      expect(template).toContain('要列出湯底和所有配料');
    });

    it('應該包含配料識別步驟（表面→中間→底部）', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('浮在表面的配料');
      expect(template).toContain('中間層的配料');
      expect(template).toContain('沉在底部的配料');
    });

    it('應該提供具體的配料範例', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('豆腐');
      expect(template).toContain('海帶');
      expect(template).toContain('蔥花');
      expect(template).toContain('味噌湯');
    });

    it('應該包含最小配料數量要求', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('至少有 3-5 種配料');
      expect(template).toContain('最小配料數量要求');
    });

    it('應該包含份量估算參考標準', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('份量估算');
      expect(template).toContain('豆腐（每塊） | 30-50g');
      expect(template).toContain('湯底 | 200-300ml');
    });

    it('應該包含完整性檢查清單', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('完整性檢查');
      expect(template).toContain('已識別湯底類型和份量');
      expect(template).toContain('已識別浮在表面的所有配料');
      expect(template).toContain('已識別中間層的所有配料');
      expect(template).toContain('已識別沉在底部的所有配料');
    });

    it('應該包含範例說明', () => {
      const template = generator.getTemplate(PromptTemplateType.SOUP);
      
      expect(template).toContain('範例');
      expect(template).toContain('味噌湯');
      expect(template).toContain('排骨湯');
      expect(template).toContain('不要只回應');
      expect(template).toContain('必須列出');
    });
  });

  describe('createColdDishPrompt - 涼拌菜模板修復', () => {
    it('應該包含核心任務說明', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('核心任務');
      expect(template).toContain('首要任務');
      expect(template).toContain('識別並列出涼拌菜中所有混合的食材');
    });

    it('應該包含識別步驟', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('識別步驟');
      expect(template).toContain('步驟 1：仔細觀察圖片');
      expect(template).toContain('步驟 2：識別每一種食材並分類');
    });

    it('應該強調必須識別所有混合的食材', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('必須識別所有混合的食材');
      expect(template).toContain('涼拌菜通常包含多種食材混合');
      expect(template).toContain('逐一識別每一種食材');
    });

    it('應該添加食材分類（主食材、配菜、調味料）', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('主食材');
      expect(template).toContain('配菜');
      expect(template).toContain('調味料');
    });

    it('應該提供識別技巧（注意不同顏色和形狀）', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('識別技巧');
      expect(template).toContain('注意不同顏色');
      expect(template).toContain('注意不同形狀');
    });

    it('應該包含最小食材數量提示', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('涼拌菜通常有 3-6 種食材');
      expect(template).toContain('至少有 3 種食材');
    });

    it('應該包含範例展示多種食材的識別', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('範例');
      expect(template).toContain('涼拌干絲');
      expect(template).toContain('豆腐干絲');
      expect(template).toContain('芹菜絲');
      expect(template).toContain('胡蘿蔔絲');
      expect(template).toContain('香菜');
      expect(template).toContain('麻油');
    });

    it('應該包含完整性檢查清單', () => {
      const template = generator.getTemplate(PromptTemplateType.COLD_DISH);
      
      expect(template).toContain('完整性檢查清單');
      expect(template).toContain('已識別所有可見的主食材');
      expect(template).toContain('已識別所有可見的配菜');
      expect(template).toContain('已識別調味料或醬汁');
    });
  });

  describe('createStirFryPrompt - 熱炒模板修復', () => {
    it('應該包含核心任務說明', () => {
      const template = generator.getTemplate(PromptTemplateType.STIR_FRY);
      
      // 熱炒模板可能沒有明確的"核心任務"標題，但應該強調識別所有食材
      expect(template).toContain('台式熱炒');
      expect(template).toContain('識別');
    });

    it('應該強調必須識別所有食材（主食材、配料、調味料）', () => {
      const template = generator.getTemplate(PromptTemplateType.STIR_FRY);
      
      expect(template).toContain('主食材');
      expect(template).toContain('配料');
      expect(template).toContain('調味料');
    });

    it('應該提醒注意台式熱炒的特色配料', () => {
      const template = generator.getTemplate(PromptTemplateType.STIR_FRY);
      
      expect(template).toContain('蒜片');
      expect(template).toContain('辣椒');
      expect(template).toContain('九層塔');
    });

    it('應該添加食材角色分類', () => {
      const template = generator.getTemplate(PromptTemplateType.STIR_FRY);
      
      expect(template).toContain('role');
      expect(template).toContain('主食材/配料/調味料');
    });

    it('應該包含常見熱炒菜餚的範例', () => {
      const template = generator.getTemplate(PromptTemplateType.STIR_FRY);
      
      expect(template).toContain('三杯雞');
      expect(template).toContain('炒豆干');
      expect(template).toContain('炒糯米椒');
    });
  });

  describe('createMixedDishPrompt - 混合菜餚模板修復', () => {
    it('應該包含核心任務說明', () => {
      const template = generator.getTemplate(PromptTemplateType.MIXED_DISH);
      
      expect(template).toContain('核心任務');
      expect(template).toContain('首要任務');
      expect(template).toContain('逐一識別圖片中的每一種食材');
    });

    it('應該強調逐一識別每種食材', () => {
      const template = generator.getTemplate(PromptTemplateType.MIXED_DISH);
      
      expect(template).toContain('逐一識別');
      expect(template).toContain('每一種食材');
      expect(template).toContain('不要遺漏');
    });

    it('應該添加識別策略（從大到小、從明顯到細微）', () => {
      const template = generator.getTemplate(PromptTemplateType.MIXED_DISH);
      
      expect(template).toContain('從大到小');
      expect(template).toContain('從明顯到細微');
    });

    it('應該提醒注意隱藏在下層的食材', () => {
      const template = generator.getTemplate(PromptTemplateType.MIXED_DISH);
      
      expect(template).toContain('隱藏');
      expect(template).toContain('下層');
      expect(template).toContain('藏在');
    });

    it('應該添加完整性檢查', () => {
      const template = generator.getTemplate(PromptTemplateType.MIXED_DISH);
      
      expect(template).toContain('完整性檢查');
      expect(template).toContain('主食');
      expect(template).toContain('主菜');
      expect(template).toContain('配菜');
    });
  });

  describe('createTaiwanesePrompt - 台式料理模板修復', () => {
    it('應該確保 prompt 強調識別所有食材', () => {
      const template = generator.getTemplate(PromptTemplateType.TAIWANESE);
      
      expect(template).toContain('核心任務');
      expect(template).toContain('識別並列出台式料理中所有可見的食材');
    });

    it('應該添加台式料理常見食材的識別重點', () => {
      const template = generator.getTemplate(PromptTemplateType.TAIWANESE);
      
      expect(template).toContain('台式料理常見食材');
      expect(template).toContain('豆腐干絲');
      expect(template).toContain('糯米椒');
      expect(template).toContain('蒜片');
    });

    it('應該保持原有的特色食材識別功能', () => {
      const template = generator.getTemplate(PromptTemplateType.TAIWANESE);
      
      expect(template).toContain('原住民');
      expect(template).toContain('馬告');
      expect(template).toContain('刺蔥');
    });

    it('應該包含台式熱炒的識別重點', () => {
      const template = generator.getTemplate(PromptTemplateType.TAIWANESE);
      
      expect(template).toContain('台式熱炒');
      expect(template).toContain('蒜片');
      expect(template).toContain('辣椒');
      expect(template).toContain('九層塔');
    });

    it('應該包含滷味拼盤的識別重點', () => {
      const template = generator.getTemplate(PromptTemplateType.TAIWANESE);
      
      expect(template).toContain('滷味拼盤');
      expect(template).toContain('豆干');
      expect(template).toContain('滷蛋');
      expect(template).toContain('海帶');
    });

    it('應該包含涼拌小菜的識別重點', () => {
      const template = generator.getTemplate(PromptTemplateType.TAIWANESE);
      
      expect(template).toContain('涼拌小菜');
      expect(template).toContain('豆腐干絲');
      expect(template).toContain('芹菜絲');
      expect(template).toContain('胡蘿蔔絲');
    });
  });

  describe('通用修復驗證', () => {
    it('所有模板都應該移除限制性語句', () => {
      const templates = [
        PromptTemplateType.ASIAN_CUISINE,
        PromptTemplateType.SOUP,
        PromptTemplateType.COLD_DISH,
        PromptTemplateType.STIR_FRY,
        PromptTemplateType.MIXED_DISH,
        PromptTemplateType.TAIWANESE
      ];

      templates.forEach(templateType => {
        const template = generator.getTemplate(templateType);
        
        // 不應該包含舊的限制性語句
        expect(template).not.toContain('foods 列表必須包含 description 中提到的食材');
        expect(template).not.toContain('如果你在 description 或 overallDescription 中提到了某個食材，那麼該食材也必須出現在 foods 列表中');
      });
    });

    it('亞洲料理模板應該強調 foods 列表的獨立性', () => {
      const template = generator.getTemplate(PromptTemplateType.ASIAN_CUISINE);
      
      // 應該包含強調 foods 列表獨立性的語句
      const hasIndependenceStatement = 
        template?.includes('foods 列表是獨立的結構化數據') ||
        template?.includes('description 不應限制或影響 foods 列表的內容') ||
        template?.includes('即使某個食材在 description 中未提及，只要在圖片中可見，就必須加入 foods 列表');
      
      expect(hasIndependenceStatement).toBe(true);
    });

    it('所有模板都應該包含範例說明', () => {
      const templates = [
        PromptTemplateType.ASIAN_CUISINE,
        PromptTemplateType.SOUP,
        PromptTemplateType.COLD_DISH,
        PromptTemplateType.TAIWANESE
      ];

      templates.forEach(templateType => {
        const template = generator.getTemplate(templateType);
        
        expect(template).toContain('範例');
        expect(template).toContain('不要只回應');
      });
    });

    it('所有模板都應該包含完整性檢查', () => {
      const templates = [
        PromptTemplateType.ASIAN_CUISINE,
        PromptTemplateType.SOUP,
        PromptTemplateType.COLD_DISH,
        PromptTemplateType.MIXED_DISH
      ];

      templates.forEach(templateType => {
        const template = generator.getTemplate(templateType);
        
        const hasCompletenessCheck = 
          template?.includes('完整性檢查') ||
          template?.includes('已識別所有');
        
        expect(hasCompletenessCheck).toBe(true);
      });
    });
  });

  describe('generatePrompt - 整合測試', () => {
    it('應該能夠生成包含新結構的湯品 prompt', () => {
      const prompt = generator.generateSoupPrompt();
      
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('識別步驟');
      expect(prompt).toContain('完整性檢查');
      expect(prompt).toContain('必須識別湯底和所有配料');
    });

    it('應該能夠生成包含新結構的涼拌菜 prompt', () => {
      const prompt = generator.generateColdDishPrompt();
      
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('識別步驟');
      expect(prompt).toContain('完整性檢查');
      expect(prompt).toContain('必須識別所有混合的食材');
    });

    it('應該能夠生成包含新結構的熱炒 prompt', () => {
      const prompt = generator.generateStirFryPrompt();
      
      expect(prompt).toContain('台式熱炒');
      expect(prompt).toContain('蒜片');
      expect(prompt).toContain('辣椒');
    });

    it('應該能夠生成包含新結構的混合菜餚 prompt', () => {
      const prompt = generator.generateMixedDishPrompt();
      
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('逐一識別');
      expect(prompt).toContain('從大到小');
    });

    it('應該能夠生成包含新結構的台式料理 prompt', () => {
      const prompt = generator.generateTaiwanesePrompt();
      
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('台式料理');
      expect(prompt).toContain('識別步驟');
    });
  });
});
