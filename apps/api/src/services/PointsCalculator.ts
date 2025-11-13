import { Pool } from 'pg';
import { db } from '../database/connection';
import { redis } from '../database/redis';
import { 
  PointsRecord, 
  PointsSource,
  UserProgress 
} from '../types/shared';

export class PointsCalculator {
  private db: Pool;
  private redis: any;

  constructor() {
    this.db = db.getPool();
    this.redis = redis;
  }

  /**
   * 給予用戶積分
   */
  async awardPoints(
    userId: string, 
    points: number, 
    source: PointsSource, 
    sourceId?: string, 
    description?: string
  ): Promise<boolean> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // 記錄積分獲得
      const pointsQuery = `
        INSERT INTO user_points (user_id, points, source, source_id, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      await client.query(pointsQuery, [userId, points, source, sourceId, description]);

      // 更新用戶總積分和經驗值
      await this.updateUserLevel(client, userId, points);

      await client.query('COMMIT');

      // 清除用戶進度快取
      await this.clearUserProgressCache(userId);

      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('給予積分失敗:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * 計算每日登入獎勵
   */
  async calculateDailyLoginReward(userId: string): Promise<number> {
    try {
      // 獲取用戶連續登入天數
      const streakDays = await this.getUserStreakDays(userId);
      
      // 基礎登入獎勵
      let baseReward = 10;
      
      // 連續登入獎勵加成
      let streakBonus = 0;
      if (streakDays >= 7) {
        streakBonus = Math.floor(streakDays / 7) * 5; // 每週額外5分
      }
      
      // 最大獎勵限制
      const maxBonus = 50;
      streakBonus = Math.min(streakBonus, maxBonus);
      
      return baseReward + streakBonus;
    } catch (error) {
      console.error('計算每日登入獎勵失敗:', error);
      return 10; // 返回基礎獎勵
    }
  }

  /**
   * 處理每日登入
   */
  async processDailyLogin(userId: string): Promise<{ points: number; streakDays: number; isNewStreak: boolean }> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      const today = new Date().toISOString().split('T')[0];
      
      // 檢查今天是否已經登入過
      const loginCheckQuery = `
        SELECT earned_at FROM user_points 
        WHERE user_id = $1 AND source = $2 AND DATE(earned_at) = $3
      `;
      const loginCheck = await client.query(loginCheckQuery, [userId, PointsSource.DAILY_LOGIN, today]);
      
      if (loginCheck.rows.length > 0) {
        // 今天已經登入過
        const streakDays = await this.getUserStreakDays(userId);
        await client.query('ROLLBACK');
        return { points: 0, streakDays, isNewStreak: false };
      }

      // 更新用戶等級表的最後活動日期和連續天數
      const levelQuery = `
        INSERT INTO user_levels (user_id, last_activity_date, streak_days)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id) DO UPDATE SET
          last_activity_date = $2,
          streak_days = CASE 
            WHEN user_levels.last_activity_date = $2::date - INTERVAL '1 day' THEN user_levels.streak_days + 1
            ELSE 1
          END,
          updated_at = NOW()
        RETURNING streak_days
      `;
      const levelResult = await client.query(levelQuery, [userId, today]);
      const streakDays = levelResult.rows[0].streak_days;

      // 計算登入獎勵
      const points = await this.calculateDailyLoginReward(userId);
      
      // 記錄登入積分
      const pointsQuery = `
        INSERT INTO user_points (user_id, points, source, description)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(pointsQuery, [userId, points, PointsSource.DAILY_LOGIN, `每日登入獎勵 (連續${streakDays}天)`]);

      // 更新總積分和經驗值
      await this.updateUserLevel(client, userId, points);

      // 檢查連續登入成就
      if (streakDays > 1) {
        await this.checkStreakAchievements(client, userId, streakDays);
      }

      await client.query('COMMIT');

      // 清除快取
      await this.clearUserProgressCache(userId);

      return { points, streakDays, isNewStreak: streakDays === 1 };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('處理每日登入失敗:', error);
      return { points: 0, streakDays: 0, isNewStreak: false };
    } finally {
      client.release();
    }
  }

  /**
   * 計算任務完成獎勵
   */
  async calculateTaskCompletionReward(taskType: string, difficulty: string, basePoints: number): Promise<number> {
    let multiplier = 1;
    
    // 根據任務類型調整倍數
    switch (taskType) {
      case 'daily':
        multiplier = 1;
        break;
      case 'weekly':
        multiplier = 1.5;
        break;
      case 'monthly':
        multiplier = 2;
        break;
      case 'milestone':
        multiplier = 3;
        break;
    }
    
    // 根據難度調整倍數
    switch (difficulty) {
      case 'easy':
        multiplier *= 1;
        break;
      case 'medium':
        multiplier *= 1.2;
        break;
      case 'hard':
        multiplier *= 1.5;
        break;
      case 'expert':
        multiplier *= 2;
        break;
    }
    
    return Math.round(basePoints * multiplier);
  }

  /**
   * 獲取用戶積分記錄
   */
  async getUserPointsHistory(userId: string, limit: number = 50, offset: number = 0): Promise<PointsRecord[]> {
    try {
      const query = `
        SELECT * FROM user_points 
        WHERE user_id = $1 
        ORDER BY earned_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const result = await this.db.query(query, [userId, limit, offset]);
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        points: row.points,
        source: row.source as PointsSource,
        sourceId: row.source_id,
        description: row.description,
        earnedAt: new Date(row.earned_at)
      }));
    } catch (error) {
      console.error('獲取用戶積分記錄失敗:', error);
      return [];
    }
  }

  /**
   * 獲取用戶當前等級和進度
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      // 先檢查快取
      const cacheKey = `user_progress:${userId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT 
          ul.*,
          COUNT(DISTINCT ua.id) as total_achievements,
          COUNT(DISTINCT ub.id) as total_badges,
          COUNT(DISTINCT CASE WHEN ut.status = 'completed' THEN ut.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN ut.status IN ('pending', 'in_progress') THEN ut.id END) as active_tasks
        FROM user_levels ul
        LEFT JOIN user_achievements ua ON ul.user_id = ua.user_id
        LEFT JOIN user_badges ub ON ul.user_id = ub.user_id
        LEFT JOIN user_tasks ut ON ul.user_id = ut.user_id
        WHERE ul.user_id = $1
        GROUP BY ul.id, ul.user_id, ul.level, ul.experience_points, ul.total_points, ul.streak_days, ul.last_activity_date
      `;
      
      const result = await this.db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        // 如果用戶沒有等級記錄，創建一個
        await this.initializeUserLevel(userId);
        return await this.getUserProgress(userId);
      }

      const row = result.rows[0];
      const progress: UserProgress = {
        level: row.level,
        experiencePoints: row.experience_points,
        totalPoints: row.total_points,
        streakDays: row.streak_days,
        lastActivityDate: row.last_activity_date ? new Date(row.last_activity_date) : undefined,
        achievements: [], // 將在其他方法中填充
        badges: [], // 將在其他方法中填充
        currentTasks: [], // 將在其他方法中填充
        completedTasks: parseInt(row.completed_tasks) || 0,
        activeTasks: parseInt(row.active_tasks) || 0
      };

      // 快取結果
      await this.redis.setex(cacheKey, 300, JSON.stringify(progress)); // 5分鐘快取

      return progress;
    } catch (error) {
      console.error('獲取用戶進度失敗:', error);
      return null;
    }
  }

  /**
   * 計算等級所需經驗值
   */
  calculateLevelRequirement(level: number): number {
    // 使用指數增長公式：每級所需經驗 = 100 * level^1.5
    return Math.round(100 * Math.pow(level, 1.5));
  }

  /**
   * 根據經驗值計算等級
   */
  calculateLevelFromExperience(experiencePoints: number): number {
    let level = 1;
    while (true) {
      const requiredExp = this.calculateLevelRequirement(level + 1);
      if (experiencePoints < requiredExp) {
        break;
      }
      level++;
    }
    return level;
  }

  /**
   * 獲取用戶連續登入天數
   */
  private async getUserStreakDays(userId: string): Promise<number> {
    try {
      const query = `
        SELECT streak_days FROM user_levels WHERE user_id = $1
      `;
      const result = await this.db.query(query, [userId]);
      return result.rows[0]?.streak_days || 0;
    } catch (error) {
      console.error('獲取連續登入天數失敗:', error);
      return 0;
    }
  }

  /**
   * 更新用戶等級和經驗值
   */
  private async updateUserLevel(client: any, userId: string, pointsToAdd: number): Promise<void> {
    // 更新總積分和經驗值
    const updateQuery = `
      INSERT INTO user_levels (user_id, experience_points, total_points)
      VALUES ($1, $2, $2)
      ON CONFLICT (user_id) DO UPDATE SET
        experience_points = user_levels.experience_points + $2,
        total_points = user_levels.total_points + $2,
        updated_at = NOW()
      RETURNING experience_points
    `;
    const result = await client.query(updateQuery, [userId, pointsToAdd]);
    const newExperience = result.rows[0].experience_points;

    // 計算新等級
    const newLevel = this.calculateLevelFromExperience(newExperience);
    
    // 更新等級
    const levelUpdateQuery = `
      UPDATE user_levels 
      SET level = $1, updated_at = NOW()
      WHERE user_id = $2 AND level < $1
      RETURNING level
    `;
    const levelResult = await client.query(levelUpdateQuery, [newLevel, userId]);
    
    // 如果等級提升，給予等級提升獎勵
    if (levelResult.rows.length > 0) {
      const levelUpBonus = newLevel * 50; // 每級50分獎勵
      const bonusQuery = `
        INSERT INTO user_points (user_id, points, source, description)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(bonusQuery, [userId, levelUpBonus, PointsSource.BONUS, `等級提升至 ${newLevel} 級獎勵`]);
    }
  }

  /**
   * 檢查連續登入成就
   */
  private async checkStreakAchievements(client: any, userId: string, streakDays: number): Promise<void> {
    const streakMilestones = [7, 30, 100, 365];
    
    for (const milestone of streakMilestones) {
      if (streakDays === milestone) {
        // 檢查是否已經獲得此成就
        const achievementQuery = `
          SELECT id FROM achievement_templates 
          WHERE type = 'streak' AND requirements->>'consecutive_days' = $1
        `;
        const achievementResult = await client.query(achievementQuery, [milestone.toString()]);
        
        if (achievementResult.rows.length > 0) {
          const achievementId = achievementResult.rows[0].id;
          
          // 檢查用戶是否已經獲得此成就
          const userAchievementQuery = `
            SELECT id FROM user_achievements 
            WHERE user_id = $1 AND achievement_id = $2
          `;
          const userAchievementResult = await client.query(userAchievementQuery, [userId, achievementId]);
          
          if (userAchievementResult.rows.length === 0) {
            // 給予成就
            const insertAchievementQuery = `
              INSERT INTO user_achievements (user_id, achievement_id)
              VALUES ($1, $2)
            `;
            await client.query(insertAchievementQuery, [userId, achievementId]);
            
            // 給予成就積分獎勵
            const achievementPoints = milestone * 2; // 連續天數 * 2 的積分獎勵
            const pointsQuery = `
              INSERT INTO user_points (user_id, points, source, source_id, description)
              VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(pointsQuery, [
              userId, 
              achievementPoints, 
              PointsSource.ACHIEVEMENT, 
              achievementId, 
              `連續登入${milestone}天成就獎勵`
            ]);
          }
        }
        break;
      }
    }
  }

  /**
   * 初始化用戶等級
   */
  private async initializeUserLevel(userId: string): Promise<void> {
    try {
      const query = `
        INSERT INTO user_levels (user_id, level, experience_points, total_points, streak_days)
        VALUES ($1, 1, 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING
      `;
      await this.db.query(query, [userId]);
    } catch (error) {
      console.error('初始化用戶等級失敗:', error);
    }
  }

  /**
   * 清除用戶進度快取
   */
  private async clearUserProgressCache(userId: string): Promise<void> {
    await this.redis.del(`user_progress:${userId}`);
  }
}