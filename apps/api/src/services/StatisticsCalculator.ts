import { DateRange } from '../types/shared';

/**
 * 統計計算工具類
 * 提供各種統計計算方法，支援趨勢分析和資料彙整
 */
export class StatisticsCalculator {
  /**
   * 計算平均值
   */
  static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * 計算中位數
   */
  static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  /**
   * 計算標準差
   */
  static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * 計算變異係數 (CV)
   */
  static calculateCoefficientOfVariation(values: number[]): number {
    const mean = this.calculateMean(values);
    if (mean === 0) return 0;
    
    const stdDev = this.calculateStandardDeviation(values);
    return stdDev / mean;
  }

  /**
   * 計算百分位數
   */
  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    if (percentile < 0 || percentile > 100) throw new Error('百分位數必須在 0-100 之間');
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    
    if (Number.isInteger(index)) {
      return sorted[index];
    } else {
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
  }

  /**
   * 計算四分位數
   */
  static calculateQuartiles(values: number[]): {
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
  } {
    return {
      q1: this.calculatePercentile(values, 25),
      q2: this.calculatePercentile(values, 50),
      q3: this.calculatePercentile(values, 75),
      iqr: this.calculatePercentile(values, 75) - this.calculatePercentile(values, 25)
    };
  }

  /**
   * 檢測異常值 (使用 IQR 方法)
   */
  static detectOutliers(values: number[], multiplier: number = 1.5): {
    outliers: number[];
    lowerBound: number;
    upperBound: number;
    cleanValues: number[];
  } {
    const quartiles = this.calculateQuartiles(values);
    const lowerBound = quartiles.q1 - multiplier * quartiles.iqr;
    const upperBound = quartiles.q3 + multiplier * quartiles.iqr;
    
    const outliers = values.filter(val => val < lowerBound || val > upperBound);
    const cleanValues = values.filter(val => val >= lowerBound && val <= upperBound);
    
    return {
      outliers,
      lowerBound,
      upperBound,
      cleanValues
    };
  }

  /**
   * 計算線性回歸
   */
  static calculateLinearRegression(xValues: number[], yValues: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
    correlation: number;
  } {
    if (xValues.length !== yValues.length || xValues.length < 2) {
      return { slope: 0, intercept: 0, rSquared: 0, correlation: 0 };
    }

    const n = xValues.length;
    const sumX = xValues.reduce((sum, val) => sum + val, 0);
    const sumY = yValues.reduce((sum, val) => sum + val, 0);
    const sumXY = xValues.reduce((sum, val, i) => sum + val * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = yValues.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 計算相關係數
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const correlation = denominator === 0 ? 0 : numerator / denominator;

    // 計算 R²
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssRes = yValues.reduce((sum, val, i) => sum + Math.pow(val - (slope * xValues[i] + intercept), 2), 0);
    const rSquared = ssTotal === 0 ? 0 : 1 - (ssRes / ssTotal);

    return {
      slope: isNaN(slope) ? 0 : slope,
      intercept: isNaN(intercept) ? 0 : intercept,
      rSquared: isNaN(rSquared) ? 0 : Math.max(0, rSquared),
      correlation: isNaN(correlation) ? 0 : correlation
    };
  }

  /**
   * 計算移動平均
   */
  static calculateMovingAverage(values: number[], windowSize: number): number[] {
    if (windowSize <= 0 || windowSize > values.length) return values;
    
    const result: number[] = [];
    
    for (let i = 0; i <= values.length - windowSize; i++) {
      const window = values.slice(i, i + windowSize);
      const average = this.calculateMean(window);
      result.push(average);
    }
    
    return result;
  }

  /**
   * 計算指數移動平均 (EMA)
   */
  static calculateExponentialMovingAverage(values: number[], alpha: number = 0.3): number[] {
    if (values.length === 0) return [];
    if (alpha < 0 || alpha > 1) throw new Error('Alpha 必須在 0-1 之間');
    
    const result: number[] = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      const ema = alpha * values[i] + (1 - alpha) * result[i - 1];
      result.push(ema);
    }
    
    return result;
  }

  /**
   * 計算趨勢強度
   */
  static calculateTrendStrength(values: number[]): {
    strength: number;
    direction: 'up' | 'down' | 'stable';
    confidence: number;
  } {
    if (values.length < 3) {
      return { strength: 0, direction: 'stable', confidence: 0 };
    }

    const xValues = Array.from({ length: values.length }, (_, i) => i);
    const regression = this.calculateLinearRegression(xValues, values);
    
    const strength = Math.abs(regression.slope);
    const direction = regression.slope > 0.1 ? 'up' : regression.slope < -0.1 ? 'down' : 'stable';
    const confidence = Math.abs(regression.correlation);
    
    return { strength, direction, confidence };
  }

  /**
   * 計算季節性指數
   */
  static calculateSeasonalityIndex(values: number[], period: number = 7): number {
    if (values.length < period * 2) return 0;
    
    const seasonalAverages: number[] = [];
    
    for (let i = 0; i < period; i++) {
      const seasonalValues: number[] = [];
      for (let j = i; j < values.length; j += period) {
        seasonalValues.push(values[j]);
      }
      seasonalAverages.push(this.calculateMean(seasonalValues));
    }
    
    const overallMean = this.calculateMean(values);
    const seasonalVariance = seasonalAverages.reduce((sum, avg) => sum + Math.pow(avg - overallMean, 2), 0) / period;
    const totalVariance = this.calculateStandardDeviation(values) ** 2;
    
    return totalVariance === 0 ? 0 : seasonalVariance / totalVariance;
  }

  /**
   * 計算自相關係數
   */
  static calculateAutocorrelation(values: number[], lag: number = 1): number {
    if (values.length <= lag) return 0;
    
    const n = values.length - lag;
    const mean = this.calculateMean(values);
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }
    
    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * 計算變化率
   */
  static calculateChangeRate(currentValue: number, previousValue: number): number {
    if (previousValue === 0) return currentValue === 0 ? 0 : Infinity;
    return ((currentValue - previousValue) / previousValue) * 100;
  }

  /**
   * 計算複合年增長率 (CAGR)
   */
  static calculateCAGR(startValue: number, endValue: number, periods: number): number {
    if (startValue <= 0 || periods <= 0) return 0;
    return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
  }

  /**
   * 計算波動性 (使用標準差)
   */
  static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const returns: number[] = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        returns.push((values[i] - values[i - 1]) / values[i - 1]);
      }
    }
    
    return this.calculateStandardDeviation(returns);
  }

  /**
   * 計算一致性分數 (基於變異係數的倒數)
   */
  static calculateConsistencyScore(values: number[]): number {
    if (values.length === 0) return 0;
    
    const cv = this.calculateCoefficientOfVariation(values);
    return cv === 0 ? 1 : Math.max(0, 1 - cv);
  }

  /**
   * 計算健康分數 (基於多個指標的綜合評分)
   */
  static calculateHealthScore(metrics: {
    consistency: number;
    balance: number;
    adequacy: number;
    variety: number;
  }): number {
    const weights = {
      consistency: 0.3,
      balance: 0.3,
      adequacy: 0.25,
      variety: 0.15
    };
    
    return (
      metrics.consistency * weights.consistency +
      metrics.balance * weights.balance +
      metrics.adequacy * weights.adequacy +
      metrics.variety * weights.variety
    ) * 100;
  }

  /**
   * 計算營養素充足率
   */
  static calculateNutrientAdequacy(actual: number, recommended: number): number {
    if (recommended <= 0) return 0;
    return Math.min(actual / recommended, 2); // 最高為200%
  }

  /**
   * 計算飲食多樣性指數 (Shannon Diversity Index)
   */
  static calculateDiversityIndex(foodCounts: Record<string, number>): number {
    const total = Object.values(foodCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    
    let diversity = 0;
    for (const count of Object.values(foodCounts)) {
      if (count > 0) {
        const proportion = count / total;
        diversity -= proportion * Math.log(proportion);
      }
    }
    
    return diversity;
  }

  /**
   * 計算時間序列的平穩性 (使用 ADF 測試的簡化版本)
   */
  static calculateStationarity(values: number[]): {
    isStationary: boolean;
    pValue: number;
    testStatistic: number;
  } {
    if (values.length < 10) {
      return { isStationary: false, pValue: 1, testStatistic: 0 };
    }

    // 計算一階差分
    const differences: number[] = [];
    for (let i = 1; i < values.length; i++) {
      differences.push(values[i] - values[i - 1]);
    }

    // 簡化的平穩性檢測：檢查差分的方差是否穩定
    const firstHalf = differences.slice(0, Math.floor(differences.length / 2));
    const secondHalf = differences.slice(Math.floor(differences.length / 2));
    
    const var1 = this.calculateStandardDeviation(firstHalf) ** 2;
    const var2 = this.calculateStandardDeviation(secondHalf) ** 2;
    
    const fStatistic = Math.max(var1, var2) / Math.min(var1, var2);
    const isStationary = fStatistic < 2; // 簡化的臨界值
    
    return {
      isStationary,
      pValue: isStationary ? 0.01 : 0.1, // 簡化的 p 值
      testStatistic: fStatistic
    };
  }
}