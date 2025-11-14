import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import AWS from 'aws-sdk';
import winston from 'winston';
import { createLogger, format, transports } from 'winston';

// 請求監控介面
interface RequestMetrics {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  error?: string;
}

// AWS CloudWatch 設定
const cloudWatch = new AWS.CloudWatch({
  region: process.env.AWS_REGION || 'ap-northeast-1'
});

// Winston Logger 設定
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'health-nutrition-tracker-api' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// 記憶體中的指標儲存 (生產環境應使用 Redis 或資料庫)
const requestMetrics: RequestMetrics[] = [];
const MAX_METRICS_HISTORY = 1000; // 減少記憶體使用量
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 分鐘清理一次

// 請求監控中間件
export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  const metrics: RequestMetrics = {
    requestId: req.requestId || 'unknown',
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userId: req.user?.id,
    startTime
  };
  
  // 監聽回應完成事件
  res.on('finish', () => {
    const endTime = performance.now();
    metrics.endTime = endTime;
    metrics.duration = endTime - startTime;
    metrics.statusCode = res.statusCode;
    metrics.responseSize = parseInt(res.get('content-length') || '0');
    
    // 儲存指標
    requestMetrics.push(metrics);
    
    // 保持指標歷史在限制內
    if (requestMetrics.length > MAX_METRICS_HISTORY) {
      // 移除最舊的 20% 指標以避免頻繁操作
      const removeCount = Math.floor(MAX_METRICS_HISTORY * 0.2);
      requestMetrics.splice(0, removeCount);
    }
    
    // 記錄慢請求
    if (metrics.duration > 1000) { // 超過 1 秒
      logger.warn('慢請求警告', {
        method: metrics.method,
        url: metrics.url,
        duration: metrics.duration,
        requestId: metrics.requestId,
        userId: metrics.userId
      });
      
      // 發送 CloudWatch 指標
      sendCloudWatchMetric('SlowRequest', 1, 'Count');
    }
    
    // 記錄錯誤請求
    if (metrics.statusCode >= 400) {
      logger.error('錯誤請求', {
        method: metrics.method,
        url: metrics.url,
        statusCode: metrics.statusCode,
        requestId: metrics.requestId,
        userId: metrics.userId
      });
      
      // 發送 CloudWatch 指標
      sendCloudWatchMetric('ErrorRequest', 1, 'Count');
    }
    
    // 發送一般請求指標到 CloudWatch
    sendCloudWatchMetric('RequestCount', 1, 'Count');
    sendCloudWatchMetric('ResponseTime', metrics.duration, 'Milliseconds');
  });
  
  // 監聽錯誤事件
  res.on('error', (error) => {
    metrics.error = error.message;
    logger.error('請求錯誤', {
      method: metrics.method,
      url: metrics.url,
      error: error.message,
      requestId: metrics.requestId,
      userId: metrics.userId,
      stack: error.stack
    });
    
    // 發送 CloudWatch 指標
    sendCloudWatchMetric('RequestError', 1, 'Count');
  });
  
  next();
};

// CloudWatch 指標發送函數
async function sendCloudWatchMetric(metricName: string, value: number, unit: string) {
  // 只在生產環境且配置了 AWS 憑證時發送 CloudWatch 指標
  if (process.env.NODE_ENV !== 'production' || !process.env.AWS_ACCESS_KEY_ID) {
    return;
  }
  
  try {
    const params = {
      Namespace: 'HealthNutritionTracker/API',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date()
      }]
    };
    
    await cloudWatch.putMetricData(params).promise();
  } catch (error) {
    // 靜默失敗，不記錄錯誤以避免日誌污染
    if (process.env.DEBUG_CLOUDWATCH) {
      logger.error('CloudWatch 指標發送失敗', { 
        error: error instanceof Error ? error.message : String(error), 
        metricName, 
        value 
      });
    }
  }
}

// 批量 CloudWatch 指標發送
class CloudWatchBatcher {
  private static instance: CloudWatchBatcher;
  private metricQueue: AWS.CloudWatch.MetricDatum[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  
  static getInstance(): CloudWatchBatcher {
    if (!CloudWatchBatcher.instance) {
      CloudWatchBatcher.instance = new CloudWatchBatcher();
    }
    return CloudWatchBatcher.instance;
  }
  
  addMetric(metricName: string, value: number, unit: string, dimensions?: AWS.CloudWatch.Dimensions) {
    const metric: AWS.CloudWatch.MetricDatum = {
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date(),
      Dimensions: dimensions
    };
    
    this.metricQueue.push(metric);
    
    // 如果佇列達到 20 個指標或沒有計時器，則開始批量發送
    if (this.metricQueue.length >= 20 || !this.batchTimer) {
      this.scheduleBatch();
    }
  }
  
  private scheduleBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = setTimeout(() => {
      this.sendBatch();
    }, 5000); // 5 秒後發送批量
  }
  
  private async sendBatch() {
    // 只在生產環境且配置了 AWS 憑證時發送
    if (this.metricQueue.length === 0 || process.env.NODE_ENV !== 'production' || !process.env.AWS_ACCESS_KEY_ID) {
      this.metricQueue = []; // 清空隊列
      return;
    }
    
    const batch = this.metricQueue.splice(0, 20); // CloudWatch 限制每次最多 20 個指標
    
    try {
      const params = {
        Namespace: 'HealthNutritionTracker/API',
        MetricData: batch
      };
      
      await cloudWatch.putMetricData(params).promise();
      if (process.env.DEBUG_CLOUDWATCH) {
        logger.info('CloudWatch 批量指標發送成功', { count: batch.length });
      }
    } catch (error) {
      // 靜默失敗，不記錄錯誤以避免日誌污染
      if (process.env.DEBUG_CLOUDWATCH) {
        logger.error('CloudWatch 批量指標發送失敗', { 
          error: error instanceof Error ? error.message : String(error), 
          count: batch.length 
        });
      }
    }
    
    this.batchTimer = null;
    
    // 如果還有更多指標，繼續處理
    if (this.metricQueue.length > 0) {
      this.scheduleBatch();
    }
  }
}

// 系統健康狀態監控
export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  
  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }
  
  // 註冊健康檢查
  registerHealthCheck(name: string, check: () => Promise<boolean>) {
    this.healthChecks.set(name, check);
  }
  
  // 執行所有健康檢查
  async runHealthChecks(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const [name, check] of this.healthChecks) {
      try {
        results[name] = await check();
      } catch (error) {
        logger.error(`健康檢查失敗 ${name}`, { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        results[name] = false;
        
        // 發送健康檢查失敗指標
        const batcher = CloudWatchBatcher.getInstance();
        batcher.addMetric('HealthCheckFailure', 1, 'Count', [
          { Name: 'CheckName', Value: name }
        ]);
      }
    }
    
    return results;
  }
  
  // 獲取系統指標
  getSystemMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    const recentMetrics = requestMetrics.filter(m => 
      m.endTime && m.endTime > oneMinuteAgo
    );
    
    const fiveMinuteMetrics = requestMetrics.filter(m => 
      m.endTime && m.endTime > fiveMinutesAgo
    );
    
    return {
      requests: {
        total: requestMetrics.length,
        lastMinute: recentMetrics.length,
        lastFiveMinutes: fiveMinuteMetrics.length
      },
      performance: {
        averageResponseTime: this.calculateAverageResponseTime(recentMetrics),
        slowRequests: recentMetrics.filter(m => m.duration && m.duration > 1000).length
      },
      errors: {
        lastMinute: recentMetrics.filter(m => m.statusCode && m.statusCode >= 400).length,
        lastFiveMinutes: fiveMinuteMetrics.filter(m => m.statusCode && m.statusCode >= 400).length
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      uptime: process.uptime()
    };
  }
  
  private calculateAverageResponseTime(metrics: RequestMetrics[]): number {
    if (metrics.length === 0) return 0;
    
    const totalTime = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalTime / metrics.length;
  }
}

// API 指標端點中間件
export const metricsEndpoint = async (req: Request, res: Response) => {
  const healthMonitor = HealthMonitor.getInstance();
  const systemMetrics = healthMonitor.getSystemMetrics();
  const healthChecks = await healthMonitor.runHealthChecks();
  
  res.json({
    timestamp: new Date().toISOString(),
    service: 'health-nutrition-tracker-api',
    version: '1.0.0',
    health: healthChecks,
    metrics: systemMetrics,
    requestId: req.requestId
  });
};

// 錯誤追蹤中間件
export const errorTracking = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    userId: req.user?.id,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  };
  
  // 記錄錯誤到 Winston Logger
  logger.error('API 錯誤', errorInfo);
  
  // 發送錯誤指標到 CloudWatch
  const batcher = CloudWatchBatcher.getInstance();
  batcher.addMetric('APIError', 1, 'Count', [
    { Name: 'ErrorType', Value: error.name },
    { Name: 'Method', Value: req.method },
    { Name: 'StatusCode', Value: '500' }
  ]);
  
  // 發送錯誤回應
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      requestId: req.requestId
    }
  });
};

// 警報系統
export class AlertSystem {
  private static instance: AlertSystem;
  private alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }> = [];
  private readonly MAX_ALERTS = 1000; // 最多保留 1000 個警報
  
  static getInstance(): AlertSystem {
    if (!AlertSystem.instance) {
      AlertSystem.instance = new AlertSystem();
    }
    return AlertSystem.instance;
  }
  
  // 發送警報
  sendAlert(type: 'error' | 'warning' | 'info', message: string) {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // 保持警報數量在限制內
    if (this.alerts.length > this.MAX_ALERTS) {
      // 移除最舊的已解決警報
      const resolvedAlerts = this.alerts.filter(a => a.resolved);
      if (resolvedAlerts.length > 0) {
        const oldestResolved = resolvedAlerts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
        const index = this.alerts.findIndex(a => a.id === oldestResolved.id);
        if (index !== -1) {
          this.alerts.splice(index, 1);
        }
      } else {
        // 如果沒有已解決的警報，移除最舊的警報
        this.alerts.shift();
      }
    }
    
    // 記錄警報到 Winston Logger
    logger.log(type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'info', message, {
      alertId: alert.id,
      alertType: type
    });
    
    // 發送警報指標到 CloudWatch
    const batcher = CloudWatchBatcher.getInstance();
    batcher.addMetric('Alert', 1, 'Count', [
      { Name: 'AlertType', Value: type },
      { Name: 'Severity', Value: type === 'error' ? 'High' : type === 'warning' ? 'Medium' : 'Low' }
    ]);
    
    // 在生產環境中，這裡應該發送到 Slack、Email 或其他通知系統
    if (type === 'error') {
      this.notifyAdmins(alert);
    }
  }
  
  private async notifyAdmins(alert: any) {
    // 實作管理員通知邏輯
    logger.error('🚨 緊急警報', alert);
    
    // 發送 SNS 通知 (如果配置了)
    if (process.env.AWS_SNS_ALERT_TOPIC_ARN) {
      try {
        const sns = new AWS.SNS({ region: process.env.AWS_REGION || 'ap-northeast-1' });
        await sns.publish({
          TopicArn: process.env.AWS_SNS_ALERT_TOPIC_ARN,
          Message: JSON.stringify(alert, null, 2),
          Subject: `🚨 健康營養追蹤系統警報: ${alert.type.toUpperCase()}`
        }).promise();
      } catch (error) {
        logger.error('SNS 通知發送失敗', { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
    
    // 發送 CloudWatch 警報
    const batcher = CloudWatchBatcher.getInstance();
    batcher.addMetric('CriticalAlert', 1, 'Count', [
      { Name: 'AlertType', Value: alert.type }
    ]);
  }
  
  // 獲取未解決的警報
  getUnresolvedAlerts() {
    return this.alerts.filter(alert => !alert.resolved);
  }
  
  // 解決警報
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }
}

// 自動監控中間件
export const autoMonitoring = () => {
  const healthMonitor = HealthMonitor.getInstance();
  const alertSystem = AlertSystem.getInstance();
  const batcher = CloudWatchBatcher.getInstance();
  
  // 每分鐘檢查系統狀態
  setInterval(async () => {
    const metrics = healthMonitor.getSystemMetrics();
    
    // 發送系統指標到 CloudWatch
    batcher.addMetric('RequestsPerMinute', metrics.requests.lastMinute, 'Count');
    batcher.addMetric('AverageResponseTime', metrics.performance.averageResponseTime, 'Milliseconds');
    batcher.addMetric('ErrorRate', metrics.errors.lastMinute, 'Count');
    batcher.addMetric('MemoryUsed', metrics.memory.used, 'Bytes');
    batcher.addMetric('MemoryTotal', metrics.memory.total, 'Bytes');
    batcher.addMetric('SystemUptime', metrics.uptime, 'Seconds');
    
    // 檢查錯誤率
    if (metrics.errors.lastMinute > 10) {
      alertSystem.sendAlert('error', `高錯誤率: ${metrics.errors.lastMinute} 個錯誤在過去一分鐘`);
    }
    
    // 檢查回應時間
    if (metrics.performance.averageResponseTime > 2000) {
      alertSystem.sendAlert('warning', `回應時間過慢: 平均 ${metrics.performance.averageResponseTime.toFixed(2)}ms`);
    }
    
    // 檢查記憶體使用（只在明確啟用時）
    const memoryUsagePercent = (metrics.memory.used / metrics.memory.total) * 100;
    if (memoryUsagePercent > 95 && process.env.ENABLE_MEMORY_ALERTS === 'true') {
      alertSystem.sendAlert('warning', `記憶體使用率過高: ${memoryUsagePercent.toFixed(2)}%`);
    }
    
    // 檢查請求量異常
    if (metrics.requests.lastMinute > 1000) {
      alertSystem.sendAlert('warning', `請求量異常: ${metrics.requests.lastMinute} 個請求在過去一分鐘`);
    }
    
    // 檢查慢請求比例
    const slowRequestRatio = metrics.performance.slowRequests / Math.max(metrics.requests.lastMinute, 1);
    if (slowRequestRatio > 0.1) { // 超過 10% 的請求是慢請求
      alertSystem.sendAlert('warning', `慢請求比例過高: ${(slowRequestRatio * 100).toFixed(2)}%`);
    }
    
  }, 60 * 1000); // 每分鐘執行一次
  
  // 每 5 分鐘執行深度健康檢查
  setInterval(async () => {
    const healthChecks = await healthMonitor.runHealthChecks();
    const failedChecks = Object.entries(healthChecks).filter(([_, status]) => !status);
    
    if (failedChecks.length > 0) {
      const failedNames = failedChecks.map(([name]) => name).join(', ');
      alertSystem.sendAlert('error', `健康檢查失敗: ${failedNames}`);
    }
    
    // 發送健康檢查結果到 CloudWatch
    Object.entries(healthChecks).forEach(([name, status]) => {
      batcher.addMetric('HealthCheck', status ? 1 : 0, 'Count', [
        { Name: 'CheckName', Value: name }
      ]);
    });
    
  }, 5 * 60 * 1000); // 每 5 分鐘執行一次
  
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};

// 應用程式生命週期監控
export const applicationLifecycleMonitoring = () => {
  const batcher = CloudWatchBatcher.getInstance();
  
  // 應用程式啟動
  process.on('ready', () => {
    logger.info('應用程式啟動完成');
    batcher.addMetric('ApplicationStart', 1, 'Count');
  });
  
  // 優雅關閉
  process.on('SIGTERM', () => {
    logger.info('收到 SIGTERM 信號，開始優雅關閉');
    batcher.addMetric('ApplicationShutdown', 1, 'Count');
  });
  
  process.on('SIGINT', () => {
    logger.info('收到 SIGINT 信號，開始優雅關閉');
    batcher.addMetric('ApplicationShutdown', 1, 'Count');
  });
  
  // 未捕獲的異常
  process.on('uncaughtException', (error) => {
    logger.error('未捕獲的異常', { error: error.message, stack: error.stack });
    batcher.addMetric('UncaughtException', 1, 'Count');
    
    // 給一些時間讓日誌寫入
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
  
  // 未處理的 Promise 拒絕
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('未處理的 Promise 拒絕', { reason, promise });
    batcher.addMetric('UnhandledRejection', 1, 'Count');
  });
};

// 定期清理舊指標以防止記憶體洩漏
setInterval(() => {
  const cutoffTime = Date.now() - (30 * 60 * 1000); // 保留最近 30 分鐘的資料
  const initialLength = requestMetrics.length;
  
  // 移除超過 30 分鐘的指標
  let i = 0;
  while (i < requestMetrics.length) {
    if (requestMetrics[i].endTime && requestMetrics[i].endTime! < cutoffTime) {
      requestMetrics.splice(i, 1);
    } else {
      i++;
    }
  }
  
  const removedCount = initialLength - requestMetrics.length;
  if (removedCount > 0) {
    logger.debug(`清理了 ${removedCount} 個舊的請求指標`, {
      before: initialLength,
      after: requestMetrics.length,
      memoryUsage: process.memoryUsage()
    });
  }
}, CLEANUP_INTERVAL);

// 記憶體監控和警報
setInterval(() => {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  // 記錄記憶體使用情況
  logger.debug('記憶體使用情況', {
    heapUsed: `${heapUsedMB}MB`,
    heapTotal: `${heapTotalMB}MB`,
    usagePercent: `${usagePercent.toFixed(2)}%`,
    external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
    requestMetricsCount: requestMetrics.length
  });
  
  // 記憶體使用率過高警報（只在開發環境或明確啟用時）
  if (usagePercent > 95 && process.env.ENABLE_MEMORY_ALERTS === 'true') {
    const alertSystem = AlertSystem.getInstance();
    alertSystem.sendAlert('error', `記憶體使用率危險: ${usagePercent.toFixed(2)}% (${heapUsedMB}MB/${heapTotalMB}MB)`);
  }
  
  // 靜默清理指標（不記錄警告）
  if (usagePercent > 90 && requestMetrics.length > 100) {
    const removeCount = Math.floor(requestMetrics.length * 0.5);
    requestMetrics.splice(0, removeCount);
  }
  
  // 自動垃圾回收（不記錄日誌）
  if (usagePercent > 90 && global.gc) {
    global.gc();
  }
}, 60 * 1000); // 每分鐘檢查一次

// 匯出 logger 供其他模組使用
export { logger };