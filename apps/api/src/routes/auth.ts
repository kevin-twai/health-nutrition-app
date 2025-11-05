import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth, optionalAuth, createUserRateLimit } from '../middleware/auth';
import { redis } from '../database/redis';

// 建立認證路由
export function createAuthRoutes(): Router {
  const router = Router();
  const authController = new AuthController(redis);

  // 速率限制中介軟體
  const authRateLimit = createUserRateLimit(redis, 10, 15 * 60 * 1000); // 15分鐘內最多10次請求
  const generalRateLimit = createUserRateLimit(redis, 5, 60 * 1000); // 1分鐘內最多5次請求

  // 公開路由（不需要認證）
  
  // POST /api/v1/auth/register - 用戶註冊
  router.post('/register', generalRateLimit, authController.register);

  // POST /api/v1/auth/login - 用戶登入
  router.post('/login', authRateLimit, authController.login);

  // POST /api/v1/auth/refresh - 刷新令牌
  router.post('/refresh', authRateLimit, authController.refreshToken);

  // POST /api/v1/auth/forgot-password - 忘記密碼
  router.post('/forgot-password', generalRateLimit, authController.forgotPassword);

  // POST /api/v1/auth/reset-password - 重設密碼
  router.post('/reset-password', generalRateLimit, authController.resetPassword);

  // GET /api/v1/auth/verify-email/:token - 驗證電子郵件
  router.get('/verify-email/:token', authController.verifyEmail);

  // OAuth 路由（未來實作）
  
  // POST /api/v1/auth/google - Google OAuth 登入
  router.post('/google', authRateLimit, authController.googleAuth);

  // POST /api/v1/auth/facebook - Facebook OAuth 登入
  router.post('/facebook', authRateLimit, authController.facebookAuth);

  // POST /api/v1/auth/apple - Apple OAuth 登入
  router.post('/apple', authRateLimit, authController.appleAuth);

  // 需要認證的路由
  
  // POST /api/v1/auth/logout - 用戶登出
  router.post('/logout', requireAuth(redis), authController.logout);

  // GET /api/v1/auth/me - 獲取當前用戶資訊
  router.get('/me', requireAuth(redis), authController.getCurrentUser);

  // POST /api/v1/auth/change-password - 變更密碼
  router.post('/change-password', requireAuth(redis), generalRateLimit, authController.changePassword);

  // POST /api/v1/auth/send-verification - 發送電子郵件驗證
  router.post('/send-verification', requireAuth(redis), generalRateLimit, authController.sendEmailVerification);

  return router;
}

export default createAuthRoutes;