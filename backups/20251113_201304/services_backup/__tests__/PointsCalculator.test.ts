import { PointsCalculator } from '../PointsCalculator';
import { db } from '../../database/connection';
import { redis } from '../../database/redis';

// Mock dependencies
jest.mock('../../database/connection');
jest.mock('../../database/redis');

const mockDb = {
  query: jest.fn(),
  connect: jest.fn()
};

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn()
};

const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

(db as any).query = mockDb.query;
(db as any).connect = mockDb.connect;
// Mock redis functions
Object.defineProperty(redis, 'get', { value: mockRedis.get });
Object.defineProperty(redis, 'setex', { value: mockRedis.setex });
Object.defineProperty(redis, 'del', { value: mockRedis.del });

describe('PointsCalculator', () => {
  let pointsCalculator: PointsCalculator;

  beforeEach(() => {
    pointsCalculator = new PointsCalculator();
    jest.clearAllMocks();
  });

  describe('awardPoints', () => {
    it('應該成功給予用戶積分', async () => {
      const userId = 'test-user-id';
      const points = 50;
      const source = 'task_completion' as any;
      
      mockDb.connect.mockResolvedValue(mockClient);
      
      // Mock points insertion
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'points-1' }] });
      
      // Mock level update
      mockClient.query.mockResolvedValueOnce({ rows: [{ experience_points: 150 }] });
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // No level up

      const result = await pointsCalculator.awardPoints(userId, points, source);

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('應該處理等級提升', async () => {
      const userId = 'test-user-id';
      const points = 100;
      const source = 'achievement' as any;
      
      mockDb.connect.mockResolvedValue(mockClient);
      
      // Mock points insertion
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'points-1' }] });
      
      // Mock level update with level up
      mockClient.query.mockResolvedValueOnce({ rows: [{ experience_points: 300 }] });
      mockClient.query.mockResolvedValueOnce({ rows: [{ level: 3 }] }); // Level up to 3
      
      // Mock level up bonus
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'bonus-points' }] });

      const result = await pointsCalculator.awardPoints(userId, points, source);

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('等級提升至 3 級獎勵'),
        expect.any(Array)
      );
    });
  });

  describe('calculateDailyLoginReward', () => {
    it('應該計算基礎登入獎勵', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ streak_days: 3 }] });

      const reward = await pointsCalculator.calculateDailyLoginReward('user-1');

      expect(reward).toBe(10); // 基礎獎勵
    });

    it('應該計算連續登入獎勵加成', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ streak_days: 14 }] });

      const reward = await pointsCalculator.calculateDailyLoginReward('user-1');

      expect(reward).toBe(20); // 基礎10 + 連續獎勵10 (14/7 * 5)
    });

    it('應該限制最大獎勵', async () => {
      mockDb.query.mockResolvedValue({ rows: [{ streak_days: 365 }] });

      const reward = await pointsCalculator.calculateDailyLoginReward('user-1');

      expect(reward).toBe(60); // 基礎10 + 最大獎勵50
    });
  });

  describe('processDailyLogin', () => {
    it('應該處理首次每日登入', async () => {
      const userId = 'test-user-id';
      const today = new Date().toISOString().split('T')[0];
      
      mockDb.connect.mockResolvedValue(mockClient);
      
      // Mock no existing login today
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock level update with new streak
      mockClient.query.mockResolvedValueOnce({ rows: [{ streak_days: 1 }] });
      
      // Mock points insertion
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'login-points' }] });
      
      // Mock level update
      mockClient.query.mockResolvedValueOnce({ rows: [{ experience_points: 10 }] });
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // No level up

      const result = await pointsCalculator.processDailyLogin(userId);

      expect(result.points).toBeGreaterThan(0);
      expect(result.streakDays).toBe(1);
      expect(result.isNewStreak).toBe(true);
    });

    it('應該處理已經登入過的情況', async () => {
      const userId = 'test-user-id';
      
      mockDb.connect.mockResolvedValue(mockClient);
      
      // Mock existing login today
      mockClient.query.mockResolvedValueOnce({ rows: [{ earned_at: new Date() }] });
      
      // Mock get streak days
      mockDb.query.mockResolvedValue({ rows: [{ streak_days: 5 }] });

      const result = await pointsCalculator.processDailyLogin(userId);

      expect(result.points).toBe(0);
      expect(result.streakDays).toBe(5);
      expect(result.isNewStreak).toBe(false);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getUserProgress', () => {
    it('應該返回用戶進度', async () => {
      const userId = 'test-user-id';
      const mockProgress = {
        level: 5,
        experience_points: 500,
        total_points: 1000,
        streak_days: 10,
        last_activity_date: '2023-01-01',
        total_achievements: '3',
        total_badges: '2',
        completed_tasks: '15',
        active_tasks: '5'
      };

      mockRedis.get.mockResolvedValue(null);
      mockDb.query.mockResolvedValue({ rows: [mockProgress] });

      const progress = await pointsCalculator.getUserProgress(userId);

      expect(progress).toBeTruthy();
      expect(progress?.level).toBe(5);
      expect(progress?.experiencePoints).toBe(500);
      expect(progress?.streakDays).toBe(10);
      expect(progress?.completedTasks).toBe(15);
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('應該從快取返回進度', async () => {
      const userId = 'test-user-id';
      const cachedProgress = {
        level: 3,
        experiencePoints: 200,
        totalPoints: 500,
        streakDays: 7
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedProgress));

      const progress = await pointsCalculator.getUserProgress(userId);

      expect(progress).toEqual(cachedProgress);
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it('應該初始化新用戶等級', async () => {
      const userId = 'test-user-id';

      mockRedis.get.mockResolvedValue(null);
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // No existing level
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 }); // Initialize level
      
      // Mock recursive call after initialization
      const mockProgress = {
        level: 1,
        experience_points: 0,
        total_points: 0,
        streak_days: 0,
        last_activity_date: null,
        total_achievements: '0',
        total_badges: '0',
        completed_tasks: '0',
        active_tasks: '0'
      };
      mockDb.query.mockResolvedValueOnce({ rows: [mockProgress] });

      const progress = await pointsCalculator.getUserProgress(userId);

      expect(progress?.level).toBe(1);
      expect(progress?.experiencePoints).toBe(0);
    });
  });

  describe('calculateLevelRequirement', () => {
    it('應該計算等級所需經驗值', () => {
      expect(pointsCalculator.calculateLevelRequirement(1)).toBe(100);
      expect(pointsCalculator.calculateLevelRequirement(2)).toBe(283);
      expect(pointsCalculator.calculateLevelRequirement(3)).toBe(520);
    });
  });

  describe('calculateLevelFromExperience', () => {
    it('應該根據經驗值計算等級', () => {
      expect(pointsCalculator.calculateLevelFromExperience(0)).toBe(1);
      expect(pointsCalculator.calculateLevelFromExperience(150)).toBe(1);
      expect(pointsCalculator.calculateLevelFromExperience(300)).toBe(2);
      expect(pointsCalculator.calculateLevelFromExperience(600)).toBe(3);
    });
  });

  describe('getUserPointsHistory', () => {
    it('應該返回用戶積分記錄', async () => {
      const userId = 'test-user-id';
      const mockHistory = [
        {
          id: 'points-1',
          user_id: userId,
          points: 50,
          source: 'task_completion',
          source_id: 'task-1',
          description: '任務完成獎勵',
          earned_at: new Date()
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockHistory });

      const history = await pointsCalculator.getUserPointsHistory(userId);

      expect(history).toHaveLength(1);
      expect(history[0].points).toBe(50);
      expect(history[0].source).toBe('task_completion');
    });
  });
});