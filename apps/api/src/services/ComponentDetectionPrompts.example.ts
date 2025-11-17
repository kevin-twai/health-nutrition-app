/**
 * 成分識別 Prompt 使用範例
 * 
 * 此文件展示如何使用 EnhancedPromptGenerator 的成分識別功能
 */

import { EnhancedPromptGenerator } from './EnhancedPromptGenerator';
import { DishType } from '../types/ComponentDetection';

/**
 * 範例 1: 為味噌湯生成成分識別 prompt
 */
export function example1_SoupComponentDetection() {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  const prompt = generator.generateComponentDetectionPrompt(
    '味噌湯',
    DishType.SOUP
  );
  
  console.log('=== 味噌湯成分識別 Prompt ===');
  console.log(prompt);
  console.log('\n');
  
  return prompt;
}

/**
 * 範例 2: 為蛋炒飯生成成分識別 prompt
 */
export function example2_FriedRiceComponentDetection() {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  const prompt = generator.generateComponentDetectionPrompt(
    '蛋炒飯',
    DishType.FRIED_RICE
  );
  
  console.log('=== 蛋炒飯成分識別 Prompt ===');
  console.log(prompt);
  console.log('\n');
  
  return prompt;
}

/**
 * 範例 3: 為台式便當生成成分識別 prompt（帶地區資訊）
 */
export function example3_BentoWithRegion() {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  const prompt = generator.generateComponentDetectionPrompt(
    '台式便當',
    DishType.BENTO,
    '台北'
  );
  
  console.log('=== 台式便當成分識別 Prompt（台北地區）===');
  console.log(prompt);
  console.log('\n');
  
  return prompt;
}

/**
 * 範例 4: 為拉麵生成成分識別 prompt
 */
export function example4_NoodlesComponentDetection() {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  const prompt = generator.generateComponentDetectionPrompt(
    '拉麵',
    DishType.NOODLES
  );
  
  console.log('=== 拉麵成分識別 Prompt ===');
  console.log(prompt);
  console.log('\n');
  
  return prompt;
}

/**
 * 範例 5: 使用英文模式生成 prompt
 */
export function example5_EnglishMode() {
  const generator = new EnhancedPromptGenerator('en');
  
  const prompt = generator.generateComponentDetectionPrompt(
    'Miso Soup',
    DishType.SOUP
  );
  
  console.log('=== Miso Soup Component Detection Prompt (English) ===');
  console.log(prompt);
  console.log('\n');
  
  return prompt;
}

/**
 * 範例 6: 生成成分精煉 prompt（用於二次確認）
 */
export function example6_ComponentRefinement() {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  // 模擬初步識別的成分（有些信心度較低）
  const initialComponents = [
    { name: '豆腐', confidence: 0.95, estimatedPortion: 50 },
    { name: '海帶', confidence: 0.65, estimatedPortion: 20 },
    { name: '蔥花', confidence: 0.80, estimatedPortion: 5 },
    { name: '味噌', confidence: 0.90, estimatedPortion: 15 }
  ];
  
  const prompt = generator.generateComponentRefinementPrompt(
    initialComponents,
    '味噌湯 - 日式料理'
  );
  
  console.log('=== 成分精煉 Prompt（二次確認）===');
  console.log(prompt);
  console.log('\n');
  
  return prompt;
}

/**
 * 範例 7: 完整的成分識別流程
 */
export async function example7_CompleteFlow() {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  console.log('=== 完整成分識別流程 ===\n');
  
  // 步驟 1: 生成初始成分識別 prompt
  console.log('步驟 1: 生成成分識別 prompt');
  const detectionPrompt = generator.generateComponentDetectionPrompt(
    '味噌湯',
    DishType.SOUP,
    '日本'
  );
  console.log('Prompt 已生成（長度：', detectionPrompt.length, '字元）\n');
  
  // 步驟 2: 模擬 Vision API 返回的初步結果
  console.log('步驟 2: 模擬 Vision API 識別結果');
  const initialComponents = [
    { name: '豆腐', confidence: 0.95, estimatedPortion: 50 },
    { name: '海帶', confidence: 0.65, estimatedPortion: 20 },
    { name: '蔥花', confidence: 0.75, estimatedPortion: 5 }
  ];
  console.log('識別到', initialComponents.length, '個成分');
  console.log('最低信心度:', Math.min(...initialComponents.map(c => c.confidence)));
  console.log('\n');
  
  // 步驟 3: 如果有低信心度成分，生成精煉 prompt
  const hasLowConfidence = initialComponents.some(c => c.confidence < 0.70);
  if (hasLowConfidence) {
    console.log('步驟 3: 檢測到低信心度成分，生成精煉 prompt');
    const refinementPrompt = generator.generateComponentRefinementPrompt(
      initialComponents,
      '味噌湯'
    );
    console.log('精煉 Prompt 已生成（長度：', refinementPrompt.length, '字元）\n');
  } else {
    console.log('步驟 3: 所有成分信心度良好，跳過精煉步驟\n');
  }
  
  console.log('流程完成！\n');
}

/**
 * 範例 8: 不同料理類型的批量處理
 */
export function example8_BatchProcessing() {
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  const dishes = [
    { name: '味噌湯', type: DishType.SOUP },
    { name: '蛋炒飯', type: DishType.FRIED_RICE },
    { name: '台式便當', type: DishType.BENTO },
    { name: '拉麵', type: DishType.NOODLES },
    { name: '宮保雞丁', type: DishType.STIR_FRY }
  ];
  
  console.log('=== 批量生成成分識別 Prompt ===\n');
  
  const prompts = dishes.map(dish => {
    const prompt = generator.generateComponentDetectionPrompt(
      dish.name,
      dish.type
    );
    console.log(`${dish.name} (${dish.type}): ${prompt.length} 字元`);
    return { dish: dish.name, prompt };
  });
  
  console.log('\n總共生成', prompts.length, '個 prompt');
  console.log('平均長度:', Math.round(prompts.reduce((sum, p) => sum + p.prompt.length, 0) / prompts.length), '字元\n');
  
  return prompts;
}

/**
 * 執行所有範例
 */
export function runAllExamples() {
  console.log('\n========================================');
  console.log('成分識別 Prompt 使用範例');
  console.log('========================================\n');
  
  example1_SoupComponentDetection();
  example2_FriedRiceComponentDetection();
  example3_BentoWithRegion();
  example4_NoodlesComponentDetection();
  example5_EnglishMode();
  example6_ComponentRefinement();
  example7_CompleteFlow();
  example8_BatchProcessing();
  
  console.log('========================================');
  console.log('所有範例執行完成！');
  console.log('========================================\n');
}

// 如果直接執行此文件，運行所有範例
if (require.main === module) {
  runAllExamples();
}
