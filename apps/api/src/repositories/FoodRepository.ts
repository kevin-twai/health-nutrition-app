// @ts-nocheck
import { Db, ObjectId } from 'mongodb';
import Redis from 'ioredis';
import { FoodItem, FoodCategory, NutritionData } from '../types/shared';
import { 
  MongoDBBaseRepository, 
  QueryOptions, 
  PaginatedResult, 
  SearchResult,
  NotFoundError 
} from './BaseRepository';
import { 
  FoodItemDocument, 
  NutritionDatabaseDocument,
  convertNutritionDbToFoodItem,
  convertNutritionDbToStandard 
} from '../database/mongodb';

// 搜尋選項介面
interface FoodSearchOptions {
  query?: string;
  category?: FoodCategory;
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  tags?: string[];
  verified?: boolean;
  source?: string;
  limit?: number;
  offset?: number;
}

export class FoodRepository extends MongoDBBaseRepository<FoodItem> {
  private nutritionDbCollection: any;

  constructor(db: Db, redis?: Redis) {
    super(db, 'food_items', redis);
    this.nutritionDbCollection = db.collection<NutritionDatabaseDocument>('nutrition_database');
  }

  // 根據 ID 查找食物
  async findById(id: string): Promise<FoodItem | null> {
    // 先檢查快取
    const cached = await this.getFromCache(`food:${id}`);
    if (cached) {
      return cached as FoodItem;
    }

    try {
      let objectId: ObjectId;
      try {
        objectId = new ObjectId(id);
      } catch {
        // 如果不是有效的 ObjectId，嘗試作為字串查詢
        const result = await this.collection.findOne({ id: id });
        if (!result) return null;
        
        const foodItem = this.mapToFoodItem(result);
        await this.setCache(`food:${id}`, foodItem, 3600); // 1小時
        return foodItem;
      }

      const result = await this.collection.findOne({ _id: objectId });
      if (!result) return null;

      const foodItem = this.mapToFoodItem(result);
      await this.setCache(`food:${id}`, foodItem, 3600);
      return foodItem;
    } catch (error) {
      console.error('查找食物時發生錯誤:', error);
      return null;
    }
  }

  // 查找所有食物
  async findAll(limit: number = 50, offset: number = 0): Promise<FoodItem[]> {
    const cacheKey = `foods:all:${limit}:${offset}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached as FoodItem[];
    }

    const results = await this.collection
      .find({})
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const foods = results.map(doc => this.mapToFoodItem(doc));
    await this.setCache(cacheKey, foods, 1800); // 30分鐘

    return foods;
  }

  // 建立新食物
  async create(foodData: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    const document: Omit<FoodItemDocument, '_id'> = {
      ...foodData,
      id: new ObjectId().toString(),
      verified: false,
      source: 'user_contributed',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await this.collection.insertOne(document as FoodItemDocument);
    const newFood = await this.collection.findOne({ _id: result.insertedId });
    
    if (!newFood) {
      throw new Error('建立食物失敗');
    }

    // 清除相關快取
    await this.deleteCachePattern('foods:*');

    return this.mapToFoodItem(newFood);
  }

  // 更新食物
  async update(id: string, updateData: Partial<FoodItem>): Promise<FoodItem | null> {
    try {
      const objectId = new ObjectId(id);
      
      const updateDoc = {
        ...updateData,
        updated_at: new Date()
      };

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        return null;
      }

      // 清除快取
      await this.deleteFromCache(`food:${id}`);
      await this.deleteCachePattern('foods:*');

      return this.mapToFoodItem(result.value);
    } catch (error) {
      console.error('更新食物時發生錯誤:', error);
      return null;
    }
  }

  // 刪除食物
  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.deleteOne({ _id: objectId });
      
      if (result.deletedCount === 0) {
        return false;
      }

      // 清除快取
      await this.deleteFromCache(`food:${id}`);
      await this.deleteCachePattern('foods:*');

      return true;
    } catch (error) {
      console.error('刪除食物時發生錯誤:', error);
      return false;
    }
  }

  // 搜尋食物
  async search(options: FoodSearchOptions): Promise<SearchResult<FoodItem>> {
    const {
      query = '',
      category,
      minCalories,
      maxCalories,
      minProtein,
      maxProtein,
      tags = [],
      verified,
      source,
      limit = 20,
      offset = 0
    } = options;

    // 建構搜尋條件
    const searchConditions: any = {};

    // 文字搜尋
    if (query) {
      searchConditions.$or = [
        { name: { $regex: query, $options: 'i' } },
        { name_en: { $regex: query, $options: 'i' } },
        { name_zh: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    // 分類篩選
    if (category) {
      searchConditions.category = category;
    }

    // 營養成分篩選
    if (minCalories !== undefined || maxCalories !== undefined) {
      searchConditions['nutritionPer100g.calories'] = {};
      if (minCalories !== undefined) {
        searchConditions['nutritionPer100g.calories'].$gte = minCalories;
      }
      if (maxCalories !== undefined) {
        searchConditions['nutritionPer100g.calories'].$lte = maxCalories;
      }
    }

    if (minProtein !== undefined || maxProtein !== undefined) {
      searchConditions['nutritionPer100g.protein'] = {};
      if (minProtein !== undefined) {
        searchConditions['nutritionPer100g.protein'].$gte = minProtein;
      }
      if (maxProtein !== undefined) {
        searchConditions['nutritionPer100g.protein'].$lte = maxProtein;
      }
    }

    // 標籤篩選
    if (tags.length > 0) {
      searchConditions.tags = { $in: tags };
    }

    // 驗證狀態篩選
    if (verified !== undefined) {
      searchConditions.verified = verified;
    }

    // 資料來源篩選
    if (source) {
      searchConditions.source = source;
    }

    // 執行搜尋
    const [results, total] = await Promise.all([
      this.collection
        .find(searchConditions)
        .sort({ verified: -1, created_at: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(searchConditions)
    ]);

    const items = results.map(doc => this.mapToFoodItem(doc));

    // 生成搜尋建議
    const suggestions = await this.generateSearchSuggestions(query, category);

    return {
      items,
      total,
      query,
      filters: { category, minCalories, maxCalories, minProtein, maxProtein, tags, verified, source },
      suggestions
    };
  }

  // 根據分類查找食物
  async findByCategory(category: FoodCategory, limit: number = 50, offset: number = 0): Promise<FoodItem[]> {
    const cacheKey = `foods:category:${category}:${limit}:${offset}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached as FoodItem[];
    }

    const results = await this.collection
      .find({ category })
      .sort({ verified: -1, 'nutritionPer100g.calories': 1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const foods = results.map(doc => this.mapToFoodItem(doc));
    await this.setCache(cacheKey, foods, 1800);

    return foods;
  }

  // 根據營養成分查找相似食物
  async findSimilarFoods(targetNutrition: NutritionData, limit: number = 10): Promise<FoodItem[]> {
    const pipeline = [
      {
        $addFields: {
          similarity: {
            $subtract: [
              1,
              {
                $divide: [
                  {
                    $add: [
                      { $abs: { $subtract: ['$nutritionPer100g.calories', targetNutrition.calories] } },
                      { $multiply: [{ $abs: { $subtract: ['$nutritionPer100g.protein', targetNutrition.protein] } }, 4] },
                      { $multiply: [{ $abs: { $subtract: ['$nutritionPer100g.carbohydrates', targetNutrition.carbohydrates] } }, 4] },
                      { $multiply: [{ $abs: { $subtract: ['$nutritionPer100g.fat', targetNutrition.fat] } }, 9] }
                    ]
                  },
                  1000
                ]
              }
            ]
          }
        }
      },
      { $sort: { similarity: -1 } },
      { $limit: limit }
    ];

    const results = await this.collection.aggregate(pipeline).toArray();
    return results.map(doc => this.mapToFoodItem(doc));
  }

  // 從營養資料庫搜尋食物
  async searchFromNutritionDatabase(query: string, limit: number = 20): Promise<FoodItem[]> {
    const cacheKey = `nutrition_db:search:${query}:${limit}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached as FoodItem[];
    }

    const searchConditions = {
      $or: [
        { food_name: { $regex: query, $options: 'i' } },
        { food_name_en: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    };

    const results = await this.nutritionDbCollection
      .find(searchConditions)
      .limit(limit)
      .toArray();

    const foods = results.map((doc: NutritionDatabaseDocument) => convertNutritionDbToFoodItem(doc));
    await this.setCache(cacheKey, foods, 3600);

    return foods;
  }

  // 獲取熱門食物
  async getPopularFoods(limit: number = 20): Promise<FoodItem[]> {
    const cacheKey = `foods:popular:${limit}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached as FoodItem[];
    }

    // 這裡可以根據食物記錄的頻率來判斷熱門程度
    // 暫時使用驗證狀態和建立時間排序
    const results = await this.collection
      .find({ verified: true })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    const foods = results.map(doc => this.mapToFoodItem(doc));
    await this.setCache(cacheKey, foods, 3600);

    return foods;
  }

  // 獲取推薦食物 (基於營養均衡)
  async getRecommendedFoods(targetCalories: number, limit: number = 10): Promise<FoodItem[]> {
    const pipeline = [
      {
        $addFields: {
          nutritionScore: {
            $add: [
              // 蛋白質密度分數 (蛋白質克數 / 100大卡)
              { $multiply: [{ $divide: ['$nutritionPer100g.protein', '$nutritionPer100g.calories'] }, 30] },
              // 纖維密度分數
              { $multiply: [{ $divide: ['$nutritionPer100g.fiber', '$nutritionPer100g.calories'] }, 20] },
              // 熱量適中分數
              {
                $subtract: [
                  10,
                  { $abs: { $subtract: ['$nutritionPer100g.calories', targetCalories] } }
                ]
              }
            ]
          }
        }
      },
      { $match: { verified: true, nutritionScore: { $gt: 0 } } },
      { $sort: { nutritionScore: -1 } },
      { $limit: limit }
    ];

    const results = await this.collection.aggregate(pipeline).toArray();
    return results.map(doc => this.mapToFoodItem(doc));
  }

  // 分頁查詢食物
  async findWithPagination(options: QueryOptions): Promise<PaginatedResult<FoodItem>> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const searchConditions = options.filters || {};

    // 計算總數
    const total = await this.collection.countDocuments(searchConditions);

    // 獲取資料
    const results = await this.collection
      .find(searchConditions)
      .sort({ verified: -1, created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const foods = results.map(doc => this.mapToFoodItem(doc));

    return {
      data: foods,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    };
  }

  // 生成搜尋建議
  private async generateSearchSuggestions(query: string, category?: FoodCategory): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const pipeline = [
      {
        $match: {
          $and: [
            category ? { category } : {},
            {
              $or: [
                { name: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
              ]
            }
          ]
        }
      },
      { $unwind: '$tags' },
      { $match: { tags: { $regex: query, $options: 'i' } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 1 } }
    ];

    const results = await this.collection.aggregate(pipeline).toArray();
    return results.map(result => result._id);
  }

  // 將文件映射為 FoodItem 物件
  private mapToFoodItem(doc: FoodItemDocument): FoodItem {
    return {
      id: doc._id?.toString() || doc.id,
      name: doc.name,
      category: doc.category,
      nutritionPer100g: doc.nutritionPer100g,
      commonPortions: doc.commonPortions,
      tags: doc.tags
    };
  }
}