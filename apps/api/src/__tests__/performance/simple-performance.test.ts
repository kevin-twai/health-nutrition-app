import request from 'supertest';
import testApp from '../../test-app';
import { performance } from 'perf_hooks';

describe('簡化效能測試', () => {
  jest.setTimeout(5000);

  afterEach(() => {
    if (global.gc) {
      global.gc();
    }
  });

  describe('回應時間測試', () => {
    it('健康檢查應該在1秒內回應', async () => {
      const startTime = performance.now();
      
      const response = await request(testApp)
        .get('/health')
        .timeout(3000);

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
      
      console.log(`健康檢查回應時間: ${responseTime.toFixed(2)}ms`);
    });

    it('API根端點應該快速回應', async () => {
      const startTime = performance.now();
      
      const response = await request(testApp)
        .get('/api/v1')
        .timeout(3000);

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500);
      
      console.log(`API根端點回應時間: ${responseTime.toFixed(2)}ms`);
    });
  });

  describe('併發測試', () => {
    it('應該能處理3個併發請求', async () => {
      const startTime = performance.now();
      
      const promises = Array.from({ length: 3 }, () =>
        request(testApp)
          .get('/health')
          .timeout(3000)
      );

      const responses = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      expect(totalTime).toBeLessThan(3000);
      console.log(`3個併發請求總時間: ${totalTime.toFixed(2)}ms`);
    });
  });
});