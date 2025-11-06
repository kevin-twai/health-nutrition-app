import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FoodLog, RecognitionResult, FoodItem, NutritionData } from '@health-tracker/shared-types';
import { nutritionAPI } from '../../services/api';
import { localFoodRecognition } from '../../services/LocalFoodRecognition';

// 狀態介面
interface NutritionState {
  foodLogs: FoodLog[];
  todayLogs: FoodLog[];
  recognitionResult: RecognitionResult | null;
  isRecognizing: boolean;
  isLoading: boolean;
  error: string | null;
}

// 初始狀態
const initialState: NutritionState = {
  foodLogs: [],
  todayLogs: [],
  recognitionResult: null,
  isRecognizing: false,
  isLoading: false,
  error: null,
};

// 異步 actions
export const recognizeFood = createAsyncThunk(
  'nutrition/recognizeFood',
  async (imageUri: string, { rejectWithValue }) => {
    try {
      console.log('開始 API 食物辨識:', imageUri);
      const response = await nutritionAPI.recognizeFood(imageUri);
      
      // 檢查 API 回應格式
      if (response.data && response.data.success && response.data.data) {
        const { recognition } = response.data.data;
        console.log('API 辨識成功:', recognition);
        return recognition;
      } else {
        // 如果 API 回應格式不正確，拋出錯誤以觸發本地備用方案
        throw new Error('API 回應格式錯誤');
      }
    } catch (error: any) {
      console.error('API 食物辨識失敗，嘗試本地辨識:', error);
      
      try {
        // 使用本地辨識作為備用方案
        console.log('開始本地食物辨識');
        const localResult = await localFoodRecognition.recognizeFood(imageUri);
        console.log('本地辨識成功:', localResult);
        
        // 標記這是本地辨識結果
        return {
          ...localResult,
          isLocalRecognition: true
        };
      } catch (localError) {
        console.error('本地辨識也失敗:', localError);
        
        // 提供更詳細的錯誤信息
        let errorMessage = '食物辨識失敗';
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = '網路連線超時，本地辨識也失敗';
        } else if (error.response?.status === 413) {
          errorMessage = '圖片檔案過大，請選擇較小的圖片';
        } else if (error.response?.status === 400) {
          errorMessage = '圖片格式不支援，請選擇 JPG 或 PNG 格式';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = '辨識服務暫時不可用，請稍後再試';
        }
        
        return rejectWithValue(errorMessage);
      }
    }
  }
);

export const confirmFood = createAsyncThunk(
  'nutrition/confirmFood',
  async ({ foodId, portion }: { foodId: string; portion: number }, { rejectWithValue }) => {
    try {
      const response = await nutritionAPI.confirmFood(foodId, portion);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '確認食物失敗');
    }
  }
);

export const fetchTodayLogs = createAsyncThunk(
  'nutrition/fetchTodayLogs',
  async (_, { rejectWithValue }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await nutritionAPI.getFoodLogs(today, today);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取今日記錄失敗');
    }
  }
);

export const fetchFoodLogs = createAsyncThunk(
  'nutrition/fetchFoodLogs',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await nutritionAPI.getFoodLogs(startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取飲食記錄失敗');
    }
  }
);

export const addManualFoodLog = createAsyncThunk(
  'nutrition/addManualFoodLog',
  async (logData: Omit<FoodLog, 'id'>, { rejectWithValue }) => {
    try {
      const response = await nutritionAPI.addFoodLog(logData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '新增飲食記錄失敗');
    }
  }
);

export const deleteFoodLog = createAsyncThunk(
  'nutrition/deleteFoodLog',
  async (logId: string, { rejectWithValue }) => {
    try {
      await nutritionAPI.deleteFoodLog(logId);
      return logId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刪除飲食記錄失敗');
    }
  }
);

export const searchFoods = createAsyncThunk(
  'nutrition/searchFoods',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await nutritionAPI.searchFoods(query);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '搜尋食物失敗');
    }
  }
);

// Slice
const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRecognitionResult: (state) => {
      state.recognitionResult = null;
    },
    updateFoodLogPortion: (state, action: PayloadAction<{ id: string; portion: number }>) => {
      const log = state.todayLogs.find(l => l.id === action.payload.id);
      if (log) {
        log.portion = action.payload.portion;
      }
    },
  },
  extraReducers: (builder) => {
    // 食物辨識
    builder
      .addCase(recognizeFood.pending, (state) => {
        state.isRecognizing = true;
        state.error = null;
      })
      .addCase(recognizeFood.fulfilled, (state, action) => {
        state.isRecognizing = false;
        state.recognitionResult = action.payload;
        state.error = null;
      })
      .addCase(recognizeFood.rejected, (state, action) => {
        state.isRecognizing = false;
        state.error = action.payload as string;
      });

    // 確認食物
    builder
      .addCase(confirmFood.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmFood.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayLogs.push(action.payload);
        state.recognitionResult = null;
        state.error = null;
      })
      .addCase(confirmFood.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取今日記錄
    builder
      .addCase(fetchTodayLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchTodayLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取飲食記錄
    builder
      .addCase(fetchFoodLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFoodLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.foodLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchFoodLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 新增手動記錄
    builder
      .addCase(addManualFoodLog.fulfilled, (state, action) => {
        state.todayLogs.push(action.payload);
      });

    // 刪除記錄
    builder
      .addCase(deleteFoodLog.fulfilled, (state, action) => {
        state.todayLogs = state.todayLogs.filter(log => log.id !== action.payload);
        state.foodLogs = state.foodLogs.filter(log => log.id !== action.payload);
      });
  },
});

export const { clearError, clearRecognitionResult, updateFoodLogPortion } = nutritionSlice.actions;
export default nutritionSlice.reducer;