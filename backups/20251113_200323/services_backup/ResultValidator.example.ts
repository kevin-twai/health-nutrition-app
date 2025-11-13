/**
 * ResultValidator 使用範例
 * Example Usage of ResultValidator
 */

import { ResultValidator, RecognitionResultForValidation } from './ResultValidator';
import { AsianCuisineKnowledgeBase } from './AsianCuisineKnowledgeBase';

/**
 * 範例 1: 基本驗證
 */
async function example1_BasicValidation() {
  console.log('\n=== 範例 1: 基本驗證 ===\n');

  // 創建驗證器
  const validator = new ResultValidator();

  // 模擬識別結果
  const result: RecognitionResultForValidation = {
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

  // 執行驗證
  const report = validator.validate(result);

  // 輸出報告
  console.log(validator.generateReportSummary(report));
}

/**
 * 範例 2: 檢測易混淆食材
 */
async function example2_ConfusedFoods() {
  console.log('\n=== 範例 2: 檢測易混淆食材 ===\n');

  const validator = new ResultValidator();

  // 模擬同時識別到豆腐干絲和麵條（這是錯誤的）
  const result: RecognitionResultForValidation = {
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
  console.log(validator.generateReportSummary(report));
}

/**
 * 範例 3: 涼拌菜完整性檢查
 */
async function example3_ColdDishCompleteness() {
  console.log('\n=== 範例 3: 涼拌菜完整性檢查 ===\n');

  const validator = new ResultValidator();

  // 模擬不完整的涼拌菜（缺少調味料）
  const result: RecognitionResultForValidation = {
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
      // 缺少調味料
    ],
    cookingMethod: '涼拌',
    cuisineType: '台式',
    confidence: 0.88
  };

  const report = validator.validate(result);
  console.log(validator.generateReportSummary(report));
}

/**
 * 範例 4: 營養值異常檢測
 */
async function example4_NutritionAnomalies() {
  console.log('\n=== 範例 4: 營養值異常檢測 ===\n');

  const validator = new ResultValidator();

  // 模擬營養值異常的結果
  const result: RecognitionResultForValidation = {
    foods: [
      {
        id: '1',
        name: '炸雞',
        confidence: 0.90,
        estimatedPortion: 100,
        nutrition: {
          calories: 1200, // 異常高
          protein: 25,
          carbs: 15,
          fat: 80,
          fiber: 0,
          sodium: 800
        }
      }
    ],
    cookingMethod: '油炸',
    cuisineType: '台式',
    confidence: 0.90
  };

  const report = validator.validate(result);
  console.log(validator.generateReportSummary(report));
}

/**
 * 範例 5: 自訂驗證規則
 */
async function example5_CustomRule() {
  console.log('\n=== 範例 5: 自訂驗證規則 ===\n');

  const validator = new ResultValidator();

  // 添加自訂規則
  validator.addRule({
    name: '素食檢查',
    description: '檢查是否為素食',
    severity: 'info' as any,
    enabled: true,
    check: (result, context) => {
      const meatKeywords = ['肉', '雞', '豬', '牛', '魚', '蝦', '蟹'];
      const foodNames = result.foods.map(f => f.name);
      
      const hasMeat = meatKeywords.some(keyword => 
        foodNames.some(name => name.includes(keyword))
      );

      if (hasMeat) {
        return {
          passed: false,
          ruleName: '素食檢查',
          severity: 'info' as any,
          message: '此餐點包含肉類，不適合素食者',
          affectedFoods: foodNames.filter(name => 
            meatKeywords.some(keyword => name.includes(keyword))
          )
        };
      }

      return {
        passed: true,
        ruleName: '素食檢查',
        severity: 'info' as any,
        message: '此餐點為素食'
      };
    }
  });

  const result: RecognitionResultForValidation = {
    foods: [
      {
        id: '1',
        name: '炒青菜',
        confidence: 0.90,
        estimatedPortion: 150,
        nutrition: {
          calories: 60,
          protein: 3,
          carbs: 8,
          fat: 2,
          fiber: 3,
          sodium: 200
        }
      },
      {
        id: '2',
        name: '豆腐',
        confidence: 0.85,
        estimatedPortion: 100,
        nutrition: {
          calories: 80,
          protein: 8,
          carbs: 2,
          fat: 4,
          fiber: 1,
          sodium: 10
        }
      }
    ],
    cookingMethod: '快炒',
    cuisineType: '中式',
    confidence: 0.88
  };

  const report = validator.validate(result);
  console.log(validator.generateReportSummary(report));
}

/**
 * 範例 6: 規則管理
 */
async function example6_RuleManagement() {
  console.log('\n=== 範例 6: 規則管理 ===\n');

  const validator = new ResultValidator();

  // 獲取規則統計
  const stats = validator.getRuleStatistics();
  console.log('規則統計:');
  console.log(`  總規則數: ${stats.total}`);
  console.log(`  啟用: ${stats.enabled}`);
  console.log(`  停用: ${stats.disabled}`);
  console.log(`  錯誤級別: ${stats.bySeverity.error}`);
  console.log(`  警告級別: ${stats.bySeverity.warning}`);
  console.log(`  資訊級別: ${stats.bySeverity.info}`);

  // 列出所有規則
  console.log('\n所有規則:');
  const rules = validator.getAllRules();
  rules.forEach(rule => {
    console.log(`  - ${rule.name} (${rule.severity}) ${rule.enabled ? '✓' : '✗'}`);
  });

  // 停用某個規則
  console.log('\n停用「台式熱炒常見搭配檢查」規則...');
  validator.disableRule('台式熱炒常見搭配檢查');

  // 再次獲取統計
  const newStats = validator.getRuleStatistics();
  console.log(`啟用規則數: ${newStats.enabled}`);
}

/**
 * 範例 7: 健康檢查
 */
async function example7_HealthCheck() {
  console.log('\n=== 範例 7: 健康檢查 ===\n');

  const validator = new ResultValidator();
  const health = validator.healthCheck();

  console.log('健康檢查結果:');
  console.log(JSON.stringify(health, null, 2));
}

/**
 * 執行所有範例
 */
async function runAllExamples() {
  try {
    await example1_BasicValidation();
    await example2_ConfusedFoods();
    await example3_ColdDishCompleteness();
    await example4_NutritionAnomalies();
    await example5_CustomRule();
    await example6_RuleManagement();
    await example7_HealthCheck();
  } catch (error) {
    console.error('執行範例時發生錯誤:', error);
  }
}

// 如果直接執行此文件
if (require.main === module) {
  runAllExamples();
}

export {
  example1_BasicValidation,
  example2_ConfusedFoods,
  example3_ColdDishCompleteness,
  example4_NutritionAnomalies,
  example5_CustomRule,
  example6_RuleManagement,
  example7_HealthCheck
};
