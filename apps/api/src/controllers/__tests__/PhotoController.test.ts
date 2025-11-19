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

  describe('recognizeWithComponents', () => {
    it('應該將基礎識別結果傳遞給成分檢測引擎', async () => {
      // Mock 基礎識別結果
      const mockMultiStageResult = {
        foods: [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            portion: 200,
            unit: 'g',
            nutrition: {
              calories: 260,
              protein: 5,
              carbohydrates: 58,
              fat: 0.5
            }
          },
          {
            id: 'food-2',
            name: '炸豬排',
            confidence: 0.90,
            portion: 150,
            unit: 'g',
            nutrition: {
              calories: 350,
              protein: 25,
              carbohydrates: 15,
              fat: 22
            }
          }
        ],
        confidence: 0.92,
        description: '白飯和炸豬排',
        suggestions: [],
        stages: [],
        finalStage: 1
      };

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

      const mockComponentResult = {
        mainDish: {
          name: '白飯',
          type: 'bento',
          confidence: 0.92,
          estimatedTotalPortion: 350
        },
        components: [
          {
            id: 'comp-1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            category: 'grain',
            sourceType: 'pre_recognized',
            originalFoodId: 'food-1'
          },
          {
            id: 'comp-2',
            name: '炸豬排',
            confidence: 0.90,
            estimatedPortion: 150,
            category: 'protein',
            sourceType: 'pre_recognized',
            originalFoodId: 'food-2'
          }
        ],
        nutritionSummary: {
          total: {
            calories: 610,
            protein: 30,
            carbohydrates: 73,
            fat: 22.5
          },
          byComponent: [],
          byCategory: [],
          cookingImpact: []
        },
        metadata: {
          processingTime: 1500,
          confidenceScore: 0.92,
          detectionMethod: 'pre_recognized',
          componentsDetected: 2,
          componentsFromKB: 0,
          componentsFromVision: 0,
          componentsFromPreRecognition: 2
        },
        suggestions: {
          possibleMissingComponents: [],
          portionAdjustments: [],
          alternativeInterpretations: []
        }
      };

      // Mock 服務方法
      mockImageProcessingService.uploadAndProcessImage.mockResolvedValue(mockUploadResult);
      
      // Mock MultiStageRecognitionEngine
      const mockMultiStageEngine = photoController['multiStageEngine'] as any;
      mockMultiStageEngine.recognize = jest.fn().mockResolvedValue(mockMultiStageResult);
      
      // Mock ComponentDetectionEngine
      const mockComponentEngine = photoController['componentDetectionEngine'] as any;
      const detectComponentsSpy = jest.fn().mockResolvedValue(mockComponentResult);
      mockComponentEngine.detectComponents = detectComponentsSpy;
      
      // Mock ResultValidator
      const mockValidator = photoController['resultValidator'] as any;
      mockValidator.validate = jest.fn().mockReturnValue({
        errors: [],
        warnings: [],
        infos: []
      });

      const mockReq = {
        file: {
          fieldname: 'photo',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('test-image-data')
        },
        body: {},
        query: {}
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.recognizeWithComponents(mockReq, mockRes);

      // 驗證 detectComponents 被調用時傳遞了正確的參數
      expect(detectComponentsSpy).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          dishName: '白飯',
          preRecognizedFoods: mockMultiStageResult.foods
        })
      );

      // 驗證回應成功
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            recognition: expect.objectContaining({
              foods: mockMultiStageResult.foods
            }),
            componentDetection: expect.objectContaining({
              enabled: true,
              success: true,
              components: mockComponentResult.components
            })
          })
        })
      );
    });

    it('應該返回一致的識別結果', async () => {
      const mockMultiStageResult = {
        foods: [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            portion: 200,
            unit: 'g'
          },
          {
            id: 'food-2',
            name: '炸豬排',
            confidence: 0.90,
            portion: 150,
            unit: 'g'
          },
          {
            id: 'food-3',
            name: '滷蛋',
            confidence: 0.85,
            portion: 60,
            unit: 'g'
          }
        ],
        confidence: 0.90,
        description: '白飯、炸豬排和滷蛋',
        suggestions: [],
        stages: [],
        finalStage: 1
      };

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

      const mockComponentResult = {
        mainDish: {
          name: '白飯',
          type: 'bento',
          confidence: 0.90,
          estimatedTotalPortion: 410
        },
        components: [
          {
            id: 'comp-1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            sourceType: 'pre_recognized',
            originalFoodId: 'food-1'
          },
          {
            id: 'comp-2',
            name: '炸豬排',
            confidence: 0.90,
            estimatedPortion: 150,
            sourceType: 'pre_recognized',
            originalFoodId: 'food-2'
          },
          {
            id: 'comp-3',
            name: '滷蛋',
            confidence: 0.85,
            estimatedPortion: 60,
            sourceType: 'pre_recognized',
            originalFoodId: 'food-3'
          }
        ],
        nutritionSummary: {
          total: {
            calories: 700,
            protein: 40,
            carbohydrates: 75,
            fat: 25
          },
          byComponent: [],
          byCategory: [],
          cookingImpact: []
        },
        metadata: {
          processingTime: 1500,
          confidenceScore: 0.90,
          detectionMethod: 'pre_recognized',
          componentsDetected: 3,
          componentsFromKB: 0,
          componentsFromVision: 0,
          componentsFromPreRecognition: 3
        },
        suggestions: {
          possibleMissingComponents: [],
          portionAdjustments: [],
          alternativeInterpretations: []
        }
      };

      mockImageProcessingService.uploadAndProcessImage.mockResolvedValue(mockUploadResult);
      
      const mockMultiStageEngine = photoController['multiStageEngine'] as any;
      mockMultiStageEngine.recognize = jest.fn().mockResolvedValue(mockMultiStageResult);
      
      const mockComponentEngine = photoController['componentDetectionEngine'] as any;
      mockComponentEngine.detectComponents = jest.fn().mockResolvedValue(mockComponentResult);
      
      const mockValidator = photoController['resultValidator'] as any;
      mockValidator.validate = jest.fn().mockReturnValue({
        errors: [],
        warnings: [],
        infos: []
      });

      const mockReq = {
        file: {
          fieldname: 'photo',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('test-image-data')
        },
        body: {},
        query: {}
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.recognizeWithComponents(mockReq, mockRes);

      const responseData = mockRes.json.mock.calls[0][0].data;

      // 驗證基礎識別和成分識別的食物名稱一致
      const recognizedFoodNames = responseData.recognition.foods.map((f: any) => f.name);
      const componentNames = responseData.componentDetection.components.map((c: any) => c.name);

      expect(componentNames).toEqual(expect.arrayContaining(recognizedFoodNames));
      expect(recognizedFoodNames.length).toBe(componentNames.length);
    });

    it('應該在成分識別失敗時降級至基礎識別', async () => {
      const mockMultiStageResult = {
        foods: [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            portion: 200,
            unit: 'g'
          }
        ],
        confidence: 0.95,
        description: '白飯',
        suggestions: [],
        stages: [],
        finalStage: 1
      };

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
      
      const mockMultiStageEngine = photoController['multiStageEngine'] as any;
      mockMultiStageEngine.recognize = jest.fn().mockResolvedValue(mockMultiStageResult);
      
      const mockComponentEngine = photoController['componentDetectionEngine'] as any;
      mockComponentEngine.detectComponents = jest.fn().mockRejectedValue(
        new Error('成分識別失敗')
      );
      
      const mockValidator = photoController['resultValidator'] as any;
      mockValidator.validate = jest.fn().mockReturnValue({
        errors: [],
        warnings: [],
        infos: []
      });

      const mockReq = {
        file: {
          fieldname: 'photo',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('test-image-data')
        },
        body: {},
        query: {}
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await photoController.recognizeWithComponents(mockReq, mockRes);

      // 驗證回應成功但標記成分識別失敗
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            recognition: expect.objectContaining({
              foods: mockMultiStageResult.foods
            }),
            componentDetection: expect.objectContaining({
              enabled: true,
              success: false,
              error: '成分識別失敗'
            })
          })
        })
      );
    });

    it('應該正確推斷料理類型', async () => {
      const testCases = [
        { foods: [{ id: '1', name: '味噌湯', confidence: 0.9, portion: 200, unit: 'ml' }], expectedType: 'soup' },
        { foods: [{ id: '2', name: '炒飯', confidence: 0.9, portion: 300, unit: 'g' }], expectedType: 'fried_rice' },
        { foods: [{ id: '3', name: '拉麵', confidence: 0.9, portion: 400, unit: 'g' }], expectedType: 'noodles' },
        { foods: [
          { id: '4', name: '白飯', confidence: 0.9, portion: 200, unit: 'g' },
          { id: '5', name: '炸豬排', confidence: 0.9, portion: 150, unit: 'g' },
          { id: '6', name: '滷蛋', confidence: 0.9, portion: 60, unit: 'g' }
        ], expectedType: 'bento' }
      ];

      for (const testCase of testCases) {
        const mockMultiStageResult = {
          foods: testCase.foods,
          confidence: 0.9,
          description: testCase.foods.map(f => f.name).join('、'),
          suggestions: [],
          stages: [],
          finalStage: 1
        };

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

        const mockComponentResult = {
          mainDish: {
            name: testCase.foods[0].name,
            type: testCase.expectedType,
            confidence: 0.9,
            estimatedTotalPortion: 200
          },
          components: [],
          nutritionSummary: {
            total: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
            byComponent: [],
            byCategory: [],
            cookingImpact: []
          },
          metadata: {
            processingTime: 1000,
            confidenceScore: 0.9,
            detectionMethod: 'pre_recognized',
            componentsDetected: 0,
            componentsFromKB: 0,
            componentsFromVision: 0,
            componentsFromPreRecognition: 0
          },
          suggestions: {
            possibleMissingComponents: [],
            portionAdjustments: [],
            alternativeInterpretations: []
          }
        };

        mockImageProcessingService.uploadAndProcessImage.mockResolvedValue(mockUploadResult);
        
        const mockMultiStageEngine = photoController['multiStageEngine'] as any;
        mockMultiStageEngine.recognize = jest.fn().mockResolvedValue(mockMultiStageResult);
        
        const mockComponentEngine = photoController['componentDetectionEngine'] as any;
        const detectComponentsSpy = jest.fn().mockResolvedValue(mockComponentResult);
        mockComponentEngine.detectComponents = detectComponentsSpy;
        
        const mockValidator = photoController['resultValidator'] as any;
        mockValidator.validate = jest.fn().mockReturnValue({
          errors: [],
          warnings: [],
          infos: []
        });

        const mockReq = {
          file: {
            fieldname: 'photo',
            originalname: 'test.jpg',
            mimetype: 'image/jpeg',
            size: 1024,
            buffer: Buffer.from('test-image-data')
          },
          body: {},
          query: {}
        } as any;

        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        } as any;

        await photoController.recognizeWithComponents(mockReq, mockRes);

        // 驗證傳遞了正確的 dishType
        expect(detectComponentsSpy).toHaveBeenCalledWith(
          expect.any(Buffer),
          expect.objectContaining({
            dishType: testCase.expectedType
          })
        );
      }
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