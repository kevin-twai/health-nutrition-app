/**
 * 成分識別反饋收集器使用示例
 */

import { ComponentFeedbackCollector } from './ComponentFeedbackCollector';
import { FeedbackRepository } from '../repositories/FeedbackRepository';
import { ComponentDetectionResult, DishType, CookingMethod, ComponentCategory } from '../types/ComponentDetection';

// 模擬數據庫和 Redis 連接
const mockDb: any = null;
const mockRedis: any = null;

// 初始化服務
const feedbackRepository = new FeedbackRepository(mockDb, mockRedis);
const componentFeedbackCollector = new ComponentFeedbackCollector(feedbackRepository);

/**
 * 示例 1: 提交成分識別反饋 - 炒飯
 */
async function example1_SubmitFriedRiceFeedback() {
  console.log('=== 示例 1: 提交炒飯成分識別反饋 ===\n');

  // 模擬識別結果
  const recognitionResult: ComponentDetectionResult = {
    mainDish: {
      name: '蛋炒飯',
      type: DishType.FRIED_RICE,
      confidence: 0.92,
      estimatedTotalPortion: 300
    },
    components: [
      {
        id: 'comp_1',
        name: '白飯',
        nameEn: 'White Rice',
        confidence: 0.95,
        estimatedPortion: 200,
        category: ComponentCategory.GRAIN,
        cookingMethod: CookingMethod.STIR_FRIED,
        actualNutrition: {
          calories: 260,
          protein: 4,
          carbohydrates: 56,
          fat: 2
        }
      },
      {
        id: 'comp_2',
        name: '雞蛋',
        nameEn: 'Egg',
        confidence: 0.88,
        estimatedPortion: 50,
        category: ComponentCategory.PROTEIN,
        cookingMethod: CookingMethod.STIR_FRIED,
        actualNutrition: {
          calories: 72,
          protein: 6,
          carbohydrates: 0.4,
          fat: 5
        }
      },
      {
        id: 'comp_3',
        name: '火腿',
        nameEn: 'Ham',
        confidence: 0.75,
        estimatedPortion: 30,
        category: ComponentCategory.PROTEIN,
        cookingMethod: CookingMethod.STIR_FRIED,
        actualNutrition: {
          calories: 45,
          protein: 5,
          carbohydrates: 1,
          fat: 2
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 377,
        protein: 15,
        carbohydrates: 57.4,
        fat: 9
      },
      byComponent: [],
      byCategory: [],
      cookingImpact: []
    },
    metadata: {
      processingTime: 2500,
      confidenceScore: 0.86,
      detectionMethod: 'hybrid',
      componentsDetected: 3,
      componentsFromKB: 1,
      componentsFromVision: 2
    },
    suggestions: {
      possibleMissingComponents: ['青蔥', '青豆'],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };

  // 用戶修正
  const feedback = await componentFeedbackCollector.submitComponentFeedback({
    imageId: 'img_fried_rice_001',
    userId: 'user_123',
    sessionId: 'session_456',
    recognitionResult,
    componentCorrections: {
      correctComponents: [
        {
          id: 'comp_1',
          name: '白飯',
          portion: 200,
          category: 'grain'
        },
        {
          id: 'comp_2',
          name: '雞蛋',
          portion: 50,
          category: 'protein'
        }
      ],
      incorrectComponents: [
        {
          identifiedAs: '火腿',
          actualComponent: '叉燒',
          reason: '顏色和質地相似，但實際是叉燒',
          identifiedPortion: 30,
          actualPortion: 40
        }
      ],
      missingComponents: [
        {
          name: '青蔥',
          portion: 10,
          category: 'garnish',
          importance: 'medium',
          reason: '圖片中可見但未識別'
        },
        {
          name: '青豆',
          portion: 20,
          category: 'vegetable',
          importance: 'low',
          reason: '少量青豆散布在炒飯中'
        }
      ],
      componentPortionCorrections: [],
      componentCategoryCorrections: [],
      componentNutritionCorrections: []
    },
    additionalComments: '整體識別不錯，但需要改進對叉燒和火腿的區分'
  });

  console.log('反饋已提交:', {
    id: feedback.id,
    類型: feedback.feedbackType,
    狀態: feedback.status
  });
  console.log('\n');
}

/**
 * 示例 2: 提交成分識別反饋 - 便當
 */
async function example2_SubmitBentoFeedback() {
  console.log('=== 示例 2: 提交便當成分識別反饋 ===\n');

  const recognitionResult: ComponentDetectionResult = {
    mainDish: {
      name: '台式便當',
      type: DishType.BENTO,
      confidence: 0.89,
      estimatedTotalPortion: 500
    },
    components: [
      {
        id: 'comp_1',
        name: '白飯',
        confidence: 0.95,
        estimatedPortion: 250,
        category: ComponentCategory.GRAIN,
        actualNutrition: {
          calories: 325,
          protein: 5,
          carbohydrates: 70,
          fat: 2.5
        }
      },
      {
        id: 'comp_2',
        name: '炸雞腿',
        confidence: 0.85,
        estimatedPortion: 120,
        category: ComponentCategory.PROTEIN,
        cookingMethod: CookingMethod.DEEP_FRIED,
        actualNutrition: {
          calories: 240,
          protein: 20,
          carbohydrates: 8,
          fat: 15
        }
      },
      {
        id: 'comp_3',
        name: '炒高麗菜',
        confidence: 0.78,
        estimatedPortion: 80,
        category: ComponentCategory.VEGETABLE,
        cookingMethod: CookingMethod.STIR_FRIED,
        actualNutrition: {
          calories: 40,
          protein: 2,
          carbohydrates: 6,
          fat: 1
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 605,
        protein: 27,
        carbohydrates: 84,
        fat: 18.5
      },
      byComponent: [],
      byCategory: [],
      cookingImpact: []
    },
    metadata: {
      processingTime: 3200,
      confidenceScore: 0.83,
      detectionMethod: 'hybrid',
      componentsDetected: 3,
      componentsFromKB: 1,
      componentsFromVision: 2
    },
    suggestions: {
      possibleMissingComponents: ['滷蛋', '醃蘿蔔'],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };

  const feedback = await componentFeedbackCollector.submitComponentFeedback({
    imageId: 'img_bento_001',
    userId: 'user_123',
    sessionId: 'session_789',
    recognitionResult,
    componentCorrections: {
      correctComponents: [
        {
          id: 'comp_1',
          name: '白飯',
          portion: 250
        },
        {
          id: 'comp_2',
          name: '炸雞腿',
          portion: 120
        }
      ],
      incorrectComponents: [],
      missingComponents: [
        {
          name: '滷蛋',
          portion: 60,
          category: 'protein',
          cookingMethod: 'braised',
          importance: 'high',
          reason: '便當中有半顆滷蛋但未識別'
        },
        {
          name: '醃蘿蔔',
          portion: 20,
          category: 'vegetable',
          importance: 'low',
          reason: '小份量配菜'
        }
      ],
      componentPortionCorrections: [
        {
          componentId: 'comp_3',
          componentName: '炒高麗菜',
          identifiedPortion: 80,
          actualPortion: 100,
          reason: '份量估計偏低'
        }
      ],
      componentCategoryCorrections: [],
      componentNutritionCorrections: []
    },
    additionalComments: '遺漏了滷蛋這個重要成分'
  });

  console.log('反饋已提交:', {
    id: feedback.id,
    遺漏成分數: 2,
    份量修正數: 1
  });
  console.log('\n');
}

/**
 * 示例 3: 查詢成分反饋統計
 */
async function example3_GetComponentStats() {
  console.log('=== 示例 3: 查詢成分反饋統計 ===\n');

  const stats = await componentFeedbackCollector.getComponentFeedbackStats();

  console.log('成分反饋統計:');
  console.log(`- 總反饋數: ${stats.totalFeedbacks}`);
  console.log(`- 錯誤成分: ${stats.incorrectComponents}`);
  console.log(`- 遺漏成分: ${stats.missingComponents}`);
  console.log(`- 份量錯誤: ${stats.portionErrors}`);
  console.log(`- 類別錯誤: ${stats.categoryErrors}`);
  console.log(`- 營養錯誤: ${stats.nutritionErrors}`);
  console.log(`- 平均準確率: ${stats.averageComponentAccuracy.toFixed(2)}%`);

  console.log('\n最常見的錯誤:');
  stats.mostCommonMistakes.slice(0, 5).forEach((mistake, index) => {
    console.log(`${index + 1}. ${mistake.incorrectComponent} → ${mistake.correctComponent}`);
    console.log(`   頻率: ${mistake.frequency}次`);
    console.log(`   料理類型: ${mistake.dishTypes.join(', ')}`);
    console.log(`   平均信心度: ${(mistake.averageConfidence * 100).toFixed(1)}%`);
  });
  console.log('\n');
}

/**
 * 示例 4: 查詢特定成分的反饋歷史
 */
async function example4_GetComponentHistory() {
  console.log('=== 示例 4: 查詢雞蛋的反饋歷史 ===\n');

  const history = await componentFeedbackCollector.getComponentFeedbackHistory('雞蛋');

  console.log('雞蛋的反饋歷史:');
  console.log(`- 總提及次數: ${history.totalMentions}`);
  console.log(`- 錯誤識別次數: ${history.incorrectIdentifications}`);
  console.log(`- 遺漏次數: ${history.missingOccurrences}`);
  console.log(`- 份量問題: ${history.portionIssues}`);
  console.log(`- 平均信心度: ${(history.averageConfidence * 100).toFixed(1)}%`);

  console.log('\n常見錯誤:');
  history.commonMistakes.forEach(mistake => {
    console.log(`- ${mistake}`);
  });

  console.log('\n改進建議:');
  history.suggestions.forEach(suggestion => {
    console.log(`- ${suggestion}`);
  });
  console.log('\n');
}

/**
 * 示例 5: 查詢料理類型的成分識別準確率
 */
async function example5_GetDishTypeAccuracy() {
  console.log('=== 示例 5: 查詢炒飯類的成分識別準確率 ===\n');

  const accuracy = await componentFeedbackCollector.getDishTypeComponentAccuracy('fried_rice');

  console.log('炒飯類成分識別準確率:');
  console.log(`- 料理類型: ${accuracy.dishType}`);
  console.log(`- 總反饋數: ${accuracy.totalFeedbacks}`);
  console.log(`- 平均檢測成分數: ${accuracy.averageComponentsDetected.toFixed(1)}`);
  console.log(`- 平均遺漏成分數: ${accuracy.averageComponentsMissing.toFixed(1)}`);
  console.log(`- 平均錯誤成分數: ${accuracy.averageComponentsIncorrect.toFixed(1)}`);
  console.log(`- 準確率: ${accuracy.accuracyRate.toFixed(2)}%`);

  console.log('\n常見問題:');
  accuracy.commonIssues.forEach(issue => {
    console.log(`- ${issue}`);
  });
  console.log('\n');
}

/**
 * 示例 6: 提交複雜的成分反饋（包含多種修正類型）
 */
async function example6_SubmitComplexFeedback() {
  console.log('=== 示例 6: 提交複雜的成分反饋 ===\n');

  const recognitionResult: ComponentDetectionResult = {
    mainDish: {
      name: '味噌湯',
      type: DishType.SOUP,
      confidence: 0.91,
      estimatedTotalPortion: 300
    },
    components: [
      {
        id: 'comp_1',
        name: '味噌湯底',
        confidence: 0.95,
        estimatedPortion: 250,
        category: ComponentCategory.SAUCE,
        actualNutrition: {
          calories: 50,
          protein: 3,
          carbohydrates: 7,
          fat: 1
        }
      },
      {
        id: 'comp_2',
        name: '豆腐',
        confidence: 0.88,
        estimatedPortion: 30,
        category: ComponentCategory.PROTEIN,
        actualNutrition: {
          calories: 24,
          protein: 2.4,
          carbohydrates: 0.6,
          fat: 1.5
        }
      },
      {
        id: 'comp_3',
        name: '海帶',
        confidence: 0.72,
        estimatedPortion: 10,
        category: ComponentCategory.VEGETABLE,
        actualNutrition: {
          calories: 4,
          protein: 0.2,
          carbohydrates: 0.8,
          fat: 0.1
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 78,
        protein: 5.6,
        carbohydrates: 8.4,
        fat: 2.6
      },
      byComponent: [],
      byCategory: [],
      cookingImpact: []
    },
    metadata: {
      processingTime: 2800,
      confidenceScore: 0.85,
      detectionMethod: 'hybrid',
      componentsDetected: 3,
      componentsFromKB: 1,
      componentsFromVision: 2
    },
    suggestions: {
      possibleMissingComponents: ['青蔥'],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };

  const feedback = await componentFeedbackCollector.submitComponentFeedback({
    imageId: 'img_miso_soup_001',
    userId: 'user_123',
    sessionId: 'session_999',
    recognitionResult,
    componentCorrections: {
      correctComponents: [
        {
          id: 'comp_1',
          name: '味噌湯底',
          portion: 250
        }
      ],
      incorrectComponents: [],
      missingComponents: [
        {
          name: '青蔥',
          portion: 5,
          category: 'garnish',
          importance: 'low',
          reason: '表面撒有蔥花'
        }
      ],
      componentPortionCorrections: [
        {
          componentId: 'comp_2',
          componentName: '豆腐',
          identifiedPortion: 30,
          actualPortion: 50,
          reason: '豆腐塊比識別的大'
        },
        {
          componentId: 'comp_3',
          componentName: '海帶',
          identifiedPortion: 10,
          actualPortion: 15,
          reason: '海帶份量稍多'
        }
      ],
      componentCategoryCorrections: [
        {
          componentId: 'comp_3',
          componentName: '海帶',
          identifiedCategory: 'vegetable',
          actualCategory: 'garnish',
          reason: '海帶在味噌湯中通常作為配菜'
        }
      ],
      componentNutritionCorrections: [
        {
          componentId: 'comp_2',
          componentName: '豆腐',
          nutritionField: 'protein',
          identifiedValue: 2.4,
          actualValue: 4.0,
          reason: '豆腐份量增加，蛋白質應相應增加'
        }
      ]
    },
    additionalComments: '份量估計普遍偏低，需要改進'
  });

  console.log('複雜反饋已提交:', {
    id: feedback.id,
    反饋類型數: feedback.feedbackType.length,
    修正類型: feedback.feedbackType
  });
  console.log('\n');
}

/**
 * 執行所有示例
 */
async function runAllExamples() {
  try {
    await example1_SubmitFriedRiceFeedback();
    await example2_SubmitBentoFeedback();
    await example3_GetComponentStats();
    await example4_GetComponentHistory();
    await example5_GetDishTypeAccuracy();
    await example6_SubmitComplexFeedback();

    console.log('所有示例執行完成！');
  } catch (error) {
    console.error('執行示例時發生錯誤:', error);
  }
}

// 導出示例函數
export {
  example1_SubmitFriedRiceFeedback,
  example2_SubmitBentoFeedback,
  example3_GetComponentStats,
  example4_GetComponentHistory,
  example5_GetDishTypeAccuracy,
  example6_SubmitComplexFeedback,
  runAllExamples
};

// 如果直接執行此文件，運行所有示例
if (require.main === module) {
  runAllExamples();
}
