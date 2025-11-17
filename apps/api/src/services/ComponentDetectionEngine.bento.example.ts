/**
 * 便當類成分識別示例
 * Bento Component Detection Examples
 * 
 * 展示如何使用 ComponentDetectionEngine 識別便當類料理的成分
 */

import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType } from '../types/ComponentDetection';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 示例 1：識別台式便當
 */
async function example1_TaiwaneseBento() {
  console.log('\n========== 示例 1：台式便當成分識別 ==========\n');

  const engine = new ComponentDetectionEngine('zh-TW');

  // 假設我們有一張台式便當的圖片
  // 這裡使用模擬數據
  const mockImageBuffer = Buffer.from('mock-image-data');

  try {
    const result = await engine.detectComponents(
      mockImageBuffer,
      '台式便當',
      DishType.BENTO
    );

    console.log('✅ 識別完成！\n');
    console.log('料理資訊：');
    console.log(`  名稱: ${result.mainDish.name}`);
    console.log(`  類型: ${result.mainDish.type}`);
    console.log(`  總份量: ${result.mainDish.estimatedTotalPortion}g`);
    console.log(`  信心度: ${(result.mainDish.confidence * 100).toFixed(1)}%\n`);

    console.log('識別到的成分：');
    
    // 按區域分組顯示
    const staples = result.components.filter(c => (c as any).bentoRole === 'staple');
    const mainDishes = result.components.filter(c => (c as any).bentoRole === 'main_dish');
    const sideDishes = result.components.filter(c => (c as any).bentoRole === 'side_dish');

    if (staples.length > 0) {
      console.log('\n  【主食區】');
      staples.forEach(comp => {
        console.log(`    - ${comp.name} (${comp.estimatedPortion}g)`);
        console.log(`      信心度: ${(comp.confidence * 100).toFixed(1)}%`);
        console.log(`      烹飪方式: ${comp.cookingMethod || '未知'}`);
      });
    }

    if (mainDishes.length > 0) {
      console.log('\n  【主菜區】');
      mainDishes.forEach(comp => {
        console.log(`    - ${comp.name} (${comp.estimatedPortion}g)`);
        console.log(`      信心度: ${(comp.confidence * 100).toFixed(1)}%`);
        console.log(`      烹飪方式: ${comp.cookingMethod || '未知'}`);
      });
    }

    if (sideDishes.length > 0) {
      console.log('\n  【配菜區】');
      sideDishes.forEach(comp => {
        console.log(`    - ${comp.name} (${comp.estimatedPortion}g)`);
        console.log(`      信心度: ${(comp.confidence * 100).toFixed(1)}%`);
        console.log(`      烹飪方式: ${comp.cookingMethod || '未知'}`);
      });
    }

    console.log('\n處理資訊：');
    console.log(`  處理時間: ${result.metadata.processingTime}ms`);
    console.log(`  檢測方法: ${result.metadata.detectionMethod}`);
    console.log(`  總成分數: ${result.metadata.componentsDetected}`);
    console.log(`  來自知識庫: ${result.metadata.componentsFromKB}`);
    console.log(`  來自 Vision API: ${result.metadata.componentsFromVision}`);

    if (result.suggestions.possibleMissingComponents.length > 0) {
      console.log('\n可能缺失的成分：');
      result.suggestions.possibleMissingComponents.forEach(comp => {
        console.log(`  - ${comp}`);
      });
    }

    if (result.suggestions.portionAdjustments.length > 0) {
      console.log('\n份量調整建議：');
      result.suggestions.portionAdjustments.forEach(adj => {
        console.log(`  - ${adj.component}: ${adj.suggestedPortion}g`);
        console.log(`    原因: ${adj.reason}`);
      });
    }

  } catch (error) {
    console.error('❌ 識別失敗:', error);
  }
}

/**
 * 示例 2：識別日式便當
 */
async function example2_JapaneseBento() {
  console.log('\n========== 示例 2：日式便當成分識別 ==========\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const mockImageBuffer = Buffer.from('mock-image-data');

  try {
    const result = await engine.detectComponents(
      mockImageBuffer,
      '日式便當',
      DishType.BENTO
    );

    console.log('✅ 識別完成！\n');
    console.log('料理資訊：');
    console.log(`  名稱: ${result.mainDish.name}`);
    console.log(`  類型: ${result.mainDish.type}`);
    console.log(`  總份量: ${result.mainDish.estimatedTotalPortion}g\n`);

    console.log('日式便當特色：');
    console.log('  - 注重色彩搭配和營養均衡');
    console.log('  - 常有玉子燒（日式煎蛋）');
    console.log('  - 包含醃漬物和梅乾');
    console.log('  - 主菜通常是炸豬排、照燒雞腿或烤魚\n');

    console.log('識別到的成分：');
    result.components.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} (${comp.estimatedPortion}g)`);
      console.log(`     類別: ${comp.category}`);
      console.log(`     區域: ${(comp as any).bentoRole || '未分類'}`);
      console.log(`     烹飪方式: ${comp.cookingMethod || '未知'}`);
      console.log(`     信心度: ${(comp.confidence * 100).toFixed(1)}%\n`);
    });

    // 檢查日式便當特色成分
    const hasTamagoyaki = result.components.some(c => c.name.includes('玉子燒'));
    const hasPickles = result.components.some(c => 
      c.name.includes('醃') || c.name.includes('漬物')
    );
    const hasUmeboshi = result.components.some(c => c.name.includes('梅乾'));

    console.log('特色成分檢查：');
    console.log(`  玉子燒: ${hasTamagoyaki ? '✓' : '✗'}`);
    console.log(`  醃漬物: ${hasPickles ? '✓' : '✗'}`);
    console.log(`  梅乾: ${hasUmeboshi ? '✓' : '✗'}`);

  } catch (error) {
    console.error('❌ 識別失敗:', error);
  }
}

/**
 * 示例 3：識別韓式便當
 */
async function example3_KoreanBento() {
  console.log('\n========== 示例 3：韓式便當成分識別 ==========\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const mockImageBuffer = Buffer.from('mock-image-data');

  try {
    const result = await engine.detectComponents(
      mockImageBuffer,
      '韓式便當',
      DishType.BENTO
    );

    console.log('✅ 識別完成！\n');
    console.log('料理資訊：');
    console.log(`  名稱: ${result.mainDish.name}`);
    console.log(`  類型: ${result.mainDish.type}`);
    console.log(`  總份量: ${result.mainDish.estimatedTotalPortion}g\n`);

    console.log('韓式便當特色：');
    console.log('  - 多種小菜（반찬）是特色');
    console.log('  - 泡菜（김치）是必備');
    console.log('  - 注重發酵食品');
    console.log('  - 常用芝麻和辣椒醬調味\n');

    // 統計配菜數量
    const sideDishes = result.components.filter(c => 
      (c as any).bentoRole === 'side_dish'
    );

    console.log(`識別到 ${sideDishes.length} 種配菜（小菜）：`);
    sideDishes.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} (${comp.estimatedPortion}g)`);
      console.log(`     烹飪方式: ${comp.cookingMethod || '未知'}`);
    });

    // 檢查韓式便當特色成分
    const hasKimchi = result.components.some(c => c.name.includes('泡菜'));
    const hasSesame = result.components.some(c => c.name.includes('芝麻'));
    const hasMultipleSides = sideDishes.length >= 3;

    console.log('\n特色成分檢查：');
    console.log(`  泡菜: ${hasKimchi ? '✓' : '✗'}`);
    console.log(`  芝麻: ${hasSesame ? '✓' : '✗'}`);
    console.log(`  多種小菜 (≥3): ${hasMultipleSides ? '✓' : '✗'}`);

    if (!hasMultipleSides) {
      console.log('\n  ⚠️ 韓式便當通常有 3-5 種小菜，可能有遺漏');
    }

  } catch (error) {
    console.error('❌ 識別失敗:', error);
  }
}

/**
 * 示例 4：便當區域劃分分析
 */
async function example4_BentoLayoutAnalysis() {
  console.log('\n========== 示例 4：便當區域劃分分析 ==========\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const mockImageBuffer = Buffer.from('mock-image-data');

  try {
    const result = await engine.detectComponents(
      mockImageBuffer,
      '台式便當',
      DishType.BENTO
    );

    console.log('✅ 識別完成！\n');

    // 計算各區域的份量和比例
    const staples = result.components.filter(c => (c as any).bentoRole === 'staple');
    const mainDishes = result.components.filter(c => (c as any).bentoRole === 'main_dish');
    const sideDishes = result.components.filter(c => (c as any).bentoRole === 'side_dish');

    const totalPortion = result.mainDish.estimatedTotalPortion;
    const staplePortion = staples.reduce((sum, c) => sum + c.estimatedPortion, 0);
    const mainDishPortion = mainDishes.reduce((sum, c) => sum + c.estimatedPortion, 0);
    const sideDishPortion = sideDishes.reduce((sum, c) => sum + c.estimatedPortion, 0);

    console.log('便當區域劃分分析：\n');

    console.log('【主食區】');
    console.log(`  成分數: ${staples.length}`);
    console.log(`  總份量: ${staplePortion}g`);
    console.log(`  佔比: ${((staplePortion / totalPortion) * 100).toFixed(1)}%`);
    console.log(`  成分: ${staples.map(c => c.name).join(', ')}\n`);

    console.log('【主菜區】');
    console.log(`  成分數: ${mainDishes.length}`);
    console.log(`  總份量: ${mainDishPortion}g`);
    console.log(`  佔比: ${((mainDishPortion / totalPortion) * 100).toFixed(1)}%`);
    console.log(`  成分: ${mainDishes.map(c => c.name).join(', ')}\n`);

    console.log('【配菜區】');
    console.log(`  成分數: ${sideDishes.length}`);
    console.log(`  總份量: ${sideDishPortion}g`);
    console.log(`  佔比: ${((sideDishPortion / totalPortion) * 100).toFixed(1)}%`);
    console.log(`  成分: ${sideDishes.map(c => c.name).join(', ')}\n`);

    // 營養均衡分析
    console.log('營養均衡分析：');
    const hasProtein = result.components.some(c => c.category === 'protein');
    const hasVegetable = result.components.some(c => c.category === 'vegetable');
    const hasGrain = result.components.some(c => c.category === 'grain');

    console.log(`  蛋白質: ${hasProtein ? '✓' : '✗'}`);
    console.log(`  蔬菜: ${hasVegetable ? '✓' : '✗'}`);
    console.log(`  主食: ${hasGrain ? '✓' : '✗'}`);

    if (hasProtein && hasVegetable && hasGrain) {
      console.log('\n  ✅ 營養均衡良好！');
    } else {
      console.log('\n  ⚠️ 建議補充缺少的營養類別');
    }

    // 烹飪方式多樣性
    const cookingMethods = new Set(
      result.components
        .filter(c => c.cookingMethod)
        .map(c => c.cookingMethod)
    );

    console.log(`\n烹飪方式多樣性：`);
    console.log(`  使用了 ${cookingMethods.size} 種烹飪方式`);
    console.log(`  方式: ${Array.from(cookingMethods).join(', ')}`);

  } catch (error) {
    console.error('❌ 識別失敗:', error);
  }
}

/**
 * 示例 5：便當成分調整
 */
async function example5_BentoComponentAdjustment() {
  console.log('\n========== 示例 5：便當成分調整 ==========\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const mockImageBuffer = Buffer.from('mock-image-data');

  try {
    const result = await engine.detectComponents(
      mockImageBuffer,
      '台式便當',
      DishType.BENTO
    );

    console.log('✅ 識別完成！\n');

    console.log('原始識別結果：');
    result.components.forEach(comp => {
      console.log(`  - ${comp.name}: ${comp.estimatedPortion}g`);
    });

    // 顯示份量調整建議
    if (result.suggestions.portionAdjustments.length > 0) {
      console.log('\n份量調整建議：');
      result.suggestions.portionAdjustments.forEach(adj => {
        const original = result.components.find(c => c.name === adj.component);
        if (original) {
          console.log(`\n  ${adj.component}:`);
          console.log(`    原始份量: ${original.estimatedPortion}g`);
          console.log(`    建議份量: ${adj.suggestedPortion}g`);
          console.log(`    調整原因: ${adj.reason}`);
        }
      });
    }

    // 顯示可能缺失的成分
    if (result.suggestions.possibleMissingComponents.length > 0) {
      console.log('\n可能缺失的成分：');
      result.suggestions.possibleMissingComponents.forEach(comp => {
        console.log(`  - ${comp}`);
      });
      console.log('\n  💡 提示：您可以手動添加這些成分以獲得更完整的營養資訊');
    }

    // 顯示替代解釋
    if (result.suggestions.alternativeInterpretations.length > 0) {
      console.log('\n替代解釋：');
      result.suggestions.alternativeInterpretations.forEach((alt, index) => {
        console.log(`\n  解釋 ${index + 1}: ${alt.dishName}`);
        console.log(`  信心度: ${(alt.confidence * 100).toFixed(1)}%`);
        console.log(`  成分: ${alt.components.map(c => c.name).join(', ')}`);
      });
    }

  } catch (error) {
    console.error('❌ 識別失敗:', error);
  }
}

/**
 * 執行所有示例
 */
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     便當類成分識別示例 - Component Detection Examples     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_TaiwaneseBento();
  await example2_JapaneseBento();
  await example3_KoreanBento();
  await example4_BentoLayoutAnalysis();
  await example5_BentoComponentAdjustment();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    所有示例執行完成！                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// 如果直接執行此文件，運行所有示例
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// 導出示例函數供其他模組使用
export {
  example1_TaiwaneseBento,
  example2_JapaneseBento,
  example3_KoreanBento,
  example4_BentoLayoutAnalysis,
  example5_BentoComponentAdjustment,
  runAllExamples
};
