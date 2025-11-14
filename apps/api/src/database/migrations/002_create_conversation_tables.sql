-- 建立對話表
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立聊天訊息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- 建立 GIN 索引以支援 JSONB 查詢
CREATE INDEX IF NOT EXISTS idx_conversations_context_gin ON conversations USING GIN (context);
CREATE INDEX IF NOT EXISTS idx_chat_messages_metadata_gin ON chat_messages USING GIN (metadata);

-- 建立全文搜尋索引（使用 simple 配置以確保跨平台兼容性）
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_fulltext ON chat_messages USING GIN (to_tsvector('simple', content));

-- 建立觸發器以自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 建立清理過期對話的函數
CREATE OR REPLACE FUNCTION cleanup_expired_conversations(hours_old INTEGER DEFAULT 168)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM conversations
    WHERE updated_at < NOW() - INTERVAL '1 hour' * hours_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 建立獲取對話統計的函數
CREATE OR REPLACE FUNCTION get_conversation_stats(p_user_id UUID)
RETURNS TABLE(
    total_conversations BIGINT,
    total_messages BIGINT,
    avg_messages_per_conversation NUMERIC,
    last_interaction_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(m.id) as total_messages,
        CASE 
            WHEN COUNT(DISTINCT c.id) > 0 
            THEN ROUND(COUNT(m.id)::NUMERIC / COUNT(DISTINCT c.id), 2)
            ELSE 0
        END as avg_messages_per_conversation,
        MAX(c.updated_at) as last_interaction_at
    FROM conversations c
    LEFT JOIN chat_messages m ON c.id = m.conversation_id
    WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 建立搜尋對話的函數
CREATE OR REPLACE FUNCTION search_conversations(
    p_user_id UUID,
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    conversation_id UUID,
    user_id UUID,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT 
        c.id as conversation_id,
        c.user_id,
        c.context,
        c.created_at,
        c.updated_at,
        ts_rank(to_tsvector('chinese', m.content), plainto_tsquery('chinese', p_search_term)) as relevance_score
    FROM conversations c
    LEFT JOIN chat_messages m ON c.id = m.conversation_id
    WHERE c.user_id = p_user_id 
        AND (
            to_tsvector('chinese', m.content) @@ plainto_tsquery('chinese', p_search_term)
            OR c.context::text ILIKE '%' || p_search_term || '%'
        )
    ORDER BY relevance_score DESC, c.updated_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 建立對話摘要更新的函數
CREATE OR REPLACE FUNCTION update_conversation_summary(p_conversation_id UUID)
RETURNS VOID AS $$
DECLARE
    keywords TEXT[];
    summary TEXT;
BEGIN
    -- 提取關鍵字
    SELECT array_agg(DISTINCT word) INTO keywords
    FROM (
        SELECT unnest(string_to_array(lower(content), ' ')) as word
        FROM chat_messages 
        WHERE conversation_id = p_conversation_id 
            AND role = 'user'
            AND word IN ('減重', '增重', '營養', '蛋白質', '碳水化合物', '脂肪', '維生素', '運動', '健身', '飲食', '健康')
    ) t;
    
    -- 生成摘要
    IF array_length(keywords, 1) > 0 THEN
        summary := '主要討論: ' || array_to_string(keywords[1:3], '、');
    ELSE
        summary := '一般健康諮詢對話';
    END IF;
    
    -- 更新對話上下文
    UPDATE conversations 
    SET context = jsonb_set(context, '{conversationSummary}', to_jsonb(summary))
    WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- 建立定期清理任務的排程（需要 pg_cron 擴展）
-- SELECT cron.schedule('cleanup-conversations', '0 2 * * *', 'SELECT cleanup_expired_conversations(168);');

-- 插入一些測試資料（開發環境用）
-- INSERT INTO conversations (user_id, context) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', '{"conversationSummary": "測試對話", "lastInteractionAt": "2024-01-01T00:00:00Z"}');

COMMENT ON TABLE conversations IS '用戶對話記錄表';
COMMENT ON TABLE chat_messages IS '聊天訊息表';
COMMENT ON COLUMN conversations.context IS '對話上下文，包含營養資料、健康目標等';
COMMENT ON COLUMN chat_messages.role IS '訊息角色：user（用戶）、assistant（AI助手）、system（系統）';
COMMENT ON COLUMN chat_messages.metadata IS '訊息元資料，如營養分析結果、建議等';