import { store } from '../store';
import { addMessage, setConnectionStatus, updateMessageStatus } from '../store/slices/chatSlice';
import { ChatMessage } from '@health-tracker/shared-types';

export interface WebSocketMessage {
  type: 'message' | 'status' | 'typing' | 'error';
  data: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private conversationId: string | null = null;

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  connect(conversationId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.conversationId = conversationId;
    const wsUrl = `ws://localhost:3000/ws/chat/${conversationId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
    } catch (error) {
      console.error('WebSocket 連接失敗:', error);
      store.dispatch(setConnectionStatus(false));
    }
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      
      this.ws = null;
    }

    this.conversationId = null;
    this.reconnectAttempts = 0;
    store.dispatch(setConnectionStatus(false));
  }

  sendMessage(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type: 'message',
        data: { message }
      };
      
      this.ws.send(JSON.stringify(wsMessage));
    } else {
      console.error('WebSocket 未連接，無法發送訊息');
    }
  }

  sendTyping(isTyping: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type: 'typing',
        data: { isTyping }
      };
      
      this.ws.send(JSON.stringify(wsMessage));
    }
  }

  private handleOpen(): void {
    console.log('WebSocket 連接成功');
    store.dispatch(setConnectionStatus(true));
    this.reconnectAttempts = 0;
    
    // 開始心跳檢測
    this.startHeartbeat();
  }

  private handleMessage(event: any): void {
    try {
      const wsMessage: WebSocketMessage = JSON.parse(event.data);
      
      switch (wsMessage.type) {
        case 'message':
          this.handleChatMessage(wsMessage.data);
          break;
        case 'status':
          this.handleStatusUpdate(wsMessage.data);
          break;
        case 'typing':
          this.handleTypingIndicator(wsMessage.data);
          break;
        case 'error':
          this.handleErrorMessage(wsMessage.data);
          break;
        default:
          console.warn('未知的 WebSocket 訊息類型:', wsMessage.type);
      }
    } catch (error) {
      console.error('WebSocket 訊息解析錯誤:', error);
    }
  }

  private handleClose(event: any): void {
    console.log('WebSocket 連接關閉:', event.code, event.reason);
    store.dispatch(setConnectionStatus(false));
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // 如果不是主動關閉，嘗試重新連接
    if (event.code !== 1000 && this.conversationId && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket 錯誤:', error);
    store.dispatch(setConnectionStatus(false));
  }

  private handleChatMessage(data: ChatMessage): void {
    store.dispatch(addMessage(data));
  }

  private handleStatusUpdate(data: { messageId: string; status: 'sending' | 'sent' | 'failed' }): void {
    store.dispatch(updateMessageStatus({
      id: data.messageId,
      status: data.status
    }));
  }

  private handleTypingIndicator(data: { isTyping: boolean; userId?: string }): void {
    // TODO: 實作打字指示器功能
    console.log('打字指示器:', data);
  }

  private handleErrorMessage(data: { message: string; code?: string }): void {
    console.error('WebSocket 錯誤訊息:', data);
    // TODO: 顯示錯誤訊息給用戶
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++;
    console.log(`嘗試重新連接 WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.conversationId) {
        this.connect(this.conversationId);
      }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 每 30 秒發送一次心跳
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}

// 創建單例實例
export const webSocketService = new WebSocketService();