import { Router } from 'express';
import { GamificationController } from '../controllers/GamificationController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const gamificationController = new GamificationController();

// 所有遊戲化路由都需要認證
router.use(requireAuth());

/**
 * @route GET /api/gamification/progress
 * @desc 獲取用戶遊戲化進度
 * @access Private
 */
router.get('/progress', gamificationController.getUserProgress);

/**
 * @route GET /api/gamification/tasks
 * @desc 獲取用戶任務
 * @access Private
 */
router.get('/tasks', gamificationController.getUserTasks);

/**
 * @route POST /api/gamification/action
 * @desc 處理用戶行為
 * @access Private
 * @body {
 *   actionType: string,
 *   actionData?: Record<string, any>
 * }
 */
router.post('/action', gamificationController.processUserAction);

/**
 * @route POST /api/gamification/daily-login
 * @desc 處理每日登入
 * @access Private
 */
router.post('/daily-login', gamificationController.processDailyLogin);

/**
 * @route GET /api/gamification/leaderboard
 * @desc 獲取排行榜
 * @access Private
 * @query {
 *   type: LeaderboardType,
 *   period?: 'current' | 'previous',
 *   limit?: number
 * }
 */
router.get('/leaderboard', gamificationController.getLeaderboard);

/**
 * @route GET /api/gamification/stats
 * @desc 獲取用戶統計
 * @access Private
 */
router.get('/stats', gamificationController.getUserStats);

/**
 * @route GET /api/gamification/notifications
 * @desc 獲取用戶通知
 * @access Private
 * @query {
 *   limit?: number,
 *   offset?: number
 * }
 */
router.get('/notifications', gamificationController.getUserNotifications);

/**
 * @route PUT /api/gamification/notifications/:notificationId/read
 * @desc 標記通知為已讀
 * @access Private
 */
router.put('/notifications/:notificationId/read', gamificationController.markNotificationAsRead);

/**
 * @route PUT /api/gamification/notifications/read-all
 * @desc 標記所有通知為已讀
 * @access Private
 */
router.put('/notifications/read-all', gamificationController.markAllNotificationsAsRead);

/**
 * @route POST /api/gamification/achievements/:achievementId/share
 * @desc 分享成就
 * @access Private
 * @body {
 *   platform: 'line' | 'notion'
 * }
 */
router.post('/achievements/:achievementId/share', gamificationController.shareAchievement);

export default router;