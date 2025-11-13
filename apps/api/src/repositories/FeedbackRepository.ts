// @ts-nocheck
import { Db, Collection, ObjectId } from 'mongodb';
import Redis from 'ioredis';
import { MongoDBBaseRepository } from './BaseRepository';
import {
  UserFeedback,
  FeedbackStatus,
  FeedbackType,
  MistakePattern,
  FeedbackStats,
  FeedbackTrendData,
  ImprovementSuggestion
} from '../models/Feedback';

interface FeedbackDocument {
  _id?: ObjectId;
  imageId: string;
  userId?: string;
  sessionId: string;
  recognitionResult: any;
  userCorrection: any;
  feedbackType: FeedbackType[];
  additionalComments?: string;
  status: FeedbackStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export class FeedbackRepository extends MongoDBBaseRepository<FeedbackDocument> {
  constructor(db: Db, redis?: Redis) {
    super(db, 'feedbacks', redis);
  }

  // 創建反饋
  async create(data: Omit<UserFeedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserFeedback> {
    const feedbackDoc: FeedbackDocument = {
      imageId: data.imageId,
      userId: data.userId,
      sessionId: data.sessionId,
      recognitionResult: data.recognitionResult,
      userCorrection: data.userCorrection,
      feedbackType: data.feedbackType,
      additionalComments: data.additionalComments,
      status: data.status || FeedbackStatus.PENDING,
      createdAt: new Date()
    };

    const result = await this.collection.insertOne(feedbackDoc);
    
    // 清除相關快取
    await this.deleteCachePattern('stats:*');
    await this.deleteCachePattern('mistakes:*');

    return {
      ...data,
      id: result.insertedId.toString(),
      status: feedbackDoc.status,
      createdAt: feedbackDoc.createdAt
    };
  }

  // 根據ID查找反饋
  async findById(id: string): Promise<UserFeedback | null> {
    // 嘗試從快取獲取
    const cached = await this.getFromCache<UserFeedback>(`id:${id}`);
    if (cached) return cached;

    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!doc) return null;

    const feedback = this.documentToFeedback(doc);
    
    // 快取結果
    await this.setCache(`id:${id}`, feedback, 1800); // 30分鐘

    return feedback;
  }

  // 查找所有反饋
  async findAll(limit: number = 50, offset: number = 0): Promise<UserFeedback[]> {
    const docs = await this.collection
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return docs.map(doc => this.documentToFeedback(doc));
  }

  // 根據狀態查找反饋
  async findByStatus(status: FeedbackStatus, limit: number = 50): Promise<UserFeedback[]> {
    const cacheKey = `status:${status}:${limit}`;
    const cached = await this.getFromCache<UserFeedback[]>(cacheKey);
    if (cached) return cached;

    const docs = await this.collection
      .find({ status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const feedbacks = docs.map(doc => this.documentToFeedback(doc));
    
    // 快取結果（較短時間，因為狀態可能會變化）
    await this.setCache(cacheKey, feedbacks, 300); // 5分鐘

    return feedbacks;
  }

  // 根據用戶ID查找反饋
  async findByUserId(userId: string, limit: number = 50): Promise<UserFeedback[]> {
    const docs = await this.collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map(doc => this.documentToFeedback(doc));
  }

  // 根據圖片ID查找反饋
  async findByImageId(imageId: string): Promise<UserFeedback[]> {
    const docs = await this.collection
      .find({ imageId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(doc => this.documentToFeedback(doc));
  }

  // 根據會話ID查找反饋
  async findBySessionId(sessionId: string): Promise<UserFeedback | null> {
    const doc = await this.collection.findOne({ sessionId });
    return doc ? this.documentToFeedback(doc) : null;
  }

  // 更新反饋
  async update(id: string, data: Partial<UserFeedback>): Promise<UserFeedback | null> {
    const updateData: any = {
      ...data,
      updatedAt: new Date()
    };

    // 移除不應該更新的欄位
    delete updateData.id;
    delete updateData.createdAt;

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    // 清除快取
    await this.deleteFromCache(`id:${id}`);
    await this.deleteCachePattern('stats:*');
    await this.deleteCachePattern('status:*');

    return this.documentToFeedback(result);
  }

  // 更新反饋狀態
  async updateStatus(
    id: string,
    status: FeedbackStatus,
    reviewedBy?: string
  ): Promise<UserFeedback | null> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === FeedbackStatus.REVIEWED && reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    if (status === FeedbackStatus.APPLIED) {
      updateData.appliedAt = new Date();
    }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    // 清除快取
    await this.deleteFromCache(`id:${id}`);
    await this.deleteCachePattern('stats:*');
    await this.deleteCachePattern('status:*');

    return this.documentToFeedback(result);
  }

  // 刪除反饋
  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount > 0) {
      await this.deleteFromCache(`id:${id}`);
      await this.deleteCachePattern('stats:*');
      await this.deleteCachePattern('status:*');
      return true;
    }

    return false;
  }

  // 獲取常見錯誤模式
  async getCommonMistakes(limit: number = 20): Promise<MistakePattern[]> {
    const cacheKey = `mistakes:common:${limit}`;
    const cached = await this.getFromCache<MistakePattern[]>(cacheKey);
    if (cached) return cached;

    const pipeline = [
      {
        $match: {
          'userCorrection.incorrectFoods': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$userCorrection.incorrectFoods'
      },
      {
        $group: {
          _id: {
            incorrect: '$userCorrection.incorrectFoods.identifiedAs',
            correct: '$userCorrection.incorrectFoods.actualFood'
          },
          frequency: { $sum: 1 },
          lastOccurrence: { $max: '$createdAt' },
          reasons: { $push: '$userCorrection.incorrectFoods.reason' },
          cuisineTypes: { $push: '$recognitionResult.cuisineType' },
          cookingMethods: { $push: '$recognitionResult.cookingMethod' }
        }
      },
      {
        $sort: { frequency: -1 }
      },
      {
        $limit: limit
      }
    ];

    const results = await this.collection.aggregate(pipeline).toArray();

    const mistakes: MistakePattern[] = results.map((result: any) => ({
      incorrectIdentification: result._id.incorrect,
      correctIdentification: result._id.correct,
      frequency: result.frequency,
      imageFeatures: {
        dominantColors: [],
        textureType: 'unknown',
        complexity: 'unknown',
        cuisineType: result.cuisineTypes.filter((c: any) => c)[0],
        cookingMethod: result.cookingMethods.filter((c: any) => c)[0]
      },
      commonScenarios: result.reasons.filter((r: any) => r),
      lastOccurrence: result.lastOccurrence
    }));

    // 快取結果
    await this.setCache(cacheKey, mistakes, 3600); // 1小時

    return mistakes;
  }

  // 獲取反饋統計
  async getStats(): Promise<FeedbackStats> {
    const cacheKey = 'stats:overall';
    const cached = await this.getFromCache<FeedbackStats>(cacheKey);
    if (cached) return cached;

    const [
      totalFeedbacks,
      pendingReviews,
      appliedFeedbacks,
      rejectedFeedbacks,
      avgConfidenceResult,
      feedbackByTypeResult
    ] = await Promise.all([
      this.collection.countDocuments(),
      this.collection.countDocuments({ status: FeedbackStatus.PENDING }),
      this.collection.countDocuments({ status: FeedbackStatus.APPLIED }),
      this.collection.countDocuments({ status: FeedbackStatus.REJECTED }),
      this.collection.aggregate([
        {
          $match: {
            'userCorrection.incorrectFoods': { $exists: true, $ne: [] }
          }
        },
        {
          $group: {
            _id: null,
            avgConfidence: { $avg: '$recognitionResult.overallConfidence' }
          }
        }
      ]).toArray(),
      this.collection.aggregate([
        {
          $unwind: '$feedbackType'
        },
        {
          $group: {
            _id: '$feedbackType',
            count: { $sum: 1 }
          }
        }
      ]).toArray()
    ]);

    const feedbackByType: Record<FeedbackType, number> = {} as any;
    for (const type of Object.values(FeedbackType)) {
      feedbackByType[type] = 0;
    }
    for (const result of feedbackByTypeResult) {
      feedbackByType[result._id as FeedbackType] = result.count;
    }

    const mostCommonMistakes = await this.getCommonMistakes(10);
    const improvementSuggestions = await this.generateImprovementSuggestions(mostCommonMistakes);
    const feedbackTrend = await this.getFeedbackTrend(30);

    const stats: FeedbackStats = {
      totalFeedbacks,
      pendingReviews,
      appliedFeedbacks,
      rejectedFeedbacks,
      averageConfidenceOfIncorrect: avgConfidenceResult[0]?.avgConfidence || 0,
      mostCommonMistakes,
      improvementSuggestions,
      feedbackByType,
      feedbackTrend
    };

    // 快取結果
    await this.setCache(cacheKey, stats, 1800); // 30分鐘

    return stats;
  }

  // 獲取反饋趨勢
  async getFeedbackTrend(days: number = 30): Promise<FeedbackTrendData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalFeedbacks: { $sum: 1 },
          incorrectIdentifications: {
            $sum: { $size: { $ifNull: ['$userCorrection.incorrectFoods', []] } }
          },
          missingFoods: {
            $sum: { $size: { $ifNull: ['$userCorrection.missingFoods', []] } }
          },
          avgConfidence: { $avg: '$recognitionResult.overallConfidence' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const results = await this.collection.aggregate(pipeline).toArray();

    return results.map((result: any) => ({
      date: result._id,
      totalFeedbacks: result.totalFeedbacks,
      incorrectIdentifications: result.incorrectIdentifications,
      missingFoods: result.missingFoods,
      averageConfidence: result.avgConfidence
    }));
  }

  // 生成改進建議
  private async generateImprovementSuggestions(
    mistakes: MistakePattern[]
  ): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];

    // 分析高頻錯誤
    for (const mistake of mistakes.slice(0, 5)) {
      if (mistake.frequency >= 5) {
        suggestions.push({
          type: 'prompt',
          priority: 'high',
          description: `優化 prompt 以區分 ${mistake.incorrectIdentification} 和 ${mistake.correctIdentification}`,
          affectedFoods: [mistake.incorrectIdentification, mistake.correctIdentification],
          estimatedImpact: mistake.frequency,
          suggestedAction: `在 prompt 中添加詳細的區分特徵說明，強調兩者的視覺差異`
        });

        suggestions.push({
          type: 'knowledge_base',
          priority: 'high',
          description: `更新知識庫中 ${mistake.correctIdentification} 的資訊`,
          affectedFoods: [mistake.correctIdentification],
          estimatedImpact: mistake.frequency,
          suggestedAction: `添加更多視覺特徵和易混淆食材的區分說明`
        });
      }
    }

    // 分析遺漏食材
    const missingFoodsResult = await this.collection.aggregate([
      {
        $match: {
          'userCorrection.missingFoods': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$userCorrection.missingFoods'
      },
      {
        $group: {
          _id: '$userCorrection.missingFoods.name',
          frequency: { $sum: 1 }
        }
      },
      {
        $sort: { frequency: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();

    for (const result of missingFoodsResult) {
      if (result.frequency >= 3) {
        suggestions.push({
          type: 'validation_rule',
          priority: 'medium',
          description: `添加驗證規則以檢測 ${result._id} 的存在`,
          affectedFoods: [result._id],
          estimatedImpact: result.frequency,
          suggestedAction: `創建特定的驗證規則來檢查常見菜餚中是否包含 ${result._id}`
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // 將文檔轉換為反饋對象
  private documentToFeedback(doc: FeedbackDocument): UserFeedback {
    return {
      id: doc._id?.toString(),
      imageId: doc.imageId,
      userId: doc.userId,
      sessionId: doc.sessionId,
      recognitionResult: doc.recognitionResult,
      userCorrection: doc.userCorrection,
      feedbackType: doc.feedbackType,
      additionalComments: doc.additionalComments,
      status: doc.status,
      reviewedBy: doc.reviewedBy,
      reviewedAt: doc.reviewedAt,
      appliedAt: doc.appliedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  // 批量更新狀態
  async bulkUpdateStatus(
    ids: string[],
    status: FeedbackStatus,
    reviewedBy?: string
  ): Promise<number> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === FeedbackStatus.REVIEWED && reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    if (status === FeedbackStatus.APPLIED) {
      updateData.appliedAt = new Date();
    }

    const result = await this.collection.updateMany(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { $set: updateData }
    );

    // 清除快取
    await this.deleteCachePattern('stats:*');
    await this.deleteCachePattern('status:*');

    return result.modifiedCount;
  }

  // 搜索反饋
  async search(query: {
    foodName?: string;
    cuisineType?: string;
    status?: FeedbackStatus;
    startDate?: Date;
    endDate?: Date;
    minConfidence?: number;
    maxConfidence?: number;
  }, limit: number = 50): Promise<UserFeedback[]> {
    const filter: any = {};

    if (query.foodName) {
      filter.$or = [
        { 'recognitionResult.foods.name': { $regex: query.foodName, $options: 'i' } },
        { 'userCorrection.incorrectFoods.identifiedAs': { $regex: query.foodName, $options: 'i' } },
        { 'userCorrection.incorrectFoods.actualFood': { $regex: query.foodName, $options: 'i' } },
        { 'userCorrection.missingFoods.name': { $regex: query.foodName, $options: 'i' } }
      ];
    }

    if (query.cuisineType) {
      filter['recognitionResult.cuisineType'] = query.cuisineType;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = query.startDate;
      }
      if (query.endDate) {
        filter.createdAt.$lte = query.endDate;
      }
    }

    if (query.minConfidence !== undefined || query.maxConfidence !== undefined) {
      filter['recognitionResult.overallConfidence'] = {};
      if (query.minConfidence !== undefined) {
        filter['recognitionResult.overallConfidence'].$gte = query.minConfidence;
      }
      if (query.maxConfidence !== undefined) {
        filter['recognitionResult.overallConfidence'].$lte = query.maxConfidence;
      }
    }

    const docs = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map(doc => this.documentToFeedback(doc));
  }
}
