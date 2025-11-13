/**
 * 結果驗證器
 * Result Validator for Food Recognition
 * 
 * 驗證食物識別結果的合理性，特別針對亞洲料理的常見模式
 */

import {
  FoodCategory,
  CuisineType,
  CookingMethod,
  FoodItem
} from '../types/AsianCuisineKnowledgeBase';
import { AsianCuisineKnowledgeBase } from './AsianCuisineKnowledgeBase';
import { DetectedFood } from '../types/shared';

/**
 * 驗證規則嚴重程度
 */
export enum ValidationSeverity {
  ERROR = 'error',     // 錯誤：嚴重問題，可能導致不正確的結果
  WARNING = 'warning', // 警告：可能的問題，需要注意
  INFO = 'info'        // 資訊：建議性資訊
}

/**
 * 驗證結果
 */
export interface ValidationResult {
  passed: boolean;              // 是否通過驗證
  ruleName: string;             // 規則名稱
  severity: ValidationSeverity; // 嚴重程度
  message: string;              // 驗證訊息
  suggestions?: string[];       // 改進建議
  affectedFoods?: string[];     // 受影響的食物
  details?: any;                // 額外詳細資訊
}

/**
 * 識別結果（用於驗證）
 */
export interface RecognitionResultForValidation {
  foods: DetectedFood[];        // 識別到的食物
  cookingMethod?: string;       // 烹飪方式
  cuisineType?: string;         // 料理類型
  description?: string;         // 描述
  confidence?: number;          // 整體信心度
}

/**
 * 驗證規則介面
 */
export interface ValidationRule {
  name: string;                                    // 規則名稱
  description: string;                             // 規則描述
  severity: ValidationSeverity;                    // 嚴重程度
  enabled: boolean;                                // 是否啟用
  applicableCuisines?: CuisineType[];             // 適用的料理類型
  applicableCategories?: FoodCategory[];          // 適用的食材類別
  check: (result: RecognitionResultForValidation, context: ValidationContext) => ValidationResult;
}

/**
 * 驗證上下文
 */
export interface ValidationContext {
  knowledgeBase: AsianCuisineKnowledgeBase;       // 知識庫
  season?: string;                                 // 季節
  region?: string;                                 // 地區
  userPreferences?: any;                           // 用戶偏好
}

/**
 * 驗證報告
 */
export interface ValidationReport {
  overallPassed: boolean;                          // 整體是否通過
  totalRules: number;                              // 總規則數
  passedRules: number;                             // 通過的規則數
  failedRules: number;                             // 失敗的規則數
  errors: ValidationResult[];                      // 錯誤列表
  warnings: ValidationResult[];                    // 警告列表
  infos: ValidationResult[];                       // 資訊列表
  timestamp: Date;                                 // 驗證時間
  processingTime: number;                          // 處理時間（毫秒）
}

/**
 * 結果驗證器類
 */
export class ResultValidator {
  private rules: Map<string, ValidationRule>;
  private knowledgeBase: AsianCuisineKnowledgeBase;
  private context: ValidationContext;

  constructor(knowledgeBase?: AsianCuisineKnowledgeBase) {
    this.rules = new Map();
    this.knowledgeBase = knowledgeBase || new AsianCuisineKnowledgeBase();
    this.context = {
      knowledgeBase: this.knowledgeBase
    };

    // 初始化內建規則
    this.initializeBuiltInRules();

    console.log('✅ ResultValidator 已初始化，載入了', this.rules.size, '個驗證規則');
  }

  /**
   * 初始化內建驗證規則
   */
  private initializeBuiltInRules(): void {
    console.log('📋 初始化內建驗證規則...');
    
    // 導入並註冊所有規則
    const { getAllAsianCuisineValidationRules } = require('./AsianCuisineValidationRules');
    const { getAllNutritionValidationRules } = require('./NutritionValidationRules');
    
    const asianCuisineRules = getAllAsianCuisineValidationRules();
    const nutritionRules = getAllNutritionValidationRules();
    
    // 註冊亞洲料理規則
    asianCuisineRules.forEach((rule: ValidationRule) => {
      this.rules.set(rule.name, rule);
    });
    
    // 註冊營養和份量規則
    nutritionRules.forEach((rule: ValidationRule) => {
      this.rules.set(rule.name, rule);
    });
    
    console.log(`✅ 已載入 ${this.rules.size} 個內建驗證規則`);
  }

  /**
   * 驗證識別結果
   */
  public validate(result: RecognitionResultForValidation): ValidationReport {
    const startTime = Date.now();
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];
    const infos: ValidationResult[] = [];

    console.log('🔍 開始驗證識別結果，共有', result.foods.length, '個食物');

    let passedCount = 0;
    let failedCount = 0;

    // 執行所有啟用的規則
    for (const [ruleName, rule] of this.rules.entries()) {
      if (!rule.enabled) {
        continue;
      }

      try {
        // 檢查規則是否適用
        if (!this.isRuleApplicable(rule, result)) {
          continue;
        }

        // 執行驗證
        const validationResult = rule.check(result, this.context);
        validationResult.ruleName = ruleName;
        validationResult.severity = rule.severity;

        // 分類結果
        if (validationResult.passed) {
          passedCount++;
        } else {
          failedCount++;
          
          switch (validationResult.severity) {
            case ValidationSeverity.ERROR:
              errors.push(validationResult);
              break;
            case ValidationSeverity.WARNING:
              warnings.push(validationResult);
              break;
            case ValidationSeverity.INFO:
              infos.push(validationResult);
              break;
          }
        }
      } catch (error) {
        console.error(`❌ 執行驗證規則 "${ruleName}" 時發生錯誤:`, error);
        failedCount++;
        errors.push({
          passed: false,
          ruleName,
          severity: ValidationSeverity.ERROR,
          message: `驗證規則執行失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
        });
      }
    }

    const processingTime = Date.now() - startTime;
    const totalRules = passedCount + failedCount;
    const overallPassed = errors.length === 0;

    console.log(`✅ 驗證完成: ${passedCount}/${totalRules} 通過, ${errors.length} 錯誤, ${warnings.length} 警告, ${infos.length} 資訊`);

    return {
      overallPassed,
      totalRules,
      passedRules: passedCount,
      failedRules: failedCount,
      errors,
      warnings,
      infos,
      timestamp: new Date(),
      processingTime
    };
  }

  /**
   * 檢查規則是否適用於當前結果
   */
  private isRuleApplicable(rule: ValidationRule, result: RecognitionResultForValidation): boolean {
    // 檢查料理類型
    if (rule.applicableCuisines && rule.applicableCuisines.length > 0) {
      if (!result.cuisineType) {
        return false;
      }
      
      const cuisineMatch = rule.applicableCuisines.some(
        cuisine => result.cuisineType === cuisine
      );
      
      if (!cuisineMatch) {
        return false;
      }
    }

    // 檢查食材類別
    if (rule.applicableCategories && rule.applicableCategories.length > 0) {
      const hasApplicableCategory = result.foods.some(food => {
        // 這裡需要從知識庫獲取食材類別
        const foodItem = this.knowledgeBase.searchFoodItemsByName(food.name, false)[0];
        if (!foodItem) return false;
        
        return rule.applicableCategories!.some(
          category => foodItem.category === category
        );
      });

      if (!hasApplicableCategory) {
        return false;
      }
    }

    return true;
  }

  /**
   * 添加驗證規則
   */
  public addRule(rule: ValidationRule): void {
    if (this.rules.has(rule.name)) {
      console.warn(`⚠️ 驗證規則 "${rule.name}" 已存在，將被覆蓋`);
    }

    this.rules.set(rule.name, rule);
    console.log(`✅ 添加驗證規則: ${rule.name}`);
  }

  /**
   * 移除驗證規則
   */
  public removeRule(ruleName: string): boolean {
    const removed = this.rules.delete(ruleName);
    if (removed) {
      console.log(`✅ 移除驗證規則: ${ruleName}`);
    } else {
      console.warn(`⚠️ 驗證規則 "${ruleName}" 不存在`);
    }
    return removed;
  }

  /**
   * 啟用規則
   */
  public enableRule(ruleName: string): boolean {
    const rule = this.rules.get(ruleName);
    if (rule) {
      rule.enabled = true;
      console.log(`✅ 啟用驗證規則: ${ruleName}`);
      return true;
    }
    console.warn(`⚠️ 驗證規則 "${ruleName}" 不存在`);
    return false;
  }

  /**
   * 停用規則
   */
  public disableRule(ruleName: string): boolean {
    const rule = this.rules.get(ruleName);
    if (rule) {
      rule.enabled = false;
      console.log(`✅ 停用驗證規則: ${ruleName}`);
      return true;
    }
    console.warn(`⚠️ 驗證規則 "${ruleName}" 不存在`);
    return false;
  }

  /**
   * 獲取所有規則
   */
  public getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 獲取啟用的規則
   */
  public getEnabledRules(): ValidationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  /**
   * 獲取規則統計
   */
  public getRuleStatistics(): {
    total: number;
    enabled: number;
    disabled: number;
    bySeverity: Record<ValidationSeverity, number>;
  } {
    const rules = Array.from(this.rules.values());
    const enabled = rules.filter(r => r.enabled).length;
    
    const bySeverity: Record<ValidationSeverity, number> = {
      [ValidationSeverity.ERROR]: 0,
      [ValidationSeverity.WARNING]: 0,
      [ValidationSeverity.INFO]: 0
    };

    rules.forEach(rule => {
      bySeverity[rule.severity]++;
    });

    return {
      total: rules.length,
      enabled,
      disabled: rules.length - enabled,
      bySeverity
    };
  }

  /**
   * 設置驗證上下文
   */
  public setContext(context: Partial<ValidationContext>): void {
    this.context = {
      ...this.context,
      ...context
    };
    console.log('✅ 更新驗證上下文');
  }

  /**
   * 生成驗證報告摘要
   */
  public generateReportSummary(report: ValidationReport): string {
    const lines: string[] = [];
    
    lines.push('=== 驗證報告摘要 ===');
    lines.push(`整體結果: ${report.overallPassed ? '✅ 通過' : '❌ 未通過'}`);
    lines.push(`執行規則: ${report.totalRules} 個`);
    lines.push(`通過: ${report.passedRules} 個`);
    lines.push(`失敗: ${report.failedRules} 個`);
    lines.push(`處理時間: ${report.processingTime}ms`);
    lines.push('');

    if (report.errors.length > 0) {
      lines.push(`❌ 錯誤 (${report.errors.length}):`);
      report.errors.forEach(error => {
        lines.push(`  - ${error.message}`);
        if (error.suggestions && error.suggestions.length > 0) {
          error.suggestions.forEach(suggestion => {
            lines.push(`    💡 ${suggestion}`);
          });
        }
      });
      lines.push('');
    }

    if (report.warnings.length > 0) {
      lines.push(`⚠️ 警告 (${report.warnings.length}):`);
      report.warnings.forEach(warning => {
        lines.push(`  - ${warning.message}`);
        if (warning.suggestions && warning.suggestions.length > 0) {
          warning.suggestions.forEach(suggestion => {
            lines.push(`    💡 ${suggestion}`);
          });
        }
      });
      lines.push('');
    }

    if (report.infos.length > 0) {
      lines.push(`ℹ️ 資訊 (${report.infos.length}):`);
      report.infos.forEach(info => {
        lines.push(`  - ${info.message}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * 健康檢查
   */
  public healthCheck(): {
    status: string;
    details: any;
  } {
    const stats = this.getRuleStatistics();
    
    return {
      status: stats.enabled > 0 ? 'healthy' : 'degraded',
      details: {
        totalRules: stats.total,
        enabledRules: stats.enabled,
        disabledRules: stats.disabled,
        rulesBySeverity: stats.bySeverity,
        knowledgeBaseItems: this.knowledgeBase.getFoodItemCount(),
        timestamp: new Date()
      }
    };
  }
}
