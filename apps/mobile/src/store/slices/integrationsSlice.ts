import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IntegrationConnection, SyncResult, Platform, ConnectionStatus } from '@health-tracker/shared-types';
import { integrationsAPI } from '../../services/api';

// 狀態介面
interface IntegrationsState {
  connections: IntegrationConnection[];
  syncHistory: SyncResult[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

// 初始狀態
const initialState: IntegrationsState = {
  connections: [],
  syncHistory: [],
  isLoading: false,
  isSyncing: false,
  error: null,
};

// 異步 actions
export const fetchConnections = createAsyncThunk(
  'integrations/fetchConnections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await integrationsAPI.getConnections();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取連接狀態失敗');
    }
  }
);

export const connectPlatform = createAsyncThunk(
  'integrations/connectPlatform',
  async ({ platform, credentials, settings }: { platform: Platform; credentials: any; settings?: any }, { rejectWithValue }) => {
    try {
      const response = await integrationsAPI.connectPlatform(platform, { credentials, settings });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '連接平台失敗');
    }
  }
);

export const disconnectPlatform = createAsyncThunk(
  'integrations/disconnectPlatform',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      await integrationsAPI.disconnectPlatform(connectionId);
      return connectionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '斷開連接失敗');
    }
  }
);

export const syncPlatform = createAsyncThunk(
  'integrations/syncPlatform',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      const response = await integrationsAPI.syncPlatform(connectionId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '同步失敗');
    }
  }
);

export const updateConnectionSettings = createAsyncThunk(
  'integrations/updateConnectionSettings',
  async ({ connectionId, settings }: { connectionId: string; settings: any }, { rejectWithValue }) => {
    try {
      const response = await integrationsAPI.updateConnectionSettings(connectionId, settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新設定失敗');
    }
  }
);

export const fetchSyncHistory = createAsyncThunk(
  'integrations/fetchSyncHistory',
  async (connectionId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await integrationsAPI.getSyncHistory(connectionId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取同步歷史失敗');
    }
  }
);

export const testConnection = createAsyncThunk(
  'integrations/testConnection',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      const response = await integrationsAPI.testConnection(connectionId);
      return { connectionId, result: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '測試連接失敗');
    }
  }
);

// Slice
const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateConnectionStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const connection = state.connections.find(c => c.id === action.payload.id);
      if (connection) {
        connection.status = action.payload.status as any;
      }
    },
    addSyncResult: (state, action: PayloadAction<SyncResult>) => {
      state.syncHistory.unshift(action.payload);
      // 保持最近 50 條記錄
      if (state.syncHistory.length > 50) {
        state.syncHistory = state.syncHistory.slice(0, 50);
      }
    },
  },
  extraReducers: (builder) => {
    // 獲取連接狀態
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload;
        state.error = null;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 連接平台
    builder
      .addCase(connectPlatform.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectPlatform.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingIndex = state.connections.findIndex(c => c.platform === action.payload.platform);
        if (existingIndex !== -1) {
          state.connections[existingIndex] = action.payload;
        } else {
          state.connections.push(action.payload);
        }
        state.error = null;
      })
      .addCase(connectPlatform.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 斷開連接
    builder
      .addCase(disconnectPlatform.fulfilled, (state, action) => {
        state.connections = state.connections.filter(c => c.id !== action.payload);
      });

    // 同步平台
    builder
      .addCase(syncPlatform.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncPlatform.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.syncHistory.unshift(action.payload);
        
        // 更新連接的最後同步時間
        const connection = state.connections.find(c => c.id === action.payload.connectionId);
        if (connection) {
          connection.lastSyncAt = action.payload.endTime;
        }
        
        state.error = null;
      })
      .addCase(syncPlatform.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });

    // 更新連接設定
    builder
      .addCase(updateConnectionSettings.fulfilled, (state, action) => {
        const index = state.connections.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.connections[index] = action.payload;
        }
      });

    // 獲取同步歷史
    builder
      .addCase(fetchSyncHistory.fulfilled, (state, action) => {
        state.syncHistory = action.payload;
      });

    // 測試連接
    builder
      .addCase(testConnection.fulfilled, (state, action) => {
        const connection = state.connections.find(c => c.id === action.payload.connectionId);
        if (connection) {
          connection.status = action.payload.result.success ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR;
        }
      });
  },
});

export const { 
  clearError, 
  updateConnectionStatus, 
  addSyncResult 
} = integrationsSlice.actions;
export default integrationsSlice.reducer;