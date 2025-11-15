import { Router } from 'express';
import multer from 'multer';
import { PhotoController } from '../controllers/PhotoController';
import { requireAuth } from '../middleware/auth';

// 設定 multer 用於檔案上傳
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
    files: 1 // 一次只能上傳一個檔案
  },
  fileFilter: (req, file, cb) => {
    // 檢查檔案類型
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/heic',
      'image/heif',
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支援的檔案類型。請使用 JPEG、PNG、WEBP 或 HEIC 格式。'));
    }
  }
});

export default function createPhotoRoutes(): Router {
  const router = Router();
  const photoController = new PhotoController();

  /**
   * @route GET /api/v1/photo/health
   * @desc 照片服務健康檢查
   * @access Public
   */
  router.get('/health', photoController.healthCheck);

  /**
   * @route POST /api/v1/photo/upload
   * @desc 上傳並處理照片
   * @access Private
   * @body multipart/form-data with 'photo' field
   * @body quality?: number (1-100, default: 85)
   * @body maxWidth?: number (default: 1024)
   * @body maxHeight?: number (default: 1024)
   * @body format?: 'jpeg' | 'png' | 'webp' (default: 'jpeg')
   */
  router.post('/upload', 
    requireAuth(),
    upload.single('photo'),
    (req, res, next) => {
      // 處理 multer 錯誤
      if (req.file === undefined && req.body.photo === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: '請選擇要上傳的圖片檔案'
          },
          timestamp: new Date()
        });
      }
      next();
    },
    photoController.uploadPhoto
  );

  /**
   * @route POST /api/v1/photo/presigned-url
   * @desc 獲取 S3 預簽名上傳 URL
   * @access Private
   * @body fileName: string
   * @body contentType: string
   */
  router.post('/presigned-url',
    requireAuth(),
    photoController.getPresignedUrl
  );

  /**
   * @route POST /api/v1/photo/recognize
   * @desc 上傳照片並進行食物辨識（使用多階段識別引擎）
   * @access Public (暫時開放以便測試)
   * @body multipart/form-data with 'photo' field
   * @body maxResults?: number (default: 5)
   * @body minConfidence?: number (default: 0.3)
   * @body language?: string (default: 'zh-TW')
   * @body quality?: number (1-100, default: 85)
   * @body maxWidth?: number (default: 1024)
   * @body maxHeight?: number (default: 1024)
   * @body format?: 'jpeg' | 'png' | 'webp' (default: 'jpeg')
   * @body enableSmartCrop?: boolean (default: false) - 啟用智能裁剪聚焦食物區域
   * @body extractFeatures?: boolean (default: true) - 提取圖片特徵
   * @body enhanceQuality?: boolean (default: false) - 增強圖片質量
   */
  router.post('/recognize',
    // requireAuth(), // 暫時註解掉以便測試
    upload.single('photo'),
    (req, res, next) => {
      if (req.file === undefined && req.body.photo === undefined) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: '請選擇要上傳的圖片檔案'
          },
          timestamp: new Date()
        });
      }
      next();
    },
    photoController.recognizeFood
  );

  /**
   * @route POST /api/v1/photo/select-alternative
   * @desc 用戶選擇替代選項
   * @access Public (暫時開放以便測試)
   * @body sessionId: string
   * @body groupId?: string
   * @body optionId?: string
   * @body selectedFood: object
   */
  router.post('/select-alternative',
    // requireAuth(), // 暫時註解掉以便測試
    photoController.selectAlternative
  );

  /**
   * @route POST /api/v1/photo/confirm
   * @desc 確認食物選擇並計算營養成分
   * @access Private
   * @body foodId: string
   * @body imageAnalysis?: object
   * @body userInput?: object
   * @body contextualClues?: object
   */
  router.post('/confirm',
    requireAuth(),
    photoController.confirmFood
  );

  /**
   * @route POST /api/v1/photo/calculate-multiple
   * @desc 批量計算多個食物的營養成分
   * @access Private
   * @body foods: Array<{ foodId: string, options?: object }>
   */
  router.post('/calculate-multiple',
    requireAuth(),
    photoController.calculateMultipleFoods
  );

  /**
   * @route DELETE /api/v1/photo/:imageId
   * @desc 刪除照片
   * @access Private
   * @param imageId: string
   * @body imageUrl: string
   */
  router.delete('/:imageId',
    requireAuth(),
    photoController.deletePhoto
  );

  // 錯誤處理中介軟體
  router.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      let message = '檔案上傳錯誤';
      let code = 'UPLOAD_ERROR';

      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          message = '檔案大小超過限制 (10MB)';
          code = 'FILE_TOO_LARGE';
          break;
        case 'LIMIT_FILE_COUNT':
          message = '一次只能上傳一個檔案';
          code = 'TOO_MANY_FILES';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = '意外的檔案欄位';
          code = 'UNEXPECTED_FILE';
          break;
      }

      return res.status(400).json({
        success: false,
        error: {
          code,
          message
        },
        timestamp: new Date()
      });
    }

    if (error.message && error.message.includes('不支援的檔案類型')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: error.message
        },
        timestamp: new Date()
      });
    }

    // 其他錯誤
    console.error('照片路由錯誤:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '內部伺服器錯誤'
      },
      timestamp: new Date()
    });
  });

  return router;
}