import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserProfile, HealthGoal } from '@health-tracker/shared-types';
import { userAPI } from '../../services/api';

// 狀態介面
interface UserState {
  profile: UserProfile | null;
  healthGoals: HealthGoal[];
  isLoading: boolean;
  error: string | null;
}

// 初始狀態
const initialState: UserState = {
  profile: null,
  healthGoals: [],
  isLoading: false,
  error: null,
};

// 異步 actions
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取用戶資料失敗');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新用戶資料失敗');
    }
  }
);

export const fetchHealthGoals = createAsyncThunk(
  'user/fetchHealthGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getHealthGoals();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取健康目標失敗');
    }
  }
);

export const createHealthGoal = createAsyncThunk(
  'user/createHealthGoal',
  async (goalData: Omit<HealthGoal, 'id'>, { rejectWithValue }) => {
    try {
      const response = await userAPI.createHealthGoal(goalData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '創建健康目標失敗');
    }
  }
);

export const updateHealthGoal = createAsyncThunk(
  'user/updateHealthGoal',
  async ({ id, goalData }: { id: string; goalData: Partial<HealthGoal> }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateHealthGoal(id, goalData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新健康目標失敗');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateGoalProgress: (state, action: PayloadAction<{ id: string; current: number }>) => {
      const goal = state.healthGoals.find(g => g.id === action.payload.id);
      if (goal) {
        goal.current = action.payload.current;
      }
    },
  },
  extraReducers: (builder) => {
    // 獲取用戶資料
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新用戶資料
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取健康目標
    builder
      .addCase(fetchHealthGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.healthGoals = action.payload;
        state.error = null;
      })
      .addCase(fetchHealthGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 創建健康目標
    builder
      .addCase(createHealthGoal.fulfilled, (state, action) => {
        state.healthGoals.push(action.payload);
      });

    // 更新健康目標
    builder
      .addCase(updateHealthGoal.fulfilled, (state, action) => {
        const index = state.healthGoals.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.healthGoals[index] = action.payload;
        }
      });
  },
});

export const { clearError, setProfile, updateGoalProgress } = userSlice.actions;
export default userSlice.reducer;