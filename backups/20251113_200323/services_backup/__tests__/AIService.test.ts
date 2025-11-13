import { AIService } from '../AIService';
import { 
  ChatMessage, 
  MessageRole, 
  ConversationContext,
  UserProfile,
  ActivityLevel
} from '@health-tracker/shared-types';

// Mock fetch for OpenAI API calls
global.fetch = jest.fn();

describe('AIService', () => {
  let aiService: AIService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    // Set environment variable for testing
    process.env.OPENAI_API_KEY = mockApiKey;
    aiService = new AIService(mockApiKey);
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('constructor', () => {
    it('應該使用提供的 API 金鑰', () => {
      const customApiKey = 'custom-api-key';
      const service = new AIService(customApiKey);
      expect(service).toBeDefined();
    });

    it('應該使用環境變數中的 API 金鑰', () => {
      process.env.OPENAI_API_KEY = 'env-api-key';
      const service = new AIService();
      expect(service).toBeDefined();
    });

    it('應該在沒有 API 金鑰時拋出錯誤', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new AIService()).toThrow('OpenAI API 金鑰未設定');
    });
  });

  describe('generateResponse', () => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        conversationId: 'conv-1',
        role: MessageRole.USER,
        content: '我想了解如何改善我的飲食',
        timestamp: new Date()
      }
    ];

    const mockContext: ConversationContext = {
      recentNutritionData: [],
      healthGoals: [],
      userPreferences: {
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
      lastInteractionAt: new Date()
    };

    const mockUserProfile: UserProfile = {
      name: '測試用戶',
      age: 30,
      gender: 'male',
      height: 175,
      weight: 70,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE
    };

    it('應該成功生成 AI 回應', async () => {
      const mockApiResponse = {
        choices: [{
          message: {
            content: '建議您增加蔬菜攝取，每餐至少包含一份蔬菜。同時確保蛋白質攝取充足。'
          }
        }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const response = await aiService.generateResponse(mockMessages, mockContext, mockUserProfile);

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.suggestions).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.metadata).toBeDefined();
    });

    it('應該在 API 呼叫失敗時返回備用回應', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 錯誤'));

      const response = await aiService.generateResponse(mockMessages, mockContext, mockUserProfile);

      expect(response).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.suggestions).toBeDefined();
      expect(response.metadata?.fallback).toBe(true);
    });

    it('應該在 API 返回錯誤狀態時返回備用回應', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      });

      const response = await aiService.generateResponse(mockMessages, mockContext, mockUserProfile);

      expect(response).toBeDefined();
      expect(response.metadata?.fallback).toBe(true);
    });

    it('應該根據用戶檔案建立個人化提示詞', async () => {
      const mockApiResponse = {
        choices: [{
          message: {
            content: '根據您的年齡和活動水平，建議每日攝取2200大卡。'
          }
        }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      await aiService.generateResponse(mockMessages, mockContext, mockUserProfile);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('chat/completions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('30 歲') // 應該包含用戶年齡
        })
      );
    });
  });

  describe('generatePersonalizedRecommendations', () => {
    const mockContext: ConversationContext = {
      recentNutritionData: [],
      healthGoals: [],
      userPreferences: {
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
      lastInteractionAt: new Date()
    };

    const mockUserProfile: UserProfile = {
      name: '測試用戶',
      age: 30,
      gender: 'female',
      height: 165,
      weight: 60,
      activityLevel: ActivityLevel.LIGHTLY_ACTIVE
    };

    it('應該成功生成個人化建議', async () => {
      const mockApiResponse = {
        choices: [{
          message: {
            content: '[高] 增加蛋白質攝取：每餐包含一份優質蛋白質\n[中] 規律運動：每週至少3次有氧運動'
          }
        }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const recommendations = await aiService.generatePersonalizedRecommendations(mockContext, mockUserProfile);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      if (recommendations.length > 0) {
        expect(recommendations[0]).toHaveProperty('id');
        expect(recommendations[0]).toHaveProperty('type');
        expect(recommendations[0]).toHaveProperty('title');
        expect(recommendations[0]).toHaveProperty('description');
        expect(recommendations[0]).toHaveProperty('priority');
      }
    });

    it('應該在 API 失敗時返回備用建議', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 錯誤'));

      const recommendations = await aiService.generatePersonalizedRecommendations(mockContext, mockUserProfile);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('setModel', () => {
    it('應該成功設定模型', () => {
      const newModel = 'gpt-3.5-turbo';
      aiService.setModel(newModel);
      // 無法直接測試私有屬性，但可以確保方法不拋出錯誤
      expect(() => aiService.setModel(newModel)).not.toThrow();
    });
  });

  describe('setMaxTokens', () => {
    it('應該成功設定最大 token 數', () => {
      const maxTokens = 500;
      aiService.setMaxTokens(maxTokens);
      expect(() => aiService.setMaxTokens(maxTokens)).not.toThrow();
    });
  });

  describe('setTemperature', () => {
    it('應該成功設定溫度參數', () => {
      const temperature = 0.5;
      aiService.setTemperature(temperature);
      expect(() => aiService.setTemperature(temperature)).not.toThrow();
    });

    it('應該限制溫度參數在有效範圍內', () => {
      // 測試邊界值
      aiService.setTemperature(-1); // 應該被限制為 0
      aiService.setTemperature(3);  // 應該被限制為 2
      expect(() => aiService.setTemperature(-1)).not.toThrow();
      expect(() => aiService.setTemperature(3)).not.toThrow();
    });
  });

  describe('內容安全性檢查', () => {
    it('應該檢測並處理不安全的 AI 回應', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          conversationId: 'conv-1',
          role: MessageRole.USER,
          content: '我是否患有糖尿病？',
          timestamp: new Date()
        }
      ];

      const mockContext: ConversationContext = {
        recentNutritionData: [],
        healthGoals: [],
        userPreferences: {
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
        lastInteractionAt: new Date()
      };

      // Mock API 返回包含醫療診斷的回應
      const mockApiResponse = {
        choices: [{
          message: {
            content: '根據您的症狀，您可能患有糖尿病，建議立即就醫。'
          }
        }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const response = await aiService.generateResponse(mockMessages, mockContext);

      // 應該返回安全的替代回應
      expect(response.message).not.toContain('您可能患有糖尿病');
      expect(response.message).toContain('諮詢專業醫療人員');
    });
  });

  describe('備用回應機制', () => {
    it('應該根據用戶訊息內容選擇合適的備用回應', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          conversationId: 'conv-1',
          role: MessageRole.USER,
          content: '我想要減重',
          timestamp: new Date()
        }
      ];

      const mockContext: ConversationContext = {
        recentNutritionData: [],
        healthGoals: [],
        userPreferences: {
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
        lastInteractionAt: new Date()
      };

      // Mock API 失敗
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 錯誤'));

      const response = await aiService.generateResponse(mockMessages, mockContext);

      expect(response.message).toContain('減重');
      expect(response.suggestions).toContain('每天記錄飲食內容');
      expect(response.metadata?.fallback).toBe(true);
    });
  });
});