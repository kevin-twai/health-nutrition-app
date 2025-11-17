/**
 * ComponentSuggestionGenerator 使用範例
 * 
 * 展示如何使用建議生成器為成分識別結果生成智能建議
 */

import { ComponentSuggestionGenerator } from './ComponentSuggestionGenerator';
import {
  MainDishInfo,
  DetectedComponent,
  DishType,
  ComponentCategory,
  CookingMethod
} from '../types/ComponentDetection';

// ============================================
// 範例 1: 炒飯成分識別 - 缺少常見成分
// ============================================

function example1_MissingComponents() {
  console.log('\n=== 範例 1: 炒飯成分識別 - 缺少常見成分 ===\n');

  const generator = new ComponentSuggestionGenerator();

  // 主料理資訊
  const mainDish: MainDishInfo = {
    name: '蛋炒飯',
    type: DishType.FRIED_RICE,
    confidence: 0.92,
    estimatedTotalPortion: 280
  };

  // 檢測到的成分（缺少雞蛋和青蔥）
  const detectedComponents: DetectedComponent[] = [
    {
      id: 'comp_1',
      name: '白飯',
      confidence: 0.95,
      estimatedPortion: 250,
      category: ComponentCategory.GRAIN,
      cookingMethod: CookingMethod.STIR_FRIED
    },
    {
      id: 'comp_2',
      name: '醬油',
      confidence: 0.85,
      estimatedPortion: 10,
      category: ComponentCategory.SEASONING,
      cookingMethod: CookingMethod.RAW
    }
  ];

  // 生成建議
  const suggestions = generator.generateSuggestions(
    mainDish,
    detectedComponents,
    mainDish.confidence
  );

  console.log('可能缺失的成分:');
  suggestions.possibleMissingComponents.forEach(comp => {
    console.log(`  - ${comp}`);
  });

  console.log('\n建議摘要:');
  console.log(generator.generateSuggestionSummary(suggestions));
}

// ============================================
// 範例 2: 便當成分識別 - 份量需要調整
// ============================================

function example2_PortionAdjustments() {
  console.log('\n=== 範例 2: 便當成分識別 - 份量需要調整 ===\n');

  const generator = new ComponentSuggestionGenerator();

  const mainDish: MainDishInfo = {
    name: '台式便當',
    type: DishType.BENTO,
    confidence: 0.88,
    estimatedTotalPortion: 450
  };

  // 檢測到的成分（份量不合理）
  const detectedComponents: DetectedComponent[] = [
    {
      id: 'comp_1',
      name: '白飯',
      confidence: 0.90,
      estimatedPortion: 100, // 太少
      category: ComponentCategory.GRAIN
    },
    {
      id: 'comp_2',
      name: '炸雞腿',
      confidence: 0.85,
      estimatedPortion: 200, // 太多
      category: ComponentCategory.PROTEIN,
      cookingMethod: CookingMethod.DEEP_FRIED
    },
    {
      id: 'comp_3',
      name: '高麗菜',
      confidence: 0.65, // 信心度低
      estimatedPortion: 50,
      category: ComponentCategory.VEGETABLE
    }
  ];

  const suggestions = generator.generateSuggestions(
    mainDish,
    detectedComponents,
    mainDish.confidence
  );

  console.log('份量調整建議:');
  suggestions.portionAdjustments.forEach(adj => {
    console.log(`  成分: ${adj.component}`);
    console.log(`  建議份量: ${adj.suggestedPortion}g`);
    console.log(`  原因: ${adj.reason}`);
    console.log('');
  });
}

// ============================================
// 範例 3: 湯品成分識別 - 低信心度，提供替代解釋
// ============================================

function example3_AlternativeInterpretations() {
  console.log('\n=== 範例 3: 湯品成分識別 - 低信心度，提供替代解釋 ===\n');

  const generator = new ComponentSuggestionGenerator();

  const mainDish: MainDishInfo = {
    name: '味噌湯',
    type: DishType.SOUP,
    confidence: 0.72, // 低信心度
    estimatedTotalPortion: 300
  };

  const detectedComponents: DetectedComponent[] = [
    {
      id: 'comp_1',
      name: '豆腐',
      confidence: 0.88,
      estimatedPortion: 50,
      category: ComponentCategory.PROTEIN
    },
    {
      id: 'comp_2',
      name: '海帶',
      confidence: 0.75,
      estimatedPortion: 20,
      category: ComponentCategory.VEGETABLE
    },
    {
      id: 'comp_3',
      name: '青蔥',
      confidence: 0.70,
      estimatedPortion: 10,
      category: ComponentCategory.GARNISH
    }
  ];

  const suggestions = generator.generateSuggestions(
    mainDish,
    detectedComponents,
    mainDish.confidence
  );

  console.log('替代解釋:');
  suggestions.alternativeInterpretations.forEach((alt, index) => {
    console.log(`\n  選項 ${index + 1}: ${alt.dishName}`);
    console.log(`  信心度: ${(alt.confidence * 100).toFixed(1)}%`);
    console.log(`  成分數量: ${alt.components.length}`);
    console.log('  成分列表:');
    alt.components.forEach(comp => {
      console.log(`    - ${comp.name} (${comp.estimatedPortion}g)`);
    });
  });

  console.log('\n完整建議摘要:');
  console.log(generator.generateSuggestionSummary(suggestions));
}

// ============================================
// 範例 4: 完整的建議生成流程
// ============================================

function example4_CompleteFlow() {
  console.log('\n=== 範例 4: 完整的建議生成流程 ===\n');

  const generator = new ComponentSuggestionGenerator();

  const mainDish: MainDishInfo = {
    name: '拉麵',
    type: DishType.NOODLES,
    confidence: 0.85,
    estimatedTotalPortion: 500
  };

  const detectedComponents: DetectedComponent[] = [
    {
      id: 'comp_1',
      name: '拉麵',
      confidence: 0.92,
      estimatedPortion: 200,
      category: ComponentCategory.GRAIN
    },
    {
      id: 'comp_2',
      name: '叉燒',
      confidence: 0.88,
      estimatedPortion: 80,
      category: ComponentCategory.PROTEIN,
      cookingMethod: CookingMethod.BRAISED
    },
    {
      id: 'comp_3',
      name: '筍乾',
      confidence: 0.75,
      estimatedPortion: 30,
      category: ComponentCategory.VEGETABLE
    },
    {
      id: 'comp_4',
      name: '青蔥',
      confidence: 0.82,
      estimatedPortion: 10,
      category: ComponentCategory.GARNISH
    }
  ];

  const suggestions = generator.generateSuggestions(
    mainDish,
    detectedComponents,
    mainDish.confidence
  );

  console.log('=== 完整建議報告 ===\n');

  console.log('1. 可能缺失的成分:');
  if (suggestions.possibleMissingComponents.length > 0) {
    suggestions.possibleMissingComponents.forEach(comp => {
      console.log(`   - ${comp}`);
    });
  } else {
    console.log('   無');
  }

  console.log('\n2. 份量調整建議:');
  if (suggestions.portionAdjustments.length > 0) {
    suggestions.portionAdjustments.forEach(adj => {
      console.log(`   - ${adj.component}: ${adj.suggestedPortion}g`);
      console.log(`     ${adj.reason}`);
    });
  } else {
    console.log('   無');
  }

  console.log('\n3. 替代解釋:');
  if (suggestions.alternativeInterpretations.length > 0) {
    suggestions.alternativeInterpretations.forEach(alt => {
      console.log(`   - ${alt.dishName} (信心度: ${(alt.confidence * 100).toFixed(1)}%)`);
    });
  } else {
    console.log('   無');
  }

  console.log('\n4. 建議摘要:');
  console.log(`   ${generator.generateSuggestionSummary(suggestions)}`);
}

// ============================================
// 範例 5: 在 API 回應中使用建議
// ============================================

function example5_APIResponse() {
  console.log('\n=== 範例 5: 在 API 回應中使用建議 ===\n');

  const generator = new ComponentSuggestionGenerator();

  const mainDish: MainDishInfo = {
    name: '蛋炒飯',
    type: DishType.FRIED_RICE,
    confidence: 0.90,
    estimatedTotalPortion: 300
  };

  const detectedComponents: DetectedComponent[] = [
    {
      id: 'comp_1',
      name: '白飯',
      confidence: 0.95,
      estimatedPortion: 200,
      category: ComponentCategory.GRAIN
    },
    {
      id: 'comp_2',
      name: '雞蛋',
      confidence: 0.88,
      estimatedPortion: 50,
      category: ComponentCategory.PROTEIN
    }
  ];

  const suggestions = generator.generateSuggestions(
    mainDish,
    detectedComponents,
    mainDish.confidence
  );

  // 構建 API 回應
  const apiResponse = {
    success: true,
    data: {
      sessionId: 'session_123',
      componentDetection: {
        enabled: true,
        success: true,
        mainDish,
        components: detectedComponents,
        suggestions: {
          possibleMissingComponents: suggestions.possibleMissingComponents,
          portionAdjustments: suggestions.portionAdjustments,
          alternativeInterpretations: suggestions.alternativeInterpretations,
          summary: generator.generateSuggestionSummary(suggestions)
        }
      }
    },
    timestamp: new Date()
  };

  console.log('API 回應範例:');
  console.log(JSON.stringify(apiResponse, null, 2));
}

// ============================================
// 執行所有範例
// ============================================

if (require.main === module) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   ComponentSuggestionGenerator 使用範例                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  example1_MissingComponents();
  example2_PortionAdjustments();
  example3_AlternativeInterpretations();
  example4_CompleteFlow();
  example5_APIResponse();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   所有範例執行完成                                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

export {
  example1_MissingComponents,
  example2_PortionAdjustments,
  example3_AlternativeInterpretations,
  example4_CompleteFlow,
  example5_APIResponse
};
