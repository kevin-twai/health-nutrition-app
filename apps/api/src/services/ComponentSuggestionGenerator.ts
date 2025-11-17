/**
 * 成分建議生成器
 * 
 * 負責生成以下建議：
 * 1. 可能缺失的成分建議
 * 2. 份量調整建議
 * 3. 替代解釋建議
 * 
 * Requirements: 3.6
 */

import {
  DetectedComponent,
  DishType,
  ComponentCategory,
  UserSuggestions,
  PortionAdjustment,
  AlternativeInterpretation,
  MainDishInfo,
  DishComponentMap
} from '../types/ComponentDetection';
import {
  findDishComponentMap,
  findDishComponentMapsByType,
  DISH_COMPONENT_MAPS
} from '../data/dishComponentMaps';

export class ComponentSuggestionGenerator {
  constructor() {
    // 不需要初始化，直接使用導入的函數
  }

  /**
   * 生成完整的用戶建議
   */
  generateSuggestions(
    mainDish: MainDishInfo,
    detectedComponents: DetectedComponent[],
    confidenceScore: number
  ): UserSuggestions {
    return {
      possibleMissingComponents: this.generateMissingComponentsSuggestions(
        mainDish,
        detectedComponents
      ),
      portionAdjustments: this.generatePortionAdjustments(
        mainDish,
        detectedComponents
      ),
      alternativeInterpretations: this.generateAlternativeInterpretations(
        mainDish,
        detectedComponents,
        confidenceScore
      )
    };
  }

  /**
   * 生成可能缺失的成分建議
   * 
   * 根據料理類型和已檢測的成分，推測可能缺失的常見成分
   */
  private generateMissingComponentsSuggestions(
    mainDish: MainDishInfo,
    detectedComponents: DetectedComponent[]
  ): string[] {
    const suggestions: string[] = [];
    
    // 獲取該料理的常見成分
    const dishMapping = findDishComponentMap(mainDish.name);
    
    if (!dishMapping) {
      return suggestions;
    }

    // 檢查哪些常見成分未被檢測到
    const detectedNames = new Set(
      detectedComponents.map(c => c.name.toLowerCase())
    );

    for (const commonComponent of dishMapping.commonComponents) {
      // 只建議高頻率出現的成分（frequency > 0.7）
      if (commonComponent.frequency > 0.7) {
        const componentName = commonComponent.name.toLowerCase();
        
        // 檢查是否已檢測到（包括替代名稱）
        const isDetected = detectedNames.has(componentName) ||
          commonComponent.alternatives.some(alt => 
            detectedNames.has(alt.toLowerCase())
          );

        if (!isDetected) {
          suggestions.push(commonComponent.name);
        }
      }
    }

    // 根據料理類型添加特定建議
    const typeSuggestions = this.getTypeSpecificMissingSuggestions(
      mainDish.type,
      detectedComponents
    );
    
    suggestions.push(...typeSuggestions);

    // 限制建議數量（最多 5 個）
    return suggestions.slice(0, 5);
  }

  /**
   * 根據料理類型生成特定的缺失成分建議
   */
  private getTypeSpecificMissingSuggestions(
    dishType: DishType,
    detectedComponents: DetectedComponent[]
  ): string[] {
    const suggestions: string[] = [];
    const categories = new Set(detectedComponents.map(c => c.category));

    switch (dishType) {
      case DishType.FRIED_RICE:
        // 炒飯應該有主食、蛋白質和蔬菜
        if (!categories.has(ComponentCategory.GRAIN)) {
          suggestions.push('米飯');
        }
        if (!categories.has(ComponentCategory.PROTEIN)) {
          suggestions.push('雞蛋');
        }
        if (!categories.has(ComponentCategory.VEGETABLE)) {
          suggestions.push('青蔥');
        }
        break;

      case DishType.SOUP:
        // 湯品應該有湯底和配料
        const hasBroth = detectedComponents.some(c => 
          c.name.includes('湯') || 
          c.name.includes('高湯') || 
          c.name.includes('湯底') ||
          c.category === ComponentCategory.SAUCE
        );
        
        if (!hasBroth) {
          suggestions.push('湯底（高湯、清湯等）');
        }
        
        // 檢查常見的湯品配料
        if (!categories.has(ComponentCategory.PROTEIN)) {
          suggestions.push('蛋白質配料（豆腐、蛋、肉類等）');
        }
        
        if (!categories.has(ComponentCategory.VEGETABLE)) {
          suggestions.push('蔬菜配料（青蔥、海帶、菇類等）');
        }
        
        // 檢查調味料
        if (!categories.has(ComponentCategory.SEASONING) && 
            !categories.has(ComponentCategory.GARNISH)) {
          suggestions.push('調味料或配菜（蔥花、香菜、胡椒粉等）');
        }
        break;

      case DishType.BENTO:
        // 便當應該有主食、主菜和配菜
        if (!categories.has(ComponentCategory.GRAIN)) {
          suggestions.push('白飯');
        }
        if (!categories.has(ComponentCategory.PROTEIN)) {
          suggestions.push('主菜（肉類或魚類）');
        }
        if (!categories.has(ComponentCategory.VEGETABLE)) {
          suggestions.push('配菜（蔬菜）');
        }
        break;

      case DishType.NOODLES:
        // 麵食應該有麵條和配料
        if (!detectedComponents.some(c => 
          c.name.includes('麵') || c.name.includes('粉')
        )) {
          suggestions.push('麵條');
        }
        break;

      case DishType.STIR_FRY:
        // 炒菜應該有主要食材和調味料
        if (!categories.has(ComponentCategory.SEASONING)) {
          suggestions.push('調味料（醬油、鹽等）');
        }
        break;
    }

    return suggestions;
  }

  /**
   * 生成份量調整建議
   * 
   * 檢查檢測到的份量是否合理，並提供調整建議
   */
  private generatePortionAdjustments(
    mainDish: MainDishInfo,
    detectedComponents: DetectedComponent[]
  ): PortionAdjustment[] {
    const adjustments: PortionAdjustment[] = [];
    
    // 獲取料理的常見成分映射
    const dishMapping = findDishComponentMap(mainDish.name);
    
    if (!dishMapping) {
      return adjustments;
    }

    // 檢查每個檢測到的成分
    for (const component of detectedComponents) {
      // 在知識庫中查找對應的成分資訊
      const knownComponent = dishMapping.commonComponents.find(
        c => c.name === component.name || 
             c.alternatives.includes(component.name)
      );

      if (!knownComponent) {
        continue;
      }

      // 檢查份量是否在合理範圍內
      const { min, max } = knownComponent.portionRange;
      const estimatedPortion = component.estimatedPortion;

      if (estimatedPortion < min) {
        // 份量過小
        adjustments.push({
          component: component.name,
          suggestedPortion: knownComponent.typicalPortion,
          reason: `檢測到的份量（${estimatedPortion}g）低於典型範圍（${min}-${max}g），建議調整為典型份量`
        });
      } else if (estimatedPortion > max) {
        // 份量過大
        adjustments.push({
          component: component.name,
          suggestedPortion: knownComponent.typicalPortion,
          reason: `檢測到的份量（${estimatedPortion}g）高於典型範圍（${min}-${max}g），建議調整為典型份量`
        });
      } else if (component.confidence < 0.7) {
        // 信心度低，建議使用典型份量
        adjustments.push({
          component: component.name,
          suggestedPortion: knownComponent.typicalPortion,
          reason: `識別信心度較低（${(component.confidence * 100).toFixed(0)}%），建議使用典型份量（${knownComponent.typicalPortion}g）`
        });
      }
    }

    // 檢查總份量是否合理
    const totalDetectedPortion = detectedComponents.reduce(
      (sum, c) => sum + c.estimatedPortion,
      0
    );
    
    const { min: minTotal, max: maxTotal, typical: typicalTotal } = 
      dishMapping.typicalPortionRange;

    if (totalDetectedPortion < minTotal * 0.8) {
      adjustments.push({
        component: '整體料理',
        suggestedPortion: typicalTotal,
        reason: `檢測到的總份量（${totalDetectedPortion}g）明顯低於典型份量（${typicalTotal}g），可能有成分未被檢測到`
      });
    } else if (totalDetectedPortion > maxTotal * 1.2) {
      adjustments.push({
        component: '整體料理',
        suggestedPortion: typicalTotal,
        reason: `檢測到的總份量（${totalDetectedPortion}g）明顯高於典型份量（${typicalTotal}g），可能存在重複計算`
      });
    }

    // 限制建議數量（最多 3 個）
    return adjustments.slice(0, 3);
  }

  /**
   * 生成替代解釋建議
   * 
   * 當識別信心度較低時，提供其他可能的料理解釋
   */
  private generateAlternativeInterpretations(
    mainDish: MainDishInfo,
    detectedComponents: DetectedComponent[],
    confidenceScore: number
  ): AlternativeInterpretation[] {
    const alternatives: AlternativeInterpretation[] = [];

    // 只在信心度較低時提供替代解釋
    if (confidenceScore >= 0.85) {
      return alternatives;
    }

    // 根據檢測到的成分，尋找其他可能的料理
    const componentNames = detectedComponents.map(c => c.name);
    const possibleDishes = this.findSimilarDishes(
      mainDish.type,
      componentNames
    );

    for (const dish of possibleDishes) {
      // 跳過當前料理
      if (dish.dishName === mainDish.name) {
        continue;
      }

      // 計算相似度
      const similarity = this.calculateDishSimilarity(
        componentNames,
        dish.commonComponents.map(c => c.name)
      );

      if (similarity > 0.5) {
        // 生成該料理的成分列表
        const alternativeComponents = this.generateAlternativeComponents(
          dish,
          detectedComponents
        );

        alternatives.push({
          dishName: dish.dishName,
          components: alternativeComponents,
          confidence: similarity * 0.9 // 略低於相似度
        });
      }
    }

    // 按信心度排序，限制數量（最多 2 個）
    return alternatives
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
  }

  /**
   * 尋找相似的料理
   */
  private findSimilarDishes(
    dishType: DishType,
    componentNames: string[]
  ): DishComponentMap[] {
    // 獲取相同類型的所有料理
    const allDishes = DISH_COMPONENT_MAPS;
    
    return allDishes.filter(dish => 
      dish.dishType === dishType ||
      this.hasCommonComponents(dish.commonComponents.map(c => c.name), componentNames)
    );
  }

  /**
   * 檢查是否有共同成分
   */
  private hasCommonComponents(
    dishComponents: string[],
    detectedComponents: string[]
  ): boolean {
    const commonCount = dishComponents.filter(dc =>
      detectedComponents.some(detected =>
        dc.toLowerCase().includes(detected.toLowerCase()) ||
        detected.toLowerCase().includes(dc.toLowerCase())
      )
    ).length;

    return commonCount >= 2; // 至少有 2 個共同成分
  }

  /**
   * 計算料理相似度
   */
  private calculateDishSimilarity(
    detectedComponents: string[],
    dishComponents: string[]
  ): number {
    let matchCount = 0;
    
    for (const detected of detectedComponents) {
      if (dishComponents.some(dish =>
        dish.toLowerCase().includes(detected.toLowerCase()) ||
        detected.toLowerCase().includes(dish.toLowerCase())
      )) {
        matchCount++;
      }
    }

    // 相似度 = 匹配數量 / 檢測到的成分數量
    return detectedComponents.length > 0
      ? matchCount / detectedComponents.length
      : 0;
  }

  /**
   * 生成替代料理的成分列表
   */
  private generateAlternativeComponents(
    dish: DishComponentMap,
    originalComponents: DetectedComponent[]
  ): DetectedComponent[] {
    const alternativeComponents: DetectedComponent[] = [];

    // 使用原始檢測到的成分作為基礎
    for (const original of originalComponents) {
      // 檢查該成分是否在替代料理中
      const matchingComponent = dish.commonComponents.find(c =>
        c.name === original.name ||
        c.alternatives.includes(original.name)
      );

      if (matchingComponent) {
        // 使用替代料理的典型份量
        alternativeComponents.push({
          ...original,
          estimatedPortion: matchingComponent.typicalPortion,
          confidence: original.confidence * 0.9 // 略微降低信心度
        });
      }
    }

    // 添加替代料理的其他常見成分（高頻率的）
    for (const commonComp of dish.commonComponents) {
      if (commonComp.frequency > 0.8) {
        const alreadyIncluded = alternativeComponents.some(
          ac => ac.name === commonComp.name
        );

        if (!alreadyIncluded) {
          alternativeComponents.push({
            id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: commonComp.name,
            nameEn: commonComp.nameEn,
            confidence: commonComp.frequency * 0.7,
            estimatedPortion: commonComp.typicalPortion,
            cookingMethod: commonComp.cookingMethods[0],
            category: commonComp.category
          });
        }
      }
    }

    return alternativeComponents;
  }

  /**
   * 生成用戶友好的建議摘要
   */
  generateSuggestionSummary(suggestions: UserSuggestions): string {
    const parts: string[] = [];

    // 缺失成分建議
    if (suggestions.possibleMissingComponents.length > 0) {
      parts.push(
        `可能缺失的成分：${suggestions.possibleMissingComponents.join('、')}`
      );
    }

    // 份量調整建議
    if (suggestions.portionAdjustments.length > 0) {
      const adjustmentCount = suggestions.portionAdjustments.length;
      parts.push(`有 ${adjustmentCount} 個成分的份量建議調整`);
    }

    // 替代解釋
    if (suggestions.alternativeInterpretations.length > 0) {
      const altNames = suggestions.alternativeInterpretations
        .map(alt => alt.dishName)
        .join('、');
      parts.push(`其他可能的料理：${altNames}`);
    }

    return parts.length > 0
      ? parts.join('；')
      : '無額外建議';
  }
}
