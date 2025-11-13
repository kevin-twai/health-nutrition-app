import { TaskManager } from './TaskManager';
import { PointsCalculator } from './PointsCalculator';
import { AchievementTracker } from './AchievementTracker';
import { LeaderboardManager } from './LeaderboardManager';
import { 
  UserProgress, 
  Task, 
  Achievement, 
  Badge,
  Leaderboard,
  LeaderboardType,
  PointsSource,
  TaskType 
} from '../types/shared';

export class GamificationService {
  private taskManager: TaskManager;
  private pointsCalculator: PointsCalculator;
  private achievementTracker: AchievementTracker;
  private leaderboardManager: LeaderboardManager;

  constructor() {
    this.taskManager = new TaskManager();
    this.pointsCalculator = new PointsCalculator();
    this.achievementTracker = new AchievementTracker();
    this.leaderboardManager = new LeaderboardManager();
  }

  /**
   * 獲取用戶完整的遊戲化進度
   */
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const [
        baseProgress,
        achievements,
        badges,
        activeTasks
      ] = await Promise.all([
        this.pointsCalculator.getUserProgress(userId),
        this.achievementTracker.getUserAchievements(userId),
        this.achievementTracker.getUserBadges(userId),
        this.taskManager.getUserActiveTasks(userId)
      ]);

      if (!baseProgress) return null;

      return {
        ...baseProgress,
        achievements,
        badges,
        currentTasks: activeTasks
      };
    } catch (error) {
      console.error('獲取用戶遊戲化進度失敗:', error);
      return null;
    }
  }

  /**
   * 處理用戶行為並觸發相應的遊戲化機制
   */
  async processUserAction(userId: string, actionType: string, actionData: Record<string, any>): Promise<{
    pointsEarned: number;
    tasksUpdated: string[];
    achievementsUnlocked: Achievement[];
    levelUp?: boolean;
    newLevel?: number;
  }> {
    const result = {
      pointsEarned: 0,
      tasksUpdated: [] as string[],
      achievementsUnlocked: [] as Achievement[],
      levelUp: false,
      newLevel: undefined as number | undefined
    };

    try {
      const previousProgress = await this.pointsCalculator.getUserProgress(userId);
      const previousLevel = previousProgress?.level || 1;

      // 1. 檢查並更新相關任務
      const activeTasks = await this.taskManager.getUserActiveTasks(userId);
      for (const task of activeTasks) {
        const shouldUpdate = this.shouldUpdateTask(task, actionType, actionData);
        if (shouldUpdate) {
          const progressDelta = this.calculateTaskProgressDelta(task, actionType, actionData);
          if (progressDelta > 0) {
            const updated = await this.taskManager.updateTaskProgress(task.id, progressDelta, actionData);
            if (updated) {
              result.tasksUpdated.push(task.id);
              
              // 如果任務完成，積分會在 TaskManager 中自動給予
              if (task.progress + progressDelta >= task.target) {
                result.pointsEarned += task.points;
              }
            }
          }
        }
      }

      // 2. 檢查並解鎖成就
      const unlockedAchievements = await this.achievementTracker.checkAndUnlockAchievements(
        userId, 
        actionType, 
        actionData
      );
      result.achievementsUnlocked = unlockedAchievements;
      
      // 成就積分會在 AchievementTracker 中自動給予
      result.pointsEarned += unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

      // 3. 根據行為類型給予額外積分
      const bonusPoints = this.calculateBonusPoints(actionType, actionData);
      if (bonusPoints > 0) {
        await this.pointsCalculator.awardPoints(
          userId,
          bonusPoints,
          PointsSource.BONUS,
          undefined,
          `${actionType} 行為獎勵`
        );
        result.pointsEarned += bonusPoints;
      }

      // 4. 檢查是否有動態任務需要生成
      const dynamicTask = await this.taskManager.generateDynamicTask(userId, actionType, actionData);
      if (dynamicTask) {
        // 動態任務生成不計入當前結果，但會在下次獲取任務時顯示
      }

      // 5. 檢查等級提升
      const currentProgress = await this.pointsCalculator.getUserProgress(userId);
      if (currentProgress && currentProgress.level > previousLevel) {
        result.levelUp = true;
        result.newLevel = currentProgress.level;
      }

      return result;
    } catch (error) {
      console.error('處理用戶行為失敗:', error);
      return result;
    }
  }

  /**
   * 處理每日登入
   */
  async processDailyLogin(userId: string): Promise<{
    points: number;
    streakDays: number;
    isNewStreak: boolean;
    achievementsUnlocked: Achievement[];
  }> {
    try {
      // 處理登入獎勵
      const loginResult = await this.pointsCalculator.processDailyLogin(userId);
      
      // 檢查連續登入成就
      const achievements = await this.achievementTracker.checkSpecificAchievement(
        userId,
        'streak_milestone',
        { streakDays: loginResult.streakDays }
      );

      return {
        ...loginResult,
        achievementsUnlocked: achievements
      };
    } catch (error) {
      console.error('處理每日登入失敗:', error);
      return {
        points: 0,
        streakDays: 0,
        isNewStreak: false,
        achievementsUnlocked: []
      };
    }
  }

  /**
   * 生成用戶任務
   */
  async generateUserTasks(userId: string): Promise<{
    dailyTasks: Task[];
    weeklyTasks: Task[];
    monthlyTasks: Task[];
  }> {
    try {
      const [dailyTasks, weeklyTasks, monthlyTasks] = await Promise.all([
        this.taskManager.generateDailyTasks(userId),
        this.taskManager.generateWeeklyTasks(userId),
        this.taskManager.generateMonthlyTasks(userId)
      ]);

      return {
        dailyTasks,
        weeklyTasks,
        monthlyTasks
      };
    } catch (error) {
      console.error('生成用戶任務失敗:', error);
      return {
        dailyTasks: [],
        weeklyTasks: [],
        monthlyTasks: []
      };
    }
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
    return await this.leaderboardManager.getLeaderboard(type, period, limit, userId);
  }

  /**
   * 獲取用戶統計數據
   */
  async getUserStats(userId: string): Promise<{
    taskStats: {
      completed: number;
      total: number;
      completionRate: number;
      pointsEarned: number;
    };
    achievementStats: {
      totalAchievements: number;
      unlockedAchievements: number;
      totalBadges: number;
      pointsFromAchievements: number;
      rarityBreakdown: Record<string, number>;
    };
  }> {
    try {
      const [taskStats, achievementStats] = await Promise.all([
        this.taskManager.getTaskCompletionStats(userId),
        this.achievementTracker.getAchievementStats(userId)
      ]);

      return {
        taskStats,
        achievementStats
      };
    } catch (error) {
      console.error('獲取用戶統計失敗:', error);
      return {
        taskStats: { completed: 0, total: 0, completionRate: 0, pointsEarned: 0 },
        achievementStats: {
          totalAchievements: 0,
          unlockedAchievements: 0,
          totalBadges: 0,
          pointsFromAchievements: 0,
          rarityBreakdown: {}
        }
      };
    }
  }

  /**
   * 更新排行榜數據（定期任務）
   */
  async updateLeaderboards(): Promise<void> {
    try {
      await this.leaderboardManager.updateLeaderboardData();
    } catch (error) {
      console.error('更新排行榜失敗:', error);
    }
  }

  /**
   * 清理過期任務（定期任務）
   */
  async cleanupExpiredTasks(): Promise<number> {
    try {
      return await this.taskManager.updateExpiredTasks();
    } catch (error) {
      console.error('清理過期任務失敗:', error);
      return 0;
    }
  }

  /**
   * 判斷是否應該更新任務
   */
  private shouldUpdateTask(task: Task, actionType: string, actionData: Record<string, any>): boolean {
    const requirements = task.requirements || {};

    switch (actionType) {
      case 'food_log_created':
        return !!(requirements.meal_type || requirements.food_logs || requirements.photo_logs);
      
      case 'photo_recognition_used':
        return !!(requirements.photo_logs);
      
      case 'chat_message_sent':
        return !!(requirements.chat_messages || requirements.chat_sessions);
      
      case 'calorie_target_met':
        return !!(requirements.calorie_target_tolerance);
      
      case 'nutrition_balanced':
        return !!(requirements.balanced_nutrition_days || requirements.macro_balance_days);
      
      case 'new_food_tried':
        return !!(requirements.new_foods || requirements.unique_foods);
      
      default:
        return false;
    }
  }

  /**
   * 計算任務進度增量
   */
  private calculateTaskProgressDelta(task: Task, actionType: string, actionData: Record<string, any>): number {
    const requirements = task.requirements || {};

    switch (actionType) {
      case 'food_log_created':
        if (requirements.meal_type && actionData.mealType === requirements.meal_type) {
          return 1;
        }
        if (requirements.food_logs) {
          return 1;
        }
        break;
      
      case 'photo_recognition_used':
        if (requirements.photo_logs) {
          return 1;
        }
        break;
      
      case 'chat_message_sent':
        if (requirements.chat_messages) {
          return 1;
        }
        if (requirements.chat_sessions && actionData.isNewSession) {
          return 1;
        }
        break;
      
      case 'calorie_target_met':
        if (requirements.calorie_target_tolerance) {
          return 1;
        }
        break;
      
      case 'nutrition_balanced':
        if (requirements.balanced_nutrition_days || requirements.macro_balance_days) {
          return 1;
        }
        break;
      
      case 'new_food_tried':
        if (requirements.new_foods || requirements.unique_foods) {
          return actionData.newFoodCount || 1;
        }
        break;
    }

    return 0;
  }

  /**
   * 計算行為獎勵積分
   */
  private calculateBonusPoints(actionType: string, actionData: Record<string, any>): number {
    switch (actionType) {
      case 'food_log_created':
        return 5; // 基礎記錄獎勵
      
      case 'photo_recognition_used':
        return 10; // 使用拍照功能額外獎勵
      
      case 'chat_message_sent':
        return 3; // 與AI互動獎勵
      
      case 'calorie_target_met':
        return 15; // 達成熱量目標獎勵
      
      case 'nutrition_balanced':
        return 20; // 營養均衡獎勵
      
      case 'new_food_tried':
        return (actionData.newFoodCount || 1) * 8; // 每種新食物8分
      
      case 'goal_progress_made':
        return Math.round((actionData.progressPercentage || 0) * 0.5); // 目標進度獎勵
      
      default:
        return 0;
    }
  }
}