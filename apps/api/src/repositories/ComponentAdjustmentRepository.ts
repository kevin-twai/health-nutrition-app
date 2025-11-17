/**
 * 成分調整記錄 Repository
 * 
 * 處理成分調整記錄的數據庫操作
 */

import { Collection, ObjectId } from 'mongodb';
import { getMongoDb } from '../database/mongodb';
import { ComponentAdjustment, ComponentAdjustmentDocument } from '../models/ComponentAdjustment';

export class ComponentAdjustmentRepository {
  private collectionName = 'component_adjustments';

  /**
   * 獲取集合
   */
  private async getCollection(): Promise<Collection<ComponentAdjustmentDocument>> {
    const db = await getMongoDb();
    return db.collection<ComponentAdjustmentDocument>(this.collectionName);
  }

  /**
   * 創建調整記錄
   */
  async create(adjustment: ComponentAdjustment): Promise<ComponentAdjustment> {
    try {
      const collection = await this.getCollection();
      const doc = adjustment.toDocument();
      const result = await collection.insertOne(doc);
      
      adjustment._id = result.insertedId;
      return adjustment;
    } catch (error) {
      console.error('創建調整記錄失敗:', error);
      throw new Error('創建調整記錄失敗');
    }
  }

  /**
   * 根據會話 ID 查找調整記錄
   */
  async findBySessionId(sessionId: string): Promise<ComponentAdjustment[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection
        .find({ sessionId })
        .sort({ timestamp: 1 })
        .toArray();
      
      return docs.map(doc => ComponentAdjustment.fromDocument(doc));
    } catch (error) {
      console.error('查找調整記錄失敗:', error);
      throw new Error('查找調整記錄失敗');
    }
  }

  /**
   * 根據用戶 ID 查找調整記錄
   */
  async findByUserId(userId: string, limit: number = 100): Promise<ComponentAdjustment[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      
      return docs.map(doc => ComponentAdjustment.fromDocument(doc));
    } catch (error) {
      console.error('查找用戶調整記錄失敗:', error);
      throw new Error('查找用戶調整記錄失敗');
    }
  }

  /**
   * 統計調整類型
   */
  async getAdjustmentStats(sessionId: string): Promise<{
    total: number;
    byType: { [key: string]: number };
  }> {
    try {
      const collection = await this.getCollection();
      
      const pipeline = [
        { $match: { sessionId } },
        {
          $group: {
            _id: '$adjustmentType',
            count: { $sum: 1 }
          }
        }
      ];
      
      const results = await collection.aggregate(pipeline).toArray();
      
      const byType: { [key: string]: number } = {};
      let total = 0;
      
      for (const result of results) {
        byType[result._id] = result.count;
        total += result.count;
      }
      
      return { total, byType };
    } catch (error) {
      console.error('統計調整記錄失敗:', error);
      throw new Error('統計調整記錄失敗');
    }
  }

  /**
   * 刪除過期記錄（可選，用於數據清理）
   */
  async deleteOldRecords(daysOld: number = 30): Promise<number> {
    try {
      const collection = await this.getCollection();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await collection.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
      
      return result.deletedCount;
    } catch (error) {
      console.error('刪除過期記錄失敗:', error);
      throw new Error('刪除過期記錄失敗');
    }
  }

  /**
   * 創建索引
   */
  async createIndexes(): Promise<void> {
    try {
      const collection = await this.getCollection();
      
      await collection.createIndex({ sessionId: 1 });
      await collection.createIndex({ userId: 1 });
      await collection.createIndex({ timestamp: -1 });
      await collection.createIndex({ createdAt: 1 });
      
      console.log('✓ ComponentAdjustment 索引創建完成');
    } catch (error) {
      console.error('創建索引失敗:', error);
      throw new Error('創建索引失敗');
    }
  }
}
