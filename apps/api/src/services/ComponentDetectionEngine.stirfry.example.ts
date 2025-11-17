/**
 * 炒菜類成分識別示例
 * Stir-Fry Component Detection Examples
 * 
 * 此文件展示如何使用 ComponentDetectionEngine 識別炒菜類料理的成分
 */

import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType } from '../types/ComponentDetection';
import * as fs from 'fs';

/**
 * 示例 1：識別炒麵的成分
 */
async function example1_StirFriedNoodles() {
  console.log('\n=== 示例 1：炒麵成分識別 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  // 讀取炒麵圖片
  const imagePath = './test-images/stir-fried-noodles.jpg';
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 圖片不存在，跳過示例');
    return;
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  // 檢測成分
  const result = await engine.detectComponents(
    imageBuffer,
    '炒麵',
    DishType.STIR_FRY
  );
  
  console.log('料理名稱:', result.mainDish.name);
  console.log('料理類型:', result.mainDish.type);
  console.log('信心度:', (result.mainDish.confidence * 100).toFixed(1) + '%');
  console.log('\n識別到的成分:');
  
  result.components.forEach((comp, index) => {
    console.log(`\n${index + 1}. ${comp.name} (${comp.nameEn || 'N/A'})`);
    console.log(`   類別: ${comp.category}`);
    console.log(`   份量: ${comp.estimatedPortion}g`);
    console.log(`   烹飪方式: ${comp.cookingMethod}`);
    console.log(`   信心度: ${(comp.confidence * 100).toFixed(1)}%`);
    
    if (comp.visualFeatures) {
      console.log(`   視覺特徵:`);
      console.log(`     - 顏色: ${comp.visualFeatures.color.join(', ')}`);
      console.log(`     - 形狀: ${comp.visualFeatures.shape}`);
      console.log(`     - 質地: ${comp.visualFeatures.texture}`);
    }
  });
  
  console.log('\n建議:');
  if (result.suggestions.possibleMissingComponents.length > 0) {
    console.log('  可能缺失的成分:');
    result.suggestions.possibleMissingComponents.forEach(comp => {
      console.log(`    - ${comp}`);
    });
  }
  if (result.suggestions.portionAdjustments.length > 0) {
    console.log('  份量調整建議:');
    result.suggestions.portionAdjustments.forEach(adj => {
      console.log(`    - ${adj.component}: ${adj.suggestedPortion}g (${adj.reason})`);
    });
  }
  
  console.log('\n處理時間:', result.metadata.processingTime + 'ms');
  console.log('整體信心度:', (result.metadata.confidenceScore * 100).toFixed(1) + '%');
}

/**
 * 示例 2：識別炒青菜的成分
 */
async function example2_StirFriedVegetables() {
  console.log('\n=== 示例 2：炒青菜成分識別 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  const imagePath = './test-images/stir-fried-vegetables.jpg';
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 圖片不存在，跳過示例');
    return;
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  const result = await engine.detectComponents(
    imageBuffer,
    '炒青菜',
    DishType.STIR_FRY
  );
  
  console.log('料理名稱:', result.mainDish.name);
  console.log('總份量:', result.mainDish.estimatedTotalPortion + 'g');
  
  // 按類別分組顯示
  const byCategory = result.components.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof result.components>);
  
  console.log('\n按類別分組:');
  Object.entries(byCategory).forEach(([category, components]) => {
    console.log(`\n${category}:`);
    components.forEach(comp => {
      console.log(`  - ${comp.name}: ${comp.estimatedPortion}g`);
    });
  });
}

/**
 * 示例 3：識別宮保雞丁的成分
 */
async function example3_KungPaoChicken() {
  console.log('\n=== 示例 3：宮保雞丁成分識別 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  const imagePath = './test-images/kung-pao-chicken.jpg';
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 圖片不存在，跳過示例');
    return;
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  const result = await engine.detectComponents(
    imageBuffer,
    '宮保雞丁',
    DishType.STIR_FRY
  );
  
  console.log('料理名稱:', result.mainDish.name);
  
  // 檢查特色成分
  const hasChicken = result.components.find(c => c.name.includes('雞'));
  const hasPeanuts = result.components.find(c => c.name.includes('花生'));
  const hasChili = result.components.find(c => c.name.includes('辣椒'));
  
  console.log('\n特色成分檢查:');
  console.log('✓ 雞肉:', hasChicken ? `${hasChicken.estimatedPortion}g` : '未識別');
  console.log('✓ 花生:', hasPeanuts ? `${hasPeanuts.estimatedPortion}g` : '未識別');
  console.log('✓ 辣椒:', hasChili ? `${hasChili.estimatedPortion}g` : '未識別');
  
  // 顯示混合成分
  console.log('\n所有混合成分:');
  result.components.forEach(comp => {
    const type = (comp as any).componentType || 'unknown';
    console.log(`  - ${comp.name} (${type}): ${comp.estimatedPortion}g`);
  });
}

/**
 * 示例 4：比較不同炒菜的成分差異
 */
async function example4_CompareStirFries() {
  console.log('\n=== 示例 4：比較不同炒菜 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  const dishes = [
    { name: '炒麵', image: './test-images/stir-fried-noodles.jpg' },
    { name: '炒青菜', image: './test-images/stir-fried-vegetables.jpg' },
    { name: '宮保雞丁', image: './test-images/kung-pao-chicken.jpg' }
  ];
  
  for (const dish of dishes) {
    if (!fs.existsSync(dish.image)) {
      console.log(`⚠️ ${dish.name} 圖片不存在，跳過`);
      continue;
    }
    
    const imageBuffer = fs.readFileSync(dish.image);
    const result = await engine.detectComponents(
      imageBuffer,
      dish.name,
      DishType.STIR_FRY
    );
    
    console.log(`\n${dish.name}:`);
    console.log(`  成分數量: ${result.components.length}`);
    console.log(`  總份量: ${result.mainDish.estimatedTotalPortion}g`);
    console.log(`  信心度: ${(result.metadata.confidenceScore * 100).toFixed(1)}%`);
    
    // 計算各類別份量
    const proteinTotal = result.components
      .filter(c => c.category === 'protein')
      .reduce((sum, c) => sum + c.estimatedPortion, 0);
    
    const vegetableTotal = result.components
      .filter(c => c.category === 'vegetable')
      .reduce((sum, c) => sum + c.estimatedPortion, 0);
    
    console.log(`  蛋白質: ${proteinTotal}g`);
    console.log(`  蔬菜: ${vegetableTotal}g`);
  }
}

/**
 * 示例 5：處理混合成分的識別
 */
async function example5_MixedComponents() {
  console.log('\n=== 示例 5：混合成分識別 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  const imagePath = './test-images/stir-fried-noodles.jpg';
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 圖片不存在，跳過示例');
    return;
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  
  const result = await engine.detectComponents(
    imageBuffer,
    '炒麵',
    DishType.STIR_FRY
  );
  
  console.log('混合成分分析:');
  console.log(`總成分數: ${result.components.length}`);
  
  // 分析成分的混合程度
  const mainComponents = result.components.filter(c => 
    (c as any).componentType === 'main'
  );
  const proteinComponents = result.components.filter(c => 
    (c as any).componentType === 'protein'
  );
  const seasoningComponents = result.components.filter(c => 
    (c as any).componentType === 'seasoning'
  );
  
  console.log(`\n主要食材 (${mainComponents.length}):`);
  mainComponents.forEach(c => {
    console.log(`  - ${c.name}: ${c.estimatedPortion}g`);
  });
  
  console.log(`\n蛋白質 (${proteinComponents.length}):`);
  proteinComponents.forEach(c => {
    console.log(`  - ${c.name}: ${c.estimatedPortion}g`);
  });
  
  console.log(`\n調味料 (${seasoningComponents.length}):`);
  seasoningComponents.forEach(c => {
    console.log(`  - ${c.name}: ${c.estimatedPortion}g`);
  });
  
  // 計算比例
  const total = result.mainDish.estimatedTotalPortion;
  const mainRatio = mainComponents.reduce((sum, c) => sum + c.estimatedPortion, 0) / total;
  const proteinRatio = proteinComponents.reduce((sum, c) => sum + c.estimatedPortion, 0) / total;
  const seasoningRatio = seasoningComponents.reduce((sum, c) => sum + c.estimatedPortion, 0) / total;
  
  console.log('\n成分比例:');
  console.log(`  主要食材: ${(mainRatio * 100).toFixed(1)}%`);
  console.log(`  蛋白質: ${(proteinRatio * 100).toFixed(1)}%`);
  console.log(`  調味料: ${(seasoningRatio * 100).toFixed(1)}%`);
}

/**
 * 執行所有示例
 */
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         炒菜類成分識別示例 - Component Detection          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    await example1_StirFriedNoodles();
    await example2_StirFriedVegetables();
    await example3_KungPaoChicken();
    await example4_CompareStirFries();
    await example5_MixedComponents();
    
    console.log('\n✅ 所有示例執行完成！');
  } catch (error) {
    console.error('\n❌ 執行示例時發生錯誤:', error);
  }
}

// 如果直接執行此文件，運行所有示例
if (require.main === module) {
  runAllExamples();
}

export {
  example1_StirFriedNoodles,
  example2_StirFriedVegetables,
  example3_KungPaoChicken,
  example4_CompareStirFries,
  example5_MixedComponents
};
