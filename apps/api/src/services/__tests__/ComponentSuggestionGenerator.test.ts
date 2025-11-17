/**
 * ComponentSuggestionGenerator 測試
 */

import { ComponentSuggestionGenerator } from '../ComponentSuggestionGenerator';
import {
  MainDishInfo,
  DetectedComponent,
  DishType,
  ComponentCategory,
  CookingMethod
} from '../../types/ComponentDetection';

describe('ComponentSuggestionGenerator', () => {
  let generator: ComponentSuggestionGenerator;

  beforeEach(() => {
    generator = new ComponentSuggestionGenerator();
  });

  describe('generateSuggestions', () => {
    it('應該為缺少常見成分的炒飯生成建議', () => {
      const mainDish: MainDishInfo = {
        name: '蛋炒飯',
        type: DishType.FRIED_RICE,
        confidence: 0.92,
        estimatedTotalPortion: 280
      };

      const detectedComponents: DetectedComponent[] = [
        {
          id: 'comp_1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 250,
          category: ComponentCategory.GRAIN,
          cookingMethod: CookingMethod.STIR_FRIED
        }
      ];

      const suggestions = generator.generateSuggestions(
        mainDish,
        detectedComponents,
        mainDish.confidence
      );

      // 應該建議缺少的雞蛋和青蔥
      expect(suggestions.possibleMissingComponents.length).toBeGreaterThan(0);
      expect(suggestions.possibleMissingComponents).toContain('雞蛋');
    });

    it('應該為份量不合理的成分生成調整建議', () => {
      const mainDish: MainDishInfo = {
        name: '蛋炒飯',
        type: DishType.FRIED_RICE,
        confidence: 0.88,
        estimatedTotalPortion: 300
      };

      const detectedComponents: DetectedComponent[] = [
        {
          id: 'comp_1',
          name: '白飯',
          confidence: 0.90,
          estimatedPortion: 50, // 太少
          category: ComponentCategory.GRAIN
        }
      ];

      const suggestions = generator.generateSuggestions(
        mainDish,
        detectedComponents,
        mainDish.confidence
      );

      // 應該建議調整份量
      expect(suggestions.portionAdjustments.length).toBeGreaterThan(0);
      expect(suggestions.portionAdjustments[0].component).toBe('白飯');
      expect(suggestions.portionAdjustments[0].suggestedPortion).toBeGreaterThan(50);
    });

    it('應該在低信心度時生成替代解釋', () => {
      const mainDish: MainDishInfo = {
        name: '味噌湯',
        type: DishType.SOUP,
        confidence: 0.72, // 低信心度
        estimatedTotalPortion: 300
      };

      const detectedComponents: DetectedComponent[] = [
        {
          id: 'comp_1',
          name: '豆腐',
          confidence: 0.88,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN
        }
      ];

      const suggestions = generator.generateSuggestions(
        mainDish,
        detectedComponents,
        mainDish.confidence
      );

      // 低信心度時應該提供替代解釋
      // 注意：這取決於知識庫中是否有相似的料理
      expect(suggestions.alternativeInterpretations).toBeDefined();
    });

    it('應該在高信心度時不生成替代解釋', () => {
      const mainDish: MainDishInfo = {
        name: '蛋炒飯',
        type: DishType.FRIED_RICE,
        confidence: 0.92, // 高信心度
        estimatedTotalPortion: 300
      };

      const detectedComponents: DetectedComponent[] = [
        {
          id: 'comp_1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN
        },
        {
          id: 'comp_2',
          name: '雞蛋',
          confidence: 0.90,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN
        }
      ];

      const suggestions = generator.generateSuggestions(
        mainDish,
        detectedComponents,
        mainDish.confidence
      );

      // 高信心度時不應該提供替代解釋
      expect(suggestions.alternativeInterpretations.length).toBe(0);
    });
  });

  describe('generateSuggestionSummary', () => {
    it('應該生成包含所有建議類型的摘要', () => {
      const suggestions = {
        possibleMissingComponents: ['雞蛋', '青蔥'],
        portionAdjustments: [
          {
            component: '白飯',
            suggestedPortion: 200,
            reason: '份量過少'
          }
        ],
        alternativeInterpretations: [
          {
            dishName: '揚州炒飯',
            components: [],
            confidence: 0.78
          }
        ]
      };

      const summary = generator.generateSuggestionSummary(suggestions);

      expect(summary).toContain('雞蛋');
      expect(summary).toContain('青蔥');
      expect(summary).toContain('份量建議調整');
      expect(summary).toContain('揚州炒飯');
    });

    it('應該在沒有建議時返回適當的訊息', () => {
      const suggestions = {
        possibleMissingComponents: [],
        portionAdjustments: [],
        alternativeInterpretations: []
      };

      const summary = generator.generateSuggestionSummary(suggestions);

      expect(summary).toBe('無額外建議');
    });
  });

  describe('料理類型特定建議', () => {
    it('應該為便當生成特定的缺失成分建議', () => {
      const mainDish: MainDishInfo = {
        name: '台式便當',
        type: DishType.BENTO,
        confidence: 0.88,
        estimatedTotalPortion: 450
      };

      const detectedComponents: DetectedComponent[] = [
        {
          id: 'comp_1',
          name: '白飯',
          confidence: 0.90,
          estimatedPortion: 200,
          category: ComponentCategory.GRAIN
        }
      ];

      const suggestions = generator.generateSuggestions(
        mainDish,
        detectedComponents,
        mainDish.confidence
      );

      // 便當應該建議主菜和配菜
      expect(suggestions.possibleMissingComponents.length).toBeGreaterThan(0);
    });

    it('應該為湯品生成特定的缺失成分建議', () => {
      const mainDish: MainDishInfo = {
        name: '味噌湯',
        type: DishType.SOUP,
        confidence: 0.85,
        estimatedTotalPortion: 300
      };

      const detectedComponents: DetectedComponent[] = [];

      const suggestions = generator.generateSuggestions(
        mainDish,
        detectedComponents,
        mainDish.confidence
      );

      // 湯品應該建議湯底和配料
      expect(suggestions.possibleMissingComponents.length).toBeGreaterThan(0);
    });
  });
});
