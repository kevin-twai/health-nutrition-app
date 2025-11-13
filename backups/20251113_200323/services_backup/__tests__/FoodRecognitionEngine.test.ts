import { FoodRecognitionEngine } from '../FoodRecognitionEngine';
import { FoodRepository } from '../../repositories/FoodRepository';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Mock Google Vision API
jest.mock('@google-cloud/vision');
const mockVisionClient = {
  objectLocalization: jest.fn(),
  labelDetection: jest.fn(),
  textDetection: jest.fn()
};
(ImageAnnotatorClient as unknown as jest.Mock).mockImplementation(() => mockVisionClient);

// Mock FoodRepository
jest.mock('../../repositories/FoodRepository');
const mockFoodRepository = {
  searchByName: jest.fn()
};
(FoodRepository as jest.Mock).mockImplementation(() => mockFoodRepository);

describe('FoodRecognitionEngine', () => {
  let foodRecognitionEngine: FoodRecognitionEngine;
  let testImageBuffer: Buffer;

  beforeEach(() => {
    foodRecognitionEngine = new FoodRecognitionEngine();
    testImageBuffer = Buffer.from('fake-image-data');
    
    // 重置所有 mocks
    jest.clearAllMocks();
    
    // 設定環境變數
    process.env.GOOGLE_APPLICATION_CREDENTIALS = 'path/to/credentials.json';
    process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';
  });

  describe('recognizeFood', () => {
    beforeEach(() => {
      // Mock Google Vision API 回應
      mockVisionClient.objectLocalization.mockResolvedValue([{
        localizedObjectAnnotations: [
          {
            name: 'Food',
            score: 0.9,
            boundingPoly: {}
          },
          {
            name: 'Rice',
            score: 0.8,
            boundingPoly: {}
          }
        ]
      }]);

      mockVisionClient.labelDetection.mockResolvedValue([{
        labelAnnotations: [
          {
            description: 'Food',
            score: 0.95
          },
          {
            description: 'Rice',
            score: 0.85
          },
          {
            description: 'Asian food',
            score: 0.75
          }
        ]
      }]);

      mockVisionClient.textDetection.mockResolvedValue([{
        textAnnotations: [
          {
            description: 'Menu'
          },
          {
            description: 'Price: $10'
          }
        ]
      }]);

      // Mock 食物資料庫搜尋結果
      mockFoodRepository.searchByName.mockResolvedValue([
        {
          id: 'food-1',
          name: '白米飯',
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28,
            fat: 0.3,
            fiber: 0.4,
            sugar: 0.1,
            sodium: 5,
            vitamins: {
              vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
              thiamine: 0.07, riboflavin: 0.015, niacin: 1.6, vitaminB6: 0.164,
              folate: 8, vitaminB12: 0
            },
            minerals: {
              calcium: 28, iron: 0.8, magnesium: 25, phosphorus: 115,
              potassium: 115, sodium: 5, zinc: 1.09, copper: 0.22,
              manganese: 1.088, selenium: 15.1
            }
          }
        }
      ]);
    });

    it('應該成功辨識食物', async () => {
      const result = await foodRecognitionEngine.recognizeFood(testImageBuffer);

      expect(result).toHaveProperty('foods');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('processingTime');
      expect(Array.isArray(result.foods)).toBe(true);
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.processingTime).toBe('number');
    });

    it('應該過濾食物相關的結果', async () => {
      // 添加非食物相關的標籤
      mockVisionClient.labelDetection.mockResolvedValue([{
        labelAnnotations: [
          {
            description: 'Car', // 非食物相關
            score: 0.9
          },
          {
            description: 'Food', // 食物相關
            score: 0.8
          }
        ]
      }]);

      const result = await foodRecognitionEngine.recognizeFood(testImageBuffer);

      // 應該只包含食物相關的結果
      expect(mockFoodRepository.searchByName).toHaveBeenCalledWith('food');
      expect(mockFoodRepository.searchByName).not.toHaveBeenCalledWith('car');
    });

    it('應該限制返回結果數量', async () => {
      const options = { maxResults: 2 };
      const result = await foodRecognitionEngine.recognizeFood(testImageBuffer, options);

      expect(result.foods.length).toBeLessThanOrEqual(2);
    });

    it('應該過濾低信心度的結果', async () => {
      const options = { minConfidence: 0.8 };
      
      // Mock 低信心度的結果
      mockFoodRepository.searchByName.mockResolvedValue([
        {
          id: 'food-1',
          name: '低信心度食物',
          nutritionPer100g: {
            calories: 100,
            protein: 1,
            carbohydrates: 20,
            fat: 1,
            fiber: 1,
            sugar: 1,
            sodium: 1,
            vitamins: {
              vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
              thiamine: 0, riboflavin: 0, niacin: 0, vitaminB6: 0,
              folate: 0, vitaminB12: 0
            },
            minerals: {
              calcium: 0, iron: 0, magnesium: 0, phosphorus: 0,
              potassium: 0, sodium: 0, zinc: 0, copper: 0,
              manganese: 0, selenium: 0
            }
          }
        }
      ]);

      // Mock 低信心度的 Vision API 結果
      mockVisionClient.labelDetection.mockResolvedValue([{
        labelAnnotations: [
          {
            description: 'Food',
            score: 0.5 // 低於 minConfidence
          }
        ]
      }]);

      const result = await foodRecognitionEngine.recognizeFood(testImageBuffer, options);

      // 應該過濾掉低信心度的結果
      expect(result.foods.length).toBe(0);
    });

    it('應該處理 API 錯誤', async () => {
      mockVisionClient.objectLocalization.mockRejectedValue(new Error('API Error'));

      await expect(foodRecognitionEngine.recognizeFood(testImageBuffer))
        .rejects.toThrow('食物辨識失敗');
    });
  });

  describe('validateRecognitionQuality', () => {
    it('應該驗證高品質的辨識結果', () => {
      const goodResult = {
        foods: [
          {
            id: 'food-1',
            name: '白米飯',
            confidence: 0.9,
            estimatedPortion: 150,
            nutrition: {} as any
          }
        ],
        confidence: 0.8,
        processingTime: 2000
      };

      const validation = foodRecognitionEngine.validateRecognitionQuality(goodResult);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('應該識別低品質的辨識結果', () => {
      const poorResult = {
        foods: [],
        confidence: 0.2,
        processingTime: 15000
      };

      const validation = foodRecognitionEngine.validateRecognitionQuality(poorResult);

      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.suggestions.length).toBeGreaterThan(0);
    });

    it('應該識別個別食物信心度過低的問題', () => {
      const result = {
        foods: [
          {
            id: 'food-1',
            name: '不確定的食物',
            confidence: 0.3, // 低信心度
            estimatedPortion: 100,
            nutrition: {} as any
          }
        ],
        confidence: 0.6,
        processingTime: 3000
      };

      const validation = foodRecognitionEngine.validateRecognitionQuality(result);

      expect(validation.issues).toContain('1 個食物辨識信心度較低');
      expect(validation.suggestions).toContain('建議手動確認或重新拍攝');
    });
  });

  describe('healthCheck', () => {
    it('應該在服務健康時返回正常狀態', async () => {
      // Mock 成功的 API 調用
      mockVisionClient.labelDetection.mockResolvedValue([{
        labelAnnotations: []
      }]);

      const health = await foodRecognitionEngine.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details.visionApiConnected).toBe(true);
    });

    it('應該在服務異常時返回不健康狀態', async () => {
      // Mock API 錯誤
      mockVisionClient.labelDetection.mockRejectedValue(new Error('API Error'));

      const health = await foodRecognitionEngine.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details.visionApiConnected).toBe(false);
      expect(health.details.error).toBe('API Error');
    });
  });

  describe('getSupportedFoodCategories', () => {
    it('應該返回支援的食物類別列表', () => {
      const categories = foodRecognitionEngine.getSupportedFoodCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('主食類');
      expect(categories).toContain('蛋白質類');
      expect(categories).toContain('蔬菜類');
    });
  });
});