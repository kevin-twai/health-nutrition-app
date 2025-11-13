/**
 * 亞洲料理模式知識庫
 * Asian Dish Patterns Knowledge Base
 */

import {
  DishPattern,
  CookingMethod,
  CuisineType
} from '../types/AsianCuisineKnowledgeBase';

/**
 * 料理模式知識庫
 */
export const DISH_PATTERNS: Record<string, DishPattern> = {
  '涼拌菜': {
    name: '涼拌菜',
    commonIngredients: ['豆腐干絲', '芹菜', '胡蘿蔔', '黃瓜', '木耳', '海蜇皮'],
    commonSeasonings: ['麻油', '醬油', '醋', '糖', '蒜末', '辣椒油'],
    visualCharacteristics: [
      '食材切成絲狀或片狀',
      '顏色豐富多彩',
      '通常裝在盤子中',
      '表面可見油光（麻油）',
      '食材混合均勻',
      '常見多種顏色搭配'
    ],
    cookingMethod: CookingMethod.COLD_DRESSED,
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    servingStyle: '冷盤，通常作為開胃菜',
    typicalPortions: '一盤約150-250克',
    culturalContext: '中式宴席常見的冷盤，講究色香味俱全'
  },

  '台式熱炒': {
    name: '台式熱炒',
    commonIngredients: ['糯米椒', '豆乾', '肉絲', '蒜片', '辣椒', '九層塔', '空心菜'],
    commonSeasonings: ['醬油', '米酒', '蒜', '薑', '辣椒', '豆豉'],
    visualCharacteristics: [
      '食材呈炒製狀',
      '有鍋氣（略焦）',
      '油亮',
      '食材大小不一',
      '顏色較深',
      '常見蒜片和辣椒'
    ],
    cookingMethod: CookingMethod.STIR_FRY,
    cuisineTypes: [CuisineType.TAIWANESE],
    servingStyle: '熱食，通常配白飯',
    typicalPortions: '一盤約200-300克',
    culturalContext: '台灣夜市和熱炒店的特色，強調大火快炒的鍋氣'
  },

  '日式定食': {
    name: '日式定食',
    commonIngredients: ['白飯', '味噌湯', '主菜（魚或肉）', '醃漬物', '沙拉'],
    commonSeasonings: ['醬油', '味醂', '清酒', '味噌', '芝麻'],
    visualCharacteristics: [
      '擺盤精緻',
      '分隔明確',
      '顏色搭配和諧',
      '份量適中',
      '通常有多個小碟'
    ],
    cookingMethod: CookingMethod.STEAM,
    cuisineTypes: [CuisineType.JAPANESE],
    servingStyle: '套餐形式，多個小碟組合',
    typicalPortions: '一套約400-500克',
    culturalContext: '日本傳統套餐，講究營養均衡和視覺美感'
  },

  '中式湯品': {
    name: '中式湯品',
    commonIngredients: ['肉類', '蔬菜', '菇類', '豆腐', '粉絲'],
    commonSeasonings: ['鹽', '胡椒', '薑', '蔥', '香油'],
    visualCharacteristics: [
      '湯汁清澈或濃稠',
      '食材浮在湯中',
      '通常裝在碗中',
      '可見蔥花或香菜點綴',
      '湯色依食材而異'
    ],
    cookingMethod: CookingMethod.BOIL,
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    servingStyle: '熱湯，通常配主食',
    typicalPortions: '一碗約250-350毫升',
    culturalContext: '中式餐飲必備，講究湯鮮味美'
  },

  '韓式拌飯': {
    name: '韓式拌飯',
    commonIngredients: ['白飯', '牛肉', '蔬菜', '雞蛋', '泡菜', '豆芽'],
    commonSeasonings: ['辣椒醬', '麻油', '醬油', '蒜', '芝麻'],
    visualCharacteristics: [
      '食材分區擺放在飯上',
      '顏色豐富',
      '中間通常有蛋黃或煎蛋',
      '紅色辣椒醬明顯',
      '裝在石鍋或碗中'
    ],
    cookingMethod: CookingMethod.STIR_FRY,
    cuisineTypes: [CuisineType.KOREAN],
    servingStyle: '混合後食用',
    typicalPortions: '一碗約400-500克',
    culturalContext: '韓國代表性料理，講究食材多樣性和營養均衡'
  },

  '粵式點心': {
    name: '粵式點心',
    commonIngredients: ['蝦', '豬肉', '麵粉', '米粉', '蔬菜'],
    commonSeasonings: ['醬油', '蠔油', '薑', '蔥', '芝麻油'],
    visualCharacteristics: [
      '小巧精緻',
      '通常裝在蒸籠中',
      '半透明或白色外皮',
      '內餡豐富',
      '擺盤講究'
    ],
    cookingMethod: CookingMethod.STEAM,
    cuisineTypes: [CuisineType.CANTONESE],
    servingStyle: '小份多樣，通常配茶',
    typicalPortions: '一籠約3-4個',
    culturalContext: '廣東飲茶文化的核心，講究精緻和多樣性'
  }
};

/**
 * 獲取所有料理模式
 */
export function getAllDishPatterns(): DishPattern[] {
  return Object.values(DISH_PATTERNS);
}

/**
 * 根據名稱獲取料理模式
 */
export function getDishPatternByName(name: string): DishPattern | undefined {
  return DISH_PATTERNS[name];
}

/**
 * 根據烹飪方式獲取料理模式
 */
export function getDishPatternsByCookingMethod(method: CookingMethod): DishPattern[] {
  return Object.values(DISH_PATTERNS).filter(pattern => pattern.cookingMethod === method);
}

/**
 * 根據料理類型獲取料理模式
 */
export function getDishPatternsByCuisineType(cuisineType: CuisineType): DishPattern[] {
  return Object.values(DISH_PATTERNS).filter(
    pattern => pattern.cuisineTypes.includes(cuisineType)
  );
}
