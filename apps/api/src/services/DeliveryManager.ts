import nodemailer from 'nodemailer';
import { 
  HealthReport, 
  DeliveryMethod, 
  ReportSettings 
} from '../types/shared';
import { ReportTemplateFactory } from './ReportTemplate';

/**
 * 發送結果介面
 */
export interface DeliveryResult {
  method: DeliveryMethod;
  success: boolean;
  message: string;
  timestamp: Date;
}

/**
 * 電子郵件配置介面
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * 推播通知配置介面
 */
export interface PushNotificationConfig {
  apiKey: string;
  endpoint: string;
}

/**
 * 報告發送管理器
 * 負責將生成的報告透過各種管道發送給用戶
 */
export class DeliveryManager {
  private emailTransporter?: nodemailer.Transporter;
  private emailConfig?: EmailConfig;
  private pushConfig?: PushNotificationConfig;

  constructor(
    emailConfig?: EmailConfig,
    pushConfig?: PushNotificationConfig
  ) {
    this.emailConfig = emailConfig;
    this.pushConfig = pushConfig;
    
    if (emailConfig) {
      this.initializeEmailTransporter();
    }
  }

  /**
   * 初始化電子郵件傳輸器
   */
  private initializeEmailTransporter(): void {
    if (!this.emailConfig) return;

    this.emailTransporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: this.emailConfig.secure,
      auth: this.emailConfig.auth
    });

    console.log('電子郵件傳輸器已初始化');
  }

  /**
   * 發送報告到指定的管道
   */
  async deliverReport(
    report: HealthReport,
    deliveryMethods: DeliveryMethod[]
  ): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    for (const method of deliveryMethods) {
      try {
        let result: DeliveryResult;

        switch (method) {
          case DeliveryMethod.EMAIL:
            result = await this.sendEmailReport(report);
            break;
          case DeliveryMethod.IN_APP:
            result = await this.sendInAppNotification(report);
            break;
          case DeliveryMethod.PUSH_NOTIFICATION:
            result = await this.sendPushNotification(report);
            break;
          case DeliveryMethod.THIRD_PARTY:
            result = await this.sendToThirdParty(report);
            break;
          default:
            result = {
              method,
              success: false,
              message: `不支援的發送方式: ${method}`,
              timestamp: new Date()
            };
        }

        results.push(result);
      } catch (error) {
        results.push({
          method,
          success: false,
          message: `發送失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  /**
   * 發送電子郵件報告
   */
  private async sendEmailReport(report: HealthReport): Promise<DeliveryResult> {
    if (!this.emailTransporter || !this.emailConfig) {
      return {
        method: DeliveryMethod.EMAIL,
        success: false,
        message: '電子郵件服務未配置',
        timestamp: new Date()
      };
    }

    try {
      // 獲取用戶電子郵件地址（這裡需要從用戶資料庫獲取）
      const userEmail = await this.getUserEmail(report.userId);
      if (!userEmail) {
        return {
          method: DeliveryMethod.EMAIL,
          success: false,
          message: '無法獲取用戶電子郵件地址',
          timestamp: new Date()
        };
      }

      // 生成 HTML 內容
      const template = ReportTemplateFactory.createTemplate(
        'weekly' as any, // 簡化處理
        {
          frequency: 'weekly' as any,
          includeCharts: true,
          includeTrends: true,
          includeRecommendations: true,
          deliveryMethod: [DeliveryMethod.EMAIL],
          customSections: []
        }
      );

      const htmlContent = await template.formatAsHTML(report);
      const pdfBuffer = await template.formatAsPDF(report);

      // 發送郵件
      const mailOptions = {
        from: this.emailConfig.from,
        to: userEmail,
        subject: this.getEmailSubject(report),
        html: htmlContent,
        attachments: [
          {
            filename: `健康報告_${report.period.start.toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await this.emailTransporter.sendMail(mailOptions);

      return {
        method: DeliveryMethod.EMAIL,
        success: true,
        message: `郵件已發送，訊息ID: ${info.messageId}`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        method: DeliveryMethod.EMAIL,
        success: false,
        message: `郵件發送失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * 發送應用內通知
   */
  private async sendInAppNotification(report: HealthReport): Promise<DeliveryResult> {
    try {
      // 這裡應該將通知儲存到資料庫或發送到 WebSocket
      // 暫時模擬成功發送
      
      const notification = {
        userId: report.userId,
        type: 'health_report',
        title: '您的健康報告已準備就緒',
        message: this.getNotificationMessage(report),
        data: {
          reportId: report.id,
          period: report.period
        },
        createdAt: new Date(),
        read: false
      };

      // 這裡應該儲存到通知資料庫
      console.log('應用內通知已建立:', notification);

      return {
        method: DeliveryMethod.IN_APP,
        success: true,
        message: '應用內通知已發送',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        method: DeliveryMethod.IN_APP,
        success: false,
        message: `應用內通知發送失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * 發送推播通知
   */
  private async sendPushNotification(report: HealthReport): Promise<DeliveryResult> {
    if (!this.pushConfig) {
      return {
        method: DeliveryMethod.PUSH_NOTIFICATION,
        success: false,
        message: '推播通知服務未配置',
        timestamp: new Date()
      };
    }

    try {
      // 這裡應該整合推播通知服務（如 Firebase Cloud Messaging）
      // 暫時模擬發送
      
      const pushPayload = {
        title: '健康報告已準備就緒',
        body: this.getNotificationMessage(report),
        data: {
          reportId: report.id,
          type: 'health_report'
        }
      };

      console.log('推播通知已發送:', pushPayload);

      return {
        method: DeliveryMethod.PUSH_NOTIFICATION,
        success: true,
        message: '推播通知已發送',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        method: DeliveryMethod.PUSH_NOTIFICATION,
        success: false,
        message: `推播通知發送失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * 發送到第三方平台
   */
  private async sendToThirdParty(report: HealthReport): Promise<DeliveryResult> {
    try {
      // 這裡可以整合 Notion、Line 等第三方平台
      // 暫時模擬發送
      
      console.log('報告已發送到第三方平台:', {
        reportId: report.id,
        userId: report.userId,
        period: report.period
      });

      return {
        method: DeliveryMethod.THIRD_PARTY,
        success: true,
        message: '已發送到第三方平台',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        method: DeliveryMethod.THIRD_PARTY,
        success: false,
        message: `第三方平台發送失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * 批量發送報告
   */
  async deliverReportsBatch(
    reports: HealthReport[],
    deliveryMethods: DeliveryMethod[]
  ): Promise<Map<string, DeliveryResult[]>> {
    const results = new Map<string, DeliveryResult[]>();

    for (const report of reports) {
      const reportResults = await this.deliverReport(report, deliveryMethods);
      results.set(report.id, reportResults);
    }

    return results;
  }

  /**
   * 重試失敗的發送
   */
  async retryFailedDelivery(
    report: HealthReport,
    failedMethods: DeliveryMethod[]
  ): Promise<DeliveryResult[]> {
    console.log(`重試發送報告 ${report.id} 到失敗的管道:`, failedMethods);
    return await this.deliverReport(report, failedMethods);
  }

  /**
   * 獲取用戶電子郵件地址
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    // 這裡應該從用戶資料庫獲取電子郵件地址
    // 暫時返回模擬的電子郵件
    return `user_${userId}@example.com`;
  }

  /**
   * 生成電子郵件主旨
   */
  private getEmailSubject(report: HealthReport): string {
    const startDate = report.period.start.toLocaleDateString('zh-TW');
    const endDate = report.period.end.toLocaleDateString('zh-TW');
    
    if (report.id.includes('weekly')) {
      return `您的週度健康報告 (${startDate} - ${endDate})`;
    } else if (report.id.includes('monthly')) {
      return `您的月度健康報告 (${startDate} - ${endDate})`;
    } else {
      return `您的健康報告 (${startDate} - ${endDate})`;
    }
  }

  /**
   * 生成通知訊息
   */
  private getNotificationMessage(report: HealthReport): string {
    const startDate = report.period.start.toLocaleDateString('zh-TW');
    const endDate = report.period.end.toLocaleDateString('zh-TW');
    
    return `您的健康報告已生成完成！期間：${startDate} - ${endDate}。點擊查看詳細分析和個人化建議。`;
  }

  /**
   * 測試電子郵件連接
   */
  async testEmailConnection(): Promise<boolean> {
    if (!this.emailTransporter) {
      console.log('電子郵件傳輸器未初始化');
      return false;
    }

    try {
      await this.emailTransporter.verify();
      console.log('電子郵件連接測試成功');
      return true;
    } catch (error) {
      console.error('電子郵件連接測試失敗:', error);
      return false;
    }
  }

  /**
   * 獲取發送統計
   */
  getDeliveryStats(): {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    deliveriesByMethod: Record<DeliveryMethod, number>;
  } {
    // 這裡應該從資料庫或快取中獲取統計資料
    // 暫時返回模擬資料
    return {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      deliveriesByMethod: {
        [DeliveryMethod.EMAIL]: 0,
        [DeliveryMethod.IN_APP]: 0,
        [DeliveryMethod.PUSH_NOTIFICATION]: 0,
        [DeliveryMethod.THIRD_PARTY]: 0
      }
    };
  }

  /**
   * 更新電子郵件配置
   */
  updateEmailConfig(config: EmailConfig): void {
    this.emailConfig = config;
    this.initializeEmailTransporter();
  }

  /**
   * 更新推播通知配置
   */
  updatePushConfig(config: PushNotificationConfig): void {
    this.pushConfig = config;
  }
}