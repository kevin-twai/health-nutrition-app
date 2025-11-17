/**
 * 成分調整控制器
 * 
 * 處理用戶對識別成分的調整操作
 */

import { Request, Response } from 'express';
import { ComponentAdjustmentService } from '../services/ComponentAdjustmentService';
import { ApiResponse } from '../types/shared';
import { 
  DetectedComponent, 
  ComponentDetectionResult,
  CookingMethod,
  ComponentCategory 
} from '../types/ComponentDetection';

export class ComponentAdjustmentController {
  private adjustmentService: ComponentAdjustmentService;

  constructor() {
    this.adjustmentService = new ComponentAdjustmentService();
    console.log('✓ ComponentAdjustmentController 初始化完成');
  }

  /**
   * 添加成分
   * POST /api/v1/component-adjustment/add
   */
  addComponent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, component } = req.body;

      // 驗證必要參數
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: '請提供 sessionId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      if (!component || !component.name) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COMPONENT',
            message: '請提供有效的成分資訊（至少包含 name）'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 驗證份量
      if (component.estimatedPortion && component.estimatedPortion <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PORTION',
            message: '份量必須大於 0'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      console.log(`[${sessionId}] 添加成分: ${component.name}`);

      // 添加成分
      const result = await this.adjustmentService.addComponent(sessionId, component);

      res.status(200).json({
        success: true,
        data: {
          message: '成分已成功添加',
          sessionId,
          addedComponent: result.addedComponent,
          updatedResult: result.updatedResult,
          adjustmentId: result.adjustmentId
        },
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('添加成分錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ADD_COMPONENT_FAILED',
          message: error instanceof Error ? error.message : '添加成分失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 移除成分
   * POST /api/v1/component-adjustment/remove
   */
  removeComponent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, componentId } = req.body;

      // 驗證必要參數
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: '請提供 sessionId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      if (!componentId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_COMPONENT_ID',
            message: '請提供 componentId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      console.log(`[${sessionId}] 移除成分: ${componentId}`);

      // 移除成分
      const result = await this.adjustmentService.removeComponent(sessionId, componentId);

      res.status(200).json({
        success: true,
        data: {
          message: '成分已成功移除',
          sessionId,
          removedComponentId: componentId,
          updatedResult: result.updatedResult,
          adjustmentId: result.adjustmentId
        },
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('移除成分錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'REMOVE_COMPONENT_FAILED',
          message: error instanceof Error ? error.message : '移除成分失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 調整份量
   * POST /api/v1/component-adjustment/update-portion
   */
  updatePortion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, componentId, newPortion } = req.body;

      // 驗證必要參數
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: '請提供 sessionId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      if (!componentId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_COMPONENT_ID',
            message: '請提供 componentId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      if (newPortion === undefined || newPortion === null) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_NEW_PORTION',
            message: '請提供 newPortion'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 驗證份量
      if (newPortion <= 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PORTION',
            message: '份量必須大於 0'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      console.log(`[${sessionId}] 調整成分份量: ${componentId} -> ${newPortion}g`);

      // 調整份量
      const result = await this.adjustmentService.updatePortion(
        sessionId,
        componentId,
        newPortion
      );

      res.status(200).json({
        success: true,
        data: {
          message: '份量已成功調整',
          sessionId,
          componentId,
          oldPortion: result.oldPortion,
          newPortion: result.newPortion,
          updatedResult: result.updatedResult,
          adjustmentId: result.adjustmentId
        },
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('調整份量錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_PORTION_FAILED',
          message: error instanceof Error ? error.message : '調整份量失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 重新計算營養
   * POST /api/v1/component-adjustment/recalculate
   */
  recalculateNutrition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.body;

      // 驗證必要參數
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: '請提供 sessionId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      console.log(`[${sessionId}] 重新計算營養`);

      // 重新計算營養
      const result = await this.adjustmentService.recalculateNutrition(sessionId);

      res.status(200).json({
        success: true,
        data: {
          message: '營養已重新計算',
          sessionId,
          updatedResult: result.updatedResult,
          nutritionSummary: result.nutritionSummary,
          calculationTime: result.calculationTime
        },
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('重新計算營養錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'RECALCULATE_NUTRITION_FAILED',
          message: error instanceof Error ? error.message : '重新計算營養失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取會話狀態
   * GET /api/v1/component-adjustment/session/:sessionId
   */
  getSessionState = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: '請提供 sessionId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      console.log(`[${sessionId}] 獲取會話狀態`);

      // 獲取會話狀態
      const state = await this.adjustmentService.getSessionState(sessionId);

      if (!state) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: '找不到指定的會話'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      res.status(200).json({
        success: true,
        data: state,
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('獲取會話狀態錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_SESSION_STATE_FAILED',
          message: error instanceof Error ? error.message : '獲取會話狀態失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取調整歷史
   * GET /api/v1/component-adjustment/history/:sessionId
   */
  getAdjustmentHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: '請提供 sessionId'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      console.log(`[${sessionId}] 獲取調整歷史`);

      // 獲取調整歷史
      const history = await this.adjustmentService.getAdjustmentHistory(sessionId);

      res.status(200).json({
        success: true,
        data: {
          sessionId,
          adjustments: history,
          totalAdjustments: history.length
        },
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('獲取調整歷史錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_ADJUSTMENT_HISTORY_FAILED',
          message: error instanceof Error ? error.message : '獲取調整歷史失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };
}
