import request from 'supertest';
import testApp from '../../test-app';

describe('簡化安全性測試', () => {
  jest.setTimeout(5000);

  afterEach(() => {
    if (global.gc) {
      global.gc();
    }
  });

  describe('安全標頭測試', () => {
    it('應該設定基本安全標頭', async () => {
      const response = await request(testApp)
        .get('/health')
        .timeout(3000);

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('API版本控制', () => {
    it('應該拒絕無效的API版本', async () => {
      const response = await request(testApp)
        .get('/api/v999/test')
        .timeout(3000);

      expect(response.status).toBe(404);
    });
  });

  describe('錯誤處理', () => {
    it('錯誤訊息不應洩露系統資訊', async () => {
      const response = await request(testApp)
        .get('/api/v1/nonexistent')
        .timeout(3000);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      
      // 確保錯誤訊息不包含系統路徑
      const errorMessage = JSON.stringify(response.body);
      expect(errorMessage).not.toMatch(/\/.*\//);
    });
  });
});