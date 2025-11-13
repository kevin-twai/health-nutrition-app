/**
 * MultiStageRecognitionEngine 使用範例
 * 
 * 這個文件展示如何使用多階段識別引擎來提升食物識別準確度
 */

import { MultiStageRecognitionEngine } from './MultiStageRecognitionEngine';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 基本使用範例
 */
async function basicExample() {
  console.log('=== 基本使用範例 ===\n');

  // 1. 創建引擎實例（使用預設配置）
  const engine = new MultiStageRecognitionEngine();

  // 2. 讀取圖片
  const imagePath = path.join(__dirname, '../../test-images/liangban-gansi.jpg');
  
  // 檢查文件是否存在
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 測試圖片不存在，請準備測試圖片');
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);

  // 3. 執行多階段識別
  console.log('🔍 開始識別...\n');
  const result = await engine.recognize(imageBuffer);

  // 4. 查看結果
  console.log('✅ 識別完成！\n');
  console.log(`總處理時間: ${result.totalProcessingTime}ms`);
  console.log(`API 調用次數: ${result.totalApiCalls}`);
  console.log(`最終階段: ${result.finalStage}`);
  console.log(`整體信心度: ${(result.confidence * 100).toFixed(1)}%\n`);

  console.log('識別到的食物：');
  result.foods.forEach((food, index) => {
    console.log(`${index + 1}. ${food.name}`);
    console.log(`   信心度: ${(food.confidence * 100).toFixed(1)}%`);
    console.log(`   份量: ${food.estimatedPortion}g`);
    console.log(`   熱量: ${Math.round(food.nutrition.calories * food.estimatedPortion / 100)} kcal\n`);
  });

  // 5. 查看替代選項（如果有）
  if (result.alternatives && result.alternatives.length > 0) {
    console.log('替代選項：');
    result.alternatives.forEach((alternatives, index) => {
      console.log(`\n食物 ${index + 1} 的其他可能：`);
      alternatives.forEach((alt, altIndex) => {
        console.log(`  ${altIndex + 1}. ${alt.food.name} (信心度: ${(alt.confidence * 100).toFixed(1)}%)`);
      });
    });
  }

  // 6. 查看各階段詳情
  console.log('\n各階段詳情：');
  result.stages.forEach(stage => {
    console.log(`\n階段 ${stage.attempt} (${stage.promptType}):`);
    console.log(`  處理時間: ${stage.processingTime}ms`);
    console.log(`  信心度: ${(stage.confidence * 100).toFixed(1)}%`);
    console.log(`  識別到: ${stage.result.foods.length} 個食物`);
  });
}

/**
 * 自定義配置範例
 */
async function customConfigExample() {
  console.log('\n\n=== 自定義配置範例 ===\n');

  // 創建具有自定義配置的引擎
  const engine = new MultiStageRecognitionEngine({
    minConfidenceThreshold: 0.90,  // 提高信心度要求
    enhancedThreshold: 0.80,        // 提高增強階段閾值
    maxStages: 2,                   // 只使用兩個階段
    enableKnowledgeBase: false,     // 禁用知識庫匹配
    language: 'zh-TW'               // 使用繁體中文
  });

  console.log('✅ 引擎已創建（自定義配置）');
  console.log('   - 最低信心度閾值: 90%');
  console.log('   - 增強階段閾值: 80%');
  console.log('   - 最大階段數: 2');
  console.log('   - 知識庫匹配: 禁用');
  console.log('   - 語言: 繁體中文\n');

  // 健康檢查
  const health = await engine.healthCheck();
  console.log('健康檢查結果：');
  console.log(`  狀態: ${health.status}`);
  console.log(`  OpenAI 已配置: ${health.details.openaiConfigured}`);
  console.log(`  知識庫食材數: ${health.details.knowledgeBaseItems}`);
  console.log(`  料理模式數: ${health.details.dishPatterns}\n`);
}

/**
 * 批次處理範例
 */
async function batchProcessingExample() {
  console.log('\n\n=== 批次處理範例 ===\n');

  const engine = new MultiStageRecognitionEngine();

  // 模擬多張圖片
  const imageFiles = [
    'liangban-gansi.jpg',
    'taiwanese-stir-fry.jpg',
    'japanese-bento.jpg'
  ];

  const results = [];

  for (const imageFile of imageFiles) {
    const imagePath = path.join(__dirname, '../../test-images', imageFile);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️ 跳過不存在的圖片: ${imageFile}`);
      continue;
    }

    console.log(`處理: ${imageFile}`);
    const imageBuffer = fs.readFileSync(imagePath);
    
    try {
      const result = await engine.recognize(imageBuffer);
      results.push({
        file: imageFile,
        success: true,
        foodCount: result.foods.length,
        confidence: result.confidence,
        processingTime: result.totalProcessingTime
      });
      console.log(`  ✅ 成功 - 識別到 ${result.foods.length} 個食物\n`);
    } catch (error) {
      results.push({
        file: imageFile,
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤'
      });
      console.log(`  ❌ 失敗 - ${error instanceof Error ? error.message : '未知錯誤'}\n`);
    }
  }

  // 統計結果
  console.log('批次處理統計：');
  console.log(`  總圖片數: ${results.length}`);
  console.log(`  成功: ${results.filter(r => r.success).length}`);
  console.log(`  失敗: ${results.filter(r => !r.success).length}`);
  
  const successResults = results.filter(r => r.success);
  if (successResults.length > 0) {
    const avgConfidence = successResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / successResults.length;
    const avgTime = successResults.reduce((sum, r) => sum + (r.processingTime || 0), 0) / successResults.length;
    console.log(`  平均信心度: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`  平均處理時間: ${avgTime.toFixed(0)}ms`);
  }
}

/**
 * 錯誤處理範例
 */
async function errorHandlingExample() {
  console.log('\n\n=== 錯誤處理範例 ===\n');

  const engine = new MultiStageRecognitionEngine();

  // 測試無效的圖片數據
  const invalidBuffer = Buffer.from('invalid-image-data');

  try {
    console.log('嘗試識別無效圖片...');
    await engine.recognize(invalidBuffer);
  } catch (error) {
    console.log('❌ 捕獲錯誤（預期行為）:');
    console.log(`   ${error instanceof Error ? error.message : '未知錯誤'}\n`);
  }

  // 測試空 buffer
  const emptyBuffer = Buffer.alloc(0);

  try {
    console.log('嘗試識別空圖片...');
    await engine.recognize(emptyBuffer);
  } catch (error) {
    console.log('❌ 捕獲錯誤（預期行為）:');
    console.log(`   ${error instanceof Error ? error.message : '未知錯誤'}\n`);
  }
}

/**
 * 階段分析範例
 */
async function stageAnalysisExample() {
  console.log('\n\n=== 階段分析範例 ===\n');

  const engine = new MultiStageRecognitionEngine({
    minConfidenceThreshold: 0.95,  // 設置很高的閾值，強制使用多階段
    enhancedThreshold: 0.85,
    maxStages: 3,
    enableKnowledgeBase: true
  });

  const imagePath = path.join(__dirname, '../../test-images/complex-dish.jpg');
  
  if (!fs.existsSync(imagePath)) {
    console.log('⚠️ 測試圖片不存在');
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const result = await engine.recognize(imageBuffer);

  console.log('階段分析：\n');

  result.stages.forEach((stage, index) => {
    console.log(`階段 ${stage.attempt}:`);
    console.log(`  類型: ${stage.promptType}`);
    console.log(`  時間: ${stage.timestamp.toISOString()}`);
    console.log(`  處理時間: ${stage.processingTime}ms`);
    console.log(`  API 調用: ${stage.apiCalls} 次`);
    console.log(`  信心度: ${(stage.confidence * 100).toFixed(1)}%`);
    console.log(`  識別結果: ${stage.result.foods.length} 個食物`);
    
    if (stage.result.cuisineType) {
      console.log(`  料理類型: ${stage.result.cuisineType}`);
    }
    if (stage.result.cookingMethod) {
      console.log(`  烹飪方式: ${stage.result.cookingMethod}`);
    }
    
    console.log(`  食物列表:`);
    stage.result.foods.forEach((food, foodIndex) => {
      console.log(`    ${foodIndex + 1}. ${food.name} (${(food.confidence * 100).toFixed(1)}%)`);
    });
    
    console.log('');
  });

  console.log(`最終選擇: 階段 ${result.finalStage}`);
  console.log(`原因: ${result.finalStage === 1 ? '第一階段信心度足夠' : 
                     result.finalStage === 2 ? '需要增強識別' : 
                     '需要知識庫輔助'}`);
}

/**
 * 主函數
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   MultiStageRecognitionEngine 使用範例                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // 執行各種範例
    await customConfigExample();
    
    // 如果有測試圖片，執行其他範例
    // await basicExample();
    // await batchProcessingExample();
    // await errorHandlingExample();
    // await stageAnalysisExample();

    console.log('\n✅ 所有範例執行完成！');
  } catch (error) {
    console.error('\n❌ 執行錯誤:', error);
  }
}

// 如果直接執行此文件
if (require.main === module) {
  main().catch(console.error);
}

// 導出範例函數供其他地方使用
export {
  basicExample,
  customConfigExample,
  batchProcessingExample,
  errorHandlingExample,
  stageAnalysisExample
};
