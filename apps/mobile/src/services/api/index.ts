import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Config from 'react-native-config';
import { store } from '../../store';
import { clearAuth } from '../../store/slices/authSlice';

// API 基礎配置
const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:3000/api';

// 創建 axios 實例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 過期或無效，清除認證狀態
      store.dispatch(clearAuth());
    }
    
    return Promise.reject(error);
  }
);

// 認證 API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', userData),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// 用戶 API
export const userAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),
  
  updateProfile: (profileData: any) =>
    apiClient.put('/users/profile', profileData),
  
  getHealthGoals: () =>
    apiClient.get('/users/health-goals'),
  
  createHealthGoal: (goalData: any) =>
    apiClient.post('/users/health-goals', goalData),
  
  updateHealthGoal: (id: string, goalData: any) =>
    apiClient.put(`/users/health-goals/${id}`, goalData),
  
  deleteHealthGoal: (id: string) =>
    apiClient.delete(`/users/health-goals/${id}`),
};

// 營養 API
export const nutritionAPI = {
  recognizeFood: (imageUri: string) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'food.jpg',
    } as any);
    
    return apiClient.post('/photo/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 15000, // 15秒超時
    });
  },
  
  confirmFood: (foodId: string, portion: number) =>
    apiClient.post('/food/confirm', { foodId, portion }),
  
  getFoodLogs: (startDate: string, endDate: string) =>
    apiClient.get(`/food/logs?startDate=${startDate}&endDate=${endDate}`),
  
  addFoodLog: (logData: any) =>
    apiClient.post('/food/logs', logData),
  
  updateFoodLog: (id: string, logData: any) =>
    apiClient.put(`/food/logs/${id}`, logData),
  
  deleteFoodLog: (id: string) =>
    apiClient.delete(`/food/logs/${id}`),
  
  searchFoods: (query: string) =>
    apiClient.get(`/food/search?q=${encodeURIComponent(query)}`),
  
  getFoodDetails: (id: string) =>
    apiClient.get(`/food/${id}`),
};

// 聊天 API
export const chatAPI = {
  getConversations: () =>
    apiClient.get('/chat/conversations'),
  
  createConversation: () =>
    apiClient.post('/chat/conversations'),
  
  getMessages: (conversationId: string) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: string, message: string) =>
    apiClient.post(`/chat/conversations/${conversationId}/messages`, { message }),
  
  deleteConversation: (conversationId: string) =>
    apiClient.delete(`/chat/conversations/${conversationId}`),
  
  getRecommendations: () =>
    apiClient.get('/chat/recommendations'),
};

// 遊戲化 API
export const gamificationAPI = {
  getUserProgress: () =>
    apiClient.get('/gamification/progress'),
  
  getAvailableTasks: () =>
    apiClient.get('/gamification/tasks'),
  
  completeTask: (taskId: string) =>
    apiClient.post(`/gamification/tasks/${taskId}/complete`),
  
  getAchievements: () =>
    apiClient.get('/gamification/achievements'),
  
  getLeaderboard: (type: string) =>
    apiClient.get(`/gamification/leaderboard/${type}`),
  
  claimDailyReward: () =>
    apiClient.post('/gamification/daily-reward'),
  
  getPointsHistory: () =>
    apiClient.get('/gamification/points/history'),
};

// 報告 API
export const reportsAPI = {
  getReports: (limit?: number) =>
    apiClient.get(`/reports${limit ? `?limit=${limit}` : ''}`),
  
  getReportById: (id: string) =>
    apiClient.get(`/reports/${id}`),
  
  generateWeeklyReport: () =>
    apiClient.post('/reports/generate/weekly'),
  
  getReportSettings: () =>
    apiClient.get('/reports/settings'),
  
  updateReportSettings: (settings: any) =>
    apiClient.put('/reports/settings', settings),
  
  deleteReport: (id: string) =>
    apiClient.delete(`/reports/${id}`),
  
  shareReport: (id: string, method: string) =>
    apiClient.post(`/reports/${id}/share`, { method }),
};

// 第三方整合 API
export const integrationsAPI = {
  getConnections: () =>
    apiClient.get('/integrations/connections'),
  
  connectPlatform: (platform: string, data: any) =>
    apiClient.post('/integrations/connect', { platform, ...data }),
  
  disconnectPlatform: (connectionId: string) =>
    apiClient.delete(`/integrations/connections/${connectionId}`),
  
  syncPlatform: (connectionId: string) =>
    apiClient.post(`/integrations/connections/${connectionId}/sync`),
  
  updateConnectionSettings: (connectionId: string, settings: any) =>
    apiClient.put(`/integrations/connections/${connectionId}/settings`, settings),
  
  getSyncHistory: (connectionId?: string) =>
    apiClient.get(`/integrations/sync-history${connectionId ? `?connectionId=${connectionId}` : ''}`),
  
  testConnection: (connectionId: string) =>
    apiClient.post(`/integrations/connections/${connectionId}/test`),
};

export default apiClient;