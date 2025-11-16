import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

export interface GatewayConfig {
  // 基本設定
  port: number;
  nodeEnv: string;
  
  // CORS 設定
  allowedOrigins: string[];
  
  // Rate Limiting 設定
  rateLimit: {
    auth: {
      windowMs: number;
      max: number;
    };
    photo: {
      windowMs: number;
      max: number;
    };
    general: {
      windowMs: number;
      max: number;
    };
  };
  
  // 安全設定
  security: {
    apiKeys: string[];
    ipWhitelist: string[];
    maxRequestSize: string;
  };
  
  // 監控設定
  monitoring: {
    metricsRetention: number;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
    };
  };
  
  // 負載均衡設定
  loadBalancer: {
    healthCheckInterval: number;
    maxRetries: number;
    retryDelay: number;
  };
}

// 預設配置
const defaultConfig: GatewayConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://health-tracker.local',
    'https://health-nutrition-web.onrender.com'
  ],
  
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 分鐘
      max: parseInt(process.env.AUTH_RATE_LIMIT || '5')
    },
    photo: {
      windowMs: 60 * 1000, // 1 分鐘
      max: parseInt(process.env.PHOTO_RATE_LIMIT || '10')
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 分鐘
      max: parseInt(process.env.GENERAL_RATE_LIMIT || '1000')
    }
  },
  
  security: {
    apiKeys: process.env.VALID_API_KEYS?.split(',') || [],
    ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10MB'
  },
  
  monitoring: {
    metricsRetention: parseInt(process.env.METRICS_RETENTION || '10000'),
    alertThresholds: {
      errorRate: parseInt(process.env.ERROR_RATE_THRESHOLD || '10'),
      responseTime: parseInt(process.env.RESPONSE_TIME_THRESHOLD || '2000'),
      memoryUsage: parseInt(process.env.MEMORY_USAGE_THRESHOLD || '80')
    }
  },
  
  loadBalancer: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000')
  }
};

// 驗證配置
function validateConfig(config: GatewayConfig): void {
  if (config.port < 1 || config.port > 65535) {
    throw new Error('Invalid port number');
  }
  
  if (config.rateLimit.auth.max < 1) {
    throw new Error('Auth rate limit must be at least 1');
  }
  
  if (config.monitoring.alertThresholds.errorRate < 0) {
    throw new Error('Error rate threshold must be non-negative');
  }
  
  if (config.monitoring.alertThresholds.responseTime < 0) {
    throw new Error('Response time threshold must be non-negative');
  }
  
  if (config.monitoring.alertThresholds.memoryUsage < 0 || config.monitoring.alertThresholds.memoryUsage > 100) {
    throw new Error('Memory usage threshold must be between 0 and 100');
  }
}

// 載入並驗證配置
export function loadGatewayConfig(): GatewayConfig {
  try {
    validateConfig(defaultConfig);
    return defaultConfig;
  } catch (error) {
    console.error('Gateway configuration error:', error);
    throw error;
  }
}

// 環境特定配置
export const isDevelopment = defaultConfig.nodeEnv === 'development';
export const isProduction = defaultConfig.nodeEnv === 'production';
export const isTest = defaultConfig.nodeEnv === 'test';

// 日誌配置
export const logConfig = {
  level: isDevelopment ? 'debug' : 'info',
  format: isDevelopment ? 'dev' : 'combined',
  enableConsole: true,
  enableFile: isProduction,
  maxFiles: 5,
  maxSize: '10m'
};

// 快取配置
export const cacheConfig = {
  defaultTTL: 300, // 5 分鐘
  checkPeriod: 600, // 10 分鐘
  maxKeys: 1000,
  useClones: false
};

// 資料庫連接池配置
export const dbPoolConfig = {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200
};

// 匯出主要配置
export const gatewayConfig = loadGatewayConfig();

// 配置摘要函數 (用於啟動時顯示)
export function getConfigSummary(): string {
  return `
🔧 API Gateway 配置摘要:
   - 環境: ${gatewayConfig.nodeEnv}
   - 埠號: ${gatewayConfig.port}
   - 允許來源: ${gatewayConfig.allowedOrigins.length} 個
   - 認證限制: ${gatewayConfig.rateLimit.auth.max} 次/15分鐘
   - 照片限制: ${gatewayConfig.rateLimit.photo.max} 次/分鐘
   - 一般限制: ${gatewayConfig.rateLimit.general.max} 次/15分鐘
   - API 金鑰: ${gatewayConfig.security.apiKeys.length > 0 ? '已啟用' : '未啟用'}
   - IP 白名單: ${gatewayConfig.security.ipWhitelist.length > 0 ? '已啟用' : '未啟用'}
   - 監控: 已啟用
   - 錯誤追蹤: 已啟用
  `;
}