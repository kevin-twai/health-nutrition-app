#!/usr/bin/env ts-node
/**
 * 驗證營養資料完整性
 */

import { taiwanFoodNutritionData } from '../database/seeds/nutrition-data';
import { extendedTaiwanFoodNutritionData } from '../database/seeds/nutrition-data-extended';

console.log('🔍 驗證營養資料...\n');

// 合併所有資料
const allData = [...taiwanFoodNutritionData, ...extendedTaiwanFoodNutritionData];

console.log(`📊 總食物數量: ${allData.length} 筆\n`);

// 檢查必要欄位
const requiredFields = ['food_code', 'food_name', 'food_name_en', 'category', 'energy_kcal', 'protein_g', 'fat_g', 'carbohydrate_g'];
let missingFields = 0;

allData.forEach((item, index) => {
  requiredFields.forEach(field => {
    if (!(field in item)) {
      console.log(`❌ 第 ${index + 1} 筆資料缺少欄位: ${field}`);
      missingFields++;
    }
  });
});

if (missingFields === 0) {
  console.log('✅ 所有資料包含必要欄位\n');
} else {
  console.log(`⚠️  發現 ${missingFields} 個缺少欄位的問題\n`);
}

// 檢查食物代碼唯一性
const foodCodes = allData.map(item => item.food_code);
const uniqueCodes = new Set(foodCodes);

if (foodCodes.length === uniqueCodes.size) {
  console.log('✅ 所有食物代碼唯一\n');
} else {
  console.log(`⚠️  發現重複的食物代碼\n`);
  const duplicates = foodCodes.filter((code, index) => foodCodes.indexOf(code) !== index);
  console.log('重複代碼:', [...new Set(duplicates)]);
}

// 按類別統計
const categories: Record<string, number> = {};
allData.forEach(item => {
  categories[item.category] = (categories[item.category] || 0) + 1;
});

console.log('📈 各類別統計:');
Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
  console.log(`   ${category}: ${count} 筆`);
});

console.log('\n✨ 驗證完成！');
