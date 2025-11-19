/**
 * RecognitionConsistencyMonitor 測試
 */

import { RecognitionConsistencyMonitor, RecognitionSessionMetrics, ConsistencyCheckResult } from '../RecognitionConsistencyMonitor';

describe('RecognitionConsistencyMonitor', () => {
  let monitor: RecognitionConsistencyMonitor;

  beforeEach(() => {
    monitor = RecognitionConsistencyMonitor.getInstance();
    monitor.reset(); // 重置以確保測試獨立性
  });

  describe('recordSession', () => {
    it('應該正確記錄會話指標', () => {
      const consistencyCheck: ConsistencyCheckResult = {
        passed: true,
        baseRecognitionFoodCount: 3,
        componentDetectionCount: 3,
        missingFoodsCount: 0,
        extraComponentsCount: 0,
        missingFoods: [],
        extraComponents: [],
        matchRate: 1.0
      };

      const metrics: RecognitionSessionMetrics = {
        sessionId: 'test-session-1',
        timestamp: new Date(),
        totalProcessingTime: 5000,
        baseRecognitionTime: 2000,
        componentDetectionTime: 3000,
        visionApiCalls: 0,
        visionApiCallsAvoided: 1,
        usedPreRecognizedFoods: true,
        consistencyCheck,
        detectionMethod: 'pre_recognized',
        success: true,
        recognizedFoodsCount: 3,
        componentsDetectedCount: 3
      };

      monitor.recordSession(metrics);

      const stats = monitor.getStatistics(60000);
      expect(stats.totalSessions).toBe(1);
      expect(stats.successfulSessions).toBe(1);
      expect(stats.averageTotalProcessingTime).toBe(5000);
    });

    it('應該記錄失敗的會話', () => {
      const consistencyCheck: ConsistencyCheckResult = {
        passed: false,
        baseRecognitionFoodCount: 0,
        componentDetectionCount: 0,
        missingFoodsCount: 0,
        extraComponentsCount: 0,
        missingFoods: [],
        extraComponents: [],
        matchRate: 0
      };

      const metrics: RecognitionSessionMetrics = {
        sessionId: 'test-session-2',
        timestamp: new Date(),
        totalProcessingTime: 1000,
        baseRecognitionTime: 0,
        componentDetectionTime: 0,
        visionApiCalls: 0,
        visionApiCallsAvoided: 0,
        usedPreRecognizedFoods: false,
        consistencyCheck,
        detectionMethod: 'vision_api',
        success: false,
        errorType: 'VISION_API_ERROR',
        errorMessage: 'Vision API 調用失敗',
        recognizedFoodsCount: 0,
        componentsDetectedCount: 0
      };

      monitor.recordSession(metrics);

      const stats = monitor.getStatistics(60000);
      expect(stats.totalSessions).toBe(1);
      expect(stats.failedSessions).toBe(1);
      expect(stats.errorRate).toBe(1);
    });
  });

  describe('getStatistics', () => {
    it('應該計算正確的統計數據', () => {
      // 記錄多個會話
      for (let i = 0; i < 5; i++) {
        const consistencyCheck: ConsistencyCheckResult = {
          passed: true,
          baseRecognitionFoodCount: 3,
          componentDetectionCount: 3,
          missingFoodsCount: 0,
          extraComponentsCount: 0,
          missingFoods: [],
          extraComponents: [],
          matchRate: 1.0
        };

        const metrics: RecognitionSessionMetrics = {
          sessionId: `test-session-${i}`,
          timestamp: new Date(),
          totalProcessingTime: 5000 + i * 1000,
          baseRecognitionTime: 2000,
          componentDetectionTime: 3000 + i * 1000,
          visionApiCalls: i % 2 === 0 ? 0 : 1,
          visionApiCallsAvoided: i % 2 === 0 ? 1 : 0,
          usedPreRecognizedFoods: i % 2 === 0,
          consistencyCheck,
          detectionMethod: i % 2 === 0 ? 'pre_recognized' : 'vision_api',
          success: true,
          recognizedFoodsCount: 3,
          componentsDetectedCount: 3
        };

        monitor.recordSession(metrics);
      }

      const stats = monitor.getStatistics(60000);
      
      expect(stats.totalSessions).toBe(5);
      expect(stats.successfulSessions).toBe(5);
      expect(stats.successRate).toBe(1);
      expect(stats.averageTotalProcessingTime).toBeGreaterThan(0);
      expect(stats.sessionsUsingPreRecognizedFoods).toBe(3); // 0, 2, 4
      expect(stats.preRecognizedFoodsUsageRate).toBe(0.6);
    });

    it('應該正確計算一致性統計', () => {
      // 完美一致性會話
      const perfectConsistency: ConsistencyCheckResult = {
        passed: true,
        baseRecognitionFoodCount: 3,
        componentDetectionCount: 3,
        missingFoodsCount: 0,
        extraComponentsCount: 0,
        missingFoods: [],
        extraComponents: [],
        matchRate: 1.0
      };

      const perfectMetrics: RecognitionSessionMetrics = {
        sessionId: 'perfect-session',
        timestamp: new Date(),
        totalProcessingTime: 5000,
        baseRecognitionTime: 2000,
        componentDetectionTime: 3000,
        visionApiCalls: 0,
        visionApiCallsAvoided: 1,
        usedPreRecognizedFoods: true,
        consistencyCheck: perfectConsistency,
        detectionMethod: 'pre_recognized',
        success: true,
        recognizedFoodsCount: 3,
        componentsDetectedCount: 3
      };

      monitor.recordSession(perfectMetrics);

      // 部分一致性會話
      const partialConsistency: ConsistencyCheckResult = {
        passed: false,
        baseRecognitionFoodCount: 3,
        componentDetectionCount: 4,
        missingFoodsCount: 1,
        extraComponentsCount: 2,
        missingFoods: ['白飯'],
        extraComponents: ['炒高麗菜', '辣椒炒肉末'],
        matchRate: 0.67
      };

      const partialMetrics: RecognitionSessionMetrics = {
        sessionId: 'partial-session',
        timestamp: new Date(),
        totalProcessingTime: 6000,
        baseRecognitionTime: 2000,
        componentDetectionTime: 4000,
        visionApiCalls: 1,
        visionApiCallsAvoided: 0,
        usedPreRecognizedFoods: false,
        consistencyCheck: partialConsistency,
        detectionMethod: 'vision_api',
        success: true,
        recognizedFoodsCount: 3,
        componentsDetectedCount: 4
      };

      monitor.recordSession(partialMetrics);

      const stats = monitor.getStatistics(60000);
      
      expect(stats.totalSessions).toBe(2);
      expect(stats.sessionsWithPerfectConsistency).toBe(1);
      expect(stats.perfectConsistencyRate).toBe(0.5);
      expect(stats.averageConsistencyMatchRate).toBeCloseTo(0.835, 2); // (1.0 + 0.67) / 2
      expect(stats.averageMissingFoodsCount).toBe(0.5); // (0 + 1) / 2
      expect(stats.averageExtraComponentsCount).toBe(1); // (0 + 2) / 2
    });

    it('應該正確計算 Vision API 統計', () => {
      // 使用預識別食物的會話
      const preRecognizedMetrics: RecognitionSessionMetrics = {
        sessionId: 'pre-recognized-session',
        timestamp: new Date(),
        totalProcessingTime: 4000,
        baseRecognitionTime: 2000,
        componentDetectionTime: 2000,
        visionApiCalls: 0,
        visionApiCallsAvoided: 1,
        usedPreRecognizedFoods: true,
        consistencyCheck: {
          passed: true,
          baseRecognitionFoodCount: 3,
          componentDetectionCount: 3,
          missingFoodsCount: 0,
          extraComponentsCount: 0,
          missingFoods: [],
          extraComponents: [],
          matchRate: 1.0
        },
        detectionMethod: 'pre_recognized',
        success: true,
        recognizedFoodsCount: 3,
        componentsDetectedCount: 3
      };

      monitor.recordSession(preRecognizedMetrics);

      // 使用 Vision API 的會話
      const visionApiMetrics: RecognitionSessionMetrics = {
        sessionId: 'vision-api-session',
        timestamp: new Date(),
        totalProcessingTime: 8000,
        baseRecognitionTime: 3000,
        componentDetectionTime: 5000,
        visionApiCalls: 1,
        visionApiCallsAvoided: 0,
        usedPreRecognizedFoods: false,
        consistencyCheck: {
          passed: true,
          baseRecognitionFoodCount: 3,
          componentDetectionCount: 3,
          missingFoodsCount: 0,
          extraComponentsCount: 0,
          missingFoods: [],
          extraComponents: [],
          matchRate: 1.0
        },
        detectionMethod: 'vision_api',
        success: true,
        recognizedFoodsCount: 3,
        componentsDetectedCount: 3
      };

      monitor.recordSession(visionApiMetrics);

      const stats = monitor.getStatistics(60000);
      
      expect(stats.totalVisionApiCalls).toBe(1);
      expect(stats.totalVisionApiCallsAvoided).toBe(1);
      expect(stats.visionApiCallReductionRate).toBe(0.5); // 1 / (1 + 1)
    });
  });

  describe('generateReport', () => {
    it('應該生成格式化的報告', () => {
      const consistencyCheck: ConsistencyCheckResult = {
        passed: true,
        baseRecognitionFoodCount: 3,
        componentDetectionCount: 3,
        missingFoodsCount: 0,
        extraComponentsCount: 0,
        missingFoods: [],
        extraComponents: [],
        matchRate: 1.0
      };

      const metrics: RecognitionSessionMetrics = {
        sessionId: 'test-session',
        timestamp: new Date(),
        totalProcessingTime: 5000,
        baseRecognitionTime: 2000,
        componentDetectionTime: 3000,
        visionApiCalls: 0,
        visionApiCallsAvoided: 1,
        usedPreRecognizedFoods: true,
        consistencyCheck,
        detectionMethod: 'pre_recognized',
        success: true,
        recognizedFoodsCount: 3,
        componentsDetectedCount: 3
      };

      monitor.recordSession(metrics);

      const report = monitor.generateReport(60000);
      
      expect(report).toContain('識別一致性性能報告');
      expect(report).toContain('總會話數: 1');
      expect(report).toContain('成功會話: 1');
      expect(report).toContain('平均總處理時間: 5000ms');
      expect(report).toContain('避免的 API 調用: 1 次');
    });
  });

  describe('getSlowestSessions', () => {
    it('應該返回最慢的會話', () => {
      // 記錄不同處理時間的會話
      const times = [5000, 3000, 8000, 2000, 6000];
      
      times.forEach((time, i) => {
        const metrics: RecognitionSessionMetrics = {
          sessionId: `session-${i}`,
          timestamp: new Date(),
          totalProcessingTime: time,
          baseRecognitionTime: time / 2,
          componentDetectionTime: time / 2,
          visionApiCalls: 0,
          visionApiCallsAvoided: 1,
          usedPreRecognizedFoods: true,
          consistencyCheck: {
            passed: true,
            baseRecognitionFoodCount: 3,
            componentDetectionCount: 3,
            missingFoodsCount: 0,
            extraComponentsCount: 0,
            missingFoods: [],
            extraComponents: [],
            matchRate: 1.0
          },
          detectionMethod: 'pre_recognized',
          success: true,
          recognizedFoodsCount: 3,
          componentsDetectedCount: 3
        };

        monitor.recordSession(metrics);
      });

      const slowest = monitor.getSlowestSessions(3);
      
      expect(slowest).toHaveLength(3);
      expect(slowest[0].totalProcessingTime).toBe(8000);
      expect(slowest[1].totalProcessingTime).toBe(6000);
      expect(slowest[2].totalProcessingTime).toBe(5000);
    });
  });

  describe('getWorstConsistencySessions', () => {
    it('應該返回一致性最差的會話', () => {
      const matchRates = [1.0, 0.8, 0.5, 0.9, 0.6];
      
      matchRates.forEach((matchRate, i) => {
        const metrics: RecognitionSessionMetrics = {
          sessionId: `session-${i}`,
          timestamp: new Date(),
          totalProcessingTime: 5000,
          baseRecognitionTime: 2000,
          componentDetectionTime: 3000,
          visionApiCalls: 0,
          visionApiCallsAvoided: 1,
          usedPreRecognizedFoods: true,
          consistencyCheck: {
            passed: matchRate === 1.0,
            baseRecognitionFoodCount: 3,
            componentDetectionCount: 3,
            missingFoodsCount: Math.round((1 - matchRate) * 3),
            extraComponentsCount: 0,
            missingFoods: [],
            extraComponents: [],
            matchRate
          },
          detectionMethod: 'pre_recognized',
          success: true,
          recognizedFoodsCount: 3,
          componentsDetectedCount: 3
        };

        monitor.recordSession(metrics);
      });

      const worst = monitor.getWorstConsistencySessions(3);
      
      expect(worst).toHaveLength(3);
      expect(worst[0].consistencyCheck.matchRate).toBe(0.5);
      expect(worst[1].consistencyCheck.matchRate).toBe(0.6);
      expect(worst[2].consistencyCheck.matchRate).toBe(0.8);
    });
  });

  describe('reset', () => {
    it('應該清除所有指標', () => {
      const metrics: RecognitionSessionMetrics = {
        sessionId: 'test-session',
        timestamp: new Date(),
        totalProcessingTime: 5000,
        baseRecognitionTime: 2000,
        componentDetectionTime: 3000,
        visionApiCalls: 0,
        visionApiCallsAvoided: 1,
        usedPreRecognizedFoods: true,
        consistencyCheck: {
          passed: true,
          baseRecognitionFoodCount: 3,
          componentDetectionCount: 3,
          missingFoodsCount: 0,
          extraComponentsCount: 0,
          missingFoods: [],
          extraComponents: [],
          matchRate: 1.0
        },
        detectionMethod: 'pre_recognized',
        success: true,
        recognizedFoodsCount: 3,
        componentsDetectedCount: 3
      };

      monitor.recordSession(metrics);
      
      let stats = monitor.getStatistics(60000);
      expect(stats.totalSessions).toBe(1);

      monitor.reset();
      
      stats = monitor.getStatistics(60000);
      expect(stats.totalSessions).toBe(0);
    });
  });
});
