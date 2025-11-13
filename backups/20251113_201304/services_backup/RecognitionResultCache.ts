/**
 * 識別結果緩存服務
 * Recognition Result Cache Service
 * 
 * 用於緩存食物識別結果，減少重複的 API 調用
 */

import { createHash } from 'crypto';
import { logger } from '../config/logging';
import { EnhancedRecognitionResult } from './MultiStageRecognitionEngine';

/**
 * 緩存項目
 */
interface CacheEntry {
  key: string;
  result: EnhancedRecognitionResult;
  timestamp: Date;
  hits: number;
  imageHash: string;
}

/**
 * 緩存統計
 */
interface CacheStatistics {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  averageAge: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

/**
 * 識別結果緩存類
 */
export class RecognitionResultCache {
  private static instance: RecognitionResultCache;
  private cache: Map<string, CacheEntry> = new Map();
  
  // 統計數據
  private hits: number = 0;
  private misses: number = 0;
  
  // 配置
  private readonly MAX_CACHE_SIZE = 500; // 最多緩存 500 個結果
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小時過期
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 每小時清理一次
  
  private constructor() {
    this.setupAutoCleanup();
    logger.info('✅ RecognitionResultCache 已初始化', {
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL / 1000 / 60 / 60 + ' hours'
    });
  }

  static getInstance(): RecognitionResultCache {
    if (!RecognitionResultCache.instance) {
      RecognitionResultCache.instance = new RecognitionResultCache();
    }
    return RecognitionResultCache.instance;
  }

  /**
   * 設置自動清理機制
   */
  private setupAutoCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 生成圖片哈希值
   */
  private generateImageHash(imageBuffer: Buffer): string {
    return createHash('sha256').update(imageBuffer).digest('hex');
  }

  /**
   * 生成緩存鍵
   */
  private generateCacheKey(imageHash: string, options?: any): string {
    const optionsStr = options ? JSON.stringify(options) : '';
    return `${imageHash}-${createHash('md5').update(optionsStr).digest('hex')}`;
  }

  /**
   * 獲取緩存結果
   */
  get(imageBuffer: Buffer, options?: any): EnhancedRecognitionResult | null {
    const imageHash = this.generateImageHash(imageBuffer);
    const cacheKey = this.generateCacheKey(imageHash, options);
    
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      this.misses++;
      logger.debug('緩存未命中', { imageHash: imageHash.substring(0, 16) });
      return null;
    }
    
    // 檢查是否過期
    const age = Date.now() - entry.timestamp.getTime();
    if (age > this.CACHE_TTL) {
      this.cache.delete(cacheKey);
      this.misses++;
      logger.debug('緩存已過期', { 
        imageHash: imageHash.substring(0, 16),
        age: age / 1000 / 60 + ' minutes'
      });
      return null;
    }
    
    // 更新命中次數
    entry.hits++;
    this.hits++;
    
    logger.debug('緩存命中', { 
      imageHash: imageHash.substring(0, 16),
      hits: entry.hits,
      age: age / 1000 / 60 + ' minutes'
    });
    
    return entry.result;
  }

  /**
   * 設置緩存結果
   */
  set(imageBuffer: Buffer, result: EnhancedRecognitionResult, options?: any): void {
    const imageHash = this.generateImageHash(imageBuffer);
    const cacheKey = this.generateCacheKey(imageHash, options);
    
    // 檢查緩存大小
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry = {
      key: cacheKey,
      result,
      timestamp: new Date(),
      hits: 0,
      imageHash
    };
    
    this.cache.set(cacheKey, entry);
    
    logger.debug('緩存已設置', { 
      imageHash: imageHash.substring(0, 16),
      cacheSize: this.cache.size
    });
  }

  /**
   * 驅逐最少使用的緩存項
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      logger.debug('驅逐最少使用的緩存項', { hits: leastHits });
    }
  }

  /**
   * 清理過期的緩存項
   */
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp.getTime();
      if (age > this.CACHE_TTL) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      logger.info('清理過期緩存', {
        removed: removedCount,
        remaining: this.cache.size
      });
    }
  }

  /**
   * 獲取緩存統計
   */
  getStatistics(): CacheStatistics {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    
    let totalAge = 0;
    let oldestEntry: Date | undefined;
    let newestEntry: Date | undefined;
    
    for (const entry of this.cache.values()) {
      const age = Date.now() - entry.timestamp.getTime();
      totalAge += age;
      
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }
    
    const averageAge = this.cache.size > 0 ? totalAge / this.cache.size : 0;
    
    return {
      totalEntries: this.cache.size,
      totalHits: this.hits,
      totalMisses: this.misses,
      hitRate,
      averageAge: averageAge / 1000 / 60, // 轉換為分鐘
      oldestEntry,
      newestEntry
    };
  }

  /**
   * 清空緩存
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    logger.info('緩存已清空');
  }

  /**
   * 獲取緩存大小
   */
  size(): number {
    return this.cache.size;
  }
}

// 導出單例實例
export const recognitionResultCache = RecognitionResultCache.getInstance();
