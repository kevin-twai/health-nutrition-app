/**
 * 驗證亞洲料理知識庫
 * Verify Asian Cuisine Knowledge Base
 */

import { asianCuisineKB } from '../services/AsianCuisineKnowledgeBase';
import { FoodCategory, CuisineType } from '../types/AsianCuisineKnowledgeBase';

console.log('=== 亞洲料理知識庫驗證 ===\n');

// 獲取統計資訊
const stats = asianCuisineKB.getStatistics();

console.log('📊 知識庫統計：');
console.log(`  - 總食材數量: ${stats.totalFoodItems} 種`);
console.log(`  - 總料理模式: ${stats.totalDishPatterns} 種`);
console.log('');

console.log('📦 食材類別分布：');
Object.entries(stats.categoryCounts).forEach(([category, count]) => {
  console.log(`  - ${category}: ${count} 種`);
});
console.log('');

console.log('🍜 料理類型分布：');
Object.entries(stats.cuisineTypeCounts).forEach(([cuisine, count]) => {
  console.log(`  - ${cuisine}: ${count} 種`);
});
console.log('');

// 測試查詢功能
console.log('🔍 測試查詢功能：');

// 1. 查詢豆製品
const beanProducts = asianCuisineKB.queryFoodItems({
  category: FoodCategory.BEAN_PRODUCTS
});
console.log(`  - 豆製品類: ${beanProducts.length} 種`);
console.log(`    ${beanProducts.map(item => item.name).join('、')}`);
console.log('');

// 2. 查詢台灣特色食材
const taiwaneseFood = asianCuisineKB.queryFoodItems({
  cuisineType: CuisineType.TAIWANESE
});
console.log(`  - 台式料理食材: ${taiwaneseFood.length} 種`);
console.log('');

// 3. 測試易混淆食材
console.log('⚠️  易混淆食材檢查：');
const confusions = asianCuisineKB.getConfusedFoodPairs('豆腐干絲');
console.log(`  - 豆腐干絲容易與以下食材混淆: ${confusions.join('、')}`);
console.log('');

// 4. 測試區分特徵
const features = asianCuisineKB.getDistinguishingFeatures('豆腐干絲');
console.log('🔎 豆腐干絲的區分特徵：');
features.forEach(feature => {
  console.log(`  - ${feature}`);
});
console.log('');

// 5. 測試料理模式
console.log('🥗 涼拌菜常見食材：');
const coldDishIngredients = asianCuisineKB.getCommonIngredientsForDish('涼拌菜');
console.log(`  ${coldDishIngredients.join('、')}`);
console.log('');

// 6. 測試食材組合驗證
console.log('✅ 食材組合驗證：');
const validation1 = asianCuisineKB.validateFoodCombination(['豆腐干絲', '麵條']);
console.log(`  - 豆腐干絲 + 麵條: ${validation1.valid ? '✓ 合理' : '✗ 有警告'}`);
if (validation1.warnings.length > 0) {
  validation1.warnings.forEach(w => console.log(`    警告: ${w}`));
}
console.log('');

const validation2 = asianCuisineKB.validateFoodCombination(['豆腐干絲', '芹菜', '胡蘿蔔']);
console.log(`  - 豆腐干絲 + 芹菜 + 胡蘿蔔: ${validation2.valid ? '✓ 合理' : '✗ 有警告'}`);
if (validation2.suggestions.length > 0) {
  validation2.suggestions.forEach(s => console.log(`    建議: ${s}`));
}
console.log('');

// 7. 測試視覺特徵匹配
console.log('👁️  視覺特徵匹配測試：');
const imageFeatures = {
  dominantColors: ['淡黃色', '米白色'],
  textureType: 'rough' as const,
  shapePatterns: ['細長條狀', '絲狀'],
  estimatedComplexity: 5,
  hasMultipleComponents: false
};

const matches = asianCuisineKB.matchFoodItemsByVisualFeatures(imageFeatures, {
  threshold: 0.3
});

console.log(`  找到 ${matches.length} 個匹配項：`);
matches.slice(0, 5).forEach((match, index) => {
  console.log(`  ${index + 1}. ${match.foodItem.name} (信心度: ${(match.confidence * 100).toFixed(1)}%)`);
  console.log(`     匹配特徵: ${match.matchedFeatures.join('、')}`);
});
console.log('');

console.log('✅ 知識庫驗證完成！');
console.log(`\n總結: 知識庫包含 ${stats.totalFoodItems} 種亞洲食材和 ${stats.totalDishPatterns} 種料理模式`);
