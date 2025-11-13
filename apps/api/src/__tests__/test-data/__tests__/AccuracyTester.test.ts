/**
 * AccuracyTester 單元測試
 */

import { AccuracyTester, RecognitionResult } from '../AccuracyTester';
import { TestCase, testDataLoader } from '../test-data-loader';

describe('AccuracyTester', () => {
  let tester: AccuracyTester;
  let mockRecognitionFunction: jest.Mock;

  beforeEach(() => {
    mockRecognitionFunction = jest.fn();
    tester = new AccuracyTester(mockRecognitionFunction);
  });

  describe('基礎功能', () => {
    it('應該能創建測試器實例', () => {
      expect(tester).toBeDefined();
      expect(tester).toBeInstanceOf(AccuracyTester);
    });

    it('應該能執行單個測試案例', async () => {
      const testCase: TestCase = {
        imageId: 'test-01',
        imagePath: 'test/01.jpg',
        category: '涼拌菜',
        cuisineType: '台式',
        cookingMethod: '涼拌',
        difficulty: 'medium',
        foods: [
          {
            name: '豆腐干絲',
            category: '豆製品',
            portion: '100g',
            confidence: 1.0,
            visualFeatures: ['淡黃色', '細長條狀']
          }
        ],
        commonConfusions: ['麵條'],
        tags: ['豆製品']
      };

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: {
              name: '豆腐干絲',
              category: '豆製品',
              portion: '100g'
            },
            confidence: 0.85
          }
        ],
        overallConfidence: 0.85
      });

      const result = await tester.testSingleCase(testCase);

      expect(result).toBeDefined();
      expect(result.testCase).toBe(testCase);
      expect(result.recognitionResult).toBeDefined();
      expect(result.correct).toBe(true);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('應該能處理識別錯誤', async () => {
      const testCase: TestCase = {
        imageId: 'test-02',
        imagePath: 'test/02.jpg',
        category: '涼拌菜',
        cuisineType: '台式',
        cookingMethod: '涼拌',
        difficulty: 'medium',
        foods: [
          {
            name: '豆腐干絲',
            category: '豆製品',
            portion: '100g',
            confidence: 1.0,
            visualFeatures: []
          }
        ],
        commonConfusions: [],
        tags: []
      };

      mockRecognitionFunction.mockRejectedValue(new Error('API Error'));

      const result = await tester.testSingleCase(testCase);

      expect(result.correct).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.missingFoods).toContain('豆腐干絲');
    });
  });

  describe('批次測試', () => {
    it('應該能順序執行批次測試', async () => {
      const testCases: TestCase[] = [
        testDataLoader.createMockTestCase({ imageId: 'test-01' }),
        testDataLoader.createMockTestCase({ imageId: 'test-02' }),
        testDataLoader.createMockTestCase({ imageId: 'test-03' })
      ];

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: { name: '測試食材', category: '蔬菜', portion: '100g' },
            confidence: 0.85
          }
        ],
        overallConfidence: 0.85
      });

      const results = await tester.testBatch(testCases, { parallel: false });

      expect(results.length).toBe(3);
      expect(mockRecognitionFunction).toHaveBeenCalledTimes(3);
    });

    it('應該能並行執行批次測試', async () => {
      const testCases: TestCase[] = [
        testDataLoader.createMockTestCase({ imageId: 'test-01' }),
        testDataLoader.createMockTestCase({ imageId: 'test-02' })
      ];

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: { name: '測試食材', category: '蔬菜', portion: '100g' },
            confidence: 0.85
          }
        ],
        overallConfidence: 0.85
      });

      const results = await tester.testBatch(testCases, { 
        parallel: true,
        maxConcurrent: 2
      });

      expect(results.length).toBe(2);
    });

    it('應該能報告進度', async () => {
      const testCases: TestCase[] = [
        testDataLoader.createMockTestCase({ imageId: 'test-01' }),
        testDataLoader.createMockTestCase({ imageId: 'test-02' })
      ];

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: { name: '測試食材', category: '蔬菜', portion: '100g' },
            confidence: 0.85
          }
        ],
        overallConfidence: 0.85
      });

      const progressUpdates: Array<{ current: number; total: number }> = [];
      
      await tester.testBatch(testCases, {
        onProgress: (current, total) => {
          progressUpdates.push({ current, total });
        }
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1].current).toBe(2);
      expect(progressUpdates[progressUpdates.length - 1].total).toBe(2);
    });
  });

  describe('結果比對', () => {
    it('應該能識別正確的食材', async () => {
      const testCase: TestCase = {
        imageId: 'test-01',
        imagePath: 'test/01.jpg',
        category: '涼拌菜',
        cuisineType: '台式',
        cookingMethod: '涼拌',
        difficulty: 'medium',
        foods: [
          {
            name: '豆腐干絲',
            category: '豆製品',
            portion: '100g',
            confidence: 1.0,
            visualFeatures: []
          },
          {
            name: '芹菜絲',
            category: '蔬菜',
            portion: '50g',
            confidence: 1.0,
            visualFeatures: []
          }
        ],
        commonConfusions: [],
        tags: []
      };

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: { name: '豆腐干絲', category: '豆製品', portion: '100g' },
            confidence: 0.85
          },
          {
            food: { name: '芹菜絲', category: '蔬菜', portion: '50g' },
            confidence: 0.90
          }
        ],
        overallConfidence: 0.88
      });

      const result = await tester.testSingleCase(testCase);

      expect(result.correct).toBe(true);
      expect(result.correctFoods.length).toBe(2);
      expect(result.missingFoods.length).toBe(0);
      expect(result.extraFoods.length).toBe(0);
    });

    it('應該能識別遺漏的食材', async () => {
      const testCase: TestCase = {
        imageId: 'test-01',
        imagePath: 'test/01.jpg',
        category: '涼拌菜',
        cuisineType: '台式',
        cookingMethod: '涼拌',
        difficulty: 'medium',
        foods: [
          {
            name: '豆腐干絲',
            category: '豆製品',
            portion: '100g',
            confidence: 1.0,
            visualFeatures: []
          },
          {
            name: '芹菜絲',
            category: '蔬菜',
            portion: '50g',
            confidence: 1.0,
            visualFeatures: []
          }
        ],
        commonConfusions: [],
        tags: []
      };

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: { name: '豆腐干絲', category: '豆製品', portion: '100g' },
            confidence: 0.85
          }
        ],
        overallConfidence: 0.85
      });

      const result = await tester.testSingleCase(testCase);

      expect(result.correct).toBe(false);
      expect(result.missingFoods).toContain('芹菜絲');
    });

    it('應該能識別額外的食材', async () => {
      const testCase: TestCase = {
        imageId: 'test-01',
        imagePath: 'test/01.jpg',
        category: '涼拌菜',
        cuisineType: '台式',
        cookingMethod: '涼拌',
        difficulty: 'medium',
        foods: [
          {
            name: '豆腐干絲',
            category: '豆製品',
            portion: '100g',
            confidence: 1.0,
            visualFeatures: []
          }
        ],
        commonConfusions: [],
        tags: []
      };

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: { name: '豆腐干絲', category: '豆製品', portion: '100g' },
            confidence: 0.85
          },
          {
            food: { name: '麵條', category: '麵食', portion: '100g' },
            confidence: 0.70
          }
        ],
        overallConfidence: 0.78
      });

      const result = await tester.testSingleCase(testCase);

      expect(result.correct).toBe(false);
      expect(result.extraFoods).toContain('麵條');
    });

    it('應該能處理相似名稱的食材', async () => {
      const testCase: TestCase = {
        imageId: 'test-01',
        imagePath: 'test/01.jpg',
        category: '涼拌菜',
        cuisineType: '台式',
        cookingMethod: '涼拌',
        difficulty: 'medium',
        foods: [
          {
            name: '豆腐干絲',
            category: '豆製品',
            portion: '100g',
            confidence: 1.0,
            visualFeatures: []
          }
        ],
        commonConfusions: [],
        tags: []
      };

      mockRecognitionFunction.mockResolvedValue({
        foods: [
          {
            food: { name: '干絲', category: '豆製品', portion: '100g' },
            confidence: 0.85
          }
        ],
        overallConfidence: 0.85
      });

      const result = await tester.testSingleCase(testCase);

      expect(result.correct).toBe(true);
      expect(result.correctFoods.length).toBe(1);
    });
  });

  describe('指標計算', () => {
    beforeEach(async () => {
      // 設置測試數據
      const testCases: TestCase[] = [
        {
          imageId: 'test-01',
          imagePath: 'test/01.jpg',
          category: '涼拌菜',
          cuisineType: '台式',
          cookingMethod: '涼拌',
          difficulty: 'medium',
          foods: [
            { name: '豆腐干絲', category: '豆製品', portion: '100g', confidence: 1.0, visualFeatures: [] }
          ],
          commonConfusions: [],
          tags: []
        },
        {
          imageId: 'test-02',
          imagePath: 'test/02.jpg',
          category: '熱炒',
          cuisineType: '台式',
          cookingMethod: '炒',
          difficulty: 'hard',
          foods: [
            { name: '糯米椒', category: '蔬菜', portion: '80g', confidence: 1.0, visualFeatures: [] }
          ],
          commonConfusions: [],
          tags: []
        }
      ];

      mockRecognitionFunction
        .mockResolvedValueOnce({
          foods: [
            { food: { name: '豆腐干絲', category: '豆製品', portion: '100g' }, confidence: 0.85 }
          ],
          overallConfidence: 0.85
        })
        .mockResolvedValueOnce({
          foods: [
            { food: { name: '青椒', category: '蔬菜', portion: '80g' }, confidence: 0.75 }
          ],
          overallConfidence: 0.75
        });

      await tester.testBatch(testCases);
    });

    it('應該能計算準確度指標', () => {
      const metrics = tester.calculateMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalTests).toBe(2);
      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.accuracy).toBeLessThanOrEqual(1);
      expect(metrics.precision).toBeGreaterThanOrEqual(0);
      expect(metrics.recall).toBeGreaterThanOrEqual(0);
      expect(metrics.f1Score).toBeGreaterThanOrEqual(0);
    });

    it('應該能計算平均信心度', () => {
      const metrics = tester.calculateMetrics();

      expect(metrics.avgConfidence).toBeGreaterThan(0);
      expect(metrics.avgConfidence).toBeLessThanOrEqual(1);
    });

    it('應該能計算平均處理時間', () => {
      const metrics = tester.calculateMetrics();

      expect(metrics.avgProcessingTime).toBeGreaterThan(0);
    });

    it('應該能生成混淆矩陣', () => {
      const metrics = tester.calculateMetrics();

      expect(metrics.confusionMatrix).toBeDefined();
      expect(metrics.confusionMatrix.size).toBeGreaterThan(0);
    });

    it('應該能計算各類別指標', () => {
      const metrics = tester.calculateMetrics();

      expect(metrics.categoryMetrics).toBeDefined();
      expect(metrics.categoryMetrics.size).toBeGreaterThan(0);
      
      for (const [_, categoryMetric] of metrics.categoryMetrics) {
        expect(categoryMetric.totalTests).toBeGreaterThan(0);
        expect(categoryMetric.accuracy).toBeGreaterThanOrEqual(0);
        expect(categoryMetric.accuracy).toBeLessThanOrEqual(1);
      }
    });

    it('應該能計算各難度指標', () => {
      const metrics = tester.calculateMetrics();

      expect(metrics.difficultyMetrics).toBeDefined();
      expect(metrics.difficultyMetrics.size).toBeGreaterThan(0);
      
      for (const [_, difficultyMetric] of metrics.difficultyMetrics) {
        expect(difficultyMetric.totalTests).toBeGreaterThan(0);
        expect(difficultyMetric.accuracy).toBeGreaterThanOrEqual(0);
        expect(difficultyMetric.accuracy).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('錯誤模式識別', () => {
    beforeEach(async () => {
      const testCases: TestCase[] = [
        {
          imageId: 'test-01',
          imagePath: 'test/01.jpg',
          category: '涼拌菜',
          cuisineType: '台式',
          cookingMethod: '涼拌',
          difficulty: 'medium',
          foods: [
            { name: '豆腐干絲', category: '豆製品', portion: '100g', confidence: 1.0, visualFeatures: [] }
          ],
          commonConfusions: ['麵條'],
          tags: []
        },
        {
          imageId: 'test-02',
          imagePath: 'test/02.jpg',
          category: '涼拌菜',
          cuisineType: '台式',
          cookingMethod: '涼拌',
          difficulty: 'medium',
          foods: [
            { name: '豆腐干絲', category: '豆製品', portion: '100g', confidence: 1.0, visualFeatures: [] }
          ],
          commonConfusions: ['麵條'],
          tags: []
        }
      ];

      mockRecognitionFunction
        .mockResolvedValueOnce({
          foods: [
            { food: { name: '麵條', category: '麵食', portion: '100g' }, confidence: 0.75 }
          ],
          overallConfidence: 0.75
        })
        .mockResolvedValueOnce({
          foods: [
            { food: { name: '麵條', category: '麵食', portion: '100g' }, confidence: 0.70 }
          ],
          overallConfidence: 0.70
        });

      await tester.testBatch(testCases);
    });

    it('應該能識別常見錯誤模式', () => {
      const patterns = tester.identifyMistakePatterns();

      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('應該按頻率排序錯誤模式', () => {
      const patterns = tester.identifyMistakePatterns();

      if (patterns.length > 1) {
        expect(patterns[0].frequency).toBeGreaterThanOrEqual(patterns[1].frequency);
      }
    });

    it('應該包含錯誤模式的詳細資訊', () => {
      const patterns = tester.identifyMistakePatterns();

      expect(patterns[0]).toHaveProperty('incorrectIdentification');
      expect(patterns[0]).toHaveProperty('correctIdentification');
      expect(patterns[0]).toHaveProperty('frequency');
      expect(patterns[0]).toHaveProperty('testCases');
      expect(patterns[0]).toHaveProperty('avgConfidence');
    });
  });

  describe('結果管理', () => {
    it('應該能獲取所有測試結果', async () => {
      const testCase = testDataLoader.createMockTestCase();
      mockRecognitionFunction.mockResolvedValue({
        foods: [
          { food: { name: '測試食材', category: '蔬菜', portion: '100g' }, confidence: 0.85 }
        ],
        overallConfidence: 0.85
      });

      await tester.testSingleCase(testCase);
      const results = tester.getTestResults();

      expect(results.length).toBe(1);
    });

    it('應該能獲取失敗的測試', async () => {
      const testCase = testDataLoader.createMockTestCase();
      mockRecognitionFunction.mockResolvedValue({
        foods: [
          { food: { name: '錯誤食材', category: '蔬菜', portion: '100g' }, confidence: 0.85 }
        ],
        overallConfidence: 0.85
      });

      await tester.testSingleCase(testCase);
      const failedTests = tester.getFailedTests();

      expect(failedTests.length).toBeGreaterThan(0);
    });

    it('應該能獲取成功的測試', async () => {
      const testCase = testDataLoader.createMockTestCase();
      mockRecognitionFunction.mockResolvedValue({
        foods: [
          { food: { name: '測試食材', category: '蔬菜', portion: '100g' }, confidence: 0.85 }
        ],
        overallConfidence: 0.85
      });

      await tester.testSingleCase(testCase);
      const successfulTests = tester.getSuccessfulTests();

      expect(successfulTests.length).toBe(1);
    });

    it('應該能清除測試結果', async () => {
      const testCase = testDataLoader.createMockTestCase();
      mockRecognitionFunction.mockResolvedValue({
        foods: [
          { food: { name: '測試食材', category: '蔬菜', portion: '100g' }, confidence: 0.85 }
        ],
        overallConfidence: 0.85
      });

      await tester.testSingleCase(testCase);
      expect(tester.getTestResults().length).toBe(1);

      tester.clearResults();
      expect(tester.getTestResults().length).toBe(0);
    });
  });
});
