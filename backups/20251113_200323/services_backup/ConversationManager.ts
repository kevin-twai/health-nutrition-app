import { 
  Conversation, 
  ChatMessage, 
  ConversationContext, 
  MessageRole, 
  NutritionContextData,
  HealthGoal,
  UserPreferences,
  FoodLog,
  MacronutrientBreakdown
} from '@health-tracker/shared-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 對話管理器 - 負責管理用戶對話歷史和上下文
 */
export class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private readonly MAX_CONTEXT_MESSAGES = 20;
  private readonly CONTEXT_EXPIRY_HOURS = 24;

  /**
   * 建立新的對話
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
        userPreferences: initialContext.userPreferences || this.getDefaultPreferences(),
        conversationSummary: '',
        lastInteractionAt: now
      },
      createdAt: now,
      updatedAt: now
    };

    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  /**
   * 獲取用戶的活躍對話
   */
  async getActiveConversation(userId: string): Promise<Conversation | null> {
    // 尋找用戶最近的對話
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    if (userConversations.length === 0) {
      return null;
    }

    const latestConversation = userConversations[0];
    
    // 檢查對話是否過期
    const hoursSinceLastInteraction = 
      (Date.now() - latestConversation.context.lastInteractionAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastInteraction > this.CONTEXT_EXPIRY_HOURS) {
      // 對話已過期，建立新對話
      return null;
    }

    return latestConversation;
  }

  /**
   * 添加訊息到對話中
   */
  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    metadata?: any
  ): Promise<ChatMessage> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`找不到對話 ID: ${conversationId}`);
    }

    const message: ChatMessage = {
      id: uuidv4(),
      conversationId,
      role,
      content,
      metadata,
      timestamp: new Date()
    };

    conversation.messages.push(message);
    conversation.context.lastInteractionAt = new Date();
    conversation.updatedAt = new Date();

    // 限制訊息數量以控制記憶體使用
    if (conversation.messages.length > this.MAX_CONTEXT_MESSAGES) {
      // 保留系統訊息和最近的訊息
      const systemMessages = conversation.messages.filter(msg => msg.role === MessageRole.SYSTEM);
      const recentMessages = conversation.messages
        .filter(msg => msg.role !== MessageRole.SYSTEM)
        .slice(-this.MAX_CONTEXT_MESSAGES + systemMessages.length);
      
      conversation.messages = [...systemMessages, ...recentMessages];
      
      // 更新對話摘要
      await this.updateConversationSummary(conversationId);
    }

    return message;
  }

  /**
   * 更新對話上下文
   */
  async updateContext(
    conversationId: string,
    contextUpdate: Partial<ConversationContext>
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`找不到對話 ID: ${conversationId}`);
    }

    conversation.context = {
      ...conversation.context,
      ...contextUpdate
    };
    
    // 只有在沒有明確設定 lastInteractionAt 時才更新為當前時間
    if (!contextUpdate.lastInteractionAt) {
      conversation.context.lastInteractionAt = new Date();
    }
    
    conversation.updatedAt = new Date();
  }

  /**
   * 獲取對話歷史（用於 AI 上下文）
   */
  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return [];
    }

    return conversation.messages.slice(-10); // 返回最近 10 條訊息
  }

  /**
   * 獲取營養上下文資料
   */
  async getNutritionContext(userId: string, days: number = 7): Promise<NutritionContextData[]> {
    // 這裡應該從資料庫獲取用戶最近的營養資料
    // 暫時返回模擬資料
    const mockData: NutritionContextData[] = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date,
        totalCalories: 1800 + Math.random() * 400,
        macros: {
          protein: 80 + Math.random() * 40,
          carbohydrates: 200 + Math.random() * 100,
          fat: 60 + Math.random() * 30,
          fiber: 25 + Math.random() * 10
        },
        meals: [] // 實際實作時應該包含具體的餐點記錄
      });
    }
    
    return mockData;
  }

  /**
   * 建立對話摘要
   */
  private async updateConversationSummary(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return;
    }

    // 簡單的摘要邏輯 - 實際實作時可以使用 AI 來生成更好的摘要
    const recentMessages = conversation.messages.slice(-20);
    const userMessages = recentMessages.filter(msg => msg.role === MessageRole.USER);
    const topics = this.extractTopics(userMessages);
    
    conversation.context.conversationSummary = `用戶主要討論了: ${topics.join(', ')}`;
  }

  /**
   * 從訊息中提取主題
   */
  private extractTopics(messages: ChatMessage[]): string[] {
    const topics = new Set<string>();
    const keywords = {
      '減重': ['減重', '減肥', '瘦身', '體重'],
      '營養': ['營養', '維生素', '礦物質', '蛋白質', '碳水化合物'],
      '運動': ['運動', '健身', '鍛鍊', '活動'],
      '飲食': ['飲食', '餐點', '食物', '吃'],
      '健康': ['健康', '身體', '疾病', '症狀']
    };

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => content.includes(word))) {
          topics.add(topic);
        }
      });
    });

    return Array.from(topics);
  }

  /**
   * 獲取預設用戶偏好
   */
  private getDefaultPreferences(): UserPreferences {
    return {
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
    };
  }

  /**
   * 清理過期對話
   */
  async cleanupExpiredConversations(): Promise<void> {
    const now = Date.now();
    const expiredConversations: string[] = [];

    this.conversations.forEach((conversation, id) => {
      const hoursSinceLastInteraction = 
        (now - conversation.context.lastInteractionAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastInteraction > this.CONTEXT_EXPIRY_HOURS * 2) {
        expiredConversations.push(id);
      }
    });

    expiredConversations.forEach(id => {
      this.conversations.delete(id);
    });
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
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId);

    const totalMessages = userConversations.reduce(
      (sum, conv) => sum + conv.messages.length, 
      0
    );

    const lastInteraction = userConversations
      .map(conv => conv.context.lastInteractionAt)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      totalConversations: userConversations.length,
      totalMessages,
      averageMessagesPerConversation: userConversations.length > 0 
        ? Math.round(totalMessages / userConversations.length) 
        : 0,
      lastInteractionAt: lastInteraction
    };
  }
}

// 單例模式
export const conversationManager = new ConversationManager();