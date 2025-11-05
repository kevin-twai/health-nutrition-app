import request from 'supertest';
import express from 'express';
import { GamificationController } from '../GamificationController';
import { GamificationService } from '../../services/GamificationService';
import { NotificationService } from '../../services/NotificationService';
import { requireAuth } from '../../middleware/auth';
import { TaskType, TaskStatus } from '@health-tracker/shared-types';

// Mock services
jest.mock('../../services/GamificationService');
jest.mock('../../services/NotificationService');
jest.mock('../../middleware/auth');

const mockGamificationService = {
  getUserProgress: jest.fn(),
  generateUserTasks: jest.fn(),
  processUserAction: jest.fn(),
  processDailyLogin: jest.fn(),
  getLeaderboard: jest.fn(),
  getUserStats: jest.fn()
};

const mockNotificationService = {
  sendAchievementNotification: jest.fn(),
  sendLevelUpNotification: jest.fn(),
  sendStreakMilestoneNotification: jest.fn(),
  getUserNotifications: jest.fn(),
  getUnreadNotificationCount: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  shareAchievementToSocial: jest.fn()
};

(GamificationService as jest.Mock).mockImplementation(() => mockGamificationService);
(NotificationService as jest.Mock).mockImplementation(() => mockNotificationService);

// Mock auth middleware
(requireAuth as jest.Mock).mockImplementation(() => (req: any, res: any, next: any) => {
  req.user = { id: 'test-user-id', email: 'test@example.com' };
  next();
});

describe('GamificationController', () => {
  let app: express.Application;
  let controller: GamificationController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    controller = new GamificationController();
    
    // Setup routes
    const authMiddleware = requireAuth();
    app.get('/progress', authMiddleware, controller.getUserProgress);
    app.get('/tasks', authMiddleware, controller.getUserTasks);
    app.post('/action', authMiddleware, controller.processUserAction);
    app.post('/daily-login', authMiddleware, controller.processDailyLogin);
    app.get('/leaderboard', authMiddleware, controller.getLeaderboard);
    app.get('/stats', authMiddleware, controller.getUserStats);
    app.get('/notifications', authMiddleware, controller.getUserNotifications);
    app.put('/notifications/:notificationId/read', authMiddleware, controller.markNotificationAsRead);
    app.put('/notifications/read-all', authMiddleware, controller.markAllNotificationsAsRead);
    app.post('/achievements/:achievementId/share', authMiddleware, controller.shareAchievement);

    jest.clearAllMocks();
  });

  describe('GET /progress', () => {
    it('應該返回用戶遊戲化進度', async () => {
      const mockProgress = {
        level: 5,
        experiencePoints: 500,
        totalPoints: 1000,
        streakDays: 10,
        achievements: [],
        badges: [],
        currentTasks: [],
        completedTasks: 15,
        activeTasks: 5
      };

      mockGamificationService.getUserProgress.mockResolvedValue(mockProgress);

      const response = await request(app)
        .get('/progress')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProgress);
      expect(mockGamificationService.getUserProgress).toHaveBeenCalledWith('test-user-id');
    });

    it('應該處理用戶進度不存在的情況', async () => {
      mockGamificationService.getUserProgress.mockResolvedValue(null);

      const response = await request(app)
        .get('/progress')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_PROGRESS_NOT_FOUND');
    });
  });

  describe('GET /tasks', () => {
    it('應該返回用戶任務', async () => {
      const mockTasks = {
        dailyTasks: [
          {
            id: 'task-1',
            title: '記錄早餐',
            type: TaskType.DAILY,
            status: TaskStatus.PENDING,
            points: 10
          }
        ],
        weeklyTasks: [],
        monthlyTasks: []
      };

      mockGamificationService.generateUserTasks.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTasks);
      expect(mockGamificationService.generateUserTasks).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('POST /action', () => {
    it('應該處理用戶行為', async () => {
      const actionData = {
        actionType: 'food_log_created',
        actionData: { mealType: 'breakfast' }
      };

      const mockResult = {
        pointsEarned: 15,
        tasksUpdated: ['task-1'],
        achievementsUnlocked: [],
        levelUp: false
      };

      mockGamificationService.processUserAction.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(mockGamificationService.processUserAction).toHaveBeenCalledWith(
        'test-user-id',
        'food_log_created',
        { mealType: 'breakfast' }
      );
    });

    it('應該發送成就解鎖通知', async () => {
      const actionData = {
        actionType: 'food_log_created',
        actionData: { mealType: 'breakfast' }
      };

      const mockAchievement = {
        id: 'achievement-1',
        name: '營養追蹤新手',
        points: 25
      };

      const mockResult = {
        pointsEarned: 40,
        tasksUpdated: ['task-1'],
        achievementsUnlocked: [mockAchievement],
        levelUp: false
      };

      mockGamificationService.processUserAction.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationService.sendAchievementNotification).toHaveBeenCalledWith(
        'test-user-id',
        mockAchievement
      );
    });

    it('應該發送等級提升通知', async () => {
      const actionData = {
        actionType: 'task_completed',
        actionData: { taskId: 'task-1' }
      };

      const mockResult = {
        pointsEarned: 100,
        tasksUpdated: ['task-1'],
        achievementsUnlocked: [],
        levelUp: true,
        newLevel: 3
      };

      mockGamificationService.processUserAction.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/action')
        .send(actionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationService.sendLevelUpNotification).toHaveBeenCalledWith(
        'test-user-id',
        3,
        150 // 3 * 50
      );
    });

    it('應該處理缺少行為類型的情況', async () => {
      const response = await request(app)
        .post('/action')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('POST /daily-login', () => {
    it('應該處理每日登入', async () => {
      const mockResult = {
        points: 15,
        streakDays: 7,
        isNewStreak: false,
        achievementsUnlocked: []
      };

      mockGamificationService.processDailyLogin.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/daily-login')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(mockGamificationService.processDailyLogin).toHaveBeenCalledWith('test-user-id');
    });

    it('應該發送連續登入里程碑通知', async () => {
      const mockResult = {
        points: 20,
        streakDays: 30,
        isNewStreak: false,
        achievementsUnlocked: []
      };

      mockGamificationService.processDailyLogin.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/daily-login')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationService.sendStreakMilestoneNotification).toHaveBeenCalledWith(
        'test-user-id',
        30
      );
    });
  });

  describe('GET /leaderboard', () => {
    it('應該返回排行榜', async () => {
      const mockLeaderboard = {
        type: 'weekly_points',
        period: { start: new Date(), end: new Date() },
        entries: [
          {
            userId: 'user-1',
            userName: '用戶1',
            score: 500,
            rank: 1
          }
        ],
        totalParticipants: 10,
        userRank: 5
      };

      mockGamificationService.getLeaderboard.mockResolvedValue(mockLeaderboard);

      const response = await request(app)
        .get('/leaderboard')
        .query({ type: 'weekly_points', period: 'current', limit: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLeaderboard);
      expect(mockGamificationService.getLeaderboard).toHaveBeenCalledWith(
        'weekly_points',
        'current',
        50,
        'test-user-id'
      );
    });

    it('應該處理無效的排行榜類型', async () => {
      const response = await request(app)
        .get('/leaderboard')
        .query({ type: 'invalid_type' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('GET /stats', () => {
    it('應該返回用戶統計', async () => {
      const mockStats = {
        taskStats: {
          completed: 15,
          total: 20,
          completionRate: 75,
          pointsEarned: 300
        },
        achievementStats: {
          totalAchievements: 10,
          unlockedAchievements: 3,
          totalBadges: 2,
          pointsFromAchievements: 150,
          rarityBreakdown: { common: 2, rare: 1 }
        }
      };

      mockGamificationService.getUserStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
      expect(mockGamificationService.getUserStats).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('GET /notifications', () => {
    it('應該返回用戶通知', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          type: 'achievement_unlocked',
          title: '恭喜獲得成就！',
          message: '您已解鎖「營養追蹤新手」成就！',
          isRead: false,
          createdAt: new Date()
        }
      ];

      mockNotificationService.getUserNotifications.mockResolvedValue(mockNotifications);
      mockNotificationService.getUnreadNotificationCount.mockResolvedValue(1);

      const response = await request(app)
        .get('/notifications')
        .query({ limit: 20, offset: 0 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toEqual(mockNotifications);
      expect(response.body.data.unreadCount).toBe(1);
    });
  });

  describe('PUT /notifications/:notificationId/read', () => {
    it('應該標記通知為已讀', async () => {
      mockNotificationService.markNotificationAsRead.mockResolvedValue(true);

      const response = await request(app)
        .put('/notifications/notification-1/read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationService.markNotificationAsRead).toHaveBeenCalledWith(
        'test-user-id',
        'notification-1'
      );
    });

    it('應該處理通知不存在的情況', async () => {
      mockNotificationService.markNotificationAsRead.mockResolvedValue(false);

      const response = await request(app)
        .put('/notifications/non-existent/read')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOTIFICATION_NOT_FOUND');
    });
  });

  describe('PUT /notifications/read-all', () => {
    it('應該標記所有通知為已讀', async () => {
      mockNotificationService.markAllNotificationsAsRead.mockResolvedValue(true);

      const response = await request(app)
        .put('/notifications/read-all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationService.markAllNotificationsAsRead).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('POST /achievements/:achievementId/share', () => {
    it('應該分享成就到指定平台', async () => {
      mockNotificationService.shareAchievementToSocial.mockResolvedValue(true);

      const response = await request(app)
        .post('/achievements/achievement-1/share')
        .send({ platform: 'line' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockNotificationService.shareAchievementToSocial).toHaveBeenCalledWith(
        'test-user-id',
        'achievement-1',
        'line'
      );
    });

    it('應該處理無效的分享平台', async () => {
      const response = await request(app)
        .post('/achievements/achievement-1/share')
        .send({ platform: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });

    it('應該處理成就不存在的情況', async () => {
      mockNotificationService.shareAchievementToSocial.mockResolvedValue(false);

      const response = await request(app)
        .post('/achievements/non-existent/share')
        .send({ platform: 'line' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACHIEVEMENT_NOT_FOUND');
    });
  });
});