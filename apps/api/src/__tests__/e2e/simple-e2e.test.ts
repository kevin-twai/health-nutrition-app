import request from 'supertest';
import testApp from '../../test-app';

describe('簡化端到端測試', () => {
  // 設定較短的超時時間
  jest.setTimeout(5000);

  afterEach(() => {
    // 每個測試後強制垃圾回收
    if (global.gc) {
      global.gc();
    }
  });

  describe('基本健康檢查', () => {
    it('健康檢查端點應該正常回應', async () => {
      const response = await request(testApp)
        .get('/health')
        .timeout(3000);

      expect(response.status).toBe(200);
      expect(response.body.status).toBeDefined();
    });
  });

  describe('API端點可用性', () => {
    it('API根端點應該正常回應', async () => {
      const response = await request(testApp)
        .get('/api/v1')
        .timeout(3000);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('錯誤處理', () => {
    it('不存在的端點應該回傳404', async () => {
      const response = await request(testApp)
        .get('/api/v1/nonexistent')
        .timeout(3000);

      expect(response.status).toBe(404);
    });
  });
});