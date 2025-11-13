import { AchievementTracker } from '../AchievementTracker';
import { db } from '../../database/connection';
import { redis } from '../../database/redis';
import { AchievementRarity } from '@health-tracker/shared-types';
import { AchievementType } from '@health-tracker/shared-types';

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

describe('AchievementTracker', () => {
  let achievementTracker: AchievementTracker;

  beforeEach(() => {
    achievementTracker = new AchievementTracker();
    jest.clearAllMocks();
  });

  describe('checkAndUnlockAchievements', () => {
    it('應該解鎖符合條件的成就', async () => {
      const userId = 'test-user-id';
      const actionType = 'milestone';
      const actionData = { first_food_log: true };

      const mockTemplate = {
        id: 'achievement-1',
        name: '營養追蹤新手',
        description: '完成第一次飲食記錄',
        icon: '🌱',
        category: 'milestone',
        type: 'milestone',
        points: 25,
        rarity: 'common',
        requirements: { first_food_log: true }
      };

      mockDb.connect.mockResolvedValue(mockClient);
      
      // Mock get relevant templates
      mockDb.query.mockResolvedValueOnce({ rows: [mockTemplate] });
      
      // Mock check existing achievement
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // No existing achievement
      
      // Mock unlock achievement
      mockClient.query.mockResolvedValueOnce({ 
        rows: [{ unlocked_at: new Date() }] 
      });
      
      // Mock award points
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
      
      // Mock badge check
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'badge-1' }] });
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // No existing badge
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Award badge

      const achievements = await achievementTracker.checkAndUnlockAchievements(
        userId, 
        actionType, 
        actionData
      );

      expect(achievements).toHaveLength(1);
      expect(achievements[0].name).toBe('營養追蹤新手');
      expect(achievements[0].name).toBe('營養追蹤新手');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('應該跳過已獲得的成就', async () => {
      const userId = 'test-user-id';
      const actionType = 'milestone';
      const actionData = { first_food_log: true };

      const mockTemplate = {
        id: 'achievement-1',
        name: '營養追蹤新手',
        requirements: { first_food_log: true }
      };

      mockDb.connect.mockResolvedValue(mockClient);
      mockDb.query.mockResolvedValueOnce({ rows: [mockTemplate] });
      
      // Mock existing achievement
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

      const achievements = await achievementTracker.checkAndUnlockAchievements(
        userId, 
        actionType, 
        actionData
      );

      expect(achievements).toHaveLength(0);
    });
  });

  describe('getUserAchievements', () => {
    it('應該返回用戶成就列表', async () => {
      const userId = 'test-user-id';
      const mockAchievements = [
        {
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
        }
      ];

      mockRedis.get.mockResolvedValue(null);
      mockDb.query.mockResolvedValue({ rows: mockAchievements });

      const achievements = await achievementTracker.getUserAchievements(userId);

      expect(achievements).toHaveLength(1);
      expect(achievements[0].name).toBe('營養追蹤新手');
      expect(achievements[0].category).toBe('milestone');
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('應該從快取返回成就列表', async () => {
      const userId = 'test-user-id';
      const cachedAchievements = [
        {
          id: 'achievement-1',
          name: '營養追蹤新手',
          category: 'milestone',
          icon: '🌱'
        }
      ];

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedAchievements));

      const achievements = await achievementTracker.getUserAchievements(userId);

      expect(achievements).toEqual(cachedAchievements);
      expect(mockDb.query).not.toHaveBeenCalled();
    });
  });

  describe('getUserBadges', () => {
    it('應該返回用戶徽章列表', async () => {
      const userId = 'test-user-id';
      const mockBadges = [
        {
          id: 'badge-1',
          name: '營養新手',
          description: '完成基礎營養記錄',
          icon: '🥗',
          color: '#4CAF50',
          category: 'nutrition',
          earned_at: new Date(),
          is_displayed: true
        }
      ];

      mockRedis.get.mockResolvedValue(null);
      mockDb.query.mockResolvedValue({ rows: mockBadges });

      const badges = await achievementTracker.getUserBadges(userId);

      expect(badges).toHaveLength(1);
      expect(badges[0].name).toBe('營養新手');
      expect(badges[0].isDisplayed).toBe(true);
    });
  });

  describe('getAvailableAchievements', () => {
    it('應該返回可用成就列表', async () => {
      const userId = 'test-user-id';
      const mockAchievements = [
        {
          id: 'achievement-1',
          name: '營養追蹤新手',
          description: '完成第一次飲食記錄',
          icon: '🌱',
          category: 'milestone',
          type: 'milestone',
          points: 25,
          rarity: 'common',
          unlocked_at: new Date(),
          progress: {},
          is_unlocked: true
        },
        {
          id: 'achievement-2',
          name: '拍照達人',
          description: '使用拍照功能記錄100次餐點',
          icon: '📸',
          category: 'milestone',
          type: 'milestone',
          points: 100,
          rarity: 'rare',
          unlocked_at: null,
          progress: null,
          is_unlocked: false
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockAchievements });

      const achievements = await achievementTracker.getAvailableAchievements(userId);

      expect(achievements).toHaveLength(2);
      expect(achievements[0].unlockedAt).toBeTruthy();
      expect(achievements[1].unlockedAt).toBeUndefined();
    });
  });

  describe('updateBadgeDisplayStatus', () => {
    it('應該更新徽章顯示狀態', async () => {
      const userId = 'test-user-id';
      const badgeId = 'badge-1';
      const isDisplayed = false;

      mockDb.query.mockResolvedValue({ rowCount: 1 });

      const result = await achievementTracker.updateBadgeDisplayStatus(
        userId, 
        badgeId, 
        isDisplayed
      );

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith(`user_badges:${userId}`);
    });

    it('應該處理徽章不存在的情況', async () => {
      const userId = 'test-user-id';
      const badgeId = 'non-existent-badge';
      const isDisplayed = false;

      mockDb.query.mockResolvedValue({ rowCount: 0 });

      const result = await achievementTracker.updateBadgeDisplayStatus(
        userId, 
        badgeId, 
        isDisplayed
      );

      expect(result).toBe(false);
    });
  });

  describe('getAchievementStats', () => {
    it('應該返回成就統計', async () => {
      const userId = 'test-user-id';
      const mockStats = {
        total_achievements: '10',
        unlocked_achievements: '3',
        total_badges: '2',
        points_from_achievements: '150'
      };

      const mockRarityStats = [
        { rarity: 'common', count: '2' },
        { rarity: 'rare', count: '1' }
      ];

      mockDb.query.mockResolvedValueOnce({ rows: [mockStats] });
      mockDb.query.mockResolvedValueOnce({ rows: mockRarityStats });

      const stats = await achievementTracker.getAchievementStats(userId);

      expect(stats.totalAchievements).toBe(10);
      expect(stats.unlockedAchievements).toBe(3);
      expect(stats.totalBadges).toBe(2);
      expect(stats.pointsFromAchievements).toBe(150);
      expect(stats.rarityBreakdown.common).toBe(2);
      expect(stats.rarityBreakdown.rare).toBe(1);
    });
  });

  describe('checkSpecificAchievement', () => {
    it('應該檢查首次食物記錄成就', async () => {
      const userId = 'test-user-id';
      const achievementType = 'first_food_log';
      const data = { foodId: 'food-1' };

      // Mock the checkAndUnlockAchievements method
      const mockAchievement = {
        id: 'achievement-1',
        name: '營養追蹤新手',
        description: '完成第一次飲食記錄',
        icon: '🌱',
        category: 'milestone',
        type: AchievementType.MILESTONE,
        points: 25,
        rarity: AchievementRarity.COMMON,
        unlockedAt: new Date()
      };

      // We need to mock the internal method calls
      mockDb.connect.mockResolvedValue(mockClient);
      mockDb.query.mockResolvedValueOnce({ rows: [{ 
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
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      mockClient.query.mockResolvedValueOnce({ rows: [{ unlocked_at: new Date() }] });
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const achievements = await achievementTracker.checkSpecificAchievement(
        userId, 
        achievementType, 
        data
      );

      expect(achievements).toHaveLength(1);
      expect(achievements[0].name).toBe('營養追蹤新手');
    });

    it('應該檢查拍照里程碑成就', async () => {
      const userId = 'test-user-id';
      const achievementType = 'photo_milestone';
      const data = { photoCount: 100 };

      mockDb.connect.mockResolvedValue(mockClient);
      mockDb.query.mockResolvedValueOnce({ rows: [{ 
        id: 'achievement-2',
        name: '拍照達人',
        requirements: { photo_logs: 100 }
      }] });
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      mockClient.query.mockResolvedValueOnce({ rows: [{ unlocked_at: new Date() }] });
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const achievements = await achievementTracker.checkSpecificAchievement(
        userId, 
        achievementType, 
        data
      );

      expect(achievements).toHaveLength(1);
    });

    it('應該忽略非里程碑數值', async () => {
      const userId = 'test-user-id';
      const achievementType = 'photo_milestone';
      const data = { photoCount: 75 }; // Not a milestone

      const achievements = await achievementTracker.checkSpecificAchievement(
        userId, 
        achievementType, 
        data
      );

      expect(achievements).toHaveLength(0);
      expect(mockDb.query).not.toHaveBeenCalled();
    });
  });
});