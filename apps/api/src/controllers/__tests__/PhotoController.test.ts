import request from 'supertest';
import express from 'express';
import { PhotoController } from '../PhotoController';
import { ImageProcessingService } from '../../services/ImageProcessingService';
import { FoodRecognitionEngine } from '../../services/FoodRecognitionEngine';
import { NutritionCalculator } from '../../services/NutritionCalculator';

// Mock services
jest.mock('../../services/ImageProcessingService');
jest.mock('../../services/FoodRecognitionEngine');
jest.mock('../../services/NutritionCalculator');

const mockImageProcessingService = {
  uploadAndProcessImage: jest.fn(),
  generatePresignedUrl: jest.fn(),
  deleteImage: jest.fn()
};

const mockFoodRecognitionEngine = {
  recognizeFood: jest.fn(),
  validateRecognitionQuality: jest.fn(),
  healthCheck: jest.fn()
};

const mockNutritionCalculator = {
  calculateNutrition: jest.fn(),
  calculateMultipleFoodsNutrition: jest.fn(),
  getNutritionAdvice: jest.fn()
};

(ImageProcessingService as jest.Mock).mockImplementation(() => mockImageProcessingService);
(FoodRecognitionEngine as jest.Mock).mockImplementation(() => mockFoodRecognitionEngine);
(NutritionCalculator as jest.Mock).mockImplementation(() => mockNutritionCalculator);

describe('PhotoController', () => {
  let app: express.Application;
  let photoController: PhotoController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    photoController = new PhotoController();
    
    // 重置所有 mocks
    jest.clearAllMocks();
  });

  describe('uploadPhoto', () => {
    it('應該成功上傳照片', async () => {
      const mockUploadResult = {
        imageId: 'test-image-id',
        originalUrl: 'https://example.com/original.jpg',
        processedUrl: 'https://example.com/processed.jpg',
        metadata: {
          originalSize: 1024,
          processedSize: 512,
          width: 800,
          height: 600,
          format: 'jpeg',
          uploadedAt: new Date()
        }
      };

      mockImageProcessingService.uploadAndProcessImage.mockResolvedValue(mockUploadResult);

      const mockReq = {
        file: {
          fieldname: 'photo',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('test-image-data')
        },
        body: {
          quality: '85',
          maxWidth: '1024',
          maxHeight: '1024',
          format: 'jpeg'
        }
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.uploadPhoto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUploadResult,
        timestamp: expect.any(Date)
      });
    });

    it('應該在沒有檔案時返回錯誤', async () => {
      const mockReq = {
        body: {}
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.uploadPhoto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NO_FILE_UPLOADED',
          message: '請選擇要上傳的圖片檔案'
        },
        timestamp: expect.any(Date)
      });
    });

    it('應該在品質參數無效時返回錯誤', async () => {
      const mockReq = {
        file: {
          fieldname: 'photo',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test-image-data')
        },
        body: {
          quality: '150' // 無效的品質值
        }
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.uploadPhoto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_QUALITY',
          message: '圖片品質必須在 1-100 之間'
        },
        timestamp: expect.any(Date)
      });
    });
  });

  describe('recognizeFood', () => {
    it('應該成功辨識食物', async () => {
      const mockUploadResult = {
        imageId: 'test-image-id',
        originalUrl: 'https://example.com/original.jpg',
        processedUrl: 'https://example.com/processed.jpg',
        metadata: {
          originalSize: 1024,
          processedSize: 512,
          width: 800,
          height: 600,
          format: 'jpeg',
          uploadedAt: new Date()
        }
      };

      const mockRecognitionResult = {
        foods: [
          {
            id: 'food-1',
            name: '白米飯',
            confidence: 0.9,
            estimatedPortion: 150,
            nutrition: {
              calories: 195,
              protein: 4.1,
              carbohydrates: 42,
              fat: 0.5
            }
          }
        ],
        confidence: 0.8,
        processingTime: 2000
      };

      const mockQualityCheck = {
        isValid: true,
        issues: [],
        suggestions: []
      };

      mockImageProcessingService.uploadAndProcessImage.mockResolvedValue(mockUploadResult);
      mockFoodRecognitionEngine.recognizeFood.mockResolvedValue(mockRecognitionResult);
      mockFoodRecognitionEngine.validateRecognitionQuality.mockReturnValue(mockQualityCheck);

      const mockReq = {
        file: {
          fieldname: 'photo',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test-image-data')
        },
        body: {
          maxResults: '5',
          minConfidence: '0.3',
          language: 'zh-TW'
        }
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.recognizeFood(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          imageInfo: mockUploadResult,
          recognition: mockRecognitionResult,
          qualityCheck: mockQualityCheck,
          processingTime: 2000
        },
        timestamp: expect.any(Date)
      });
    });

    it('應該處理辨識失敗的情況', async () => {
      mockImageProcessingService.uploadAndProcessImage.mockRejectedValue(
        new Error('Upload failed')
      );

      const mockReq = {
        file: {
          fieldname: 'photo',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test-image-data')
        },
        body: {}
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.recognizeFood(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RECOGNITION_FAILED',
          message: 'Upload failed'
        },
        timestamp: expect.any(Date)
      });
    });
  });

  describe('confirmFood', () => {
    it('應該成功確認食物並計算營養', async () => {
      const mockNutritionResult = {
        totalNutrition: {
          calories: 195,
          protein: 4.1,
          carbohydrates: 42,
          fat: 0.5,
          fiber: 0.6,
          sugar: 0.2,
          sodium: 7.5
        },
        portionUsed: 150,
        calculationMethod: 'exact',
        confidence: 0.9,
        warnings: []
      };

      const mockAdvice = [
        '這餐營養均衡，繼續保持'
      ];

      mockNutritionCalculator.calculateNutrition.mockResolvedValue(mockNutritionResult);
      mockNutritionCalculator.getNutritionAdvice.mockReturnValue(mockAdvice);

      const mockReq = {
        body: {
          foodId: 'food-1',
          userInput: {
            estimatedWeight: 150
          }
        }
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.confirmFood(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          foodId: 'food-1',
          nutrition: mockNutritionResult,
          advice: mockAdvice,
          timestamp: expect.any(Date)
        },
        timestamp: expect.any(Date)
      });
    });

    it('應該在缺少 foodId 時返回錯誤', async () => {
      const mockReq = {
        body: {}
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.confirmFood(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MISSING_FOOD_ID',
          message: '請提供食物 ID'
        },
        timestamp: expect.any(Date)
      });
    });
  });

  describe('calculateMultipleFoods', () => {
    it('應該成功計算多個食物的營養', async () => {
      const mockResult = {
        totalNutrition: {
          calories: 400,
          protein: 25,
          carbohydrates: 45,
          fat: 8
        },
        individualResults: [
          {
            totalNutrition: { calories: 195 },
            portionUsed: 150,
            calculationMethod: 'exact',
            confidence: 0.9,
            warnings: []
          },
          {
            totalNutrition: { calories: 205 },
            portionUsed: 100,
            calculationMethod: 'exact',
            confidence: 0.9,
            warnings: []
          }
        ],
        overallConfidence: 0.9,
        warnings: []
      };

      mockNutritionCalculator.calculateMultipleFoodsNutrition.mockResolvedValue(mockResult);

      const mockReq = {
        body: {
          foods: [
            { foodId: 'food-1', options: { userInput: { estimatedWeight: 150 } } },
            { foodId: 'food-2', options: { userInput: { estimatedWeight: 100 } } }
          ]
        }
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.calculateMultipleFoods(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        timestamp: expect.any(Date)
      });
    });

    it('應該在食物陣列無效時返回錯誤', async () => {
      const mockReq = {
        body: {
          foods: []
        }
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.calculateMultipleFoods(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_FOODS_ARRAY',
          message: '請提供有效的食物陣列'
        },
        timestamp: expect.any(Date)
      });
    });

    it('應該在食物項目缺少 foodId 時返回錯誤', async () => {
      const mockReq = {
        body: {
          foods: [
            { options: { userInput: { estimatedWeight: 150 } } } // 缺少 foodId
          ]
        }
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.calculateMultipleFoods(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MISSING_FOOD_ID',
          message: '每個食物項目都必須包含 foodId'
        },
        timestamp: expect.any(Date)
      });
    });
  });

  describe('healthCheck', () => {
    it('應該返回健康狀態', async () => {
      const mockRecognitionHealth = {
        status: 'healthy',
        details: {
          visionApiConnected: true
        }
      };

      mockFoodRecognitionEngine.healthCheck.mockResolvedValue(mockRecognitionHealth);

      const mockReq = {} as any;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          service: 'PhotoController',
          status: 'healthy',
          timestamp: expect.any(Date),
          features: {
            imageUpload: true,
            imageProcessing: true,
            s3Storage: true,
            presignedUrls: true,
            foodRecognition: true,
            nutritionCalculation: true
          },
          details: {
            recognition: mockRecognitionHealth
          }
        },
        timestamp: expect.any(Date)
      });
    });

    it('應該在服務不健康時返回錯誤狀態', async () => {
      const mockRecognitionHealth = {
        status: 'unhealthy',
        details: {
          visionApiConnected: false,
          error: 'API Error'
        }
      };

      mockFoodRecognitionEngine.healthCheck.mockResolvedValue(mockRecognitionHealth);

      const mockReq = {} as any;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.healthCheck(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        data: {
          service: 'PhotoController',
          status: 'unhealthy',
          timestamp: expect.any(Date),
          features: {
            imageUpload: true,
            imageProcessing: true,
            s3Storage: true,
            presignedUrls: true,
            foodRecognition: false,
            nutritionCalculation: true
          },
          details: {
            recognition: mockRecognitionHealth
          }
        },
        timestamp: expect.any(Date)
      });
    });
  });
});