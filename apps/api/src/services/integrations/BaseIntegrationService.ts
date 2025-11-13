import { 
  IntegrationConnection, 
  SyncResult, 
  Platform, 
  DataType,
  EncryptedCredentials,
  IntegrationSettings
} from '../../types/shared';

/**
 * 基礎整合服務抽象類別
 * 定義所有第三方平台整合的共同介面
 */
export abstract class BaseIntegrationService {
  protected platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  /**
   * 建立平台連接
   */
  abstract connect(userId: string, credentials: EncryptedCredentials): Promise<IntegrationConnection>;

  /**
   * 斷開平台連接
   */
  abstract disconnect(userId: string): Promise<void>;

  /**
   * 驗證連接狀態
   */
  abstract validateConnection(connection: IntegrationConnection): Promise<boolean>;

  /**
   * 同步資料到平台
   */
  abstract syncToExternal(userId: string, dataType: DataType, data: any[]): Promise<SyncResult>;

  /**
   * 從平台同步資料
   */
  abstract syncFromExternal(userId: string, dataType: DataType): Promise<SyncResult>;

  /**
   * 獲取支援的資料類型
   */
  abstract getSupportedDataTypes(): DataType[];

  /**
   * 測試連接
   */
  abstract testConnection(credentials: EncryptedCredentials): Promise<boolean>;

  /**
   * 刷新認證令牌
   */
  abstract refreshCredentials(connection: IntegrationConnection): Promise<EncryptedCredentials>;

  /**
   * 格式化錯誤訊息
   */
  protected formatError(error: unknown, context: string): Error {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(`${this.platform} ${context}: ${message}`);
  }

  /**
   * 安全獲取錯誤訊息
   */
  protected getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * 記錄同步活動
   */
  protected logSyncActivity(userId: string, action: string, result: any): void {
    console.log(`[${this.platform}] User ${userId} - ${action}:`, result);
  }
}