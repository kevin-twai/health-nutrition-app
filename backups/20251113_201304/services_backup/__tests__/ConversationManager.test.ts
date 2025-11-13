import { ConversationManager } from '../ConversationManager';
import { MessageRole, ConversationContext } from '@health-tracker/shared-types';

describe('ConversationManager', () => {
  let conversationManager: ConversationManager;

  beforeEach(() => {
    conversationManager = new ConversationManager();
  });

  describe('createConversation', () => {
    it('應該成功建立新對話', async () => {
      const userId = 'test-user-id';
      const initialContext: Partial<ConversationContext> = {
        recentNutritionData: [],
        healthGoals: []
      };

      const conversation = await conversationManager.createConversation(userId, initialContext);

      expect(conversation).toBeDefined();
      expect(conversation.id).toBeDefined();
      expect(conversation.userId).toBe(userId);
      expect(conversation.messages).toEqual([]);
      expect(conversation.context).toBeDefined();
      expect(conversation.createdAt).toBeInstanceOf(Date);
      expect(conversation.updatedAt).toBeInstanceOf(Date);
    });

    it('應該使用預設上下文當沒有提供初始上下文時', async () => {
      const userId = 'test-user-id';

      const conversation = await conversationManager.createConversation(userId);

      expect(conversation.context.userPreferences).toBeDefined();
      expect(conversation.context.userPreferences.language).toBe('zh-TW');
      expect(conversation.context.conversationSummary).toBe('');
    });
  });

  describe('addMessage', () => {
    it('應該成功添加訊息到對話', async () => {
      const userId = 'test-user-id';
      const conversation = await conversationManager.createConversation(userId);
      const messageContent = '你好，我想了解營養建議';

      const message = await conversationManager.addMessage(
        conversation.id,
        MessageRole.USER,
        messageContent
      );

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.conversationId).toBe(conversation.id);
      expect(message.role).toBe(MessageRole.USER);
      expect(message.content).toBe(messageContent);
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('應該在添加訊息時更新對話的最後互動時間', async () => {
      const userId = 'test-user-id';
      const conversation = await conversationManager.createConversation(userId);
      const originalUpdateTime = conversation.updatedAt;

      // 等待一小段時間確保時間戳不同
      await new Promise(resolve => setTimeout(resolve, 10));

      await conversationManager.addMessage(
        conversation.id,
        MessageRole.USER,
        '測試訊息'
      );

      const updatedConversation = await conversationManager.getActiveConversation(userId);
      expect(updatedConversation?.updatedAt.getTime()).toBeGreaterThan(originalUpdateTime.getTime());
    });

    it('應該在找不到對話時拋出錯誤', async () => {
      const nonExistentConversationId = 'non-existent-id';

      await expect(
        conversationManager.addMessage(
          nonExistentConversationId,
          MessageRole.USER,
          '測試訊息'
        )
      ).rejects.toThrow('找不到對話 ID');
    });
  });

  describe('getActiveConversation', () => {
    it('應該返回用戶最近的活躍對話', async () => {
      const userId = 'test-user-id';
      const conversation1 = await conversationManager.createConversation(userId);
      
      // 等待一小段時間
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const conversation2 = await conversationManager.createConversation(userId);

      const activeConversation = await conversationManager.getActiveConversation(userId);

      expect(activeConversation).toBeDefined();
      expect(activeConversation?.id).toBe(conversation2.id);
    });

    it('應該在沒有活躍對話時返回 null', async () => {
      const userId = 'non-existent-user';

      const activeConversation = await conversationManager.getActiveConversation(userId);

      expect(activeConversation).toBeNull();
    });
  });

  describe('updateContext', () => {
    it('應該成功更新對話上下文', async () => {
      const userId = 'test-user-id';
      const conversation = await conversationManager.createConversation(userId);
      const contextUpdate = {
        conversationSummary: '用戶詢問了營養建議'
      };

      await conversationManager.updateContext(conversation.id, contextUpdate);

      const updatedConversation = await conversationManager.getActiveConversation(userId);
      expect(updatedConversation?.context.conversationSummary).toBe(contextUpdate.conversationSummary);
    });

    it('應該在找不到對話時拋出錯誤', async () => {
      const nonExistentConversationId = 'non-existent-id';
      const contextUpdate = { conversationSummary: '測試' };

      await expect(
        conversationManager.updateContext(nonExistentConversationId, contextUpdate)
      ).rejects.toThrow('找不到對話 ID');
    });
  });

  describe('getConversationHistory', () => {
    it('應該返回對話的訊息歷史', async () => {
      const userId = 'test-user-id';
      const conversation = await conversationManager.createConversation(userId);

      // 添加多個訊息
      await conversationManager.addMessage(conversation.id, MessageRole.USER, '第一個訊息');
      await conversationManager.addMessage(conversation.id, MessageRole.ASSISTANT, '第一個回應');
      await conversationManager.addMessage(conversation.id, MessageRole.USER, '第二個訊息');

      const history = await conversationManager.getConversationHistory(conversation.id);

      expect(history).toHaveLength(3);
      expect(history[0].content).toBe('第一個訊息');
      expect(history[1].content).toBe('第一個回應');
      expect(history[2].content).toBe('第二個訊息');
    });

    it('應該限制返回的訊息數量', async () => {
      const userId = 'test-user-id';
      const conversation = await conversationManager.createConversation(userId);

      // 添加超過 10 個訊息
      for (let i = 0; i < 15; i++) {
        await conversationManager.addMessage(
          conversation.id, 
          MessageRole.USER, 
          `訊息 ${i + 1}`
        );
      }

      const history = await conversationManager.getConversationHistory(conversation.id);

      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('應該在找不到對話時返回空陣列', async () => {
      const nonExistentConversationId = 'non-existent-id';

      const history = await conversationManager.getConversationHistory(nonExistentConversationId);

      expect(history).toEqual([]);
    });
  });

  describe('getNutritionContext', () => {
    it('應該返回用戶的營養上下文資料', async () => {
      const userId = 'test-user-id';
      const days = 7;

      const nutritionContext = await conversationManager.getNutritionContext(userId, days);

      expect(nutritionContext).toHaveLength(days);
      expect(nutritionContext[0]).toHaveProperty('date');
      expect(nutritionContext[0]).toHaveProperty('totalCalories');
      expect(nutritionContext[0]).toHaveProperty('macros');
      expect(nutritionContext[0]).toHaveProperty('meals');
    });

    it('應該使用預設天數當沒有指定時', async () => {
      const userId = 'test-user-id';

      const nutritionContext = await conversationManager.getNutritionContext(userId);

      expect(nutritionContext).toHaveLength(7); // 預設 7 天
    });
  });

  describe('getConversationStats', () => {
    it('應該返回用戶的對話統計資訊', async () => {
      const userId = 'test-user-id';
      const conversation = await conversationManager.createConversation(userId);

      // 添加一些訊息
      await conversationManager.addMessage(conversation.id, MessageRole.USER, '訊息 1');
      await conversationManager.addMessage(conversation.id, MessageRole.ASSISTANT, '回應 1');

      const stats = await conversationManager.getConversationStats(userId);

      expect(stats).toHaveProperty('totalConversations');
      expect(stats).toHaveProperty('totalMessages');
      expect(stats).toHaveProperty('averageMessagesPerConversation');
      expect(stats).toHaveProperty('lastInteractionAt');
      expect(stats.totalConversations).toBeGreaterThan(0);
      expect(stats.totalMessages).toBeGreaterThan(0);
    });

    it('應該在沒有對話時返回零統計', async () => {
      const userId = 'non-existent-user';

      const stats = await conversationManager.getConversationStats(userId);

      expect(stats.totalConversations).toBe(0);
      expect(stats.totalMessages).toBe(0);
      expect(stats.averageMessagesPerConversation).toBe(0);
      expect(stats.lastInteractionAt).toBeUndefined();
    });
  });

  describe('cleanupExpiredConversations', () => {
    it('應該清理過期的對話', async () => {
      const userId = 'test-user-id';
      
      // 建立對話並手動設定為過期
      const conversation = await conversationManager.createConversation(userId);
      const expiredTime = new Date(Date.now() - 49 * 60 * 60 * 1000); // 49 小時前（超過 48 小時的清理閾值）
      
      await conversationManager.updateContext(conversation.id, {
        lastInteractionAt: expiredTime
      });

      await conversationManager.cleanupExpiredConversations();

      const activeConversation = await conversationManager.getActiveConversation(userId);
      expect(activeConversation).toBeNull();
    });
  });
});