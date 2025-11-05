import { EventEmitter } from 'events';

interface QueueJob {
  id: string;
  type: string;
  data: any;
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  scheduledAt?: Date;
}

interface JobResult {
  success: boolean;
  result?: any;
  error?: string;
}

type JobHandler = (data: any) => Promise<JobResult>;

/**
 * 訊息佇列服務 - 處理非同步任務和背景工作
 */
export class MessageQueueService extends EventEmitter {
  private queues: Map<string, QueueJob[]> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private processing: Map<string, boolean> = new Map();
  private workers: Map<string, NodeJS.Timeout> = new Map();
  private readonly maxConcurrentJobs = 5;
  private readonly defaultRetryDelay = 5000; // 5 秒

  constructor() {
    super();
    this.setupDefaultHandlers();
  }

  /**
   * 設定預設的工作處理器
   */
  private setupDefaultHandlers(): void {
    // AI 回應生成處理器
    this.registerHandler('generate_ai_response', async (data) => {
      try {
        const { conversationId, message, userId } = data;
        // 這裡會呼叫 AI 服務生成回應
        // 實際實作時會整合 AIService
        return { success: true, result: { message: '處理完成' } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // 營養分析處理器
    this.registerHandler('analyze_nutrition', async (data) => {
      try {
        const { userId, nutritionData } = data;
        // 這裡會呼叫營養分析服務
        return { success: true, result: { analysis: '分析完成' } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // 建議生成處理器
    this.registerHandler('generate_recommendations', async (data) => {
      try {
        const { userId, context } = data;
        // 這裡會呼叫建議引擎
        return { success: true, result: { recommendations: [] } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // 通知發送處理器
    this.registerHandler('send_notification', async (data) => {
      try {
        const { userId, notification } = data;
        // 這裡會發送通知
        return { success: true, result: { sent: true } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }

  /**
   * 註冊工作處理器
   */
  registerHandler(jobType: string, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
    
    // 如果佇列不存在，建立它
    if (!this.queues.has(jobType)) {
      this.queues.set(jobType, []);
    }

    // 啟動工作處理器
    this.startWorker(jobType);
  }

  /**
   * 添加工作到佇列
   */
  async addJob(
    type: string,
    data: any,
    options: {
      priority?: number;
      delay?: number;
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    const jobId = this.generateJobId();
    const now = new Date();
    
    const job: QueueJob = {
      id: jobId,
      type,
      data,
      priority: options.priority || 0,
      retries: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: now,
      scheduledAt: options.delay ? new Date(now.getTime() + options.delay) : now
    };

    // 確保佇列存在
    if (!this.queues.has(type)) {
      this.queues.set(type, []);
    }

    const queue = this.queues.get(type)!;
    
    // 按優先級插入工作
    const insertIndex = queue.findIndex(existingJob => existingJob.priority < job.priority);
    if (insertIndex === -1) {
      queue.push(job);
    } else {
      queue.splice(insertIndex, 0, job);
    }

    this.emit('job_added', { jobId, type, data });
    
    // 如果工作處理器還沒啟動，啟動它
    if (!this.workers.has(type)) {
      this.startWorker(type);
    }

    return jobId;
  }

  /**
   * 啟動工作處理器
   */
  private startWorker(jobType: string): void {
    if (this.workers.has(jobType)) {
      return; // 工作處理器已經在運行
    }

    const worker = setInterval(async () => {
      await this.processJobs(jobType);
    }, 1000); // 每秒檢查一次

    this.workers.set(jobType, worker);
    this.processing.set(jobType, false);
  }

  /**
   * 處理佇列中的工作
   */
  private async processJobs(jobType: string): Promise<void> {
    if (this.processing.get(jobType)) {
      return; // 已經在處理中
    }

    const queue = this.queues.get(jobType);
    const handler = this.handlers.get(jobType);
    
    if (!queue || !handler || queue.length === 0) {
      return;
    }

    this.processing.set(jobType, true);

    try {
      // 處理多個工作（並發處理）
      const jobsToProcess = queue
        .filter(job => !job.scheduledAt || job.scheduledAt <= new Date())
        .slice(0, this.maxConcurrentJobs);

      if (jobsToProcess.length === 0) {
        this.processing.set(jobType, false);
        return;
      }

      const promises = jobsToProcess.map(job => this.processJob(job, handler));
      await Promise.allSettled(promises);

      // 移除已處理的工作
      jobsToProcess.forEach(job => {
        const index = queue.indexOf(job);
        if (index > -1) {
          queue.splice(index, 1);
        }
      });

    } catch (error) {
      console.error(`處理 ${jobType} 工作時發生錯誤:`, error);
    } finally {
      this.processing.set(jobType, false);
    }
  }

  /**
   * 處理單個工作
   */
  private async processJob(job: QueueJob, handler: JobHandler): Promise<void> {
    try {
      this.emit('job_started', { jobId: job.id, type: job.type });
      
      const result = await handler(job.data);
      
      if (result.success) {
        this.emit('job_completed', { 
          jobId: job.id, 
          type: job.type, 
          result: result.result 
        });
      } else {
        throw new Error(result.error || '工作處理失敗');
      }
      
    } catch (error) {
      console.error(`工作 ${job.id} 處理失敗:`, error);
      
      job.retries++;
      
      if (job.retries < job.maxRetries) {
        // 重新排程工作
        job.scheduledAt = new Date(Date.now() + this.defaultRetryDelay * job.retries);
        
        this.emit('job_retry', { 
          jobId: job.id, 
          type: job.type, 
          retries: job.retries,
          error: error.message 
        });
      } else {
        // 工作失敗，發送失敗事件
        this.emit('job_failed', { 
          jobId: job.id, 
          type: job.type, 
          error: error.message,
          retries: job.retries 
        });
      }
    }
  }

  /**
   * 獲取佇列狀態
   */
  getQueueStatus(jobType?: string): any {
    if (jobType) {
      const queue = this.queues.get(jobType) || [];
      return {
        type: jobType,
        pending: queue.length,
        processing: this.processing.get(jobType) || false,
        jobs: queue.map(job => ({
          id: job.id,
          priority: job.priority,
          retries: job.retries,
          createdAt: job.createdAt,
          scheduledAt: job.scheduledAt
        }))
      };
    }

    // 返回所有佇列的狀態
    const status: any = {};
    this.queues.forEach((queue, type) => {
      status[type] = {
        pending: queue.length,
        processing: this.processing.get(type) || false
      };
    });
    
    return status;
  }

  /**
   * 清空佇列
   */
  clearQueue(jobType: string): void {
    const queue = this.queues.get(jobType);
    if (queue) {
      queue.length = 0;
      this.emit('queue_cleared', { type: jobType });
    }
  }

  /**
   * 停止工作處理器
   */
  stopWorker(jobType: string): void {
    const worker = this.workers.get(jobType);
    if (worker) {
      clearInterval(worker);
      this.workers.delete(jobType);
      this.processing.set(jobType, false);
      this.emit('worker_stopped', { type: jobType });
    }
  }

  /**
   * 停止所有工作處理器
   */
  stopAllWorkers(): void {
    this.workers.forEach((worker, jobType) => {
      clearInterval(worker);
      this.processing.set(jobType, false);
    });
    this.workers.clear();
    this.emit('all_workers_stopped');
  }

  /**
   * 生成工作 ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 獲取佇列統計
   */
  getStatistics(): {
    totalQueues: number;
    totalPendingJobs: number;
    activeWorkers: number;
    queueDetails: { [key: string]: { pending: number; processing: boolean } };
  } {
    let totalPendingJobs = 0;
    const queueDetails: { [key: string]: { pending: number; processing: boolean } } = {};

    this.queues.forEach((queue, type) => {
      const pending = queue.length;
      totalPendingJobs += pending;
      queueDetails[type] = {
        pending,
        processing: this.processing.get(type) || false
      };
    });

    return {
      totalQueues: this.queues.size,
      totalPendingJobs,
      activeWorkers: this.workers.size,
      queueDetails
    };
  }

  /**
   * 設定工作優先級
   */
  setJobPriority(jobType: string, jobId: string, priority: number): boolean {
    const queue = this.queues.get(jobType);
    if (!queue) return false;

    const job = queue.find(j => j.id === jobId);
    if (!job) return false;

    job.priority = priority;
    
    // 重新排序佇列
    queue.sort((a, b) => b.priority - a.priority);
    
    return true;
  }

  /**
   * 取消工作
   */
  cancelJob(jobType: string, jobId: string): boolean {
    const queue = this.queues.get(jobType);
    if (!queue) return false;

    const index = queue.findIndex(job => job.id === jobId);
    if (index === -1) return false;

    queue.splice(index, 1);
    this.emit('job_cancelled', { jobId, type: jobType });
    
    return true;
  }
}

// 單例模式
export const messageQueueService = new MessageQueueService();