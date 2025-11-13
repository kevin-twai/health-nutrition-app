/**
 * 亞洲料理驗證規則
 * Asian Cuisine Validation Rules
 * 
 * 包含針對亞洲料理特徵的專門驗證規則
 */

import {
  ValidationRule,
  ValidationResult,
  ValidationSeverity,
  RecognitionResultForValidation,
  ValidationContext
} from './ResultValidator';
import { CuisineType, FoodCategory } from '../types/AsianCuisineKnowledgeBase';

/**
 * 相似食材互斥檢查
 * 檢查是否同時識別到容易混淆的食材對
 */
export const similarFoodMutualExclusionRule: ValidationRule = {
  name: '相似食材互斥檢查',
  description: '檢查是否同時識別到容易混淆的食材，如豆腐干絲和麵條',
  severity: ValidationSeverity.WARNING,
  enabled: true,
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    // 定義易混淆食材對
    const confusionPairs = [
      ['豆腐干絲', '麵條'],
      ['干絲', '麵條'],
      ['豆干絲', '麵條'],
      ['米粉', '粉絲'],
      ['米粉', '冬粉'],
      ['玉米筍', '筍子'],
      ['玉米筍', '竹筍'],
      ['糯米椒', '青椒'],
      ['糯米椒', '甜椒'],
      ['過貓', '空心菜'],
      ['過貓', '菠菜'],
      ['小米', '米飯'],
      ['刺蔥', '香菜'],
      ['馬告', '黑胡椒']
    ];

    const foodNames = result.foods.map(f => f.name);
    const conflicts: string[] = [];

    for (const [food1, food2] of confusionPairs) {
      const hasFood1 = foodNames.some(name => name.includes(food1));
      const hasFood2 = foodNames.some(name => name.includes(food2));

      if (hasFood1 && hasFood2) {
        conflicts.push(`${food1} 和 ${food2}`);
      }
    }

    if (conflicts.length > 0) {
      return {
        passed: false,
        ruleName: '相似食材互斥檢查',
        severity: ValidationSeverity.WARNING,
        message: `同時識別到容易混淆的食材: ${conflicts.join('、')}`,
        suggestions: [
          '請仔細檢查這些食材的視覺特徵',
          '參考知識庫中的區分特徵說明',
          '確認烹飪方式和料理類型是否一致',
          '考慮使用增強 prompt 重新識別'
        ],
        affectedFoods: conflicts.flatMap(c => c.split(' 和 '))
      };
    }

    return {
      passed: true,
      ruleName: '相似食材互斥檢查',
      severity: ValidationSeverity.WARNING,
      message: '未發現易混淆食材同時出現'
    };
  }
};

/**
 * 涼拌菜完整性檢查
 * 檢查涼拌菜是否包含主食材、配菜和調味料
 */
export const coldDishCompletenessRule: ValidationRule = {
  name: '涼拌菜完整性檢查',
  description: '檢查涼拌菜是否包含完整的食材組成',
  severity: ValidationSeverity.WARNING,
  enabled: true,
  applicableCuisines: [CuisineType.CHINESE, CuisineType.TAIWANESE],
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    // 只對涼拌菜進行檢查
    if (result.cookingMethod !== '涼拌' && result.cookingMethod !== 'cold_dressed') {
      return {
        passed: true,
        ruleName: '涼拌菜完整性檢查',
        severity: ValidationSeverity.WARNING,
        message: '不適用於非涼拌菜'
      };
    }

    const foodNames = result.foods.map(f => f.name);
    const missing: string[] = [];

    // 檢查主食材
    const mainIngredients = ['豆腐干絲', '干絲', '海蜇皮', '木耳', '黃瓜', '豆皮', '豆腐'];
    const hasMainIngredient = mainIngredients.some(ing => 
      foodNames.some(name => name.includes(ing))
    );

    if (!hasMainIngredient) {
      missing.push('主食材（如豆腐干絲、海蜇皮、木耳等）');
    }

    // 檢查配菜（蔬菜）
    const vegetables = ['芹菜', '胡蘿蔔', '黃瓜', '香菜', '蔥'];
    const hasVegetables = vegetables.some(veg => 
      foodNames.some(name => name.includes(veg))
    );

    if (!hasVegetables) {
      missing.push('配菜（如芹菜絲、胡蘿蔔絲等）');
    }

    // 檢查調味料
    const seasonings = ['麻油', '香油', '醬油', '醋', '蒜'];
    const hasSeasoning = seasonings.some(seasoning => 
      foodNames.some(name => name.includes(seasoning))
    );

    if (!hasSeasoning) {
      missing.push('調味料（如麻油、醬油、醋等）');
    }

    if (missing.length > 0) {
      return {
        passed: false,
        ruleName: '涼拌菜完整性檢查',
        severity: ValidationSeverity.WARNING,
        message: `涼拌菜可能缺少: ${missing.join('、')}`,
        suggestions: [
          '涼拌菜通常包含主食材、配菜和調味料',
          '檢查圖片中是否有遺漏的食材',
          '注意醬汁和調味料也應該識別出來',
          '如果是簡單的涼拌菜，可能不需要所有組成部分'
        ],
        details: {
          missing,
          identified: foodNames
        }
      };
    }

    return {
      passed: true,
      ruleName: '涼拌菜完整性檢查',
      severity: ValidationSeverity.WARNING,
      message: '涼拌菜組成完整'
    };
  }
};

/**
 * 台式熱炒常見搭配檢查
 * 檢查台式熱炒是否有常見的配料
 */
export const taiwaneseStirFryPairingRule: ValidationRule = {
  name: '台式熱炒常見搭配檢查',
  description: '檢查台式熱炒是否包含常見的蒜片或辣椒',
  severity: ValidationSeverity.INFO,
  enabled: true,
  applicableCuisines: [CuisineType.TAIWANESE],
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    // 只對台式快炒進行檢查
    if (result.cuisineType !== CuisineType.TAIWANESE) {
      return {
        passed: true,
        ruleName: '台式熱炒常見搭配檢查',
        severity: ValidationSeverity.INFO,
        message: '不適用於非台式料理'
      };
    }

    if (result.cookingMethod !== '快炒' && result.cookingMethod !== 'stir_fry') {
      return {
        passed: true,
        ruleName: '台式熱炒常見搭配檢查',
        severity: ValidationSeverity.INFO,
        message: '不適用於非快炒料理'
      };
    }

    const foodNames = result.foods.map(f => f.name);

    // 檢查蒜片
    const hasGarlic = foodNames.some(name => 
      name.includes('蒜') || name.includes('garlic')
    );

    // 檢查辣椒
    const hasChili = foodNames.some(name => 
      name.includes('辣椒') || name.includes('糯米椒') || name.includes('chili')
    );

    if (!hasGarlic && !hasChili) {
      return {
        passed: false,
        ruleName: '台式熱炒常見搭配檢查',
        severity: ValidationSeverity.INFO,
        message: '台式熱炒通常會有蒜片或辣椒',
        suggestions: [
          '檢查圖片中是否有蒜片或辣椒',
          '台式熱炒的特色是大火快炒，通常會加蒜片提香',
          '如果是清淡口味的熱炒，可能不加辣椒'
        ]
      };
    }

    return {
      passed: true,
      ruleName: '台式熱炒常見搭配檢查',
      severity: ValidationSeverity.INFO,
      message: hasGarlic && hasChili ? 
        '包含台式熱炒的典型配料（蒜片和辣椒）' : 
        hasGarlic ? '包含蒜片' : '包含辣椒'
    };
  }
};

/**
 * 日式料理完整性檢查
 * 檢查日式套餐是否包含常見組成
 */
export const japaneseSetMealCompletenessRule: ValidationRule = {
  name: '日式料理完整性檢查',
  description: '檢查日式套餐是否包含湯品、醃漬物等常見組成',
  severity: ValidationSeverity.INFO,
  enabled: true,
  applicableCuisines: [CuisineType.JAPANESE],
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    if (result.cuisineType !== CuisineType.JAPANESE) {
      return {
        passed: true,
        ruleName: '日式料理完整性檢查',
        severity: ValidationSeverity.INFO,
        message: '不適用於非日式料理'
      };
    }

    // 如果食物數量少於3個，可能不是套餐
    if (result.foods.length < 3) {
      return {
        passed: true,
        ruleName: '日式料理完整性檢查',
        severity: ValidationSeverity.INFO,
        message: '食物數量較少，可能不是套餐'
      };
    }

    const foodNames = result.foods.map(f => f.name);
    const suggestions: string[] = [];

    // 檢查湯品
    const hasSoup = foodNames.some(name => 
      name.includes('湯') || name.includes('味噌') || name.includes('soup')
    );

    // 檢查米飯
    const hasRice = foodNames.some(name => 
      name.includes('飯') || name.includes('米') || name.includes('rice')
    );

    // 檢查醃漬物
    const hasPickles = foodNames.some(name => 
      name.includes('漬物') || name.includes('醃') || name.includes('pickle')
    );

    if (!hasSoup) {
      suggestions.push('日式套餐通常包含味噌湯或其他湯品');
    }

    if (!hasPickles) {
      suggestions.push('日式套餐通常包含醃漬物（如醃蘿蔔、醃梅等）');
    }

    if (suggestions.length > 0) {
      return {
        passed: false,
        ruleName: '日式料理完整性檢查',
        severity: ValidationSeverity.INFO,
        message: '日式套餐可能缺少一些常見組成',
        suggestions: [
          ...suggestions,
          '如果不是套餐而是單品，可以忽略此建議'
        ],
        details: {
          hasSoup,
          hasRice,
          hasPickles
        }
      };
    }

    return {
      passed: true,
      ruleName: '日式料理完整性檢查',
      severity: ValidationSeverity.INFO,
      message: '日式套餐組成完整'
    };
  }
};

/**
 * 原住民料理特徵檢查
 * 檢查是否正確識別原住民特色食材
 */
export const indigenousFoodFeatureRule: ValidationRule = {
  name: '原住民料理特徵檢查',
  description: '檢查原住民特色食材是否被正確分類',
  severity: ValidationSeverity.INFO,
  enabled: true,
  applicableCuisines: [CuisineType.INDIGENOUS, CuisineType.TAIWANESE],
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    const foodNames = result.foods.map(f => f.name);

    // 原住民特色食材列表
    const indigenousIngredients = [
      '小米',
      '馬告',
      '刺蔥',
      '過貓',
      '山蘇',
      '樹豆',
      '龍葵',
      '昭和草',
      '山苦瓜',
      '野菜',
      '山豬肉',
      '飛魚',
      '檳榔花'
    ];

    // 檢查是否有原住民食材
    const hasIndigenousFood = indigenousIngredients.some(ing => 
      foodNames.some(name => name.includes(ing))
    );

    if (!hasIndigenousFood) {
      return {
        passed: true,
        ruleName: '原住民料理特徵檢查',
        severity: ValidationSeverity.INFO,
        message: '未檢測到原住民特色食材'
      };
    }

    // 如果有原住民食材，檢查料理類型是否正確
    if (result.cuisineType !== CuisineType.INDIGENOUS && 
        result.cuisineType !== CuisineType.TAIWANESE) {
      return {
        passed: false,
        ruleName: '原住民料理特徵檢查',
        severity: ValidationSeverity.INFO,
        message: '檢測到原住民特色食材，但料理類型未標記為原住民料理或台式料理',
        suggestions: [
          '確認料理類型是否應為原住民料理',
          '原住民食材也常用於台式料理中',
          '檢查是否有其他原住民料理的特徵'
        ],
        affectedFoods: foodNames.filter(name => 
          indigenousIngredients.some(ing => name.includes(ing))
        )
      };
    }

    return {
      passed: true,
      ruleName: '原住民料理特徵檢查',
      severity: ValidationSeverity.INFO,
      message: '原住民特色食材已正確識別'
    };
  }
};

/**
 * 豆製品特徵檢查
 * 專門檢查豆製品的識別是否正確
 */
export const beanProductFeatureRule: ValidationRule = {
  name: '豆製品特徵檢查',
  description: '檢查豆製品（如豆腐干絲）是否被正確識別，避免與麵條混淆',
  severity: ValidationSeverity.WARNING,
  enabled: true,
  applicableCategories: [FoodCategory.BEAN_PRODUCTS, FoodCategory.NOODLES],
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    const foodNames = result.foods.map(f => f.name);

    // 檢查是否有豆製品
    const beanProducts = ['豆腐干絲', '干絲', '豆干絲', '豆皮', '豆腐'];
    const hasBeanProduct = beanProducts.some(bp => 
      foodNames.some(name => name.includes(bp))
    );

    if (!hasBeanProduct) {
      return {
        passed: true,
        ruleName: '豆製品特徵檢查',
        severity: ValidationSeverity.WARNING,
        message: '未檢測到豆製品'
      };
    }

    // 檢查是否同時有麵條
    const noodles = ['麵條', '麵', '拉麵', '烏龍麵'];
    const hasNoodles = noodles.some(n => 
      foodNames.some(name => name.includes(n) && !name.includes('干絲'))
    );

    if (hasNoodles) {
      return {
        passed: false,
        ruleName: '豆製品特徵檢查',
        severity: ValidationSeverity.WARNING,
        message: '同時檢測到豆製品和麵條，請確認識別正確',
        suggestions: [
          '豆腐干絲和麵條容易混淆',
          '豆腐干絲：顏色偏黃白色，質地較粗糙，有豆製品特有紋理',
          '麵條：顏色較白，表面光滑有光澤，質地柔軟',
          '檢查烹飪方式：干絲常用於涼拌，麵條常用於湯麵或炒麵',
          '使用專門的豆製品 prompt 重新識別'
        ],
        affectedFoods: foodNames.filter(name => 
          beanProducts.some(bp => name.includes(bp)) || 
          noodles.some(n => name.includes(n))
        )
      };
    }

    // 檢查烹飪方式是否合理
    if (result.cookingMethod === '涼拌' || result.cookingMethod === 'cold_dressed') {
      return {
        passed: true,
        ruleName: '豆製品特徵檢查',
        severity: ValidationSeverity.WARNING,
        message: '豆製品識別合理（涼拌菜常用豆腐干絲）'
      };
    }

    return {
      passed: true,
      ruleName: '豆製品特徵檢查',
      severity: ValidationSeverity.WARNING,
      message: '豆製品識別正常'
    };
  }
};

/**
 * 麵食類區分檢查
 * 檢查不同類型的麵食是否被正確區分
 */
export const noodleTypeDistinctionRule: ValidationRule = {
  name: '麵食類區分檢查',
  description: '檢查米粉、粉絲、麵條等是否被正確區分',
  severity: ValidationSeverity.WARNING,
  enabled: true,
  applicableCategories: [FoodCategory.NOODLES, FoodCategory.RICE_PRODUCTS],
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    const foodNames = result.foods.map(f => f.name);

    // 檢查是否有多種麵食
    const noodleTypes = {
      '米粉': ['米粉', '炊粉'],
      '粉絲': ['粉絲', '冬粉'],
      '麵條': ['麵條', '麵', '拉麵', '烏龍麵']
    };

    const detectedTypes: string[] = [];
    for (const [type, keywords] of Object.entries(noodleTypes)) {
      if (keywords.some(kw => foodNames.some(name => name.includes(kw)))) {
        detectedTypes.push(type);
      }
    }

    // 如果檢測到多種麵食，提供區分建議
    if (detectedTypes.length > 1) {
      return {
        passed: false,
        ruleName: '麵食類區分檢查',
        severity: ValidationSeverity.WARNING,
        message: `檢測到多種麵食類型: ${detectedTypes.join('、')}，請確認識別正確`,
        suggestions: [
          '米粉：純白色，質地較脆，有米的香味',
          '粉絲：透明或半透明，非常細，滑溜',
          '麵條：白色或淡黃色，表面光滑，有彈性',
          '檢查烹飪方式和料理類型以輔助判斷',
          '使用專門的麵食類 prompt 重新識別'
        ],
        affectedFoods: detectedTypes,
        details: {
          detectedTypes
        }
      };
    }

    return {
      passed: true,
      ruleName: '麵食類區分檢查',
      severity: ValidationSeverity.WARNING,
      message: detectedTypes.length === 1 ? 
        `識別到 ${detectedTypes[0]}` : 
        '未檢測到麵食'
    };
  }
};

/**
 * 獲取所有亞洲料理驗證規則
 */
export function getAllAsianCuisineValidationRules(): ValidationRule[] {
  return [
    similarFoodMutualExclusionRule,
    coldDishCompletenessRule,
    taiwaneseStirFryPairingRule,
    japaneseSetMealCompletenessRule,
    indigenousFoodFeatureRule,
    beanProductFeatureRule,
    noodleTypeDistinctionRule
  ];
}
