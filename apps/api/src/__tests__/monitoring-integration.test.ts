import request from 'supertest';
import app from '../index';
import { HealthMonitor, AlertSystem } from '../middleware/monitoring';
import { performanceMonitor } from '../services/PerformanceMonitor';

describe('監控系統整合測試', () => {
  let healthMonitor: HealthMonitor;
  let alertSystem: AlertSystem;

  beforeAll(() => {
    healthMonitor = HealthMonitor.getInstance();
    alertSystem = AlertSystem.getInstance();
  });

  describe('健康檢查端點', () => {
    it('應該返回系統健康狀態', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'health-nutrition-tracker-api');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });

    it('應該包含資料庫連接狀態', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('database');
      expect(['connected', 'disconnected']).toContain(response.body.database);
    });
  });

  describe('系統指標端點', () => {
    it('應該返回系統指標', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'health-nutrition-tracker-api');
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('requests');
      expect(response.body.metrics).toHaveProperty('performance');
      expect(response.body.metrics).toHaveProperty('errors');
      expect(response.body.metrics).toHaveProperty('memory');
    });
  });

  describe('詳細監控端點', () => {
    it('應該返回詳細的系統監控資訊', async () => {
      const response = await request(app)
        .get('/api/v1/monitoring/system')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('alerts');
    });

    it('應該包含系統資源資訊', async () => {
      const response = await request(app)
        .get('/api/v1/monitoring/system')
        .expect(200);

      expect(response.body.system).toHaveProperty('uptime');
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system).toHaveProperty('cpu');
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('platform');
    });
  });

  describe('效能監控端點', () => {
    it('應該返回效能統計', async () => {
      const response = await request(app)
        .get('/api/v1/monitoring/performance')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('statistics');
      expect(response.body).toHaveProperty('slowestOperations');
      expect(response.body.statistics).toHaveProperty('totalOperations');
      expect(response.body.statistics).toHaveProperty('averageDuration');
    });

    it('應該支援時間窗口參數', async () => {
      const response = await request(app)
        .get('/api/v1/monitoring/performance?window=600000&limit=5')
        .expect(200);

      expect(response.body.timeWindow).toBe(600); // 600 秒
      expect(response.body.slowestOperations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('警報管理端點', () => {
    it('應該返回警報列表', async () => {
      const response = await request(app)
        .get('/api/v1/monitoring/alerts')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('alerts');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('total');
      expect(response.body.summary).toHaveProperty('error');
      expect(response.body.summary).toHaveProperty('warning');
      expect(response.body.summary).toHaveProperty('info');
    });
  });

  describe('詳細健康檢查端點', () => {
    it('應該返回詳細的健康檢查結果', async () => {
      const response = await request(app)
        .get('/api/v1/monitoring/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('total');
      expect(response.body.summary).toHaveProperty('passed');
      expect(response.body.summary).toHaveProperty('failed');
    });

    it('應該包含額外的系統檢查', async () => {
      const response = await request(app)
        .get('/api/v1/monitoring/health/detailed')
        .expect(200);

      expect(response.body.checks).toHaveProperty('diskSpace');
      expect(response.body.checks).toHaveProperty('networkConnectivity');
      expect(response.body.checks).toHaveProperty('environmentVariables');
    });
  });

  describe('HealthMonitor 類別', () => {
    it('應該能夠註冊和執行健康檢查', async () => {
      // 註冊測試健康檢查
      healthMonitor.registerHealthCheck('test-check', async () => true);
      
      const results = await healthMonitor.runHealthChecks();
      expect(results).toHaveProperty('test-check', true);
    });

    it('應該能夠獲取系統指標', () => {
      const metrics = healthMonitor.getSystemMetrics();
      
      expect(metrics).toHaveProperty('requests');
      expect(metrics).toHaveProperty('performance');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('uptime');
    });
  });

  describe('AlertSystem 類別', () => {
    it('應該能夠發送和管理警報', () => {
      const initialAlerts = alertSystem.getUnresolvedAlerts();
      const initialCount = initialAlerts.length;
      
      // 發送測試警報
      alertSystem.sendAlert('warning', '測試警報');
      
      const newAlerts = alertSystem.getUnresolvedAlerts();
      expect(newAlerts.length).toBe(initialCount + 1);
      
      // 解決警報
      const testAlert = newAlerts.find(alert => alert.message === '測試警報');
      if (testAlert) {
        alertSystem.resolveAlert(testAlert.id);
        const resolvedAlerts = alertSystem.getUnresolvedAlerts();
        expect(resolvedAlerts.length).toBe(initialCount);
      }
    });
  });

  describe('PerformanceMonitor 類別', () => {
    it('應該能夠測量函數執行時間', async () => {
      const testFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'test result';
      };
      
      const result = await performanceMonitor.measureFunction(
        'test-function',
        testFunction
      );
      
      expect(result).toBe('test result');
      
      const stats = performanceMonitor.getPerformanceStats();
      expect(stats.totalOperations).toBeGreaterThan(0);
    });

    it('應該能夠獲取最慢的操作', () => {
      const slowestOps = performanceMonitor.getSlowestOperations(5);
      expect(Array.isArray(slowestOps)).toBe(true);
      expect(slowestOps.length).toBeLessThanOrEqual(5);
    });

    it('應該能夠清理舊的指標資料', () => {
      performanceMonitor.cleanupOldMetrics(0); // 清理所有指標
      const stats = performanceMonitor.getPerformanceStats();
      expect(stats.totalOperations).toBe(0);
    });
  });

  describe('錯誤處理', () => {
    it('監控端點應該處理錯誤情況', async () => {
      // 模擬錯誤情況
      jest.spyOn(healthMonitor, 'getSystemMetrics').mockImplementationOnce(() => {
        throw new Error('測試錯誤');
      });

      const response = await request(app)
        .get('/api/v1/monitoring/system')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'MONITORING_ERROR');
    });
  });

  afterAll(() => {
    // 清理測試資料
    performanceMonitor.cleanupOldMetrics(0);
  });
});