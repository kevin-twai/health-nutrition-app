#!/usr/bin/env ts-node
/**
 * 營養資料庫初始化腳本
 * 用於將營養資料導入 MongoDB
 */

import { mongodb } from '../database/mongodb';
import { NutritionDatabaseSeeder } from '../database/seeds/nutrition-data';

async function main() {
  try {
    console.log('🚀 開始初始化營養資料庫...\n');
    
    // 連接資料庫
    console.log('📡 連接 MongoDB...');
    await mongodb.connect();
    console.log('✅ MongoDB 連接成功\n');
    
    // 初始化營養資料
    console.log('📊 開始導入營養資料...');
    await NutritionDatabaseSeeder.seedNutritionDatabase();
    console.log('✅ 營養資料導入完成\n');
    
    // 驗證資料完整性
    console.log('🔍 驗證資料完整性...');
    const validation = await NutritionDatabaseSeeder.validateNutritionData();
    
    if (validation.valid) {
      console.log('✅ 資料驗證通過');
    } else {
      console.log('⚠️  資料驗證發現問題:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // 顯示統計資訊
    const db = mongodb.getDb();
    const collection = db.collection('nutrition_database');
    const totalCount = await collection.countDocuments();
    
    console.log('\n📈 資料庫統計:');
    console.log(`   總食物數量: ${totalCount} 筆`);
    
    // 按類別統計
    const categories = await collection.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n   各類別食物數量:');
    categories.forEach(cat => {
      console.log(`   - ${cat._id}: ${cat.count} 筆`);
    });
    
    console.log('\n✨ 營養資料庫初始化完成！');
    
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
    process.exit(1);
  } finally {
    await mongodb.close();
    process.exit(0);
  }
}

// 執行主函數
main();
