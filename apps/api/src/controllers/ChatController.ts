import { Request, Response } from 'express';
import { 
  ChatResponse, 
  MessageRole, 
  ApiResponse,
  Conversation,
  ChatMessage
} from '../types/shared';
import { ConversationManager } from '../services/ConversationManager';
import { AIService } from '../services/AIService';
import { ContentFilterService } from '../services/ContentFilterService';
import { NutritionAnalyzer } from '../services/NutritionAnalyzer';
import { RecommendationEngine } from '../services/RecommendationEngine';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ConversationModel } from '../models/Conversation';
import { db } from '../database/connection';
import { redisConnection } from '../database/redis';

/**
 * 聊天控制器 - 處理 AI 聊天相關的 API 請求
 */
export class ChatController {
  private conversationManager: ConversationManager;
  private aiService: AIService;
  private contentFilter: ContentFilterService;
  private nutritionAnalyzer: NutritionAnalyzer;
  private recommendationEngine: RecommendationEngine;
  private conversationRepository: ConversationRepository;
  private userRepository: UserRepository;

  constructor() {
    const pool = db.getPool();
    const redis = redisConnection.getClient() || undefined;
    
    this.conversationManager = new ConversationManager();
    this.aiService = new AIService();
    this.contentFilter = new ContentFilterService();
    this.nutritionAnalyzer = new NutritionAnalyzer();
    this.recommendationEngine = new RecommendationEngine();
    this.conversationRepository = new ConversationRepository(pool, redis);
    this.userRepository = new UserRepository(pool, redis);
  }

  /**
   * 發送聊天訊息
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { message } = req.body;

      // 驗證訊息內容
      const validation = ConversationModel.validateMessage({
        content: message,
        role: MessageRole.USER
      });

      if (validation.error) {
        res.status(400).json({
          success: false,
          error: { 
            code: 'VALIDATION_ERROR', 
            message: validation.error.details[0].message 
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 內容安全檢查
      const safetyCheck = this.contentFilter.checkUserInput(message);
      if (!safetyCheck.isAllowed) {
        res.status(400).json({
          success: false,
          error: { 
            code: 'CONTENT_FILTERED', 
            message: '訊息內容不符合安全規範',
            details: { issues: safetyCheck.issues }
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 獲取或建立對話
      let conversation = await this.conversationRepository.getActiveConversation(userId);
      if (!conversation) {
        // 獲取用戶資料以建立上下文
        const user = await this.userRepository.findById(userId);
        const nutritionContext = await this.conversationManager.getNutritionContext(userId);
        
        conversation = await this.conversationRepository.createConversation(userId, {
          recentNutritionData: nutritionContext,
          healthGoals: user?.healthGoals || [],
          userPreferences: user?.preferences
        });
      }

      // 添加用戶訊息
      await this.conversationRepository.addMessage(
        conversation.id,
        MessageRole.USER,
        message
      );

      // 獲取對話歷史
      const conversationHistory = await this.conversationRepository.getRecentMessages(
        conversation.id,
        10
      );

      // 生成 AI 回應
      const user = await this.userRepository.findById(userId);
      const aiResponse = await this.aiService.generateResponse(
        conversationHistory,
        conversation.context,
        user?.profile
      );

      // 檢查 AI 回應安全性
      const responseCheck = this.contentFilter.checkAIResponse(aiResponse.message);
      let finalMessage = aiResponse.message;
      
      if (!responseCheck.isAllowed) {
        finalMessage = this.contentFilter.generateSafeAlternativeResponse(
          aiResponse.message,
          responseCheck.issues
        );
      }

      // 添加 AI 回應訊息
      const aiMessage = await this.conversationRepository.addMessage(
        conversation.id,
        MessageRole.ASSISTANT,
        finalMessage,
        {
          suggestions: aiResponse.suggestions,
          confidence: aiResponse.confidence,
          originalFiltered: !responseCheck.isAllowed
        }
      );

      // 構建回應
      const chatResponse: ChatResponse = {
        message: finalMessage,
        suggestions: aiResponse.suggestions,
        actionItems: [], // 可以基於建議生成行動項目
        confidence: aiResponse.confidence
      };

      res.json({
        success: true,
        data: {
          response: chatResponse,
          conversationId: conversation.id,
          messageId: aiMessage.id
        },
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('發送訊息錯誤:', error);
      res.status(500).json({
        success: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '處理訊息時發生錯誤' 
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  }

  /**
   * 獲取對話歷史
   */
  async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { conversationId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      let conversations: Conversation[];

      if (conversationId) {
        // 獲取特定對話
        const conversation = await this.conversationRepository.getConversationById(conversationId);
        if (!conversation || conversation.userId !== userId) {
          res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: '找不到對話' },
            timestamp: new Date()
          } as ApiResponse<null>);
          return;
        }
        conversations = [conversation];
      } else {
        // 獲取用戶所有對話
        conversations = await this.conversationRepository.getConversationsByUserId(
          userId,
          Number(limit),
          Number(offset)
        );
      }

      res.json({
        success: true,
        data: conversations,
        timestamp: new Date()
      } as ApiResponse<Conversation[]>);

    } catch (error) {
      console.error('獲取對話歷史錯誤:', error);
      res.status(500).json({
        success: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '獲取對話歷史時發生錯誤' 
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  }

  /**
   * 獲取個人化建議
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 獲取用戶資料
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: '找不到用戶' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 獲取營養資料
      const nutritionData = await this.conversationManager.getNutritionContext(userId, 7);

      // 生成個人化建議
      const recommendations = await this.recommendationEngine.generatePersonalizedRecommendations(
        user.profile,
        user.healthGoals,
        nutritionData
      );

      res.json({
        success: true,
        data: recommendations,
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('獲取建議錯誤:', error);
      res.status(500).json({
        success: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '獲取建議時發生錯誤' 
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  }

  /**
   * 分析營養模式
   */
  async analyzeNutritionPattern(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { days = 7 } = req.query;

      // 獲取用戶資料
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: '找不到用戶' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 獲取營養資料
      const nutritionData = await this.conversationManager.getNutritionContext(
        userId, 
        Number(days)
      );

      if (nutritionData.length === 0) {
        res.status(400).json({
          success: false,
          error: { 
            code: 'INSUFFICIENT_DATA', 
            message: '沒有足夠的營養資料進行分析' 
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 分析營養模式
      const analysis = await this.nutritionAnalyzer.analyzeNutritionPattern(
        nutritionData,
        user.profile,
        user.healthGoals
      );

      res.json({
        success: true,
        data: analysis,
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('分析營養模式錯誤:', error);
      res.status(500).json({
        success: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '分析營養模式時發生錯誤' 
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  }

  /**
   * 開始新對話
   */
  async startNewConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { initialMessage } = req.body;

      // 獲取用戶資料以建立上下文
      const user = await this.userRepository.findById(userId);
      const nutritionContext = await this.conversationManager.getNutritionContext(userId);

      // 建立新對話
      const conversation = await this.conversationRepository.createConversation(userId, {
        recentNutritionData: nutritionContext,
        healthGoals: user?.healthGoals || [],
        userPreferences: user?.preferences
      });

      // 如果有初始訊息，處理它
      if (initialMessage) {
        const safetyCheck = this.contentFilter.checkUserInput(initialMessage);
        if (safetyCheck.isAllowed) {
          await this.conversationRepository.addMessage(
            conversation.id,
            MessageRole.USER,
            initialMessage
          );
        }
      }

      res.json({
        success: true,
        data: conversation,
        timestamp: new Date()
      } as ApiResponse<Conversation>);

    } catch (error) {
      console.error('開始新對話錯誤:', error);
      res.status(500).json({
        success: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '開始新對話時發生錯誤' 
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  }

  /**
   * 獲取對話統計
   */
  async getConversationStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const stats = await this.conversationRepository.getConversationStats(userId);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('獲取對話統計錯誤:', error);
      res.status(500).json({
        success: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '獲取對話統計時發生錯誤' 
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  }

  /**
   * 搜尋對話
   */
  async searchConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '用戶未認證' },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const { query, limit = 10 } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: { 
            code: 'INVALID_QUERY', 
            message: '搜尋關鍵字不能為空' 
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const conversations = await this.conversationRepository.searchConversations(
        userId,
        query,
        Number(limit)
      );

      res.json({
        success: true,
        data: conversations,
        timestamp: new Date()
      } as ApiResponse<Conversation[]>);

    } catch (error) {
      console.error('搜尋對話錯誤:', error);
      res.status(500).json({
        success: false,
        error: { 
          code: 'INTERNAL_ERROR', 
          message: '搜尋對話時發生錯誤' 
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  }
}