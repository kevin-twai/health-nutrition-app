/**
 * 麵食類成分識別範例
 * Noodle Dish Component Detection Examples
 * 
 * 此文件展示如何使用 ComponentDetectionEngine 識別麵食類料理的成分
 */

import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType } from '../types/ComponentDetection';
import * as fs from 'fs';

/**
 * 範例 1: 識別拉麵成分
 */
export async function detectRamenComponents() {
  console.log('=== 拉麵成分識別範例 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  // 假設我們有一張拉麵圖片
  const imagePath = './test-images/ramen.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 測試圖片不存在，使用模擬數據');
    return simulateRamenDetection();
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  const result = await engine.detectComponents(
    imageBuffer,
    '拉麵',
    DishType.NOODLES
  );
  
  console.log('✅ 識別完成！\n');
  console.log('料理資訊：');
  console.log(`  名稱: ${result.mainDish.name}`);
  console.log(`  類型: ${result.mainDish.type}`);
  console.log(`  信心度: ${(result.mainDish.confidence * 100).toFixed(1)}%`);
  console.log(`  總份量: ${result.mainDish.estimatedTotalPortion}g\n`);
  
  console.log('識別到的成分：');
  result.components.forEach((component, index) => {
    console.log(`\n${index + 1}. ${component.name}`);
    console.log(`   類別: ${component.category}`);
    console.log(`   份量: ${component.estimatedPortion}g`);
    console.log(`   信心度: ${(component.confidence * 100).toFixed(1)}%`);
    console.log(`   烹飪方式: ${component.cookingMethod || '未指定'}`);
    if (component.visualFeatures) {
      console.log(`   視覺特徵: ${component.visualFeatures.color?.join(', ')}`);
    }
  });
  
  console.log('\n營養摘要：');
  console.log(`  總熱量: ${result.nutritionSummary.total.calories.toFixed(0)} kcal`);
  console.log(`  蛋白質: ${result.nutritionSummary.total.protein.toFixed(1)}g`);
  console.log(`  碳水化合物: ${result.nutritionSummary.total.carbohydrates.toFixed(1)}g`);
  console.log(`  脂肪: ${result.nutritionSummary.total.fat.toFixed(1)}g`);
  
  return result;
}

/**
 * 範例 2: 識別烏龍麵成分
 */
export async function detectUdonComponents() {
  console.log('=== 烏龍麵成分識別範例 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  const imagePath = './test-images/udon.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 測試圖片不存在，使用模擬數據');
    return simulateUdonDetection();
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  const result = await engine.detectComponents(
    imageBuffer,
    '烏龍麵',
    DishType.NOODLES
  );
  
  console.log('✅ 識別完成！\n');
  console.log('料理資訊：');
  console.log(`  名稱: ${result.mainDish.name}`);
  console.log(`  類型: ${result.mainDish.type}`);
  console.log(`  信心度: ${(result.mainDish.confidence * 100).toFixed(1)}%\n`);
  
  console.log('識別到的成分：');
  result.components.forEach((component, index) => {
    console.log(`${index + 1}. ${component.name} - ${component.estimatedPortion}g`);
  });
  
  return result;
}

/**
 * 範例 3: 識別米粉成分
 */
export async function detectRiceNoodlesComponents() {
  console.log('=== 米粉成分識別範例 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  const imagePath = './test-images/rice-noodles.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 測試圖片不存在，使用模擬數據');
    return simulateRiceNoodlesDetection();
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  const result = await engine.detectComponents(
    imageBuffer,
    '米粉',
    DishType.NOODLES
  );
  
  console.log('✅ 識別完成！\n');
  console.log('料理資訊：');
  console.log(`  名稱: ${result.mainDish.name}`);
  console.log(`  類型: ${result.mainDish.type}\n`);
  
  console.log('識別到的成分：');
  result.components.forEach((component, index) => {
    console.log(`${index + 1}. ${component.name} - ${component.estimatedPortion}g (${component.category})`);
  });
  
  return result;
}

/**
 * 範例 4: 識別河粉成分
 */
export async function detectRiceSheetNoodlesComponents() {
  console.log('=== 河粉成分識別範例 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  const imagePath = './test-images/rice-sheet-noodles.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 測試圖片不存在，使用模擬數據');
    return simulateRiceSheetNoodlesDetection();
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  const result = await engine.detectComponents(
    imageBuffer,
    '河粉',
    DishType.NOODLES
  );
  
  console.log('✅ 識別完成！\n');
  console.log('料理資訊：');
  console.log(`  名稱: ${result.mainDish.name}`);
  console.log(`  類型: ${result.mainDish.type}\n`);
  
  console.log('識別到的成分：');
  result.components.forEach((component, index) => {
    console.log(`${index + 1}. ${component.name} - ${component.estimatedPortion}g`);
  });
  
  return result;
}

/**
 * 範例 5: 比較湯麵和乾麵的差異
 */
export async function compareSoupAndDryNoodles() {
  console.log('=== 湯麵 vs 乾麵比較 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  // 湯麵範例（拉麵）
  console.log('1. 湯麵（拉麵）：');
  const soupNoodles = await simulateRamenDetection();
  console.log(`   - 麵條: ${soupNoodles.components.find(c => c.category === 'grain')?.estimatedPortion}g`);
  console.log(`   - 湯底: ${soupNoodles.components.find(c => c.category === 'sauce')?.estimatedPortion}ml`);
  console.log(`   - 配料數量: ${soupNoodles.components.filter(c => c.category === 'protein' || c.category === 'vegetable').length}`);
  
  // 乾麵範例（炒麵）
  console.log('\n2. 乾麵（炒麵）：');
  const dryNoodles = await simulateFriedNoodlesDetection();
  console.log(`   - 麵條: ${dryNoodles.components.find(c => c.category === 'grain')?.estimatedPortion}g`);
  console.log(`   - 無湯底`);
  console.log(`   - 配料數量: ${dryNoodles.components.filter(c => c.category === 'protein' || c.category === 'vegetable').length}`);
  
  console.log('\n主要差異：');
  console.log('  - 湯麵包含湯底（200-400ml）');
  console.log('  - 乾麵通常用油炒製，熱量較高');
  console.log('  - 湯麵配料較多樣化');
  console.log('  - 乾麵配料與麵條混合');
}

// ==================== 模擬數據函數 ====================

function simulateRamenDetection() {
  return {
    mainDish: {
      name: '拉麵',
      type: DishType.NOODLES,
      confidence: 0.95,
      estimatedTotalPortion: 600
    },
    components: [
      {
        id: '1',
        name: '拉麵',
        confidence: 0.98,
        estimatedPortion: 150,
        category: 'grain' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['淡黃色'],
          shape: '細長條狀',
          texture: '有彈性',
          position: '碗中'
        }
      },
      {
        id: '2',
        name: '叉燒',
        confidence: 0.92,
        estimatedPortion: 50,
        category: 'protein' as const,
        cookingMethod: 'braised' as const,
        visualFeatures: {
          color: ['深褐色', '紅褐色'],
          shape: '薄片狀',
          texture: '軟嫩',
          position: '麵上'
        }
      },
      {
        id: '3',
        name: '溏心蛋',
        confidence: 0.95,
        estimatedPortion: 50,
        category: 'protein' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['白色', '黃色'],
          shape: '半圓形',
          texture: '軟嫩',
          position: '麵上'
        }
      },
      {
        id: '4',
        name: '筍乾',
        confidence: 0.88,
        estimatedPortion: 20,
        category: 'vegetable' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['淡黃色'],
          shape: '條狀',
          texture: '脆嫩',
          position: '麵上'
        }
      },
      {
        id: '5',
        name: '青蔥',
        confidence: 0.90,
        estimatedPortion: 10,
        category: 'garnish' as const,
        cookingMethod: 'raw' as const,
        visualFeatures: {
          color: ['綠色'],
          shape: '細條狀',
          texture: '脆',
          position: '表面'
        }
      },
      {
        id: '6',
        name: '海苔',
        confidence: 0.85,
        estimatedPortion: 2,
        category: 'garnish' as const,
        cookingMethod: 'raw' as const,
        visualFeatures: {
          color: ['深綠色', '黑色'],
          shape: '薄片',
          texture: '脆',
          position: '表面'
        }
      },
      {
        id: '7',
        name: '豚骨湯',
        confidence: 0.90,
        estimatedPortion: 300,
        category: 'sauce' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['乳白色'],
          shape: '液體',
          texture: '濃稠',
          position: '碗中'
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 650,
        protein: 35,
        carbs: 75,
        fat: 22,
        fiber: 4,
        sodium: 1800
      },
      byComponent: [],
      byCategory: []
    },
    metadata: {
      processingTime: 2500,
      confidenceScore: 0.91,
      detectionMethod: 'hybrid' as const,
      componentsDetected: 7,
      componentsFromKB: 2,
      componentsFromVision: 5
    },
    suggestions: {
      possibleMissingComponents: [],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };
}

function simulateUdonDetection() {
  return {
    mainDish: {
      name: '烏龍麵',
      type: DishType.NOODLES,
      confidence: 0.93,
      estimatedTotalPortion: 550
    },
    components: [
      {
        id: '1',
        name: '烏龍麵',
        confidence: 0.96,
        estimatedPortion: 200,
        category: 'grain' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['白色'],
          shape: '粗條狀',
          texture: 'Q彈',
          position: '碗中'
        }
      },
      {
        id: '2',
        name: '天婦羅',
        confidence: 0.90,
        estimatedPortion: 60,
        category: 'protein' as const,
        cookingMethod: 'deep_fried' as const,
        visualFeatures: {
          color: ['金黃色'],
          shape: '不規則',
          texture: '酥脆',
          position: '麵上'
        }
      },
      {
        id: '3',
        name: '青蔥',
        confidence: 0.88,
        estimatedPortion: 10,
        category: 'garnish' as const,
        cookingMethod: 'raw' as const,
        visualFeatures: {
          color: ['綠色'],
          shape: '細條狀',
          texture: '脆',
          position: '表面'
        }
      },
      {
        id: '4',
        name: '魚板',
        confidence: 0.85,
        estimatedPortion: 30,
        category: 'protein' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['白色', '粉紅色'],
          shape: '圓片狀',
          texture: '彈性',
          position: '湯中'
        }
      },
      {
        id: '5',
        name: '柴魚高湯',
        confidence: 0.92,
        estimatedPortion: 300,
        category: 'sauce' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['淡褐色'],
          shape: '液體',
          texture: '清澈',
          position: '碗中'
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 520,
        protein: 22,
        carbs: 85,
        fat: 12,
        fiber: 3,
        sodium: 1200
      },
      byComponent: [],
      byCategory: []
    },
    metadata: {
      processingTime: 2300,
      confidenceScore: 0.90,
      detectionMethod: 'hybrid' as const,
      componentsDetected: 5,
      componentsFromKB: 1,
      componentsFromVision: 4
    },
    suggestions: {
      possibleMissingComponents: ['油豆腐'],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };
}

function simulateRiceNoodlesDetection() {
  return {
    mainDish: {
      name: '米粉',
      type: DishType.NOODLES,
      confidence: 0.91,
      estimatedTotalPortion: 400
    },
    components: [
      {
        id: '1',
        name: '米粉',
        confidence: 0.94,
        estimatedPortion: 120,
        category: 'grain' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['白色'],
          shape: '細條狀',
          texture: '軟滑',
          position: '碗中'
        }
      },
      {
        id: '2',
        name: '豬肉絲',
        confidence: 0.87,
        estimatedPortion: 40,
        category: 'protein' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['淡粉色'],
          shape: '絲狀',
          texture: '軟嫩',
          position: '麵上'
        }
      },
      {
        id: '3',
        name: '香菇',
        confidence: 0.85,
        estimatedPortion: 20,
        category: 'vegetable' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['深褐色'],
          shape: '片狀',
          texture: '軟',
          position: '湯中'
        }
      },
      {
        id: '4',
        name: '高麗菜',
        confidence: 0.88,
        estimatedPortion: 40,
        category: 'vegetable' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['淡綠色'],
          shape: '片狀',
          texture: '軟',
          position: '湯中'
        }
      },
      {
        id: '5',
        name: '芹菜',
        confidence: 0.82,
        estimatedPortion: 10,
        category: 'garnish' as const,
        cookingMethod: 'raw' as const,
        visualFeatures: {
          color: ['綠色'],
          shape: '細條狀',
          texture: '脆',
          position: '表面'
        }
      },
      {
        id: '6',
        name: '清湯',
        confidence: 0.90,
        estimatedPortion: 250,
        category: 'sauce' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['淡黃色'],
          shape: '液體',
          texture: '清澈',
          position: '碗中'
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 380,
        protein: 18,
        carbs: 62,
        fat: 8,
        fiber: 3,
        sodium: 900
      },
      byComponent: [],
      byCategory: []
    },
    metadata: {
      processingTime: 2200,
      confidenceScore: 0.88,
      detectionMethod: 'hybrid' as const,
      componentsDetected: 6,
      componentsFromKB: 2,
      componentsFromVision: 4
    },
    suggestions: {
      possibleMissingComponents: ['蝦米', '油蔥酥'],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };
}

function simulateRiceSheetNoodlesDetection() {
  return {
    mainDish: {
      name: '河粉',
      type: DishType.NOODLES,
      confidence: 0.92,
      estimatedTotalPortion: 600
    },
    components: [
      {
        id: '1',
        name: '河粉',
        confidence: 0.95,
        estimatedPortion: 200,
        category: 'grain' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['白色'],
          shape: '寬扁條狀',
          texture: '滑嫩',
          position: '碗中'
        }
      },
      {
        id: '2',
        name: '牛肉片',
        confidence: 0.90,
        estimatedPortion: 80,
        category: 'protein' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['深褐色'],
          shape: '薄片狀',
          texture: '軟嫩',
          position: '麵上'
        }
      },
      {
        id: '3',
        name: '豆芽菜',
        confidence: 0.88,
        estimatedPortion: 40,
        category: 'vegetable' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['白色'],
          shape: '細長',
          texture: '脆',
          position: '湯中'
        }
      },
      {
        id: '4',
        name: '青蔥',
        confidence: 0.85,
        estimatedPortion: 10,
        category: 'garnish' as const,
        cookingMethod: 'raw' as const,
        visualFeatures: {
          color: ['綠色'],
          shape: '細條狀',
          texture: '脆',
          position: '表面'
        }
      },
      {
        id: '5',
        name: '香菜',
        confidence: 0.83,
        estimatedPortion: 5,
        category: 'garnish' as const,
        cookingMethod: 'raw' as const,
        visualFeatures: {
          color: ['綠色'],
          shape: '葉狀',
          texture: '軟',
          position: '表面'
        }
      },
      {
        id: '6',
        name: '牛骨湯',
        confidence: 0.91,
        estimatedPortion: 300,
        category: 'sauce' as const,
        cookingMethod: 'boiled' as const,
        visualFeatures: {
          color: ['深褐色'],
          shape: '液體',
          texture: '濃郁',
          position: '碗中'
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 580,
        protein: 32,
        carbs: 70,
        fat: 18,
        fiber: 3,
        sodium: 1400
      },
      byComponent: [],
      byCategory: []
    },
    metadata: {
      processingTime: 2400,
      confidenceScore: 0.89,
      detectionMethod: 'hybrid' as const,
      componentsDetected: 6,
      componentsFromKB: 1,
      componentsFromVision: 5
    },
    suggestions: {
      possibleMissingComponents: ['牛肚', '牛筋'],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };
}

function simulateFriedNoodlesDetection() {
  return {
    mainDish: {
      name: '炒麵',
      type: DishType.STIR_FRY,
      confidence: 0.93,
      estimatedTotalPortion: 350
    },
    components: [
      {
        id: '1',
        name: '麵條',
        confidence: 0.96,
        estimatedPortion: 180,
        category: 'grain' as const,
        cookingMethod: 'stir_fried' as const,
        visualFeatures: {
          color: ['深黃色'],
          shape: '條狀',
          texture: 'Q彈',
          position: '混合'
        }
      },
      {
        id: '2',
        name: '高麗菜',
        confidence: 0.88,
        estimatedPortion: 60,
        category: 'vegetable' as const,
        cookingMethod: 'stir_fried' as const,
        visualFeatures: {
          color: ['綠色'],
          shape: '片狀',
          texture: '軟',
          position: '混合'
        }
      },
      {
        id: '3',
        name: '豬肉絲',
        confidence: 0.85,
        estimatedPortion: 50,
        category: 'protein' as const,
        cookingMethod: 'stir_fried' as const,
        visualFeatures: {
          color: ['褐色'],
          shape: '絲狀',
          texture: '軟嫩',
          position: '混合'
        }
      },
      {
        id: '4',
        name: '青蔥',
        confidence: 0.82,
        estimatedPortion: 10,
        category: 'garnish' as const,
        cookingMethod: 'stir_fried' as const,
        visualFeatures: {
          color: ['綠色'],
          shape: '段狀',
          texture: '軟',
          position: '混合'
        }
      }
    ],
    nutritionSummary: {
      total: {
        calories: 520,
        protein: 24,
        carbs: 68,
        fat: 18,
        fiber: 4,
        sodium: 1100
      },
      byComponent: [],
      byCategory: []
    },
    metadata: {
      processingTime: 2100,
      confidenceScore: 0.88,
      detectionMethod: 'hybrid' as const,
      componentsDetected: 4,
      componentsFromKB: 1,
      componentsFromVision: 3
    },
    suggestions: {
      possibleMissingComponents: ['豆芽菜', '紅蘿蔔'],
      portionAdjustments: [],
      alternativeInterpretations: []
    }
  };
}

// 執行範例
if (require.main === module) {
  (async () => {
    try {
      console.log('🍜 麵食類成分識別範例\n');
      console.log('='.repeat(60));
      
      await detectRamenComponents();
      console.log('\n' + '='.repeat(60) + '\n');
      
      await detectUdonComponents();
      console.log('\n' + '='.repeat(60) + '\n');
      
      await detectRiceNoodlesComponents();
      console.log('\n' + '='.repeat(60) + '\n');
      
      await detectRiceSheetNoodlesComponents();
      console.log('\n' + '='.repeat(60) + '\n');
      
      await compareSoupAndDryNoodles();
      console.log('\n' + '='.repeat(60));
      
      console.log('\n✅ 所有範例執行完成！');
    } catch (error) {
      console.error('❌ 執行錯誤:', error);
      process.exit(1);
    }
  })();
}
