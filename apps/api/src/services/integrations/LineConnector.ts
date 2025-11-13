import { 
  IntegrationConnection, 
  SyncResult, 
  Platform, 
  DataType,
  EncryptedCredentials,
  LineMessage,
  LineTemplateContent,
  LineAction,
  HealthReport,
  Achievement,
  ConnectionStatus
} from '../../types/shared';
import { BaseIntegrationService } from './BaseIntegrationService';
import axios, { AxiosInstance } from 'axios';

/**
 * Line 通知和分享連接器
 * 負責與 Line Messaging API 的整合
 */
export class LineConnector extends BaseIntegrationService {
  private lineClient: AxiosInstance | null = null;
  private readonly LINE_API_BASE = 'https://api.line.me/v2/bot';

  constructor() {
    super(Platform.LINE);
  }

  /**
   * 建立 Line 連接
   */
  async connect(userId: string, credentials: EncryptedCredentials): Promise<IntegrationConnection> {
    try {
      // 驗證 Channel Access Token
      const isValid = await this.testConnection(credentials);
      if (!isValid) {
        throw new Error('無效的 Line Channel Access Token');
      }

      // 建立連接記錄
      const connection: IntegrationConnection = {
        id: `line_${userId}_${Date.now()}`,
        userId,
        platform: Platform.LINE,
        status: ConnectionStatus.CONNECTED,
        credentials,
        settings: {
          syncEnabled: true,
          syncFrequency: 'real_time' as any,
          dataTypes: this.getSupportedDataTypes(),
          notificationsEnabled: true,
          autoSync: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.logSyncActivity(userId, '建立 Line 連接', { status: 'success' });
      return connection;
    } catch (error) {
      throw this.formatError(error, '建立 Line 連接失敗');
    }
  }

  /**
   * 斷開 Line 連接
   */
  async disconnect(userId: string): Promise<void> {
    try {
      this.lineClient = null;
      this.logSyncActivity(userId, '斷開 Line 連接', { status: 'success' });
    } catch (error) {
      throw this.formatError(error, '斷開 Line 連接失敗');
    }
  }

  /**
   * 驗證連接狀態
   */
  async validateConnection(connection: IntegrationConnection): Promise<boolean> {
    try {
      return await this.testConnection(connection.credentials);
    } catch (error) {
      console.error('Line 連接驗證失敗:', error);
      return false;
    }
  }

  /**
   * 同步資料到 Line（發送通知）
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
      if (!this.lineClient) {
        throw new Error('Line 客戶端未初始化');
      }

      result.recordsProcessed = data.length;

      switch (dataType) {
        case DataType.HEALTH_REPORTS:
          await this.sendHealthReportNotifications(userId, data as HealthReport[], result);
          break;
        case DataType.ACHIEVEMENTS:
          await this.sendAchievementNotifications(userId, data as Achievement[], result);
          break;
        default:
          throw new Error(`不支援的資料類型: ${dataType}`);
      }

      result.success = result.errors.length === 0;
      result.endTime = new Date();

      this.logSyncActivity(userId, `發送 ${dataType} Line 通知`, result);
      return result;
    } catch (error) {
      result.errors.push({
        type: 'NOTIFICATION_ERROR',
        message: this.getErrorMessage(error),
        retryable: true
      });
      result.endTime = new Date();
      throw this.formatError(error, '發送 Line 通知失敗');
    }
  }

  /**
   * 從 Line 同步資料（不適用）
   */
  async syncFromExternal(userId: string, dataType: DataType): Promise<SyncResult> {
    // Line 主要用於發送通知，不需要從外部同步資料
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      startTime: new Date(),
      endTime: new Date()
    };
  }

  /**
   * 獲取支援的資料類型
   */
  getSupportedDataTypes(): DataType[] {
    return [
      DataType.HEALTH_REPORTS,
      DataType.ACHIEVEMENTS
    ];
  }

  /**
   * 測試 Line 連接
   */
  async testConnection(credentials: EncryptedCredentials): Promise<boolean> {
    try {
      if (!credentials.accessToken) {
        return false;
      }

      const testClient = axios.create({
        baseURL: this.LINE_API_BASE,
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 測試 API 連接
      await testClient.get('/info');
      
      // 如果測試成功，設定客戶端
      this.lineClient = testClient;
      return true;
    } catch (error) {
      console.error('Line 連接測試失敗:', error);
      return false;
    }
  }

  /**
   * 刷新認證令牌
   */
  async refreshCredentials(connection: IntegrationConnection): Promise<EncryptedCredentials> {
    // Line Channel Access Token 通常是長期有效的，不需要刷新
    return connection.credentials;
  }

  /**
   * 發送文字訊息
   */
  async sendTextMessage(userId: string, message: string): Promise<void> {
    try {
      if (!this.lineClient) {
        throw new Error('Line 客戶端未初始化');
      }

      const lineMessage: LineMessage = {
        type: 'text',
        content: message
      };

      await this.sendMessage(userId, lineMessage);
    } catch (error) {
      throw this.formatError(error, '發送文字訊息失敗');
    }
  }

  /**
   * 發送模板訊息
   */
  async sendTemplateMessage(userId: string, template: LineTemplateContent): Promise<void> {
    try {
      if (!this.lineClient) {
        throw new Error('Line 客戶端未初始化');
      }

      const lineMessage: LineMessage = {
        type: 'template',
        content: template
      };

      await this.sendMessage(userId, lineMessage);
    } catch (error) {
      throw this.formatError(error, '發送模板訊息失敗');
    }
  }

  /**
   * 發送健康報告通知
   */
  private async sendHealthReportNotifications(userId: string, reports: HealthReport[], result: SyncResult): Promise<void> {
    for (const report of reports) {
      try {
        const message = this.formatHealthReportMessage(report);
        await this.sendTextMessage(userId, message);
        
        // 發送互動式按鈕
        const template: LineTemplateContent = {
          type: 'buttons',
          text: '想要查看詳細報告嗎？',
          actions: [
            {
              type: 'uri',
              label: '查看完整報告',
              uri: `https://your-app.com/reports/${report.id}`
            },
            {
              type: 'postback',
              label: '設定提醒',
              data: `action=set_reminder&report_id=${report.id}`
            }
          ]
        };
        
        await this.sendTemplateMessage(userId, template);
        result.recordsCreated++;
      } catch (error) {
        result.errors.push({
          type: 'NOTIFICATION_ERROR',
          message: this.getErrorMessage(error),
          recordId: report.id,
          retryable: true
        });
      }
    }
  }

  /**
   * 發送成就通知
   */
  private async sendAchievementNotifications(userId: string, achievements: Achievement[], result: SyncResult): Promise<void> {
    for (const achievement of achievements) {
      try {
        const message = `🎉 恭喜！您獲得了新成就：${achievement.name}\n\n${achievement.description}`;
        await this.sendTextMessage(userId, message);
        
        // 發送分享按鈕
        const template: LineTemplateContent = {
          type: 'buttons',
          text: '想要分享這個成就嗎？',
          actions: [
            {
              type: 'postback',
              label: '分享到動態',
              data: `action=share_achievement&achievement_id=${achievement.id}`
            },
            {
              type: 'uri',
              label: '查看所有成就',
              uri: 'https://your-app.com/achievements'
            }
          ]
        };
        
        await this.sendTemplateMessage(userId, template);
        result.recordsCreated++;
      } catch (error) {
        result.errors.push({
          type: 'NOTIFICATION_ERROR',
          message: this.getErrorMessage(error),
          recordId: achievement.id,
          retryable: true
        });
      }
    }
  }

  /**
   * 發送訊息的核心方法
   */
  private async sendMessage(userId: string, message: LineMessage): Promise<void> {
    const payload = {
      to: userId,
      messages: [this.formatLineMessage(message)]
    };

    await this.lineClient!.post('/message/push', payload);
  }

  /**
   * 格式化 Line 訊息
   */
  private formatLineMessage(message: LineMessage): any {
    switch (message.type) {
      case 'text':
        return {
          type: 'text',
          text: message.content as string
        };
      case 'template':
        const template = message.content as LineTemplateContent;
        return {
          type: 'template',
          altText: template.text,
          template: {
            type: template.type,
            text: template.text,
            actions: template.actions.map(action => ({
              type: action.type,
              label: action.label,
              data: action.data,
              uri: action.uri
            }))
          }
        };
      default:
        throw new Error(`不支援的訊息類型: ${message.type}`);
    }
  }

  /**
   * 格式化健康報告訊息
   */
  private formatHealthReportMessage(report: HealthReport): string {
    const startDate = report.period.start.toLocaleDateString('zh-TW');
    const endDate = report.period.end.toLocaleDateString('zh-TW');
    
    return `📊 您的健康週報已生成！

📅 報告期間：${startDate} - ${endDate}
🔥 平均每日熱量：${Math.round(report.nutritionSummary.avgDailyCalories)} 卡
📈 總熱量攝取：${Math.round(report.nutritionSummary.totalCalories)} 卡

💡 本週建議：
${report.recommendations.slice(0, 2).join('\n')}

繼續保持健康的生活方式！💪`;
  }

  /**
   * 處理 Line Bot 回調
   */
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      const events = webhookData.events || [];
      
      for (const event of events) {
        await this.processLineEvent(event);
      }
    } catch (error) {
      console.error('處理 Line Webhook 失敗:', error);
      throw this.formatError(error, 'Webhook 處理失敗');
    }
  }

  /**
   * 處理 Line 事件
   */
  private async processLineEvent(event: any): Promise<void> {
    const { type, source, postback, message } = event;
    const userId = source.userId;

    switch (type) {
      case 'postback':
        await this.handlePostback(userId, postback.data);
        break;
      case 'message':
        if (message.type === 'text') {
          await this.handleTextMessage(userId, message.text);
        }
        break;
      default:
        console.log(`未處理的事件類型: ${type}`);
    }
  }

  /**
   * 處理回傳資料
   */
  private async handlePostback(userId: string, data: string): Promise<void> {
    const params = new URLSearchParams(data);
    const action = params.get('action');

    switch (action) {
      case 'set_reminder':
        await this.sendTextMessage(userId, '提醒已設定！我們會在適當的時候提醒您查看健康報告。');
        break;
      case 'share_achievement':
        await this.sendTextMessage(userId, '成就已分享到您的動態！朋友們都能看到您的進步。');
        break;
      default:
        console.log(`未知的回傳動作: ${action}`);
    }
  }

  /**
   * 處理文字訊息
   */
  private async handleTextMessage(userId: string, text: string): Promise<void> {
    // 簡單的關鍵字回應
    if (text.includes('報告') || text.includes('健康')) {
      await this.sendTextMessage(userId, '您可以在應用程式中查看最新的健康報告，或者等待我們的週報通知！');
    } else if (text.includes('成就') || text.includes('獎勵')) {
      await this.sendTextMessage(userId, '繼續保持健康的習慣，您會獲得更多成就獎勵！');
    } else {
      await this.sendTextMessage(userId, '感謝您的訊息！如需協助，請在應用程式中使用 AI 聊天功能。');
    }
  }
}