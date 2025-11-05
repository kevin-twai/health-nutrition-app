import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HealthReport, ReportSettings } from '@health-tracker/shared-types';
import { reportsAPI } from '../../services/api';

// 狀態介面
interface ReportsState {
  reports: HealthReport[];
  currentReport: HealthReport | null;
  reportSettings: ReportSettings | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

// 初始狀態
const initialState: ReportsState = {
  reports: [],
  currentReport: null,
  reportSettings: null,
  isLoading: false,
  isGenerating: false,
  error: null,
};

// 異步 actions
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getReports(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取報告失敗');
    }
  }
);

export const fetchReportById = createAsyncThunk(
  'reports/fetchReportById',
  async (reportId: string, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getReportById(reportId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取報告詳情失敗');
    }
  }
);

export const generateWeeklyReport = createAsyncThunk(
  'reports/generateWeeklyReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.generateWeeklyReport();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '生成週報失敗');
    }
  }
);

export const fetchReportSettings = createAsyncThunk(
  'reports/fetchReportSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getReportSettings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '獲取報告設定失敗');
    }
  }
);

export const updateReportSettings = createAsyncThunk(
  'reports/updateReportSettings',
  async (settings: Partial<ReportSettings>, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.updateReportSettings(settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新報告設定失敗');
    }
  }
);

export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      await reportsAPI.deleteReport(reportId);
      return reportId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '刪除報告失敗');
    }
  }
);

export const shareReport = createAsyncThunk(
  'reports/shareReport',
  async ({ reportId, method }: { reportId: string; method: string }, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.shareReport(reportId, method);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '分享報告失敗');
    }
  }
);

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReport: (state, action: PayloadAction<HealthReport>) => {
      state.currentReport = action.payload;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    updateReportInList: (state, action: PayloadAction<HealthReport>) => {
      const index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // 獲取報告列表
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取報告詳情
    builder
      .addCase(fetchReportById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload;
        state.error = null;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 生成週報
    builder
      .addCase(generateWeeklyReport.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateWeeklyReport.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
        state.error = null;
      })
      .addCase(generateWeeklyReport.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      });

    // 獲取報告設定
    builder
      .addCase(fetchReportSettings.fulfilled, (state, action) => {
        state.reportSettings = action.payload;
      });

    // 更新報告設定
    builder
      .addCase(updateReportSettings.fulfilled, (state, action) => {
        state.reportSettings = action.payload;
      });

    // 刪除報告
    builder
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(r => r.id !== action.payload);
        if (state.currentReport?.id === action.payload) {
          state.currentReport = null;
        }
      });

    // 分享報告
    builder
      .addCase(shareReport.fulfilled, (state, action) => {
        // 可以在這裡處理分享成功的狀態更新
      });
  },
});

export const { 
  clearError, 
  setCurrentReport, 
  clearCurrentReport, 
  updateReportInList 
} = reportsSlice.actions;
export default reportsSlice.reducer;