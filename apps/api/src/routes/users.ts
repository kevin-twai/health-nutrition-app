import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { requireAuth, requireOwnership, createUserRateLimit } from '../middleware/auth';
import { redis } from '../database/redis';

// 建立用戶管理路由
export function createUserRoutes(): Router {
  const router = Router();
  const userController = new UserController(redis);

  // 速率限制中介軟體
  const userRateLimit = createUserRateLimit(redis, 50, 15 * 60 * 1000); // 15分鐘內最多50次請求
  const updateRateLimit = createUserRateLimit(redis, 10, 60 * 1000); // 1分鐘內最多10次更新請求

  // 所有路由都需要認證
  router.use(requireAuth(redis));

  // 用戶檔案管理
  
  // GET /api/v1/users/me - 獲取當前用戶檔案
  router.get('/me', userRateLimit, userController.getProfile);

  // GET /api/v1/users/:userId - 獲取指定用戶檔案（需要擁有權限）
  router.get('/:userId', requireOwnership(redis), userRateLimit, userController.getProfile);

  // PUT /api/v1/users/me - 更新當前用戶檔案
  router.put('/me', updateRateLimit, userController.updateProfile);

  // PUT /api/v1/users/:userId - 更新指定用戶檔案（需要擁有權限）
  router.put('/:userId', requireOwnership(redis), updateRateLimit, userController.updateProfile);

  // DELETE /api/v1/users/me - 刪除當前用戶帳戶
  router.delete('/me', updateRateLimit, userController.deleteAccount);

  // DELETE /api/v1/users/:userId - 刪除指定用戶帳戶（需要擁有權限）
  router.delete('/:userId', requireOwnership(redis), updateRateLimit, userController.deleteAccount);

  // 用戶偏好設定管理
  
  // PUT /api/v1/users/me/preferences - 更新當前用戶偏好設定
  router.put('/me/preferences', updateRateLimit, userController.updatePreferences);

  // PUT /api/v1/users/:userId/preferences - 更新指定用戶偏好設定（需要擁有權限）
  router.put('/:userId/preferences', requireOwnership(redis), updateRateLimit, userController.updatePreferences);

  // 健康目標管理
  
  // GET /api/v1/users/me/health-goals - 獲取當前用戶健康目標
  router.get('/me/health-goals', userRateLimit, userController.getHealthGoals);

  // GET /api/v1/users/:userId/health-goals - 獲取指定用戶健康目標（需要擁有權限）
  router.get('/:userId/health-goals', requireOwnership(redis), userRateLimit, userController.getHealthGoals);

  // POST /api/v1/users/me/health-goals - 新增當前用戶健康目標
  router.post('/me/health-goals', updateRateLimit, userController.addHealthGoal);

  // POST /api/v1/users/:userId/health-goals - 新增指定用戶健康目標（需要擁有權限）
  router.post('/:userId/health-goals', requireOwnership(redis), updateRateLimit, userController.addHealthGoal);

  // PUT /api/v1/users/health-goals/:goalId - 更新健康目標
  router.put('/health-goals/:goalId', updateRateLimit, userController.updateHealthGoal);

  // DELETE /api/v1/users/health-goals/:goalId - 刪除健康目標
  router.delete('/health-goals/:goalId', updateRateLimit, userController.deleteHealthGoal);

  // 健康指標和統計
  
  // GET /api/v1/users/me/metrics - 獲取當前用戶健康指標
  router.get('/me/metrics', userRateLimit, userController.getHealthMetrics);

  // GET /api/v1/users/:userId/metrics - 獲取指定用戶健康指標（需要擁有權限）
  router.get('/:userId/metrics', requireOwnership(redis), userRateLimit, userController.getHealthMetrics);

  // GET /api/v1/users/me/stats - 獲取當前用戶統計資料
  router.get('/me/stats', userRateLimit, userController.getUserStats);

  // GET /api/v1/users/:userId/stats - 獲取指定用戶統計資料（需要擁有權限）
  router.get('/:userId/stats', requireOwnership(redis), userRateLimit, userController.getUserStats);

  return router;
}

export default createUserRoutes;