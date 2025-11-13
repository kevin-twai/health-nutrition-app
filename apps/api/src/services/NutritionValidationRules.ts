/**
 * 營養和份量驗證規則
 * Nutrition and Portion Validation Rules
 * 
 * 包含營養值合理性、份量描述和料理類型一致性的驗證規則
 */

import {
  ValidationRule,
  ValidationResult,
  ValidationSeverity,
  RecognitionResultForValidation,
  ValidationContext
} from './ResultValidator';
import { CookingMethod } from '../types/AsianCuisineKnowledgeBase';

/**
 * 營養值合理性檢查
 * 檢查識別出的食物營養值是否在合理範圍內
 */
export const nutritionValueReasonablenessRule: ValidationRule = {
  name: '營養值合理性檢查',
  description: '檢查食物的營養值是否在合理範圍內',
  severity: ValidationSeverity.WARNING,
  enabled: true,
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    const issues: string[] = [];
    const affectedFoods: string[] = [];

    for (const food of result.foods) {
      const nutrition = food.nutrition;
      const portion = food.estimatedPortion || 100;

      // 計算每100克的營養值
      const per100g = {
        calories: (nutrition.calories / portion) * 100,
        protein: (nutrition.protein / portion) * 100,
        carbs: ((nutrition.carbs ?? nutrition.carbohydrates ?? 0) / portion) * 100,
        fat: (nutrition.fat / portion) * 100,
        fiber: (nutrition.fiber / portion) * 100,
        sodium: (nutrition.sodium / portion) * 100
      };

      // 檢查卡路里範圍（每100克應在 0-900 之間）
      if (per100g.calories < 0 || per100g.calories > 900) {
        issues.push(`${food.name} 的卡路里值異常: ${per100g.calories.toFixed(0)} kcal/100g`);
        affectedFoods.push(food.name);
      }

      // 檢查蛋白質範圍（每100克應在 0-100 之間）
      if (per100g.protein < 0 || per100g.protein > 100) {
        issues.push(`${food.name} 的蛋白質值異常: ${per100g.protein.toFixed(1)} g/100g`);
        affectedFoods.push(food.name);
      }

      // 檢查碳水化合物範圍（每100克應在 0-100 之間）
      if (per100g.carbs < 0 || per100g.carbs > 100) {
        issues.push(`${food.name} 的碳水化合物值異常: ${per100g.carbs.toFixed(1)} g/100g`);
        affectedFoods.push(food.name);
      }

      // 檢查脂肪範圍（每100克應在 0-100 之間）
      if (per100g.fat < 0 || per100g.fat > 100) {
        issues.push(`${food.name} 的脂肪值異常: ${per100g.fat.toFixed(1)} g/100g`);
        affectedFoods.push(food.name);
      }

      // 檢查營養素總和是否合理（蛋白質 + 碳水 + 脂肪不應超過 100g）
      const totalMacros = per100g.protein + per100g.carbs + per100g.fat;
      if (totalMacros > 110) { // 允許10%的誤差
        issues.push(`${food.name} 的營養素總和異常: ${totalMacros.toFixed(1)} g/100g（蛋白質+碳水+脂肪）`);
        affectedFoods.push(food.name);
      }

      // 檢查卡路里計算是否合理
      // 蛋白質和碳水: 4 kcal/g, 脂肪: 9 kcal/g
      const calculatedCalories = (per100g.protein * 4) + (per100g.carbs * 4) + (per100g.fat * 9);
      const caloriesDiff = Math.abs(per100g.calories - calculatedCalories);
      
      if (caloriesDiff > per100g.calories * 0.3) { // 允許30%的誤差
        issues.push(`${food.name} 的卡路里計算不一致: 標示 ${per100g.calories.toFixed(0)} kcal，計算值 ${calculatedCalories.toFixed(0)} kcal`);
        affectedFoods.push(food.name);
      }
    }

    if (issues.length > 0) {
      return {
        passed: false,
        ruleName: '營養值合理性檢查',
        severity: ValidationSeverity.WARNING,
        message: `發現 ${issues.length} 個營養值異常`,
        suggestions: [
          '檢查營養資料庫中的數據是否正確',
          '確認份量估算是否準確',
          '考慮使用更準確的營養資料來源',
          '如果是特殊食材，可能需要手動調整營養值'
        ],
        affectedFoods: [...new Set(affectedFoods)],
        details: {
          issues
        }
      };
    }

    return {
      passed: true,
      ruleName: '營養值合理性檢查',
      severity: ValidationSeverity.WARNING,
      message: '所有食物的營養值都在合理範圍內'
    };
  }
};

/**
 * 份量描述完整性檢查
 * 檢查食物的份量描述是否完整和具體
 */
export const portionDescriptionCompletenessRule: ValidationRule = {
  name: '份量描述完整性檢查',
  description: '檢查食物的份量描述是否包含具體數字和單位',
  severity: ValidationSeverity.WARNING,
  enabled: true,
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    const issues: string[] = [];
    const affectedFoods: string[] = [];

    for (const food of result.foods) {
      const portion = food.estimatedPortion;

      // 檢查是否有份量資訊
      if (!portion || portion === 0) {
        issues.push(`${food.name} 缺少份量資訊`);
        affectedFoods.push(food.name);
        continue;
      }

      // 檢查份量是否在合理範圍內（10g - 1000g）
      if (portion < 10 || portion > 1000) {
        issues.push(`${food.name} 的份量可能不合理: ${portion}g`);
        affectedFoods.push(food.name);
      }

      // 檢查份量是否過於精確（可能是估算錯誤）
      // 例如 123.456g 這種過於精確的數字
      const portionStr = portion.toString();
      if (portionStr.includes('.') && portionStr.split('.')[1].length > 1) {
        issues.push(`${food.name} 的份量過於精確: ${portion}g，建議四捨五入`);
        affectedFoods.push(food.name);
      }
    }

    if (issues.length > 0) {
      return {
        passed: false,
        ruleName: '份量描述完整性檢查',
        severity: ValidationSeverity.WARNING,
        message: `發現 ${issues.length} 個份量描述問題`,
        suggestions: [
          '確保每個食物都有份量估算',
          '份量應該是合理的數值（通常在 10g-1000g 之間）',
          '份量可以四捨五入到整數或一位小數',
          '對於難以估算的食物，可以使用標準份量（如一碗、一盤等）'
        ],
        affectedFoods: [...new Set(affectedFoods)],
        details: {
          issues
        }
      };
    }

    return {
      passed: true,
      ruleName: '份量描述完整性檢查',
      severity: ValidationSeverity.WARNING,
      message: '所有食物都有完整的份量描述'
    };
  }
};

/**
 * 料理類型一致性檢查
 * 檢查識別出的食物、烹飪方式和料理類型是否一致
 */
export const cuisineTypeConsistencyRule: ValidationRule = {
  name: '料理類型一致性檢查',
  description: '檢查食物、烹飪方式和料理類型之間的一致性',
  severity: ValidationSeverity.INFO,
  enabled: true,
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 如果沒有料理類型，無法檢查
    if (!result.cuisineType) {
      return {
        passed: true,
        ruleName: '料理類型一致性檢查',
        severity: ValidationSeverity.INFO,
        message: '未指定料理類型，無法檢查一致性'
      };
    }

    // 檢查烹飪方式與料理類型的一致性
    if (result.cookingMethod) {
      const cookingMethodCuisineMap: Record<string, string[]> = {
        '涼拌': ['中式', '台式', '韓式'],
        '快炒': ['中式', '台式'],
        '清蒸': ['中式', '粵菜', '台式'],
        '紅燒': ['中式', '上海菜', '台式'],
        '滷': ['中式', '台式', '閩南菜'],
        '生食': ['日式'],
        '燒烤': ['日式', '韓式', '台式', '原住民料理']
      };

      const expectedCuisines = cookingMethodCuisineMap[result.cookingMethod];
      if (expectedCuisines && !expectedCuisines.includes(result.cuisineType)) {
        warnings.push(`烹飪方式「${result.cookingMethod}」通常不用於${result.cuisineType}料理`);
        suggestions.push(`「${result.cookingMethod}」常見於: ${expectedCuisines.join('、')}`);
      }
    }

    // 檢查食材與料理類型的一致性
    const foodNames = result.foods.map(f => f.name);

    // 日式料理特徵
    if (result.cuisineType === '日式') {
      const japaneseIngredients = ['味噌', '海苔', '柴魚', '醬油', '味醂', '清酒', '生魚片', '壽司'];
      const hasJapaneseIngredient = japaneseIngredients.some(ing => 
        foodNames.some(name => name.includes(ing))
      );

      if (!hasJapaneseIngredient && result.foods.length > 2) {
        warnings.push('標記為日式料理，但未檢測到典型的日式食材');
        suggestions.push('日式料理常見食材: 味噌、海苔、柴魚、生魚片等');
      }
    }

    // 韓式料理特徵
    if (result.cuisineType === '韓式') {
      const koreanIngredients = ['泡菜', '辣椒醬', '大醬', '年糕', '韓式'];
      const hasKoreanIngredient = koreanIngredients.some(ing => 
        foodNames.some(name => name.includes(ing))
      );

      if (!hasKoreanIngredient && result.foods.length > 2) {
        warnings.push('標記為韓式料理，但未檢測到典型的韓式食材');
        suggestions.push('韓式料理常見食材: 泡菜、辣椒醬、大醬、年糕等');
      }
    }

    // 原住民料理特徵
    if (result.cuisineType === '原住民料理') {
      const indigenousIngredients = ['小米', '馬告', '刺蔥', '過貓', '山蘇', '樹豆', '山豬肉', '飛魚'];
      const hasIndigenousIngredient = indigenousIngredients.some(ing => 
        foodNames.some(name => name.includes(ing))
      );

      if (!hasIndigenousIngredient) {
        warnings.push('標記為原住民料理，但未檢測到典型的原住民食材');
        suggestions.push('原住民料理常見食材: 小米、馬告、刺蔥、過貓、山蘇等');
      }
    }

    if (warnings.length > 0) {
      return {
        passed: false,
        ruleName: '料理類型一致性檢查',
        severity: ValidationSeverity.INFO,
        message: `料理類型與食材或烹飪方式可能不一致`,
        suggestions: [
          ...suggestions,
          '確認料理類型是否正確',
          '檢查是否有遺漏的特色食材',
          '考慮是否為融合料理或創意料理'
        ],
        details: {
          warnings,
          cuisineType: result.cuisineType,
          cookingMethod: result.cookingMethod,
          foods: foodNames
        }
      };
    }

    return {
      passed: true,
      ruleName: '料理類型一致性檢查',
      severity: ValidationSeverity.INFO,
      message: '料理類型與食材、烹飪方式一致'
    };
  }
};

/**
 * 烹飪方式營養影響檢查
 * 檢查烹飪方式對營養值的影響是否合理
 */
export const cookingMethodNutritionImpactRule: ValidationRule = {
  name: '烹飪方式營養影響檢查',
  description: '檢查烹飪方式對營養值的影響是否反映在數據中',
  severity: ValidationSeverity.INFO,
  enabled: true,
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    if (!result.cookingMethod) {
      return {
        passed: true,
        ruleName: '烹飪方式營養影響檢查',
        severity: ValidationSeverity.INFO,
        message: '未指定烹飪方式'
      };
    }

    const suggestions: string[] = [];
    const highFatMethods = ['油炸', '快炒', '煎'];
    const lowFatMethods = ['清蒸', '水煮', '川燙'];

    // 檢查油炸或快炒的食物是否有較高的脂肪含量
    if (highFatMethods.includes(result.cookingMethod)) {
      const avgFat = result.foods.reduce((sum, food) => {
        const portion = food.estimatedPortion || 100;
        return sum + (food.nutrition.fat / portion) * 100;
      }, 0) / result.foods.length;

      if (avgFat < 5) {
        suggestions.push(`${result.cookingMethod}的食物通常脂肪含量較高（平均 >5g/100g），當前平均值: ${avgFat.toFixed(1)}g/100g`);
      }
    }

    // 檢查清蒸或水煮的食物是否有較低的脂肪含量
    if (lowFatMethods.includes(result.cookingMethod)) {
      const avgFat = result.foods.reduce((sum, food) => {
        const portion = food.estimatedPortion || 100;
        return sum + (food.nutrition.fat / portion) * 100;
      }, 0) / result.foods.length;

      if (avgFat > 15) {
        suggestions.push(`${result.cookingMethod}的食物通常脂肪含量較低（平均 <15g/100g），當前平均值: ${avgFat.toFixed(1)}g/100g`);
      }
    }

    // 檢查涼拌菜的調味料
    if (result.cookingMethod === '涼拌') {
      const foodNames = result.foods.map(f => f.name);
      const hasOil = foodNames.some(name => name.includes('油') || name.includes('麻油'));
      
      if (hasOil) {
        const avgFat = result.foods.reduce((sum, food) => {
          const portion = food.estimatedPortion || 100;
          return sum + (food.nutrition.fat / portion) * 100;
        }, 0) / result.foods.length;

        if (avgFat < 3) {
          suggestions.push('涼拌菜使用了油類調味料，脂肪含量應該有所增加');
        }
      }
    }

    if (suggestions.length > 0) {
      return {
        passed: false,
        ruleName: '烹飪方式營養影響檢查',
        severity: ValidationSeverity.INFO,
        message: '烹飪方式對營養值的影響可能未正確反映',
        suggestions: [
          ...suggestions,
          '確認營養值是否考慮了烹飪方式的影響',
          '油炸、快炒會增加脂肪含量',
          '清蒸、水煮通常保持較低脂肪',
          '涼拌菜的調味料（如麻油）會增加脂肪和鈉含量'
        ],
        details: {
          cookingMethod: result.cookingMethod
        }
      };
    }

    return {
      passed: true,
      ruleName: '烹飪方式營養影響檢查',
      severity: ValidationSeverity.INFO,
      message: '烹飪方式對營養值的影響合理'
    };
  }
};

/**
 * 鈉含量合理性檢查
 * 檢查鈉含量是否符合料理類型和烹飪方式
 */
export const sodiumContentReasonablenessRule: ValidationRule = {
  name: '鈉含量合理性檢查',
  description: '檢查鈉含量是否符合料理特徵',
  severity: ValidationSeverity.INFO,
  enabled: true,
  check: (result: RecognitionResultForValidation, context: ValidationContext): ValidationResult => {
    const suggestions: string[] = [];

    // 計算平均鈉含量（每100克）
    const avgSodium = result.foods.reduce((sum, food) => {
      const portion = food.estimatedPortion || 100;
      return sum + (food.nutrition.sodium / portion) * 100;
    }, 0) / result.foods.length;

    // 檢查涼拌菜的鈉含量
    if (result.cookingMethod === '涼拌') {
      const foodNames = result.foods.map(f => f.name);
      const hasSoySauce = foodNames.some(name => name.includes('醬油'));

      if (hasSoySauce && avgSodium < 200) {
        suggestions.push('涼拌菜使用醬油調味，鈉含量通常較高（>200mg/100g）');
      }
    }

    // 檢查滷味的鈉含量
    if (result.cookingMethod === '滷' && avgSodium < 300) {
      suggestions.push('滷味通常鈉含量較高（>300mg/100g），因為滷汁含有大量醬油和鹽');
    }

    // 檢查清蒸的鈉含量
    if (result.cookingMethod === '清蒸' && avgSodium > 500) {
      suggestions.push('清蒸料理通常鈉含量較低（<500mg/100g），除非添加了大量調味料');
    }

    // 檢查日式料理的鈉含量
    if (result.cuisineType === '日式') {
      const foodNames = result.foods.map(f => f.name);
      const hasSoup = foodNames.some(name => name.includes('湯') || name.includes('味噌'));

      if (hasSoup && avgSodium < 400) {
        suggestions.push('日式湯品（如味噌湯）通常鈉含量較高（>400mg/100g）');
      }
    }

    if (suggestions.length > 0) {
      return {
        passed: false,
        ruleName: '鈉含量合理性檢查',
        severity: ValidationSeverity.INFO,
        message: `平均鈉含量: ${avgSodium.toFixed(0)}mg/100g，可能需要調整`,
        suggestions: [
          ...suggestions,
          '確認是否考慮了調味料的鈉含量',
          '醬油、鹽、味噌等調味料會顯著增加鈉含量',
          '清淡料理的鈉含量通常較低'
        ],
        details: {
          avgSodium: avgSodium.toFixed(0),
          cookingMethod: result.cookingMethod,
          cuisineType: result.cuisineType
        }
      };
    }

    return {
      passed: true,
      ruleName: '鈉含量合理性檢查',
      severity: ValidationSeverity.INFO,
      message: `鈉含量合理（平均 ${avgSodium.toFixed(0)}mg/100g）`
    };
  }
};

/**
 * 獲取所有營養和份量驗證規則
 */
export function getAllNutritionValidationRules(): ValidationRule[] {
  return [
    nutritionValueReasonablenessRule,
    portionDescriptionCompletenessRule,
    cuisineTypeConsistencyRule,
    cookingMethodNutritionImpactRule,
    sodiumContentReasonablenessRule
  ];
}
