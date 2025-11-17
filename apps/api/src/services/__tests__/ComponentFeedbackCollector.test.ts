/**
 * ComponentFeedbackCollector 單元測試
 */

import { ComponentFeedbackCollector } from '../ComponentFeedbackCollector';
import { FeedbackRepository } from '../../repositories/FeedbackRepository';
import { ComponentDetectionResult, DishType, ComponentCategory, CookingMethod } from '../../types/ComponentDetection';
import { FeedbackStatus } from '../../models/Feedback';

// Mock FeedbackRepository
jest.mock('../../repositories/FeedbackRepository');

describe('ComponentFeedbackCollector', () => {
  let componentFeedbackCollector: ComponentFeedbackCollector;
  let mockFeedbackRepository: jest.Mocked<FeedbackRepository>;

  beforeEach(() => {
    mockFeedbackRepository = new FeedbackRepository(null as any, null as any) as jest.Mocked<FeedbackRepository>;
    componentFeedbackCollector = new ComponentFeedbackCollector(mockFeedbackRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitComponentFeedback', () => {
    it('應該成功提交成分識別反饋', async () => {
      // 準備測試數據
      const recognitionResult: ComponentDetectionResult = {
        mainDish: {
          name: '蛋炒飯',
          type: DishType.FRIED_RICE,
          confidence: 0.92,
          estimatedTotalPortion: 300
        },
        components: [
          {
            id: 'comp_1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            category: ComponentCategory.GRAIN,
            cookingMethod: CookingMethod.STIR_FRIED,
            actualNutrition: {
              calories: 260,
              protein: 4,
              carbohydrates: 56,
              fat: 2
            }
          }
        ],
        nutritionSummary: {
          total: {
            calories: 260,
            protein: 4,
            carbohydrates: 56,
            fat: 2
          },
          byComponent: [],
          byCategory: [],
          cookingImpact: []
        },
        metadata: {
          processingTime: 2500,
          confidenceScore: 0.92,
          detectionMethod: 'hybrid',
          componentsDetected: 1,
          componentsFromKB: 0,
          componentsFromVision: 1
        },
        suggestions: {
          possibleMissingComponents: [],
          portionAdjustments: [],
          alternativeInterpretations: []
        }
      };

      const feedbackData = {
        imageId: 'img_123',
        userId: 'user_456',
        sessionId: 'session_789',
        recognitionResult,
        componentCorrections: {
          correctComponents: [
            {
              id: 'comp_1',
              name: '白飯',
              portion: 200
            }
          ],
          incorrectComponents: [],
          missingComponents: [
            {
              name: '青蔥',
              portion: 10,
              category: 'garnish',
              importance: 'medium' as const,
              reason: '圖片中可見但未識別'
            }
          ],
          componentPortionCorrections: [],
          componentCategoryCorrections: [],
          componentNutritionCorrections: []
        }
      };

      // Mock repository response
      const mockFeedback = {
        id: 'feedback_123',
        ...feedbackData,
        userCorrection: {
          correctFoods: [],
          incorrectFoods: [],
          missingFoods: [],
          portionCorrections: [],
          componentCorrections: feedbackData.componentCorrections
        },
        feedbackType: ['missing_component'],
        status: FeedbackStatus.PENDING,
        createdAt: new Date()
      };

      mockFeedbackRepository.create.mockResolvedValue(mockFeedback as any);

      // 執行測試
      const result = await componentFeedbackCollector.submitComponentFeedback(feedbackData);

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.id).toBe('feedback_123');
      expect(result.feedbackType).toContain('missing_component');
      expect(mockFeedbackRepository.create).toHaveBeenCalledTimes(1);
    });

    it('應該在缺少必填欄位時拋出錯誤', async () => {
      const invalidData = {
        imageId: '',
        sessionId: 'session_123',
        recognitionResult: {} as any,
        componentCorrections: {
          correctComponents: [],
          incorrectComponents: [],
          missingComponents: [],
          componentPortionCorrections: [],
          componentCategoryCorrections: [],
          componentNutritionCorrections: []
        }
      };

      await expect(
        componentFeedbackCollector.submitComponentFeedback(invalidData)
      ).rejects.toThrow('圖片ID為必填欄位');
    });

    it('應該在沒有任何修正時拋出錯誤', async () => {
      const recognitionResult: ComponentDetectionResult = {
        mainDish: {
          name: '蛋炒飯',
          type: DishType.FRIED_RICE,
          confidence: 0.92,
          estimatedTotalPortion: 300
        },
        components: [],
        nutritionSummary: {
          total: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
          byComponent: [],
          byCategory: [],
          cookingImpact: []
        },
        metadata: {
          processingTime: 2500,
          confidenceScore: 0.92,
          detectionMethod: 'hybrid',
          componentsDetected: 0,
          componentsFromKB: 0,
          componentsFromVision: 0
        },
        suggestions: {
          possibleMissingComponents: [],
          portionAdjustments: [],
          alternativeInterpretations: []
        }
      };

      const feedbackData = {
        imageId: 'img_123',
        sessionId: 'session_123',
        recognitionResult,
        componentCorrections: {
          correctComponents: [],
          incorrectComponents: [],
          missingComponents: [],
          componentPortionCorrections: [],
          componentCategoryCorrections: [],
          componentNutritionCorrections: []
        }
      };

      await expect(
        componentFeedbackCollector.submitComponentFeedback(feedbackData)
      ).rejects.toThrow('至少需要提供一種成分修正');
    });

    it('應該正確確定反饋類型', async () => {
      const recognitionResult: ComponentDetectionResult = {
        mainDish: {
          name: '蛋炒飯',
          type: DishType.FRIED_RICE,
          confidence: 0.92,
          estimatedTotalPortion: 300
        },
        components: [
          {
            id: 'comp_1',
            name: '火腿',
            confidence: 0.75,
            estimatedPortion: 30,
            category: ComponentCategory.PROTEIN,
            actualNutrition: {
              calories: 45,
              protein: 5,
              carbohydrates: 1,
              fat: 2
            }
          }
        ],
        nutritionSummary: {
          total: { calories: 45, protein: 5, carbohydrates: 1, fat: 2 },
          byComponent: [],
          byCategory: [],
          cookingImpact: []
        },
        metadata: {
          processingTime: 2500,
          confidenceScore: 0.75,
          detectionMethod: 'hybrid',
          componentsDetected: 1,
          componentsFromKB: 0,
          componentsFromVision: 1
        },
        suggestions: {
          possibleMissingComponents: [],
          portionAdjustments: [],
          alternativeInterpretations: []
        }
      };

      const feedbackData = {
        imageId: 'img_123',
        sessionId: 'session_123',
        recognitionResult,
        componentCorrections: {
          correctComponents: [],
          incorrectComponents: [
            {
              identifiedAs: '火腿',
              actualComponent: '叉燒',
              reason: '顏色相似'
            }
          ],
          missingComponents: [
            {
              name: '青蔥',
              portion: 10,
              importance: 'medium' as const
            }
          ],
          componentPortionCorrections: [],
          componentCategoryCorrections: [],
          componentNutritionCorrections: []
        }
      };

      const mockFeedback = {
        id: 'feedback_123',
        ...feedbackData,
        userCorrection: {
          correctFoods: [],
          incorrectFoods: [],
          missingFoods: [],
          portionCorrections: [],
          componentCorrections: feedbackData.componentCorrections
        },
        feedbackType: ['incorrect_component', 'missing_component'],
        status: FeedbackStatus.PENDING,
        createdAt: new Date()
      };

      mockFeedbackRepository.create.mockResolvedValue(mockFeedback as any);

      const result = await componentFeedbackCollector.submitComponentFeedback(feedbackData);

      expect(result.feedbackType).toContain('incorrect_component');
      expect(result.feedbackType).toContain('missing_component');
    });
  });

  describe('getComponentFeedbackStats', () => {
    it('應該返回成分反饋統計', async () => {
      const mockFeedbacks = [
        {
          id: 'feedback_1',
          userCorrection: {
            correctFoods: [],
            incorrectFoods: [],
            missingFoods: [],
            portionCorrections: [],
            componentCorrections: {
              correctComponents: [],
              incorrectComponents: [
                {
                  identifiedAs: '火腿',
                  actualComponent: '叉燒'
                }
              ],
              missingComponents: [
                {
                  name: '青蔥',
                  importance: 'medium'
                }
              ],
              componentPortionCorrections: [],
              componentCategoryCorrections: [],
              componentNutritionCorrections: []
            }
          },
          recognitionResult: {
            componentDetection: {
              mainDish: { name: '炒飯', type: 'fried_rice', confidence: 0.9 },
              components: [
                { id: 'comp_1', name: '火腿', confidence: 0.75 }
              ],
              totalComponents: 1
            }
          },
          createdAt: new Date()
        }
      ];

      mockFeedbackRepository.findAll.mockResolvedValue(mockFeedbacks as any);

      const stats = await componentFeedbackCollector.getComponentFeedbackStats();

      expect(stats).toBeDefined();
      expect(stats.totalFeedbacks).toBe(1);
      expect(stats.incorrectComponents).toBe(1);
      expect(stats.missingComponents).toBe(1);
    });

    it('應該在沒有反饋時返回空統計', async () => {
      mockFeedbackRepository.findAll.mockResolvedValue([]);

      const stats = await componentFeedbackCollector.getComponentFeedbackStats();

      expect(stats.totalFeedbacks).toBe(0);
      expect(stats.incorrectComponents).toBe(0);
      expect(stats.missingComponents).toBe(0);
      expect(stats.averageComponentAccuracy).toBe(0);
    });
  });

  describe('getComponentFeedbackHistory', () => {
    it('應該返回特定成分的反饋歷史', async () => {
      const mockFeedbacks = [
        {
          id: 'feedback_1',
          userCorrection: {
            correctFoods: [],
            incorrectFoods: [],
            missingFoods: [],
            portionCorrections: [],
            componentCorrections: {
              correctComponents: [],
              incorrectComponents: [
                {
                  identifiedAs: '雞蛋',
                  actualComponent: '鴨蛋',
                  reason: '實際是鴨蛋'
                }
              ],
              missingComponents: [],
              componentPortionCorrections: [],
              componentCategoryCorrections: [],
              componentNutritionCorrections: []
            }
          },
          recognitionResult: {
            componentDetection: {
              mainDish: { name: '炒飯', type: 'fried_rice' },
              components: [
                { name: '雞蛋', confidence: 0.85 }
              ]
            }
          },
          createdAt: new Date()
        }
      ];

      mockFeedbackRepository.findAll.mockResolvedValue(mockFeedbacks as any);

      const history = await componentFeedbackCollector.getComponentFeedbackHistory('雞蛋');

      expect(history).toBeDefined();
      expect(history.totalMentions).toBe(1);
      expect(history.incorrectIdentifications).toBe(1);
      expect(history.suggestions.length).toBeGreaterThan(0);
    });

    it('應該在沒有相關反饋時返回空歷史', async () => {
      mockFeedbackRepository.findAll.mockResolvedValue([]);

      const history = await componentFeedbackCollector.getComponentFeedbackHistory('不存在的成分');

      expect(history.totalMentions).toBe(0);
      expect(history.incorrectIdentifications).toBe(0);
      expect(history.missingOccurrences).toBe(0);
    });
  });

  describe('getDishTypeComponentAccuracy', () => {
    it('應該返回料理類型的成分識別準確率', async () => {
      const mockFeedbacks = [
        {
          id: 'feedback_1',
          userCorrection: {
            correctFoods: [],
            incorrectFoods: [],
            missingFoods: [],
            portionCorrections: [],
            componentCorrections: {
              correctComponents: [],
              incorrectComponents: [],
              missingComponents: [
                { name: '青蔥', importance: 'low' }
              ],
              componentPortionCorrections: [],
              componentCategoryCorrections: [],
              componentNutritionCorrections: []
            }
          },
          recognitionResult: {
            componentDetection: {
              mainDish: { name: '炒飯', type: 'fried_rice', confidence: 0.9 },
              components: [
                { name: '白飯' },
                { name: '雞蛋' }
              ],
              totalComponents: 2
            }
          },
          createdAt: new Date()
        }
      ];

      mockFeedbackRepository.findAll.mockResolvedValue(mockFeedbacks as any);

      const accuracy = await componentFeedbackCollector.getDishTypeComponentAccuracy('fried_rice');

      expect(accuracy).toBeDefined();
      expect(accuracy.dishType).toBe('fried_rice');
      expect(accuracy.totalFeedbacks).toBe(1);
      expect(accuracy.averageComponentsDetected).toBe(2);
      expect(accuracy.averageComponentsMissing).toBe(1);
    });

    it('應該在沒有該料理類型的反饋時返回空結果', async () => {
      mockFeedbackRepository.findAll.mockResolvedValue([]);

      const accuracy = await componentFeedbackCollector.getDishTypeComponentAccuracy('unknown_type');

      expect(accuracy.totalFeedbacks).toBe(0);
      expect(accuracy.accuracyRate).toBe(0);
    });
  });
});
