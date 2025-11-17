import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController';
import { FeedbackCollector } from '../services/FeedbackCollector';
import { FeedbackAnalyzer } from '../services/FeedbackAnalyzer';
import { FeedbackImprover } from '../services/FeedbackImprover';
import { ComponentFeedbackCollector } from '../services/ComponentFeedbackCollector';
import { FeedbackRepository } from '../repositories/FeedbackRepository';
import { AsianCuisineKnowledgeBase } from '../services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from '../services/EnhancedPromptGenerator';
import { mongodb } from '../database/mongodb';
import { initializeRedis } from '../database/redis';
import { requireAuth } from '../middleware/auth';

const router = Router();
let redis: any;

// 初始化服務
let feedbackController: FeedbackController;

async function initializeFeedbackServices() {
  if (feedbackController) return feedbackController;

  // 確保 MongoDB 已連接
  const db = mongodb.getDb();
  if (!redis) {
    redis = await initializeRedis();
  }

  const feedbackRepository = new FeedbackRepository(db, redis);
  const feedbackAnalyzer = new FeedbackAnalyzer(feedbackRepository);
  const feedbackCollector = new FeedbackCollector(feedbackRepository);
  const componentFeedbackCollector = new ComponentFeedbackCollector(feedbackRepository);
  
  const knowledgeBase = new AsianCuisineKnowledgeBase();
  const promptGenerator = new EnhancedPromptGenerator('zh-TW');
  
  const feedbackImprover = new FeedbackImprover(
    feedbackRepository,
    feedbackAnalyzer,
    knowledgeBase,
    promptGenerator
  );

  feedbackController = new FeedbackController(
    feedbackCollector,
    feedbackAnalyzer,
    feedbackImprover,
    componentFeedbackCollector
  );

  return feedbackController;
}

// 中間件：確保服務已初始化
const ensureInitialized = async (req: any, res: any, next: any) => {
  try {
    await initializeFeedbackServices();
    next();
  } catch (error) {
    console.error('初始化反饋服務失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務初始化失敗'
    });
  }
};

// 應用中間件
router.use(ensureInitialized);

// ===== 反饋提交和管理 =====

/**
 * @route POST /api/feedback
 * @desc 提交反饋
 * @access Private
 */
router.post('/', requireAuth(redis), async (req, res) => {
  await feedbackController.submitFeedback(req, res);
});

/**
 * @route GET /api/feedback/:id
 * @desc 獲取反饋詳情
 * @access Private
 */
router.get('/:id', requireAuth(redis), async (req, res) => {
  await feedbackController.getFeedback(req, res);
});

/**
 * @route GET /api/feedback/user/:userId
 * @desc 獲取用戶的反饋列表
 * @access Private
 */
router.get('/user/:userId', requireAuth(redis), async (req, res) => {
  await feedbackController.getUserFeedbacks(req, res);
});

/**
 * @route DELETE /api/feedback/:id
 * @desc 刪除反饋
 * @access Private
 */
router.delete('/:id', requireAuth(redis), async (req, res) => {
  await feedbackController.deleteFeedback(req, res);
});

/**
 * @route GET /api/feedback/:id/analyze
 * @desc 分析反饋詳情
 * @access Private
 */
router.get('/:id/analyze', requireAuth(redis), async (req, res) => {
  await feedbackController.analyzeFeedback(req, res);
});

// ===== 反饋審核（管理員功能）=====

/**
 * @route GET /api/feedback/pending
 * @desc 獲取待審核的反饋
 * @access Admin
 */
router.get('/admin/pending', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.getPendingFeedbacks(req, res);
});

/**
 * @route PUT /api/feedback/:id/review
 * @desc 審核反饋
 * @access Admin
 */
router.put('/:id/review', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.reviewFeedback(req, res);
});

/**
 * @route GET /api/feedback/high-priority
 * @desc 獲取高優先級反饋
 * @access Admin
 */
router.get('/admin/high-priority', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.getHighPriorityFeedbacks(req, res);
});

// ===== 反饋搜索和統計 =====

/**
 * @route GET /api/feedback/search
 * @desc 搜索反饋
 * @access Private
 */
router.get('/search/query', requireAuth(redis), async (req, res) => {
  await feedbackController.searchFeedbacks(req, res);
});

/**
 * @route GET /api/feedback/stats
 * @desc 獲取反饋統計
 * @access Private
 */
router.get('/stats/overview', requireAuth(redis), async (req, res) => {
  await feedbackController.getFeedbackStats(req, res);
});

/**
 * @route GET /api/feedback/mistakes
 * @desc 獲取常見錯誤
 * @access Private
 */
router.get('/stats/mistakes', requireAuth(redis), async (req, res) => {
  await feedbackController.getCommonMistakes(req, res);
});

/**
 * @route GET /api/feedback/report
 * @desc 獲取反饋報告
 * @access Private
 */
router.get('/stats/report', requireAuth(redis), async (req, res) => {
  await feedbackController.getFeedbackReport(req, res);
});

// ===== 反饋分析 =====

/**
 * @route GET /api/feedback/analysis/patterns
 * @desc 分析錯誤模式
 * @access Admin
 */
router.get('/analysis/patterns', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.analyzeErrorPatterns(req, res);
});

/**
 * @route GET /api/feedback/analysis/food/:foodName
 * @desc 分析食材準確度
 * @access Admin
 */
router.get('/analysis/food/:foodName', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.analyzeFoodAccuracy(req, res);
});

/**
 * @route GET /api/feedback/analysis/detailed
 * @desc 生成詳細分析報告
 * @access Admin
 */
router.get('/analysis/detailed', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.generateDetailedReport(req, res);
});

// ===== 持續改進 =====

/**
 * @route POST /api/feedback/improve
 * @desc 執行持續改進
 * @access Admin
 */
router.post('/improve/execute', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.performContinuousImprovement(req, res);
});

/**
 * @route GET /api/feedback/improvement/history
 * @desc 獲取改進歷史
 * @access Admin
 */
router.get('/improve/history', requireAuth(redis), async (req, res) => {
  // TODO: 添加管理員權限檢查
  await feedbackController.getImprovementHistory(req, res);
});

// ===== 成分識別反饋 =====

/**
 * @route POST /api/feedback/component
 * @desc 提交成分識別反饋
 * @access Private
 */
router.post('/component', requireAuth(redis), async (req, res) => {
  await feedbackController.submitComponentFeedback(req, res);
});

/**
 * @route GET /api/feedback/component/stats
 * @desc 獲取成分反饋統計
 * @access Private
 */
router.get('/component/stats', requireAuth(redis), async (req, res) => {
  await feedbackController.getComponentFeedbackStats(req, res);
});

/**
 * @route GET /api/feedback/component/history/:componentName
 * @desc 獲取特定成分的反饋歷史
 * @access Private
 */
router.get('/component/history/:componentName', requireAuth(redis), async (req, res) => {
  await feedbackController.getComponentFeedbackHistory(req, res);
});

/**
 * @route GET /api/feedback/component/accuracy/:dishType
 * @desc 獲取料理類型的成分識別準確率
 * @access Private
 */
router.get('/component/accuracy/:dishType', requireAuth(redis), async (req, res) => {
  await feedbackController.getDishTypeComponentAccuracy(req, res);
});

export default router;
