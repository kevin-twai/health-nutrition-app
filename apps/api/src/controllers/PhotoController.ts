import { Request, Response } from 'express';
import { ImageProcessingService, ImageProcessingOptions } from '../services/ImageProcessingService';
import { FoodRecognitionEngine, FoodRecognitionOptions } from '../services/FoodRecognitionEngine';
import { NutritionCalculator, PortionEstimationOptions } from '../services/NutritionCalculator';
import { MultiStageRecognitionEngine } from '../services/MultiStageRecognitionEngine';
import { ResultValidator } from '../services/ResultValidator';
import { AsianCuisineKnowledgeBase } from '../services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from '../services/EnhancedPromptGenerator';
import { ComponentDetectionEngine } from '../services/ComponentDetectionEngine';
import { ComponentNutritionCalculator } from '../services/ComponentNutritionCalculator';
import { ComponentAdjustmentService } from '../services/ComponentAdjustmentService';
import { ApiResponse, RecognitionResult, NutritionData } from '../types/shared';
import { ComponentRecognitionResponse, ComponentDetectionResult, DetectComponentsOptions, DishType, RecognizedFood } from '../types/ComponentDetection';

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
  private componentDetectionEngine: ComponentDetectionEngine;
  private componentNutritionCalculator: ComponentNutritionCalculator;
  private componentAdjustmentService: ComponentAdjustmentService;

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
    
    // 初始化成分檢測引擎和營養計算器
    this.componentDetectionEngine = new ComponentDetectionEngine('zh-TW');
    this.componentNutritionCalculator = new ComponentNutritionCalculator();
    this.componentAdjustmentService = new ComponentAdjustmentService();
    
    console.log('✓ PhotoController 初始化完成 - 使用增強型識別引擎');
    console.log('  - 多階段識別引擎已啟用');
    console.log('  - 亞洲料理知識庫已載入');
    console.log('  - 結果驗證器已啟用');
    console.log('  - 成分檢測引擎已啟用');
    console.log('  - 成分調整服務已啟用');
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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
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
   * 根據食物列表推斷料理類型
   */
  private inferDishType(foods?: RecognizedFood[]): DishType | undefined {
    if (!foods || foods.length === 0) {
      return undefined;
    }

    // 取第一個食物的名稱進行推斷
    const firstFoodName = foods[0].name.toLowerCase();

    // 湯品類
    if (firstFoodName.includes('湯') || firstFoodName.includes('羹')) {
      return DishType.SOUP;
    }

    // 炒飯類
    if (firstFoodName.includes('炒飯') || firstFoodName.includes('燴飯')) {
      return DishType.FRIED_RICE;
    }

    // 麵食類
    if (firstFoodName.includes('麵') || firstFoodName.includes('粉') || 
        firstFoodName.includes('米粉') || firstFoodName.includes('冬粉')) {
      return DishType.NOODLES;
    }

    // 便當類（多個食物項目）
    if (foods.length >= 3) {
      return DishType.BENTO;
    }

    // 炒菜類
    if (firstFoodName.includes('炒') || firstFoodName.includes('煎')) {
      return DishType.STIR_FRY;
    }

    // 點心類
    if (firstFoodName.includes('餃') || firstFoodName.includes('包') || 
        firstFoodName.includes('燒賣') || firstFoodName.includes('春捲')) {
      return DishType.DUMPLING;
    }

    // 燒烤類
    if (firstFoodName.includes('烤') || firstFoodName.includes('燒')) {
      return DishType.BARBECUE;
    }

    // 火鍋類
    if (firstFoodName.includes('火鍋') || firstFoodName.includes('鍋')) {
      return DishType.HOT_POT;
    }

    // 咖哩類
    if (firstFoodName.includes('咖哩') || firstFoodName.includes('咖喱')) {
      return DishType.CURRY;
    }

    // 預設為未知
    return DishType.UNKNOWN;
  }

  /**
   * 獲取錯誤代碼
   */
  private getErrorCode(error: any): string {
    if (!error) return 'UNKNOWN_ERROR';
    
    const message = error.message || '';
    
    // Vision API 相關錯誤
    if (message.includes('Vision API') || message.includes('OpenAI')) {
      return 'VISION_API_ERROR';
    }
    
    // 知識庫相關錯誤
    if (message.includes('知識庫') || message.includes('knowledge base')) {
      return 'KNOWLEDGE_BASE_ERROR';
    }
    
    // 圖片相關錯誤
    if (message.includes('圖片') || message.includes('image') || message.includes('buffer')) {
      return 'IMAGE_PROCESSING_ERROR';
    }
    
    // 營養計算錯誤
    if (message.includes('營養') || message.includes('nutrition')) {
      return 'NUTRITION_CALCULATION_ERROR';
    }
    
    // 超時錯誤
    if (message.includes('timeout') || message.includes('超時')) {
      return 'TIMEOUT_ERROR';
    }
    
    return 'COMPONENT_DETECTION_ERROR';
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
   * 完整的照片上傳和食物辨識流程（包含成分識別）
   * POST /api/v1/photo/recognize-with-components
   * 
   * 查詢參數：
   * - includeComponents: boolean - 是否包含成分識別（預設為 true）
   */
  recognizeWithComponents = async (req: PhotoUploadRequest, res: Response): Promise<void> => {
    const startTime = Date.now();
    const sessionId = `component_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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

      // 檢查是否啟用成分識別（預設為 true）
      const includeComponents = req.query.includeComponents !== 'false';
      
      console.log(`[${sessionId}] 開始食物識別流程 (成分識別: ${includeComponents ? '啟用' : '停用'})`);

      // 解析圖片處理選項
      const imageOptions: ImageProcessingOptions = {
        quality: req.body.quality ? parseInt(req.body.quality) : 85,
        maxWidth: req.body.maxWidth ? parseInt(req.body.maxWidth) : 1024,
        maxHeight: req.body.maxHeight ? parseInt(req.body.maxHeight) : 1024,
        format: req.body.format || 'jpeg',
        enableSmartCrop: req.body.enableSmartCrop === 'true' || req.body.enableSmartCrop === true,
        extractFeatures: true,
        enhanceQuality: req.body.enhanceQuality === 'true' || req.body.enhanceQuality === true
      };

      // 並行處理：上傳圖片和基礎識別
      const [uploadResult, multiStageResult] = await Promise.all([
        this.imageProcessingService.uploadAndProcessImage(req.file, imageOptions),
        this.multiStageEngine.recognize(req.file.buffer)
      ]);

      console.log(`[${sessionId}] 基礎識別完成，信心度: ${(multiStageResult.confidence * 100).toFixed(1)}%`);

      // 如果不需要成分識別，返回標準識別結果
      if (!includeComponents) {
        const validationReport = this.resultValidator.validate(multiStageResult);
        const totalProcessingTime = Date.now() - startTime;

        res.status(200).json({
          success: true,
          data: {
            sessionId,
            imageInfo: uploadResult,
            recognition: {
              foods: multiStageResult.foods,
              confidence: multiStageResult.confidence,
              description: multiStageResult.description,
              suggestions: multiStageResult.suggestions,
              processingTime: totalProcessingTime
            },
            validation: {
              passed: validationReport.errors.length === 0,
              hasWarnings: validationReport.warnings.length > 0,
              errors: validationReport.errors,
              warnings: validationReport.warnings
            },
            processingTime: totalProcessingTime
          },
          timestamp: new Date()
        } as ApiResponse<any>);
        return;
      }

      // 執行成分識別
      console.log(`[${sessionId}] 開始成分識別...`);
      
      // 子任務 4.1: 構建 DetectComponentsOptions 對象
      // 從識別結果中提取料理名稱和類型
      const dishName = multiStageResult.foods && multiStageResult.foods.length > 0
        ? multiStageResult.foods[0].name
        : undefined;
      
      const dishType = this.inferDishType(multiStageResult.foods);
      
      // 子任務 4.3: 記錄傳遞給成分檢測引擎的參數
      console.log(`[${sessionId}] 傳遞給成分檢測引擎的參數:`);
      console.log(`[${sessionId}]   - dishName: ${dishName || '未指定'}`);
      console.log(`[${sessionId}]   - dishType: ${dishType || '未指定'}`);
      console.log(`[${sessionId}]   - preRecognizedFoods: ${multiStageResult.foods?.length || 0} 個食物`);
      
      if (multiStageResult.foods && multiStageResult.foods.length > 0) {
        console.log(`[${sessionId}] 預識別食物列表:`);
        multiStageResult.foods.forEach((food, index) => {
          const portion = (food as any).portion || food.estimatedPortion || '未知';
          const unit = (food as any).unit || 'g';
          console.log(`[${sessionId}]   ${index + 1}. ${food.name} (信心度: ${(food.confidence * 100).toFixed(1)}%, 份量: ${portion}${unit})`);
        });
      }
      
      // 構建完整的 DetectComponentsOptions 對象
      const detectOptions: DetectComponentsOptions = {
        dishName,
        dishType,
        preRecognizedFoods: multiStageResult.foods // 傳遞完整的 multiStageResult.foods 列表
      };

      let componentResult: ComponentDetectionResult;
      
      try {
        // 驗證圖片 buffer
        if (!req.file.buffer || req.file.buffer.length === 0) {
          throw new Error('圖片數據無效');
        }

        // 使用新的 options 參數調用成分檢測引擎
        componentResult = await this.componentDetectionEngine.detectComponents(
          req.file.buffer,
          detectOptions
        );
        
        console.log(`[${sessionId}] 成分識別完成，檢測到 ${componentResult.components.length} 個成分`);
        
        // 子任務 4.2: 添加一致性驗證
        // 比較基礎識別和成分識別的食物名稱
        if (multiStageResult.foods && multiStageResult.foods.length > 0) {
          const recognizedFoodNames = new Set(multiStageResult.foods.map(f => f.name));
          const componentNames = new Set(componentResult.components.map(c => c.name));
          
          // 檢查缺失的食物
          const missingFoods = Array.from(recognizedFoodNames).filter(
            name => !componentNames.has(name)
          );
          
          // 檢查額外的成分（在成分列表中但不在基礎識別中）
          const extraComponents = Array.from(componentNames).filter(
            name => !recognizedFoodNames.has(name)
          );
          
          // 子任務 4.3: 記錄一致性檢查結果
          console.log(`[${sessionId}] 一致性檢查結果:`);
          console.log(`[${sessionId}]   - 基礎識別食物數: ${recognizedFoodNames.size}`);
          console.log(`[${sessionId}]   - 成分識別數量: ${componentNames.size}`);
          console.log(`[${sessionId}]   - 缺失食物數: ${missingFoods.length}`);
          console.log(`[${sessionId}]   - 額外成分數: ${extraComponents.length}`);
          
          if (missingFoods.length > 0) {
            console.warn(`[${sessionId}] ⚠️ 一致性警告: 以下食物在成分列表中缺失:`, missingFoods);
          }
          
          if (extraComponents.length > 0) {
            console.log(`[${sessionId}] ℹ️ 以下成分在基礎識別中未出現（可能是細分成分）:`, extraComponents);
          }
          
          if (missingFoods.length === 0 && extraComponents.length === 0) {
            console.log(`[${sessionId}] ✓ 一致性檢查通過：基礎識別與成分識別完全一致`);
          }
        }
        
        // 驗證成分識別結果
        if (!componentResult.components || componentResult.components.length === 0) {
          console.warn(`[${sessionId}] 未檢測到任何成分，使用知識庫降級`);
        }
        
        // 計算成分的營養資訊
        try {
          const nutritionSummary = await this.componentNutritionCalculator.aggregateDishNutrition(
            componentResult.components
          );
          
          // 更新結果中的營養摘要
          componentResult.nutritionSummary = nutritionSummary;
          
          console.log(`[${sessionId}] 營養計算完成`);
        } catch (nutritionError) {
          console.error(`[${sessionId}] 營養計算失敗:`, nutritionError);
          // 營養計算失敗不影響成分識別結果，使用空營養摘要
          console.log(`[${sessionId}] 使用空營養摘要繼續`);
        }
        
      } catch (componentError) {
        console.error(`[${sessionId}] 成分識別失敗:`, componentError);
        
        // 記錄錯誤詳情
        const errorDetails = {
          message: componentError instanceof Error ? componentError.message : '未知錯誤',
          stack: componentError instanceof Error ? componentError.stack : undefined,
          dishName,
          imageSize: req.file.size,
          timestamp: new Date()
        };
        
        console.error(`[${sessionId}] 錯誤詳情:`, errorDetails);
        
        // 降級處理：返回基礎識別結果，但標記成分識別失敗
        const totalProcessingTime = Date.now() - startTime;
        const validationReport = this.resultValidator.validate(multiStageResult);

        res.status(200).json({
          success: true,
          data: {
            sessionId,
            imageInfo: uploadResult,
            recognition: {
              foods: multiStageResult.foods,
              confidence: multiStageResult.confidence,
              description: multiStageResult.description,
              suggestions: multiStageResult.suggestions,
              processingTime: totalProcessingTime
            },
            validation: {
              passed: validationReport.errors.length === 0,
              hasWarnings: validationReport.warnings.length > 0,
              errors: validationReport.errors,
              warnings: validationReport.warnings
            },
            componentDetection: {
              enabled: true,
              success: false,
              error: componentError instanceof Error ? componentError.message : '成分識別失敗',
              fallbackMessage: '已降級至基礎識別模式，您仍可查看料理的整體營養資訊',
              errorCode: this.getErrorCode(componentError)
            },
            processingTime: totalProcessingTime
          },
          timestamp: new Date()
        } as ApiResponse<any>);
        return;
      }

      // 驗證識別結果
      const validationReport = this.resultValidator.validate(multiStageResult);
      
      // 計算總處理時間
      const totalProcessingTime = Date.now() - startTime;

      // 構建完整回應
      const response = {
        sessionId,
        imageInfo: uploadResult,
        recognition: {
          foods: multiStageResult.foods,
          confidence: multiStageResult.confidence,
          description: multiStageResult.description,
          suggestions: multiStageResult.suggestions,
          processingTime: totalProcessingTime
        },
        componentDetection: {
          enabled: true,
          success: true,
          mainDish: componentResult.mainDish,
          components: componentResult.components,
          nutritionSummary: componentResult.nutritionSummary,
          metadata: componentResult.metadata,
          suggestions: componentResult.suggestions
        },
        validation: {
          passed: validationReport.errors.length === 0,
          hasWarnings: validationReport.warnings.length > 0,
          errors: validationReport.errors,
          warnings: validationReport.warnings
        },
        processingTime: totalProcessingTime
      };

      console.log(`[${sessionId}] 完整識別流程完成，總耗時 ${totalProcessingTime}ms`);
      
      // 子任務 6.2: 添加性能監控日誌
      // 記錄是否使用預識別食物
      const usedPreRecognizedFoods = detectOptions.preRecognizedFoods && detectOptions.preRecognizedFoods.length > 0;
      
      // 記錄處理時間對比
      const baseRecognitionTime = multiStageResult.processingTime || 0;
      const componentDetectionTime = componentResult.metadata.processingTime || 0;
      
      // 記錄一致性檢查結果
      let consistencyCheckPassed = true;
      let missingFoodsCount = 0;
      let extraComponentsCount = 0;
      
      if (multiStageResult.foods && multiStageResult.foods.length > 0) {
        const recognizedFoodNames = new Set(multiStageResult.foods.map(f => f.name));
        const componentNames = new Set(componentResult.components.map(c => c.name));
        
        const missingFoods = Array.from(recognizedFoodNames).filter(
          name => !componentNames.has(name)
        );
        const extraComponents = Array.from(componentNames).filter(
          name => !recognizedFoodNames.has(name)
        );
        
        missingFoodsCount = missingFoods.length;
        extraComponentsCount = extraComponents.length;
        consistencyCheckPassed = missingFoods.length === 0;
      }
      
      // 構建性能指標對象
      const performanceMetrics = {
        sessionId,
        timestamp: new Date().toISOString(),
        
        // 使用預識別食物相關
        usedPreRecognizedFoods,
        preRecognizedFoodsCount: detectOptions.preRecognizedFoods?.length || 0,
        
        // 處理時間對比
        totalProcessingTime,
        baseRecognitionTime,
        componentDetectionTime,
        imageUploadTime: totalProcessingTime - baseRecognitionTime - componentDetectionTime,
        
        // 時間節省（如果使用預識別食物）
        timeSavings: usedPreRecognizedFoods ? {
          estimatedVisionApiTime: 3000, // 估計 Vision API 調用時間
          actualComponentTime: componentDetectionTime,
          savedTime: Math.max(0, 3000 - componentDetectionTime),
          savingsPercentage: Math.max(0, ((3000 - componentDetectionTime) / 3000 * 100)).toFixed(1) + '%'
        } : null,
        
        // 一致性檢查結果
        consistencyCheck: {
          passed: consistencyCheckPassed,
          baseRecognitionFoodCount: multiStageResult.foods?.length || 0,
          componentDetectionCount: componentResult.components.length,
          missingFoodsCount,
          extraComponentsCount,
          matchRate: multiStageResult.foods?.length > 0 
            ? ((multiStageResult.foods.length - missingFoodsCount) / multiStageResult.foods.length * 100).toFixed(1) + '%'
            : 'N/A'
        },
        
        // 檢測方法和來源統計
        detectionMethod: componentResult.metadata.detectionMethod,
        componentSources: {
          fromPreRecognition: componentResult.metadata.componentsFromPreRecognition || 0,
          fromVisionApi: componentResult.metadata.componentsFromVision || 0,
          fromKnowledgeBase: componentResult.metadata.componentsFromKB || 0,
          total: componentResult.metadata.componentsDetected
        },
        
        // 信心度指標
        confidence: {
          baseRecognition: (multiStageResult.confidence * 100).toFixed(1) + '%',
          componentDetection: (componentResult.metadata.confidenceScore * 100).toFixed(1) + '%'
        }
      };
      
      // 記錄詳細的性能指標
      console.log(`\n[${sessionId}] ========== 性能監控報告 ==========`);
      console.log(`[${sessionId}] 📊 使用預識別食物: ${usedPreRecognizedFoods ? '是' : '否'}`);
      
      if (usedPreRecognizedFoods) {
        console.log(`[${sessionId}] 📋 預識別食物數量: ${performanceMetrics.preRecognizedFoodsCount}`);
        console.log(`[${sessionId}] ⚡ 時間節省: ${performanceMetrics.timeSavings?.savedTime}ms (${performanceMetrics.timeSavings?.savingsPercentage})`);
      }
      
      console.log(`[${sessionId}] ⏱️  處理時間對比:`);
      console.log(`[${sessionId}]   - 基礎識別: ${baseRecognitionTime}ms`);
      console.log(`[${sessionId}]   - 成分識別: ${componentDetectionTime}ms`);
      console.log(`[${sessionId}]   - 圖片上傳: ${performanceMetrics.imageUploadTime}ms`);
      console.log(`[${sessionId}]   - 總計: ${totalProcessingTime}ms`);
      
      console.log(`[${sessionId}] ✓ 一致性檢查:`);
      console.log(`[${sessionId}]   - 狀態: ${consistencyCheckPassed ? '通過 ✓' : '警告 ⚠️'}`);
      console.log(`[${sessionId}]   - 基礎識別食物: ${performanceMetrics.consistencyCheck.baseRecognitionFoodCount}`);
      console.log(`[${sessionId}]   - 成分識別數量: ${performanceMetrics.consistencyCheck.componentDetectionCount}`);
      console.log(`[${sessionId}]   - 缺失食物: ${missingFoodsCount}`);
      console.log(`[${sessionId}]   - 額外成分: ${extraComponentsCount}`);
      console.log(`[${sessionId}]   - 匹配率: ${performanceMetrics.consistencyCheck.matchRate}`);
      
      console.log(`[${sessionId}] 🔍 檢測方法: ${componentResult.metadata.detectionMethod}`);
      console.log(`[${sessionId}] 📦 成分來源統計:`);
      console.log(`[${sessionId}]   - 預識別: ${performanceMetrics.componentSources.fromPreRecognition}`);
      console.log(`[${sessionId}]   - Vision API: ${performanceMetrics.componentSources.fromVisionApi}`);
      console.log(`[${sessionId}]   - 知識庫: ${performanceMetrics.componentSources.fromKnowledgeBase}`);
      console.log(`[${sessionId}]   - 總計: ${performanceMetrics.componentSources.total}`);
      
      console.log(`[${sessionId}] 🎯 信心度:`);
      console.log(`[${sessionId}]   - 基礎識別: ${performanceMetrics.confidence.baseRecognition}`);
      console.log(`[${sessionId}]   - 成分識別: ${performanceMetrics.confidence.componentDetection}`);
      console.log(`[${sessionId}] =====================================\n`);

      // 初始化調整會話（允許用戶後續調整成分）
      try {
        this.componentAdjustmentService.initializeSession(sessionId, componentResult);
        console.log(`[${sessionId}] 調整會話已初始化`);
      } catch (sessionError) {
        console.warn(`[${sessionId}] 初始化調整會話失敗:`, sessionError);
        // 不影響主要回應
      }

      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date()
      } as ApiResponse<typeof response>);

    } catch (error) {
      console.error(`[${sessionId}] 食物辨識錯誤:`, error);
      
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