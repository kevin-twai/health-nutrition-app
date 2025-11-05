import { logger } from '../config/logging';

// 記憶體監控工具
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private memoryHistory: Array<{
    timestamp: Date;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  }> = [];
  private readonly MAX_HISTORY = 100; // 只保留最近 100 個記錄

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  // 開始監控
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      return; // 已經在監控中
    }

    this.monitoringInterval = setInterval(() => {
      this.recordMemoryUsage();
      this.checkMemoryLeaks();
    }, intervalMs);

    logger.info('記憶體監控已啟動', { interval: intervalMs });
  }

  // 停止監控
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('記憶體監控已停止');
    }
  }

  // 記錄記憶體使用情況
  private recordMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    
    const record = {
      timestamp: new Date(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    };

    this.memoryHistory.push(record);

    // 保持歷史記錄在限制內
    if (this.memoryHistory.length > this.MAX_HISTORY) {
      this.memoryHistory.shift();
    }

    // 記錄詳細的記憶體資訊
    logger.debug('記憶體使用記錄', {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      usagePercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`
    });
  }

  // 檢查記憶體洩漏
  private checkMemoryLeaks(): void {
    if (this.memoryHistory.length < 10) {
      return; // 需要足夠的歷史資料
    }

    const recent = this.memoryHistory.slice(-10);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];

    // 檢查記憶體是否持續增長
    const heapGrowth = newest.heapUsed - oldest.heapUsed;
    const timeSpan = newest.timestamp.getTime() - oldest.timestamp.getTime();
    const growthRate = heapGrowth / timeSpan; // bytes per ms

    // 如果記憶體增長率超過閾值，發出警告
    const GROWTH_THRESHOLD = 1024; // 1KB per second
    if (growthRate > GROWTH_THRESHOLD / 1000) {
      logger.warn('檢測到可能的記憶體洩漏', {
        growthRate: `${Math.round(growthRate * 1000)}bytes/s`,
        heapGrowth: `${Math.round(heapGrowth / 1024)}KB`,
        timeSpan: `${Math.round(timeSpan / 1000)}s`,
        currentHeap: `${Math.round(newest.heapUsed / 1024 / 1024)}MB`
      });

      // 建議垃圾回收
      this.suggestGarbageCollection();
    }

    // 檢查記憶體使用率
    const usagePercent = (newest.heapUsed / newest.heapTotal) * 100;
    if (usagePercent > 90) {
      logger.error('記憶體使用率極高', {
        usagePercent: `${usagePercent.toFixed(2)}%`,
        heapUsed: `${Math.round(newest.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(newest.heapTotal / 1024 / 1024)}MB`
      });

      // 強制垃圾回收
      this.forceGarbageCollection();
    }
  }

  // 建議垃圾回收
  private suggestGarbageCollection(): void {
    if (global.gc) {
      const beforeGC = process.memoryUsage();
      global.gc();
      const afterGC = process.memoryUsage();
      
      const freed = beforeGC.heapUsed - afterGC.heapUsed;
      logger.info('執行垃圾回收', {
        freedMemory: `${Math.round(freed / 1024 / 1024)}MB`,
        beforeGC: `${Math.round(beforeGC.heapUsed / 1024 / 1024)}MB`,
        afterGC: `${Math.round(afterGC.heapUsed / 1024 / 1024)}MB`
      });
    } else {
      logger.warn('垃圾回收不可用，請使用 --expose-gc 標誌啟動 Node.js');
    }
  }

  // 強制垃圾回收
  private forceGarbageCollection(): void {
    this.suggestGarbageCollection();
  }

  // 獲取記憶體統計
  getMemoryStats(): any {
    const current = process.memoryUsage();
    
    if (this.memoryHistory.length === 0) {
      return {
        current: {
          heapUsed: Math.round(current.heapUsed / 1024 / 1024),
          heapTotal: Math.round(current.heapTotal / 1024 / 1024),
          external: Math.round(current.external / 1024 / 1024),
          rss: Math.round(current.rss / 1024 / 1024),
          usagePercent: ((current.heapUsed / current.heapTotal) * 100).toFixed(2)
        }
      };
    }

    const oldest = this.memoryHistory[0];
    const trend = {
      heapUsedChange: current.heapUsed - oldest.heapUsed,
      timeSpan: Date.now() - oldest.timestamp.getTime()
    };

    return {
      current: {
        heapUsed: Math.round(current.heapUsed / 1024 / 1024),
        heapTotal: Math.round(current.heapTotal / 1024 / 1024),
        external: Math.round(current.external / 1024 / 1024),
        rss: Math.round(current.rss / 1024 / 1024),
        usagePercent: ((current.heapUsed / current.heapTotal) * 100).toFixed(2)
      },
      trend: {
        heapGrowth: Math.round(trend.heapUsedChange / 1024 / 1024),
        growthRate: Math.round((trend.heapUsedChange / trend.timeSpan) * 1000),
        timeSpan: Math.round(trend.timeSpan / 1000)
      },
      history: this.memoryHistory.length
    };
  }

  // 清理歷史記錄
  clearHistory(): void {
    this.memoryHistory = [];
    logger.info('記憶體監控歷史已清理');
  }
}

// 匯出單例實例
export const memoryMonitor = MemoryMonitor.getInstance();