import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProgress, Task, Achievement, Leaderboard } from '@health-tracker/shared-types';
import { gamificationAPI } from '../../services/api';

// 狀態介面
interface GamificationState {
  userProgress: UserProgress | null;
  availableTasks: Task[];
  completedTasks: Task[];
  achievements: Achievement[];
  leaderboards: Record<string, Leaderboard>;
  isLoading: boolean;
  error: string | null;
}

// 初始狀態
const initialState: GamificationState = {
  userProgress: null,
  availableTasks: [],
  completedTasks: [],
  achievements: [],
  leaderboards: {},
  isLoading: false,
  error: null,
};

// 異步 actions
export const fetchUserProgress = createAsyncThunk(
  'gamification/fetchUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.getUserProgress();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取用戶進度失敗');
    }
  }
);

export const fetchAvailableTasks = createAsyncThunk(
  'gamification/fetchAvailableTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.getAvailableTasks();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取可用任務失敗');
    }
  }
);

export const completeTask = createAsyncThunk(
  'gamification/completeTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.completeTask(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '完成任務失敗');
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'gamification/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.getAchievements();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取成就失敗');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (type: string, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.getLeaderboard(type);
      return { type, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取排行榜失敗');
    }
  }
);

export const claimDailyReward = createAsyncThunk(
  'gamification/claimDailyReward',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.claimDailyReward();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '領取每日獎勵失敗');
    }
  }
);

// Slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateTaskProgress: (state, action: PayloadAction<{ taskId: string; progress: number }>) => {
      const task = state.availableTasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.progress = action.payload.progress;
      }
    },
    addNewAchievement: (state, action: PayloadAction<Achievement>) => {
      state.achievements.push(action.payload);
    },
    incrementStreak: (state) => {
      if (state.userProgress) {
        state.userProgress.streakDays += 1;
      }
    },
    addExperiencePoints: (state, action: PayloadAction<number>) => {
      if (state.userProgress) {
        state.userProgress.experiencePoints += action.payload;
        state.userProgress.totalPoints += action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // 獲取用戶進度
    builder
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProgress = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取可用任務
    builder
      .addCase(fetchAvailableTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableTasks = action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 完成任務
    builder
      .addCase(completeTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const { task, progress, newAchievements } = action.payload;
        
        // 移動任務到已完成列表
        state.availableTasks = state.availableTasks.filter(t => t.id !== task.id);
        state.completedTasks.push(task);
        
        // 更新用戶進度
        if (progress) {
          state.userProgress = progress;
        }
        
        // 添加新成就
        if (newAchievements) {
          state.achievements.push(...newAchievements);
        }
        
        state.error = null;
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取成就
    builder
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievements = action.payload;
      });

    // 獲取排行榜
    builder
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboards[action.payload.type] = action.payload.data;
      });

    // 領取每日獎勵
    builder
      .addCase(claimDailyReward.fulfilled, (state, action) => {
        if (state.userProgress) {
          state.userProgress.totalPoints += action.payload.points;
          state.userProgress.experiencePoints += action.payload.points;
          state.userProgress.streakDays = action.payload.streakDays;
        }
      });
  },
});

export const { 
  clearError, 
  updateTaskProgress, 
  addNewAchievement, 
  incrementStreak, 
  addExperiencePoints 
} = gamificationSlice.actions;
export default gamificationSlice.reducer;