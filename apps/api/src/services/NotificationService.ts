import { Pool } from 'pg';
import { db } from '../database/connection';
import { redis } from '../database/redis';
import { 
  Achievement, 
  Badge,
  Task,
  UserProgress 
} from '@health-tracker/shared-types';

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  BADGE_EARNED = 'badge_earned',
  TASK_COMPLETED = 'task_completed',
  LEVEL_UP = 'level_up',
  STREAK_MILESTONE = 'streak_milestone',
  LEADERBOARD_RANK = 'leaderboard_rank',
  DAILY_REMINDER = 'daily_reminder',
  WEEKLY_SUMMARY = 'weekly_summary'
}

export class NotificationService {
  private db: Pool;
  private redis: any;

  constructor() {
    this.db = db.getPool();
    this.redis = redis;
  }

  /**
   * 發送成就解鎖通知
   */
  async sendAchievementNotification(userId: string, achievement: Achievement): Promise<void> {
    try {
      const notification: Omit<NotificationData, 'id' | 'createdAt'> = {
        userId,
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        title: '🎉 恭喜獲得成就！',
        message: `您已解鎖「${achievement.name}」成就！獲得 ${achievement.points} 積分獎勵。`,
        data: {
          achievementId: achievement.id,
          achievementName: achievement.name,
          points: achievement.points,
          rarity: achievement.rarity,
          icon: achievement.icon
        },
        isRead: false
      };

      await this.createNotification(notification);
      
      // 發送即時通知
      await this.sendRealTimeNotification(userId, notification);
      
      // 檢查是否需要分享到社群
      await this.checkAndShareAchievement(userId, achievement);
    } catch (error) {
      console.error('發送成就通知失敗:', error);
    }
  }

  /**
   * 發送徽章獲得通知
   */
  async sendBadgeNotification(userId: string, badge: Badge): Promise<void> {
    try {
      const notification: Omit<NotificationData, 'id' | 'createdAt'> = {
        userId,
        type: NotificationType.BADGE_EARNED,
        title: '🏆 獲得新徽章！',
        message: `您已獲得「${badge.name}」徽章！`,
        data: {
          badgeId: badge.id,
          badgeName: badge.name,
          icon: badge.icon,
          color: badge.color
        },
        isRead: false
      };

      await this.createNotification(notification);
      await this.sendRealTimeNotification(userId, notification);
    } catch (error) {
      console.error('發送徽章通知失敗:', error);
    }
  }

  /**
   * 發送任務完成通知
   */
  async sendTaskCompletionNotification(userId: string, task: Task): Promise<void> {
    try {
      const notification: Omit<NotificationData, 'id' | 'createdAt'> = {
        userId,
        type: NotificationType.TASK_COMPLETED,
        title: '✅ 任務完成！',
        message: `恭喜完成「${task.title}」任務！獲得 ${task.points} 積分。`,
        data: {
          taskId: task.id,
          taskTitle: task.title,
          points: task.points,
          taskType: task.type
        },
        isRead: false
      };

      await this.createNotification(notification);
      await this.sendRealTimeNotification(userId, notification);
    } catch (error) {
      console.error('發送任務完成通知失敗:', error);
    }
  }

  /**
   * 發送等級提升通知
   */
  async sendLevelUpNotification(userId: string, newLevel: number, bonusPoints: number): Promise<void> {
    try {
      const notification: Omit<NotificationData, 'id' | 'createdAt'> = {
        userId,
        type: NotificationType.LEVEL_UP,
        title: '🚀 等級提升！',
        message: `恭喜升級到 ${newLevel} 級！獲得 ${bonusPoints} 積分獎勵。`,
        data: {
          newLevel,
          bonusPoints
        },
        isRead: false
      };

      await this.createNotification(notification);
      await this.sendRealTimeNotification(userId, notification);
    } catch (error) {
      console.error('發送等級提升通知失敗:', error);
    }
  }

  /**
   * 發送連續登入里程碑通知
   */
  async sendStreakMilestoneNotification(userId: string, streakDays: number): Promise<void> {
    try {
      const milestones = [7, 30, 100, 365];
      if (!milestones.includes(streakDays)) return;

      let title = '';
      let emoji = '';
      
      switch (streakDays) {
        case 7:
          title = '一週連續登入';
          emoji = '🔥';
          break;
        case 30:
          title = '一個月連續登入';
          emoji = '💪';
          break;
        case 100:
          title = '百日連續登入';
          emoji = '🏆';
          break;
        case 365:
          title = '一年連續登入';
          emoji = '👑';
          break;
      }

      const notification: Omit<NotificationData, 'id' | 'createdAt'> = {
        userId,
        type: NotificationType.STREAK_MILESTONE,
        title: `${emoji} ${title}達成！`,
        message: `太棒了！您已經連續登入 ${streakDays} 天，堅持就是勝利！`,
        data: {
          streakDays,
          milestone: title
        },
        isRead: false
      };

      await this.createNotification(notification);
      await this.sendRealTimeNotification(userId, notification);
    } catch (error) {
      console.error('發送連續登入通知失敗:', error);
    }
  }

  /**
   * 發送排行榜排名通知
   */
  async sendLeaderboardNotification(userId: string, leaderboardType: string, rank: number, period: string): Promise<void> {
    try {
      if (rank > 10) return; // 只通知前10名

      let typeText = '';
      switch (leaderboardType) {
        case 'weekly_points':
          typeText = '週積分';
          break;
        case 'monthly_points':
          typeText = '月積分';
          break;
        case 'streak_days':
          typeText = '連續登入';
          break;
        case 'completed_tasks':
          typeText = '任務完成';
          break;
        default:
          typeText = '總積分';
      }

      const notification: Omit<NotificationData, 'id' | 'createdAt'> = {
        userId,
        type: NotificationType.LEADERBOARD_RANK,
        title: '🏅 排行榜佳績！',
        message: `您在${typeText}排行榜中排名第 ${rank} 名！繼續加油！`,
        data: {
          leaderboardType,
          rank,
          period
        },
        isRead: false
      };

      await this.createNotification(notification);
      await this.sendRealTimeNotification(userId, notification);
    } catch (error) {
      console.error('發送排行榜通知失敗:', error);
    }
  }

  /**
   * 發送每日提醒通知
   */
  async sendDailyReminder(userId: string): Promise<void> {
    try {
      // 檢查用戶通知偏好
      const preferences = await this.getUserNotificationPreferences(userId);
      if (!preferences.dailyReminder) return;

      const notification: Omit<NotificationData, 'id' | 'createdAt'> = {
        userId,
        type: NotificationType.DAILY_REMINDER,
        title: '📱 每日健康提醒',
        message: '別忘了記錄今天的飲食，完成每日任務獲得積分獎勵！',
        data: {},
        isRead: false
      };

      await this.createNotification(notification);
      await this.sendRealTimeNotification(userId, notification);
    } catch (error) {
      console.error('發送每日提醒失敗:', error);
    }
  }

  /**
   * 獲取用戶通知列表
   */
  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<NotificationData[]> {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await this.db.query(query, [userId, limit, offset]);
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type as NotificationType,
        title: row.title,
        message: row.message,
        data: row.data || {},
        isRead: row.is_read,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('獲取用戶通知失敗:', error);
      return [];
    }
  }

  /**
   * 標記通知為已讀
   */
  async markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await this.db.query(query, [notificationId, userId]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('標記通知已讀失敗:', error);
      return false;
    }
  }

  /**
   * 標記所有通知為已讀
   */
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true, updated_at = NOW()
        WHERE user_id = $1 AND is_read = false
      `;
      
      const result = await this.db.query(query, [userId]);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('標記所有通知已讀失敗:', error);
      return false;
    }
  }

  /**
   * 獲取未讀通知數量
   */
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = $1 AND is_read = false
      `;
      
      const result = await this.db.query(query, [userId]);
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('獲取未讀通知數量失敗:', error);
      return 0;
    }
  }

  /**
   * 分享成就到社群
   */
  async shareAchievementToSocial(userId: string, achievementId: string, platform: 'line' | 'notion'): Promise<boolean> {
    try {
      // 獲取成就詳情
      const achievementQuery = `
        SELECT at.*, ua.unlocked_at
        FROM achievement_templates at
        INNER JOIN user_achievements ua ON at.id = ua.achievement_id
        WHERE ua.user_id = $1 AND at.id = $2
      `;
      const achievementResult = await this.db.query(achievementQuery, [userId, achievementId]);
      
      if (achievementResult.rows.length === 0) return false;
      
      const achievement = achievementResult.rows[0];
      
      // 獲取用戶資訊
      const userQuery = `
        SELECT name FROM user_profiles WHERE user_id = $1
      `;
      const userResult = await this.db.query(userQuery, [userId]);
      const userName = userResult.rows[0]?.name || '用戶';

      const shareMessage = `🎉 ${userName} 獲得了「${achievement.name}」成就！\n${achievement.description}\n\n#健康營養追蹤 #成就解鎖`;

      // 根據平台發送分享
      switch (platform) {
        case 'line':
          await this.shareToLine(userId, shareMessage, achievement);
          break;
        case 'notion':
          await this.shareToNotion(userId, shareMessage, achievement);
          break;
      }

      return true;
    } catch (error) {
      console.error('分享成就失敗:', error);
      return false;
    }
  }

  /**
   * 創建通知記錄
   */
  private async createNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      // 首先檢查是否已經存在相同的通知（避免重複）
      if (notification.type === NotificationType.ACHIEVEMENT_UNLOCKED || 
          notification.type === NotificationType.BADGE_EARNED) {
        const existingQuery = `
          SELECT id FROM notifications 
          WHERE user_id = $1 AND type = $2 AND data->>'achievementId' = $3
          OR (user_id = $1 AND type = $2 AND data->>'badgeId' = $3)
        `;
        const existingResult = await this.db.query(existingQuery, [
          notification.userId, 
          notification.type, 
          notification.data?.achievementId || notification.data?.badgeId
        ]);
        
        if (existingResult.rows.length > 0) {
          return null; // 已存在相同通知
        }
      }

      const query = `
        INSERT INTO notifications (user_id, type, title, message, data, is_read)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      
      const result = await this.db.query(query, [
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        JSON.stringify(notification.data || {}),
        notification.isRead
      ]);
      
      return result.rows[0]?.id || null;
    } catch (error) {
      console.error('創建通知失敗:', error);
      return null;
    }
  }

  /**
   * 發送即時通知
   */
  private async sendRealTimeNotification(userId: string, notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<void> {
    try {
      // 發送到 WebSocket（如果用戶在線）
      const wsMessage = {
        type: 'notification',
        data: notification
      };
      
      // 發布到 Redis 頻道，WebSocket 服務會監聽
      await this.redis.publish(`user:${userId}:notifications`, JSON.stringify(wsMessage));
      
      // 檢查用戶推送通知偏好
      const preferences = await this.getUserNotificationPreferences(userId);
      
      if (preferences.pushNotifications) {
        // 這裡可以整合推送通知服務（如 Firebase Cloud Messaging）
        // await this.sendPushNotification(userId, notification);
      }
    } catch (error) {
      console.error('發送即時通知失敗:', error);
    }
  }

  /**
   * 檢查並分享重要成就
   */
  private async checkAndShareAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      // 只有稀有度為 epic 或 legendary 的成就才自動分享
      if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
        // 檢查用戶是否啟用自動分享
        const preferences = await this.getUserNotificationPreferences(userId);
        
        if (preferences.achievementSharing) {
          // 可以選擇分享到 Line 或 Notion
          // 這裡簡化為記錄分享意圖，實際分享需要用戶確認
          await this.createShareIntent(userId, achievement.id, 'achievement');
        }
      }
    } catch (error) {
      console.error('檢查成就分享失敗:', error);
    }
  }

  /**
   * 創建分享意圖記錄
   */
  private async createShareIntent(userId: string, contentId: string, contentType: string): Promise<void> {
    try {
      const query = `
        INSERT INTO share_intents (user_id, content_id, content_type, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, content_id, content_type) DO NOTHING
      `;
      
      await this.db.query(query, [userId, contentId, contentType]);
    } catch (error) {
      console.error('創建分享意圖失敗:', error);
    }
  }

  /**
   * 分享到 Line
   */
  private async shareToLine(userId: string, message: string, achievement: any): Promise<void> {
    try {
      // 這裡應該整合 Line Messaging API
      // 暫時記錄分享行為
      console.log(`分享到 Line: ${message}`);
    } catch (error) {
      console.error('分享到 Line 失敗:', error);
    }
  }

  /**
   * 分享到 Notion
   */
  private async shareToNotion(userId: string, message: string, achievement: any): Promise<void> {
    try {
      // 這裡應該整合 Notion API
      // 暫時記錄分享行為
      console.log(`分享到 Notion: ${message}`);
    } catch (error) {
      console.error('分享到 Notion 失敗:', error);
    }
  }

  /**
   * 獲取用戶通知偏好
   */
  private async getUserNotificationPreferences(userId: string): Promise<{
    pushNotifications: boolean;
    emailNotifications: boolean;
    achievementNotifications: boolean;
    dailyReminder: boolean;
    weeklyReport: boolean;
    achievementSharing: boolean;
  }> {
    try {
      const query = `
        SELECT 
          push_notifications,
          email_notifications,
          achievement_notifications,
          weekly_report_notifications as weekly_report,
          data_sharing as achievement_sharing
        FROM user_preferences 
        WHERE user_id = $1
      `;
      
      const result = await this.db.query(query, [userId]);
      const prefs = result.rows[0];
      
      if (!prefs) {
        // 返回預設偏好
        return {
          pushNotifications: true,
          emailNotifications: true,
          achievementNotifications: true,
          dailyReminder: true,
          weeklyReport: true,
          achievementSharing: false
        };
      }
      
      return {
        pushNotifications: prefs.push_notifications,
        emailNotifications: prefs.email_notifications,
        achievementNotifications: prefs.achievement_notifications,
        dailyReminder: true, // 預設啟用
        weeklyReport: prefs.weekly_report,
        achievementSharing: prefs.achievement_sharing
      };
    } catch (error) {
      console.error('獲取用戶通知偏好失敗:', error);
      return {
        pushNotifications: true,
        emailNotifications: true,
        achievementNotifications: true,
        dailyReminder: true,
        weeklyReport: true,
        achievementSharing: false
      };
    }
  }
}