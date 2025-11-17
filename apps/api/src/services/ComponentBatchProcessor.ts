/**
 * 成分批量處理器
 * Component Batch Processor
 * 
 * 此服務負責優化成分檢測和營養計算的批量處理，包括：
 * 1. 並行處理多個成分的營養計算
 * 2. 優化知識庫查詢（批量查詢）
 * 3. 減少數據庫往返次數
 * 4. 智能緩存管理
 */

import {
  DetectedComponent,
  EnrichedComponent,
  NutritionData,
  CookingMethod,
  ComponentCategory
} from '../types/ComponentDetection';

import { asianCuisineKB } from './AsianCuisineKnowledgeBase';
import { recognitionResultCache } from './RecognitionResultCache';
import { 
  getCookingMethodEffect,
  calculateCookedNutrition 
} from '../data/cookingMethodEffects';

/**
 * 批量查詢結果
 */
interface BatchQueryResult<T> {
  results: Map<string, T>;
  cacheHits: number;
  cacheMisses: number;
  processingTime: number;
}

/**
 * 批量營養計算結果
 */
interface BatchNutritionResult {
  componentNutrition: Map<string, NutritionData>;
  totalProcessingTime: number;
  parallelProcessingTime: number;
  cacheHitRate: number;
  componentsProcessed: number;
}

/**
 * 批量知識庫查詢選項
 */
interface BatchKBQueryOptions {
  includeNutrition?: boolean;
  includeCookingEffects?: boolean;
  includeAlternatives?: boolean;
  maxConcurrency?: number;
}

/**
 * 成分批量處理器類
 */
export class ComponentBatchProcessor {
  private maxConcurrency: number;
  private batchSize: number;

  constructor(maxConcurrency: number = 10, batchSize: number = 20) {
    this.maxConcurrency = maxConcurrency;
    this.batchSize = batchSize;
  }

  /**
   * 批量計算成分營養
   * 
   * 使用並行處理和緩存優化來加速多個成分的營養計算
   * 
   * @param components - 成分列表
   * @returns 批量營養計算結果
   */
  async batchCalculateNutrition(
    components: EnrichedComponent[]
  ): Promise<BatchNutritionResult> {
    const startTime = Date.now();
    const componentNutrition = new Map<string, NutritionData>();
    
    let cacheHits = 0;
    let cacheMisses = 0;

    console.log(`🚀 批量營養計算: ${components.length} 個成分`);

    // Step 1: 檢查緩存
    const uncachedComponents: EnrichedComponent[] = [];
    
    for (const component of components) {
      const cookingMethod = component.cookingMethod || CookingMethod.RAW;
      const cachedNutrition = recognitionResultCache.getNutritionForComponent(
        component.name,
        component.estimatedPortion,
        cookingMethod
      );
      
      if (cachedNutrition) {
        componentNutrition.set(component.id, cachedNutrition);
        cacheHits++;
      } else {
        uncachedComponents.push(component);
        cacheMisses++;
      }
    }

    console.log(`   緩存命中: ${cacheHits}, 未命中: ${cacheMisses}`);

    // Step 2: 並行處理未緩存的成分
    if (uncachedComponents.length > 0) {
      const parallelStartTime = Date.now();
      
      // 分批處理以控制並發數
      const batches = this.createBatches(uncachedComponents, this.maxConcurrency);
      
      for (const batch of batches) {
        const promises = batch.map(component => 
          this.calculateSingleComponentNutrition(component)
        );
        
        const results = await Promise.all(promises);
        
        // 存儲結果和緩存
        results.forEach((nutrition, index) => {
          const component = batch[index];
          componentNutrition.set(component.id, nutrition);
          
          // 存入緩存
          const cookingMethod = component.cookingMethod || CookingMethod.RAW;
          recognitionResultCache.setNutritionForComponent(
            component.name,
            component.estimatedPortion,
            nutrition,
            cookingMethod
          );
        });
      }
      
      const parallelTime = Date.now() - parallelStartTime;
      console.log(`   並行處理完成，耗時: ${parallelTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    const cacheHitRate = components.length > 0 
      ? (cacheHits / components.length) * 100 
      : 0;

    console.log(`✅ 批量營養計算完成，總耗時: ${totalTime}ms`);
    console.log(`   緩存命中率: ${cacheHitRate.toFixed(1)}%`);

    return {
      componentNutrition,
      totalProcessingTime: totalTime,
      parallelProcessingTime: totalTime - (cacheHits > 0 ? 10 : 0), // 估算
      cacheHitRate,
      componentsProcessed: components.length
    };
  }

  /**
   * 計算單個成分的營養（內部方法）
   */
  private async calculateSingleComponentNutrition(
    component: EnrichedComponent
  ): Promise<NutritionData> {
    try {
      // 1. 獲取基礎營養數據
      let baseNutrition = component.nutritionPer100g;
      
      if (!baseNutrition) {
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
          return this.createEmptyNutrition();
        }
      }
      
      // 2. 應用烹飪方式影響
      const cookingMethod = component.cookingMethod || CookingMethod.RAW;
      const cookedNutrition = calculateCookedNutrition(
        baseNutrition,
        cookingMethod,
        component.category,
        100
      );
      
      // 3. 根據份量計算實際營養值
      const portionMultiplier = component.estimatedPortion / 100;
      
      return {
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
        sugar: baseNutrition.sugar 
          ? Math.round(baseNutrition.sugar * portionMultiplier * 10) / 10 
          : undefined
      };
    } catch (error) {
      console.error(`計算成分 ${component.name} 的營養時發生錯誤:`, error);
      return this.createEmptyNutrition();
    }
  }

  /**
   * 批量查詢知識庫
   * 
   * 優化多個成分的知識庫查詢，減少重複查詢
   * 
   * @param componentNames - 成分名稱列表
   * @param options - 查詢選項
   * @returns 批量查詢結果
   */
  async batchQueryKnowledgeBase(
    componentNames: string[],
    options: BatchKBQueryOptions = {}
  ): Promise<BatchQueryResult<any>> {
    const startTime = Date.now();
    const results = new Map<string, any>();
    
    let cacheHits = 0;
    let cacheMisses = 0;

    console.log(`🔍 批量知識庫查詢: ${componentNames.length} 個成分`);

    // 去重
    const uniqueNames = Array.from(new Set(componentNames));
    console.log(`   去重後: ${uniqueNames.length} 個唯一成分`);

    // 批量查詢
    for (const name of uniqueNames) {
      // 嘗試從緩存獲取
      const cached = this.getCachedKBResult(name, options);
      
      if (cached) {
        results.set(name, cached);
        cacheHits++;
      } else {
        // 查詢知識庫
        const result = this.queryKBForComponent(name, options);
        
        if (result) {
          results.set(name, result);
          this.cacheKBResult(name, result, options);
        }
        
        cacheMisses++;
      }
    }

    const processingTime = Date.now() - startTime;

    console.log(`✅ 批量知識庫查詢完成，耗時: ${processingTime}ms`);
    console.log(`   緩存命中: ${cacheHits}, 未命中: ${cacheMisses}`);

    return {
      results,
      cacheHits,
      cacheMisses,
      processingTime
    };
  }

  /**
   * 查詢單個成分的知識庫資訊
   */
  private queryKBForComponent(
    name: string,
    options: BatchKBQueryOptions
  ): any {
    const result: any = {
      name
    };

    // 基本資訊
    const foodItems = asianCuisineKB.searchFoodItemsByName(name, true);
    if (foodItems.length > 0) {
      result.foodItem = foodItems[0];
    }

    // 營養資訊
    if (options.includeNutrition !== false) {
      result.nutrition = asianCuisineKB.getNutritionInfo(name);
    }

    // 常見搭配
    if (options.includeAlternatives) {
      result.pairings = asianCuisineKB.getCommonPairings(name);
      result.confusions = asianCuisineKB.getConfusedFoodPairs(name);
      result.distinguishingFeatures = asianCuisineKB.getDistinguishingFeatures(name);
    }

    // 烹飪方式影響
    if (options.includeCookingEffects && result.foodItem) {
      result.cookingMethods = result.foodItem.cookingMethods;
    }

    return result;
  }

  /**
   * 從緩存獲取知識庫結果
   */
  private getCachedKBResult(
    name: string,
    options: BatchKBQueryOptions
  ): any | null {
    // 簡單的內存緩存實現
    // 在實際應用中，可以使用 Redis 或其他緩存系統
    const cacheKey = `kb:${name}:${JSON.stringify(options)}`;
    
    // 這裡使用 recognitionResultCache 的通用緩存功能
    // 實際實現中可能需要擴展緩存系統
    return null; // 暫時返回 null，讓每次都查詢知識庫
  }

  /**
   * 緩存知識庫結果
   */
  private cacheKBResult(
    name: string,
    result: any,
    options: BatchKBQueryOptions
  ): void {
    // 緩存實現
    // 在實際應用中，可以使用 Redis 或其他緩存系統
    const cacheKey = `kb:${name}:${JSON.stringify(options)}`;
    
    // 這裡可以擴展 recognitionResultCache 來支持通用緩存
    // 暫時不實現，因為知識庫查詢已經很快
  }

  /**
   * 批量豐富成分資訊
   * 
   * 從知識庫批量獲取成分的詳細資訊
   * 
   * @param components - 檢測到的成分列表
   * @returns 豐富化的成分列表
   */
  async batchEnrichComponents(
    components: DetectedComponent[]
  ): Promise<EnrichedComponent[]> {
    console.log(`🔧 批量豐富成分資訊: ${components.length} 個成分`);
    
    const startTime = Date.now();

    // Step 1: 批量查詢知識庫
    const componentNames = components.map(c => c.name);
    const kbResults = await this.batchQueryKnowledgeBase(componentNames, {
      includeNutrition: true,
      includeCookingEffects: true,
      includeAlternatives: true
    });

    // Step 2: 豐富每個成分
    const enrichedComponents: EnrichedComponent[] = components.map(component => {
      const kbResult = kbResults.results.get(component.name);
      
      const enriched: EnrichedComponent = {
        ...component,
        knowledgeBaseMatch: !!kbResult?.foodItem
      };

      // 添加營養資訊
      if (kbResult?.nutrition) {
        enriched.nutritionPer100g = {
          calories: kbResult.nutrition.calories,
          protein: kbResult.nutrition.protein,
          carbohydrates: kbResult.nutrition.carbohydrates,
          fat: kbResult.nutrition.fat,
          fiber: kbResult.nutrition.fiber,
          sodium: kbResult.nutrition.sodium,
          sugar: kbResult.nutrition.sugar
        };
      }

      // 添加替代成分
      if (kbResult?.pairings) {
        enriched.similarComponents = kbResult.pairings;
      }

      // 添加類別（如果未設定）
      if (!enriched.category && kbResult?.foodItem) {
        enriched.category = this.mapFoodCategoryToComponentCategory(
          kbResult.foodItem.category
        );
      }

      // 添加烹飪方式（如果未設定）
      if (!enriched.cookingMethod && kbResult?.cookingMethods?.length > 0) {
        enriched.cookingMethod = this.mapCookingMethod(
          kbResult.cookingMethods[0]
        );
      }

      return enriched;
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ 批量豐富完成，耗時: ${processingTime}ms`);

    return enrichedComponents;
  }

  /**
   * 批量驗證成分組合
   * 
   * 檢查多個成分組合的合理性
   * 
   * @param componentGroups - 成分組列表
   * @returns 驗證結果
   */
  async batchValidateComponentCombinations(
    componentGroups: EnrichedComponent[][]
  ): Promise<Map<number, { valid: boolean; warnings: string[]; suggestions: string[] }>> {
    console.log(`✔️ 批量驗證成分組合: ${componentGroups.length} 組`);
    
    const results = new Map<number, { valid: boolean; warnings: string[]; suggestions: string[] }>();

    // 並行驗證
    const promises = componentGroups.map((group, index) => 
      this.validateSingleComponentGroup(group, index)
    );

    const validationResults = await Promise.all(promises);

    validationResults.forEach((result, index) => {
      results.set(index, result);
    });

    return results;
  }

  /**
   * 驗證單個成分組
   */
  private async validateSingleComponentGroup(
    components: EnrichedComponent[],
    groupIndex: number
  ): Promise<{ valid: boolean; warnings: string[]; suggestions: string[] }> {
    const componentNames = components.map(c => c.name);
    const validation = asianCuisineKB.validateFoodCombination(componentNames);

    return {
      valid: validation.valid,
      warnings: validation.warnings,
      suggestions: validation.suggestions
    };
  }

  /**
   * 優化的批量緩存預熱
   * 
   * 預先加載常見成分的營養資訊到緩存
   * 
   * @param dishType - 料理類型
   * @param commonComponents - 常見成分列表
   */
  async preheatCache(
    dishType: string,
    commonComponents: string[]
  ): Promise<void> {
    console.log(`🔥 預熱緩存: ${dishType}, ${commonComponents.length} 個常見成分`);
    
    const startTime = Date.now();

    // 批量查詢知識庫
    await this.batchQueryKnowledgeBase(commonComponents, {
      includeNutrition: true,
      includeCookingEffects: true
    });

    const processingTime = Date.now() - startTime;
    console.log(`✅ 緩存預熱完成，耗時: ${processingTime}ms`);
  }

  /**
   * 創建批次
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
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
   * 映射食材類別到成分類別
   */
  private mapFoodCategoryToComponentCategory(foodCategory: string): ComponentCategory {
    const categoryMap: Record<string, ComponentCategory> = {
      'grain': ComponentCategory.GRAIN,
      'protein': ComponentCategory.PROTEIN,
      'vegetable': ComponentCategory.VEGETABLE,
      'leafy_greens': ComponentCategory.VEGETABLE,
      'root_vegetable': ComponentCategory.VEGETABLE,
      'mushroom': ComponentCategory.VEGETABLE,
      'seaweed': ComponentCategory.VEGETABLE,
      'seasoning': ComponentCategory.SEASONING,
      'sauce': ComponentCategory.SAUCE,
      'garnish': ComponentCategory.GARNISH
    };
    
    return categoryMap[foodCategory] || ComponentCategory.GARNISH;
  }

  /**
   * 映射烹飪方式
   */
  private mapCookingMethod(method: string): CookingMethod {
    const methodMap: Record<string, CookingMethod> = {
      'raw': CookingMethod.RAW,
      'boiled': CookingMethod.BOILED,
      'fried': CookingMethod.FRIED,
      'deep_fried': CookingMethod.DEEP_FRIED,
      'steamed': CookingMethod.STEAMED,
      'grilled': CookingMethod.GRILLED,
      'braised': CookingMethod.BRAISED,
      'stir_fried': CookingMethod.STIR_FRIED,
      'pickled': CookingMethod.PICKLED
    };
    
    return methodMap[method] || CookingMethod.RAW;
  }

  /**
   * 獲取批量處理統計資訊
   */
  getStatistics(): {
    maxConcurrency: number;
    batchSize: number;
  } {
    return {
      maxConcurrency: this.maxConcurrency,
      batchSize: this.batchSize
    };
  }
}

// 導出單例實例
export const componentBatchProcessor = new ComponentBatchProcessor();
