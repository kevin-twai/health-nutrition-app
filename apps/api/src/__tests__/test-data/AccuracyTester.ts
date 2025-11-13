/**
 * 準確度測試工具
 * 用於測試食物識別系統的準確度並生成詳細報告
 */

import { TestCase, TestDataset, testDataLoader } from './test-data-loader';

export interface RecognitionResult {
  foods: Array<{
    food: {
      name: string;
      category: string;
      portion: string;
      [key: string]: any;
    };
    confidence: number;
  }>;
  overallConfidence: number;
  description?: string;
  cookingMethod?: string;
  cuisineType?: string;
}

export interface TestResult {
  testCase: TestCase;
  recognitionResult: RecognitionResult;
  correct: boolean;
  correctFoods: string[];
  incorrectFoods: string[];
  missingFoods: string[];
  extraFoods: string[];
  processingTime: number;
  errors?: string[];
}

export interface AccuracyMetrics {
  totalTests: number;
  correctTests: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  avgConfidence: number;
  avgProcessingTime: number;
  confusionMatrix: Map<string, Map<string, number>>;
  categoryMetrics: Map<string, CategoryMetrics>;
  difficultyMetrics: Map<string, DifficultyMetrics>;
}

export interface CategoryMetrics {
  category: string;
  totalTests: number;
  correctTests: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface DifficultyMetrics {
  difficulty: string;
  totalTests: number;
  correctTests: number;
  accuracy: number;
  avgConfidence: number;
}

export interface MistakePattern {
  incorrectIdentification: string;
  correctIdentification: string;
  frequency: number;
  testCases: string[];
  avgConfidence: number;
}

export type RecognitionFunction = (imageBuffer: Buffer | null, testCase: TestCase) => Promise<RecognitionResult>;

export class AccuracyTester {
  private testResults: TestResult[] = [];
  private recognitionFunction: RecognitionFunction;

  constructor(recognitionFunction: RecognitionFunction) {
    this.recognitionFunction = recognitionFunction;
  }

  /**
   * 執行單個測試案例
   */
  async testSingleCase(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // 加載圖片（如果存在）
      const imageBuffer = await testDataLoader.loadImage(testCase.imagePath);
      
      // 執行識別
      const recognitionResult = await this.recognitionFunction(imageBuffer, testCase);
      
      const processingTime = Date.now() - startTime;

      // 比對結果
      const comparison = this.compareResults(testCase, recognitionResult);

      const testResult: TestResult = {
        testCase,
        recognitionResult,
        correct: comparison.correct,
        correctFoods: comparison.correctFoods,
        incorrectFoods: comparison.incorrectFoods,
        missingFoods: comparison.missingFoods,
        extraFoods: comparison.extraFoods,
        processingTime
      };

      this.testResults.push(testResult);
      return testResult;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const testResult: TestResult = {
        testCase,
        recognitionResult: {
          foods: [],
          overallConfidence: 0
        },
        correct: false,
        correctFoods: [],
        incorrectFoods: [],
        missingFoods: testCase.foods.map(f => f.name),
        extraFoods: [],
        processingTime,
        errors: [error instanceof Error ? error.message : String(error)]
      };

      this.testResults.push(testResult);
      return testResult;
    }
  }

  /**
   * 批次測試多個案例
   */
  async testBatch(testCases: TestCase[], options?: {
    parallel?: boolean;
    maxConcurrent?: number;
    onProgress?: (current: number, total: number) => void;
  }): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const total = testCases.length;

    if (options?.parallel) {
      // 並行測試（控制並發數）
      const maxConcurrent = options.maxConcurrent || 3;
      const chunks: TestCase[][] = [];
      
      for (let i = 0; i < testCases.length; i += maxConcurrent) {
        chunks.push(testCases.slice(i, i + maxConcurrent));
      }

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map(tc => this.testSingleCase(tc))
        );
        results.push(...chunkResults);
        
        if (options.onProgress) {
          options.onProgress(results.length, total);
        }
      }
    } else {
      // 順序測試
      for (let i = 0; i < testCases.length; i++) {
        const result = await this.testSingleCase(testCases[i]);
        results.push(result);
        
        if (options?.onProgress) {
          options.onProgress(i + 1, total);
        }
      }
    }

    return results;
  }

  /**
   * 測試整個數據集
   */
  async testDataset(dataset: TestDataset, options?: {
    parallel?: boolean;
    maxConcurrent?: number;
    onProgress?: (current: number, total: number) => void;
  }): Promise<TestResult[]> {
    return this.testBatch(dataset.testCases, options);
  }

  /**
   * 比對識別結果與標註
   */
  private compareResults(testCase: TestCase, recognitionResult: RecognitionResult): {
    correct: boolean;
    correctFoods: string[];
    incorrectFoods: string[];
    missingFoods: string[];
    extraFoods: string[];
  } {
    const expectedFoods = new Set(testCase.foods.map(f => this.normalizeFoodName(f.name)));
    const recognizedFoods = new Set(
      recognitionResult.foods.map(f => this.normalizeFoodName(f.food.name))
    );

    const correctFoods: string[] = [];
    const incorrectFoods: string[] = [];
    const missingFoods: string[] = [];
    const extraFoods: string[] = [];

    // 檢查識別出的食材
    for (const recognized of recognitionResult.foods) {
      const normalizedName = this.normalizeFoodName(recognized.food.name);
      if (expectedFoods.has(normalizedName)) {
        correctFoods.push(recognized.food.name);
      } else {
        // 檢查是否為部分匹配或相似名稱
        const isPartialMatch = Array.from(expectedFoods).some(expected =>
          this.isSimilarFood(normalizedName, expected)
        );
        
        if (isPartialMatch) {
          correctFoods.push(recognized.food.name);
        } else {
          extraFoods.push(recognized.food.name);
        }
      }
    }

    // 檢查遺漏的食材
    for (const expected of testCase.foods) {
      const normalizedName = this.normalizeFoodName(expected.name);
      const wasRecognized = recognitionResult.foods.some(r =>
        this.isSimilarFood(this.normalizeFoodName(r.food.name), normalizedName)
      );
      
      if (!wasRecognized) {
        missingFoods.push(expected.name);
      }
    }

    // 判斷是否完全正確（主要食材都識別出來，且沒有重大錯誤）
    const majorFoods = testCase.foods.filter(f => f.confidence >= 0.9);
    const majorFoodsRecognized = majorFoods.every(f =>
      recognitionResult.foods.some(r =>
        this.isSimilarFood(
          this.normalizeFoodName(r.food.name),
          this.normalizeFoodName(f.name)
        )
      )
    );

    const correct = majorFoodsRecognized && extraFoods.length === 0;

    return {
      correct,
      correctFoods,
      incorrectFoods,
      missingFoods,
      extraFoods
    };
  }

  /**
   * 標準化食材名稱（用於比對）
   */
  private normalizeFoodName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[（(].*?[)）]/g, '') // 移除括號內容
      .trim();
  }

  /**
   * 判斷兩個食材名稱是否相似
   */
  private isSimilarFood(name1: string, name2: string): boolean {
    const n1 = this.normalizeFoodName(name1);
    const n2 = this.normalizeFoodName(name2);

    // 完全匹配
    if (n1 === n2) return true;

    // 包含關係
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // 計算相似度（簡單的字符匹配）
    const similarity = this.calculateSimilarity(n1, n2);
    return similarity > 0.8;
  }

  /**
   * 計算字符串相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 計算編輯距離
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 計算準確度指標
   */
  calculateMetrics(): AccuracyMetrics {
    const totalTests = this.testResults.length;
    const correctTests = this.testResults.filter(r => r.correct).length;

    // 計算 Precision, Recall, F1
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const result of this.testResults) {
      truePositives += result.correctFoods.length;
      falsePositives += result.extraFoods.length;
      falseNegatives += result.missingFoods.length;
    }

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = (2 * precision * recall) / (precision + recall) || 0;

    // 計算平均信心度和處理時間
    const avgConfidence = this.testResults.reduce(
      (sum, r) => sum + r.recognitionResult.overallConfidence, 0
    ) / totalTests;

    const avgProcessingTime = this.testResults.reduce(
      (sum, r) => sum + r.processingTime, 0
    ) / totalTests;

    // 生成混淆矩陣
    const confusionMatrix = this.generateConfusionMatrix();

    // 計算各類別的指標
    const categoryMetrics = this.calculateCategoryMetrics();

    // 計算各難度的指標
    const difficultyMetrics = this.calculateDifficultyMetrics();

    return {
      totalTests,
      correctTests,
      accuracy: correctTests / totalTests,
      precision,
      recall,
      f1Score,
      avgConfidence,
      avgProcessingTime,
      confusionMatrix,
      categoryMetrics,
      difficultyMetrics
    };
  }

  /**
   * 生成混淆矩陣
   */
  private generateConfusionMatrix(): Map<string, Map<string, number>> {
    const matrix = new Map<string, Map<string, number>>();

    for (const result of this.testResults) {
      for (const expected of result.testCase.foods) {
        const expectedName = expected.name;
        
        if (!matrix.has(expectedName)) {
          matrix.set(expectedName, new Map());
        }

        // 找到對應的識別結果
        const recognized = result.recognitionResult.foods.find(f =>
          this.isSimilarFood(f.food.name, expectedName)
        );

        if (recognized) {
          const recognizedName = recognized.food.name;
          const innerMap = matrix.get(expectedName)!;
          innerMap.set(recognizedName, (innerMap.get(recognizedName) || 0) + 1);
        } else {
          // 未識別出來
          const innerMap = matrix.get(expectedName)!;
          innerMap.set('未識別', (innerMap.get('未識別') || 0) + 1);
        }
      }

      // 記錄額外識別的食材
      for (const extra of result.extraFoods) {
        if (!matrix.has('額外識別')) {
          matrix.set('額外識別', new Map());
        }
        const innerMap = matrix.get('額外識別')!;
        innerMap.set(extra, (innerMap.get(extra) || 0) + 1);
      }
    }

    return matrix;
  }

  /**
   * 計算各類別的指標
   */
  private calculateCategoryMetrics(): Map<string, CategoryMetrics> {
    const categoryMap = new Map<string, TestResult[]>();

    // 按類別分組
    for (const result of this.testResults) {
      const category = result.testCase.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(result);
    }

    const metrics = new Map<string, CategoryMetrics>();

    // 計算每個類別的指標
    for (const [category, results] of categoryMap.entries()) {
      const totalTests = results.length;
      const correctTests = results.filter(r => r.correct).length;

      let truePositives = 0;
      let falsePositives = 0;
      let falseNegatives = 0;

      for (const result of results) {
        truePositives += result.correctFoods.length;
        falsePositives += result.extraFoods.length;
        falseNegatives += result.missingFoods.length;
      }

      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1Score = (2 * precision * recall) / (precision + recall) || 0;

      metrics.set(category, {
        category,
        totalTests,
        correctTests,
        accuracy: correctTests / totalTests,
        precision,
        recall,
        f1Score
      });
    }

    return metrics;
  }

  /**
   * 計算各難度的指標
   */
  private calculateDifficultyMetrics(): Map<string, DifficultyMetrics> {
    const difficultyMap = new Map<string, TestResult[]>();

    // 按難度分組
    for (const result of this.testResults) {
      const difficulty = result.testCase.difficulty;
      if (!difficultyMap.has(difficulty)) {
        difficultyMap.set(difficulty, []);
      }
      difficultyMap.get(difficulty)!.push(result);
    }

    const metrics = new Map<string, DifficultyMetrics>();

    // 計算每個難度的指標
    for (const [difficulty, results] of difficultyMap.entries()) {
      const totalTests = results.length;
      const correctTests = results.filter(r => r.correct).length;
      const avgConfidence = results.reduce(
        (sum, r) => sum + r.recognitionResult.overallConfidence, 0
      ) / totalTests;

      metrics.set(difficulty, {
        difficulty,
        totalTests,
        correctTests,
        accuracy: correctTests / totalTests,
        avgConfidence
      });
    }

    return metrics;
  }

  /**
   * 識別常見錯誤模式
   */
  identifyMistakePatterns(): MistakePattern[] {
    const mistakes = new Map<string, {
      correct: string;
      frequency: number;
      testCases: string[];
      confidences: number[];
    }>();

    for (const result of this.testResults) {
      // 檢查遺漏的食材
      for (const missing of result.missingFoods) {
        const key = `未識別:${missing}`;
        if (!mistakes.has(key)) {
          mistakes.set(key, {
            correct: missing,
            frequency: 0,
            testCases: [],
            confidences: []
          });
        }
        const mistake = mistakes.get(key)!;
        mistake.frequency++;
        mistake.testCases.push(result.testCase.imageId);
        mistake.confidences.push(result.recognitionResult.overallConfidence);
      }

      // 檢查錯誤識別的食材
      for (const extra of result.extraFoods) {
        // 嘗試找到最可能的正確答案
        const possibleCorrect = result.testCase.foods.find(f =>
          result.missingFoods.includes(f.name)
        );

        if (possibleCorrect) {
          const key = `${extra}→${possibleCorrect.name}`;
          if (!mistakes.has(key)) {
            mistakes.set(key, {
              correct: possibleCorrect.name,
              frequency: 0,
              testCases: [],
              confidences: []
            });
          }
          const mistake = mistakes.get(key)!;
          mistake.frequency++;
          mistake.testCases.push(result.testCase.imageId);
          mistake.confidences.push(result.recognitionResult.overallConfidence);
        }
      }
    }

    // 轉換為 MistakePattern 數組並排序
    const patterns: MistakePattern[] = [];
    for (const [key, data] of mistakes.entries()) {
      const [incorrect, correct] = key.includes('→') 
        ? key.split('→')
        : [key.replace('未識別:', ''), data.correct];

      patterns.push({
        incorrectIdentification: incorrect,
        correctIdentification: correct,
        frequency: data.frequency,
        testCases: data.testCases,
        avgConfidence: data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length
      });
    }

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * 獲取所有測試結果
   */
  getTestResults(): TestResult[] {
    return this.testResults;
  }

  /**
   * 清除測試結果
   */
  clearResults(): void {
    this.testResults = [];
  }

  /**
   * 獲取失敗的測試案例
   */
  getFailedTests(): TestResult[] {
    return this.testResults.filter(r => !r.correct);
  }

  /**
   * 獲取成功的測試案例
   */
  getSuccessfulTests(): TestResult[] {
    return this.testResults.filter(r => r.correct);
  }
}
