/**
 * 測試數據加載器
 * 用於加載和管理食物識別測試數據集
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FoodAnnotation {
  name: string;
  category: string;
  portion: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence: number;
  visualFeatures: string[];
  distinguishingFeatures?: string[];
}

export interface TestCase {
  imageId: string;
  imagePath: string;
  category: string;
  cuisineType: string;
  cookingMethod: string;
  difficulty: 'easy' | 'medium' | 'hard';
  foods: FoodAnnotation[];
  commonConfusions: string[];
  tags: string[];
  notes?: string;
  expectedChallenges?: string[];
}

export interface TestDataset {
  version: string;
  description: string;
  testCases: TestCase[];
  statistics: {
    totalImages: number;
    categories: Record<string, number>;
    difficulty: Record<string, number>;
    cuisineTypes: Record<string, number>;
  };
}

export class TestDataLoader {
  private dataDir: string;
  private annotationsDir: string;
  private imagesDir: string;

  constructor(baseDir?: string) {
    this.dataDir = baseDir || __dirname;
    this.annotationsDir = path.join(this.dataDir, 'annotations');
    this.imagesDir = path.join(this.dataDir, 'food-images');
  }

  /**
   * 加載完整的測試數據集
   */
  async loadDataset(annotationFile: string = 'sample-annotations.json'): Promise<TestDataset> {
    const filePath = path.join(this.annotationsDir, annotationFile);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Annotation file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as TestDataset;
  }

  /**
   * 根據類別過濾測試案例
   */
  filterByCategory(dataset: TestDataset, category: string): TestCase[] {
    return dataset.testCases.filter(tc => tc.category === category);
  }

  /**
   * 根據難度過濾測試案例
   */
  filterByDifficulty(dataset: TestDataset, difficulty: 'easy' | 'medium' | 'hard'): TestCase[] {
    return dataset.testCases.filter(tc => tc.difficulty === difficulty);
  }

  /**
   * 根據料理類型過濾測試案例
   */
  filterByCuisineType(dataset: TestDataset, cuisineType: string): TestCase[] {
    return dataset.testCases.filter(tc => tc.cuisineType === cuisineType);
  }

  /**
   * 根據標籤過濾測試案例
   */
  filterByTag(dataset: TestDataset, tag: string): TestCase[] {
    return dataset.testCases.filter(tc => tc.tags.includes(tag));
  }

  /**
   * 獲取易混淆食材的測試案例
   */
  getConfusingPairsCases(dataset: TestDataset): TestCase[] {
    return this.filterByCategory(dataset, '易混淆對照');
  }

  /**
   * 獲取混合食材菜餚的測試案例
   */
  getMixedDishesCases(dataset: TestDataset): TestCase[] {
    return this.filterByCategory(dataset, '混合食材菜餚');
  }

  /**
   * 加載圖片（如果存在）
   */
  async loadImage(imagePath: string): Promise<Buffer | null> {
    const fullPath = path.join(this.imagesDir, imagePath);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`Image not found: ${fullPath}`);
      return null;
    }

    return fs.readFileSync(fullPath);
  }

  /**
   * 檢查圖片是否存在
   */
  imageExists(imagePath: string): boolean {
    const fullPath = path.join(this.imagesDir, imagePath);
    return fs.existsSync(fullPath);
  }

  /**
   * 獲取數據集統計信息
   */
  getStatistics(dataset: TestDataset) {
    return dataset.statistics;
  }

  /**
   * 驗證測試案例的完整性
   */
  validateTestCase(testCase: TestCase): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!testCase.imageId) {
      errors.push('Missing imageId');
    }

    if (!testCase.imagePath) {
      errors.push('Missing imagePath');
    }

    if (!testCase.foods || testCase.foods.length === 0) {
      errors.push('No foods annotated');
    }

    if (testCase.foods) {
      testCase.foods.forEach((food, index) => {
        if (!food.name) {
          errors.push(`Food ${index}: Missing name`);
        }
        if (!food.category) {
          errors.push(`Food ${index}: Missing category`);
        }
        if (!food.portion) {
          errors.push(`Food ${index}: Missing portion`);
        }
        if (food.confidence < 0 || food.confidence > 1) {
          errors.push(`Food ${index}: Invalid confidence value`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證整個數據集
   */
  validateDataset(dataset: TestDataset): { valid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    dataset.testCases.forEach(testCase => {
      const validation = this.validateTestCase(testCase);
      if (!validation.valid) {
        errors[testCase.imageId] = validation.errors;
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * 生成測試案例摘要
   */
  generateSummary(dataset: TestDataset): string {
    const stats = dataset.statistics;
    let summary = `測試數據集摘要\n`;
    summary += `================\n\n`;
    summary += `版本: ${dataset.version}\n`;
    summary += `描述: ${dataset.description}\n`;
    summary += `總圖片數: ${stats.totalImages}\n\n`;

    summary += `類別分布:\n`;
    Object.entries(stats.categories).forEach(([category, count]) => {
      summary += `  - ${category}: ${count}\n`;
    });

    summary += `\n難度分布:\n`;
    Object.entries(stats.difficulty).forEach(([difficulty, count]) => {
      summary += `  - ${difficulty}: ${count}\n`;
    });

    summary += `\n料理類型分布:\n`;
    Object.entries(stats.cuisineTypes).forEach(([cuisine, count]) => {
      summary += `  - ${cuisine}: ${count}\n`;
    });

    return summary;
  }

  /**
   * 創建測試案例的副本（用於模擬測試）
   */
  createMockTestCase(overrides?: Partial<TestCase>): TestCase {
    const defaultTestCase: TestCase = {
      imageId: 'mock-test-case',
      imagePath: 'mock/test.jpg',
      category: '測試',
      cuisineType: '中式',
      cookingMethod: '炒',
      difficulty: 'medium',
      foods: [
        {
          name: '測試食材',
          category: '蔬菜',
          portion: '100g',
          confidence: 1.0,
          visualFeatures: ['綠色', '葉狀']
        }
      ],
      commonConfusions: [],
      tags: ['測試']
    };

    return { ...defaultTestCase, ...overrides };
  }
}

// 導出單例實例
export const testDataLoader = new TestDataLoader();

// 輔助函數
export async function loadTestDataset(annotationFile?: string): Promise<TestDataset> {
  return testDataLoader.loadDataset(annotationFile);
}

export function filterTestCases(
  dataset: TestDataset,
  filters: {
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    cuisineType?: string;
    tag?: string;
  }
): TestCase[] {
  let cases = dataset.testCases;

  if (filters.category) {
    cases = testDataLoader.filterByCategory(dataset, filters.category);
  }

  if (filters.difficulty) {
    cases = cases.filter(tc => tc.difficulty === filters.difficulty);
  }

  if (filters.cuisineType) {
    cases = cases.filter(tc => tc.cuisineType === filters.cuisineType);
  }

  if (filters.tag) {
    cases = cases.filter(tc => tc.tags.includes(filters.tag!));
  }

  return cases;
}
