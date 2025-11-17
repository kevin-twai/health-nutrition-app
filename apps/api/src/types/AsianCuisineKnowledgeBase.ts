/**
 * 亞洲料理知識庫類型定義
 * Asian Cuisine Knowledge Base Type Definitions
 */

// ==================== 枚舉類型 ====================

/**
 * 食材類別
 */
export enum FoodCategory {
  BEAN_PRODUCTS = '豆製品',
  VEGETABLES = '蔬菜',
  LEAFY_GREENS = '葉菜類',
  ROOT_VEGETABLES = '根莖類',
  MUSHROOMS = '菇類',
  PROTEINS = '蛋白質',
  SEAFOOD = '海鮮',
  GRAINS = '穀物',
  NOODLES = '麵食',
  RICE_PRODUCTS = '米製品',
  SAUCES = '醬汁',
  CONDIMENTS = '調味料',
  PICKLES = '醃漬物',
  MIXED_DISH = '混合菜餚',
  SOUP = '湯品',
  TAIWANESE_SPECIALTY = '台灣特色',
  INDIGENOUS_FOOD = '原住民食材',
  FRUITS = '水果',
  MEAT = '肉類',
  POULTRY = '禽類',
  EGGS = '蛋類',
  TOFU = '豆腐類',
  DRIED_GOODS = '乾貨',
  HERBS_SPICES = '香料香草',
  SEAWEED = '海藻類'
}

/**
 * 料理類型
 */
export enum CuisineType {
  CHINESE = '中式',
  TAIWANESE = '台式',
  JAPANESE = '日式',
  KOREAN = '韓式',
  THAI = '泰式',
  VIETNAMESE = '越式',
  CANTONESE = '粵菜',
  SICHUAN = '川菜',
  HAKKA = '客家菜',
  INDIGENOUS = '原住民料理',
  HOKKIEN = '閩南菜',
  SHANGHAINESE = '上海菜',
  HUNAN = '湘菜'
}

/**
 * 烹飪方式
 */
export enum CookingMethod {
  COLD_DRESSED = '涼拌',
  STIR_FRY = '快炒',
  DEEP_FRY = '油炸',
  STEAM = '清蒸',
  BOIL = '水煮',
  BRAISE = '紅燒',
  STEW = '燉',
  SIMMER = '滷',
  GRILL = '燒烤',
  BLANCH = '川燙',
  ROAST = '烘烤',
  SMOKE = '煙燻',
  RAW = '生食',
  PICKLE = '醃漬',
  FERMENT = '發酵'
}

// ==================== 介面定義 ====================

/**
 * 視覺特徵
 */
export interface VisualFeatures {
  color: string[];                      // 顏色
  shape: string[];                      // 形狀
  texture: string[];                    // 質地
  size: string;                         // 大小
  appearance: string;                   // 外觀描述
  surfaceCharacteristics: string[];     // 表面特徵
  crossSectionAppearance?: string;      // 切面外觀
  glossiness?: string;                  // 光澤度
  transparency?: string;                // 透明度
}

/**
 * 營養資訊（每100克）
 */
export interface NutritionInfo {
  calories: number;        // 卡路里
  protein: number;         // 蛋白質 (g)
  carbohydrates: number;   // 碳水化合物 (g)
  fat: number;            // 脂肪 (g)
  fiber: number;          // 纖維 (g)
  sugar?: number;         // 糖 (g)
  sodium: number;         // 鈉 (mg)
  calcium?: number;       // 鈣 (mg)
  iron?: number;          // 鐵 (mg)
  iodine?: number;        // 碘 (μg)
}

/**
 * 地方變體
 */
export interface RegionalVariant {
  region: string;          // 地區
  localName: string;       // 當地名稱
  differences: string[];   // 差異描述
}

/**
 * 成分資訊（用於成分識別系統）
 */
export interface ComponentInfo {
  category: string;                     // 成分類別（對應 ComponentCategory）
  isCommonComponent: boolean;           // 是否為常見成分
  typicalDishes: string[];              // 常見於哪些料理
  cookingMethods: string[];             // 常見烹飪方式（對應 ComponentCookingMethod）
  portionRanges: {                      // 份量範圍
    min: number;                        // 最小份量（克）
    max: number;                        // 最大份量（克）
    typical: number;                    // 典型份量（克）
  };
}

/**
 * 食材項目
 */
export interface FoodItem {
  id: string;                           // 唯一識別碼
  name: string;                         // 主要名稱
  nameVariants: string[];               // 別名（包含各地方言）
  category: FoodCategory;               // 類別
  subcategory?: string;                 // 子類別
  visualFeatures: VisualFeatures;       // 視覺特徵
  nutritionPer100g: NutritionInfo;      // 營養資訊
  commonConfusions: string[];           // 易混淆食材
  distinguishingFeatures: string[];     // 區分特徵
  cookingMethods: CookingMethod[];      // 常見烹飪方式
  cuisineTypes: CuisineType[];          // 料理類型
  regionalVariants?: RegionalVariant[]; // 地方變體
  commonPairings?: string[];            // 常見搭配
  seasonality?: string[];               // 季節性
  culturalNotes?: string;               // 文化註記
  tags?: string[];                      // 標籤
  componentInfo?: ComponentInfo;        // 成分資訊（用於成分識別）
}

/**
 * 料理模式
 */
export interface DishPattern {
  name: string;                         // 料理名稱
  commonIngredients: string[];          // 常見食材
  commonSeasonings: string[];           // 常見調味料
  visualCharacteristics: string[];      // 視覺特徵
  cookingMethod: CookingMethod;         // 烹飪方式
  cuisineTypes: CuisineType[];          // 料理類型
  servingStyle?: string;                // 上菜方式
  typicalPortions?: string;             // 典型份量
  culturalContext?: string;             // 文化背景
}

/**
 * 圖片特徵
 */
export interface ImageFeatures {
  dominantColors: string[];             // 主要顏色
  textureType: 'smooth' | 'rough' | 'mixed';  // 質地類型
  shapePatterns: string[];              // 形狀模式
  estimatedComplexity: number;          // 複雜度 (1-10)
  hasMultipleComponents: boolean;       // 是否有多個組成部分
  plateType?: 'bowl' | 'plate' | 'bamboo' | 'stone' | 'leaf' | 'other';  // 盤子類型
}

/**
 * 知識庫查詢選項
 */
export interface KnowledgeBaseQueryOptions {
  category?: FoodCategory;              // 類別篩選
  cuisineType?: CuisineType;            // 料理類型篩選
  cookingMethod?: CookingMethod;        // 烹飪方式篩選
  searchTerm?: string;                  // 搜尋關鍵字
  includeVariants?: boolean;            // 是否包含別名
  fuzzyMatch?: boolean;                 // 是否模糊匹配
}

/**
 * 匹配結果
 */
export interface MatchResult {
  foodItem: FoodItem;                   // 匹配的食材
  confidence: number;                   // 信心度 (0-1)
  matchedFeatures: string[];            // 匹配的特徵
  matchReason: string;                  // 匹配原因
}

/**
 * 相似度計算選項
 */
export interface SimilarityOptions {
  visualWeight: number;                 // 視覺特徵權重
  categoryWeight: number;               // 類別權重
  cuisineWeight: number;                // 料理類型權重
  threshold: number;                    // 最低相似度閾值
}
