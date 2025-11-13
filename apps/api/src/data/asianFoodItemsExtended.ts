/**
 * 亞洲料理食材知識庫擴展數據（續）
 * Extended Asian Cuisine Food Items Data
 */

import {
  FoodItem,
  FoodCategory,
  CuisineType,
  CookingMethod
} from '../types/AsianCuisineKnowledgeBase';

/**
 * 擴展的亞洲食材數據
 */
export const ASIAN_FOOD_ITEMS_EXTENDED: Record<string, FoodItem> = {
  // ==================== 葉菜類 ====================
  '空心菜': {
    id: 'water_spinach',
    name: '空心菜',
    nameVariants: ['蕹菜', '通菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['深綠色', '綠色'],
      shape: ['長條狀', '中空莖'],
      texture: ['脆嫩', '多汁'],
      size: '長20-30cm',
      appearance: '莖部中空，葉子呈箭頭狀',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 19,
      protein: 2.6,
      carbohydrates: 2.2,
      fat: 0.2,
      fiber: 2.2,
      sodium: 113,
      calcium: 115,
      iron: 2.5
    },
    commonConfusions: ['菠菜', '青江菜'],
    distinguishingFeatures: ['莖部中空', '常用大火快炒', '有獨特香味'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.THAI],
    commonPairings: ['蒜', '豆腐乳', '辣椒', '蝦醬'],
    tags: ['台式熱炒', '高鐵']
  },

  '青江菜': {
    id: 'bok_choy',
    name: '青江菜',
    nameVariants: ['小白菜', '青梗白菜', '湯匙菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['深綠色葉', '白色莖'],
      shape: ['湯匙狀', '扇形'],
      texture: ['脆嫩', '多汁'],
      size: '長15-20cm',
      appearance: '白色莖部粗壯，綠色葉片呈湯匙狀',
      surfaceCharacteristics: ['表面光滑', '莖部有光澤'],
      glossiness: '莖部有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 13,
      protein: 1.5,
      carbohydrates: 2.2,
      fat: 0.2,
      fiber: 1.0,
      sodium: 65,
      calcium: 105,
      iron: 0.8
    },
    commonConfusions: ['小白菜', '油菜'],
    distinguishingFeatures: ['白色莖部粗壯', '葉片呈湯匙狀', '口感清甜'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH, CookingMethod.STEAM],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.CANTONESE],
    commonPairings: ['蒜', '薑', '蠔油', '香菇'],
    tags: ['清炒', '湯品', '低卡']
  },

  '芥蘭': {
    id: 'chinese_broccoli',
    name: '芥蘭',
    nameVariants: ['芥藍', '芥蘭菜', '蓋菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['深綠色', '藍綠色'],
      shape: ['長條狀', '粗莖'],
      texture: ['脆嫩', '略帶苦味'],
      size: '長25-35cm',
      appearance: '粗壯的莖部，葉片較厚實，有時帶小花苞',
      surfaceCharacteristics: ['表面光滑', '有白色粉霜'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 22,
      protein: 2.0,
      carbohydrates: 4.0,
      fat: 0.3,
      fiber: 2.0,
      sodium: 18,
      calcium: 150,
      iron: 1.2
    },
    commonConfusions: ['青花菜', '油菜'],
    distinguishingFeatures: ['莖部粗壯', '略帶苦味', '常見白色小花'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.CANTONESE],
    commonPairings: ['蠔油', '蒜', '薑', '牛肉'],
    tags: ['粵菜', '高鈣', '蠔油芥蘭']
  },

  '韭菜': {
    id: 'chinese_chives',
    name: '韭菜',
    nameVariants: ['韭', '起陽草'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['深綠色'],
      shape: ['細長扁平'],
      texture: ['柔軟', '纖維質'],
      size: '長30-40cm',
      appearance: '細長扁平的葉片，有強烈香味',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 26,
      protein: 2.4,
      carbohydrates: 4.6,
      fat: 0.5,
      fiber: 1.8,
      sodium: 5,
      calcium: 42,
      iron: 1.6
    },
    commonConfusions: ['韭黃', '蒜苗'],
    distinguishingFeatures: ['強烈特殊香味', '扁平葉片', '常用於餃子餡'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.KOREAN],
    commonPairings: ['雞蛋', '豬肉', '豆芽', '蝦'],
    tags: ['餃子餡', '韭菜盒子', '溫補']
  },

  '韭黃': {
    id: 'yellow_chives',
    name: '韭黃',
    nameVariants: ['韭芽', '黃韭'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['淡黃色', '乳白色'],
      shape: ['細長扁平'],
      texture: ['柔嫩', '細緻'],
      size: '長20-30cm',
      appearance: '淡黃色細長葉片，比韭菜更嫩',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '半透明'
    },
    nutritionPer100g: {
      calories: 24,
      protein: 2.0,
      carbohydrates: 4.2,
      fat: 0.4,
      fiber: 1.5,
      sodium: 4,
      calcium: 35,
      iron: 1.2
    },
    commonConfusions: ['韭菜', '豆芽'],
    distinguishingFeatures: ['淡黃色', '味道較韭菜溫和', '質地更嫩'],
    cookingMethods: [CookingMethod.STIR_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['雞蛋', '豬肉絲', '蝦仁'],
    tags: ['高級食材', '韭黃炒蛋']
  },

  '菠菜': {
    id: 'spinach',
    name: '菠菜',
    nameVariants: ['波斯菜', '赤根菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['深綠色'],
      shape: ['橢圓形葉片'],
      texture: ['柔軟', '多汁'],
      size: '長15-25cm',
      appearance: '深綠色橢圓葉片，紅色根部',
      surfaceCharacteristics: ['表面光滑或略皺'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 23,
      protein: 2.9,
      carbohydrates: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sodium: 79,
      calcium: 99,
      iron: 2.7
    },
    commonConfusions: ['空心菜', '莧菜'],
    distinguishingFeatures: ['紅色根部', '高鐵質', '略帶澀味'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH, CookingMethod.STEAM],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.JAPANESE],
    commonPairings: ['蒜', '芝麻', '豆腐', '雞蛋'],
    tags: ['高鐵', '補血', '涼拌']
  },

  '莧菜': {
    id: 'amaranth',
    name: '莧菜',
    nameVariants: ['紅莧菜', '青莧菜', '莧'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['紅色', '綠色', '紅綠混合'],
      shape: ['橢圓形葉片'],
      texture: ['柔軟', '滑嫩'],
      size: '長10-20cm',
      appearance: '葉片有紅色或綠色，煮後會出紅色湯汁',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 23,
      protein: 2.5,
      carbohydrates: 4.0,
      fat: 0.3,
      fiber: 2.0,
      sodium: 20,
      calcium: 180,
      iron: 3.0
    },
    commonConfusions: ['菠菜', '紅鳳菜'],
    distinguishingFeatures: ['煮後出紅色湯汁', '口感滑嫩', '高鈣'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['蒜', '薑', '皮蛋', '鹹蛋'],
    tags: ['高鈣', '補血', '夏季蔬菜']
  },

  '地瓜葉': {
    id: 'sweet_potato_leaves',
    name: '地瓜葉',
    nameVariants: ['番薯葉', '過溝菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['綠色', '紫綠色'],
      shape: ['心形葉片'],
      texture: ['柔嫩', '略帶黏性'],
      size: '葉片直徑8-15cm',
      appearance: '心形葉片，莖部細長',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 30,
      protein: 3.0,
      carbohydrates: 5.4,
      fat: 0.3,
      fiber: 3.3,
      sodium: 6,
      calcium: 105,
      iron: 1.5
    },
    commonConfusions: ['龍鬚菜', '川七'],
    distinguishingFeatures: ['心形葉片', '莖部細長', '台灣常見'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.TAIWANESE, CuisineType.CHINESE],
    commonPairings: ['蒜', '薑', '麻油', '枸杞'],
    tags: ['台灣家常菜', '高纖', '平價']
  },

  '高麗菜': {
    id: 'cabbage',
    name: '高麗菜',
    nameVariants: ['包心菜', '甘藍', '捲心菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['淡綠色', '白綠色'],
      shape: ['圓球形', '層層包裹'],
      texture: ['脆嫩', '多汁'],
      size: '直徑15-25cm',
      appearance: '圓球形，葉片層層包裹',
      surfaceCharacteristics: ['表面光滑', '有葉脈紋路'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 25,
      protein: 1.3,
      carbohydrates: 5.8,
      fat: 0.1,
      fiber: 2.5,
      sodium: 18,
      calcium: 40,
      iron: 0.5
    },
    commonConfusions: ['大白菜', '紫高麗菜'],
    distinguishingFeatures: ['圓球形', '層層包裹', '清甜口感'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.STEAM, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['豬肉', '蒜', '辣椒', '醋'],
    tags: ['家常菜', '高纖', '平價']
  },

  '大白菜': {
    id: 'napa_cabbage',
    name: '大白菜',
    nameVariants: ['白菜', '黃芽白', '結球白菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['淡黃綠色', '白色'],
      shape: ['長橢圓形', '層層包裹'],
      texture: ['脆嫩', '多汁'],
      size: '長30-50cm',
      appearance: '長橢圓形，葉片層層包裹，內部淡黃色',
      surfaceCharacteristics: ['表面光滑', '有明顯葉脈'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 16,
      protein: 1.5,
      carbohydrates: 3.2,
      fat: 0.2,
      fiber: 1.2,
      sodium: 57,
      calcium: 105,
      iron: 0.6
    },
    commonConfusions: ['高麗菜', '娃娃菜'],
    distinguishingFeatures: ['長橢圓形', '內部淡黃色', '常用於火鍋'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BRAISE, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.KOREAN],
    commonPairings: ['豬肉', '豆腐', '粉絲', '香菇'],
    tags: ['火鍋', '白菜滷', '冬季蔬菜']
  }
};
