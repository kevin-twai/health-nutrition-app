import { Client } from '@notionhq/client';
import { 
  IntegrationConnection, 
  SyncResult, 
  Platform, 
  DataType,
  EncryptedCredentials,
  FoodLog,
  HealthReport,
  NotionPageData,
  SyncError,
  ConnectionStatus
} from '../../types/shared';
import { BaseIntegrationService } from './BaseIntegrationService';

/**
 * Notion 資料同步連接器
 * 負責與 Notion API 的整合和資料同步
 */
export class NotionConnector extends BaseIntegrationService {
  private notionClient: Client | null = null;
  private readonly databaseMappings: Record<DataType, string> = {
    [DataType.FOOD_LOGS]: 'food_logs_database_id',
    [DataType.HEALTH_REPORTS]: 'health_reports_database_id',
    [DataType.ACHIEVEMENTS]: 'achievements_database_id',
    [DataType.NUTRITION_DATA]: 'nutrition_data_database_id',
    [DataType.HEALTH_METRICS]: 'health_metrics_database_id'
  };

  constructor() {
    super(Platform.NOTION);
  }

  /**
   * 建立 Notion 連接
   */
  async connect(userId: string, credentials: EncryptedCredentials): Promise<IntegrationConnection> {
    try {
      // 驗證 API 金鑰
      const isValid = await this.testConnection(credentials);
      if (!isValid) {
        throw new Error('無效的 Notion API 金鑰');
      }

      // 建立連接記錄
      const connection: IntegrationConnection = {
        id: `notion_${userId}_${Date.now()}`,
        userId,
        platform: Platform.NOTION,
        status: ConnectionStatus.CONNECTED,
        credentials,
        settings: {
          syncEnabled: true,
          syncFrequency: 'daily' as any,
          dataTypes: this.getSupportedDataTypes(),
          notificationsEnabled: true,
          autoSync: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.logSyncActivity(userId, '建立連接', { status: 'success' });
      return connection;
    } catch (error) {
      throw this.formatError(error, '建立連接失敗');
    }
  }

  /**
   * 斷開 Notion 連接
   */
  async disconnect(userId: string): Promise<void> {
    try {
      this.notionClient = null;
      this.logSyncActivity(userId, '斷開連接', { status: 'success' });
    } catch (error) {
      throw this.formatError(error, '斷開連接失敗');
    }
  }

  /**
   * 驗證連接狀態
   */
  async validateConnection(connection: IntegrationConnection): Promise<boolean> {
    try {
      return await this.testConnection(connection.credentials);
    } catch (error) {
      console.error('Notion 連接驗證失敗:', error);
      return false;
    }
  }

  /**
   * 同步資料到 Notion
   */
  async syncToExternal(userId: string, dataType: DataType, data: any[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      startTime: new Date(),
      endTime: new Date()
    };

    try {
      if (!this.notionClient) {
        throw new Error('Notion 客戶端未初始化');
      }

      result.recordsProcessed = data.length;

      switch (dataType) {
        case DataType.FOOD_LOGS:
          await this.syncFoodLogsToNotion(data as FoodLog[], result);
          break;
        case DataType.HEALTH_REPORTS:
          await this.syncHealthReportsToNotion(data as HealthReport[], result);
          break;
        default:
          throw new Error(`不支援的資料類型: ${dataType}`);
      }

      result.success = result.errors.length === 0;
      result.endTime = new Date();

      this.logSyncActivity(userId, `同步 ${dataType} 到 Notion`, result);
      return result;
    } catch (error) {
      result.errors.push({
        type: 'SYNC_ERROR',
        message: this.getErrorMessage(error),
        retryable: true
      });
      result.endTime = new Date();
      throw this.formatError(error, '同步到 Notion 失敗');
    }
  }

  /**
   * 從 Notion 同步資料
   */
  async syncFromExternal(userId: string, dataType: DataType): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      startTime: new Date(),
      endTime: new Date()
    };

    try {
      if (!this.notionClient) {
        throw new Error('Notion 客戶端未初始化');
      }

      // 從 Notion 查詢資料
      const databaseId = this.databaseMappings[dataType];
      if (!databaseId) {
        throw new Error(`未配置 ${dataType} 的資料庫 ID`);
      }

      // 注意：這裡需要根據實際的 Notion 資料庫結構調整查詢
      // 暫時註解掉，因為需要實際的資料庫 ID 配置
      const response = { results: [] };

      result.recordsProcessed = response.results.length;
      
      // 處理查詢結果
      for (const page of response.results) {
        try {
          await this.processNotionPage(page as any, dataType);
          result.recordsCreated++;
        } catch (error) {
          result.errors.push({
            type: 'PROCESSING_ERROR',
            message: this.getErrorMessage(error),
            recordId: (page as any).id,
            retryable: true
          });
        }
      }

      result.success = result.errors.length === 0;
      result.endTime = new Date();

      this.logSyncActivity(userId, `從 Notion 同步 ${dataType}`, result);
      return result;
    } catch (error) {
      result.errors.push({
        type: 'SYNC_ERROR',
        message: this.getErrorMessage(error),
        retryable: true
      });
      result.endTime = new Date();
      throw this.formatError(error, '從 Notion 同步失敗');
    }
  }

  /**
   * 獲取支援的資料類型
   */
  getSupportedDataTypes(): DataType[] {
    return [
      DataType.FOOD_LOGS,
      DataType.HEALTH_REPORTS,
      DataType.ACHIEVEMENTS
    ];
  }

  /**
   * 測試 Notion 連接
   */
  async testConnection(credentials: EncryptedCredentials): Promise<boolean> {
    try {
      if (!credentials.apiKey) {
        return false;
      }

      const testClient = new Client({
        auth: credentials.apiKey
      });

      // 測試 API 連接
      await testClient.users.me({});
      
      // 如果測試成功，設定客戶端
      this.notionClient = testClient;
      return true;
    } catch (error) {
      console.error('Notion 連接測試失敗:', error);
      return false;
    }
  }

  /**
   * 刷新認證令牌（Notion 使用 API 金鑰，不需要刷新）
   */
  async refreshCredentials(connection: IntegrationConnection): Promise<EncryptedCredentials> {
    // Notion 使用長期有效的 API 金鑰，不需要刷新
    return connection.credentials;
  }

  /**
   * 同步飲食記錄到 Notion
   */
  private async syncFoodLogsToNotion(foodLogs: FoodLog[], result: SyncResult): Promise<void> {
    const databaseId = this.databaseMappings[DataType.FOOD_LOGS];
    
    for (const log of foodLogs) {
      try {
        await this.notionClient!.pages.create({
          parent: { database_id: databaseId },
          properties: {
            '食物名稱': {
              title: [{ text: { content: log.foodId } }]
            },
            '份量': {
              number: log.portion
            },
            '餐別': {
              select: { name: this.translateMealType(log.mealType) }
            },
            '時間': {
              date: { start: log.timestamp.toISOString() }
            },
            '來源': {
              select: { name: this.translateLogSource(log.source) }
            },
            '用戶ID': {
              rich_text: [{ text: { content: log.userId } }]
            }
          }
        });
        result.recordsCreated++;
      } catch (error) {
        result.errors.push({
          type: 'CREATE_ERROR',
          message: this.getErrorMessage(error),
          recordId: log.id,
          retryable: true
        });
      }
    }
  }

  /**
   * 同步健康報告到 Notion
   */
  private async syncHealthReportsToNotion(reports: HealthReport[], result: SyncResult): Promise<void> {
    const databaseId = this.databaseMappings[DataType.HEALTH_REPORTS];
    
    for (const report of reports) {
      try {
        await this.notionClient!.pages.create({
          parent: { database_id: databaseId },
          properties: {
            '報告標題': {
              title: [{ text: { content: `健康報告 ${report.period.start.toLocaleDateString()}` } }]
            },
            '期間開始': {
              date: { start: report.period.start.toISOString() }
            },
            '期間結束': {
              date: { start: report.period.end.toISOString() }
            },
            '平均熱量': {
              number: report.nutritionSummary.avgDailyCalories
            },
            '總熱量': {
              number: report.nutritionSummary.totalCalories
            },
            '用戶ID': {
              rich_text: [{ text: { content: report.userId } }]
            },
            '生成時間': {
              date: { start: report.generatedAt.toISOString() }
            }
          }
        });
        result.recordsCreated++;
      } catch (error) {
        result.errors.push({
          type: 'CREATE_ERROR',
          message: this.getErrorMessage(error),
          recordId: report.id,
          retryable: true
        });
      }
    }
  }

  /**
   * 處理從 Notion 查詢的頁面資料
   */
  private async processNotionPage(page: any, dataType: DataType): Promise<void> {
    // 根據資料類型處理不同的頁面結構
    switch (dataType) {
      case DataType.FOOD_LOGS:
        // 處理飲食記錄頁面
        break;
      case DataType.HEALTH_REPORTS:
        // 處理健康報告頁面
        break;
      default:
        throw new Error(`不支援處理的資料類型: ${dataType}`);
    }
  }

  /**
   * 翻譯餐別類型
   */
  private translateMealType(mealType: string): string {
    const translations: Record<string, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '點心'
    };
    return translations[mealType] || mealType;
  }

  /**
   * 翻譯記錄來源
   */
  private translateLogSource(source: string): string {
    const translations: Record<string, string> = {
      'photo_recognition': '拍照辨識',
      'manual_input': '手動輸入',
      'third_party_sync': '第三方同步'
    };
    return translations[source] || source;
  }
}