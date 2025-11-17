/**
 * 成分調整路由
 * 
 * 提供用戶調整識別成分的 API 端點
 * - 添加成分
 * - 移除成分
 * - 調整份量
 * - 重新計算營養
 */

import { Router } from 'express';
import { ComponentAdjustmentController } from '../controllers/ComponentAdjustmentController';
import { requireAuth } from '../middleware/auth';

export default function createComponentAdjustmentRoutes(): Router {
  const router = Router();
  const controller = new ComponentAdjustmentController();

  /**
   * @route POST /api/v1/component-adjustment/add
   * @desc 添加成分到識別結果
   * @access Public (暫時開放以便測試)
   * @body sessionId: string - 識別會話 ID
   * @body component: object - 要添加的成分資訊
   *   - name: string - 成分名稱
   *   - estimatedPortion: number - 估計份量（克）
   *   - cookingMethod?: string - 烹飪方式
   *   - category?: string - 成分類別
   */
  router.post('/add',
    // requireAuth(), // 暫時註解掉以便測試
    controller.addComponent
  );

  /**
   * @route POST /api/v1/component-adjustment/remove
   * @desc 從識別結果中移除成分
   * @access Public (暫時開放以便測試)
   * @body sessionId: string - 識別會話 ID
   * @body componentId: string - 要移除的成分 ID
   */
  router.post('/remove',
    // requireAuth(), // 暫時註解掉以便測試
    controller.removeComponent
  );

  /**
   * @route POST /api/v1/component-adjustment/update-portion
   * @desc 調整成分份量
   * @access Public (暫時開放以便測試)
   * @body sessionId: string - 識別會話 ID
   * @body componentId: string - 成分 ID
   * @body newPortion: number - 新的份量（克）
   */
  router.post('/update-portion',
    // requireAuth(), // 暫時註解掉以便測試
    controller.updatePortion
  );

  /**
   * @route POST /api/v1/component-adjustment/recalculate
   * @desc 重新計算調整後的營養資訊
   * @access Public (暫時開放以便測試)
   * @body sessionId: string - 識別會話 ID
   */
  router.post('/recalculate',
    // requireAuth(), // 暫時註解掉以便測試
    controller.recalculateNutrition
  );

  /**
   * @route GET /api/v1/component-adjustment/session/:sessionId
   * @desc 獲取會話的當前狀態
   * @access Public (暫時開放以便測試)
   * @param sessionId: string - 識別會話 ID
   */
  router.get('/session/:sessionId',
    // requireAuth(), // 暫時註解掉以便測試
    controller.getSessionState
  );

  /**
   * @route GET /api/v1/component-adjustment/history/:sessionId
   * @desc 獲取會話的調整歷史
   * @access Public (暫時開放以便測試)
   * @param sessionId: string - 識別會話 ID
   */
  router.get('/history/:sessionId',
    // requireAuth(), // 暫時註解掉以便測試
    controller.getAdjustmentHistory
  );

  // 錯誤處理中介軟體
  router.use((error: any, req: any, res: any, next: any) => {
    console.error('成分調整路由錯誤:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPONENT_ADJUSTMENT_ERROR',
        message: error.message || '成分調整失敗'
      },
      timestamp: new Date()
    });
  });

  return router;
}
