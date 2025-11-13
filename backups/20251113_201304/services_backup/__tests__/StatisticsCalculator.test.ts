import { StatisticsCalculator } from '../StatisticsCalculator';

describe('StatisticsCalculator', () => {
  describe('基本統計計算', () => {
    it('應該正確計算平均值', () => {
      expect(StatisticsCalculator.calculateMean([1, 2, 3, 4, 5])).toBe(3);
      expect(StatisticsCalculator.calculateMean([10, 20, 30])).toBe(20);
      expect(StatisticsCalculator.calculateMean([])).toBe(0);
      expect(StatisticsCalculator.calculateMean([5])).toBe(5);
    });

    it('應該正確計算中位數', () => {
      expect(StatisticsCalculator.calculateMedian([1, 2, 3, 4, 5])).toBe(3);
      expect(StatisticsCalculator.calculateMedian([1, 2, 3, 4])).toBe(2.5);
      expect(StatisticsCalculator.calculateMedian([5, 1, 3, 2, 4])).toBe(3);
      expect(StatisticsCalculator.calculateMedian([])).toBe(0);
      expect(StatisticsCalculator.calculateMedian([7])).toBe(7);
    });

    it('應該正確計算標準差', () => {
      const result = StatisticsCalculator.calculateStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(result).toBeCloseTo(2, 0);
      
      expect(StatisticsCalculator.calculateStandardDeviation([1, 1, 1, 1])).toBe(0);
      expect(StatisticsCalculator.calculateStandardDeviation([])).toBe(0);
    });

    it('應該正確計算變異係數', () => {
      const result = StatisticsCalculator.calculateCoefficientOfVariation([10, 12, 14, 16, 18]);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
      
      expect(StatisticsCalculator.calculateCoefficientOfVariation([5, 5, 5, 5])).toBe(0);
      expect(StatisticsCalculator.calculateCoefficientOfVariation([])).toBe(0);
    });
  });

  describe('百分位數計算', () => {
    it('應該正確計算百分位數', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      expect(StatisticsCalculator.calculatePercentile(data, 0)).toBe(1);
      expect(StatisticsCalculator.calculatePercentile(data, 50)).toBe(5.5);
      expect(StatisticsCalculator.calculatePercentile(data, 100)).toBe(10);
      expect(StatisticsCalculator.calculatePercentile([], 50)).toBe(0);
    });

    it('應該在百分位數超出範圍時拋出錯誤', () => {
      expect(() => StatisticsCalculator.calculatePercentile([1, 2, 3], -1)).toThrow();
      expect(() => StatisticsCalculator.calculatePercentile([1, 2, 3], 101)).toThrow();
    });

    it('應該正確計算四分位數', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const quartiles = StatisticsCalculator.calculateQuartiles(data);
      
      expect(quartiles.q1).toBe(3.25);
      expect(quartiles.q2).toBe(5.5);
      expect(quartiles.q3).toBe(7.75);
      expect(quartiles.iqr).toBe(4.5);
    });
  });

  describe('異常值檢測', () => {
    it('應該正確檢測異常值', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100]; // 100 是異常值
      const result = StatisticsCalculator.detectOutliers(data);
      
      expect(result.outliers).toContain(100);
      expect(result.cleanValues).not.toContain(100);
      expect(result.cleanValues.length).toBe(9);
    });

    it('應該處理沒有異常值的情況', () => {
      const data = [1, 2, 3, 4, 5];
      const result = StatisticsCalculator.detectOutliers(data);
      
      expect(result.outliers).toHaveLength(0);
      expect(result.cleanValues).toHaveLength(5);
    });
  });

  describe('線性回歸', () => {
    it('應該正確計算線性回歸', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10]; // 完美的線性關係 y = 2x
      
      const result = StatisticsCalculator.calculateLinearRegression(x, y);
      
      expect(result.slope).toBeCloseTo(2, 1);
      expect(result.intercept).toBeCloseTo(0, 1);
      expect(result.rSquared).toBeCloseTo(1, 1);
      expect(result.correlation).toBeCloseTo(1, 1);
    });

    it('應該處理無關聯的資料', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [5, 3, 8, 2, 7]; // 隨機資料
      
      const result = StatisticsCalculator.calculateLinearRegression(x, y);
      
      expect(Math.abs(result.correlation)).toBeLessThan(0.8);
      expect(result.rSquared).toBeLessThan(0.8);
    });

    it('應該處理資料長度不匹配的情況', () => {
      const result = StatisticsCalculator.calculateLinearRegression([1, 2], [1]);
      
      expect(result.slope).toBe(0);
      expect(result.intercept).toBe(0);
      expect(result.rSquared).toBe(0);
      expect(result.correlation).toBe(0);
    });
  });

  describe('移動平均', () => {
    it('應該正確計算移動平均', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = StatisticsCalculator.calculateMovingAverage(data, 3);
      
      expect(result).toHaveLength(8); // 10 - 3 + 1 = 8
      expect(result[0]).toBe(2); // (1+2+3)/3 = 2
      expect(result[1]).toBe(3); // (2+3+4)/3 = 3
      expect(result[7]).toBe(9); // (8+9+10)/3 = 9
    });

    it('應該處理窗口大小無效的情況', () => {
      const data = [1, 2, 3, 4, 5];
      
      expect(StatisticsCalculator.calculateMovingAverage(data, 0)).toEqual(data);
      expect(StatisticsCalculator.calculateMovingAverage(data, 10)).toEqual(data);
    });
  });

  describe('指數移動平均', () => {
    it('應該正確計算指數移動平均', () => {
      const data = [10, 12, 13, 12, 15];
      const result = StatisticsCalculator.calculateExponentialMovingAverage(data, 0.3);
      
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(10); // 第一個值保持不變
      expect(result[1]).toBeCloseTo(10.6, 1); // 0.3 * 12 + 0.7 * 10 = 10.6
    });

    it('應該在 alpha 超出範圍時拋出錯誤', () => {
      expect(() => StatisticsCalculator.calculateExponentialMovingAverage([1, 2, 3], -0.1)).toThrow();
      expect(() => StatisticsCalculator.calculateExponentialMovingAverage([1, 2, 3], 1.1)).toThrow();
    });
  });

  describe('趨勢分析', () => {
    it('應該正確識別上升趨勢', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = StatisticsCalculator.calculateTrendStrength(data);
      
      expect(result.direction).toBe('up');
      expect(result.strength).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('應該正確識別下降趨勢', () => {
      const data = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
      const result = StatisticsCalculator.calculateTrendStrength(data);
      
      expect(result.direction).toBe('down');
      expect(result.strength).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('應該正確識別穩定趨勢', () => {
      const data = [5, 5.1, 4.9, 5.05, 4.95, 5.02, 4.98];
      const result = StatisticsCalculator.calculateTrendStrength(data);
      
      expect(result.direction).toBe('stable');
      expect(result.strength).toBeLessThan(0.1);
    });
  });

  describe('高級統計功能', () => {
    it('應該正確計算變化率', () => {
      expect(StatisticsCalculator.calculateChangeRate(110, 100)).toBe(10);
      expect(StatisticsCalculator.calculateChangeRate(90, 100)).toBe(-10);
      expect(StatisticsCalculator.calculateChangeRate(100, 100)).toBe(0);
      expect(StatisticsCalculator.calculateChangeRate(50, 0)).toBe(Infinity);
    });

    it('應該正確計算複合年增長率', () => {
      const cagr = StatisticsCalculator.calculateCAGR(100, 121, 2);
      expect(cagr).toBeCloseTo(10, 0); // 10% CAGR
      
      expect(StatisticsCalculator.calculateCAGR(0, 100, 2)).toBe(0);
      expect(StatisticsCalculator.calculateCAGR(100, 121, 0)).toBe(0);
    });

    it('應該正確計算波動性', () => {
      const stableData = [100, 100, 100, 100, 100];
      const volatileData = [100, 120, 80, 110, 90];
      
      const stableVolatility = StatisticsCalculator.calculateVolatility(stableData);
      const volatileVolatility = StatisticsCalculator.calculateVolatility(volatileData);
      
      expect(stableVolatility).toBe(0);
      expect(volatileVolatility).toBeGreaterThan(stableVolatility);
    });

    it('應該正確計算一致性分數', () => {
      const consistentData = [10, 10.1, 9.9, 10.05, 9.95];
      const inconsistentData = [10, 15, 5, 20, 2];
      
      const consistentScore = StatisticsCalculator.calculateConsistencyScore(consistentData);
      const inconsistentScore = StatisticsCalculator.calculateConsistencyScore(inconsistentData);
      
      expect(consistentScore).toBeGreaterThan(inconsistentScore);
      expect(consistentScore).toBeCloseTo(1, 0);
    });

    it('應該正確計算健康分數', () => {
      const metrics = {
        consistency: 0.9,
        balance: 0.8,
        adequacy: 0.85,
        variety: 0.7
      };
      
      const score = StatisticsCalculator.calculateHealthScore(metrics);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeCloseTo(82.5, 0); // 加權平均
    });

    it('應該正確計算營養素充足率', () => {
      expect(StatisticsCalculator.calculateNutrientAdequacy(100, 100)).toBe(1);
      expect(StatisticsCalculator.calculateNutrientAdequacy(150, 100)).toBe(1.5);
      expect(StatisticsCalculator.calculateNutrientAdequacy(250, 100)).toBe(2); // 最高200%
      expect(StatisticsCalculator.calculateNutrientAdequacy(50, 100)).toBe(0.5);
      expect(StatisticsCalculator.calculateNutrientAdequacy(100, 0)).toBe(0);
    });

    it('應該正確計算飲食多樣性指數', () => {
      const diverseFood = { apple: 2, banana: 2, chicken: 2, rice: 2 };
      const monotonousFood = { apple: 10, banana: 1 };
      
      const diverseIndex = StatisticsCalculator.calculateDiversityIndex(diverseFood);
      const monotonousIndex = StatisticsCalculator.calculateDiversityIndex(monotonousFood);
      
      expect(diverseIndex).toBeGreaterThan(monotonousIndex);
      expect(StatisticsCalculator.calculateDiversityIndex({})).toBe(0);
    });
  });

  describe('時間序列分析', () => {
    it('應該檢測平穩時間序列', () => {
      const stationaryData = [10, 10.5, 9.8, 10.2, 9.9, 10.1, 10.3, 9.7, 10.0, 10.4];
      const result = StatisticsCalculator.calculateStationarity(stationaryData);
      
      expect(result.isStationary).toBe(true);
      expect(result.pValue).toBeLessThan(0.05);
    });

    it('應該檢測非平穩時間序列', () => {
      const nonStationaryData = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]; // 指數增長
      const result = StatisticsCalculator.calculateStationarity(nonStationaryData);
      
      expect(result.isStationary).toBe(false);
      expect(result.pValue).toBeGreaterThan(0.05);
    });

    it('應該處理資料不足的情況', () => {
      const shortData = [1, 2, 3];
      const result = StatisticsCalculator.calculateStationarity(shortData);
      
      expect(result.isStationary).toBe(false);
      expect(result.pValue).toBe(1);
      expect(result.testStatistic).toBe(0);
    });
  });
});