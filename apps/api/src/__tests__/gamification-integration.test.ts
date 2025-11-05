import request from 'supertest';
import { Pool } from 'pg';
import app from '../index';
import { getDatabase } from '../database/connection';
import { getRedisClient } from '../database/redis';

// Mock external dependencies
jest.mock('../database/connection');
jest.mock('../database/redis');

const mockDb = {
  query: jest.fn(),
  connect: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true)
};

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  publish: jest.fn()
};

const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

(getDatabase as jest.Mock).mockReturnValue(mockDb);
(getRedisClient as jest.Mock).mockReturnValue(mockRedis);

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ 
    id: 'test-user-id', 
    email: 'test@example.com' 
  })
}));

describe('Gamification Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.connect.mockResolvedValue(mockClient);
  });

  describe('Complete User Journey', () => {
    it('應該完成完整的遊戲化用戶旅程', async () => {
      // 1. 用戶首次登入
      mockRedis.get.mockResolvedValue(null); // No cached login
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // No existing login today
        .mockResolvedValueOnce({ rows: [{ streak_days: 1 }] }) // New streak
        .mockResolvedValueOnce({ rows: [{ id: 'login-points' }] }) // Points awarded
        .mockResolvedValueOnce({ rows: [{ experience_points: 10 }] }) // Level update
        .mockResolvedValueOnce({ rows: [] }); // No level up

      const loginResponse = await request(app)
        .post('/api/v1/gamification/daily-login')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.points).toBeGreaterThan(0);
      expect(loginResponse.body.data.streakDays).toBe(1);

      // 2. 用戶記錄第一次食物
      mockRedis.get.mockResolvedValue(null); // No cached tasks
      
      // Mock daily task generation
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ // Task templates
          id: 'template-1',
          title: '記錄早餐',
          description: '記錄今天的早餐內容',
          type: 'daily',
          points: 10,
          requirements: { meal_type: 'breakfast', count: 1 }
        }] })
        .mockResolvedValueOnce({ rows: [{ id: 'task-1' }] }) // Task creation
        .mockResolvedValueOnce({ rows: [{ // Task retrieval
          id: 'task-1',
          template_id: 'template-1',
          title: '記錄早餐',
          description: '記錄今天的早餐內容',
          type: 'daily',
          points: 10,
          progress: 0,
          target: 1,
          status: 'pending',
          category: 'nutrition',
          difficulty: 'easy'
        }] });

      const tasksResponse = await request(app)
        .get('/api/v1/gamification/tasks')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(tasksResponse.body.success).toBe(true);
      expect(tasksResponse.body.data.dailyTasks).toHaveLength(1);

      // 3. 處理食物記錄行為
      // Mock task update
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ // Get active tasks
          id: 'task-1',
          user_id: 'test-user-id',
          progress: 0,
          target: 1,
          status: 'pending',
          points: 10,
          category: 'nutrition',
          requirements: { meal_type: 'breakfast' }
        }] })
        .mockResolvedValueOnce({ rows: [{ // Task progress update
          id: 'task-1',
          user_id: 'test-user-id',
          progress: 0,
          target: 1,
          status: 'pending',
          points: 10
        }] })
        .mockResolvedValueOnce({ rowCount: 1 }) // Update task
        .mockResolvedValueOnce({ rowCount: 1 }) // Log progress
        .mockResolvedValueOnce({ rowCount: 1 }); // Award points

      // Mock achievement check
      mockDb.query.mockResolvedValueOnce({ rows: [{ // Achievement templates
        id: 'achievement-1',
        name: '營養追蹤新手',
        description: '完成第一次飲食記錄',
        icon: '🌱',
        category: 'milestone',
        type: 'milestone',
        points: 25,
        rarity: 'common',
        requirements: { first_food_log: true }
      }] });

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // No existing achievement
        .mockResolvedValueOnce({ rows: [{ unlocked_at: new Date() }] }) // Unlock achievement
        .mockResolvedValueOnce({ rowCount: 1 }) // Award achievement points
        .mockResolvedValueOnce({ rows: [{ id: 'badge-1' }] }) // Badge template
        .mockResolvedValueOnce({ rows: [] }) // No existing badge
        .mockResolvedValueOnce({ rowCount: 1 }); // Award badge

      const actionResponse = await request(app)
        .post('/api/v1/gamification/action')
        .set('Authorization', 'Bearer valid-token')
        .send({
          actionType: 'food_log_created',
          actionData: { 
            mealType: 'breakfast',
            first_food_log: true
          }
        })
        .expect(200);

      expect(actionResponse.body.success).toBe(true);
      expect(actionResponse.body.data.pointsEarned).toBeGreaterThan(0);
      expect(actionResponse.body.data.tasksUpdated).toContain('task-1');
      expect(actionResponse.body.data.achievementsUnlocked).toHaveLength(1);

      // 4. 檢查用戶進度
      mockRedis.get.mockResolvedValue(null); // No cached progress
      mockDb.query.mockResolvedValueOnce({ rows: [{ // User progress
        level: 1,
        experience_points: 40,
        total_points: 40,
        streak_days: 1,
        last_activity_date: new Date().toISOString().split('T')[0],
        total_achievements: '1',
        total_badges: '1',
        completed_tasks: '1',
        active_tasks: '0'
      }] });

      // Mock achievements and badges
      mockRedis.get.mockResolvedValueOnce(null); // No cached achievements
      mockDb.query.mockResolvedValueOnce({ rows: [{ // User achievements
        id: 'achievement-1',
        name: '營養追蹤新手',
        description: '完成第一次飲食記錄',
        icon: '🌱',
        category: 'milestone',
        type: 'milestone',
        points: 25,
        rarity: 'common',
        unlocked_at: new Date(),
        progress: {}
      }] });

      mockRedis.get.mockResolvedValueOnce(null); // No cached badges
      mockDb.query.mockResolvedValueOnce({ rows: [{ // User badges
        id: 'badge-1',
        name: '營養新手',
        description: '完成基礎營養記錄',
        icon: '🥗',
        color: '#4CAF50',
        category: 'nutrition',
        earned_at: new Date(),
        is_displayed: true
      }] });

      // Mock active tasks (empty after completion)
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const progressResponse = await request(app)
        .get('/api/v1/gamification/progress')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(progressResponse.body.success).toBe(true);
      expect(progressResponse.body.data.level).toBe(1);
      expect(progressResponse.body.data.totalPoints).toBe(40);
      expect(progressResponse.body.data.achievements).toHaveLength(1);
      expect(progressResponse.body.data.badges).toHaveLength(1);
      expect(progressResponse.body.data.completedTasks).toBe(1);

      // 5. 檢查排行榜
      const mockLeaderboard = {
        type: 'weekly_points',
        period: { start: new Date(), end: new Date() },
        entries: [
          {
            userId: 'test-user-id',
            userName: '測試用戶',
            score: 40,
            rank: 1,
            avatar: null
          }
        ],
        totalParticipants: 1
      };

      // Mock leaderboard data
      mockDb.query
        .mockResolvedValueOnce({ rows: [{ // Leaderboard entries
          user_id: 'test-user-id',
          user_name: '測試用戶',
          avatar_url: null,
          score: '40',
          rank: '1'
        }] })
        .mockResolvedValueOnce({ rows: [{ total: '1' }] }); // Total participants

      // Mock user rank
      mockDb.query.mockResolvedValueOnce({ rows: [{ rank: 1 }] });

      const leaderboardResponse = await request(app)
        .get('/api/v1/gamification/leaderboard')
        .set('Authorization', 'Bearer valid-token')
        .query({ type: 'weekly_points' })
        .expect(200);

      expect(leaderboardResponse.body.success).toBe(true);
      expect(leaderboardResponse.body.data.entries).toHaveLength(1);
      expect(leaderboardResponse.body.data.entries[0].userId).toBe('test-user-id');
      expect(leaderboardResponse.body.data.userRank).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('應該處理資料庫錯誤', async () => {
      mockDb.connect.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/v1/gamification/daily-login')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('應該處理未認證的請求', async () => {
      const response = await request(app)
        .get('/api/v1/gamification/progress')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('應該處理無效的請求參數', async () => {
      const response = await request(app)
        .post('/api/v1/gamification/action')
        .set('Authorization', 'Bearer valid-token')
        .send({}) // Missing actionType
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('Performance Tests', () => {
    it('應該在合理時間內處理用戶行為', async () => {
      const startTime = Date.now();

      // Mock quick responses
      mockClient.query.mockResolvedValue({ rows: [] });
      mockDb.query.mockResolvedValue({ rows: [] });

      await request(app)
        .post('/api/v1/gamification/action')
        .set('Authorization', 'Bearer valid-token')
        .send({
          actionType: 'food_log_created',
          actionData: { mealType: 'breakfast' }
        })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('應該正確處理並發請求', async () => {
      // Mock responses for concurrent requests
      mockClient.query.mockResolvedValue({ rows: [] });
      mockDb.query.mockResolvedValue({ rows: [] });

      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .get('/api/v1/gamification/progress')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});