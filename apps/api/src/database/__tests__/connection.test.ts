import { Pool } from 'pg';
import { db, MigrationManager } from '../connection';
import fs from 'fs';
import path from 'path';

// Mock dependencies
jest.mock('pg');
jest.mock('fs');

const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn(),
} as unknown as Pool;

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

// Mock Pool constructor
(Pool as jest.MockedClass<typeof Pool>).mockImplementation(() => mockPool);

describe('DatabaseConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('query', () => {
    it('應該執行查詢並返回結果', async () => {
      const mockResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1
      };

      (mockPool.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await db.query('SELECT * FROM test', []);

      expect(result).toEqual(mockResult);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', []);
    });

    it('應該處理查詢錯誤', async () => {
      const mockError = new Error('Query failed');
      (mockPool.query as jest.Mock).mockRejectedValue(mockError);

      await expect(db.query('INVALID SQL')).rejects.toThrow('Query failed');
    });

    it('應該記錄查詢時間（開發環境）', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockResult = { rows: [], rowCount: 0 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockResult);

      await db.query('SELECT 1');

      expect(consoleSpy).toHaveBeenCalledWith(
        '執行查詢:',
        expect.objectContaining({
          text: 'SELECT 1',
          duration: expect.any(Number),
          rows: 0
        })
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('transaction', () => {
    it('應該執行事務並提交', async () => {
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock).mockResolvedValue(undefined);

      const callback = jest.fn().mockResolvedValue('success');

      const result = await db.transaction(callback);

      expect(result).toBe('success');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('應該在錯誤時回滾事務', async () => {
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock).mockResolvedValue(undefined);

      const callback = jest.fn().mockRejectedValue(new Error('Transaction failed'));

      await expect(db.transaction(callback)).rejects.toThrow('Transaction failed');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('應該測試連接成功', async () => {
      const mockResult = { rows: [{ now: new Date() }] };
      (mockPool.query as jest.Mock).mockResolvedValue(mockResult);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await db.testConnection();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        '資料庫連接測試成功:',
        mockResult.rows[0]
      );

      consoleSpy.mockRestore();
    });

    it('應該處理連接失敗', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await db.testConnection();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '資料庫連接測試失敗:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('close', () => {
    it('應該關閉連接池', async () => {
      (mockPool.end as jest.Mock).mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await db.close();

      expect(mockPool.end).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('資料庫連接池已關閉');

      consoleSpy.mockRestore();
    });

    it('應該處理關閉錯誤', async () => {
      (mockPool.end as jest.Mock).mockRejectedValue(new Error('Close failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await db.close();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '關閉資料庫連接池時發生錯誤:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('MigrationManager', () => {
  let migrationManager: MigrationManager;

  beforeEach(() => {
    jest.clearAllMocks();
    migrationManager = new MigrationManager();
  });

  describe('runMigrations', () => {
    it('應該執行待執行的遷移', async () => {
      // Mock 建立遷移表
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce(undefined) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [] }) // 查詢已執行的遷移
        .mockResolvedValueOnce(undefined); // 插入遷移記錄

      // Mock 檔案系統
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['001_create_tables.sql']);
      (fs.readFileSync as jest.Mock).mockReturnValue('CREATE TABLE test();');

      // Mock 事務
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock).mockResolvedValue(undefined);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await migrationManager.runMigrations();

      expect(consoleSpy).toHaveBeenCalledWith('開始執行資料庫遷移...');
      expect(consoleSpy).toHaveBeenCalledWith('發現 1 個待執行的遷移');
      expect(consoleSpy).toHaveBeenCalledWith('遷移 001_create_tables 執行成功');
      expect(consoleSpy).toHaveBeenCalledWith('所有遷移執行完成');

      consoleSpy.mockRestore();
    });

    it('應該跳過已執行的遷移', async () => {
      // Mock 已執行的遷移
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce(undefined) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [{ version: '001' }] }); // 已執行的遷移

      // Mock 檔案系統
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['001_create_tables.sql']);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await migrationManager.runMigrations();

      expect(consoleSpy).toHaveBeenCalledWith('沒有待執行的遷移');

      consoleSpy.mockRestore();
    });

    it('應該處理遷移目錄不存在的情況', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await migrationManager.runMigrations();

      expect(consoleSpy).toHaveBeenCalledWith('遷移目錄不存在，跳過遷移');

      consoleSpy.mockRestore();
    });

    it('應該處理遷移執行錯誤', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce(undefined) // CREATE TABLE
        .mockResolvedValueOnce({ rows: [] }) // 查詢已執行的遷移
        .mockRejectedValueOnce(new Error('Migration failed')); // 遷移失敗

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['001_create_tables.sql']);
      (fs.readFileSync as jest.Mock).mockReturnValue('INVALID SQL;');

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(migrationManager.runMigrations()).rejects.toThrow('Migration failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '遷移執行失敗:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('rollbackLastMigration', () => {
    it('應該回滾最後一個遷移', async () => {
      const mockLastMigration = {
        version: '001',
        name: 'create_tables'
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockLastMigration] }) // 查詢最後遷移
        .mockResolvedValueOnce(undefined); // 刪除遷移記錄

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await migrationManager.rollbackLastMigration();

      expect(consoleSpy).toHaveBeenCalledWith('已回滾遷移 001_create_tables');
      expect(consoleSpy).toHaveBeenCalledWith('注意: 資料庫結構變更需要手動處理');

      consoleSpy.mockRestore();
    });

    it('應該處理沒有可回滾遷移的情況', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await migrationManager.rollbackLastMigration();

      expect(consoleSpy).toHaveBeenCalledWith('沒有可回滾的遷移');

      consoleSpy.mockRestore();
    });

    it('應該處理回滾錯誤', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Rollback failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(migrationManager.rollbackLastMigration()).rejects.toThrow('Rollback failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '遷移回滾失敗:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});