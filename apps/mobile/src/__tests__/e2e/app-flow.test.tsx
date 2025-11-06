import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from '../../store';
import App from '../../App';
import { AuthScreen } from '../../screens/AuthScreen';
import { HomeScreen } from '../../screens/HomeScreen';
import { PhotoScreen } from '../../screens/PhotoScreen';
import { ChatScreen } from '../../screens/ChatScreen';

// Mock API responses
jest.mock('../../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
  nutritionAPI: {
    recognizeFood: jest.fn(),
    confirmFood: jest.fn(),
    getFoodLogs: jest.fn(),
    addFoodLog: jest.fn(),
    updateFoodLog: jest.fn(),
    deleteFoodLog: jest.fn(),
    searchFoods: jest.fn(),
    getFoodDetails: jest.fn(),
  },
  chatAPI: {
    sendMessage: jest.fn(),
    getRecommendations: jest.fn(),
  },
  userAPI: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

const mockAPI = require('../../services/api');

describe('移動應用端到端測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </Provider>
    );
  };

  describe('用戶認證流程', () => {
    it('應該完成完整的註冊和登入流程', async () => {
      mockAPI.authAPI.register.mockResolvedValue({
        token: 'test-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: '測試用戶'
        }
      });

      mockAPI.authAPI.login.mockResolvedValue({
        token: 'test-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: '測試用戶'
        }
      });

      const { getByTestId, getByText } = renderWithProviders(<AuthScreen />);

      // 測試註冊
      fireEvent.press(getByText('註冊'));
      
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'TestPassword123!');
      fireEvent.changeText(getByTestId('name-input'), '測試用戶');
      
      fireEvent.press(getByTestId('register-button'));

      await waitFor(() => {
        expect(mockAPI.authAPI.register).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'TestPassword123!',
          name: '測試用戶'
        });
      });

      // 測試登入
      fireEvent.press(getByText('登入'));
      
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'TestPassword123!');
      
      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(mockAPI.authAPI.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });
      });
    });

    it('應該正確處理登入錯誤', async () => {
      mockAPI.authAPI.login.mockRejectedValue(new Error('Invalid credentials'));

      const { getByTestId, getByText } = renderWithProviders(<AuthScreen />);

      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      
      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(getByText('登入失敗，請檢查您的帳號密碼')).toBeTruthy();
      });
    });
  });

  describe('拍照辨識流程', () => {
    it('應該完成完整的拍照到確認食物流程', async () => {
      mockAPI.nutritionAPI.recognizeFood.mockResolvedValue({
        foods: [
          {
            id: 'apple-001',
            name: '蘋果',
            confidence: 0.95,
            estimatedPortion: 1,
            nutrition: {
              calories: 52,
              protein: 0.3,
              carbohydrates: 14,
              fat: 0.2
            }
          }
        ],
        confidence: 0.95
      });

      mockAPI.nutritionAPI.confirmFood.mockResolvedValue({
        logId: 'log-001',
        nutrition: {
          calories: 52,
          protein: 0.3,
          carbohydrates: 14,
          fat: 0.2
        }
      });

      const { getByTestId, getByText } = renderWithProviders(<PhotoScreen />);

      // 模擬拍照
      fireEvent.press(getByTestId('camera-button'));

      // 模擬選擇照片
      const mockImageUri = 'file://test-image.jpg';
      act(() => {
        // 觸發圖片選擇回調
        const imagePickerCallback = jest.fn();
        imagePickerCallback({ uri: mockImageUri });
      });

      await waitFor(() => {
        expect(mockAPI.nutritionAPI.recognizeFood).toHaveBeenCalled();
      });

      // 檢查辨識結果顯示
      await waitFor(() => {
        expect(getByText('蘋果')).toBeTruthy();
        expect(getByText('信心度: 95%')).toBeTruthy();
      });

      // 確認食物
      fireEvent.press(getByTestId('confirm-food-button'));

      await waitFor(() => {
        expect(mockAPI.nutritionAPI.confirmFood).toHaveBeenCalledWith({
          foodId: 'apple-001',
          portion: 1,
          mealType: expect.any(String)
        });
      });

      // 檢查成功訊息
      await waitFor(() => {
        expect(getByText('食物記錄已儲存')).toBeTruthy();
      });
    });

    it('應該處理低信心度的辨識結果', async () => {
      mockAPI.nutritionAPI.recognizeFood.mockResolvedValue({
        foods: [
          {
            id: 'unknown-001',
            name: '未知食物',
            confidence: 0.3,
            estimatedPortion: 1,
            nutrition: null
          }
        ],
        confidence: 0.3
      });

      const { getByTestId, getByText } = renderWithProviders(<PhotoScreen />);

      fireEvent.press(getByTestId('camera-button'));

      await waitFor(() => {
        expect(getByText('辨識信心度較低，請手動選擇食物')).toBeTruthy();
        expect(getByTestId('manual-search-button')).toBeTruthy();
      });
    });
  });

  describe('AI聊天流程', () => {
    it('應該完成完整的聊天對話流程', async () => {
      mockAPI.chatAPI.sendMessage.mockResolvedValue({
        message: '根據您今天的飲食記錄，您的蛋白質攝取量略低於建議值。建議您可以增加一些優質蛋白質來源。',
        suggestions: ['增加雞胸肉', '添加豆腐', '喝一杯牛奶'],
        actionItems: [
          {
            type: 'nutrition_tip',
            message: '每餐都應該包含蛋白質來源'
          }
        ]
      });

      const { getByTestId, getByText } = renderWithProviders(<ChatScreen />);

      // 發送訊息
      fireEvent.changeText(getByTestId('chat-input'), '我今天的營養攝取如何？');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(mockAPI.chatAPI.sendMessage).toHaveBeenCalledWith({
          message: '我今天的營養攝取如何？'
        });
      });

      // 檢查AI回應
      await waitFor(() => {
        expect(getByText('根據您今天的飲食記錄，您的蛋白質攝取量略低於建議值。建議您可以增加一些優質蛋白質來源。')).toBeTruthy();
      });

      // 檢查建議選項
      await waitFor(() => {
        expect(getByText('增加雞胸肉')).toBeTruthy();
        expect(getByText('添加豆腐')).toBeTruthy();
        expect(getByText('喝一杯牛奶')).toBeTruthy();
      });
    });

    it('應該處理聊天錯誤', async () => {
      mockAPI.chatAPI.sendMessage.mockRejectedValue(new Error('Network error'));

      const { getByTestId, getByText } = renderWithProviders(<ChatScreen />);

      fireEvent.changeText(getByTestId('chat-input'), '測試訊息');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(getByText('訊息發送失敗，請稍後再試')).toBeTruthy();
      });
    });
  });

  describe('應用導航流程', () => {
    it('應該能夠在不同畫面間正確導航', async () => {
      const { getByTestId } = renderWithProviders(<App />);

      // 測試底部導航
      fireEvent.press(getByTestId('tab-photo'));
      await waitFor(() => {
        expect(getByTestId('photo-screen')).toBeTruthy();
      });

      fireEvent.press(getByTestId('tab-chat'));
      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      });

      fireEvent.press(getByTestId('tab-reports'));
      await waitFor(() => {
        expect(getByTestId('reports-screen')).toBeTruthy();
      });

      fireEvent.press(getByTestId('tab-gamification'));
      await waitFor(() => {
        expect(getByTestId('gamification-screen')).toBeTruthy();
      });

      fireEvent.press(getByTestId('tab-home'));
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });
  });

  describe('離線功能測試', () => {
    it('應該在離線狀態下顯示適當的訊息', async () => {
      // 模擬網路錯誤
      mockAPI.chatAPI.sendMessage.mockRejectedValue(new Error('Network request failed'));

      const { getByTestId, getByText } = renderWithProviders(<ChatScreen />);

      fireEvent.changeText(getByTestId('chat-input'), '測試離線訊息');
      fireEvent.press(getByTestId('send-button'));

      await waitFor(() => {
        expect(getByText('網路連線異常，請檢查您的網路設定')).toBeTruthy();
      });
    });

    it('應該能夠儲存離線資料並在連線後同步', async () => {
      // 這個測試需要實際的離線儲存實作
      const { getByTestId } = renderWithProviders(<PhotoScreen />);

      // 模擬離線狀態下的操作
      // 實際實作會依據離線儲存機制而定
    });
  });

  describe('效能測試', () => {
    it('應用啟動時間應該在合理範圍內', async () => {
      const startTime = Date.now();
      
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000); // 3秒內啟動
      });
    });

    it('畫面切換應該流暢', async () => {
      const { getByTestId } = renderWithProviders(<App />);

      const switchTimes: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        fireEvent.press(getByTestId('tab-photo'));
        await waitFor(() => {
          expect(getByTestId('photo-screen')).toBeTruthy();
        });
        
        const switchTime = Date.now() - startTime;
        switchTimes.push(switchTime);
        
        fireEvent.press(getByTestId('tab-home'));
        await waitFor(() => {
          expect(getByTestId('home-screen')).toBeTruthy();
        });
      }

      const averageSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
      expect(averageSwitchTime).toBeLessThan(500); // 平均切換時間應小於500ms
    });
  });

  describe('無障礙功能測試', () => {
    it('重要元素應該有適當的無障礙標籤', async () => {
      const { getByLabelText } = renderWithProviders(<HomeScreen />);

      expect(getByLabelText('拍照辨識食物')).toBeTruthy();
      expect(getByLabelText('與AI顧問聊天')).toBeTruthy();
      expect(getByLabelText('查看健康報告')).toBeTruthy();
    });

    it('表單輸入應該有適當的提示', async () => {
      const { getByTestId } = renderWithProviders(<AuthScreen />);

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      expect(emailInput.props.placeholder).toBe('請輸入電子郵件');
      expect(passwordInput.props.placeholder).toBe('請輸入密碼');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });
});