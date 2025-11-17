/**
 * ComponentDetectionEngine 使用範例
 * 
 * 此文件展示如何使用 ComponentDetectionEngine 進行成分檢測
 */

import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType, EnrichedComponent } from '../types/ComponentDetection';
import fs from 'fs';
import path from 'path';

/**
 * 範例 1: 基本使用 - 檢測蛋炒飯的成分
 */
async function example1_BasicUsage() {
  console.log('\n=== 範例 1: 基本使用 ===\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  
  // 假設有一張蛋炒飯的圖片
  // const imageBuffer = fs.readFileSync('path/to/fried-rice.jpg');
  
  // 為了示範，我們創建一個空的 Buffer
  const imageBuffer = Buffer.from('');

  try {
    const result = await engine.detectComponents(
      imageBuffer,
      '蛋炒飯',
      DishType.FRIED_RICE
    );

    console.log('料理名稱:', result.mainDish.name);
    console.log('料理類型:', result.mainDish.type);
    console.log('總份量:', result.mainDish.estimatedTotalPortion, 'g');
    console.log('信心度:', (result.mainDish.confidence * 100).toFixed(1) + '%');
    console.log('\n檢測到的成分:');
    
    result.components.forEach((comp, index) => {
      console.log(`${index + 1}. ${comp.name}`);
      console.log(`   份量: ${comp.estimatedPortion}g`);
      console.log(`   信心度: ${(comp.confidence * 100).toFixed(1)}%`);
      if (comp.cookingMethod) {
        console.log(`   烹飪方式: ${comp.cookingMethod}`);
      }
      if ((comp as EnrichedComponent).knowledgeBaseMatch) {
        console.log(`   來源: 知識庫`);
      }
    });

    console.log('\n處理時間:', result.metadata.processingTime, 'ms');
    console.log('檢測方法:', result.metadata.detectionMethod);
    
  } catch (error) {
    console.error('檢測失敗:', error);
  }
}

/**
 * 範例 2: 自動判斷料理類型
 */
async function example2_AutoDetectDishType() {
  console.log('\n=== 範例 2: 自動判斷料理類型 ===\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('');

  try {
    // 不提供料理名稱和類型，讓引擎自動判斷
    const result = await engine.detectComponents(imageBuffer);

    console.log('自動判斷結果:');
    console.log('料理名稱:', result.mainDish.name);
    console.log('料理類型:', result.mainDish.type);
    console.log('判斷信心度:', (result.mainDish.confidence * 100).toFixed(1) + '%');
    
  } catch (error) {
    console.error('檢測失敗:', error);
  }
}

/**
 * 範例 3: 成分驗證
 */
async function example3_ComponentValidation() {
  console.log('\n=== 範例 3: 成分驗證 ===\n');

  const engine = new ComponentDetectionEngine('zh-TW');

  // 模擬一些檢測到的成分
  const components = [
    {
      id: '1',
      name: '白飯',
      confidence: 0.9,
      estimatedPortion: 200
    },
    {
      id: '2',
      name: '雞蛋',
      confidence: 0.4,  // 低信心度
      estimatedPortion: 50
    }
  ];

  const validationResult = engine.validateComponents(
    components as any,
    DishType.FRIED_RICE
  );

  console.log('驗證結果:');
  console.log('是否有效:', validationResult.isValid);
  
  if (validationResult.warnings.length > 0) {
    console.log('\n警告:');
    validationResult.warnings.forEach(warning => {
      console.log('- ' + warning);
    });
  }

  if (validationResult.errors.length > 0) {
    console.log('\n錯誤:');
    validationResult.errors.forEach(error => {
      console.log('- ' + error);
    });
  }

  if (validationResult.suggestions.length > 0) {
    console.log('\n建議:');
    validationResult.suggestions.forEach(suggestion => {
      console.log('- ' + suggestion);
    });
  }
}

/**
 * 範例 4: 知識庫增強
 */
async function example4_KnowledgeBaseEnrichment() {
  console.log('\n=== 範例 4: 知識庫增強 ===\n');

  const engine = new ComponentDetectionEngine('zh-TW');

  // Vision API 只識別到部分成分
  const visionComponents = [
    {
      id: '1',
      name: '白飯',
      confidence: 0.9,
      estimatedPortion: 200
    }
  ];

  console.log('Vision API 識別的成分:');
  visionComponents.forEach(comp => {
    console.log(`- ${comp.name} (${comp.estimatedPortion}g)`);
  });

  // 使用知識庫增強
  const enrichedComponents = await engine.enrichWithKnowledgeBase(
    visionComponents as any,
    '蛋炒飯',
    DishType.FRIED_RICE
  );

  console.log('\n知識庫增強後的成分:');
  enrichedComponents.forEach(comp => {
    const source = (comp as EnrichedComponent).knowledgeBaseMatch ? '(知識庫)' : '(Vision API)';
    console.log(`- ${comp.name} (${comp.estimatedPortion}g) ${source}`);
  });

  console.log(`\n總成分數: ${enrichedComponents.length}`);
  console.log(`來自知識庫: ${enrichedComponents.filter(c => (c as EnrichedComponent).knowledgeBaseMatch).length}`);
  console.log(`來自 Vision API: ${visionComponents.length}`);
}

/**
 * 範例 5: 處理不同料理類型
 */
async function example5_DifferentDishTypes() {
  console.log('\n=== 範例 5: 處理不同料理類型 ===\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('');

  const dishes = [
    { name: '味噌湯', type: DishType.SOUP },
    { name: '蛋炒飯', type: DishType.FRIED_RICE },
    { name: '台式便當', type: DishType.BENTO },
    { name: '拉麵', type: DishType.NOODLES },
    { name: '小籠包', type: DishType.DUMPLING }
  ];

  for (const dish of dishes) {
    try {
      console.log(`\n檢測 ${dish.name}...`);
      
      const result = await engine.detectComponents(
        imageBuffer,
        dish.name,
        dish.type
      );

      console.log(`成分數量: ${result.components.length}`);
      console.log(`處理時間: ${result.metadata.processingTime}ms`);
      console.log(`檢測方法: ${result.metadata.detectionMethod}`);
      
    } catch (error) {
      console.error(`檢測 ${dish.name} 失敗:`, error);
    }
  }
}

/**
 * 範例 6: 錯誤處理
 */
async function example6_ErrorHandling() {
  console.log('\n=== 範例 6: 錯誤處理 ===\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('');

  try {
    const result = await engine.detectComponents(imageBuffer);
    console.log('檢測成功');
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('OpenAI API')) {
        console.error('❌ Vision API 調用失敗');
        console.error('   請檢查 OPENAI_API_KEY 環境變數');
      } else if (error.message.includes('成分檢測失敗')) {
        console.error('❌ 成分檢測過程出錯');
        console.error('   錯誤詳情:', error.message);
      } else {
        console.error('❌ 未知錯誤:', error.message);
      }
    }
  }
}

/**
 * 範例 7: 使用建議
 */
async function example7_UsingSuggestions() {
  console.log('\n=== 範例 7: 使用建議 ===\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const imageBuffer = Buffer.from('');

  try {
    const result = await engine.detectComponents(
      imageBuffer,
      '蛋炒飯',
      DishType.FRIED_RICE
    );

    console.log('用戶建議:');
    
    if (result.suggestions.possibleMissingComponents.length > 0) {
      console.log('\n可能缺失的成分:');
      result.suggestions.possibleMissingComponents.forEach(comp => {
        console.log(`- ${comp}`);
      });
    }

    if (result.suggestions.portionAdjustments.length > 0) {
      console.log('\n份量調整建議:');
      result.suggestions.portionAdjustments.forEach(adj => {
        console.log(`- ${adj.component}: 建議 ${adj.suggestedPortion}g`);
        console.log(`  原因: ${adj.reason}`);
      });
    }

    if (result.suggestions.alternativeInterpretations.length > 0) {
      console.log('\n替代解釋:');
      result.suggestions.alternativeInterpretations.forEach(alt => {
        console.log(`- ${alt.dishName} (信心度: ${(alt.confidence * 100).toFixed(1)}%)`);
      });
    }
    
  } catch (error) {
    console.error('檢測失敗:', error);
  }
}

/**
 * 主函數 - 運行所有範例
 */
async function main() {
  console.log('ComponentDetectionEngine 使用範例');
  console.log('=====================================');

  // 注意：這些範例需要實際的圖片和 OpenAI API Key 才能正常運行
  // 目前使用空 Buffer 僅用於展示 API 使用方式

  // await example1_BasicUsage();
  // await example2_AutoDetectDishType();
  await example3_ComponentValidation();
  await example4_KnowledgeBaseEnrichment();
  // await example5_DifferentDishTypes();
  // await example6_ErrorHandling();
  // await example7_UsingSuggestions();

  console.log('\n所有範例執行完畢！');
}

// 如果直接運行此文件
if (require.main === module) {
  main().catch(console.error);
}

export {
  example1_BasicUsage,
  example2_AutoDetectDishType,
  example3_ComponentValidation,
  example4_KnowledgeBaseEnrichment,
  example5_DifferentDishTypes,
  example6_ErrorHandling,
  example7_UsingSuggestions
};
