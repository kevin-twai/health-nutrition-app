import { Pool, PoolClient } from 'pg';
import { Collection, Db, Document } from 'mongodb';
import Redis from 'ioredis';

// 基礎 Repository 介面
export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(limit?: number, offset?: number): Promise<T[]>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// PostgreSQL 基礎 Repository
export abstract class PostgreSQLBaseRepository<T> implements IBaseRepository<T> {
  protected pool: Pool;
  protected tableName: string;
  protected redis?: Redis;

  constructor(pool: Pool, tableName: string, redis?: Redis) {
    this.pool = pool;
    this.tableName = tableName;
    this.redis = redis;
  }

  // 執行查詢
  protected async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('SQL查詢:', { text, duration, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      console.error('SQL查詢失敗:', { text, params, error });
      throw error;
    }
  }

  // 執行事務
  protected async transaction<R>(callback: (client: PoolClient) => Promise<R>): Promise<R> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 快取相關方法
  protected getCacheKey(key: string): string {
    return `${this.tableName}:${key}`;
  }

  protected async getFromCache<R>(key: string): Promise<R | null> {
    if (!this.redis) return null;
    
    try {
      const cached = await this.redis.get(this.getCacheKey(key));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('從快取讀取資料失敗:', error);
      return null;
    }
  }

  protected async setCache<R>(key: string, data: R, ttl: number = 3600): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.setex(this.getCacheKey(key), ttl, JSON.stringify(data));
    } catch (error) {
      console.error('寫入快取失敗:', error);
    }
  }

  protected async deleteFromCache(key: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.del(this.getCacheKey(key));
    } catch (error) {
      console.error('刪除快取失敗:', error);
    }
  }

  protected async deleteCachePattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      const keys = await this.redis.keys(this.getCacheKey(pattern));
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('批量刪除快取失敗:', error);
    }
  }

  // 抽象方法，子類必須實作
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(limit?: number, offset?: number): Promise<T[]>;
  abstract create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}

// MongoDB 基礎 Repository
export abstract class MongoDBBaseRepository<T extends Document> implements IBaseRepository<T> {
  protected db: Db | null;
  protected collection: Collection<T> | null;
  protected collectionName: string;
  protected redis?: Redis;

  constructor(db: Db | null, collectionName: string, redis?: Redis) {
    this.db = db;
    this.collectionName = collectionName;
    // 只有在 db 存在時才初始化 collection
    this.collection = db ? db.collection<T>(collectionName) : null;
    this.redis = redis;
  }

  // 快取相關方法
  protected getCacheKey(key: string): string {
    return `${this.collectionName}:${key}`;
  }

  protected async getFromCache<R>(key: string): Promise<R | null> {
    if (!this.redis) return null;
    
    try {
      const cached = await this.redis.get(this.getCacheKey(key));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('從快取讀取資料失敗:', error);
      return null;
    }
  }

  protected async setCache<R>(key: string, data: R, ttl: number = 3600): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.setex(this.getCacheKey(key), ttl, JSON.stringify(data));
    } catch (error) {
      console.error('寫入快取失敗:', error);
    }
  }

  protected async deleteFromCache(key: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.del(this.getCacheKey(key));
    } catch (error) {
      console.error('刪除快取失敗:', error);
    }
  }

  protected async deleteCachePattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      const keys = await this.redis.keys(this.getCacheKey(pattern));
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('批量刪除快取失敗:', error);
    }
  }

  // 抽象方法，子類必須實作
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(limit?: number, offset?: number): Promise<T[]>;
  abstract create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}

// 查詢選項介面
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

// 分頁結果介面
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 搜尋結果介面
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters?: Record<string, any>;
  suggestions?: string[];
}

// 批量操作結果介面
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

// 統計資料介面
export interface RepositoryStats {
  totalRecords: number;
  createdToday: number;
  updatedToday: number;
  deletedToday: number;
  cacheHitRate?: number;
}

// Repository 錯誤類別
export class RepositoryError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = 'REPOSITORY_ERROR', details?: any) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    this.details = details;
  }
}

// 資料驗證錯誤
export class ValidationError extends RepositoryError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// 資料不存在錯誤
export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// 重複資料錯誤
export class DuplicateError extends RepositoryError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} '${value}' already exists`, 'DUPLICATE_ERROR');
    this.name = 'DuplicateError';
  }
}

// 資料庫連接錯誤
export class DatabaseConnectionError extends RepositoryError {
  constructor(message: string) {
    super(message, 'DATABASE_CONNECTION_ERROR');
    this.name = 'DatabaseConnectionError';
  }
}