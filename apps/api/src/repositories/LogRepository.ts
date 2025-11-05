import { Pool } from 'pg';
import { Db, ObjectId } from 'mongodb';
import Redis from 'ioredis';
import { FoodLog, MealType, LogSource, NutritionData } from '@health-tracker/shared-types';
import { 
  PostgreSQLBaseRepository, 
  QueryOptions, 
  PaginatedResult,
  NotFoundError 
} from './BaseRepository';
import { FoodLogDocument } from '../database/mongodb';

// 食物記錄實體介面 (PostgreSQL)
interface FoodLogEntity {
  id: string;
  user_id: string;
  food_id: string;
  food_name: string;
  portion: number;
  meal_type: MealType;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  source: LogSource;
  confidence?: number;
  logged_at: Date;
  created_at: Date;
}

// 營養統計介面
interface NutritionStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number;
  mealBreakdown: {
    [key in MealType]: {
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
      count: number;
    };
  };
}

// 日期範圍查詢選項
interface DateRangeOptions {
  userId: string;
  startDate: Date;
  endDate: Date;
  mealType?: MealType;
  source?: LogSource;
  limit?: number;
  offset?: number;
}

export class LogRepository extends PostgreSQLBaseRepository<FoodLog> {
  private mongoDb: Db;

  constructor(pool: Pool, mongoDb: Db, redis?: Redis) {
    super(pool, 'food_logs', redis);
    this.mongoDb = mongoDb;
  }

  // 根據 ID 查找食物記錄
  async findById(id: string): Promise<FoodLog | null> {
    const cached = await this.getFromCache(`log:${id}`);
    if (cached) {
      return cached as FoodLog;
    }

    const query = `
      SELECT * FROM food_logs 
      WHERE id = $1
    `;

    const result = await this.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const log = this.mapToFoodLog(result.rows[0]);
    await this.setCache(`log:${id}`, log, 1800);

    return log;
  }

  // 查找所有記錄
  async findAll(limit: number = 50, offset: number = 0): Promise<FoodLog[]> {
    const query = `
      SELECT * FROM food_logs 
      ORDER BY logged_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await this.query(query, [limit, offset]);
    return result.rows.map((row: FoodLogEntity) => this.mapToFoodLog(row));
  }

  // 建立新的食物記錄
  async create(logData: Omit<FoodLog, 'id'>): Promise<FoodLog> {
    // 獲取食物的營養資訊
    const nutritionData = await this.getFoodNutrition(logData.foodId, logData.portion);
    
    const query = `
      INSERT INTO food_logs (
        user_id, food_id, food_name, portion, meal_type, 
        calories, protein, carbohydrates, fat, fiber,
        source, confidence, logged_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await this.query(query, [
      logData.userId,
      logData.foodId,
      nutritionData.foodName || '未知食物',
      logData.portion,
      logData.mealType,
      nutritionData.calories,
      nutritionData.protein,
      nutritionData.carbohydrates,
      nutritionData.fat,
      nutritionData.fiber,
      logData.source,
      logData.confidence,
      logData.timestamp
    ]);

    const newLog = this.mapToFoodLog(result.rows[0]);

    // 同時在 MongoDB 中建立詳細記錄
    await this.createDetailedLog(newLog, nutritionData);

    // 清除相關快取
    await this.deleteCachePattern(`user_logs:${logData.userId}:*`);
    await this.deleteCachePattern(`nutrition_stats:${logData.userId}:*`);

    return newLog;
  }

  // 更新食物記錄
  async update(id: string, updateData: Partial<FoodLog>): Promise<FoodLog | null> {
    const existingLog = await this.findById(id);
    if (!existingLog) {
      throw new NotFoundError('FoodLog', id);
    }

    // 如果更新了份量，需要重新計算營養資訊
    let nutritionData: any = {};
    if (updateData.portion && updateData.portion !== existingLog.portion) {
      nutritionData = await this.getFoodNutrition(existingLog.foodId, updateData.portion);
    }

    const query = `
      UPDATE food_logs 
      SET portion = COALESCE($1, portion),
          meal_type = COALESCE($2, meal_type),
          calories = COALESCE($3, calories),
          protein = COALESCE($4, protein),
          carbohydrates = COALESCE($5, carbohydrates),
          fat = COALESCE($6, fat),
          fiber = COALESCE($7, fiber),
          source = COALESCE($8, source),
          confidence = COALESCE($9, confidence),
          logged_at = COALESCE($10, logged_at)
      WHERE id = $11
      RETURNING *
    `;

    const result = await this.query(query, [
      updateData.portion,
      updateData.mealType,
      nutritionData.calories,
      nutritionData.protein,
      nutritionData.carbohydrates,
      nutritionData.fat,
      nutritionData.fiber,
      updateData.source,
      updateData.confidence,
      updateData.timestamp,
      id
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const updatedLog = this.mapToFoodLog(result.rows[0]);

    // 清除快取
    await this.deleteFromCache(`log:${id}`);
    await this.deleteCachePattern(`user_logs:${existingLog.userId}:*`);
    await this.deleteCachePattern(`nutrition_stats:${existingLog.userId}:*`);

    return updatedLog;
  }

  // 刪除食物記錄
  async delete(id: string): Promise<boolean> {
    const existingLog = await this.findById(id);
    if (!existingLog) {
      return false;
    }

    const query = `DELETE FROM food_logs WHERE id = $1`;
    const result = await this.query(query, [id]);

    if (result.rowCount === 0) {
      return false;
    }

    // 同時刪除 MongoDB 中的詳細記錄
    await this.mongoDb.collection('food_logs').deleteOne({ 
      postgresId: id 
    });

    // 清除快取
    await this.deleteFromCache(`log:${id}`);
    await this.deleteCachePattern(`user_logs:${existingLog.userId}:*`);
    await this.deleteCachePattern(`nutrition_stats:${existingLog.userId}:*`);

    return true;
  }

  // 根據用戶 ID 查找記錄
  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<FoodLog[]> {
    const cacheKey = `user_logs:${userId}:${limit}:${offset}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached as FoodLog[];
    }

    const query = `
      SELECT * FROM food_logs 
      WHERE user_id = $1 
      ORDER BY logged_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const result = await this.query(query, [userId, limit, offset]);
    const logs = result.rows.map((row: FoodLogEntity) => this.mapToFoodLog(row));

    await this.setCache(cacheKey, logs, 1800);
    return logs;
  }

  // 根據日期範圍查找記錄
  async findByDateRange(options: DateRangeOptions): Promise<FoodLog[]> {
    const {
      userId,
      startDate,
      endDate,
      mealType,
      source,
      limit = 100,
      offset = 0
    } = options;

    const cacheKey = `user_logs:${userId}:${startDate.toISOString()}:${endDate.toISOString()}:${mealType || 'all'}:${source || 'all'}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached as FoodLog[];
    }

    let query = `
      SELECT * FROM food_logs 
      WHERE user_id = $1 
        AND logged_at >= $2 
        AND logged_at <= $3
    `;
    
    const params: any[] = [userId, startDate, endDate];
    let paramIndex = 4;

    if (mealType) {
      query += ` AND meal_type = $${paramIndex}`;
      params.push(mealType);
      paramIndex++;
    }

    if (source) {
      query += ` AND source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }

    query += ` ORDER BY logged_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.query(query, params);
    const logs = result.rows.map((row: FoodLogEntity) => this.mapToFoodLog(row));

    await this.setCache(cacheKey, logs, 1800);
    return logs;
  }

  // 獲取用戶的營養統計
  async getNutritionStats(userId: string, startDate: Date, endDate: Date): Promise<NutritionStats> {
    const cacheKey = `nutrition_stats:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached as NutritionStats;
    }

    const query = `
      SELECT 
        meal_type,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbohydrates) as total_carbohydrates,
        SUM(fat) as total_fat,
        SUM(fiber) as total_fiber,
        COUNT(*) as meal_count
      FROM food_logs 
      WHERE user_id = $1 
        AND logged_at >= $2 
        AND logged_at <= $3
      GROUP BY meal_type
    `;

    const result = await this.query(query, [userId, startDate, endDate]);

    const stats: NutritionStats = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalFiber: 0,
      mealBreakdown: {
        [MealType.BREAKFAST]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 },
        [MealType.LUNCH]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 },
        [MealType.DINNER]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 },
        [MealType.SNACK]: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, count: 0 }
      }
    };

    for (const row of result.rows) {
      const mealType = row.meal_type as MealType;
      const calories = parseFloat(row.total_calories) || 0;
      const protein = parseFloat(row.total_protein) || 0;
      const carbohydrates = parseFloat(row.total_carbohydrates) || 0;
      const fat = parseFloat(row.total_fat) || 0;
      const count = parseInt(row.meal_count) || 0;

      stats.totalCalories += calories;
      stats.totalProtein += protein;
      stats.totalCarbohydrates += carbohydrates;
      stats.totalFat += fat;
      stats.totalFiber += parseFloat(row.total_fiber) || 0;

      stats.mealBreakdown[mealType] = {
        calories,
        protein,
        carbohydrates,
        fat,
        count
      };
    }

    await this.setCache(cacheKey, stats, 3600); // 1小時
    return stats;
  }

  // 獲取用戶最常吃的食物
  async getMostFrequentFoods(userId: string, limit: number = 10): Promise<Array<{ foodId: string; foodName: string; count: number; avgPortion: number }>> {
    const query = `
      SELECT 
        food_id,
        food_name,
        COUNT(*) as frequency,
        AVG(portion) as avg_portion
      FROM food_logs 
      WHERE user_id = $1 
      GROUP BY food_id, food_name
      ORDER BY frequency DESC
      LIMIT $2
    `;

    const result = await this.query(query, [userId, limit]);
    
    return result.rows.map((row: any) => ({
      foodId: row.food_id,
      foodName: row.food_name,
      count: parseInt(row.frequency),
      avgPortion: parseFloat(row.avg_portion)
    }));
  }

  // 獲取每日營養攝取趨勢
  async getDailyNutritionTrend(userId: string, days: number = 30): Promise<Array<{
    date: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }>> {
    const query = `
      SELECT 
        DATE(logged_at) as log_date,
        SUM(calories) as daily_calories,
        SUM(protein) as daily_protein,
        SUM(carbohydrates) as daily_carbohydrates,
        SUM(fat) as daily_fat
      FROM food_logs 
      WHERE user_id = $1 
        AND logged_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(logged_at)
      ORDER BY log_date DESC
    `;

    const result = await this.query(query, [userId]);
    
    return result.rows.map((row: any) => ({
      date: row.log_date,
      calories: parseFloat(row.daily_calories) || 0,
      protein: parseFloat(row.daily_protein) || 0,
      carbohydrates: parseFloat(row.daily_carbohydrates) || 0,
      fat: parseFloat(row.daily_fat) || 0
    }));
  }

  // 批量建立記錄
  async createBatch(logs: Array<Omit<FoodLog, 'id'>>): Promise<FoodLog[]> {
    const createdLogs: FoodLog[] = [];

    for (const logData of logs) {
      try {
        const log = await this.create(logData);
        createdLogs.push(log);
      } catch (error) {
        console.error('批量建立記錄時發生錯誤:', error);
      }
    }

    return createdLogs;
  }

  // 分頁查詢記錄
  async findWithPagination(options: QueryOptions & { userId?: string }): Promise<PaginatedResult<FoodLog>> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    let countQuery = 'SELECT COUNT(*) as total FROM food_logs';
    let dataQuery = 'SELECT * FROM food_logs';
    const params: any[] = [];
    let paramIndex = 1;

    if (options.userId) {
      countQuery += ` WHERE user_id = $${paramIndex}`;
      dataQuery += ` WHERE user_id = $${paramIndex}`;
      params.push(options.userId);
      paramIndex++;
    }

    dataQuery += ` ORDER BY logged_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      this.query(countQuery, options.userId ? [options.userId] : []),
      this.query(dataQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const logs = dataResult.rows.map((row: FoodLogEntity) => this.mapToFoodLog(row));

    return {
      data: logs,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    };
  }

  // 獲取食物營養資訊
  private async getFoodNutrition(foodId: string, portion: number): Promise<{
    foodName: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  }> {
    try {
      // 先從 MongoDB 食物集合查找
      const foodCollection = this.mongoDb.collection('food_items');
      let food = await foodCollection.findOne({ 
        $or: [
          { _id: new ObjectId(foodId) },
          { id: foodId }
        ]
      });

      if (!food) {
        // 從營養資料庫查找
        const nutritionCollection = this.mongoDb.collection('nutrition_database');
        food = await nutritionCollection.findOne({ food_code: foodId });
      }

      if (!food) {
        return {
          foodName: '未知食物',
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0
        };
      }

      const multiplier = portion / 100;
      const nutrition = food.nutritionPer100g || {
        calories: food.energy_kcal || 0,
        protein: food.protein_g || 0,
        carbohydrates: food.carbohydrate_g || 0,
        fat: food.fat_g || 0,
        fiber: food.fiber_g || 0
      };

      return {
        foodName: food.name || food.food_name || '未知食物',
        calories: Math.round(nutrition.calories * multiplier * 10) / 10,
        protein: Math.round(nutrition.protein * multiplier * 10) / 10,
        carbohydrates: Math.round(nutrition.carbohydrates * multiplier * 10) / 10,
        fat: Math.round(nutrition.fat * multiplier * 10) / 10,
        fiber: Math.round(nutrition.fiber * multiplier * 10) / 10
      };
    } catch (error) {
      console.error('獲取食物營養資訊時發生錯誤:', error);
      return {
        foodName: '未知食物',
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0
      };
    }
  }

  // 在 MongoDB 中建立詳細記錄
  private async createDetailedLog(log: FoodLog, nutritionData: any): Promise<void> {
    try {
      const detailedLog: FoodLogDocument = {
        id: log.id,
        userId: log.userId,
        foodId: log.foodId,
        portion: log.portion,
        mealType: log.mealType,
        timestamp: log.timestamp,
        source: log.source,
        confidence: log.confidence,
        nutritionData: {
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbohydrates: nutritionData.carbohydrates,
          fat: nutritionData.fat,
          fiber: nutritionData.fiber,
          sugar: 0,
          sodium: 0,
          vitamins: {
            vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
            thiamine: 0, riboflavin: 0, niacin: 0, vitaminB6: 0, folate: 0, vitaminB12: 0
          },
          minerals: {
            calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0,
            sodium: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0
          }
        },
        postgresId: log.id,
        created_at: new Date()
      };

      await this.mongoDb.collection('food_logs').insertOne(detailedLog as any);
    } catch (error) {
      console.error('建立詳細記錄時發生錯誤:', error);
    }
  }

  // 將資料庫記錄映射為 FoodLog 物件
  private mapToFoodLog(entity: FoodLogEntity): FoodLog {
    return {
      id: entity.id,
      userId: entity.user_id,
      foodId: entity.food_id,
      portion: entity.portion,
      mealType: entity.meal_type,
      timestamp: entity.logged_at,
      source: entity.source,
      confidence: entity.confidence
    };
  }
}