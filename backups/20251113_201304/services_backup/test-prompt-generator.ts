/**
 * EnhancedPromptGenerator 手動測試腳本
 */

import { EnhancedPromptGenerator, PromptTemplateType } from './EnhancedPromptGenerator';
import { CuisineType, FoodCategory } from '../types/AsianCuisineKnowledgeBase';

console.log('=== EnhancedPromptGenerator 測試 ===\n');

// 測試 1: 創建生成器
console.log('測試 1: 創建生成器');
const generator = new EnhancedPromptGenerator('zh-TW');
console.log('✅ 生成器創建成功\n');

// 測試 2: 生成標準 prompt
console.log('測試 2: 生成標準 prompt');
const standardPrompt = generator.generatePrompt();
console.log('Prompt 長度:', standardPrompt.length);
console.log('包含關鍵字:', standardPrompt.includes('營養分析助手') ? '✅' : '❌');
console.log('\n');

// 測試 3: 生成台式料理 prompt
console.log('測試 3: 生成台式料理 prompt');
const taiwanesePrompt = generator.generateTaiwanesePrompt();
console.log('Prompt 長度:', taiwanesePrompt.length);
console.log('包含「台式料理」:', taiwanesePrompt.includes('台式料理') ? '✅' : '❌');
console.log('包含「豆腐干絲」:', taiwanesePrompt.includes('豆腐干絲') ? '✅' : '❌');
console.log('包含「糯米椒」:', taiwanesePrompt.includes('糯米椒') ? '✅' : '❌');
console.log('\n');

// 測試 4: 生成豆製品識別 prompt
console.log('測試 4: 生成豆製品識別 prompt');
const beanPrompt = generator.generateBeanProductPrompt();
console.log('Prompt 長度:', beanPrompt.length);
console.log('包含「豆腐干絲」:', beanPrompt.includes('豆腐干絲') ? '✅' : '❌');
console.log('包含「麵條」:', beanPrompt.includes('麵條') ? '✅' : '❌');
console.log('包含「區分」:', beanPrompt.includes('區分') ? '✅' : '❌');
console.log('\n');

// 測試 5: 生成涼拌菜 prompt
console.log('測試 5: 生成涼拌菜 prompt');
const coldDishPrompt = generator.generateColdDishPrompt();
console.log('Prompt 長度:', coldDishPrompt.length);
console.log('包含「涼拌菜」:', coldDishPrompt.includes('涼拌菜') ? '✅' : '❌');
console.log('包含「麻油」:', coldDishPrompt.includes('麻油') ? '✅' : '❌');
console.log('\n');

// 測試 6: 添加易混淆食材警告
console.log('測試 6: 添加易混淆食材警告');
const basePrompt = '基礎 prompt';
const confusedPairs = [['豆腐干絲', '麵條'], ['米粉', '粉絲']];
const enhancedPrompt = generator.addConfusionWarnings(basePrompt, confusedPairs);
console.log('包含「易混淆」:', enhancedPrompt.includes('易混淆') ? '✅' : '❌');
console.log('包含「豆腐干絲」:', enhancedPrompt.includes('豆腐干絲') ? '✅' : '❌');
console.log('\n');

// 測試 7: 添加地方特色
console.log('測試 7: 添加地方特色');
const regionalPrompt = generator.addRegionalContext(basePrompt, '台南');
console.log('包含「台南」:', regionalPrompt.includes('台南') ? '✅' : '❌');
console.log('包含「牛肉湯」:', regionalPrompt.includes('牛肉湯') ? '✅' : '❌');
console.log('\n');

// 測試 8: 添加季節性提示
console.log('測試 8: 添加季節性提示');
const seasonalPrompt = generator.addSeasonalContext(basePrompt, '春');
console.log('包含「春季」:', seasonalPrompt.includes('春季') ? '✅' : '❌');
console.log('包含「竹筍」:', seasonalPrompt.includes('竹筍') ? '✅' : '❌');
console.log('\n');

// 測試 9: 動態生成 prompt（根據料理類型）
console.log('測試 9: 動態生成 prompt（根據料理類型）');
const dynamicPrompt = generator.generatePrompt({
  detectedCuisineType: CuisineType.TAIWANESE,
  suspectedFoodCategories: [FoodCategory.BEAN_PRODUCTS]
});
console.log('Prompt 長度:', dynamicPrompt.length);
console.log('包含台式相關內容:', dynamicPrompt.includes('台') ? '✅' : '❌');
console.log('\n');

// 測試 10: 智能 prompt 生成
console.log('測試 10: 智能 prompt 生成');
const smartPrompt = generator.generateSmartPrompt({
  detectedCuisineType: CuisineType.TAIWANESE,
  confusedPairs: [['豆腐干絲', '麵條']],
  region: '台南'
});
console.log('Prompt 長度:', smartPrompt.length);
console.log('包含多種增強:', 
  smartPrompt.includes('台') && 
  smartPrompt.includes('易混淆') && 
  smartPrompt.includes('台南') ? '✅' : '❌');
console.log('\n');

// 測試 11: 獲取所有模板類型
console.log('測試 11: 獲取所有模板類型');
const templateTypes = generator.getAvailableTemplateTypes();
console.log('模板數量:', templateTypes.length);
console.log('包含標準模板:', templateTypes.includes(PromptTemplateType.STANDARD) ? '✅' : '❌');
console.log('包含亞洲料理模板:', templateTypes.includes(PromptTemplateType.ASIAN_CUISINE) ? '✅' : '❌');
console.log('包含台式料理模板:', templateTypes.includes(PromptTemplateType.TAIWANESE) ? '✅' : '❌');
console.log('包含豆製品模板:', templateTypes.includes(PromptTemplateType.BEAN_PRODUCTS) ? '✅' : '❌');
console.log('包含涼拌菜模板:', templateTypes.includes(PromptTemplateType.COLD_DISH) ? '✅' : '❌');
console.log('\n');

// 測試 12: 英文模板
console.log('測試 12: 英文模板');
const enGenerator = new EnhancedPromptGenerator('en');
const enPrompt = enGenerator.generatePrompt();
console.log('包含英文關鍵字:', enPrompt.includes('nutrition') ? '✅' : '❌');
const enTaiwanesePrompt = enGenerator.generateTaiwanesePrompt();
console.log('包含「Taiwanese」:', enTaiwanesePrompt.includes('Taiwanese') ? '✅' : '❌');
console.log('\n');

console.log('=== 所有測試完成 ===');
console.log('\n示例 Prompt 預覽（前 500 字元）:');
console.log('---');
console.log(smartPrompt.substring(0, 500));
console.log('...');
console.log('---');
