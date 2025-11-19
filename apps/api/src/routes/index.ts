import { Express } from 'express';
import { apiGatewayConfig } from '../middleware/apiGateway';
import createAuthRoutes from './auth';

/**
 * 註冊所有路由
 * 這個函數應該在 MongoDB 和其他依賴初始化之後調用
 */
export async function registerRoutes(app: Express): Promise<void> {
  try {
    // 認證路由 (帶有嚴格的 Rate Limiting)
    console.log('註冊認證路由...');
    app.use('/api/v1/auth', 
      apiGatewayConfig.auth.rateLimit,
      apiGatewayConfig.auth.slowDown,
      createAuthRoutes()
    );

    // 用戶管理路由
    console.log('註冊用戶管理路由...');
    const createUserRoutes = (await import('./users')).default;
    app.use('/api/v1/users', 
      apiGatewayConfig.general.rateLimit,
      createUserRoutes()
    );

    // 照片上傳路由 (帶有特殊限制)
    console.log('註冊照片上傳路由...');
    const createPhotoRoutes = (await import('./photo')).default;
    app.use('/api/v1/photo', 
      apiGatewayConfig.photo.rateLimit,
      apiGatewayConfig.photo.sizeLimit,
      createPhotoRoutes()
    );

    // 遊戲化系統路由
    console.log('註冊遊戲化系統路由...');
    const gamificationRoutes = (await import('./gamification')).default;
    app.use('/api/v1/gamification', 
      apiGatewayConfig.general.rateLimit,
      gamificationRoutes
    );

    // 反饋系統路由
    console.log('註冊反饋系統路由...');
    const feedbackRoutes = (await import('./feedback')).default;
    app.use('/api/v1/feedback', 
      apiGatewayConfig.general.rateLimit,
      feedbackRoutes
    );

    // 報告系統路由
    console.log('註冊報告系統路由...');
    const reportsRoutes = (await import('./reports')).default;
    app.use('/api/v1/reports', 
      apiGatewayConfig.general.rateLimit,
      reportsRoutes
    );

    // 監控系統路由
    console.log('註冊監控系統路由...');
    const monitoringRoutes = (await import('./monitoring')).default;
    app.use('/api/v1/monitoring', 
      apiGatewayConfig.general.rateLimit,
      monitoringRoutes
    );

    // 食物識別監控路由
    console.log('註冊食物識別監控路由...');
    const foodRecognitionMonitoringRoutes = (await import('./food-recognition-monitoring')).default;
    app.use('/api/v1/food-recognition/monitoring', 
      apiGatewayConfig.general.rateLimit,
      foodRecognitionMonitoringRoutes
    );

    // 成分調整路由
    console.log('註冊成分調整路由...');
    const componentAdjustmentRoutes = (await import('./component-adjustment')).default;
    app.use('/api/v1/component-adjustment', 
      apiGatewayConfig.general.rateLimit,
      componentAdjustmentRoutes()
    );

    // 識別一致性監控路由
    console.log('註冊識別一致性監控路由...');
    const recognitionMonitoringRoutes = (await import('./recognition-monitoring')).default;
    app.use('/api/v1/recognition-monitoring', 
      apiGatewayConfig.general.rateLimit,
      recognitionMonitoringRoutes
    );
    
    console.log('✅ 所有路由註冊完成');
  } catch (error) {
    console.error('❌ 路由註冊失敗:', error);
    throw error;
  }
}
