import { 
  IntegrationConnection, 
  SyncResult, 
  Platform, 
  DataType,
  EncryptedCredentials,
  ConnectionStatus,
  IntegrationSettings
} from '../../types/shared';
import { NotionConnector } from './NotionConnector';
import { LineConnector } from './LineConnector';
import { HealthKitConnector } from './HealthKitConnector';
import { SyncScheduler } from './SyncScheduler';
import { BaseIntegrationService } from './BaseIntegrationService';

/**
 * 整合管理器
 * 統一管理所有第三方平台的整合功能
 */
export class IntegrationManager {
  private connectors: Map<Platform, BaseIntegrationService>;
  private syncScheduler: SyncScheduler;
  private connections: Map<string, IntegrationConnection[]>; // userId -> connections

  constructor() {
    this.connectors = new Map();
    this.connections = new Map();
    this.syncScheduler = new SyncScheduler();
    
    // 初始化連接器
    this.initializeConnectors();
  }

  /**
   * 初始化所有連接器
   */
  private initializeConnectors(): void {
    this.connectors.set(Platform.NOTION, new NotionConnector());
    this.connectors.set(Platform.LINE, new LineConnector());
    this.connectors.set(Platform.APPLE_HEALTH, new HealthKitConnector());
    
    console.log('整合管理器已初始化，支援平台:', Array.from(this.connectors.keys()));
  }

  /**
   * 建立平台連接
   */
  async connectPlatform(
    userId: string, 
    platform: Platform, 
    credentials: EncryptedCredentials,
    settings?: Partial<IntegrationSettings>
  ): Promise<IntegrationConnection> {
    try {
      const connector = this.connectors.get(platform);
      if (!connector) {
        throw new Error(`不支援的平台: ${platform}`);
      }

      // 建立連接
      const connection = await connector.connect(userId, credentials);
      
      // 應用自訂設定
      if (settings) {
        connection.settings = { ...connection.settings, ...settings };
      }

      // 儲存連接
      await this.saveConnection(connection);
      
      // 啟動同步排程
      if (connection.settings.autoSync) {
        await this.syncScheduler.startUserSync(userId, [connection]);
      }

      console.log(`用戶 ${userId} 已連接到 ${platform}`);
      return connection;
    } catch (error) {
      console.error(`連接 ${platform} 失敗:`, error);
      throw error;
    }
  }

  /**
   * 斷開平台連接
   */
  async disconnectPlatform(userId: string, platform: Platform): Promise<void> {
    try {
      const connector = this.connectors.get(platform);
      if (!connector) {
        throw new Error(`不支援的平台: ${platform}`);
      }

      // 斷開連接
      await connector.disconnect(userId);
      
      // 停止同步排程
      await this.syncScheduler.stopUserSync(userId);
      
      // 移除連接記錄
      await this.removeConnection(userId, platform);

      console.log(`用戶 ${userId} 已斷開 ${platform} 連接`);
    } catch (error) {
      console.error(`斷開 ${platform} 連接失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取用戶的所有連接
   */
  async getUserConnections(userId: string): Promise<IntegrationConnection[]> {
    try {
      // 從快取獲取
      let connections = this.connections.get(userId);
      
      if (!connections) {
        // 從資料庫載入
        connections = await this.loadUserConnections(userId);
        this.connections.set(userId, connections);
      }

      return connections;
    } catch (error) {
      console.error(`獲取用戶 ${userId} 連接失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取特定平台的連接
   */
  async getPlatformConnection(userId: string, platform: Platform): Promise<IntegrationConnection | null> {
    try {
      const connections = await this.getUserConnections(userId);
      return connections.find(conn => conn.platform === platform) || null;
    } catch (error) {
      console.error(`獲取 ${platform} 連接失敗:`, error);
      throw error;
    }
  }

  /**
   * 測試平台連接
   */
  async testPlatformConnection(platform: Platform, credentials: EncryptedCredentials): Promise<boolean> {
    try {
      const connector = this.connectors.get(platform);
      if (!connector) {
        throw new Error(`不支援的平台: ${platform}`);
      }

      return await connector.testConnection(credentials);
    } catch (error) {
      console.error(`測試 ${platform} 連接失敗:`, error);
      return false;
    }
  }

  /**
   * 手動同步資料
   */
  async manualSync(userId: string, platform: Platform, dataType?: DataType): Promise<SyncResult[]> {
    try {
      const connection = await this.getPlatformConnection(userId, platform);
      if (!connection) {
        throw new Error(`用戶 ${userId} 未連接到 ${platform}`);
      }

      if (connection.status !== ConnectionStatus.CONNECTED) {
        throw new Error(`${platform} 連接狀態異常: ${connection.status}`);
      }

      return await this.syncScheduler.triggerManualSync(connection, dataType);
    } catch (error) {
      console.error(`手動同步失敗:`, error);
      throw error;
    }
  }

  /**
   * 更新連接設定
   */
  async updateConnectionSettings(
    userId: string, 
    platform: Platform, 
    settings: Partial<IntegrationSettings>
  ): Promise<IntegrationConnection> {
    try {
      const connection = await this.getPlatformConnection(userId, platform);
      if (!connection) {
        throw new Error(`用戶 ${userId} 未連接到 ${platform}`);
      }

      // 更新設定
      connection.settings = { ...connection.settings, ...settings };
      connection.updatedAt = new Date();

      // 儲存更新
      await this.saveConnection(connection);

      // 重新啟動同步排程
      if (settings.autoSync !== undefined) {
        await this.syncScheduler.stopUserSync(userId);
        if (settings.autoSync) {
          await this.syncScheduler.startUserSync(userId, [connection]);
        }
      }

      console.log(`已更新 ${platform} 連接設定`);
      return connection;
    } catch (error) {
      console.error(`更新連接設定失敗:`, error);
      throw error;
    }
  }

  /**
   * 驗證所有連接狀態
   */
  async validateAllConnections(userId: string): Promise<Map<Platform, boolean>> {
    const results = new Map<Platform, boolean>();
    
    try {
      const connections = await this.getUserConnections(userId);
      
      for (const connection of connections) {
        const connector = this.connectors.get(connection.platform);
        if (connector) {
          const isValid = await connector.validateConnection(connection);
          results.set(connection.platform, isValid);
          
          // 更新連接狀態
          if (!isValid && connection.status === ConnectionStatus.CONNECTED) {
            connection.status = ConnectionStatus.ERROR;
            await this.saveConnection(connection);
          }
        }
      }
    } catch (error) {
      console.error(`驗證連接狀態失敗:`, error);
    }

    return results;
  }

  /**
   * 獲取支援的平台列表
   */
  getSupportedPlatforms(): Platform[] {
    return Array.from(this.connectors.keys());
  }

  /**
   * 獲取平台支援的資料類型
   */
  getPlatformSupportedDataTypes(platform: Platform): DataType[] {
    const connector = this.connectors.get(platform);
    return connector ? connector.getSupportedDataTypes() : [];
  }

  /**
   * 獲取同步狀態
   */
  getSyncStatus(): any {
    return this.syncScheduler.getSyncStatus();
  }

  /**
   * 刷新平台認證
   */
  async refreshPlatformCredentials(userId: string, platform: Platform): Promise<void> {
    try {
      const connection = await this.getPlatformConnection(userId, platform);
      if (!connection) {
        throw new Error(`用戶 ${userId} 未連接到 ${platform}`);
      }

      const connector = this.connectors.get(platform);
      if (!connector) {
        throw new Error(`不支援的平台: ${platform}`);
      }

      // 刷新認證
      const refreshedCredentials = await connector.refreshCredentials(connection);
      connection.credentials = refreshedCredentials;
      connection.updatedAt = new Date();

      // 儲存更新
      await this.saveConnection(connection);

      console.log(`已刷新 ${platform} 認證`);
    } catch (error) {
      console.error(`刷新 ${platform} 認證失敗:`, error);
      throw error;
    }
  }

  /**
   * 批量同步資料
   */
  async batchSync(userId: string, syncRequests: BatchSyncRequest[]): Promise<BatchSyncResult[]> {
    const results: BatchSyncResult[] = [];
    
    for (const request of syncRequests) {
      try {
        const syncResults = await this.manualSync(userId, request.platform, request.dataType);
        results.push({
          platform: request.platform,
          dataType: request.dataType,
          success: true,
          results: syncResults
        });
      } catch (error) {
        results.push({
          platform: request.platform,
          dataType: request.dataType,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  /**
   * 儲存連接到資料庫
   */
  private async saveConnection(connection: IntegrationConnection): Promise<void> {
    // 實際實現中會儲存到資料庫
    const userConnections = this.connections.get(connection.userId) || [];
    const existingIndex = userConnections.findIndex(
      conn => conn.platform === connection.platform
    );

    if (existingIndex >= 0) {
      userConnections[existingIndex] = connection;
    } else {
      userConnections.push(connection);
    }

    this.connections.set(connection.userId, userConnections);
    console.log(`已儲存 ${connection.platform} 連接`);
  }

  /**
   * 從資料庫載入用戶連接
   */
  private async loadUserConnections(userId: string): Promise<IntegrationConnection[]> {
    // 實際實現中會從資料庫載入
    // 這裡返回空陣列作為預設值
    return [];
  }

  /**
   * 移除連接記錄
   */
  private async removeConnection(userId: string, platform: Platform): Promise<void> {
    const userConnections = this.connections.get(userId) || [];
    const filteredConnections = userConnections.filter(
      conn => conn.platform !== platform
    );
    
    this.connections.set(userId, filteredConnections);
    console.log(`已移除 ${platform} 連接記錄`);
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    this.syncScheduler.cleanup();
    this.connections.clear();
    console.log('整合管理器已清理');
  }
}

/**
 * 批量同步請求介面
 */
interface BatchSyncRequest {
  platform: Platform;
  dataType?: DataType;
}

/**
 * 批量同步結果介面
 */
interface BatchSyncResult {
  platform: Platform;
  dataType?: DataType;
  success: boolean;
  results?: SyncResult[];
  error?: string;
}