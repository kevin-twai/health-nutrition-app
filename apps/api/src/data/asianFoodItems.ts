/**
 * 亞洲料理食材知識庫數據
 * Asian Cuisine Food Items Knowledge Base Data
 */

import {
  FoodItem,
  FoodCategory,
  CuisineType,
  CookingMethod
} from '../types/AsianCuisineKnowledgeBase';

/**
 * 亞洲食材知識庫
 * 包含至少50種常見亞洲食材的詳細資訊
 */
export const ASIAN_FOOD_ITEMS: Record<string, FoodItem> = {
  // ==================== 豆製品類 ====================
  '豆腐干絲': {
    id: 'tofu_strips',
    name: '豆腐干絲',
    nameVariants: ['干絲', '豆干絲', '豆腐絲', '乾絲'],
    category: FoodCategory.BEAN_PRODUCTS,
    visualFeatures: {
      color: ['淡黃色', '米白色', '淺棕色'],
      shape: ['細長條狀', '絲狀'],
      texture: ['有韌性', '略粗糙', '不透明', '有嚼勁'],
      size: '長約5-8cm，寬約2-3mm，厚約1-2mm',
      appearance: '成束狀排列，表面略乾燥，有豆製品特有的質感',
      surfaceCharacteristics: ['表面有細微紋理', '不光滑', '略帶粗糙感'],
      glossiness: '無光澤或微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 140,
      protein: 16.5,
      carbohydrates: 4.8,
      fat: 6.2,
      fiber: 1.2,
      sodium: 450,
      calcium: 350,
      iron: 3.5
    },
    commonConfusions: ['麵條', '米粉', '粉絲', '金針菇'],
    distinguishingFeatures: [
      '比麵條更粗且更有韌性',
      '顏色偏黃白色，不像麵條那麼白',
      '表面有豆製品特有的紋理和質感',
      '不會像麵條那樣光滑有光澤',
      '通常與芹菜、胡蘿蔔絲等涼拌',
      '切面呈方形或長方形，不是圓形'
    ],
    cookingMethods: [CookingMethod.COLD_DRESSED, CookingMethod.STIR_FRY, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['芹菜絲', '胡蘿蔔絲', '香菜', '麻油', '醬油'],
    tags: ['涼拌菜常用', '易混淆']
  },

  '豆腐': {
    id: 'tofu',
    name: '豆腐',
    nameVariants: ['嫩豆腐', '板豆腐', '凍豆腐', '豆腐塊', '火鍋豆腐'],
    category: FoodCategory.TOFU,
    visualFeatures: {
      color: ['白色', '米白色'],
      shape: ['方塊狀', '長方形'],
      texture: ['柔軟', '細緻', '光滑'],
      size: '通常為10x10cm或更大的方塊',
      appearance: '表面光滑，質地細緻',
      surfaceCharacteristics: ['表面光滑', '可能有水分'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 76,
      protein: 8.1,
      carbohydrates: 1.9,
      fat: 4.8,
      fiber: 0.3,
      sodium: 7,
      calcium: 350,
      iron: 5.4
    },
    commonConfusions: ['豆花', '豆漿'],
    distinguishingFeatures: [
      '成型的方塊狀',
      '質地細緻柔軟',
      '可以切片或切塊',
      '有豆香味'
    ],
    cookingMethods: [CookingMethod.STEAM, CookingMethod.STIR_FRY, CookingMethod.DEEP_FRY, CookingMethod.BRAISE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['醬油', '蔥', '薑', '蒜'],
    tags: ['高蛋白', '素食']
  },

  '豆乾': {
    id: 'dried_tofu',
    name: '豆乾',
    nameVariants: ['豆干', '五香豆乾', '滷豆乾'],
    category: FoodCategory.BEAN_PRODUCTS,
    visualFeatures: {
      color: ['深褐色', '棕色', '淺褐色'],
      shape: ['方塊狀', '長方形'],
      texture: ['緊實', '有嚼勁', '略乾'],
      size: '約5x5cm或更大',
      appearance: '表面可能有滷汁痕跡，質地緊實',
      surfaceCharacteristics: ['表面略乾', '可能有紋路'],
      glossiness: '微光澤（如有滷汁）',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 190,
      protein: 18.5,
      carbohydrates: 6.2,
      fat: 10.5,
      fiber: 1.5,
      sodium: 680,
      calcium: 280,
      iron: 4.2
    },
    commonConfusions: ['豆腐'],
    distinguishingFeatures: [
      '比豆腐更緊實',
      '顏色較深（尤其是滷過的）',
      '可以直接食用',
      '有較強的豆香和調味香'
    ],
    cookingMethods: [CookingMethod.SIMMER, CookingMethod.STIR_FRY, CookingMethod.COLD_DRESSED],
    cuisineTypes: [CuisineType.TAIWANESE, CuisineType.CHINESE],
    commonPairings: ['辣椒', '蒜片', '九層塔', '芹菜'],
    tags: ['台式小吃', '滷味']
  },
  // ==================== 麵食類 ====================
  '米粉': {
    id: 'rice_noodles',
    name: '米粉',
    nameVariants: ['炊粉', '粗米粉', '細米粉', '新竹米粉'],
    category: FoodCategory.RICE_PRODUCTS,
    visualFeatures: {
      color: ['白色', '半透明白'],
      shape: ['細長圓形', '扁平狀'],
      texture: ['柔軟', '易斷', '光滑'],
      size: '直徑0.5-2mm，長度不定',
      appearance: '表面光滑，有米製品特有的光澤',
      surfaceCharacteristics: ['表面光滑', '略有光澤'],
      glossiness: '有光澤',
      transparency: '半透明'
    },
    nutritionPer100g: {
      calories: 109,
      protein: 1.9,
      carbohydrates: 24.9,
      fat: 0.2,
      fiber: 0.8,
      sodium: 3
    },
    commonConfusions: ['粉絲', '麵條', '豆腐干絲'],
    distinguishingFeatures: [
      '純白色，比麵條更白',
      '質地較脆，容易斷',
      '有米的香味',
      '泡水後會變軟',
      '表面光滑但不如麵條有彈性'
    ],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.TAIWANESE, CuisineType.CHINESE],
    commonPairings: ['蝦米', '香菇', '高麗菜', '豆芽菜'],
    tags: ['台灣特色', '米製品']
  },

  '粉絲': {
    id: 'glass_noodles',
    name: '粉絲',
    nameVariants: ['冬粉', '綠豆粉絲', '龍口粉絲'],
    category: FoodCategory.NOODLES,
    visualFeatures: {
      color: ['透明', '半透明', '灰白色'],
      shape: ['極細絲狀'],
      texture: ['滑溜', '透明', '有彈性'],
      size: '直徑0.3-0.8mm，非常細',
      appearance: '煮熟後呈透明或半透明狀',
      surfaceCharacteristics: ['表面非常光滑', '滑溜'],
      glossiness: '高光澤',
      transparency: '透明或半透明'
    },
    nutritionPer100g: {
      calories: 351,
      protein: 0.2,
      carbohydrates: 87.8,
      fat: 0.1,
      fiber: 0.5,
      sodium: 10
    },
    commonConfusions: ['米粉', '麵線'],
    distinguishingFeatures: [
      '煮熟後呈透明狀',
      '非常細，比米粉更細',
      '有滑溜感',
      '通常用於湯品或涼拌',
      '吸水性強'
    ],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.COLD_DRESSED, CookingMethod.STIR_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.KOREAN],
    commonPairings: ['白菜', '肉絲', '木耳', '雞蛋'],
    tags: ['低卡', '易吸湯汁']
  },

  '麵條': {
    id: 'wheat_noodles',
    name: '麵條',
    nameVariants: ['陽春麵', '油麵', '拉麵', '烏龍麵'],
    category: FoodCategory.NOODLES,
    visualFeatures: {
      color: ['淡黃色', '白色', '米黃色'],
      shape: ['圓柱形', '扁平形'],
      texture: ['有彈性', '光滑', 'Q彈'],
      size: '直徑1-3mm，長度不定',
      appearance: '表面光滑有光澤，有麵粉香',
      surfaceCharacteristics: ['表面光滑', '有光澤'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 137,
      protein: 4.5,
      carbohydrates: 27.8,
      fat: 0.6,
      fiber: 1.2,
      sodium: 180
    },
    commonConfusions: ['豆腐干絲', '米粉'],
    distinguishingFeatures: [
      '有麵粉香味',
      '表面光滑有光澤',
      'Q彈有嚼勁',
      '顏色偏黃（含鹼水的油麵）',
      '切面呈圓形'
    ],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STIR_FRY, CookingMethod.COLD_DRESSED],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['肉燥', '青菜', '蔥', '蒜'],
    tags: ['主食', '常見']
  },

  // ==================== 蔬菜類 ====================
  '玉米筍': {
    id: 'baby_corn',
    name: '玉米筍',
    nameVariants: ['珍珠筍', '幼玉米', '小玉米'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['淡黃色', '黃白色', '奶白色'],
      shape: ['細長圓柱形', '筆直'],
      texture: ['脆嫩', '光滑'],
      size: '長5-8cm，直徑0.8-1.5cm',
      appearance: '整根可食用，頂端有細小玉米鬚',
      surfaceCharacteristics: ['表面光滑', '有細微縱向紋路'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 23,
      protein: 2.4,
      carbohydrates: 3.9,
      fat: 0.1,
      fiber: 2.0,
      sodium: 1
    },
    commonConfusions: ['筍子', '小玉米'],
    distinguishingFeatures: [
      '整根呈圓柱形，粗細均勻',
      '頂端有玉米鬚',
      '可以整根食用',
      '常見於炒菜和火鍋',
      '切開後沒有明顯的玉米粒'
    ],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.GRILL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.THAI],
    commonPairings: ['蘑菇', '紅蘿蔔', '雪豆', '肉片'],
    tags: ['低卡', '脆嫩']
  },

  '糯米椒': {
    id: 'shishito_pepper',
    name: '糯米椒',
    nameVariants: ['甜椒仔', '青龍椒', '獅子椒'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['綠色', '深綠色'],
      shape: ['細長形', '略彎曲'],
      texture: ['表面有皺褶', '薄皮'],
      size: '長8-12cm，直徑1.5-2cm',
      appearance: '表面有不規則皺褶，尖端略尖',
      surfaceCharacteristics: ['表面皺褶明顯', '不光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 22,
      protein: 0.9,
      carbohydrates: 5.3,
      fat: 0.2,
      fiber: 1.5,
      sodium: 3
    },
    commonConfusions: ['青椒', '辣椒'],
    distinguishingFeatures: [
      '比青椒小且細長',
      '表面有明顯皺褶',
      '通常整根烹調',
      '微辣或不辣',
      '常見於台式熱炒'
    ],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.GRILL, CookingMethod.DEEP_FRY],
    cuisineTypes: [CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['豆乾', '肉絲', '蒜片', '醬油'],
    tags: ['台式熱炒', '微辣']
  },

  '青椒': {
    id: 'bell_pepper',
    name: '青椒',
    nameVariants: ['甜椒', '燈籠椒', '彩椒'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['綠色', '深綠色', '紅色', '黃色'],
      shape: ['方形', '圓形', '燈籠狀'],
      texture: ['表面光滑', '肉厚'],
      size: '長8-12cm，寬6-10cm',
      appearance: '表面光滑有光澤，內部有空腔',
      surfaceCharacteristics: ['表面非常光滑', '有光澤'],
      crossSectionAppearance: '切開後有明顯空腔，壁厚',
      glossiness: '高光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 20,
      protein: 0.9,
      carbohydrates: 4.6,
      fat: 0.2,
      fiber: 1.7,
      sodium: 2
    },
    commonConfusions: ['糯米椒', '辣椒'],
    distinguishingFeatures: [
      '體型較大，呈方形或圓形',
      '表面光滑無皺褶',
      '肉厚，切開有空腔',
      '不辣',
      '通常切塊或切絲烹調'
    ],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.GRILL, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['牛肉', '豬肉', '洋蔥', '蒜'],
    tags: ['常見', '不辣']
  },

  '芹菜': {
    id: 'celery',
    name: '芹菜',
    nameVariants: ['西芹', '中國芹菜', '香芹'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['綠色', '淺綠色'],
      shape: ['長條狀', '有葉子'],
      texture: ['脆嫩', '纖維狀'],
      size: '長20-40cm',
      appearance: '莖部有明顯纖維，葉子呈羽狀',
      surfaceCharacteristics: ['表面有縱向纖維', '略粗糙'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 16,
      protein: 0.7,
      carbohydrates: 3.0,
      fat: 0.2,
      fiber: 1.6,
      sodium: 80
    },
    commonConfusions: ['韭菜', '蔥'],
    distinguishingFeatures: [
      '有強烈的芹菜香味',
      '莖部有明顯纖維',
      '切絲後常用於涼拌',
      '顏色較淺綠'
    ],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.COLD_DRESSED, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['豆腐干絲', '胡蘿蔔', '花生', '麻油'],
    tags: ['涼拌菜常用', '香味濃']
  },

  '胡蘿蔔': {
    id: 'carrot',
    name: '胡蘿蔔',
    nameVariants: ['紅蘿蔔', '甘筍'],
    category: FoodCategory.ROOT_VEGETABLES,
    visualFeatures: {
      color: ['橙色', '橘紅色'],
      shape: ['圓柱形', '圓錐形'],
      texture: ['脆硬', '緻密'],
      size: '長15-25cm，直徑2-5cm',
      appearance: '表面光滑，顏色鮮豔',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 41,
      protein: 0.9,
      carbohydrates: 9.6,
      fat: 0.2,
      fiber: 2.8,
      sodium: 69
    },
    commonConfusions: [],
    distinguishingFeatures: ['鮮豔的橙色', '富含胡蘿蔔素', '切絲後常用於涼拌或炒菜'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.COLD_DRESSED, CookingMethod.STEAM],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['芹菜', '木耳', '肉絲', '雞蛋'],
    tags: ['常見', '營養豐富']
  },

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

  '高麗菜': {
    id: 'cabbage',
    name: '高麗菜',
    nameVariants: ['包心菜', '甘藍', '捲心菜'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['淺綠色', '綠色', '紫色'],
      shape: ['圓球狀', '層疊狀'],
      texture: ['脆嫩', '多汁'],
      size: '直徑15-25cm',
      appearance: '葉片層層包裹成球狀',
      surfaceCharacteristics: ['表面光滑', '有葉脈'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 25,
      protein: 1.3,
      carbohydrates: 5.8,
      fat: 0.1,
      fiber: 2.5,
      sodium: 18
    },
    commonConfusions: ['大白菜'],
    distinguishingFeatures: ['球狀', '葉片厚實', '甜味', '可生食或熟食'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.STEAM, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['豬肉', '蝦米', '蒜', '薑'],
    tags: ['常見', '多用途']
  },

  '青江菜': {
    id: 'bok_choy',
    name: '青江菜',
    nameVariants: ['小白菜', '青梗菜', '白菜仔'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['綠色', '白色（莖部）'],
      shape: ['湯匙狀葉片'],
      texture: ['脆嫩', '多汁'],
      size: '長15-20cm',
      appearance: '白色莖部，綠色葉片',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 13,
      protein: 1.5,
      carbohydrates: 2.2,
      fat: 0.2,
      fiber: 1.0,
      sodium: 65,
      calcium: 105
    },
    commonConfusions: ['大白菜', '空心菜'],
    distinguishingFeatures: ['白色莖部明顯', '葉片呈湯匙狀', '口感脆嫩'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.CANTONESE],
    commonPairings: ['蒜', '薑', '香菇', '蠔油'],
    tags: ['常見', '快炒']
  },

  // ==================== 菇類 ====================
  '香菇': {
    id: 'shiitake',
    name: '香菇',
    nameVariants: ['冬菇', '花菇'],
    category: FoodCategory.MUSHROOMS,
    visualFeatures: {
      color: ['褐色', '深褐色', '黑褐色'],
      shape: ['傘狀', '圓形'],
      texture: ['肉厚', '有嚼勁'],
      size: '直徑3-8cm',
      appearance: '傘蓋有裂紋（花菇），底部有白色菌褶',
      surfaceCharacteristics: ['表面略粗糙', '可能有裂紋'],
      glossiness: '無光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 34,
      protein: 2.2,
      carbohydrates: 6.8,
      fat: 0.5,
      fiber: 2.5,
      sodium: 6
    },
    commonConfusions: ['杏鮑菇', '其他菇類'],
    distinguishingFeatures: ['有獨特香味', '傘蓋有裂紋', '肉質厚實'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.STEAM, CookingMethod.BRAISE, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['雞肉', '青菜', '米粉', '湯品'],
    tags: ['香味濃', '常見']
  },

  '金針菇': {
    id: 'enoki',
    name: '金針菇',
    nameVariants: ['金菇', '明天見'],
    category: FoodCategory.MUSHROOMS,
    visualFeatures: {
      color: ['白色', '淡黃色'],
      shape: ['細長針狀', '成束'],
      texture: ['脆嫩', '滑嫩'],
      size: '長10-15cm，直徑2-3mm',
      appearance: '細長成束，頂端有小傘蓋',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '半透明'
    },
    nutritionPer100g: {
      calories: 37,
      protein: 2.7,
      carbohydrates: 7.6,
      fat: 0.3,
      fiber: 2.7,
      sodium: 5
    },
    commonConfusions: ['豆腐干絲', '豆芽'],
    distinguishingFeatures: ['極細長', '成束生長', '白色或淡黃色', '常用於火鍋'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STIR_FRY, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE, CuisineType.KOREAN],
    commonPairings: ['肉片', '湯品', '火鍋', '涼拌'],
    tags: ['火鍋常用', '低卡']
  },

  '木耳': {
    id: 'wood_ear',
    name: '木耳',
    nameVariants: ['黑木耳', '雲耳'],
    category: FoodCategory.MUSHROOMS,
    visualFeatures: {
      color: ['黑色', '深褐色'],
      shape: ['耳狀', '波浪狀'],
      texture: ['脆嫩', '滑溜', '有彈性'],
      size: '直徑3-10cm',
      appearance: '耳朵狀，表面光滑',
      surfaceCharacteristics: ['表面光滑', '略有光澤'],
      glossiness: '有光澤',
      transparency: '半透明'
    },
    nutritionPer100g: {
      calories: 25,
      protein: 1.5,
      carbohydrates: 6.5,
      fat: 0.2,
      fiber: 6.5,
      sodium: 8,
      iron: 8.9
    },
    commonConfusions: ['白木耳'],
    distinguishingFeatures: ['黑色', '耳狀', '口感脆嫩', '高纖維'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.COLD_DRESSED, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['芹菜', '胡蘿蔔', '肉絲', '醋'],
    tags: ['涼拌菜常用', '高纖維']
  },

  // ==================== 台灣特色食材 ====================
  '過貓': {
    id: 'guomao',
    name: '過貓',
    nameVariants: ['過溝菜蕨', '山鳳尾'],
    category: FoodCategory.TAIWANESE_SPECIALTY,
    subcategory: '蕨類蔬菜',
    visualFeatures: {
      color: ['深綠色', '翠綠色'],
      shape: ['捲曲狀', '羽狀'],
      texture: ['嫩滑', '脆嫩'],
      size: '長10-15cm',
      appearance: '嫩芽呈捲曲狀，展開後呈羽狀',
      surfaceCharacteristics: ['表面光滑', '略有絨毛'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 27,
      protein: 3.2,
      carbohydrates: 4.5,
      fat: 0.3,
      fiber: 2.8,
      sodium: 5
    },
    commonConfusions: ['山蘇', '龍鬚菜'],
    distinguishingFeatures: ['嫩芽呈捲曲狀', '口感滑嫩', '台灣特有野菜', '通常川燙後涼拌或清炒'],
    cookingMethods: [CookingMethod.BLANCH, CookingMethod.COLD_DRESSED, CookingMethod.STIR_FRY],
    cuisineTypes: [CuisineType.TAIWANESE],
    commonPairings: ['蒜', '薑', '麻油', '醬油膏'],
    tags: ['台灣野菜', '原住民食材'],
    culturalNotes: '台灣原住民傳統食材，常見於山區'
  },

  '山蘇': {
    id: 'bird_nest_fern',
    name: '山蘇',
    nameVariants: ['山蘇花', '鳥巢蕨'],
    category: FoodCategory.TAIWANESE_SPECIALTY,
    subcategory: '蕨類蔬菜',
    visualFeatures: {
      color: ['深綠色'],
      shape: ['長條狀', '羽狀'],
      texture: ['脆嫩', '多汁'],
      size: '長20-30cm',
      appearance: '長條狀葉片，邊緣略有波浪',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 25,
      protein: 2.8,
      carbohydrates: 4.2,
      fat: 0.2,
      fiber: 3.0,
      sodium: 8
    },
    commonConfusions: ['過貓', '空心菜'],
    distinguishingFeatures: ['葉片較寬', '口感脆嫩', '台灣特有', '常用於快炒'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.TAIWANESE],
    commonPairings: ['蒜', '薑', '破布子', '豆豉'],
    tags: ['台灣野菜', '原住民食材'],
    culturalNotes: '台灣原住民傳統食材'
  },

  // ==================== 原住民食材 ====================
  '馬告': {
    id: 'maqaw',
    name: '馬告',
    nameVariants: ['山胡椒', '山雞椒'],
    category: FoodCategory.INDIGENOUS_FOOD,
    subcategory: '香料',
    visualFeatures: {
      color: ['黑色', '深褐色'],
      shape: ['圓形小顆粒'],
      texture: ['乾燥', '堅硬'],
      size: '直徑3-5mm',
      appearance: '類似黑胡椒，但有檸檬香氣',
      surfaceCharacteristics: ['表面略粗糙'],
      glossiness: '無光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 280,
      protein: 5.2,
      carbohydrates: 45.0,
      fat: 8.5,
      fiber: 12.0,
      sodium: 15
    },
    commonConfusions: ['黑胡椒', '花椒'],
    distinguishingFeatures: ['有獨特的檸檬香氣', '原住民常用香料', '比黑胡椒略大', '常用於烤肉和湯品'],
    cookingMethods: [CookingMethod.GRILL, CookingMethod.BOIL, CookingMethod.STIR_FRY],
    cuisineTypes: [CuisineType.INDIGENOUS, CuisineType.TAIWANESE],
    commonPairings: ['雞肉', '豬肉', '魚', '湯品'],
    tags: ['原住民香料', '檸檬香'],
    culturalNotes: '泰雅族、太魯閣族等原住民傳統香料'
  },

  '刺蔥': {
    id: 'tana',
    name: '刺蔥',
    nameVariants: ['食茱萸', '鳥不踏'],
    category: FoodCategory.INDIGENOUS_FOOD,
    subcategory: '香料',
    visualFeatures: {
      color: ['綠色', '深綠色'],
      shape: ['羽狀複葉', '有刺'],
      texture: ['葉片柔軟'],
      size: '葉片長5-10cm',
      appearance: '葉片有刺，有特殊香氣',
      surfaceCharacteristics: ['葉片光滑', '莖有刺'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 35,
      protein: 3.5,
      carbohydrates: 6.8,
      fat: 0.5,
      fiber: 4.2,
      sodium: 8
    },
    commonConfusions: ['花椒葉', '香椿'],
    distinguishingFeatures: ['有獨特香氣', '莖有刺', '原住民常用', '常用於烤肉或湯品'],
    cookingMethods: [CookingMethod.GRILL, CookingMethod.BOIL, CookingMethod.STIR_FRY],
    cuisineTypes: [CuisineType.INDIGENOUS, CuisineType.TAIWANESE],
    commonPairings: ['雞肉', '魚', '湯品'],
    tags: ['原住民香料', '特殊香氣'],
    culturalNotes: '排灣族、魯凱族等原住民傳統香料'
  },

  // ==================== 調味料 ====================
  '麻油': {
    id: 'sesame_oil',
    name: '麻油',
    nameVariants: ['香油', '芝麻油', '胡麻油'],
    category: FoodCategory.CONDIMENTS,
    visualFeatures: {
      color: ['深褐色', '琥珀色', '金黃色'],
      shape: ['液體'],
      texture: ['油狀', '黏稠'],
      size: 'N/A',
      appearance: '油狀液體，有光澤',
      surfaceCharacteristics: ['光滑', '油亮'],
      glossiness: '高光澤',
      transparency: '半透明'
    },
    nutritionPer100g: {
      calories: 884,
      protein: 0,
      carbohydrates: 0,
      fat: 100,
      fiber: 0,
      sodium: 0
    },
    commonConfusions: ['其他食用油'],
    distinguishingFeatures: ['有濃郁芝麻香味', '常用於涼拌菜', '顏色較深', '香氣濃郁'],
    cookingMethods: [CookingMethod.COLD_DRESSED, CookingMethod.STIR_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['豆腐干絲', '芹菜', '雞肉', '薑'],
    tags: ['涼拌必備', '香味濃']
  },

  '醬油': {
    id: 'soy_sauce',
    name: '醬油',
    nameVariants: ['生抽', '老抽', '醬油膏'],
    category: FoodCategory.CONDIMENTS,
    visualFeatures: {
      color: ['深褐色', '黑褐色'],
      shape: ['液體'],
      texture: ['液狀', '略黏稠'],
      size: 'N/A',
      appearance: '深色液體',
      surfaceCharacteristics: ['光滑'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 60,
      protein: 8.0,
      carbohydrates: 5.6,
      fat: 0.1,
      fiber: 0,
      sodium: 5720
    },
    commonConfusions: ['蠔油', '醬油膏'],
    distinguishingFeatures: ['鹹味', '豆香', '發酵香', '亞洲料理必備'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BRAISE, CookingMethod.SIMMER, CookingMethod.COLD_DRESSED],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['幾乎所有菜餚'],
    tags: ['基本調味料', '高鈉']
  },

  '蒜': {
    id: 'garlic',
    name: '蒜',
    nameVariants: ['大蒜', '蒜頭'],
    category: FoodCategory.CONDIMENTS,
    visualFeatures: {
      color: ['白色', '淡紫色'],
      shape: ['球狀', '瓣狀'],
      texture: ['緊實', '多層'],
      size: '直徑3-5cm',
      appearance: '多瓣組成球狀',
      surfaceCharacteristics: ['表面有薄膜'],
      glossiness: '無光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 149,
      protein: 6.4,
      carbohydrates: 33.1,
      fat: 0.5,
      fiber: 2.1,
      sodium: 17
    },
    commonConfusions: ['洋蔥', '蔥'],
    distinguishingFeatures: ['強烈蒜香', '辛辣', '多瓣結構', '亞洲料理必備'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.GRILL, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.KOREAN, CuisineType.THAI],
    commonPairings: ['幾乎所有菜餚'],
    tags: ['基本調味料', '抗菌']
  },

  '薑': {
    id: 'ginger',
    name: '薑',
    nameVariants: ['生薑', '老薑', '嫩薑'],
    category: FoodCategory.CONDIMENTS,
    visualFeatures: {
      color: ['淡黃色', '褐色（外皮）'],
      shape: ['不規則塊狀', '有分支'],
      texture: ['纖維狀', '多汁'],
      size: '長5-10cm',
      appearance: '不規則塊狀，有分支',
      surfaceCharacteristics: ['表面略粗糙', '有節'],
      glossiness: '無光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 80,
      protein: 1.8,
      carbohydrates: 17.8,
      fat: 0.8,
      fiber: 2.0,
      sodium: 13
    },
    commonConfusions: ['薑黃', '南薑'],
    distinguishingFeatures: ['辛辣', '有薑香', '去腥', '溫熱性質'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.STEAM],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['肉類', '海鮮', '湯品'],
    tags: ['基本調味料', '去腥']
  },

  '蔥': {
    id: 'scallion',
    name: '蔥',
    nameVariants: ['青蔥', '大蔥', '蔥白'],
    category: FoodCategory.CONDIMENTS,
    visualFeatures: {
      color: ['綠色（蔥綠）', '白色（蔥白）'],
      shape: ['長條狀', '中空'],
      texture: ['脆嫩', '多汁'],
      size: '長30-50cm',
      appearance: '長條狀，中空，綠白分明',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 31,
      protein: 1.8,
      carbohydrates: 7.3,
      fat: 0.2,
      fiber: 2.6,
      sodium: 16
    },
    commonConfusions: ['韭菜', '蒜苗'],
    distinguishingFeatures: ['中空', '蔥香', '綠白分明', '常用於提味'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.RAW, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE, CuisineType.KOREAN],
    commonPairings: ['幾乎所有菜餚'],
    tags: ['基本調味料', '提味']
  },

  // ==================== 海鮮類 ====================
  '蝦': {
    id: 'shrimp',
    name: '蝦',
    nameVariants: ['明蝦', '草蝦', '白蝦', '蝦仁'],
    category: FoodCategory.SEAFOOD,
    visualFeatures: {
      color: ['灰色', '青色', '粉紅色（煮熟）'],
      shape: ['彎曲狀', '節狀'],
      texture: ['Q彈', '緊實'],
      size: '長5-15cm',
      appearance: '有殼，煮熟後變紅',
      surfaceCharacteristics: ['有殼', '有節'],
      glossiness: '有光澤',
      transparency: '半透明（生）'
    },
    nutritionPer100g: {
      calories: 99,
      protein: 20.9,
      carbohydrates: 0.9,
      fat: 1.2,
      fiber: 0,
      sodium: 148
    },
    commonConfusions: ['龍蝦', '螯蝦'],
    distinguishingFeatures: ['Q彈', '高蛋白', '煮熟變紅', '鮮甜'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.GRILL, CookingMethod.STEAM],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.CANTONESE],
    commonPairings: ['蒜', '蔥', '薑', '辣椒'],
    tags: ['高蛋白', '海鮮']
  },

  '魚': {
    id: 'fish',
    name: '魚',
    nameVariants: ['鯛魚', '鱸魚', '鮭魚', '鯖魚'],
    category: FoodCategory.SEAFOOD,
    visualFeatures: {
      color: ['銀色', '灰色', '粉紅色'],
      shape: ['流線型'],
      texture: ['細緻', '鮮嫩'],
      size: '依品種而異',
      appearance: '有鱗片，流線型',
      surfaceCharacteristics: ['有鱗片', '光滑'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 120,
      protein: 20.0,
      carbohydrates: 0,
      fat: 4.5,
      fiber: 0,
      sodium: 60
    },
    commonConfusions: [],
    distinguishingFeatures: ['高蛋白', '富含Omega-3', '鮮味', '多種烹調方式'],
    cookingMethods: [CookingMethod.STEAM, CookingMethod.GRILL, CookingMethod.BRAISE, CookingMethod.DEEP_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['薑', '蔥', '醬油', '檸檬'],
    tags: ['高蛋白', '海鮮', 'Omega-3']
  },

  // ==================== 肉類 ====================
  '豬肉': {
    id: 'pork',
    name: '豬肉',
    nameVariants: ['五花肉', '里肌肉', '梅花肉', '豬肉絲'],
    category: FoodCategory.MEAT,
    visualFeatures: {
      color: ['粉紅色', '紅色'],
      shape: ['依部位而異'],
      texture: ['軟嫩', '有脂肪'],
      size: '依切法而異',
      appearance: '紅白相間（五花肉）',
      surfaceCharacteristics: ['肌肉紋理明顯'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 242,
      protein: 17.0,
      carbohydrates: 0,
      fat: 19.0,
      fiber: 0,
      sodium: 62
    },
    commonConfusions: [],
    distinguishingFeatures: ['亞洲料理最常用肉類', '多種部位', '多種烹調方式'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BRAISE, CookingMethod.GRILL, CookingMethod.STEAM, CookingMethod.DEEP_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.CANTONESE],
    commonPairings: ['蒜', '薑', '蔥', '醬油'],
    tags: ['常見', '多用途']
  },

  '雞肉': {
    id: 'chicken',
    name: '雞肉',
    nameVariants: ['雞胸肉', '雞腿肉', '雞翅'],
    category: FoodCategory.POULTRY,
    visualFeatures: {
      color: ['淡粉色', '白色'],
      shape: ['依部位而異'],
      texture: ['細緻', '軟嫩'],
      size: '依切法而異',
      appearance: '肌肉紋理細緻',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 165,
      protein: 31.0,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sodium: 82
    },
    commonConfusions: [],
    distinguishingFeatures: ['高蛋白低脂', '肉質細緻', '多種烹調方式'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.GRILL, CookingMethod.STEAM, CookingMethod.DEEP_FRY, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['薑', '蔥', '蒜', '醬油'],
    tags: ['高蛋白', '低脂', '常見']
  },

  '牛肉': {
    id: 'beef',
    name: '牛肉',
    nameVariants: ['牛排', '牛肉片', '牛腱'],
    category: FoodCategory.MEAT,
    visualFeatures: {
      color: ['深紅色', '紅色'],
      shape: ['依部位而異'],
      texture: ['緊實', '有嚼勁'],
      size: '依切法而異',
      appearance: '肌肉紋理明顯，顏色較深',
      surfaceCharacteristics: ['肌肉紋理粗'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 250,
      protein: 26.0,
      carbohydrates: 0,
      fat: 15.0,
      fiber: 0,
      sodium: 72,
      iron: 2.6
    },
    commonConfusions: [],
    distinguishingFeatures: ['高蛋白', '富含鐵質', '肉質緊實', '顏色較深'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.GRILL, CookingMethod.BRAISE, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['青椒', '洋蔥', '蒜', '黑胡椒'],
    tags: ['高蛋白', '高鐵']
  },

  // ==================== 蛋類 ====================
  '雞蛋': {
    id: 'egg',
    name: '雞蛋',
    nameVariants: ['蛋', '雞卵'],
    category: FoodCategory.EGGS,
    visualFeatures: {
      color: ['白色', '褐色（殼）', '黃色（蛋黃）'],
      shape: ['橢圓形'],
      texture: ['光滑（殼）', '液狀（生）'],
      size: '長約5-6cm',
      appearance: '橢圓形，有硬殼',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 143,
      protein: 12.6,
      carbohydrates: 0.7,
      fat: 9.5,
      fiber: 0,
      sodium: 124
    },
    commonConfusions: ['鴨蛋', '鵪鶉蛋'],
    distinguishingFeatures: ['高蛋白', '營養豐富', '多種烹調方式', '最常見的蛋類'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STIR_FRY, CookingMethod.STEAM, CookingMethod.DEEP_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['番茄', '蔥', '醬油', '米飯'],
    tags: ['高蛋白', '常見', '營養']
  },

  // ==================== 其他常見食材 ====================
  '豆芽': {
    id: 'bean_sprouts',
    name: '豆芽',
    nameVariants: ['綠豆芽', '黃豆芽'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['白色', '淡黃色'],
      shape: ['細長', '有根有芽'],
      texture: ['脆嫩', '多汁'],
      size: '長5-8cm',
      appearance: '細長，一端有豆，一端有根',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '半透明'
    },
    nutritionPer100g: {
      calories: 30,
      protein: 3.0,
      carbohydrates: 5.9,
      fat: 0.2,
      fiber: 1.5,
      sodium: 6
    },
    commonConfusions: ['金針菇'],
    distinguishingFeatures: ['脆嫩', '低卡', '快炒常用', '一端有豆'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.KOREAN],
    commonPairings: ['韭菜', '肉絲', '米粉', '醬油'],
    tags: ['低卡', '快炒']
  },

  '韭菜': {
    id: 'chinese_chive',
    name: '韭菜',
    nameVariants: ['韭黃', '韭菜花'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['深綠色', '黃色（韭黃）'],
      shape: ['扁平長條狀'],
      texture: ['柔軟', '有韌性'],
      size: '長30-40cm',
      appearance: '扁平長條狀，有韭菜特殊香味',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 27,
      protein: 2.4,
      carbohydrates: 4.6,
      fat: 0.5,
      fiber: 1.8,
      sodium: 8
    },
    commonConfusions: ['蔥', '蒜苗'],
    distinguishingFeatures: ['有強烈韭菜香', '扁平', '常用於炒蛋或水餃'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['雞蛋', '豆芽', '肉絲', '蝦'],
    tags: ['香味濃', '常見']
  },

  '洋蔥': {
    id: 'onion',
    name: '洋蔥',
    nameVariants: ['圓蔥', '蔥頭'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['紫色', '白色', '黃色'],
      shape: ['圓球狀', '層狀'],
      texture: ['脆嫩', '多汁'],
      size: '直徑5-10cm',
      appearance: '圓球狀，層層包裹',
      surfaceCharacteristics: ['表面光滑', '有薄膜'],
      glossiness: '有光澤',
      transparency: '半透明（切開後）'
    },
    nutritionPer100g: {
      calories: 40,
      protein: 1.1,
      carbohydrates: 9.3,
      fat: 0.1,
      fiber: 1.7,
      sodium: 4
    },
    commonConfusions: ['蒜'],
    distinguishingFeatures: ['辛辣', '切開會流淚', '層狀結構', '多用途'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.GRILL, CookingMethod.RAW, CookingMethod.DEEP_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['牛肉', '青椒', '番茄', '雞蛋'],
    tags: ['常見', '多用途']
  },

  '番茄': {
    id: 'tomato',
    name: '番茄',
    nameVariants: ['西紅柿', '蕃茄'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['紅色', '黃色', '綠色（未熟）'],
      shape: ['圓形', '橢圓形'],
      texture: ['多汁', '軟嫩'],
      size: '直徑5-10cm',
      appearance: '圓形，表面光滑',
      surfaceCharacteristics: ['表面光滑', '有光澤'],
      glossiness: '高光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 18,
      protein: 0.9,
      carbohydrates: 3.9,
      fat: 0.2,
      fiber: 1.2,
      sodium: 5
    },
    commonConfusions: [],
    distinguishingFeatures: ['酸甜', '多汁', '富含茄紅素', '可生食或熟食'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.RAW, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['雞蛋', '牛肉', '豆腐', '糖'],
    tags: ['常見', '營養豐富']
  },

  '黃瓜': {
    id: 'cucumber',
    name: '黃瓜',
    nameVariants: ['小黃瓜', '胡瓜'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['綠色', '深綠色'],
      shape: ['圓柱形', '細長'],
      texture: ['脆嫩', '多汁'],
      size: '長15-25cm',
      appearance: '圓柱形，表面有小刺或光滑',
      surfaceCharacteristics: ['表面可能有小刺', '略粗糙'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 15,
      protein: 0.7,
      carbohydrates: 3.6,
      fat: 0.1,
      fiber: 0.5,
      sodium: 2
    },
    commonConfusions: ['絲瓜', '苦瓜'],
    distinguishingFeatures: ['清脆', '水分多', '常用於涼拌', '可生食'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.COLD_DRESSED, CookingMethod.STIR_FRY, CookingMethod.PICKLE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE, CuisineType.KOREAN],
    commonPairings: ['蒜', '醋', '辣椒', '芝麻'],
    tags: ['低卡', '涼拌常用']
  },

  '白飯': {
    id: 'white_rice',
    name: '白飯',
    nameVariants: ['米飯', '飯'],
    category: FoodCategory.GRAINS,
    visualFeatures: {
      color: ['白色'],
      shape: ['顆粒狀'],
      texture: ['軟糯', 'Q彈'],
      size: '米粒長約5-7mm',
      appearance: '白色顆粒，煮熟後黏在一起',
      surfaceCharacteristics: ['表面光滑', '略有光澤'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 130,
      protein: 2.7,
      carbohydrates: 28.7,
      fat: 0.3,
      fiber: 0.4,
      sodium: 1
    },
    commonConfusions: ['糙米飯', '糯米飯'],
    distinguishingFeatures: ['亞洲主食', '白色', 'Q彈', '米香'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STEAM],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE, CuisineType.KOREAN],
    commonPairings: ['幾乎所有菜餚'],
    tags: ['主食', '常見']
  },

  '辣椒': {
    id: 'chili',
    name: '辣椒',
    nameVariants: ['朝天椒', '小辣椒', '紅辣椒'],
    category: FoodCategory.CONDIMENTS,
    visualFeatures: {
      color: ['紅色', '綠色', '黃色'],
      shape: ['細長形', '尖端尖'],
      texture: ['薄皮', '脆'],
      size: '長3-10cm',
      appearance: '細長，尖端尖，顏色鮮豔',
      surfaceCharacteristics: ['表面光滑', '有光澤'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 40,
      protein: 1.9,
      carbohydrates: 8.8,
      fat: 0.4,
      fiber: 1.5,
      sodium: 9
    },
    commonConfusions: ['糯米椒', '青椒'],
    distinguishingFeatures: ['辣味', '刺激性', '提味', '顏色鮮豔'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.RAW, CookingMethod.PICKLE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.SICHUAN, CuisineType.THAI],
    commonPairings: ['蒜', '薑', '豆豉', '醬油'],
    tags: ['辣味', '提味']
  },

  '花生': {
    id: 'peanut',
    name: '花生',
    nameVariants: ['土豆', '落花生'],
    category: FoodCategory.PROTEINS,
    visualFeatures: {
      color: ['淡褐色', '紅色（外皮）'],
      shape: ['橢圓形', '有殼'],
      texture: ['脆', '有嚼勁'],
      size: '長1-2cm',
      appearance: '橢圓形，有薄皮',
      surfaceCharacteristics: ['表面略粗糙'],
      glossiness: '無光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 567,
      protein: 25.8,
      carbohydrates: 16.1,
      fat: 49.2,
      fiber: 8.5,
      sodium: 18
    },
    commonConfusions: [],
    distinguishingFeatures: ['高蛋白', '高脂肪', '香脆', '常用於涼拌或零食'],
    cookingMethods: [CookingMethod.GRILL, CookingMethod.BOIL, CookingMethod.DEEP_FRY, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['芹菜', '豆腐干絲', '小魚乾', '辣椒'],
    tags: ['高蛋白', '高脂肪', '涼拌常用']
  },

  '筍子': {
    id: 'bamboo_shoot',
    name: '筍子',
    nameVariants: ['竹筍', '綠竹筍', '麻竹筍', '桂竹筍'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['淡黃色', '白色', '米白色'],
      shape: ['圓錐形', '圓柱形'],
      texture: ['脆嫩', '纖維狀'],
      size: '長10-20cm，直徑3-8cm',
      appearance: '圓錐形或圓柱形，有節狀紋路',
      surfaceCharacteristics: ['表面光滑', '有節狀紋路'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 27,
      protein: 2.6,
      carbohydrates: 5.2,
      fat: 0.3,
      fiber: 2.8,
      sodium: 6
    },
    commonConfusions: ['玉米筍'],
    distinguishingFeatures: ['有節狀紋路', '纖維較粗', '比玉米筍粗大', '有竹筍香味'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STIR_FRY, CookingMethod.BRAISE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['肉絲', '香菇', '木耳', '醬油'],
    tags: ['高纖維', '低卡']
  },

  '絲瓜': {
    id: 'luffa',
    name: '絲瓜',
    nameVariants: ['菜瓜', '水瓜'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['綠色', '深綠色'],
      shape: ['圓柱形', '細長'],
      texture: ['柔軟', '多汁'],
      size: '長20-40cm，直徑5-8cm',
      appearance: '圓柱形，表面有縱向稜線',
      surfaceCharacteristics: ['表面有稜線', '略粗糙'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 20,
      protein: 1.0,
      carbohydrates: 4.2,
      fat: 0.2,
      fiber: 1.0,
      sodium: 2
    },
    commonConfusions: ['黃瓜', '苦瓜'],
    distinguishingFeatures: ['有稜線', '煮熟後變軟', '有甜味', '常用於湯品'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.STEAM],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['蛤蜊', '薑', '蒜', '雞蛋'],
    tags: ['低卡', '清爽']
  },

  '苦瓜': {
    id: 'bitter_melon',
    name: '苦瓜',
    nameVariants: ['涼瓜', '癩葡萄'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['綠色', '白色'],
      shape: ['橢圓形', '紡錘形'],
      texture: ['表面有瘤狀突起', '脆'],
      size: '長15-25cm，直徑5-8cm',
      appearance: '表面有明顯瘤狀突起',
      surfaceCharacteristics: ['表面粗糙', '有瘤狀突起'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 17,
      protein: 1.0,
      carbohydrates: 3.7,
      fat: 0.2,
      fiber: 2.6,
      sodium: 5
    },
    commonConfusions: ['絲瓜', '黃瓜'],
    distinguishingFeatures: ['表面有瘤狀突起', '苦味', '降火', '常用於炒蛋或湯品'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.PICKLE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE],
    commonPairings: ['雞蛋', '豆豉', '鹹蛋', '排骨'],
    tags: ['苦味', '降火', '清熱']
  },

  '茄子': {
    id: 'eggplant',
    name: '茄子',
    nameVariants: ['紫茄', '長茄', '圓茄'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['紫色', '深紫色', '白色'],
      shape: ['長條形', '圓形'],
      texture: ['柔軟', '海綿狀'],
      size: '長15-30cm（長茄）',
      appearance: '表面光滑，有光澤',
      surfaceCharacteristics: ['表面光滑', '有光澤'],
      glossiness: '高光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 25,
      protein: 1.0,
      carbohydrates: 5.9,
      fat: 0.2,
      fiber: 3.0,
      sodium: 2
    },
    commonConfusions: [],
    distinguishingFeatures: ['紫色外皮', '海綿狀質地', '吸油', '常用於炒或蒸'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.STEAM, CookingMethod.BRAISE, CookingMethod.GRILL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.SICHUAN],
    commonPairings: ['蒜', '豆豉', '肉末', '醬油'],
    tags: ['吸油', '多用途']
  },

  '大白菜': {
    id: 'napa_cabbage',
    name: '大白菜',
    nameVariants: ['白菜', '山東白菜'],
    category: FoodCategory.VEGETABLES,
    visualFeatures: {
      color: ['淺綠色', '白色', '黃綠色'],
      shape: ['長橢圓形', '層疊狀'],
      texture: ['脆嫩', '多汁'],
      size: '長30-50cm',
      appearance: '長橢圓形，葉片層疊',
      surfaceCharacteristics: ['表面光滑', '有葉脈'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 13,
      protein: 1.5,
      carbohydrates: 2.2,
      fat: 0.2,
      fiber: 1.0,
      sodium: 57
    },
    commonConfusions: ['高麗菜', '青江菜'],
    distinguishingFeatures: ['長橢圓形', '葉片較薄', '常用於火鍋或炒菜', '甜味'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.PICKLE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.KOREAN],
    commonPairings: ['豬肉', '豆腐', '粉絲', '蝦米'],
    tags: ['低卡', '火鍋常用']
  },

  '菠菜': {
    id: 'spinach',
    name: '菠菜',
    nameVariants: ['赤根菜', '波斯菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['深綠色', '綠色'],
      shape: ['葉片呈箭頭狀'],
      texture: ['柔軟', '多汁'],
      size: '長15-25cm',
      appearance: '葉片呈箭頭狀，根部紅色',
      surfaceCharacteristics: ['表面光滑'],
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
      iron: 2.7
    },
    commonConfusions: ['空心菜', '青江菜'],
    distinguishingFeatures: ['葉片呈箭頭狀', '根部紅色', '高鐵質', '略有澀味'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['蒜', '薑', '雞蛋', '豆腐'],
    tags: ['高鐵', '營養豐富']
  },

  '杏鮑菇': {
    id: 'king_oyster_mushroom',
    name: '杏鮑菇',
    nameVariants: ['刺芹側耳'],
    category: FoodCategory.MUSHROOMS,
    visualFeatures: {
      color: ['白色', '米白色', '淡褐色'],
      shape: ['粗柱狀', '傘蓋小'],
      texture: ['肉厚', '緊實', 'Q彈'],
      size: '長8-15cm，直徑2-4cm',
      appearance: '粗柱狀，傘蓋較小',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 31,
      protein: 3.3,
      carbohydrates: 6.0,
      fat: 0.3,
      fiber: 2.3,
      sodium: 9
    },
    commonConfusions: ['香菇', '鴻喜菇'],
    distinguishingFeatures: ['粗柱狀', '肉質厚實', 'Q彈', '口感類似鮑魚'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.GRILL, CookingMethod.BRAISE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['蒜', '蠔油', '肉類', '青菜'],
    tags: ['Q彈', '肉質厚']
  },

  '鴻喜菇': {
    id: 'shimeji',
    name: '鴻喜菇',
    nameVariants: ['蟹味菇', '玉蕈'],
    category: FoodCategory.MUSHROOMS,
    visualFeatures: {
      color: ['白色', '褐色', '灰色'],
      shape: ['小傘狀', '成束'],
      texture: ['脆嫩', '細緻'],
      size: '長5-10cm，傘蓋直徑1-2cm',
      appearance: '小傘狀，成束生長',
      surfaceCharacteristics: ['表面光滑'],
      glossiness: '微光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 26,
      protein: 2.7,
      carbohydrates: 5.1,
      fat: 0.3,
      fiber: 2.7,
      sodium: 6
    },
    commonConfusions: ['金針菇', '香菇'],
    distinguishingFeatures: ['成束生長', '小傘狀', '有蟹味', '口感脆嫩'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL, CookingMethod.GRILL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['肉類', '湯品', '火鍋', '奶油'],
    tags: ['脆嫩', '火鍋常用']
  },

  '海帶': {
    id: 'kelp',
    name: '海帶',
    nameVariants: ['昆布', '海帶芽'],
    category: FoodCategory.VEGETABLES,
    subcategory: '海藻類',
    visualFeatures: {
      color: ['深綠色', '褐色', '黑綠色'],
      shape: ['長條狀', '片狀'],
      texture: ['滑溜', '有韌性'],
      size: '長度不定',
      appearance: '長條狀或片狀，表面光滑',
      surfaceCharacteristics: ['表面光滑', '滑溜'],
      glossiness: '有光澤',
      transparency: '半透明'
    },
    nutritionPer100g: {
      calories: 43,
      protein: 1.7,
      carbohydrates: 9.6,
      fat: 0.6,
      fiber: 1.3,
      sodium: 233
    },
    commonConfusions: ['海帶芽', '紫菜'],
    distinguishingFeatures: ['滑溜', '有海味', '富含碘', '常用於湯品'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.COLD_DRESSED, CookingMethod.BRAISE],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['排骨', '豆腐', '味噌', '醋'],
    tags: ['高碘', '海鮮', '湯品常用']
  },

  // ==================== 新增火鍋常見食材 ====================
  '蟹腿': {
    id: 'crab_leg',
    name: '蟹腿',
    nameVariants: ['蟹腳', '蟹肉', '蟹棒', '蟹腳肉'],
    category: FoodCategory.SEAFOOD,
    visualFeatures: {
      color: ['橙紅色', '白色', '紅白相間'],
      shape: ['長條狀', '圓柱形'],
      texture: ['緊實', 'Q彈', '纖維狀'],
      size: '長8-15cm',
      appearance: '紅白相間的長條狀，有明顯的肉質纖維',
      surfaceCharacteristics: ['表面光滑', '有殼或無殼'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 97,
      protein: 19.4,
      carbohydrates: 0.5,
      fat: 1.5,
      fiber: 0,
      sodium: 293,
      calcium: 89,
      iron: 0.5
    },
    commonConfusions: ['蟹肉棒', '魚板'],
    distinguishingFeatures: ['紅白相間', '有蟹肉纖維', '鮮甜味', '常見於火鍋'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STEAM, CookingMethod.STIR_FRY],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['火鍋湯底', '蔬菜', '豆腐', '麵條'],
    tags: ['火鍋', '海鮮', '高蛋白', '低脂']
  },

  '豆苗': {
    id: 'pea_shoots',
    name: '豆苗',
    nameVariants: ['豌豆苗', '豆苗菜', '豌豆尖'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['翠綠色', '嫩綠色'],
      shape: ['細長莖', '小葉片'],
      texture: ['脆嫩', '多汁', '柔軟'],
      size: '長10-15cm',
      appearance: '細長的嫩莖，頂端有小葉片和卷鬚',
      surfaceCharacteristics: ['表面光滑', '嫩綠'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 35,
      protein: 4.0,
      carbohydrates: 5.5,
      fat: 0.4,
      fiber: 2.6,
      sodium: 4,
      calcium: 65,
      iron: 2.1
    },
    commonConfusions: ['空心菜', '龍鬚菜'],
    distinguishingFeatures: ['有卷鬚', '嫩綠色', '清甜味', '常用於快炒或火鍋'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BLANCH, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.CANTONESE],
    commonPairings: ['蒜', '蠔油', '薑', '火鍋'],
    tags: ['火鍋', '清炒', '高纖', '低卡']
  },

  '魚片': {
    id: 'fish_fillet',
    name: '魚片',
    nameVariants: ['魚肉片', '鱼片', '生魚片', '魚柳'],
    category: FoodCategory.SEAFOOD,
    visualFeatures: {
      color: ['白色', '淡粉色', '灰白色'],
      shape: ['薄片狀', '長方形'],
      texture: ['細緻', '柔軟', '鮮嫩'],
      size: '長5-10cm，厚0.5-1cm',
      appearance: '薄片狀，肉質細緻，可見肌肉紋理',
      surfaceCharacteristics: ['表面光滑', '濕潤'],
      glossiness: '有光澤',
      transparency: '半透明（生）'
    },
    nutritionPer100g: {
      calories: 110,
      protein: 20.5,
      carbohydrates: 0,
      fat: 3.5,
      fiber: 0,
      sodium: 55,
      calcium: 15,
      iron: 0.4
    },
    commonConfusions: ['雞肉片', '豬肉片'],
    distinguishingFeatures: ['白色或淡粉色', '肉質細緻', '魚腥味', '常見於火鍋或清蒸'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STEAM, CookingMethod.STIR_FRY, CookingMethod.RAW],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.JAPANESE],
    commonPairings: ['薑', '蔥', '醬油', '火鍋湯底'],
    tags: ['火鍋', '海鮮', '高蛋白', '低脂', '清蒸']
  },

  '水菜': {
    id: 'mizuna',
    name: '水菜',
    nameVariants: ['京水菜', '日本水菜', '水京菜'],
    category: FoodCategory.LEAFY_GREENS,
    visualFeatures: {
      color: ['深綠色', '翠綠色'],
      shape: ['羽狀', '細長鋸齒葉'],
      texture: ['脆嫩', '多汁'],
      size: '長15-25cm',
      appearance: '羽狀細長葉片，邊緣有鋸齒，白色莖部',
      surfaceCharacteristics: ['表面光滑', '葉片薄'],
      glossiness: '有光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 23,
      protein: 2.2,
      carbohydrates: 4.1,
      fat: 0.3,
      fiber: 2.9,
      sodium: 70,
      calcium: 210,
      iron: 2.1
    },
    commonConfusions: ['芝麻菜', '青江菜'],
    distinguishingFeatures: ['羽狀葉片', '細長鋸齒邊', '略帶芥末味', '常見於日式火鍋'],
    cookingMethods: [CookingMethod.BOIL, CookingMethod.STIR_FRY, CookingMethod.RAW],
    cuisineTypes: [CuisineType.JAPANESE, CuisineType.TAIWANESE],
    commonPairings: ['火鍋', '沙拉', '豆腐', '肉片'],
    tags: ['日式', '火鍋', '高鈣', '低卡', '沙拉']
  },

  '蝦米': {
    id: 'dried_shrimp',
    name: '蝦米',
    nameVariants: ['蝦仁乾', '海米'],
    category: FoodCategory.DRIED_GOODS,
    visualFeatures: {
      color: ['橙紅色', '粉紅色'],
      shape: ['小顆粒狀', '彎曲'],
      texture: ['乾燥', '硬'],
      size: '長1-2cm',
      appearance: '小顆粒狀，乾燥',
      surfaceCharacteristics: ['表面乾燥', '略粗糙'],
      glossiness: '無光澤',
      transparency: '不透明'
    },
    nutritionPer100g: {
      calories: 312,
      protein: 63.7,
      carbohydrates: 2.8,
      fat: 4.5,
      fiber: 0,
      sodium: 4891
    },
    commonConfusions: ['櫻花蝦'],
    distinguishingFeatures: ['乾燥', '鮮味濃', '高蛋白', '常用於提味'],
    cookingMethods: [CookingMethod.STIR_FRY, CookingMethod.BOIL],
    cuisineTypes: [CuisineType.CHINESE, CuisineType.TAIWANESE, CuisineType.CANTONESE],
    commonPairings: ['高麗菜', '米粉', '蘿蔔糕', '粥'],
    tags: ['提味', '高蛋白', '高鈉']
  }
};

// 導入擴展數據
import { ASIAN_FOOD_ITEMS_EXTENDED } from './asianFoodItemsExtended';

// 合併所有食材數據
const ALL_FOOD_ITEMS = {
  ...ASIAN_FOOD_ITEMS,
  ...ASIAN_FOOD_ITEMS_EXTENDED
};

/**
 * 獲取所有食材列表
 */
export function getAllFoodItems(): FoodItem[] {
  return Object.values(ALL_FOOD_ITEMS);
}

/**
 * 根據ID獲取食材
 */
export function getFoodItemById(id: string): FoodItem | undefined {
  return Object.values(ALL_FOOD_ITEMS).find(item => item.id === id);
}

/**
 * 根據名稱獲取食材（包含別名）
 */
export function getFoodItemByName(name: string): FoodItem | undefined {
  return Object.values(ALL_FOOD_ITEMS).find(
    item => item.name === name || item.nameVariants.includes(name)
  );
}

/**
 * 根據類別獲取食材
 */
export function getFoodItemsByCategory(category: FoodCategory): FoodItem[] {
  return Object.values(ALL_FOOD_ITEMS).filter(item => item.category === category);
}

/**
 * 根據料理類型獲取食材
 */
export function getFoodItemsByCuisineType(cuisineType: CuisineType): FoodItem[] {
  return Object.values(ALL_FOOD_ITEMS).filter(
    item => item.cuisineTypes.includes(cuisineType)
  );
}
