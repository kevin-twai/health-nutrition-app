import { configureStore } from '@reduxjs/toolkit';
import nutritionReducer, {
  recognizeFood,
  confirmFood,
  fetchFoodLogs,
  addManualFoodLog,
  clearRecognitionResult,
} from '../slices/nutritionSlice';
import { nutritionAPI } from '../../services/api';

// Mock API
jest.mock('../../services/api', () => ({
  nutritionAPI: {
    recognizeFood: jest.fn(),
    confirmFood: jest.fn(),
    getFoodLogs: jest.fn(),
    addFoodLog: jest.fn(),
  },
}));

const mockNutritionAPI = nutritionAPI as jest.Mocked<typeof nutritionAPI>;

describe('nutritionSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        nutrition: nutritionReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('初始狀態', () => {
    it('應該有正確的初始狀態', () => {
      const state = store.getState().nutrition;
      expect(state).toEqual({
        recognitionResult: null,
        foodLogs: [],
        todayLogs: [],
        isRecognizing: false,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('同步 actions', () => {
    it('clearRecognitionResult 應該清除辨識結果', () => {
      // 先設置辨識結果
      const mockResult = {
        foods: [],
        confidence: 0.8,
        processingTime: 2.5,
      };
      store.dispatch({ type: 'nutrition/recognizeFood/fulfilled', payload: mockResult });
      
      // 清除辨識結果
      store.dispatch(clearRecognitionResult());
      
      const state = store.getState().nutrition;
      expect(state.recognitionResult).toBeNull();
    });

    it('clearRecognitionResult 應該清除辨識結果', () => {
      // 先設置辨識結果
      const mockResult = {
        foods: [],
        confidence: 0.8,
        processingTime: 2.5,
      };
      store.dispatch({ type: 'nutrition/recognizeFood/fulfilled', payload: mockResult });
      
      // 清除辨識結果
      store.dispatch(clearRecognitionResult());
      
      const state = store.getState().nutrition;
      expect(state.recognitionResult).toBeNull();
    });
  });

  describe('recognizeFood async thunk', () => {
    const mockImageUri = 'file://test-image.jpg';
    const mockResponse = {
      data: {
        foods: [
          {
            id: 'food-1',
            name: '白米飯',
            confidence: 0.85,
            estimatedPortion: 1.5,
            nutrition: {
              calories: 130,
              protein: 2.7,
              carbohydrates: 28,
              fat: 0.3,
              fiber: 0.4,
              sugar: 0.1,
              sodium: 1,
              vitamins: {},
              minerals: {},
            },
          },
        ],
        confidence: 0.85,
        processingTime: 2.3,
      },
    };

    it('成功辨識食物時應該更新狀態', async () => {
      mockNutritionAPI.recognizeFood.mockResolvedValue(mockResponse);

      await store.dispatch(recognizeFood(mockImageUri));

      const state = store.getState().nutrition;
      expect(state.isRecognizing).toBe(false);
      expect(state.recognitionResult).toEqual(mockResponse.data);
      expect(state.error).toBeNull();
    });

    it('辨識失敗時應該設置錯誤狀態', async () => {
      const errorMessage = '辨識失敗';
      mockNutritionAPI.recognizeFood.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(recognizeFood(mockImageUri));

      const state = store.getState().nutrition;
      expect(state.isRecognizing).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('辨識過程中應該設置載入狀態', () => {
      mockNutritionAPI.recognizeFood.mockImplementation(() => new Promise(() => {}));

      store.dispatch(recognizeFood(mockImageUri));

      const state = store.getState().nutrition;
      expect(state.isRecognizing).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('confirmFood async thunk', () => {
    const mockConfirmData = {
      foodId: 'food-1',
      portion: 1.5,
    };

    const mockResponse = {
      data: {
        id: 'log-1',
        foodId: 'food-1',
        portion: 1.5,
        timestamp: new Date().toISOString(),
        nutrition: {
          calories: 195,
          protein: 4,
          carbohydrates: 42,
          fat: 0,
        },
      },
    };

    it('成功確認食物時應該更新狀態', async () => {
      mockNutritionAPI.confirmFood.mockResolvedValue(mockResponse);

      await store.dispatch(confirmFood(mockConfirmData));

      const state = store.getState().nutrition;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('確認失敗時應該設置錯誤狀態', async () => {
      const errorMessage = '確認失敗';
      mockNutritionAPI.confirmFood.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(confirmFood(mockConfirmData));

      const state = store.getState().nutrition;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('fetchFoodLogs async thunk', () => {
    const mockDateRange = {
      startDate: '2023-01-01',
      endDate: '2023-01-07',
    };

    const mockResponse = {
      data: [
        {
          id: 'log-1',
          foodId: 'food-1',
          foodName: '白米飯',
          portion: 1.5,
          timestamp: '2023-01-01T12:00:00Z',
          nutrition: {
            calories: 195,
            protein: 4,
            carbohydrates: 42,
            fat: 0,
          },
        },
        {
          id: 'log-2',
          foodId: 'food-2',
          foodName: '雞胸肉',
          portion: 1,
          timestamp: '2023-01-01T18:00:00Z',
          nutrition: {
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 4,
          },
        },
      ],
    };

    it('成功獲取食物記錄時應該更新狀態', async () => {
      mockNutritionAPI.getFoodLogs.mockResolvedValue(mockResponse);

      await store.dispatch(fetchFoodLogs(mockDateRange));

      const state = store.getState().nutrition;
      expect(state.isLoading).toBe(false);
      expect(state.foodLogs).toEqual(mockResponse.data);
      expect(state.error).toBeNull();
    });

    it('獲取失敗時應該設置錯誤狀態', async () => {
      const errorMessage = '獲取記錄失敗';
      mockNutritionAPI.getFoodLogs.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(fetchFoodLogs(mockDateRange));

      const state = store.getState().nutrition;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('addManualFoodLog async thunk', () => {
    const mockLogData = {
      foodId: 'food-1',
      portion: 1,
      mealType: 'lunch' as any,
      timestamp: new Date().toISOString(),
    };

    const mockResponse = {
      data: {
        id: 'log-3',
        ...mockLogData,
        nutrition: {
          calories: 130,
          protein: 3,
          carbohydrates: 28,
          fat: 0,
        },
      },
    };

    it('成功添加食物記錄時應該更新狀態', async () => {
      mockNutritionAPI.addFoodLog.mockResolvedValue(mockResponse);

      await store.dispatch(addManualFoodLog(mockLogData));

      const state = store.getState().nutrition;
      expect(state.todayLogs).toContainEqual(mockResponse.data);
      expect(state.error).toBeNull();
    });

    it('添加失敗時應該設置錯誤狀態', async () => {
      const errorMessage = '添加記錄失敗';
      mockNutritionAPI.addFoodLog.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(addManualFoodLog(mockLogData));

      const state = store.getState().nutrition;
      expect(state.error).toBe(errorMessage);
    });
  });
});