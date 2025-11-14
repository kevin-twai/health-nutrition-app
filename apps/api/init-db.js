const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 初始化資料庫...');
    
    // 啟用 UUID 擴展
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID 擴展已啟用');
    
    // 建立用戶表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ users 表已創建');
    
    // 建立用戶檔案表
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        age INTEGER CHECK (age > 0 AND age <= 150),
        gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
        height DECIMAL(5,2) CHECK (height > 0),
        weight DECIMAL(5,2) CHECK (weight > 0),
        activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
        avatar_url VARCHAR(500),
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ user_profiles 表已創建');
    
    // 建立用戶偏好設定表
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        language VARCHAR(10) DEFAULT 'zh-TW',
        timezone VARCHAR(50) DEFAULT 'Asia/Taipei',
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        weekly_report_notifications BOOLEAN DEFAULT true,
        achievement_notifications BOOLEAN DEFAULT true,
        data_sharing BOOLEAN DEFAULT false,
        analytics BOOLEAN DEFAULT true,
        third_party_integration BOOLEAN DEFAULT true,
        profile_visibility VARCHAR(20) DEFAULT 'private' CHECK (profile_visibility IN ('public', 'friends', 'private')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ user_preferences 表已創建');
    
    // 建立索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id)');
    console.log('✅ 索引已創建');
    
    console.log('🎉 資料庫初始化完成！');
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDatabase };
