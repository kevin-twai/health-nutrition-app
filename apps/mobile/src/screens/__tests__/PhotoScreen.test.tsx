import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import PhotoScreen from '../PhotoScreen';
import nutritionReducer from '../../store/slices/nutritionSlice';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
  MediaType: {
    photo: 'photo',
  },
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  request: jest.fn(),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock components
jest.mock('../../components/FoodRecognitionResult', () => 'FoodRecognitionResult');
jest.mock('../../components/NutritionInfoModal', () => 'NutritionInfoModal');
jest.mock('../../components/FoodSearchModal', () => 'FoodSearchModal');

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// 創建測試用的 store
const createTestStore = () => {
  return configureStore({
    reducer: {
      nutrition: nutritionReducer,
    },
  });
};

describe('PhotoScreen', () => {
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

  it('應該正確渲染初始狀態', () => {
    const { getByText, getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    expect(getByText('拍照辨識')).toBeTruthy();
    expect(getByText('拍攝或選擇食物照片，讓 AI 幫您辨識營養成分')).toBeTruthy();
    expect(getByTestId('camera-button')).toBeTruthy();
    expect(getByTestId('gallery-button')).toBeTruthy();
    expect(getByTestId('search-button')).toBeTruthy();
  });

  it('點擊拍照按鈕時應該打開相機', () => {
    const { launchCamera } = require('react-native-image-picker');
    
    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByTestId('camera-button'));

    expect(launchCamera).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      }),
      expect.any(Function)
    );
  });

  it('點擊相簿按鈕時應該打開圖片庫', () => {
    const { launchImageLibrary } = require('react-native-image-picker');
    
    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByTestId('gallery-button'));

    expect(launchImageLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      }),
      expect.any(Function)
    );
  });

  it('點擊搜尋按鈕時應該打開搜尋模態框', () => {
    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByTestId('search-button'));

    // 檢查搜尋模態框是否顯示
    expect(getByTestId('food-search-modal')).toBeTruthy();
  });

  it('選擇圖片後應該開始辨識流程', async () => {
    const { launchCamera } = require('react-native-image-picker');
    const mockImageResponse = {
      assets: [
        {
          uri: 'file://test-image.jpg',
          type: 'image/jpeg',
          fileName: 'test.jpg',
        },
      ],
    };

    // Mock 相機回調
    launchCamera.mockImplementation((options, callback) => {
      callback(mockImageResponse);
    });

    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByTestId('camera-button'));

    await waitFor(() => {
      // 檢查是否顯示載入狀態
      expect(getByTestId('recognition-loading')).toBeTruthy();
    });
  });

  it('辨識成功後應該顯示結果', async () => {
    // 設置 store 狀態為有辨識結果
    const mockResult = {
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
    };

    store.dispatch({
      type: 'nutrition/recognizeFood/fulfilled',
      payload: mockResult,
    });

    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    expect(getByTestId('food-recognition-result')).toBeTruthy();
  });

  it('辨識失敗時應該顯示錯誤訊息', async () => {
    // 設置 store 狀態為錯誤
    store.dispatch({
      type: 'nutrition/recognizeFood/rejected',
      payload: '辨識失敗',
    });

    const { getByText } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    expect(getByText('辨識失敗')).toBeTruthy();
  });

  it('應該正確處理相機權限被拒絕的情況', () => {
    const { launchCamera } = require('react-native-image-picker');
    
    // Mock 權限被拒絕的回應
    launchCamera.mockImplementation((options, callback) => {
      callback({ errorCode: 'camera_unavailable' });
    });

    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByTestId('camera-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      '相機無法使用',
      expect.stringContaining('請檢查相機權限'),
      expect.any(Array)
    );
  });

  it('應該正確處理用戶取消選擇圖片的情況', () => {
    const { launchCamera } = require('react-native-image-picker');
    
    // Mock 用戶取消的回應
    launchCamera.mockImplementation((options, callback) => {
      callback({ didCancel: true });
    });

    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByTestId('camera-button'));

    // 不應該顯示任何錯誤或開始辨識
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('重新拍照時應該清除之前的辨識結果', async () => {
    // 先設置有辨識結果的狀態
    const mockResult = {
      foods: [{ id: 'food-1', name: '白米飯' }],
      confidence: 0.85,
      processingTime: 2.3,
    };

    store.dispatch({
      type: 'nutrition/recognizeFood/fulfilled',
      payload: mockResult,
    });

    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    // 點擊重新拍照
    fireEvent.press(getByTestId('retake-button'));

    // 檢查辨識結果是否被清除
    const state = store.getState().nutrition;
    expect(state.recognitionResult).toBeNull();
  });

  it('應該正確處理食物選擇回調', () => {
    const mockFood = {
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

    const { getByTestId } = renderWithProvider(
      <PhotoScreen navigation={mockNavigation as any} />
    );

    // 模擬食物選擇
    const foodRecognitionResult = getByTestId('food-recognition-result');
    fireEvent(foodRecognitionResult, 'onFoodSelect', mockFood);

    // 檢查營養資訊模態框是否顯示
    expect(getByTestId('nutrition-info-modal')).toBeTruthy();
  });
});