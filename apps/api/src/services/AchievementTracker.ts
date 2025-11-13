import { Pool } from 'pg';
import { db } from '../database/connection';
import { redis } from '../database/redis';
import { 
  Achievement, 
  Badge,
  AchievementType,
  AchievementRarity,
  PointsSource 
} from '../types/shared';

export class AchievementTracker {
  private db: Pool;
  private redis: any;

  constructor() {
    this.db = db.getPool();
    this.redis = redis;
  }

  /**
   * 檢查並解鎖用戶成就
   */
  async checkAndUnlockAchievements(userId: string, actionType: string, actionData: Record<string, any>): Promise<Achievement[]> {
    const client = await this.db.connect();
    const unlockedAchievements: Achievement[] = [];
    
    try {
      await client.query('BEGIN');

      // 獲取相關的成就模板
      const achievementTemplates = await this.getRelevantAchievementTemplates(actionType);
      
      for (const template of achievementTemplates) {
        const isUnlocked = await this.checkAchievementRequirements(userId, template, actionData);
        
        if (isUnlocked) {
          // 檢查用戶是否已經獲得此成就
          const existingQuery = `
            SELECT id FROM user_achievements 
            WHERE user_id = $1 AND achievement_id = $2
          `;
          const existingResult = await client.query(existingQuery, [userId, template.id]);
          
          if (existingResult.rows.length === 0) {
            // 解鎖成就
            const unlockQuery = `
              INSERT INTO user_achievements (user_id, achievement_id, progress)
              VALUES ($1, $2, $3)
              RETURNING unlocked_at
            `;
            const unlockResult = await client.query(unlockQuery, [
              userId, 
              template.id, 
              JSON.stringify(actionData)
            ]);

            // 給予成就積分獎勵
            if (template.points > 0) {
              const pointsQuery = `
                INSERT INTO user_points (user_id, points, source, source_id, description)
                VALUES ($1, $2, $3, $4, $5)
              `;
              await client.query(pointsQuery, [
                userId,
                template.points,
                PointsSource.ACHIEVEMENT,
                template.id,
                `獲得成就：${template.name}`
              ]);
            }

            // 檢查是否應該給予相關徽章
            await this.checkAndAwardBadges(client, userId, template);

            const achievement: Achievement = {
              id: template.id,
              name: template.name,
              description: template.description,
              icon: template.icon,
              category: template.category,
              type: template.type as AchievementType,
              points: template.points,
              rarity: template.rarity as AchievementRarity,
              unlockedAt: new Date(unlockResult.rows[0].unlocked_at),
              progress: actionData
            };

            unlockedAchievements.push(achievement);
          }
        }
      }

      await client.query('COMMIT');

      // 清除相關快取
      await this.clearUserAchievementsCache(userId);

      return unlockedAchievements;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('檢查成就失敗:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * 獲取用戶所有成就
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      // 檢查快取
      const cacheKey = `user_achievements:${userId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT 
          at.*,
          ua.unlocked_at,
          ua.progress
        FROM achievement_templates at
        INNER JOIN user_achievements ua ON at.id = ua.achievement_id
        WHERE ua.user_id = $1
        ORDER BY ua.unlocked_at DESC
      `;
      
      const result = await this.db.query(query, [userId]);
      const achievements = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        category: row.category,
        type: row.type as AchievementType,
        points: row.points,
        rarity: row.rarity as AchievementRarity,
        unlockedAt: new Date(row.unlocked_at),
        progress: row.progress || {}
      }));

      // 快取結果
      await this.redis.setex(cacheKey, 600, JSON.stringify(achievements)); // 10分鐘快取

      return achievements;
    } catch (error) {
      console.error('獲取用戶成就失敗:', error);
      return [];
    }
  }

  /**
   * 獲取用戶徽章
   */
  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      // 檢查快取
      const cacheKey = `user_badges:${userId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT 
          bt.*,
          ub.earned_at,
          ub.is_displayed
        FROM badge_templates bt
        INNER JOIN user_badges ub ON bt.id = ub.badge_id
        WHERE ub.user_id = $1
        ORDER BY ub.earned_at DESC
      `;
      
      const result = await this.db.query(query, [userId]);
      const badges = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        color: row.color,
        category: row.category,
        earnedAt: new Date(row.earned_at),
        isDisplayed: row.is_displayed
      }));

      // 快取結果
      await this.redis.setex(cacheKey, 600, JSON.stringify(badges)); // 10分鐘快取

      return badges;
    } catch (error) {
      console.error('獲取用戶徽章失敗:', error);
      return [];
    }
  }

  /**
   * 獲取可用的成就列表（包括未解鎖的）
   */
  async getAvailableAchievements(userId: string, includeHidden: boolean = false): Promise<Achievement[]> {
    try {
      let hiddenFilter = '';
      if (!includeHidden) {
        hiddenFilter = 'AND (at.is_hidden = false OR ua.user_id IS NOT NULL)';
      }

      const query = `
        SELECT 
          at.*,
          ua.unlocked_at,
          ua.progress,
          CASE WHEN ua.user_id IS NOT NULL THEN true ELSE false END as is_unlocked
        FROM achievement_templates at
        LEFT JOIN user_achievements ua ON at.id = ua.achievement_id AND ua.user_id = $1
        WHERE at.is_active = true ${hiddenFilter}
        ORDER BY 
          CASE WHEN ua.user_id IS NOT NULL THEN 0 ELSE 1 END,
          at.rarity,
          at.points DESC
      `;
      
      const result = await this.db.query(query, [userId]);
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        category: row.category,
        type: row.type as AchievementType,
        points: row.points,
        rarity: row.rarity as AchievementRarity,
        unlockedAt: row.unlocked_at ? new Date(row.unlocked_at) : undefined,
        progress: row.progress || {}
      }));
    } catch (error) {
      console.error('獲取可用成就失敗:', error);
      return [];
    }
  }

  /**
   * 更新徽章顯示狀態
   */
  async updateBadgeDisplayStatus(userId: string, badgeId: string, isDisplayed: boolean): Promise<boolean> {
    try {
      const query = `
        UPDATE user_badges 
        SET is_displayed = $1 
        WHERE user_id = $2 AND badge_id = $3
      `;
      
      const result = await this.db.query(query, [isDisplayed, userId, badgeId]);
      
      if (result.rowCount && result.rowCount > 0) {
        // 清除快取
        await this.redis.del(`user_badges:${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('更新徽章顯示狀態失敗:', error);
      return false;
    }
  }

  /**
   * 獲取成就統計
   */
  async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    unlockedAchievements: number;
    totalBadges: number;
    pointsFromAchievements: number;
    rarityBreakdown: Record<string, number>;
  }> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT at.id) as total_achievements,
          COUNT(DISTINCT ua.id) as unlocked_achievements,
          COUNT(DISTINCT ub.id) as total_badges,
          COALESCE(SUM(CASE WHEN ua.user_id IS NOT NULL THEN at.points ELSE 0 END), 0) as points_from_achievements
        FROM achievement_templates at
        LEFT JOIN user_achievements ua ON at.id = ua.achievement_id AND ua.user_id = $1
        LEFT JOIN user_badges ub ON ub.user_id = $1
        WHERE at.is_active = true
      `;
      
      const rarityQuery = `
        SELECT 
          at.rarity,
          COUNT(*) as count
        FROM achievement_templates at
        INNER JOIN user_achievements ua ON at.id = ua.achievement_id
        WHERE ua.user_id = $1
        GROUP BY at.rarity
      `;
      
      const [statsResult, rarityResult] = await Promise.all([
        this.db.query(statsQuery, [userId]),
        this.db.query(rarityQuery, [userId])
      ]);
      
      const stats = statsResult.rows[0];
      const rarityBreakdown: Record<string, number> = {};
      
      rarityResult.rows.forEach(row => {
        rarityBreakdown[row.rarity] = parseInt(row.count);
      });

      return {
        totalAchievements: parseInt(stats.total_achievements),
        unlockedAchievements: parseInt(stats.unlocked_achievements),
        totalBadges: parseInt(stats.total_badges),
        pointsFromAchievements: parseInt(stats.points_from_achievements),
        rarityBreakdown
      };
    } catch (error) {
      console.error('獲取成就統計失敗:', error);
      return {
        totalAchievements: 0,
        unlockedAchievements: 0,
        totalBadges: 0,
        pointsFromAchievements: 0,
        rarityBreakdown: {}
      };
    }
  }

  /**
   * 檢查特定行為是否觸發成就
   */
  async checkSpecificAchievement(userId: string, achievementType: string, data: Record<string, any>): Promise<Achievement[]> {
    const achievements: Achievement[] = [];
    
    try {
      switch (achievementType) {
        case 'first_food_log':
          const firstLogAchievements = await this.checkAndUnlockAchievements(userId, 'milestone', {
            first_food_log: true,
            ...data
          });
          achievements.push(...firstLogAchievements);
          break;

        case 'photo_milestone':
          if (data.photoCount && [10, 50, 100, 500].includes(data.photoCount)) {
            const photoAchievements = await this.checkAndUnlockAchievements(userId, 'milestone', {
              photo_logs: data.photoCount,
              ...data
            });
            achievements.push(...photoAchievements);
          }
          break;

        case 'chat_milestone':
          if (data.chatCount && [10, 25, 50, 100].includes(data.chatCount)) {
            const chatAchievements = await this.checkAndUnlockAchievements(userId, 'milestone', {
              chat_messages: data.chatCount,
              ...data
            });
            achievements.push(...chatAchievements);
          }
          break;

        case 'goal_completion':
          const goalAchievements = await this.checkAndUnlockAchievements(userId, 'milestone', {
            completed_goals: data.completedGoals || 1,
            goal_type: data.goalType,
            ...data
          });
          achievements.push(...goalAchievements);
          break;

        case 'streak_milestone':
          if (data.streakDays && [7, 30, 100, 365].includes(data.streakDays)) {
            const streakAchievements = await this.checkAndUnlockAchievements(userId, 'streak', {
              consecutive_days: data.streakDays,
              ...data
            });
            achievements.push(...streakAchievements);
          }
          break;
      }

      return achievements;
    } catch (error) {
      console.error('檢查特定成就失敗:', error);
      return [];
    }
  }

  /**
   * 獲取相關的成就模板
   */
  private async getRelevantAchievementTemplates(actionType: string): Promise<any[]> {
    try {
      let categoryFilter = '';
      
      switch (actionType) {
        case 'milestone':
          categoryFilter = "AND (at.type = 'milestone' OR at.category = 'milestone')";
          break;
        case 'streak':
          categoryFilter = "AND at.type = 'streak'";
          break;
        case 'collection':
          categoryFilter = "AND at.type = 'collection'";
          break;
        case 'special':
          categoryFilter = "AND at.type = 'special'";
          break;
      }

      const query = `
        SELECT * FROM achievement_templates at
        WHERE at.is_active = true ${categoryFilter}
      `;
      
      const result = await this.db.query(query);
      return result.rows;
    } catch (error) {
      console.error('獲取成就模板失敗:', error);
      return [];
    }
  }

  /**
   * 檢查成就要求是否滿足
   */
  private async checkAchievementRequirements(userId: string, template: any, actionData: Record<string, any>): Promise<boolean> {
    try {
      const requirements = template.requirements;
      
      // 檢查第一次食物記錄成就
      if (requirements.first_food_log && actionData.first_food_log) {
        return true;
      }

      // 檢查拍照記錄成就
      if (requirements.photo_logs && actionData.photo_logs >= requirements.photo_logs) {
        return true;
      }

      // 檢查聊天記錄成就
      if (requirements.chat_messages && actionData.chat_messages >= requirements.chat_messages) {
        return true;
      }

      // 檢查連續登入成就
      if (requirements.consecutive_days && actionData.consecutive_days >= requirements.consecutive_days) {
        return true;
      }

      // 檢查目標完成成就
      if (requirements.completed_goals && actionData.completed_goals >= requirements.completed_goals) {
        return true;
      }

      // 檢查食物種類收集成就
      if (requirements.unique_foods) {
        const uniqueFoodsQuery = `
          SELECT COUNT(DISTINCT food_id) as unique_count
          FROM food_logs 
          WHERE user_id = $1
        `;
        const result = await this.db.query(uniqueFoodsQuery, [userId]);
        const uniqueCount = parseInt(result.rows[0]?.unique_count || '0');
        
        if (uniqueCount >= requirements.unique_foods) {
          return true;
        }
      }

      // 檢查營養均衡成就
      if (requirements.balanced_nutrition_days) {
        // 這裡需要更複雜的邏輯來檢查營養均衡天數
        // 暫時簡化處理
        return actionData.balanced_nutrition_days >= requirements.balanced_nutrition_days;
      }

      return false;
    } catch (error) {
      console.error('檢查成就要求失敗:', error);
      return false;
    }
  }

  /**
   * 檢查並給予相關徽章
   */
  private async checkAndAwardBadges(client: any, userId: string, achievementTemplate: any): Promise<void> {
    try {
      // 根據成就類型和類別決定給予什麼徽章
      let badgeCategory = '';
      
      switch (achievementTemplate.category) {
        case 'milestone':
          badgeCategory = 'achievement';
          break;
        case 'streak':
          badgeCategory = 'streak';
          break;
        default:
          badgeCategory = achievementTemplate.category;
      }

      // 查找相關徽章模板
      const badgeQuery = `
        SELECT id FROM badge_templates 
        WHERE category = $1 AND is_active = true
        LIMIT 1
      `;
      const badgeResult = await client.query(badgeQuery, [badgeCategory]);
      
      if (badgeResult.rows.length > 0) {
        const badgeId = badgeResult.rows[0].id;
        
        // 檢查用戶是否已經有此徽章
        const userBadgeQuery = `
          SELECT id FROM user_badges 
          WHERE user_id = $1 AND badge_id = $2
        `;
        const userBadgeResult = await client.query(userBadgeQuery, [userId, badgeId]);
        
        if (userBadgeResult.rows.length === 0) {
          // 給予徽章
          const insertBadgeQuery = `
            INSERT INTO user_badges (user_id, badge_id, is_displayed)
            VALUES ($1, $2, true)
          `;
          await client.query(insertBadgeQuery, [userId, badgeId]);
        }
      }
    } catch (error) {
      console.error('檢查並給予徽章失敗:', error);
    }
  }

  /**
   * 清除用戶成就快取
   */
  private async clearUserAchievementsCache(userId: string): Promise<void> {
    await Promise.all([
      this.redis.del(`user_achievements:${userId}`),
      this.redis.del(`user_badges:${userId}`),
      this.redis.del(`user_progress:${userId}`)
    ]);
  }
}