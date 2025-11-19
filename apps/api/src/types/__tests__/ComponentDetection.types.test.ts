/**
 * 類型定義測試
 * 驗證 ComponentDetection 類型定義的正確性
 */

import {
  RecognizedFood,
  DetectComponentsOptions,
  EnrichedComponent,
  DetectionMetadata,
  DishType,
  ComponentCategory,
  CookingMethod
} from '../ComponentDetection';

describe('ComponentDetection 類型定義測試', () => {
  describe('RecognizedFood 接口', () => {
    it('應該正確定義 RecognizedFood 接口', () => {
      const recognizedFood: RecognizedFood = {
        id: 'food-1',
        name: '白飯',
        nameEn: 'White Rice',
        confidence: 0.95,
        estimatedPortion: 200,
        unit: 'g',
        category: 'grain',
        nutrition: {
          calories: 260,
          protein: 5,
          carbohydrates: 58,
          fat: 0.5,
          fiber: 0.5,
          sodium: 2,
          sugar: 0.1
        }
      };

      expect(recognizedFood.id).toBe('food-1');
      expect(recognizedFood.name).toBe('白飯');
      expect(recognizedFood.confidence).toBe(0.95);
    });

    it('應該支持可選屬性', () => {
      const minimalFood: RecognizedFood = {
        id: 'food-2',
        name: '炸豬排',
        confidence: 0.90
      };

      expect(minimalFood.id).toBe('food-2');
      expect(minimalFood.nameEn).toBeUndefined();
      expect(minimalFood.nutrition).toBeUndefined();
    });
  });

  describe('DetectComponentsOptions 接口', () => {
    it('應該正確定義 DetectComponentsOptions 接口', () => {
      const options: DetectComponentsOptions = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95
          },
          {
            id: 'food-2',
            name: '炸豬排',
            confidence: 0.90
          }
        ]
      };

      expect(options.dishName).toBe('便當');
      expect(options.dishType).toBe(DishType.BENTO);
      expect(options.preRecognizedFoods).toHaveLength(2);
    });

    it('應該支持空選項', () => {
      const emptyOptions: DetectComponentsOptions = {};

      expect(emptyOptions.dishName).toBeUndefined();
      expect(emptyOptions.dishType).toBeUndefined();
      expect(emptyOptions.preRecognizedFoods).toBeUndefined();
    });

    it('應該支持只有 preRecognizedFoods 的選項', () => {
      const options: DetectComponentsOptions = {
        preRecognizedFoods: [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95
          }
        ]
      };

      expect(options.preRecognizedFoods).toHaveLength(1);
      expect(options.dishName).toBeUndefined();
    });
  });

  describe('EnrichedComponent 接口', () => {
    it('應該包含 sourceType 和 originalFoodId 屬性', () => {
      const component: EnrichedComponent = {
        id: 'comp-1',
        name: '白飯',
        nameEn: 'White Rice',
        confidence: 0.95,
        estimatedPortion: 200,
        cookingMethod: CookingMethod.BOILED,
        category: ComponentCategory.GRAIN,
        sourceType: 'pre_recognized',
        originalFoodId: 'food-1'
      };

      expect(component.sourceType).toBe('pre_recognized');
      expect(component.originalFoodId).toBe('food-1');
    });

    it('應該支持所有 sourceType 值', () => {
      const visionComponent: EnrichedComponent = {
        id: 'comp-1',
        name: '白飯',
        confidence: 0.95,
        estimatedPortion: 200,
        sourceType: 'vision_api'
      };

      const kbComponent: EnrichedComponent = {
        id: 'comp-2',
        name: '炸豬排',
        confidence: 0.90,
        estimatedPortion: 150,
        sourceType: 'knowledge_base'
      };

      const preRecognizedComponent: EnrichedComponent = {
        id: 'comp-3',
        name: '滷蛋',
        confidence: 0.85,
        estimatedPortion: 60,
        sourceType: 'pre_recognized',
        originalFoodId: 'food-3'
      };

      expect(visionComponent.sourceType).toBe('vision_api');
      expect(kbComponent.sourceType).toBe('knowledge_base');
      expect(preRecognizedComponent.sourceType).toBe('pre_recognized');
    });
  });

  describe('DetectionMetadata 接口', () => {
    it('應該包含 componentsFromPreRecognition 屬性', () => {
      const metadata: DetectionMetadata = {
        processingTime: 1500,
        confidenceScore: 0.92,
        detectionMethod: 'pre_recognized',
        componentsDetected: 5,
        componentsFromKB: 0,
        componentsFromVision: 0,
        componentsFromPreRecognition: 5
      };

      expect(metadata.detectionMethod).toBe('pre_recognized');
      expect(metadata.componentsFromPreRecognition).toBe(5);
    });

    it('應該支持所有 detectionMethod 值', () => {
      const visionMetadata: DetectionMetadata = {
        processingTime: 2000,
        confidenceScore: 0.88,
        detectionMethod: 'vision_api',
        componentsDetected: 3,
        componentsFromKB: 0,
        componentsFromVision: 3
      };

      const hybridMetadata: DetectionMetadata = {
        processingTime: 1800,
        confidenceScore: 0.90,
        detectionMethod: 'hybrid',
        componentsDetected: 4,
        componentsFromKB: 2,
        componentsFromVision: 2
      };

      const preRecognizedMetadata: DetectionMetadata = {
        processingTime: 1200,
        confidenceScore: 0.93,
        detectionMethod: 'pre_recognized',
        componentsDetected: 5,
        componentsFromKB: 0,
        componentsFromVision: 0,
        componentsFromPreRecognition: 5
      };

      expect(visionMetadata.detectionMethod).toBe('vision_api');
      expect(hybridMetadata.detectionMethod).toBe('hybrid');
      expect(preRecognizedMetadata.detectionMethod).toBe('pre_recognized');
    });

    it('componentsFromPreRecognition 應該是可選的', () => {
      const metadata: DetectionMetadata = {
        processingTime: 1500,
        confidenceScore: 0.92,
        detectionMethod: 'vision_api',
        componentsDetected: 3,
        componentsFromKB: 0,
        componentsFromVision: 3
      };

      expect(metadata.componentsFromPreRecognition).toBeUndefined();
    });
  });

  describe('類型兼容性測試', () => {
    it('RecognizedFood 應該可以轉換為 EnrichedComponent 所需的數據', () => {
      const recognizedFood: RecognizedFood = {
        id: 'food-1',
        name: '白飯',
        nameEn: 'White Rice',
        confidence: 0.95,
        estimatedPortion: 200,
        unit: 'g',
        nutrition: {
          calories: 260,
          protein: 5,
          carbohydrates: 58,
          fat: 0.5
        }
      };

      // 模擬轉換過程
      const component: EnrichedComponent = {
        id: `comp-${recognizedFood.id}`,
        name: recognizedFood.name,
        nameEn: recognizedFood.nameEn,
        confidence: recognizedFood.confidence,
        estimatedPortion: recognizedFood.estimatedPortion || 0,
        sourceType: 'pre_recognized',
        originalFoodId: recognizedFood.id,
        actualNutrition: recognizedFood.nutrition
      };

      expect(component.name).toBe(recognizedFood.name);
      expect(component.sourceType).toBe('pre_recognized');
      expect(component.originalFoodId).toBe(recognizedFood.id);
    });
  });
});
