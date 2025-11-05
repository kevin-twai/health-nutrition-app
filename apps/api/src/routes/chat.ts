import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const chatController = new ChatController();

// 所有聊天路由都需要認證
router.use(authMiddleware);

/**
 * @route POST /api/chat/message
 * @desc 發送聊天訊息
 * @access Private
 */
router.post('/message', async (req, res) => {
  await chatController.sendMessage(req, res);
});

/**
 * @route POST /api/chat/conversation
 * @desc 開始新對話
 * @access Private
 */
router.post('/conversation', async (req, res) => {
  await chatController.startNewConversation(req, res);
});

/**
 * @route GET /api/chat/conversations
 * @desc 獲取用戶所有對話
 * @access Private
 */
router.get('/conversations', async (req, res) => {
  await chatController.getConversationHistory(req, res);
});

/**
 * @route GET /api/chat/conversations/:conversationId
 * @desc 獲取特定對話
 * @access Private
 */
router.get('/conversations/:conversationId', async (req, res) => {
  await chatController.getConversationHistory(req, res);
});

/**
 * @route GET /api/chat/recommendations
 * @desc 獲取個人化建議
 * @access Private
 */
router.get('/recommendations', async (req, res) => {
  await chatController.getRecommendations(req, res);
});

/**
 * @route GET /api/chat/nutrition-analysis
 * @desc 分析營養模式
 * @access Private
 */
router.get('/nutrition-analysis', async (req, res) => {
  await chatController.analyzeNutritionPattern(req, res);
});

/**
 * @route GET /api/chat/stats
 * @desc 獲取對話統計
 * @access Private
 */
router.get('/stats', async (req, res) => {
  await chatController.getConversationStats(req, res);
});

/**
 * @route GET /api/chat/search
 * @desc 搜尋對話
 * @access Private
 */
router.get('/search', async (req, res) => {
  await chatController.searchConversations(req, res);
});

export default router;