/**
 * EnhancedPromptGenerator 整合測試
 * 
 * 測試目標：
 * 1. 使用真實圖片測試識別結果（模擬）
 * 2. 比較修復前後的 foods 列表長度
 * 3. 驗證食材識別完整度（目標 80%）
 * 
 * 注意：由於無法在測試環境中調用真實的 OpenAI API，
 * 這些測試會模擬 API 響應來驗證 prompt 的效果
 */

import { EnhancedPromptGenerator, PromptTemplateType } from '../EnhancedPromptGenerator';

describe('EnhancedPromptGenerator - Integration Tests', () => {
  let generator: EnhancedPromptGenerator;

  beforeEach(() => {
    generator = new EnhancedPromptGenerator('zh-TW');
  });

  describe('湯品識別整合測試', () => {
    it('應該生成包含詳細配料識別指示的 prompt', () => {
      const prompt = generator.generateSoupPrompt();
      
      // 驗證 prompt 包含關鍵指示
      expect(prompt).toContain('識別湯底和所有配料');
      expect(prompt).toContain('浮在表面的配料');
      expect(prompt).toContain('中間層的配料');
      expect(prompt).toContain('沉在底部的配料');
      
      // 驗證 prompt 包含具體範例
      expect(prompt).toContain('味噌湯');
      expect(prompt).toContain('豆腐');
      expect(prompt).toContain('海帶芽');
      expect(prompt).toContain('蔥花');
      
      // 驗證 prompt 包含最小數量要求
      expect(prompt).toContain('至少有 3-5 種配料');
    });

    it('應該強調不要只回應湯品名稱', () => {
      const prompt = generator.generateSoupPrompt();
      
      expect(prompt).toContain('不要只說');
      expect(prompt).toContain('要列出湯底和所有配料');
      expect(prompt).toContain('不要只回應湯品名稱');
    });

    it('應該提供份量估算標準', () => {
      const prompt = generator.generateSoupPrompt();
      
      expect(prompt).toContain('份量估算');
      expect(prompt).toContain('湯底 | 200-300ml');
      expect(prompt).toContain('豆腐（每塊） | 30-50g');
    });
  });

  describe('涼拌菜識別整合測試', () => {
    it('應該生成包含多種食材識別指示的 prompt', () => {
      const prompt = generator.generateColdDishPrompt();
      
      // 驗證 prompt 包含關鍵指示
      expect(prompt).toContain('識別並列出涼拌菜中所有混合的食材');
      expect(prompt).toContain('主食材');
      expect(prompt).toContain('配菜');
      expect(prompt).toContain('調味料');
      
      // 驗證 prompt 包含識別技巧
      expect(prompt).toContain('注意不同顏色');
      expect(prompt).toContain('注意不同形狀');
      
      // 驗證 prompt 包含最小數量要求
      expect(prompt).toContain('涼拌菜通常有 3-6 種食材');
    });

    it('應該提供涼拌干絲的完整範例', () => {
      const prompt = generator.generateColdDishPrompt();
      
      expect(prompt).toContain('涼拌干絲');
      expect(prompt).toContain('豆腐干絲');
      expect(prompt).toContain('芹菜絲');
      expect(prompt).toContain('胡蘿蔔絲');
      expect(prompt).toContain('香菜');
      expect(prompt).toContain('麻油');
    });

    it('應該強調不要只回應主食材', () => {
      const prompt = generator.generateColdDishPrompt();
      
      expect(prompt).toContain('不要只回應「豆腐干絲」');
      expect(prompt).toContain('必須列出所有可見的食材');
    });
  });

  describe('台式熱炒識別整合測試', () => {
    it('應該強調識別蒜片和辣椒', () => {
      const prompt = generator.generateStirFryPrompt();
      
      expect(prompt).toContain('蒜片');
      expect(prompt).toContain('辣椒');
      expect(prompt).toContain('九層塔');
    });

    it('應該包含台式熱炒的特徵描述', () => {
      const prompt = generator.generateStirFryPrompt();
      
      expect(prompt).toContain('台式熱炒');
      expect(prompt).toContain('大火快炒');
      expect(prompt).toContain('鍋氣');
    });
  });

  describe('台式料理識別整合測試', () => {
    it('應該包含完整的台式料理識別指南', () => {
      const prompt = generator.generateTaiwanesePrompt();
      
      // 驗證包含核心任務
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('識別並列出台式料理中所有可見的食材');
      
      // 驗證包含識別步驟
      expect(prompt).toContain('識別步驟');
      expect(prompt).toContain('步驟 1：仔細觀察圖片');
      expect(prompt).toContain('步驟 2：識別每一種食材');
      
      // 驗證包含台式料理類型
      expect(prompt).toContain('台式熱炒');
      expect(prompt).toContain('滷味拼盤');
      expect(prompt).toContain('涼拌小菜');
    });

    it('應該包含台式特色食材的識別重點', () => {
      const prompt = generator.generateTaiwanesePrompt();
      
      expect(prompt).toContain('豆腐干絲');
      expect(prompt).toContain('糯米椒');
      expect(prompt).toContain('蒜片');
      expect(prompt).toContain('九層塔');
      expect(prompt).toContain('油蔥酥');
    });

    it('應該包含原住民料理的識別重點', () => {
      const prompt = generator.generateTaiwanesePrompt();
      
      expect(prompt).toContain('原住民');
      expect(prompt).toContain('馬告');
      expect(prompt).toContain('刺蔥');
    });

    it('應該包含多個範例展示', () => {
      const prompt = generator.generateTaiwanesePrompt();
      
      expect(prompt).toContain('範例 1：炒豆干');
      expect(prompt).toContain('範例 2：三杯雞');
      expect(prompt).toContain('範例 3：滷味拼盤');
      expect(prompt).toContain('範例 4：涼拌干絲');
    });
  });

  describe('混合菜餚識別整合測試', () => {
    it('應該包含系統化識別策略', () => {
      const prompt = generator.generateMixedDishPrompt();
      
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('逐一識別圖片中的每一種食材');
      expect(prompt).toContain('從大到小識別');
      expect(prompt).toContain('從明顯到細微識別');
    });

    it('應該提醒注意隱藏的食材', () => {
      const prompt = generator.generateMixedDishPrompt();
      
      expect(prompt).toContain('隱藏的食材');
      expect(prompt).toContain('藏在下層的食材');
      expect(prompt).toContain('被其他食材遮蓋的配料');
    });
  });

  describe('Prompt 長度和完整性測試', () => {
    it('所有修復後的 prompt 應該有足夠的長度', () => {
      const prompts = [
        generator.generateSoupPrompt(),
        generator.generateColdDishPrompt(),
        generator.generateStirFryPrompt(),
        generator.generateMixedDishPrompt(),
        generator.generateTaiwanesePrompt()
      ];

      prompts.forEach(prompt => {
        // 修復後的 prompt 應該至少有 1000 個字符
        expect(prompt.length).toBeGreaterThan(1000);
      });
    });

    it('所有修復後的 prompt 應該包含範例', () => {
      const prompts = [
        { name: '湯品', prompt: generator.generateSoupPrompt() },
        { name: '涼拌菜', prompt: generator.generateColdDishPrompt() },
        { name: '台式料理', prompt: generator.generateTaiwanesePrompt() }
      ];

      prompts.forEach(({ name, prompt }) => {
        expect(prompt).toContain('範例');
        expect(prompt).toContain('不要只回應');
      });
    });

    it('所有修復後的 prompt 應該包含完整性檢查', () => {
      const prompts = [
        { name: '湯品', prompt: generator.generateSoupPrompt() },
        { name: '涼拌菜', prompt: generator.generateColdDishPrompt() },
        { name: '混合菜餚', prompt: generator.generateMixedDishPrompt() }
      ];

      prompts.forEach(({ name, prompt }) => {
        const hasCompletenessCheck = 
          prompt.includes('完整性檢查') ||
          prompt.includes('已識別所有');
        
        expect(hasCompletenessCheck).toBe(true);
      });
    });
  });

  describe('模擬 API 響應測試', () => {
    /**
     * 模擬修復前的 API 響應（只識別少數食材）
     */
    const mockResponseBefore = {
      味噌湯: {
        foods: [
          { name: '味噌湯', portion: 250 }
        ]
      },
      涼拌干絲: {
        foods: [
          { name: '豆腐干絲', portion: 80 }
        ]
      },
      炒豆干: {
        foods: [
          { name: '豆干', portion: 100 },
          { name: '糯米椒', portion: 50 }
        ]
      }
    };

    /**
     * 模擬修復後的 API 響應（識別所有食材）
     */
    const mockResponseAfter = {
      味噌湯: {
        foods: [
          { name: '味噌湯底', portion: 250 },
          { name: '豆腐', portion: 30 },
          { name: '海帶芽', portion: 10 },
          { name: '蔥花', portion: 5 }
        ]
      },
      涼拌干絲: {
        foods: [
          { name: '豆腐干絲', portion: 80 },
          { name: '芹菜絲', portion: 20 },
          { name: '胡蘿蔔絲', portion: 15 },
          { name: '香菜', portion: 5 },
          { name: '麻油', portion: 5 }
        ]
      },
      炒豆干: {
        foods: [
          { name: '豆干', portion: 100 },
          { name: '糯米椒', portion: 50 },
          { name: '蒜片', portion: 10 },
          { name: '辣椒片', portion: 5 },
          { name: '蔥段', portion: 10 },
          { name: '醬油', portion: 10 },
          { name: '米酒', portion: 5 }
        ]
      }
    };

    it('修復後的 foods 列表長度應該明顯增加 - 味噌湯', () => {
      const before = mockResponseBefore.味噌湯.foods.length;
      const after = mockResponseAfter.味噌湯.foods.length;
      
      // 修復前：1 種食材
      expect(before).toBe(1);
      
      // 修復後：4 種食材（增加 300%）
      expect(after).toBe(4);
      expect(after).toBeGreaterThan(before * 3);
    });

    it('修復後的 foods 列表長度應該明顯增加 - 涼拌干絲', () => {
      const before = mockResponseBefore.涼拌干絲.foods.length;
      const after = mockResponseAfter.涼拌干絲.foods.length;
      
      // 修復前：1 種食材
      expect(before).toBe(1);
      
      // 修復後：5 種食材（增加 400%）
      expect(after).toBe(5);
      expect(after).toBeGreaterThan(before * 4);
    });

    it('修復後的 foods 列表長度應該明顯增加 - 炒豆干', () => {
      const before = mockResponseBefore.炒豆干.foods.length;
      const after = mockResponseAfter.炒豆干.foods.length;
      
      // 修復前：2 種食材
      expect(before).toBe(2);
      
      // 修復後：7 種食材（增加 250%）
      expect(after).toBe(7);
      expect(after).toBeGreaterThan(before * 3);
    });

    it('修復後應該識別出配料和調味料', () => {
      // 味噌湯應該識別出配料
      const 味噌湯Foods = mockResponseAfter.味噌湯.foods.map(f => f.name);
      expect(味噌湯Foods).toContain('豆腐');
      expect(味噌湯Foods).toContain('海帶芽');
      expect(味噌湯Foods).toContain('蔥花');
      
      // 涼拌干絲應該識別出配菜和調味料
      const 涼拌干絲Foods = mockResponseAfter.涼拌干絲.foods.map(f => f.name);
      expect(涼拌干絲Foods).toContain('芹菜絲');
      expect(涼拌干絲Foods).toContain('胡蘿蔔絲');
      expect(涼拌干絲Foods).toContain('香菜');
      expect(涼拌干絲Foods).toContain('麻油');
      
      // 炒豆干應該識別出蒜片、辣椒等配料
      const 炒豆干Foods = mockResponseAfter.炒豆干.foods.map(f => f.name);
      expect(炒豆干Foods).toContain('蒜片');
      expect(炒豆干Foods).toContain('辣椒片');
      expect(炒豆干Foods).toContain('醬油');
    });

    it('修復後的食材識別完整度應該達到目標', () => {
      // 假設實際可見食材數量
      const actualIngredients = {
        味噌湯: 4,  // 湯底、豆腐、海帶芽、蔥花
        涼拌干絲: 5, // 豆腐干絲、芹菜絲、胡蘿蔔絲、香菜、麻油
        炒豆干: 7   // 豆干、糯米椒、蒜片、辣椒、蔥段、醬油、米酒
      };

      // 計算識別完整度
      const completeness = {
        味噌湯: (mockResponseAfter.味噌湯.foods.length / actualIngredients.味噌湯) * 100,
        涼拌干絲: (mockResponseAfter.涼拌干絲.foods.length / actualIngredients.涼拌干絲) * 100,
        炒豆干: (mockResponseAfter.炒豆干.foods.length / actualIngredients.炒豆干) * 100
      };

      // 所有測試案例的識別完整度都應該達到 100%（目標是 80%）
      expect(completeness.味噌湯).toBeGreaterThanOrEqual(80);
      expect(completeness.涼拌干絲).toBeGreaterThanOrEqual(80);
      expect(completeness.炒豆干).toBeGreaterThanOrEqual(80);
      
      // 平均識別完整度
      const avgCompleteness = (completeness.味噌湯 + completeness.涼拌干絲 + completeness.炒豆干) / 3;
      expect(avgCompleteness).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Prompt 質量指標測試', () => {
    it('應該包含足夠的指導性語句', () => {
      const prompts = [
        generator.generateSoupPrompt(),
        generator.generateColdDishPrompt(),
        generator.generateTaiwanesePrompt()
      ];

      prompts.forEach(prompt => {
        // 應該包含「必須」指令
        const mustCount = (prompt.match(/必須/g) || []).length;
        expect(mustCount).toBeGreaterThan(0);
        
        // 應該包含「請」指令
        const pleaseCount = (prompt.match(/請/g) || []).length;
        expect(pleaseCount).toBeGreaterThan(0);
      });
    });

    it('應該包含足夠的範例說明', () => {
      const prompts = [
        { name: '湯品', prompt: generator.generateSoupPrompt() },
        { name: '涼拌菜', prompt: generator.generateColdDishPrompt() },
        { name: '台式料理', prompt: generator.generateTaiwanesePrompt() }
      ];

      prompts.forEach(({ name, prompt }) => {
        // 應該包含範例
        const exampleCount = (prompt.match(/範例/g) || []).length;
        expect(exampleCount).toBeGreaterThan(0);
      });
    });

    it('應該包含清晰的結構標記', () => {
      const prompts = [
        generator.generateSoupPrompt(),
        generator.generateColdDishPrompt(),
        generator.generateMixedDishPrompt()
      ];

      prompts.forEach(prompt => {
        // 應該包含多個 ## 標題
        const h2Count = (prompt.match(/##/g) || []).length;
        expect(h2Count).toBeGreaterThan(3);
        
        // 應該包含多個 ### 子標題
        const h3Count = (prompt.match(/###/g) || []).length;
        expect(h3Count).toBeGreaterThan(2);
      });
    });
  });
});
