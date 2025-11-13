import { PostgreSQLBaseRepository } from './BaseRepository';
import { 
  Conversation, 
  ChatMessage, 
  ConversationContext,
  MessageRole 
} from '../types/shared';
import { ConversationModel } from '../models/Conversation';
import { v4 as uuidv4 } from 'uuid';

// 輔助函數：安全獲取錯誤訊息
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return getErrorMessage(error);
  return String(error);
}

/**
 * 對話資料庫存取層
 */
export class ConversationRepository {
  private pool: any;
  private redis: any;
  constructor(pool: any, redis?: any) {
    this.pool = pool;
    this.redis = redis;
  }

  /**
   * 建立新對話
   */
  async createConversation(
    userId: string, 
    initialContext: Partial<ConversationContext> = {}
  ): Promise<Conversation> {
    const conversationId = uuidv4();
    const now = new Date();
    
    const conversation: Conversation = {
      id: conversationId,
      userId,
      messages: [],
      context: {
        recentNutritionData: initialContext.recentNutritionData || [],
        healthGoals: initialContext.healthGoals || [],
        userPreferences: initialContext.userPreferences || {
          language: 'zh-TW',
          timezone: 'Asia/Taipei',
          notifications: {
            email: true,
            push: true,
            sms: false,
            weeklyReport: true,
            achievements: true
          },
          privacy: {
            dataSharing: false,
            analytics: true,
            thirdPartyIntegration: true
          }
        },
        conversationSummary: '',
        lastInteractionAt: now
      },
      createdAt: now,
      updatedAt: now
    };

    // 使用 PostgreSQL 儲存對話基本資訊
    const query = `
      INSERT INTO conversations (id, user_id, context, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      conversation.id,
      conversation.userId,
      JSON.stringify(conversation.context),
      conversation.createdAt,
      conversation.updatedAt
    ];

    try {
      const result = await this.pool.query(query, values);
      return ConversationModel.serialize(result.rows[0]);
    } catch (error) {
      throw new Error(`建立對話失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 根據 ID 獲取對話
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const query = `
      SELECT c.*, 
             json_agg(
               json_build_object(
                 'id', m.id,
                 'conversation_id', m.conversation_id,
                 'role', m.role,
                 'content', m.content,
                 'metadata', m.metadata,
                 'timestamp', m.timestamp
               ) ORDER BY m.timestamp ASC
             ) FILTER (WHERE m.id IS NOT NULL) as messages
      FROM conversations c
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.id = $1
      GROUP BY c.id, c.user_id, c.context, c.created_at, c.updated_at
    `;

    try {
      const result = await this.pool.query(query, [conversationId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const conversation = ConversationModel.serialize(row);
      conversation.messages = row.messages || [];
      
      return conversation;
    } catch (error) {
      throw new Error(`獲取對話失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 獲取用戶的所有對話
   */
  async getConversationsByUserId(
    userId: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<Conversation[]> {
    const query = `
      SELECT c.*, 
             json_agg(
               json_build_object(
                 'id', m.id,
                 'conversation_id', m.conversation_id,
                 'role', m.role,
                 'content', m.content,
                 'metadata', m.metadata,
                 'timestamp', m.timestamp
               ) ORDER BY m.timestamp ASC
             ) FILTER (WHERE m.id IS NOT NULL) as messages
      FROM conversations c
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.user_id = $1
      GROUP BY c.id, c.user_id, c.context, c.created_at, c.updated_at
      ORDER BY c.updated_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await this.pool.query(query, [userId, limit, offset]);
      
      return result.rows.map(row => {
        const conversation = ConversationModel.serialize(row);
        conversation.messages = row.messages || [];
        return conversation;
      });
    } catch (error) {
      throw new Error(`獲取用戶對話失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 獲取用戶最近的活躍對話
   */
  async getActiveConversation(userId: string): Promise<Conversation | null> {
    const query = `
      SELECT c.*, 
             json_agg(
               json_build_object(
                 'id', m.id,
                 'conversation_id', m.conversation_id,
                 'role', m.role,
                 'content', m.content,
                 'metadata', m.metadata,
                 'timestamp', m.timestamp
               ) ORDER BY m.timestamp ASC
             ) FILTER (WHERE m.id IS NOT NULL) as messages
      FROM conversations c
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.user_id = $1 
        AND c.updated_at > NOW() - INTERVAL '24 hours'
      GROUP BY c.id, c.user_id, c.context, c.created_at, c.updated_at
      ORDER BY c.updated_at DESC
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const conversation = ConversationModel.serialize(row);
      conversation.messages = row.messages || [];
      
      return conversation;
    } catch (error) {
      throw new Error(`獲取活躍對話失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 添加訊息到對話
   */
  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    metadata?: any
  ): Promise<ChatMessage> {
    const messageId = uuidv4();
    const timestamp = new Date();

    // 插入訊息
    const messageQuery = `
      INSERT INTO chat_messages (id, conversation_id, role, content, metadata, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const messageValues = [
      messageId,
      conversationId,
      role,
      content,
      metadata ? JSON.stringify(metadata) : null,
      timestamp
    ];

    // 更新對話的最後互動時間
    const updateConversationQuery = `
      UPDATE conversations 
      SET updated_at = $1,
          context = jsonb_set(context, '{lastInteractionAt}', to_jsonb($1))
      WHERE id = $2
    `;

    try {
      // 使用事務確保資料一致性
      await this.pool.query('BEGIN');
      
      const messageResult = await this.pool.query(messageQuery, messageValues);
      await this.pool.query(updateConversationQuery, [timestamp, conversationId]);
      
      await this.pool.query('COMMIT');
      
      return ConversationModel.serializeMessage(messageResult.rows[0]);
    } catch (error) {
      await this.pool.query('ROLLBACK');
      throw new Error(`添加訊息失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 更新對話上下文
   */
  async updateContext(
    conversationId: string,
    contextUpdate: Partial<ConversationContext>
  ): Promise<void> {
    const query = `
      UPDATE conversations 
      SET context = context || $1::jsonb,
          updated_at = $2
      WHERE id = $3
    `;

    const values = [
      JSON.stringify(contextUpdate),
      new Date(),
      conversationId
    ];

    try {
      const result = await this.pool.query(query, values);
      
      if (result.rowCount === 0) {
        throw new Error(`找不到對話 ID: ${conversationId}`);
      }
    } catch (error) {
      throw new Error(`更新對話上下文失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 獲取對話的最近訊息
   */
  async getRecentMessages(
    conversationId: string, 
    limit: number = 10
  ): Promise<ChatMessage[]> {
    const query = `
      SELECT * FROM chat_messages
      WHERE conversation_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;

    try {
      const result = await this.pool.query(query, [conversationId, limit]);
      
      return result.rows
        .map(row => ConversationModel.serializeMessage(row))
        .reverse(); // 按時間順序排列
    } catch (error) {
      throw new Error(`獲取最近訊息失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 刪除過期對話
   */
  async deleteExpiredConversations(hoursOld: number = 168): Promise<number> {
    const query = `
      DELETE FROM conversations
      WHERE updated_at < NOW() - INTERVAL '${hoursOld} hours'
    `;

    try {
      const result = await this.pool.query(query);
      return result.rowCount || 0;
    } catch (error) {
      throw new Error(`刪除過期對話失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 獲取對話統計資訊
   */
  async getConversationStats(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    lastInteractionAt?: Date;
  }> {
    const query = `
      SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(m.id) as total_messages,
        MAX(c.updated_at) as last_interaction_at
      FROM conversations c
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.user_id = $1
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      const row = result.rows[0];
      
      const totalConversations = parseInt(row.total_conversations) || 0;
      const totalMessages = parseInt(row.total_messages) || 0;
      
      return {
        totalConversations,
        totalMessages,
        averageMessagesPerConversation: totalConversations > 0 
          ? Math.round(totalMessages / totalConversations) 
          : 0,
        lastInteractionAt: row.last_interaction_at ? new Date(row.last_interaction_at) : undefined
      };
    } catch (error) {
      throw new Error(`獲取對話統計失敗: ${getErrorMessage(error)}`);
    }
  }

  /**
   * 搜尋對話內容
   */
  async searchConversations(
    userId: string,
    searchTerm: string,
    limit: number = 10
  ): Promise<Conversation[]> {
    const query = `
      SELECT DISTINCT c.*, 
             json_agg(
               json_build_object(
                 'id', m.id,
                 'conversation_id', m.conversation_id,
                 'role', m.role,
                 'content', m.content,
                 'metadata', m.metadata,
                 'timestamp', m.timestamp
               ) ORDER BY m.timestamp ASC
             ) FILTER (WHERE m.id IS NOT NULL) as messages
      FROM conversations c
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      WHERE c.user_id = $1 
        AND (
          m.content ILIKE $2 
          OR c.context::text ILIKE $2
        )
      GROUP BY c.id, c.user_id, c.context, c.created_at, c.updated_at
      ORDER BY c.updated_at DESC
      LIMIT $3
    `;

    try {
      const searchPattern = `%${searchTerm}%`;
      const result = await this.pool.query(query, [userId, searchPattern, limit]);
      
      return result.rows.map(row => {
        const conversation = ConversationModel.serialize(row);
        conversation.messages = row.messages || [];
        return conversation;
      });
    } catch (error) {
      throw new Error(`搜尋對話失敗: ${getErrorMessage(error)}`);
    }
  }
}