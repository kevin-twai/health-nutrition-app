import { mongodb, NutritionDatabaseDocument } from '../mongodb';
import { FoodCategory } from '../../types/shared';

// 台灣常見食物營養資料庫 (基於台灣食品營養成分資料庫)
export const taiwanFoodNutritionData: Omit<NutritionDatabaseDocument, '_id' | 'created_at' | 'updated_at'>[] = [
  // 穀類
  {
    food_code: 'TW001',
    food_name: '白米飯',
    food_name_en: 'Cooked White Rice',
    category: 'grains',
    subcategory: '米飯類',
    energy_kcal: 183,
    protein_g: 2.6,
    fat_g: 0.3,
    carbohydrate_g: 40.1,
    fiber_g: 0.4,
    sugar_g: 0.1,
    sodium_mg: 1,
    calcium_mg: 3,
    iron_mg: 0.8,
    magnesium_mg: 12,
    phosphorus_mg: 43,
    potassium_mg: 35,
    zinc_mg: 0.6,
    thiamine: 0.02,
    vitamin_b2_mg: 0.01,
    niacin_mg: 1.2,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  {
    food_code: 'TW002',
    food_name: '糙米飯',
    food_name_en: 'Cooked Brown Rice',
    category: 'grains',
    subcategory: '米飯類',
    energy_kcal: 185,
    protein_g: 2.9,
    fat_g: 0.9,
    carbohydrate_g: 39.4,
    fiber_g: 1.4,
    sugar_g: 0.2,
    sodium_mg: 2,
    calcium_mg: 10,
    iron_mg: 0.7,
    magnesium_mg: 43,
    phosphorus_mg: 83,
    potassium_mg: 86,
    zinc_mg: 0.8,
    vitamin_b1_mg: 0.16,
    vitamin_b2_mg: 0.04,
    niacin_mg: 2.9,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  
  // 蔬菜類
  {
    food_code: 'TW003',
    food_name: '高麗菜',
    food_name_en: 'Cabbage',
    category: 'vegetables',
    subcategory: '葉菜類',
    energy_kcal: 23,
    protein_g: 1.3,
    fat_g: 0.1,
    carbohydrate_g: 5.2,
    fiber_g: 2.3,
    sugar_g: 2.8,
    sodium_mg: 18,
    calcium_mg: 47,
    iron_mg: 0.6,
    magnesium_mg: 15,
    phosphorus_mg: 32,
    potassium_mg: 246,
    zinc_mg: 0.2,
    vitamin_a_ug: 5,
    vitamin_c_mg: 32.2,
    vitamin_k_ug: 76,
    folate_ug: 43,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  {
    food_code: 'TW004',
    food_name: '菠菜',
    food_name_en: 'Spinach',
    category: 'vegetables',
    subcategory: '葉菜類',
    energy_kcal: 23,
    protein_g: 2.9,
    fat_g: 0.4,
    carbohydrate_g: 3.6,
    fiber_g: 2.2,
    sugar_g: 0.4,
    sodium_mg: 79,
    calcium_mg: 99,
    iron_mg: 2.7,
    magnesium_mg: 79,
    phosphorus_mg: 49,
    potassium_mg: 558,
    zinc_mg: 0.5,
    vitamin_a_ug: 469,
    vitamin_c_mg: 28.1,
    vitamin_k_ug: 483,
    folate_ug: 194,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  
  // 水果類
  {
    food_code: 'TW005',
    food_name: '蘋果',
    food_name_en: 'Apple',
    category: 'fruits',
    subcategory: '溫帶水果',
    energy_kcal: 52,
    protein_g: 0.3,
    fat_g: 0.2,
    carbohydrate_g: 13.8,
    fiber_g: 2.4,
    sugar_g: 10.4,
    sodium_mg: 1,
    calcium_mg: 6,
    iron_mg: 0.1,
    magnesium_mg: 5,
    phosphorus_mg: 11,
    potassium_mg: 107,
    zinc_mg: 0.04,
    vitamin_a_ug: 3,
    vitamin_c_mg: 4.6,
    vitamin_k_ug: 2.2,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  {
    food_code: 'TW006',
    food_name: '香蕉',
    food_name_en: 'Banana',
    category: 'fruits',
    subcategory: '熱帶水果',
    energy_kcal: 89,
    protein_g: 1.1,
    fat_g: 0.3,
    carbohydrate_g: 22.8,
    fiber_g: 2.6,
    sugar_g: 12.2,
    sodium_mg: 1,
    calcium_mg: 5,
    iron_mg: 0.3,
    magnesium_mg: 27,
    phosphorus_mg: 22,
    potassium_mg: 358,
    zinc_mg: 0.2,
    vitamin_a_ug: 3,
    vitamin_c_mg: 8.7,
    vitamin_b6_mg: 0.4,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  
  // 蛋白質類
  {
    food_code: 'TW007',
    food_name: '雞胸肉',
    food_name_en: 'Chicken Breast',
    category: 'proteins',
    subcategory: '禽肉類',
    energy_kcal: 165,
    protein_g: 31.0,
    fat_g: 3.6,
    carbohydrate_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 74,
    calcium_mg: 15,
    iron_mg: 1.0,
    magnesium_mg: 29,
    phosphorus_mg: 228,
    potassium_mg: 256,
    zinc_mg: 1.0,
    vitamin_b6_mg: 0.5,
    niacin_mg: 8.5,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  {
    food_code: 'TW008',
    food_name: '雞蛋',
    food_name_en: 'Chicken Egg',
    category: 'proteins',
    subcategory: '蛋類',
    energy_kcal: 155,
    protein_g: 12.6,
    fat_g: 10.6,
    carbohydrate_g: 0.7,
    fiber_g: 0,
    sugar_g: 0.4,
    sodium_mg: 124,
    calcium_mg: 50,
    iron_mg: 1.8,
    magnesium_mg: 12,
    phosphorus_mg: 172,
    potassium_mg: 126,
    zinc_mg: 1.1,
    vitamin_a_ug: 160,
    vitamin_d_ug: 2.0,
    vitamin_b12_ug: 1.1,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  
  // 豆類
  {
    food_code: 'TW009',
    food_name: '板豆腐',
    food_name_en: 'Firm Tofu',
    category: 'proteins',
    subcategory: '豆製品',
    energy_kcal: 87,
    protein_g: 8.5,
    fat_g: 4.2,
    carbohydrate_g: 4.2,
    fiber_g: 0.4,
    sugar_g: 0.6,
    sodium_mg: 7,
    calcium_mg: 140,
    iron_mg: 1.4,
    magnesium_mg: 37,
    phosphorus_mg: 81,
    potassium_mg: 237,
    zinc_mg: 0.8,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  },
  
  // 乳製品
  {
    food_code: 'TW010',
    food_name: '全脂牛奶',
    food_name_en: 'Whole Milk',
    category: 'dairy',
    subcategory: '液態乳',
    energy_kcal: 61,
    protein_g: 3.2,
    fat_g: 3.3,
    carbohydrate_g: 4.7,
    fiber_g: 0,
    sugar_g: 4.7,
    sodium_mg: 43,
    calcium_mg: 113,
    iron_mg: 0.03,
    magnesium_mg: 11,
    phosphorus_mg: 84,
    potassium_mg: 150,
    zinc_mg: 0.4,
    vitamin_a_ug: 46,
    vitamin_d_ug: 1.3,
    vitamin_b12_ug: 0.4,
    data_source: '台灣食品營養成分資料庫',
    reference_year: 2023
  }
];

// 營養資料庫初始化類別
export class NutritionDatabaseSeeder {
  // 初始化營養資料庫
  static async seedNutritionDatabase(): Promise<void> {
    try {
      console.log('開始初始化營養資料庫...');
      
      const db = mongodb.getDb();
      const collection = db.collection<NutritionDatabaseDocument>('nutrition_database');
      
      // 檢查是否已經有資料
      const existingCount = await collection.countDocuments();
      if (existingCount > 0) {
        console.log(`營養資料庫已存在 ${existingCount} 筆資料，跳過初始化`);
        return;
      }
      
      // 準備插入資料
      const documentsToInsert = taiwanFoodNutritionData.map(item => ({
        ...item,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      // 批量插入資料
      const result = await collection.insertMany(documentsToInsert);
      console.log(`成功插入 ${result.insertedCount} 筆營養資料`);
      
      // 建立額外索引
      await this.createAdditionalIndexes(collection);
      
      console.log('營養資料庫初始化完成');
    } catch (error) {
      console.error('營養資料庫初始化失敗:', error);
      throw error;
    }
  }
  
  // 建立額外索引
  private static async createAdditionalIndexes(collection: any): Promise<void> {
    try {
      // 複合索引：分類 + 熱量
      await collection.createIndex({ category: 1, energy_kcal: 1 });
      
      // 複合索引：蛋白質含量 + 分類
      await collection.createIndex({ protein_g: -1, category: 1 });
      
      // 複合索引：纖維含量 + 分類
      await collection.createIndex({ fiber_g: -1, category: 1 });
      
      // 地理位置相關索引 (如果有的話)
      // await collection.createIndex({ location: '2dsphere' });
      
      console.log('額外索引建立完成');
    } catch (error) {
      console.error('建立額外索引時發生錯誤:', error);
    }
  }
  
  // 匯入 USDA 營養資料 (預留功能)
  static async importUSDAData(filePath: string): Promise<void> {
    // 這裡可以實作從 USDA 資料庫匯入資料的邏輯
    console.log('USDA 資料匯入功能待實作');
  }
  
  // 更新營養資料
  static async updateNutritionData(foodCode: string, updateData: Partial<NutritionDatabaseDocument>): Promise<void> {
    try {
      const db = mongodb.getDb();
      const collection = db.collection<NutritionDatabaseDocument>('nutrition_database');
      
      const result = await collection.updateOne(
        { food_code: foodCode },
        { 
          $set: { 
            ...updateData, 
            updated_at: new Date() 
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error(`找不到食物代碼 ${foodCode} 的資料`);
      }
      
      console.log(`成功更新食物代碼 ${foodCode} 的營養資料`);
    } catch (error) {
      console.error('更新營養資料失敗:', error);
      throw error;
    }
  }
  
  // 刪除營養資料
  static async deleteNutritionData(foodCode: string): Promise<void> {
    try {
      const db = mongodb.getDb();
      const collection = db.collection<NutritionDatabaseDocument>('nutrition_database');
      
      const result = await collection.deleteOne({ food_code: foodCode });
      
      if (result.deletedCount === 0) {
        throw new Error(`找不到食物代碼 ${foodCode} 的資料`);
      }
      
      console.log(`成功刪除食物代碼 ${foodCode} 的營養資料`);
    } catch (error) {
      console.error('刪除營養資料失敗:', error);
      throw error;
    }
  }
  
  // 驗證營養資料完整性
  static async validateNutritionData(): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const db = mongodb.getDb();
      const collection = db.collection<NutritionDatabaseDocument>('nutrition_database');
      
      const errors: string[] = [];
      
      // 檢查必要欄位
      const missingRequiredFields = await collection.find({
        $or: [
          { food_code: { $exists: false } },
          { food_name: { $exists: false } },
          { energy_kcal: { $exists: false } },
          { protein_g: { $exists: false } },
          { fat_g: { $exists: false } },
          { carbohydrate_g: { $exists: false } }
        ]
      }).toArray();
      
      if (missingRequiredFields.length > 0) {
        errors.push(`發現 ${missingRequiredFields.length} 筆資料缺少必要欄位`);
      }
      
      // 檢查數值範圍
      const invalidValues = await collection.find({
        $or: [
          { energy_kcal: { $lt: 0 } },
          { protein_g: { $lt: 0 } },
          { fat_g: { $lt: 0 } },
          { carbohydrate_g: { $lt: 0 } }
        ]
      }).toArray();
      
      if (invalidValues.length > 0) {
        errors.push(`發現 ${invalidValues.length} 筆資料有無效的數值`);
      }
      
      // 檢查重複的食物代碼
      const duplicateCodes = await collection.aggregate([
        { $group: { _id: '$food_code', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]).toArray();
      
      if (duplicateCodes.length > 0) {
        errors.push(`發現 ${duplicateCodes.length} 個重複的食物代碼`);
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('驗證營養資料時發生錯誤:', error);
      return {
        valid: false,
        errors: ['驗證過程中發生錯誤']
      };
    }
  }
}