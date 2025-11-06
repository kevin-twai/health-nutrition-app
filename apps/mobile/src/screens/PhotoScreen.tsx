import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { recognizeFood, clearRecognitionResult } from '../store/slices/nutritionSlice';
import FoodRecognitionResult from '../components/FoodRecognitionResult';
import NutritionInfoModal from '../components/NutritionInfoModal';
import FoodSearchModal from '../components/FoodSearchModal';
import { DetectedFood } from '@health-tracker/shared-types';

const PhotoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { recognitionResult, isRecognizing, error } = useSelector((state: RootState) => state.nutrition);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<DetectedFood | null>(null);

  // 請求相機權限
  const requestCameraPermission = useCallback(async () => {
    try {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('權限請求失敗:', error);
      return false;
    }
  }, []);

  // 拍照
  const takePhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('權限不足', '需要相機權限才能拍照');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handleImageResponse
    );
  }, []);

  // 從相簿選擇
  const selectFromLibrary = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handleImageResponse
    );
  }, []);

  // 處理圖片選擇回應
  const handleImageResponse = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    const asset = response.assets?.[0];
    if (asset?.uri) {
      setSelectedImage(asset.uri);
      // 清除之前的辨識結果
      dispatch(clearRecognitionResult());
      // 開始辨識
      dispatch(recognizeFood(asset.uri) as any);
    }
  }, [dispatch]);

  // 重新拍照
  const retakePhoto = useCallback(() => {
    setSelectedImage(null);
    dispatch(clearRecognitionResult());
  }, [dispatch]);

  // 顯示營養資訊
  const showNutritionInfo = useCallback((food: DetectedFood) => {
    setSelectedFood(food);
    setShowNutritionModal(true);
  }, []);

  // 關閉營養資訊模態框
  const closeNutritionModal = useCallback(() => {
    setShowNutritionModal(false);
    setSelectedFood(null);
  }, []);

  // 開啟搜尋模態框
  const openSearchModal = useCallback(() => {
    setShowSearchModal(true);
  }, []);

  // 關閉搜尋模態框
  const closeSearchModal = useCallback(() => {
    setShowSearchModal(false);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 標題區域 */}
      <View style={styles.header}>
        <Text style={styles.title}>拍照辨識餐點</Text>
        <Text style={styles.subtitle}>拍攝或選擇食物照片，自動分析營養成分</Text>
      </View>

      {/* 圖片顯示區域 */}
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <TouchableOpacity 
            style={styles.retakeButton} 
            onPress={retakePhoto}
            testID="retake-button"
          >
            <Icon name="refresh" size={24} color="#ffffff" />
            <Text style={styles.retakeButtonText}>重新拍照</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Icon name="camera-alt" size={80} color="#bdc3c7" />
          <Text style={styles.placeholderText}>選擇或拍攝食物照片</Text>
        </View>
      )}

      {/* 操作按鈕 */}
      {!selectedImage && (
        <>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={takePhoto}
              testID="camera-button"
            >
              <Icon name="camera-alt" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>拍照</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.libraryButton} 
              onPress={selectFromLibrary}
              testID="gallery-button"
            >
              <Icon name="photo-library" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>從相簿選擇</Text>
            </TouchableOpacity>
          </View>

          {/* 手動搜尋按鈕 */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>或</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={openSearchModal}
            testID="search-button"
          >
            <Icon name="search" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>手動搜尋食物</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 手動分析按鈕 */}
      {selectedImage && !isRecognizing && !recognitionResult && (
        <View style={styles.analyzeContainer}>
          <TouchableOpacity 
            style={styles.analyzeButton} 
            onPress={() => dispatch(recognizeFood(selectedImage) as any)}
            testID="analyze-button"
          >
            <Icon name="search" size={24} color="#ffffff" />
            <Text style={styles.analyzeButtonText}>開始分析</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 載入指示器 */}
      {isRecognizing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>
            {selectedImage ? '正在分析食物...' : '正在辨識食物...'}
          </Text>
        </View>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={24} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 辨識結果 */}
      {recognitionResult && !isRecognizing && (
        <FoodRecognitionResult
          result={recognitionResult}
          onFoodSelect={showNutritionInfo}
        />
      )}

      {/* 營養資訊模態框 */}
      <Modal
        visible={showNutritionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeNutritionModal}
      >
        {selectedFood && (
          <NutritionInfoModal
            food={selectedFood}
            onClose={closeNutritionModal}
          />
        )}
      </Modal>

      {/* 食物搜尋模態框 */}
      <FoodSearchModal
        visible={showSearchModal}
        onClose={closeSearchModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#95a5a6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  placeholderText: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cameraButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  libraryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9b59b6',
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 15,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f2',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ecf0f1',
  },
  dividerText: {
    fontSize: 14,
    color: '#bdc3c7',
    marginHorizontal: 15,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  analyzeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 150,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PhotoScreen;