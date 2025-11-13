import { NutritionData, FoodItem, Portion } from '../types/shared';
import { FoodRepository } from '../repositories/FoodRepository';

export interface NutritionCalculationResult {
  totalNutrition: NutritionData;
  portionUsed: number;
  calculationMethod: 'exact' | 'estimated' | 'interpolated';
  confidence: number;
  warnings: string[];
}

export interface PortionEstimationOptions {
  imageAnalysis?: {
    plateSize?: 'small' | 'medium' | 'large';
    foodCoverage?: number; // 0-1, 食物覆蓋盤子的比例
    density?: 'low' | 'medium' | 'high';
  };
  userInput?: {
    estimatedWeight?: number;
    portionDescription?: string;
  };
  contextualClues?: {
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    eatingLocation?: 'home' | 'restaurant' | 'fast_food';
  };
}

export class NutritionCalculator {
  private foodRepository: FoodRepository;
  
  // 標準份量參考表 (公克)
  private readonly standardPortions = new Map<string, number>([
    // 主食類
    ['rice', 150],
    ['米飯', 150],
    ['noodle', 100],
    ['麵條', 100],
    ['bread', 50],
    ['麵包', 50],
    ['pasta', 100],
    ['義大利麵', 100],
    
    // 蛋白質類
    ['chicken', 100],
    ['雞肉', 100],
    ['beef', 100],
    ['牛肉', 100],
    ['pork', 100],
    ['豬肉', 100],
    ['fish', 120],
    ['魚', 120],
    ['egg', 50],
    ['雞蛋', 50],
    ['tofu', 80],
    ['豆腐', 80],
    
    // 蔬菜類
    ['vegetable', 80],
    ['蔬菜', 80],
    ['salad', 100],
    ['沙拉', 100],
    ['broccoli', 85],
    ['花椰菜', 85],
    
    // 水果類
    ['apple', 150],
    ['蘋果', 150],
    ['banana', 120],
    ['香蕉', 120],
    ['orange', 130],
    ['橘子', 130],
    
    // 飲料類
    ['milk', 240],
    ['牛奶', 240],
    ['juice', 200],
    ['果汁', 200],
    ['coffee', 240],
    ['咖啡', 240],
    ['tea', 240],
    ['茶', 240],
    
    // 湯品類
    ['soup', 200],
    ['湯', 200]
  ]);

  // 盤子大小對應的容量 (毫升)
  private readonly plateCapacities = {
    small: 200,
    medium: 350,
    large: 500
  };

  constructor() {
    // 在實際使用時，這些會從依賴注入或環境中獲取
    // 這裡為了測試目的，我們先用 null 初始化
    this.foodRepository = new FoodRepository(null as any, null as any);
  }

  /**
   * 根據食物名稱估算標準份量
   */
  private estimateStandardPortion(foodName: string): number {
    const name = foodName.toLowerCase();
    
    // 直接匹配
    for (const [key, portion] of this.standardPortions) {
      if (name.includes(key)) {
        return portion;
      }
    }
    
    // 模糊匹配
    if (name.includes('rice') || name.includes('飯')) return 150;
    if (name.includes('meat') || name.includes('肉')) return 100;
    if (name.includes('vegetable') || name.includes('菜')) return 80;
    if (name.includes('fruit') || name.includes('水果')) return 150;
    if (name.includes('drink') || name.includes('飲')) return 240;
    
    return 100; // 預設份量
  }

  /**
   * 基於圖片分析估算份量
   */
  private estimatePortionFromImage(
    foodName: string,
    imageAnalysis: NonNullable<PortionEstimationOptions['imageAnalysis']>
  ): { portion: number; confidence: number } {
    const standardPortion = this.estimateStandardPortion(foodName);
    const { plateSize = 'medium', foodCoverage = 0.7, density = 'medium' } = imageAnalysis;
    
    // 基於盤子大小調整
    let sizeMultiplier = 1;
    switch (plateSize) {
      case 'small':
        sizeMultiplier = 0.7;
        break;
      case 'large':
        sizeMultiplier = 1.4;
        break;
      default:
        sizeMultiplier = 1;
    }
    
    // 基於食物覆蓋率調整
    const coverageMultiplier = Math.max(0.3, Math.min(1.5, foodCoverage));
    
    // 基於密度調整
    let densityMultiplier = 1;
    switch (density) {
      case 'low':
        densityMultiplier = 0.6; // 如沙拉、爆米花
        break;
      case 'high':
        densityMultiplier = 1.3; // 如肉類、起司
        break;
      default:
        densityMultiplier = 1;
    }
    
    const estimatedPortion = standardPortion * sizeMultiplier * coverageMultiplier * densityMultiplier;
    
    // 信心度計算 (基於可用資訊的完整性)
    let confidence = 0.6; // 基礎信心度
    if (plateSize !== 'medium') confidence += 0.1;
    if (foodCoverage !== 0.7) confidence += 0.1;
    if (density !== 'medium') confidence += 0.1;
    
    return {
      portion: Math.round(estimatedPortion),
      confidence: Math.min(confidence, 0.9)
    };
  }

  /**
   * 基於用戶輸入估算份量
   */
  private estimatePortionFromUserInput(
    foodName: string,
    userInput: NonNullable<PortionEstimationOptions['userInput']>
  ): { portion: number; confidence: number } {
    if (userInput.estimatedWeight) {
      return {
        portion: userInput.estimatedWeight,
        confidence: 0.9 // 用戶直接輸入重量，信心度高
      };
    }
    
    if (userInput.portionDescription) {
      const description = userInput.portionDescription.toLowerCase();
      const standardPortion = this.estimateStandardPortion(foodName);
      
      let multiplier = 1;
      let confidence = 0.7;
      
      // 解析份量描述
      if (description.includes('small') || description.includes('少') || description.includes('小')) {
        multiplier = 0.7;
        confidence = 0.8;
      } else if (description.includes('large') || description.includes('多') || description.includes('大')) {
        multiplier = 1.5;
        confidence = 0.8;
      } else if (description.includes('half') || description.includes('一半')) {
        multiplier = 0.5;
        confidence = 0.9;
      } else if (description.includes('double') || description.includes('兩倍')) {
        multiplier = 2;
        confidence = 0.9;
      }
      
      // 特定單位解析
      const bowlMatch = description.match(/(\d+)\s*(bowl|碗)/);
      if (bowlMatch) {
        const bowlCount = parseInt(bowlMatch[1]);
        multiplier = bowlCount;
        confidence = 0.85;
      }
      
      const pieceMatch = description.match(/(\d+)\s*(piece|片|塊)/);
      if (pieceMatch) {
        const pieceCount = parseInt(pieceMatch[1]);
        multiplier = pieceCount * 0.3; // 假設一片/塊約為標準份量的30%
        confidence = 0.75;
      }
      
      return {
        portion: Math.round(standardPortion * multiplier),
        confidence
      };
    }
    
    // 沒有具體輸入，使用標準份量
    return {
      portion: this.estimateStandardPortion(foodName),
      confidence: 0.5
    };
  }

  /**
   * 基於上下文線索調整份量
   */
  private adjustPortionByContext(
    basePortion: number,
    contextualClues: NonNullable<PortionEstimationOptions['contextualClues']>
  ): { portion: number; confidence: number } {
    let adjustedPortion = basePortion;
    let confidenceAdjustment = 0;
    
    // 根據用餐時間調整
    if (contextualClues.mealType) {
      switch (contextualClues.mealType) {
        case 'breakfast':
          adjustedPortion *= 0.8; // 早餐通常份量較小
          confidenceAdjustment += 0.05;
          break;
        case 'lunch':
          adjustedPortion *= 1.1; // 午餐份量適中偏大
          confidenceAdjustment += 0.05;
          break;
        case 'dinner':
          adjustedPortion *= 1.2; // 晚餐份量較大
          confidenceAdjustment += 0.05;
          break;
        case 'snack':
          adjustedPortion *= 0.4; // 點心份量小
          confidenceAdjustment += 0.1;
          break;
      }
    }
    
    // 根據用餐地點調整
    if (contextualClues.eatingLocation) {
      switch (contextualClues.eatingLocation) {
        case 'restaurant':
          adjustedPortion *= 1.3; // 餐廳份量通常較大
          confidenceAdjustment += 0.05;
          break;
        case 'fast_food':
          adjustedPortion *= 1.4; // 速食份量更大
          confidenceAdjustment += 0.05;
          break;
        case 'home':
          // 家庭份量保持標準
          confidenceAdjustment += 0.05;
          break;
      }
    }
    
    return {
      portion: Math.round(adjustedPortion),
      confidence: confidenceAdjustment
    };
  }

  /**
   * 智能份量估算
   */
  async estimatePortion(
    foodName: string,
    options: PortionEstimationOptions = {}
  ): Promise<{ portion: number; confidence: number; method: string }> {
    let bestEstimate = { portion: 100, confidence: 0.3, method: 'default' };
    
    // 方法1: 用戶直接輸入 (最高優先級)
    if (options.userInput) {
      const userEstimate = this.estimatePortionFromUserInput(foodName, options.userInput);
      if (userEstimate.confidence > bestEstimate.confidence) {
        bestEstimate = { ...userEstimate, method: 'user_input' };
      }
    }
    
    // 方法2: 圖片分析
    if (options.imageAnalysis) {
      const imageEstimate = this.estimatePortionFromImage(foodName, options.imageAnalysis);
      if (imageEstimate.confidence > bestEstimate.confidence) {
        bestEstimate = { ...imageEstimate, method: 'image_analysis' };
      }
    }
    
    // 方法3: 標準份量 (基礎方法)
    if (bestEstimate.confidence < 0.5) {
      const standardPortion = this.estimateStandardPortion(foodName);
      bestEstimate = { 
        portion: standardPortion, 
        confidence: 0.5, 
        method: 'standard_portion' 
      };
    }
    
    // 應用上下文調整
    if (options.contextualClues) {
      const contextAdjustment = this.adjustPortionByContext(
        bestEstimate.portion, 
        options.contextualClues
      );
      bestEstimate.portion = contextAdjustment.portion;
      bestEstimate.confidence = Math.min(
        bestEstimate.confidence + contextAdjustment.confidence, 
        0.95
      );
    }
    
    return bestEstimate;
  }

  /**
   * 計算指定份量的營養成分
   */
  calculateNutritionForPortion(
    nutritionPer100g: NutritionData,
    portionInGrams: number
  ): NutritionData {
    const ratio = portionInGrams / 100;
    
    return {
      calories: Math.round(nutritionPer100g.calories * ratio),
      protein: Math.round(nutritionPer100g.protein * ratio * 10) / 10,
      carbohydrates: Math.round(nutritionPer100g.carbohydrates * ratio * 10) / 10,
      fat: Math.round(nutritionPer100g.fat * ratio * 10) / 10,
      fiber: Math.round(nutritionPer100g.fiber * ratio * 10) / 10,
      sugar: Math.round(nutritionPer100g.sugar * ratio * 10) / 10,
      sodium: Math.round(nutritionPer100g.sodium * ratio * 10) / 10,
      vitamins: {
        vitaminA: Math.round(nutritionPer100g.vitamins.vitaminA * ratio * 10) / 10,
        vitaminC: Math.round(nutritionPer100g.vitamins.vitaminC * ratio * 10) / 10,
        vitaminD: Math.round(nutritionPer100g.vitamins.vitaminD * ratio * 10) / 10,
        vitaminE: Math.round(nutritionPer100g.vitamins.vitaminE * ratio * 10) / 10,
        vitaminK: Math.round(nutritionPer100g.vitamins.vitaminK * ratio * 10) / 10,
        thiamine: Math.round(nutritionPer100g.vitamins.thiamine * ratio * 10) / 10,
        riboflavin: Math.round(nutritionPer100g.vitamins.riboflavin * ratio * 10) / 10,
        niacin: Math.round(nutritionPer100g.vitamins.niacin * ratio * 10) / 10,
        vitaminB6: Math.round(nutritionPer100g.vitamins.vitaminB6 * ratio * 10) / 10,
        folate: Math.round(nutritionPer100g.vitamins.folate * ratio * 10) / 10,
        vitaminB12: Math.round(nutritionPer100g.vitamins.vitaminB12 * ratio * 10) / 10
      },
      minerals: {
        calcium: Math.round(nutritionPer100g.minerals.calcium * ratio * 10) / 10,
        iron: Math.round(nutritionPer100g.minerals.iron * ratio * 10) / 10,
        magnesium: Math.round(nutritionPer100g.minerals.magnesium * ratio * 10) / 10,
        phosphorus: Math.round(nutritionPer100g.minerals.phosphorus * ratio * 10) / 10,
        potassium: Math.round(nutritionPer100g.minerals.potassium * ratio * 10) / 10,
        sodium: Math.round(nutritionPer100g.minerals.sodium * ratio * 10) / 10,
        zinc: Math.round(nutritionPer100g.minerals.zinc * ratio * 10) / 10,
        copper: Math.round(nutritionPer100g.minerals.copper * ratio * 10) / 10,
        manganese: Math.round(nutritionPer100g.minerals.manganese * ratio * 10) / 10,
        selenium: Math.round(nutritionPer100g.minerals.selenium * ratio * 10) / 10
      }
    };
  }

  /**
   * 主要的營養計算方法
   */
  async calculateNutrition(
    foodId: string,
    options: PortionEstimationOptions = {}
  ): Promise<NutritionCalculationResult> {
    const warnings: string[] = [];
    
    try {
      // 獲取食物資訊
      const food = await this.foodRepository.findById(foodId);
      if (!food) {
        throw new Error(`找不到食物 ID: ${foodId}`);
      }
      
      // 估算份量
      const portionEstimate = await this.estimatePortion(food.name, options);
      
      // 計算營養成分
      const totalNutrition = this.calculateNutritionForPortion(
        food.nutritionPer100g,
        portionEstimate.portion
      );
      
      // 確定計算方法
      let calculationMethod: 'exact' | 'estimated' | 'interpolated' = 'estimated';
      if (options.userInput?.estimatedWeight) {
        calculationMethod = 'exact';
      } else if (portionEstimate.confidence > 0.8) {
        calculationMethod = 'estimated';
      } else {
        calculationMethod = 'interpolated';
      }
      
      // 生成警告
      if (portionEstimate.confidence < 0.6) {
        warnings.push('份量估算信心度較低，建議手動確認');
      }
      
      if (portionEstimate.portion > 500) {
        warnings.push('估算份量較大，請確認是否正確');
      }
      
      if (totalNutrition.calories > 1000) {
        warnings.push('熱量較高，請注意飲食均衡');
      }
      
      return {
        totalNutrition,
        portionUsed: portionEstimate.portion,
        calculationMethod,
        confidence: portionEstimate.confidence,
        warnings
      };
      
    } catch (error) {
      throw new Error(`營養計算失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 批量計算多個食物的營養成分
   */
  async calculateMultipleFoodsNutrition(
    foods: Array<{ foodId: string; options?: PortionEstimationOptions }>
  ): Promise<{
    totalNutrition: NutritionData;
    individualResults: NutritionCalculationResult[];
    overallConfidence: number;
    warnings: string[];
  }> {
    const individualResults: NutritionCalculationResult[] = [];
    const allWarnings: string[] = [];
    
    // 計算每個食物的營養
    for (const { foodId, options } of foods) {
      try {
        const result = await this.calculateNutrition(foodId, options);
        individualResults.push(result);
        allWarnings.push(...result.warnings);
      } catch (error) {
        allWarnings.push(`食物 ${foodId} 計算失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    }
    
    // 合併營養成分
    const totalNutrition = individualResults.reduce((total, result) => {
      const nutrition = result.totalNutrition;
      return {
        calories: total.calories + nutrition.calories,
        protein: Math.round((total.protein + nutrition.protein) * 10) / 10,
        carbohydrates: Math.round((total.carbohydrates + nutrition.carbohydrates) * 10) / 10,
        fat: Math.round((total.fat + nutrition.fat) * 10) / 10,
        fiber: Math.round((total.fiber + nutrition.fiber) * 10) / 10,
        sugar: Math.round((total.sugar + nutrition.sugar) * 10) / 10,
        sodium: Math.round((total.sodium + nutrition.sodium) * 10) / 10,
        vitamins: {
          vitaminA: Math.round((total.vitamins.vitaminA + nutrition.vitamins.vitaminA) * 10) / 10,
          vitaminC: Math.round((total.vitamins.vitaminC + nutrition.vitamins.vitaminC) * 10) / 10,
          vitaminD: Math.round((total.vitamins.vitaminD + nutrition.vitamins.vitaminD) * 10) / 10,
          vitaminE: Math.round((total.vitamins.vitaminE + nutrition.vitamins.vitaminE) * 10) / 10,
          vitaminK: Math.round((total.vitamins.vitaminK + nutrition.vitamins.vitaminK) * 10) / 10,
          thiamine: Math.round((total.vitamins.thiamine + nutrition.vitamins.thiamine) * 10) / 10,
          riboflavin: Math.round((total.vitamins.riboflavin + nutrition.vitamins.riboflavin) * 10) / 10,
          niacin: Math.round((total.vitamins.niacin + nutrition.vitamins.niacin) * 10) / 10,
          vitaminB6: Math.round((total.vitamins.vitaminB6 + nutrition.vitamins.vitaminB6) * 10) / 10,
          folate: Math.round((total.vitamins.folate + nutrition.vitamins.folate) * 10) / 10,
          vitaminB12: Math.round((total.vitamins.vitaminB12 + nutrition.vitamins.vitaminB12) * 10) / 10
        },
        minerals: {
          calcium: Math.round((total.minerals.calcium + nutrition.minerals.calcium) * 10) / 10,
          iron: Math.round((total.minerals.iron + nutrition.minerals.iron) * 10) / 10,
          magnesium: Math.round((total.minerals.magnesium + nutrition.minerals.magnesium) * 10) / 10,
          phosphorus: Math.round((total.minerals.phosphorus + nutrition.minerals.phosphorus) * 10) / 10,
          potassium: Math.round((total.minerals.potassium + nutrition.minerals.potassium) * 10) / 10,
          sodium: Math.round((total.minerals.sodium + nutrition.minerals.sodium) * 10) / 10,
          zinc: Math.round((total.minerals.zinc + nutrition.minerals.zinc) * 10) / 10,
          copper: Math.round((total.minerals.copper + nutrition.minerals.copper) * 10) / 10,
          manganese: Math.round((total.minerals.manganese + nutrition.minerals.manganese) * 10) / 10,
          selenium: Math.round((total.minerals.selenium + nutrition.minerals.selenium) * 10) / 10
        }
      };
    }, {
      calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
      vitamins: { vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, thiamine: 0, riboflavin: 0, niacin: 0, vitaminB6: 0, folate: 0, vitaminB12: 0 },
      minerals: { calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0, sodium: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0 }
    });
    
    // 計算整體信心度
    const overallConfidence = individualResults.length > 0 
      ? individualResults.reduce((sum, result) => sum + result.confidence, 0) / individualResults.length
      : 0;
    
    return {
      totalNutrition,
      individualResults,
      overallConfidence,
      warnings: [...new Set(allWarnings)] // 去重
    };
  }

  /**
   * 獲取營養建議
   */
  getNutritionAdvice(nutrition: NutritionData): string[] {
    const advice: string[] = [];
    
    // 熱量建議
    if (nutrition.calories > 800) {
      advice.push('這餐熱量較高，建議搭配運動或調整其他餐次');
    } else if (nutrition.calories < 200) {
      advice.push('這餐熱量較低，可能需要增加份量或營養密度');
    }
    
    // 蛋白質建議
    if (nutrition.protein < 10) {
      advice.push('蛋白質含量較低，建議增加蛋白質來源');
    }
    
    // 纖維建議
    if (nutrition.fiber < 3) {
      advice.push('纖維含量較低，建議增加蔬菜或全穀類');
    }
    
    // 鈉含量建議
    if (nutrition.sodium > 1000) {
      advice.push('鈉含量較高，請注意控制鹽分攝取');
    }
    
    return advice;
  }
}