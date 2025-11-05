import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  clearError,
  setToken,
  clearAuth,
} from '../slices/authSlice';
import { authAPI } from '../../services/api';

// Mock API
jest.mock('../../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('初始狀態', () => {
    it('應該有正確的初始狀態', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('同步 actions', () => {
    it('clearError 應該清除錯誤訊息', () => {
      // 先設置一個錯誤狀態
      store.dispatch({ type: 'auth/loginUser/rejected', payload: '登入失敗' });
      
      // 清除錯誤
      store.dispatch(clearError());
      
      const state = store.getState().auth;
      expect(state.error).toBeNull();
    });

    it('setToken 應該設置 token 和認證狀態', () => {
      const token = 'test-token';
      store.dispatch(setToken(token));
      
      const state = store.getState().auth;
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clearAuth 應該清除所有認證資訊', () => {
      // 先設置一些認證資訊
      store.dispatch(setToken('test-token'));
      
      // 清除認證
      store.dispatch(clearAuth());
      
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loginUser async thunk', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com', name: '測試用戶' },
        token: 'jwt-token',
      },
    };

    it('成功登入時應該更新狀態', async () => {
      mockAuthAPI.login.mockResolvedValue(mockResponse);

      await store.dispatch(loginUser(mockCredentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe(mockResponse.data.token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('登入失敗時應該設置錯誤狀態', async () => {
      const errorMessage = '登入失敗';
      mockAuthAPI.login.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(loginUser(mockCredentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });

    it('登入過程中應該設置載入狀態', () => {
      mockAuthAPI.login.mockImplementation(() => new Promise(() => {}));

      store.dispatch(loginUser(mockCredentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('registerUser async thunk', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: '測試用戶',
    };

    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com', name: '測試用戶' },
        token: 'jwt-token',
      },
    };

    it('成功註冊時應該更新狀態', async () => {
      mockAuthAPI.register.mockResolvedValue(mockResponse);

      await store.dispatch(registerUser(mockUserData));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe(mockResponse.data.token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('註冊失敗時應該設置錯誤狀態', async () => {
      const errorMessage = '註冊失敗';
      mockAuthAPI.register.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(registerUser(mockUserData));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logoutUser async thunk', () => {
    it('成功登出時應該清除認證狀態', async () => {
      // 先設置認證狀態
      store.dispatch(setToken('test-token'));
      
      mockAuthAPI.logout.mockResolvedValue({});

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('登出失敗時應該設置錯誤狀態', async () => {
      const errorMessage = '登出失敗';
      mockAuthAPI.logout.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('refreshToken async thunk', () => {
    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com', name: '測試用戶' },
        token: 'new-jwt-token',
      },
    };

    it('成功刷新 token 時應該更新狀態', async () => {
      mockAuthAPI.refreshToken.mockResolvedValue(mockResponse);

      await store.dispatch(refreshToken());

      const state = store.getState().auth;
      expect(state.token).toBe(mockResponse.data.token);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('刷新 token 失敗時應該清除認證狀態', async () => {
      // 先設置認證狀態
      store.dispatch(setToken('old-token'));
      
      mockAuthAPI.refreshToken.mockRejectedValue({
        response: { data: { message: 'Token 刷新失敗' } },
      });

      await store.dispatch(refreshToken());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});