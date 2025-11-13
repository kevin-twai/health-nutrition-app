import { FeedbackRepository } from '../repositories/FeedbackRepository';
import {
  UserFeedback,
  FeedbackStatus,
  FeedbackType,
  FeedbackModel,
  MistakePattern,
  FeedbackStats
} from '../models/Feedback';

export class FeedbackCollector {
  private feedbackRepository: FeedbackRepository;

  constructor(feedbackRepository: FeedbackRepository) {
    this.feedbackRepository = feedbackRepository;
  }

  /**
   * 提交用戶反饋
   */
  async submitFeedback(feedbackData: Omit<UserFeedback, 'id' | 'status' | 'createdAt'>): Promise<UserFeedback> {
    // 驗證反饋資料
    const { error, value } = FeedbackModel.validate(feedbackData);
    if (error) {
      throw new Error(`反饋資料驗證失敗: ${error.message}`);
    }

    // 檢查是否已經存在相同會話的反饋
    const existingFeedback = await this.feedbackRepository.findBySessionId(feedbackData.sessionId);
    if (existingFeedback) {
      throw new Error('此會話已經提交過反饋');
    }

    // 自動確定反饋類型（如果未提供）
    const feedbackTypes = feedbackData.feedbackType || this.determineFeedbackTypes(feedbackData);

    // 創建反饋
    const feedback = await this.feedbackRepository.create({
      ...feedbackData,
      feedbackType: feedbackTypes,
      status: FeedbackStatus.PENDING
    });

    console.log(`反饋已提交: ${feedback.id}`, {
      sessionId: feedback.sessionId,
      types: feedback.feedbackType,
      severity: FeedbackModel.calculateSeverity(feedback)
    });

    return feedback;
  }

  /**
   * 獲取反饋詳情
   */
  async getFeedback(feedbackId: string): Promise<UserFeedback | null> {
    return await this.feedbackRepository.findById(feedbackId);
  }

  /**
   * 獲取用戶的所有反饋
   */
  async getUserFeedbacks(userId: string, limit: number = 50): Promise<UserFeedback[]> {
    return await this.feedbackRepository.findByUserId(userId, limit);
  }

  /**
   * 獲取待審核的反饋
   */
  async getPendingFeedbacks(limit: number = 50): Promise<UserFeedback[]> {
    return await this.feedbackRepository.findByStatus(FeedbackStatus.PENDING, limit);
  }

  /**
   * 審核反饋
   */
  async reviewFeedback(
    feedbackId: string,
    status: FeedbackStatus.REVIEWED | FeedbackStatus.REJECTED,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<UserFeedback | null> {
    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new Error('反饋不存在');
    }

    if (feedback.status !== FeedbackStatus.PENDING) {
      throw new Error('只能審核待處理的反饋');
    }

    const updatedFeedback = await this.feedbackRepository.updateStatus(
      feedbackId,
      status,
      reviewedBy
    );

    if (reviewNotes && updatedFeedback) {
      await this.feedbackRepository.update(feedbackId, {
        additionalComments: `${updatedFeedback.additionalComments || ''}\n[審核備註] ${reviewNotes}`
      });
    }

    console.log(`反饋已審核: ${feedbackId}`, {
      status,
      reviewedBy,
      severity: FeedbackModel.calculateSeverity(feedback)
    });

    return updatedFeedback;
  }

  /**
   * 標記反饋為已應用
   */
  async markAsApplied(feedbackId: string): Promise<UserFeedback | null> {
    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new Error('反饋不存在');
    }

    if (feedback.status !== FeedbackStatus.REVIEWED) {
      throw new Error('只能應用已審核的反饋');
    }

    const updatedFeedback = await this.feedbackRepository.updateStatus(
      feedbackId,
      FeedbackStatus.APPLIED
    );

    console.log(`反饋已應用: ${feedbackId}`);

    return updatedFeedback;
  }

  /**
   * 批量審核反饋
   */
  async bulkReview(
    feedbackIds: string[],
    status: FeedbackStatus.REVIEWED | FeedbackStatus.REJECTED,
    reviewedBy: string
  ): Promise<number> {
    const count = await this.feedbackRepository.bulkUpdateStatus(
      feedbackIds,
      status,
      reviewedBy
    );

    console.log(`批量審核完成: ${count}個反饋`, { status, reviewedBy });

    return count;
  }

  /**
   * 獲取常見錯誤模式
   */
  async getCommonMistakes(limit: number = 20): Promise<MistakePattern[]> {
    return await this.feedbackRepository.getCommonMistakes(limit);
  }

  /**
   * 獲取反饋統計
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    return await this.feedbackRepository.getStats();
  }

  /**
   * 搜索反饋
   */
  async searchFeedbacks(query: {
    foodName?: string;
    cuisineType?: string;
    status?: FeedbackStatus;
    startDate?: Date;
    endDate?: Date;
    minConfidence?: number;
    maxConfidence?: number;
  }, limit: number = 50): Promise<UserFeedback[]> {
    return await this.feedbackRepository.search(query, limit);
  }

  /**
   * 獲取特定食材的錯誤識別歷史
   */
  async getFoodMistakeHistory(foodName: string): Promise<MistakePattern[]> {
    const allMistakes = await this.getCommonMistakes(100);
    return allMistakes.filter(
      mistake =>
        mistake.incorrectIdentification.includes(foodName) ||
        mistake.correctIdentification.includes(foodName)
    );
  }

  /**
   * 獲取高優先級反饋（高信心度但錯誤的識別）
   */
  async getHighPriorityFeedbacks(limit: number = 20): Promise<UserFeedback[]> {
    const feedbacks = await this.feedbackRepository.search(
      {
        status: FeedbackStatus.PENDING,
        minConfidence: 0.85
      },
      limit * 2 // 獲取更多以便篩選
    );

    // 篩選出有錯誤識別的反饋
    const highPriority = feedbacks.filter(
      feedback => feedback.userCorrection.incorrectFoods.length > 0
    );

    // 按嚴重程度排序
    return highPriority
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        const severityA = FeedbackModel.calculateSeverity(a);
        const severityB = FeedbackModel.calculateSeverity(b);
        return severityOrder[severityA] - severityOrder[severityB];
      })
      .slice(0, limit);
  }

  /**
   * 獲取反饋摘要報告
   */
  async getFeedbackReport(days: number = 30): Promise<{
    summary: string;
    stats: FeedbackStats;
    topMistakes: MistakePattern[];
    recentTrend: string;
  }> {
    const stats = await this.getFeedbackStats();
    const topMistakes = stats.mostCommonMistakes.slice(0, 5);

    // 分析趨勢
    const recentTrend = this.analyzeTrend(stats.feedbackTrend);

    // 生成摘要
    const summary = this.generateSummary(stats, topMistakes);

    return {
      summary,
      stats,
      topMistakes,
      recentTrend
    };
  }

  /**
   * 自動確定反饋類型
   */
  private determineFeedbackTypes(feedbackData: any): FeedbackType[] {
    const types: FeedbackType[] = [];

    if (feedbackData.userCorrection.incorrectFoods?.length > 0) {
      types.push(FeedbackType.INCORRECT_FOOD);
    }

    if (feedbackData.userCorrection.missingFoods?.length > 0) {
      types.push(FeedbackType.MISSING_FOOD);
    }

    if (feedbackData.userCorrection.portionCorrections?.length > 0) {
      types.push(FeedbackType.WRONG_PORTION);
    }

    if (feedbackData.userCorrection.cookingMethodCorrection) {
      types.push(FeedbackType.WRONG_COOKING_METHOD);
    }

    if (feedbackData.userCorrection.cuisineTypeCorrection) {
      types.push(FeedbackType.WRONG_CUISINE_TYPE);
    }

    if (types.length === 0) {
      types.push(FeedbackType.OTHER);
    }

    return types;
  }

  /**
   * 分析反饋趨勢
   */
  private analyzeTrend(trendData: any[]): string {
    if (trendData.length < 2) {
      return '資料不足以分析趨勢';
    }

    const recent = trendData.slice(-7); // 最近7天
    const older = trendData.slice(-14, -7); // 前7天

    const recentAvg = recent.reduce((sum, d) => sum + d.totalFeedbacks, 0) / recent.length;
    const olderAvg = older.length > 0
      ? older.reduce((sum, d) => sum + d.totalFeedbacks, 0) / older.length
      : recentAvg;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (Math.abs(change) < 5) {
      return '反饋數量保持穩定';
    } else if (change > 0) {
      return `反饋數量增加 ${change.toFixed(1)}%`;
    } else {
      return `反饋數量減少 ${Math.abs(change).toFixed(1)}%`;
    }
  }

  /**
   * 生成摘要報告
   */
  private generateSummary(stats: FeedbackStats, topMistakes: MistakePattern[]): string {
    const parts: string[] = [];

    parts.push(`總反饋數: ${stats.totalFeedbacks}`);
    parts.push(`待審核: ${stats.pendingReviews}`);
    parts.push(`已應用: ${stats.appliedFeedbacks}`);

    if (stats.averageConfidenceOfIncorrect > 0) {
      parts.push(
        `錯誤識別的平均信心度: ${(stats.averageConfidenceOfIncorrect * 100).toFixed(1)}%`
      );
    }

    if (topMistakes.length > 0) {
      const topMistake = topMistakes[0];
      parts.push(
        `最常見錯誤: ${topMistake.incorrectIdentification} → ${topMistake.correctIdentification} (${topMistake.frequency}次)`
      );
    }

    if (stats.improvementSuggestions.length > 0) {
      const highPriority = stats.improvementSuggestions.filter(s => s.priority === 'high');
      parts.push(`高優先級改進建議: ${highPriority.length}項`);
    }

    return parts.join(' | ');
  }

  /**
   * 刪除反饋
   */
  async deleteFeedback(feedbackId: string): Promise<boolean> {
    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new Error('反饋不存在');
    }

    const deleted = await this.feedbackRepository.delete(feedbackId);
    
    if (deleted) {
      console.log(`反饋已刪除: ${feedbackId}`);
    }

    return deleted;
  }

  /**
   * 獲取反饋的詳細分析
   */
  async analyzeFeedback(feedbackId: string): Promise<{
    feedback: UserFeedback;
    severity: 'high' | 'medium' | 'low';
    summary: string;
    relatedMistakes: MistakePattern[];
    suggestions: string[];
  }> {
    const feedback = await this.feedbackRepository.findById(feedbackId);
    if (!feedback) {
      throw new Error('反饋不存在');
    }

    const severity = FeedbackModel.calculateSeverity(feedback);
    const summary = FeedbackModel.generateSummary(feedback);
    
    // 查找相關的錯誤模式
    const allMistakes = await this.getCommonMistakes(50);
    const relatedMistakes = allMistakes.filter(mistake => {
      return feedback.userCorrection.incorrectFoods.some(
        incorrect =>
          incorrect.identifiedAs === mistake.incorrectIdentification ||
          incorrect.actualFood === mistake.correctIdentification
      );
    });

    // 生成改進建議
    const suggestions = this.generateImprovementSuggestions(feedback, relatedMistakes);

    return {
      feedback,
      severity,
      summary,
      relatedMistakes,
      suggestions
    };
  }

  /**
   * 生成改進建議
   */
  private generateImprovementSuggestions(
    feedback: UserFeedback,
    relatedMistakes: MistakePattern[]
  ): string[] {
    const suggestions: string[] = [];

    // 基於錯誤識別的建議
    for (const incorrect of feedback.userCorrection.incorrectFoods) {
      const isCommon = relatedMistakes.some(
        m => m.incorrectIdentification === incorrect.identifiedAs
      );

      if (isCommon) {
        suggestions.push(
          `${incorrect.identifiedAs} 經常被誤識別，建議優化相關 prompt 和知識庫`
        );
      } else {
        suggestions.push(
          `${incorrect.identifiedAs} 是新的錯誤模式，建議添加到知識庫的易混淆食材列表`
        );
      }
    }

    // 基於遺漏食材的建議
    if (feedback.userCorrection.missingFoods.length > 0) {
      suggestions.push(
        `識別遺漏了 ${feedback.userCorrection.missingFoods.length} 種食材，建議檢查 prompt 是否要求列出所有可見食材`
      );
    }

    // 基於信心度的建議
    if (feedback.recognitionResult.overallConfidence > 0.85 &&
        feedback.userCorrection.incorrectFoods.length > 0) {
      suggestions.push(
        '高信心度但識別錯誤，這是高優先級問題，建議立即優化相關 prompt'
      );
    }

    // 基於料理類型的建議
    if (feedback.userCorrection.cuisineTypeCorrection) {
      suggestions.push(
        `料理類型識別錯誤，建議在 prompt 中添加更多 ${feedback.userCorrection.cuisineTypeCorrection} 的特徵描述`
      );
    }

    return suggestions;
  }
}
