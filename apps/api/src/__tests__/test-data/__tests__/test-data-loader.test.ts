/**
 * TestDataLoader 單元測試
 */

import { TestDataLoader, testDataLoader } from '../test-data-loader';
import * as path from 'path';

describe('TestDataLoader', () => {
  let loader: TestDataLoader;

  beforeEach(() => {
    loader = new TestDataLoader();
  });

  describe('基礎功能', () => {
    it('應該能創建加載器實例', () => {
      expect(loader).toBeDefined();
      expect(loader).toBeInstanceOf(TestDataLoader);
    });

    it('應該能加載測試數據集', async () => {
      const dataset = await loader.loadDataset('sample-annotations.json');
      
      expect(dataset).toBeDefined();
      expect(dataset.version).toBeDefined();
      expect(dataset.testCases).toBeDefined();
      expect(Array.isArray(dataset.testCases)).toBe(true);
      expect(dataset.testCases.length).toBeGreaterThan(0);
    });

    it('應該包含統計資訊', async () => {
      const dataset = await loader.loadDataset('sample-annotations.json');
      
      expect(dataset.statistics).toBeDefined();
      expect(dataset.statistics.totalImages).toBeGreaterThan(0);
      expect(dataset.statistics.categories).toBeDefined();
      expect(dataset.statistics.difficulty).toBeDefined();
      expect(dataset.statistics.cuisineTypes).toBeDefined();
    });
  });

  describe('過濾功能', () => {
    let dataset: any;

    beforeEach(async () => {
      dataset = await loader.loadDataset('sample-annotations.json');
    });

    it('應該能根據類別過濾', () => {
      const coldDishes = loader.filterByCategory(dataset, '涼拌菜');
      
      expect(coldDishes.length).toBeGreaterThan(0);
      expect(coldDishes.every(tc => tc.category === '涼拌菜')).toBe(true);
    });

    it('應該能根據難度過濾', () => {
      const hardCases = loader.filterByDifficulty(dataset, 'hard');
      
      expect(hardCases.every(tc => tc.difficulty === 'hard')).toBe(true);
    });

    it('應該能根據料理類型過濾', () => {
      const taiwaneseCases = loader.filterByCuisineType(dataset, '台式');
      
      expect(taiwaneseCases.length).toBeGreaterThan(0);
      expect(taiwaneseCases.every(tc => tc.cuisineType === '台式')).toBe(true);
    });

    it('應該能根據標籤過濾', () => {
      const confusingCases = loader.filterByTag(dataset, '易混淆');
      
      expect(confusingCases.length).toBeGreaterThan(0);
      expect(confusingCases.every(tc => tc.tags.includes('易混淆'))).toBe(true);
    });

    it('應該能獲取易混淆食材案例', () => {
      const confusingPairs = loader.getConfusingPairsCases(dataset);
      
      expect(confusingPairs.length).toBeGreaterThan(0);
      expect(confusingPairs.every(tc => tc.category === '易混淆對照')).toBe(true);
    });

    it('應該能獲取混合食材案例', () => {
      const mixedDishes = loader.getMixedDishesCases(dataset);
      
      expect(mixedDishes.every(tc => tc.category === '混合食材菜餚')).toBe(true);
    });
  });

  describe('驗證功能', () => {
    let dataset: any;

    beforeEach(async () => {
      dataset = await loader.loadDataset('sample-annotations.json');
    });

    it('應該能驗證測試案例', () => {
      const testCase = dataset.testCases[0];
      const validation = loader.validateTestCase(testCase);
      
      expect(validation).toBeDefined();
      expect(validation.valid).toBeDefined();
      expect(validation.errors).toBeDefined();
      expect(Array.isArray(validation.errors)).toBe(true);
    });

    it('應該檢測缺少必要欄位的案例', () => {
      const invalidCase = {
        imageId: 'test',
        // 缺少其他必要欄位
      };
      
      const validation = loader.validateTestCase(invalidCase as any);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('應該驗證整個數據集', () => {
      const validation = loader.validateDataset(dataset);
      
      expect(validation).toBeDefined();
      expect(validation.valid).toBeDefined();
      expect(validation.errors).toBeDefined();
    });

    it('應該檢測食材信心度範圍', () => {
      const invalidCase = {
        imageId: 'test',
        imagePath: 'test.jpg',
        category: '測試',
        cuisineType: '中式',
        cookingMethod: '炒',
        difficulty: 'medium' as const,
        foods: [
          {
            name: '測試食材',
            category: '蔬菜',
            portion: '100g',
            confidence: 1.5, // 無效值
            visualFeatures: []
          }
        ],
        commonConfusions: [],
        tags: []
      };
      
      const validation = loader.validateTestCase(invalidCase);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('confidence'))).toBe(true);
    });
  });

  describe('統計功能', () => {
    it('應該能獲取數據集統計', async () => {
      const dataset = await loader.loadDataset('sample-annotations.json');
      const stats = loader.getStatistics(dataset);
      
      expect(stats).toBeDefined();
      expect(stats.totalImages).toBeGreaterThan(0);
      expect(Object.keys(stats.categories).length).toBeGreaterThan(0);
      expect(Object.keys(stats.difficulty).length).toBeGreaterThan(0);
      expect(Object.keys(stats.cuisineTypes).length).toBeGreaterThan(0);
    });

    it('應該能生成摘要', async () => {
      const dataset = await loader.loadDataset('sample-annotations.json');
      const summary = loader.generateSummary(dataset);
      
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('測試數據集摘要');
      expect(summary).toContain('總圖片數');
    });
  });

  describe('Mock 功能', () => {
    it('應該能創建 Mock 測試案例', () => {
      const mockCase = loader.createMockTestCase();
      
      expect(mockCase).toBeDefined();
      expect(mockCase.imageId).toBe('mock-test-case');
      expect(mockCase.foods.length).toBeGreaterThan(0);
    });

    it('應該能創建自訂 Mock 案例', () => {
      const mockCase = loader.createMockTestCase({
        imageId: 'custom-mock',
        category: '自訂類別',
        difficulty: 'hard'
      });
      
      expect(mockCase.imageId).toBe('custom-mock');
      expect(mockCase.category).toBe('自訂類別');
      expect(mockCase.difficulty).toBe('hard');
    });
  });

  describe('圖片處理', () => {
    it('應該能檢查圖片是否存在', () => {
      const exists = loader.imageExists('non-existent.jpg');
      expect(typeof exists).toBe('boolean');
    });

    it('應該能處理不存在的圖片', async () => {
      const image = await loader.loadImage('non-existent.jpg');
      expect(image).toBeNull();
    });
  });

  describe('輔助函數', () => {
    it('應該能使用 loadTestDataset 輔助函數', async () => {
      const { loadTestDataset } = require('../test-data-loader');
      const dataset = await loadTestDataset('sample-annotations.json');
      
      expect(dataset).toBeDefined();
      expect(dataset.testCases).toBeDefined();
    });

    it('應該能使用 filterTestCases 輔助函數', async () => {
      const { loadTestDataset, filterTestCases } = require('../test-data-loader');
      const dataset = await loadTestDataset('sample-annotations.json');
      
      const filtered = filterTestCases(dataset, {
        category: '涼拌菜',
        difficulty: 'medium'
      });
      
      expect(filtered.every((tc: any) => 
        tc.category === '涼拌菜' && tc.difficulty === 'medium'
      )).toBe(true);
    });

    it('應該能組合多個過濾條件', async () => {
      const { loadTestDataset, filterTestCases } = require('../test-data-loader');
      const dataset = await loadTestDataset('sample-annotations.json');
      
      const filtered = filterTestCases(dataset, {
        cuisineType: '台式',
        tag: '易混淆'
      });
      
      expect(filtered.every((tc: any) => 
        tc.cuisineType === '台式' && tc.tags.includes('易混淆')
      )).toBe(true);
    });
  });
});
