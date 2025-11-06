import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { RecognitionResult, DetectedFood, MealType } from '@health-tracker/shared-types';
import { confirmFood } from '../store/slices/nutritionSlice';

interface FoodRecognitionResultProps {
  result: RecognitionResult;
  onFoodSelect: (food: DetectedFood) => void;
}

const FoodRecognitionResult: React.FC<FoodRecognitionResultProps> = ({
  result,
  onFoodSelect,
}) => {
  const dispatch = useDispatch();

  // 確認食物並記錄
  const handleConfirmFood = useCallback((food: DetectedFood) => {
    Alert.alert(
      '確認食物',
      `確定要記錄 ${food.name} (${food.estimatedPortion}份) 嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認',
          onPress: () => {
            dispatch(confirmFood({
              foodId: food.id,
              portion: food.estimatedPortion,
            }) as any);
          },
        },
      ]
    );
  }, [dispatch]);

  // 渲染食物項目
  const renderFoodItem = useCallback(({ item }: { item: DetectedFood }) => (
    <View style={styles.foodItem}>
      <View style={styles.foodHeader}>
        <Text style={styles.foodName}>{item.name}</Text>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceText}>
            信心度: {Math.round(item.confidence * 100)}%
          </Text>
          <View style={[
            styles.confidenceBar,
            { backgroundColor: getConfidenceColor(item.confidence) }
          ]}>
            <View
              style={[
                styles.confidenceProgress,
                { width: `${item.confidence * 100}%` }
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.nutritionPreview}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>熱量</Text>
          <Text style={styles.nutritionValue}>
            {Math.round(item.nutrition.calories * item.estimatedPortion)} kcal
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>蛋白質</Text>
          <Text style={styles.nutritionValue}>
            {Math.round(item.nutrition.protein * item.estimatedPortion)}g
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>碳水</Text>
          <Text style={styles.nutritionValue}>
            {Math.round(item.nutrition.carbohydrates * item.estimatedPortion)}g
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>脂肪</Text>
          <Text style={styles.nutritionValue}>
            {Math.round(item.nutrition.fat * item.estimatedPortion)}g
          </Text>
        </View>
      </View>

      <Text style={styles.portionText}>
        預估份量: {item.estimatedPortion} 份
      </Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => onFoodSelect(item)}
        >
          <Icon name="info" size={20} color="#3498db" />
          <Text style={styles.detailButtonText}>詳細資訊</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => handleConfirmFood(item)}
        >
          <Icon name="check" size={20} color="#ffffff" />
          <Text style={styles.confirmButtonText}>確認記錄</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [onFoodSelect, handleConfirmFood]);

  // 獲取信心度顏色
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#27ae60';
    if (confidence >= 0.6) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <View style={styles.container} testID="food-recognition-result">
      <View style={styles.header}>
        <Text style={styles.title}>辨識結果</Text>
        <Text style={styles.subtitle}>
          處理時間: {result.processingTime.toFixed(1)}秒
          {(result as any).isLocalRecognition && ' (本地辨識)'}
        </Text>
        {(result as any).isLocalRecognition && (
          <Text style={styles.localRecognitionNote}>
            💡 使用本地辨識，結果可能不如雲端辨識準確
          </Text>
        )}
      </View>

      {result.foods.length === 0 ? (
        <View style={styles.noResultContainer}>
          <Icon name="search-off" size={48} color="#bdc3c7" />
          <Text style={styles.noResultText}>未能辨識出食物</Text>
          <Text style={styles.noResultSubtext}>
            請嘗試重新拍攝更清晰的照片
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            找到 {result.foods.length} 種食物
          </Text>
          <FlatList
            data={result.foods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  resultCount: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 15,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 10,
  },
  foodItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  foodHeader: {
    marginBottom: 15,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 10,
    minWidth: 70,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceProgress: {
    height: '100%',
    backgroundColor: '#27ae60',
  },
  nutritionPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
  },
  portionText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    marginRight: 8,
  },
  detailButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  noResultContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noResultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 15,
    marginBottom: 5,
  },
  noResultSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  localRecognitionNote: {
    fontSize: 12,
    color: '#f39c12',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default FoodRecognitionResult;