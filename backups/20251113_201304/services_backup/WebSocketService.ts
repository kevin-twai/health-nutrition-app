import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { 
  ChatMessage, 
  MessageRole, 
  ChatResponse,
  Conversation
} from '@health-tracker/shared-types';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AIService } from './AIService';
import { ContentFilterService } from './ContentFilterService';
import { ConversationManager } from './ConversationManager';
import { db } from '../database/connection';
import { redisConnection } from '../database/redis';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

interface SocketMessage {
  conversationId?: string;
  message: string;
  timestamp: Date;
}

interface TypingData {
  conversationId: string;
  isTyping: boolean;
}

/**
 * WebSocket 服務 - 處理即時聊天連接
 */
export class WebSocketService {
  private io: SocketIOServer;
  private conversationRepository: ConversationRepository;
  private userRepository: UserRepository;
  private aiService: AIService;
  private contentFilter: ContentFilterService;
  private conversationManager: ConversationManager;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userSockets: Map<string, AuthenticatedSocket> = new Map(); // socketId -> socket

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    const pool = db.getPool();
    const redis = redisConnection.getClient();
    
    this.conversationRepository = new ConversationRepository(pool, redis);
    this.userRepository = new UserRepository(pool, redis);
    this.aiService = new AIService();
    this.contentFilter = new ContentFilterService();
    this.conversationManager = new ConversationManager();

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * 設定中間件
   */
  private setupMiddleware(): void {
    // 認證中間件
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('認證失敗：缺少 token'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const user = await this.userRepository.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('認證失敗：用戶不存在'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('認證失敗：無效的 token'));
      }
    });

    // 速率限制中間件
    this.io.use((socket: AuthenticatedSocket, next) => {
      const rateLimiter = this.createRateLimiter(socket.userId!);
      if (rateLimiter.isAllowed()) {
        next();
      } else {
        next(new Error('請求過於頻繁，請稍後再試'));
      }
    });
  }

  /**
   * 設定事件處理器
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`用戶 ${socket.userId} 已連接 WebSocket`);
      
      // 記錄連接的用戶
      this.connectedUsers.set(socket.userId!, socket.id);
      this.userSockets.set(socket.id, socket);

      // 加入用戶專屬房間
      socket.join(`user:${socket.userId}`);

      // 發送連接成功訊息
      socket.emit('connected', {
        message: '已成功連接到聊天服務',
        userId: socket.userId,
        timestamp: new Date()
      });

      // 處理發送訊息
      socket.on('send_message', async (data: SocketMessage) => {
        await this.handleSendMessage(socket, data);
      });

      // 處理加入對話房間
      socket.on('join_conversation', async (conversationId: string) => {
        await this.handleJoinConversation(socket, conversationId);
      });

      // 處理離開對話房間
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
        socket.emit('left_conversation', { conversationId });
      });

      // 處理輸入狀態
      socket.on('typing', (data: TypingData) => {
        this.handleTyping(socket, data);
      });

      // 處理停止輸入
      socket.on('stop_typing', (data: { conversationId: string }) => {
        this.handleStopTyping(socket, data);
      });

      // 處理獲取線上用戶
      socket.on('get_online_users', () => {
        this.handleGetOnlineUsers(socket);
      });

      // 處理斷線
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // 處理錯誤
      socket.on('error', (error) => {
        console.error(`WebSocket 錯誤 (用戶 ${socket.userId}):`, error);
        socket.emit('error', { message: '連接發生錯誤', error: error.message });
      });
    });
  }

  /**
   * 處理發送訊息
   */
  private async handleSendMessage(socket: AuthenticatedSocket, data: SocketMessage): Promise<void> {
    try {
      const { conversationId, message } = data;
      const userId = socket.userId!;

      // 內容安全檢查
      const safetyCheck = this.contentFilter.checkUserInput(message);
      if (!safetyCheck.isAllowed) {
        socket.emit('message_error', {
          error: '訊息內容不符合安全規範',
          issues: safetyCheck.issues
        });
        return;
      }

      // 獲取或建立對話
      let conversation: Conversation;
      if (conversationId) {
        const existingConversation = await this.conversationRepository.getConversationById(conversationId);
        if (!existingConversation || existingConversation.userId !== userId) {
          socket.emit('message_error', { error: '找不到對話或無權限' });
          return;
        }
        conversation = existingConversation;
      } else {
        // 建立新對話
        const user = await this.userRepository.findById(userId);
        const nutritionContext = await this.conversationManager.getNutritionContext(userId);
        
        conversation = await this.conversationRepository.createConversation(userId, {
          recentNutritionData: nutritionContext,
          healthGoals: user?.healthGoals || [],
          userPreferences: user?.preferences
        });

        // 加入新對話房間
        socket.join(`conversation:${conversation.id}`);
      }

      // 添加用戶訊息
      const userMessage = await this.conversationRepository.addMessage(
        conversation.id,
        MessageRole.USER,
        message
      );

      // 廣播用戶訊息到對話房間
      this.io.to(`conversation:${conversation.id}`).emit('new_message', {
        message: userMessage,
        conversationId: conversation.id
      });

      // 顯示 AI 正在輸入
      socket.emit('ai_typing', { conversationId: conversation.id });

      // 生成 AI 回應
      const conversationHistory = await this.conversationRepository.getRecentMessages(
        conversation.id,
        10
      );

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

      // 停止顯示 AI 正在輸入
      socket.emit('ai_stop_typing', { conversationId: conversation.id });

      // 廣播 AI 回應到對話房間
      this.io.to(`conversation:${conversation.id}`).emit('new_message', {
        message: aiMessage,
        conversationId: conversation.id,
        suggestions: aiResponse.suggestions
      });

      // 發送完整的聊天回應給發送者
      const chatResponse: ChatResponse = {
        message: finalMessage,
        suggestions: aiResponse.suggestions,
        actionItems: [],
        confidence: aiResponse.confidence
      };

      socket.emit('chat_response', {
        response: chatResponse,
        conversationId: conversation.id,
        messageId: aiMessage.id
      });

    } catch (error) {
      console.error('處理訊息錯誤:', error);
      socket.emit('message_error', { 
        error: '處理訊息時發生錯誤',
        details: error.message 
      });
    }
  }

  /**
   * 處理加入對話房間
   */
  private async handleJoinConversation(socket: AuthenticatedSocket, conversationId: string): Promise<void> {
    try {
      const userId = socket.userId!;
      
      // 驗證對話存在且用戶有權限
      const conversation = await this.conversationRepository.getConversationById(conversationId);
      if (!conversation || conversation.userId !== userId) {
        socket.emit('join_error', { error: '找不到對話或無權限' });
        return;
      }

      // 加入對話房間
      socket.join(`conversation:${conversationId}`);
      
      // 發送確認訊息
      socket.emit('joined_conversation', { 
        conversationId,
        conversation 
      });

      // 發送最近的訊息歷史
      const recentMessages = await this.conversationRepository.getRecentMessages(conversationId, 20);
      socket.emit('conversation_history', {
        conversationId,
        messages: recentMessages
      });

    } catch (error) {
      console.error('加入對話錯誤:', error);
      socket.emit('join_error', { 
        error: '加入對話時發生錯誤',
        details: error.message 
      });
    }
  }

  /**
   * 處理輸入狀態
   */
  private handleTyping(socket: AuthenticatedSocket, data: TypingData): void {
    const { conversationId } = data;
    
    // 廣播輸入狀態到對話房間（除了發送者）
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId,
      isTyping: true
    });
  }

  /**
   * 處理停止輸入
   */
  private handleStopTyping(socket: AuthenticatedSocket, data: { conversationId: string }): void {
    const { conversationId } = data;
    
    // 廣播停止輸入狀態到對話房間（除了發送者）
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId,
      isTyping: false
    });
  }

  /**
   * 處理獲取線上用戶
   */
  private handleGetOnlineUsers(socket: AuthenticatedSocket): void {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    socket.emit('online_users', { users: onlineUsers });
  }

  /**
   * 處理斷線
   */
  private handleDisconnect(socket: AuthenticatedSocket): void {
    console.log(`用戶 ${socket.userId} 已斷開 WebSocket 連接`);
    
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
    }
    this.userSockets.delete(socket.id);

    // 通知其他用戶該用戶已離線
    socket.broadcast.emit('user_offline', { userId: socket.userId });
  }

  /**
   * 建立速率限制器
   */
  private createRateLimiter(userId: string): {
    isAllowed: () => boolean;
  } {
    const requests = new Map<string, number[]>();
    const maxRequests = 30; // 每分鐘最多 30 個請求
    const windowMs = 60 * 1000; // 1 分鐘

    return {
      isAllowed: () => {
        const now = Date.now();
        const userRequests = requests.get(userId) || [];
        
        // 清理過期的請求記錄
        const validRequests = userRequests.filter(time => now - time < windowMs);
        
        if (validRequests.length >= maxRequests) {
          return false;
        }
        
        validRequests.push(now);
        requests.set(userId, validRequests);
        return true;
      }
    };
  }

  /**
   * 發送系統通知給特定用戶
   */
  public sendNotificationToUser(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  /**
   * 發送廣播訊息給所有連接的用戶
   */
  public broadcastMessage(message: {
    type: string;
    title: string;
    content: string;
    data?: any;
  }): void {
    this.io.emit('broadcast', message);
  }

  /**
   * 獲取線上用戶數量
   */
  public getOnlineUserCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * 獲取特定用戶是否在線
   */
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * 強制斷開用戶連接
   */
  public disconnectUser(userId: string, reason?: string): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.userSockets.get(socketId);
      if (socket) {
        socket.emit('force_disconnect', { reason: reason || '管理員強制斷線' });
        socket.disconnect(true);
      }
    }
  }

  /**
   * 清理過期連接
   */
  public cleanupConnections(): void {
    // 定期清理無效的連接記錄
    setInterval(() => {
      this.connectedUsers.forEach((socketId, userId) => {
        const socket = this.userSockets.get(socketId);
        if (!socket || !socket.connected) {
          this.connectedUsers.delete(userId);
          this.userSockets.delete(socketId);
        }
      });
    }, 5 * 60 * 1000); // 每 5 分鐘清理一次
  }
}