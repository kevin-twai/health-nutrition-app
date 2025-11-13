import { DeliveryManager, EmailConfig, PushNotificationConfig } from '../DeliveryManager';
import { DeliveryMethod } from '@health-tracker/shared-types';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
    verify: jest.fn()
  })
}));

describe('DeliveryManager', () => {
  let deliveryManager: DeliveryManager;
  let mockEmailConfig: EmailConfig;
  let mockPushConfig: PushNotificationConfig;

  const mockReport = {
    id: 'report_123',
    userId: 'user_123',
    period: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-07')
    },
    nutritionSummary: {
      totalCalories: 1400,
      avgDailyCalories: 200,
      macronutrients: {
        protein: 70,
        carbohydrates: 175,
        fat: 47,
        fiber: 21
      },
      micronutrients: {
        vitamins: {},
        minerals: {}
      }
    },
    trends: [],
    recommendations: ['建議增加蛋白質攝取'],
    achievements: [],
    generatedAt: new Date()
  };

  beforeEach(() => {
    mockEmailConfig = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password'
      },
      from: 'noreply@healthtracker.com'
    };

    mockPushConfig = {
      apiKey: 'test-api-key',
      endpoint: 'https://api.push.com'
    };

    deliveryManager = new DeliveryManager(mockEmailConfig, mockPushConfig);
  });

  describe('constructor', () => {
    it('應該正確初始化 DeliveryManager', () => {
      expect(deliveryManager).toBeInstanceOf(DeliveryManager);
    });

    it('應該在沒有配置時正常初始化', () => {
      const manager = new DeliveryManager();
      expect(manager).toBeInstanceOf(DeliveryManager);
    });
  });

  describe('deliverReport', () => {
    it('應該發送應用內通知', async () => {
      const results = await deliveryManager.deliverReport(mockReport, [DeliveryMethod.IN_APP]);

      expect(results).toHaveLength(1);
      expect(results[0].method).toBe(DeliveryMethod.IN_APP);
      expect(results[0].success).toBe(true);
      expect(results[0].message).toBe('應用內通知已發送');
      expect(results[0].timestamp).toBeInstanceOf(Date);
    });

    it('應該發送推播通知', async () => {
      const results = await deliveryManager.deliverReport(mockReport, [DeliveryMethod.PUSH_NOTIFICATION]);

      expect(results).toHaveLength(1);
      expect(results[0].method).toBe(DeliveryMethod.PUSH_NOTIFICATION);
      expect(results[0].success).toBe(true);
      expect(results[0].message).toBe('推播通知已發送');
    });

    it('應該發送到第三方平台', async () => {
      const results = await deliveryManager.deliverReport(mockReport, [DeliveryMethod.THIRD_PARTY]);

      expect(results).toHaveLength(1);
      expect(results[0].method).toBe(DeliveryMethod.THIRD_PARTY);
      expect(results[0].success).toBe(true);
      expect(results[0].message).toBe('已發送到第三方平台');
    });

    it('應該同時發送到多個管道', async () => {
      const methods = [DeliveryMethod.IN_APP, DeliveryMethod.PUSH_NOTIFICATION, DeliveryMethod.THIRD_PARTY];
      const results = await deliveryManager.deliverReport(mockReport, methods);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      expect(results.map(r => r.method)).toEqual(methods);
    });

    it('應該處理不支援的發送方式', async () => {
      const results = await deliveryManager.deliverReport(mockReport, ['unsupported' as any]);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].message).toContain('不支援的發送方式');
    });
  });

  describe('sendEmailReport', () => {
    it('應該在沒有電子郵件配置時返回失敗', async () => {
      const managerWithoutEmail = new DeliveryManager();
      const results = await managerWithoutEmail.deliverReport(mockReport, [DeliveryMethod.EMAIL]);

      expect(results).toHaveLength(1);
      expect(results[0].method).toBe(DeliveryMethod.EMAIL);
      expect(results[0].success).toBe(false);
      expect(results[0].message).toBe('電子郵件服務未配置');
    });

    it('應該處理電子郵件發送錯誤', async () => {
      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP 連接失敗'));

      const results = await deliveryManager.deliverReport(mockReport, [DeliveryMethod.EMAIL]);

      expect(results).toHaveLength(1);
      expect(results[0].method).toBe(DeliveryMethod.EMAIL);
      expect(results[0].success).toBe(false);
      expect(results[0].message).toContain('郵件發送失敗');
    });

    it('應該成功發送電子郵件', async () => {
      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const results = await deliveryManager.deliverReport(mockReport, [DeliveryMethod.EMAIL]);

      expect(results).toHaveLength(1);
      expect(results[0].method).toBe(DeliveryMethod.EMAIL);
      expect(results[0].success).toBe(true);
      expect(results[0].message).toContain('郵件已發送');
      expect(results[0].message).toContain('test-message-id');
    });
  });

  describe('deliverReportsBatch', () => {
    it('應該批量發送多個報告', async () => {
      const reports = [
        { ...mockReport, id: 'report_1', userId: 'user_1' },
        { ...mockReport, id: 'report_2', userId: 'user_2' },
        { ...mockReport, id: 'report_3', userId: 'user_3' }
      ];

      const results = await deliveryManager.deliverReportsBatch(reports, [DeliveryMethod.IN_APP]);

      expect(results.size).toBe(3);
      expect(results.has('report_1')).toBe(true);
      expect(results.has('report_2')).toBe(true);
      expect(results.has('report_3')).toBe(true);

      for (const [reportId, deliveryResults] of results.entries()) {
        expect(deliveryResults).toHaveLength(1);
        expect(deliveryResults[0].method).toBe(DeliveryMethod.IN_APP);
        expect(deliveryResults[0].success).toBe(true);
      }
    });

    it('應該處理空的報告陣列', async () => {
      const results = await deliveryManager.deliverReportsBatch([], [DeliveryMethod.IN_APP]);

      expect(results.size).toBe(0);
    });
  });

  describe('retryFailedDelivery', () => {
    it('應該重試失敗的發送', async () => {
      const failedMethods = [DeliveryMethod.PUSH_NOTIFICATION, DeliveryMethod.THIRD_PARTY];
      const results = await deliveryManager.retryFailedDelivery(mockReport, failedMethods);

      expect(results).toHaveLength(2);
      expect(results.map(r => r.method)).toEqual(failedMethods);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('testEmailConnection', () => {
    it('應該測試電子郵件連接成功', async () => {
      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.verify.mockResolvedValue(true);

      const result = await deliveryManager.testEmailConnection();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('應該處理電子郵件連接測試失敗', async () => {
      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.verify.mockRejectedValue(new Error('連接失敗'));

      const result = await deliveryManager.testEmailConnection();

      expect(result).toBe(false);
    });

    it('應該在沒有傳輸器時返回 false', async () => {
      const managerWithoutEmail = new DeliveryManager();
      const result = await managerWithoutEmail.testEmailConnection();

      expect(result).toBe(false);
    });
  });

  describe('配置更新', () => {
    it('應該更新電子郵件配置', () => {
      const newConfig: EmailConfig = {
        host: 'smtp.newhost.com',
        port: 465,
        secure: true,
        auth: {
          user: 'new@example.com',
          pass: 'newpassword'
        },
        from: 'new-noreply@healthtracker.com'
      };

      deliveryManager.updateEmailConfig(newConfig);

      // 驗證配置已更新（這裡只能間接驗證，因為配置是私有的）
      expect(() => deliveryManager.updateEmailConfig(newConfig)).not.toThrow();
    });

    it('應該更新推播通知配置', () => {
      const newConfig: PushNotificationConfig = {
        apiKey: 'new-api-key',
        endpoint: 'https://new-api.push.com'
      };

      deliveryManager.updatePushConfig(newConfig);

      expect(() => deliveryManager.updatePushConfig(newConfig)).not.toThrow();
    });
  });

  describe('getDeliveryStats', () => {
    it('應該返回發送統計資料', () => {
      const stats = deliveryManager.getDeliveryStats();

      expect(stats).toHaveProperty('totalDeliveries');
      expect(stats).toHaveProperty('successfulDeliveries');
      expect(stats).toHaveProperty('failedDeliveries');
      expect(stats).toHaveProperty('deliveriesByMethod');
      expect(typeof stats.totalDeliveries).toBe('number');
      expect(typeof stats.successfulDeliveries).toBe('number');
      expect(typeof stats.failedDeliveries).toBe('number');
      expect(typeof stats.deliveriesByMethod).toBe('object');
    });
  });

  describe('訊息生成', () => {
    it('應該生成正確的電子郵件主旨', async () => {
      const weeklyReport = { ...mockReport, id: 'weekly_user_123_1234567890' };
      const monthlyReport = { ...mockReport, id: 'monthly_user_123_1234567890' };

      // 這些是私有方法，我們透過發送電子郵件來間接測試
      const nodemailer = require('nodemailer');
      const mockTransporter = nodemailer.createTransport();
      mockTransporter.sendMail.mockImplementation((options: any) => {
        if (weeklyReport.id.includes('weekly')) {
          expect(options.subject).toContain('週度健康報告');
        } else if (monthlyReport.id.includes('monthly')) {
          expect(options.subject).toContain('月度健康報告');
        }
        return Promise.resolve({ messageId: 'test-id' });
      });

      await deliveryManager.deliverReport(weeklyReport, [DeliveryMethod.EMAIL]);
      await deliveryManager.deliverReport(monthlyReport, [DeliveryMethod.EMAIL]);
    });
  });

  describe('錯誤處理', () => {
    it('應該處理發送過程中的異常', async () => {
      // 模擬發送過程中拋出異常
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // 創建一個會拋出異常的 DeliveryManager
      const faultyManager = new DeliveryManager();
      
      // 覆寫私有方法來模擬異常（這裡我們透過不支援的方法來觸發異常處理）
      const results = await faultyManager.deliverReport(mockReport, ['invalid-method' as any]);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].message).toContain('不支援的發送方式');

      console.error = originalConsoleError;
    });
  });
});