import { IntegrationManager } from '../IntegrationManager';
import { 
  Platform, 
  DataType, 
  ConnectionStatus,
  EncryptedCredentials,
  SyncFrequency
} from '@health-tracker/shared-types';

// Mock 所有連接器
jest.mock('../NotionConnector');
jest.mock('../LineConnector');
jest.mock('../HealthKitConnector');
jest.mock('../SyncScheduler');

describe('IntegrationManager', () => {
  let integrationManager: IntegrationManager;
  const testUserId = 'test-user-123';
  const mockCredentials: EncryptedCredentials = {
    accessToken: 'test-token'
  };

  beforeEach(() => {
    integrationManager = new IntegrationManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    integrationManager.cleanup();
  });

  describe('connectPlatform', () => {
    it('應該成功連接支援的平台', async () => {
      const connection = await integrationManager.connectPlatform(
        testUserId,
        Platform.NOTION,
        mockCredentials
      );

      expect(connection).toBeDefined();
      expect(connection.userId).toBe(testUserId);
      expect(connection.platform).toBe(Platform.NOTION);
      expect(connection.status).toBe(ConnectionStatus.CONNECTED);
    });

    it('應該應用自訂設定', async () => {
      const customSettings = {
        syncFrequency: SyncFrequency.HOURLY,
        dataTypes: [DataType.FOOD_LOGS]
      };

      const connection = await integrationManager.connectPlatform(
        testUserId,
        Platform.NOTION,
        mockCredentials,
        customSettings
      );

      expect(connection.settings.syncFrequency).toBe(SyncFrequency.HOURLY);
      expect(connection.settings.dataTypes).toEqual([DataType.FOOD_LOGS]);
    });

    it('當平台不支援時應該拋出錯誤', async () => {
      await expect(integrationManager.connectPlatform(
        testUserId,
        'unsupported_platform' as Platform,
        mockCredentials
      )).rejects.toThrow('不支援的平台');
    });
  });

  describe('disconnectPlatform', () => {
    it('應該成功斷開平台連接', async () => {
      // 先連接
      await integrationManager.connectPlatform(
        testUserId,
        Platform.NOTION,
        mockCredentials
      );

      // 然後斷開
      await expect(integrationManager.disconnectPlatform(testUserId, Platform.NOTION))
        .resolves.not.toThrow();
    });
  });

  describe('getUserConnections', () => {
    it('應該返回用戶的所有連接', async () => {
      // 連接多個平台
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockCredentials);
      await integrationManager.connectPlatform(testUserId, Platform.LINE, mockCredentials);

      const connections = await integrationManager.getUserConnections(testUserId);

      expect(connections).toHaveLength(2);
      expect(connections.map(c => c.platform)).toContain(Platform.NOTION);
      expect(connections.map(c => c.platform)).toContain(Platform.LINE);
    });

    it('當用戶沒有連接時應該返回空陣列', async () => {
      const connections = await integrationManager.getUserConnections('new-user');
      expect(connections).toHaveLength(0);
    });
  });

  describe('getPlatformConnection', () => {
    it('應該返回特定平台的連接', async () => {
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockCredentials);

      const connection = await integrationManager.getPlatformConnection(testUserId, Platform.NOTION);

      expect(connection).toBeDefined();
      expect(connection!.platform).toBe(Platform.NOTION);
    });

    it('當平台未連接時應該返回 null', async () => {
      const connection = await integrationManager.getPlatformConnection(testUserId, Platform.NOTION);
      expect(connection).toBeNull();
    });
  });

  describe('testPlatformConnection', () => {
    it('應該測試平台連接', async () => {
      const isValid = await integrationManager.testPlatformConnection(
        Platform.NOTION,
        mockCredentials
      );

      expect(typeof isValid).toBe('boolean');
    });

    it('當平台不支援時應該返回 false', async () => {
      const isValid = await integrationManager.testPlatformConnection(
        'unsupported_platform' as Platform,
        mockCredentials
      );

      expect(isValid).toBe(false);
    });
  });

  describe('manualSync', () => {
    beforeEach(async () => {
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockCredentials);
    });

    it('應該執行手動同步', async () => {
      const results = await integrationManager.manualSync(testUserId, Platform.NOTION);

      expect(Array.isArray(results)).toBe(true);
    });

    it('應該同步特定資料類型', async () => {
      const results = await integrationManager.manualSync(
        testUserId, 
        Platform.NOTION, 
        DataType.FOOD_LOGS
      );

      expect(Array.isArray(results)).toBe(true);
    });

    it('當用戶未連接平台時應該拋出錯誤', async () => {
      await expect(integrationManager.manualSync('new-user', Platform.NOTION))
        .rejects.toThrow('未連接到');
    });
  });

  describe('updateConnectionSettings', () => {
    beforeEach(async () => {
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockCredentials);
    });

    it('應該更新連接設定', async () => {
      const newSettings = {
        syncFrequency: SyncFrequency.WEEKLY,
        autoSync: false
      };

      const updatedConnection = await integrationManager.updateConnectionSettings(
        testUserId,
        Platform.NOTION,
        newSettings
      );

      expect(updatedConnection.settings.syncFrequency).toBe(SyncFrequency.WEEKLY);
      expect(updatedConnection.settings.autoSync).toBe(false);
    });

    it('當連接不存在時應該拋出錯誤', async () => {
      await expect(integrationManager.updateConnectionSettings(
        'new-user',
        Platform.NOTION,
        {}
      )).rejects.toThrow('未連接到');
    });
  });

  describe('validateAllConnections', () => {
    beforeEach(async () => {
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockCredentials);
      await integrationManager.connectPlatform(testUserId, Platform.LINE, mockCredentials);
    });

    it('應該驗證所有連接狀態', async () => {
      const results = await integrationManager.validateAllConnections(testUserId);

      expect(results).toBeInstanceOf(Map);
      expect(results.has(Platform.NOTION)).toBe(true);
      expect(results.has(Platform.LINE)).toBe(true);
    });
  });

  describe('getSupportedPlatforms', () => {
    it('應該返回支援的平台列表', () => {
      const platforms = integrationManager.getSupportedPlatforms();

      expect(platforms).toContain(Platform.NOTION);
      expect(platforms).toContain(Platform.LINE);
      expect(platforms).toContain(Platform.APPLE_HEALTH);
    });
  });

  describe('getPlatformSupportedDataTypes', () => {
    it('應該返回平台支援的資料類型', () => {
      const dataTypes = integrationManager.getPlatformSupportedDataTypes(Platform.NOTION);
      expect(Array.isArray(dataTypes)).toBe(true);
    });

    it('當平台不存在時應該返回空陣列', () => {
      const dataTypes = integrationManager.getPlatformSupportedDataTypes(
        'unsupported_platform' as Platform
      );
      expect(dataTypes).toHaveLength(0);
    });
  });

  describe('refreshPlatformCredentials', () => {
    beforeEach(async () => {
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockCredentials);
    });

    it('應該刷新平台認證', async () => {
      await expect(integrationManager.refreshPlatformCredentials(testUserId, Platform.NOTION))
        .resolves.not.toThrow();
    });

    it('當連接不存在時應該拋出錯誤', async () => {
      await expect(integrationManager.refreshPlatformCredentials('new-user', Platform.NOTION))
        .rejects.toThrow('未連接到');
    });
  });

  describe('batchSync', () => {
    beforeEach(async () => {
      await integrationManager.connectPlatform(testUserId, Platform.NOTION, mockCredentials);
      await integrationManager.connectPlatform(testUserId, Platform.LINE, mockCredentials);
    });

    it('應該執行批量同步', async () => {
      const syncRequests = [
        { platform: Platform.NOTION, dataType: DataType.FOOD_LOGS },
        { platform: Platform.LINE, dataType: DataType.HEALTH_REPORTS }
      ];

      const results = await integrationManager.batchSync(testUserId, syncRequests);

      expect(results).toHaveLength(2);
      expect(results[0].platform).toBe(Platform.NOTION);
      expect(results[1].platform).toBe(Platform.LINE);
    });

    it('應該處理部分失敗的情況', async () => {
      const syncRequests = [
        { platform: Platform.NOTION, dataType: DataType.FOOD_LOGS },
        { platform: 'invalid_platform' as Platform, dataType: DataType.FOOD_LOGS }
      ];

      const results = await integrationManager.batchSync(testUserId, syncRequests);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });

  describe('getSyncStatus', () => {
    it('應該返回同步狀態', () => {
      const status = integrationManager.getSyncStatus();
      expect(status).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('應該清理所有資源', () => {
      expect(() => integrationManager.cleanup()).not.toThrow();
    });
  });
});