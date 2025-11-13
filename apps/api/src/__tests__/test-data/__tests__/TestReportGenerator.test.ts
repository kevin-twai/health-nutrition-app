/**
 * TestReportGenerator 單元測試
 */

import { TestReportGenerator } from '../TestReportGenerator';
import { AccuracyMetrics, TestResult, MistakePattern } from '../AccuracyTester';
import { testDataLoader } from '../test-data-loader';
import * as fs from 'fs';
import * as path from 'path';

describe('TestReportGenerator', () => {
  let generator: TestReportGenerator;
  let mockMetrics: AccuracyMetrics;
  let mockTestResults: TestResult[];
  let mockMistakePatterns: MistakePattern[];

  beforeEach(() => {
    generator = new TestReportGenerator();

    // 創建 Mock 數據
    mockMetrics = {
      totalTests: 10,
      correctTests: 8,
      accuracy: 0.80,
      precision: 0.85,
      recall: 0.82,
      f1Score: 0.835,
      avgConfidence: 0.78,
      avgProcessingTime: 3500,
      confusionMatrix: new Map([
        ['豆腐干絲', new Map([['豆腐干絲', 5], ['麵條', 2]])],
        ['米粉', new Map([['米粉', 3], ['粉絲', 1]])]
      ]),
      categoryMetrics: new Map([
        ['涼拌菜', {
          category: '涼拌菜',
          totalTests: 5,
          correctTests: 4,
          accuracy: 0.80,
          precision: 0.85,
          recall: 0.80,
          f1Score: 0.825
        }],
        ['熱炒', {
          category: '熱炒',
          totalTests: 5,
          correctTests: 4,
          accuracy: 0.80,
          precision: 0.85,
          recall: 0.84,
          f1Score: 0.845
        }]
      ]),
      difficultyMetrics: new Map([
        ['medium', {
          difficulty: 'medium',
          totalTests: 6,
          correctTests: 5,
          accuracy: 0.833,
          avgConfidence: 0.80
        }],
        ['hard', {
          difficulty: 'hard',
          totalTests: 4,
          correctTests: 3,
          accuracy: 0.75,
          avgConfidence: 0.75
        }]
      ])
    };

    mockTestResults = [
      {
        testCase: testDataLoader.createMockTestCase({ imageId: 'test-01' }),
        recognitionResult: {
          foods: [
            {
              food: { name: '測試食材', category: '蔬菜', portion: '100g' },
              confidence: 0.85
            }
          ],
          overallConfidence: 0.85
        },
        correct: true,
        correctFoods: ['測試食材'],
        incorrectFoods: [],
        missingFoods: [],
        extraFoods: [],
        processingTime: 3000
      },
      {
        testCase: testDataLoader.createMockTestCase({ imageId: 'test-02' }),
        recognitionResult: {
          foods: [
            {
              food: { name: '錯誤食材', category: '蔬菜', portion: '100g' },
              confidence: 0.70
            }
          ],
          overallConfidence: 0.70
        },
        correct: false,
        correctFoods: [],
        incorrectFoods: [],
        missingFoods: ['測試食材'],
        extraFoods: ['錯誤食材'],
        processingTime: 4000
      }
    ];

    mockMistakePatterns = [
      {
        incorrectIdentification: '麵條',
        correctIdentification: '豆腐干絲',
        frequency: 3,
        testCases: ['test-01', 'test-02', 'test-03'],
        avgConfidence: 0.72
      },
      {
        incorrectIdentification: '粉絲',
        correctIdentification: '米粉',
        frequency: 2,
        testCases: ['test-04', 'test-05'],
        avgConfidence: 0.68
      }
    ];
  });

  describe('基礎功能', () => {
    it('應該能創建報告生成器實例', () => {
      expect(generator).toBeDefined();
      expect(generator).toBeInstanceOf(TestReportGenerator);
    });

    it('應該能生成 Markdown 報告', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
      expect(report).toContain('# 食物識別準確度測試報告');
    });

    it('應該能生成 JSON 報告', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'json' }
      );

      expect(report).toBeDefined();
      expect(() => JSON.parse(report)).not.toThrow();
      
      const parsed = JSON.parse(report);
      expect(parsed.metrics).toBeDefined();
      expect(parsed.categoryMetrics).toBeDefined();
      expect(parsed.mistakePatterns).toBeDefined();
    });

    it('應該能生成 HTML 報告', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'html' }
      );

      expect(report).toBeDefined();
      expect(report).toContain('<!DOCTYPE html>');
      expect(report).toContain('<html');
      expect(report).toContain('</html>');
    });
  });

  describe('Markdown 報告內容', () => {
    let report: string;

    beforeEach(async () => {
      report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );
    });

    it('應該包含整體指標', () => {
      expect(report).toContain('## 整體指標');
      expect(report).toContain('總測試數');
      expect(report).toContain('準確率');
      expect(report).toContain('精確率');
      expect(report).toContain('召回率');
      expect(report).toContain('F1 分數');
    });

    it('應該包含目標達成情況', () => {
      expect(report).toContain('目標達成情況');
      expect(report).toContain('整體準確率');
      expect(report).toContain('85%');
    });

    it('應該包含類別表現', () => {
      expect(report).toContain('## 各類別表現');
      expect(report).toContain('涼拌菜');
      expect(report).toContain('熱炒');
    });

    it('應該包含難度表現', () => {
      expect(report).toContain('## 各難度表現');
      expect(report).toContain('medium');
      expect(report).toContain('hard');
    });

    it('應該包含常見錯誤模式', () => {
      expect(report).toContain('## 常見錯誤模式');
      expect(report).toContain('麵條');
      expect(report).toContain('豆腐干絲');
    });

    it('應該包含改進建議', () => {
      expect(report).toContain('## 改進建議');
    });
  });

  describe('報告選項', () => {
    it('應該能包含混淆矩陣', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown', includeConfusionMatrix: true }
      );

      expect(report).toContain('## 混淆矩陣');
    });

    it('應該能排除混淆矩陣', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown', includeConfusionMatrix: false }
      );

      expect(report).not.toContain('## 混淆矩陣');
    });

    it('應該能包含詳細結果', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown', includeDetailedResults: true }
      );

      expect(report).toContain('## 詳細測試結果');
      expect(report).toContain('test-01');
      expect(report).toContain('test-02');
    });

    it('應該能排除改進建議', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown', includeRecommendations: false }
      );

      expect(report).not.toContain('## 改進建議');
    });
  });

  describe('改進建議生成', () => {
    it('應該在準確率低時提供建議', async () => {
      const lowAccuracyMetrics = {
        ...mockMetrics,
        accuracy: 0.70
      };

      const report = await generator.generateReport(
        lowAccuracyMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('整體準確率未達標');
      expect(report).toContain('Prompt 工程');
    });

    it('應該在召回率低時提供建議', async () => {
      const lowRecallMetrics = {
        ...mockMetrics,
        recall: 0.70
      };

      const report = await generator.generateReport(
        lowRecallMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('召回率未達標');
      expect(report).toContain('遺漏');
    });

    it('應該在精確率低時提供建議', async () => {
      const lowPrecisionMetrics = {
        ...mockMetrics,
        precision: 0.80
      };

      const report = await generator.generateReport(
        lowPrecisionMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('精確率未達標');
    });

    it('應該基於錯誤模式提供建議', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('常見錯誤模式分析');
      expect(report).toContain('麵條');
      expect(report).toContain('豆腐干絲');
    });

    it('應該在處理時間過長時提供建議', async () => {
      const slowMetrics = {
        ...mockMetrics,
        avgProcessingTime: 9000
      };

      const report = await generator.generateReport(
        slowMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('處理時間過長');
    });
  });

  describe('失敗案例分析', () => {
    it('應該分析失敗案例', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('## 失敗案例分析');
      expect(report).toContain('test-02');
    });

    it('應該按類別分組失敗案例', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('按類別分布');
    });

    it('應該列出最嚴重的失敗案例', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('最嚴重的失敗案例');
    });
  });

  describe('JSON 報告內容', () => {
    it('應該包含所有必要欄位', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'json' }
      );

      const parsed = JSON.parse(report);
      
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.metrics).toBeDefined();
      expect(parsed.metrics.totalTests).toBe(10);
      expect(parsed.metrics.accuracy).toBe(0.80);
      expect(parsed.categoryMetrics).toBeDefined();
      expect(parsed.difficultyMetrics).toBeDefined();
      expect(parsed.mistakePatterns).toBeDefined();
      expect(parsed.testResults).toBeDefined();
    });

    it('應該包含測試結果摘要', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'json' }
      );

      const parsed = JSON.parse(report);
      
      expect(parsed.testResults.length).toBe(2);
      expect(parsed.testResults[0].imageId).toBe('test-01');
      expect(parsed.testResults[0].correct).toBe(true);
    });
  });

  describe('文件保存', () => {
    afterEach(() => {
      // 清理測試文件
      const testDir = path.join(__dirname, '../test-results');
      if (fs.existsSync(testDir)) {
        const files = fs.readdirSync(testDir);
        for (const file of files) {
          if (file.startsWith('accuracy-report-')) {
            fs.unlinkSync(path.join(testDir, file));
          }
        }
      }
    });

    it('應該能保存報告到文件', async () => {
      const content = '測試報告內容';
      const filename = 'test-report.md';
      
      const filepath = await generator.saveReport(content, filename);
      
      expect(fs.existsSync(filepath)).toBe(true);
      const savedContent = fs.readFileSync(filepath, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('應該能生成並保存報告', async () => {
      const filepath = await generator.generateAndSave(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(fs.existsSync(filepath)).toBe(true);
      expect(filepath).toContain('accuracy-report-');
      expect(filepath).toContain('.md');
    });

    it('應該能保存 JSON 格式報告', async () => {
      const filepath = await generator.generateAndSave(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'json' }
      );

      expect(fs.existsSync(filepath)).toBe(true);
      expect(filepath).toContain('.json');
      
      const content = fs.readFileSync(filepath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('應該能保存 HTML 格式報告', async () => {
      const filepath = await generator.generateAndSave(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'html' }
      );

      expect(fs.existsSync(filepath)).toBe(true);
      expect(filepath).toContain('.html');
      
      const content = fs.readFileSync(filepath, 'utf-8');
      expect(content).toContain('<!DOCTYPE html>');
    });
  });

  describe('表格生成', () => {
    it('應該生成類別指標表格', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('| 類別 |');
      expect(report).toContain('| 涼拌菜 |');
      expect(report).toContain('| 熱炒 |');
    });

    it('應該生成難度指標表格', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('| 難度 |');
      expect(report).toContain('| medium |');
      expect(report).toContain('| hard |');
    });

    it('應該生成錯誤模式表格', async () => {
      const report = await generator.generateReport(
        mockMetrics,
        mockTestResults,
        mockMistakePatterns,
        { format: 'markdown' }
      );

      expect(report).toContain('| 錯誤識別 |');
      expect(report).toContain('| 麵條 |');
      expect(report).toContain('| 粉絲 |');
    });
  });
});
