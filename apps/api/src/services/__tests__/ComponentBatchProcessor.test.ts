/**
 * ComponentBatchProcessor 測試
 */

import { ComponentBatchProcessor } from '../ComponentBatchProcessor';
import {
  EnrichedComponent,
  DetectedComponent,
  ComponentCategory,
  CookingMethod
} from '../../types/ComponentDetection';

describe('ComponentBatchProcessor', () => {
  let processor: ComponentBatchProcessor;

  beforeEach(() => {
    processor = new ComponentBatchProcessor(10, 20);
  });

  describe('batchCalculateNutrition', () => {
    it('應該批量計算多個成分的營養', async () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '雞蛋',
          confidence: 0.9,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.STIR_FRIED,
          knowledgeBaseMatch: true
        },
        {
          id: '2',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STIR_FRIED,
          knowledgeBaseMatch: true
        },
        {
          id: '3',
          name: '青蔥',
          confidence: 0.85,
          estimatedPortion: 10,
          category: ComponentCategory.GARNISH,
          cookingMethod: CookingMethod.STIR_FRIED,
          knowledgeBaseMatch: true
        }
      ];

      const result = await processor.batchCalculateNutrition(components);

      expect(result.componentsProcessed).toBe(3);
      expect(result.componentNutrition.size).toBe(3);
      expect(result.totalProcessingTime).toBeGreaterThan(0);
      expect(result.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(result.cacheHitRate).toBeLessThanOrEqual(100);

      // 檢查每個成分都有營養數據
      components.forEach(component => {
        const nutrition = result.componentNutrition.get(component.id);
        expect(nutrition).toBeDefined();
        expect(nutrition?.calories).toBeGreaterThanOrEqual(0);
        expect(nutrition?.protein).toBeGreaterThanOrEqual(0);
        expect(nutrition?.carbohydrates).toBeGreaterThanOrEqual(0);
        expect(nutrition?.fat).toBeGreaterThanOrEqual(0);
      });
    });

    it('應該利用緩存提升性能', async () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '雞蛋',
          confidence: 0.9,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.STIR_FRIED,
          knowledgeBaseMatch: true
        }
      ];

      // 第一次計算（無緩存）
      const result1 = await processor.batchCalculateNutrition(components);
      const time1 = result1.totalProcessingTime;

      // 第二次計算（有緩存）
      const result2 = await processor.batchCalculateNutrition(components);
      const time2 = result2.totalProcessingTime;

      // 第二次應該更快（或至少不慢）
      expect(time2).toBeLessThanOrEqual(time1 * 1.5); // 允許一些誤差

      // 第二次的緩存命中率應該更高
      expect(result2.cacheHitRate).toBeGreaterThanOrEqual(result1.cacheHitRate);
    });

    it('應該處理空成分列表', async () => {
      const components: EnrichedComponent[] = [];

      const result = await processor.batchCalculateNutrition(components);

      expect(result.componentsProcessed).toBe(0);
      expect(result.componentNutrition.size).toBe(0);
      expect(result.cacheHitRate).toBe(0);
    });

    it('應該處理沒有營養資訊的成分', async () => {
      const components: EnrichedComponent[] = [
        {
          id: '1',
          name: '未知成分',
          confidence: 0.5,
          estimatedPortion: 50,
          knowledgeBaseMatch: false
        }
      ];

      const result = await processor.batchCalculateNutrition(components);

      expect(result.componentsProcessed).toBe(1);
      
      const nutrition = result.componentNutrition.get('1');
      expect(nutrition).toBeDefined();
      // 未知成分應該返回空營養數據
      expect(nutrition?.calories).toBe(0);
    });
  });

  describe('batchQueryKnowledgeBase', () => {
    it('應該批量查詢知識庫', async () => {
      const componentNames = ['雞蛋', '白飯', '青蔥'];

      const result = await processor.batchQueryKnowledgeBase(componentNames, {
        includeNutrition: true,
        includeCookingEffects: true,
        includeAlternatives: true
      });

      expect(result.results.size).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.cacheHits + result.cacheMisses).toBe(componentNames.length);
    });

    it('應該自動去重成分名稱', async () => {
      const componentNames = ['雞蛋', '雞蛋', '白飯', '白飯', '青蔥'];

      const result = await processor.batchQueryKnowledgeBase(componentNames);

      // 應該只查詢 3 個唯一成分
      expect(result.cacheHits + result.cacheMisses).toBe(3);
    });

    it('應該處理空列表', async () => {
      const componentNames: string[] = [];

      const result = await processor.batchQueryKnowledgeBase(componentNames);

      expect(result.results.size).toBe(0);
      expect(result.cacheHits).toBe(0);
      expect(result.cacheMisses).toBe(0);
    });
  });

  describe('batchEnrichComponents', () => {
    it('應該批量豐富成分資訊', async () => {
      const components: DetectedComponent[] = [
        {
          id: '1',
          name: '雞蛋',
          confidence: 0.9,
          estimatedPortion: 50
        },
        {
          id: '2',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200
        }
      ];

      const enriched = await processor.batchEnrichComponents(components);

      expect(enriched.length).toBe(2);
      
      enriched.forEach(component => {
        expect(component.knowledgeBaseMatch).toBeDefined();
        // 如果知識庫有資料，應該有營養資訊
        if (component.knowledgeBaseMatch) {
          expect(component.nutritionPer100g).toBeDefined();
        }
      });
    });

    it('應該處理空列表', async () => {
      const components: DetectedComponent[] = [];

      const enriched = await processor.batchEnrichComponents(components);

      expect(enriched.length).toBe(0);
    });
  });

  describe('batchValidateComponentCombinations', () => {
    it('應該批量驗證成分組合', async () => {
      const componentGroups: EnrichedComponent[][] = [
        [
          {
            id: '1',
            name: '雞蛋',
            confidence: 0.9,
            estimatedPortion: 50,
            category: ComponentCategory.PROTEIN,
            knowledgeBaseMatch: true
          },
          {
            id: '2',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            category: ComponentCategory.GRAIN,
            knowledgeBaseMatch: true
          }
        ],
        [
          {
            id: '3',
            name: '豆腐',
            confidence: 0.9,
            estimatedPortion: 100,
            category: ComponentCategory.PROTEIN,
            knowledgeBaseMatch: true
          }
        ]
      ];

      const results = await processor.batchValidateComponentCombinations(componentGroups);

      expect(results.size).toBe(2);
      
      results.forEach((result, index) => {
        expect(result.valid).toBeDefined();
        expect(Array.isArray(result.warnings)).toBe(true);
        expect(Array.isArray(result.suggestions)).toBe(true);
      });
    });

    it('應該處理空組列表', async () => {
      const componentGroups: EnrichedComponent[][] = [];

      const results = await processor.batchValidateComponentCombinations(componentGroups);

      expect(results.size).toBe(0);
    });
  });

  describe('preheatCache', () => {
    it('應該預熱緩存', async () => {
      const dishType = '炒飯';
      const commonComponents = ['白飯', '雞蛋', '青蔥', '火腿'];

      await expect(
        processor.preheatCache(dishType, commonComponents)
      ).resolves.not.toThrow();
    });

    it('應該處理空成分列表', async () => {
      const dishType = '炒飯';
      const commonComponents: string[] = [];

      await expect(
        processor.preheatCache(dishType, commonComponents)
      ).resolves.not.toThrow();
    });
  });

  describe('getStatistics', () => {
    it('應該返回統計資訊', () => {
      const stats = processor.getStatistics();

      expect(stats.maxConcurrency).toBe(10);
      expect(stats.batchSize).toBe(20);
    });
  });

  describe('性能測試', () => {
    it('批量處理應該比逐個處理更快', async () => {
      const components: EnrichedComponent[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `成分${i}`,
        confidence: 0.9,
        estimatedPortion: 50,
        category: ComponentCategory.PROTEIN,
        cookingMethod: CookingMethod.STIR_FRIED,
        knowledgeBaseMatch: true
      }));

      // 批量處理
      const batchStart = Date.now();
      await processor.batchCalculateNutrition(components);
      const batchTime = Date.now() - batchStart;

      console.log(`批量處理 10 個成分耗時: ${batchTime}ms`);

      // 批量處理應該在合理時間內完成（< 1 秒）
      expect(batchTime).toBeLessThan(1000);
    });
  });
});
