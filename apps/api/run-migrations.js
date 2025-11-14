const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 從環境變數獲取資料庫連接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('開始執行資料庫遷移...');
    
    // 創建遷移記錄表
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 獲取已執行的遷移
    const result = await client.query('SELECT version FROM schema_migrations');
    const executedMigrations = result.rows.map(row => row.version);
    
    // 讀取遷移文件
    const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`找到 ${files.length} 個遷移文件`);
    
    for (const file of files) {
      const [version] = file.split('_');
      
      if (executedMigrations.includes(version)) {
        console.log(`跳過已執行的遷移: ${file}`);
        continue;
      }
      
      console.log(`執行遷移: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
          [version, file.replace('.sql', '')]
        );
        await client.query('COMMIT');
        console.log(`✅ 遷移成功: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ 遷移失敗: ${file}`, error);
        throw error;
      }
    }
    
    console.log('所有遷移執行完成！');
  } catch (error) {
    console.error('遷移執行失敗:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
