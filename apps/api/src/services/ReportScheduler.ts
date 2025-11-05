import cron from 'node-cron';
import { 
  ReportFrequency, 
  DeliveryMethod, 
  ReportSettings,
  HealthReport,
  DateRange
} from '@health-tracker/shared-types';
import { DataAggregator } from './DataAggregator';
import { TrendAnalyzer } from './TrendAnalyzer';
import { ReportTemplateFactory } from './ReportTemplate';
import { DeliveryManager } from './DeliveryManager';
import { UserRepository } from '../repositories/UserRepository';

/**
 * 排程任務介面
 */
export interface ScheduledTask {
  id: string;
  userId: string;
  frequency: ReportFrequency;
  settings: ReportSettings;
  nextRunTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 報告排程器
 * 負責管理自動化報告生成和發送
 */
export class ReportScheduler {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
  private userTasks: Map<string, ScheduledTask[]> = new Map();

  constructor(
    private dataAggregator: DataAggregator,
    private trendAnalyzer: TrendAnalyzer,
    private userRepository: UserRepository,
    private deliveryManager: DeliveryManager
  ) {
    this.initializeScheduler();
  }

  /**
   * 初始化排程器
   */
  private initializeScheduler(): void {
    console.log('報告排程器已初始化');
    
    // 每天檢查是否有需要執行的任務
    cron.schedule('0 0 * * *', () => {
      this.checkAndExecuteTasks();
    });
  }

  /**
   * 為用戶建立報告排程
   */
  async createSchedule(
    userId: string,
    frequency: ReportFrequency,
    settings: ReportSettings
  ): Promise<ScheduledTask> {
    const taskId = `${userId}_${frequency}_${Date.now()}`;
    const nextRunTime = this.calculateNextRunTime(frequency);

    const scheduledTask: ScheduledTask = {
      id: taskId,
      userId,
      frequency,
      settings,
      nextRunTime,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 儲存任務
    if (!this.userTasks.has(userId)) {
      this.userTasks.set(userId, []);
    }
    this.userTasks.get(userId)!.push(scheduledTask);

    // 建立 cron 任務
    const cronExpression = this.getCronExpression(frequency);
    const cronTask = cron.schedule(cronExpression, async () => {
      await this.executeReportGeneration(scheduledTask);
    }, {
      scheduled: true,
      timezone: 'Asia/Taipei'
    });

    this.scheduledTasks.set(taskId, cronTask);

    console.log(`已為用戶 ${userId} 建立 ${frequency} 報告排程，任務ID: ${taskId}`);
    return scheduledTask;
  }

  /**
   * 更新排程設定
   */
  async updateSchedule(
    taskId: string,
    settings: Partial<ReportSettings>
  ): Promise<ScheduledTask | null> {
    // 找到對應的任務
    for (const [userId, tasks] of this.userTasks.entries()) {
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        
        // 更新設定
        task.settings = { ...task.settings, ...settings };
        task.updatedAt = new Date();

        console.log(`已更新排程任務 ${taskId} 的設定`);
        return task;
      }
    }

    return null;
  }

  /**
   * 停用排程
   */
  async deactivateSchedule(taskId: string): Promise<boolean> {
    const cronTask = this.scheduledTasks.get(taskId);
    if (cronTask) {
      cronTask.stop();
      this.scheduledTasks.delete(taskId);
    }

    // 更新任務狀態
    for (const [userId, tasks] of this.userTasks.entries()) {
      const task = tasks.find(task => task.id === taskId);
      if (task) {
        task.isActive = false;
        task.updatedAt = new Date();
        console.log(`已停用排程任務 ${taskId}`);
        return true;
      }
    }

    return false;
  }

  /**
   * 重新啟用排程
   */
  async reactivateSchedule(taskId: string): Promise<boolean> {
    for (const [userId, tasks] of this.userTasks.entries()) {
      const task = tasks.find(task => task.id === taskId);
      if (task && !task.isActive) {
        task.isActive = true;
        task.nextRunTime = this.calculateNextRunTime(task.frequency);
        task.updatedAt = new Date();

        // 重新建立 cron 任務
        const cronExpression = this.getCronExpression(task.frequency);
        const cronTask = cron.schedule(cronExpression, async () => {
          await this.executeReportGeneration(task);
        }, {
          scheduled: true,
          timezone: 'Asia/Taipei'
        });

        this.scheduledTasks.set(taskId, cronTask);
        console.log(`已重新啟用排程任務 ${taskId}`);
        return true;
      }
    }

    return false;
  }

  /**
   * 獲取用戶的所有排程
   */
  getUserSchedules(userId: string): ScheduledTask[] {
    return this.userTasks.get(userId) || [];
  }

  /**
   * 立即執行報告生成（手動觸發）
   */
  async executeReportNow(userId: string, frequency: ReportFrequency): Promise<HealthReport | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      console.error(`用戶 ${userId} 不存在`);
      return null;
    }

    const period = this.getReportPeriod(frequency);
    const defaultSettings: ReportSettings = {
      frequency,
      includeCharts: true,
      includeTrends: true,
      includeRecommendations: true,
      deliveryMethod: [DeliveryMethod.IN_APP],
      customSections: []
    };

    return await this.generateAndDeliverReport(userId, period, defaultSettings);
  }

  /**
   * 檢查並執行到期的任務
   */
  private async checkAndExecuteTasks(): Promise<void> {
    const now = new Date();
    
    for (const [userId, tasks] of this.userTasks.entries()) {
      for (const task of tasks) {
        if (task.isActive && task.nextRunTime <= now) {
          await this.executeReportGeneration(task);
          
          // 更新下次執行時間
          task.nextRunTime = this.calculateNextRunTime(task.frequency);
          task.updatedAt = new Date();
        }
      }
    }
  }

  /**
   * 執行報告生成
   */
  private async executeReportGeneration(task: ScheduledTask): Promise<void> {
    try {
      console.log(`開始執行排程任務 ${task.id} - 用戶: ${task.userId}, 頻率: ${task.frequency}`);
      
      const period = this.getReportPeriod(task.frequency);
      const report = await this.generateAndDeliverReport(task.userId, period, task.settings);
      
      if (report) {
        console.log(`成功生成並發送報告 ${report.id}`);
      } else {
        console.error(`報告生成失敗 - 任務: ${task.id}`);
      }
    } catch (error) {
      console.error(`執行排程任務 ${task.id} 時發生錯誤:`, error);
    }
  }

  /**
   * 生成並發送報告
   */
  private async generateAndDeliverReport(
    userId: string,
    period: DateRange,
    settings: ReportSettings
  ): Promise<HealthReport | null> {
    try {
      // 獲取用戶資料
      const user = await this.userRepository.findById(userId);
      if (!user) {
        console.error(`用戶 ${userId} 不存在`);
        return null;
      }

      // 彙整資料
      const aggregatedData = await this.dataAggregator.aggregateNutritionData({
        userId,
        period,
        groupBy: 'day' as any,
        includeComparisons: true,
        includeTrends: true
      });

      // 分析趨勢
      const trendAnalysis = await this.trendAnalyzer.analyzeHealthTrends(userId, period);

      // 獲取成就（暫時為空陣列，實際應該從遊戲化系統獲取）
      const achievements: any[] = [];

      // 生成報告
      const template = ReportTemplateFactory.createTemplate(settings.frequency, settings);
      const report = await template.generateReport(
        userId,
        period,
        aggregatedData,
        trendAnalysis,
        achievements
      );

      // 發送報告
      await this.deliveryManager.deliverReport(report, settings.deliveryMethod);

      return report;
    } catch (error) {
      console.error('生成報告時發生錯誤:', error);
      return null;
    }
  }

  /**
   * 計算下次執行時間
   */
  private calculateNextRunTime(frequency: ReportFrequency): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (frequency) {
      case ReportFrequency.DAILY:
        nextRun.setDate(now.getDate() + 1);
        nextRun.setHours(8, 0, 0, 0); // 每天早上8點
        break;
      case ReportFrequency.WEEKLY:
        // 每週日早上8點
        const daysUntilSunday = (7 - now.getDay()) % 7;
        nextRun.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
        nextRun.setHours(8, 0, 0, 0);
        break;
      case ReportFrequency.MONTHLY:
        // 每月1號早上8點
        nextRun.setMonth(now.getMonth() + 1, 1);
        nextRun.setHours(8, 0, 0, 0);
        break;
      default:
        nextRun.setDate(now.getDate() + 7); // 預設週報
        nextRun.setHours(8, 0, 0, 0);
    }

    return nextRun;
  }

  /**
   * 獲取 cron 表達式
   */
  private getCronExpression(frequency: ReportFrequency): string {
    switch (frequency) {
      case ReportFrequency.DAILY:
        return '0 8 * * *'; // 每天早上8點
      case ReportFrequency.WEEKLY:
        return '0 8 * * 0'; // 每週日早上8點
      case ReportFrequency.MONTHLY:
        return '0 8 1 * *'; // 每月1號早上8點
      default:
        return '0 8 * * 0'; // 預設週報
    }
  }

  /**
   * 獲取報告期間
   */
  private getReportPeriod(frequency: ReportFrequency): DateRange {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start: Date;

    switch (frequency) {
      case ReportFrequency.DAILY:
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case ReportFrequency.WEEKLY:
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case ReportFrequency.MONTHLY:
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  /**
   * 清理過期的任務
   */
  async cleanupExpiredTasks(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const [userId, tasks] of this.userTasks.entries()) {
      const activeTasks = tasks.filter(task => 
        task.isActive || task.updatedAt > thirtyDaysAgo
      );
      
      if (activeTasks.length !== tasks.length) {
        this.userTasks.set(userId, activeTasks);
        console.log(`已清理用戶 ${userId} 的過期任務`);
      }
    }
  }

  /**
   * 獲取排程器統計資訊
   */
  getSchedulerStats(): {
    totalTasks: number;
    activeTasks: number;
    tasksByFrequency: Record<ReportFrequency, number>;
  } {
    let totalTasks = 0;
    let activeTasks = 0;
    const tasksByFrequency: Record<ReportFrequency, number> = {
      [ReportFrequency.DAILY]: 0,
      [ReportFrequency.WEEKLY]: 0,
      [ReportFrequency.MONTHLY]: 0,
      [ReportFrequency.CUSTOM]: 0
    };

    for (const tasks of this.userTasks.values()) {
      for (const task of tasks) {
        totalTasks++;
        if (task.isActive) {
          activeTasks++;
        }
        tasksByFrequency[task.frequency]++;
      }
    }

    return {
      totalTasks,
      activeTasks,
      tasksByFrequency
    };
  }

  /**
   * 停止所有排程任務
   */
  shutdown(): void {
    for (const [taskId, cronTask] of this.scheduledTasks.entries()) {
      cronTask.stop();
      console.log(`已停止排程任務 ${taskId}`);
    }
    
    this.scheduledTasks.clear();
    console.log('報告排程器已關閉');
  }
}