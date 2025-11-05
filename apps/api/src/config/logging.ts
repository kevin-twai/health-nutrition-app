import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// 日誌目錄
const logDir = path.join(process.cwd(), 'logs');

// 自訂日誌格式
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, service, requestId, userId, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]`;
    
    if (service) logMessage += ` [${service}]`;
    if (requestId) logMessage += ` [${requestId}]`;
    if (userId) logMessage += ` [User:${userId}]`;
    
    logMessage += `: ${message}`;
    
    // 如果有額外的 metadata，加入到日誌中
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// 建立主要的 logger
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { 
    service: 'health-nutrition-tracker-api',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // 錯誤日誌 - 每日輪轉
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      )
    }),
    
    // 一般日誌 - 每日輪轉
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
    
    // 存取日誌 - 每日輪轉
    new DailyRotateFile({
      filename: path.join(logDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '7d',
      level: 'http',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    })
  ]
});

// 開發環境加入 console 輸出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: customFormat,
    level: 'debug'
  }));
}

// 效能日誌 logger
export const performanceLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { 
    service: 'health-nutrition-tracker-api',
    type: 'performance'
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '7d'
    })
  ]
});

// 安全日誌 logger
export const securityLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { 
    service: 'health-nutrition-tracker-api',
    type: 'security'
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '30d'
    })
  ]
});

// 審計日誌 logger
export const auditLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { 
    service: 'health-nutrition-tracker-api',
    type: 'audit'
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '90d' // 審計日誌保留更久
    })
  ]
});

// 日誌工具函數
export const logUtils = {
  // 記錄 API 請求
  logRequest: (req: any, res: any, duration: number) => {
    logger.http('API 請求', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: req.user?.id,
      requestId: req.requestId
    });
  },
  
  // 記錄效能指標
  logPerformance: (operation: string, duration: number, metadata?: any) => {
    performanceLogger.info('效能指標', {
      operation,
      duration,
      ...metadata
    });
  },
  
  // 記錄安全事件
  logSecurity: (event: string, details: any) => {
    securityLogger.warn('安全事件', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  },
  
  // 記錄審計事件
  logAudit: (action: string, userId: string, resource: string, details?: any) => {
    auditLogger.info('審計事件', {
      action,
      userId,
      resource,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
};

// 確保日誌目錄存在
import fs from 'fs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}