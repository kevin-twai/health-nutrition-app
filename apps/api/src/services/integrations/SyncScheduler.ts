import { 
  IntegrationConnection, 
  SyncResult, 
  Platform, 
  DataType,
  SyncFrequency,
  ConnectionStatus,
  SyncError
} from '../../types/shared';
import { NotionConnector } from './NotionConnector';
import { LineConnector } from './LineConnector';
import { HealthKitConnector } from './HealthKitConnector';
import { BaseIntegrationService } from './BaseIntegrationService';

/**
 * 同步排程器
 * 負責管理所有第三方平台的資料同步排程和錯誤處理
 */
export class SyncScheduler {
  private connectors: Map<Platform, BaseIntegrationService>;
  private syncJobs: Map<string, NodeJS.Timeout>;
  private retryQueue: Map<string, RetryJob>;
  private readonly maxRetries = 3;
  private readonly retryDelays = [1000, 5000, 15000]; // 1秒, 5秒, 15秒

  constructor() {
    this.connectors = new Map();
    this.syncJobs = new Map();
    this.retryQueue = new Map();
    
    // 初始化連接器
    this.connectors.set(Platform.NOTION, new NotionConnector());
    this.connectors.set(Platform.LINE, new LineConnector());
    this.connectors.set(Platform.APPLE_HEALTH, new HealthKitConnector());
  }

  /**
   * 啟動用戶的同步排程
   */
  async startUserSync(userId: string, connections: IntegrationConnection[]): Promise<void> {
    try {
      for (const connection of connections) {
        if (connection.settings.syncEnabled && connection.settings.autoSync) {
          await this.scheduleSync(connection);
        }
      }
      
      console.log(`已啟動用戶 ${userId} 的同步排程，共 ${connections.length} 個連接`);
    } catch (error) {
      console.error(`啟動用戶 ${userId} 同步排程失敗:`, error);
      throw error;
    }
  }

  /**
   * 停止用戶的同步排程
   */
  async stopUserSync(userId: string): Promise<void> {
    try {
      const userJobs = Array.from(this.syncJobs.keys()).filter(key => 
        key.startsWith(`${userId}_`)
      );

      for (const jobKey of userJobs) {
        const timeout = this.syncJobs.get(jobKey);
        if (timeout) {
          clearTimeout(timeout);
          this.syncJobs.delete(jobKey);
        }
      }

      console.log(`已停止用戶 ${userId} 的同步排程，共 ${userJobs.length} 個任務`);
    } catch (error) {
      console.error(`停止用戶 ${userId} 同步排程失敗:`, error);
      throw error;
    }
  }

  /**
   * 排程單個連接的同步
   */
  private async scheduleSync(connection: IntegrationConnection): Promise<void> {
    const jobKey = `${connection.userId}_${connection.platform}_${connection.id}`;
    const interval = this.getIntervalFromFrequency(connection.settings.syncFrequency);

    // 清除現有的排程
    const existingJob = this.syncJobs.get(jobKey);
    if (existingJob) {
      clearTimeout(existingJob);
    }

    // 建立新的排程
    const timeout = setInterval(async () => {
      await this.executeSyncJob(connection);
    }, interval);

    this.syncJobs.set(jobKey, timeout);
    
    console.log(`已排程 ${connection.platform} 同步，間隔: ${interval}ms`);
  }

  /**
   * 執行同步任務
   */
  private async executeSyncJob(connection: IntegrationConnection): Promise<void> {
    const jobId = `${connection.userId}_${connection.platform}_${Date.now()}`;
    
    try {
      console.log(`開始執行同步任務: ${jobId}`);
      
      // 檢查連接狀態
      const connector = this.connectors.get(connection.platform);
      if (!connector) {
        throw new Error(`找不到 ${connection.platform} 的連接器`);
      }

      const isValid = await connector.validateConnection(connection);
      if (!isValid) {
        throw new Error(`${connection.platform} 連接無效`);
      }

      // 執行資料同步
      const results: SyncResult[] = [];
      
      for (const dataType of connection.settings.dataTypes) {
        try {
          // 根據平台特性決定同步方向
          let result: SyncResult;
          
          if (connection.platform === Platform.LINE) {
            // Line 主要用於發送通知，從內部同步到外部
            const data = await this.getDataForSync(connection.userId, dataType);
            result = await connector.syncToExternal(connection.userId, dataType, data);
          } else {
            // 其他平台支援雙向同步，這裡先從外部同步
            result = await connector.syncFromExternal(connection.userId, dataType);
          }
          
          results.push(result);
        } catch (error) {
          console.error(`同步 ${dataType} 失敗:`, error);
          
          // 加入重試佇列
          await this.addToRetryQueue(connection, dataType, error);
        }
      }

      // 記錄同步結果
      await this.logSyncResults(connection, results);
      
      console.log(`同步任務完成: ${jobId}`);
    } catch (error) {
      console.error(`同步任務失敗: ${jobId}`, error);
      
      // 處理連接級別的錯誤
      await this.handleConnectionError(connection, error);
    }
  }

  /**
   * 手動觸發同步
   */
  async triggerManualSync(connection: IntegrationConnection, dataType?: DataType): Promise<SyncResult[]> {
    try {
      const connector = this.connectors.get(connection.platform);
      if (!connector) {
        throw new Error(`找不到 ${connection.platform} 的連接器`);
      }

      const results: SyncResult[] = [];
      const dataTypes = dataType ? [dataType] : connection.settings.dataTypes;

      for (const type of dataTypes) {
        try {
          let result: SyncResult;
          
          if (connection.platform === Platform.LINE) {
            const data = await this.getDataForSync(connection.userId, type);
            result = await connector.syncToExternal(connection.userId, type, data);
          } else {
            result = await connector.syncFromExternal(connection.userId, type);
          }
          
          results.push(result);
        } catch (error) {
          const errorResult: SyncResult = {
            success: false,
            recordsProcessed: 0,
            recordsCreated: 0,
            recordsUpdated: 0,
            recordsSkipped: 0,
            errors: [{
              type: 'MANUAL_SYNC_ERROR',
              message: error instanceof Error ? error.message : String(error),
              retryable: true
            }],
            startTime: new Date(),
            endTime: new Date()
          };
          results.push(errorResult);
        }
      }

      await this.logSyncResults(connection, results);
      return results;
    } catch (error) {
      console.error('手動同步失敗:', error);
      throw error;
    }
  }

  /**
   * 加入重試佇列
   */
  private async addToRetryQueue(connection: IntegrationConnection, dataType: DataType, error: any): Promise<void> {
    const retryKey = `${connection.userId}_${connection.platform}_${dataType}`;
    const existingJob = this.retryQueue.get(retryKey);
    
    const retryCount = existingJob ? existingJob.retryCount + 1 : 1;
    
    if (retryCount > this.maxRetries) {
      console.error(`重試次數已達上限，放棄重試: ${retryKey}`);
      await this.handleMaxRetriesReached(connection, dataType, error);
      return;
    }

    const delay = this.retryDelays[retryCount - 1] || this.retryDelays[this.retryDelays.length - 1];
    
    const retryJob: RetryJob = {
      connection,
      dataType,
      error,
      retryCount,
      nextRetryAt: new Date(Date.now() + delay),
      timeout: setTimeout(async () => {
        await this.executeRetry(retryKey);
      }, delay)
    };

    this.retryQueue.set(retryKey, retryJob);
    
    console.log(`已加入重試佇列: ${retryKey}, 重試次數: ${retryCount}, 延遲: ${delay}ms`);
  }

  /**
   * 執行重試
   */
  private async executeRetry(retryKey: string): Promise<void> {
    const retryJob = this.retryQueue.get(retryKey);
    if (!retryJob) {
      return;
    }

    try {
      console.log(`執行重試: ${retryKey}, 第 ${retryJob.retryCount} 次`);
      
      const connector = this.connectors.get(retryJob.connection.platform);
      if (!connector) {
        throw new Error(`找不到連接器: ${retryJob.connection.platform}`);
      }

      let result: SyncResult;
      
      if (retryJob.connection.platform === Platform.LINE) {
        const data = await this.getDataForSync(retryJob.connection.userId, retryJob.dataType);
        result = await connector.syncToExternal(retryJob.connection.userId, retryJob.dataType, data);
      } else {
        result = await connector.syncFromExternal(retryJob.connection.userId, retryJob.dataType);
      }

      if (result.success) {
        console.log(`重試成功: ${retryKey}`);
        this.retryQueue.delete(retryKey);
        await this.logSyncResults(retryJob.connection, [result]);
      } else {
        throw new Error(`重試失敗: ${result.errors.map(e => e.message).join(', ')}`);
      }
    } catch (error) {
      console.error(`重試失敗: ${retryKey}`, error);
      
      // 清除當前重試任務
      this.retryQueue.delete(retryKey);
      
      // 重新加入重試佇列
      await this.addToRetryQueue(retryJob.connection, retryJob.dataType, error);
    }
  }

  /**
   * 處理達到最大重試次數的情況
   */
  private async handleMaxRetriesReached(connection: IntegrationConnection, dataType: DataType, error: any): Promise<void> {
    console.error(`同步失敗，已達最大重試次數:`, {
      userId: connection.userId,
      platform: connection.platform,
      dataType,
      error: error.message
    });

    // 發送錯誤通知
    await this.sendErrorNotification(connection, dataType, error);
    
    // 可以考慮暫時停用該連接的自動同步
    if (this.shouldDisableAutoSync(error)) {
      await this.disableAutoSync(connection);
    }
  }

  /**
   * 處理連接錯誤
   */
  private async handleConnectionError(connection: IntegrationConnection, error: any): Promise<void> {
    console.error(`連接錯誤:`, {
      userId: connection.userId,
      platform: connection.platform,
      error: error.message
    });

    // 嘗試刷新認證
    try {
      const connector = this.connectors.get(connection.platform);
      if (connector) {
        const refreshedCredentials = await connector.refreshCredentials(connection);
        connection.credentials = refreshedCredentials;
        console.log(`已刷新 ${connection.platform} 認證`);
      }
    } catch (refreshError) {
      console.error(`刷新認證失敗:`, refreshError);
      
      // 標記連接為錯誤狀態
      connection.status = ConnectionStatus.ERROR;
      await this.sendConnectionErrorNotification(connection, error);
    }
  }

  /**
   * 獲取要同步的資料
   */
  private async getDataForSync(userId: string, dataType: DataType): Promise<any[]> {
    // 這裡應該從資料庫獲取要同步的資料
    // 實際實現中會根據 dataType 查詢對應的資料
    
    switch (dataType) {
      case DataType.FOOD_LOGS:
        // 獲取最近的飲食記錄
        return [];
      case DataType.HEALTH_REPORTS:
        // 獲取最新的健康報告
        return [];
      case DataType.ACHIEVEMENTS:
        // 獲取新的成就
        return [];
      default:
        return [];
    }
  }

  /**
   * 記錄同步結果
   */
  private async logSyncResults(connection: IntegrationConnection, results: SyncResult[]): Promise<void> {
    const summary = {
      userId: connection.userId,
      platform: connection.platform,
      timestamp: new Date(),
      totalRecordsProcessed: results.reduce((sum, r) => sum + r.recordsProcessed, 0),
      totalRecordsCreated: results.reduce((sum, r) => sum + r.recordsCreated, 0),
      totalRecordsUpdated: results.reduce((sum, r) => sum + r.recordsUpdated, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      success: results.every(r => r.success)
    };

    console.log('同步結果摘要:', summary);
    
    // 實際實現中應該儲存到資料庫
  }

  /**
   * 發送錯誤通知
   */
  private async sendErrorNotification(connection: IntegrationConnection, dataType: DataType, error: any): Promise<void> {
    // 實際實現中會發送通知給用戶
    console.log(`發送錯誤通知給用戶 ${connection.userId}:`, {
      platform: connection.platform,
      dataType,
      error: error.message
    });
  }

  /**
   * 發送連接錯誤通知
   */
  private async sendConnectionErrorNotification(connection: IntegrationConnection, error: any): Promise<void> {
    console.log(`發送連接錯誤通知給用戶 ${connection.userId}:`, {
      platform: connection.platform,
      error: error.message
    });
  }

  /**
   * 判斷是否應該停用自動同步
   */
  private shouldDisableAutoSync(error: any): boolean {
    // 根據錯誤類型判斷是否需要停用自動同步
    const disableErrors = [
      'AUTHENTICATION_FAILED',
      'PERMISSION_DENIED',
      'ACCOUNT_SUSPENDED'
    ];
    
    return disableErrors.some(errorType => 
      error.message.includes(errorType) || error.code === errorType
    );
  }

  /**
   * 停用自動同步
   */
  private async disableAutoSync(connection: IntegrationConnection): Promise<void> {
    connection.settings.autoSync = false;
    connection.status = ConnectionStatus.ERROR;
    
    // 停止該連接的排程任務
    const jobKey = `${connection.userId}_${connection.platform}_${connection.id}`;
    const timeout = this.syncJobs.get(jobKey);
    if (timeout) {
      clearTimeout(timeout);
      this.syncJobs.delete(jobKey);
    }
    
    console.log(`已停用 ${connection.platform} 的自動同步`);
  }

  /**
   * 根據頻率獲取間隔時間
   */
  private getIntervalFromFrequency(frequency: SyncFrequency): number {
    switch (frequency) {
      case SyncFrequency.REAL_TIME:
        return 5 * 60 * 1000; // 5分鐘
      case SyncFrequency.HOURLY:
        return 60 * 60 * 1000; // 1小時
      case SyncFrequency.DAILY:
        return 24 * 60 * 60 * 1000; // 24小時
      case SyncFrequency.WEEKLY:
        return 7 * 24 * 60 * 60 * 1000; // 7天
      default:
        return 60 * 60 * 1000; // 預設1小時
    }
  }

  /**
   * 獲取同步狀態
   */
  getSyncStatus(): SyncStatus {
    return {
      activeJobs: this.syncJobs.size,
      retryQueueSize: this.retryQueue.size,
      connectors: Array.from(this.connectors.keys())
    };
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    // 清除所有排程任務
    for (const timeout of this.syncJobs.values()) {
      clearTimeout(timeout);
    }
    this.syncJobs.clear();

    // 清除所有重試任務
    for (const retryJob of this.retryQueue.values()) {
      clearTimeout(retryJob.timeout);
    }
    this.retryQueue.clear();

    console.log('同步排程器已清理');
  }
}

/**
 * 重試任務介面
 */
interface RetryJob {
  connection: IntegrationConnection;
  dataType: DataType;
  error: any;
  retryCount: number;
  nextRetryAt: Date;
  timeout: NodeJS.Timeout;
}

/**
 * 同步狀態介面
 */
interface SyncStatus {
  activeJobs: number;
  retryQueueSize: number;
  connectors: Platform[];
}