/**
 * 亞洲料理成分識別系統 - 核心類型定義
 * 
 * 此文件定義了成分識別系統所需的所有核心類型、枚舉和接口
 */

/**
 * 料理類型枚舉
 */
export enum DishType {
  SOUP = 'soup',                    // 湯品類
  FRIED_RICE = 'fried_rice',        // 炒飯類
  STIR_FRY = 'stir_fry',            // 炒菜類
  BENTO = 'bento',                  // 便當類
  NOODLES = 'noodles',              // 麵食類
  DUMPLING = 'dumpling',            // 點心類（餃子、小籠包等）
  BARBECUE = 'barbecue',            // 燒烤類
  HOT_POT = 'hot_pot',              // 火鍋類
  UNKNOWN = 'unknown'               // 未知類型
}

/**
 * 烹飪方式枚舉
 */
export enum CookingMethod {
  RAW = 'raw',                      // 生食
  BOILED = 'boiled',                // 煮
  FRIED = 'fried',                  // 炒
  DEEP_FRIED = 'deep_fried',        // 炸
  STEAMED = 'steamed',              // 蒸
  GRILLED = 'grilled',              // 烤
  BRAISED = 'braised',              // 滷/燉
  STIR_FRIED = 'stir_fried',        // 快炒
  PICKLED = 'pickled'               // 醃製
}

/**
 * 成分類別枚舉
 */
export enum ComponentCategory {
  GRAIN = 'grain',                  // 主食類（米飯、麵條等）
  PROTEIN = 'protein',              // 蛋白質類（肉、蛋、豆腐等）
  VEGETABLE = 'vegetable',          // 蔬菜類
  SEASONING = 'seasoning',          // 調味料
  SAUCE = 'sauce',                  // 醬料
  GARNISH = 'garnish'               // 配菜/裝飾
}

/**
 * 營養數據接口
 */
export interface NutritionData {
  calories: number;                 // 卡路里 (kcal)
  protein: number;                  // 蛋白質 (g)
  carbohydrates: number;            // 碳水化合物 (g)
  fat: number;                      // 脂肪 (g)
  fiber?: number;                   // 纖維 (g)
  sodium?: number;                  // 鈉 (mg)
  sugar?: number;                   // 糖 (g)
}

/**
 * 視覺特徵接口
 */
export interface VisualFeatures {
  color: string[];                  // 顏色描述
  shape: string;                    // 形狀描述
  texture: string;                  // 質地描述
  position: string;                 // 在料理中的位置
}

/**
 * 檢測到的成分接口
 */
export interface DetectedComponent {
  id: string;                       // 成分唯一識別碼
  name: string;                     // 成分中文名稱
  nameEn?: string;                  // 成分英文名稱
  confidence: number;               // 信心度 (0-1)
  estimatedPortion: number;         // 估計份量（克）
  cookingMethod?: CookingMethod;    // 烹飪方式
  category?: ComponentCategory;     // 成分類別
  visualFeatures?: VisualFeatures;  // 視覺特徵
  nutritionPer100g?: NutritionData; // 每100克的營養數據
  actualNutrition?: NutritionData;  // 根據份量計算的實際營養數據
}

/**
 * 主料理資訊接口
 */
export interface MainDishInfo {
  name: string;                     // 料理名稱
  type: DishType;                   // 料理類型
  confidence: number;               // 識別信心度
  estimatedTotalPortion: number;    // 估計總份量（克）
}

/**
 * 成分營養資訊接口
 */
export interface ComponentNutrition {
  component: DetectedComponent;     // 成分資訊
  rawNutrition: NutritionData;      // 原始營養數據
  cookedNutrition: NutritionData;   // 烹飪後營養數據
  portionNutrition: NutritionData;  // 根據份量的營養數據
  percentageOfTotal: {              // 佔總營養的百分比
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * 類別營養資訊接口
 */
export interface CategoryNutrition {
  category: ComponentCategory;      // 成分類別
  totalNutrition: NutritionData;    // 該類別的總營養
  components: string[];             // 該類別包含的成分名稱列表
  percentageOfDish: number;         // 佔整道料理的百分比
}

/**
 * 烹飪影響資訊接口
 */
export interface CookingImpact {
  method: CookingMethod;            // 烹飪方式
  caloriesAdded: number;            // 增加的卡路里
  fatAdded: number;                 // 增加的脂肪
  notes: string;                    // 說明
}

/**
 * 營養摘要接口
 */
export interface NutritionSummary {
  total: NutritionData;             // 總營養數據
  byComponent: ComponentNutrition[]; // 按成分分類的營養
  byCategory: CategoryNutrition[];  // 按類別分類的營養
  cookingImpact: CookingImpact[];   // 烹飪方式的影響
}

/**
 * 檢測元數據接口
 */
export interface DetectionMetadata {
  processingTime: number;           // 處理時間（毫秒）
  confidenceScore: number;          // 整體信心度分數
  detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid'; // 檢測方法
  componentsDetected: number;       // 檢測到的成分數量
  componentsFromKB: number;         // 來自知識庫的成分數量
  componentsFromVision: number;     // 來自 Vision API 的成分數量
  warnings?: string[];              // 警告訊息（可選）
}

/**
 * 份量調整建議接口
 */
export interface PortionAdjustment {
  component: string;                // 成分名稱
  suggestedPortion: number;         // 建議份量
  reason: string;                   // 調整原因
}

/**
 * 替代解釋接口
 */
export interface AlternativeInterpretation {
  dishName: string;                 // 替代料理名稱
  components: DetectedComponent[];  // 替代成分列表
  confidence: number;               // 信心度
}

/**
 * 用戶建議接口
 */
export interface UserSuggestions {
  possibleMissingComponents: string[];           // 可能缺失的成分
  portionAdjustments: PortionAdjustment[];       // 份量調整建議
  alternativeInterpretations: AlternativeInterpretation[]; // 替代解釋
}

/**
 * 成分檢測結果接口
 */
export interface ComponentDetectionResult {
  mainDish: MainDishInfo;           // 主料理資訊
  components: DetectedComponent[];  // 檢測到的成分列表
  nutritionSummary: NutritionSummary; // 營養摘要
  metadata: DetectionMetadata;      // 檢測元數據
  suggestions: UserSuggestions;     // 用戶建議
}

/**
 * 烹飪營養影響接口
 */
export interface CookingNutritionImpact {
  method: CookingMethod;            // 烹飪方式
  calorieMultiplier: number;        // 卡路里倍數
  fatMultiplier: number;            // 脂肪倍數
  proteinRetention: number;         // 蛋白質保留率
  vitaminRetention: number;         // 維生素保留率
  notes: string;                    // 說明
}

/**
 * 成分資訊接口（用於知識庫）
 */
export interface ComponentInfo {
  name: string;                     // 成分名稱
  nameEn?: string;                  // 英文名稱
  category: ComponentCategory;      // 成分類別
  typicalPortion: number;           // 典型份量（克）
  portionRange: {                   // 份量範圍
    min: number;
    max: number;
  };
  frequency: number;                // 出現頻率 (0-1)
  alternatives: string[];           // 替代成分
  cookingMethods: CookingMethod[];  // 常見烹飪方式
  nutritionImpact: CookingNutritionImpact[]; // 烹飪對營養的影響
}

/**
 * 地域變化接口
 */
export interface RegionalVariation {
  region: string;                   // 地區名稱
  components: ComponentInfo[];      // 該地區特有的成分
  culturalNotes: string;            // 文化說明
}

/**
 * 料理-成分映射接口
 */
export interface DishComponentMap {
  dishName: string;                 // 料理名稱
  dishNameEn?: string;              // 料理英文名稱
  dishType: DishType;               // 料理類型
  region: string[];                 // 地區（如 'taiwan', 'japan', 'china'）
  commonComponents: ComponentInfo[]; // 常見成分列表
  regionalVariations: RegionalVariation[]; // 地域變化
  typicalPortionRange: {            // 典型份量範圍
    min: number;
    max: number;
    typical: number;
  };
}

/**
 * 成分識別 API 回應接口
 */
export interface ComponentRecognitionResponse {
  success: boolean;                 // 是否成功
  data?: {
    mainDish: MainDishInfo;         // 主料理資訊
    components: DetectedComponent[]; // 成分列表
    nutritionSummary: {             // 營養摘要
      total: NutritionData;
      byComponent: ComponentNutrition[];
      byCategory: CategoryNutrition[];
      cookingImpact: string;
    };
    metadata: DetectionMetadata;    // 元數據
    suggestions: UserSuggestions;   // 建議
  };
  error?: string;                   // 錯誤訊息
}

/**
 * 驗證結果接口
 */
export interface ValidationResult {
  isValid: boolean;                 // 是否有效
  warnings: string[];               // 警告訊息
  errors: string[];                 // 錯誤訊息
  suggestions: string[];            // 建議
}

/**
 * 豐富化成分接口（包含額外資訊）
 */
export interface EnrichedComponent extends DetectedComponent {
  knowledgeBaseMatch?: boolean;     // 是否匹配知識庫
  similarComponents?: string[];     // 相似成分
  culturalContext?: string;         // 文化背景
  healthBenefits?: string[];        // 健康益處
}
