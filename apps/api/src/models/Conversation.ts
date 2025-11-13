import Joi from 'joi';
import { 
  Conversation, 
  ChatMessage, 
  ConversationContext, 
  MessageRole,
  RecommendationType,
  Priority 
} from '../types/shared';

// 聊天訊息驗證 Schema
export const chatMessageValidationSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().messages({
    'string.min': '訊息內容不能為空',
    'string.max': '訊息內容不能超過2000個字符',
    'any.required': '訊息內容為必填欄位'
  }),
  role: Joi.string().valid(...Object.values(MessageRole)).required().messages({
    'any.only': '訊息角色必須是有效的選項',
    'any.required': '訊息角色為必填欄位'
  }),
  metadata: Joi.object().optional()
});

// 對話上下文驗證 Schema
export const conversationContextValidationSchema = Joi.object({
  recentNutritionData: Joi.array().items(Joi.object()).optional(),
  healthGoals: Joi.array().items(Joi.object()).optional(),
  userPreferences: Joi.object().optional(),
  conversationSummary: Joi.string().max(1000).optional(),
  lastInteractionAt: Joi.date().optional()
});

// 對話建立驗證 Schema
export const conversationCreateValidationSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.uuid': '用戶ID必須是有效的UUID',
    'any.required': '用戶ID為必填欄位'
  }),
  initialMessage: Joi.string().min(1).max(2000).optional().messages({
    'string.min': '初始訊息不能為空',
    'string.max': '初始訊息不能超過2000個字符'
  })
});

/**
 * 對話模型類別
 */
export class ConversationModel {
  /**
   * 驗證聊天訊息資料
   */
  static validateMessage(messageData: any): { error?: Joi.ValidationError; value?: any } {
    return chatMessageValidationSchema.validate(messageData, { abortEarly: false });
  }

  /**
   * 驗證對話上下文資料
   */
  static validateContext(contextData: any): { error?: Joi.ValidationError; value?: any } {
    return conversationContextValidationSchema.validate(contextData, { abortEarly: false });
  }

  /**
   * 驗證對話建立資料
   */
  static validateConversationCreate(createData: any): { error?: Joi.ValidationError; value?: any } {
    return conversationCreateValidationSchema.validate(createData, { abortEarly: false });
  }

  /**
   * 序列化對話資料
   */
  static serialize(conversation: any): Conversation {
    return {
      id: conversation.id,
      userId: conversation.user_id || conversation.userId,
      messages: conversation.messages || [],
      context: this.serializeContext(conversation.context || {}),
      createdAt: new Date(conversation.created_at || conversation.createdAt),
      updatedAt: new Date(conversation.updated_at || conversation.updatedAt)
    };
  }

  /**
   * 序列化聊天訊息資料
   */
  static serializeMessage(message: any): ChatMessage {
    return {
      id: message.id,
      conversationId: message.conversation_id || message.conversationId,
      role: message.role,
      content: message.content,
      metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
      timestamp: new Date(message.timestamp || message.created_at)
    };
  }

  /**
   * 序列化對話上下文資料
   */
  static serializeContext(context: any): ConversationContext {
    return {
      recentNutritionData: context.recent_nutrition_data || context.recentNutritionData || [],
      healthGoals: context.health_goals || context.healthGoals || [],
      userPreferences: context.user_preferences || context.userPreferences || {},
      conversationSummary: context.conversation_summary || context.conversationSummary || '',
      lastInteractionAt: new Date(context.last_interaction_at || context.lastInteractionAt || Date.now())
    };
  }

  /**
   * 準備資料庫插入的對話資料
   */
  static prepareForDatabase(conversation: Conversation): any {
    return {
      id: conversation.id,
      user_id: conversation.userId,
      context: JSON.stringify(conversation.context),
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt
    };
  }

  /**
   * 準備資料庫插入的訊息資料
   */
  static prepareMessageForDatabase(message: ChatMessage): any {
    return {
      id: message.id,
      conversation_id: message.conversationId,
      role: message.role,
      content: message.content,
      metadata: message.metadata ? JSON.stringify(message.metadata) : null,
      timestamp: message.timestamp
    };
  }

  /**
   * 驗證訊息內容安全性
   */
  static validateMessageSafety(content: string): { isSafe: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // 檢查是否包含敏感資訊
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // 信用卡號
      /\b\d{3}-\d{2}-\d{4}\b/, // 社會安全號碼格式
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // 電子郵件
      /\b\d{10,11}\b/ // 電話號碼
    ];

    sensitivePatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        const issueTypes = ['信用卡號', '身分證號', '電子郵件', '電話號碼'];
        issues.push(`可能包含${issueTypes[index]}`);
      }
    });

    // 檢查不當內容
    const inappropriateWords = ['髒話', '威脅', '仇恨言論']; // 實際實作時應該有更完整的清單
    inappropriateWords.forEach(word => {
      if (content.includes(word)) {
        issues.push('包含不當內容');
      }
    });

    return {
      isSafe: issues.length === 0,
      issues
    };
  }

  /**
   * 計算對話活躍度分數
   */
  static calculateEngagementScore(conversation: Conversation): number {
    const messageCount = conversation.messages.length;
    const daysSinceCreation = (Date.now() - conversation.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLastInteraction = (Date.now() - conversation.context.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // 基礎分數基於訊息數量
    let score = Math.min(messageCount * 10, 100);
    
    // 根據對話頻率調整
    if (daysSinceCreation > 0) {
      const messagesPerDay = messageCount / daysSinceCreation;
      score += messagesPerDay * 5;
    }
    
    // 根據最近活躍度調整
    if (daysSinceLastInteraction < 1) {
      score += 20; // 最近有互動
    } else if (daysSinceLastInteraction < 7) {
      score += 10; // 一週內有互動
    } else {
      score -= daysSinceLastInteraction * 2; // 長時間無互動扣分
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 提取對話關鍵字
   */
  static extractKeywords(messages: ChatMessage[]): string[] {
    const keywords = new Set<string>();
    const nutritionKeywords = [
      '蛋白質', '碳水化合物', '脂肪', '維生素', '礦物質', '熱量',
      '減重', '增重', '健身', '運動', '飲食', '營養', '健康'
    ];

    messages.forEach(message => {
      if (message.role === MessageRole.USER) {
        nutritionKeywords.forEach(keyword => {
          if (message.content.includes(keyword)) {
            keywords.add(keyword);
          }
        });
      }
    });

    return Array.from(keywords);
  }

  /**
   * 生成對話摘要
   */
  static generateSummary(messages: ChatMessage[]): string {
    const userMessages = messages.filter(msg => msg.role === MessageRole.USER);
    const keywords = this.extractKeywords(messages);
    
    if (keywords.length === 0) {
      return '一般健康諮詢對話';
    }
    
    const mainTopics = keywords.slice(0, 3);
    return `主要討論: ${mainTopics.join('、')}`;
  }
}