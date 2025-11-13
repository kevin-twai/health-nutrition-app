/**
 * ResultValidator 測試
 */

import { ResultValidator, RecognitionResultForValidation, ValidationSeverity } from '../ResultValidator';
import { AsianCuisineKnowledgeBase } from '../AsianCuisineKnowledgeBase';

describe('ResultValidator', () => {
  let validator: ResultValidator;

  beforeEach(() => {
    validator = new ResultValidator();
  });

  describe('基礎功能', () => {
    it('應該成功創建驗證器實例', () => {
      expect(validator).toBeDefined();
      expect(validator).toBeInstanceOf(ResultValidator);
    });

    it('應該載入內建驗證規則', () => {
      const stats = validator.getRuleStatistics();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.enabled).toBeGreaterThan(0);
    });

    it('應該通過健康檢查', () => {
      const health = validator.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.details.totalRules).toBeGreaterThan(0);
    });
  });

  describe('基本驗證', () => {
    it('應該驗證正常的涼拌菜結果', () => {
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

      const report = validator.validate(result);

      expect(report).toBeDefined();
      expect(report.totalRules).toBeGreaterThan(0);
      expect(report.overallPassed).toBe(true);
    });
  });

  describe('相似食材互斥檢查', () => {
    it('應該檢測到豆腐干絲和麵條同時出現', () => {
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

      expect(report.warnings.length).toBeGreaterThan(0);
      const confusionWarning = report.warnings.find(w => 
        w.message.includes('豆腐干絲') && w.message.includes('麵條')
      );
      expect(confusionWarning).toBeDefined();
      expect(confusionWarning?.suggestions).toBeDefined();
      expect(confusionWarning?.suggestions!.length).toBeGreaterThan(0);
    });

    it('應該檢測到米粉和粉絲同時出現', () => {
      const result: RecognitionResultForValidation = {
        foods: [
          {
            id: '1',
            name: '米粉',
            confidence: 0.75,
            estimatedPortion: 100,
            nutrition: {
              calories: 130,
              protein: 3,
              carbs: 28,
              fat: 0.5,
              fiber: 1,
              sodium: 10
            }
          },
          {
            id: '2',
            name: '粉絲',
            confidence: 0.70,
            estimatedPortion: 100,
            nutrition: {
              calories: 120,
              protein: 0.5,
              carbs: 30,
              fat: 0.1,
              fiber: 0.5,
              sodium: 5
            }
          }
        ],
        cuisineType: '中式',
        confidence: 0.73
      };

      const report = validator.validate(result);

      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('涼拌菜完整性檢查', () => {
    it('應該檢測到涼拌菜缺少調味料', () => {
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
        ],
        cookingMethod: '涼拌',
        cuisineType: '台式',
        confidence: 0.88
      };

      const report = validator.validate(result);

      const completenessWarning = report.warnings.find(w => 
        w.message.includes('涼拌菜') && w.message.includes('缺少')
      );
      expect(completenessWarning).toBeDefined();
    });
  });

  describe('營養值合理性檢查', () => {
    it('應該檢測到異常高的卡路里值', () => {
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

      expect(report.warnings.length).toBeGreaterThan(0);
      const nutritionWarning = report.warnings.find(w => 
        w.message.includes('營養值')
      );
      expect(nutritionWarning).toBeDefined();
    });

    it('應該檢測到營養素總和異常', () => {
      const result: RecognitionResultForValidation = {
        foods: [
          {
            id: '1',
            name: '測試食物',
            confidence: 0.80,
            estimatedPortion: 100,
            nutrition: {
              calories: 500,
              protein: 50, // 總和超過 100g
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

  describe('份量描述完整性檢查', () => {
    it('應該檢測到缺少份量資訊', () => {
      const result: RecognitionResultForValidation = {
        foods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.90,
            estimatedPortion: 0, // 缺少份量
            nutrition: {
              calories: 130,
              protein: 2.5,
              carbs: 28,
              fat: 0.3,
              fiber: 0.3,
              sodium: 1
            }
          }
        ],
        confidence: 0.90
      };

      const report = validator.validate(result);

      expect(report.warnings.length).toBeGreaterThan(0);
      const portionWarning = report.warnings.find(w => 
        w.message.includes('份量')
      );
      expect(portionWarning).toBeDefined();
    });

    it('應該檢測到不合理的份量', () => {
      const result: RecognitionResultForValidation = {
        foods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.90,
            estimatedPortion: 5000, // 過大
            nutrition: {
              calories: 6500,
              protein: 125,
              carbs: 1400,
              fat: 15,
              fiber: 15,
              sodium: 50
            }
          }
        ],
        confidence: 0.90
      };

      const report = validator.validate(result);

      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('規則管理', () => {
    it('應該能夠添加自訂規則', () => {
      const initialStats = validator.getRuleStatistics();

      validator.addRule({
        name: '測試規則',
        description: '這是一個測試規則',
        severity: ValidationSeverity.INFO,
        enabled: true,
        check: (result, context) => ({
          passed: true,
          ruleName: '測試規則',
          severity: ValidationSeverity.INFO,
          message: '測試通過'
        })
      });

      const newStats = validator.getRuleStatistics();
      expect(newStats.total).toBe(initialStats.total + 1);
    });

    it('應該能夠停用和啟用規則', () => {
      const rules = validator.getAllRules();
      const firstRule = rules[0];

      validator.disableRule(firstRule.name);
      expect(firstRule.enabled).toBe(false);

      validator.enableRule(firstRule.name);
      expect(firstRule.enabled).toBe(true);
    });

    it('應該能夠移除規則', () => {
      validator.addRule({
        name: '臨時規則',
        description: '這是一個臨時規則',
        severity: ValidationSeverity.INFO,
        enabled: true,
        check: (result, context) => ({
          passed: true,
          ruleName: '臨時規則',
          severity: ValidationSeverity.INFO,
          message: '測試'
        })
      });

      const beforeRemove = validator.getRuleStatistics();
      validator.removeRule('臨時規則');
      const afterRemove = validator.getRuleStatistics();

      expect(afterRemove.total).toBe(beforeRemove.total - 1);
    });
  });

  describe('驗證報告', () => {
    it('應該生成完整的驗證報告', () => {
      const result: RecognitionResultForValidation = {
        foods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.90,
            estimatedPortion: 150,
            nutrition: {
              calories: 195,
              protein: 3.75,
              carbs: 42,
              fat: 0.45,
              fiber: 0.45,
              sodium: 1.5
            }
          }
        ],
        confidence: 0.90
      };

      const report = validator.validate(result);

      expect(report.overallPassed).toBeDefined();
      expect(report.totalRules).toBeGreaterThan(0);
      expect(report.passedRules).toBeGreaterThanOrEqual(0);
      expect(report.failedRules).toBeGreaterThanOrEqual(0);
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.processingTime).toBeGreaterThan(0);
    });

    it('應該生成可讀的報告摘要', () => {
      const result: RecognitionResultForValidation = {
        foods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.90,
            estimatedPortion: 150,
            nutrition: {
              calories: 195,
              protein: 3.75,
              carbs: 42,
              fat: 0.45,
              fiber: 0.45,
              sodium: 1.5
            }
          }
        ],
        confidence: 0.90
      };

      const report = validator.validate(result);
      const summary = validator.generateReportSummary(report);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('驗證報告摘要');
    });
  });

  describe('料理類型一致性檢查', () => {
    it('應該檢測日式料理缺少典型食材', () => {
      const result: RecognitionResultForValidation = {
        foods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.90,
            estimatedPortion: 150,
            nutrition: {
              calories: 195,
              protein: 3.75,
              carbs: 42,
              fat: 0.45,
              fiber: 0.45,
              sodium: 1.5
            }
          },
          {
            id: '2',
            name: '炒青菜',
            confidence: 0.85,
            estimatedPortion: 100,
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
            id: '3',
            name: '煎魚',
            confidence: 0.80,
            estimatedPortion: 120,
            nutrition: {
              calories: 180,
              protein: 24,
              carbs: 0,
              fat: 9,
              fiber: 0,
              sodium: 150
            }
          }
        ],
        cuisineType: '日式',
        confidence: 0.85
      };

      const report = validator.validate(result);

      const consistencyInfo = report.infos.find(i => 
        i.message.includes('日式') && i.message.includes('食材')
      );
      expect(consistencyInfo).toBeDefined();
    });
  });
});
