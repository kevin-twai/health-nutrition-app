/**
 * 湯品類成分識別使用示例
 * 
 * 展示如何使用 ComponentDetectionEngine 識別各種湯品的成分
 */

import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType } from '../types/ComponentDetection';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 示例 1：識別味噌湯
 */
async function example1_MisoSoup() {
  console.log('\n=== 示例 1：識別味噌湯 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  
  // 假設我們有一張味噌湯的圖片
  // const imageBuffer = fs.readFileSync(path.join(__dirname, 'test-images/miso-soup.jpg'));
  
  // 為了示例，我們創建一個模擬的 buffer
  const imageBuffer = Buffer.from('mock-image-data');
  
  try {
    const result = await engine.detectComponents(
      imageBuffer,
      '味噌湯',
      DishType.SOUP
    );
    
    console.log('料理資訊：');
    console.log(`  名稱：${result.mainDish.name}`);
    console.log(`  類型：${result.mainDish.type}`);
    console.log(`  信心度：${(result.mainDish.confidence * 100).toFixed(1)}%`);
    console.log(`  總份量：${result.mainDish.estimatedTotalPortion}ml\n`);
    
    console.log('檢測到的成分：');
    result.components.forEach((comp, index) => {
      const componentType = (comp as any).componentType || 'unknown';
      console.log(`  ${index + 1}. ${comp.name}`);
      console.log(`     - 類型：${componentType === 'liquid' ? '液體' : '固體'}`);
      console.log(`     - 份量：${comp.estimatedPortion}${componentType === 'liquid' ? 'ml' : 'g'}`);
      console.log(`     - 信心度：${(comp.confidence * 100).toFixed(1)}%`);
      console.log(`     - 類別：${comp.category}`);
    });
    
    console.log('\n建議：');
    if (result.suggestions.possibleMissingComponents.length > 0) {
      console.log('  可能缺失的成分：');
      result.suggestions.possibleMissingComponents.forEach(comp => {
        console.log(`    - ${comp}`);
      });
    }
    
    if (result.suggestions.portionAdjustments.length > 0) {
      console.log('  份量調整建議：');
      result.suggestions.portionAdjustments.forEach(adj => {
        console.log(`    - ${adj.component}: ${adj.reason}`);
      });
    }
    
  } catch (error) {
    console.error('識別失敗：', error);
  }
}

/**
 * 示例 2：識別蛋花湯
 */
async function example2_EggDropSoup() {
  console.log('\n=== 示例 2：識別蛋花湯 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('mock-image-data');
  
  try {
    const result = await engine.detectComponents(
      imageBuffer,
      '蛋花湯',
      DishType.SOUP
    );
    
    console.log('料理資訊：');
    console.log(`  ${result.mainDish.name} (${result.mainDish.estimatedTotalPortion}ml)\n`);
    
    // 分別顯示液體和固體成分
    const liquidComponents = result.components.filter(c => 
      (c as any).componentType === 'liquid'
    );
    const solidComponents = result.components.filter(c => 
      (c as any).componentType === 'solid'
    );
    
    console.log('液體成分（湯底）：');
    liquidComponents.forEach(comp => {
      console.log(`  - ${comp.name}: ${comp.estimatedPortion}ml`);
    });
    
    console.log('\n固體成分（配料）：');
    solidComponents.forEach(comp => {
      console.log(`  - ${comp.name}: ${comp.estimatedPortion}g`);
    });
    
    // 計算比例
    const totalLiquid = liquidComponents.reduce((sum, c) => sum + c.estimatedPortion, 0);
    const totalSolid = solidComponents.reduce((sum, c) => sum + c.estimatedPortion, 0);
    const liquidRatio = totalLiquid / (totalLiquid + totalSolid);
    
    console.log('\n成分比例：');
    console.log(`  液體：${(liquidRatio * 100).toFixed(1)}%`);
    console.log(`  固體：${((1 - liquidRatio) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('識別失敗：', error);
  }
}

/**
 * 示例 3：識別貢丸湯
 */
async function example3_PorkBallSoup() {
  console.log('\n=== 示例 3：識別貢丸湯 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('mock-image-data');
  
  try {
    const result = await engine.detectComponents(
      imageBuffer,
      '貢丸湯',
      DishType.SOUP
    );
    
    console.log('料理資訊：');
    console.log(`  ${result.mainDish.name}\n`);
    
    console.log('成分詳情：');
    result.components.forEach(comp => {
      console.log(`\n  ${comp.name}:`);
      console.log(`    份量：${comp.estimatedPortion}${(comp as any).componentType === 'liquid' ? 'ml' : 'g'}`);
      console.log(`    信心度：${(comp.confidence * 100).toFixed(1)}%`);
      console.log(`    類別：${comp.category}`);
      
      if (comp.cookingMethod) {
        console.log(`    烹飪方式：${comp.cookingMethod}`);
      }
      
      if (comp.visualFeatures) {
        console.log(`    視覺特徵：`);
        console.log(`      - 顏色：${comp.visualFeatures.color.join(', ')}`);
        console.log(`      - 形狀：${comp.visualFeatures.shape}`);
        console.log(`      - 位置：${comp.visualFeatures.position}`);
      }
    });
    
    console.log('\n處理資訊：');
    console.log(`  處理時間：${result.metadata.processingTime}ms`);
    console.log(`  檢測方法：${result.metadata.detectionMethod}`);
    console.log(`  整體信心度：${(result.metadata.confidenceScore * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('識別失敗：', error);
  }
}

/**
 * 示例 4：識別酸辣湯
 */
async function example4_HotAndSourSoup() {
  console.log('\n=== 示例 4：識別酸辣湯 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('mock-image-data');
  
  try {
    const result = await engine.detectComponents(
      imageBuffer,
      '酸辣湯',
      DishType.SOUP
    );
    
    console.log('料理資訊：');
    console.log(`  ${result.mainDish.name}\n`);
    
    // 按類別分組顯示成分
    const componentsByCategory = result.components.reduce((acc, comp) => {
      if (!acc[comp.category]) {
        acc[comp.category] = [];
      }
      acc[comp.category].push(comp);
      return acc;
    }, {} as Record<string, typeof result.components>);
    
    console.log('成分分類：');
    Object.entries(componentsByCategory).forEach(([category, components]) => {
      console.log(`\n  ${category}:`);
      components.forEach(comp => {
        const type = (comp as any).componentType === 'liquid' ? 'ml' : 'g';
        console.log(`    - ${comp.name} (${comp.estimatedPortion}${type})`);
      });
    });
    
    // 顯示營養摘要（如果有）
    if (result.nutritionSummary && result.nutritionSummary.total) {
      console.log('\n營養摘要：');
      console.log(`  熱量：${result.nutritionSummary.total.calories} kcal`);
      console.log(`  蛋白質：${result.nutritionSummary.total.protein}g`);
      console.log(`  碳水化合物：${result.nutritionSummary.total.carbohydrates}g`);
      console.log(`  脂肪：${result.nutritionSummary.total.fat}g`);
    }
    
  } catch (error) {
    console.error('識別失敗：', error);
  }
}

/**
 * 示例 5：比較不同湯品的成分
 */
async function example5_CompareSoups() {
  console.log('\n=== 示例 5：比較不同湯品 ===\n');
  
  const { findDishComponentMap } = require('../data/dishComponentMaps');
  
  const soups = ['味噌湯', '蛋花湯', '貢丸湯', '酸辣湯'];
  
  console.log('湯品成分比較：\n');
  
  soups.forEach(soupName => {
    const soupMap = findDishComponentMap(soupName);
    
    if (soupMap) {
      console.log(`${soupName}:`);
      console.log(`  典型份量：${soupMap.typicalPortionRange.typical}ml`);
      console.log(`  常見成分數：${soupMap.commonComponents.length}`);
      console.log(`  主要成分：`);
      
      // 顯示頻率 > 0.8 的成分
      const mainComponents = soupMap.commonComponents
        .filter((c: any) => c.frequency > 0.8)
        .map((c: any) => c.name);
      
      mainComponents.forEach((comp: string) => {
        console.log(`    - ${comp}`);
      });
      
      console.log('');
    }
  });
}

/**
 * 示例 6：處理識別錯誤和警告
 */
async function example6_HandleWarnings() {
  console.log('\n=== 示例 6：處理識別錯誤和警告 ===\n');
  
  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('mock-image-data');
  
  try {
    const result = await engine.detectComponents(
      imageBuffer,
      '味噌湯',
      DishType.SOUP
    );
    
    // 檢查驗證警告
    if (result.metadata.warnings && result.metadata.warnings.length > 0) {
      console.log('⚠️ 識別警告：');
      result.metadata.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
      console.log('');
    }
    
    // 檢查低信心度成分
    const lowConfidenceComponents = result.components.filter(c => c.confidence < 0.7);
    if (lowConfidenceComponents.length > 0) {
      console.log('⚠️ 低信心度成分（建議手動確認）：');
      lowConfidenceComponents.forEach(comp => {
        console.log(`  - ${comp.name} (${(comp.confidence * 100).toFixed(1)}%)`);
      });
      console.log('');
    }
    
    // 檢查建議
    if (result.suggestions.possibleMissingComponents.length > 0) {
      console.log('💡 可能缺失的成分：');
      result.suggestions.possibleMissingComponents.forEach(comp => {
        console.log(`  - ${comp}`);
      });
      console.log('');
    }
    
    if (result.suggestions.portionAdjustments.length > 0) {
      console.log('💡 份量調整建議：');
      result.suggestions.portionAdjustments.forEach(adj => {
        console.log(`  - ${adj.component}:`);
        console.log(`    建議份量：${adj.suggestedPortion}g`);
        console.log(`    原因：${adj.reason}`);
      });
      console.log('');
    }
    
    // 檢查替代解釋
    if (result.suggestions.alternativeInterpretations.length > 0) {
      console.log('💡 替代解釋：');
      result.suggestions.alternativeInterpretations.forEach((alt, index) => {
        console.log(`  ${index + 1}. ${alt.dishName} (信心度: ${(alt.confidence * 100).toFixed(1)}%)`);
        console.log(`     成分：${alt.components.map(c => c.name).join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 識別失敗：', error);
    console.log('\n處理建議：');
    console.log('  1. 檢查圖片是否清晰');
    console.log('  2. 確認料理類型是否正確');
    console.log('  3. 嘗試使用知識庫降級模式');
  }
}

/**
 * 主函數：運行所有示例
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     湯品類成分識別系統 - 使用示例                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    await example1_MisoSoup();
    await example2_EggDropSoup();
    await example3_PorkBallSoup();
    await example4_HotAndSourSoup();
    await example5_CompareSoups();
    await example6_HandleWarnings();
    
    console.log('\n✅ 所有示例執行完成！');
    
  } catch (error) {
    console.error('\n❌ 示例執行失敗：', error);
  }
}

// 如果直接運行此文件，執行示例
if (require.main === module) {
  main().catch(console.error);
}

// 導出示例函數供其他模組使用
export {
  example1_MisoSoup,
  example2_EggDropSoup,
  example3_PorkBallSoup,
  example4_HotAndSourSoup,
  example5_CompareSoups,
  example6_HandleWarnings
};
