import { 
  Recommendation,
  RecommendationType,
  Priority,
  HealthGoal,
  UserProfile,
  NutritionAnalysis,
  NutritionContextData,
  GoalType,
  ActivityLevel,
  MealType
} from '@health-tracker/shared-types';
import { NutritionAnalyzer } from './NutritionAnalyzer';
import { v4 as uuidv4 } from 'uuid';

/**
 * 建議引擎 - 生成個人化健康和營養建議
 */
export class RecommendationEngine {
  private nutritionAnalyzer: NutritionAnalyzer;

  constructor() {
    this.nutritionAnalyzer = new NutritionAnalyzer();
  }

  /**
   * 生成個人化建議
   */
  async generatePersonalizedRecommendations(
    userProfile: UserProfile,
    healthGoals: HealthGoal[],
    nutritionData: NutritionContextData[],
    context?: {
      recentChallenges?: string[];
      preferences?: string[];
      timeConstraints?: string[];
    }
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 分析營養狀況
    let nutritionAnalysis: NutritionAnalysis | null = null;
    if (nutritionData.length > 0) {
      nutritionAnalysis = await this.nutritionAnalyzer.analyzeNutritionPattern(
        nutritionData,
        userProfile,
        healthGoals
      );
    }

    // 基於營養分析生成建議
    if (nutritionAnalysis) {
      recommendations.push(...this.generateNutritionBasedRecommendations(nutritionAnalysis));
    }

    // 基於健康目標生成建議
    recommendations.push(...this.generateGoalBasedRecommendations(healthGoals, userProfile));

    // 基於用戶檔案生成建議
    recommendations.push(...this.generateProfileBasedRecommendations(userProfile));

    // 基於上下文生成建議
    if (context) {
      recommendations.push(...this.generateContextBasedRecommendations(context, userProfile));
    }

    // 排序和過濾建議
    const prioritizedRecommendations = this.prioritizeRecommendations(
      recommendations,
      healthGoals,
      nutritionAnalysis
    );

    // 返回前 8 個最相關的建議
    return prioritizedRecommendations.slice(0, 8);
  }

  /**
   * 基於營養分析生成建議
   */
  private generateNutritionBasedRecommendations(analysis: NutritionAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 處理營養缺乏
    analysis.deficiencies.forEach(deficiency => {
      switch (deficiency) {
        case '蛋白質攝取不足':
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '增加蛋白質攝取',
            description: '每餐加入一份優質蛋白質，如雞胸肉、魚類、豆腐或雞蛋。建議每公斤體重攝取1.2-1.6克蛋白質。',
            priority: Priority.HIGH,
            actionable: true,
            relatedGoals: []
          });
          break;

        case '膳食纖維攝取不足':
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '增加膳食纖維',
            description: '每餐至少包含一份蔬菜，選擇全穀類食物，並增加水果攝取。目標每日25-35克膳食纖維。',
            priority: Priority.MEDIUM,
            actionable: true,
            relatedGoals: []
          });
          break;

        case '總熱量攝取可能過低':
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '適量增加熱量攝取',
            description: '在正餐中增加健康的熱量來源，如堅果、酪梨或橄欖油，確保滿足基礎代謝需求。',
            priority: Priority.HIGH,
            actionable: true,
            relatedGoals: []
          });
          break;

        case '飲食多樣性不足':
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.MEAL_PLANNING,
            title: '增加飲食多樣性',
            description: '每週嘗試2-3種新的蔬菜或蛋白質來源，確保攝取不同顏色的蔬果以獲得多元營養素。',
            priority: Priority.MEDIUM,
            actionable: true,
            relatedGoals: []
          });
          break;
      }
    });

    // 處理營養過量
    analysis.excesses.forEach(excess => {
      switch (excess) {
        case '脂肪攝取過多':
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '調整脂肪攝取',
            description: '選擇較清淡的烹調方式，如蒸、煮、烤，減少油炸食物，選擇瘦肉部位。',
            priority: Priority.MEDIUM,
            actionable: true,
            relatedGoals: []
          });
          break;

        case '碳水化合物攝取過多':
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '優化碳水化合物攝取',
            description: '減少精製糖和白米飯，增加全穀類、蔬菜和蛋白質的比例。',
            priority: Priority.MEDIUM,
            actionable: true,
            relatedGoals: []
          });
          break;

        case '總熱量攝取過多':
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.HABIT_FORMATION,
            title: '控制食物份量',
            description: '使用較小的餐具，餐前喝一杯水，細嚼慢嚥，並增加蔬菜攝取以增加飽足感。',
            priority: Priority.HIGH,
            actionable: true,
            relatedGoals: []
          });
          break;
      }
    });

    return recommendations;
  }

  /**
   * 基於健康目標生成建議
   */
  private generateGoalBasedRecommendations(
    healthGoals: HealthGoal[],
    userProfile: UserProfile
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    healthGoals.forEach(goal => {
      switch (goal.type) {
        case GoalType.WEIGHT_LOSS:
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.MEAL_PLANNING,
            title: '減重餐點規劃',
            description: '建立適度的熱量赤字（每日減少300-500大卡），重點攝取蛋白質和蔬菜，減少精製食品。',
            priority: Priority.HIGH,
            actionable: true,
            relatedGoals: [goal.id]
          });

          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.HABIT_FORMATION,
            title: '建立健康飲食習慣',
            description: '定時用餐，避免情緒性進食，餐前記錄飲食計劃，培養正念飲食習慣。',
            priority: Priority.MEDIUM,
            actionable: true,
            relatedGoals: [goal.id]
          });
          break;

        case GoalType.WEIGHT_GAIN:
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '健康增重策略',
            description: '增加健康熱量來源，如堅果、酪梨、全穀類，少量多餐，重點增加蛋白質攝取。',
            priority: Priority.HIGH,
            actionable: true,
            relatedGoals: [goal.id]
          });
          break;

        case GoalType.MUSCLE_GAIN:
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '肌肉增長營養支持',
            description: '確保每公斤體重攝取1.6-2.2克蛋白質，運動後30分鐘內補充蛋白質和碳水化合物。',
            priority: Priority.HIGH,
            actionable: true,
            relatedGoals: [goal.id]
          });

          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.EXERCISE,
            title: '配合阻力訓練',
            description: '每週進行2-3次阻力訓練，重點訓練大肌群，確保充足休息以促進肌肉恢復。',
            priority: Priority.MEDIUM,
            actionable: true,
            relatedGoals: [goal.id]
          });
          break;

        case GoalType.HEALTH_IMPROVEMENT:
          recommendations.push({
            id: uuidv4(),
            type: RecommendationType.NUTRITION_ADJUSTMENT,
            title: '提升整體健康',
            description: '增加抗氧化食物攝取，如莓果、深色蔬菜，減少加工食品，保持水分充足。',
            priority: Priority.MEDIUM,
            actionable: true,
            relatedGoals: [goal.id]
          });
          break;
      }
    });

    return recommendations;
  }

  /**
   * 基於用戶檔案生成建議
   */
  private generateProfileBasedRecommendations(userProfile: UserProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 基於年齡的建議
    if (userProfile.age > 50) {
      recommendations.push({
        id: uuidv4(),
        type: RecommendationType.NUTRITION_ADJUSTMENT,
        title: '中高齡營養重點',
        description: '增加鈣質和維生素D攝取，選擇易消化的蛋白質來源，注意維生素B12的補充。',
        priority: Priority.MEDIUM,
        actionable: true,
        relatedGoals: []
      });
    }

    // 基於活動水平的建議
    if (userProfile.activityLevel === ActivityLevel.SEDENTARY) {
      recommendations.push({
        id: uuidv4(),
        type: RecommendationType.EXERCISE,
        title: '增加日常活動',
        description: '從每天10分鐘的輕度運動開始，如散步或伸展，逐漸增加活動量。',
        priority: Priority.MEDIUM,
        actionable: true,
        relatedGoals: []
      });
    } else if (userProfile.activityLevel === ActivityLevel.VERY_ACTIVE) {
      recommendations.push({
        id: uuidv4(),
        type: RecommendationType.NUTRITION_ADJUSTMENT,
        title: '高活動量營養支持',
        description: '確保充足的碳水化合物和蛋白質攝取，注意電解質平衡和水分補充。',
        priority: Priority.MEDIUM,
        actionable: true,
        relatedGoals: []
      });
    }

    // 基於性別的建議
    if (userProfile.gender === 'female') {
      recommendations.push({
        id: uuidv4(),
        type: RecommendationType.NUTRITION_ADJUSTMENT,
        title: '女性營養重點',
        description: '注意鐵質攝取，選擇富含葉酸的食物，確保鈣質充足以維護骨骼健康。',
        priority: Priority.LOW,
        actionable: true,
        relatedGoals: []
      });
    }

    return recommendations;
  }

  /**
   * 基於上下文生成建議
   */
  private generateContextBasedRecommendations(
    context: {
      recentChallenges?: string[];
      preferences?: string[];
      timeConstraints?: string[];
    },
    userProfile: UserProfile
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 基於時間限制的建議
    if (context.timeConstraints?.includes('忙碌')) {
      recommendations.push({
        id: uuidv4(),
        type: RecommendationType.MEAL_PLANNING,
        title: '忙碌生活的營養策略',
        description: '準備簡單的健康餐點，如沙拉罐、蛋白質奶昔，週末進行餐點預備。',
        priority: Priority.MEDIUM,
        actionable: true,
        relatedGoals: []
      });
    }

    // 基於最近挑戰的建議
    if (context.recentChallenges?.includes('外食頻繁')) {
      recommendations.push({
        id: uuidv4(),
        type: RecommendationType.HABIT_FORMATION,
        title: '外食健康選擇',
        description: '選擇烤或蒸的料理方式，要求醬料另外提供，增加蔬菜份量，控制份量大小。',
        priority: Priority.HIGH,
        actionable: true,
        relatedGoals: []
      });
    }

    if (context.recentChallenges?.includes('情緒性進食')) {
      recommendations.push({
        id: uuidv4(),
        type: RecommendationType.HABIT_FORMATION,
        title: '管理情緒性進食',
        description: '識別情緒觸發因子，建立替代性活動（如散步、深呼吸），保持規律的用餐時間。',
        priority: Priority.HIGH,
        actionable: true,
        relatedGoals: []
      });
    }

    return recommendations;
  }

  /**
   * 排序和優先化建議
   */
  private prioritizeRecommendations(
    recommendations: Recommendation[],
    healthGoals: HealthGoal[],
    nutritionAnalysis?: NutritionAnalysis | null
  ): Recommendation[] {
    return recommendations.sort((a, b) => {
      // 優先級權重
      const priorityWeight = {
        [Priority.HIGH]: 3,
        [Priority.MEDIUM]: 2,
        [Priority.LOW]: 1,
        [Priority.URGENT]: 4
      };

      let scoreA = priorityWeight[a.priority];
      let scoreB = priorityWeight[b.priority];

      // 與健康目標相關的建議加分
      if (a.relatedGoals.length > 0) scoreA += 1;
      if (b.relatedGoals.length > 0) scoreB += 1;

      // 可執行的建議加分
      if (a.actionable) scoreA += 0.5;
      if (b.actionable) scoreB += 0.5;

      // 營養調整類型的建議在有營養分析時加分
      if (nutritionAnalysis && a.type === RecommendationType.NUTRITION_ADJUSTMENT) {
        scoreA += 0.5;
      }
      if (nutritionAnalysis && b.type === RecommendationType.NUTRITION_ADJUSTMENT) {
        scoreB += 0.5;
      }

      return scoreB - scoreA;
    });
  }

  /**
   * 生成餐點建議
   */
  generateMealRecommendations(
    mealType: MealType,
    userProfile: UserProfile,
    healthGoals: HealthGoal[],
    nutritionTargets?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const mealTypeNames = {
      [MealType.BREAKFAST]: '早餐',
      [MealType.LUNCH]: '午餐',
      [MealType.DINNER]: '晚餐',
      [MealType.SNACK]: '點心'
    };

    const mealName = mealTypeNames[mealType];

    // 基於餐點類型的基礎建議
    switch (mealType) {
      case MealType.BREAKFAST:
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.MEAL_PLANNING,
          title: `營養豐富的${mealName}`,
          description: '包含蛋白質（如雞蛋、優格）、複合碳水化合物（如燕麥、全麥麵包）和健康脂肪（如堅果、酪梨）。',
          priority: Priority.MEDIUM,
          actionable: true,
          relatedGoals: []
        });
        break;

      case MealType.LUNCH:
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.MEAL_PLANNING,
          title: `均衡的${mealName}`,
          description: '以蛋白質為主（魚類、雞肉、豆類），搭配大量蔬菜和適量全穀類，提供持續的能量。',
          priority: Priority.MEDIUM,
          actionable: true,
          relatedGoals: []
        });
        break;

      case MealType.DINNER:
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.MEAL_PLANNING,
          title: `清淡的${mealName}`,
          description: '選擇易消化的蛋白質，增加蔬菜比例，減少精製碳水化合物，避免過於油膩。',
          priority: Priority.MEDIUM,
          actionable: true,
          relatedGoals: []
        });
        break;

      case MealType.SNACK:
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.MEAL_PLANNING,
          title: `健康${mealName}選擇`,
          description: '選擇營養密度高的食物，如水果配堅果、蔬菜條配鷹嘴豆泥，避免高糖高脂的加工食品。',
          priority: Priority.LOW,
          actionable: true,
          relatedGoals: []
        });
        break;
    }

    return recommendations;
  }

  /**
   * 基於季節生成建議
   */
  generateSeasonalRecommendations(season: 'spring' | 'summer' | 'autumn' | 'winter'): Recommendation[] {
    const recommendations: Recommendation[] = [];

    switch (season) {
      case 'spring':
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.NUTRITION_ADJUSTMENT,
          title: '春季排毒飲食',
          description: '增加綠色蔬菜攝取，如菠菜、蘆筍，選擇清淡的烹調方式，幫助身體排毒。',
          priority: Priority.LOW,
          actionable: true,
          relatedGoals: []
        });
        break;

      case 'summer':
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.NUTRITION_ADJUSTMENT,
          title: '夏季水分補充',
          description: '增加水分攝取，多吃含水量高的水果如西瓜、黃瓜，避免過度冰冷的飲品。',
          priority: Priority.MEDIUM,
          actionable: true,
          relatedGoals: []
        });
        break;

      case 'autumn':
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.NUTRITION_ADJUSTMENT,
          title: '秋季養肺潤燥',
          description: '增加白色食物攝取，如白蘿蔔、梨子、銀耳，幫助潤肺養陰。',
          priority: Priority.LOW,
          actionable: true,
          relatedGoals: []
        });
        break;

      case 'winter':
        recommendations.push({
          id: uuidv4(),
          type: RecommendationType.NUTRITION_ADJUSTMENT,
          title: '冬季溫補飲食',
          description: '適量增加溫熱性食物，如薑、肉桂，選擇燉煮的烹調方式，維持身體溫暖。',
          priority: Priority.LOW,
          actionable: true,
          relatedGoals: []
        });
        break;
    }

    return recommendations;
  }
}