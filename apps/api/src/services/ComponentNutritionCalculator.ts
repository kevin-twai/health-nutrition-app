/**
 * 成分營養計算器
 * Component Nutrition Calculator
 * 
 * 此服務負責計算料理成分的營養價值，包括：
 * 1. 從知識庫獲取基礎營養數據
 * 2. 根據烹飪方式調整營養值
 * 3. 聚合整道料理的營養資訊
 * 4. 計算各成分的營養佔比
 */

import {
  DetectedComponent,
  EnrichedComponent,
  NutritionData,
  ComponentNutrition,
  CategoryNutrition,
  NutritionSummary,
  CookingImpact,
  CookingMethod,
  ComponentCategory
} from '../types/ComponentDetection';

import {
  getCookingMethodEffect,
  calculateCookedNutrition,
  getCookingMethodHealthScore,
  getCookingMethodRecommendation
} from '../data/cookingMethodEffects';

import { asianCuisineKB } from './AsianCuisineKnowledgeBase';
import { getFoodItemByName } from '../data/asianFoodItems';
import { recognitionResultCache } from './RecognitionResultCache';
import { componentBatchProcessor } from './ComponentBatchProcessor';

/**
 * 成分營養計算器類
 */
export class ComponentNutritionCalculator {
  /**
   * 計算單個成分的營養價值
   * 
   * @param component - 檢測到的成分
   * @param cookingMethod - 烹飪方式
   * @returns 成分的營養數據
   */
  async calculateComponentNutrition(
    component: DetectedComponent,
    cookingMethod?: CookingMethod
  ): Promise<NutritionData> {
    try {
      // 確定烹飪方式
      const finalCookingMethod = cookingMethod || component.cookingMethod || CookingMethod.RAW;
      
      // 嘗試從緩存獲取營養數據
      const cachedNutrition = recognitionResultCache.getNutritionForComponent(
        component.name,
        component.estimatedPortion,
        finalCookingMethod
      );
      
      if (cachedNutrition) {
        return cachedNutrition;
      }
      
      // 緩存未命中，進行計算
      // 1. 從知識庫獲取基礎營養數據
      let baseNutrition = component.nutritionPer100g;
      
      if (!baseNutrition) {
        // 嘗試從知識庫查詢
        const nutritionInfo = asianCuisineKB.getNutritionInfo(component.name);
        
        if (nutritionInfo) {
          baseNutrition = {
            calories: nutritionInfo.calories,
            protein: nutritionInfo.protein,
            carbohydrates: nutritionInfo.carbohydrates,
            fat: nutritionInfo.fat,
            fiber: nutritionInfo.fiber,
            sodium: nutritionInfo.sodium,
            sugar: nutritionInfo.sugar
          };
        } else {
          // 如果知識庫中沒有，返回空營養數據
          return this.createEmptyNutrition();
        }
      }
      
      // 2. 根據烹飪方式調整營養值
      const cookedNutrition = this.applyCookingEffects(
        baseNutrition,
        finalCookingMethod,
        component.category
      );
      
      // 3. 根據份量計算實際營養值
      const portionMultiplier = component.estimatedPortion / 100;
      
      const result: NutritionData = {
        calories: Math.round(cookedNutrition.calories * portionMultiplier),
        protein: Math.round(cookedNutrition.protein * portionMultiplier * 10) / 10,
        carbohydrates: Math.round(cookedNutrition.carbohydrates * portionMultiplier * 10) / 10,
        fat: Math.round(cookedNutrition.fat * portionMultiplier * 10) / 10,
        fiber: cookedNutrition.fiber 
          ? Math.round(cookedNutrition.fiber * portionMultiplier * 10) / 10 
          : undefined,
        sodium: cookedNutrition.sodium 
          ? Math.round(cookedNutrition.sodium * portionMultiplier) 
          : undefined,
        sugar: cookedNutrition.sugar 
          ? Math.round(cookedNutrition.sugar * portionMultiplier * 10) / 10 
          : undefined
      };
      
      // 將結果存入緩存
      recognitionResultCache.setNutritionForComponent(
        component.name,
        component.estimatedPortion,
        result,
        finalCookingMethod
      );
      
      return result;
    } catch (error) {
      console.error(`計算成分 ${component.name} 的營養時發生錯誤:`, error);
      return this.createEmptyNutrition();
    }
  }

  /**
   * 應用烹飪方式對營養的影響
   * 
   * @param baseNutrition - 基礎營養數據（每100g）
   * @param cookingMethod - 烹飪方式
   * @param componentType - 成分類別
   * @returns 烹飪後的營養數據（每100g）
   */
  applyCookingEffects(
    baseNutrition: NutritionData,
    cookingMethod: CookingMethod,
    componentType?: ComponentCategory
  ): NutritionData {
    // 使用 cookingMethodEffects 中的計算函數
    return calculateCookedNutrition(
      baseNutrition,
      cookingMethod,
      componentType,
      100 // 保持每100g的基準
    );
  }

  /**
   * 聚合整道料理的營養資訊
   * 
   * @param components - 豐富化的成分列表
   * @returns 營養摘要
   */
  async aggregateDishNutrition(
    components: EnrichedComponent[]
  ): Promise<NutritionSummary> {
    // 使用批量處理優化
    console.log('🚀 使用批量處理優化營養計算...');
    
    // 1. 批量計算所有成分的營養
    const batchResult = await componentBatchProcessor.batchCalculateNutrition(components);
    
    console.log(`   批量處理統計:`);
    console.log(`   - 處理成分數: ${batchResult.componentsProcessed}`);
    console.log(`   - 總耗時: ${batchResult.totalProcessingTime}ms`);
    console.log(`   - 緩存命中率: ${batchResult.cacheHitRate.toFixed(1)}%`);
    
    // 2. 構建 ComponentNutrition 列表
    const componentNutritions: ComponentNutrition[] = [];
    
    for (const component of components) {
      const portionNutrition = batchResult.componentNutrition.get(component.id);
      
      if (portionNutrition) {
        // 獲取基礎營養數據（每100g）
        let nutritionPer100g = component.nutritionPer100g;
        
        if (!nutritionPer100g) {
          const nutritionInfo = asianCuisineKB.getNutritionInfo(component.name);
          if (nutritionInfo) {
            nutritionPer100g = {
              calories: nutritionInfo.calories,
              protein: nutritionInfo.protein,
              carbohydrates: nutritionInfo.carbohydrates,
              fat: nutritionInfo.fat,
              fiber: nutritionInfo.fiber,
              sodium: nutritionInfo.sodium,
              sugar: nutritionInfo.sugar
            };
          } else {
            nutritionPer100g = this.createEmptyNutrition();
          }
        }
        
        // 原始營養（未烹飪）
        const rawNutrition = { ...nutritionPer100g };
        
        // 烹飪後營養（每100g）
        const cookingMethod = component.cookingMethod || CookingMethod.RAW;
        const cookedNutritionPer100g = this.applyCookingEffects(
          nutritionPer100g,
          cookingMethod,
          component.category
        );
        
        componentNutritions.push({
          component,
          rawNutrition,
          cookedNutrition: cookedNutritionPer100g,
          portionNutrition,
          percentageOfTotal: {
            calories: 0, // 稍後計算
            protein: 0,
            carbs: 0,
            fat: 0
          }
        });
      }
    }
    
    // 3. 計算總營養值
    const totalNutrition = this.sumNutrition(
      componentNutritions.map(cn => cn.portionNutrition)
    );
    
    // 4. 計算各成分佔比
    this.calculatePercentages(componentNutritions, totalNutrition);
    
    // 5. 按類別分組統計
    const byCategory = this.groupByCategory(componentNutritions);
    
    // 6. 計算烹飪方式的影響
    const cookingImpact = this.calculateCookingImpact(components);
    
    return {
      total: totalNutrition,
      byComponent: componentNutritions,
      byCategory,
      cookingImpact
    };
  }

  /**
   * 計算成分的詳細營養資訊
   */
  private async calculateComponentNutritionDetails(
    component: EnrichedComponent
  ): Promise<ComponentNutrition> {
    // 獲取基礎營養數據（每100g）
    let nutritionPer100g = component.nutritionPer100g;
    
    if (!nutritionPer100g) {
      const nutritionInfo = asianCuisineKB.getNutritionInfo(component.name);
      if (nutritionInfo) {
        nutritionPer100g = {
          calories: nutritionInfo.calories,
          protein: nutritionInfo.protein,
          carbohydrates: nutritionInfo.carbohydrates,
          fat: nutritionInfo.fat,
          fiber: nutritionInfo.fiber,
          sodium: nutritionInfo.sodium,
          sugar: nutritionInfo.sugar
        };
      } else {
        nutritionPer100g = this.createEmptyNutrition();
      }
    }
    
    // 原始營養（未烹飪）
    const rawNutrition = { ...nutritionPer100g };
    
    // 烹飪後營養（每100g）
    const cookingMethod = component.cookingMethod || CookingMethod.RAW;
    const cookedNutritionPer100g = this.applyCookingEffects(
      nutritionPer100g,
      cookingMethod,
      component.category
    );
    
    // 根據份量計算實際營養
    const portionMultiplier = component.estimatedPortion / 100;
    const portionNutrition: NutritionData = {
      calories: Math.round(cookedNutritionPer100g.calories * portionMultiplier),
      protein: Math.round(cookedNutritionPer100g.protein * portionMultiplier * 10) / 10,
      carbohydrates: Math.round(cookedNutritionPer100g.carbohydrates * portionMultiplier * 10) / 10,
      fat: Math.round(cookedNutritionPer100g.fat * portionMultiplier * 10) / 10,
      fiber: cookedNutritionPer100g.fiber 
        ? Math.round(cookedNutritionPer100g.fiber * portionMultiplier * 10) / 10 
        : undefined,
      sodium: cookedNutritionPer100g.sodium 
        ? Math.round(cookedNutritionPer100g.sodium * portionMultiplier) 
        : undefined,
      sugar: cookedNutritionPer100g.sugar 
        ? Math.round(cookedNutritionPer100g.sugar * portionMultiplier * 10) / 10 
        : undefined
    };
    
    return {
      component,
      rawNutrition,
      cookedNutrition: cookedNutritionPer100g,
      portionNutrition,
      percentageOfTotal: {
        calories: 0, // 稍後計算
        protein: 0,
        carbs: 0,
        fat: 0
      }
    };
  }

  /**
   * 合併多個營養數據
   */
  private sumNutrition(nutritions: NutritionData[]): NutritionData {
    return nutritions.reduce((total, nutrition) => ({
      calories: total.calories + nutrition.calories,
      protein: Math.round((total.protein + nutrition.protein) * 10) / 10,
      carbohydrates: Math.round((total.carbohydrates + nutrition.carbohydrates) * 10) / 10,
      fat: Math.round((total.fat + nutrition.fat) * 10) / 10,
      fiber: total.fiber !== undefined && nutrition.fiber !== undefined
        ? Math.round((total.fiber + nutrition.fiber) * 10) / 10
        : total.fiber || nutrition.fiber,
      sodium: total.sodium !== undefined && nutrition.sodium !== undefined
        ? Math.round(total.sodium + nutrition.sodium)
        : total.sodium || nutrition.sodium,
      sugar: total.sugar !== undefined && nutrition.sugar !== undefined
        ? Math.round((total.sugar + nutrition.sugar) * 10) / 10
        : total.sugar || nutrition.sugar
    }), this.createEmptyNutrition());
  }

  /**
   * 計算各成分的營養佔比
   */
  private calculatePercentages(
    componentNutritions: ComponentNutrition[],
    totalNutrition: NutritionData
  ): void {
    for (const cn of componentNutritions) {
      cn.percentageOfTotal = {
        calories: totalNutrition.calories > 0 
          ? Math.round((cn.portionNutrition.calories / totalNutrition.calories) * 1000) / 10
          : 0,
        protein: totalNutrition.protein > 0 
          ? Math.round((cn.portionNutrition.protein / totalNutrition.protein) * 1000) / 10
          : 0,
        carbs: totalNutrition.carbohydrates > 0 
          ? Math.round((cn.portionNutrition.carbohydrates / totalNutrition.carbohydrates) * 1000) / 10
          : 0,
        fat: totalNutrition.fat > 0 
          ? Math.round((cn.portionNutrition.fat / totalNutrition.fat) * 1000) / 10
          : 0
      };
    }
  }

  /**
   * 按類別分組統計營養
   */
  private groupByCategory(
    componentNutritions: ComponentNutrition[]
  ): CategoryNutrition[] {
    const categoryMap = new Map<ComponentCategory, ComponentNutrition[]>();
    
    // 分組
    for (const cn of componentNutritions) {
      const category = cn.component.category || ComponentCategory.GARNISH;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(cn);
    }
    
    // 計算每個類別的總營養
    const result: CategoryNutrition[] = [];
    
    for (const [category, components] of categoryMap) {
      const totalNutrition = this.sumNutrition(
        components.map(cn => cn.portionNutrition)
      );
      
      const componentNames = components.map(cn => cn.component.name);
      
      // 計算該類別佔整道料理的份量百分比
      const totalPortion = componentNutritions.reduce(
        (sum, cn) => sum + cn.component.estimatedPortion, 
        0
      );
      const categoryPortion = components.reduce(
        (sum, cn) => sum + cn.component.estimatedPortion, 
        0
      );
      const percentageOfDish = totalPortion > 0 
        ? Math.round((categoryPortion / totalPortion) * 1000) / 10
        : 0;
      
      result.push({
        category,
        totalNutrition,
        components: componentNames,
        percentageOfDish
      });
    }
    
    // 按份量百分比排序
    result.sort((a, b) => b.percentageOfDish - a.percentageOfDish);
    
    return result;
  }

  /**
   * 計算烹飪方式的影響
   */
  private calculateCookingImpact(
    components: EnrichedComponent[]
  ): CookingImpact[] {
    const impactMap = new Map<CookingMethod, {
      caloriesAdded: number;
      fatAdded: number;
      components: string[];
    }>();
    
    for (const component of components) {
      const method = component.cookingMethod || CookingMethod.RAW;
      
      if (!impactMap.has(method)) {
        impactMap.set(method, {
          caloriesAdded: 0,
          fatAdded: 0,
          components: []
        });
      }
      
      const impact = impactMap.get(method)!;
      impact.components.push(component.name);
      
      // 計算該烹飪方式增加的熱量和脂肪
      const effect = getCookingMethodEffect(method, component.category);
      const portionMultiplier = component.estimatedPortion / 100;
      
      impact.caloriesAdded += Math.round(effect.addedCalories * portionMultiplier);
      impact.fatAdded += Math.round(effect.addedFat * portionMultiplier * 10) / 10;
    }
    
    // 轉換為 CookingImpact 陣列
    const result: CookingImpact[] = [];
    
    for (const [method, impact] of impactMap) {
      const effect = getCookingMethodEffect(method);
      const recommendation = getCookingMethodRecommendation(method);
      
      result.push({
        method,
        caloriesAdded: impact.caloriesAdded,
        fatAdded: impact.fatAdded,
        notes: `${effect.displayName}（${impact.components.join('、')}）：${recommendation}`
      });
    }
    
    // 按增加的熱量排序
    result.sort((a, b) => b.caloriesAdded - a.caloriesAdded);
    
    return result;
  }

  /**
   * 創建空的營養數據
   */
  private createEmptyNutrition(): NutritionData {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0
    };
  }

  /**
   * 獲取營養建議
   */
  getNutritionAdvice(nutritionSummary: NutritionSummary): string[] {
    const advice: string[] = [];
    const total = nutritionSummary.total;
    
    // 熱量建議
    if (total.calories > 800) {
      advice.push('這道料理熱量較高，建議搭配運動或調整其他餐次');
    } else if (total.calories < 200) {
      advice.push('這道料理熱量較低，可能需要增加份量或搭配其他食物');
    }
    
    // 蛋白質建議
    if (total.protein < 10) {
      advice.push('蛋白質含量較低，建議增加蛋白質來源（如肉類、蛋、豆腐）');
    } else if (total.protein > 40) {
      advice.push('蛋白質含量豐富，有助於肌肉生長和修復');
    }
    
    // 碳水化合物建議
    if (total.carbohydrates > 80) {
      advice.push('碳水化合物含量較高，建議控制份量或增加運動');
    }
    
    // 脂肪建議
    if (total.fat > 30) {
      advice.push('脂肪含量較高，建議選擇較清淡的烹飪方式');
    }
    
    // 纖維建議
    if (total.fiber && total.fiber < 3) {
      advice.push('纖維含量較低，建議增加蔬菜或全穀類');
    }
    
    // 鈉含量建議
    if (total.sodium && total.sodium > 1000) {
      advice.push('鈉含量較高，請注意控制鹽分攝取，多喝水');
    }
    
    // 烹飪方式建議
    const highCalorieCooking = nutritionSummary.cookingImpact.filter(
      impact => impact.caloriesAdded > 100
    );
    if (highCalorieCooking.length > 0) {
      advice.push('料理中有較多油炸或快炒，建議搭配清淡料理平衡');
    }
    
    // 營養均衡建議
    const proteinRatio = (total.protein * 4) / total.calories;
    const carbRatio = (total.carbohydrates * 4) / total.calories;
    const fatRatio = (total.fat * 9) / total.calories;
    
    if (proteinRatio < 0.15) {
      advice.push('蛋白質比例偏低，建議增加優質蛋白質');
    }
    if (fatRatio > 0.35) {
      advice.push('脂肪比例偏高，建議選擇較清淡的烹飪方式');
    }
    
    return advice;
  }

  /**
   * 獲取成分的健康評分（1-10分）
   */
  getComponentHealthScore(component: EnrichedComponent): number {
    let score = 5; // 基礎分數
    
    // 根據類別調整
    if (component.category === ComponentCategory.VEGETABLE) {
      score += 2;
    } else if (component.category === ComponentCategory.PROTEIN) {
      score += 1;
    } else if (component.category === ComponentCategory.GRAIN) {
      score += 0.5;
    }
    
    // 根據烹飪方式調整
    if (component.cookingMethod) {
      const cookingScore = getCookingMethodHealthScore(component.cookingMethod);
      score = (score + cookingScore) / 2;
    }
    
    // 根據營養密度調整
    if (component.nutritionPer100g) {
      const nutrition = component.nutritionPer100g;
      
      // 高蛋白加分
      if (nutrition.protein > 15) score += 0.5;
      
      // 高纖維加分
      if (nutrition.fiber && nutrition.fiber > 3) score += 0.5;
      
      // 低鈉加分
      if (nutrition.sodium && nutrition.sodium < 200) score += 0.5;
      
      // 高脂肪減分
      if (nutrition.fat > 20) score -= 1;
      
      // 高糖減分
      if (nutrition.sugar && nutrition.sugar > 10) score -= 0.5;
    }
    
    return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  }
}

// 導出單例實例
export const componentNutritionCalculator = new ComponentNutritionCalculator();
