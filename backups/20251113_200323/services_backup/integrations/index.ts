/**
 * 第三方平台整合服務
 * 
 * 這個模組提供了與第三方平台（Notion、Line、Apple HealthKit）的整合功能，
 * 包括資料同步、通知發送和健康資料管理。
 */

// 基礎服務
export { BaseIntegrationService } from './BaseIntegrationService';

// 平台連接器
export { NotionConnector } from './NotionConnector';
export { LineConnector } from './LineConnector';
export { HealthKitConnector } from './HealthKitConnector';

// 同步管理
export { SyncScheduler } from './SyncScheduler';
export { IntegrationManager } from './IntegrationManager';

// 重新導出相關類型
export {
  IntegrationConnection,
  SyncResult,
  Platform,
  DataType,
  EncryptedCredentials,
  IntegrationSettings,
  SyncFrequency,
  ConnectionStatus,
  NotionPageData,
  LineMessage,
  LineTemplateContent,
  LineAction,
  HealthKitData,
  HealthKitDataType
} from '@health-tracker/shared-types';