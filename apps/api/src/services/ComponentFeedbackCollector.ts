/**
 * 成分識別反饋收集器
 * 
 * 專門處理成分識別相關的用戶反饋，包括：
 * - 成分識別錯誤
 * - 遺漏的成分
 * - 份量估計錯誤
 * - 成分類別錯誤
 * - 營養資訊錯誤
 */

import { FeedbackRepository } from '../repositories/FeedbackRepository';
import {
  UserFeedback,
  FeedbackStatus,
  FeedbackType,
  ComponentCorrection,
  IncorrectComponent,
  MissingComponent,
  ComponentPortionCorrection,
  ComponentCategoryCorrection,
  ComponentNutritionCorrection
} from '../models/Feedback';
import { DetectedComponent, ComponentDetectionResult } from '../types/ComponentDetection';

export interface ComponentFeedbackData {
  imageId: string;
  userId?: string;
  sessionId: string;
  recognitionResult: ComponentDetectionResult;
  componentCorrections: ComponentCorrection;
  additionalComments?: string;
}

export interface ComponentFeedbackStats {
  totalFeedbacks: number;
  incorrectComponents: number;
  missingComponents: number;
  portionErrors: number;
  categoryErrors: number;
  nutritionErrors: number;
  mostCommonMistakes: ComponentMistakePattern[];
  averageComponentAccuracy: number;
}

export interface ComponentMistakePattern {
  incorrectComponent: string;
  correctComponent: string;
  frequency: number;
  dishTypes: string[];
  averageConfidence: number;
  lastOccurrence: Date;
}

export class ComponentFeedbackCollector {
  private feedbackRepository: FeedbackRepository;

  constructor(feedbackRepository: FeedbackRepository) {
    this.feedbackRepository = feedbackRepository;
  }

  /**
   * 提交成分識別反饋
   */
  async submitComponentFeedback(feedbackData: ComponentFeedbackData): Promise<UserFeedback> {
    // 驗證反饋資料
    this.validateComponentFeedback(feedbackData);

    // 自動確定反饋類型
    const feedbackTypes = this.determineComponentFeedbackTypes(feedbackData.componentCorrections);

    // 轉換為標準反饋格式
    const standardFeedback = this.convertToStandardFeedback(feedbackData, feedbackTypes);

    // 創建反饋
    const feedback = await this.feedbackRepository.create(standardFeedback);

    console.log(`成分識別反饋已提交: ${feedback.id}`, {
      sessionId: feedback.sessionId,
      types: feedback.feedbackType,
      incorrectComponents: feedbackData.componentCorrections.incorrectComponents.length,
      missingComponents: feedbackData.componentCorrections.missingComponents.length
    });

    return feedback;
  }

  /**
   * 獲取成分識別反饋統計
   */
  async getComponentFeedbackStats(): Promise<ComponentFeedbackStats> {
    // 獲取所有包含成分修正的反饋
    const allFeedbacks = await this.feedbackRepository.findAll(1000);
    const componentFeedbacks = allFeedbacks.filter(
      f => f.userCorrection.componentCorrections
    );

    if (componentFeedbacks.length === 0) {
      return {
        totalFeedbacks: 0,
        incorrectComponents: 0,
        missingComponents: 0,
        portionErrors: 0,
        categoryErrors: 0,
        nutritionErrors: 0,
        mostCommonMistakes: [],
        averageComponentAccuracy: 0
      };
    }

    // 統計各類錯誤
    let incorrectComponents = 0;
    let missingComponents = 0;
    let portionErrors = 0;
    let categoryErrors = 0;
    let nutritionErrors = 0;

    for (const feedback of componentFeedbacks) {
      const corrections = feedback.userCorrection.componentCorrections!;
      incorrectComponents += corrections.incorrectComponents?.length || 0;
      missingComponents += corrections.missingComponents?.length || 0;
      portionErrors += corrections.componentPortionCorrections?.length || 0;
      categoryErrors += corrections.componentCategoryCorrections?.length || 0;
      nutritionErrors += corrections.componentNutritionCorrections?.length || 0;
    }

    // 分析常見錯誤模式
    const mistakePatterns = await this.analyzeComponentMistakes(componentFeedbacks);

    // 計算平均準確率
    const averageAccuracy = this.calculateComponentAccuracy(componentFeedbacks);

    return {
      totalFeedbacks: componentFeedbacks.length,
      incorrectComponents,
      missingComponents,
      portionErrors,
      categoryErrors,
      nutritionErrors,
      mostCommonMistakes: mistakePatterns.slice(0, 10),
      averageComponentAccuracy: averageAccuracy
    };
  }

  /**
   * 獲取特定成分的反饋歷史
   */
  async getComponentFeedbackHistory(componentName: string): Promise<{
    totalMentions: number;
    incorrectIdentifications: number;
    missingOccurrences: number;
    portionIssues: number;
    averageConfidence: number;
    commonMistakes: string[];
    suggestions: string[];
  }> {
    const allFeedbacks = await this.feedbackRepository.findAll(1000);
    const relevantFeedbacks = allFeedbacks.filter(f => {
      if (!f.userCorrection.componentCorrections) return false;
      
      const corrections = f.userCorrection.componentCorrections;
      return (
        corrections.incorrectComponents?.some(
          ic => ic.identifiedAs === componentName || ic.actualComponent === componentName
        ) ||
        corrections.missingComponents?.some(mc => mc.name === componentName) ||
        corrections.componentPortionCorrections?.some(pc => pc.componentName === componentName)
      );
    });

    if (relevantFeedbacks.length === 0) {
      return {
        totalMentions: 0,
        incorrectIdentifications: 0,
        missingOccurrences: 0,
        portionIssues: 0,
        averageConfidence: 0,
        commonMistakes: [],
        suggestions: []
      };
    }

    // 統計各類問題
    let incorrectIdentifications = 0;
    let missingOccurrences = 0;
    let portionIssues = 0;
    const commonMistakes: string[] = [];

    for (const feedback of relevantFeedbacks) {
      const corrections = feedback.userCorrection.componentCorrections!;
      
      // 錯誤識別
      const incorrect = corrections.incorrectComponents?.filter(
        ic => ic.identifiedAs === componentName || ic.actualComponent === componentName
      );
      if (incorrect && incorrect.length > 0) {
        incorrectIdentifications += incorrect.length;
        incorrect.forEach(ic => {
          if (ic.identifiedAs === componentName) {
            commonMistakes.push(`被誤認為 ${ic.actualComponent}`);
          } else {
            commonMistakes.push(`${ic.identifiedAs} 被誤認為此成分`);
          }
        });
      }

      // 遺漏
      const missing = corrections.missingComponents?.filter(mc => mc.name === componentName);
      if (missing && missing.length > 0) {
        missingOccurrences += missing.length;
      }

      // 份量問題
      const portion = corrections.componentPortionCorrections?.filter(
        pc => pc.componentName === componentName
      );
      if (portion && portion.length > 0) {
        portionIssues += portion.length;
      }
    }

    // 計算平均信心度
    const confidences: number[] = [];
    for (const feedback of relevantFeedbacks) {
      if (feedback.recognitionResult.componentDetection) {
        const component = feedback.recognitionResult.componentDetection.components.find(
          c => c.name === componentName
        );
        if (component) {
          confidences.push(component.confidence);
        }
      }
    }
    const averageConfidence = confidences.length > 0
      ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
      : 0;

    // 生成改進建議
    const suggestions = this.generateComponentSuggestions(
      componentName,
      incorrectIdentifications,
      missingOccurrences,
      portionIssues,
      averageConfidence
    );

    return {
      totalMentions: relevantFeedbacks.length,
      incorrectIdentifications,
      missingOccurrences,
      portionIssues,
      averageConfidence,
      commonMistakes: [...new Set(commonMistakes)],
      suggestions
    };
  }

  /**
   * 獲取料理類型的成分識別準確率
   */
  async getDishTypeComponentAccuracy(dishType: string): Promise<{
    dishType: string;
    totalFeedbacks: number;
    averageComponentsDetected: number;
    averageComponentsMissing: number;
    averageComponentsIncorrect: number;
    accuracyRate: number;
    commonIssues: string[];
  }> {
    const allFeedbacks = await this.feedbackRepository.findAll(1000);
    const dishFeedbacks = allFeedbacks.filter(f => {
      if (!f.recognitionResult.componentDetection) return false;
      return f.recognitionResult.componentDetection.mainDish.type === dishType;
    });

    if (dishFeedbacks.length === 0) {
      return {
        dishType,
        totalFeedbacks: 0,
        averageComponentsDetected: 0,
        averageComponentsMissing: 0,
        averageComponentsIncorrect: 0,
        accuracyRate: 0,
        commonIssues: []
      };
    }

    let totalDetected = 0;
    let totalMissing = 0;
    let totalIncorrect = 0;
    const issues: string[] = [];

    for (const feedback of dishFeedbacks) {
      if (feedback.recognitionResult.componentDetection) {
        totalDetected += feedback.recognitionResult.componentDetection.totalComponents;
      }

      if (feedback.userCorrection.componentCorrections) {
        const corrections = feedback.userCorrection.componentCorrections;
        totalMissing += corrections.missingComponents?.length || 0;
        totalIncorrect += corrections.incorrectComponents?.length || 0;

        // 收集常見問題
        corrections.missingComponents?.forEach(mc => {
          if (mc.reason) issues.push(mc.reason);
        });
        corrections.incorrectComponents?.forEach(ic => {
          if (ic.reason) issues.push(ic.reason);
        });
      }
    }

    const avgDetected = totalDetected / dishFeedbacks.length;
    const avgMissing = totalMissing / dishFeedbacks.length;
    const avgIncorrect = totalIncorrect / dishFeedbacks.length;

    // 計算準確率：(檢測到的 - 錯誤的) / (檢測到的 + 遺漏的)
    const accuracyRate = totalDetected > 0
      ? ((totalDetected - totalIncorrect) / (totalDetected + totalMissing)) * 100
      : 0;

    return {
      dishType,
      totalFeedbacks: dishFeedbacks.length,
      averageComponentsDetected: avgDetected,
      averageComponentsMissing: avgMissing,
      averageComponentsIncorrect: avgIncorrect,
      accuracyRate,
      commonIssues: [...new Set(issues)].slice(0, 5)
    };
  }

  /**
   * 驗證成分反饋資料
   */
  private validateComponentFeedback(feedbackData: ComponentFeedbackData): void {
    if (!feedbackData.imageId) {
      throw new Error('圖片ID為必填欄位');
    }

    if (!feedbackData.sessionId) {
      throw new Error('會話ID為必填欄位');
    }

    if (!feedbackData.recognitionResult) {
      throw new Error('識別結果為必填欄位');
    }

    if (!feedbackData.componentCorrections) {
      throw new Error('成分修正資料為必填欄位');
    }

    // 檢查是否至少有一種修正
    const corrections = feedbackData.componentCorrections;
    const hasCorrections = 
      (corrections.incorrectComponents?.length || 0) > 0 ||
      (corrections.missingComponents?.length || 0) > 0 ||
      (corrections.componentPortionCorrections?.length || 0) > 0 ||
      (corrections.componentCategoryCorrections?.length || 0) > 0 ||
      (corrections.componentNutritionCorrections?.length || 0) > 0;

    if (!hasCorrections) {
      throw new Error('至少需要提供一種成分修正');
    }
  }

  /**
   * 確定成分反饋類型
   */
  private determineComponentFeedbackTypes(corrections: ComponentCorrection): FeedbackType[] {
    const types: FeedbackType[] = [];

    if (corrections.incorrectComponents?.length > 0) {
      types.push(FeedbackType.INCORRECT_COMPONENT);
    }

    if (corrections.missingComponents?.length > 0) {
      types.push(FeedbackType.MISSING_COMPONENT);
    }

    if (corrections.componentPortionCorrections?.length > 0) {
      types.push(FeedbackType.WRONG_COMPONENT_PORTION);
    }

    if (corrections.componentCategoryCorrections?.length > 0) {
      types.push(FeedbackType.WRONG_COMPONENT_CATEGORY);
    }

    if (corrections.componentNutritionCorrections?.length > 0) {
      types.push(FeedbackType.COMPONENT_NUTRITION_ERROR);
    }

    return types.length > 0 ? types : [FeedbackType.OTHER];
  }

  /**
   * 轉換為標準反饋格式
   */
  private convertToStandardFeedback(
    feedbackData: ComponentFeedbackData,
    feedbackTypes: FeedbackType[]
  ): Omit<UserFeedback, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      imageId: feedbackData.imageId,
      userId: feedbackData.userId,
      sessionId: feedbackData.sessionId,
      recognitionResult: {
        foods: [],
        overallConfidence: feedbackData.recognitionResult.metadata.confidenceScore,
        description: feedbackData.recognitionResult.mainDish.name,
        cookingMethod: feedbackData.recognitionResult.components[0]?.cookingMethod,
        cuisineType: '',
        recognitionStages: 1,
        processingTime: feedbackData.recognitionResult.metadata.processingTime,
        componentDetection: {
          mainDish: {
            name: feedbackData.recognitionResult.mainDish.name,
            type: feedbackData.recognitionResult.mainDish.type,
            confidence: feedbackData.recognitionResult.mainDish.confidence
          },
          components: feedbackData.recognitionResult.components.map(c => ({
            id: c.id,
            name: c.name,
            nameEn: c.nameEn,
            confidence: c.confidence,
            estimatedPortion: c.estimatedPortion,
            category: c.category,
            cookingMethod: c.cookingMethod,
            calories: c.actualNutrition?.calories,
            protein: c.actualNutrition?.protein,
            carbs: c.actualNutrition?.carbohydrates,
            fat: c.actualNutrition?.fat
          })),
          totalComponents: feedbackData.recognitionResult.components.length,
          detectionMethod: feedbackData.recognitionResult.metadata.detectionMethod,
          processingTime: feedbackData.recognitionResult.metadata.processingTime
        }
      },
      userCorrection: {
        correctFoods: [],
        incorrectFoods: [],
        missingFoods: [],
        portionCorrections: [],
        componentCorrections: feedbackData.componentCorrections
      },
      feedbackType: feedbackTypes,
      additionalComments: feedbackData.additionalComments,
      status: FeedbackStatus.PENDING
    };
  }

  /**
   * 分析成分錯誤模式
   */
  private async analyzeComponentMistakes(
    feedbacks: UserFeedback[]
  ): Promise<ComponentMistakePattern[]> {
    const mistakeMap = new Map<string, ComponentMistakePattern>();

    for (const feedback of feedbacks) {
      const corrections = feedback.userCorrection.componentCorrections;
      if (!corrections) continue;

      for (const incorrect of corrections.incorrectComponents || []) {
        const key = `${incorrect.identifiedAs}→${incorrect.actualComponent}`;
        
        if (!mistakeMap.has(key)) {
          mistakeMap.set(key, {
            incorrectComponent: incorrect.identifiedAs,
            correctComponent: incorrect.actualComponent,
            frequency: 0,
            dishTypes: [],
            averageConfidence: 0,
            lastOccurrence: feedback.createdAt
          });
        }

        const pattern = mistakeMap.get(key)!;
        pattern.frequency++;
        pattern.lastOccurrence = feedback.createdAt;

        // 添加料理類型
        if (feedback.recognitionResult.componentDetection) {
          const dishType = feedback.recognitionResult.componentDetection.mainDish.type;
          if (!pattern.dishTypes.includes(dishType)) {
            pattern.dishTypes.push(dishType);
          }
        }

        // 計算平均信心度
        if (feedback.recognitionResult.componentDetection) {
          const component = feedback.recognitionResult.componentDetection.components.find(
            c => c.name === incorrect.identifiedAs
          );
          if (component) {
            pattern.averageConfidence = 
              (pattern.averageConfidence * (pattern.frequency - 1) + component.confidence) / 
              pattern.frequency;
          }
        }
      }
    }

    return Array.from(mistakeMap.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * 計算成分識別準確率
   */
  private calculateComponentAccuracy(feedbacks: UserFeedback[]): number {
    let totalComponents = 0;
    let correctComponents = 0;

    for (const feedback of feedbacks) {
      if (!feedback.recognitionResult.componentDetection) continue;

      const detected = feedback.recognitionResult.componentDetection.totalComponents;
      totalComponents += detected;

      const corrections = feedback.userCorrection.componentCorrections;
      if (corrections) {
        const incorrect = corrections.incorrectComponents?.length || 0;
        correctComponents += (detected - incorrect);
      } else {
        correctComponents += detected;
      }
    }

    return totalComponents > 0 ? (correctComponents / totalComponents) * 100 : 0;
  }

  /**
   * 生成成分改進建議
   */
  private generateComponentSuggestions(
    componentName: string,
    incorrectCount: number,
    missingCount: number,
    portionIssues: number,
    averageConfidence: number
  ): string[] {
    const suggestions: string[] = [];

    if (incorrectCount > 0) {
      if (averageConfidence > 0.8) {
        suggestions.push(
          `${componentName} 經常被高信心度誤識別，建議在 prompt 中添加更詳細的視覺特徵描述`
        );
      } else {
        suggestions.push(
          `${componentName} 識別信心度較低，建議在知識庫中添加更多參考圖片和特徵`
        );
      }
    }

    if (missingCount > 0) {
      suggestions.push(
        `${componentName} 經常被遺漏，建議在料理-成分映射中將其標記為常見成分`
      );
    }

    if (portionIssues > 0) {
      suggestions.push(
        `${componentName} 的份量估計經常不準確，建議調整知識庫中的典型份量範圍`
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(`${componentName} 的識別表現良好，繼續保持`);
    }

    return suggestions;
  }
}
