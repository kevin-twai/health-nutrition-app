// 簡單的知識庫測試腳本（不需要 tsx）
const { AsianCuisineKnowledgeBase } = require('./apps/api/src/services/AsianCuisineKnowledgeBase.ts');

console.log('測試知識庫...');

try {
  const kb = new AsianCuisineKnowledgeBase();
  const stats = kb.getStatistics();
  
  console.log('✓ 知識庫初始化成功');
  console.log('統計資訊:', stats);
  
  // 測試查詢
  const food = kb.getFoodByName('豆腐干絲');
  console.log('✓ 查詢測試:', food ? food.name : '未找到');
  
  // 測試易混淆食材
  const confusions = kb.getConfusableFoods('豆腐干絲');
  console.log('✓ 易混淆食材:', confusions);
  
  console.log('\n所有測試通過！');
} catch (error) {
  console.error('測試失敗:', error.message);
  process.exit(1);
}
