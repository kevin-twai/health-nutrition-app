/**
 * 識別結果緩存服務
 * Recognition Result Cache Service
 * 
 * 用於緩存食物識別結果，減少重複的 API 調用
 * 支持成分識別結果和營養計算結果的緩存
 */

import { createHash } from 'crypto';
import { logger } from '../config/logging';
import { EnhancedRecognitionResult } from './MultiStageRecognitionEngine';
import { 
  ComponentDetectionResult, 
  DetectedComponent,
  NutritionData,
  CookingMethod,
  DishType
} from '../types/ComponentDetection';

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
 * 成分緩存項目
 */
interface ComponentCacheEntry {
  key: string;
  components: DetectedComponent[];
  timestamp: Date;
  hits: number;
  dishName: string;
  dishType: DishType;
}

/**
 * 營養計算緩存項目
 */
interface NutritionCacheEntry {
  key: string;
  nutrition: NutritionData;
  timestamp: Date;
  hits: number;
  componentName: string;
  portion: number;
  cookingMethod?: CookingMethod;
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
  componentCacheEntries?: number;
  nutritionCacheEntries?: number;
}

/**
 * 識別結果緩存類
 */
export class RecognitionResultCache {
  private static instance: RecognitionResultCache;
  private cache: Map<string, CacheEntry> = new Map();
  private componentCache: Map<string, ComponentCacheEntry> = new Map();
  private nutritionCache: Map<string, NutritionCacheEntry> = new Map();
  
  // 統計數據
  private hits: number = 0;
  private misses: number = 0;
  private componentHits: number = 0;
  private componentMisses: number = 0;
  private nutritionHits: number = 0;
  private nutritionMisses: number = 0;
  
  // 配置
  private readonly MAX_CACHE_SIZE = 500; // 最多緩存 500 個結果
  private readonly MAX_COMPONENT_CACHE_SIZE = 200; // 最多緩存 200 個成分映射
  private readonly MAX_NUTRITION_CACHE_SIZE = 1000; // 最多緩存 1000 個營養計算
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小時過期
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 每小時清理一次
  
  private constructor() {
    this.setupAutoCleanup();
    logger.info('✅ RecognitionResultCache 已初始化', {
      maxSize: this.MAX_CACHE_SIZE,
      maxComponentCacheSize: this.MAX_COMPONENT_CACHE_SIZE,
      maxNutritionCacheSize: this.MAX_NUTRITION_CACHE_SIZE,
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
    let componentRemovedCount = 0;
    let nutritionRemovedCount = 0;
    
    // 清理識別結果緩存
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp.getTime();
      if (age > this.CACHE_TTL) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    // 清理成分緩存
    for (const [key, entry] of this.componentCache.entries()) {
      const age = now - entry.timestamp.getTime();
      if (age > this.CACHE_TTL) {
        this.componentCache.delete(key);
        componentRemovedCount++;
      }
    }
    
    // 清理營養緩存
    for (const [key, entry] of this.nutritionCache.entries()) {
      const age = now - entry.timestamp.getTime();
      if (age > this.CACHE_TTL) {
        this.nutritionCache.delete(key);
        nutritionRemovedCount++;
      }
    }
    
    if (removedCount > 0 || componentRemovedCount > 0 || nutritionRemovedCount > 0) {
      logger.info('清理過期緩存', {
        recognitionRemoved: removedCount,
        componentRemoved: componentRemovedCount,
        nutritionRemoved: nutritionRemovedCount,
        recognitionRemaining: this.cache.size,
        componentRemaining: this.componentCache.size,
        nutritionRemaining: this.nutritionCache.size
      });
    }
  }

  // ==================== 成分緩存方法 ====================

  /**
   * 生成料理-成分緩存鍵
   */
  private generateComponentCacheKey(dishName: string, dishType: DishType): string {
    return `component-${dishName}-${dishType}`;
  }

  /**
   * 獲取料理的成分列表（從緩存）
   */
  getComponentsForDish(dishName: string, dishType: DishType): DetectedComponent[] | null {
    const cacheKey = this.generateComponentCacheKey(dishName, dishType);
    const entry = this.componentCache.get(cacheKey);
    
    if (!entry) {
      this.componentMisses++;
      logger.debug('成分緩存未命中', { dishName, dishType });
      return null;
    }
    
    // 檢查是否過期
    const age = Date.now() - entry.timestamp.getTime();
    if (age > this.CACHE_TTL) {
      this.componentCache.delete(cacheKey);
      this.componentMisses++;
      logger.debug('成分緩存已過期', { 
        dishName,
        dishType,
        age: age / 1000 / 60 + ' minutes'
      });
      return null;
    }
    
    // 更新命中次數
    entry.hits++;
    this.componentHits++;
    
    logger.debug('成分緩存命中', { 
      dishName,
      dishType,
      hits: entry.hits,
      componentsCount: entry.components.length,
      age: age / 1000 / 60 + ' minutes'
    });
    
    return entry.components;
  }

  /**
   * 設置料理的成分列表（到緩存）
   */
  setComponentsForDish(
    dishName: string, 
    dishType: DishType, 
    components: DetectedComponent[]
  ): void {
    const cacheKey = this.generateComponentCacheKey(dishName, dishType);
    
    // 檢查緩存大小
    if (this.componentCache.size >= this.MAX_COMPONENT_CACHE_SIZE) {
      this.evictLeastUsedComponent();
    }
    
    const entry: ComponentCacheEntry = {
      key: cacheKey,
      components,
      timestamp: new Date(),
      hits: 0,
      dishName,
      dishType
    };
    
    this.componentCache.set(cacheKey, entry);
    
    logger.debug('成分緩存已設置', { 
      dishName,
      dishType,
      componentsCount: components.length,
      cacheSize: this.componentCache.size
    });
  }

  /**
   * 驅逐最少使用的成分緩存項
   */
  private evictLeastUsedComponent(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;
    
    for (const [key, entry] of this.componentCache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.componentCache.delete(leastUsedKey);
      logger.debug('驅逐最少使用的成分緩存項', { hits: leastHits });
    }
  }

  // ==================== 營養計算緩存方法 ====================

  /**
   * 生成營養計算緩存鍵
   */
  private generateNutritionCacheKey(
    componentName: string, 
    portion: number, 
    cookingMethod?: CookingMethod
  ): string {
    const methodStr = cookingMethod || 'raw';
    return `nutrition-${componentName}-${portion}-${methodStr}`;
  }

  /**
   * 獲取成分的營養數據（從緩存）
   */
  getNutritionForComponent(
    componentName: string, 
    portion: number, 
    cookingMethod?: CookingMethod
  ): NutritionData | null {
    const cacheKey = this.generateNutritionCacheKey(componentName, portion, cookingMethod);
    const entry = this.nutritionCache.get(cacheKey);
    
    if (!entry) {
      this.nutritionMisses++;
      logger.debug('營養緩存未命中', { componentName, portion, cookingMethod });
      return null;
    }
    
    // 檢查是否過期
    const age = Date.now() - entry.timestamp.getTime();
    if (age > this.CACHE_TTL) {
      this.nutritionCache.delete(cacheKey);
      this.nutritionMisses++;
      logger.debug('營養緩存已過期', { 
        componentName,
        portion,
        cookingMethod,
        age: age / 1000 / 60 + ' minutes'
      });
      return null;
    }
    
    // 更新命中次數
    entry.hits++;
    this.nutritionHits++;
    
    logger.debug('營養緩存命中', { 
      componentName,
      portion,
      cookingMethod,
      hits: entry.hits,
      age: age / 1000 / 60 + ' minutes'
    });
    
    return entry.nutrition;
  }

  /**
   * 設置成分的營養數據（到緩存）
   */
  setNutritionForComponent(
    componentName: string, 
    portion: number, 
    nutrition: NutritionData,
    cookingMethod?: CookingMethod
  ): void {
    const cacheKey = this.generateNutritionCacheKey(componentName, portion, cookingMethod);
    
    // 檢查緩存大小
    if (this.nutritionCache.size >= this.MAX_NUTRITION_CACHE_SIZE) {
      this.evictLeastUsedNutrition();
    }
    
    const entry: NutritionCacheEntry = {
      key: cacheKey,
      nutrition,
      timestamp: new Date(),
      hits: 0,
      componentName,
      portion,
      cookingMethod
    };
    
    this.nutritionCache.set(cacheKey, entry);
    
    logger.debug('營養緩存已設置', { 
      componentName,
      portion,
      cookingMethod,
      cacheSize: this.nutritionCache.size
    });
  }

  /**
   * 驅逐最少使用的營養緩存項
   */
  private evictLeastUsedNutrition(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;
    
    for (const [key, entry] of this.nutritionCache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.nutritionCache.delete(leastUsedKey);
      logger.debug('驅逐最少使用的營養緩存項', { hits: leastHits });
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
    
    // 計算識別結果緩存的統計
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
    
    // 計算成分緩存的統計
    for (const entry of this.componentCache.values()) {
      const age = Date.now() - entry.timestamp.getTime();
      totalAge += age;
      
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }
    
    // 計算營養緩存的統計
    for (const entry of this.nutritionCache.values()) {
      const age = Date.now() - entry.timestamp.getTime();
      totalAge += age;
      
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }
    
    const totalCacheSize = this.cache.size + this.componentCache.size + this.nutritionCache.size;
    const averageAge = totalCacheSize > 0 ? totalAge / totalCacheSize : 0;
    
    return {
      totalEntries: this.cache.size,
      totalHits: this.hits,
      totalMisses: this.misses,
      hitRate,
      averageAge: averageAge / 1000 / 60, // 轉換為分鐘
      oldestEntry,
      newestEntry,
      componentCacheEntries: this.componentCache.size,
      nutritionCacheEntries: this.nutritionCache.size
    };
  }

  /**
   * 清空緩存
   */
  clear(): void {
    this.cache.clear();
    this.componentCache.clear();
    this.nutritionCache.clear();
    this.hits = 0;
    this.misses = 0;
    this.componentHits = 0;
    this.componentMisses = 0;
    this.nutritionHits = 0;
    this.nutritionMisses = 0;
    logger.info('所有緩存已清空');
  }

  /**
   * 獲取緩存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 獲取成分緩存大小
   */
  componentCacheSize(): number {
    return this.componentCache.size;
  }

  /**
   * 獲取營養緩存大小
   */
  nutritionCacheSize(): number {
    return this.nutritionCache.size;
  }

  /**
   * 獲取成分緩存命中率
   */
  getComponentCacheHitRate(): number {
    const total = this.componentHits + this.componentMisses;
    return total > 0 ? this.componentHits / total : 0;
  }

  /**
   * 獲取營養緩存命中率
   */
  getNutritionCacheHitRate(): number {
    const total = this.nutritionHits + this.nutritionMisses;
    return total > 0 ? this.nutritionHits / total : 0;
  }
}

// 導出單例實例
export const recognitionResultCache = RecognitionResultCache.getInstance();
