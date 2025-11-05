import { 
  NutritionAnalysis,
  NutritionContextData,
  HealthGoal,
  UserProfile,
  MacronutrientBreakdown,
  HealthTrend,
  DateRange,
  GoalType,
  ActivityLevel,
  FoodLog,
  MealType
} from '@health-tracker/shared-types';
import { UserModel } from '../models/User';

/**
 * 營養分析器 - 分析用戶飲食模式和營養攝取
 */
export class NutritionAnalyzer {
  private readonly RECOMMENDED_MACROS = {
    protein: { min: 0.15, max: 0.25 }, // 15-25% 總熱量
    carbohydrates: { min: 0.45, max: 0.65 }, // 45-65% 總熱量
    fat: { min: 0.20, max: 0.35 } // 20-35% 總熱量
  };

  private readonly DAILY_FIBER_GOAL = {
    male: 38, // 克
    female: 25 // 克
  };

  /**
   * 分析用戶營養攝取模式
   */
  async analyzeNutritionPattern(
    nutritionData: NutritionContextData[],
    userProfile: UserProfile,
    healthGoals: HealthGoal[]
  ): Promise<NutritionAnalysis> {
    if (nutritionData.length === 0) {
      throw new Error('沒有營養資料可供分析');
    }

    const period: DateRange = {
      start: new Date(Math.min(...nutritionData.map(d => d.date.getTime()))),
      end: new Date(Math.max(...nutritionData.map(d => d.date.getTime())))
    };

    // 計算平均熱量攝取
    const averageCalories = this.calculateAverageCalories(nutritionData);

    // 分析巨量營養素平衡
    const macroBalance = this.analyzeMacronutrientBalance(nutritionData);

    // 識別營養缺乏和過量
    const deficiencies = this.identifyDeficiencies(nutritionData, userProfile);
    const excesses = this.identifyExcesses(nutritionData, userProfile);

    // 分析趨勢
    const trends = this.analyzeTrends(nutritionData);

    return {
      period,
      averageCalories,
      macroBalance,
      deficiencies,
      excesses,
      trends
    };
  }

  /**
   * 計算平均熱量攝取
   */
  private calculateAverageCalories(nutritionData: NutritionContextData[]): number {
    const totalCalories = nutritionData.reduce((sum, data) => sum + data.totalCalories, 0);
    return Math.round(totalCalories / nutritionData.length);
  }

  /**
   * 分析巨量營養素平衡
   */
  private analyzeMacronutrientBalance(nutritionData: NutritionContextData[]): MacronutrientBreakdown {
    const totalMacros = nutritionData.reduce(
      (sum, data) => ({
        protein: sum.protein + data.macros.protein,
        carbohydrates: sum.carbohydrates + data.macros.carbohydrates,
        fat: sum.fat + data.macros.fat,
        fiber: sum.fiber + data.macros.fiber
      }),
      { protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );

    const days = nutritionData.length;
    return {
      protein: Math.round(totalMacros.protein / days),
      carbohydrates: Math.round(totalMacros.carbohydrates / days),
      fat: Math.round(totalMacros.fat / days),
      fiber: Math.round(totalMacros.fiber / days)
    };
  }

  /**
   * 識別營養缺乏
   */
  private identifyDeficiencies(
    nutritionData: NutritionContextData[],
    userProfile: UserProfile
  ): string[] {
    const deficiencies: string[] = [];
    const averageCalories = this.calculateAverageCalories(nutritionData);
    const macroBalance = this.analyzeMacronutrientBalance(nutritionData);

    // 檢查蛋白質攝取
    const proteinCalories = macroBalance.protein * 4; // 1g 蛋白質 = 4 大卡
    const proteinPercentage = proteinCalories / averageCalories;
    if (proteinPercentage < this.RECOMMENDED_MACROS.protein.min) {
      deficiencies.push('蛋白質攝取不足');
    }

    // 檢查纖維攝取
    const fiberGoal = userProfile.gender === 'male' 
      ? this.DAILY_FIBER_GOAL.male 
      : this.DAILY_FIBER_GOAL.female;
    if (macroBalance.fiber < fiberGoal * 0.8) {
      deficiencies.push('膳食纖維攝取不足');
    }

    // 檢查熱量攝取是否過低
    const bmr = UserModel.calculateBMR(userProfile);
    if (averageCalories < bmr * 1.2) {
      deficiencies.push('總熱量攝取可能過低');
    }

    // 檢查餐點多樣性
    const mealVariety = this.analyzeMealVariety(nutritionData);
    if (mealVariety < 0.6) {
      deficiencies.push('飲食多樣性不足');
    }

    return deficiencies;
  }

  /**
   * 識別營養過量
   */
  private identifyExcesses(
    nutritionData: NutritionContextData[],
    userProfile: UserProfile
  ): string[] {
    const excesses: string[] = [];
    const averageCalories = this.calculateAverageCalories(nutritionData);
    const macroBalance = this.analyzeMacronutrientBalance(nutritionData);

    // 檢查脂肪攝取
    const fatCalories = macroBalance.fat * 9; // 1g 脂肪 = 9 大卡
    const fatPercentage = fatCalories / averageCalories;
    if (fatPercentage > this.RECOMMENDED_MACROS.fat.max) {
      excesses.push('脂肪攝取過多');
    }

    // 檢查碳水化合物攝取
    const carbCalories = macroBalance.carbohydrates * 4; // 1g 碳水化合物 = 4 大卡
    const carbPercentage = carbCalories / averageCalories;
    if (carbPercentage > this.RECOMMENDED_MACROS.carbohydrates.max) {
      excesses.push('碳水化合物攝取過多');
    }

    // 檢查總熱量攝取
    const tdee = UserModel.calculateTDEE(userProfile);
    if (averageCalories > tdee * 1.2) {
      excesses.push('總熱量攝取過多');
    }

    return excesses;
  }

  /**
   * 分析趨勢
   */
  private analyzeTrends(nutritionData: NutritionContextData[]): HealthTrend[] {
    const trends: HealthTrend[] = [];

    if (nutritionData.length < 3) {
      return trends; // 資料不足以分析趨勢
    }

    // 計算時間範圍
    const period: DateRange = {
      start: new Date(Math.min(...nutritionData.map(d => d.date.getTime()))),
      end: new Date(Math.max(...nutritionData.map(d => d.date.getTime())))
    };

    // 分析熱量趨勢
    const caloriesTrend = this.calculateTrend(
      nutritionData.map(d => d.totalCalories)
    );
    trends.push({
      metric: '每日熱量攝取',
      change: caloriesTrend.change,
      direction: caloriesTrend.direction,
      significance: caloriesTrend.significance,
      period,
      description: `熱量攝取${caloriesTrend.direction === 'up' ? '增加' : caloriesTrend.direction === 'down' ? '減少' : '穩定'}了${Math.abs(caloriesTrend.change).toFixed(1)}%`
    });

    // 分析蛋白質趨勢
    const proteinTrend = this.calculateTrend(
      nutritionData.map(d => d.macros.protein)
    );
    trends.push({
      metric: '蛋白質攝取',
      change: proteinTrend.change,
      direction: proteinTrend.direction,
      significance: proteinTrend.significance,
      period,
      description: `蛋白質攝取${proteinTrend.direction === 'up' ? '增加' : proteinTrend.direction === 'down' ? '減少' : '穩定'}了${Math.abs(proteinTrend.change).toFixed(1)}%`
    });

    // 分析纖維趨勢
    const fiberTrend = this.calculateTrend(
      nutritionData.map(d => d.macros.fiber)
    );
    trends.push({
      metric: '膳食纖維攝取',
      change: fiberTrend.change,
      direction: fiberTrend.direction,
      significance: fiberTrend.significance,
      period,
      description: `膳食纖維攝取${fiberTrend.direction === 'up' ? '增加' : fiberTrend.direction === 'down' ? '減少' : '穩定'}了${Math.abs(fiberTrend.change).toFixed(1)}%`
    });

    return trends;
  }

  /**
   * 計算數值趨勢
   */
  private calculateTrend(values: number[]): {
    change: number;
    direction: 'up' | 'down' | 'stable';
    significance: 'low' | 'medium' | 'high';
  } {
    if (values.length < 2) {
      return { change: 0, direction: 'stable', significance: 'low' };
    }

    // 使用線性回歸計算趨勢
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;

    // 計算變化百分比
    const change = Math.abs((slope * (n - 1)) / avgY) * 100;

    // 判斷方向
    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(slope) < avgY * 0.01) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    // 判斷顯著性
    let significance: 'low' | 'medium' | 'high';
    if (change < 5) {
      significance = 'low';
    } else if (change < 15) {
      significance = 'medium';
    } else {
      significance = 'high';
    }

    return { change: Math.round(change), direction, significance };
  }

  /**
   * 分析餐點多樣性
   */
  private analyzeMealVariety(nutritionData: NutritionContextData[]): number {
    // 簡化的多樣性計算 - 實際實作時應該基於具體的食物種類
    const totalMeals = nutritionData.reduce((sum, data) => sum + data.meals.length, 0);
    const uniqueFoods = new Set();
    
    nutritionData.forEach(data => {
      data.meals.forEach(meal => {
        uniqueFoods.add(meal.foodId);
      });
    });

    return totalMeals > 0 ? uniqueFoods.size / totalMeals : 0;
  }

  /**
   * 計算營養密度分數
   */
  calculateNutritionDensityScore(nutritionData: NutritionContextData[]): number {
    // 基於營養素攝取與熱量比例計算營養密度
    const macroBalance = this.analyzeMacronutrientBalance(nutritionData);
    const averageCalories = this.calculateAverageCalories(nutritionData);

    if (averageCalories === 0) return 0;

    // 計算各營養素密度
    const proteinDensity = (macroBalance.protein * 4) / averageCalories;
    const fiberDensity = macroBalance.fiber / (averageCalories / 1000); // 每1000大卡的纖維量

    // 綜合評分 (0-100)
    let score = 0;
    
    // 蛋白質密度評分 (0-40分)
    if (proteinDensity >= 0.15 && proteinDensity <= 0.25) {
      score += 40;
    } else {
      score += Math.max(0, 40 - Math.abs(proteinDensity - 0.2) * 200);
    }

    // 纖維密度評分 (0-30分)
    const idealFiberDensity = 14; // 每1000大卡14克纖維
    score += Math.max(0, 30 - Math.abs(fiberDensity - idealFiberDensity) * 2);

    // 餐點多樣性評分 (0-30分)
    const variety = this.analyzeMealVariety(nutritionData);
    score += variety * 30;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * 生成營養改善建議
   */
  generateNutritionImprovementSuggestions(
    analysis: NutritionAnalysis,
    userProfile: UserProfile,
    healthGoals: HealthGoal[]
  ): string[] {
    const suggestions: string[] = [];

    // 基於缺乏的營養素提供建議
    analysis.deficiencies.forEach(deficiency => {
      switch (deficiency) {
        case '蛋白質攝取不足':
          suggestions.push('增加優質蛋白質來源，如雞胸肉、魚類、豆腐或雞蛋');
          break;
        case '膳食纖維攝取不足':
          suggestions.push('多攝取蔬菜、水果和全穀類食物以增加膳食纖維');
          break;
        case '總熱量攝取可能過低':
          suggestions.push('適量增加健康食物的攝取量，確保滿足基礎代謝需求');
          break;
        case '飲食多樣性不足':
          suggestions.push('嘗試不同種類的食物，確保營養攝取的均衡性');
          break;
      }
    });

    // 基於過量的營養素提供建議
    analysis.excesses.forEach(excess => {
      switch (excess) {
        case '脂肪攝取過多':
          suggestions.push('減少油炸食物和高脂肪食品，選擇較清淡的烹調方式');
          break;
        case '碳水化合物攝取過多':
          suggestions.push('適量減少精製碳水化合物，增加蛋白質和蔬菜比例');
          break;
        case '總熱量攝取過多':
          suggestions.push('控制食物份量，增加蔬菜攝取以增加飽足感');
          break;
      }
    });

    // 基於健康目標提供建議
    healthGoals.forEach(goal => {
      switch (goal.type) {
        case GoalType.WEIGHT_LOSS:
          if (!suggestions.some(s => s.includes('控制食物份量'))) {
            suggestions.push('建立適度的熱量赤字，同時保持營養均衡');
          }
          break;
        case GoalType.MUSCLE_GAIN:
          if (!suggestions.some(s => s.includes('蛋白質'))) {
            suggestions.push('確保充足的蛋白質攝取以支持肌肉生長');
          }
          break;
        case GoalType.HEALTH_IMPROVEMENT:
          suggestions.push('增加抗氧化食物如莓果類和深色蔬菜的攝取');
          break;
      }
    });

    // 基於趨勢提供建議
    analysis.trends.forEach(trend => {
      if (trend.significance === 'high') {
        if (trend.metric === '每日熱量攝取' && trend.direction === 'up') {
          suggestions.push('注意控制熱量攝取的增長趨勢');
        } else if (trend.metric === '蛋白質攝取' && trend.direction === 'down') {
          suggestions.push('注意維持穩定的蛋白質攝取');
        }
      }
    });

    // 移除重複建議並限制數量
    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * 計算與健康目標的符合度
   */
  calculateGoalAlignment(
    analysis: NutritionAnalysis,
    userProfile: UserProfile,
    healthGoals: HealthGoal[]
  ): { [goalId: string]: number } {
    const alignment: { [goalId: string]: number } = {};

    healthGoals.forEach(goal => {
      let score = 50; // 基礎分數

      const tdee = UserModel.calculateTDEE(userProfile);
      const calorieRatio = analysis.averageCalories / tdee;

      switch (goal.type) {
        case GoalType.WEIGHT_LOSS:
          // 減重目標：熱量攝取應略低於TDEE
          if (calorieRatio >= 0.8 && calorieRatio <= 0.9) {
            score += 30;
          } else if (calorieRatio < 0.8) {
            score -= 20; // 過度限制
          } else {
            score -= (calorieRatio - 0.9) * 50;
          }
          break;

        case GoalType.WEIGHT_GAIN:
          // 增重目標：熱量攝取應略高於TDEE
          if (calorieRatio >= 1.1 && calorieRatio <= 1.2) {
            score += 30;
          } else if (calorieRatio > 1.2) {
            score -= 20; // 過度攝取
          } else {
            score -= (1.1 - calorieRatio) * 50;
          }
          break;

        case GoalType.MUSCLE_GAIN:
          // 肌肉增長：需要充足蛋白質
          const proteinPerKg = analysis.macroBalance.protein / userProfile.weight;
          if (proteinPerKg >= 1.6) {
            score += 30;
          } else {
            score -= (1.6 - proteinPerKg) * 20;
          }
          break;

        case GoalType.MAINTENANCE:
          // 維持體重：熱量攝取應接近TDEE
          if (calorieRatio >= 0.95 && calorieRatio <= 1.05) {
            score += 30;
          } else {
            score -= Math.abs(calorieRatio - 1) * 50;
          }
          break;
      }

      // 基於營養缺乏和過量調整分數
      score -= analysis.deficiencies.length * 10;
      score -= analysis.excesses.length * 15;

      alignment[goal.id] = Math.max(0, Math.min(100, Math.round(score)));
    });

    return alignment;
  }
}