import axios from 'axios';
import { store } from '../../store';
import { clearAuth } from '../../store/slices/authSlice';
import {
  authAPI,
  userAPI,
  nutritionAPI,
  chatAPI,
  gamificationAPI,
  reportsAPI,
  integrationsAPI,
} from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock store
jest.mock('../../store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://localhost:3000/api',
}));

describe('API Services', () => {
  const mockStore = store as jest.Mocked<typeof store>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.getState.mockReturnValue({
      auth: {
        token: 'test-token',
        user: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    });
  });

  describe('API Client 配置', () => {
    it('應該正確配置 axios 實例', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('認證 API', () => {
    const mockApiClient = {
      post: jest.fn(),
    };

    beforeEach(() => {
      mockedAxios.create.mockReturnValue(mockApiClient as any);
    });

    it('login 應該發送正確的請求', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockResponse = { data: { token: 'jwt-token', user: {} } };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authAPI.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('register 應該發送正確的請求', async () => {
      const userData = { 
        email: 'test@example.com', 
        password: 'password', 
        name: '測試用戶' 
      };
      const mockResponse = { data: { token: 'jwt-token', user: {} } };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authAPI.register(userData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('logout 應該發送正確的請求', async () => {
      const mockResponse = { data: {} };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authAPI.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
    });

    it('refreshToken 應該發送正確的請求', async () => {
      const mockResponse = { data: { token: 'new-jwt-token', user: {} } };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authAPI.refreshToken();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockResponse);
    });

    it('forgotPassword 應該發送正確的請求', async () => {
      const email = 'test@example.com';
      const mockResponse = { data: { message: '重設密碼郵件已發送' } };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authAPI.forgotPassword(email);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('用戶 API', () => {
    const mockApiClient = {
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    };

    beforeEach(() => {
      mockedAxios.create.mockReturnValue(mockApiClient as any);
    });

    it('getProfile 應該發送正確的請求', async () => {
      const mockResponse = { data: { id: '1', name: '測試用戶' } };
      
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await userAPI.getProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockResponse);
    });

    it('updateProfile 應該發送正確的請求', async () => {
      const profileData = { name: '更新的用戶', age: 25 };
      const mockResponse = { data: { id: '1', ...profileData } };
      
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await userAPI.updateProfile(profileData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/users/profile', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('getHealthGoals 應該發送正確的請求', async () => {
      const mockResponse = { data: [{ id: '1', type: 'weight_loss', target: 70 }] };
      
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await userAPI.getHealthGoals();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/health-goals');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('營養 API', () => {
    const mockApiClient = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    beforeEach(() => {
      mockedAxios.create.mockReturnValue(mockApiClient as any);
    });

    it('recognizeFood 應該發送正確的 FormData 請求', async () => {
      const imageUri = 'file://test-image.jpg';
      const mockResponse = { 
        data: { 
          foods: [{ id: 'food-1', name: '白米飯', confidence: 0.85 }],
          confidence: 0.85,
          processingTime: 2.3,
        } 
      };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await nutritionAPI.recognizeFood(imageUri);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/photo/recognize',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('confirmFood 應該發送正確的請求', async () => {
      const foodId = 'food-1';
      const portion = 1.5;
      const mockResponse = { data: { id: 'log-1', foodId, portion } };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await nutritionAPI.confirmFood(foodId, portion);

      expect(mockApiClient.post).toHaveBeenCalledWith('/food/confirm', { foodId, portion });
      expect(result).toEqual(mockResponse);
    });

    it('getFoodLogs 應該發送正確的查詢參數', async () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-07';
      const mockResponse = { data: [{ id: 'log-1', foodName: '白米飯' }] };
      
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await nutritionAPI.getFoodLogs(startDate, endDate);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/food/logs?startDate=${startDate}&endDate=${endDate}`
      );
      expect(result).toEqual(mockResponse);
    });

    it('searchFoods 應該正確編碼查詢參數', async () => {
      const query = '白米飯 雞肉';
      const mockResponse = { data: [{ id: 'food-1', name: '白米飯' }] };
      
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await nutritionAPI.searchFoods(query);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/food/search?q=${encodeURIComponent(query)}`
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('遊戲化 API', () => {
    const mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
    };

    beforeEach(() => {
      mockedAxios.create.mockReturnValue(mockApiClient as any);
    });

    it('getUserProgress 應該發送正確的請求', async () => {
      const mockResponse = { 
        data: { 
          level: 5, 
          points: 1250, 
          streakDays: 7,
          achievements: [],
          currentTasks: [],
        } 
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamificationAPI.getUserProgress();

      expect(mockApiClient.get).toHaveBeenCalledWith('/gamification/progress');
      expect(result).toEqual(mockResponse);
    });

    it('completeTask 應該發送正確的請求', async () => {
      const taskId = 'task-1';
      const mockResponse = { 
        data: { 
          success: true, 
          pointsEarned: 50,
          newLevel: 6,
        } 
      };
      
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await gamificationAPI.completeTask(taskId);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/gamification/tasks/${taskId}/complete`);
      expect(result).toEqual(mockResponse);
    });

    it('getLeaderboard 應該發送正確的請求', async () => {
      const type = 'weekly';
      const mockResponse = { 
        data: [
          { userId: '1', name: '用戶1', points: 1500 },
          { userId: '2', name: '用戶2', points: 1200 },
        ]
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await gamificationAPI.getLeaderboard(type);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/gamification/leaderboard/${type}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('錯誤處理', () => {
    const mockApiClient = {
      interceptors: {
        response: {
          use: jest.fn(),
        },
        request: {
          use: jest.fn(),
        },
      },
    };

    beforeEach(() => {
      mockedAxios.create.mockReturnValue(mockApiClient as any);
    });

    it('401 錯誤時應該清除認證狀態', () => {
      // 模擬回應攔截器的設置
      const responseInterceptor = mockApiClient.interceptors.response.use;
      expect(responseInterceptor).toHaveBeenCalled();

      // 獲取錯誤處理函數
      const errorHandler = responseInterceptor.mock.calls[0][1];
      
      // 模擬 401 錯誤
      const error = {
        response: {
          status: 401,
        },
      };

      // 執行錯誤處理
      expect(() => errorHandler(error)).toThrow();
      
      // 驗證是否調用了 clearAuth
      expect(mockStore.dispatch).toHaveBeenCalledWith(clearAuth());
    });
  });
});