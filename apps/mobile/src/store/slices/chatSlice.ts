import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ChatResponse, Conversation } from '@health-tracker/shared-types';
import { chatAPI } from '../../services/api';

// 狀態介面
interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  isConnected: boolean;
}

// 初始狀態
const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  isConnected: false,
};

// 異步 actions
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getConversations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取對話列表失敗');
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createConversation();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '創建對話失敗');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取訊息失敗');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, message }: { conversationId: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendMessage(conversationId, message);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '發送訊息失敗');
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await chatAPI.deleteConversation(conversationId);
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刪除對話失敗');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation>) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateMessageStatus: (state, action: PayloadAction<{ id: string; status: 'sending' | 'sent' | 'failed' }>) => {
      const message = state.messages.find(m => m.id === action.payload.id);
      if (message && message.metadata) {
        message.metadata.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    // 獲取對話列表
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 創建對話
    builder
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
        state.error = null;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取訊息
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 發送訊息
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        // 用戶訊息和 AI 回應都會在這裡添加
        if (Array.isArray(action.payload)) {
          state.messages.push(...action.payload);
        } else {
          state.messages.push(action.payload);
        }
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // 刪除對話
    builder
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.currentConversation?.id === action.payload) {
          state.currentConversation = null;
          state.messages = [];
        }
      });
  },
});

export const { 
  clearError, 
  setCurrentConversation, 
  addMessage, 
  setConnectionStatus, 
  clearMessages,
  updateMessageStatus 
} = chatSlice.actions;
export default chatSlice.reducer;