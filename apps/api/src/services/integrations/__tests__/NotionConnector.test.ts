import { NotionConnector } from '../NotionConnector';
import { 
  Platform, 
  DataType, 
  ConnectionStatus,
  EncryptedCredentials,
  FoodLog,
  HealthReport,
  MealType,
  LogSource
} from '../../../types/shared';

// Mock Notion Client
jest.mock('@notionhq/client', () => ({
  Client: jest.fn().mockImplementation(() => ({
    users: {
      me: jest.fn().mockResolvedValue({ id: 'test-user' })
    },
    pages: {
      create: jest.fn().mockResolvedValue({ id: 'test-page' })
    },
    databases: {
      query: jest.fn().mockResolvedValue({
        results: [
          {
            id: 'test-page-1',
            properties: {
              '食物名稱': { title: [{ text: { content: '蘋果' } }] },
              '份量': { number: 1 },
              '餐別': { select: { name: '早餐' } }
            }
          }
        ]
      })
    }
  }))
}));

describe('NotionConnector', () => {
  let notionConnector: NotionConnector;
  const mockCredentials: EncryptedCredentials = {
    apiKey: 'test-api-key'
  };
  const testUserId = 'test-user-123';

  beforeEach(() => {
    notionConnector = new NotionConnector();
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('應該成功建立 Notion 連接', async () => {
      const connection = await notionConnector.connect(testUserId, mockCredentials);

      expect(connection).toBeDefined();
      expect(connection.userId).toBe(testUserId);
      expect(connection.platform).toBe(Platform.NOTION);
      expect(connection.status).toBe(ConnectionStatus.CONNECTED);
      expect(connection.credentials).toBe(mockCredentials);
      expect(connection.settings.syncEnabled).toBe(true);
    });

    it('當 API 金鑰無效時應該拋出錯誤', async () => {
      const invalidCredentials: EncryptedCredentials = {
        apiKey: 'invalid-key'
      };

      // Mock 無效的 API 金鑰
      const mockClient = require('@notionhq/client').Client;
      mockClient.mockImplementationOnce(() => ({
        users: {
          me: jest.fn().mockRejectedValue(new Error('Unauthorized'))
        }
      }));

      await expect(notionConnector.connect(testUserId, invalidCredentials))
        .rejects.toThrow('無效的 Notion API 金鑰');
    });
  });

  describe('disconnect', () => {
    it('應該成功斷開 Notion 連接', async () => {
      await expect(notionConnector.disconnect(testUserId))
        .resolves.not.toThrow();
    });
  });

  describe('testConnection', () => {
    it('應該驗證有效的連接', async () => {
      const isValid = await notionConnector.testConnection(mockCredentials);
      expect(isValid).toBe(true);
    });

    it('應該拒絕無效的連接', async () => {
      const invalidCredentials: EncryptedCredentials = {};
      const isValid = await notionConnector.testConnection(invalidCredentials);
      expect(isValid).toBe(false);
    });
  });

  describe('syncToExternal', () => {
    beforeEach(async () => {
      // 先建立連接以初始化客戶端
      await notionConnector.connect(testUserId, mockCredentials);
    });

    it('應該成功同步飲食記錄到 Notion', async () => {
      const foodLogs: FoodLog[] = [
        {
          id: 'log-1',
          userId: testUserId,
          foodId: 'apple',
          portion: 1,
          mealType: MealType.BREAKFAST,
          timestamp: new Date(),
          source: LogSource.PHOTO_RECOGNITION
        }
      ];

      const result = await notionConnector.syncToExternal(
        testUserId, 
        DataType.FOOD_LOGS, 
        foodLogs
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('應該成功同步健康報告到 Notion', async () => {
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
          recommendations: ['多吃蔬菜'],
          achievements: [],
          generatedAt: new Date()
        }
      ];

      const result = await notionConnector.syncToExternal(
        testUserId, 
        DataType.HEALTH_REPORTS, 
        healthReports
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
    });

    it('當客戶端未初始化時應該拋出錯誤', async () => {
      const newConnector = new NotionConnector();
      
      await expect(newConnector.syncToExternal(testUserId, DataType.FOOD_LOGS, []))
        .rejects.toThrow('Notion 客戶端未初始化');
    });

    it('當資料類型不支援時應該拋出錯誤', async () => {
      await expect(notionConnector.syncToExternal(
        testUserId, 
        DataType.HEALTH_METRICS, 
        []
      )).rejects.toThrow('不支援的資料類型');
    });
  });

  describe('syncFromExternal', () => {
    beforeEach(async () => {
      await notionConnector.connect(testUserId, mockCredentials);
    });

    it('應該成功從 Notion 同步資料', async () => {
      const result = await notionConnector.syncFromExternal(
        testUserId, 
        DataType.FOOD_LOGS
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
    });
  });

  describe('getSupportedDataTypes', () => {
    it('應該返回支援的資料類型', () => {
      const supportedTypes = notionConnector.getSupportedDataTypes();
      
      expect(supportedTypes).toContain(DataType.FOOD_LOGS);
      expect(supportedTypes).toContain(DataType.HEALTH_REPORTS);
      expect(supportedTypes).toContain(DataType.ACHIEVEMENTS);
    });
  });

  describe('validateConnection', () => {
    it('應該驗證有效的連接', async () => {
      const connection = await notionConnector.connect(testUserId, mockCredentials);
      const isValid = await notionConnector.validateConnection(connection);
      
      expect(isValid).toBe(true);
    });
  });

  describe('refreshCredentials', () => {
    it('應該返回相同的認證（Notion 不需要刷新）', async () => {
      const connection = await notionConnector.connect(testUserId, mockCredentials);
      const refreshedCredentials = await notionConnector.refreshCredentials(connection);
      
      expect(refreshedCredentials).toBe(mockCredentials);
    });
  });
});