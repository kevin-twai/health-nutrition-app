import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';

// 資料庫連接配置
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// 從環境變數獲取資料庫配置
const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'health_nutrition_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
    max: 20, // 最大連接數
    idleTimeoutMillis: 30000, // 閒置超時
    connectionTimeoutMillis: 2000, // 連接超時
  };
};

// 建立資料庫連接池
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    const config = getDatabaseConfig();
    this.pool = new Pool(config);

    // 監聽連接事件
    this.pool.on('connect', (client: PoolClient) => {
      console.log('新的資料庫連接已建立');
    });

    this.pool.on('error', (err: Error) => {
      console.error('資料庫連接池發生錯誤:', err);
    });

    // 優雅關閉
    process.on('SIGINT', () => {
      this.close();
    });

    process.on('SIGTERM', () => {
      this.close();
    });
  }

  // 單例模式獲取實例
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  // 獲取連接池
  public getPool(): Pool {
    return this.pool;
  }

  // 執行查詢
  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('執行查詢:', { text, duration, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      console.error('查詢執行失敗:', { text, error });
      throw error;
    }
  }

  // 執行事務
  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
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

  // 測試連接
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('資料庫連接測試成功:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('資料庫連接測試失敗:', error);
      return false;
    }
  }

  // 關閉連接池
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('資料庫連接池已關閉');
    } catch (error) {
      console.error('關閉資料庫連接池時發生錯誤:', error);
    }
  }
}

// 資料庫遷移管理器
export class MigrationManager {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  // 建立遷移記錄表
  private async createMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.db.query(createTableQuery);
  }

  // 獲取已執行的遷移
  private async getExecutedMigrations(): Promise<string[]> {
    await this.createMigrationsTable();
    
    const result = await this.db.query(
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    
    return result.rows.map((row: any) => row.version);
  }

  // 獲取待執行的遷移檔案
  private getMigrationFiles(): { version: string; name: string; path: string }[] {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('遷移目錄不存在，跳過遷移');
      return [];
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const [version, ...nameParts] = file.replace('.sql', '').split('_');
      return {
        version,
        name: nameParts.join('_'),
        path: path.join(migrationsDir, file)
      };
    });
  }

  // 執行單個遷移
  private async executeMigration(migration: { version: string; name: string; path: string }): Promise<void> {
    const sql = fs.readFileSync(migration.path, 'utf8');
    
    await this.db.transaction(async (client) => {
      // 執行遷移 SQL
      await client.query(sql);
      
      // 記錄遷移執行
      await client.query(
        'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
        [migration.version, migration.name]
      );
    });

    console.log(`遷移 ${migration.version}_${migration.name} 執行成功`);
  }

  // 執行所有待執行的遷移
  public async runMigrations(): Promise<void> {
    try {
      console.log('開始執行資料庫遷移...');
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = this.getMigrationFiles();
      
      const pendingMigrations = migrationFiles.filter(
        migration => !executedMigrations.includes(migration.version)
      );

      if (pendingMigrations.length === 0) {
        console.log('沒有待執行的遷移');
        return;
      }

      console.log(`發現 ${pendingMigrations.length} 個待執行的遷移`);

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      console.log('所有遷移執行完成');
    } catch (error) {
      console.error('遷移執行失敗:', error);
      throw error;
    }
  }

  // 回滾遷移 (簡單實現)
  public async rollbackLastMigration(): Promise<void> {
    try {
      const result = await this.db.query(
        'SELECT version, name FROM schema_migrations ORDER BY executed_at DESC LIMIT 1'
      );

      if (result.rows.length === 0) {
        console.log('沒有可回滾的遷移');
        return;
      }

      const lastMigration = result.rows[0];
      
      // 刪除遷移記錄
      await this.db.query(
        'DELETE FROM schema_migrations WHERE version = $1',
        [lastMigration.version]
      );

      console.log(`已回滾遷移 ${lastMigration.version}_${lastMigration.name}`);
      console.log('注意: 資料庫結構變更需要手動處理');
    } catch (error) {
      console.error('遷移回滾失敗:', error);
      throw error;
    }
  }
}

// 匯出單例實例
export const db = DatabaseConnection.getInstance();
export default db;