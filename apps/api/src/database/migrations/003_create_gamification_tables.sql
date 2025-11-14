-- 健康營養追蹤系統 - 遊戲化系統資料表遷移腳本
-- 版本: 003
-- 描述: 建立任務、積分、成就、徽章等遊戲化相關資料表

-- 建立任務模板表
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('daily', 'weekly', 'monthly', 'milestone')) NOT NULL,
    category VARCHAR(50) NOT NULL, -- nutrition, exercise, logging, social, etc.
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')) DEFAULT 'easy',
    requirements JSONB, -- 任務完成條件
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立用戶任務表
CREATE TABLE IF NOT EXISTS user_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES task_templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('daily', 'weekly', 'monthly', 'milestone')) NOT NULL,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')) DEFAULT 'pending',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0),
    target INTEGER DEFAULT 1 CHECK (target > 0),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立用戶積分記錄表
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL, -- task_completion, daily_login, achievement, bonus, etc.
    source_id UUID, -- 關聯的任務或成就ID
    description VARCHAR(255),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立用戶等級和經驗值表
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
    total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立成就模板表
CREATE TABLE IF NOT EXISTS achievement_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('milestone', 'streak', 'collection', 'special')) NOT NULL,
    requirements JSONB NOT NULL, -- 成就獲得條件
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false, -- 隱藏成就，直到獲得才顯示
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立用戶成就表
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievement_templates(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress JSONB, -- 成就進度資料
    UNIQUE(user_id, achievement_id)
);

-- 建立徽章模板表
CREATE TABLE IF NOT EXISTS badge_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(7), -- HEX color code
    category VARCHAR(50) NOT NULL,
    requirements JSONB NOT NULL, -- 徽章獲得條件
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立用戶徽章表
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badge_templates(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_displayed BOOLEAN DEFAULT true, -- 是否在個人檔案中顯示
    UNIQUE(user_id, badge_id)
);

-- 建立排行榜表
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- weekly_points, monthly_points, streak_days, etc.
    score INTEGER NOT NULL,
    rank INTEGER,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立任務進度記錄表
CREATE TABLE IF NOT EXISTS task_progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE,
    progress_delta INTEGER NOT NULL, -- 進度變化量
    previous_progress INTEGER NOT NULL,
    new_progress INTEGER NOT NULL,
    metadata JSONB, -- 額外的進度資料
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_task_templates_type ON task_templates(type);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category);
CREATE INDEX IF NOT EXISTS idx_task_templates_active ON task_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_template_id ON user_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_type ON user_tasks(type);
CREATE INDEX IF NOT EXISTS idx_user_tasks_expires_at ON user_tasks(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_source ON user_points(source);
CREATE INDEX IF NOT EXISTS idx_user_points_earned_at ON user_points(earned_at);

CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON user_levels(level);
CREATE INDEX IF NOT EXISTS idx_user_levels_total_points ON user_levels(total_points);
CREATE INDEX IF NOT EXISTS idx_user_levels_streak_days ON user_levels(streak_days);

CREATE INDEX IF NOT EXISTS idx_achievement_templates_category ON achievement_templates(category);
CREATE INDEX IF NOT EXISTS idx_achievement_templates_type ON achievement_templates(type);
CREATE INDEX IF NOT EXISTS idx_achievement_templates_active ON achievement_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

CREATE INDEX IF NOT EXISTS idx_badge_templates_category ON badge_templates(category);
CREATE INDEX IF NOT EXISTS idx_badge_templates_active ON badge_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);

CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON leaderboards(type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_task_progress_logs_task_id ON task_progress_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_logs_recorded_at ON task_progress_logs(recorded_at);

-- 為需要的表建立更新時間觸發器
DROP TRIGGER IF EXISTS update_task_templates_updated_at ON task_templates;
CREATE TRIGGER update_task_templates_updated_at 
    BEFORE UPDATE ON task_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON user_tasks;
CREATE TRIGGER update_user_tasks_updated_at 
    BEFORE UPDATE ON user_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_levels_updated_at ON user_levels;
CREATE TRIGGER update_user_levels_updated_at 
    BEFORE UPDATE ON user_levels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_achievement_templates_updated_at ON achievement_templates;
CREATE TRIGGER update_achievement_templates_updated_at 
    BEFORE UPDATE ON achievement_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_badge_templates_updated_at ON badge_templates;
CREATE TRIGGER update_badge_templates_updated_at 
    BEFORE UPDATE ON badge_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboards_updated_at ON leaderboards;
CREATE TRIGGER update_leaderboards_updated_at 
    BEFORE UPDATE ON leaderboards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 建立視圖以簡化常用查詢
CREATE OR REPLACE VIEW user_gamification_summary AS
SELECT 
    u.id as user_id,
    u.email,
    up.name,
    ul.level,
    ul.experience_points,
    ul.total_points,
    ul.streak_days,
    ul.last_activity_date,
    COUNT(DISTINCT ua.id) as total_achievements,
    COUNT(DISTINCT ub.id) as total_badges,
    COUNT(DISTINCT CASE WHEN ut.status = 'completed' THEN ut.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN ut.status = 'pending' OR ut.status = 'in_progress' THEN ut.id END) as active_tasks
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_levels ul ON u.id = ul.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
LEFT JOIN user_tasks ut ON u.id = ut.user_id
GROUP BY u.id, u.email, up.name, ul.level, ul.experience_points, ul.total_points, ul.streak_days, ul.last_activity_date;

-- 建立函數來計算等級所需經驗值
CREATE OR REPLACE FUNCTION calculate_level_requirement(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- 使用指數增長公式：每級所需經驗 = 100 * level^1.5
    RETURN ROUND(100 * POWER(level, 1.5));
END;
$$ LANGUAGE plpgsql;

-- 建立函數來根據經驗值計算等級
CREATE OR REPLACE FUNCTION calculate_level_from_experience(experience_points INTEGER)
RETURNS INTEGER AS $$
DECLARE
    level INTEGER := 1;
    required_exp INTEGER;
BEGIN
    WHILE true LOOP
        required_exp := calculate_level_requirement(level + 1);
        IF experience_points < required_exp THEN
            EXIT;
        END IF;
        level := level + 1;
    END LOOP;
    
    RETURN level;
END;
$$ LANGUAGE plpgsql;

-- 插入預設的任務模板
INSERT INTO task_templates (title, description, type, category, points, difficulty, requirements) VALUES
-- 每日任務
('記錄早餐', '記錄今天的早餐內容', 'daily', 'nutrition', 10, 'easy', '{"meal_type": "breakfast", "count": 1}'),
('記錄午餐', '記錄今天的午餐內容', 'daily', 'nutrition', 10, 'easy', '{"meal_type": "lunch", "count": 1}'),
('記錄晚餐', '記錄今天的晚餐內容', 'daily', 'nutrition', 10, 'easy', '{"meal_type": "dinner", "count": 1}'),
('拍照記錄餐點', '使用拍照功能記錄任一餐點', 'daily', 'logging', 15, 'easy', '{"photo_logs": 1}'),
('與AI顧問對話', '與AI營養顧問進行一次對話', 'daily', 'social', 20, 'easy', '{"chat_messages": 1}'),
('達成熱量目標', '今日攝取熱量在目標範圍內（±10%）', 'daily', 'nutrition', 25, 'medium', '{"calorie_target_tolerance": 0.1}'),

-- 每週任務
('完成7天飲食記錄', '連續7天記錄所有餐點', 'weekly', 'logging', 100, 'medium', '{"consecutive_days": 7, "meals_per_day": 3}'),
('蛋白質攝取達標', '本週平均蛋白質攝取達到建議量', 'weekly', 'nutrition', 75, 'medium', '{"protein_target_percentage": 0.9}'),
('嘗試5種新食物', '本週記錄5種之前沒有吃過的食物', 'weekly', 'nutrition', 50, 'medium', '{"new_foods": 5}'),
('與AI顧問深度對話', '與AI顧問進行至少5次對話', 'weekly', 'social', 60, 'easy', '{"chat_sessions": 5}'),

-- 每月任務
('體重管理達標', '本月體重變化符合健康目標', 'monthly', 'health', 200, 'hard', '{"weight_goal_progress": 0.8}'),
('營養均衡大師', '本月巨量營養素比例保持在理想範圍', 'monthly', 'nutrition', 150, 'hard', '{"macro_balance_days": 20}'),
('拍照記錄達人', '本月使用拍照功能記錄超過50次', 'monthly', 'logging', 120, 'medium', '{"photo_logs": 50}'),

-- 里程碑任務
('新手上路', '完成個人檔案設定並記錄第一餐', 'milestone', 'onboarding', 50, 'easy', '{"profile_complete": true, "first_meal_logged": true}'),
('連續記錄30天', '連續30天記錄飲食', 'milestone', 'logging', 300, 'hard', '{"consecutive_logging_days": 30}'),
('減重5公斤', '成功減重5公斤', 'milestone', 'health', 500, 'expert', '{"weight_loss": 5}'),
('增重5公斤', '健康增重5公斤', 'milestone', 'health', 500, 'expert', '{"weight_gain": 5}')
ON CONFLICT DO NOTHING;

-- 插入預設的成就模板
INSERT INTO achievement_templates (name, description, icon, category, type, requirements, points, rarity) VALUES
-- 里程碑成就
('營養追蹤新手', '完成第一次飲食記錄', '🌱', 'milestone', 'milestone', '{"first_food_log": true}', 25, 'common'),
('拍照達人', '使用拍照功能記錄100次餐點', '📸', 'milestone', 'milestone', '{"photo_logs": 100}', 100, 'rare'),
('AI顧問好友', '與AI顧問對話超過50次', '🤖', 'milestone', 'milestone', '{"chat_messages": 50}', 75, 'rare'),
('健康目標達成者', '完成第一個健康目標', '🎯', 'milestone', 'milestone', '{"completed_goals": 1}', 200, 'epic'),

-- 連續記錄成就
('連續記錄7天', '連續7天記錄飲食', '🔥', 'streak', 'streak', '{"consecutive_days": 7}', 50, 'common'),
('連續記錄30天', '連續30天記錄飲食', '🔥', 'streak', 'streak', '{"consecutive_days": 30}', 150, 'rare'),
('連續記錄100天', '連續100天記錄飲食', '🔥', 'streak', 'streak', '{"consecutive_days": 100}', 500, 'legendary'),

-- 收集類成就
('食物探索家', '記錄超過100種不同的食物', '🍽️', 'collection', 'collection', '{"unique_foods": 100}', 100, 'rare'),
('營養均衡大師', '連續30天保持營養均衡', '⚖️', 'collection', 'collection', '{"balanced_nutrition_days": 30}', 200, 'epic'),

-- 特殊成就
('早起鳥兒', '連續7天在早上8點前記錄早餐', '🐦', 'special', 'special', '{"early_breakfast_days": 7, "time_before": "08:00"}', 75, 'rare'),
('夜貓子', '連續7天在晚上10點後記錄晚餐', '🦉', 'special', 'special', '{"late_dinner_days": 7, "time_after": "22:00"}', 75, 'rare'),
('完美一週', '一週內每天都達成所有每日任務', '⭐', 'special', 'special', '{"perfect_week": true}', 300, 'legendary')
ON CONFLICT DO NOTHING;

-- 插入預設的徽章模板
INSERT INTO badge_templates (name, description, icon, color, category, requirements) VALUES
('營養新手', '完成基礎營養記錄', '🥗', '#4CAF50', 'nutrition', '{"food_logs": 10}'),
('拍照專家', '熟練使用拍照記錄功能', '📷', '#2196F3', 'logging', '{"photo_logs": 50}'),
('AI對話達人', '積極與AI顧問互動', '💬', '#FF9800', 'social', '{"chat_messages": 25}'),
('目標達成者', '成功完成健康目標', '🏆', '#FFD700', 'achievement', '{"completed_goals": 1}'),
('連續記錄者', '保持良好的記錄習慣', '📅', '#9C27B0', 'streak', '{"consecutive_days": 14}'),
('營養均衡', '維持良好的營養平衡', '⚖️', '#00BCD4', 'nutrition', '{"balanced_days": 21}')
ON CONFLICT DO NOTHING;

-- 建立通知表
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立分享意圖表
CREATE TABLE IF NOT EXISTS share_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- achievement, badge, task, etc.
    platform VARCHAR(20), -- line, notion, etc.
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shared', 'cancelled')),
    shared_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id, content_type)
);

-- 建立通知相關索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_share_intents_user_id ON share_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_share_intents_status ON share_intents(status);
CREATE INDEX IF NOT EXISTS idx_share_intents_created_at ON share_intents(created_at);

-- 為通知表建立更新時間觸發器
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();