import { Request, Response } from 'express';
import { 
  ReportFrequency, 
  DeliveryMethod, 
  ReportSettings,
  HealthReport,
  DateRange
} from '../types/shared';
import { DataAggregator } from '../services/DataAggregator';
import { TrendAnalyzer } from '../services/TrendAnalyzer';
import { ReportScheduler } from '../services/ReportScheduler';
import { ReportTemplateFactory } from '../services/ReportTemplate';
import { DeliveryManager } from '../services/DeliveryManager';
import Joi from 'joi';

/**
 * 報告控制器
 * 處理報告相關的 API 請求
 */
export class ReportController {
  constructor(
    private dataAggregator: DataAggregator,
    private trendAnalyzer: TrendAnalyzer,
    private reportScheduler: ReportScheduler,
    private deliveryManager: DeliveryManager
  ) {}

  /**
   * 生成即時報告
   * POST /api/reports/generate
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.validateGenerateReportRequest(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '請求參數驗證失敗',
            details: error.details.map(d => d.message)
          }
        });
        return;
      }

      const { frequency, period, settings } = value;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      // 彙整資料
      const aggregatedData = await this.dataAggregator.aggregateNutritionData({
        userId,
        period,
        groupBy: 'day' as any,
        includeComparisons: true,
        includeTrends: true
      });

      // 分析趨勢
      const trendAnalysis = await this.trendAnalyzer.analyzeHealthTrends(userId, period);

      // 獲取成就（暫時為空陣列）
      const achievements: any[] = [];

      // 生成報告
      const template = ReportTemplateFactory.createTemplate(frequency, settings);
      const report = await template.generateReport(
        userId,
        period,
        aggregatedData,
        trendAnalysis,
        achievements
      );

      res.json({
        success: true,
        data: report,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('生成報告時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '報告生成失敗'
        }
      });
    }
  }

  /**
   * 獲取報告歷史
   * GET /api/reports/history
   */
  async getReportHistory(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.validateHistoryRequest(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '請求參數驗證失敗',
            details: error.details.map(d => d.message)
          }
        });
        return;
      }

      const { limit, offset, frequency } = value;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      // 這裡應該從資料庫獲取報告歷史
      // 暫時返回模擬資料
      const mockReports: HealthReport[] = [];

      res.json({
        success: true,
        data: {
          reports: mockReports,
          pagination: {
            total: mockReports.length,
            limit,
            offset,
            hasNext: false,
            hasPrev: offset > 0
          }
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('獲取報告歷史時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取報告歷史失敗'
        }
      });
    }
  }

  /**
   * 獲取特定報告
   * GET /api/reports/:reportId
   */
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      // 這裡應該從資料庫獲取特定報告
      // 暫時返回 404
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '報告不存在'
        }
      });
    } catch (error) {
      console.error('獲取報告時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取報告失敗'
        }
      });
    }
  }

  /**
   * 下載報告（PDF 格式）
   * GET /api/reports/:reportId/download
   */
  async downloadReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const { format = 'pdf' } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      // 這裡應該從資料庫獲取報告並生成下載文件
      // 暫時返回 404
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '報告不存在'
        }
      });
    } catch (error) {
      console.error('下載報告時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '下載報告失敗'
        }
      });
    }
  }

  /**
   * 建立報告排程
   * POST /api/reports/schedule
   */
  async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.validateScheduleRequest(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '請求參數驗證失敗',
            details: error.details.map(d => d.message)
          }
        });
        return;
      }

      const { frequency, settings } = value;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      const schedule = await this.reportScheduler.createSchedule(userId, frequency, settings);

      res.status(201).json({
        success: true,
        data: schedule,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('建立報告排程時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '建立報告排程失敗'
        }
      });
    }
  }

  /**
   * 獲取用戶的報告排程
   * GET /api/reports/schedules
   */
  async getSchedules(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      const schedules = this.reportScheduler.getUserSchedules(userId);

      res.json({
        success: true,
        data: schedules,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('獲取報告排程時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取報告排程失敗'
        }
      });
    }
  }

  /**
   * 更新報告排程
   * PUT /api/reports/schedules/:scheduleId
   */
  async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { scheduleId } = req.params;
      const { error, value } = this.validateUpdateScheduleRequest(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '請求參數驗證失敗',
            details: error.details.map(d => d.message)
          }
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      const updatedSchedule = await this.reportScheduler.updateSchedule(scheduleId, value);

      if (!updatedSchedule) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '排程不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: updatedSchedule,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('更新報告排程時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新報告排程失敗'
        }
      });
    }
  }

  /**
   * 停用報告排程
   * DELETE /api/reports/schedules/:scheduleId
   */
  async deactivateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { scheduleId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      const success = await this.reportScheduler.deactivateSchedule(scheduleId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '排程不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '排程已停用',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('停用報告排程時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '停用報告排程失敗'
        }
      });
    }
  }

  /**
   * 立即執行報告生成
   * POST /api/reports/execute
   */
  async executeReportNow(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = this.validateExecuteRequest(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '請求參數驗證失敗',
            details: error.details.map(d => d.message)
          }
        });
        return;
      }

      const { frequency } = value;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用戶未認證'
          }
        });
        return;
      }

      const report = await this.reportScheduler.executeReportNow(userId, frequency);

      if (!report) {
        res.status(500).json({
          success: false,
          error: {
            code: 'EXECUTION_FAILED',
            message: '報告執行失敗'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: report,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('執行報告時發生錯誤:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '執行報告失敗'
        }
      });
    }
  }

  /**
   * 驗證生成報告請求
   */
  private validateGenerateReportRequest(data: any) {
    const schema = Joi.object({
      frequency: Joi.string().valid(...Object.values(ReportFrequency)).required(),
      period: Joi.object({
        start: Joi.date().required(),
        end: Joi.date().greater(Joi.ref('start')).required()
      }).required(),
      settings: Joi.object({
        includeCharts: Joi.boolean().default(true),
        includeTrends: Joi.boolean().default(true),
        includeRecommendations: Joi.boolean().default(true),
        deliveryMethod: Joi.array().items(
          Joi.string().valid(...Object.values(DeliveryMethod))
        ).min(1).default([DeliveryMethod.IN_APP]),
        customSections: Joi.array().items(Joi.string()).default([])
      }).default({})
    });

    return schema.validate(data);
  }

  /**
   * 驗證歷史查詢請求
   */
  private validateHistoryRequest(data: any) {
    const schema = Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(20),
      offset: Joi.number().integer().min(0).default(0),
      frequency: Joi.string().valid(...Object.values(ReportFrequency)).optional()
    });

    return schema.validate(data);
  }

  /**
   * 驗證排程請求
   */
  private validateScheduleRequest(data: any) {
    const schema = Joi.object({
      frequency: Joi.string().valid(...Object.values(ReportFrequency)).required(),
      settings: Joi.object({
        includeCharts: Joi.boolean().default(true),
        includeTrends: Joi.boolean().default(true),
        includeRecommendations: Joi.boolean().default(true),
        deliveryMethod: Joi.array().items(
          Joi.string().valid(...Object.values(DeliveryMethod))
        ).min(1).required(),
        customSections: Joi.array().items(Joi.string()).default([])
      }).required()
    });

    return schema.validate(data);
  }

  /**
   * 驗證更新排程請求
   */
  private validateUpdateScheduleRequest(data: any) {
    const schema = Joi.object({
      includeCharts: Joi.boolean().optional(),
      includeTrends: Joi.boolean().optional(),
      includeRecommendations: Joi.boolean().optional(),
      deliveryMethod: Joi.array().items(
        Joi.string().valid(...Object.values(DeliveryMethod))
      ).min(1).optional(),
      customSections: Joi.array().items(Joi.string()).optional()
    }).min(1);

    return schema.validate(data);
  }

  /**
   * 驗證執行請求
   */
  private validateExecuteRequest(data: any) {
    const schema = Joi.object({
      frequency: Joi.string().valid(...Object.values(ReportFrequency)).required()
    });

    return schema.validate(data);
  }
}