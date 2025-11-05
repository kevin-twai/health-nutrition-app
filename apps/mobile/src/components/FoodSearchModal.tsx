import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { searchFoods, addManualFoodLog } from '../store/slices/nutritionSlice';
import { FoodItem, MealType } from '@health-tracker/shared-types';

interface FoodSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.nutrition);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState('1');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.LUNCH);

  // 搜尋食物
  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await dispatch(searchFoods(searchQuery) as any);
      if (result.payload) {
        setSearchResults(result.payload);
      }
    } catch (error) {
      console.error('搜尋失敗:', error);
    }
  }, [dispatch, searchQuery]);

  // 當搜尋查詢改變時自動搜尋
  useEffect(() => {
    const timeoutId = setTimeout(handleSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  // 選擇食物
  const handleSelectFood = useCallback((food: FoodItem) => {
    setSelectedFood(food);
  }, []);

  // 確認添加食物
  const handleAddFood = useCallback(async () => {
    if (!selectedFood) return;

    const portionNumber = parseFloat(portion) || 1;
    
    try {
      await dispatch(addManualFoodLog({
        userId: '', // 這會在 API 層自動填入
        foodId: selectedFood.id,
        portion: portionNumber,
        mealType: selectedMealType,
        timestamp: new Date(),
        source: 'manual_input' as any,
      }) as any);
      
      // 重置狀態並關閉模態框
      setSearchQuery('');
      setSearchResults([]);
      setSelectedFood(null);
      setPortion('1');
      onClose();
    } catch (error) {
      console.error('添加食物失敗:', error);
    }
  }, [dispatch, selectedFood, portion, selectedMealType, onClose]);

  // 返回搜尋結果
  const handleBackToSearch = useCallback(() => {
    setSelectedFood(null);
  }, []);

  // 渲染搜尋結果項目
  const renderSearchItem = useCallback(({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleSelectFood(item)}
    >
      <View style={styles.searchItemContent}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
        <View style={styles.nutritionPreview}>
          <Text style={styles.nutritionText}>
            {item.nutritionPer100g.calories} kcal/100g
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#bdc3c7" />
    </TouchableOpacity>
  ), [handleSelectFood]);

  // 餐點類型選項
  const mealTypeOptions = [
    { value: MealType.BREAKFAST, label: '早餐' },
    { value: MealType.LUNCH, label: '午餐' },
    { value: MealType.DINNER, label: '晚餐' },
    { value: MealType.SNACK, label: '點心' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 標題欄 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#7f8c8d" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {selectedFood ? '添加食物' : '搜尋食物'}
          </Text>
          {selectedFood && (
            <TouchableOpacity onPress={handleBackToSearch} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#3498db" />
            </TouchableOpacity>
          )}
        </View>

        {!selectedFood ? (
          // 搜尋介面
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#7f8c8d" />
              <TextInput
                style={styles.searchInput}
                placeholder="搜尋食物名稱..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="clear" size={20} color="#7f8c8d" />
                </TouchableOpacity>
              )}
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>搜尋中...</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={(item) => item.id}
                style={styles.searchResults}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  searchQuery.length >= 2 ? (
                    <View style={styles.emptyContainer}>
                      <Icon name="search-off" size={48} color="#bdc3c7" />
                      <Text style={styles.emptyText}>找不到相關食物</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Icon name="restaurant" size={48} color="#bdc3c7" />
                      <Text style={styles.emptyText}>輸入食物名稱開始搜尋</Text>
                    </View>
                  )
                }
              />
            )}
          </View>
        ) : (
          // 食物詳情和添加介面
          <View style={styles.addFoodContainer}>
            <View style={styles.foodDetails}>
              <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
              <Text style={styles.selectedFoodCategory}>{selectedFood.category}</Text>
              
              <View style={styles.nutritionInfo}>
                <Text style={styles.nutritionTitle}>營養成分 (每100g)</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>熱量</Text>
                    <Text style={styles.nutritionValue}>
                      {selectedFood.nutritionPer100g.calories} kcal
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>蛋白質</Text>
                    <Text style={styles.nutritionValue}>
                      {selectedFood.nutritionPer100g.protein}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>碳水</Text>
                    <Text style={styles.nutritionValue}>
                      {selectedFood.nutritionPer100g.carbohydrates}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>脂肪</Text>
                    <Text style={styles.nutritionValue}>
                      {selectedFood.nutritionPer100g.fat}g
                    </Text>
                  </View>
                </View>
              </View>

              {/* 份量設定 */}
              <View style={styles.portionSection}>
                <Text style={styles.sectionTitle}>份量</Text>
                <View style={styles.portionContainer}>
                  <TouchableOpacity
                    style={styles.portionButton}
                    onPress={() => setPortion(Math.max(0.1, parseFloat(portion) - 0.1).toFixed(1))}
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
                    onPress={() => setPortion((parseFloat(portion) + 0.1).toFixed(1))}
                  >
                    <Icon name="add" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 餐點類型選擇 */}
              <View style={styles.mealTypeSection}>
                <Text style={styles.sectionTitle}>餐點類型</Text>
                <View style={styles.mealTypeContainer}>
                  {mealTypeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.mealTypeButton,
                        selectedMealType === option.value && styles.mealTypeButtonActive
                      ]}
                      onPress={() => setSelectedMealType(option.value)}
                    >
                      <Text style={[
                        styles.mealTypeText,
                        selectedMealType === option.value && styles.mealTypeTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* 添加按鈕 */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
              <Icon name="add" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>添加到飲食記錄</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
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
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 10,
  },
  searchResults: {
    flex: 1,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  searchItemContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  nutritionPreview: {
    flexDirection: 'row',
  },
  nutritionText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 15,
  },
  addFoodContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodDetails: {
    flex: 1,
    paddingVertical: 20,
  },
  selectedFoodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedFoodCategory: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  nutritionInfo: {
    marginBottom: 30,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
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
    alignItems: 'center',
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
  portionSection: {
    marginBottom: 30,
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
  mealTypeSection: {
    marginBottom: 30,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealTypeButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  mealTypeButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  mealTypeTextActive: {
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default FoodSearchModal;