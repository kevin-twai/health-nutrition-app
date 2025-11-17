/**
 * 成分資訊擴展映射
 * Component Info Extensions
 * 
 * 此文件為已存在的食材添加 componentInfo 屬性
 * 用於成分識別系統
 */

import { ComponentCategory, CookingMethod } from '../types/ComponentDetection';
import { ComponentInfo } from '../types/AsianCuisineKnowledgeBase';

/**
 * 成分資訊擴展映射
 * Key 為食材 ID，Value 為 ComponentInfo
 */
export const COMPONENT_INFO_EXTENSIONS: Record<string, ComponentInfo> = {
  // ==================== 蛋白質類 ====================
  'egg': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['蛋炒飯', '番茄炒蛋', '滷蛋', '茶葉蛋', '蛋花湯', '拉麵'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED, CookingMethod.STEAMED, CookingMethod.BRAISED],
    portionRanges: {
      min: 30,
      max: 100,
      typical: 50
    }
  },

  'tofu': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['味噌湯', '麻婆豆腐', '紅燒豆腐', '涼拌豆腐', '臭豆腐'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.STIR_FRIED, CookingMethod.DEEP_FRIED, CookingMethod.BRAISED, CookingMethod.STEAMED],
    portionRanges: {
      min: 30,
      max: 100,
      typical: 50
    }
  },

  'dried_tofu': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['便當配菜', '滷味', '炒豆乾', '涼拌豆乾'],
    cookingMethods: [CookingMethod.BRAISED, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 20,
      max: 60,
      typical: 30
    }
  },

  'pork': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['便當主菜', '炒肉絲', '滷肉', '紅燒肉', '拉麵'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BRAISED, CookingMethod.GRILLED, CookingMethod.DEEP_FRIED],
    portionRanges: {
      min: 50,
      max: 150,
      typical: 80
    }
  },

  'chicken': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['便當主菜', '炸雞', '烤雞', '雞湯', '宮保雞丁'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.GRILLED, CookingMethod.DEEP_FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 80,
      max: 150,
      typical: 120
    }
  },

  'shrimp': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['炒飯', '炒麵', '蝦仁炒蛋', '蝦仁豆腐', '火鍋'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED, CookingMethod.GRILLED],
    portionRanges: {
      min: 30,
      max: 80,
      typical: 50
    }
  },

  // ==================== 主食類 ====================
  'white_rice': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['蛋炒飯', '便當', '蓋飯', '壽司', '飯糰'],
    cookingMethods: [CookingMethod.STEAMED, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 150,
      max: 300,
      typical: 200
    }
  },

  'wheat_noodles': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['拉麵', '炒麵', '湯麵', '涼麵'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 120,
      max: 200,
      typical: 150
    }
  },

  'rice_noodles': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['炒米粉', '米粉湯', '新竹米粉'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 100,
      max: 180,
      typical: 120
    }
  },

  // ==================== 蔬菜類 ====================
  'cabbage': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['便當配菜', '炒高麗菜', '高麗菜飯', '餃子餡', '火鍋'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED, CookingMethod.STEAMED],
    portionRanges: {
      min: 30,
      max: 100,
      typical: 50
    }
  },

  'carrot': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['炒飯', '便當配菜', '涼拌菜', '咖哩', '湯品'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED, CookingMethod.STEAMED],
    portionRanges: {
      min: 20,
      max: 80,
      typical: 40
    }
  },

  'bok_choy': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['便當配菜', '炒青江菜', '湯品', '火鍋'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED, CookingMethod.STEAMED],
    portionRanges: {
      min: 40,
      max: 100,
      typical: 60
    }
  },

  'water_spinach': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['炒空心菜', '蒜炒空心菜', '腐乳空心菜'],
    cookingMethods: [CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 50,
      max: 120,
      typical: 80
    }
  },

  'bell_pepper': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['青椒炒肉絲', '炒飯', '便當配菜', '咖哩'],
    cookingMethods: [CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 30,
      max: 80,
      typical: 50
    }
  },

  'baby_corn': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['炒菜', '火鍋', '便當配菜'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 20,
      max: 60,
      typical: 30
    }
  },

  // ==================== 菇類 ====================
  'shiitake': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['炒菜', '湯品', '便當配菜', '火鍋', '滷味'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED, CookingMethod.BRAISED],
    portionRanges: {
      min: 20,
      max: 60,
      typical: 30
    }
  },

  'enoki': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['火鍋', '湯品', '涼拌菜', '拉麵'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 20,
      max: 60,
      typical: 30
    }
  },

  'wood_ear': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['涼拌木耳', '炒木耳', '湯品', '拉麵'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 10,
      max: 40,
      typical: 20
    }
  },

  // ==================== 配菜/調味料 ====================
  'scallion': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['蛋炒飯', '蔥油餅', '蔥爆牛肉', '湯品', '拉麵', '幾乎所有料理'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 5,
      max: 20,
      typical: 10
    }
  },

  'garlic': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['幾乎所有炒菜', '蒜泥白肉', '蒜炒空心菜'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.RAW],
    portionRanges: {
      min: 5,
      max: 15,
      typical: 10
    }
  },

  'ginger': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['薑絲炒肉', '薑母鴨', '湯品', '滷味'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 5,
      max: 20,
      typical: 10
    }
  },

  'soy_sauce': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['幾乎所有料理'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.STIR_FRIED, CookingMethod.BRAISED],
    portionRanges: {
      min: 5,
      max: 20,
      typical: 10
    }
  },

  'sesame_oil': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['涼拌菜', '湯品', '炒菜'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 3,
      max: 10,
      typical: 5
    }
  },

  // ==================== 台灣特色食材 ====================
  'braised_pork': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['滷肉飯', '便當', '滷味'],
    cookingMethods: [CookingMethod.BRAISED],
    portionRanges: {
      min: 40,
      max: 100,
      typical: 60
    }
  },

  'braised_egg': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['滷肉飯', '便當', '滷味', '牛肉麵'],
    cookingMethods: [CookingMethod.BRAISED],
    portionRanges: {
      min: 50,
      max: 60,
      typical: 50
    }
  },

  'oyster': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['蚵仔煎', '蚵仔麵線', '蚵仔湯'],
    cookingMethods: [CookingMethod.FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 50,
      max: 80,
      typical: 60
    }
  },

  'stinky_tofu': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['臭豆腐'],
    cookingMethods: [CookingMethod.DEEP_FRIED, CookingMethod.STEAMED],
    portionRanges: {
      min: 100,
      max: 150,
      typical: 120
    }
  },

  'beef_tendon': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['牛肉麵', '滷味'],
    cookingMethods: [CookingMethod.BRAISED],
    portionRanges: {
      min: 30,
      max: 60,
      typical: 40
    }
  },

  'pickled_mustard_greens': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['滷肉飯', '牛肉麵', '便當配菜', '酸菜白肉鍋'],
    cookingMethods: [CookingMethod.PICKLED],
    portionRanges: {
      min: 10,
      max: 30,
      typical: 20
    }
  },

  'sweet_potato_starch': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['蚵仔煎', '鹽酥雞', '炸物'],
    cookingMethods: [CookingMethod.FRIED, CookingMethod.DEEP_FRIED],
    portionRanges: {
      min: 20,
      max: 60,
      typical: 40
    }
  },

  'thai_basil': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['鹽酥雞', '三杯雞', '炒蛤蜊', '臭豆腐'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.FRIED],
    portionRanges: {
      min: 5,
      max: 15,
      typical: 10
    }
  },

  'sweet_chili_sauce': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['蚵仔煎', '炸物', '春捲'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 15,
      max: 30,
      typical: 20
    }
  },

  'soy_sauce_paste': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['臭豆腐', '滷味', '便當'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 5,
      max: 15,
      typical: 10
    }
  },

  'pepper_salt': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['鹽酥雞', '炸物', '烤肉'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 2,
      max: 5,
      typical: 3
    }
  },

  'rice_blood_cake': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['烤肉', '滷味', '夜市小吃'],
    cookingMethods: [CookingMethod.GRILLED, CookingMethod.BRAISED],
    portionRanges: {
      min: 50,
      max: 80,
      typical: 60
    }
  },

  'fried_fish_cake': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['烤肉', '滷味', '火鍋'],
    cookingMethods: [CookingMethod.GRILLED, CookingMethod.BRAISED, CookingMethod.BOILED],
    portionRanges: {
      min: 30,
      max: 60,
      typical: 40
    }
  },

  'dried_bamboo_shoots': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['滷肉飯', '便當配菜', '滷味'],
    cookingMethods: [CookingMethod.BRAISED],
    portionRanges: {
      min: 10,
      max: 30,
      typical: 20
    }
  },

  'baby_bok_choy': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['蚵仔煎', '便當配菜', '湯品', '火鍋'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 30,
      max: 60,
      typical: 40
    }
  },

  // ==================== 日式特色食材 ====================
  'sushi_rice': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['壽司', '手捲', '飯糰'],
    cookingMethods: [CookingMethod.STEAMED],
    portionRanges: {
      min: 25,
      max: 40,
      typical: 30
    }
  },

  'sashimi': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['壽司', '生魚片', '丼飯'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 10,
      max: 30,
      typical: 15
    }
  },

  'nori': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['壽司', '手捲', '拉麵', '飯糰'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 1,
      max: 5,
      typical: 2
    }
  },

  'wasabi': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['壽司', '生魚片', '蕎麥麵'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 1,
      max: 3,
      typical: 2
    }
  },

  'pickled_ginger': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['壽司', '生魚片'],
    cookingMethods: [CookingMethod.PICKLED],
    portionRanges: {
      min: 3,
      max: 10,
      typical: 5
    }
  },

  'tempura_batter': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['天婦羅', '炸物'],
    cookingMethods: [CookingMethod.DEEP_FRIED],
    portionRanges: {
      min: 20,
      max: 40,
      typical: 30
    }
  },

  'tentsuyu_sauce': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['天婦羅', '烏龍麵'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 20,
      max: 50,
      typical: 30
    }
  },

  'grated_daikon': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['天婦羅', '烤魚', '烤肉'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 15,
      max: 30,
      typical: 20
    }
  },

  'miso_paste': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['味噌湯', '味噌拉麵', '味噌烤魚'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.GRILLED],
    portionRanges: {
      min: 10,
      max: 25,
      typical: 15
    }
  },

  'dashi_broth': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['味噌湯', '烏龍麵', '茶碗蒸', '煮物'],
    cookingMethods: [CookingMethod.BOILED],
    portionRanges: {
      min: 150,
      max: 400,
      typical: 250
    }
  },

  'tsukemono': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['定食', '便當', '拉麵'],
    cookingMethods: [CookingMethod.PICKLED],
    portionRanges: {
      min: 15,
      max: 30,
      typical: 20
    }
  },

  'natto': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['定食', '納豆飯', '納豆手捲'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 30,
      max: 50,
      typical: 40
    }
  },

  'tamago': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['壽司', '玉子燒', '便當'],
    cookingMethods: [CookingMethod.STEAMED, CookingMethod.FRIED],
    portionRanges: {
      min: 15,
      max: 40,
      typical: 20
    }
  },

  'shiso_leaf': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['天婦羅', '壽司', '生魚片'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.DEEP_FRIED],
    portionRanges: {
      min: 3,
      max: 10,
      typical: 5
    }
  },

  'nimono': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['定食', '便當'],
    cookingMethods: [CookingMethod.BRAISED],
    portionRanges: {
      min: 40,
      max: 80,
      typical: 60
    }
  },

  // ==================== 韓式特色食材 ====================
  'kimchi': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['韓式烤肉', '石鍋拌飯', '泡菜鍋', '便當'],
    cookingMethods: [CookingMethod.PICKLED, CookingMethod.BOILED],
    portionRanges: {
      min: 30,
      max: 100,
      typical: 40
    }
  },

  'gochujang': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['石鍋拌飯', '韓式烤肉', '炒年糕', '拌飯'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 10,
      max: 30,
      typical: 15
    }
  },

  'gochugaru': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['泡菜鍋', '辣炒年糕', '韓式料理'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 3,
      max: 10,
      typical: 5
    }
  },

  'doenjang': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['韓式烤肉', '大醬湯', '拌飯'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.BOILED],
    portionRanges: {
      min: 5,
      max: 15,
      typical: 10
    }
  },

  'perilla_leaves': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['韓式烤肉', '包飯'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 15,
      max: 30,
      typical: 20
    }
  },

  'korean_lettuce': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['韓式烤肉', '包飯'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 20,
      max: 50,
      typical: 30
    }
  },

  'rice_cake': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['炒年糕', '泡菜鍋', '年糕湯'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 40,
      max: 100,
      typical: 60
    }
  },

  'korean_sesame_oil': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['石鍋拌飯', '涼拌菜', '韓式料理'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 3,
      max: 10,
      typical: 5
    }
  },

  'sesame_seeds': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['石鍋拌飯', '涼拌菜', '韓式料理'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 2,
      max: 5,
      typical: 3
    }
  },

  'fernbrake': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['石鍋拌飯', '涼拌菜'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 20,
      max: 50,
      typical: 30
    }
  },

  'bellflower_root': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['石鍋拌飯', '涼拌菜'],
    cookingMethods: [CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 15,
      max: 30,
      typical: 20
    }
  },

  'zucchini': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['石鍋拌飯', '煎餅', '炒菜'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.FRIED],
    portionRanges: {
      min: 20,
      max: 50,
      typical: 30
    }
  },

  // ==================== 中式特色食材 ====================
  'doubanjiang': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['麻婆豆腐', '水煮魚', '回鍋肉'],
    cookingMethods: [CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 15,
      max: 30,
      typical: 20
    }
  },

  'sichuan_peppercorn': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['麻婆豆腐', '宮保雞丁', '水煮魚', '四川料理'],
    cookingMethods: [CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 2,
      max: 5,
      typical: 3
    }
  },

  'ground_pork': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['麻婆豆腐', '肉燥', '餃子餡'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BRAISED],
    portionRanges: {
      min: 50,
      max: 80,
      typical: 60
    }
  },

  'chili_oil': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['麻婆豆腐', '涼拌菜', '酸辣湯'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 10,
      max: 25,
      typical: 15
    }
  },

  'roasted_duck': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['北京烤鴨', '烤鴨飯', '烤鴨麵'],
    cookingMethods: [CookingMethod.GRILLED],
    portionRanges: {
      min: 80,
      max: 130,
      typical: 100
    }
  },

  'duck_skin': {
    category: ComponentCategory.PROTEIN,
    isCommonComponent: true,
    typicalDishes: ['北京烤鴨'],
    cookingMethods: [CookingMethod.GRILLED],
    portionRanges: {
      min: 20,
      max: 50,
      typical: 30
    }
  },

  'pancake': {
    category: ComponentCategory.GRAIN,
    isCommonComponent: true,
    typicalDishes: ['北京烤鴨', '春餅', '蔥油餅'],
    cookingMethods: [CookingMethod.STEAMED, CookingMethod.FRIED],
    portionRanges: {
      min: 30,
      max: 60,
      typical: 40
    }
  },

  'hoisin_sauce': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['北京烤鴨', '春捲', '炒菜'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 10,
      max: 25,
      typical: 15
    }
  },

  // ==================== 東南亞特色食材 ====================
  'fish_sauce': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['泰式炒河粉', '越南河粉', '泰式料理', '越南料理'],
    cookingMethods: [CookingMethod.RAW, CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 5,
      max: 15,
      typical: 10
    }
  },

  'tamarind_paste': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['泰式炒河粉', '泰式料理'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 5,
      max: 15,
      typical: 10
    }
  },

  'crushed_peanuts': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['泰式炒河粉', '涼拌菜', '沙拉'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 10,
      max: 25,
      typical: 15
    }
  },

  'lime': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['泰式炒河粉', '越南河粉', '泰式料理', '越南料理'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 5,
      max: 20,
      typical: 10
    }
  },

  'mint_leaves': {
    category: ComponentCategory.GARNISH,
    isCommonComponent: true,
    typicalDishes: ['越南河粉', '越南春捲', '越南料理'],
    cookingMethods: [CookingMethod.RAW],
    portionRanges: {
      min: 3,
      max: 10,
      typical: 5
    }
  },

  'star_anise': {
    category: ComponentCategory.SEASONING,
    isCommonComponent: true,
    typicalDishes: ['越南河粉', '滷味', '紅燒肉'],
    cookingMethods: [CookingMethod.BOILED, CookingMethod.BRAISED],
    portionRanges: {
      min: 1,
      max: 3,
      typical: 2
    }
  },

  'preserved_radish': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['泰式炒河粉', '炒飯'],
    cookingMethods: [CookingMethod.STIR_FRIED],
    portionRanges: {
      min: 5,
      max: 15,
      typical: 10
    }
  },

  'chinese_chives': {
    category: ComponentCategory.VEGETABLE,
    isCommonComponent: true,
    typicalDishes: ['泰式炒河粉', '餃子', '韭菜盒子'],
    cookingMethods: [CookingMethod.STIR_FRIED, CookingMethod.BOILED],
    portionRanges: {
      min: 15,
      max: 30,
      typical: 20
    }
  },

  'beef_bone_broth': {
    category: ComponentCategory.SAUCE,
    isCommonComponent: true,
    typicalDishes: ['越南河粉', '牛肉麵', '湯品'],
    cookingMethods: [CookingMethod.BOILED],
    portionRanges: {
      min: 300,
      max: 450,
      typical: 350
    }
  }
};

/**
 * 根據食材 ID 獲取成分資訊
 */
export function getComponentInfo(foodItemId: string): ComponentInfo | undefined {
  return COMPONENT_INFO_EXTENSIONS[foodItemId];
}

/**
 * 檢查食材是否為常見成分
 */
export function isCommonComponent(foodItemId: string): boolean {
  const info = COMPONENT_INFO_EXTENSIONS[foodItemId];
  return info?.isCommonComponent ?? false;
}

/**
 * 根據類別獲取所有常見成分
 */
export function getCommonComponentsByCategory(category: ComponentCategory): string[] {
  return Object.entries(COMPONENT_INFO_EXTENSIONS)
    .filter(([_, info]) => info.category === category && info.isCommonComponent)
    .map(([id, _]) => id);
}
