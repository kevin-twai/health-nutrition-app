import { Pool } from 'pg';
import { db } from '../database/connection';
import { redis } from '../database/redis';
import { 
  Task, 
  TaskTemplate, 
  TaskType, 
  TaskStatus, 
  TaskDifficulty,
  PointsSource 
} from '../types/shared';

export class TaskManager {
  private db: Pool;
  private redis: any;

  constructor() {
    this.db = db.getPool();
    this.redis = redis;
  }

  /**
   * 為用戶生成每日任務
   */
  async generateDailyTasks(userId: string): Promise<Task[]> {
    try {
      // 檢查今天是否已經生成過任務
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `daily_tasks:${userId}:${today}`;
      
      const cachedTasks = await this.redis.get(cacheKey);
      if (cachedTasks) {
        return JSON.parse(cachedTasks);
      }

      // 獲取每日任務模板
      const templatesQuery = `
        SELECT * FROM task_templates 
        WHERE type = 'daily' AND is_active = true
        ORDER BY RANDOM()
        LIMIT 5
      `;
      const templatesResult = await this.db.query(templatesQuery);
      const templates = templatesResult.rows;

      const tasks: Task[] = [];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // 為每個模板創建用戶任務
      for (const template of templates) {
        const taskId = await this.createUserTask(userId, template, tomorrow);
        if (taskId) {
          const task = await this.getUserTask(taskId);
          if (task) {
            tasks.push(task);
          }
        }
      }

      // 快取結果
      await this.redis.setex(cacheKey, 86400, JSON.stringify(tasks)); // 24小時快取

      return tasks;
    } catch (error) {
      console.error('生成每日任務失敗:', error);
      throw new Error('無法生成每日任務');
    }
  }

  /**
   * 為用戶生成每週任務
   */
  async generateWeeklyTasks(userId: string): Promise<Task[]> {
    try {
      // 檢查本週是否已經生成過任務
      const weekStart = this.getWeekStart();
      const cacheKey = `weekly_tasks:${userId}:${weekStart.toISOString().split('T')[0]}`;
      
      const cachedTasks = await this.redis.get(cacheKey);
      if (cachedTasks) {
        return JSON.parse(cachedTasks);
      }

      // 獲取每週任務模板
      const templatesQuery = `
        SELECT * FROM task_templates 
        WHERE type = 'weekly' AND is_active = true
        ORDER BY RANDOM()
        LIMIT 3
      `;
      const templatesResult = await this.db.query(templatesQuery);
      const templates = templatesResult.rows;

      const tasks: Task[] = [];
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // 為每個模板創建用戶任務
      for (const template of templates) {
        const taskId = await this.createUserTask(userId, template, weekEnd);
        if (taskId) {
          const task = await this.getUserTask(taskId);
          if (task) {
            tasks.push(task);
          }
        }
      }

      // 快取結果
      await this.redis.setex(cacheKey, 604800, JSON.stringify(tasks)); // 7天快取

      return tasks;
    } catch (error) {
      console.error('生成每週任務失敗:', error);
      throw new Error('無法生成每週任務');
    }
  }

  /**
   * 為用戶生成每月任務
   */
  async generateMonthlyTasks(userId: string): Promise<Task[]> {
    try {
      // 檢查本月是否已經生成過任務
      const monthStart = this.getMonthStart();
      const cacheKey = `monthly_tasks:${userId}:${monthStart.toISOString().split('T')[0]}`;
      
      const cachedTasks = await this.redis.get(cacheKey);
      if (cachedTasks) {
        return JSON.parse(cachedTasks);
      }

      // 獲取每月任務模板
      const templatesQuery = `
        SELECT * FROM task_templates 
        WHERE type = 'monthly' AND is_active = true
        ORDER BY RANDOM()
        LIMIT 2
      `;
      const templatesResult = await this.db.query(templatesQuery);
      const templates = templatesResult.rows;

      const tasks: Task[] = [];
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      // 為每個模板創建用戶任務
      for (const template of templates) {
        const taskId = await this.createUserTask(userId, template, monthEnd);
        if (taskId) {
          const task = await this.getUserTask(taskId);
          if (task) {
            tasks.push(task);
          }
        }
      }

      // 快取結果
      await this.redis.setex(cacheKey, 2592000, JSON.stringify(tasks)); // 30天快取

      return tasks;
    } catch (error) {
      console.error('生成每月任務失敗:', error);
      throw new Error('無法生成每月任務');
    }
  }

  /**
   * 創建用戶任務
   */
  private async createUserTask(userId: string, template: any, expiresAt: Date): Promise<string | null> {
    try {
      const query = `
        INSERT INTO user_tasks (
          user_id, template_id, title, description, type, points, 
          target, expires_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      
      const values = [
        userId,
        template.id,
        template.title,
        template.description,
        template.type,
        template.points,
        template.requirements?.count || 1,
        expiresAt,
        TaskStatus.PENDING
      ];

      const result = await this.db.query(query, values);
      return result.rows[0]?.id || null;
    } catch (error) {
      console.error('創建用戶任務失敗:', error);
      return null;
    }
  }

  /**
   * 獲取用戶任務
   */
  async getUserTask(taskId: string): Promise<Task | null> {
    try {
      const query = `
        SELECT 
          ut.*,
          tt.category,
          tt.difficulty,
          tt.requirements
        FROM user_tasks ut
        LEFT JOIN task_templates tt ON ut.template_id = tt.id
        WHERE ut.id = $1
      `;
      
      const result = await this.db.query(query, [taskId]);
      const row = result.rows[0];
      
      if (!row) return null;

      return this.mapRowToTask(row);
    } catch (error) {
      console.error('獲取用戶任務失敗:', error);
      return null;
    }
  }

  /**
   * 獲取用戶的所有活躍任務
   */
  async getUserActiveTasks(userId: string): Promise<Task[]> {
    try {
      const query = `
        SELECT 
          ut.*,
          tt.category,
          tt.difficulty,
          tt.requirements
        FROM user_tasks ut
        LEFT JOIN task_templates tt ON ut.template_id = tt.id
        WHERE ut.user_id = $1 
          AND ut.status IN ('pending', 'in_progress')
          AND (ut.expires_at IS NULL OR ut.expires_at > NOW())
        ORDER BY ut.type, ut.created_at
      `;
      
      const result = await this.db.query(query, [userId]);
      return result.rows.map(row => this.mapRowToTask(row));
    } catch (error) {
      console.error('獲取用戶活躍任務失敗:', error);
      return [];
    }
  }

  /**
   * 更新任務進度
   */
  async updateTaskProgress(taskId: string, progressDelta: number, metadata?: Record<string, any>): Promise<boolean> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // 獲取當前任務狀態
      const taskQuery = `
        SELECT id, user_id, progress, target, status, points
        FROM user_tasks 
        WHERE id = $1 AND status IN ('pending', 'in_progress')
      `;
      const taskResult = await client.query(taskQuery, [taskId]);
      
      if (taskResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const task = taskResult.rows[0];
      const previousProgress = task.progress;
      const newProgress = Math.min(previousProgress + progressDelta, task.target);
      const isCompleted = newProgress >= task.target;

      // 更新任務進度
      const updateQuery = `
        UPDATE user_tasks 
        SET 
          progress = $1,
          status = $2,
          started_at = COALESCE(started_at, NOW()),
          completed_at = CASE WHEN $3 THEN NOW() ELSE completed_at END,
          updated_at = NOW()
        WHERE id = $4
      `;
      
      const newStatus = isCompleted ? TaskStatus.COMPLETED : 
                       (previousProgress === 0 ? TaskStatus.IN_PROGRESS : task.status);
      
      await client.query(updateQuery, [newProgress, newStatus, isCompleted, taskId]);

      // 記錄進度變化
      const logQuery = `
        INSERT INTO task_progress_logs (
          task_id, progress_delta, previous_progress, new_progress, metadata
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(logQuery, [taskId, progressDelta, previousProgress, newProgress, JSON.stringify(metadata || {})]);

      // 如果任務完成，給予積分獎勵
      if (isCompleted && newStatus !== TaskStatus.COMPLETED) {
        await this.awardTaskPoints(client, task.user_id, task.points, taskId);
      }

      await client.query('COMMIT');

      // 清除相關快取
      await this.clearUserTasksCache(task.user_id);

      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('更新任務進度失敗:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * 檢查並更新過期任務
   */
  async updateExpiredTasks(): Promise<number> {
    try {
      const query = `
        UPDATE user_tasks 
        SET status = 'expired', updated_at = NOW()
        WHERE status IN ('pending', 'in_progress') 
          AND expires_at IS NOT NULL 
          AND expires_at < NOW()
      `;
      
      const result = await this.db.query(query);
      return result.rowCount || 0;
    } catch (error) {
      console.error('更新過期任務失敗:', error);
      return 0;
    }
  }

  /**
   * 根據用戶行為動態生成任務
   */
  async generateDynamicTask(userId: string, actionType: string, actionData: Record<string, any>): Promise<Task | null> {
    try {
      // 根據用戶行為決定生成什麼類型的任務
      let taskTemplate: Partial<TaskTemplate> | null = null;

      switch (actionType) {
        case 'first_food_log':
          taskTemplate = {
            title: '繼續記錄',
            description: '再記錄2次餐點來建立良好習慣',
            type: TaskType.DAILY,
            category: 'logging',
            points: 30,
            difficulty: TaskDifficulty.EASY,
            requirements: { food_logs: 2 }
          };
          break;

        case 'photo_recognition_used':
          taskTemplate = {
            title: '拍照記錄達人',
            description: '使用拍照功能記錄5次餐點',
            type: TaskType.WEEKLY,
            category: 'logging',
            points: 75,
            difficulty: TaskDifficulty.MEDIUM,
            requirements: { photo_logs: 5 }
          };
          break;

        case 'chat_with_ai':
          taskTemplate = {
            title: 'AI顧問互動',
            description: '與AI營養顧問進行3次對話',
            type: TaskType.WEEKLY,
            category: 'social',
            points: 60,
            difficulty: TaskDifficulty.EASY,
            requirements: { chat_messages: 3 }
          };
          break;
      }

      if (!taskTemplate) return null;

      // 檢查是否已經有類似的任務
      const existingTaskQuery = `
        SELECT id FROM user_tasks 
        WHERE user_id = $1 
          AND title = $2 
          AND status IN ('pending', 'in_progress')
          AND expires_at > NOW()
      `;
      const existingResult = await this.db.query(existingTaskQuery, [userId, taskTemplate.title]);
      
      if (existingResult.rows.length > 0) {
        return null; // 已經有類似任務
      }

      // 創建動態任務
      const expiresAt = new Date();
      if (taskTemplate.type === TaskType.DAILY) {
        expiresAt.setDate(expiresAt.getDate() + 1);
      } else if (taskTemplate.type === TaskType.WEEKLY) {
        expiresAt.setDate(expiresAt.getDate() + 7);
      }

      const insertQuery = `
        INSERT INTO user_tasks (
          user_id, title, description, type, points, target, expires_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const values = [
        userId,
        taskTemplate.title,
        taskTemplate.description,
        taskTemplate.type,
        taskTemplate.points,
        taskTemplate.requirements?.food_logs || taskTemplate.requirements?.photo_logs || taskTemplate.requirements?.chat_messages || 1,
        expiresAt,
        TaskStatus.PENDING
      ];

      const result = await this.db.query(insertQuery, values);
      const taskId = result.rows[0]?.id;

      if (taskId) {
        return await this.getUserTask(taskId);
      }

      return null;
    } catch (error) {
      console.error('生成動態任務失敗:', error);
      return null;
    }
  }

  /**
   * 獲取任務完成統計
   */
  async getTaskCompletionStats(userId: string, period: 'week' | 'month' | 'all' = 'week'): Promise<{
    completed: number;
    total: number;
    completionRate: number;
    pointsEarned: number;
  }> {
    try {
      let dateFilter = '';
      if (period === 'week') {
        dateFilter = "AND ut.created_at >= DATE_TRUNC('week', NOW())";
      } else if (period === 'month') {
        dateFilter = "AND ut.created_at >= DATE_TRUNC('month', NOW())";
      }

      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN points ELSE 0 END), 0) as points_earned
        FROM user_tasks ut
        WHERE user_id = $1 ${dateFilter}
      `;
      
      const result = await this.db.query(query, [userId]);
      const stats = result.rows[0];

      const total = parseInt(stats.total);
      const completed = parseInt(stats.completed);
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        completed,
        total,
        completionRate,
        pointsEarned: parseInt(stats.points_earned)
      };
    } catch (error) {
      console.error('獲取任務完成統計失敗:', error);
      return { completed: 0, total: 0, completionRate: 0, pointsEarned: 0 };
    }
  }

  /**
   * 給予任務完成積分
   */
  private async awardTaskPoints(client: any, userId: string, points: number, taskId: string): Promise<void> {
    const pointsQuery = `
      INSERT INTO user_points (user_id, points, source, source_id, description)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(pointsQuery, [
      userId, 
      points, 
      PointsSource.TASK_COMPLETION, 
      taskId, 
      '任務完成獎勵'
    ]);
  }

  /**
   * 清除用戶任務快取
   */
  private async clearUserTasksCache(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = this.getWeekStart().toISOString().split('T')[0];
    const monthStart = this.getMonthStart().toISOString().split('T')[0];

    await Promise.all([
      this.redis.del(`daily_tasks:${userId}:${today}`),
      this.redis.del(`weekly_tasks:${userId}:${weekStart}`),
      this.redis.del(`monthly_tasks:${userId}:${monthStart}`)
    ]);
  }

  /**
   * 將資料庫行映射為 Task 物件
   */
  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      templateId: row.template_id,
      title: row.title,
      description: row.description,
      type: row.type as TaskType,
      category: row.category || 'general',
      points: row.points,
      difficulty: row.difficulty as TaskDifficulty || TaskDifficulty.EASY,
      status: row.status as TaskStatus,
      progress: row.progress,
      target: row.target,
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      requirements: row.requirements || {}
    };
  }

  /**
   * 獲取本週開始日期
   */
  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 週一為一週開始
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  /**
   * 獲取本月開始日期
   */
  private getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}