# Render 資料庫設置指南

## 問題
資料庫表不存在，導致註冊功能失敗。

## 解決方案

### 方法 1: 使用 Render Shell 直接執行 SQL

1. **進入 Render Dashboard**
   - 找到你的 PostgreSQL 資料庫服務
   - 點擊 "Connect" 按鈕
   - 複製 "External Database URL"

2. **使用 psql 連接**
   ```bash
   # 在本地終端執行
   psql "YOUR_DATABASE_URL_HERE"
   ```

3. **執行遷移 SQL**
   ```sql
   -- 啟用 UUID 擴展
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- 建立用戶表
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
   );

   -- 建立用戶檔案表
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
   );

   -- 建立用戶偏好設定表
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
   );

   -- 建立索引
   CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
   CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
   CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
   CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

   -- 驗證表已創建
   \dt
   ```

### 方法 2: 使用 Render Web Shell

1. 進入 Render Dashboard
2. 選擇你的 Web Service (API)
3. 點擊 "Shell" 標籤
4. 執行以下命令：
   ```bash
   cd /opt/render/project/src/apps/api
   node run-migrations.js
   ```

### 方法 3: 創建簡化的初始化腳本

如果上述方法都不行，我們可以在 API 啟動時自動創建表。

## 驗證

執行後，測試註冊：
```bash
curl -X POST https://health-nutrition-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "P@55w0rd",
    "confirmPassword": "P@55w0rd",
    "profile": {
      "name": "測試用戶",
      "age": 30,
      "gender": "male",
      "height": 170,
      "weight": 70,
      "activityLevel": "moderately_active"
    }
  }'
```

應該返回成功訊息而不是 "relation \"users\" does not exist"。
