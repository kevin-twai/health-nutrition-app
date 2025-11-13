import { Pool } from 'pg';
import { db } from '../database/connection';
import { redis } from '../database/redis';
import { 
  Leaderboard, 
  LeaderboardEntry, 
  LeaderboardType,
  DateRange 
} from '@health-tracker/shared-types';

export class LeaderboardManager {
  private db: Pool;
  private redis: any;

  constructor() {
    this.db = db.getPool();
    this.redis = redis;
  }

  /**
   * 獲取排行榜
   */
  async getLeaderboard(
    type: LeaderboardType, 
    period: 'current' | 'previous' = 'current',
    limit: number = 50,
    userId?: string
  ): Promise<Leaderboard> {
    try {
      const dateRange = this.getDateRangeForPeriod(type, period);
      const cacheKey = `leaderboard:${type}:${period}:${limit}`;
      
      // 檢查快取
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const leaderboard = JSON.parse(cached);
        if (userId) {
          leaderboard.userRank = await this.getUserRank(type, userId, dateRange);
        }
        return leaderboard;
      }

      let entries: LeaderboardEntry[] = [];
      let totalParticipants = 0;

      switch (type) {
        case LeaderboardType.WEEKLY_POINTS:
        case LeaderboardType.MONTHLY_POINTS:
          ({ entries, totalParticipants } = await this.getPointsLeaderboard(dateRange, limit));
          break;
        
        case LeaderboardType.TOTAL_POINTS:
          ({ entries, totalParticipants } = await this.getTotalPointsLeaderboard(limit));
          break;
        
        case LeaderboardType.STREAK_DAYS:
          ({ entries, totalParticipants } = await this.getStreakLeaderboard(limit));
          break;
        
        case LeaderboardType.COMPLETED_TASKS:
          ({ entries, totalParticipants } = await this.getTasksLeaderboard(dateRange, limit));
          break;
        
        case LeaderboardType.ACHIEVEMENTS:
          ({ entries, totalParticipants } = await this.getAchievementsLeaderboard(limit));
          break;
      }

      const leaderboard: Leaderboard = {
        type,
        period: dateRange,
        entries,
        totalParticipants,
        userRank: userId ? await this.getUserRank(type, userId, dateRange) : undefined
      };

      // 快取結果
      const cacheTime = type.includes('weekly') ? 3600 : 1800; // 週排行榜快取1小時，其他30分鐘
      await this.redis.setex(cacheKey, cacheTime, JSON.stringify(leaderboard));

      return leaderboard;
    } catch (error) {
      console.error('獲取排行榜失敗:', error);
      return {
        type,
        period: this.getDateRangeForPeriod(type, period),
        entries: [],
        totalParticipants: 0
      };
    }
  }

  /**
   * 更新排行榜數據
   */
  async updateLeaderboardData(): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // 更新週排行榜
      await this.updateWeeklyPointsLeaderboard(client);
      
      // 更新月排行榜
      await this.updateMonthlyPointsLeaderboard(client);
      
      // 更新任務完成排行榜
      await this.updateTasksLeaderboard(client);

      await client.query('COMMIT');

      // 清除相關快取
      await this.clearLeaderboardCache();
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('更新排行榜數據失敗:', error);
    } finally {
      client.release();
    }
  }

  /**
   * 獲取用戶在排行榜中的排名
   */
  async getUserRank(type: LeaderboardType, userId: string, dateRange?: DateRange): Promise<number | undefined> {
    try {
      let query = '';
      let params: any[] = [userId];

      switch (type) {
        case LeaderboardType.WEEKLY_POINTS:
        case LeaderboardType.MONTHLY_POINTS:
          if (!dateRange) return undefined;
          query = `
            SELECT rank FROM (
              SELECT 
                user_id,
                RANK() OVER (ORDER BY SUM(points) DESC) as rank
              FROM user_points 
              WHERE earned_at >= $2 AND earned_at < $3
              GROUP BY user_id
            ) ranked
            WHERE user_id = $1
          `;
          params.push(dateRange.start, dateRange.end);
          break;

        case LeaderboardType.TOTAL_POINTS:
          query = `
            SELECT rank FROM (
              SELECT 
                user_id,
                RANK() OVER (ORDER BY total_points DESC) as rank
              FROM user_levels
            ) ranked
            WHERE user_id = $1
          `;
          break;

        case LeaderboardType.STREAK_DAYS:
          query = `
            SELECT rank FROM (
              SELECT 
                user_id,
                RANK() OVER (ORDER BY streak_days DESC) as rank
              FROM user_levels
            ) ranked
            WHERE user_id = $1
          `;
          break;

        case LeaderboardType.COMPLETED_TASKS:
          if (!dateRange) return undefined;
          query = `
            SELECT rank FROM (
              SELECT 
                user_id,
                RANK() OVER (ORDER BY COUNT(*) DESC) as rank
              FROM user_tasks 
              WHERE status = 'completed' 
                AND completed_at >= $2 AND completed_at < $3
              GROUP BY user_id
            ) ranked
            WHERE user_id = $1
          `;
          params.push(dateRange.start, dateRange.end);
          break;

        case LeaderboardType.ACHIEVEMENTS:
          query = `
            SELECT rank FROM (
              SELECT 
                user_id,
                RANK() OVER (ORDER BY COUNT(*) DESC) as rank
              FROM user_achievements
              GROUP BY user_id
            ) ranked
            WHERE user_id = $1
          `;
          break;
      }

      const result = await this.db.query(query, params);
      return result.rows[0]?.rank || undefined;
    } catch (error) {
      console.error('獲取用戶排名失敗:', error);
      return undefined;
    }
  }

  /**
   * 獲取積分排行榜
   */
  private async getPointsLeaderboard(dateRange: DateRange, limit: number): Promise<{
    entries: LeaderboardEntry[];
    totalParticipants: number;
  }> {
    const query = `
      SELECT 
        up.user_id,
        ucp.name as user_name,
        ucp.avatar_url,
        SUM(up.points) as score,
        RANK() OVER (ORDER BY SUM(up.points) DESC) as rank
      FROM user_points up
      INNER JOIN user_complete_profile ucp ON up.user_id = ucp.id
      WHERE up.earned_at >= $1 AND up.earned_at < $2
      GROUP BY up.user_id, ucp.name, ucp.avatar_url
      ORDER BY score DESC
      LIMIT $3
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT user_id) as total
      FROM user_points 
      WHERE earned_at >= $1 AND earned_at < $2
    `;

    const [entriesResult, countResult] = await Promise.all([
      this.db.query(query, [dateRange.start, dateRange.end, limit]),
      this.db.query(countQuery, [dateRange.start, dateRange.end])
    ]);

    const entries = entriesResult.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name || '匿名用戶',
      score: parseInt(row.score),
      rank: parseInt(row.rank),
      avatar: row.avatar_url
    }));

    return {
      entries,
      totalParticipants: parseInt(countResult.rows[0]?.total || '0')
    };
  }

  /**
   * 獲取總積分排行榜
   */
  private async getTotalPointsLeaderboard(limit: number): Promise<{
    entries: LeaderboardEntry[];
    totalParticipants: number;
  }> {
    const query = `
      SELECT 
        ul.user_id,
        ucp.name as user_name,
        ucp.avatar_url,
        ul.total_points as score,
        RANK() OVER (ORDER BY ul.total_points DESC) as rank
      FROM user_levels ul
      INNER JOIN user_complete_profile ucp ON ul.user_id = ucp.id
      WHERE ul.total_points > 0
      ORDER BY ul.total_points DESC
      LIMIT $1
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_levels 
      WHERE total_points > 0
    `;

    const [entriesResult, countResult] = await Promise.all([
      this.db.query(query, [limit]),
      this.db.query(countQuery)
    ]);

    const entries = entriesResult.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name || '匿名用戶',
      score: parseInt(row.score),
      rank: parseInt(row.rank),
      avatar: row.avatar_url
    }));

    return {
      entries,
      totalParticipants: parseInt(countResult.rows[0]?.total || '0')
    };
  }

  /**
   * 獲取連續登入排行榜
   */
  private async getStreakLeaderboard(limit: number): Promise<{
    entries: LeaderboardEntry[];
    totalParticipants: number;
  }> {
    const query = `
      SELECT 
        ul.user_id,
        ucp.name as user_name,
        ucp.avatar_url,
        ul.streak_days as score,
        RANK() OVER (ORDER BY ul.streak_days DESC) as rank
      FROM user_levels ul
      INNER JOIN user_complete_profile ucp ON ul.user_id = ucp.id
      WHERE ul.streak_days > 0
      ORDER BY ul.streak_days DESC
      LIMIT $1
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_levels 
      WHERE streak_days > 0
    `;

    const [entriesResult, countResult] = await Promise.all([
      this.db.query(query, [limit]),
      this.db.query(countQuery)
    ]);

    const entries = entriesResult.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name || '匿名用戶',
      score: parseInt(row.score),
      rank: parseInt(row.rank),
      avatar: row.avatar_url
    }));

    return {
      entries,
      totalParticipants: parseInt(countResult.rows[0]?.total || '0')
    };
  }

  /**
   * 獲取任務完成排行榜
   */
  private async getTasksLeaderboard(dateRange: DateRange, limit: number): Promise<{
    entries: LeaderboardEntry[];
    totalParticipants: number;
  }> {
    const query = `
      SELECT 
        ut.user_id,
        ucp.name as user_name,
        ucp.avatar_url,
        COUNT(*) as score,
        RANK() OVER (ORDER BY COUNT(*) DESC) as rank
      FROM user_tasks ut
      INNER JOIN user_complete_profile ucp ON ut.user_id = ucp.id
      WHERE ut.status = 'completed' 
        AND ut.completed_at >= $1 AND ut.completed_at < $2
      GROUP BY ut.user_id, ucp.name, ucp.avatar_url
      ORDER BY score DESC
      LIMIT $3
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT user_id) as total
      FROM user_tasks 
      WHERE status = 'completed' 
        AND completed_at >= $1 AND completed_at < $2
    `;

    const [entriesResult, countResult] = await Promise.all([
      this.db.query(query, [dateRange.start, dateRange.end, limit]),
      this.db.query(countQuery, [dateRange.start, dateRange.end])
    ]);

    const entries = entriesResult.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name || '匿名用戶',
      score: parseInt(row.score),
      rank: parseInt(row.rank),
      avatar: row.avatar_url
    }));

    return {
      entries,
      totalParticipants: parseInt(countResult.rows[0]?.total || '0')
    };
  }

  /**
   * 獲取成就排行榜
   */
  private async getAchievementsLeaderboard(limit: number): Promise<{
    entries: LeaderboardEntry[];
    totalParticipants: number;
  }> {
    const query = `
      SELECT 
        ua.user_id,
        ucp.name as user_name,
        ucp.avatar_url,
        COUNT(*) as score,
        RANK() OVER (ORDER BY COUNT(*) DESC) as rank
      FROM user_achievements ua
      INNER JOIN user_complete_profile ucp ON ua.user_id = ucp.id
      GROUP BY ua.user_id, ucp.name, ucp.avatar_url
      ORDER BY score DESC
      LIMIT $1
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT user_id) as total
      FROM user_achievements
    `;

    const [entriesResult, countResult] = await Promise.all([
      this.db.query(query, [limit]),
      this.db.query(countQuery)
    ]);

    const entries = entriesResult.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name || '匿名用戶',
      score: parseInt(row.score),
      rank: parseInt(row.rank),
      avatar: row.avatar_url
    }));

    return {
      entries,
      totalParticipants: parseInt(countResult.rows[0]?.total || '0')
    };
  }

  /**
   * 更新週積分排行榜
   */
  private async updateWeeklyPointsLeaderboard(client: any): Promise<void> {
    const weekRange = this.getDateRangeForPeriod(LeaderboardType.WEEKLY_POINTS, 'current');
    
    // 刪除舊記錄
    await client.query(`
      DELETE FROM leaderboards 
      WHERE type = 'weekly_points' 
        AND period_start = $1 AND period_end = $2
    `, [weekRange.start, weekRange.end]);

    // 插入新記錄
    const insertQuery = `
      INSERT INTO leaderboards (user_id, type, score, rank, period_start, period_end)
      SELECT 
        user_id,
        'weekly_points' as type,
        SUM(points) as score,
        RANK() OVER (ORDER BY SUM(points) DESC) as rank,
        $1 as period_start,
        $2 as period_end
      FROM user_points 
      WHERE earned_at >= $1 AND earned_at < $2
      GROUP BY user_id
      HAVING SUM(points) > 0
    `;
    
    await client.query(insertQuery, [weekRange.start, weekRange.end]);
  }

  /**
   * 更新月積分排行榜
   */
  private async updateMonthlyPointsLeaderboard(client: any): Promise<void> {
    const monthRange = this.getDateRangeForPeriod(LeaderboardType.MONTHLY_POINTS, 'current');
    
    // 刪除舊記錄
    await client.query(`
      DELETE FROM leaderboards 
      WHERE type = 'monthly_points' 
        AND period_start = $1 AND period_end = $2
    `, [monthRange.start, monthRange.end]);

    // 插入新記錄
    const insertQuery = `
      INSERT INTO leaderboards (user_id, type, score, rank, period_start, period_end)
      SELECT 
        user_id,
        'monthly_points' as type,
        SUM(points) as score,
        RANK() OVER (ORDER BY SUM(points) DESC) as rank,
        $1 as period_start,
        $2 as period_end
      FROM user_points 
      WHERE earned_at >= $1 AND earned_at < $2
      GROUP BY user_id
      HAVING SUM(points) > 0
    `;
    
    await client.query(insertQuery, [monthRange.start, monthRange.end]);
  }

  /**
   * 更新任務完成排行榜
   */
  private async updateTasksLeaderboard(client: any): Promise<void> {
    const weekRange = this.getDateRangeForPeriod(LeaderboardType.COMPLETED_TASKS, 'current');
    
    // 刪除舊記錄
    await client.query(`
      DELETE FROM leaderboards 
      WHERE type = 'completed_tasks' 
        AND period_start = $1 AND period_end = $2
    `, [weekRange.start, weekRange.end]);

    // 插入新記錄
    const insertQuery = `
      INSERT INTO leaderboards (user_id, type, score, rank, period_start, period_end)
      SELECT 
        user_id,
        'completed_tasks' as type,
        COUNT(*) as score,
        RANK() OVER (ORDER BY COUNT(*) DESC) as rank,
        $1 as period_start,
        $2 as period_end
      FROM user_tasks 
      WHERE status = 'completed' 
        AND completed_at >= $1 AND completed_at < $2
      GROUP BY user_id
      HAVING COUNT(*) > 0
    `;
    
    await client.query(insertQuery, [weekRange.start, weekRange.end]);
  }

  /**
   * 獲取時間範圍
   */
  private getDateRangeForPeriod(type: LeaderboardType, period: 'current' | 'previous'): DateRange {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case LeaderboardType.WEEKLY_POINTS:
      case LeaderboardType.COMPLETED_TASKS:
        // 週排行榜（週一到週日）
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        start = new Date(now);
        start.setDate(now.getDate() - daysToMonday);
        start.setHours(0, 0, 0, 0);
        
        if (period === 'previous') {
          start.setDate(start.getDate() - 7);
        }
        
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;

      case LeaderboardType.MONTHLY_POINTS:
        // 月排行榜
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        
        if (period === 'previous') {
          start.setMonth(start.getMonth() - 1);
        }
        
        end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        break;

      default:
        // 總排行榜沒有時間限制
        start = new Date(0);
        end = new Date();
        break;
    }

    return { start, end };
  }

  /**
   * 清除排行榜快取
   */
  private async clearLeaderboardCache(): Promise<void> {
    const keys = await this.redis.keys('leaderboard:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}