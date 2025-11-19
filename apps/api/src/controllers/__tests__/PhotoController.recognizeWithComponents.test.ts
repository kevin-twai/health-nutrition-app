/**
 * PhotoController.recognizeWithComponents 整合測試
 * 
 * 測試任務 4: 修改 PhotoController.recognizeWithComponents 方法
 * - 4.1: 更新參數傳遞邏輯
 * - 4.2: 添加一致性驗證
 * - 4.3: 更新日誌記錄
 */

import { PhotoController } from '../PhotoController';
import { DetectComponentsOptions, RecognizedFood, DishType } from '../../types/ComponentDetection';

describe('PhotoController.recognizeWithComponents - 預識別食物整合', () => {
  let photoController: PhotoController;
  let mockMultiStageEngine: any;
  let mockComponentEngine: any;
  let mockImageProcessingService: any;
  let mockValidator: any;
  let mockComponentNutritionCalculator: any;

  beforeEach(() => {
    // 創建 PhotoController 實例
    photoController = new PhotoController();

    // 獲取內部服務的引用
    mockMultiStageEngine = (photoController as any).multiStageEngine;
    mockComponentEngine = (photoController as any).componentDetectionEngine;
    mockImageProcessingService = (photoController as any).imageProcessingService;
    mockValidator = (photoController as any).resultValidator;
    mockComponentNutritionCalculator = (photoController as any).componentNutritionCalculator;

    // Mock 服務方法
    mockMultiStageEngine.recognize = jest.fn();
    mockComponentEngine.detectComponents = jest.fn();
    mockImageProcessingService.uploadAndProcessImage = jest.fn();
    mockValidator.validate = jest.fn();
    mockComponentNutritionCalculator.aggregateDishNutrition = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('任務 4.1: 更新參數傳遞邏輯', () => {
    it('應該構建 DetectComponentsOptions 對象並傳遞完整的 preRecognizedFoods 列表', async () => {
      // 準備測試數據
      const mockFoods: RecognizedFood[] = [
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
      ];

      const mockMultiStageResult = {
        foods: mockFoods,
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
          type: DishType.BENTO,
          confidence: 0.92,
          estimatedTotalPortion: 350
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
          detectionMethod: 'pre_recognized' as const,
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

      // Mock 服務回應
      mockImageProcessingService.uploadAndProcessImage.mockResolvedValue(mockUploadResult);
      mockMultiStageEngine.recognize.mockResolvedValue(mockMultiStageResult);
      mockComponentEngine.detectComponents.mockResolvedValue(mockComponentResult);
      mockValidator.validate.mockReturnValue({
        errors: [],
        warnings: [],
        infos: []
      });
      mockComponentNutritionCalculator.aggregateDishNutrition.mockResolvedValue(
        mockComponentResult.nutritionSummary
      );

      // 創建 mock request 和 response
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

      // 執行測試
      await photoController.recognizeWithComponents(mockReq, mockRes);

      // 驗證 detectComponents 被調用時傳遞了正確的參數
      expect(mockComponentEngine.detectComponents).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          dishName: '白飯',
          preRecognizedFoods: mockFoods
        })
      );
      
      // 驗證 dishType 被傳遞（可能是 BENTO 或 UNKNOWN，取決於推斷邏輯）
      const callOptions = mockComponentEngine.detectComponents.mock.calls[0][1] as DetectComponentsOptions;
      expect(callOptions.dishType).toBeDefined();

      // 驗證傳遞了完整的食物列表
      expect(callOptions.preRecognizedFoods).toHaveLength(2);
      expect(callOptions.preRecognizedFoods).toEqual(mockFoods);
    });

    it('應該正確推斷料理類型', async () => {
      const testCases = [
        { 
          foods: [{ id: '1', name: '味噌湯', confidence: 0.9, portion: 200, unit: 'ml' }], 
          expectedType: DishType.SOUP 
        },
        { 
          foods: [{ id: '2', name: '炒飯', confidence: 0.9, portion: 300, unit: 'g' }], 
          expectedType: DishType.FRIED_RICE 
        },
        { 
          foods: [{ id: '3', name: '拉麵', confidence: 0.9, portion: 400, unit: 'g' }], 
          expectedType: DishType.NOODLES 
        },
        { 
          foods: [
            { id: '4', name: '白飯', confidence: 0.9, portion: 200, unit: 'g' },
            { id: '5', name: '炸豬排', confidence: 0.9, portion: 150, unit: 'g' },
            { id: '6', name: '滷蛋', confidence: 0.9, portion: 60, unit: 'g' }
          ], 
          expectedType: DishType.BENTO 
        }
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
            detectionMethod: 'pre_recognized' as const,
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
        mockMultiStageEngine.recognize.mockResolvedValue(mockMultiStageResult);
        mockComponentEngine.detectComponents.mockResolvedValue(mockComponentResult);
        mockValidator.validate.mockReturnValue({
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
        const callArgs = mockComponentEngine.detectComponents.mock.calls[0][1] as DetectComponentsOptions;
        expect(callArgs.dishType).toBe(testCase.expectedType);

        // 清理 mock 以便下一次測試
        jest.clearAllMocks();
      }
    });
  });

  describe('任務 4.2: 添加一致性驗證', () => {
    it('應該驗證基礎識別和成分識別的食物名稱一致', async () => {
      const mockFoods: RecognizedFood[] = [
        { id: 'food-1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' },
        { id: 'food-2', name: '炸豬排', confidence: 0.90, portion: 150, unit: 'g' },
        { id: 'food-3', name: '滷蛋', confidence: 0.85, portion: 60, unit: 'g' }
      ];

      const mockMultiStageResult = {
        foods: mockFoods,
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
          type: DishType.BENTO,
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
          detectionMethod: 'pre_recognized' as const,
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
      mockMultiStageEngine.recognize.mockResolvedValue(mockMultiStageResult);
      mockComponentEngine.detectComponents.mockResolvedValue(mockComponentResult);
      mockValidator.validate.mockReturnValue({
        errors: [],
        warnings: [],
        infos: []
      });
      mockComponentNutritionCalculator.aggregateDishNutrition.mockResolvedValue(
        mockComponentResult.nutritionSummary
      );

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

      // Spy on console.log to verify consistency check logging
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await photoController.recognizeWithComponents(mockReq, mockRes);

      const responseData = mockRes.json.mock.calls[0][0].data;

      // 驗證基礎識別和成分識別的食物名稱一致
      const recognizedFoodNames = responseData.recognition.foods.map((f: any) => f.name);
      const componentNames = responseData.componentDetection.components.map((c: any) => c.name);

      expect(componentNames).toEqual(expect.arrayContaining(recognizedFoodNames));
      expect(recognizedFoodNames.length).toBe(componentNames.length);

      // 驗證一致性檢查日誌被記錄
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('一致性檢查結果')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✓ 一致性檢查通過')
      );

      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('應該記錄缺失食物的警告', async () => {
      const mockFoods: RecognizedFood[] = [
        { id: 'food-1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' },
        { id: 'food-2', name: '炸豬排', confidence: 0.90, portion: 150, unit: 'g' },
        { id: 'food-3', name: '滷蛋', confidence: 0.85, portion: 60, unit: 'g' }
      ];

      const mockMultiStageResult = {
        foods: mockFoods,
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

      // 成分識別結果缺少 "滷蛋"
      const mockComponentResult = {
        mainDish: {
          name: '白飯',
          type: DishType.BENTO,
          confidence: 0.90,
          estimatedTotalPortion: 350
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
          }
          // 缺少 "滷蛋"
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
          confidenceScore: 0.90,
          detectionMethod: 'pre_recognized' as const,
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

      mockImageProcessingService.uploadAndProcessImage.mockResolvedValue(mockUploadResult);
      mockMultiStageEngine.recognize.mockResolvedValue(mockMultiStageResult);
      mockComponentEngine.detectComponents.mockResolvedValue(mockComponentResult);
      mockValidator.validate.mockReturnValue({
        errors: [],
        warnings: [],
        infos: []
      });
      mockComponentNutritionCalculator.aggregateDishNutrition.mockResolvedValue(
        mockComponentResult.nutritionSummary
      );

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

      // Spy on console.warn to verify warning logging
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await photoController.recognizeWithComponents(mockReq, mockRes);

      // 驗證警告被記錄
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ 一致性警告'),
        expect.arrayContaining(['滷蛋'])
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('任務 4.3: 更新日誌記錄', () => {
    it('應該記錄傳遞給成分檢測引擎的參數', async () => {
      const mockFoods: RecognizedFood[] = [
        { id: 'food-1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' },
        { id: 'food-2', name: '炸豬排', confidence: 0.90, portion: 150, unit: 'g' }
      ];

      const mockMultiStageResult = {
        foods: mockFoods,
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
          type: DishType.BENTO,
          confidence: 0.92,
          estimatedTotalPortion: 350
        },
        components: [],
        nutritionSummary: {
          total: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          byComponent: [],
          byCategory: [],
          cookingImpact: []
        },
        metadata: {
          processingTime: 1500,
          confidenceScore: 0.92,
          detectionMethod: 'pre_recognized' as const,
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
      mockMultiStageEngine.recognize.mockResolvedValue(mockMultiStageResult);
      mockComponentEngine.detectComponents.mockResolvedValue(mockComponentResult);
      mockValidator.validate.mockReturnValue({
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

      // Spy on console.log to verify parameter logging
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await photoController.recognizeWithComponents(mockReq, mockRes);

      // 驗證參數日誌被記錄
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('傳遞給成分檢測引擎的參數')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('dishName: 白飯')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('preRecognizedFoods: 2 個食物')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('預識別食物列表')
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('降級處理', () => {
    it('應該在成分識別失敗時降級至基礎識別', async () => {
      const mockFoods: RecognizedFood[] = [
        { id: 'food-1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' }
      ];

      const mockMultiStageResult = {
        foods: mockFoods,
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
      mockMultiStageEngine.recognize.mockResolvedValue(mockMultiStageResult);
      mockComponentEngine.detectComponents.mockRejectedValue(
        new Error('成分識別失敗')
      );
      mockValidator.validate.mockReturnValue({
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
      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData.componentDetection.enabled).toBe(true);
      expect(responseData.componentDetection.success).toBe(false);
      expect(responseData.componentDetection.error).toBe('成分識別失敗');
      expect(responseData.recognition.foods).toEqual(mockFoods);
    });
  });
});
