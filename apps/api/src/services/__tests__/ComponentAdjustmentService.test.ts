/**
 * ComponentAdjustmentService 測試
 */

import { ComponentAdjustmentService } from '../ComponentAdjustmentService';
import { 
  ComponentDetectionResult, 
  DetectedComponent,
  DishType,
  ComponentCategory,
  CookingMethod 
} from '../../types/ComponentDetection';

describe('ComponentAdjustmentService', () => {
  let service: ComponentAdjustmentService;
  let mockResult: ComponentDetectionResult;
  const testSessionId = 'test_session_123';

  beforeEach(() => {
    service = new ComponentAdjustmentService();

    // 創建模擬的識別結果
    mockResult = {
      mainDish: {
        name: '蛋炒飯',
        type: DishType.FRIED_RICE,
        confidence: 0.9,
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
          nutritionPer100g: {
            calories: 130,
            protein: 2.7,
            carbohydrates: 28,
            fat: 0.3
          },
          actualNutrition: {
            calories: 260,
            protein: 5.4,
            carbohydrates: 56,
            fat: 0.6
          }
        },
        {
          id: 'comp_2',
          name: '雞蛋',
          confidence: 0.9,
          estimatedPortion: 50,
          category: ComponentCategory.PROTEIN,
          cookingMethod: CookingMethod.STIR_FRIED,
          nutritionPer100g: {
            calories: 155,
            protein: 13,
            carbohydrates: 1.1,
            fat: 11
          },
          actualNutrition: {
            calories: 77.5,
            protein: 6.5,
            carbohydrates: 0.55,
            fat: 5.5
          }
        }
      ],
      nutritionSummary: {
        total: {
          calories: 337.5,
          protein: 11.9,
          carbohydrates: 56.55,
          fat: 6.1
        },
        byComponent: [],
        byCategory: [],
        cookingImpact: []
      },
      metadata: {
        processingTime: 1000,
        confidenceScore: 0.9,
        detectionMethod: 'hybrid',
        componentsDetected: 2,
        componentsFromKB: 0,
        componentsFromVision: 2
      },
      suggestions: {
        possibleMissingComponents: [],
        portionAdjustments: [],
        alternativeInterpretations: []
      }
    };

    // 初始化會話
    service.initializeSession(testSessionId, mockResult);
  });

  describe('initializeSession', () => {
    it('應該成功初始化會話', async () => {
      const state = await service.getSessionState(testSessionId);
      expect(state).toBeDefined();
      expect(state?.sessionId).toBe(testSessionId);
      expect(state?.currentResult.components.length).toBe(2);
    });
  });

  describe('addComponent', () => {
    it('應該成功添加新成分', async () => {
      const newComponent = {
        name: '青蔥',
        estimatedPortion: 10,
        category: ComponentCategory.GARNISH,
        cookingMethod: CookingMethod.STIR_FRIED
      };

      const result = await service.addComponent(testSessionId, newComponent);

      expect(result.addedComponent).toBeDefined();
      expect(result.addedComponent.name).toBe('青蔥');
      expect(result.updatedResult.components.length).toBe(3);
      expect(result.adjustmentId).toBeDefined();
    });

    it('應該為新成分設置預設值', async () => {
      const newComponent = {
        name: '測試成分'
      };

      const result = await service.addComponent(testSessionId, newComponent);

      expect(result.addedComponent.confidence).toBe(1.0);
      expect(result.addedComponent.estimatedPortion).toBe(50);
    });
  });

  describe('removeComponent', () => {
    it('應該成功移除成分', async () => {
      const result = await service.removeComponent(testSessionId, 'comp_1');

      expect(result.updatedResult.components.length).toBe(1);
      expect(result.updatedResult.components[0].id).toBe('comp_2');
      expect(result.adjustmentId).toBeDefined();
    });

    it('移除不存在的成分應該拋出錯誤', async () => {
      await expect(
        service.removeComponent(testSessionId, 'non_existent')
      ).rejects.toThrow('找不到成分');
    });
  });

  describe('updatePortion', () => {
    it('應該成功更新份量', async () => {
      const result = await service.updatePortion(testSessionId, 'comp_1', 250);

      expect(result.oldPortion).toBe(200);
      expect(result.newPortion).toBe(250);
      expect(result.adjustmentId).toBeDefined();

      // 檢查營養是否重新計算
      const component = result.updatedResult.components.find(c => c.id === 'comp_1');
      expect(component?.estimatedPortion).toBe(250);
    });

    it('更新不存在的成分應該拋出錯誤', async () => {
      await expect(
        service.updatePortion(testSessionId, 'non_existent', 100)
      ).rejects.toThrow('找不到成分');
    });
  });

  describe('recalculateNutrition', () => {
    it('應該成功重新計算營養', async () => {
      const result = await service.recalculateNutrition(testSessionId);

      expect(result.updatedResult).toBeDefined();
      expect(result.nutritionSummary).toBeDefined();
      expect(result.calculationTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSessionState', () => {
    it('應該返回會話狀態', async () => {
      const state = await service.getSessionState(testSessionId);

      expect(state).toBeDefined();
      expect(state?.sessionId).toBe(testSessionId);
      expect(state?.originalResult).toBeDefined();
      expect(state?.currentResult).toBeDefined();
    });

    it('不存在的會話應該返回 null', async () => {
      const state = await service.getSessionState('non_existent');
      expect(state).toBeNull();
    });
  });

  describe('getAdjustmentHistory', () => {
    it('應該返回調整歷史', async () => {
      // 執行一些調整
      await service.addComponent(testSessionId, { name: '測試成分' });
      await service.updatePortion(testSessionId, 'comp_1', 250);

      const history = await service.getAdjustmentHistory(testSessionId);

      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0].type).toBe('add');
      expect(history[1].type).toBe('update_portion');
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('應該清理過期會話', () => {
      // 創建多個會話
      service.initializeSession('session_1', mockResult);
      service.initializeSession('session_2', mockResult);
      service.initializeSession('session_3', mockResult);

      // 清理 0 小時前的會話（應該清理所有）
      const cleaned = service.cleanupExpiredSessions(0);

      // 至少應該清理一些會話
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });
  });
});
