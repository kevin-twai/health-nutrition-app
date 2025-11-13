/**
 * 亞洲料理知識庫數據導出
 * Asian Cuisine Knowledge Base Data Exports
 */

// 導出類型定義
export * from '../types/AsianCuisineKnowledgeBase';

// 導出食材數據
export {
  ASIAN_FOOD_ITEMS,
  getAllFoodItems,
  getFoodItemById,
  getFoodItemByName,
  getFoodItemsByCategory,
  getFoodItemsByCuisineType
} from './asianFoodItems';

// 導出料理模式數據
export {
  DISH_PATTERNS,
  getAllDishPatterns,
  getDishPatternByName,
  getDishPatternsByCookingMethod,
  getDishPatternsByCuisineType
} from './dishPatterns';

// 導出知識庫服務
export {
  AsianCuisineKnowledgeBase,
  asianCuisineKB
} from '../services/AsianCuisineKnowledgeBase';
