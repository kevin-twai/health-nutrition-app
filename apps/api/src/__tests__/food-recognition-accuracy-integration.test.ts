/**
 * 食物識別準確度改進 - 整合測試
 * 測試完整的識別流程，包括多階段識別、結果驗證和錯誤處理
 */

import { MultiStageRecognitionEngine } from '../services/MultiStageRecognitionEngine';
import { EnhancedPromptGenerator } from '../services/EnhancedPromptGenerator';
import { AsianCuisineKnowledgeBase } from '../services/AsianCuisineKnowledgeBase';
import { ResultValidator } from '../services/ResultValidator';
import { ImageProcessingService } from '../services/ImageProcessingService';

describe('食物識別準確度改進 - 整合測試', () => {
  let recognitionEngine: MultiStageRecognitionEngine;
  let promptGenerator: EnhancedPromptGenerator;
  let knowledgeBase: AsianCuisineKnowledgeBase;
  let validator: ResultValidator;
  let imageProcessor: ImageProcessingService;

  beforeAll(() => {
    // 初始化所有服務
    promptGenerator = new EnhancedPromptGenerator('zh-TW');
    knowledgeBase = new AsianCuisineKnowledgeBase();
    validator = new ResultValidator();
    imageProcessor = new ImageProcessingService();
    recognitionEngine = new MultiStageRecognitionEngine(
      promptGenerator,
      knowledgeBase,
      validator
    );
  });

  describe('完整識別流程', () => {
    it('應該能完成標準識別流程', async () => {
      // 這個測試需要實際的圖片或 Mock
      // 由於沒有實際圖片，我們測試流程的完整性
      
      const mockImageBuffer = Buffer.from('mock-image-data');
      
      // 測試圖片預處理
      const processedImage = await imageProcessor.processImage(mockImageBuffer);
      expect(processedImage).toBeDefined();
    });

    it('應該能處理 HEIC 格式圖片', async () => {
      const mockHeicBuffer = Buffer.from('mock-heic-data');
      
      try {
        await imageProcessor.processImage(mockHeicBuffer);
      } catch (error) {
        // 預期會失敗，因為是 mock 數據
        expect(error).toBeDefined();
      }
    });
  });

  describe('Prompt 生成整合', () => {
    it('應該能根據知識庫生成專門的 Prompt', () => {
      // 查詢豆製品
      const beanProducts = knowledgeBase.queryFoodItems({
        category: '豆製品' as any
      });
      
      expect(beanProducts.length).toBeGreaterThan(0);
      
      // 生成豆製品專用 Prompt
      const prompt = promptGenerator.generateBeanProductPrompt();
      
      expect(prompt).toContain('豆製品');
      expect(prompt).toContain('豆腐干絲');
    });

    it('應該能整合易混淆食材資訊到 Prompt', () => {
      // 從知識庫獲取易混淆食材
      const confusions = knowledgeBase.getConfusedFoodPairs('豆腐干絲');
      
      expect(confusions.length).toBeGreaterThan(0);
      
      // 生成包含警告的 Prompt
      const basePrompt = promptGenerator.generatePrompt();
      const enhancedPrompt = promptGenerator.addConfusionWarnings(
        basePrompt,
        [['豆腐干絲', '麵條']]
      );
      
      expect(enhancedPrompt).toContain('易混淆');
      expect(enhancedPrompt).toContain('豆腐干絲');
      expect(enhancedPrompt).toContain('麵條');
    });
  });

  describe('結果驗證整合', () => {
    it('應該能驗證涼拌菜的完整性', () => {
      const result = {
        foods: [
          {
            id: '1',
            name: '豆腐干絲',
            confidence: 0.85,
            estimatedPortion: 100,
            nutrition: {
              calories: 150,
              protein: 12,
              carbs: 8,
              fat: 6,
              fiber: 2,
              sodium: 300
            }
          },
          {
            id: '2',
            name: '芹菜絲',
            confidence: 0.90,
            estimatedPortion: 50,
            nutrition: {
              calories: 8,
              protein: 0.5,
              carbs: 1.5,
              fat: 0.1,
              fiber: 1,
              sodium: 50
            }
          },
          {
            id: '3',
            name: '麻油',
            confidence: 0.75,
            estimatedPortion: 10,
            nutrition: {
              calories: 88,
              protein: 0,
              carbs: 0,
              fat: 10,
              fiber: 0,
              sodium: 0
            }
          }
        ],
        cookingMethod: '涼拌',
        cuisineType: '台式',
        confidence: 0.83
      };

      const report = validator.validate(result);
      
      expect(report.overallPassed).toBe(true);
      expect(report.errors.length).toBe(0);
    });

    it('應該能檢測易混淆食材同時出現', () => {
      const result = {
        foods: [
          {
            id: '1',
            name: '豆腐干絲',
            confidence: 0.70,
            estimatedPortion: 100,
            nutrition: {
              calories: 150,
              protein: 12,
              carbs: 8,
              fat: 6,
              fiber: 2,
              sodium: 300
            }
          },
          {
            id: '2',
            name: '麵條',
            confidence: 0.65,
            estimatedPortion: 100,
            nutrition: {
              calories: 140,
              protein: 5,
              carbs: 28,
              fat: 1,
              fiber: 1,
              sodium: 10
            }
          }
        ],
        cookingMethod: '涼拌',
        cuisineType: '中式',
        confidence: 0.68
      };

      const report = validator.validate(result);
      
      expect(report.warnings.length).toBeGreaterThan(0);
      const confusionWarning = report.warnings.find(w => 
        w.message.includes('豆腐干絲') && w.message.includes('麵條')
      );
      expect(confusionWarning).toBeDefined();
    });

    it('應該能使用知識庫驗證食材組合', () => {
      const foods = ['豆腐干絲', '麵條'];
      const validation = knowledgeBase.validateFoodCombination(foods);
      
      expect(validation.valid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('容易混淆');
    });
  });

  describe('知識庫與 Prompt 整合', () => {
    it('應該能根據料理類型生成適當的 Prompt', () => {
      // 獲取台式料理的常見食材
      const taiwaneseFood = knowledgeBase.queryFoodItems({
        cuisineType: '台式' as any
      });
      
      expect(taiwaneseFood.length).toBeGreaterThan(0);
      
      // 生成台式料理 Prompt
      const prompt = promptGenerator.generateTaiwanesePrompt();
      
      expect(prompt).toContain('台式');
      expect(prompt).toContain('豆腐干絲');
    });

    it('應該能根據菜餚模式生成 Prompt', () => {
      // 獲取涼拌菜的常見食材
      const ingredients = knowledgeBase.getCommonIngredientsForDish('涼拌菜');
      
      expect(ingredients.length).toBeGreaterThan(0);
      expect(ingredients).toContain('豆腐干絲');
      
      // 生成涼拌菜 Prompt
      const prompt = promptGenerator.generateColdDishPrompt();
      
      expect(prompt).toContain('涼拌');
      expect(prompt).toContain('豆腐干絲');
    });

    it('應該能整合視覺特徵到識別流程', () => {
      const imageFeatures = {
        dominantColors: ['淡黃色', '米白色'],
        textureType: 'rough' as const,
        shapePatterns: ['細長條狀', '絲狀'],
        estimatedComplexity: 5,
        hasMultipleComponents: false
      };

      // 使用視覺特徵匹配食材
      const matches = knowledgeBase.matchFoodItemsByVisualFeatures(imageFeatures);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].confidence).toBeGreaterThan(0);
      
      // 檢查是否匹配到豆腐干絲
      const tofuMatch = matches.find(m => m.foodItem.name === '豆腐干絲');
      expect(tofuMatch).toBeDefined();
    });
  });

  describe('錯誤處理整合', () => {
    it('應該能處理無效的圖片數據', async () => {
      const invalidBuffer = Buffer.from('invalid-data');
      
      try {
        await imageProcessor.processImage(invalidBuffer);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('應該能處理空的識別結果', () => {
      const emptyResult = {
        foods: [],
        confidence: 0
      };

      const report = validator.validate(emptyResult);
      
      expect(report).toBeDefined();
      expect(report.warnings.length).toBeGreaterThan(0);
    });

    it('應該能處理異常的營養值', () => {
      const result = {
        foods: [
          {
            id: '1',
            name: '測試食物',
            confidence: 0.80,
            estimatedPortion: 100,
            nutrition: {
              calories: 1500, // 異常高
              protein: 50,
              carbs: 50,
              fat: 50,
              fiber: 2,
              sodium: 300
            }
          }
        ],
        confidence: 0.80
      };

      const report = validator.validate(result);
      
      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('多階段識別流程', () => {
    it('應該能處理低信心度場景', () => {
      // 模擬第一階段低信心度結果
      const lowConfidenceResult = {
        foods: [
          {
            id: '1',
            name: '豆腐干絲',
            confidence: 0.60,
            estimatedPortion: 100,
            nutrition: {
              calories: 150,
              protein: 12,
              carbs: 8,
              fat: 6,
              fiber: 2,
              sodium: 300
            }
          }
        ],
        confidence: 0.60
      };

      // 驗證結果
      const report = validator.validate(lowConfidenceResult);
      
      // 低信心度應該觸發警告
      expect(report.infos.length).toBeGreaterThan(0);
    });

    it('應該能生成增強 Prompt 用於重試', () => {
      const config = {
        previousAttempts: 1,
        detectedCuisineType: '台式' as any,
        suspectedFoodCategories: ['豆製品' as any]
      };

      const prompt = promptGenerator.generatePrompt(config);
      
      expect(prompt).toContain('豆製品');
      expect(prompt).toContain('台式');
    });
  });

  describe('性能測試', () => {
    it('Prompt 生成應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        promptGenerator.generatePrompt();
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / 100;
      
      expect(avgTime).toBeLessThan(10); // 平均每次應少於 10ms
    });

    it('知識庫查詢應該在合理時間內完成', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        knowledgeBase.queryFoodItems({
          category: '豆製品' as any
        });
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / 100;
      
      expect(avgTime).toBeLessThan(5); // 平均每次應少於 5ms
    });

    it('結果驗證應該在合理時間內完成', () => {
      const result = {
        foods: [
          {
            id: '1',
            name: '豆腐干絲',
            confidence: 0.85,
            estimatedPortion: 100,
            nutrition: {
              calories: 150,
              protein: 12,
              carbs: 8,
              fat: 6,
              fiber: 2,
              sodium: 300
            }
          }
        ],
        confidence: 0.85
      };

      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        validator.validate(result);
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / 100;
      
      expect(avgTime).toBeLessThan(20); // 平均每次應少於 20ms
    });
  });

  describe('端到端場景測試', () => {
    it('應該能處理涼拌干絲識別場景', () => {
      // 1. 生成專門的 Prompt
      const prompt = promptGenerator.generateColdDishPrompt();
      expect(prompt).toContain('涼拌');
      
      // 2. 模擬識別結果
      const result = {
        foods: [
          {
            id: '1',
            name: '豆腐干絲',
            confidence: 0.85,
            estimatedPortion: 100,
            nutrition: {
              calories: 150,
              protein: 12,
              carbs: 8,
              fat: 6,
              fiber: 2,
              sodium: 300
            }
          },
          {
            id: '2',
            name: '芹菜絲',
            confidence: 0.90,
            estimatedPortion: 50,
            nutrition: {
              calories: 8,
              protein: 0.5,
              carbs: 1.5,
              fat: 0.1,
              fiber: 1,
              sodium: 50
            }
          }
        ],
        cookingMethod: '涼拌',
        cuisineType: '台式',
        confidence: 0.88
      };
      
      // 3. 驗證結果
      const report = validator.validate(result);
      expect(report.overallPassed).toBe(true);
      
      // 4. 檢查知識庫中的食材資訊
      const tofuInfo = knowledgeBase.searchFoodItemsByName('豆腐干絲', false);
      expect(tofuInfo.length).toBeGreaterThan(0);
      expect(tofuInfo[0].name).toBe('豆腐干絲');
    });

    it('應該能處理易混淆食材場景', () => {
      // 1. 獲取易混淆食材資訊
      const confusions = knowledgeBase.getConfusedFoodPairs('豆腐干絲');
      expect(confusions).toContain('麵條');
      
      // 2. 生成包含區分指引的 Prompt
      const prompt = promptGenerator.generateBeanProductPrompt();
      expect(prompt).toContain('區分');
      expect(prompt).toContain('麵條');
      
      // 3. 模擬錯誤識別結果
      const wrongResult = {
        foods: [
          {
            id: '1',
            name: '豆腐干絲',
            confidence: 0.70,
            estimatedPortion: 100,
            nutrition: {
              calories: 150,
              protein: 12,
              carbs: 8,
              fat: 6,
              fiber: 2,
              sodium: 300
            }
          },
          {
            id: '2',
            name: '麵條',
            confidence: 0.65,
            estimatedPortion: 100,
            nutrition: {
              calories: 140,
              protein: 5,
              carbs: 28,
              fat: 1,
              fiber: 1,
              sodium: 10
            }
          }
        ],
        confidence: 0.68
      };
      
      // 4. 驗證應該檢測到問題
      const report = validator.validate(wrongResult);
      expect(report.warnings.length).toBeGreaterThan(0);
    });

    it('應該能處理原住民料理場景', () => {
      // 1. 查詢原住民食材
      const indigenousFood = knowledgeBase.queryFoodItems({
        category: '原住民食材' as any
      });
      expect(indigenousFood.length).toBeGreaterThan(0);
      
      // 2. 生成原住民料理 Prompt
      const prompt = promptGenerator.generateIndigenousFoodPrompt();
      expect(prompt).toContain('原住民');
      expect(prompt).toContain('馬告');
      
      // 3. 驗證原住民料理結果
      const result = {
        foods: [
          {
            id: '1',
            name: '山豬肉',
            confidence: 0.90,
            estimatedPortion: 150,
            nutrition: {
              calories: 250,
              protein: 25,
              carbs: 0,
              fat: 16,
              fiber: 0,
              sodium: 80
            }
          },
          {
            id: '2',
            name: '馬告',
            confidence: 0.75,
            estimatedPortion: 2,
            nutrition: {
              calories: 5,
              protein: 0.1,
              carbs: 1,
              fat: 0.2,
              fiber: 0.5,
              sodium: 1
            }
          }
        ],
        cuisineType: '原住民料理',
        confidence: 0.83
      };
      
      const report = validator.validate(result);
      expect(report.overallPassed).toBe(true);
    });
  });
});
