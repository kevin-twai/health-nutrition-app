import { Request, Response } from 'express';
import { FeedbackCollector } from '../services/FeedbackCollector';
import { FeedbackAnalyzer } from '../services/FeedbackAnalyzer';
import { FeedbackImprover } from '../services/FeedbackImprover';
import { FeedbackModel, FeedbackStatus } from '../models/Feedback';

export class FeedbackController {
  private feedbackCollector: FeedbackCollector;
  private feedbackAnalyzer: FeedbackAnalyzer;
  private feedbackImprover: FeedbackImprover;
  private componentFeedbackCollector?: any; // 延遲初始化

  constructor(
    feedbackCollector: FeedbackCollector,
    feedbackAnalyzer: FeedbackAnalyzer,
    feedbackImprover: FeedbackImprover,
    componentFeedbackCollector?: any
  ) {
    this.feedbackCollector = feedbackCollector;
    this.feedbackAnalyzer = feedbackAnalyzer;
    this.feedbackImprover = feedbackImprover;
    this.componentFeedbackCollector = componentFeedbackCollector;
  }

  /**
   * 提交反饋
   * POST /api/feedback
   */
  submitFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const feedbackData = {
        ...req.body,
        userId
      };

      const feedback = await this.feedbackCollector.submitFeedback(feedbackData);

      res.status(201).json({
        success: true,
        message: '反饋提交成功',
        data: feedback
      });
    } catch (error: any) {
      console.error('提交反饋失敗:', error);
      res.status(400).json({
        success: false,
        message: error.message || '提交反饋失敗'
      });
    }
  };

  /**
   * 獲取反饋詳情
   * GET /api/feedback/:id
   */
  getFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const feedback = await this.feedbackCollector.getFeedback(id);

      if (!feedback) {
        res.status(404).json({
          success: false,
          message: '反饋不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: feedback
      });
    } catch (error: any) {
      console.error('獲取反饋失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取反饋失敗'
      });
    }
  };

  /**
   * 獲取用戶的反饋列表
   * GET /api/feedback/user/:userId
   */
  getUserFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const feedbacks = await this.feedbackCollector.getUserFeedbacks(userId, limit);

      res.json({
        success: true,
        data: feedbacks,
        total: feedbacks.length
      });
    } catch (error: any) {
      console.error('獲取用戶反饋失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取用戶反饋失敗'
      });
    }
  };

  /**
   * 獲取待審核的反饋
   * GET /api/feedback/pending
   */
  getPendingFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const feedbacks = await this.feedbackCollector.getPendingFeedbacks(limit);

      res.json({
        success: true,
        data: feedbacks,
        total: feedbacks.length
      });
    } catch (error: any) {
      console.error('獲取待審核反饋失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取待審核反饋失敗'
      });
    }
  };

  /**
   * 審核反饋
   * PUT /api/feedback/:id/review
   */
  reviewFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;
      const reviewedBy = (req as any).user?.id || 'system';

      if (!status || ![FeedbackStatus.REVIEWED, FeedbackStatus.REJECTED].includes(status)) {
        res.status(400).json({
          success: false,
          message: '無效的審核狀態'
        });
        return;
      }

      const feedback = await this.feedbackCollector.reviewFeedback(
        id,
        status,
        reviewedBy,
        reviewNotes
      );

      res.json({
        success: true,
        message: '反饋審核成功',
        data: feedback
      });
    } catch (error: any) {
      console.error('審核反饋失敗:', error);
      res.status(400).json({
        success: false,
        message: error.message || '審核反饋失敗'
      });
    }
  };

  /**
   * 搜索反饋
   * GET /api/feedback/search
   */
  searchFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        foodName,
        cuisineType,
        status,
        startDate,
        endDate,
        minConfidence,
        maxConfidence,
        limit
      } = req.query;

      const query: any = {};
      if (foodName) query.foodName = foodName as string;
      if (cuisineType) query.cuisineType = cuisineType as string;
      if (status) query.status = status as FeedbackStatus;
      if (startDate) query.startDate = new Date(startDate as string);
      if (endDate) query.endDate = new Date(endDate as string);
      if (minConfidence) query.minConfidence = parseFloat(minConfidence as string);
      if (maxConfidence) query.maxConfidence = parseFloat(maxConfidence as string);

      const feedbacks = await this.feedbackCollector.searchFeedbacks(
        query,
        parseInt(limit as string) || 50
      );

      res.json({
        success: true,
        data: feedbacks,
        total: feedbacks.length
      });
    } catch (error: any) {
      console.error('搜索反饋失敗:', error);
      res.status(500).json({
        success: false,
        message: '搜索反饋失敗'
      });
    }
  };

  /**
   * 獲取反饋統計
   * GET /api/feedback/stats
   */
  getFeedbackStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.feedbackCollector.getFeedbackStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('獲取反饋統計失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取反饋統計失敗'
      });
    }
  };

  /**
   * 獲取常見錯誤
   * GET /api/feedback/mistakes
   */
  getCommonMistakes = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const mistakes = await this.feedbackCollector.getCommonMistakes(limit);

      res.json({
        success: true,
        data: mistakes
      });
    } catch (error: any) {
      console.error('獲取常見錯誤失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取常見錯誤失敗'
      });
    }
  };

  /**
   * 獲取高優先級反饋
   * GET /api/feedback/high-priority
   */
  getHighPriorityFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const feedbacks = await this.feedbackCollector.getHighPriorityFeedbacks(limit);

      res.json({
        success: true,
        data: feedbacks
      });
    } catch (error: any) {
      console.error('獲取高優先級反饋失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取高優先級反饋失敗'
      });
    }
  };

  /**
   * 獲取反饋報告
   * GET /api/feedback/report
   */
  getFeedbackReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const report = await this.feedbackCollector.getFeedbackReport(days);

      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      console.error('獲取反饋報告失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取反饋報告失敗'
      });
    }
  };

  /**
   * 分析錯誤模式
   * GET /api/feedback/analysis/patterns
   */
  analyzeErrorPatterns = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.feedbackAnalyzer.analyzeErrorPatterns();

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('分析錯誤模式失敗:', error);
      res.status(500).json({
        success: false,
        message: '分析錯誤模式失敗'
      });
    }
  };

  /**
   * 分析食材準確度
   * GET /api/feedback/analysis/food/:foodName
   */
  analyzeFoodAccuracy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { foodName } = req.params;
      const report = await this.feedbackAnalyzer.analyzeFoodAccuracy(foodName);

      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      console.error('分析食材準確度失敗:', error);
      res.status(500).json({
        success: false,
        message: '分析食材準確度失敗'
      });
    }
  };

  /**
   * 生成詳細分析報告
   * GET /api/feedback/analysis/detailed
   */
  generateDetailedReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const report = await this.feedbackAnalyzer.generateDetailedReport(days);

      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      console.error('生成詳細報告失敗:', error);
      res.status(500).json({
        success: false,
        message: '生成詳細報告失敗'
      });
    }
  };

  /**
   * 執行持續改進
   * POST /api/feedback/improve
   */
  performContinuousImprovement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { analyzeDays, autoApply, minFeedbackCount } = req.body;

      const result = await this.feedbackImprover.performContinuousImprovement({
        analyzeDays,
        autoApply,
        minFeedbackCount
      });

      res.json({
        success: true,
        message: '持續改進流程完成',
        data: result
      });
    } catch (error: any) {
      console.error('執行持續改進失敗:', error);
      res.status(500).json({
        success: false,
        message: '執行持續改進失敗'
      });
    }
  };

  /**
   * 獲取改進歷史
   * GET /api/feedback/improvement/history
   */
  getImprovementHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = this.feedbackImprover.getImprovementHistory(limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('獲取改進歷史失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取改進歷史失敗'
      });
    }
  };

  /**
   * 分析反饋詳情
   * GET /api/feedback/:id/analyze
   */
  analyzeFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const analysis = await this.feedbackCollector.analyzeFeedback(id);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      console.error('分析反饋失敗:', error);
      res.status(400).json({
        success: false,
        message: error.message || '分析反饋失敗'
      });
    }
  };

  /**
   * 刪除反饋
   * DELETE /api/feedback/:id
   */
  deleteFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.feedbackCollector.deleteFeedback(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: '反饋不存在'
        });
        return;
      }

      res.json({
        success: true,
        message: '反饋已刪除'
      });
    } catch (error: any) {
      console.error('刪除反饋失敗:', error);
      res.status(400).json({
        success: false,
        message: error.message || '刪除反饋失敗'
      });
    }
  };

  // ===== 成分識別反饋相關方法 =====

  /**
   * 提交成分識別反饋
   * POST /api/feedback/component
   */
  submitComponentFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.componentFeedbackCollector) {
        res.status(503).json({
          success: false,
          message: '成分反饋服務未初始化'
        });
        return;
      }

      const userId = (req as any).user?.id;
      const feedbackData = {
        ...req.body,
        userId
      };

      const feedback = await this.componentFeedbackCollector.submitComponentFeedback(feedbackData);

      res.status(201).json({
        success: true,
        message: '成分識別反饋提交成功',
        data: feedback
      });
    } catch (error: any) {
      console.error('提交成分反饋失敗:', error);
      res.status(400).json({
        success: false,
        message: error.message || '提交成分反饋失敗'
      });
    }
  };

  /**
   * 獲取成分反饋統計
   * GET /api/feedback/component/stats
   */
  getComponentFeedbackStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.componentFeedbackCollector) {
        res.status(503).json({
          success: false,
          message: '成分反饋服務未初始化'
        });
        return;
      }

      const stats = await this.componentFeedbackCollector.getComponentFeedbackStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('獲取成分反饋統計失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取成分反饋統計失敗'
      });
    }
  };

  /**
   * 獲取特定成分的反饋歷史
   * GET /api/feedback/component/history/:componentName
   */
  getComponentFeedbackHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.componentFeedbackCollector) {
        res.status(503).json({
          success: false,
          message: '成分反饋服務未初始化'
        });
        return;
      }

      const { componentName } = req.params;
      const history = await this.componentFeedbackCollector.getComponentFeedbackHistory(
        decodeURIComponent(componentName)
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('獲取成分反饋歷史失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取成分反饋歷史失敗'
      });
    }
  };

  /**
   * 獲取料理類型的成分識別準確率
   * GET /api/feedback/component/accuracy/:dishType
   */
  getDishTypeComponentAccuracy = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.componentFeedbackCollector) {
        res.status(503).json({
          success: false,
          message: '成分反饋服務未初始化'
        });
        return;
      }

      const { dishType } = req.params;
      const accuracy = await this.componentFeedbackCollector.getDishTypeComponentAccuracy(dishType);

      res.json({
        success: true,
        data: accuracy
      });
    } catch (error: any) {
      console.error('獲取料理類型準確率失敗:', error);
      res.status(500).json({
        success: false,
        message: '獲取料理類型準確率失敗'
      });
    }
  };
}
