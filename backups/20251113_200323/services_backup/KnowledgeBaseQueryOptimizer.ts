/**
 * 知識庫查詢優化器
 * Knowledge Base Query Optimizer
 * 
 * 提供緩存和查詢優化功能
 */

import { createHash } from 'crypto';
import { logger } from '../config/logging';
import { AsianCuisineKnowledgeBase } from './AsianCuisineKnowledgeBase';
import {
  FoodItem,
  KnowledgeBaseQueryOptions,
  MatchResult,
  ImageFeatures,
  SimilarityOptions
} from '../types/AsianCuisineKnowledgeBase';

/**
 * 查詢緩存項
 */
interface QueryCacheEntry<T> {
  key: string;
  result: T;
  timestamp: number;
  hits: number;
}

/**
 * 知識庫查詢優化器類
 */
export class KnowledgeBaseQueryOptimizer {
  private static instance: KnowledgeBaseQueryOptimizer;
  private knowledgeBase: AsianCuisineKnowledgeBase;
  
  // 查詢緩存
  private queryCache: Map<string, QueryCacheEntry<FoodItem[]>> = new Map();
  private matchCache: Map<string, QueryCacheEntry<MatchResult[]>> = new Map();
  
  // 統計數據
  private queryHits: number = 0;
  private queryMisses: number = 0;
  private matchHits: number = 0;
  private matchMisses: number = 0;
  
  // 配置
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 分鐘
  private readonly MAX_CACHE_SIZE = 200;
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 分鐘

  private constructor() {
    this.knowledgeBase = new AsianCuisineKnowledgeBase();
    this.setupCacheCleanup();
    logger.info('✅ KnowledgeBaseQueryOptimizer 已初始化');
  }

  static getInstance(): KnowledgeBaseQueryOptimizer {
    if (!KnowledgeBaseQueryOptimizer.instance) {
      KnowledgeBaseQueryOptimizer.instance = new KnowledgeBaseQueryOptimizer();
    }
    return KnowledgeBaseQueryOptimizer.instance;
  }

  /**
   * 設置緩存清理
   */
  private setupCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * 生成查詢緩存鍵
   */
  private generateQueryCacheKey(options: KnowledgeBaseQueryOptions): string {
    const optionsStr = JSON.stringify(options);
    return createHash('md5').update(optionsStr).digest('hex');
  }

  /**
   * 生成匹配緩存鍵
   */
  private generateMatchCacheKey(
    imageFeatures: ImageFeatures,
    options?: Partial<SimilarityOptions>
  ): string {
    const featuresStr = JSON.stringify(imageFeatures);
    const optionsStr = JSON.stringify(options || {});
    return createHash('md5').update(featuresStr + optionsStr).digest('hex');
  }

  /**
   * 優化的查詢食材方法（帶緩存）
   */
  queryFoodItems(options: KnowledgeBaseQueryOptions): FoodItem[] {
    const cacheKey = this.generateQueryCacheKey(options);
    const cached = this.queryCache.get(cacheKey);
    
    // 檢查緩存
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.CACHE_TTL) {
        cached.hits++;
        this.queryHits++;
        logger.debug('知識庫查詢緩存命中', { 
          cacheKey: cacheKey.substring(0, 8),
          hits: cached.hits,
          age: age / 1000 + 's'
        });
        return cached.result;
      } else {
        // 過期，刪除
        this.queryCache.delete(cacheKey);
      }
    }
    
    // 緩存未命中，執行查詢
    this.queryMisses++;
    const startTime = Date.now();
    const result = this.knowledgeBase.queryFoodItems(options);
    const duration = Date.now() - startTime;
    
    logger.debug('知識庫查詢執行', {
      duration: duration + 'ms',
      resultCount: result.length,
      options
    });
    
    // 檢查緩存大小
    if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsedQuery();
    }
    
    // 存入緩存
    this.queryCache.set(cacheKey, {
      key: cacheKey,
      result,
      timestamp: Date.now(),
      hits: 0
    });
    
    return result;
  }

  /**
   * 優化的視覺特徵匹配方法（帶緩存）
   */
  matchFoodItemsByVisualFeatures(
    imageFeatures: ImageFeatures,
    options?: Partial<SimilarityOptions>
  ): MatchResult[] {
    const cacheKey = this.generateMatchCacheKey(imageFeatures, options);
    const cached = this.matchCache.get(cacheKey);
    
    // 檢查緩存
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.CACHE_TTL) {
        cached.hits++;
        this.matchHits++;
        logger.debug('視覺特徵匹配緩存命中', {
          cacheKey: cacheKey.substring(0, 8),
          hits: cached.hits,
          age: age / 1000 + 's'
        });
        return cached.result;
      } else {
        // 過期，刪除
        this.matchCache.delete(cacheKey);
      }
    }
    
    // 緩存未命中，執行匹配
    this.matchMisses++;
    const startTime = Date.now();
    const result = this.knowledgeBase.matchFoodItemsByVisualFeatures(imageFeatures, options);
    const duration = Date.now() - startTime;
    
    logger.debug('視覺特徵匹配執行', {
      duration: duration + 'ms',
      matchCount: result.length,
      features: imageFeatures
    });
    
    // 檢查緩存大小
    if (this.matchCache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsedMatch();
    }
    
    // 存入緩存
    this.matchCache.set(cacheKey, {
      key: cacheKey,
      result,
      timestamp: Date.now(),
      hits: 0
    });
    
    return result;
  }

  /**
   * 驅逐最少使用的查詢緩存
   */
  private evictLeastUsedQuery(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;
    
    for (const [key, entry] of this.queryCache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.queryCache.delete(leastUsedKey);
      logger.debug('驅逐最少使用的查詢緩存', { hits: leastHits });
    }
  }

  /**
   * 驅逐最少使用的匹配緩存
   */
  private evictLeastUsedMatch(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;
    
    for (const [key, entry] of this.matchCache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.matchCache.delete(leastUsedKey);
      logger.debug('驅逐最少使用的匹配緩存', { hits: leastHits });
    }
  }

  /**
   * 清理過期緩存
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let removedQueryCount = 0;
    let removedMatchCount = 0;
    
    // 清理查詢緩存
    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.queryCache.delete(key);
        removedQueryCount++;
      }
    }
    
    // 清理匹配緩存
    for (const [key, entry] of this.matchCache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.matchCache.delete(key);
        removedMatchCount++;
      }
    }
    
    if (removedQueryCount > 0 || removedMatchCount > 0) {
      logger.debug('清理過期的知識庫緩存', {
        removedQueries: removedQueryCount,
        removedMatches: removedMatchCount,
        remainingQueries: this.queryCache.size,
        remainingMatches: this.matchCache.size
      });
    }
  }

  /**
   * 獲取緩存統計
   */
  getCacheStatistics(): {
    query: {
      cacheSize: number;
      hits: number;
      misses: number;
      hitRate: number;
    };
    match: {
      cacheSize: number;
      hits: number;
      misses: number;
      hitRate: number;
    };
  } {
    const queryTotal = this.queryHits + this.queryMisses;
    const matchTotal = this.matchHits + this.matchMisses;
    
    return {
      query: {
        cacheSize: this.queryCache.size,
        hits: this.queryHits,
        misses: this.queryMisses,
        hitRate: queryTotal > 0 ? this.queryHits / queryTotal : 0
      },
      match: {
        cacheSize: this.matchCache.size,
        hits: this.matchHits,
        misses: this.matchMisses,
        hitRate: matchTotal > 0 ? this.matchHits / matchTotal : 0
      }
    };
  }

  /**
   * 清空所有緩存
   */
  clearCache(): void {
    this.queryCache.clear();
    this.matchCache.clear();
    this.queryHits = 0;
    this.queryMisses = 0;
    this.matchHits = 0;
    this.matchMisses = 0;
    logger.info('知識庫緩存已清空');
  }

  /**
   * 獲取知識庫統計
   */
  getStatistics() {
    return this.knowledgeBase.getStatistics();
  }

  /**
   * 預熱緩存（預先加載常用查詢）
   */
  warmupCache(): void {
    logger.info('開始預熱知識庫緩存...');
    
    // 預加載常用類別
    const commonCategories = [
      '豆製品',
      '蔬菜',
      '麵食',
      '米製品',
      '蛋白質'
    ];
    
    commonCategories.forEach(category => {
      this.queryFoodItems({ category: category as any });
    });
    
    // 預加載常用料理類型
    const commonCuisines = [
      '中式',
      '台式',
      '日式'
    ];
    
    commonCuisines.forEach(cuisine => {
      this.queryFoodItems({ cuisineType: cuisine as any });
    });
    
    logger.info('知識庫緩存預熱完成', {
      queryCacheSize: this.queryCache.size,
      matchCacheSize: this.matchCache.size
    });
  }
}

// 導出單例實例
export const knowledgeBaseQueryOptimizer = KnowledgeBaseQueryOptimizer.getInstance();
