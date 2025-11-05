import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FoodLog, RecognitionResult, FoodItem, NutritionData } from '@health-tracker/shared-types';
import { nutritionAPI } from '../../services/api';

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
      const response = await nutritionAPI.recognizeFood(imageUri);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '食物辨識失敗');
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