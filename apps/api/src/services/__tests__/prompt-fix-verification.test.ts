/**
 * Prompt 修復驗證測試
 * 
 * 測試目標：
 * 1. 驗證修復後的 prompt 包含所有必要的改進
 * 2. 比較修復前後的 prompt 結構差異
 * 3. 確認食材識別指示的完整性
 * 4. 記錄測試結果和改善指標
 */

import { EnhancedPromptGenerator } from '../EnhancedPromptGenerator';

describe('Prompt 修復驗證測試', () => {
  let generator: EnhancedPromptGenerator;

  beforeEach(() => {
    generator = new EnhancedPromptGenerator('zh-TW');
  });

  describe('1. 亞洲料理通用模板驗證', () => {
    let prompt: string;

    beforeAll(() => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      prompt = gen.generatePrompt();
    });

    it('應該包含核心任務說明', () => {
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('首要任務');
      expect(prompt).toContain('識別並列出所有可見的食材');
    });

    it('應該包含識別步驟', () => {
      expect(prompt).toContain('識別步驟');
      expect(prompt).toContain('步驟 1');
      expect(prompt).toContain('步驟 2');
      expect(prompt).toContain('步驟 3');
      expect(prompt).toContain('步驟 4');
    });

    it('應該包含完整性檢查清單', () => {
      expect(prompt).toContain('完整性檢查');
      expect(prompt).toContain('已識別所有可見的主要食材');
      expect(prompt).toContain('已識別所有可見的配菜');
      expect(prompt).toContain('已識別所有可見的小配料');
    });

    it('應該包含重要原則說明', () => {
      expect(prompt).toContain('重要原則');
      expect(prompt).toContain('foods 列表是獨立的結構化數據');
      expect(prompt).toContain('description 是補充說明');
    });

    it('應該包含範例', () => {
      expect(prompt).toContain('範例');
      expect(prompt).toContain('不要只回應');
      expect(prompt).toContain('必須列出');
    });

    it('應該移除限制性語句', () => {
      // 確認沒有「foods 列表必須包含 description 中提到的食材」這類限制性語句
      expect(prompt).not.toContain('foods 列表必須包含 description 中提到的');
      expect(prompt).not.toContain('如果你在 description 中提到了某個食材');
    });

    it('應該強調 foods 列表的獨立性', () => {
      expect(prompt).toContain('即使某個食材在 description 中未提及');
      expect(prompt).toContain('只要在圖片中可見，就必須加入 foods 列表');
    });
  });

  describe('2. 湯品識別模板驗證', () => {
    let prompt: string;

    beforeAll(() => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      prompt = gen.generateSoupPrompt();
    });

    it('應該強調識別湯底和所有配料', () => {
      expect(prompt).toContain('識別湯底和所有配料');
      expect(prompt).toContain('湯底');
      expect(prompt).toContain('配料');
    });

    it('應該包含配料識別步驟', () => {
      expect(prompt).toContain('浮在表面');
      expect(prompt).toContain('中間');
      expect(prompt).toContain('底部');
    });

    it('應該提供具體的配料範例', () => {
      expect(prompt).toContain('豆腐');
      expect(prompt).toContain('海帶');
      expect(prompt).toContain('蔥花');
    });

    it('應該包含最小配料數量要求', () => {
      expect(prompt).toContain('至少');
      expect(prompt).toContain('3-5');
    });

    it('應該提供份量估算標準', () => {
      expect(prompt).toContain('份量估算');
      expect(prompt).toContain('200-300ml');
      expect(prompt).toContain('30-50g');
    });

    it('應該強調不要只回應湯品名稱', () => {
      expect(prompt).toContain('不要只');
      expect(prompt).toContain('湯品名稱');
      expect(prompt).toContain('要列出');
    });

    it('應該包含味噌湯範例', () => {
      expect(prompt).toContain('味噌湯');
      const exampleMatch = prompt.match(/味噌湯[\s\S]{0,500}豆腐[\s\S]{0,200}海帶/);
      expect(exampleMatch).toBeTruthy();
    });
  });

  describe('3. 涼拌菜識別模板驗證', () => {
    let prompt: string;

    beforeAll(() => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      prompt = gen.generateColdDishPrompt();
    });

    it('應該強調識別所有混合的食材', () => {
      expect(prompt).toContain('識別並列出涼拌菜中所有混合的食材');
      expect(prompt).toContain('逐一識別');
    });

    it('應該包含食材分類', () => {
      expect(prompt).toContain('主食材');
      expect(prompt).toContain('配菜');
      expect(prompt).toContain('調味料');
    });

    it('應該提供識別技巧', () => {
      expect(prompt).toContain('注意不同顏色');
      expect(prompt).toContain('注意不同形狀');
    });

    it('應該包含最小食材數量提示', () => {
      expect(prompt).toContain('3-6 種食材');
    });

    it('應該包含涼拌干絲範例', () => {
      expect(prompt).toContain('涼拌干絲');
      expect(prompt).toContain('豆腐干絲');
      expect(prompt).toContain('芹菜絲');
      expect(prompt).toContain('胡蘿蔔絲');
    });

    it('應該強調不要只回應主食材', () => {
      expect(prompt).toContain('不要只回應');
      expect(prompt).toContain('必須列出所有可見的食材');
    });
  });

  describe('4. 混合菜餚識別模板驗證', () => {
    let prompt: string;

    beforeAll(() => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      prompt = gen.generateMixedDishPrompt();
    });

    it('應該包含系統化識別策略', () => {
      expect(prompt).toContain('逐一識別');
      expect(prompt).toContain('從大到小');
      expect(prompt).toContain('從明顯到細微');
    });

    it('應該提醒注意隱藏的食材', () => {
      expect(prompt).toContain('隱藏');
      expect(prompt).toContain('下層');
      expect(prompt).toContain('遮蓋');
    });

    it('應該包含完整性檢查', () => {
      expect(prompt).toContain('主食');
      expect(prompt).toContain('主菜');
      expect(prompt).toContain('配菜');
      expect(prompt).toContain('調味料');
    });
  });

  describe('5. 台式熱炒識別模板驗證', () => {
    let prompt: string;

    beforeAll(() => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      prompt = gen.generateStirFryPrompt();
    });

    it('應該強調識別蒜片和辣椒', () => {
      expect(prompt).toContain('蒜片');
      expect(prompt).toContain('辣椒');
    });

    it('應該包含台式熱炒特徵', () => {
      expect(prompt).toContain('台式熱炒');
      expect(prompt).toContain('大火快炒');
    });

    it('應該包含食材角色分類', () => {
      expect(prompt).toContain('主食材');
      expect(prompt).toContain('配料');
      expect(prompt).toContain('調味料');
    });
  });

  describe('6. 台式料理識別模板驗證', () => {
    let prompt: string;

    beforeAll(() => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      prompt = gen.generateTaiwanesePrompt();
    });

    it('應該包含完整的識別指南', () => {
      expect(prompt).toContain('核心任務');
      expect(prompt).toContain('識別步驟');
      expect(prompt).toContain('台式料理類型識別');
    });

    it('應該包含台式特色食材', () => {
      expect(prompt).toContain('豆腐干絲');
      expect(prompt).toContain('糯米椒');
      expect(prompt).toContain('蒜片');
      expect(prompt).toContain('九層塔');
    });

    it('應該包含原住民料理識別', () => {
      expect(prompt).toContain('原住民');
      expect(prompt).toContain('馬告');
      expect(prompt).toContain('刺蔥');
    });

    it('應該包含多個範例', () => {
      expect(prompt).toContain('範例 1');
      expect(prompt).toContain('範例 2');
      expect(prompt).toContain('範例 3');
      expect(prompt).toContain('範例 4');
    });

    it('應該包含炒豆干範例', () => {
      expect(prompt).toContain('炒豆干');
      expect(prompt).toContain('豆干');
      expect(prompt).toContain('糯米椒');
      expect(prompt).toContain('蒜片');
    });

    it('應該包含滷味拼盤範例', () => {
      expect(prompt).toContain('滷味拼盤');
      expect(prompt).toContain('豆干');
      expect(prompt).toContain('滷蛋');
      expect(prompt).toContain('海帶');
    });
  });

  describe('7. Prompt 質量指標測試', () => {
    const prompts = [
      { name: '亞洲料理通用', getter: () => new EnhancedPromptGenerator('zh-TW').generatePrompt() },
      { name: '湯品', getter: () => new EnhancedPromptGenerator('zh-TW').generateSoupPrompt() },
      { name: '涼拌菜', getter: () => new EnhancedPromptGenerator('zh-TW').generateColdDishPrompt() },
      { name: '混合菜餚', getter: () => new EnhancedPromptGenerator('zh-TW').generateMixedDishPrompt() },
      { name: '台式熱炒', getter: () => new EnhancedPromptGenerator('zh-TW').generateStirFryPrompt() },
      { name: '台式料理', getter: () => new EnhancedPromptGenerator('zh-TW').generateTaiwanesePrompt() }
    ];

    it('所有 prompt 應該有足夠的長度', () => {
      prompts.forEach(({ name, getter }) => {
        const prompt = getter();
        expect(prompt.length).toBeGreaterThan(1000);
        console.log(`${name} prompt 長度: ${prompt.length} 字符`);
      });
    });

    it('所有 prompt 應該包含「必須」指令', () => {
      prompts.forEach(({ name, getter }) => {
        const prompt = getter();
        const mustCount = (prompt.match(/必須/g) || []).length;
        expect(mustCount).toBeGreaterThan(0);
        console.log(`${name} prompt 包含 ${mustCount} 個「必須」指令`);
      });
    });

    it('所有 prompt 應該包含範例', () => {
      prompts.forEach(({ name, getter }) => {
        const prompt = getter();
        const hasExample = prompt.includes('範例') || prompt.includes('Example');
        expect(hasExample).toBe(true);
      });
    });

    it('所有 prompt 應該包含結構標記', () => {
      prompts.forEach(({ name, getter }) => {
        const prompt = getter();
        const h2Count = (prompt.match(/##/g) || []).length;
        expect(h2Count).toBeGreaterThan(2);
        console.log(`${name} prompt 包含 ${h2Count} 個 ## 標題`);
      });
    });
  });

  describe('8. 修復前後對比測試', () => {
    it('修復後的 prompt 應該明顯更長', () => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      
      // 假設修復前的 prompt 長度約 500-800 字符
      const beforeLength = 700;
      
      // 修復後的 prompt
      const afterPrompts = [
        gen.generateSoupPrompt(),
        gen.generateColdDishPrompt(),
        gen.generateTaiwanesePrompt()
      ];

      afterPrompts.forEach(prompt => {
        expect(prompt.length).toBeGreaterThan(beforeLength * 2);
      });
    });

    it('修復後應該包含更多指導性內容', () => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      const prompts = [
        gen.generateSoupPrompt(),
        gen.generateColdDishPrompt(),
        gen.generateTaiwanesePrompt()
      ];

      prompts.forEach(prompt => {
        // 應該包含步驟說明
        expect(prompt).toContain('步驟');
        
        // 應該包含範例
        expect(prompt).toContain('範例');
        
        // 應該包含檢查清單
        const hasChecklist = 
          prompt.includes('完整性檢查') ||
          prompt.includes('已識別');
        expect(hasChecklist).toBe(true);
      });
    });
  });

  describe('9. 測試結果摘要', () => {
    it('生成測試結果報告', () => {
      const gen = new EnhancedPromptGenerator('zh-TW');
      
      const testResults = {
        亞洲料理通用: {
          prompt: gen.generatePrompt(),
          checks: {
            包含核心任務: false,
            包含識別步驟: false,
            包含完整性檢查: false,
            包含範例: false,
            移除限制性語句: false
          }
        },
        湯品: {
          prompt: gen.generateSoupPrompt(),
          checks: {
            強調識別配料: false,
            包含配料範例: false,
            包含份量標準: false,
            包含最小數量要求: false
          }
        },
        涼拌菜: {
          prompt: gen.generateColdDishPrompt(),
          checks: {
            強調識別所有食材: false,
            包含食材分類: false,
            包含識別技巧: false,
            包含範例: false
          }
        },
        台式料理: {
          prompt: gen.generateTaiwanesePrompt(),
          checks: {
            包含完整指南: false,
            包含特色食材: false,
            包含多個範例: false,
            包含原住民料理: false
          }
        }
      };

      // 檢查亞洲料理通用
      const asianPrompt = testResults.亞洲料理通用.prompt;
      testResults.亞洲料理通用.checks.包含核心任務 = asianPrompt.includes('核心任務');
      testResults.亞洲料理通用.checks.包含識別步驟 = asianPrompt.includes('識別步驟');
      testResults.亞洲料理通用.checks.包含完整性檢查 = asianPrompt.includes('完整性檢查');
      testResults.亞洲料理通用.checks.包含範例 = asianPrompt.includes('範例');
      testResults.亞洲料理通用.checks.移除限制性語句 = 
        !asianPrompt.includes('foods 列表必須包含 description 中提到的');

      // 檢查湯品
      const soupPrompt = testResults.湯品.prompt;
      testResults.湯品.checks.強調識別配料 = soupPrompt.includes('識別湯底和所有配料');
      testResults.湯品.checks.包含配料範例 = soupPrompt.includes('豆腐') && soupPrompt.includes('海帶');
      testResults.湯品.checks.包含份量標準 = soupPrompt.includes('份量估算');
      testResults.湯品.checks.包含最小數量要求 = soupPrompt.includes('至少');

      // 檢查涼拌菜
      const coldPrompt = testResults.涼拌菜.prompt;
      testResults.涼拌菜.checks.強調識別所有食材 = coldPrompt.includes('識別並列出涼拌菜中所有混合的食材');
      testResults.涼拌菜.checks.包含食材分類 = coldPrompt.includes('主食材') && coldPrompt.includes('配菜');
      testResults.涼拌菜.checks.包含識別技巧 = coldPrompt.includes('注意不同顏色');
      testResults.涼拌菜.checks.包含範例 = coldPrompt.includes('涼拌干絲');

      // 檢查台式料理
      const taiwanesePrompt = testResults.台式料理.prompt;
      testResults.台式料理.checks.包含完整指南 = taiwanesePrompt.includes('核心任務') && taiwanesePrompt.includes('識別步驟');
      testResults.台式料理.checks.包含特色食材 = taiwanesePrompt.includes('豆腐干絲') && taiwanesePrompt.includes('糯米椒');
      testResults.台式料理.checks.包含多個範例 = 
        taiwanesePrompt.includes('範例 1') && 
        taiwanesePrompt.includes('範例 2') && 
        taiwanesePrompt.includes('範例 3');
      testResults.台式料理.checks.包含原住民料理 = taiwanesePrompt.includes('原住民') && taiwanesePrompt.includes('馬告');

      // 計算通過率
      let totalChecks = 0;
      let passedChecks = 0;

      Object.entries(testResults).forEach(([category, result]) => {
        console.log(`\n${category}:`);
        console.log(`  Prompt 長度: ${result.prompt.length} 字符`);
        console.log(`  檢查項目:`);
        
        Object.entries(result.checks).forEach(([check, passed]) => {
          totalChecks++;
          if (passed) passedChecks++;
          console.log(`    ${passed ? '✓' : '✗'} ${check}`);
        });
      });

      const passRate = (passedChecks / totalChecks * 100).toFixed(2);
      console.log(`\n總體通過率: ${passedChecks}/${totalChecks} (${passRate}%)`);

      // 所有檢查項目都應該通過
      expect(passedChecks).toBe(totalChecks);
    });
  });
});
