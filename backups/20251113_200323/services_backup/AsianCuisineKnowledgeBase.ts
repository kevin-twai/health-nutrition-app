/**
 * 亞洲料理知識庫服務
 * Asian Cuisine Knowledge Base Service
 */

import {
  FoodItem,
  FoodCategory,
  CuisineType,
  CookingMethod,
  KnowledgeBaseQueryOptions,
  MatchResult,
  SimilarityOptions,
  ImageFeatures,
  DishPattern
} from '../types/AsianCuisineKnowledgeBase';

import {
  ASIAN_FOOD_ITEMS,
  getAllFoodItems,
  getFoodItemById,
  getFoodItemByName,
  getFoodItemsByCategory,
  getFoodItemsByCuisineType
} from '../data/asianFoodItems';

import {
  DISH_PATTERNS,
  getAllDishPatterns,
  getDishPatternByName,
  getDishPatternsByCookingMethod,
  getDishPatternsByCuisineType
} from '../data/dishPatterns';

/**
 * 亞洲料理知識庫服務類
 */
export class AsianCuisineKnowledgeBase {
  private foodItems: Record<string, FoodItem>;
  private dishPatterns: Record<string, DishPattern>;

  constructor() {
    this.foodItems = ASIAN_FOOD_ITEMS;
    this.dishPatterns = DISH_PATTERNS;
  }

  /**
   * 查詢食材
   */
  public queryFoodItems(options: KnowledgeBaseQueryOptions): FoodItem[] {
    let results = getAllFoodItems();

    // 按類別篩選
    if (options.category) {
      results = results.filter(item => item.category === options.category);
    }

    // 按料理類型篩選
    if (options.cuisineType) {
      results = results.filter(item => 
        item.cuisineTypes.includes(options.cuisineType!)
      );
    }

    // 按烹飪方式篩選
    if (options.cookingMethod) {
      results = results.filter(item => 
        item.cookingMethods.includes(options.cookingMethod!)
      );
    }

    // 按搜尋關鍵字篩選
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      results = results.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(searchLower);
        const variantMatch = options.includeVariants && 
          item.nameVariants.some(v => v.toLowerCase().includes(searchLower));
        const tagMatch = item.tags?.some(t => t.toLowerCase().includes(searchLower));
        
        return nameMatch || variantMatch || tagMatch;
      });
    }

    return results;
  }

  /**
   * 根據視覺特徵匹配食材
   */
  public matchFoodItemsByVisualFeatures(
    imageFeatures: ImageFeatures,
    options?: Partial<SimilarityOptions>
  ): MatchResult[] {
    const defaultOptions: SimilarityOptions = {
      visualWeight: 0.6,
      categoryWeight: 0.2,
      cuisineWeight: 0.2,
      threshold: 0.3,
      ...options
    };

    const allItems = getAllFoodItems();
    const matches: MatchResult[] = [];

    for (const item of allItems) {
      const similarity = this.calculateVisualSimilarity(
        imageFeatures,
        item,
        defaultOptions
      );

      if (similarity >= defaultOptions.threshold) {
        matches.push({
          foodItem: item,
          confidence: similarity,
          matchedFeatures: this.getMatchedFeatures(imageFeatures, item),
          matchReason: this.generateMatchReason(imageFeatures, item, similarity)
        });
      }
    }

    // 按信心度排序
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  /**
   * 計算視覺相似度
   */
  private calculateVisualSimilarity(
    imageFeatures: ImageFeatures,
    foodItem: FoodItem,
    options: SimilarityOptions
  ): number {
    let score = 0;

    // 顏色匹配
    const colorMatch = this.calculateColorMatch(
      imageFeatures.dominantColors,
      foodItem.visualFeatures.color
    );
    score += colorMatch * options.visualWeight * 0.4;

    // 質地匹配
    const textureMatch = this.calculateTextureMatch(
      imageFeatures.textureType,
      foodItem.visualFeatures.texture
    );
    score += textureMatch * options.visualWeight * 0.3;

    // 形狀匹配
    const shapeMatch = this.calculateShapeMatch(
      imageFeatures.shapePatterns,
      foodItem.visualFeatures.shape
    );
    score += shapeMatch * options.visualWeight * 0.3;

    // 複雜度匹配
    if (imageFeatures.hasMultipleComponents && foodItem.category === FoodCategory.MIXED_DISH) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 計算顏色匹配度
   */
  private calculateColorMatch(imageColors: string[], itemColors: string[]): number {
    if (!imageColors.length || !itemColors.length) return 0;

    let matches = 0;
    for (const imageColor of imageColors) {
      for (const itemColor of itemColors) {
        if (this.colorsAreSimilar(imageColor, itemColor)) {
          matches++;
          break;
        }
      }
    }

    return matches / Math.max(imageColors.length, itemColors.length);
  }

  /**
   * 判斷顏色是否相似
   */
  private colorsAreSimilar(color1: string, color2: string): boolean {
    const c1 = color1.toLowerCase();
    const c2 = color2.toLowerCase();
    
    // 直接匹配
    if (c1 === c2 || c1.includes(c2) || c2.includes(c1)) {
      return true;
    }

    // 顏色族群匹配
    const colorGroups = [
      ['紅', '紅色', '深紅', '淺紅', '粉紅'],
      ['綠', '綠色', '深綠', '淺綠', '翠綠'],
      ['黃', '黃色', '淡黃', '金黃', '橙黃'],
      ['白', '白色', '米白', '乳白'],
      ['黑', '黑色', '深褐', '黑褐'],
      ['褐', '褐色', '棕色', '深褐', '淺褐']
    ];

    for (const group of colorGroups) {
      if (group.some(g => c1.includes(g)) && group.some(g => c2.includes(g))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 計算質地匹配度
   */
  private calculateTextureMatch(imageTexture: string, itemTextures: string[]): number {
    const textureMap: Record<string, string[]> = {
      'smooth': ['光滑', '細緻', '柔軟', '滑溜'],
      'rough': ['粗糙', '有韌性', '緊實', '有嚼勁'],
      'mixed': ['混合', '多樣', '複雜']
    };

    const imageTextureTerms = textureMap[imageTexture] || [];
    
    for (const term of imageTextureTerms) {
      for (const itemTexture of itemTextures) {
        if (itemTexture.includes(term) || term.includes(itemTexture)) {
          return 0.8;
        }
      }
    }

    return 0.2;
  }

  /**
   * 計算形狀匹配度
   */
  private calculateShapeMatch(imageShapes: string[], itemShapes: string[]): number {
    if (!imageShapes.length || !itemShapes.length) return 0;

    let matches = 0;
    for (const imageShape of imageShapes) {
      for (const itemShape of itemShapes) {
        if (this.shapesAreSimilar(imageShape, itemShape)) {
          matches++;
          break;
        }
      }
    }

    return matches / Math.max(imageShapes.length, itemShapes.length);
  }

  /**
   * 判斷形狀是否相似
   */
  private shapesAreSimilar(shape1: string, shape2: string): boolean {
    const s1 = shape1.toLowerCase();
    const s2 = shape2.toLowerCase();
    
    if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) {
      return true;
    }

    // 形狀族群匹配
    const shapeGroups = [
      ['圓', '圓形', '球狀', '圓柱'],
      ['長', '長條', '細長', '條狀'],
      ['方', '方形', '方塊', '長方'],
      ['絲', '絲狀', '細絲', '線狀']
    ];

    for (const group of shapeGroups) {
      if (group.some(g => s1.includes(g)) && group.some(g => s2.includes(g))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 獲取匹配的特徵
   */
  private getMatchedFeatures(imageFeatures: ImageFeatures, foodItem: FoodItem): string[] {
    const matched: string[] = [];

    // 檢查顏色匹配
    for (const imageColor of imageFeatures.dominantColors) {
      for (const itemColor of foodItem.visualFeatures.color) {
        if (this.colorsAreSimilar(imageColor, itemColor)) {
          matched.push(`顏色: ${itemColor}`);
          break;
        }
      }
    }

    // 檢查形狀匹配
    for (const imageShape of imageFeatures.shapePatterns) {
      for (const itemShape of foodItem.visualFeatures.shape) {
        if (this.shapesAreSimilar(imageShape, itemShape)) {
          matched.push(`形狀: ${itemShape}`);
          break;
        }
      }
    }

    // 檢查質地匹配
    const textureMatch = this.calculateTextureMatch(
      imageFeatures.textureType,
      foodItem.visualFeatures.texture
    );
    if (textureMatch > 0.5) {
      matched.push(`質地: ${foodItem.visualFeatures.texture.join('、')}`);
    }

    return matched;
  }

  /**
   * 生成匹配原因
   */
  private generateMatchReason(
    imageFeatures: ImageFeatures,
    foodItem: FoodItem,
    similarity: number
  ): string {
    const reasons: string[] = [];

    if (similarity > 0.8) {
      reasons.push('高度匹配');
    } else if (similarity > 0.6) {
      reasons.push('中度匹配');
    } else {
      reasons.push('可能匹配');
    }

    const matchedFeatures = this.getMatchedFeatures(imageFeatures, foodItem);
    if (matchedFeatures.length > 0) {
      reasons.push(`匹配特徵: ${matchedFeatures.join('、')}`);
    }

    return reasons.join('；');
  }

  /**
   * 根據名稱搜尋食材（支持模糊匹配）
   */
  public searchFoodItemsByName(searchTerm: string, fuzzy: boolean = true): FoodItem[] {
    const searchLower = searchTerm.toLowerCase();
    const allItems = getAllFoodItems();

    if (!fuzzy) {
      // 精確匹配
      return allItems.filter(item => 
        item.name === searchTerm || item.nameVariants.includes(searchTerm)
      );
    }

    // 模糊匹配
    return allItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const variantMatch = item.nameVariants.some(v => 
        v.toLowerCase().includes(searchLower)
      );
      const tagMatch = item.tags?.some(t => 
        t.toLowerCase().includes(searchLower)
      );

      return nameMatch || variantMatch || tagMatch;
    });
  }

  /**
   * 獲取易混淆的食材對
   */
  public getConfusedFoodPairs(foodName: string): string[] {
    const foodItem = getFoodItemByName(foodName);
    if (!foodItem) return [];

    return foodItem.commonConfusions;
  }

  /**
   * 獲取食材的區分特徵
   */
  public getDistinguishingFeatures(foodName: string): string[] {
    const foodItem = getFoodItemByName(foodName);
    if (!foodItem) return [];

    return foodItem.distinguishingFeatures;
  }

  /**
   * 根據料理模式獲取常見食材
   */
  public getCommonIngredientsForDish(dishName: string): string[] {
    const pattern = getDishPatternByName(dishName);
    if (!pattern) return [];

    return pattern.commonIngredients;
  }

  /**
   * 根據料理模式獲取常見調味料
   */
  public getCommonSeasoningsForDish(dishName: string): string[] {
    const pattern = getDishPatternByName(dishName);
    if (!pattern) return [];

    return pattern.commonSeasonings;
  }

  /**
   * 檢查食材組合是否合理
   */
  public validateFoodCombination(foodNames: string[]): {
    valid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 檢查易混淆食材是否同時出現
    const confusionPairs = [
      ['豆腐干絲', '麵條'],
      ['米粉', '粉絲'],
      ['玉米筍', '筍子'],
      ['糯米椒', '青椒'],
      ['過貓', '空心菜']
    ];

    for (const [food1, food2] of confusionPairs) {
      if (foodNames.includes(food1) && foodNames.includes(food2)) {
        warnings.push(`${food1} 和 ${food2} 容易混淆，請確認識別正確`);
      }
    }

    // 檢查料理類型一致性
    const foodItems = foodNames
      .map(name => getFoodItemByName(name))
      .filter(item => item !== undefined) as FoodItem[];

    if (foodItems.length > 0) {
      const cuisineTypes = new Set<CuisineType>();
      foodItems.forEach(item => {
        item.cuisineTypes.forEach(type => cuisineTypes.add(type));
      });

      if (cuisineTypes.size === 1) {
        const cuisineType = Array.from(cuisineTypes)[0];
        suggestions.push(`這些食材都屬於${cuisineType}料理`);
      }
    }

    return {
      valid: warnings.length === 0,
      warnings,
      suggestions
    };
  }

  /**
   * 根據食材推薦可能的料理類型
   */
  public suggestDishType(foodNames: string[]): DishPattern[] {
    const suggestions: DishPattern[] = [];
    const allPatterns = getAllDishPatterns();

    for (const pattern of allPatterns) {
      let matchCount = 0;
      for (const ingredient of pattern.commonIngredients) {
        if (foodNames.some(name => name.includes(ingredient) || ingredient.includes(name))) {
          matchCount++;
        }
      }

      // 如果匹配超過30%的常見食材，則推薦
      if (matchCount / pattern.commonIngredients.length >= 0.3) {
        suggestions.push(pattern);
      }
    }

    return suggestions;
  }

  /**
   * 獲取食材的營養資訊
   */
  public getNutritionInfo(foodName: string): FoodItem['nutritionPer100g'] | null {
    const foodItem = getFoodItemByName(foodName);
    if (!foodItem) return null;

    return foodItem.nutritionPer100g;
  }

  /**
   * 獲取食材的常見搭配
   */
  public getCommonPairings(foodName: string): string[] {
    const foodItem = getFoodItemByName(foodName);
    if (!foodItem) return [];

    return foodItem.commonPairings || [];
  }

  /**
   * 獲取所有食材數量
   */
  public getFoodItemCount(): number {
    return getAllFoodItems().length;
  }

  /**
   * 獲取所有料理模式數量
   */
  public getDishPatternCount(): number {
    return getAllDishPatterns().length;
  }

  /**
   * 獲取知識庫統計資訊
   */
  public getStatistics(): {
    totalFoodItems: number;
    totalDishPatterns: number;
    categoryCounts: Record<string, number>;
    cuisineTypeCounts: Record<string, number>;
  } {
    const allItems = getAllFoodItems();
    const categoryCounts: Record<string, number> = {};
    const cuisineTypeCounts: Record<string, number> = {};

    allItems.forEach(item => {
      // 統計類別
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;

      // 統計料理類型
      item.cuisineTypes.forEach(type => {
        cuisineTypeCounts[type] = (cuisineTypeCounts[type] || 0) + 1;
      });
    });

    return {
      totalFoodItems: allItems.length,
      totalDishPatterns: getAllDishPatterns().length,
      categoryCounts,
      cuisineTypeCounts
    };
  }
}

// 導出單例實例
export const asianCuisineKB = new AsianCuisineKnowledgeBase();
