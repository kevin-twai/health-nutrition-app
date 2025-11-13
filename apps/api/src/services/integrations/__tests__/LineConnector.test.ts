import { LineConnector } from '../LineConnector';
import { 
  Platform, 
  DataType, 
  ConnectionStatus,
  EncryptedCredentials,
  HealthReport,
  Achievement,
  AchievementType,
  AchievementRarity
} from '../../../types/shared';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LineConnector', () => {
  let lineConnector: LineConnector;
  const mockCredentials: EncryptedCredentials = {
    accessToken: 'test-channel-access-token'
  };
  const testUserId = 'test-user-123';

  beforeEach(() => {
    lineConnector = new LineConnector();
    jest.clearAllMocks();
    
    // Mock axios.create
    const mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn()
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  describe('connect', () => {
    it('應該成功建立 Line 連接', async () => {
      // Mock 成功的 API 測試
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { userId: 'test' } });

      const connection = await lineConnector.connect(testUserId, mockCredentials);

      expect(connection).toBeDefined();
      expect(connection.userId).toBe(testUserId);
      expect(connection.platform).toBe(Platform.LINE);
      expect(connection.status).toBe(ConnectionStatus.CONNECTED);
      expect(connection.credentials).toBe(mockCredentials);
      expect(connection.settings.syncEnabled).toBe(true);
    });

    it('當 Channel Access Token 無效時應該拋出錯誤', async () => {
      const invalidCredentials: EncryptedCredentials = {
        accessToken: 'invalid-token'
      };

      // Mock 失敗的 API 測試
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockRejectedValue(new Error('Unauthorized'));

      await expect(lineConnector.connect(testUserId, invalidCredentials))
        .rejects.toThrow('無效的 Line Channel Access Token');
    });
  });

  describe('disconnect', () => {
    it('應該成功斷開 Line 連接', async () => {
      await expect(lineConnector.disconnect(testUserId))
        .resolves.not.toThrow();
    });
  });

  describe('testConnection', () => {
    it('應該驗證有效的連接', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { userId: 'test' } });

      const isValid = await lineConnector.testConnection(mockCredentials);
      expect(isValid).toBe(true);
    });

    it('應該拒絕無效的連接', async () => {
      const invalidCredentials: EncryptedCredentials = {};
      const isValid = await lineConnector.testConnection(invalidCredentials);
      expect(isValid).toBe(false);
    });
  });

  describe('syncToExternal', () => {
    beforeEach(async () => {
      // 先建立連接以初始化客戶端
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { userId: 'test' } });
      await lineConnector.connect(testUserId, mockCredentials);
    });

    it('應該成功發送健康報告通知', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.post = jest.fn().mockResolvedValue({ data: {} });

      const healthReports: HealthReport[] = [
        {
          id: 'report-1',
          userId: testUserId,
          period: {
            start: new Date('2023-01-01'),
            end: new Date('2023-01-07')
          },
          nutritionSummary: {
            totalCalories: 14000,
            avgDailyCalories: 2000,
            macronutrients: {
              protein: 100,
              carbohydrates: 250,
              fat: 80,
              fiber: 25
            },
            micronutrients: {
              vitamins: {},
              minerals: {}
            }
          },
          trends: [],
          recommendations: ['多吃蔬菜', '增加運動'],
          achievements: [],
          generatedAt: new Date()
        }
      ];

      const result = await lineConnector.syncToExternal(
        testUserId, 
        DataType.HEALTH_REPORTS, 
        healthReports
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('應該成功發送成就通知', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.post = jest.fn().mockResolvedValue({ data: {} });

      const achievements: Achievement[] = [
        {
          id: 'achievement-1',
          name: '連續記錄7天',
          description: '恭喜您連續記錄飲食7天！',
          icon: '🏆',
          category: 'consistency',
          type: AchievementType.STREAK,
          points: 100,
          rarity: AchievementRarity.COMMON,
          unlockedAt: new Date()
        }
      ];

      const result = await lineConnector.syncToExternal(
        testUserId, 
        DataType.ACHIEVEMENTS, 
        achievements
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
    });

    it('當客戶端未初始化時應該拋出錯誤', async () => {
      const newConnector = new LineConnector();
      
      await expect(newConnector.syncToExternal(testUserId, DataType.HEALTH_REPORTS, []))
        .rejects.toThrow('Line 客戶端未初始化');
    });

    it('當資料類型不支援時應該拋出錯誤', async () => {
      await expect(lineConnector.syncToExternal(
        testUserId, 
        DataType.FOOD_LOGS, 
        []
      )).rejects.toThrow('不支援的資料類型');
    });
  });

  describe('syncFromExternal', () => {
    it('應該返回成功結果（Line 不需要從外部同步）', async () => {
      const result = await lineConnector.syncFromExternal(
        testUserId, 
        DataType.HEALTH_REPORTS
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(0);
    });
  });

  describe('getSupportedDataTypes', () => {
    it('應該返回支援的資料類型', () => {
      const supportedTypes = lineConnector.getSupportedDataTypes();
      
      expect(supportedTypes).toContain(DataType.HEALTH_REPORTS);
      expect(supportedTypes).toContain(DataType.ACHIEVEMENTS);
      expect(supportedTypes).not.toContain(DataType.FOOD_LOGS);
    });
  });

  describe('sendTextMessage', () => {
    beforeEach(async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { userId: 'test' } });
      await lineConnector.connect(testUserId, mockCredentials);
    });

    it('應該成功發送文字訊息', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.post = jest.fn().mockResolvedValue({ data: {} });

      await expect(lineConnector.sendTextMessage(testUserId, '測試訊息'))
        .resolves.not.toThrow();
    });
  });

  describe('handleWebhook', () => {
    beforeEach(async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { userId: 'test' } });
      mockAxiosInstance.post = jest.fn().mockResolvedValue({ data: {} });
      await lineConnector.connect(testUserId, mockCredentials);
    });

    it('應該處理文字訊息事件', async () => {
      const webhookData = {
        events: [
          {
            type: 'message',
            source: { userId: testUserId },
            message: {
              type: 'text',
              text: '健康報告'
            }
          }
        ]
      };

      await expect(lineConnector.handleWebhook(webhookData))
        .resolves.not.toThrow();
    });

    it('應該處理回傳事件', async () => {
      const webhookData = {
        events: [
          {
            type: 'postback',
            source: { userId: testUserId },
            postback: {
              data: 'action=set_reminder&report_id=123'
            }
          }
        ]
      };

      await expect(lineConnector.handleWebhook(webhookData))
        .resolves.not.toThrow();
    });
  });

  describe('validateConnection', () => {
    it('應該驗證有效的連接', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { userId: 'test' } });
      
      const connection = await lineConnector.connect(testUserId, mockCredentials);
      const isValid = await lineConnector.validateConnection(connection);
      
      expect(isValid).toBe(true);
    });
  });

  describe('refreshCredentials', () => {
    it('應該返回相同的認證（Line 不需要刷新）', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { userId: 'test' } });
      
      const connection = await lineConnector.connect(testUserId, mockCredentials);
      const refreshedCredentials = await lineConnector.refreshCredentials(connection);
      
      expect(refreshedCredentials).toBe(mockCredentials);
    });
  });
});