import Redis from 'ioredis';
import { redisConnection, RedisCache, createRedisCache } from '../redis';

// Mock Redis
jest.mock('ioredis');

const mockRedis = {
  ping: jest.fn(),
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  incr: jest.fn(),
  incrby: jest.fn(),
  hset: jest.fn(),
  hget: jest.fn(),
  hgetall: jest.fn(),
  hdel: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn(),
  sismember: jest.fn(),
  zadd: jest.fn(),
  zrange: jest.fn(),
  info: jest.fn(),
  quit: jest.fn(),
  on: jest.fn(),
} as unknown as Redis;

(Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis);

describe('RedisConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('應該成功連接到 Redis', async () => {
      (mockRedis.ping as jest.Mock).mockResolvedValue('PONG');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const client = await redisConnection.connect();

      expect(client).toBe(mockRedis);
      expect(mockRedis.ping).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('應該處理連接錯誤', async () => {
      (mockRedis.ping as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(redisConnection.connect()).rejects.toThrow('Connection failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Redis 連接失敗:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('應該返回現有連接', async () => {
      // 第一次連接
      (mockRedis.ping as jest.Mock).mockResolvedValue('PONG');
      const client1 = await redisConnection.connect();

      // 第二次連接應該返回相同實例
      const client2 = await redisConnection.connect();

      expect(client1).toBe(client2);
      expect(mockRedis.ping).toHaveBeenCalledTimes(1); // 只調用一次
    });
  });

  describe('testConnection', () => {
    it('應該測試連接成功', async () => {
      (mockRedis.ping as jest.Mock).mockResolvedValue('PONG');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await redisConnection.testConnection();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Redis 連接測試成功:', 'PONG');

      consoleSpy.mockRestore();
    });

    it('應該處理測試失敗', async () => {
      (mockRedis.ping as jest.Mock).mockRejectedValue(new Error('Test failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await redisConnection.testConnection();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Redis 連接測試失敗:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('close', () => {
    it('應該關閉連接', async () => {
      (mockRedis.quit as jest.Mock).mockResolvedValue('OK');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await redisConnection.close();

      expect(mockRedis.quit).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Redis 連接已關閉');

      consoleSpy.mockRestore();
    });

    it('應該處理關閉錯誤', async () => {
      (mockRedis.quit as jest.Mock).mockRejectedValue(new Error('Close failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await redisConnection.close();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '關閉 Redis 連接時發生錯誤:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('RedisCache', () => {
  let redisCache: RedisCache;

  beforeEach(() => {
    jest.clearAllMocks();
    redisCache = new RedisCache(mockRedis);
  });

  describe('set', () => {
    it('應該設定快取', async () => {
      const testData = { id: 1, name: 'test' };
      (mockRedis.setex as jest.Mock).mockResolvedValue('OK');

      await redisCache.set('test:key', testData, 3600);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:key',
        3600,
        JSON.stringify(testData)
      );
    });

    it('應該處理設定錯誤', async () => {
      (mockRedis.setex as jest.Mock).mockRejectedValue(new Error('Set failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await redisCache.set('test:key', { data: 'test' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '設定快取失敗:',
        expect.objectContaining({
          key: 'test:key',
          error: expect.any(Error)
        })
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('應該獲取快取資料', async () => {
      const testData = { id: 1, name: 'test' };
      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(testData));

      const result = await redisCache.get<typeof testData>('test:key');

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test:key');
    });

    it('應該在快取不存在時返回 null', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);

      const result = await redisCache.get('test:key');

      expect(result).toBeNull();
    });

    it('應該處理 JSON 解析錯誤', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue('invalid json');

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await redisCache.get('test:key');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '獲取快取失敗:',
        expect.objectContaining({
          key: 'test:key',
          error: expect.any(Error)
        })
      );

      consoleErrorSpy.mockRestore();
    });

    it('應該處理獲取錯誤', async () => {
      (mockRedis.get as jest.Mock).mockRejectedValue(new Error('Get failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await redisCache.get('test:key');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('del', () => {
    it('應該刪除快取', async () => {
      (mockRedis.del as jest.Mock).mockResolvedValue(1);

      await redisCache.del('test:key');

      expect(mockRedis.del).toHaveBeenCalledWith('test:key');
    });

    it('應該處理刪除錯誤', async () => {
      (mockRedis.del as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await redisCache.del('test:key');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '刪除快取失敗:',
        expect.objectContaining({
          key: 'test:key',
          error: expect.any(Error)
        })
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('delPattern', () => {
    it('應該批量刪除快取', async () => {
      (mockRedis.keys as jest.Mock).mockResolvedValue(['test:key1', 'test:key2']);
      (mockRedis.del as jest.Mock).mockResolvedValue(2);

      await redisCache.delPattern('test:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
      expect(mockRedis.del).toHaveBeenCalledWith('test:key1', 'test:key2');
    });

    it('應該處理沒有匹配鍵的情況', async () => {
      (mockRedis.keys as jest.Mock).mockResolvedValue([]);

      await redisCache.delPattern('test:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('應該檢查快取是否存在', async () => {
      (mockRedis.exists as jest.Mock).mockResolvedValue(1);

      const result = await redisCache.exists('test:key');

      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith('test:key');
    });

    it('應該在快取不存在時返回 false', async () => {
      (mockRedis.exists as jest.Mock).mockResolvedValue(0);

      const result = await redisCache.exists('test:key');

      expect(result).toBe(false);
    });
  });

  describe('expire', () => {
    it('應該設定快取過期時間', async () => {
      (mockRedis.expire as jest.Mock).mockResolvedValue(1);

      await redisCache.expire('test:key', 3600);

      expect(mockRedis.expire).toHaveBeenCalledWith('test:key', 3600);
    });
  });

  describe('ttl', () => {
    it('應該獲取快取剩餘時間', async () => {
      (mockRedis.ttl as jest.Mock).mockResolvedValue(1800);

      const result = await redisCache.ttl('test:key');

      expect(result).toBe(1800);
      expect(mockRedis.ttl).toHaveBeenCalledWith('test:key');
    });
  });

  describe('incr', () => {
    it('應該原子性增加數值', async () => {
      (mockRedis.incr as jest.Mock).mockResolvedValue(1);

      const result = await redisCache.incr('counter:key');

      expect(result).toBe(1);
      expect(mockRedis.incr).toHaveBeenCalledWith('counter:key');
    });
  });

  describe('incrBy', () => {
    it('應該原子性增加指定數值', async () => {
      (mockRedis.incrby as jest.Mock).mockResolvedValue(10);

      const result = await redisCache.incrBy('counter:key', 5);

      expect(result).toBe(10);
      expect(mockRedis.incrby).toHaveBeenCalledWith('counter:key', 5);
    });
  });

  describe('Hash 操作', () => {
    describe('hset', () => {
      it('應該設定 Hash 欄位', async () => {
        const testData = { name: 'test' };
        (mockRedis.hset as jest.Mock).mockResolvedValue(1);

        await redisCache.hset('hash:key', 'field', testData);

        expect(mockRedis.hset).toHaveBeenCalledWith(
          'hash:key',
          'field',
          JSON.stringify(testData)
        );
      });
    });

    describe('hget', () => {
      it('應該獲取 Hash 欄位', async () => {
        const testData = { name: 'test' };
        (mockRedis.hget as jest.Mock).mockResolvedValue(JSON.stringify(testData));

        const result = await redisCache.hget<typeof testData>('hash:key', 'field');

        expect(result).toEqual(testData);
        expect(mockRedis.hget).toHaveBeenCalledWith('hash:key', 'field');
      });

      it('應該在欄位不存在時返回 null', async () => {
        (mockRedis.hget as jest.Mock).mockResolvedValue(null);

        const result = await redisCache.hget('hash:key', 'field');

        expect(result).toBeNull();
      });
    });

    describe('hgetall', () => {
      it('應該獲取所有 Hash 欄位', async () => {
        const mockHash = {
          field1: JSON.stringify({ data: 'test1' }),
          field2: JSON.stringify({ data: 'test2' }),
          field3: 'plain string'
        };
        (mockRedis.hgetall as jest.Mock).mockResolvedValue(mockHash);

        const result = await redisCache.hgetall('hash:key');

        expect(result).toEqual({
          field1: { data: 'test1' },
          field2: { data: 'test2' },
          field3: 'plain string'
        });
      });
    });

    describe('hdel', () => {
      it('應該刪除 Hash 欄位', async () => {
        (mockRedis.hdel as jest.Mock).mockResolvedValue(1);

        await redisCache.hdel('hash:key', 'field');

        expect(mockRedis.hdel).toHaveBeenCalledWith('hash:key', 'field');
      });
    });
  });

  describe('Set 操作', () => {
    describe('sadd', () => {
      it('應該添加到集合', async () => {
        (mockRedis.sadd as jest.Mock).mockResolvedValue(1);

        await redisCache.sadd('set:key', 'member');

        expect(mockRedis.sadd).toHaveBeenCalledWith('set:key', 'member');
      });
    });

    describe('srem', () => {
      it('應該從集合移除', async () => {
        (mockRedis.srem as jest.Mock).mockResolvedValue(1);

        await redisCache.srem('set:key', 'member');

        expect(mockRedis.srem).toHaveBeenCalledWith('set:key', 'member');
      });
    });

    describe('smembers', () => {
      it('應該獲取集合所有成員', async () => {
        const members = ['member1', 'member2'];
        (mockRedis.smembers as jest.Mock).mockResolvedValue(members);

        const result = await redisCache.smembers('set:key');

        expect(result).toEqual(members);
        expect(mockRedis.smembers).toHaveBeenCalledWith('set:key');
      });
    });

    describe('sismember', () => {
      it('應該檢查是否為集合成員', async () => {
        (mockRedis.sismember as jest.Mock).mockResolvedValue(1);

        const result = await redisCache.sismember('set:key', 'member');

        expect(result).toBe(true);
        expect(mockRedis.sismember).toHaveBeenCalledWith('set:key', 'member');
      });

      it('應該在不是成員時返回 false', async () => {
        (mockRedis.sismember as jest.Mock).mockResolvedValue(0);

        const result = await redisCache.sismember('set:key', 'member');

        expect(result).toBe(false);
      });
    });
  });

  describe('Sorted Set 操作', () => {
    describe('zadd', () => {
      it('應該添加到有序集合', async () => {
        (mockRedis.zadd as jest.Mock).mockResolvedValue(1);

        await redisCache.zadd('zset:key', 100, 'member');

        expect(mockRedis.zadd).toHaveBeenCalledWith('zset:key', 100, 'member');
      });
    });

    describe('zrange', () => {
      it('應該獲取有序集合範圍', async () => {
        const members = ['member1', 'member2'];
        (mockRedis.zrange as jest.Mock).mockResolvedValue(members);

        const result = await redisCache.zrange('zset:key', 0, -1);

        expect(result).toEqual(members);
        expect(mockRedis.zrange).toHaveBeenCalledWith('zset:key', 0, -1);
      });

      it('應該獲取有序集合範圍（包含分數）', async () => {
        const membersWithScores = ['member1', '100', 'member2', '200'];
        (mockRedis.zrange as jest.Mock).mockResolvedValue(membersWithScores);

        const result = await redisCache.zrange('zset:key', 0, -1, true);

        expect(result).toEqual(membersWithScores);
        expect(mockRedis.zrange).toHaveBeenCalledWith('zset:key', 0, -1, 'WITHSCORES');
      });
    });
  });

  describe('getStats', () => {
    it('應該獲取快取統計資訊', async () => {
      (mockRedis.info as jest.Mock)
        .mockResolvedValueOnce('used_memory_human:1.5M\r\n') // memory info
        .mockResolvedValueOnce('total_commands_processed:1000\r\nkeyspace_hits:800\r\nkeyspace_misses:200\r\n') // stats info
        .mockResolvedValueOnce('connected_clients:5\r\n'); // clients info

      const stats = await redisCache.getStats();

      expect(stats).toEqual({
        usedMemory: '1.5M',
        connectedClients: 5,
        totalCommandsProcessed: 1000,
        keyspaceHits: 800,
        keyspaceMisses: 200,
        hitRate: 80
      });
    });

    it('應該處理統計資訊獲取錯誤', async () => {
      (mockRedis.info as jest.Mock).mockRejectedValue(new Error('Info failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const stats = await redisCache.getStats();

      expect(stats).toEqual({
        usedMemory: '0B',
        connectedClients: 0,
        totalCommandsProcessed: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0,
        hitRate: 0
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '獲取快取統計資訊失敗:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('createRedisCache', () => {
  it('應該建立 Redis 快取實例', async () => {
    (mockRedis.ping as jest.Mock).mockResolvedValue('PONG');

    const cache = await createRedisCache();

    expect(cache).toBeInstanceOf(RedisCache);
  });

  it('應該在連接失敗時返回 null', async () => {
    (mockRedis.ping as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const cache = await createRedisCache();

    expect(cache).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '建立 Redis 快取實例失敗:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});