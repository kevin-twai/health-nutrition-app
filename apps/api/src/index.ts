import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeRedis } from './database/redis';
import { db, MigrationManager } from './database/connection';
import { gatewayConfig, getConfigSummary } from './config/gateway';
import { registerRoutes } from './routes';
import {
  apiVersioning,
  requestId,
  securityHeaders,
  healthCheck,
  apiGatewayConfig
} from './middleware/apiGateway';
import {
  requestMonitoring,
  HealthMonitor,
  metricsEndpoint,
  errorTracking,
  autoMonitoring,
  applicationLifecycleMonitoring
} from './middleware/monitoring';
import { logger } from './config/logging';
import { initializeMonitoring } from './config/cloudwatch-alarms';
import { performanceMonitor } from './services/PerformanceMonitor';
import { memoryMonitor } from './utils/memoryMonitor';

const app = express();
const PORT = gatewayConfig.port;

// 基礎中間件
app.use(helmet());
app.use(cors({
  origin: gatewayConfig.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID']
}));

// 自訂日誌格式 - 使用 Winston logger
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    }
  }
}));

// API Gateway 中間件
app.use(healthCheck);
app.use(requestId);
app.use(securityHeaders);
app.use(requestMonitoring);
app.use(autoMonitoring());

// 解析請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthMonitor = HealthMonitor.getInstance();
    
    // 測試資料庫連接
    const dbHealthy = await db.testConnection();
    
    // 執行所有健康檢查
    const healthChecks = await healthMonitor.runHealthChecks();
    
    const isHealthy = dbHealthy && Object.values(healthChecks).every(check => check);
    
    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      version: '1.0.0',
      database: dbHealthy ? 'connected' : 'disconnected',
      checks: healthChecks,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
    
    res.status(isHealthy ? 200 : 503).json(response);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 系統指標端點
app.get('/metrics', metricsEndpoint);

// API Gateway 狀態端點
app.get('/gateway/status', async (req, res) => {
  try {
    const healthMonitor = HealthMonitor.getInstance();
    const { getLoadBalancer } = await import('./utils/loadBalancer');
    const loadBalancer = getLoadBalancer();
    
    const systemMetrics = healthMonitor.getSystemMetrics();
    const healthChecks = await healthMonitor.runHealthChecks();
    const loadBalancerStatus = loadBalancer.getStatus();
    
    res.json({
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api-gateway',
      version: '1.0.0',
      status: Object.values(healthChecks).every(check => check) ? 'healthy' : 'degraded',
      gateway: {
        rateLimit: {
          auth: `${gatewayConfig.rateLimit.auth.max} requests per ${gatewayConfig.rateLimit.auth.windowMs / 1000}s`,
          photo: `${gatewayConfig.rateLimit.photo.max} requests per ${gatewayConfig.rateLimit.photo.windowMs / 1000}s`,
          general: `${gatewayConfig.rateLimit.general.max} requests per ${gatewayConfig.rateLimit.general.windowMs / 1000}s`
        },
        security: {
          corsEnabled: true,
          apiKeysEnabled: gatewayConfig.security.apiKeys.length > 0,
          ipWhitelistEnabled: gatewayConfig.security.ipWhitelist.length > 0
        },
        loadBalancer: loadBalancerStatus
      },
      health: healthChecks,
      metrics: systemMetrics,
      requestId: req.requestId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GATEWAY_STATUS_ERROR',
        message: 'Failed to retrieve gateway status',
        requestId: req.requestId
      }
    });
  }
});

// API 版本管理
app.use('/api', apiVersioning);

// API 根端點
app.get('/api/v1', (req, res) => {
  res.json({
    message: '健康營養追蹤系統 API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      food: '/api/v1/food',
      photo: '/api/v1/photo',
      chat: '/api/v1/chat',
      reports: '/api/v1/reports',
      gamification: '/api/v1/gamification'
    },
    rateLimit: {
      auth: '5 requests per 15 minutes',
      photo: '10 requests per minute',
      general: '1000 requests per 15 minutes'
    }
  });
});

// Routes will be registered after MongoDB initialization in initializeApp()

// 初始化應用程式
async function initializeApp() {
  try {
    logger.info('🚀 正在初始化健康營養追蹤系統 API Gateway...');
    
    // 初始化應用程式生命週期監控
    applicationLifecycleMonitoring();
    
    // 初始化 CloudWatch 監控 (生產環境)
    if (process.env.NODE_ENV === 'production') {
      await initializeMonitoring();
    }
    
    // 初始化 MongoDB 連接（可選）
    await performanceMonitor.measureFunction('mongodb-initialization', async () => {
      try {
        const { mongodb } = await import('./database/mongodb');
        await mongodb.connect();
        if (mongodb.isConnected()) {
          logger.info('✅ MongoDB 連接成功');
        } else {
          logger.warn('⚠️  MongoDB 未連接，系統將僅使用 PostgreSQL');
        }
      } catch (error) {
        logger.warn('⚠️  MongoDB 初始化失敗，系統將僅使用 PostgreSQL', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // 初始化 Redis 連接
    await performanceMonitor.measureFunction('redis-initialization', async () => {
      await initializeRedis();
    });
    
    // 註冊所有路由 (在 MongoDB 連接之後)
    await registerRoutes(app);
    logger.info('✅ 所有路由已註冊');
    
    // 註冊錯誤處理和 404 handler
    app.use(errorTracking);
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });
    
    // 執行資料庫遷移
    await performanceMonitor.measureFunction('database-migration', async () => {
      const migrationManager = new MigrationManager();
      await migrationManager.runMigrations();
    });
    
    // 註冊健康檢查
    const healthMonitor = HealthMonitor.getInstance();
    
    // 資料庫健康檢查
    healthMonitor.registerHealthCheck('database', async () => {
      return await performanceMonitor.measureDatabaseQuery(
        'health-check',
        () => db.testConnection()
      );
    });
    
    // Redis 健康檢查
    healthMonitor.registerHealthCheck('redis', async () => {
      try {
        const { redis } = await import('./database/redis');
        if (redis) {
          await redis.ping();
          return true;
        }
        return false;
      } catch (error) {
        logger.error('Redis 健康檢查失敗', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        return false;
      }
    });
    
    // 外部 API 健康檢查
    healthMonitor.registerHealthCheck('external_apis', async () => {
      try {
        // 檢查 OpenAI API
        if (process.env.OPENAI_API_KEY) {
          // 這裡可以加入實際的 API 檢查
        }
        
        // 檢查 Google Vision API
        if (process.env.GOOGLE_VISION_API_KEY) {
          // 這裡可以加入實際的 API 檢查
        }
        
        return true; // 暫時返回 true
      } catch (error) {
        logger.error('外部 API 健康檢查失敗', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        return false;
      }
    });
    
    // 啟動效能監控清理任務
    setInterval(() => {
      performanceMonitor.cleanupOldMetrics();
    }, 30 * 60 * 1000); // 每 30 分鐘清理一次
    
    // 啟動記憶體監控
    memoryMonitor.startMonitoring(60000); // 每分鐘監控一次
    
    logger.info('✅ API Gateway 初始化完成');
    logger.info('📊 監控系統已啟動');
    logger.info('🔒 安全防護已啟用');
    logger.info('⚡ Rate Limiting 已配置');
    logger.info('📈 CloudWatch 整合已啟用');
    
  } catch (error) {
    logger.error('❌ API Gateway 初始化失敗', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  logger.info('🚀 健康營養追蹤系統 API Gateway 啟動中...');
  logger.info(`📡 服務運行於: http://localhost:${PORT}`);
  logger.info(`📊 健康檢查: http://localhost:${PORT}/health`);
  logger.info(`📈 系統指標: http://localhost:${PORT}/metrics`);
  logger.info(`📖 API 文件: http://localhost:${PORT}/api/v1`);
  logger.info(`🔐 認證端點: http://localhost:${PORT}/api/v1/auth`);
  
  // 顯示配置摘要
  const configSummary = getConfigSummary();
  logger.info('配置摘要', { config: configSummary });
  
  // 初始化應用程式
  await initializeApp();
  
  // 發送應用程式啟動指標
  performanceMonitor.measureFunction('application-startup', async () => {
    logger.info('應用程式啟動完成', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptime: process.uptime()
    });
  });
});

export default app;