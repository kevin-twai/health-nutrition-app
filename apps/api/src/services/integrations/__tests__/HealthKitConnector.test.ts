import { HealthKitConnector } from '../HealthKitConnector';
import { 
  Platform, 
  DataType, 
  ConnectionStatus,
  EncryptedCredentials,
  HealthKitData,
  HealthKitDataType
} from '../../../types/shared';

describe('HealthKitConnector', () => {
  let healthKitConnector: HealthKitConnector;
  const mockCredentials: EncryptedCredentials = {
    accessToken: 'test-healthkit-token'
  };
  const testUserId = 'test-user-123';

  beforeEach(() => {
    healthKitConnector = new HealthKitConnector();
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('應該成功建立 HealthKit 連接', async () => {
      const connection = await healthKitConnector.connect(testUserId, mockCredentials);

      expect(connection).toBeDefined();
      expect(connection.userId).toBe(testUserId);
      expect(connection.platform).toBe(Platform.APPLE_HEALTH);
      expect(connection.status).toBe(ConnectionStatus.CONNECTED);
      expect(connection.credentials).toBe(mockCredentials);
      expect(connection.settings.syncEnabled).toBe(true);
    });

    it('當認證無效時應該拋出錯誤', async () => {
      const invalidCredentials: EncryptedCredentials = {};

      await expect(healthKitConnector.connect(testUserId, invalidCredentials))
        .rejects.toThrow('HealthKit 授權驗證失敗');
    });
  });

  describe('disconnect', () => {
    it('應該成功斷開 HealthKit 連接', async () => {
      await expect(healthKitConnector.disconnect(testUserId))
        .resolves.not.toThrow();
    });
  });

  describe('testConnection', () => {
    it('應該驗證有效的連接', async () => {
      const isValid = await healthKitConnector.testConnection(mockCredentials);
      expect(isValid).toBe(true);
    });

    it('應該拒絕無效的連接', async () => {
      const invalidCredentials: EncryptedCredentials = {};
      const isValid = await healthKitConnector.testConnection(invalidCredentials);
      expect(isValid).toBe(false);
    });
  });

  describe('syncToExternal', () => {
    it('應該成功同步健康指標到 HealthKit', async () => {
      const healthData: HealthKitData[] = [
        {
          type: HealthKitDataType.WEIGHT,
          value: 70.5,
          unit: 'kg',
          startDate: new Date(),
          endDate: new Date()
        }
      ];

      const result = await healthKitConnector.syncToExternal(
        testUserId, 
        DataType.HEALTH_METRICS, 
        healthData
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('應該成功同步營養資料到 HealthKit', async () => {
      const nutritionData = [
        {
          calories: 500,
          timestamp: new Date(),
          mealType: 'breakfast'
        }
      ];

      const result = await healthKitConnector.syncToExternal(
        testUserId, 
        DataType.NUTRITION_DATA, 
        nutritionData
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
    });

    it('當資料類型不支援時應該拋出錯誤', async () => {
      await expect(healthKitConnector.syncToExternal(
        testUserId, 
        DataType.FOOD_LOGS, 
        []
      )).rejects.toThrow('不支援同步到 HealthKit 的資料類型');
    });
  });

  describe('syncFromExternal', () => {
    it('應該成功從 HealthKit 同步健康指標', async () => {
      const result = await healthKitConnector.syncFromExternal(
        testUserId, 
        DataType.HEALTH_METRICS
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBeGreaterThanOrEqual(0);
    });

    it('當資料類型不支援時應該拋出錯誤', async () => {
      await expect(healthKitConnector.syncFromExternal(
        testUserId, 
        DataType.FOOD_LOGS
      )).rejects.toThrow('不支援從 HealthKit 同步的資料類型');
    });
  });

  describe('getSupportedDataTypes', () => {
    it('應該返回支援的資料類型', () => {
      const supportedTypes = healthKitConnector.getSupportedDataTypes();
      
      expect(supportedTypes).toContain(DataType.HEALTH_METRICS);
      expect(supportedTypes).toContain(DataType.NUTRITION_DATA);
      expect(supportedTypes).not.toContain(DataType.FOOD_LOGS);
    });
  });

  describe('getSupportedHealthKitDataTypes', () => {
    it('應該返回支援的 HealthKit 資料類型', () => {
      const supportedTypes = healthKitConnector.getSupportedHealthKitDataTypes();
      
      expect(supportedTypes).toContain(HealthKitDataType.WEIGHT);
      expect(supportedTypes).toContain(HealthKitDataType.HEIGHT);
      expect(supportedTypes).toContain(HealthKitDataType.STEPS);
      expect(supportedTypes).toContain(HealthKitDataType.HEART_RATE);
    });
  });

  describe('requestHealthKitPermissions', () => {
    it('應該成功請求 HealthKit 權限', async () => {
      const dataTypes = [HealthKitDataType.WEIGHT, HealthKitDataType.STEPS];
      
      const result = await healthKitConnector.requestHealthKitPermissions(
        testUserId, 
        dataTypes
      );

      expect(result).toBe(true);
    });

    it('當包含不支援的資料類型時應該拋出錯誤', async () => {
      const invalidDataTypes = ['invalid_type' as HealthKitDataType];
      
      await expect(healthKitConnector.requestHealthKitPermissions(
        testUserId, 
        invalidDataTypes
      )).rejects.toThrow('包含不支援的資料類型');
    });
  });

  describe('receiveHealthKitData', () => {
    it('應該成功接收和處理 HealthKit 資料', async () => {
      const healthKitData: HealthKitData[] = [
        {
          type: HealthKitDataType.WEIGHT,
          value: 70.5,
          unit: 'kg',
          startDate: new Date(),
          endDate: new Date()
        },
        {
          type: HealthKitDataType.STEPS,
          value: 8500,
          unit: 'count',
          startDate: new Date(),
          endDate: new Date()
        }
      ];

      await expect(healthKitConnector.receiveHealthKitData(testUserId, healthKitData))
        .resolves.not.toThrow();
    });

    it('當資料格式無效時應該拋出錯誤', async () => {
      const invalidData: HealthKitData[] = [
        {
          type: 'invalid_type' as HealthKitDataType,
          value: -1,
          unit: 'kg',
          startDate: new Date(),
          endDate: new Date()
        }
      ];

      await expect(healthKitConnector.receiveHealthKitData(testUserId, invalidData))
        .rejects.toThrow();
    });
  });

  describe('validateConnection', () => {
    it('應該驗證有效的連接', async () => {
      const connection = await healthKitConnector.connect(testUserId, mockCredentials);
      const isValid = await healthKitConnector.validateConnection(connection);
      
      expect(isValid).toBe(true);
    });
  });

  describe('refreshCredentials', () => {
    it('應該刷新認證並設定過期時間', async () => {
      const connection = await healthKitConnector.connect(testUserId, mockCredentials);
      const refreshedCredentials = await healthKitConnector.refreshCredentials(connection);
      
      expect(refreshedCredentials).toBeDefined();
      expect(refreshedCredentials.expiresAt).toBeDefined();
      expect(refreshedCredentials.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('getDataTypeUnit', () => {
    it('應該返回正確的資料類型單位', () => {
      expect(healthKitConnector.getDataTypeUnit(HealthKitDataType.WEIGHT)).toBe('kg');
      expect(healthKitConnector.getDataTypeUnit(HealthKitDataType.HEIGHT)).toBe('cm');
      expect(healthKitConnector.getDataTypeUnit(HealthKitDataType.STEPS)).toBe('count');
      expect(healthKitConnector.getDataTypeUnit(HealthKitDataType.HEART_RATE)).toBe('bpm');
    });
  });

  describe('資料驗證', () => {
    it('應該驗證有效的 HealthKit 資料', async () => {
      const validData: HealthKitData[] = [
        {
          type: HealthKitDataType.WEIGHT,
          value: 70.5,
          unit: 'kg',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-01')
        }
      ];

      await expect(healthKitConnector.receiveHealthKitData(testUserId, validData))
        .resolves.not.toThrow();
    });

    it('應該拒絕無效的資料值', async () => {
      const invalidData: HealthKitData[] = [
        {
          type: HealthKitDataType.WEIGHT,
          value: -10, // 負值無效
          unit: 'kg',
          startDate: new Date(),
          endDate: new Date()
        }
      ];

      await expect(healthKitConnector.receiveHealthKitData(testUserId, invalidData))
        .rejects.toThrow('無效的資料值');
    });

    it('應該拒絕時間順序錯誤的資料', async () => {
      const invalidData: HealthKitData[] = [
        {
          type: HealthKitDataType.WEIGHT,
          value: 70.5,
          unit: 'kg',
          startDate: new Date('2023-01-02'),
          endDate: new Date('2023-01-01') // 結束時間早於開始時間
        }
      ];

      await expect(healthKitConnector.receiveHealthKitData(testUserId, invalidData))
        .rejects.toThrow('開始時間不能晚於結束時間');
    });
  });
});