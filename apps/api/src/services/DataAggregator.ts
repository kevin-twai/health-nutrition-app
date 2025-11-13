import { 
  AggregatedNutritionData, 
  DataAggregationOptions, 
  DailyNutritionData, 
  WeeklyNutritionData,
  MealDistribution,
  MacronutrientBreakdown,
  MicronutrientSummary,
  MealType,
  DateRange,
  GroupByPeriod
} from '../types/shared';
import { LogRepository } from '../repositories/LogRepository';
import { UserRepository } from '../repositories/UserRepository';

/**
 * 資料彙整服務
 * 負責彙整用戶的健康資料，包括營養攝取、飲食模式等
 */
export class DataAggregator {
  constructor(
    private logRepository: LogRepository,
    private userRepository: UserRepository
  ) {}

  /**
   * 彙整用戶營養資料
   */
  async aggregateNutritionData(options: DataAggregationOptions): Promise<AggregatedNutritionData> {
    const { userId, period, groupBy, includeComparisons, includeTrends } = options;

    // 獲取指定期間的食物記錄
    const foodLogs = await this.logRepository.findByDateRange({
      userId,
      startDate: period.start,
      endDate: period.end,
      limit: 10000
    });

    // 獲取營養統計
    const nutritionStats = await this.logRepository.getNutritionStats(
      userId,
      period.start,
      period.end
    );

    // 計算每日營養資料
    const dailyBreakdown = await this.calculateDailyBreakdown(foodLogs, period);

    // 計算週平均資料
    const weeklyAverages = await this.calculateWeeklyAverages(dailyBreakdown);

    // 計算餐點分布
    const mealDistribution = this.calculateMealDistribution(nutritionStats);

    // 計算微量營養素摘要
    const micronutrients = await this.calculateMicronutrientSummary(foodLogs);

    const totalDays = Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));
    const avgDailyCalories = totalDays > 0 ? nutritionStats.totalCalories / totalDays : 0;

    return {
      period,
      totalCalories: nutritionStats.totalCalories,
      avgDailyCalories: Math.round(avgDailyCalories * 10) / 10,
      macronutrients: {
        protein: nutritionStats.totalProtein,
        carbohydrates: nutritionStats.totalCarbohydrates,
        fat: nutritionStats.totalFat,
        fiber: nutritionStats.totalFiber
      },
      micronutrients,
      mealDistribution,
      dailyBreakdown,
      weeklyAverages
    };
  }

  /**
   * 計算每日營養分解
   */
  private async calculateDailyBreakdown(
    foodLogs: any[], 
    period: DateRange
  ): Promise<DailyNutritionData[]> {
    const dailyData = new Map<string, DailyNutritionData>();

    // 初始化每日資料
    const currentDate = new Date(period.start);
    while (currentDate <= period.end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyData.set(dateKey, {
        date: new Date(currentDate),
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        mealCounts: {
          [MealType.BREAKFAST]: 0,
          [MealType.LUNCH]: 0,
          [MealType.DINNER]: 0,
          [MealType.SNACK]: 0
        }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 彙整每日資料
    for (const log of foodLogs) {
      const dateKey = log.timestamp.toISOString().split('T')[0];
      const dayData = dailyData.get(dateKey);
      
      if (dayData) {
        // 獲取該記錄的營養資訊
        const nutrition = await this.calculateLogNutrition(log);
        
        dayData.calories += nutrition.calories;
        dayData.protein += nutrition.protein;
        dayData.carbohydrates += nutrition.carbohydrates;
        dayData.fat += nutrition.fat;
        dayData.fiber += nutrition.fiber;
        dayData.mealCounts[log.mealType as MealType]++;
      }
    }

    return Array.from(dailyData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * 計算週平均資料
   */
  private async calculateWeeklyAverages(dailyData: DailyNutritionData[]): Promise<WeeklyNutritionData[]> {
    const weeklyData: WeeklyNutritionData[] = [];
    
    if (dailyData.length === 0) return weeklyData;

    // 按週分組
    const weeks = new Map<string, DailyNutritionData[]>();
    
    for (const day of dailyData) {
      const weekStart = this.getWeekStart(day.date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, []);
      }
      weeks.get(weekKey)!.push(day);
    }

    // 計算每週平均
    for (const [weekKey, weekDays] of weeks) {
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const totalCalories = weekDays.reduce((sum, day) => sum + day.calories, 0);
      const totalProtein = weekDays.reduce((sum, day) => sum + day.protein, 0);
      const totalCarbs = weekDays.reduce((sum, day) => sum + day.carbohydrates, 0);
      const totalFat = weekDays.reduce((sum, day) => sum + day.fat, 0);
      const totalFiber = weekDays.reduce((sum, day) => sum + day.fiber, 0);

      const daysCount = weekDays.length;
      
      // 計算一致性（標準差的倒數）
      const avgCalories = totalCalories / daysCount;
      const variance = weekDays.reduce((sum, day) => sum + Math.pow(day.calories - avgCalories, 2), 0) / daysCount;
      const stdDev = Math.sqrt(variance);
      const consistency = avgCalories > 0 ? Math.max(0, 1 - (stdDev / avgCalories)) : 0;

      weeklyData.push({
        weekStart,
        weekEnd,
        avgCalories: Math.round(avgCalories * 10) / 10,
        avgProtein: Math.round((totalProtein / daysCount) * 10) / 10,
        avgCarbohydrates: Math.round((totalCarbs / daysCount) * 10) / 10,
        avgFat: Math.round((totalFat / daysCount) * 10) / 10,
        avgFiber: Math.round((totalFiber / daysCount) * 10) / 10,
        consistency: Math.round(consistency * 100) / 100
      });
    }

    return weeklyData.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }

  /**
   * 計算餐點分布
   */
  private calculateMealDistribution(nutritionStats: any): MealDistribution {
    const total = nutritionStats.totalCalories;
    
    if (total === 0) {
      return {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0
      };
    }

    return {
      breakfast: Math.round((nutritionStats.mealBreakdown[MealType.BREAKFAST]?.calories || 0) / total * 100) / 100,
      lunch: Math.round((nutritionStats.mealBreakdown[MealType.LUNCH]?.calories || 0) / total * 100) / 100,
      dinner: Math.round((nutritionStats.mealBreakdown[MealType.DINNER]?.calories || 0) / total * 100) / 100,
      snack: Math.round((nutritionStats.mealBreakdown[MealType.SNACK]?.calories || 0) / total * 100) / 100
    };
  }

  /**
   * 計算微量營養素摘要
   */
  private async calculateMicronutrientSummary(foodLogs: any[]): Promise<MicronutrientSummary> {
    // 這裡需要從詳細的營養資料庫獲取微量營養素資訊
    // 暫時返回空的摘要，實際實作需要查詢 MongoDB 中的詳細營養資料
    return {
      vitamins: {
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0,
        vitaminE: 0,
        vitaminK: 0,
        thiamine: 0,
        riboflavin: 0,
        niacin: 0,
        vitaminB6: 0,
        folate: 0,
        vitaminB12: 0
      },
      minerals: {
        calcium: 0,
        iron: 0,
        magnesium: 0,
        phosphorus: 0,
        potassium: 0,
        sodium: 0,
        zinc: 0,
        copper: 0,
        manganese: 0,
        selenium: 0
      }
    };
  }

  /**
   * 計算單筆記錄的營養資訊
   */
  private async calculateLogNutrition(log: any): Promise<{
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  }> {
    // 從 LogRepository 的邏輯中提取營養計算
    // 這裡簡化處理，實際應該查詢食物資料庫
    return {
      calories: log.calories || 0,
      protein: log.protein || 0,
      carbohydrates: log.carbohydrates || 0,
      fat: log.fat || 0,
      fiber: log.fiber || 0
    };
  }

  /**
   * 獲取週的開始日期（週一）
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 調整為週一開始
    return new Date(d.setDate(diff));
  }

  /**
   * 比較兩個期間的營養資料
   */
  async compareNutritionPeriods(
    userId: string,
    currentPeriod: DateRange,
    comparisonPeriod: DateRange
  ): Promise<{
    current: AggregatedNutritionData;
    comparison: AggregatedNutritionData;
    changes: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
    };
  }> {
    const [current, comparison] = await Promise.all([
      this.aggregateNutritionData({
        userId,
        period: currentPeriod,
        groupBy: GroupByPeriod.DAY,
        includeComparisons: false,
        includeTrends: false
      }),
      this.aggregateNutritionData({
        userId,
        period: comparisonPeriod,
        groupBy: GroupByPeriod.DAY,
        includeComparisons: false,
        includeTrends: false
      })
    ]);

    const changes = {
      calories: current.avgDailyCalories - comparison.avgDailyCalories,
      protein: (current.macronutrients.protein / this.getDaysDiff(currentPeriod)) - 
               (comparison.macronutrients.protein / this.getDaysDiff(comparisonPeriod)),
      carbohydrates: (current.macronutrients.carbohydrates / this.getDaysDiff(currentPeriod)) - 
                     (comparison.macronutrients.carbohydrates / this.getDaysDiff(comparisonPeriod)),
      fat: (current.macronutrients.fat / this.getDaysDiff(currentPeriod)) - 
           (comparison.macronutrients.fat / this.getDaysDiff(comparisonPeriod)),
      fiber: (current.macronutrients.fiber / this.getDaysDiff(currentPeriod)) - 
             (comparison.macronutrients.fiber / this.getDaysDiff(comparisonPeriod))
    };

    return { current, comparison, changes };
  }

  /**
   * 計算日期範圍的天數差
   */
  private getDaysDiff(period: DateRange): number {
    return Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * 獲取用戶的營養目標達成率
   */
  async getNutritionGoalProgress(userId: string, period: DateRange): Promise<{
    calories: { target: number; actual: number; progress: number };
    protein: { target: number; actual: number; progress: number };
    carbohydrates: { target: number; actual: number; progress: number };
    fat: { target: number; actual: number; progress: number };
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('用戶不存在');
    }

    const aggregatedData = await this.aggregateNutritionData({
      userId,
      period,
      groupBy: GroupByPeriod.DAY,
      includeComparisons: false,
      includeTrends: false
    });

    // 根據用戶資料計算營養目標
    const targets = this.calculateNutritionTargets(user);
    const days = this.getDaysDiff(period);

    return {
      calories: {
        target: targets.calories * days,
        actual: aggregatedData.totalCalories,
        progress: aggregatedData.totalCalories / (targets.calories * days)
      },
      protein: {
        target: targets.protein * days,
        actual: aggregatedData.macronutrients.protein,
        progress: aggregatedData.macronutrients.protein / (targets.protein * days)
      },
      carbohydrates: {
        target: targets.carbohydrates * days,
        actual: aggregatedData.macronutrients.carbohydrates,
        progress: aggregatedData.macronutrients.carbohydrates / (targets.carbohydrates * days)
      },
      fat: {
        target: targets.fat * days,
        actual: aggregatedData.macronutrients.fat,
        progress: aggregatedData.macronutrients.fat / (targets.fat * days)
      }
    };
  }

  /**
   * 根據用戶資料計算營養目標
   */
  private calculateNutritionTargets(user: any): {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  } {
    // 使用 UserModel 的 TDEE 計算方法
    const tdee = 2000; // 簡化處理，實際應該使用 UserModel.calculateTDEE
    
    return {
      calories: tdee,
      protein: user.profile?.weight * 1.2 || 60, // 每公斤體重1.2g蛋白質
      carbohydrates: tdee * 0.5 / 4, // 50%熱量來自碳水化合物
      fat: tdee * 0.3 / 9 // 30%熱量來自脂肪
    };
  }
}