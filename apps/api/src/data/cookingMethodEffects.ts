/**
 * 烹飪方式營養影響數據
 * Cooking Method Nutritional Effects Data
 * 
 * 此文件定義了各種烹飪方式對食材營養價值的影響係數
 * 包括：炒、煮、炸、蒸、烤、滷等常見亞洲烹飪方式
 */

import { CookingMethod, ComponentCategory } from '../types/ComponentDetection';

/**
 * 烹飪方式營養影響接口
 */
export interface CookingMethodEffect {
  method: CookingMethod;
  displayName: string;
  displayNameEn: string;
  
  // 營養影響係數
  calorieMultiplier: number;      // 卡路里倍數（1.0 = 無變化）
  fatMultiplier: number;          // 脂肪倍數
  proteinRetention: number;       // 蛋白質保留率（0-1）
  carbRetention: number;          // 碳水化合物保留率（0-1）
  vitaminRetention: number;       // 維生素保留率（0-1）
  mineralRetention: number;       // 礦物質保留率（0-1）
  
  // 額外營養添加（每100g食材）
  addedCalories: number;          // 增加的卡路里
  addedFat: number;               // 增加的脂肪（克）
  addedSodium: number;            // 增加的鈉（毫克）
  
  // 說明
  description: string;
  healthImpact: string;
  commonUses: string[];
  
  // 適用食材類別（如果為空則適用所有類別）
  applicableCategories?: ComponentCategory[];
}

/**
 * 烹飪方式營養影響數據庫
 */
export const COOKING_METHOD_EFFECTS: Record<CookingMethod, CookingMethodEffect> = {
  // ==================== 生食 ====================
  [CookingMethod.RAW]: {
    method: CookingMethod.RAW,
    displayName: '生食',
    displayNameEn: 'Raw',
    calorieMultiplier: 1.0,
    fatMultiplier: 1.0,
    proteinRetention: 1.0,
    carbRetention: 1.0,
    vitaminRetention: 1.0,
    mineralRetention: 1.0,
    addedCalories: 0,
    addedFat: 0,
    addedSodium: 0,
    description: '未經烹調，保留所有原始營養',
    healthImpact: '營養保留最完整，但需注意食材新鮮度和衛生',
    commonUses: ['生菜沙拉', '生魚片', '涼拌菜配料']
  },

  // ==================== 煮 ====================
  [CookingMethod.BOILED]: {
    method: CookingMethod.BOILED,
    displayName: '煮',
    displayNameEn: 'Boiled',
    calorieMultiplier: 1.0,
    fatMultiplier: 1.0,
    proteinRetention: 0.95,
    carbRetention: 0.98,
    vitaminRetention: 0.70,
    mineralRetention: 0.80,
    addedCalories: 0,
    addedFat: 0,
    addedSodium: 0,
    description: '水煮烹調，部分水溶性營養會流失到湯中',
    healthImpact: '低油健康，但水溶性維生素（如維生素C、B群）會流失約30%',
    commonUses: ['湯品', '水煮蛋', '燙青菜', '煮麵']
  },

  // ==================== 炒 ====================
  [CookingMethod.FRIED]: {
    method: CookingMethod.FRIED,
    displayName: '炒',
    displayNameEn: 'Fried',
    calorieMultiplier: 1.25,
    fatMultiplier: 2.5,
    proteinRetention: 0.95,
    carbRetention: 0.95,
    vitaminRetention: 0.80,
    mineralRetention: 0.90,
    addedCalories: 40,
    addedFat: 4.5,
    addedSodium: 200,
    description: '使用少量油快速翻炒，增加油脂和熱量',
    healthImpact: '增加約25%卡路里和2-3倍脂肪，維生素保留約80%',
    commonUses: ['炒飯', '炒麵', '炒青菜', '炒肉片']
  },

  // ==================== 快炒 ====================
  [CookingMethod.STIR_FRIED]: {
    method: CookingMethod.STIR_FRIED,
    displayName: '快炒',
    displayNameEn: 'Stir-Fried',
    calorieMultiplier: 1.3,
    fatMultiplier: 3.0,
    proteinRetention: 0.95,
    carbRetention: 0.95,
    vitaminRetention: 0.85,
    mineralRetention: 0.92,
    addedCalories: 50,
    addedFat: 5.5,
    addedSodium: 250,
    description: '大火快速翻炒，使用較多油，營養保留較好',
    healthImpact: '增加約30%卡路里和3倍脂肪，但因時間短維生素保留較好',
    commonUses: ['熱炒', '宮保雞丁', '炒空心菜', '炒牛肉']
  },

  // ==================== 炸 ====================
  [CookingMethod.DEEP_FRIED]: {
    method: CookingMethod.DEEP_FRIED,
    displayName: '炸',
    displayNameEn: 'Deep-Fried',
    calorieMultiplier: 1.8,
    fatMultiplier: 4.0,
    proteinRetention: 0.90,
    carbRetention: 0.92,
    vitaminRetention: 0.60,
    mineralRetention: 0.85,
    addedCalories: 120,
    addedFat: 13.0,
    addedSodium: 150,
    description: '完全浸入油中炸製，大幅增加油脂和熱量',
    healthImpact: '增加約80%卡路里和4倍脂肪，維生素流失約40%',
    commonUses: ['炸雞', '天婦羅', '炸豆腐', '炸春捲']
  },

  // ==================== 蒸 ====================
  [CookingMethod.STEAMED]: {
    method: CookingMethod.STEAMED,
    displayName: '蒸',
    displayNameEn: 'Steamed',
    calorieMultiplier: 1.0,
    fatMultiplier: 1.0,
    proteinRetention: 0.98,
    carbRetention: 0.98,
    vitaminRetention: 0.90,
    mineralRetention: 0.95,
    addedCalories: 0,
    addedFat: 0,
    addedSodium: 0,
    description: '蒸氣烹調，營養保留最好的烹調方式之一',
    healthImpact: '不增加油脂，營養保留率高達90-98%，最健康的烹調方式',
    commonUses: ['蒸魚', '蒸蛋', '小籠包', '蒸青菜']
  },

  // ==================== 烤 ====================
  [CookingMethod.GRILLED]: {
    method: CookingMethod.GRILLED,
    displayName: '烤',
    displayNameEn: 'Grilled',
    calorieMultiplier: 1.1,
    fatMultiplier: 1.2,
    proteinRetention: 0.92,
    carbRetention: 0.95,
    vitaminRetention: 0.75,
    mineralRetention: 0.88,
    addedCalories: 20,
    addedFat: 2.0,
    addedSodium: 100,
    description: '直接火烤或烤箱烹調，部分油脂會滴落',
    healthImpact: '增加約10%卡路里，部分脂肪會流失，維生素保留約75%',
    commonUses: ['烤肉', '烤魚', '烤雞', '燒烤']
  },

  // ==================== 滷/燉 ====================
  [CookingMethod.BRAISED]: {
    method: CookingMethod.BRAISED,
    displayName: '滷/燉',
    displayNameEn: 'Braised',
    calorieMultiplier: 1.15,
    fatMultiplier: 1.3,
    proteinRetention: 0.93,
    carbRetention: 0.96,
    vitaminRetention: 0.75,
    mineralRetention: 0.85,
    addedCalories: 30,
    addedFat: 3.0,
    addedSodium: 400,
    description: '長時間小火燉煮，吸收醬汁調味',
    healthImpact: '增加約15%卡路里，鈉含量較高（醬油等調味料），維生素流失約25%',
    commonUses: ['滷肉', '滷蛋', '紅燒肉', '燉雞']
  },

  // ==================== 醃製 ====================
  [CookingMethod.PICKLED]: {
    method: CookingMethod.PICKLED,
    displayName: '醃製',
    displayNameEn: 'Pickled',
    calorieMultiplier: 1.0,
    fatMultiplier: 1.0,
    proteinRetention: 0.95,
    carbRetention: 0.95,
    vitaminRetention: 0.60,
    mineralRetention: 0.90,
    addedCalories: 10,
    addedFat: 0,
    addedSodium: 800,
    description: '鹽漬或醋漬保存，鈉含量極高',
    healthImpact: '維生素C流失約40%，鈉含量極高需注意攝取量',
    commonUses: ['泡菜', '酸菜', '醃蘿蔔', '梅干菜']
  }
};

/**
 * 特定食材類別的烹飪方式調整係數
 * 某些食材類別在特定烹飪方式下會有不同的營養影響
 */
export const CATEGORY_SPECIFIC_ADJUSTMENTS: Record<
  ComponentCategory,
  Partial<Record<CookingMethod, Partial<CookingMethodEffect>>>
> = {
  // ==================== 主食類 ====================
  [ComponentCategory.GRAIN]: {
    [CookingMethod.STIR_FRIED]: {
      calorieMultiplier: 1.35,
      fatMultiplier: 3.5,
      addedCalories: 60,
      addedFat: 6.5,
      description: '主食類炒製吸油較多，如炒飯、炒麵'
    },
    [CookingMethod.DEEP_FRIED]: {
      calorieMultiplier: 2.0,
      fatMultiplier: 5.0,
      addedCalories: 150,
      addedFat: 16.0,
      description: '主食類油炸吸油極多，如炸春捲皮'
    }
  },

  // ==================== 蛋白質類 ====================
  [ComponentCategory.PROTEIN]: {
    [CookingMethod.DEEP_FRIED]: {
      calorieMultiplier: 1.9,
      fatMultiplier: 4.5,
      addedCalories: 140,
      addedFat: 15.0,
      proteinRetention: 0.88,
      description: '蛋白質類油炸會有較多油脂吸收'
    },
    [CookingMethod.GRILLED]: {
      calorieMultiplier: 0.95,
      fatMultiplier: 0.8,
      addedCalories: 0,
      addedFat: 0,
      description: '蛋白質類燒烤會流失部分脂肪'
    },
    [CookingMethod.STEAMED]: {
      proteinRetention: 0.99,
      vitaminRetention: 0.95,
      description: '蛋白質類蒸製營養保留最好'
    }
  },

  // ==================== 蔬菜類 ====================
  [ComponentCategory.VEGETABLE]: {
    [CookingMethod.BOILED]: {
      vitaminRetention: 0.65,
      mineralRetention: 0.75,
      description: '蔬菜水煮會流失較多水溶性維生素'
    },
    [CookingMethod.STIR_FRIED]: {
      calorieMultiplier: 1.4,
      fatMultiplier: 3.5,
      addedCalories: 55,
      addedFat: 6.0,
      vitaminRetention: 0.82,
      description: '蔬菜快炒吸油較多但維生素保留較好'
    },
    [CookingMethod.STEAMED]: {
      vitaminRetention: 0.92,
      mineralRetention: 0.96,
      description: '蔬菜蒸製是最佳烹調方式'
    }
  },

  // ==================== 調味料 ====================
  [ComponentCategory.SEASONING]: {
    // 調味料通常不受烹飪方式影響
  },

  // ==================== 醬料 ====================
  [ComponentCategory.SAUCE]: {
    // 醬料通常不受烹飪方式影響
  },

  // ==================== 配菜/裝飾 ====================
  [ComponentCategory.GARNISH]: {
    [CookingMethod.RAW]: {
      description: '配菜通常生食，保留完整營養'
    }
  }
};

/**
 * 獲取烹飪方式的營養影響
 */
export function getCookingMethodEffect(
  method: CookingMethod,
  category?: ComponentCategory
): CookingMethodEffect {
  const baseEffect = COOKING_METHOD_EFFECTS[method];
  
  // 如果有指定類別，檢查是否有特定調整
  if (category && CATEGORY_SPECIFIC_ADJUSTMENTS[category]?.[method]) {
    const adjustment = CATEGORY_SPECIFIC_ADJUSTMENTS[category][method]!;
    return {
      ...baseEffect,
      ...adjustment
    };
  }
  
  return baseEffect;
}

/**
 * 計算烹飪後的營養值
 */
export function calculateCookedNutrition(
  rawNutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sodium?: number;
  },
  method: CookingMethod,
  category?: ComponentCategory,
  portionGrams: number = 100
): {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sodium?: number;
} {
  const effect = getCookingMethodEffect(method, category);
  const portionMultiplier = portionGrams / 100;
  
  return {
    calories: Math.round(
      (rawNutrition.calories * effect.calorieMultiplier + effect.addedCalories) * portionMultiplier
    ),
    protein: Math.round(
      rawNutrition.protein * effect.proteinRetention * portionMultiplier * 10
    ) / 10,
    carbohydrates: Math.round(
      rawNutrition.carbohydrates * effect.carbRetention * portionMultiplier * 10
    ) / 10,
    fat: Math.round(
      (rawNutrition.fat * effect.fatMultiplier + effect.addedFat) * portionMultiplier * 10
    ) / 10,
    fiber: rawNutrition.fiber
      ? Math.round(rawNutrition.fiber * portionMultiplier * 10) / 10
      : undefined,
    sodium: rawNutrition.sodium
      ? Math.round((rawNutrition.sodium * effect.mineralRetention + effect.addedSodium) * portionMultiplier)
      : undefined
  };
}

/**
 * 獲取烹飪方式的健康評分（1-10分）
 */
export function getCookingMethodHealthScore(method: CookingMethod): number {
  const scores: Record<CookingMethod, number> = {
    [CookingMethod.RAW]: 10,
    [CookingMethod.STEAMED]: 9,
    [CookingMethod.BOILED]: 8,
    [CookingMethod.GRILLED]: 7,
    [CookingMethod.BRAISED]: 6,
    [CookingMethod.FRIED]: 5,
    [CookingMethod.STIR_FRIED]: 5,
    [CookingMethod.DEEP_FRIED]: 3,
    [CookingMethod.PICKLED]: 4
  };
  
  return scores[method] || 5;
}

/**
 * 獲取烹飪方式的建議
 */
export function getCookingMethodRecommendation(method: CookingMethod): string {
  const recommendations: Record<CookingMethod, string> = {
    [CookingMethod.RAW]: '生食營養保留最完整，但需確保食材新鮮衛生',
    [CookingMethod.STEAMED]: '蒸製是最健康的烹調方式，建議多採用',
    [CookingMethod.BOILED]: '水煮健康低油，但建議連湯一起食用以保留營養',
    [CookingMethod.GRILLED]: '燒烤適度食用，避免烤焦產生有害物質',
    [CookingMethod.BRAISED]: '滷製美味但鈉含量高，建議減少醬汁攝取',
    [CookingMethod.FRIED]: '炒製增加油脂，建議控制用油量',
    [CookingMethod.STIR_FRIED]: '快炒雖增加油脂但營養保留較好，建議適量',
    [CookingMethod.DEEP_FRIED]: '油炸高油高熱量，建議偶爾食用',
    [CookingMethod.PICKLED]: '醃製品鈉含量極高，建議少量食用'
  };
  
  return recommendations[method] || '適量食用，注意營養均衡';
}
