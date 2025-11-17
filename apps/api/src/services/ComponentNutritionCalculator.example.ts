/**
 * ComponentNutritionCalculator 使用範例
 * 
 * 此文件展示如何使用 ComponentNutritionCalculator 服務
 */

import { componentNutritionCalculator } from './ComponentNutritionCalculator';
import {
  DetectedComponent,
  EnrichedComponent,
  CookingMethod,
  ComponentCategory,
  NutritionData
} from '../types/ComponentDetection';

/**
 * 範例 1：計算單個成分的營養
 */
async function example1_calculateSingleComponent() {
  console.log('=== 範例 1：計算單個成分的營養 ===\n');

  const component: DetectedComponent = {
    id: 'comp-1',
    name: '雞蛋',
    confidence: 0.9,
    estimatedPortion: 50, // 50克（約1顆蛋）
    cookingMethod: CookingMethod.STIR_FRIED,
    category: ComponentCategory.PROTEIN,
    nutritionPer100g: {
      calories: 143,
      protein: 12.6,
      carbohydrates: 0.7,
      fat: 9.5,
      fiber: 0,
      sodium: 124
    }
  };

  const nutrition = await componentNutritionCalculator.calculateComponentNutrition(
    component,
    CookingMethod.STIR_FRIED
  );

  console.log('成分：', component.name);
  console.log('份量：', component.estimatedPortion, 'g');
  console.log('烹飪方式：快炒');
  console.log('\n營養成分：');
  console.log('- 熱量：', nutrition.calories, 'kcal');
  console.log('- 蛋白質：', nutrition.protein, 'g');
  console.log('- 碳水化合物：', nutrition.carbohydrates, 'g');
  console.log('- 脂肪：', nutrition.fat, 'g');
  console.log('- 鈉：', nutrition.sodium, 'mg');
  console.log('\n');
}

/**
 * 範例 2：比較不同烹飪方式的營養影響
 */
function example2_compareCookingMethods() {
  console.log('=== 範例 2：比較不同烹飪方式的營養影響 ===\n');

  const baseNutrition: NutritionData = {
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    fiber: 0,
    sodium: 74
  };

  console.log('食材：雞胸肉（每100g）');
  console.log('原始營養：', baseNutrition.calories, 'kcal,', baseNutrition.fat, 'g 脂肪\n');

  // 蒸
  const steamed = componentNutritionCalculator.applyCookingEffects(
    baseNutrition,
    CookingMethod.STEAMED,
    ComponentCategory.PROTEIN
  );
  console.log('蒸製：', steamed.calories, 'kcal,', steamed.fat, 'g 脂肪');

  // 烤
  const grilled = componentNutritionCalculator.applyCookingEffects(
    baseNutrition,
    CookingMethod.GRILLED,
    ComponentCategory.PROTEIN
  );
  console.log('燒烤：', grilled.calories, 'kcal,', grilled.fat, 'g 脂肪');

  // 炒
  const stirFried = componentNutritionCalculator.applyCookingEffects(
    baseNutrition,
    CookingMethod.STIR_FRIED,
    ComponentCategory.PROTEIN
  );
  console.log('快炒：', stirFried.calories, 'kcal,', stirFried.fat, 'g 脂肪');

  // 炸
  const deepFried = componentNutritionCalculator.applyCookingEffects(
    baseNutrition,
    CookingMethod.DEEP_FRIED,
    ComponentCategory.PROTEIN
  );
  console.log('油炸：', deepFried.calories, 'kcal,', deepFried.fat, 'g 脂肪');

  console.log('\n結論：蒸製最健康，油炸熱量和脂肪最高\n');
}

/**
 * 範例 3：聚合整道料理的營養（蛋炒飯）
 */
async function example3_aggregateDishNutrition() {
  console.log('=== 範例 3：聚合整道料理的營養（蛋炒飯） ===\n');

  const components: EnrichedComponent[] = [
    {
      id: 'comp-1',
      name: '白飯',
      confidence: 0.95,
      estimatedPortion: 200,
      cookingMethod: CookingMethod.STIR_FRIED,
      category: ComponentCategory.GRAIN,
      nutritionPer100g: {
        calories: 130,
        protein: 2.7,
        carbohydrates: 28.7,
        fat: 0.3,
        fiber: 0.4,
        sodium: 1
      }
    },
    {
      id: 'comp-2',
      name: '雞蛋',
      confidence: 0.9,
      estimatedPortion: 50,
      cookingMethod: CookingMethod.STIR_FRIED,
      category: ComponentCategory.PROTEIN,
      nutritionPer100g: {
        calories: 143,
        protein: 12.6,
        carbohydrates: 0.7,
        fat: 9.5,
        fiber: 0,
        sodium: 124
      }
    },
    {
      id: 'comp-3',
      name: '青蔥',
      confidence: 0.85,
      estimatedPortion: 10,
      cookingMethod: CookingMethod.STIR_FRIED,
      category: ComponentCategory.GARNISH,
      nutritionPer100g: {
        calories: 32,
        protein: 1.8,
        carbohydrates: 7.3,
        fat: 0.2,
        fiber: 2.6,
        sodium: 16
      }
    },
    {
      id: 'comp-4',
      name: '火腿',
      confidence: 0.8,
      estimatedPortion: 30,
      cookingMethod: CookingMethod.STIR_FRIED,
      category: ComponentCategory.PROTEIN,
      nutritionPer100g: {
        calories: 145,
        protein: 18.5,
        carbohydrates: 1.5,
        fat: 7.2,
        fiber: 0,
        sodium: 1200
      }
    }
  ];

  const summary = await componentNutritionCalculator.aggregateDishNutrition(components);

  console.log('料理：蛋炒飯');
  console.log('總份量：', components.reduce((sum, c) => sum + c.estimatedPortion, 0), 'g\n');

  console.log('總營養成分：');
  console.log('- 熱量：', summary.total.calories, 'kcal');
  console.log('- 蛋白質：', summary.total.protein, 'g');
  console.log('- 碳水化合物：', summary.total.carbohydrates, 'g');
  console.log('- 脂肪：', summary.total.fat, 'g');
  console.log('- 纖維：', summary.total.fiber, 'g');
  console.log('- 鈉：', summary.total.sodium, 'mg\n');

  console.log('各成分營養佔比：');
  summary.byComponent.forEach(comp => {
    console.log(`\n${comp.component.name} (${comp.component.estimatedPortion}g):`);
    console.log('  - 熱量佔比：', comp.percentageOfTotal.calories.toFixed(1), '%');
    console.log('  - 蛋白質佔比：', comp.percentageOfTotal.protein.toFixed(1), '%');
    console.log('  - 碳水佔比：', comp.percentageOfTotal.carbs.toFixed(1), '%');
    console.log('  - 脂肪佔比：', comp.percentageOfTotal.fat.toFixed(1), '%');
  });

  console.log('\n按類別分組：');
  summary.byCategory.forEach(cat => {
    console.log(`\n${cat.category}類 (${cat.percentageOfDish.toFixed(1)}% 份量):`);
    console.log('  - 成分：', cat.components.join('、'));
    console.log('  - 熱量：', cat.totalNutrition.calories, 'kcal');
    console.log('  - 蛋白質：', cat.totalNutrition.protein, 'g');
  });

  console.log('\n烹飪方式影響：');
  summary.cookingImpact.forEach(impact => {
    console.log(`\n${impact.method}:`);
    console.log('  - 增加熱量：', impact.caloriesAdded, 'kcal');
    console.log('  - 增加脂肪：', impact.fatAdded, 'g');
    console.log('  - 說明：', impact.notes);
  });

  console.log('\n');
}

/**
 * 範例 4：獲取營養建議
 */
async function example4_getNutritionAdvice() {
  console.log('=== 範例 4：獲取營養建議 ===\n');

  // 高熱量料理
  const highCalorieComponents: EnrichedComponent[] = [
    {
      id: 'comp-1',
      name: '炸雞',
      confidence: 0.9,
      estimatedPortion: 200,
      cookingMethod: CookingMethod.DEEP_FRIED,
      category: ComponentCategory.PROTEIN,
      nutritionPer100g: {
        calories: 250,
        protein: 20,
        carbohydrates: 10,
        fat: 15,
        fiber: 0,
        sodium: 500
      }
    }
  ];

  const summary1 = await componentNutritionCalculator.aggregateDishNutrition(highCalorieComponents);
  const advice1 = componentNutritionCalculator.getNutritionAdvice(summary1);

  console.log('料理：炸雞 (200g)');
  console.log('總熱量：', summary1.total.calories, 'kcal');
  console.log('總脂肪：', summary1.total.fat, 'g');
  console.log('\n營養建議：');
  advice1.forEach(a => console.log('- ' + a));

  console.log('\n---\n');

  // 低蛋白質料理
  const lowProteinComponents: EnrichedComponent[] = [
    {
      id: 'comp-1',
      name: '白飯',
      confidence: 0.95,
      estimatedPortion: 200,
      cookingMethod: CookingMethod.STEAMED,
      category: ComponentCategory.GRAIN,
      nutritionPer100g: {
        calories: 130,
        protein: 2.7,
        carbohydrates: 28.7,
        fat: 0.3,
        fiber: 0.4,
        sodium: 1
      }
    }
  ];

  const summary2 = await componentNutritionCalculator.aggregateDishNutrition(lowProteinComponents);
  const advice2 = componentNutritionCalculator.getNutritionAdvice(summary2);

  console.log('料理：白飯 (200g)');
  console.log('總熱量：', summary2.total.calories, 'kcal');
  console.log('總蛋白質：', summary2.total.protein, 'g');
  console.log('\n營養建議：');
  advice2.forEach(a => console.log('- ' + a));

  console.log('\n');
}

/**
 * 範例 5：計算成分的健康評分
 */
function example5_getHealthScore() {
  console.log('=== 範例 5：計算成分的健康評分 ===\n');

  const components: EnrichedComponent[] = [
    {
      id: 'comp-1',
      name: '青江菜',
      confidence: 0.9,
      estimatedPortion: 80,
      cookingMethod: CookingMethod.STEAMED,
      category: ComponentCategory.VEGETABLE,
      nutritionPer100g: {
        calories: 13,
        protein: 1.5,
        carbohydrates: 2.2,
        fat: 0.2,
        fiber: 1.0,
        sodium: 65
      }
    },
    {
      id: 'comp-2',
      name: '炸雞',
      confidence: 0.9,
      estimatedPortion: 150,
      cookingMethod: CookingMethod.DEEP_FRIED,
      category: ComponentCategory.PROTEIN,
      nutritionPer100g: {
        calories: 250,
        protein: 20,
        carbohydrates: 10,
        fat: 15,
        fiber: 0,
        sodium: 500
      }
    },
    {
      id: 'comp-3',
      name: '地瓜葉',
      confidence: 0.9,
      estimatedPortion: 100,
      cookingMethod: CookingMethod.STIR_FRIED,
      category: ComponentCategory.VEGETABLE,
      nutritionPer100g: {
        calories: 30,
        protein: 3.0,
        carbohydrates: 5.4,
        fat: 0.3,
        fiber: 3.3,
        sodium: 6
      }
    },
    {
      id: 'comp-4',
      name: '白飯',
      confidence: 0.95,
      estimatedPortion: 150,
      cookingMethod: CookingMethod.STEAMED,
      category: ComponentCategory.GRAIN,
      nutritionPer100g: {
        calories: 130,
        protein: 2.7,
        carbohydrates: 28.7,
        fat: 0.3,
        fiber: 0.4,
        sodium: 1
      }
    }
  ];

  console.log('成分健康評分（1-10分，分數越高越健康）：\n');

  components.forEach(component => {
    const score = componentNutritionCalculator.getComponentHealthScore(component);
    const stars = '★'.repeat(Math.round(score)) + '☆'.repeat(10 - Math.round(score));
    
    console.log(`${component.name}：${score.toFixed(1)} 分 ${stars}`);
    console.log(`  類別：${component.category}`);
    console.log(`  烹飪方式：${component.cookingMethod}`);
    console.log('');
  });
}

/**
 * 範例 6：台式便當營養分析
 */
async function example6_taiwaneseBento() {
  console.log('=== 範例 6：台式便當營養分析 ===\n');

  const bentoComponents: EnrichedComponent[] = [
    // 主食
    {
      id: 'comp-1',
      name: '白飯',
      confidence: 0.95,
      estimatedPortion: 200,
      cookingMethod: CookingMethod.STEAMED,
      category: ComponentCategory.GRAIN,
      nutritionPer100g: {
        calories: 130,
        protein: 2.7,
        carbohydrates: 28.7,
        fat: 0.3,
        fiber: 0.4,
        sodium: 1
      }
    },
    // 主菜
    {
      id: 'comp-2',
      name: '滷雞腿',
      confidence: 0.9,
      estimatedPortion: 120,
      cookingMethod: CookingMethod.BRAISED,
      category: ComponentCategory.PROTEIN,
      nutritionPer100g: {
        calories: 200,
        protein: 18,
        carbohydrates: 5,
        fat: 12,
        fiber: 0,
        sodium: 800
      }
    },
    // 配菜1
    {
      id: 'comp-3',
      name: '炒高麗菜',
      confidence: 0.85,
      estimatedPortion: 60,
      cookingMethod: CookingMethod.STIR_FRIED,
      category: ComponentCategory.VEGETABLE,
      nutritionPer100g: {
        calories: 25,
        protein: 1.3,
        carbohydrates: 5.8,
        fat: 0.1,
        fiber: 2.5,
        sodium: 18
      }
    },
    // 配菜2
    {
      id: 'comp-4',
      name: '滷蛋',
      confidence: 0.9,
      estimatedPortion: 50,
      cookingMethod: CookingMethod.BRAISED,
      category: ComponentCategory.PROTEIN,
      nutritionPer100g: {
        calories: 155,
        protein: 13,
        carbohydrates: 1,
        fat: 11,
        fiber: 0,
        sodium: 600
      }
    },
    // 配菜3
    {
      id: 'comp-5',
      name: '豆干',
      confidence: 0.85,
      estimatedPortion: 40,
      cookingMethod: CookingMethod.BRAISED,
      category: ComponentCategory.PROTEIN,
      nutritionPer100g: {
        calories: 140,
        protein: 16,
        carbohydrates: 4,
        fat: 7,
        fiber: 1,
        sodium: 500
      }
    }
  ];

  const summary = await componentNutritionCalculator.aggregateDishNutrition(bentoComponents);
  const advice = componentNutritionCalculator.getNutritionAdvice(summary);

  console.log('料理：台式便當');
  console.log('總份量：', bentoComponents.reduce((sum, c) => sum + c.estimatedPortion, 0), 'g\n');

  console.log('營養成分總覽：');
  console.log('┌─────────────┬──────────┐');
  console.log('│ 營養素      │ 含量     │');
  console.log('├─────────────┼──────────┤');
  console.log(`│ 熱量        │ ${summary.total.calories.toString().padEnd(8)} │`);
  console.log(`│ 蛋白質      │ ${summary.total.protein.toFixed(1).padEnd(8)} │`);
  console.log(`│ 碳水化合物  │ ${summary.total.carbohydrates.toFixed(1).padEnd(8)} │`);
  console.log(`│ 脂肪        │ ${summary.total.fat.toFixed(1).padEnd(8)} │`);
  console.log(`│ 纖維        │ ${(summary.total.fiber || 0).toFixed(1).padEnd(8)} │`);
  console.log(`│ 鈉          │ ${(summary.total.sodium || 0).toFixed(0).padEnd(8)} │`);
  console.log('└─────────────┴──────────┘\n');

  console.log('成分組成：');
  summary.byCategory.forEach(cat => {
    console.log(`\n${cat.category}類 (${cat.percentageOfDish.toFixed(1)}%):`);
    console.log('  成分：', cat.components.join('、'));
    console.log('  熱量：', cat.totalNutrition.calories, 'kcal');
  });

  console.log('\n營養建議：');
  advice.forEach(a => console.log('• ' + a));

  console.log('\n');
}

/**
 * 執行所有範例
 */
async function runAllExamples() {
  try {
    await example1_calculateSingleComponent();
    example2_compareCookingMethods();
    await example3_aggregateDishNutrition();
    await example4_getNutritionAdvice();
    example5_getHealthScore();
    await example6_taiwaneseBento();

    console.log('所有範例執行完成！');
  } catch (error) {
    console.error('執行範例時發生錯誤：', error);
  }
}

// 如果直接執行此文件，則運行所有範例
if (require.main === module) {
  runAllExamples();
}

// 導出範例函數供其他地方使用
export {
  example1_calculateSingleComponent,
  example2_compareCookingMethods,
  example3_aggregateDishNutrition,
  example4_getNutritionAdvice,
  example5_getHealthScore,
  example6_taiwaneseBento
};
