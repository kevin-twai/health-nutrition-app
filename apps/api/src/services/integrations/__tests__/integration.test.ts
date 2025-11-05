import { IntegrationManager } from '../IntegrationManager';
import { 
  Platform, 
  DataType, 
  ConnectionStatus,
  EncryptedCredentials,
  SyncFrequency,
  FoodLog,
  HealthReport,
  Achievement,
  MealType,
  LogSource
} from '@health-tracker/shared-types';

/**
 * 整合測試
 * 測試完整的第三方平台整合流程
 */
describe('第三方平台整合 - 整合測試', () => {
  let integrationManager: IntegrationManager;
  const testUserId = 'integration-test-user';
  
  const mockNotionCredentials: EncryptedCredentials = {
    apiKey: 'test-notion-api-key'
  };
  
  const mockLineCredentials: EncryptedCredentials = {
    accessToken: 'test-line-access-token'
  };
  
  const mockHealthKitCredentials: EncryptedCredentials = {
    accessToken: 'test-healthkit-token'
  };

  beforeAll(() => {
    integrationManager = new IntegrationManager();
  });

  afterAll(() => {
    integrationManager.cleanup();
  });

  describe('完整的平台連接流程', () => {
    it('應該能夠連接所有支援的平台', async () => {
      // 連接 Notion
      const notionConnection = await integrationManager.connectPlatform(
        testUserId,
        Platform.NOTION,
        mockNotionCredentials,
        {
          syncFrequency: SyncFrequency.DAILY,
          dataTypes: [DataType.FOOD_LOGS, DataType.HEALTH_REPORTS]
        }
      );

      expect(notionConnection.platform).toBe(Platform.NOTION);
      expect(notionConnection.status).toBe(ConnectionStatus.CONNECTED);

      // 連接 Line
      const lineConnection = await integrationManager.connectPlatform(
        testUserId,
        Platform.LINE,
        mockLineCredentials,
        {
          syncFrequency: SyncFrequency.REAL_TIME,
          dataTypes: [DataType.HEALTH_REPORTS, DataType.ACHIEVEMENTS]
        }
      );

      expect(lineConnection.platform).toBe(Platform.LINE);
      expect(lineConnection.status).toBe(ConnectionStatus.CONNECTED);

      // 連接 HealthKit
      const healthKitConnection = await integrationManager.connectPlatform(
        testUserId,
        Platform.APPLE_HEALTH,
        mockHealthKitCredentials,
        {
          syncFrequency: SyncFrequency.HOURLY,
          dataTypes: [DataType.HEALTH_METRICS]
        }
      );

      expect(healthKitConnection.platform).toBe(Platform.APPLE_HEALTH);
      expect(healthKitConnection.status).toBe(ConnectionStatus.CONNECTED);

      // 驗證所有連接
      const allConnections = await integrationManager.getUserConnections(testUserId);
      expect(allConnections).toHaveLength(3);
    });
  });

  describe('資料同步流程', () => {
    beforeEach(async () => {
      // 確保所有平台都已連接
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockNotionCredentials);
      await integrationManager.connectPlatform(testUserId, Platform.LINE, mockLineCredentials);
      await integrationManager.connectPlatform(testUserId, Platform.APPLE_HEALTH, mockHealthKitCredentials);
    });

    it('應該能夠同步飲食記錄到 Notion', async () => {
      const syncResults = await integrationManager.manualSync(
        testUserId,
        Platform.NOTION,
        DataType.FOOD_LOGS
      );

      expect(syncResults).toBeDefined();
      expect(Array.isArray(syncResults)).toBe(true);
    });

    it('應該能夠發送健康報告通知到 Line', async () => {
      const syncResults = await integrationManager.manualSync(
        testUserId,
        Platform.LINE,
        DataType.HEALTH_REPORTS
      );

      expect(syncResults).toBeDefined();
      expect(Array.isArray(syncResults)).toBe(true);
    });

    it('應該能夠從 HealthKit 同步健康指標', async () => {
      const syncResults = await integrationManager.manualSync(
        testUserId,
        Platform.APPLE_HEALTH,
        DataType.HEALTH_METRICS
      );

      expect(syncResults).toBeDefined();
      expect(Array.isArray(syncResults)).toBe(true);
    });
  });

  describe('批量同步流程', () => {
    beforeEach(async () => {
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockNotionCredentials);
      await integrationManager.connectPlatform(testUserId, Platform.LINE, mockLineCredentials);
    });

    it('應該能夠執行批量同步', async () => {
      const batchRequests = [
        { platform: Platform.NOTION, dataType: DataType.FOOD_LOGS },
        { platform: Platform.NOTION, dataType: DataType.HEALTH_REPORTS },
        { platform: Platform.LINE, dataType: DataType.ACHIEVEMENTS }
      ];

      const results = await integrationManager.batchSync(testUserId, batchRequests);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('platform');
        expect(result).toHaveProperty('success');
      });
    });
  });

  describe('連接管理流程', () => {
    it('應該能夠更新連接設定', async () => {
      // 先連接
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockNotionCredentials);

      // 更新設定
      const updatedConnection = await integrationManager.updateConnectionSettings(
        testUserId,
        Platform.NOTION,
        {
          syncFrequency: SyncFrequency.WEEKLY,
          autoSync: false,
          notificationsEnabled: false
        }
      );

      expect(updatedConnection.settings.syncFrequency).toBe(SyncFrequency.WEEKLY);
      expect(updatedConnection.settings.autoSync).toBe(false);
      expect(updatedConnection.settings.notificationsEnabled).toBe(false);
    });

    it('應該能夠驗證連接狀態', async () => {
      // 連接多個平台
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockNotionCredentials);
      await integrationManager.connectPlatform(testUserId, Platform.LINE, mockLineCredentials);

      // 驗證所有連接
      const validationResults = await integrationManager.validateAllConnections(testUserId);

      expect(validationResults.size).toBeGreaterThan(0);
      expect(validationResults.has(Platform.NOTION)).toBe(true);
      expect(validationResults.has(Platform.LINE)).toBe(true);
    });

    it('應該能夠斷開特定平台連接', async () => {
      // 先連接
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockNotionCredentials);
      
      // 確認連接存在
      let connection = await integrationManager.getPlatformConnection(testUserId, Platform.NOTION);
      expect(connection).not.toBeNull();

      // 斷開連接
      await integrationManager.disconnectPlatform(testUserId, Platform.NOTION);

      // 確認連接已移除
      connection = await integrationManager.getPlatformConnection(testUserId, Platform.NOTION);
      expect(connection).toBeNull();
    });
  });

  describe('錯誤處理流程', () => {
    it('應該處理無效的平台連接', async () => {
      await expect(integrationManager.connectPlatform(
        testUserId,
        'invalid_platform' as Platform,
        mockNotionCredentials
      )).rejects.toThrow('不支援的平台');
    });

    it('應該處理未連接平台的同步請求', async () => {
      await expect(integrationManager.manualSync(
        'non-existent-user',
        Platform.NOTION
      )).rejects.toThrow('未連接到');
    });

    it('應該處理無效的認證', async () => {
      const invalidCredentials: EncryptedCredentials = {};

      await expect(integrationManager.connectPlatform(
        testUserId,
        Platform.NOTION,
        invalidCredentials
      )).rejects.toThrow();
    });
  });

  describe('平台特定功能測試', () => {
    describe('Notion 特定功能', () => {
      beforeEach(async () => {
        await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockNotionCredentials);
      });

      it('應該支援 Notion 的資料類型', () => {
        const supportedTypes = integrationManager.getPlatformSupportedDataTypes(Platform.NOTION);
        
        expect(supportedTypes).toContain(DataType.FOOD_LOGS);
        expect(supportedTypes).toContain(DataType.HEALTH_REPORTS);
        expect(supportedTypes).toContain(DataType.ACHIEVEMENTS);
      });
    });

    describe('Line 特定功能', () => {
      beforeEach(async () => {
        await integrationManager.connectPlatform(testUserId, Platform.LINE, mockLineCredentials);
      });

      it('應該支援 Line 的資料類型', () => {
        const supportedTypes = integrationManager.getPlatformSupportedDataTypes(Platform.LINE);
        
        expect(supportedTypes).toContain(DataType.HEALTH_REPORTS);
        expect(supportedTypes).toContain(DataType.ACHIEVEMENTS);
        expect(supportedTypes).not.toContain(DataType.FOOD_LOGS);
      });
    });

    describe('HealthKit 特定功能', () => {
      beforeEach(async () => {
        await integrationManager.connectPlatform(testUserId, Platform.APPLE_HEALTH, mockHealthKitCredentials);
      });

      it('應該支援 HealthKit 的資料類型', () => {
        const supportedTypes = integrationManager.getPlatformSupportedDataTypes(Platform.APPLE_HEALTH);
        
        expect(supportedTypes).toContain(DataType.HEALTH_METRICS);
        expect(supportedTypes).toContain(DataType.NUTRITION_DATA);
      });
    });
  });

  describe('同步狀態監控', () => {
    it('應該能夠獲取同步狀態', () => {
      const syncStatus = integrationManager.getSyncStatus();
      
      expect(syncStatus).toBeDefined();
      expect(typeof syncStatus).toBe('object');
    });
  });

  describe('認證刷新流程', () => {
    beforeEach(async () => {
      await integrationManager.connectPlatform(testUserId, Platform.APPLE_HEALTH, mockHealthKitCredentials);
    });

    it('應該能夠刷新平台認證', async () => {
      await expect(integrationManager.refreshPlatformCredentials(
        testUserId,
        Platform.APPLE_HEALTH
      )).resolves.not.toThrow();
    });
  });
});