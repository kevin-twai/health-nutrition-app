import Joi from 'joi';
import { FoodItem, NutritionData, FoodLog, FoodCategory, MealType, LogSource } from '../types/shared';
import { FoodItemDocument, FoodLogDocument } from '../database/mongodb';

// 營養資料驗證 Schema
export const nutritionDataValidationSchema = Joi.object({
  calories: Joi.number().min(0).max(9000).required().messages({
    'number.min': '熱量不能為負數',
    'number.max': '熱量不能超過9000大卡',
    'any.required': '熱量為必填欄位'
  }),
  protein: Joi.number().min(0).max(1000).required().messages({
    'number.min': '蛋白質不能為負數',
    'number.max': '蛋白質不能超過1000公克',
    'any.required': '蛋白質為必填欄位'
  }),
  carbohydrates: Joi.number().min(0).max(1000).required().messages({
    'number.min': '碳水化合物不能為負數',
    'number.max': '碳水化合物不能超過1000公克',
    'any.required': '碳水化合物為必填欄位'
  }),
  fat: Joi.number().min(0).max(1000).required().messages({
    'number.min': '脂肪不能為負數',
    'number.max': '脂肪不能超過1000公克',
    'any.required': '脂肪為必填欄位'
  }),
  fiber: Joi.number().min(0).max(1000).default(0).messages({
    'number.min': '膳食纖維不能為負數',
    'number.max': '膳食纖維不能超過1000公克'
  }),
  sugar: Joi.number().min(0).max(1000).default(0).messages({
    'number.min': '糖分不能為負數',
    'number.max': '糖分不能超過1000公克'
  }),
  sodium: Joi.number().min(0).max(100000).default(0).messages({
    'number.min': '鈉含量不能為負數',
    'number.max': '鈉含量不能超過100000毫克'
  }),
  vitamins: Joi.object({
    vitaminA: Joi.number().min(0).default(0),
    vitaminC: Joi.number().min(0).default(0),
    vitaminD: Joi.number().min(0).default(0),
    vitaminE: Joi.number().min(0).default(0),
    vitaminK: Joi.number().min(0).default(0),
    thiamine: Joi.number().min(0).default(0),
    riboflavin: Joi.number().min(0).default(0),
    niacin: Joi.number().min(0).default(0),
    vitaminB6: Joi.number().min(0).default(0),
    folate: Joi.number().min(0).default(0),
    vitaminB12: Joi.number().min(0).default(0)
  }).default({}),
  minerals: Joi.object({
    calcium: Joi.number().min(0).default(0),
    iron: Joi.number().min(0).default(0),
    magnesium: Joi.number().min(0).default(0),
    phosphorus: Joi.number().min(0).default(0),
    potassium: Joi.number().min(0).default(0),
    sodium: Joi.number().min(0).default(0),
    zinc: Joi.number().min(0).default(0),
    copper: Joi.number().min(0).default(0),
    manganese: Joi.number().min(0).default(0),
    selenium: Joi.number().min(0).default(0)
  }).default({})
});

// 食物項目驗證 Schema
export const foodItemValidationSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.min': '食物名稱不能為空',
    'string.empty': '食物名稱不能為空',
    'string.max': '食物名稱不能超過255個字符',
    'any.required': '食物名稱為必填欄位'
  }),
  name_en: Joi.string().max(255).optional(),
  name_zh: Joi.string().max(255).optional(),
  category: Joi.string().valid(...Object.values(FoodCategory)).required().messages({
    'any.only': '食物分類必須是有效的選項',
    'any.required': '食物分類為必填欄位'
  }),
  nutritionPer100g: nutritionDataValidationSchema.required(),
  commonPortions: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      weight: Joi.number().positive().required(),
      description: Joi.string().optional()
    })
  ).min(1).required().messages({
    'array.min': '至少需要提供一個常見份量',
    'any.required': '常見份量為必填欄位'
  }),
  tags: Joi.array().items(Joi.string()).default([]),
  brand: Joi.string().max(100).optional(),
  barcode: Joi.string().max(50).optional(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  verified: Joi.boolean().default(false),
  source: Joi.string().valid('usda', 'taiwan_fda', 'user_contributed', 'manual').default('manual')
});

// 食物記錄驗證 Schema
export const foodLogValidationSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.guid': '用戶ID格式不正確',
    'any.required': '用戶ID為必填欄位'
  }),
  foodId: Joi.string().required().messages({
    'any.required': '食物ID為必填欄位'
  }),
  portion: Joi.number().positive().max(10000).required().messages({
    'number.positive': '份量必須為正數',
    'number.max': '份量不能超過10000公克',
    'any.required': '份量為必填欄位'
  }),
  mealType: Joi.string().valid(...Object.values(MealType)).required().messages({
    'any.only': '餐點類型必須是有效的選項',
    'any.required': '餐點類型為必填欄位'
  }),
  timestamp: Joi.date().max('now').default(() => new Date()).messages({
    'date.max': '記錄時間不能是未來時間'
  }),
  source: Joi.string().valid(...Object.values(LogSource)).default(LogSource.MANUAL_INPUT),
  confidence: Joi.number().min(0).max(1).optional().messages({
    'number.min': '信心度不能小於0',
    'number.max': '信心度不能大於1'
  })
});

// 食物搜尋驗證 Schema
export const foodSearchValidationSchema = Joi.object({
  query: Joi.string().min(1).max(100).required().messages({
    'string.min': '搜尋關鍵字不能為空',
    'string.empty': '搜尋關鍵字不能為空',
    'string.max': '搜尋關鍵字不能超過100個字符',
    'any.required': '搜尋關鍵字為必填欄位'
  }),
  category: Joi.string().valid(...Object.values(FoodCategory)).optional(),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.min': '限制數量不能小於1',
    'number.max': '限制數量不能超過100'
  }),
  offset: Joi.number().integer().min(0).default(0).messages({
    'number.min': '偏移量不能小於0'
  })
});

// 食物模型類別
export class FoodModel {
  // 驗證營養資料
  static validateNutritionData(nutritionData: any): { error?: Joi.ValidationError; value?: NutritionData } {
    return nutritionDataValidationSchema.validate(nutritionData, { abortEarly: false });
  }

  // 驗證食物項目
  static validateFoodItem(foodData: any): { error?: Joi.ValidationError; value?: FoodItemDocument } {
    return foodItemValidationSchema.validate(foodData, { abortEarly: false });
  }

  // 驗證食物記錄
  static validateFoodLog(logData: any): { error?: Joi.ValidationError; value?: FoodLog } {
    return foodLogValidationSchema.validate(logData, { abortEarly: false });
  }

  // 驗證搜尋參數
  static validateSearch(searchData: any): { error?: Joi.ValidationError; value?: any } {
    return foodSearchValidationSchema.validate(searchData, { abortEarly: false });
  }

  // 序列化食物項目
  static serializeFoodItem(foodDoc: FoodItemDocument): FoodItem {
    return {
      id: foodDoc._id?.toString() || foodDoc.id,
      name: foodDoc.name,
      category: foodDoc.category,
      nutritionPer100g: foodDoc.nutritionPer100g,
      commonPortions: foodDoc.commonPortions,
      tags: foodDoc.tags
    };
  }

  // 序列化食物記錄
  static serializeFoodLog(logDoc: FoodLogDocument): FoodLog {
    return {
      id: logDoc._id?.toString() || logDoc.id,
      userId: logDoc.userId,
      foodId: logDoc.foodId,
      portion: logDoc.portion,
      mealType: logDoc.mealType,
      timestamp: logDoc.timestamp,
      source: logDoc.source,
      confidence: logDoc.confidence
    };
  }

  // 計算實際營養攝取量
  static calculateActualNutrition(nutritionPer100g: NutritionData, portionGrams: number): NutritionData {
    const multiplier = portionGrams / 100;
    
    return {
      calories: Math.round(nutritionPer100g.calories * multiplier * 10) / 10,
      protein: Math.round(nutritionPer100g.protein * multiplier * 10) / 10,
      carbohydrates: Math.round(nutritionPer100g.carbohydrates * multiplier * 10) / 10,
      fat: Math.round(nutritionPer100g.fat * multiplier * 10) / 10,
      fiber: Math.round(nutritionPer100g.fiber * multiplier * 10) / 10,
      sugar: Math.round(nutritionPer100g.sugar * multiplier * 10) / 10,
      sodium: Math.round(nutritionPer100g.sodium * multiplier * 10) / 10,
      vitamins: {
        vitaminA: Math.round(nutritionPer100g.vitamins.vitaminA * multiplier * 100) / 100,
        vitaminC: Math.round(nutritionPer100g.vitamins.vitaminC * multiplier * 100) / 100,
        vitaminD: Math.round(nutritionPer100g.vitamins.vitaminD * multiplier * 100) / 100,
        vitaminE: Math.round(nutritionPer100g.vitamins.vitaminE * multiplier * 100) / 100,
        vitaminK: Math.round(nutritionPer100g.vitamins.vitaminK * multiplier * 100) / 100,
        thiamine: Math.round(nutritionPer100g.vitamins.thiamine * multiplier * 100) / 100,
        riboflavin: Math.round(nutritionPer100g.vitamins.riboflavin * multiplier * 100) / 100,
        niacin: Math.round(nutritionPer100g.vitamins.niacin * multiplier * 100) / 100,
        vitaminB6: Math.round(nutritionPer100g.vitamins.vitaminB6 * multiplier * 100) / 100,
        folate: Math.round(nutritionPer100g.vitamins.folate * multiplier * 100) / 100,
        vitaminB12: Math.round(nutritionPer100g.vitamins.vitaminB12 * multiplier * 100) / 100
      },
      minerals: {
        calcium: Math.round(nutritionPer100g.minerals.calcium * multiplier * 100) / 100,
        iron: Math.round(nutritionPer100g.minerals.iron * multiplier * 100) / 100,
        magnesium: Math.round(nutritionPer100g.minerals.magnesium * multiplier * 100) / 100,
        phosphorus: Math.round(nutritionPer100g.minerals.phosphorus * multiplier * 100) / 100,
        potassium: Math.round(nutritionPer100g.minerals.potassium * multiplier * 100) / 100,
        sodium: Math.round(nutritionPer100g.minerals.sodium * multiplier * 100) / 100,
        zinc: Math.round(nutritionPer100g.minerals.zinc * multiplier * 100) / 100,
        copper: Math.round(nutritionPer100g.minerals.copper * multiplier * 100) / 100,
        manganese: Math.round(nutritionPer100g.minerals.manganese * multiplier * 100) / 100,
        selenium: Math.round(nutritionPer100g.minerals.selenium * multiplier * 100) / 100
      }
    };
  }

  // 計算食物的營養密度分數 (0-100)
  static calculateNutritionDensityScore(nutrition: NutritionData): number {
    const { calories, protein, fiber, vitamins, minerals } = nutrition;
    
    if (calories === 0) return 0;
    
    // 計算蛋白質密度 (蛋白質克數 / 100大卡)
    const proteinDensity = (protein / calories) * 100;
    
    // 計算纖維密度
    const fiberDensity = (fiber / calories) * 100;
    
    // 計算維生素總量 (標準化)
    const vitaminScore = (
      vitamins.vitaminA / 900 + // RDA 比例
      vitamins.vitaminC / 90 +
      vitamins.vitaminD / 20 +
      vitamins.vitaminE / 15 +
      vitamins.vitaminK / 120 +
      vitamins.thiamine / 1.2 +
      vitamins.riboflavin / 1.3 +
      vitamins.niacin / 16 +
      vitamins.vitaminB6 / 1.7 +
      vitamins.folate / 400 +
      vitamins.vitaminB12 / 2.4
    ) / 11 * 100;
    
    // 計算礦物質總量 (標準化)
    const mineralScore = (
      minerals.calcium / 1000 +
      minerals.iron / 18 +
      minerals.magnesium / 400 +
      minerals.phosphorus / 700 +
      minerals.potassium / 4700 +
      minerals.zinc / 11 +
      minerals.copper / 0.9 +
      minerals.manganese / 2.3 +
      minerals.selenium / 55
    ) / 9 * 100;
    
    // 綜合評分 (加權平均)
    const totalScore = (
      proteinDensity * 0.3 +
      fiberDensity * 0.2 +
      vitaminScore * 0.25 +
      mineralScore * 0.25
    );
    
    return Math.min(Math.round(totalScore), 100);
  }

  // 分類食物的健康等級
  static categorizeHealthLevel(nutrition: NutritionData): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = this.calculateNutritionDensityScore(nutrition);
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  // 生成食物建議標籤
  static generateFoodTags(nutrition: NutritionData): string[] {
    const tags: string[] = [];
    
    // 熱量標籤
    if (nutrition.calories < 50) tags.push('低熱量');
    else if (nutrition.calories > 300) tags.push('高熱量');
    
    // 蛋白質標籤
    if (nutrition.protein > 20) tags.push('高蛋白');
    else if (nutrition.protein < 5) tags.push('低蛋白');
    
    // 纖維標籤
    if (nutrition.fiber > 5) tags.push('高纖維');
    
    // 鈉含量標籤
    if (nutrition.sodium > 600) tags.push('高鈉');
    else if (nutrition.sodium < 140) tags.push('低鈉');
    
    // 糖分標籤
    if (nutrition.sugar > 15) tags.push('高糖');
    else if (nutrition.sugar < 5) tags.push('低糖');
    
    // 脂肪標籤
    if (nutrition.fat > 20) tags.push('高脂肪');
    else if (nutrition.fat < 3) tags.push('低脂肪');
    
    // 健康等級標籤
    const healthLevel = this.categorizeHealthLevel(nutrition);
    switch (healthLevel) {
      case 'excellent':
        tags.push('營養豐富');
        break;
      case 'good':
        tags.push('營養良好');
        break;
      case 'fair':
        tags.push('營養普通');
        break;
      case 'poor':
        tags.push('營養較少');
        break;
    }
    
    return tags;
  }
}