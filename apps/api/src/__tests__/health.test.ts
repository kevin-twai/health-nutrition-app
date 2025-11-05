import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'health-nutrition-tracker-api');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return API information', async () => {
    const response = await request(app)
      .get('/api/v1')
      .expect(200);

    expect(response.body).toHaveProperty('message', '健康營養追蹤系統 API');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('endpoints');
  });
});