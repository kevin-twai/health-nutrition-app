import {
  HealthTrend,
  TrendAnalysisResult,
  TrendInsight,
  TrendPrediction,
  TrendRecommendation,
  DateRange,
  InsightType,
  RecommendationType,
  Priority,
  DailyNutritionData,
  WeeklyNutritionData,
  AggregatedNutritionData
} from '@health-tracker/shared-types';
import { DataAggregator } from './DataAggregator';
import { UserRepository } from '../repositories/UserRepository';

/**
 * 趨勢分析引擎
 * 負責分析用戶的健康趨勢，提供洞察和預測
 */
export class TrendAnalyzer {
  constructor(
    private dataAggregator: DataAggregator,
    private userRepository: UserRepository
  ) {}

  /**
   * 分析用戶健康趨勢
   */
  async analyzeHealthTrends(
    userId: string,
    period: DateRange,
    comparisonPeriod?: DateRange
  ): Promise<TrendAnalysisResult> {
    // 獲取彙整資料
    const aggregatedData = await this.dataAggregator.aggregateNutritionData({
      userId,
      period,
      groupBy: 'day' as any,
      includeComparisons: true,
      includeTrends: true
    });

    // 分析趨勢
    const trends = await this.calculateTrends(aggregatedData, comparisonPeriod ? 
      await this.dataAggregator.aggregateNutritionData({
        userId,
        period: comparisonPeriod,
        groupBy: 'day' as any,
        includeComparisons: false,
        includeTrends: false
      }) : undefined
    );

    // 生成洞察
    const insights = await this.generateInsights(aggregatedData, trends);

    // 生成預測
    const predictions = await this.generatePredictions(aggregatedData);

    // 生成建議
    const recommendations = await this.generateRecommendations(trends, insights);

    return {
      trends,
      insights,
      predictions,
      recommendations
    };
  }

  /**
   * 計算健康趨勢
   */
  private async calculateTrends(
    currentData: AggregatedNutritionData,
    comparisonData?: AggregatedNutritionData
  ): Promise<HealthTrend[]> {
    const trends: HealthTrend[] = [];

    // 分析熱量趨勢
    const caloriesTrend = this.calculateMetricTrend(
      'calories',
      currentData.avgDailyCalories,
      comparisonData?.avgDailyCalories,
      currentData.dailyBreakdown.map(d => d.calories)
    );
    if (caloriesTrend) trends.push(caloriesTrend);

    // 分析蛋白質趨勢
    const avgDailyProtein = currentData.macronutrients.protein / currentData.dailyBreakdown.length;
    const comparisonAvgProtein = comparisonData ? 
      comparisonData.macronutrients.protein / comparisonData.dailyBreakdown.length : undefined;
    
    const proteinTrend = this.calculateMetricTrend(
      'protein',
      avgDailyProtein,
      comparisonAvgProtein,
      currentData.dailyBreakdown.map(d => d.protein)
    );
    if (proteinTrend) trends.push(proteinTrend);

    // 分析碳水化合物趨勢
    const avgDailyCarbs = currentData.macronutrients.carbohydrates / currentData.dailyBreakdown.length;
    const comparisonAvgCarbs = comparisonData ? 
      comparisonData.macronutrients.carbohydrates / comparisonData.dailyBreakdown.length : undefined;
    
    const carbsTrend = this.calculateMetricTrend(
      'carbohydrates',
      avgDailyCarbs,
      comparisonAvgCarbs,
      currentData.dailyBreakdown.map(d => d.carbohydrates)
    );
    if (carbsTrend) trends.push(carbsTrend);

    // 分析脂肪趨勢
    const avgDailyFat = currentData.macronutrients.fat / currentData.dailyBreakdown.length;
    const comparisonAvgFat = comparisonData ? 
      comparisonData.macronutrients.fat / comparisonData.dailyBreakdown.length : undefined;
    
    const fatTrend = this.calculateMetricTrend(
      'fat',
      avgDailyFat,
      comparisonAvgFat,
      currentData.dailyBreakdown.map(d => d.fat)
    );
    if (fatTrend) trends.push(fatTrend);

    // 分析纖維趨勢
    const avgDailyFiber = currentData.macronutrients.fiber / currentData.dailyBreakdown.length;
    const comparisonAvgFiber = comparisonData ? 
      comparisonData.macronutrients.fiber / comparisonData.dailyBreakdown.length : undefined;
    
    const fiberTrend = this.calculateMetricTrend(
      'fiber',
      avgDailyFiber,
      comparisonAvgFiber,
      currentData.dailyBreakdown.map(d => d.fiber)
    );
    if (fiberTrend) trends.push(fiberTrend);

    // 分析飲食一致性趨勢
    const consistencyTrend = this.calculateConsistencyTrend(currentData.weeklyAverages);
    if (consistencyTrend) trends.push(consistencyTrend);

    return trends;
  }

  /**
   * 計算單一指標的趨勢
   */
  private calculateMetricTrend(
    metric: string,
    currentValue: number,
    comparisonValue?: number,
    dailyValues?: number[]
  ): HealthTrend | null {
    let change = 0;
    let direction: 'up' | 'down' | 'stable' = 'stable';
    let significance: 'low' | 'medium' | 'high' = 'low';

    if (comparisonValue !== undefined) {
      // 與比較期間的變化
      change = ((currentValue - comparisonValue) / comparisonValue) * 100;
      
      if (Math.abs(change) < 5) {
        direction = 'stable';
        significance = 'low';
      } else if (Math.abs(change) < 15) {
        direction = change > 0 ? 'up' : 'down';
        significance = 'medium';
      } else {
        direction = change > 0 ? 'up' : 'down';
        significance = 'high';
      }
    } else if (dailyValues && dailyValues.length > 1) {
      // 分析期間內的趨勢
      const trend = this.calculateLinearTrend(dailyValues);
      change = trend.slope;
      
      if (Math.abs(trend.slope) < 1) {
        direction = 'stable';
        significance = 'low';
      } else if (Math.abs(trend.slope) < 5) {
        direction = trend.slope > 0 ? 'up' : 'down';
        significance = 'medium';
      } else {
        direction = trend.slope > 0 ? 'up' : 'down';
        significance = 'high';
      }
    }

    const description = this.generateTrendDescription(metric, direction, change, significance);

    return {
      metric,
      change: Math.round(change * 100) / 100,
      direction,
      significance,
      period: { start: new Date(), end: new Date() }, // 實際應該使用真實的期間
      description
    };
  }

  /**
   * 計算飲食一致性趨勢
   */
  private calculateConsistencyTrend(weeklyData: WeeklyNutritionData[]): HealthTrend | null {
    if (weeklyData.length < 2) return null;

    const consistencyValues = weeklyData.map(w => w.consistency);
    const trend = this.calculateLinearTrend(consistencyValues);
    
    let direction: 'up' | 'down' | 'stable' = 'stable';
    let significance: 'low' | 'medium' | 'high' = 'low';

    if (Math.abs(trend.slope) < 0.05) {
      direction = 'stable';
      significance = 'low';
    } else if (Math.abs(trend.slope) < 0.15) {
      direction = trend.slope > 0 ? 'up' : 'down';
      significance = 'medium';
    } else {
      direction = trend.slope > 0 ? 'up' : 'down';
      significance = 'high';
    }

    const avgConsistency = consistencyValues.reduce((sum, val) => sum + val, 0) / consistencyValues.length;

    return {
      metric: 'consistency',
      change: trend.slope * 100,
      direction,
      significance,
      period: { start: new Date(), end: new Date() },
      description: `飲食一致性${direction === 'up' ? '提升' : direction === 'down' ? '下降' : '穩定'}，平均一致性為 ${Math.round(avgConsistency * 100)}%`
    };
  }

  /**
   * 計算線性趨勢
   */
  private calculateLinearTrend(values: number[]): { slope: number; intercept: number; r2: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = values.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 計算 R²
    const yMean = sumY / n;
    const ssTotal = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssRes = values.reduce((sum, val, i) => sum + Math.pow(val - (slope * i + intercept), 2), 0);
    const r2 = 1 - (ssRes / ssTotal);

    return { slope, intercept, r2: isNaN(r2) ? 0 : r2 };
  }

  /**
   * 生成趨勢描述
   */
  private generateTrendDescription(
    metric: string,
    direction: 'up' | 'down' | 'stable',
    change: number,
    significance: 'low' | 'medium' | 'high'
  ): string {
    const metricNames: Record<string, string> = {
      calories: '熱量攝取',
      protein: '蛋白質攝取',
      carbohydrates: '碳水化合物攝取',
      fat: '脂肪攝取',
      fiber: '纖維攝取'
    };

    const metricName = metricNames[metric] || metric;
    const changeText = Math.abs(change).toFixed(1);

    if (direction === 'stable') {
      return `${metricName}保持穩定`;
    } else if (direction === 'up') {
      return `${metricName}增加了 ${changeText}%`;
    } else {
      return `${metricName}減少了 ${changeText}%`;
    }
  }

  /**
   * 生成洞察
   */
  private async generateInsights(
    data: AggregatedNutritionData,
    trends: HealthTrend[]
  ): Promise<TrendInsight[]> {
    const insights: TrendInsight[] = [];

    // 分析營養平衡
    const balanceInsight = this.analyzeNutritionalBalance(data);
    if (balanceInsight) insights.push(balanceInsight);

    // 分析異常模式
    const anomalyInsights = this.detectAnomalies(data);
    insights.push(...anomalyInsights);

    // 分析習慣形成
    const habitInsights = this.analyzeHabitFormation(data);
    insights.push(...habitInsights);

    return insights;
  }

  /**
   * 分析營養平衡
   */
  private analyzeNutritionalBalance(data: AggregatedNutritionData): TrendInsight | null {
    const totalMacros = data.macronutrients.protein + data.macronutrients.carbohydrates + data.macronutrients.fat;
    
    if (totalMacros === 0) return null;

    const proteinRatio = (data.macronutrients.protein * 4) / data.totalCalories;
    const carbRatio = (data.macronutrients.carbohydrates * 4) / data.totalCalories;
    const fatRatio = (data.macronutrients.fat * 9) / data.totalCalories;

    let severity: 'info' | 'warning' | 'critical' = 'info';
    let description = '營養素比例均衡';

    // 檢查是否偏離建議比例
    if (proteinRatio < 0.1 || proteinRatio > 0.35) {
      severity = 'warning';
      description = `蛋白質比例${proteinRatio < 0.1 ? '過低' : '過高'} (${Math.round(proteinRatio * 100)}%)`;
    } else if (carbRatio < 0.45 || carbRatio > 0.65) {
      severity = 'warning';
      description = `碳水化合物比例${carbRatio < 0.45 ? '過低' : '過高'} (${Math.round(carbRatio * 100)}%)`;
    } else if (fatRatio < 0.2 || fatRatio > 0.35) {
      severity = 'warning';
      description = `脂肪比例${fatRatio < 0.2 ? '過低' : '過高'} (${Math.round(fatRatio * 100)}%)`;
    }

    return {
      type: InsightType.NUTRITIONAL_BALANCE,
      title: '營養素平衡分析',
      description,
      severity,
      confidence: 0.8,
      relatedMetrics: ['protein', 'carbohydrates', 'fat']
    };
  }

  /**
   * 檢測異常模式
   */
  private detectAnomalies(data: AggregatedNutritionData): TrendInsight[] {
    const insights: TrendInsight[] = [];

    // 檢測熱量攝取異常
    const calorieValues = data.dailyBreakdown.map(d => d.calories);
    const calorieAnomaly = this.detectOutliers(calorieValues);
    
    if (calorieAnomaly.outliers.length > 0) {
      insights.push({
        type: InsightType.ANOMALY_DETECTION,
        title: '熱量攝取異常',
        description: `發現 ${calorieAnomaly.outliers.length} 天的熱量攝取異常`,
        severity: calorieAnomaly.outliers.length > 3 ? 'warning' : 'info',
        confidence: 0.7,
        relatedMetrics: ['calories']
      });
    }

    return insights;
  }

  /**
   * 分析習慣形成
   */
  private analyzeHabitFormation(data: AggregatedNutritionData): TrendInsight[] {
    const insights: TrendInsight[] = [];

    // 分析餐點規律性
    const mealRegularity = this.analyzeMealRegularity(data.dailyBreakdown);
    if (mealRegularity) insights.push(mealRegularity);

    return insights;
  }

  /**
   * 分析餐點規律性
   */
  private analyzeMealRegularity(dailyData: DailyNutritionData[]): TrendInsight | null {
    const breakfastDays = dailyData.filter(d => d.mealCounts.breakfast > 0).length;
    const lunchDays = dailyData.filter(d => d.mealCounts.lunch > 0).length;
    const dinnerDays = dailyData.filter(d => d.mealCounts.dinner > 0).length;

    const totalDays = dailyData.length;
    const breakfastRate = breakfastDays / totalDays;
    const lunchRate = lunchDays / totalDays;
    const dinnerRate = dinnerDays / totalDays;

    let severity: 'info' | 'warning' | 'critical' = 'info';
    let description = '餐點記錄規律';

    if (breakfastRate < 0.5) {
      severity = 'warning';
      description = `早餐記錄不規律 (${Math.round(breakfastRate * 100)}% 的天數)`;
    } else if (lunchRate < 0.7 || dinnerRate < 0.7) {
      severity = 'info';
      description = '部分餐點記錄不完整';
    }

    return {
      type: InsightType.HABIT_FORMATION,
      title: '餐點規律性分析',
      description,
      severity,
      confidence: 0.6,
      relatedMetrics: ['meal_frequency']
    };
  }

  /**
   * 檢測異常值
   */
  private detectOutliers(values: number[]): { outliers: number[]; threshold: number } {
    if (values.length < 4) return { outliers: [], threshold: 0 };

    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const threshold = 1.5 * iqr;

    const outliers = values.filter(v => v < q1 - threshold || v > q3 + threshold);

    return { outliers, threshold };
  }

  /**
   * 生成預測
   */
  private async generatePredictions(data: AggregatedNutritionData): Promise<TrendPrediction[]> {
    const predictions: TrendPrediction[] = [];

    // 預測未來7天的平均熱量攝取
    const calorieValues = data.dailyBreakdown.map(d => d.calories);
    const calorieTrend = this.calculateLinearTrend(calorieValues);
    
    if (calorieTrend.r2 > 0.3) { // 只有在趨勢明顯時才預測
      const predictedCalories = calorieTrend.slope * calorieValues.length + calorieTrend.intercept;
      
      predictions.push({
        metric: 'calories',
        predictedValue: Math.max(0, predictedCalories),
        confidence: calorieTrend.r2,
        timeframe: 7,
        factors: ['歷史攝取模式', '趨勢變化']
      });
    }

    return predictions;
  }

  /**
   * 生成建議
   */
  private async generateRecommendations(
    trends: HealthTrend[],
    insights: TrendInsight[]
  ): Promise<TrendRecommendation[]> {
    const recommendations: TrendRecommendation[] = [];

    // 根據趨勢生成建議
    for (const trend of trends) {
      const recommendation = this.generateTrendRecommendation(trend);
      if (recommendation) recommendations.push(recommendation);
    }

    // 根據洞察生成建議
    for (const insight of insights) {
      const recommendation = this.generateInsightRecommendation(insight);
      if (recommendation) recommendations.push(recommendation);
    }

    return recommendations;
  }

  /**
   * 根據趨勢生成建議
   */
  private generateTrendRecommendation(trend: HealthTrend): TrendRecommendation | null {
    if (trend.significance === 'low') return null;

    const id = `trend_${trend.metric}_${Date.now()}`;
    let type: RecommendationType = RecommendationType.NUTRITION_ADJUSTMENT;
    let title = '';
    let description = '';
    let priority: Priority = Priority.MEDIUM;

    switch (trend.metric) {
      case 'calories':
        if (trend.direction === 'up' && trend.change > 10) {
          title = '控制熱量攝取';
          description = '您的熱量攝取有上升趨勢，建議適度控制份量或選擇低熱量食物';
          priority = Priority.HIGH;
        } else if (trend.direction === 'down' && trend.change < -15) {
          title = '增加熱量攝取';
          description = '您的熱量攝取偏低，建議增加健康的高熱量食物';
          priority = Priority.MEDIUM;
        }
        break;

      case 'protein':
        if (trend.direction === 'down') {
          title = '增加蛋白質攝取';
          description = '蛋白質攝取有下降趨勢，建議增加瘦肉、魚類、豆類等優質蛋白質';
          type = RecommendationType.MEAL_PLANNING;
        }
        break;

      case 'fiber':
        if (trend.direction === 'down') {
          title = '增加膳食纖維';
          description = '膳食纖維攝取不足，建議多吃蔬菜、水果和全穀類食物';
          type = RecommendationType.NUTRITION_ADJUSTMENT;
        }
        break;
    }

    if (!title) return null;

    return {
      id,
      type,
      title,
      description,
      priority,
      expectedImpact: '改善營養平衡',
      relatedTrends: [trend.metric]
    };
  }

  /**
   * 根據洞察生成建議
   */
  private generateInsightRecommendation(insight: TrendInsight): TrendRecommendation | null {
    if (insight.severity === 'info') return null;

    const id = `insight_${insight.type}_${Date.now()}`;
    let type: RecommendationType = RecommendationType.NUTRITION_ADJUSTMENT;
    let title = '';
    let description = '';
    let priority: Priority = insight.severity === 'critical' ? Priority.HIGH : Priority.MEDIUM;

    switch (insight.type) {
      case InsightType.NUTRITIONAL_BALANCE:
        title = '調整營養素比例';
        description = '建議調整三大營養素的攝取比例，以達到更好的營養平衡';
        type = RecommendationType.MEAL_PLANNING;
        break;

      case InsightType.HABIT_FORMATION:
        title = '建立規律飲食習慣';
        description = '建議建立更規律的用餐時間，特別是早餐的攝取';
        type = RecommendationType.HABIT_FORMATION;
        break;

      case InsightType.ANOMALY_DETECTION:
        title = '注意飲食規律性';
        description = '發現飲食攝取有異常波動，建議保持更穩定的飲食模式';
        type = RecommendationType.HABIT_FORMATION;
        break;
    }

    if (!title) return null;

    return {
      id,
      type,
      title,
      description,
      priority,
      expectedImpact: '提升整體健康狀況',
      relatedTrends: insight.relatedMetrics
    };
  }
}