import { Request, Response } from 'express';
import { ImageProcessingService, ImageProcessingOptions } from '../services/ImageProcessingService';
import { FoodRecognitionEngine, FoodRecognitionOptions } from '../services/FoodRecognitionEngine';
import { NutritionCalculator, PortionEstimationOptions } from '../services/NutritionCalculator';
import { ApiResponse, RecognitionResult, NutritionData } from '@health-tracker/shared-types';

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
  private nutritionCalculator: NutritionCalculator;

  constructor() {
    this.imageProcessingService = new ImageProcessingService();
    this.foodRecognitionEngine = new FoodRecognitionEngine();
    this.nutritionCalculator = new NutritionCalculator();
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
   * 完整的照片上傳和食物辨識流程
   * POST /api/v1/photo/recognize
   */
  recognizeFood = async (req: PhotoUploadRequest, res: Response): Promise<void> => {
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
        format: req.body.format || 'jpeg'
      };

      // 並行處理：上傳圖片和辨識食物
      const [uploadResult, recognitionResult] = await Promise.all([
        this.imageProcessingService.uploadAndProcessImage(req.file, imageOptions),
        this.foodRecognitionEngine.recognizeFood(req.file.buffer, recognitionOptions)
      ]);

      // 驗證辨識品質
      const qualityCheck = this.foodRecognitionEngine.validateRecognitionQuality(recognitionResult);

      res.status(200).json({
        success: true,
        data: {
          imageInfo: uploadResult,
          recognition: recognitionResult,
          qualityCheck,
          processingTime: recognitionResult.processingTime
        },
        timestamp: new Date()
      } as ApiResponse<{
        imageInfo: PhotoUploadResponse;
        recognition: RecognitionResult;
        qualityCheck: any;
        processingTime: number;
      }>);

    } catch (error) {
      console.error('食物辨識錯誤:', error);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'RECOGNITION_FAILED',
          message: error instanceof Error ? error.message : '食物辨識失敗'
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