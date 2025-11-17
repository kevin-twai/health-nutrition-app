/**
 * 料理-成分映射數據
 * Dish-Component Mapping Data
 * 
 * 此文件定義了各種亞洲料理的常見成分映射，包括：
 * - 常見成分列表
 * - 份量範圍
 * - 烹飪方式
 * - 地域變化
 */

import {
  DishComponentMap,
  DishType,
  ComponentCategory,
  CookingMethod
} from '../types/ComponentDetection';

/**
 * 料理-成分映射數據庫
 * 包含至少 5 種常見亞洲料理的詳細成分映射
 */
export const DISH_COMPONENT_MAPS: DishComponentMap[] = [
  // ==================== 蛋炒飯 ====================
  {
    dishName: '蛋炒飯',
    dishNameEn: 'Egg Fried Rice',
    dishType: DishType.FRIED_RICE,
    region: ['taiwan', 'china'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 300 },
        frequency: 1.0,
        alternatives: ['糙米飯', '炒飯'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 3.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製過程增加油脂，卡路里提升約30%'
          }
        ]
      },
      {
        name: '雞蛋',
        nameEn: 'Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 30, max: 100 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.2,
            fatMultiplier: 1.5,
            proteinRetention: 0.98,
            vitaminRetention: 0.90,
            notes: '炒蛋增加少量油脂'
          }
        ]
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 20 },
        frequency: 0.9,
        alternatives: ['蔥花'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '青豆',
        nameEn: 'Green Peas',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 40 },
        frequency: 0.7,
        alternatives: ['玉米粒', '胡蘿蔔丁'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '玉米粒',
        nameEn: 'Corn Kernels',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 40 },
        frequency: 0.6,
        alternatives: ['青豆'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '火腿',
            nameEn: 'Ham',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.7,
            alternatives: ['香腸', '培根'],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式炒飯常加火腿或香腸，增添鹹香風味'
      },
      {
        region: 'china',
        components: [
          {
            name: '叉燒',
            nameEn: 'Char Siu',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.6,
            alternatives: ['火腿'],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '廣式炒飯常用叉燒，帶有甜鹹風味'
      }
    ],
    typicalPortionRange: {
      min: 250,
      max: 400,
      typical: 300
    }
  },

  // ==================== 味噌湯 ====================
  {
    dishName: '味噌湯',
    dishNameEn: 'Miso Soup',
    dishType: DishType.SOUP,
    region: ['japan'],
    commonComponents: [
      {
        name: '味噌',
        nameEn: 'Miso Paste',
        category: ComponentCategory.SEASONING,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 1.0,
        alternatives: ['白味噌', '紅味噌'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '豆腐',
        nameEn: 'Tofu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.9,
        alternatives: ['油豆腐'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '煮湯對營養影響較小'
          }
        ]
      },
      {
        name: '海帶芽',
        nameEn: 'Wakame Seaweed',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: ['海帶'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '柴魚高湯',
        nameEn: 'Dashi Stock',
        category: ComponentCategory.SAUCE,
        typicalPortion: 200,
        portionRange: { min: 150, max: 300 },
        frequency: 1.0,
        alternatives: ['昆布高湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'japan',
        components: [
          {
            name: '金針菇',
            nameEn: 'Enoki Mushroom',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 10, max: 40 },
            frequency: 0.5,
            alternatives: ['香菇'],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '日式味噌湯常加入各種菇類增加風味'
      }
    ],
    typicalPortionRange: {
      min: 200,
      max: 350,
      typical: 250
    }
  },

  // ==================== 蛋花湯 ====================
  {
    dishName: '蛋花湯',
    dishNameEn: 'Egg Drop Soup',
    dishType: DishType.SOUP,
    region: ['china', 'taiwan'],
    commonComponents: [
      {
        name: '雞蛋',
        nameEn: 'Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留大部分營養'
          }
        ]
      },
      {
        name: '雞湯',
        nameEn: 'Chicken Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 250,
        portionRange: { min: 200, max: 350 },
        frequency: 1.0,
        alternatives: ['清湯', '高湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: ['香菜'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '香油',
        nameEn: 'Sesame Oil',
        category: ComponentCategory.SEASONING,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '番茄',
            nameEn: 'Tomato',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式蛋花湯常加番茄增加酸甜風味'
      },
      {
        region: 'china',
        components: [
          {
            name: '木耳',
            nameEn: 'Wood Ear Mushroom',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 20 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '中式蛋花湯有時會加木耳增加口感'
      }
    ],
    typicalPortionRange: {
      min: 250,
      max: 400,
      typical: 300
    }
  },

  // ==================== 貢丸湯 ====================
  {
    dishName: '貢丸湯',
    dishNameEn: 'Pork Ball Soup',
    dishType: DishType.SOUP,
    region: ['taiwan'],
    commonComponents: [
      {
        name: '貢丸',
        nameEn: 'Pork Balls',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 80,
        portionRange: { min: 60, max: 120 },
        frequency: 1.0,
        alternatives: ['魚丸', '牛肉丸'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '清湯',
        nameEn: 'Clear Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 250,
        portionRange: { min: 200, max: 350 },
        frequency: 1.0,
        alternatives: ['大骨湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '芹菜',
        nameEn: 'Celery',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 10,
        portionRange: { min: 5, max: 20 },
        frequency: 0.8,
        alternatives: ['香菜'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '白胡椒粉',
        nameEn: 'White Pepper',
        category: ComponentCategory.SEASONING,
        typicalPortion: 1,
        portionRange: { min: 0.5, max: 2 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '油豆腐',
            nameEn: 'Fried Tofu',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.5,
            alternatives: ['豆腐'],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '冬粉',
            nameEn: 'Glass Noodles',
            category: ComponentCategory.GRAIN,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台灣貢丸湯常加油豆腐或冬粉，更加豐富'
      }
    ],
    typicalPortionRange: {
      min: 300,
      max: 450,
      typical: 350
    }
  },

  // ==================== 酸辣湯 ====================
  {
    dishName: '酸辣湯',
    dishNameEn: 'Hot and Sour Soup',
    dishType: DishType.SOUP,
    region: ['china', 'taiwan'],
    commonComponents: [
      {
        name: '豆腐',
        nameEn: 'Tofu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.9,
        alternatives: ['嫩豆腐'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '煮湯對營養影響較小'
          }
        ]
      },
      {
        name: '木耳',
        nameEn: 'Wood Ear Mushroom',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.8,
        alternatives: ['香菇'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '筍絲',
        nameEn: 'Bamboo Shoot Strips',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 35 },
        frequency: 0.8,
        alternatives: ['筍片'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '雞蛋',
        nameEn: 'Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '豬肉絲',
        nameEn: 'Pork Strips',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.7,
        alternatives: ['雞肉絲'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '酸辣湯底',
        nameEn: 'Hot and Sour Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 250,
        portionRange: { min: 200, max: 350 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '香菜',
        nameEn: 'Cilantro',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.7,
        alternatives: ['青蔥'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '白胡椒粉',
        nameEn: 'White Pepper',
        category: ComponentCategory.SEASONING,
        typicalPortion: 1,
        portionRange: { min: 0.5, max: 2 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '香油',
        nameEn: 'Sesame Oil',
        category: ComponentCategory.SEASONING,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'sichuan',
        components: [
          {
            name: '辣椒油',
            nameEn: 'Chili Oil',
            category: ComponentCategory.SEASONING,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.8,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '四川酸辣湯更辣，會加入更多辣椒油'
      },
      {
        region: 'taiwan',
        components: [
          {
            name: '鴨血',
            nameEn: 'Duck Blood',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式酸辣湯有時會加鴨血，口感更豐富'
      }
    ],
    typicalPortionRange: {
      min: 300,
      max: 450,
      typical: 350
    }
  },

  // ==================== 台式便當 ====================
  {
    dishName: '台式便當',
    dishNameEn: 'Taiwanese Bento',
    dishType: DishType.BENTO,
    region: ['taiwan'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 300 },
        frequency: 1.0,
        alternatives: ['糙米飯'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '滷蛋',
        nameEn: 'Braised Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 50, max: 60 },
        frequency: 0.9,
        alternatives: ['荷包蛋'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: [
          {
            method: CookingMethod.BRAISED,
            calorieMultiplier: 1.1,
            fatMultiplier: 1.2,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '滷製增加少量醬汁熱量'
          }
        ]
      },
      {
        name: '炸雞腿',
        nameEn: 'Fried Chicken Leg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 120,
        portionRange: { min: 100, max: 150 },
        frequency: 0.7,
        alternatives: ['排骨', '滷雞腿', '烤雞腿'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 1.8,
            fatMultiplier: 3.5,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸大幅增加油脂和卡路里'
          }
        ]
      },
      {
        name: '高麗菜',
        nameEn: 'Cabbage',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.8,
        alternatives: ['青江菜'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '豆乾',
        nameEn: 'Dried Tofu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.7,
        alternatives: ['豆腐'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: []
      },
      {
        name: '酸菜',
        nameEn: 'Pickled Mustard Greens',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 30 },
        frequency: 0.6,
        alternatives: ['泡菜'],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '滷肉',
            nameEn: 'Braised Pork',
            category: ComponentCategory.SAUCE,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.8,
            alternatives: ['肉燥'],
            cookingMethods: [CookingMethod.BRAISED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式便當常淋上滷肉或肉燥，是台灣特色'
      }
    ],
    typicalPortionRange: {
      min: 400,
      max: 600,
      typical: 500
    }
  },

  // ==================== 拉麵 ====================
  {
    dishName: '拉麵',
    dishNameEn: 'Ramen',
    dishType: DishType.NOODLES,
    region: ['japan'],
    commonComponents: [
      {
        name: '拉麵',
        nameEn: 'Ramen Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 150,
        portionRange: { min: 120, max: 200 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留大部分營養'
          }
        ]
      },
      {
        name: '叉燒',
        nameEn: 'Char Siu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.9,
        alternatives: ['豬肉片'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: [
          {
            method: CookingMethod.BRAISED,
            calorieMultiplier: 1.2,
            fatMultiplier: 1.5,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '滷製增加醬汁熱量'
          }
        ]
      },
      {
        name: '溏心蛋',
        nameEn: 'Soft-Boiled Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 50, max: 60 },
        frequency: 0.8,
        alternatives: ['水煮蛋'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '筍乾',
        nameEn: 'Bamboo Shoots',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 40 },
        frequency: 0.7,
        alternatives: ['玉米筍'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '海苔',
        nameEn: 'Nori Seaweed',
        category: ComponentCategory.GARNISH,
        typicalPortion: 2,
        portionRange: { min: 1, max: 5 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '豚骨湯',
        nameEn: 'Tonkotsu Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 300,
        portionRange: { min: 250, max: 400 },
        frequency: 0.7,
        alternatives: ['醬油湯', '味噌湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'japan',
        components: [
          {
            name: '木耳',
            nameEn: 'Wood Ear Mushroom',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 20 },
            frequency: 0.5,
            alternatives: ['香菇'],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '玉米',
            nameEn: 'Corn',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '日式拉麵有多種湯底變化，如豚骨、醬油、味噌等'
      }
    ],
    typicalPortionRange: {
      min: 500,
      max: 700,
      typical: 600
    }
  },

  // ==================== 烏龍麵 ====================
  {
    dishName: '烏龍麵',
    dishNameEn: 'Udon',
    dishType: DishType.NOODLES,
    region: ['japan'],
    commonComponents: [
      {
        name: '烏龍麵',
        nameEn: 'Udon Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 280 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '柴魚高湯',
        nameEn: 'Dashi Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 300,
        portionRange: { min: 250, max: 400 },
        frequency: 0.9,
        alternatives: ['昆布高湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '天婦羅',
        nameEn: 'Tempura',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 60,
        portionRange: { min: 40, max: 100 },
        frequency: 0.6,
        alternatives: ['炸蝦', '炸蔬菜'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 1.8,
            fatMultiplier: 3.5,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸大幅增加油脂'
          }
        ]
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '魚板',
        nameEn: 'Fish Cake',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.7,
        alternatives: ['蟹肉棒'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '海帶',
        nameEn: 'Kelp',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 10,
        portionRange: { min: 5, max: 20 },
        frequency: 0.5,
        alternatives: ['海帶芽'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'japan',
        components: [
          {
            name: '油豆腐',
            nameEn: 'Fried Tofu',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.6,
            alternatives: ['豆腐'],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '七味粉',
            nameEn: 'Shichimi',
            category: ComponentCategory.SEASONING,
            typicalPortion: 1,
            portionRange: { min: 0.5, max: 2 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '烏龍麵可以是湯麵或乾麵，常搭配天婦羅或油豆腐'
      }
    ],
    typicalPortionRange: {
      min: 450,
      max: 650,
      typical: 550
    }
  },

  // ==================== 米粉 ====================
  {
    dishName: '米粉',
    dishNameEn: 'Rice Noodles',
    dishType: DishType.NOODLES,
    region: ['taiwan', 'china'],
    commonComponents: [
      {
        name: '米粉',
        nameEn: 'Rice Vermicelli',
        category: ComponentCategory.GRAIN,
        typicalPortion: 120,
        portionRange: { min: 100, max: 180 },
        frequency: 1.0,
        alternatives: ['粗米粉', '細米粉'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '豬肉絲',
        nameEn: 'Pork Strips',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.8,
        alternatives: ['雞肉絲'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '香菇',
        nameEn: 'Shiitake Mushroom',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 40 },
        frequency: 0.7,
        alternatives: ['木耳'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '高麗菜',
        nameEn: 'Cabbage',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.8,
        alternatives: ['青江菜'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '紅蘿蔔絲',
        nameEn: 'Carrot Strips',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 40 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '芹菜',
        nameEn: 'Celery',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.8,
        alternatives: ['香菜'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '清湯',
        nameEn: 'Clear Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 250,
        portionRange: { min: 200, max: 350 },
        frequency: 0.9,
        alternatives: ['大骨湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '蝦米',
            nameEn: 'Dried Shrimp',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 10,
            portionRange: { min: 5, max: 20 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '油蔥酥',
            nameEn: 'Fried Shallots',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.8,
            alternatives: [],
            cookingMethods: [CookingMethod.FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式米粉湯常加蝦米和油蔥酥提味，是傳統小吃'
      },
      {
        region: 'china',
        components: [
          {
            name: '酸菜',
            nameEn: 'Pickled Mustard Greens',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 10, max: 30 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '中式米粉有時會加酸菜增加酸味'
      }
    ],
    typicalPortionRange: {
      min: 350,
      max: 500,
      typical: 400
    }
  },

  // ==================== 河粉 ====================
  {
    dishName: '河粉',
    dishNameEn: 'Rice Noodle Sheets',
    dishType: DishType.NOODLES,
    region: ['china', 'vietnam'],
    commonComponents: [
      {
        name: '河粉',
        nameEn: 'Flat Rice Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 280 },
        frequency: 1.0,
        alternatives: ['粿條'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '牛肉片',
        nameEn: 'Beef Slices',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 80,
        portionRange: { min: 60, max: 120 },
        frequency: 0.8,
        alternatives: ['雞肉片', '豬肉片'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '豆芽菜',
        nameEn: 'Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '香菜',
        nameEn: 'Cilantro',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '牛骨湯',
        nameEn: 'Beef Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 300,
        portionRange: { min: 250, max: 400 },
        frequency: 0.9,
        alternatives: ['清湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'guangdong',
        components: [
          {
            name: '牛肚',
            nameEn: 'Beef Tripe',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.5,
            alternatives: ['牛筋'],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '油條',
            nameEn: 'Fried Dough',
            category: ComponentCategory.GRAIN,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.DEEP_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '廣東牛肉河粉常加牛肚、牛筋等內臟，有時搭配油條'
      },
      {
        region: 'vietnam',
        components: [
          {
            name: '羅勒',
            nameEn: 'Thai Basil',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.7,
            alternatives: ['九層塔'],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '檸檬',
            nameEn: 'Lime',
            category: ComponentCategory.GARNISH,
            typicalPortion: 10,
            portionRange: { min: 5, max: 20 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '辣椒',
            nameEn: 'Chili Pepper',
            category: ComponentCategory.SEASONING,
            typicalPortion: 5,
            portionRange: { min: 2, max: 10 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '越南河粉（Pho）會加羅勒、檸檬和辣椒，風味獨特'
      }
    ],
    typicalPortionRange: {
      min: 500,
      max: 700,
      typical: 600
    }
  },

  // ==================== 炒麵 ====================
  {
    dishName: '炒麵',
    dishNameEn: 'Stir-Fried Noodles',
    dishType: DishType.STIR_FRY,
    region: ['china', 'taiwan'],
    commonComponents: [
      {
        name: '麵條',
        nameEn: 'Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 180,
        portionRange: { min: 150, max: 250 },
        frequency: 1.0,
        alternatives: ['油麵', '陽春麵'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.4,
            fatMultiplier: 3.5,
            proteinRetention: 0.95,
            vitaminRetention: 0.80,
            notes: '炒製過程吸收大量油脂'
          }
        ]
      },
      {
        name: '高麗菜',
        nameEn: 'Cabbage',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 60,
        portionRange: { min: 40, max: 100 },
        frequency: 0.9,
        alternatives: ['青江菜', '豆芽菜'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '紅蘿蔔',
        nameEn: 'Carrot',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '豬肉絲',
        nameEn: 'Pork Strips',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.7,
        alternatives: ['雞肉絲', '牛肉絲'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製增加油脂'
          }
        ]
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 20 },
        frequency: 0.9,
        alternatives: ['蔥段'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '豆芽菜',
        nameEn: 'Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.6,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '魷魚',
            nameEn: 'Squid',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.5,
            alternatives: ['蝦仁'],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式炒麵常加海鮮如魷魚或蝦仁'
      },
      {
        region: 'china',
        components: [
          {
            name: '木耳',
            nameEn: 'Wood Ear Mushroom',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 10, max: 30 },
            frequency: 0.6,
            alternatives: ['香菇'],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '中式炒麵常加木耳或香菇增加口感'
      }
    ],
    typicalPortionRange: {
      min: 300,
      max: 450,
      typical: 350
    }
  },

  // ==================== 炒青菜 ====================
  {
    dishName: '炒青菜',
    dishNameEn: 'Stir-Fried Vegetables',
    dishType: DishType.STIR_FRY,
    region: ['china', 'taiwan'],
    commonComponents: [
      {
        name: '青江菜',
        nameEn: 'Bok Choy',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 150,
        portionRange: { min: 100, max: 200 },
        frequency: 0.8,
        alternatives: ['小白菜', '油菜', '菠菜'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.5,
            fatMultiplier: 4.0,
            proteinRetention: 0.90,
            vitaminRetention: 0.75,
            notes: '炒製增加油脂，部分維生素流失'
          }
        ]
      },
      {
        name: '蒜頭',
        nameEn: 'Garlic',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: ['蒜末'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '食用油',
        nameEn: 'Cooking Oil',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 8, max: 15 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '薑絲',
            nameEn: 'Ginger Strips',
            category: ComponentCategory.SEASONING,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式炒青菜常加薑絲提味'
      },
      {
        region: 'china',
        components: [
          {
            name: '辣椒',
            nameEn: 'Chili Pepper',
            category: ComponentCategory.SEASONING,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '中式炒青菜有時會加辣椒增加風味'
      }
    ],
    typicalPortionRange: {
      min: 150,
      max: 250,
      typical: 180
    }
  },

  // ==================== 宮保雞丁 ====================
  {
    dishName: '宮保雞丁',
    dishNameEn: 'Kung Pao Chicken',
    dishType: DishType.STIR_FRY,
    region: ['china', 'sichuan'],
    commonComponents: [
      {
        name: '雞肉丁',
        nameEn: 'Chicken Cubes',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 120,
        portionRange: { min: 100, max: 150 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.4,
            fatMultiplier: 2.5,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製增加油脂和熱量'
          }
        ]
      },
      {
        name: '花生',
        nameEn: 'Peanuts',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.9,
        alternatives: ['腰果'],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: []
      },
      {
        name: '乾辣椒',
        nameEn: 'Dried Chili Pepper',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '青椒',
        nameEn: 'Green Pepper',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.7,
        alternatives: ['彩椒'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '紅蘿蔔丁',
        nameEn: 'Carrot Cubes',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.6,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '青蔥段',
        nameEn: 'Scallion Sections',
        category: ComponentCategory.GARNISH,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '蒜片',
        nameEn: 'Garlic Slices',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.8,
        alternatives: ['蒜末'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '薑片',
        nameEn: 'Ginger Slices',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '宮保醬汁',
        nameEn: 'Kung Pao Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'sichuan',
        components: [
          {
            name: '花椒',
            nameEn: 'Sichuan Peppercorn',
            category: ComponentCategory.SEASONING,
            typicalPortion: 3,
            portionRange: { min: 2, max: 5 },
            frequency: 0.9,
            alternatives: [],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '正宗四川宮保雞丁必須加花椒，帶有麻辣風味'
      },
      {
        region: 'taiwan',
        components: [
          {
            name: '甜椒',
            nameEn: 'Bell Pepper',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式宮保雞丁較不辣，常加甜椒增加色彩'
      }
    ],
    typicalPortionRange: {
      min: 250,
      max: 400,
      typical: 300
    }
  },

  // ==================== 日式便當 ====================
  {
    dishName: '日式便當',
    dishNameEn: 'Japanese Bento',
    dishType: DishType.BENTO,
    region: ['japan'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 180,
        portionRange: { min: 150, max: 250 },
        frequency: 1.0,
        alternatives: ['壽司飯'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '炸豬排',
        nameEn: 'Tonkatsu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 100,
        portionRange: { min: 80, max: 130 },
        frequency: 0.6,
        alternatives: ['炸雞排', '照燒雞腿', '烤魚'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 1.8,
            fatMultiplier: 3.5,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸大幅增加油脂和卡路里'
          }
        ]
      },
      {
        name: '玉子燒',
        nameEn: 'Tamagoyaki',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: ['煎蛋'],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '煎製增加油脂'
          }
        ]
      },
      {
        name: '炒青菜',
        nameEn: 'Stir-Fried Vegetables',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.8,
        alternatives: ['燙青菜'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '醃漬物',
        nameEn: 'Pickles',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 30 },
        frequency: 0.7,
        alternatives: ['醃蘿蔔', '醃黃瓜'],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '炸蝦',
        nameEn: 'Fried Shrimp',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.5,
        alternatives: ['天婦羅'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '煮物',
        nameEn: 'Nimono',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.6,
        alternatives: ['燉菜'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'japan',
        components: [
          {
            name: '梅乾',
            nameEn: 'Umeboshi',
            category: ComponentCategory.GARNISH,
            typicalPortion: 10,
            portionRange: { min: 5, max: 15 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.PICKLED],
            nutritionImpact: []
          },
          {
            name: '海苔',
            nameEn: 'Nori',
            category: ComponentCategory.GARNISH,
            typicalPortion: 2,
            portionRange: { min: 1, max: 5 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '日式便當注重色彩搭配和營養均衡，常有梅乾和海苔裝飾'
      }
    ],
    typicalPortionRange: {
      min: 400,
      max: 600,
      typical: 500
    }
  },

  // ==================== 韓式便當 ====================
  {
    dishName: '韓式便當',
    dishNameEn: 'Korean Bento',
    dishType: DishType.BENTO,
    region: ['korea'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 280 },
        frequency: 1.0,
        alternatives: ['紫米飯', '雜糧飯'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '韓式烤肉',
        nameEn: 'Korean BBQ',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 100,
        portionRange: { min: 80, max: 130 },
        frequency: 0.7,
        alternatives: ['炸雞', '烤魚'],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: [
          {
            method: CookingMethod.GRILLED,
            calorieMultiplier: 1.2,
            fatMultiplier: 1.5,
            proteinRetention: 0.92,
            vitaminRetention: 0.80,
            notes: '烤製增加少量油脂'
          }
        ]
      },
      {
        name: '泡菜',
        nameEn: 'Kimchi',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.95,
        alternatives: ['白泡菜', '蘿蔔泡菜'],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '煎蛋',
        nameEn: 'Fried Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 40, max: 60 },
        frequency: 0.8,
        alternatives: ['蒸蛋'],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '煎製增加油脂'
          }
        ]
      },
      {
        name: '炒菠菜',
        nameEn: 'Stir-Fried Spinach',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.7,
        alternatives: ['涼拌菠菜'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '炒豆芽',
        nameEn: 'Stir-Fried Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.6,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '炒魚板',
        nameEn: 'Stir-Fried Fish Cake',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.5,
        alternatives: ['炒年糕'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'korea',
        components: [
          {
            name: '辣椒醬',
            nameEn: 'Gochujang',
            category: ComponentCategory.SAUCE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 20 },
            frequency: 0.6,
            alternatives: ['辣椒粉'],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '芝麻',
            nameEn: 'Sesame Seeds',
            category: ComponentCategory.GARNISH,
            typicalPortion: 3,
            portionRange: { min: 2, max: 5 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '韓式便當特色是多種小菜（반찬），注重發酵食品和辣味'
      }
    ],
    typicalPortionRange: {
      min: 450,
      max: 650,
      typical: 550
    }
  },

  // ==================== 餃子 ====================
  {
    dishName: '餃子',
    dishNameEn: 'Dumplings',
    dishType: DishType.DUMPLING,
    region: ['china', 'taiwan'],
    commonComponents: [
      {
        name: '餃子皮',
        nameEn: 'Dumpling Wrapper',
        category: ComponentCategory.GRAIN,
        typicalPortion: 20,
        portionRange: { min: 15, max: 25 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '豬肉餡',
        nameEn: 'Pork Filling',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 15,
        portionRange: { min: 12, max: 20 },
        frequency: 0.9,
        alternatives: ['牛肉餡', '羊肉餡'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '高麗菜',
        nameEn: 'Cabbage',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 8,
        portionRange: { min: 5, max: 12 },
        frequency: 0.8,
        alternatives: ['韭菜', '白菜'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '薑末',
        nameEn: 'Minced Ginger',
        category: ComponentCategory.SEASONING,
        typicalPortion: 2,
        portionRange: { min: 1, max: 3 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '蒜末',
        nameEn: 'Minced Garlic',
        category: ComponentCategory.SEASONING,
        typicalPortion: 2,
        portionRange: { min: 1, max: 3 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'china',
        components: [
          {
            name: '韭菜',
            nameEn: 'Chinese Chives',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 8,
            portionRange: { min: 5, max: 12 },
            frequency: 0.7,
            alternatives: ['高麗菜'],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '蝦仁',
            nameEn: 'Shrimp',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 10,
            portionRange: { min: 8, max: 15 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '中式餃子常用韭菜豬肉或三鮮（豬肉、蝦仁、韭菜）餡'
      },
      {
        region: 'taiwan',
        components: [
          {
            name: '玉米',
            nameEn: 'Corn',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 5,
            portionRange: { min: 3, max: 8 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式餃子有時會加玉米增加甜味和口感'
      }
    ],
    typicalPortionRange: {
      min: 40,
      max: 60,
      typical: 50
    }
  },

  // ==================== 燒賣 ====================
  {
    dishName: '燒賣',
    dishNameEn: 'Shumai',
    dishType: DishType.DUMPLING,
    region: ['china', 'hongkong'],
    commonComponents: [
      {
        name: '燒賣皮',
        nameEn: 'Shumai Wrapper',
        category: ComponentCategory.GRAIN,
        typicalPortion: 12,
        portionRange: { min: 10, max: 15 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '豬肉餡',
        nameEn: 'Pork Filling',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 15,
        portionRange: { min: 12, max: 20 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: [
          {
            method: CookingMethod.STEAMED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '蒸製保留營養'
          }
        ]
      },
      {
        name: '蝦仁',
        nameEn: 'Shrimp',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 8,
        portionRange: { min: 5, max: 12 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: [
          {
            method: CookingMethod.STEAMED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '蒸製保留營養'
          }
        ]
      },
      {
        name: '香菇',
        nameEn: 'Shiitake Mushroom',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 5,
        portionRange: { min: 3, max: 8 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '魚卵',
        nameEn: 'Fish Roe',
        category: ComponentCategory.GARNISH,
        typicalPortion: 2,
        portionRange: { min: 1, max: 3 },
        frequency: 0.6,
        alternatives: ['蟹黃'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '青豆',
        nameEn: 'Green Peas',
        category: ComponentCategory.GARNISH,
        typicalPortion: 2,
        portionRange: { min: 1, max: 3 },
        frequency: 0.5,
        alternatives: ['玉米粒'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'hongkong',
        components: [
          {
            name: '蟹黃',
            nameEn: 'Crab Roe',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 3,
            portionRange: { min: 2, max: 5 },
            frequency: 0.4,
            alternatives: ['魚卵'],
            cookingMethods: [CookingMethod.STEAMED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '港式燒賣頂部常放魚卵或蟹黃裝飾，是經典港式點心'
      },
      {
        region: 'guangdong',
        components: [
          {
            name: '馬蹄',
            nameEn: 'Water Chestnut',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 5,
            portionRange: { min: 3, max: 8 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.STEAMED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '廣式燒賣常加馬蹄增加爽脆口感'
      }
    ],
    typicalPortionRange: {
      min: 35,
      max: 55,
      typical: 45
    }
  },

  // ==================== 春捲 ====================
  {
    dishName: '春捲',
    dishNameEn: 'Spring Roll',
    dishType: DishType.DUMPLING,
    region: ['china', 'taiwan', 'vietnam'],
    commonComponents: [
      {
        name: '春捲皮',
        nameEn: 'Spring Roll Wrapper',
        category: ComponentCategory.GRAIN,
        typicalPortion: 20,
        portionRange: { min: 15, max: 25 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 2.0,
            fatMultiplier: 4.0,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸大幅增加油脂和卡路里'
          }
        ]
      },
      {
        name: '豬肉絲',
        nameEn: 'Pork Strips',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 25,
        portionRange: { min: 20, max: 35 },
        frequency: 0.8,
        alternatives: ['雞肉絲', '蝦仁'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 1.8,
            fatMultiplier: 3.5,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸增加大量油脂'
          }
        ]
      },
      {
        name: '高麗菜絲',
        nameEn: 'Shredded Cabbage',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 0.9,
        alternatives: ['韭菜'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '紅蘿蔔絲',
        nameEn: 'Shredded Carrot',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 20 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '豆芽菜',
        nameEn: 'Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 20 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '香菇絲',
        nameEn: 'Shredded Mushroom',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.6,
        alternatives: ['木耳絲'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '冬粉',
        nameEn: 'Glass Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 15,
        portionRange: { min: 10, max: 20 },
        frequency: 0.5,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '花生粉',
            nameEn: 'Peanut Powder',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 8 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '香菜',
            nameEn: 'Cilantro',
            category: ComponentCategory.GARNISH,
            typicalPortion: 3,
            portionRange: { min: 2, max: 5 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式潤餅（春捲）不油炸，會加花生粉和香菜，是清明節傳統食物'
      },
      {
        region: 'vietnam',
        components: [
          {
            name: '生菜',
            nameEn: 'Lettuce',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 15 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '薄荷葉',
            nameEn: 'Mint Leaves',
            category: ComponentCategory.GARNISH,
            typicalPortion: 3,
            portionRange: { min: 2, max: 5 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '米紙',
            nameEn: 'Rice Paper',
            category: ComponentCategory.GRAIN,
            typicalPortion: 15,
            portionRange: { min: 10, max: 20 },
            frequency: 1.0,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '越南春捲（生春捲）不油炸，用米紙包裹，清爽健康'
      }
    ],
    typicalPortionRange: {
      min: 80,
      max: 120,
      typical: 100
    }
  },

  // ==================== 烤肉 ====================
  {
    dishName: '烤肉',
    dishNameEn: 'Grilled Meat',
    dishType: DishType.BARBECUE,
    region: ['china', 'taiwan', 'korea', 'japan'],
    commonComponents: [
      {
        name: '豬肉片',
        nameEn: 'Pork Slices',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 120,
        portionRange: { min: 100, max: 150 },
        frequency: 0.8,
        alternatives: ['牛肉片', '雞肉片', '羊肉片'],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: [
          {
            method: CookingMethod.GRILLED,
            calorieMultiplier: 1.2,
            fatMultiplier: 1.5,
            proteinRetention: 0.92,
            vitaminRetention: 0.80,
            notes: '烤製會流失部分油脂，但仍增加焦化熱量'
          }
        ]
      },
      {
        name: '烤肉醬',
        nameEn: 'BBQ Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.9,
        alternatives: ['醬油', '鹽'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '青椒',
        nameEn: 'Green Pepper',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.7,
        alternatives: ['彩椒'],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: [
          {
            method: CookingMethod.GRILLED,
            calorieMultiplier: 1.1,
            fatMultiplier: 1.2,
            proteinRetention: 0.95,
            vitaminRetention: 0.75,
            notes: '烤製會流失部分維生素'
          }
        ]
      },
      {
        name: '洋蔥',
        nameEn: 'Onion',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: []
      },
      {
        name: '香菇',
        nameEn: 'Shiitake Mushroom',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.6,
        alternatives: ['杏鮑菇', '金針菇'],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: []
      },
      {
        name: '玉米',
        nameEn: 'Corn',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 80,
        portionRange: { min: 60, max: 120 },
        frequency: 0.5,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: []
      },
      {
        name: '蒜頭',
        nameEn: 'Garlic',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'korea',
        components: [
          {
            name: '生菜',
            nameEn: 'Lettuce',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 15, max: 30 },
            frequency: 0.9,
            alternatives: ['芝麻葉'],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '泡菜',
            nameEn: 'Kimchi',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.8,
            alternatives: [],
            cookingMethods: [CookingMethod.PICKLED],
            nutritionImpact: []
          },
          {
            name: '辣椒醬',
            nameEn: 'Gochujang',
            category: ComponentCategory.SAUCE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 15 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '芝麻油',
            nameEn: 'Sesame Oil',
            category: ComponentCategory.SEASONING,
            typicalPortion: 5,
            portionRange: { min: 3, max: 8 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '韓式烤肉會用生菜包肉，搭配泡菜和辣椒醬，是韓國飲食文化的代表'
      },
      {
        region: 'japan',
        components: [
          {
            name: '照燒醬',
            nameEn: 'Teriyaki Sauce',
            category: ComponentCategory.SAUCE,
            typicalPortion: 15,
            portionRange: { min: 10, max: 20 },
            frequency: 0.7,
            alternatives: ['鹽燒'],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '白蘿蔔泥',
            nameEn: 'Grated Daikon',
            category: ComponentCategory.GARNISH,
            typicalPortion: 20,
            portionRange: { min: 15, max: 30 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '日式燒肉（焼肉）注重肉質本身，常用照燒醬或鹽燒'
      },
      {
        region: 'taiwan',
        components: [
          {
            name: '吐司',
            nameEn: 'Toast',
            category: ComponentCategory.GRAIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.GRILLED],
            nutritionImpact: []
          },
          {
            name: '米血糕',
            nameEn: 'Rice Blood Cake',
            category: ComponentCategory.GRAIN,
            typicalPortion: 60,
            portionRange: { min: 50, max: 80 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.GRILLED],
            nutritionImpact: []
          },
          {
            name: '甜不辣',
            nameEn: 'Fried Fish Cake',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.GRILLED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式烤肉會烤吐司、米血糕、甜不辣等多樣食材，是中秋節傳統活動'
      }
    ],
    typicalPortionRange: {
      min: 200,
      max: 350,
      typical: 250
    }
  },

  // ==================== 滷肉飯 ====================
  {
    dishName: '滷肉飯',
    dishNameEn: 'Braised Pork Rice',
    dishType: DishType.FRIED_RICE,
    region: ['taiwan'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 280 },
        frequency: 1.0,
        alternatives: ['糙米飯'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '滷肉',
        nameEn: 'Braised Pork',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 60,
        portionRange: { min: 40, max: 100 },
        frequency: 1.0,
        alternatives: ['肉燥'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: [
          {
            method: CookingMethod.BRAISED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.80,
            notes: '滷製過程吸收醬汁，增加油脂和鈉含量'
          }
        ]
      },
      {
        name: '滷蛋',
        nameEn: 'Braised Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 50, max: 60 },
        frequency: 0.8,
        alternatives: ['荷包蛋'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: [
          {
            method: CookingMethod.BRAISED,
            calorieMultiplier: 1.1,
            fatMultiplier: 1.2,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '滷製增加少量醬汁熱量'
          }
        ]
      },
      {
        name: '酸菜',
        nameEn: 'Pickled Mustard Greens',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 30 },
        frequency: 0.7,
        alternatives: ['醃蘿蔔'],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '青菜',
        nameEn: 'Vegetables',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.6,
        alternatives: ['燙青菜', '炒青菜'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '滷汁',
        nameEn: 'Braising Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '豆乾',
            nameEn: 'Dried Tofu',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.5,
            alternatives: ['豆腐'],
            cookingMethods: [CookingMethod.BRAISED],
            nutritionImpact: []
          },
          {
            name: '筍乾',
            nameEn: 'Dried Bamboo Shoots',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 10, max: 30 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.BRAISED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '滷肉飯是台灣最具代表性的小吃之一，滷汁香濃，常搭配滷蛋和酸菜'
      }
    ],
    typicalPortionRange: {
      min: 300,
      max: 450,
      typical: 350
    }
  },

  // ==================== 牛肉麵 ====================
  {
    dishName: '牛肉麵',
    dishNameEn: 'Beef Noodle Soup',
    dishType: DishType.NOODLES,
    region: ['taiwan'],
    commonComponents: [
      {
        name: '麵條',
        nameEn: 'Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 180,
        portionRange: { min: 150, max: 250 },
        frequency: 1.0,
        alternatives: ['細麵', '寬麵', '刀削麵'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '牛肉塊',
        nameEn: 'Beef Chunks',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 100,
        portionRange: { min: 80, max: 150 },
        frequency: 1.0,
        alternatives: ['牛腱', '牛筋'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: [
          {
            method: CookingMethod.BRAISED,
            calorieMultiplier: 1.1,
            fatMultiplier: 1.3,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '滷製保留大部分營養，增加少量醬汁熱量'
          }
        ]
      },
      {
        name: '牛肉湯',
        nameEn: 'Beef Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 350,
        portionRange: { min: 300, max: 450 },
        frequency: 1.0,
        alternatives: ['紅燒湯', '清燉湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '青菜',
        nameEn: 'Vegetables',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.9,
        alternatives: ['青江菜', '小白菜', '空心菜'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '酸菜',
        nameEn: 'Pickled Mustard Greens',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 10, max: 30 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '香菜',
        nameEn: 'Cilantro',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.6,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '辣椒',
        nameEn: 'Chili',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 2, max: 10 },
        frequency: 0.5,
        alternatives: ['辣油'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '牛筋',
            nameEn: 'Beef Tendon',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.6,
            alternatives: ['牛肚'],
            cookingMethods: [CookingMethod.BRAISED],
            nutritionImpact: []
          },
          {
            name: '豆乾',
            nameEn: 'Dried Tofu',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BRAISED],
            nutritionImpact: []
          },
          {
            name: '番茄',
            nameEn: 'Tomato',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 40,
            portionRange: { min: 30, max: 60 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台灣牛肉麵有紅燒和清燉兩大派系，是台灣國民美食，常加牛筋、豆乾等配料'
      }
    ],
    typicalPortionRange: {
      min: 600,
      max: 850,
      typical: 700
    }
  },

  // ==================== 蚵仔煎 ====================
  {
    dishName: '蚵仔煎',
    dishNameEn: 'Oyster Omelette',
    dishType: DishType.STIR_FRY,
    region: ['taiwan'],
    commonComponents: [
      {
        name: '蚵仔',
        nameEn: 'Oysters',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 60,
        portionRange: { min: 50, max: 80 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.5,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '煎製增加油脂'
          }
        ]
      },
      {
        name: '雞蛋',
        nameEn: 'Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 40, max: 60 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '煎製增加油脂'
          }
        ]
      },
      {
        name: '地瓜粉漿',
        nameEn: 'Sweet Potato Starch Batter',
        category: ComponentCategory.GRAIN,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 1.0,
        alternatives: ['太白粉漿'],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: []
      },
      {
        name: '小白菜',
        nameEn: 'Baby Bok Choy',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: ['青江菜', '茼蒿'],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: []
      },
      {
        name: '豆芽菜',
        nameEn: 'Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: []
      },
      {
        name: '甜辣醬',
        nameEn: 'Sweet Chili Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '香菜',
            nameEn: 'Cilantro',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '蚵仔煎是台灣夜市最具代表性的小吃，外皮酥脆，內餡鮮美，搭配甜辣醬是經典吃法'
      }
    ],
    typicalPortionRange: {
      min: 180,
      max: 280,
      typical: 220
    }
  },

  // ==================== 臭豆腐 ====================
  {
    dishName: '臭豆腐',
    dishNameEn: 'Stinky Tofu',
    dishType: DishType.STIR_FRY,
    region: ['taiwan'],
    commonComponents: [
      {
        name: '臭豆腐',
        nameEn: 'Fermented Tofu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 120,
        portionRange: { min: 100, max: 150 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 2.0,
            fatMultiplier: 4.0,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸大幅增加油脂和卡路里'
          }
        ]
      },
      {
        name: '泡菜',
        nameEn: 'Pickled Cabbage',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: ['酸菜'],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '蒜泥',
        nameEn: 'Garlic Paste',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '辣椒醬',
        nameEn: 'Chili Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 10,
        portionRange: { min: 5, max: 20 },
        frequency: 0.7,
        alternatives: ['甜辣醬'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '醬油膏',
        nameEn: 'Soy Sauce Paste',
        category: ComponentCategory.SAUCE,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.8,
        alternatives: ['醬油'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '香菜',
        nameEn: 'Cilantro',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.6,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '九層塔',
            nameEn: 'Thai Basil',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '臭豆腐是台灣夜市必吃美食，外酥內嫩，搭配泡菜和蒜泥醬汁是經典吃法'
      }
    ],
    typicalPortionRange: {
      min: 150,
      max: 250,
      typical: 180
    }
  },

  // ==================== 鹽酥雞 ====================
  {
    dishName: '鹽酥雞',
    dishNameEn: 'Taiwanese Popcorn Chicken',
    dishType: DishType.STIR_FRY,
    region: ['taiwan'],
    commonComponents: [
      {
        name: '雞肉塊',
        nameEn: 'Chicken Chunks',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 100,
        portionRange: { min: 80, max: 150 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 1.8,
            fatMultiplier: 3.5,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸大幅增加油脂和卡路里'
          }
        ]
      },
      {
        name: '地瓜粉',
        nameEn: 'Sweet Potato Starch',
        category: ComponentCategory.GRAIN,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 1.0,
        alternatives: ['太白粉'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '九層塔',
        nameEn: 'Thai Basil',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: []
      },
      {
        name: '蒜頭',
        nameEn: 'Garlic',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.8,
        alternatives: ['蒜片'],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: []
      },
      {
        name: '辣椒',
        nameEn: 'Chili',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.6,
        alternatives: ['辣椒粉'],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: []
      },
      {
        name: '胡椒鹽',
        nameEn: 'Pepper Salt',
        category: ComponentCategory.SEASONING,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '青蔥',
            nameEn: 'Green Onion',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '鹽酥雞是台灣夜市最受歡迎的炸物，外皮酥脆，搭配九層塔和蒜頭香氣十足'
      }
    ],
    typicalPortionRange: {
      min: 120,
      max: 200,
      typical: 150
    }
  },

  // ==================== 壽司 ====================
  {
    dishName: '壽司',
    dishNameEn: 'Sushi',
    dishType: DishType.BENTO,
    region: ['japan'],
    commonComponents: [
      {
        name: '壽司飯',
        nameEn: 'Sushi Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 30,
        portionRange: { min: 25, max: 40 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '生魚片',
        nameEn: 'Sashimi',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 15,
        portionRange: { min: 10, max: 20 },
        frequency: 0.9,
        alternatives: ['鮭魚', '鮪魚', '蝦', '花枝'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: [
          {
            method: CookingMethod.RAW,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 1.0,
            vitaminRetention: 1.0,
            notes: '生食保留所有營養'
          }
        ]
      },
      {
        name: '海苔',
        nameEn: 'Nori',
        category: ComponentCategory.GARNISH,
        typicalPortion: 2,
        portionRange: { min: 1, max: 3 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '芥末',
        nameEn: 'Wasabi',
        category: ComponentCategory.SEASONING,
        typicalPortion: 2,
        portionRange: { min: 1, max: 3 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '醬油',
        nameEn: 'Soy Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '醃薑',
        nameEn: 'Pickled Ginger',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'japan',
        components: [
          {
            name: '玉子',
            nameEn: 'Tamago',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 20,
            portionRange: { min: 15, max: 25 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.STEAMED],
            nutritionImpact: []
          },
          {
            name: '小黃瓜',
            nameEn: 'Cucumber',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 15 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '酪梨',
            nameEn: 'Avocado',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 15,
            portionRange: { min: 10, max: 20 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '壽司是日本最具代表性的料理，講究食材新鮮度和米飯溫度'
      }
    ],
    typicalPortionRange: {
      min: 60,
      max: 100,
      typical: 80
    }
  },

  // ==================== 天婦羅 ====================
  {
    dishName: '天婦羅',
    dishNameEn: 'Tempura',
    dishType: DishType.STIR_FRY,
    region: ['japan'],
    commonComponents: [
      {
        name: '蝦',
        nameEn: 'Shrimp',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 60,
        portionRange: { min: 50, max: 80 },
        frequency: 0.9,
        alternatives: ['魚', '花枝'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.DEEP_FRIED,
            calorieMultiplier: 1.8,
            fatMultiplier: 3.5,
            proteinRetention: 0.90,
            vitaminRetention: 0.70,
            notes: '油炸大幅增加油脂'
          }
        ]
      },
      {
        name: '天婦羅麵衣',
        nameEn: 'Tempura Batter',
        category: ComponentCategory.GRAIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 40 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '茄子',
        nameEn: 'Eggplant',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '南瓜',
        nameEn: 'Pumpkin',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.7,
        alternatives: ['地瓜'],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '香菇',
        nameEn: 'Shiitake Mushroom',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.6,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '青椒',
        nameEn: 'Green Pepper',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.5,
        alternatives: [],
        cookingMethods: [CookingMethod.DEEP_FRIED],
        nutritionImpact: []
      },
      {
        name: '天婦羅醬',
        nameEn: 'Tentsuyu Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '白蘿蔔泥',
        nameEn: 'Grated Daikon',
        category: ComponentCategory.GARNISH,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'japan',
        components: [
          {
            name: '紫蘇葉',
            nameEn: 'Shiso Leaf',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.DEEP_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '天婦羅是日本傳統炸物，麵衣輕薄酥脆，講究油溫控制'
      }
    ],
    typicalPortionRange: {
      min: 200,
      max: 300,
      typical: 250
    }
  },

  // ==================== 日式定食 ====================
  {
    dishName: '日式定食',
    dishNameEn: 'Japanese Set Meal',
    dishType: DishType.BENTO,
    region: ['japan'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 180,
        portionRange: { min: 150, max: 250 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '味噌湯',
        nameEn: 'Miso Soup',
        category: ComponentCategory.SAUCE,
        typicalPortion: 150,
        portionRange: { min: 120, max: 200 },
        frequency: 0.9,
        alternatives: ['清湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '烤魚',
        nameEn: 'Grilled Fish',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 100,
        portionRange: { min: 80, max: 130 },
        frequency: 0.7,
        alternatives: ['照燒雞', '炸豬排', '生魚片'],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: [
          {
            method: CookingMethod.GRILLED,
            calorieMultiplier: 1.1,
            fatMultiplier: 1.2,
            proteinRetention: 0.92,
            vitaminRetention: 0.80,
            notes: '烤製保留大部分營養'
          }
        ]
      },
      {
        name: '醃漬物',
        nameEn: 'Tsukemono',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 0.9,
        alternatives: ['醃蘿蔔', '醃黃瓜', '梅乾'],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '冷豆腐',
        nameEn: 'Hiyayakko',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 80,
        portionRange: { min: 60, max: 100 },
        frequency: 0.6,
        alternatives: ['納豆'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '煮物',
        nameEn: 'Nimono',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 60,
        portionRange: { min: 40, max: 80 },
        frequency: 0.7,
        alternatives: ['燉菜'],
        cookingMethods: [CookingMethod.BRAISED],
        nutritionImpact: []
      },
      {
        name: '沙拉',
        nameEn: 'Salad',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 50,
        portionRange: { min: 30, max: 80 },
        frequency: 0.6,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'japan',
        components: [
          {
            name: '納豆',
            nameEn: 'Natto',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 40,
            portionRange: { min: 30, max: 50 },
            frequency: 0.5,
            alternatives: ['冷豆腐'],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '溫泉蛋',
            nameEn: 'Onsen Tamago',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 50,
            portionRange: { min: 50, max: 60 },
            frequency: 0.4,
            alternatives: ['生雞蛋'],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '日式定食講究營養均衡，一汁三菜是基本配置'
      }
    ],
    typicalPortionRange: {
      min: 500,
      max: 700,
      typical: 600
    }
  },

  // ==================== 韓式烤肉 ====================
  {
    dishName: '韓式烤肉',
    dishNameEn: 'Korean BBQ',
    dishType: DishType.BARBECUE,
    region: ['korea'],
    commonComponents: [
      {
        name: '牛肉片',
        nameEn: 'Beef Slices',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 120,
        portionRange: { min: 100, max: 150 },
        frequency: 0.8,
        alternatives: ['豬肉片', '雞肉片'],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: [
          {
            method: CookingMethod.GRILLED,
            calorieMultiplier: 1.2,
            fatMultiplier: 1.5,
            proteinRetention: 0.92,
            vitaminRetention: 0.80,
            notes: '烤製會流失部分油脂'
          }
        ]
      },
      {
        name: '生菜',
        nameEn: 'Lettuce',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.9,
        alternatives: ['芝麻葉'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '泡菜',
        nameEn: 'Kimchi',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.95,
        alternatives: ['白泡菜', '蘿蔔泡菜'],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '蒜片',
        nameEn: 'Garlic Slices',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: []
      },
      {
        name: '青辣椒',
        nameEn: 'Green Chili',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: []
      },
      {
        name: '洋蔥',
        nameEn: 'Onion',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: []
      },
      {
        name: '辣椒醬',
        nameEn: 'Gochujang',
        category: ComponentCategory.SAUCE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.8,
        alternatives: ['包飯醬'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '芝麻油',
        nameEn: 'Sesame Oil',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 150,
        portionRange: { min: 120, max: 200 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'korea',
        components: [
          {
            name: '芝麻葉',
            nameEn: 'Perilla Leaves',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 15, max: 30 },
            frequency: 0.7,
            alternatives: ['生菜'],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '大醬',
            nameEn: 'Doenjang',
            category: ComponentCategory.SAUCE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 15 },
            frequency: 0.6,
            alternatives: ['辣椒醬'],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '蔥沙拉',
            nameEn: 'Scallion Salad',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 15, max: 30 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '韓式烤肉用生菜包肉，搭配泡菜、大醬和辣椒醬，是韓國飲食文化的精髓'
      }
    ],
    typicalPortionRange: {
      min: 300,
      max: 450,
      typical: 350
    }
  },

  // ==================== 石鍋拌飯 ====================
  {
    dishName: '石鍋拌飯',
    dishNameEn: 'Bibimbap',
    dishType: DishType.FRIED_RICE,
    region: ['korea'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 280 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '牛肉絲',
        nameEn: 'Beef Strips',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 60,
        portionRange: { min: 50, max: 80 },
        frequency: 0.8,
        alternatives: ['豬肉絲', '雞肉絲'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製增加油脂'
          }
        ]
      },
      {
        name: '煎蛋',
        nameEn: 'Fried Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 50, max: 60 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '煎製增加油脂'
          }
        ]
      },
      {
        name: '菠菜',
        nameEn: 'Spinach',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '豆芽菜',
        nameEn: 'Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '紅蘿蔔絲',
        nameEn: 'Carrot Strips',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '櫛瓜',
        nameEn: 'Zucchini',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '香菇',
        nameEn: 'Shiitake Mushroom',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '泡菜',
        nameEn: 'Kimchi',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.PICKLED],
        nutritionImpact: []
      },
      {
        name: '辣椒醬',
        nameEn: 'Gochujang',
        category: ComponentCategory.SAUCE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '芝麻油',
        nameEn: 'Sesame Oil',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '芝麻',
        nameEn: 'Sesame Seeds',
        category: ComponentCategory.GARNISH,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'korea',
        components: [
          {
            name: '蕨菜',
            nameEn: 'Fernbrake',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '桔梗',
            nameEn: 'Bellflower Root',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 20,
            portionRange: { min: 15, max: 30 },
            frequency: 0.4,
            alternatives: [],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '石鍋拌飯是韓國代表性料理，五色食材象徵五行，營養均衡'
      }
    ],
    typicalPortionRange: {
      min: 450,
      max: 650,
      typical: 550
    }
  },

  // ==================== 泡菜鍋 ====================
  {
    dishName: '泡菜鍋',
    dishNameEn: 'Kimchi Jjigae',
    dishType: DishType.SOUP,
    region: ['korea'],
    commonComponents: [
      {
        name: '泡菜',
        nameEn: 'Kimchi',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 100,
        portionRange: { min: 80, max: 150 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '豬肉片',
        nameEn: 'Pork Slices',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 80,
        portionRange: { min: 60, max: 120 },
        frequency: 0.9,
        alternatives: ['五花肉', '豬肉塊'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '豆腐',
        nameEn: 'Tofu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 80,
        portionRange: { min: 60, max: 120 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '洋蔥',
        nameEn: 'Onion',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '蒜頭',
        nameEn: 'Garlic',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '辣椒粉',
        nameEn: 'Gochugaru',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '高湯',
        nameEn: 'Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 300,
        portionRange: { min: 250, max: 400 },
        frequency: 1.0,
        alternatives: ['水'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'korea',
        components: [
          {
            name: '年糕',
            nameEn: 'Rice Cake',
            category: ComponentCategory.GRAIN,
            typicalPortion: 50,
            portionRange: { min: 40, max: 80 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          },
          {
            name: '拉麵',
            nameEn: 'Ramen',
            category: ComponentCategory.GRAIN,
            typicalPortion: 80,
            portionRange: { min: 60, max: 120 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '泡菜鍋是韓國家常料理，酸辣開胃，常加年糕或拉麵'
      }
    ],
    typicalPortionRange: {
      min: 500,
      max: 700,
      typical: 600
    }
  },

  // ==================== 麻婆豆腐 ====================
  {
    dishName: '麻婆豆腐',
    dishNameEn: 'Mapo Tofu',
    dishType: DishType.STIR_FRY,
    region: ['china', 'sichuan'],
    commonComponents: [
      {
        name: '豆腐',
        nameEn: 'Tofu',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 280 },
        frequency: 1.0,
        alternatives: ['嫩豆腐', '板豆腐'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.4,
            fatMultiplier: 2.5,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製增加油脂和辣椒油'
          }
        ]
      },
      {
        name: '豬絞肉',
        nameEn: 'Ground Pork',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 60,
        portionRange: { min: 50, max: 80 },
        frequency: 0.9,
        alternatives: ['牛絞肉'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製增加油脂'
          }
        ]
      },
      {
        name: '豆瓣醬',
        nameEn: 'Doubanjiang',
        category: ComponentCategory.SAUCE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '花椒',
        nameEn: 'Sichuan Peppercorn',
        category: ComponentCategory.SEASONING,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '辣椒',
        nameEn: 'Chili',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: ['辣椒粉'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '蒜末',
        nameEn: 'Minced Garlic',
        category: ComponentCategory.SEASONING,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '薑末',
        nameEn: 'Minced Ginger',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '辣油',
        nameEn: 'Chili Oil',
        category: ComponentCategory.SAUCE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'sichuan',
        components: [
          {
            name: '花椒粉',
            nameEn: 'Sichuan Pepper Powder',
            category: ComponentCategory.SEASONING,
            typicalPortion: 2,
            portionRange: { min: 1, max: 3 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '麻婆豆腐是四川名菜，以麻辣著稱，花椒和辣椒缺一不可'
      }
    ],
    typicalPortionRange: {
      min: 280,
      max: 400,
      typical: 320
    }
  },

  // ==================== 北京烤鴨 ====================
  {
    dishName: '北京烤鴨',
    dishNameEn: 'Peking Duck',
    dishType: DishType.BARBECUE,
    region: ['china', 'beijing'],
    commonComponents: [
      {
        name: '烤鴨肉',
        nameEn: 'Roasted Duck',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 100,
        portionRange: { min: 80, max: 130 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: [
          {
            method: CookingMethod.GRILLED,
            calorieMultiplier: 1.3,
            fatMultiplier: 1.8,
            proteinRetention: 0.92,
            vitaminRetention: 0.80,
            notes: '烤製會流失部分油脂，但鴨皮含高油脂'
          }
        ]
      },
      {
        name: '鴨皮',
        nameEn: 'Duck Skin',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 30,
        portionRange: { min: 20, max: 50 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.GRILLED],
        nutritionImpact: [
          {
            method: CookingMethod.GRILLED,
            calorieMultiplier: 1.5,
            fatMultiplier: 2.5,
            proteinRetention: 0.90,
            vitaminRetention: 0.75,
            notes: '鴨皮含高油脂'
          }
        ]
      },
      {
        name: '荷葉餅',
        nameEn: 'Pancake',
        category: ComponentCategory.GRAIN,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 1.0,
        alternatives: ['春餅'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '甜麵醬',
        nameEn: 'Hoisin Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '青蔥絲',
        nameEn: 'Scallion Strips',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '小黃瓜絲',
        nameEn: 'Cucumber Strips',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'beijing',
        components: [
          {
            name: '白糖',
            nameEn: 'Sugar',
            category: ComponentCategory.SEASONING,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          }
        ],
        culturalNotes: '北京烤鴨是中國名菜，鴨皮酥脆，用荷葉餅包裹食用'
      }
    ],
    typicalPortionRange: {
      min: 180,
      max: 280,
      typical: 220
    }
  },

  // ==================== 泰式炒河粉 ====================
  {
    dishName: '泰式炒河粉',
    dishNameEn: 'Pad Thai',
    dishType: DishType.NOODLES,
    region: ['thailand'],
    commonComponents: [
      {
        name: '河粉',
        nameEn: 'Rice Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 150,
        portionRange: { min: 120, max: 200 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 2.5,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製增加油脂'
          }
        ]
      },
      {
        name: '蝦',
        nameEn: 'Shrimp',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 60,
        portionRange: { min: 50, max: 80 },
        frequency: 0.8,
        alternatives: ['雞肉', '豆腐'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.2,
            fatMultiplier: 1.5,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製增加少量油脂'
          }
        ]
      },
      {
        name: '雞蛋',
        nameEn: 'Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 40, max: 60 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '豆芽菜',
        nameEn: 'Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '韭菜',
        nameEn: 'Chinese Chives',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 20,
        portionRange: { min: 15, max: 30 },
        frequency: 0.8,
        alternatives: ['青蔥'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      },
      {
        name: '花生碎',
        nameEn: 'Crushed Peanuts',
        category: ComponentCategory.GARNISH,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '檸檬',
        nameEn: 'Lime',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '魚露',
        nameEn: 'Fish Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '羅望子醬',
        nameEn: 'Tamarind Paste',
        category: ComponentCategory.SAUCE,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '辣椒粉',
        nameEn: 'Chili Powder',
        category: ComponentCategory.SEASONING,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 0.7,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'thailand',
        components: [
          {
            name: '蘿蔔乾',
            nameEn: 'Preserved Radish',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 10,
            portionRange: { min: 5, max: 15 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          },
          {
            name: '豆腐乾',
            nameEn: 'Dried Tofu',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 20,
            portionRange: { min: 15, max: 30 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '泰式炒河粉是泰國國民美食，酸甜鹹辣平衡，花生碎和檸檬是靈魂'
      }
    ],
    typicalPortionRange: {
      min: 300,
      max: 450,
      typical: 350
    }
  },

  // ==================== 越南河粉 ====================
  {
    dishName: '越南河粉',
    dishNameEn: 'Vietnamese Pho',
    dishType: DishType.NOODLES,
    region: ['vietnam'],
    commonComponents: [
      {
        name: '河粉',
        nameEn: 'Rice Noodles',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 280 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '牛肉片',
        nameEn: 'Beef Slices',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 80,
        portionRange: { min: 60, max: 120 },
        frequency: 0.9,
        alternatives: ['雞肉', '豬肉'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: [
          {
            method: CookingMethod.BOILED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '水煮保留營養'
          }
        ]
      },
      {
        name: '牛骨湯',
        nameEn: 'Beef Bone Broth',
        category: ComponentCategory.SAUCE,
        typicalPortion: 350,
        portionRange: { min: 300, max: 450 },
        frequency: 1.0,
        alternatives: ['雞湯'],
        cookingMethods: [CookingMethod.BOILED],
        nutritionImpact: []
      },
      {
        name: '豆芽菜',
        nameEn: 'Bean Sprouts',
        category: ComponentCategory.VEGETABLE,
        typicalPortion: 40,
        portionRange: { min: 30, max: 60 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '羅勒',
        nameEn: 'Thai Basil',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: ['九層塔'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '香菜',
        nameEn: 'Cilantro',
        category: ComponentCategory.GARNISH,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 15 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '檸檬',
        nameEn: 'Lime',
        category: ComponentCategory.GARNISH,
        typicalPortion: 15,
        portionRange: { min: 10, max: 25 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '辣椒',
        nameEn: 'Chili',
        category: ComponentCategory.SEASONING,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.7,
        alternatives: ['辣椒醬'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '魚露',
        nameEn: 'Fish Sauce',
        category: ComponentCategory.SAUCE,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'vietnam',
        components: [
          {
            name: '洋蔥絲',
            nameEn: 'Sliced Onion',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 15,
            portionRange: { min: 10, max: 25 },
            frequency: 0.7,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '薄荷葉',
            nameEn: 'Mint Leaves',
            category: ComponentCategory.GARNISH,
            typicalPortion: 5,
            portionRange: { min: 3, max: 10 },
            frequency: 0.6,
            alternatives: [],
            cookingMethods: [CookingMethod.RAW],
            nutritionImpact: []
          },
          {
            name: '八角',
            nameEn: 'Star Anise',
            category: ComponentCategory.SEASONING,
            typicalPortion: 2,
            portionRange: { min: 1, max: 3 },
            frequency: 0.5,
            alternatives: [],
            cookingMethods: [CookingMethod.BOILED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '越南河粉湯頭清爽，香料豐富，大量新鮮香草是特色'
      }
    ],
    typicalPortionRange: {
      min: 550,
      max: 750,
      typical: 650
    }
  },

  // ==================== 小籠包 ====================
  {
    dishName: '小籠包',
    dishNameEn: 'Xiaolongbao',
    dishType: DishType.DUMPLING,
    region: ['china', 'taiwan'],
    commonComponents: [
      {
        name: '麵皮',
        nameEn: 'Dumpling Wrapper',
        category: ComponentCategory.GRAIN,
        typicalPortion: 15,
        portionRange: { min: 12, max: 20 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '豬肉餡',
        nameEn: 'Pork Filling',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 12,
        portionRange: { min: 10, max: 15 },
        frequency: 1.0,
        alternatives: ['蝦肉餡'],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: [
          {
            method: CookingMethod.STEAMED,
            calorieMultiplier: 1.0,
            fatMultiplier: 1.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.90,
            notes: '蒸製保留較多營養'
          }
        ]
      },
      {
        name: '高湯凍',
        nameEn: 'Soup Jelly',
        category: ComponentCategory.SAUCE,
        typicalPortion: 8,
        portionRange: { min: 5, max: 12 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STEAMED],
        nutritionImpact: []
      },
      {
        name: '薑絲',
        nameEn: 'Ginger Strips',
        category: ComponentCategory.GARNISH,
        typicalPortion: 3,
        portionRange: { min: 2, max: 5 },
        frequency: 0.9,
        alternatives: [],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      },
      {
        name: '黑醋',
        nameEn: 'Black Vinegar',
        category: ComponentCategory.SAUCE,
        typicalPortion: 5,
        portionRange: { min: 3, max: 10 },
        frequency: 0.8,
        alternatives: ['醬油'],
        cookingMethods: [CookingMethod.RAW],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'shanghai',
        components: [
          {
            name: '蟹黃',
            nameEn: 'Crab Roe',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 5,
            portionRange: { min: 3, max: 8 },
            frequency: 0.3,
            alternatives: [],
            cookingMethods: [CookingMethod.STEAMED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '上海小籠包有時會加入蟹黃，更加鮮美'
      },
      {
        region: 'taiwan',
        components: [
          {
            name: '絲瓜',
            nameEn: 'Loofah',
            category: ComponentCategory.VEGETABLE,
            typicalPortion: 5,
            portionRange: { min: 3, max: 8 },
            frequency: 0.2,
            alternatives: [],
            cookingMethods: [CookingMethod.STEAMED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台灣有些店家會在餡料中加入絲瓜增加清甜'
      }
    ],
    typicalPortionRange: {
      min: 30,
      max: 50,
      typical: 40
    }
  }
];

/**
 * 根據料理名稱查找成分映射
 */
export function findDishComponentMap(dishName: string): DishComponentMap | undefined {
  return DISH_COMPONENT_MAPS.find(
    map => map.dishName === dishName || map.dishNameEn === dishName
  );
}

/**
 * 根據料理類型查找所有成分映射
 */
export function findDishComponentMapsByType(dishType: DishType): DishComponentMap[] {
  return DISH_COMPONENT_MAPS.filter(map => map.dishType === dishType);
}

/**
 * 根據地區查找成分映射
 */
export function findDishComponentMapsByRegion(region: string): DishComponentMap[] {
  return DISH_COMPONENT_MAPS.filter(map => map.region.includes(region));
}
