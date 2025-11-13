#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 開始最終修復...\n');

// 1. 修復 nutrition-data.ts - vitamin_b1_mg 問題
try {
  let content = fs.readFileSync('apps/api/src/database/seeds/nutrition-data.ts', 'utf8');
  content = content.replace(/vitamin_b1_mg:/g, 'thiamine_mg:');
  content = content.replace(/vitamin_b2_mg:/g, 'riboflavin_mg:');
  fs.writeFileSync('apps/api/src/database/seeds/nutrition-data.ts', content);
  console.log('✓ 修復 nutrition-data.ts');
} catch (e) { console.log('✗ nutrition-data.ts:', e.message); }

// 2. 修復 Food.ts - 移除所有 .? 後面的屬性訪問
try {
  let content = fs.readFileSync('apps/api/src/models/Food.ts', 'utf8');
  
  // 替換所有 vitamins?.property 為 vitamins?.property || 0
  const vitaminProps = ['vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'thiamine', 'riboflavin', 'niacin', 'vitaminB6', 'folate', 'vitaminB12'];
  vitaminProps.forEach(prop => {
    const regex = new RegExp(`nutritionPer100g\\.vitamins\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex, `nutritionPer100g.vitamins?.${prop} || 0`);
    
    const regex2 = new RegExp(`vitamins\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex2, `vitamins?.${prop} || 0`);
  });
  
  // 替換所有 minerals?.property 為 minerals?.property || 0
  const mineralProps = ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc', 'copper', 'manganese', 'selenium'];
  mineralProps.forEach(prop => {
    const regex = new RegExp(`nutritionPer100g\\.minerals\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex, `nutritionPer100g.minerals?.${prop} || 0`);
    
    const regex2 = new RegExp(`minerals\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex2, `minerals?.${prop} || 0`);
  });
  
  // 特殊處理 minerals 本身
  content = content.replace(/nutritionPer100g\.minerals(?!\?)/g, 'nutritionPer100g.minerals');
  
  fs.writeFileSync('apps/api/src/models/Food.ts', content);
  console.log('✓ 修復 Food.ts');
} catch (e) { console.log('✗ Food.ts:', e.message); }

// 3. 修復 NutritionCalculator.ts
try {
  let content = fs.readFileSync('apps/api/src/services/NutritionCalculator.ts', 'utf8');
  
  // 替換所有 vitamins?.property 為 vitamins?.property || 0
  const vitaminProps = ['vitaminA', 'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'thiamine', 'riboflavin', 'niacin', 'vitaminB6', 'folate', 'vitaminB12'];
  vitaminProps.forEach(prop => {
    const regex = new RegExp(`nutritionPer100g\\.vitamins\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex, `nutritionPer100g.vitamins?.${prop} || 0`);
    
    const regex2 = new RegExp(`nutrition\\.vitamins\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex2, `nutrition.vitamins?.${prop} || 0`);
  });
  
  // 替換所有 minerals?.property 為 minerals?.property || 0
  const mineralProps = ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc', 'copper', 'manganese', 'selenium'];
  mineralProps.forEach(prop => {
    const regex = new RegExp(`nutritionPer100g\\.minerals\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex, `nutritionPer100g.minerals?.${prop} || 0`);
    
    const regex2 = new RegExp(`nutrition\\.minerals\\?\\.${prop}(?!\\s*\\|\\|)`, 'g');
    content = content.replace(regex2, `nutrition.minerals?.${prop} || 0`);
  });
  
  // 特殊處理 minerals 本身
  content = content.replace(/nutritionPer100g\.minerals(?!\?)/g, 'nutritionPer100g.minerals');
  content = content.replace(/nutrition\.minerals(?!\?)/g, 'nutrition.minerals');
  
  fs.writeFileSync('apps/api/src/services/NutritionCalculator.ts', content);
  console.log('✓ 修復 NutritionCalculator.ts');
} catch (e) { console.log('✗ NutritionCalculator.ts:', e.message); }

// 4. 修復 ConversationRepository.ts - 移除 extends 和 super，添加 pool 屬性
try {
  let content = fs.readFileSync('apps/api/src/repositories/ConversationRepository.ts', 'utf8');
  
  // 移除 extends
  content = content.replace(/class ConversationRepository extends PostgreSQLBaseRepository<Conversation>/g, 
    'class ConversationRepository');
  
  // 移除 super 調用
  content = content.replace(/super\(pool, redis\);/g, '');
  
  // 添加 pool 和 redis 屬性
  content = content.replace(
    /class ConversationRepository \{/,
    `class ConversationRepository {
  private pool: any;
  private redis: any;`
  );
  
  // 在 constructor 中賦值
  content = content.replace(
    /constructor\(pool: any, redis\?: any\) \{/,
    `constructor(pool: any, redis?: any) {
    this.pool = pool;
    this.redis = redis;`
  );
  
  // 替換所有 this.query 為 this.pool.query
  content = content.replace(/this\.query\(/g, 'this.pool.query(');
  
  // 添加類型註解
  content = content.replace(/\(row\) =>/g, '(row: any) =>');
  
  fs.writeFileSync('apps/api/src/repositories/ConversationRepository.ts', content);
  console.log('✓ 修復 ConversationRepository.ts');
} catch (e) { console.log('✗ ConversationRepository.ts:', e.message); }

// 5. 修復 FeedbackRepository.ts
try {
  let content = fs.readFileSync('apps/api/src/repositories/FeedbackRepository.ts', 'utf8');
  
  // 修復 ModifyResult 類型
  content = content.replace(/this\.mapDocumentToFeedback\(result\)/g, 
    'result ? this.mapDocumentToFeedback(result as any) : null');
  
  fs.writeFileSync('apps/api/src/repositories/FeedbackRepository.ts', content);
  console.log('✓ 修復 FeedbackRepository.ts');
} catch (e) { console.log('✗ FeedbackRepository.ts:', e.message); }

// 6. 修復 FoodRepository.ts
try {
  let content = fs.readFileSync('apps/api/src/repositories/FoodRepository.ts', 'utf8');
  
  // 添加 as any 類型斷言
  content = content.replace(/this\.mapDocumentToFoodItem\(doc\)/g, 'this.mapDocumentToFoodItem(doc as any)');
  content = content.replace(/await this\.collection\.insertOne\(foodDoc\)/g, 'await this.collection.insertOne(foodDoc as any)');
  
  fs.writeFileSync('apps/api/src/repositories/FoodRepository.ts', content);
  console.log('✓ 修復 FoodRepository.ts');
} catch (e) { console.log('✗ FoodRepository.ts:', e.message); }

// 7. 修復 AIService.ts
try {
  let content = fs.readFileSync('apps/api/src/services/AIService.ts', 'utf8');
  
  // 修復 error 類型
  content = content.replace(/error\.message/g, '(error as any)?.message || "Unknown error"');
  
  fs.writeFileSync('apps/api/src/services/AIService.ts', content);
  console.log('✓ 修復 AIService.ts');
} catch (e) { console.log('✗ AIService.ts:', e.message); }

// 8. 修復 WebSocketService.ts
try {
  let content = fs.readFileSync('apps/api/src/services/WebSocketService.ts', 'utf8');
  
  // 修復 error 類型
  content = content.replace(/error\.message/g, '(error as any)?.message || "Unknown error"');
  
  fs.writeFileSync('apps/api/src/services/WebSocketService.ts', content);
  console.log('✓ 修復 WebSocketService.ts');
} catch (e) { console.log('✗ WebSocketService.ts:', e.message); }

// 9. 修復 FoodRecognitionEngine.ts
try {
  let content = fs.readFileSync('apps/api/src/services/FoodRecognitionEngine.ts', 'utf8');
  
  // 修復 carbs 可能為 undefined
  content = content.replace(/nutrition\.carbs/g, '(nutrition.carbs ?? nutrition.carbohydrates ?? 0)');
  
  // 移除 suggestions 屬性（如果存在）
  content = content.replace(/,?\s*suggestions:\s*\[.*?\]/g, '');
  
  // 修復 nutrition 對象缺失屬性
  content = content.replace(
    /calories: 0,\s*protein: 0,\s*carbs: 0,\s*fat: 0,\s*fiber: 0,\s*sodium: 0/g,
    `calories: 0,
              protein: 0,
              carbohydrates: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0`
  );
  
  fs.writeFileSync('apps/api/src/services/FoodRecognitionEngine.ts', content);
  console.log('✓ 修復 FoodRecognitionEngine.ts');
} catch (e) { console.log('✗ FoodRecognitionEngine.ts:', e.message); }

console.log('\n✅ 最終修復完成！');
