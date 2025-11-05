const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

// 資料庫連接配置
const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'health_tracker_test',
  user: process.env.DB_USER || 'test',
  password: process.env.DB_PASSWORD || 'test',
};

const mongoUrl = process.env.MONGODB_URL || 'mongodb://test:test@localhost:27018/health_tracker_test';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';

async function setupPostgreSQL() {
  console.log('設定 PostgreSQL 測試資料庫...');
  
  const pool = new Pool(pgConfig);
  
  try {
    // 執行遷移腳本
    const migrationFiles = [
      '001_create_user_tables.sql',
      '002_create_conversation_tables.sql',
      '003_create_gamification_tables.sql'
    ];
    
    for (const file of migrationFiles) {
      const migrationPath = path.join(__dirname, '../src/database/migrations', file);
      if (fs.existsSync(migrationPath)) {
        const migration = fs.readFileSync(migrationPath, 'utf8');
        await pool.query(migration);
        console.log(`✓ 執行遷移: ${file}`);
      }
    }
    
    // 插入測試資料
    await insertTestUsers(pool);
    await insertTestFoodLogs(pool);
    
    console.log('✓ PostgreSQL 測試資料庫設定完成');
  } catch (error) {
    console.error('PostgreSQL 設定錯誤:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function insertTestUsers(pool) {
  const testUsers = [
    {
      id: 'test-user-1',
      email: 'test@example.com',
      password_hash: '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', // TestPassword123!
      name: '測試用戶',
      age: 30,
      gender: 'other',
      height: 170,
      weight: 70,
      activity_level: 'moderate',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'test-user-2',
      email: 'test2@example.com',
      password_hash: '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq',
      name: '測試用戶2',
      age: 25,
      gender: 'female',
      height: 165,
      weight: 60,
      activity_level: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  for (const user of testUsers) {
    await pool.query(`
      INSERT INTO users (id, email, password_hash, name, age, gender, height, weight, activity_level, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO NOTHING
    `, [
      user.id, user.email, user.password_hash, user.name, user.age,
      user.gender, user.height, user.weight, user.activity_level,
      user.created_at, user.updated_at
    ]);
  }
  
  console.log('✓ 插入測試用戶資料');
}

async function insertTestFoodLogs(pool) {
  const testFoodLogs = [
    {
      id: 'log-1',
      user_id: 'test-user-1',
      food_id: 'apple-001',
      portion: 1,
      meal_type: 'breakfast',
      calories: 52,
      protein: 0.3,
      carbohydrates: 14,
      fat: 0.2,
      logged_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'log-2',
      user_id: 'test-user-1',
      food_id: 'chicken-001',
      portion: 1.5,
      meal_type: 'lunch',
      calories: 231,
      protein: 43.5,
      carbohydrates: 0,
      fat: 5.1,
      logged_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12小時前
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  for (const log of testFoodLogs) {
    await pool.query(`
      INSERT INTO food_logs (id, user_id, food_id, portion, meal_type, calories, protein, carbohydrates, fat, logged_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING
    `, [
      log.id, log.user_id, log.food_id, log.portion, log.meal_type,
      log.calories, log.protein, log.carbohydrates, log.fat,
      log.logged_at, log.created_at, log.updated_at
    ]);
  }
  
  console.log('✓ 插入測試食物記錄');
}

async function setupMongoDB() {
  console.log('設定 MongoDB 測試資料庫...');
  
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    const db = client.db();
    
    // 建立食物資料集合
    const foodsCollection = db.collection('foods');
    
    // 插入測試食物資料
    const testFoods = [
      {
        _id: 'apple-001',
        name: '蘋果',
        name_en: 'Apple',
        category: 'fruits',
        nutritionPer100g: {
          calories: 52,
          protein: 0.3,
          carbohydrates: 14,
          fat: 0.2,
          fiber: 2.4,
          sugar: 10.4,
          sodium: 1
        },
        commonPortions: [
          { name: '1個中等大小', weight: 182 },
          { name: '1個小', weight: 149 },
          { name: '1個大', weight: 223 }
        ],
        tags: ['水果', '低熱量', '高纖維'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'chicken-001',
        name: '雞胸肉',
        name_en: 'Chicken Breast',
        category: 'meat',
        nutritionPer100g: {
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fat: 3.6,
          fiber: 0,
          sugar: 0,
          sodium: 74
        },
        commonPortions: [
          { name: '1片', weight: 140 },
          { name: '100公克', weight: 100 },
          { name: '1份', weight: 85 }
        ],
        tags: ['蛋白質', '低脂', '肉類'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'rice-001',
        name: '白米飯',
        name_en: 'White Rice',
        category: 'grains',
        nutritionPer100g: {
          calories: 130,
          protein: 2.7,
          carbohydrates: 28,
          fat: 0.3,
          fiber: 0.4,
          sugar: 0.1,
          sodium: 1
        },
        commonPortions: [
          { name: '1碗', weight: 150 },
          { name: '半碗', weight: 75 },
          { name: '1份', weight: 100 }
        ],
        tags: ['主食', '碳水化合物', '穀物'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await foodsCollection.deleteMany({}); // 清空現有資料
    await foodsCollection.insertMany(testFoods);
    
    // 建立索引
    await foodsCollection.createIndex({ name: 'text', name_en: 'text', tags: 'text' });
    await foodsCollection.createIndex({ category: 1 });
    
    console.log('✓ MongoDB 測試資料庫設定完成');
  } catch (error) {
    console.error('MongoDB 設定錯誤:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function setupRedis() {
  console.log('設定 Redis 測試快取...');
  
  const redis = new Redis(redisUrl);
  
  try {
    // 清空測試快取
    await redis.flushdb();
    
    // 設定一些測試快取資料
    await redis.setex('test:food:search:apple', 300, JSON.stringify([
      { id: 'apple-001', name: '蘋果', category: 'fruits' }
    ]));
    
    await redis.setex('test:user:session:test-user-1', 3600, JSON.stringify({
      userId: 'test-user-1',
      email: 'test@example.com',
      lastActivity: new Date()
    }));
    
    console.log('✓ Redis 測試快取設定完成');
  } catch (error) {
    console.error('Redis 設定錯誤:', error);
    throw error;
  } finally {
    redis.disconnect();
  }
}

async function main() {
  console.log('🚀 開始設定測試資料庫...');
  
  try {
    await setupPostgreSQL();
    await setupMongoDB();
    await setupRedis();
    
    console.log('✅ 所有測試資料庫設定完成！');
  } catch (error) {
    console.error('❌ 測試資料庫設定失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  setupPostgreSQL,
  setupMongoDB,
  setupRedis
};