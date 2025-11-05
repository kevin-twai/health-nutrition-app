import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { DetectedFood, MealType } from '@health-tracker/shared-types';
import { confirmFood } from '../store/slices/nutritionSlice';

interface NutritionInfoModalProps {
  food: DetectedFood;
  onClose: () => void;
}

const NutritionInfoModal: React.FC<NutritionInfoModalProps> = ({
  food,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [portion, setPortion] = useState(food.estimatedPortion.toString());
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.LUNCH);

  const portionNumber = parseFloat(portion) || 0;

  // 計算營養素數值
  const calculateNutrition = useCallback((value: number) => {
    return Math.round(value * portionNumber);
  }, [portionNumber]);

  // 確認並記錄食物
  const handleConfirm = useCallback(() => {
    if (portionNumber <= 0) {
      Alert.alert('錯誤', '請輸入有效的份量');
      return;
    }

    dispatch(confirmFood({
      foodId: food.id,
      portion: portionNumber,
    }) as any);

    Alert.alert('成功', '食物已記錄到您的飲食日誌中', [
      { text: '確定', onPress: onClose }
    ]);
  }, [dispatch, food.id, portionNumber, onClose]);

  // 餐點類型選項
  const mealTypeOptions = [
    { value: MealType.BREAKFAST, label: '早餐', icon: 'wb-sunny' },
    { value: MealType.LUNCH, label: '午餐', icon: 'wb-cloudy' },
    { value: MealType.DINNER, label: '晚餐', icon: 'brightness-3' },
    { value: MealType.SNACK, label: '點心', icon: 'local-cafe' },
  ];

  return (
    <View style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#7f8c8d" />
        </TouchableOpacity>
        <Text style={styles.title}>營養資訊</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 食物名稱 */}
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{food.name}</Text>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceText}>
              辨識信心度: {Math.round(food.confidence * 100)}%
            </Text>
          </View>
        </View>

        {/* 份量調整 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>份量調整</Text>
          <View style={styles.portionContainer}>
            <TouchableOpacity
              style={styles.portionButton}
              onPress={() => setPortion(Math.max(0.1, portionNumber - 0.1).toFixed(1))}
            >
              <Icon name="remove" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TextInput
              style={styles.portionInput}
              value={portion}
              onChangeText={setPortion}
              keyboardType="numeric"
              textAlign="center"
            />
            <Text style={styles.portionUnit}>份</Text>
            <TouchableOpacity
              style={styles.portionButton}
              onPress={() => setPortion((portionNumber + 0.1).toFixed(1))}
            >
              <Icon name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 主要營養素 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主要營養素</Text>
          <View style={styles.macroContainer}>
            <View style={styles.macroItem}>
              <View style={[styles.macroIcon, { backgroundColor: '#e74c3c' }]}>
                <Icon name="local-fire-department" size={24} color="#ffffff" />
              </View>
              <Text style={styles.macroLabel}>熱量</Text>
              <Text style={styles.macroValue}>
                {calculateNutrition(food.nutrition.calories)} kcal
              </Text>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroIcon, { backgroundColor: '#3498db' }]}>
                <Text style={styles.macroIconText}>P</Text>
              </View>
              <Text style={styles.macroLabel}>蛋白質</Text>
              <Text style={styles.macroValue}>
                {calculateNutrition(food.nutrition.protein)}g
              </Text>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroIcon, { backgroundColor: '#f39c12' }]}>
                <Text style={styles.macroIconText}>C</Text>
              </View>
              <Text style={styles.macroLabel}>碳水化合物</Text>
              <Text style={styles.macroValue}>
                {calculateNutrition(food.nutrition.carbohydrates)}g
              </Text>
            </View>

            <View style={styles.macroItem}>
              <View style={[styles.macroIcon, { backgroundColor: '#9b59b6' }]}>
                <Text style={styles.macroIconText}>F</Text>
              </View>
              <Text style={styles.macroLabel}>脂肪</Text>
              <Text style={styles.macroValue}>
                {calculateNutrition(food.nutrition.fat)}g
              </Text>
            </View>
          </View>
        </View>

        {/* 其他營養素 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他營養素</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>膳食纖維</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.fiber)}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>糖分</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.sugar)}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>鈉</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.sodium)}mg
              </Text>
            </View>
          </View>
        </View>

        {/* 維生素 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>維生素</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>維生素A</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.vitamins.vitaminA)}μg
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>維生素C</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.vitamins.vitaminC)}mg
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>維生素D</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.vitamins.vitaminD)}μg
              </Text>
            </View>
          </View>
        </View>

        {/* 礦物質 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>礦物質</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>鈣</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.minerals.calcium)}mg
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>鐵</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.minerals.iron)}mg
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>鉀</Text>
              <Text style={styles.nutritionValue}>
                {calculateNutrition(food.nutrition.minerals.potassium)}mg
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部按鈕 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Icon name="check" size={20} color="#ffffff" />
          <Text style={styles.confirmButtonText}>確認記錄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  confidenceContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  confidenceText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  portionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portionButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portionInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 15,
    minWidth: 80,
  },
  portionUnit: {
    fontSize: 16,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  macroIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  macroLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default NutritionInfoModal;