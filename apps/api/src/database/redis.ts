import Redis from 'ioredis';

// Redis 連接配置
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
}

// 獲取 Redis 配置
const getRedisConfig = (): RedisConfig => {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  };
};

// Redis 連接管理器
class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  // 單例模式獲取實例
  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  // 連接到 Redis
  public async connect(): Promise<Redis> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      const config = getRedisConfig();
      this.client = new Redis(config);

      // 監聽連接事件
      this.client.on('connect', () => {
        console.log('Redis 連接成功');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('Redis 準備就緒');
      });

      this.client.on('error', (error) => {
        console.error('Redis 連接錯誤:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('Redis 連接已關閉');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis 重新連接中...');
      });

      // 測試連接
      await this.client.ping();
      this.isConnected = true;

      return this.client;
    } catch (error) {
      console.error('Redis 連接失敗:', error);
      throw error;
    }
  }

  // 獲取 Redis 客戶端
  public getClient(): Redis | null {
    return this.client;
  }

  // 檢查連接狀態
  public isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  // 測試連接
  public async testConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.connect();
      }
      
      const result = await this.client!.ping();
      console.log('Redis 連接測試成功:', result);
      return true;
    } catch (error) {
      console.error('Redis 連接測試失敗:', error);
      return false;
    }
  }

  // 關閉連接
  public async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        console.log('Redis 連接已關閉');
      }
    } catch (error) {
      console.error('關閉 Redis 連接時發生錯誤:', error);
    }
  }
}

// Redis 快取工具類別
export class RedisCache {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // 設定快取
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, serializedValue);
    } catch (error) {
      console.error('設定快取失敗:', { key, error });
    }
  }

  // 獲取快取
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('獲取快取失敗:', { key, error });
      return null;
    }
  }

  // 刪除快取
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('刪除快取失敗:', { key, error });
    }
  }

  // 批量刪除快取
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('批量刪除快取失敗:', { pattern, error });
    }
  }

  // 檢查快取是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('檢查快取存在性失敗:', { key, error });
      return false;
    }
  }

  // 設定快取過期時間
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      console.error('設定快取過期時間失敗:', { key, ttl, error });
    }
  }

  // 獲取快取剩餘時間
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error('獲取快取剩餘時間失敗:', { key, error });
      return -1;
    }
  }

  // 原子性增加數值
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error('原子性增加失敗:', { key, error });
      return 0;
    }
  }

  // 原子性增加指定數值
  async incrBy(key: string, increment: number): Promise<number> {
    try {
      return await this.redis.incrby(key, increment);
    } catch (error) {
      console.error('原子性增加指定數值失敗:', { key, increment, error });
      return 0;
    }
  }

  // 設定 Hash 欄位
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.hset(key, field, serializedValue);
    } catch (error) {
      console.error('設定 Hash 欄位失敗:', { key, field, error });
    }
  }

  // 獲取 Hash 欄位
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('獲取 Hash 欄位失敗:', { key, field, error });
      return null;
    }
  }

  // 獲取所有 Hash 欄位
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.redis.hgetall(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value as any;
        }
      }
      
      return result;
    } catch (error) {
      console.error('獲取所有 Hash 欄位失敗:', { key, error });
      return {};
    }
  }

  // 刪除 Hash 欄位
  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.redis.hdel(key, field);
    } catch (error) {
      console.error('刪除 Hash 欄位失敗:', { key, field, error });
    }
  }

  // 添加到集合
  async sadd(key: string, member: string): Promise<void> {
    try {
      await this.redis.sadd(key, member);
    } catch (error) {
      console.error('添加到集合失敗:', { key, member, error });
    }
  }

  // 從集合移除
  async srem(key: string, member: string): Promise<void> {
    try {
      await this.redis.srem(key, member);
    } catch (error) {
      console.error('從集合移除失敗:', { key, member, error });
    }
  }

  // 獲取集合所有成員
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      console.error('獲取集合成員失敗:', { key, error });
      return [];
    }
  }

  // 檢查是否為集合成員
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error('檢查集合成員失敗:', { key, member, error });
      return false;
    }
  }

  // 添加到有序集合
  async zadd(key: string, score: number, member: string): Promise<void> {
    try {
      await this.redis.zadd(key, score, member);
    } catch (error) {
      console.error('添加到有序集合失敗:', { key, score, member, error });
    }
  }

  // 獲取有序集合範圍
  async zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[]> {
    try {
      if (withScores) {
        return await this.redis.zrange(key, start, stop, 'WITHSCORES');
      } else {
        return await this.redis.zrange(key, start, stop);
      }
    } catch (error) {
      console.error('獲取有序集合範圍失敗:', { key, start, stop, error });
      return [];
    }
  }

  // 獲取快取統計資訊
  async getStats(): Promise<{
    usedMemory: string;
    connectedClients: number;
    totalCommandsProcessed: number;
    keyspaceHits: number;
    keyspaceMisses: number;
    hitRate: number;
  }> {
    try {
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      const clients = await this.redis.info('clients');

      const usedMemory = this.extractInfoValue(info, 'used_memory_human');
      const connectedClients = parseInt(this.extractInfoValue(clients, 'connected_clients'));
      const totalCommandsProcessed = parseInt(this.extractInfoValue(stats, 'total_commands_processed'));
      const keyspaceHits = parseInt(this.extractInfoValue(stats, 'keyspace_hits'));
      const keyspaceMisses = parseInt(this.extractInfoValue(stats, 'keyspace_misses'));
      const hitRate = keyspaceHits + keyspaceMisses > 0 
        ? (keyspaceHits / (keyspaceHits + keyspaceMisses)) * 100 
        : 0;

      return {
        usedMemory,
        connectedClients,
        totalCommandsProcessed,
        keyspaceHits,
        keyspaceMisses,
        hitRate: Math.round(hitRate * 100) / 100
      };
    } catch (error) {
      console.error('獲取快取統計資訊失敗:', error);
      return {
        usedMemory: '0B',
        connectedClients: 0,
        totalCommandsProcessed: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        hitRate: 0
      };
    }
  }

  // 從 Redis INFO 輸出中提取值
  private extractInfoValue(info: string, key: string): string {
    const lines = info.split('\r\n');
    for (const line of lines) {
      if (line.startsWith(`${key}:`)) {
        return line.split(':')[1];
      }
    }
    return '0';
  }
}

// 匯出 Redis 實例
export const redisConnection = RedisConnection.getInstance();

// 建立 Redis 快取實例的工廠函數
export async function createRedisCache(): Promise<RedisCache | null> {
  try {
    const redis = await redisConnection.connect();
    return new RedisCache(redis);
  } catch (error) {
    console.error('建立 Redis 快取實例失敗:', error);
    return null;
  }
}

// 匯出 Redis 客戶端實例（可能為 null）
export let redis: Redis | undefined = undefined;

// 初始化 Redis 連接
export async function initializeRedis(): Promise<void> {
  try {
    redis = await redisConnection.connect();
    console.log('Redis 初始化成功');
  } catch (error) {
    console.error('Redis 初始化失敗:', error);
    redis = undefined;
  }
}

export default redisConnection;