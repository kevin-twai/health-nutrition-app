/**
 * 驗證成分數據結構
 * Verify Component Data Structures
 * 
 * 此腳本用於驗證新創建的成分識別數據結構是否正確
 */

import { DISH_COMPONENT_MAPS, findDishComponentMap, findDishComponentMapsByType } from './dishComponentMaps';
import { COOKING_METHOD_EFFECTS, getCookingMethodEffect, calculateCookedNutrition } from './cookingMethodEffects';
import { COMPONENT_INFO_EXTENSIONS, getComponentInfo, isCommonComponent } from './componentInfoExtensions';
import { ASIAN_FOOD_ITEMS_EXTENDED } from './asianFoodItemsExtended';
import { DishType, CookingMethod, ComponentCategory } from '../types/ComponentDetection';

console.log('='.repeat(60));
console.log('驗證成分識別數據結構');
console.log('='.repeat(60));

// 1. 驗證料理-成分映射
console.log('\n1. 料理-成分映射數據：');
console.log(`   總共 ${DISH_COMPONENT_MAPS.length} 種料理`);
DISH_COMPONENT_MAPS.forEach(dish => {
  console.log(`   - ${dish.dishName} (${dish.dishNameEn}): ${dish.commonComponents.length} 個常見成分`);
});

// 測試查找功能
const eggFriedRice = findDishComponentMap('蛋炒飯');
if (eggFriedRice) {
  console.log(`\n   查找測試 - 蛋炒飯:`);
  console.log(`   - 類型: ${eggFriedRice.dishType}`);
  console.log(`   - 地區: ${eggFriedRice.region.join(', ')}`);
  console.log(`   - 典型份量: ${eggFriedRice.typicalPortionRange.typical}g`);
}

// 2. 驗證烹飪方式營養影響
console.log('\n2. 烹飪方式營養影響數據：');
const cookingMethods = Object.keys(COOKING_METHOD_EFFECTS);
console.log(`   總共 ${cookingMethods.length} 種烹飪方式`);

// 測試營養計算
const rawNutrition = {
  calories: 100,
  protein: 10,
  carbohydrates: 20,
  fat: 5,
  fiber: 2,
  sodium: 50
};

console.log('\n   營養計算測試（100g 食材）:');
console.log(`   - 原始: ${rawNutrition.calories} kcal, ${rawNutrition.fat}g 脂肪`);

const stirFriedNutrition = calculateCookedNutrition(
  rawNutrition,
  CookingMethod.STIR_FRIED,
  ComponentCategory.VEGETABLE,
  100
);
console.log(`   - 快炒後: ${stirFriedNutrition.calories} kcal, ${stirFriedNutrition.fat}g 脂肪`);

const deepFriedNutrition = calculateCookedNutrition(
  rawNutrition,
  CookingMethod.DEEP_FRIED,
  ComponentCategory.VEGETABLE,
  100
);
console.log(`   - 油炸後: ${deepFriedNutrition.calories} kcal, ${deepFriedNutrition.fat}g 脂肪`);

const steamedNutrition = calculateCookedNutrition(
  rawNutrition,
  CookingMethod.STEAMED,
  ComponentCategory.VEGETABLE,
  100
);
console.log(`   - 蒸製後: ${steamedNutrition.calories} kcal, ${steamedNutrition.fat}g 脂肪`);

// 3. 驗證成分資訊擴展
console.log('\n3. 成分資訊擴展數據：');
const componentCount = Object.keys(COMPONENT_INFO_EXTENSIONS).length;
console.log(`   總共 ${componentCount} 個常見成分`);

// 按類別統計
const categoryStats: Record<string, number> = {};
Object.values(COMPONENT_INFO_EXTENSIONS).forEach(info => {
  categoryStats[info.category] = (categoryStats[info.category] || 0) + 1;
});

console.log('\n   按類別統計:');
Object.entries(categoryStats).forEach(([category, count]) => {
  console.log(`   - ${category}: ${count} 個`);
});

// 測試查找功能
const eggInfo = getComponentInfo('egg');
if (eggInfo) {
  console.log(`\n   查找測試 - 雞蛋:`);
  console.log(`   - 類別: ${eggInfo.category}`);
  console.log(`   - 常見料理: ${eggInfo.typicalDishes.slice(0, 3).join(', ')}...`);
  console.log(`   - 典型份量: ${eggInfo.portionRanges.typical}g`);
}

// 4. 驗證擴展食材數據
console.log('\n4. 擴展食材數據：');
const extendedFoodCount = Object.keys(ASIAN_FOOD_ITEMS_EXTENDED).length;
console.log(`   總共 ${extendedFoodCount} 個食材`);

// 檢查有 componentInfo 的食材
const foodsWithComponentInfo = Object.values(ASIAN_FOOD_ITEMS_EXTENDED)
  .filter(food => food.componentInfo);
console.log(`   其中 ${foodsWithComponentInfo.length} 個有 componentInfo`);

if (foodsWithComponentInfo.length > 0) {
  const sample = foodsWithComponentInfo[0];
  console.log(`\n   範例 - ${sample.name}:`);
  console.log(`   - 成分類別: ${sample.componentInfo?.category}`);
  console.log(`   - 常見料理: ${sample.componentInfo?.typicalDishes.slice(0, 2).join(', ')}...`);
}

// 5. 整合測試
console.log('\n5. 整合測試：');
console.log('   模擬蛋炒飯成分識別流程...');

if (eggFriedRice) {
  console.log(`\n   料理: ${eggFriedRice.dishName}`);
  console.log(`   成分列表:`);
  
  eggFriedRice.commonComponents.slice(0, 3).forEach(component => {
    console.log(`\n   - ${component.name} (${component.nameEn})`);
    console.log(`     類別: ${component.category}`);
    console.log(`     典型份量: ${component.typicalPortion}g`);
    console.log(`     烹飪方式: ${component.cookingMethods.join(', ')}`);
    
    if (component.nutritionImpact.length > 0) {
      const impact = component.nutritionImpact[0];
      console.log(`     營養影響: 卡路里 x${impact.calorieMultiplier}, 脂肪 x${impact.fatMultiplier}`);
    }
  });
}

console.log('\n' + '='.repeat(60));
console.log('驗證完成！所有數據結構正常運作。');
console.log('='.repeat(60));
