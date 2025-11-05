import { performance, PerformanceObserver } from 'perf_hooks';
import { logger, performanceLogger } from '../config/logging';
import AWS from 'aws-sdk';

// 效能指標介面
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: any;
}

// 效能監控類別
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;
  private cloudWatch: AWS.CloudWatch;

  private constructor() {
    this.cloudWatch = new AWS.CloudWatch({
      region: process.env.AWS_REGION || 'ap-northeast-1'
    });
    
    this.setupPerformanceObserver();
    this.setupAutoCleanup();
  }
  
  // 設定自動清理機制
  private setupAutoCleanup() {
    // 每 10 分鐘清理一次舊指標
    setInterval(() => {
      this.cleanupOldMetrics();
      
      // 如果指標數量仍然過多，進行更積極的清理
      if (this.metrics.length > 5000) {
        logger.warn(`PerformanceMonitor 指標數量過多: ${this.metrics.length}，進行積極清理`);
        this.cleanupOldMetrics(600000); // 只保留最近 10 分鐘的資料
      }
    }, 10 * 60 * 1000);
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 設定效能觀察器
  private setupPerformanceObserver() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        const metric: PerformanceMetric = {
          name: entry.name,
          duration: entry.duration,
          timestamp: new Date(),
          metadata: {
            entryType: entry.entryType,
            startTime: entry.startTime
          }
        };

        this.metrics.push(metric);
        
        // 記錄到效能日誌
        performanceLogger.info('效能指標', metric);
        
        // 發送到 CloudWatch (如果是生產環境)
        if (process.env.NODE_ENV === 'production') {
          this.sendToCloudWatch(metric);
        }
        
        // 檢查是否為慢操作
        if (entry.duration > 1000) {
          logger.warn('慢操作檢測', {
            operation: entry.name,
            duration: entry.duration,
            threshold: 1000
          });
        }
      });
    });

    this.observer.observe({ entryTypes: ['measure'] });
  }

  // 開始測量
  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  // 結束測量
  endMeasure(name: string, metadata?: any): number {
    const endMarkName = `${name}-end`;
    performance.mark(endMarkName);
    
    try {
      performance.measure(name, `${name}-start`, endMarkName);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      if (metadata) {
        const metric: PerformanceMetric = {
          name,
          duration: measure.duration,
          timestamp: new Date(),
          metadata
        };
        
        this.metrics.push(metric);
        performanceLogger.info('自訂效能指標', metric);
      }
      
      // 清理標記
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(endMarkName);
      performance.clearMeasures(name);
      
      return measure.duration;
    } catch (error) {
      logger.error('效能測量失敗', { 
        name, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return 0;
    }
  }

  // 測量函數執行時間
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: any
  ): Promise<T> {
    this.startMeasure(name);
    
    try {
      const result = await fn();
      const duration = this.endMeasure(name, metadata);
      
      logger.debug('函數執行完成', {
        function: name,
        duration,
        ...metadata
      });
      
      return result;
    } catch (error) {
      this.endMeasure(name, { 
        ...metadata, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  // 測量資料庫查詢
  async measureDatabaseQuery<T>(
    queryName: string,
    query: () => Promise<T>,
    queryText?: string
  ): Promise<T> {
    return this.measureFunction(
      `db-${queryName}`,
      query,
      { type: 'database', query: queryText }
    );
  }

  // 測量外部 API 呼叫
  async measureExternalAPI<T>(
    apiName: string,
    apiCall: () => Promise<T>,
    endpoint?: string
  ): Promise<T> {
    return this.measureFunction(
      `api-${apiName}`,
      apiCall,
      { type: 'external-api', endpoint }
    );
  }

  // 發送指標到 CloudWatch
  private async sendToCloudWatch(metric: PerformanceMetric) {
    try {
      const params = {
        Namespace: 'HealthNutritionTracker/Performance',
        MetricData: [{
          MetricName: metric.name,
          Value: metric.duration,
          Unit: 'Milliseconds',
          Timestamp: metric.timestamp,
          Dimensions: metric.metadata ? [
            { Name: 'Type', Value: metric.metadata.type || 'general' }
          ] : undefined
        }]
      };

      await this.cloudWatch.putMetricData(params).promise();
    } catch (error) {
      logger.error('CloudWatch 效能指標發送失敗', {
        metric: metric.name,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // 獲取效能統計
  getPerformanceStats(timeWindow: number = 300000): any { // 預設 5 分鐘
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const recentMetrics = this.metrics.filter(
      m => m.timestamp.getTime() >= windowStart
    );

    if (recentMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowOperations: 0,
        operationTypes: {}
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / recentMetrics.length;
    const slowOperations = recentMetrics.filter(m => m.duration > 1000).length;

    // 按操作類型分組
    const operationTypes: { [key: string]: { count: number; avgDuration: number } } = {};
    
    recentMetrics.forEach(metric => {
      const type = metric.metadata?.type || 'general';
      if (!operationTypes[type]) {
        operationTypes[type] = { count: 0, avgDuration: 0 };
      }
      operationTypes[type].count++;
    });

    // 計算每種類型的平均時間
    Object.keys(operationTypes).forEach(type => {
      const typeMetrics = recentMetrics.filter(m => 
        (m.metadata?.type || 'general') === type
      );
      const typeTotalDuration = typeMetrics.reduce((sum, m) => sum + m.duration, 0);
      operationTypes[type].avgDuration = typeTotalDuration / typeMetrics.length;
    });

    return {
      totalOperations: recentMetrics.length,
      averageDuration,
      slowOperations,
      operationTypes,
      timeWindow: timeWindow / 1000 // 轉換為秒
    };
  }

  // 清理舊的指標資料
  cleanupOldMetrics(maxAge: number = 1800000): void { // 預設 30 分鐘
    const cutoff = Date.now() - maxAge;
    const initialLength = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() >= cutoff);
    
    const removedCount = initialLength - this.metrics.length;
    if (removedCount > 0) {
      logger.debug(`PerformanceMonitor 清理了 ${removedCount} 個舊指標`, {
        before: initialLength,
        after: this.metrics.length
      });
    }
  }

  // 獲取最慢的操作
  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // 停止監控
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// 效能監控裝飾器
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      
      return monitor.measureFunction(
        measureName,
        () => originalMethod.apply(this, args),
        {
          class: target.constructor.name,
          method: propertyKey,
          args: args.length
        }
      );
    };

    return descriptor;
  };
}

// 匯出單例實例
export const performanceMonitor = PerformanceMonitor.getInstance();