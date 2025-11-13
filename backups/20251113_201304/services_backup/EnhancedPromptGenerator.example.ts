/**
 * EnhancedPromptGenerator 使用示例
 * 
 * 這個文件展示如何在 FoodRecognitionEngine 中使用 EnhancedPromptGenerator
 */

import { EnhancedPromptGenerator } from './EnhancedPromptGenerator';
import { CuisineType, FoodCategory } from '../types/AsianCuisineKnowledgeBase';

// ============================================
// 示例 1: 基本使用
// ============================================
function example1_BasicUsage() {
  console.log('=== 示例 1: 基本使用 ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  const prompt = generator.generatePrompt();
  
  console.log('生成的標準 prompt:');
  console.log(prompt);
  console.log('\n');
}

// ============================================
// 示例 2: 針對特定料理類型
// ============================================
function example2_CuisineSpecific() {
  console.log('=== 示例 2: 針對台式料理 ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  // 方法 1: 直接生成台式料理 prompt
  const taiwanesePrompt = generator.generateTaiwanesePrompt();
  console.log('台式料理專用 prompt (前 300 字元):');
  console.log(taiwanesePrompt.substring(0, 300) + '...\n');
  
  // 方法 2: 通過配置動態生成
  const dynamicPrompt = generator.generatePrompt({
    detectedCuisineType: CuisineType.TAIWANESE
  });
  console.log('動態生成的台式料理 prompt (前 300 字元):');
  console.log(dynamicPrompt.substring(0, 300) + '...\n');
}

// ============================================
// 示例 3: 針對特定食材類別
// ============================================
function example3_FoodCategorySpecific() {
  console.log('=== 示例 3: 針對豆製品識別 ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  // 當懷疑圖片中有豆製品時
  const beanPrompt = generator.generateBeanProductPrompt();
  console.log('豆製品專用 prompt (前 400 字元):');
  console.log(beanPrompt.substring(0, 400) + '...\n');
}

// ============================================
// 示例 4: 針對特定菜餚類型
// ============================================
function example4_DishTypeSpecific() {
  console.log('=== 示例 4: 針對涼拌菜 ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  // 當識別到可能是涼拌菜時
  const coldDishPrompt = generator.generateColdDishPrompt();
  console.log('涼拌菜專用 prompt (前 400 字元):');
  console.log(coldDishPrompt.substring(0, 400) + '...\n');
}

// ============================================
// 示例 5: 添加易混淆食材警告
// ============================================
function example5_ConfusionWarnings() {
  console.log('=== 示例 5: 添加易混淆食材警告 ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  let prompt = generator.generatePrompt();
  
  // 添加常見的易混淆食材對
  const confusedPairs = [
    ['豆腐干絲', '麵條'],
    ['米粉', '粉絲'],
    ['玉米筍', '筍子'],
    ['糯米椒', '青椒']
  ];
  
  prompt = generator.addConfusionWarnings(prompt, confusedPairs);
  console.log('添加警告後的 prompt (最後 300 字元):');
  console.log('...' + prompt.substring(prompt.length - 300) + '\n');
}

// ============================================
// 示例 6: 添加地方特色背景知識
// ============================================
function example6_RegionalContext() {
  console.log('=== 示例 6: 添加地方特色 ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  let prompt = generator.generateTaiwanesePrompt();
  
  // 如果知道用戶在台南
  prompt = generator.addRegionalContext(prompt, '台南');
  console.log('添加台南特色後的 prompt (最後 200 字元):');
  console.log('...' + prompt.substring(prompt.length - 200) + '\n');
}

// ============================================
// 示例 7: 多階段識別（第一次失敗後重試）
// ============================================
function example7_MultiStageRecognition() {
  console.log('=== 示例 7: 多階段識別 ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  // 第一次嘗試：使用標準 prompt
  console.log('第一次嘗試：標準 prompt');
  const firstAttempt = generator.generatePrompt({
    previousAttempts: 0
  });
  console.log('使用模板: 標準或亞洲料理通用\n');
  
  // 假設第一次信心度低，進行第二次嘗試
  console.log('第二次嘗試：增強 prompt');
  const secondAttempt = generator.generatePrompt({
    previousAttempts: 1,
    suspectedFoodCategories: [FoodCategory.BEAN_PRODUCTS],
    userFeedback: [
      { incorrectFood: '麵條', correctFood: '豆腐干絲' }
    ]
  });
  console.log('使用模板: 豆製品專用');
  console.log('包含用戶反饋學習\n');
}

// ============================================
// 示例 8: 智能 Prompt 生成（推薦使用）
// ============================================
function example8_SmartPromptGeneration() {
  console.log('=== 示例 8: 智能 Prompt 生成（推薦） ===\n');
  
  const generator = new EnhancedPromptGenerator('zh-TW');
  
  // 智能生成會自動：
  // 1. 選擇最適合的基礎模板
  // 2. 添加易混淆食材警告
  // 3. 添加地方特色
  // 4. 添加季節性提示
  // 5. 添加歷史錯誤學習
  
  const smartPrompt = generator.generateSmartPrompt({
    detectedCuisineType: CuisineType.TAIWANESE,
    suspectedFoodCategories: [FoodCategory.BEAN_PRODUCTS],
    confusedPairs: [['豆腐干絲', '麵條']],
    region: '台南',
    commonErrors: [
      { incorrect: '麵條', correct: '豆腐干絲', frequency: 5 },
      { incorrect: '青椒', correct: '糯米椒', frequency: 3 }
    ]
  });
  
  console.log('智能生成的 prompt 長度:', smartPrompt.length);
  console.log('包含的增強功能:');
  console.log('- ✅ 台式料理專用模板');
  console.log('- ✅ 豆製品識別重點');
  console.log('- ✅ 易混淆食材警告');
  console.log('- ✅ 台南地方特色');
  console.log('- ✅ 當前季節食材');
  console.log('- ✅ 歷史錯誤學習\n');
}

// ============================================
// 示例 9: 在 FoodRecognitionEngine 中整合
// ============================================
function example9_IntegrationWithFoodRecognitionEngine() {
  console.log('=== 示例 9: 整合到 FoodRecognitionEngine ===\n');
  
  console.log(`
// 在 FoodRecognitionEngine.ts 中：

import { EnhancedPromptGenerator } from './EnhancedPromptGenerator';

export class FoodRecognitionEngine {
  private promptGenerator: EnhancedPromptGenerator;
  
  constructor() {
    this.promptGenerator = new EnhancedPromptGenerator('zh-TW');
  }
  
  async recognizeFood(imageBuffer: Buffer, options: FoodRecognitionOptions) {
    // 第一次嘗試：使用標準 prompt
    let prompt = this.promptGenerator.generatePrompt();
    let result = await this.callOpenAIVision(imageBuffer, prompt);
    
    // 如果信心度低，使用增強 prompt 重試
    if (result.confidence < 0.85) {
      prompt = this.promptGenerator.generateSmartPrompt({
        previousAttempts: 1,
        detectedCuisineType: this.detectCuisineType(result),
        suspectedFoodCategories: this.detectFoodCategories(result),
        confusedPairs: this.getCommonConfusions(),
        region: options.userRegion,
        commonErrors: await this.getHistoricalErrors()
      });
      
      result = await this.callOpenAIVision(imageBuffer, prompt);
    }
    
    return result;
  }
}
  `);
}

// ============================================
// 執行所有示例
// ============================================
if (require.main === module) {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   EnhancedPromptGenerator 使用示例                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  example1_BasicUsage();
  example2_CuisineSpecific();
  example3_FoodCategorySpecific();
  example4_DishTypeSpecific();
  example5_ConfusionWarnings();
  example6_RegionalContext();
  example7_MultiStageRecognition();
  example8_SmartPromptGeneration();
  example9_IntegrationWithFoodRecognitionEngine();
  
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   所有示例執行完成                                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

export {
  example1_BasicUsage,
  example2_CuisineSpecific,
  example3_FoodCategorySpecific,
  example4_DishTypeSpecific,
  example5_ConfusionWarnings,
  example6_RegionalContext,
  example7_MultiStageRecognition,
  example8_SmartPromptGeneration,
  example9_IntegrationWithFoodRecognitionEngine
};
