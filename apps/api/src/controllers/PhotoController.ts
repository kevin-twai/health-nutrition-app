import { Request, Response } from 'express';
import { ImageProcessingService, ImageProcessingOptions } from '../services/ImageProcessingService';
import { FoodRecognitionEngine, FoodRecognitionOptions } from '../services/FoodRecognitionEngine';
import { NutritionCalculator, PortionEstimationOptions } from '../services/NutritionCalculator';
import { MultiStageRecognitionEngine } from '../services/MultiStageRecognitionEngine';
import { ResultValidator } from '../services/ResultValidator';
import { AsianCuisineKnowledgeBase } from '../services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from '../services/EnhancedPromptGenerator';
import { ApiResponse, RecognitionResult, NutritionData } from '../types/shared';

export interface PhotoUploadRequest extends Request {
  file?: Express.Multer.File;
  body: {
    quality?: string;
    maxWidth?: string;
    maxHeight?: string;
    format?: 'jpeg' | 'png' | 'webp';
    maxResults?: string;
    minConfidence?: string;
    language?: string;
    photo?: any;
    enableSmartCrop?: string | boolean;
    extractFeatures?: string | boolean;
    enhanceQuality?: string | boolean;
  };
}

export interface PhotoUploadResponse {
  imageId: string;
  originalUrl: string;
  processedUrl: string;
  metadata: {
    originalSize: number;
    processedSize: number;
    width: number;
    height: number;
    format: string;
    uploadedAt: Date;
  };
}

export class PhotoController {
  private imageProcessingService: ImageProcessingService;
  private foodRecognitionEngine: FoodRecognitionEngine;
  private multiStageEngine: MultiStageRecognitionEngine;
  private resultValidator: ResultValidator;
  private nutritionCalculator: NutritionCalculator;
  private knowledgeBase: AsianCuisineKnowledgeBase;
  private promptGenerator: EnhancedPromptGenerator;

  constructor() {
    this.imageProcessingService = new ImageProcessingService();
    this.foodRecognitionEngine = new FoodRecognitionEngine();
    
    // 初始化知識庫和 Prompt 生成器
    this.knowledgeBase = new AsianCuisineKnowledgeBase();
    this.promptGenerator = new EnhancedPromptGenerator('zh-TW');
    
    // 使用配置初始化多階段識別引擎
    this.multiStageEngine = new MultiStageRecognitionEngine({
      maxStages: 3,
      minConfidenceThreshold: 0.85,
      enableKnowledgeBase: true,
      language: 'zh-TW'
    });
    
    this.resultValidator = new ResultValidator();
    this.nutritionCalculator = new NutritionCalculator();
    
    console.log('✓ PhotoController 初始化完成 - 使用增強型識別引擎');
    console.log('  - 多階段識別引擎已啟用');
    console.log('  - 亞洲料理知識庫已載入');
    console.log('  - 結果驗證器已啟用');
  }

  /**
   * 上傳照片端點
   * POST /api/v1/photo/upload
   */
  uploadPhoto = async (req: PhotoUploadRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: '請選擇要上傳的圖片檔案'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 解析處理選項
      const options: ImageProcessingOptions = {
        quality: req.body.quality ? parseInt(req.body.quality) : 85,
        maxWidth: req.body.maxWidth ? parseInt(req.body.maxWidth) : 1024,
        maxHeight: req.body.maxHeight ? parseInt(req.body.maxHeight) : 1024,
        format: req.body.format || 'jpeg'
      };

      // 驗證處理選項
      if (options.quality && (options.quality < 1 || options.quality > 100)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_QUALITY',
            message: '圖片品質必須在 1-100 之間'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 處理和上傳圖片
      const result = await this.imageProcessingService.uploadAndProcessImage(
        req.file,
        options
      );

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date()
      } as ApiResponse<PhotoUploadResponse>);

    } catch (error) {
      console.error('圖片上傳錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : '圖片上傳失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取預簽名上傳 URL
   * POST /api/v1/photo/presigned-url
   */
  getPresignedUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fileName, contentType } = req.body;

      if (!fileName || !contentType) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: '請提供檔案名稱和內容類型'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 驗證內容類型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(contentType)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: '不支援的檔案類型'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      const presignedUrl = await this.imageProcessingService.generatePresignedUrl(
        fileName,
        contentType
      );

      res.status(200).json({
        success: true,
        data: {
          presignedUrl,
          expiresIn: 300 // 5 分鐘
        },
        timestamp: new Date()
      } as ApiResponse<{ presignedUrl: string; expiresIn: number }>);

    } catch (error) {
      console.error('預簽名 URL 生成錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'PRESIGNED_URL_FAILED',
          message: error instanceof Error ? error.message : '預簽名 URL 生成失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 刪除照片
   * DELETE /api/v1/photo/:imageId
   */
  deletePhoto = async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageId } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_IMAGE_URL',
            message: '請提供要刪除的圖片 URL'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      await this.imageProcessingService.deleteImage(imageUrl);

      res.status(200).json({
        success: true,
        data: {
          message: '圖片已成功刪除',
          imageId
        },
        timestamp: new Date()
      } as ApiResponse<{ message: string; imageId: string }>);

    } catch (error) {
      console.error('圖片刪除錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : '圖片刪除失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 完整的照片上傳和食物辨識流程（使用多階段識別引擎）
   * POST /api/v1/photo/recognize
   */
  recognizeFood = async (req: PhotoUploadRequest, res: Response): Promise<void> => {
    const startTime = Date.now();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: '請選擇要上傳的圖片檔案'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 解析辨識選項
      const recognitionOptions: FoodRecognitionOptions = {
        maxResults: req.body.maxResults ? parseInt(req.body.maxResults) : 5,
        minConfidence: req.body.minConfidence ? parseFloat(req.body.minConfidence) : 0.3,
        language: req.body.language || 'zh-TW'
      };

      // 解析圖片處理選項
      const imageOptions: ImageProcessingOptions = {
        quality: req.body.quality ? parseInt(req.body.quality) : 85,
        maxWidth: req.body.maxWidth ? parseInt(req.body.maxWidth) : 1024,
        maxHeight: req.body.maxHeight ? parseInt(req.body.maxHeight) : 1024,
        format: req.body.format || 'jpeg',
        enableSmartCrop: req.body.enableSmartCrop === 'true' || req.body.enableSmartCrop === true,
        extractFeatures: true, // 總是提取特徵以改進識別
        enhanceQuality: req.body.enhanceQuality === 'true' || req.body.enhanceQuality === true
      };

      console.log(`[${sessionId}] 開始多階段食物識別流程`);

      // 並行處理：上傳圖片和辨識食物（使用多階段引擎）
      const [uploadResult, multiStageResult] = await Promise.all([
        this.imageProcessingService.uploadAndProcessImage(req.file, imageOptions),
        this.multiStageEngine.recognize(req.file.buffer)
      ]);

      console.log(`[${sessionId}] 多階段識別完成，階段數: ${multiStageResult.stages.length}`);

      // 驗證識別結果
      const validationReport = this.resultValidator.validate(multiStageResult);
      const hasWarnings = validationReport.warnings.length > 0;
      const hasErrors = validationReport.errors.length > 0;

      console.log(`[${sessionId}] 驗證完成 - 警告: ${hasWarnings}, 錯誤: ${hasErrors}`);

      // 計算總處理時間
      const totalProcessingTime = Date.now() - startTime;

      // 判斷是否需要返回替代選項
      const needsAlternatives = multiStageResult.confidence < 0.85;
      const hasAlternatives = multiStageResult.alternatives && multiStageResult.alternatives.length > 0;

      // 構建回應
      const response = {
        sessionId,
        imageInfo: uploadResult,
        recognition: {
          foods: multiStageResult.foods,
          confidence: multiStageResult.confidence,
          description: multiStageResult.description,
          suggestions: multiStageResult.suggestions,
          processingTime: totalProcessingTime,
          // 當信心度低時，提供額外的說明
          confidenceLevel: this.getConfidenceLevel(multiStageResult.confidence),
          needsUserConfirmation: needsAlternatives
        },
        multiStageInfo: {
          totalStages: multiStageResult.stages.length,
          stagesExecuted: multiStageResult.stages.map(s => ({
            stage: s.attempt,
            promptType: s.promptType,
            confidence: s.confidence,
            timestamp: s.timestamp
          })),
          finalConfidence: multiStageResult.confidence,
          finalStage: multiStageResult.finalStage
        },
        validation: {
          passed: !hasErrors,
          hasWarnings,
          errors: validationReport.errors,
          warnings: validationReport.warnings,
          infos: validationReport.infos
        },
        // 替代選項：當信心度低時提供
        alternatives: needsAlternatives && hasAlternatives ? {
          available: true,
          message: '識別信心度較低，為您提供以下可能的選項，請選擇最符合的食物：',
          options: this.formatAlternativesForUser(multiStageResult.alternatives || []),
          selectionRequired: multiStageResult.confidence < 0.75
        } : {
          available: false,
          message: '識別信心度足夠，無需提供替代選項'
        },
        processingTime: totalProcessingTime
      };

      // 記錄識別會話（用於後續分析和改進）
      this.logRecognitionSession({
        sessionId,
        imageId: uploadResult.imageId,
        imageMetadata: {
          originalName: req.file.originalname,
          size: req.file.size,
          format: req.file.mimetype
        },
        stages: multiStageResult.stages,
        finalResult: multiStageResult,
        validationResults: validationReport,
        processingTime: totalProcessingTime,
        createdAt: new Date()
      });

      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date()
      } as ApiResponse<typeof response>);

    } catch (error) {
      console.error(`[${sessionId}] 食物辨識錯誤:`, error);
      
      // 記錄錯誤
      this.logRecognitionError({
        sessionId,
        error: error instanceof Error ? error.message : '未知錯誤',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date()
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'RECOGNITION_FAILED',
          message: error instanceof Error ? error.message : '食物辨識失敗',
          sessionId
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 獲取信心度等級描述
   */
  private getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.9) return 'very_high';
    if (confidence >= 0.85) return 'high';
    if (confidence >= 0.75) return 'medium';
    if (confidence >= 0.6) return 'low';
    return 'very_low';
  }

  /**
   * 格式化替代選項供用戶選擇
   */
  private formatAlternativesForUser(alternatives: any[]): any[] {
    return alternatives.map((altGroup, groupIndex) => ({
      groupId: `alt_group_${groupIndex}`,
      originalFood: altGroup[0]?.food?.name || '未知食物',
      options: altGroup.map((alt: any, optIndex: number) => ({
        optionId: `${groupIndex}_${optIndex}`,
        food: {
          id: alt.food.id,
          name: alt.food.name,
          portion: alt.food.portion,
          calories: alt.food.calories,
          protein: alt.food.protein,
          carbs: alt.food.carbs,
          fat: alt.food.fat,
          description: alt.food.description
        },
        confidence: alt.confidence,
        confidencePercentage: Math.round(alt.confidence * 100),
        reason: this.generateSelectionReason(alt),
        recognitionStage: alt.recognitionStage,
        isRecommended: optIndex === 0 // 第一個選項為推薦
      }))
    }));
  }

  /**
   * 生成選擇理由
   */
  private generateSelectionReason(alternative: any): string {
    const confidence = alternative.confidence;
    const stage = alternative.recognitionStage;
    const reasons: string[] = [];

    // 根據信心度生成理由
    if (confidence >= 0.8) {
      reasons.push('高信心度識別');
    } else if (confidence >= 0.6) {
      reasons.push('中等信心度識別');
    } else {
      reasons.push('可能的匹配項');
    }

    // 根據識別階段生成理由
    if (stage === 1) {
      reasons.push('標準識別結果');
    } else if (stage === 2) {
      reasons.push('增強識別結果');
    } else if (stage === 3) {
      reasons.push('知識庫匹配結果');
    }

    // 添加特徵匹配信息
    if (alternative.matchedFeatures && alternative.matchedFeatures.length > 0) {
      reasons.push(`匹配特徵: ${alternative.matchedFeatures.slice(0, 2).join('、')}`);
    }

    // 添加不確定性原因
    if (alternative.uncertaintyReasons && alternative.uncertaintyReasons.length > 0) {
      reasons.push(`注意: ${alternative.uncertaintyReasons[0]}`);
    }

    return reasons.join(' | ');
  }

  /**
   * 記錄識別會話（用於分析和改進）
   */
  private logRecognitionSession(session: any): void {
    try {
      // TODO: 實現會話記錄到資料庫或日誌系統
      console.log(`[RecognitionSession] ${session.sessionId}:`, {
        imageId: session.imageId,
        stages: session.stages.length,
        confidence: session.finalResult.confidence,
        processingTime: session.processingTime,
        hasAlternatives: session.finalResult.alternatives?.length > 0
      });
    } catch (error) {
      console.error('記錄識別會話失敗:', error);
    }
  }

  /**
   * 記錄識別錯誤
   */
  private logRecognitionError(errorInfo: any): void {
    try {
      // TODO: 實現錯誤記錄到資料庫或日誌系統
      console.error(`[RecognitionError] ${errorInfo.sessionId}:`, errorInfo.error);
    } catch (error) {
      console.error('記錄識別錯誤失敗:', error);
    }
  }

  /**
   * 記錄用戶選擇（用於改進識別系統）
   */
  private logUserSelection(selection: any): void {
    try {
      // TODO: 實現用戶選擇記錄到資料庫或日誌系統
      // 這些數據可用於：
      // 1. 分析常見的識別錯誤
      // 2. 改進 prompt 模板
      // 3. 更新知識庫
      // 4. 調整驗證規則
      console.log(`[UserSelection] ${selection.sessionId}:`, {
        groupId: selection.groupId,
        optionId: selection.optionId,
        selectedFood: selection.selectedFood.name,
        timestamp: selection.timestamp
      });
    } catch (error) {
      console.error('記錄用戶選擇失敗:', error);
    }
  }

  /**
   * 用戶選擇替代選項
   * POST /api/v1/photo/select-alternative
   */
  selectAlternative = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        sessionId,
        groupId,
        optionId,
        selectedFood
      } = req.body;

      if (!sessionId || !selectedFood) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: '請提供 sessionId 和 selectedFood'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      console.log(`[${sessionId}] 用戶選擇替代選項:`, {
        groupId,
        optionId,
        foodName: selectedFood.name
      });

      // 記錄用戶選擇（用於改進識別系統）
      this.logUserSelection({
        sessionId,
        groupId,
        optionId,
        selectedFood,
        timestamp: new Date()
      });

      // 返回確認信息
      res.status(200).json({
        success: true,
        data: {
          message: '已記錄您的選擇',
          sessionId,
          selectedFood: {
            id: selectedFood.id,
            name: selectedFood.name,
            portion: selectedFood.portion,
            nutrition: {
              calories: selectedFood.calories,
              protein: selectedFood.protein,
              carbs: selectedFood.carbs,
              fat: selectedFood.fat
            }
          }
        },
        timestamp: new Date()
      } as ApiResponse<any>);

    } catch (error) {
      console.error('選擇替代選項錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'SELECTION_FAILED',
          message: error instanceof Error ? error.message : '選擇失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 確認食物選擇並計算營養成分
   * POST /api/v1/photo/confirm
   */
  confirmFood = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        foodId, 
        imageAnalysis, 
        userInput, 
        contextualClues 
      } = req.body;

      if (!foodId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FOOD_ID',
            message: '請提供食物 ID'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 構建份量估算選項
      const portionOptions: PortionEstimationOptions = {
        imageAnalysis,
        userInput,
        contextualClues
      };

      // 計算營養成分
      const nutritionResult = await this.nutritionCalculator.calculateNutrition(
        foodId,
        portionOptions
      );

      // 獲取營養建議
      const nutritionAdvice = this.nutritionCalculator.getNutritionAdvice(
        nutritionResult.totalNutrition
      );

      res.status(200).json({
        success: true,
        data: {
          foodId,
          nutrition: nutritionResult,
          advice: nutritionAdvice,
          timestamp: new Date()
        },
        timestamp: new Date()
      } as ApiResponse<{
        foodId: string;
        nutrition: any;
        advice: string[];
        timestamp: Date;
      }>);

    } catch (error) {
      console.error('食物確認錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIRMATION_FAILED',
          message: error instanceof Error ? error.message : '食物確認失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 批量計算多個食物的營養成分
   * POST /api/v1/photo/calculate-multiple
   */
  calculateMultipleFoods = async (req: Request, res: Response): Promise<void> => {
    try {
      const { foods } = req.body;

      if (!Array.isArray(foods) || foods.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FOODS_ARRAY',
            message: '請提供有效的食物陣列'
          },
          timestamp: new Date()
        } as ApiResponse<null>);
        return;
      }

      // 驗證每個食物項目
      for (const food of foods) {
        if (!food.foodId) {
          res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_FOOD_ID',
              message: '每個食物項目都必須包含 foodId'
            },
            timestamp: new Date()
          } as ApiResponse<null>);
          return;
        }
      }

      // 批量計算營養成分
      const result = await this.nutritionCalculator.calculateMultipleFoodsNutrition(foods);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date()
      } as ApiResponse<typeof result>);

    } catch (error) {
      console.error('批量營養計算錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'BATCH_CALCULATION_FAILED',
          message: error instanceof Error ? error.message : '批量營養計算失敗'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };

  /**
   * 健康檢查端點
   * GET /api/v1/photo/health
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      // 檢查各個服務的健康狀態
      const [recognitionHealth] = await Promise.all([
        this.foodRecognitionEngine.healthCheck()
      ]);

      const isHealthy = recognitionHealth.status === 'healthy';

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        data: {
          service: 'PhotoController',
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          features: {
            imageUpload: true,
            imageProcessing: true,
            s3Storage: true,
            presignedUrls: true,
            foodRecognition: recognitionHealth.status === 'healthy',
            nutritionCalculation: true
          },
          details: {
            recognition: recognitionHealth
          }
        },
        timestamp: new Date()
      } as ApiResponse<any>);
    } catch (error) {
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNHEALTHY',
          message: '照片服務不可用'
        },
        timestamp: new Date()
      } as ApiResponse<null>);
    }
  };
}