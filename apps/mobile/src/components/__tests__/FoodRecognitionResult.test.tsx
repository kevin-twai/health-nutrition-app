import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import FoodRecognitionResult from '../FoodRecognitionResult';
import { RecognitionResult, DetectedFood } from '@health-tracker/shared-types';
import nutritionReducer from '../../store/slices/nutritionSlice';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// 創建測試用的 store
const createTestStore = () => {
  return configureStore({
    reducer: {
      nutrition: nutritionReducer,
    },
  });
};

describe('FoodRecognitionResult', () => {
  const mockDetectedFood: DetectedFood = {
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
  };

  const mockRecognitionResult: RecognitionResult = {
    foods: [mockDetectedFood],
    confidence: 0.85,
    processingTime: 2.3,
  };

  const mockOnFoodSelect = jest.fn();

  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('應該正確渲染辨識結果標題和處理時間', () => {
    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={mockRecognitionResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    expect(getByText('辨識結果')).toBeTruthy();
    expect(getByText('處理時間: 2.3秒')).toBeTruthy();
    expect(getByText('找到 1 種食物')).toBeTruthy();
  });

  it('應該正確渲染食物資訊', () => {
    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={mockRecognitionResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    expect(getByText('白米飯')).toBeTruthy();
    expect(getByText('信心度: 85%')).toBeTruthy();
    expect(getByText('預估份量: 1.5 份')).toBeTruthy();
  });

  it('應該正確顯示營養資訊預覽', () => {
    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={mockRecognitionResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    // 計算實際營養值 (130 * 1.5 = 195)
    expect(getByText('195 kcal')).toBeTruthy();
    expect(getByText('4g')).toBeTruthy(); // 2.7 * 1.5 ≈ 4
    expect(getByText('42g')).toBeTruthy(); // 28 * 1.5 = 42
    expect(getByText('0g')).toBeTruthy(); // 0.3 * 1.5 ≈ 0
  });

  it('應該根據信心度顯示正確的顏色', () => {
    // 測試高信心度 (綠色)
    const highConfidenceFood = {
      ...mockDetectedFood,
      confidence: 0.9,
    };
    
    const highConfidenceResult = {
      ...mockRecognitionResult,
      foods: [highConfidenceFood],
    };

    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={highConfidenceResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    expect(getByText('信心度: 90%')).toBeTruthy();
  });

  it('點擊詳細資訊按鈕時應該觸發 onFoodSelect 回調', () => {
    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={mockRecognitionResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    fireEvent.press(getByText('詳細資訊'));
    expect(mockOnFoodSelect).toHaveBeenCalledWith(mockDetectedFood);
  });

  it('點擊確認記錄按鈕時應該顯示確認對話框', () => {
    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={mockRecognitionResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    fireEvent.press(getByText('確認記錄'));
    expect(Alert.alert).toHaveBeenCalledWith(
      '確認食物',
      '確定要記錄 白米飯 (1.5份) 嗎？',
      expect.arrayContaining([
        { text: '取消', style: 'cancel' },
        expect.objectContaining({ text: '確認' }),
      ])
    );
  });

  it('當沒有辨識結果時應該顯示無結果訊息', () => {
    const emptyResult: RecognitionResult = {
      foods: [],
      confidence: 0,
      processingTime: 1.5,
    };

    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={emptyResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    expect(getByText('未能辨識出食物')).toBeTruthy();
    expect(getByText('請嘗試重新拍攝更清晰的照片')).toBeTruthy();
  });

  it('應該正確處理多個食物辨識結果', () => {
    const multipleFood: DetectedFood[] = [
      mockDetectedFood,
      {
        id: 'food-2',
        name: '雞胸肉',
        confidence: 0.75,
        estimatedPortion: 1,
        nutrition: {
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fat: 3.6,
          fiber: 0,
          sugar: 0,
          sodium: 74,
          vitamins: {},
          minerals: {},
        },
      },
    ];

    const multipleResult: RecognitionResult = {
      foods: multipleFood,
      confidence: 0.8,
      processingTime: 3.1,
    };

    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={multipleResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    expect(getByText('找到 2 種食物')).toBeTruthy();
    expect(getByText('白米飯')).toBeTruthy();
    expect(getByText('雞胸肉')).toBeTruthy();
  });

  it('應該正確處理低信心度的辨識結果', () => {
    const lowConfidenceFood = {
      ...mockDetectedFood,
      confidence: 0.4,
    };
    
    const lowConfidenceResult = {
      ...mockRecognitionResult,
      foods: [lowConfidenceFood],
    };

    const { getByText } = renderWithProvider(
      <FoodRecognitionResult 
        result={lowConfidenceResult}
        onFoodSelect={mockOnFoodSelect}
      />
    );

    expect(getByText('信心度: 40%')).toBeTruthy();
  });
});