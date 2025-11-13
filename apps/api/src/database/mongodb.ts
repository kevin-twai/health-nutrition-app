import { MongoClient, Db, Collection, Document } from 'mongodb';
import { FoodItem, NutritionData, FoodLog } from '../types/shared';

// MongoDB 連接管理器
class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  // 單例模式獲取實例
  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  // 連接到 MongoDB
  public async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI;
      
      // 如果沒有設置 MONGODB_URI，跳過 MongoDB 連接
      if (!uri) {
        console.warn('⚠️  MONGODB_URI 未設置，跳過 MongoDB 連接（僅使用 PostgreSQL）');
        return;
      }

      const dbName = process.env.MONGODB_DB_NAME || 'health_nutrition_foods';

      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000, // 5秒超時
        connectTimeoutMS: 10000,
      });
      
      await this.client.connect();
      this.db = this.client.db(dbName);

      console.log('✅ MongoDB 連接成功');

      // 建立索引
      await this.createIndexes();
    } catch (error) {
      console.error('❌ MongoDB 連接失敗:', error);
      console.warn('⚠️  系統將在沒有 MongoDB 的情況下運行（僅使用 PostgreSQL）');
      // 不拋出錯誤，允許應用程式繼續運行
      this.client = null;
      this.db = null;
    }
  }

  // 建立索引
  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // 食物項目索引
      const foodItemsCollection = this.db.collection('food_items');
      await foodItemsCollection.createIndex({ name: 'text', 'name_en': 'text', tags: 'text' });
      await foodItemsCollection.createIndex({ category: 1 });
      await foodItemsCollection.createIndex({ 'nutritionPer100g.calories': 1 });
      await foodItemsCollection.createIndex({ barcode: 1 }, { sparse: true });

      // 食物記錄索引
      const foodLogsCollection = this.db.collection('food_logs');
      await foodLogsCollection.createIndex({ userId: 1, timestamp: -1 });
      await foodLogsCollection.createIndex({ foodId: 1 });
      await foodLogsCollection.createIndex({ mealType: 1 });
      await foodLogsCollection.createIndex({ source: 1 });

      // 營養資料庫索引
      const nutritionDbCollection = this.db.collection('nutrition_database');
      await nutritionDbCollection.createIndex({ food_code: 1 }, { unique: true });
      await nutritionDbCollection.createIndex({ food_name: 'text', food_name_en: 'text' });

      console.log('MongoDB 索引建立完成');
    } catch (error) {
      console.error('建立索引時發生錯誤:', error);
    }
  }

  // 獲取資料庫實例
  public getDb(): Db | null {
    return this.db;
  }

  // 獲取集合
  public getCollection<T extends Document = Document>(name: string): Collection<T> | null {
    if (!this.db) {
      console.warn('⚠️  MongoDB 未連接，無法獲取集合');
      return null;
    }
    return this.db.collection<T>(name);
  }
  
  // 檢查是否已連接
  public isConnected(): boolean {
    return this.db !== null && this.client !== null;
  }

  // 測試連接
  public async testConnection(): Promise<boolean> {
    try {
      if (!this.db) {
        await this.connect();
      }
      
      await this.db!.admin().ping();
      console.log('MongoDB 連接測試成功');
      return true;
    } catch (error) {
      console.error('MongoDB 連接測試失敗:', error);
      return false;
    }
  }

  // 關閉連接
  public async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('MongoDB 連接已關閉');
      }
    } catch (error) {
      console.error('關閉 MongoDB 連接時發生錯誤:', error);
    }
  }
}

// 食物資料模型介面
export interface FoodItemDocument extends FoodItem {
  _id?: string;
  name_en?: string; // 英文名稱
  name_zh?: string; // 中文名稱
  brand?: string; // 品牌
  barcode?: string; // 條碼
  images?: string[]; // 圖片 URL
  verified: boolean; // 是否已驗證
  source: 'usda' | 'taiwan_fda' | 'user_contributed' | 'manual'; // 資料來源
  created_at: Date;
  updated_at: Date;
}

// 食物記錄文件介面
export interface FoodLogDocument extends FoodLog {
  _id?: string;
  nutritionData: NutritionData; // 實際營養資料
  postgresId?: string; // PostgreSQL 中對應的記錄 ID
  created_at: Date;
}

// 營養資料庫文件介面 (USDA/台灣 FDA 格式)
export interface NutritionDatabaseDocument {
  _id?: string;
  food_code: string; // 食物代碼
  food_name: string; // 中文名稱
  food_name_en?: string; // 英文名稱
  category: string; // 分類
  subcategory?: string; // 子分類
  
  // 基本營養成分 (每100g)
  energy_kcal: number; // 熱量 (kcal)
  protein_g: number; // 蛋白質 (g)
  fat_g: number; // 脂肪 (g)
  carbohydrate_g: number; // 碳水化合物 (g)
  fiber_g: number; // 膳食纖維 (g)
  sugar_g: number; // 糖 (g)
  sodium_mg: number; // 鈉 (mg)
  
  // 維生素
  vitamin_a_ug?: number; // 維生素A (μg)
  vitamin_c_mg?: number; // 維生素C (mg)
  vitamin_d_ug?: number; // 維生素D (μg)
  vitamin_e_mg?: number; // 維生素E (mg)
  vitamin_k_ug?: number; // 維生素K (μg)
  thiamine_mg?: number; // 維生素B1 (mg)
  riboflavin_mg?: number; // 維生素B2 (mg)
  niacin_mg?: number; // 菸鹼酸 (mg)
  vitamin_b6_mg?: number; // 維生素B6 (mg)
  folate_ug?: number; // 葉酸 (μg)
  vitamin_b12_ug?: number; // 維生素B12 (μg)
  
  // 礦物質
  calcium_mg?: number; // 鈣 (mg)
  iron_mg?: number; // 鐵 (mg)
  magnesium_mg?: number; // 鎂 (mg)
  phosphorus_mg?: number; // 磷 (mg)
  potassium_mg?: number; // 鉀 (mg)
  zinc_mg?: number; // 鋅 (mg)
  copper_mg?: number; // 銅 (mg)
  manganese_mg?: number; // 錳 (mg)
  selenium_ug?: number; // 硒 (μg)
  
  // 其他資訊
  water_g?: number; // 水分 (g)
  ash_g?: number; // 灰分 (g)
  cholesterol_mg?: number; // 膽固醇 (mg)
  
  // 脂肪酸
  saturated_fat_g?: number; // 飽和脂肪 (g)
  monounsaturated_fat_g?: number; // 單元不飽和脂肪 (g)
  polyunsaturated_fat_g?: number; // 多元不飽和脂肪 (g)
  trans_fat_g?: number; // 反式脂肪 (g)
  
  // 元資料
  data_source: string; // 資料來源
  reference_year?: number; // 參考年份
  created_at: Date;
  updated_at: Date;
}

// 匯出 MongoDB 實例
export const mongodb = MongoDBConnection.getInstance();

// 輔助函數：轉換營養資料庫格式到標準格式
export function convertNutritionDbToStandard(dbDoc: NutritionDatabaseDocument): NutritionData {
  return {
    calories: dbDoc.energy_kcal || 0,
    protein: dbDoc.protein_g || 0,
    carbohydrates: dbDoc.carbohydrate_g || 0,
    fat: dbDoc.fat_g || 0,
    fiber: dbDoc.fiber_g || 0,
    sugar: dbDoc.sugar_g || 0,
    sodium: dbDoc.sodium_mg || 0,
    vitamins: {
      vitaminA: dbDoc.vitamin_a_ug || 0,
      vitaminC: dbDoc.vitamin_c_mg || 0,
      vitaminD: dbDoc.vitamin_d_ug || 0,
      vitaminE: dbDoc.vitamin_e_mg || 0,
      vitaminK: dbDoc.vitamin_k_ug || 0,
      thiamine: dbDoc.thiamine_mg || 0,
      riboflavin: dbDoc.riboflavin_mg || 0,
      niacin: dbDoc.niacin_mg || 0,
      vitaminB6: dbDoc.vitamin_b6_mg || 0,
      folate: dbDoc.folate_ug || 0,
      vitaminB12: dbDoc.vitamin_b12_ug || 0
    },
    minerals: {
      calcium: dbDoc.calcium_mg || 0,
      iron: dbDoc.iron_mg || 0,
      magnesium: dbDoc.magnesium_mg || 0,
      phosphorus: dbDoc.phosphorus_mg || 0,
      potassium: dbDoc.potassium_mg || 0,
      sodium: dbDoc.sodium_mg || 0,
      zinc: dbDoc.zinc_mg || 0,
      copper: dbDoc.copper_mg || 0,
      manganese: dbDoc.manganese_mg || 0,
      selenium: dbDoc.selenium_ug || 0
    }
  };
}

// 輔助函數：轉換標準格式到食物項目
export function convertNutritionDbToFoodItem(dbDoc: NutritionDatabaseDocument): FoodItemDocument {
  return {
    id: dbDoc._id?.toString() || dbDoc.food_code,
    name: dbDoc.food_name,
    name_en: dbDoc.food_name_en,
    name_zh: dbDoc.food_name,
    category: dbDoc.category as any, // 需要映射到 FoodCategory 枚舉
    nutritionPer100g: convertNutritionDbToStandard(dbDoc),
    commonPortions: [
      { name: '100公克', weight: 100, description: '標準份量' },
      { name: '1份', weight: 100, description: '一般份量' }
    ],
    tags: [dbDoc.category, dbDoc.subcategory].filter(Boolean) as string[],
    verified: true,
    source: dbDoc.data_source.includes('USDA') ? 'usda' : 'taiwan_fda',
    created_at: dbDoc.created_at,
    updated_at: dbDoc.updated_at
  };
}