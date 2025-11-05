-- 健康營養追蹤系統 - 用戶相關資料表遷移腳本
-- 版本: 001
-- 描述: 建立用戶、用戶檔案、健康目標等核心資料表

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
    height DECIMAL(5,2) CHECK (height > 0), -- cm
    weight DECIMAL(5,2) CHECK (weight > 0), -- kg
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
    -- 通知設定
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    weekly_report_notifications BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    -- 隱私設定
    data_sharing BOOLEAN DEFAULT false,
    analytics BOOLEAN DEFAULT true,
    third_party_integration BOOLEAN DEFAULT true,
    profile_visibility VARCHAR(20) DEFAULT 'private' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立健康目標表
CREATE TABLE IF NOT EXISTS health_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(30) CHECK (type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'health_improvement')),
    target DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'kg',
    start_date DATE DEFAULT CURRENT_DATE,
    deadline DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立健康目標進度記錄表
CREATE TABLE IF NOT EXISTS health_goal_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID REFERENCES health_goals(id) ON DELETE CASCADE,
    value DECIMAL(10,2) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立用戶身體數據歷史表
CREATE TABLE IF NOT EXISTS user_body_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass DECIMAL(5,2),
    bone_mass DECIMAL(5,2),
    water_percentage DECIMAL(4,2),
    visceral_fat INTEGER,
    metabolic_age INTEGER,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'smart_scale', 'third_party')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_status ON health_goals(status);
CREATE INDEX IF NOT EXISTS idx_health_goals_deadline ON health_goals(deadline);
CREATE INDEX IF NOT EXISTS idx_health_goal_progress_goal_id ON health_goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_health_goal_progress_recorded_at ON health_goal_progress(recorded_at);
CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_id ON user_body_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_body_metrics_measured_at ON user_body_metrics(measured_at);

-- 建立更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要的表建立更新時間觸發器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_goals_updated_at ON health_goals;
CREATE TRIGGER update_health_goals_updated_at 
    BEFORE UPDATE ON health_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 建立視圖以簡化常用查詢
CREATE OR REPLACE VIEW user_complete_profile AS
SELECT 
    u.id,
    u.email,
    u.is_active,
    u.email_verified,
    u.last_login_at,
    u.created_at,
    u.updated_at,
    up.name,
    up.age,
    up.gender,
    up.height,
    up.weight,
    up.activity_level,
    up.avatar_url,
    up.bio,
    upr.language,
    upr.timezone,
    upr.email_notifications,
    upr.push_notifications,
    upr.sms_notifications,
    upr.weekly_report_notifications,
    upr.achievement_notifications,
    upr.data_sharing,
    upr.analytics,
    upr.third_party_integration,
    upr.profile_visibility
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_preferences upr ON u.id = upr.user_id;

-- 建立函數來計算 BMI
CREATE OR REPLACE FUNCTION calculate_bmi(height_cm DECIMAL, weight_kg DECIMAL)
RETURNS DECIMAL(4,1) AS $$
BEGIN
    IF height_cm IS NULL OR weight_kg IS NULL OR height_cm <= 0 OR weight_kg <= 0 THEN
        RETURN NULL;
    END IF;
    
    RETURN ROUND((weight_kg / POWER(height_cm / 100.0, 2))::DECIMAL, 1);
END;
$$ LANGUAGE plpgsql;

-- 建立函數來計算基礎代謝率 (BMR)
CREATE OR REPLACE FUNCTION calculate_bmr(gender VARCHAR, age INTEGER, height_cm DECIMAL, weight_kg DECIMAL)
RETURNS INTEGER AS $$
BEGIN
    IF gender IS NULL OR age IS NULL OR height_cm IS NULL OR weight_kg IS NULL THEN
        RETURN NULL;
    END IF;
    
    IF gender = 'male' THEN
        RETURN ROUND(10 * weight_kg + 6.25 * height_cm - 5 * age + 5);
    ELSE
        RETURN ROUND(10 * weight_kg + 6.25 * height_cm - 5 * age - 161);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 建立函數來計算每日總消耗熱量 (TDEE)
CREATE OR REPLACE FUNCTION calculate_tdee(gender VARCHAR, age INTEGER, height_cm DECIMAL, weight_kg DECIMAL, activity_level VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    bmr INTEGER;
    multiplier DECIMAL;
BEGIN
    bmr := calculate_bmr(gender, age, height_cm, weight_kg);
    
    IF bmr IS NULL OR activity_level IS NULL THEN
        RETURN NULL;
    END IF;
    
    CASE activity_level
        WHEN 'sedentary' THEN multiplier := 1.2;
        WHEN 'lightly_active' THEN multiplier := 1.375;
        WHEN 'moderately_active' THEN multiplier := 1.55;
        WHEN 'very_active' THEN multiplier := 1.725;
        WHEN 'extremely_active' THEN multiplier := 1.9;
        ELSE multiplier := 1.2;
    END CASE;
    
    RETURN ROUND(bmr * multiplier);
END;
$$ LANGUAGE plpgsql;

-- 插入預設的健康目標類型參考資料
CREATE TABLE IF NOT EXISTS goal_type_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_unit VARCHAR(20),
    min_target DECIMAL(10,2),
    max_target DECIMAL(10,2),
    recommended_duration_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO goal_type_templates (type, name, description, default_unit, min_target, max_target, recommended_duration_days) VALUES
('weight_loss', '減重目標', '透過健康飲食和運動達到理想體重', 'kg', 0.5, 30, 90),
('weight_gain', '增重目標', '健康增重，增加肌肉量和體重', 'kg', 0.5, 20, 90),
('muscle_gain', '增肌目標', '透過重量訓練和蛋白質攝取增加肌肉量', 'kg', 0.5, 10, 120),
('maintenance', '體重維持', '維持當前健康體重', 'kg', -2, 2, 365),
('health_improvement', '健康改善', '改善整體健康指標', '分', 1, 100, 180)
ON CONFLICT DO NOTHING;