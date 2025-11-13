import { FeedbackRepository } from '../repositories/FeedbackRepository';
import {
  UserFeedback,
  MistakePattern,
  FeedbackStats,
  ImprovementSuggestion,
  FeedbackType
} from '../models/Feedback';

// 錯誤分析結果
export interface ErrorAnalysis {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByFood: Map<string, ErrorDetail>;
  errorsByCuisine: Map<string, number>;
  errorsByConfidenceRange: ConfidenceRangeError[];
  temporalPattern: TemporalPattern;
}

// 錯誤詳情
export interface ErrorDetail {
  foodName: string;
  incorrectCount: number;
  missingCount: number;
  portionErrorCount: number;
  commonMisidentifications: Array<{
    identifiedAs: string;
    frequency: number;
  }>;
  averageConfidence: number;
  lastOccurrence: Date;
}

// 信心度範圍錯誤
export interface ConfidenceRangeError {
  range: string;
  minConfidence: number;
  maxConfidence: number;
  errorCount: number;
  errorRate: number;
}

// 時間模式
export interface TemporalPattern {
  hourlyDistribution: Map<number, number>;
  dailyDistribution: Map<string, number>;
  weeklyTrend: Array<{ week: string; count: number }>;
  peakErrorTimes: string[];
}

// 改進效果分析
export interface ImprovementImpactAnalysis {
  beforeStats: {
    errorRate: number;
    averageConfidence: number;
    commonMistakes: number;
  };
  afterStats: {
    errorRate: number;
    averageConfidence: number;
    commonMistakes: number;
  };
  improvement: {
    errorRateReduction: number;
    confidenceIncrease: number;
    mistakeReduction: number;
  };
  affectedFoods: string[];
}

// 食材識別準確度報告
export interface FoodAccuracyReport {
  foodName: string;
  totalIdentifications: number;
  correctIdentifications: number;
  incorrectIdentifications: number;
  accuracyRate: number;
  commonErrors: Array<{
    error: string;
    frequency: number;
  }>;
  recommendedActions: string[];
}

export class FeedbackAnalyzer {
  private feedbackRepository: FeedbackRepository;

  constructor(feedbackRepository: FeedbackRepository) {
    this.feedbackRepository = feedbackRepository;
  }

  /**
   * 統計常見識別錯誤
   */
  async analyzeCommonErrors(limit: number = 50): Promise<ErrorAnalysis> {
    const feedbacks = await this.feedbackRepository.findAll(1000); // 獲取最近1000條反饋

    const errorsByType: Record<string, number> = {};
    const errorsByFood = new Map<string, ErrorDetail>();
    const errorsByCuisine = new Map<string, number>();
    const confidenceRanges: ConfidenceRangeError[] = [];
    const hourlyDist = new Map<number, number>();
    const dailyDist = new Map<string, number>();

    let totalErrors = 0;

    for (const feedback of feedbacks) {
      // 統計錯誤類型
      for (const type of feedback.feedbackType) {
        errorsByType[type] = (errorsByType[type] || 0) + 1;
      }

      // 統計錯誤食材
      for (const incorrect of feedback.userCorrection.incorrectFoods) {
        totalErrors++;
        this.updateFoodError(errorsByFood, incorrect.actualFood, {
          type: 'incorrect',
          identifiedAs: incorrect.identifiedAs,
          confidence: feedback.recognitionResult.overallConfidence,
          date: feedback.createdAt
        });
      }

      for (const missing of feedback.userCorrection.missingFoods) {
        totalErrors++;
        this.updateFoodError(errorsByFood, missing.name, {
          type: 'missing',
          confidence: feedback.recognitionResult.overallConfidence,
          date: feedback.createdAt
        });
      }

      for (const portion of feedback.userCorrection.portionCorrections) {
        this.updateFoodError(errorsByFood, portion.foodName, {
          type: 'portion',
          confidence: feedback.recognitionResult.overallConfidence,
          date: feedback.createdAt
        });
      }

      // 統計料理類型錯誤
      if (feedback.recognitionResult.cuisineType) {
        const cuisine = feedback.recognitionResult.cuisineType;
        errorsByCuisine.set(cuisine, (errorsByCuisine.get(cuisine) || 0) + 1);
      }

      // 統計時間分布
      const hour = feedback.createdAt.getHours();
      hourlyDist.set(hour, (hourlyDist.get(hour) || 0) + 1);

      const day = feedback.createdAt.toISOString().split('T')[0];
      dailyDist.set(day, (dailyDist.get(day) || 0) + 1);
    }

    // 計算信心度範圍錯誤
    const ranges = [
      { range: '0-50%', min: 0, max: 0.5 },
      { range: '50-70%', min: 0.5, max: 0.7 },
      { range: '70-85%', min: 0.7, max: 0.85 },
      { range: '85-95%', min: 0.85, max: 0.95 },
      { range: '95-100%', min: 0.95, max: 1.0 }
    ];

    for (const range of ranges) {
      const errorsInRange = feedbacks.filter(
        f =>
          f.recognitionResult.overallConfidence >= range.min &&
          f.recognitionResult.overallConfidence < range.max &&
          (f.userCorrection.incorrectFoods.length > 0 ||
            f.userCorrection.missingFoods.length > 0)
      );

      const totalInRange = feedbacks.filter(
        f =>
          f.recognitionResult.overallConfidence >= range.min &&
          f.recognitionResult.overallConfidence < range.max
      );

      confidenceRanges.push({
        range: range.range,
        minConfidence: range.min,
        maxConfidence: range.max,
        errorCount: errorsInRange.length,
        errorRate: totalInRange.length > 0 ? errorsInRange.length / totalInRange.length : 0
      });
    }

    // 分析時間模式
    const temporalPattern = this.analyzeTemporalPattern(hourlyDist, dailyDist);

    return {
      totalErrors,
      errorsByType,
      errorsByFood,
      errorsByCuisine,
      errorsByConfidenceRange: confidenceRanges,
      temporalPattern
    };
  }

  /**
   * 分析錯誤模式
   */
  async analyzeErrorPatterns(): Promise<{
    patterns: MistakePattern[];
    insights: string[];
    recommendations: ImprovementSuggestion[];
  }> {
    const mistakes = await this.feedbackRepository.getCommonMistakes(50);
    const insights: string[] = [];
    const recommendations: ImprovementSuggestion[] = [];

    // 分析高頻錯誤
    const highFrequencyMistakes = mistakes.filter(m => m.frequency >= 5);
    if (highFrequencyMistakes.length > 0) {
      insights.push(
        `發現 ${highFrequencyMistakes.length} 個高頻錯誤模式（出現5次以上）`
      );

      for (const mistake of highFrequencyMistakes.slice(0, 3)) {
        insights.push(
          `${mistake.incorrectIdentification} 經常被誤識別為 ${mistake.correctIdentification}（${mistake.frequency}次）`
        );

        recommendations.push({
          type: 'prompt',
          priority: 'high',
          description: `優化 ${mistake.correctIdentification} 的識別 prompt`,
          affectedFoods: [mistake.incorrectIdentification, mistake.correctIdentification],
          estimatedImpact: mistake.frequency,
          suggestedAction: `在 prompt 中添加詳細的區分特徵，強調 ${mistake.correctIdentification} 與 ${mistake.incorrectIdentification} 的視覺差異`
        });
      }
    }

    // 分析相似食材混淆
    const confusionPairs = this.identifyConfusionPairs(mistakes);
    if (confusionPairs.length > 0) {
      insights.push(`發現 ${confusionPairs.length} 組易混淆的食材對`);

      for (const pair of confusionPairs.slice(0, 3)) {
        recommendations.push({
          type: 'knowledge_base',
          priority: 'high',
          description: `更新知識庫以區分 ${pair.food1} 和 ${pair.food2}`,
          affectedFoods: [pair.food1, pair.food2],
          estimatedImpact: pair.totalFrequency,
          suggestedAction: `在知識庫中添加這兩種食材的對比說明和區分特徵`
        });
      }
    }

    // 分析料理類型相關錯誤
    const cuisineErrors = await this.analyzeCuisineTypeErrors();
    if (cuisineErrors.length > 0) {
      insights.push(`某些料理類型的識別準確度較低`);

      for (const error of cuisineErrors.slice(0, 2)) {
        recommendations.push({
          type: 'prompt',
          priority: 'medium',
          description: `改進 ${error.cuisineType} 料理的識別`,
          affectedFoods: error.commonFoods,
          estimatedImpact: error.errorCount,
          suggestedAction: `在 prompt 中添加更多 ${error.cuisineType} 料理的特徵描述`
        });
      }
    }

    return {
      patterns: mistakes,
      insights,
      recommendations
    };
  }

  /**
   * 生成改進建議
   */
  async generateImprovementSuggestions(): Promise<ImprovementSuggestion[]> {
    const stats = await this.feedbackRepository.getStats();
    const errorAnalysis = await this.analyzeCommonErrors();
    const suggestions: ImprovementSuggestion[] = [];

    // 基於高頻錯誤的建議
    for (const [food, detail] of errorAnalysis.errorsByFood.entries()) {
      if (detail.incorrectCount >= 5) {
        suggestions.push({
          type: 'prompt',
          priority: 'high',
          description: `${food} 經常被誤識別`,
          affectedFoods: [food, ...detail.commonMisidentifications.map(m => m.identifiedAs)],
          estimatedImpact: detail.incorrectCount,
          suggestedAction: `優化 ${food} 的識別 prompt，添加更詳細的視覺特徵描述`
        });
      }

      if (detail.missingCount >= 3) {
        suggestions.push({
          type: 'validation_rule',
          priority: 'medium',
          description: `${food} 經常被遺漏`,
          affectedFoods: [food],
          estimatedImpact: detail.missingCount,
          suggestedAction: `添加驗證規則來檢測 ${food} 在常見菜餚中的存在`
        });
      }
    }

    // 基於信心度範圍的建議
    const highConfidenceErrors = errorAnalysis.errorsByConfidenceRange.find(
      r => r.minConfidence >= 0.85
    );
    if (highConfidenceErrors && highConfidenceErrors.errorCount > 0) {
      suggestions.push({
        type: 'prompt',
        priority: 'high',
        description: '高信心度但識別錯誤的情況需要優先處理',
        affectedFoods: [],
        estimatedImpact: highConfidenceErrors.errorCount,
        suggestedAction: '檢查並優化導致高信心度錯誤的 prompt 模板'
      });
    }

    // 基於料理類型的建議
    const topCuisineErrors = Array.from(errorAnalysis.errorsByCuisine.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [cuisine, count] of topCuisineErrors) {
      if (count >= 5) {
        suggestions.push({
          type: 'knowledge_base',
          priority: 'medium',
          description: `${cuisine} 料理的識別準確度需要提升`,
          affectedFoods: [],
          estimatedImpact: count,
          suggestedAction: `擴充知識庫中 ${cuisine} 料理的食材和特徵資訊`
        });
      }
    }

    // 排序建議（按優先級和影響）
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimatedImpact - a.estimatedImpact;
    });
  }

  /**
   * 分析特定食材的識別準確度
   */
  async analyzeFoodAccuracy(foodName: string): Promise<FoodAccuracyReport> {
    const feedbacks = await this.feedbackRepository.search({ foodName }, 500);

    let totalIdentifications = 0;
    let correctIdentifications = 0;
    let incorrectIdentifications = 0;
    const errorMap = new Map<string, number>();

    for (const feedback of feedbacks) {
      // 檢查是否正確識別
      const wasIdentified = feedback.recognitionResult.foods.some(
        f => f.name.includes(foodName)
      );

      const wasCorrect = feedback.userCorrection.correctFoods.some(
        f => f.name.includes(foodName)
      );

      const wasIncorrect = feedback.userCorrection.incorrectFoods.some(
        f => f.actualFood.includes(foodName)
      );

      const wasMissing = feedback.userCorrection.missingFoods.some(
        f => f.name.includes(foodName)
      );

      if (wasIdentified || wasCorrect || wasIncorrect || wasMissing) {
        totalIdentifications++;

        if (wasCorrect || (wasIdentified && !wasIncorrect && !wasMissing)) {
          correctIdentifications++;
        } else {
          incorrectIdentifications++;

          // 記錄錯誤類型
          if (wasIncorrect) {
            const incorrect = feedback.userCorrection.incorrectFoods.find(
              f => f.actualFood.includes(foodName)
            );
            if (incorrect) {
              errorMap.set(
                `誤識別為: ${incorrect.identifiedAs}`,
                (errorMap.get(`誤識別為: ${incorrect.identifiedAs}`) || 0) + 1
              );
            }
          }

          if (wasMissing) {
            errorMap.set('遺漏', (errorMap.get('遺漏') || 0) + 1);
          }
        }
      }
    }

    const accuracyRate =
      totalIdentifications > 0 ? correctIdentifications / totalIdentifications : 0;

    const commonErrors = Array.from(errorMap.entries())
      .map(([error, frequency]) => ({ error, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const recommendedActions = this.generateFoodRecommendations(
      foodName,
      accuracyRate,
      commonErrors
    );

    return {
      foodName,
      totalIdentifications,
      correctIdentifications,
      incorrectIdentifications,
      accuracyRate,
      commonErrors,
      recommendedActions
    };
  }

  /**
   * 分析改進效果
   */
  async analyzeImprovementImpact(
    beforeDate: Date,
    afterDate: Date,
    affectedFoods: string[]
  ): Promise<ImprovementImpactAnalysis> {
    const beforeFeedbacks = await this.feedbackRepository.search(
      { endDate: beforeDate },
      1000
    );

    const afterFeedbacks = await this.feedbackRepository.search(
      { startDate: afterDate },
      1000
    );

    const beforeStats = this.calculateStats(beforeFeedbacks, affectedFoods);
    const afterStats = this.calculateStats(afterFeedbacks, affectedFoods);

    return {
      beforeStats,
      afterStats,
      improvement: {
        errorRateReduction: beforeStats.errorRate - afterStats.errorRate,
        confidenceIncrease: afterStats.averageConfidence - beforeStats.averageConfidence,
        mistakeReduction: beforeStats.commonMistakes - afterStats.commonMistakes
      },
      affectedFoods
    };
  }

  /**
   * 生成詳細的分析報告
   */
  async generateDetailedReport(days: number = 30): Promise<{
    summary: string;
    errorAnalysis: ErrorAnalysis;
    patterns: MistakePattern[];
    suggestions: ImprovementSuggestion[];
    topProblematicFoods: FoodAccuracyReport[];
    stats: FeedbackStats;
  }> {
    const [errorAnalysis, patternResult, suggestions, stats] = await Promise.all([
      this.analyzeCommonErrors(),
      this.analyzeErrorPatterns(),
      this.generateImprovementSuggestions(),
      this.feedbackRepository.getStats()
    ]);

    // 找出最有問題的食材
    const topProblematicFoods: FoodAccuracyReport[] = [];
    const sortedFoods = Array.from(errorAnalysis.errorsByFood.entries())
      .sort((a, b) => b[1].incorrectCount + b[1].missingCount - (a[1].incorrectCount + a[1].missingCount))
      .slice(0, 5);

    for (const [foodName] of sortedFoods) {
      const report = await this.analyzeFoodAccuracy(foodName);
      topProblematicFoods.push(report);
    }

    const summary = this.generateReportSummary(
      errorAnalysis,
      patternResult.patterns,
      suggestions,
      stats
    );

    return {
      summary,
      errorAnalysis,
      patterns: patternResult.patterns,
      suggestions,
      topProblematicFoods,
      stats
    };
  }

  // ===== 私有輔助方法 =====

  private updateFoodError(
    errorsByFood: Map<string, ErrorDetail>,
    foodName: string,
    errorInfo: any
  ): void {
    const existing = errorsByFood.get(foodName);

    if (!existing) {
      errorsByFood.set(foodName, {
        foodName,
        incorrectCount: errorInfo.type === 'incorrect' ? 1 : 0,
        missingCount: errorInfo.type === 'missing' ? 1 : 0,
        portionErrorCount: errorInfo.type === 'portion' ? 1 : 0,
        commonMisidentifications: errorInfo.identifiedAs
          ? [{ identifiedAs: errorInfo.identifiedAs, frequency: 1 }]
          : [],
        averageConfidence: errorInfo.confidence,
        lastOccurrence: errorInfo.date
      });
    } else {
      if (errorInfo.type === 'incorrect') {
        existing.incorrectCount++;
        if (errorInfo.identifiedAs) {
          const misid = existing.commonMisidentifications.find(
            m => m.identifiedAs === errorInfo.identifiedAs
          );
          if (misid) {
            misid.frequency++;
          } else {
            existing.commonMisidentifications.push({
              identifiedAs: errorInfo.identifiedAs,
              frequency: 1
            });
          }
        }
      } else if (errorInfo.type === 'missing') {
        existing.missingCount++;
      } else if (errorInfo.type === 'portion') {
        existing.portionErrorCount++;
      }

      existing.averageConfidence =
        (existing.averageConfidence + errorInfo.confidence) / 2;
      existing.lastOccurrence = errorInfo.date;
    }
  }

  private analyzeTemporalPattern(
    hourlyDist: Map<number, number>,
    dailyDist: Map<string, number>
  ): TemporalPattern {
    // 找出錯誤高峰時段
    const sortedHours = Array.from(hourlyDist.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const peakErrorTimes = sortedHours.map(([hour, count]) => `${hour}:00 (${count}次)`);

    // 計算每週趨勢
    const weeklyTrend: Array<{ week: string; count: number }> = [];
    // 簡化實現，實際應該按週分組

    return {
      hourlyDistribution: hourlyDist,
      dailyDistribution: dailyDist,
      weeklyTrend,
      peakErrorTimes
    };
  }

  private identifyConfusionPairs(mistakes: MistakePattern[]): Array<{
    food1: string;
    food2: string;
    totalFrequency: number;
  }> {
    const pairs: Array<{ food1: string; food2: string; totalFrequency: number }> = [];
    const processed = new Set<string>();

    for (const mistake of mistakes) {
      const key1 = `${mistake.incorrectIdentification}-${mistake.correctIdentification}`;
      const key2 = `${mistake.correctIdentification}-${mistake.incorrectIdentification}`;

      if (!processed.has(key1) && !processed.has(key2)) {
        const reverse = mistakes.find(
          m =>
            m.incorrectIdentification === mistake.correctIdentification &&
            m.correctIdentification === mistake.incorrectIdentification
        );

        if (reverse) {
          pairs.push({
            food1: mistake.incorrectIdentification,
            food2: mistake.correctIdentification,
            totalFrequency: mistake.frequency + reverse.frequency
          });
          processed.add(key1);
          processed.add(key2);
        }
      }
    }

    return pairs.sort((a, b) => b.totalFrequency - a.totalFrequency);
  }

  private async analyzeCuisineTypeErrors(): Promise<
    Array<{
      cuisineType: string;
      errorCount: number;
      commonFoods: string[];
    }>
  > {
    // 簡化實現
    return [];
  }

  private calculateStats(
    feedbacks: UserFeedback[],
    affectedFoods: string[]
  ): {
    errorRate: number;
    averageConfidence: number;
    commonMistakes: number;
  } {
    let totalErrors = 0;
    let totalConfidence = 0;
    const mistakeSet = new Set<string>();

    for (const feedback of feedbacks) {
      const hasAffectedFood =
        affectedFoods.length === 0 ||
        feedback.userCorrection.incorrectFoods.some(f =>
          affectedFoods.some(af => f.actualFood.includes(af))
        );

      if (hasAffectedFood) {
        totalErrors +=
          feedback.userCorrection.incorrectFoods.length +
          feedback.userCorrection.missingFoods.length;
        totalConfidence += feedback.recognitionResult.overallConfidence;

        for (const incorrect of feedback.userCorrection.incorrectFoods) {
          mistakeSet.add(`${incorrect.identifiedAs}-${incorrect.actualFood}`);
        }
      }
    }

    return {
      errorRate: feedbacks.length > 0 ? totalErrors / feedbacks.length : 0,
      averageConfidence: feedbacks.length > 0 ? totalConfidence / feedbacks.length : 0,
      commonMistakes: mistakeSet.size
    };
  }

  private generateFoodRecommendations(
    foodName: string,
    accuracyRate: number,
    commonErrors: Array<{ error: string; frequency: number }>
  ): string[] {
    const recommendations: string[] = [];

    if (accuracyRate < 0.7) {
      recommendations.push(`${foodName} 的識別準確率較低（${(accuracyRate * 100).toFixed(1)}%），需要優先改進`);
      recommendations.push(`在 prompt 中添加 ${foodName} 的詳細視覺特徵描述`);
      recommendations.push(`更新知識庫中 ${foodName} 的資訊，包括易混淆食材`);
    }

    if (commonErrors.some(e => e.error.includes('遺漏'))) {
      recommendations.push(`${foodName} 經常被遺漏，建議在 prompt 中強調要列出所有可見食材`);
      recommendations.push(`添加驗證規則來檢測 ${foodName} 在常見菜餚中的存在`);
    }

    const misidentifications = commonErrors.filter(e => e.error.includes('誤識別為'));
    if (misidentifications.length > 0) {
      const topMisid = misidentifications[0].error.replace('誤識別為: ', '');
      recommendations.push(`${foodName} 經常被誤識別為 ${topMisid}，需要在 prompt 中明確區分這兩者`);
    }

    return recommendations;
  }

  private generateReportSummary(
    errorAnalysis: ErrorAnalysis,
    patterns: MistakePattern[],
    suggestions: ImprovementSuggestion[],
    stats: FeedbackStats
  ): string {
    const parts: string[] = [];

    parts.push(`總錯誤數: ${errorAnalysis.totalErrors}`);
    parts.push(`識別模式: ${patterns.length}個`);
    parts.push(`改進建議: ${suggestions.length}項`);

    const highPriority = suggestions.filter(s => s.priority === 'high');
    if (highPriority.length > 0) {
      parts.push(`高優先級建議: ${highPriority.length}項`);
    }

    if (patterns.length > 0) {
      const topPattern = patterns[0];
      parts.push(
        `最常見錯誤: ${topPattern.incorrectIdentification} → ${topPattern.correctIdentification} (${topPattern.frequency}次)`
      );
    }

    return parts.join(' | ');
  }
}
