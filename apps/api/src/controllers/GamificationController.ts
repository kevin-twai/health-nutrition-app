import { Request, Response } from 'express';
import { GamificationService } from '../services/GamificationService';
import { NotificationService } from '../services/NotificationService';
import { 
  ApiResponse, 
  UserProgress, 
  Task, 
  Achievement, 
  Badge,
  Leaderboard,
  LeaderboardType 
} from '@health-tracker/shared-types';

export class GamificationController {
  private gamificationService: GamificationService;
  private notificationService: NotificationService;

  constructor() {
    this.gamificationService = new GamificationService();
    this.notificationService = new NotificationService();
  }

  /**
   * 獲取用戶遊戲化進度
   */
  getUserProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const progress = await this.gamificationService.getUserProgress(userId);
      
      if (!progress) {
        res.status(404).json({
          success: false,
          error: { code: 'USER_PROGRESS_NOT_FOUND', message: '找不到用戶進度資料' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        data: progress,
        timestamp: new Date()
      } as ApiResponse<UserProgress>);
    } catch (error) {
      console.error('獲取用戶進度失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '獲取用戶進度失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取用戶任務
   */
  getUserTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const tasks = await this.gamificationService.generateUserTasks(userId);

      res.json({
        success: true,
        data: tasks,
        timestamp: new Date()
      } as ApiResponse<{
        dailyTasks: Task[];
        weeklyTasks: Task[];
        monthlyTasks: Task[];
      }>);
    } catch (error) {
      console.error('獲取用戶任務失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '獲取用戶任務失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 處理用戶行為
   */
  processUserAction = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { actionType, actionData } = req.body;
      
      if (!actionType) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: '缺少行為類型' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const result = await this.gamificationService.processUserAction(userId, actionType, actionData || {});

      // 發送相關通知
      if (result.achievementsUnlocked.length > 0) {
        for (const achievement of result.achievementsUnlocked) {
          await this.notificationService.sendAchievementNotification(userId, achievement);
        }
      }

      if (result.levelUp && result.newLevel) {
        await this.notificationService.sendLevelUpNotification(userId, result.newLevel, result.newLevel * 50);
      }

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      } as ApiResponse<typeof result>);
    } catch (error) {
      console.error('處理用戶行為失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '處理用戶行為失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 處理每日登入
   */
  processDailyLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const result = await this.gamificationService.processDailyLogin(userId);

      // 發送相關通知
      if (result.achievementsUnlocked.length > 0) {
        for (const achievement of result.achievementsUnlocked) {
          await this.notificationService.sendAchievementNotification(userId, achievement);
        }
      }

      if (result.streakDays > 1 && [7, 30, 100, 365].includes(result.streakDays)) {
        await this.notificationService.sendStreakMilestoneNotification(userId, result.streakDays);
      }

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      } as ApiResponse<typeof result>);
    } catch (error) {
      console.error('處理每日登入失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '處理每日登入失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取排行榜
   */
  getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { type, period = 'current', limit = 50 } = req.query;

      if (!type || !Object.values(LeaderboardType).includes(type as LeaderboardType)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: '無效的排行榜類型' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const leaderboard = await this.gamificationService.getLeaderboard(
        type as LeaderboardType,
        period as 'current' | 'previous',
        parseInt(limit as string),
        userId
      );

      res.json({
        success: true,
        data: leaderboard,
        timestamp: new Date()
      } as ApiResponse<Leaderboard>);
    } catch (error) {
      console.error('獲取排行榜失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '獲取排行榜失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取用戶統計
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const stats = await this.gamificationService.getUserStats(userId);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date()
      } as ApiResponse<typeof stats>);
    } catch (error) {
      console.error('獲取用戶統計失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '獲取用戶統計失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取用戶通知
   */
  getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { limit = 20, offset = 0 } = req.query;
      const notifications = await this.notificationService.getUserNotifications(
        userId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const unreadCount = await this.notificationService.getUnreadNotificationCount(userId);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount
        },
        timestamp: new Date()
      } as ApiResponse<{
        notifications: typeof notifications;
        unreadCount: number;
      }>);
    } catch (error) {
      console.error('獲取用戶通知失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '獲取用戶通知失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 標記通知為已讀
   */
  markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { notificationId } = req.params;
      const success = await this.notificationService.markNotificationAsRead(userId, notificationId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: { code: 'NOTIFICATION_NOT_FOUND', message: '找不到指定的通知' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        data: { message: '通知已標記為已讀' },
        timestamp: new Date()
      } as ApiResponse<{ message: string }>);
    } catch (error) {
      console.error('標記通知已讀失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '標記通知已讀失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 標記所有通知為已讀
   */
  markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const success = await this.notificationService.markAllNotificationsAsRead(userId);

      res.json({
        success: true,
        data: { message: success ? '所有通知已標記為已讀' : '沒有未讀通知' },
        timestamp: new Date()
      } as ApiResponse<{ message: string }>);
    } catch (error) {
      console.error('標記所有通知已讀失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '標記所有通知已讀失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 分享成就
   */
  shareAchievement = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { achievementId } = req.params;
      const { platform } = req.body;

      if (!platform || !['line', 'notion'].includes(platform)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: '無效的分享平台' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const success = await this.notificationService.shareAchievementToSocial(
        userId,
        achievementId,
        platform
      );

      if (!success) {
        res.status(404).json({
          success: false,
          error: { code: 'ACHIEVEMENT_NOT_FOUND', message: '找不到指定的成就或分享失敗' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      res.json({
        success: true,
        data: { message: '成就分享成功' },
        timestamp: new Date()
      } as ApiResponse<{ message: string }>);
    } catch (error) {
      console.error('分享成就失敗:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '分享成就失敗' },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };
}