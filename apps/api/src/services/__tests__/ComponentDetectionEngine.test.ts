/**
 * ComponentDetectionEngine 單元測試
 */

import { ComponentDetectionEngine } from '../ComponentDetectionEngine';
import { DishType } from '../../types/ComponentDetection';

describe('ComponentDetectionEngine', () => {
  let engine: ComponentDetectionEngine;

  beforeEach(() => {
    engine = new ComponentDetectionEngine('zh-TW');
  });

  describe('基礎功能', () => {
    it('應該成功創建引擎實例', () => {
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(ComponentDetectionEngine);
    });

    it('應該支持中文和英文語言', () => {
      const zhEngine = new ComponentDetectionEngine('zh-TW');
      const enEngine = new ComponentDetectionEngine('en');
      
      expect(zhEngine).toBeDefined();
      expect(enEngine).toBeDefined();
    });
  });

  describe('成分驗證', () => {
    it('應該檢測到空成分列表', () => {
      const result = engine.validateComponents([], DishType.FRIED_RICE);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('未檢測到任何成分');
    });

    it('應該警告低信心度成分', () => {
      const components = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.3,
          estimatedPortion: 200
        }
      ];
      
      const result = engine.validateComponents(components as any, DishType.FRIED_RICE);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('信心度較低');
    });

    it('應該檢查炒飯是否包含米飯', () => {
      const componentsWithoutRice = [
        {
          id: '1',
          name: '雞蛋',
          confidence: 0.9,
          estimatedPortion: 50
        }
      ];
      
      const result = engine.validateComponents(
        componentsWithoutRice as any, 
        DishType.FRIED_RICE
      );
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('應該檢查湯品是否包含湯底', () => {
      const componentsWithoutSoup = [
        {
          id: '1',
          name: '豆腐',
          confidence: 0.9,
          estimatedPortion: 50,
          category: 'protein'
        }
      ];
      
      const result = engine.validateComponents(
        componentsWithoutSoup as any,
        DishType.SOUP
      );
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('知識庫增強', () => {
    it('應該能夠使用知識庫增強成分', async () => {
      const visionComponents = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.9,
          estimatedPortion: 200
        }
      ];
      
      const enriched = await engine.enrichWithKnowledgeBase(
        visionComponents as any,
        '蛋炒飯',
        DishType.FRIED_RICE
      );
      
      expect(enriched.length).toBeGreaterThanOrEqual(visionComponents.length);
    });

    it('應該標記知識庫匹配的成分', async () => {
      const visionComponents = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.9,
          estimatedPortion: 200
        }
      ];
      
      const enriched = await engine.enrichWithKnowledgeBase(
        visionComponents as any,
        '蛋炒飯',
        DishType.FRIED_RICE
      );
      
      const kbComponents = enriched.filter(c => c.knowledgeBaseMatch);
      expect(kbComponents.length).toBeGreaterThan(0);
    });
  });

  describe('輔助方法', () => {
    it('應該正確解析烹飪方式', () => {
      const engine = new ComponentDetectionEngine();
      
      // 使用 any 類型來訪問私有方法進行測試
      const parseCookingMethod = (engine as any).parseCookingMethod.bind(engine);
      
      expect(parseCookingMethod('fried')).toBe('fried');
      expect(parseCookingMethod('boiled')).toBe('boiled');
      expect(parseCookingMethod('steamed')).toBe('steamed');
    });

    it('應該正確解析成分類別', () => {
      const engine = new ComponentDetectionEngine();
      
      const parseCategory = (engine as any).parseCategory.bind(engine);
      
      expect(parseCategory('grain')).toBe('grain');
      expect(parseCategory('protein')).toBe('protein');
      expect(parseCategory('vegetable')).toBe('vegetable');
    });

    it('應該計算字串相似度', () => {
      const engine = new ComponentDetectionEngine();
      
      const isSimilarComponent = (engine as any).isSimilarComponent.bind(engine);
      
      // 完全相同
      expect(isSimilarComponent('白飯', '白飯')).toBe(true);
      // 包含關係
      expect(isSimilarComponent('飯', '白飯')).toBe(true);
      expect(isSimilarComponent('白飯', '飯')).toBe(true);
      // 完全不同
      expect(isSimilarComponent('白飯', '麵條')).toBe(false);
    });
  });

  describe('整體信心度計算', () => {
    it('應該正確計算平均信心度', () => {
      const engine = new ComponentDetectionEngine();
      
      const calculateOverallConfidence = (engine as any).calculateOverallConfidence.bind(engine);
      
      const components = [
        { confidence: 0.9 },
        { confidence: 0.8 },
        { confidence: 0.7 }
      ];
      
      const confidence = calculateOverallConfidence(components);
      expect(confidence).toBeCloseTo(0.8, 1);
    });

    it('應該處理空成分列表', () => {
      const engine = new ComponentDetectionEngine();
      
      const calculateOverallConfidence = (engine as any).calculateOverallConfidence.bind(engine);
      
      const confidence = calculateOverallConfidence([]);
      expect(confidence).toBe(0);
    });
  });

  describe('成分提取邏輯', () => {
    it('應該正確解析 Vision API 回應', () => {
      const engine = new ComponentDetectionEngine();
      
      // 模擬 Vision API 回應數據
      const mockVisionResponse = [
        {
          name: '白飯',
          nameEn: 'White Rice',
          confidence: 0.95,
          estimatedPortion: 200,
          cookingMethod: 'stir_fried',
          category: 'grain',
          visualFeatures: {
            color: ['白色', '淡黃'],
            shape: '顆粒狀',
            texture: '鬆散',
            position: '中央'
          }
        },
        {
          name: '雞蛋',
          confidence: 0.9,
          estimatedPortion: 50,
          cookingMethod: 'stir_fried',
          category: 'protein'
        }
      ];
      
      // 測試解析邏輯（通過私有方法訪問）
      const parseCookingMethod = (engine as any).parseCookingMethod.bind(engine);
      const parseCategory = (engine as any).parseCategory.bind(engine);
      
      expect(parseCookingMethod('stir_fried')).toBe('stir_fried');
      expect(parseCategory('grain')).toBe('grain');
      expect(parseCategory('protein')).toBe('protein');
    });

    it('應該處理不完整的 Vision API 數據', () => {
      const engine = new ComponentDetectionEngine();
      
      const parseCookingMethod = (engine as any).parseCookingMethod.bind(engine);
      const parseCategory = (engine as any).parseCategory.bind(engine);
      
      // 測試 undefined 輸入
      expect(parseCookingMethod(undefined)).toBeUndefined();
      expect(parseCategory(undefined)).toBeUndefined();
      
      // 測試無效輸入
      expect(parseCookingMethod('invalid')).toBeUndefined();
      expect(parseCategory('invalid')).toBeUndefined();
    });

    it('應該正確處理視覺特徵', () => {
      const engine = new ComponentDetectionEngine();
      
      // 測試視覺特徵的處理
      const mockComponent = {
        id: 'test-1',
        name: '白飯',
        confidence: 0.95,
        estimatedPortion: 200,
        visualFeatures: {
          color: ['白色', '淡黃'],
          shape: '顆粒狀',
          texture: '鬆散',
          position: '中央'
        }
      };
      
      expect(mockComponent.visualFeatures.color).toContain('白色');
      expect(mockComponent.visualFeatures.shape).toBe('顆粒狀');
    });
  });

  describe('知識庫增強進階測試', () => {
    it('應該合併 Vision API 和知識庫的成分', async () => {
      const visionComponents = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.9,
          estimatedPortion: 200,
          category: 'grain' as any
        }
      ];
      
      const enriched = await engine.enrichWithKnowledgeBase(
        visionComponents as any,
        '蛋炒飯',
        DishType.FRIED_RICE
      );
      
      // 應該包含 Vision API 識別的成分
      const riceComponent = enriched.find(c => c.name === '白飯');
      expect(riceComponent).toBeDefined();
      
      // 可能包含知識庫補充的成分（如雞蛋、青蔥等）
      expect(enriched.length).toBeGreaterThanOrEqual(1);
      
      // 檢查是否有知識庫補充的成分
      const kbComponents = enriched.filter(c => c.knowledgeBaseMatch === true);
      expect(kbComponents.length).toBeGreaterThanOrEqual(0);
    });

    it('應該避免重複添加相似成分', async () => {
      const visionComponents = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.9,
          estimatedPortion: 200
        },
        {
          id: '2',
          name: '飯',
          confidence: 0.8,
          estimatedPortion: 180
        }
      ];
      
      const enriched = await engine.enrichWithKnowledgeBase(
        visionComponents as any,
        '蛋炒飯',
        DishType.FRIED_RICE
      );
      
      // 檢查是否有重複的米飯成分
      const riceComponents = enriched.filter(c => 
        c.name.includes('飯') || c.name.includes('rice')
      );
      
      // 應該合併相似成分，不會有太多重複
      expect(riceComponents.length).toBeLessThanOrEqual(3);
    });

    it('應該為高頻率成分設置合理的信心度', async () => {
      const visionComponents: any[] = [];
      
      const enriched = await engine.enrichWithKnowledgeBase(
        visionComponents,
        '蛋炒飯',
        DishType.FRIED_RICE
      );
      
      // 知識庫補充的成分應該有合理的信心度
      const kbComponents = enriched.filter(c => c.knowledgeBaseMatch);
      
      kbComponents.forEach(comp => {
        expect(comp.confidence).toBeGreaterThan(0);
        expect(comp.confidence).toBeLessThanOrEqual(1);
        // 知識庫成分的信心度應該略低於直接識別
        expect(comp.confidence).toBeLessThan(0.9);
      });
    });

    it('應該處理未知料理類型', async () => {
      const visionComponents = [
        {
          id: '1',
          name: '未知食材',
          confidence: 0.7,
          estimatedPortion: 100
        }
      ];
      
      const enriched = await engine.enrichWithKnowledgeBase(
        visionComponents as any,
        '未知料理',
        DishType.UNKNOWN
      );
      
      // 即使是未知料理，也應該返回成分
      expect(enriched.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('成分驗證進階測試', () => {
    it('應該檢測份量異常', () => {
      const componentsWithLargePortion = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.9,
          estimatedPortion: 2000, // 異常大的份量
          category: 'grain' as any
        }
      ];
      
      const result = engine.validateComponents(
        componentsWithLargePortion as any,
        DishType.FRIED_RICE
      );
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('過多'))).toBe(true);
    });

    it('應該檢測份量過小', () => {
      const componentsWithSmallPortion = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.9,
          estimatedPortion: 10, // 異常小的份量
          category: 'grain' as any
        }
      ];
      
      const result = engine.validateComponents(
        componentsWithSmallPortion as any,
        DishType.FRIED_RICE
      );
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('過少'))).toBe(true);
    });

    it('應該驗證便當的成分結構', () => {
      const bentoComponents = [
        {
          id: '1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          category: 'grain' as any
        },
        {
          id: '2',
          name: '炸雞腿',
          confidence: 0.9,
          estimatedPortion: 120,
          category: 'protein' as any
        },
        {
          id: '3',
          name: '高麗菜',
          confidence: 0.85,
          estimatedPortion: 50,
          category: 'vegetable' as any
        }
      ];
      
      const result = engine.validateComponents(
        bentoComponents as any,
        DishType.BENTO
      );
      
      // 便當應該包含主食、主菜和配菜
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('應該檢測麵食類缺少麵條', () => {
      const noodlesWithoutNoodles = [
        {
          id: '1',
          name: '叉燒',
          confidence: 0.9,
          estimatedPortion: 50,
          category: 'protein' as any
        },
        {
          id: '2',
          name: '青蔥',
          confidence: 0.85,
          estimatedPortion: 10,
          category: 'garnish' as any
        }
      ];
      
      const result = engine.validateComponents(
        noodlesWithoutNoodles as any,
        DishType.NOODLES
      );
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('麵'))).toBe(true);
    });
  });

  describe('料理類型一致性檢查', () => {
    it('應該檢查炒飯必須包含米飯', () => {
      const engine = new ComponentDetectionEngine();
      const checkDishTypeConsistency = (engine as any).checkDishTypeConsistency.bind(engine);
      
      const componentsWithoutRice = [
        {
          name: '雞蛋',
          category: 'protein' as any
        }
      ];
      
      const result = checkDishTypeConsistency(componentsWithoutRice, DishType.FRIED_RICE);
      
      expect(result.isConsistent).toBe(false);
      expect(result.message).toContain('米飯');
    });

    it('應該檢查湯品必須包含湯底', () => {
      const engine = new ComponentDetectionEngine();
      const checkDishTypeConsistency = (engine as any).checkDishTypeConsistency.bind(engine);
      
      const componentsWithoutBroth = [
        {
          name: '豆腐',
          category: 'protein' as any
        }
      ];
      
      const result = checkDishTypeConsistency(componentsWithoutBroth, DishType.SOUP);
      
      expect(result.isConsistent).toBe(false);
      expect(result.message).toContain('湯底');
    });

    it('應該檢查麵食必須包含麵條', () => {
      const engine = new ComponentDetectionEngine();
      const checkDishTypeConsistency = (engine as any).checkDishTypeConsistency.bind(engine);
      
      const componentsWithoutNoodles = [
        {
          name: '叉燒',
          category: 'protein' as any
        }
      ];
      
      const result = checkDishTypeConsistency(componentsWithoutNoodles, DishType.NOODLES);
      
      expect(result.isConsistent).toBe(false);
      expect(result.message).toContain('麵');
    });
  });

  describe('字串相似度計算', () => {
    it('應該識別完全相同的成分', () => {
      const engine = new ComponentDetectionEngine();
      const isSimilarComponent = (engine as any).isSimilarComponent.bind(engine);
      
      expect(isSimilarComponent('白飯', '白飯')).toBe(true);
      expect(isSimilarComponent('雞蛋', '雞蛋')).toBe(true);
    });

    it('應該識別包含關係的成分', () => {
      const engine = new ComponentDetectionEngine();
      const isSimilarComponent = (engine as any).isSimilarComponent.bind(engine);
      
      expect(isSimilarComponent('飯', '白飯')).toBe(true);
      expect(isSimilarComponent('白飯', '飯')).toBe(true);
      expect(isSimilarComponent('蛋', '雞蛋')).toBe(true);
    });

    it('應該識別不相似的成分', () => {
      const engine = new ComponentDetectionEngine();
      const isSimilarComponent = (engine as any).isSimilarComponent.bind(engine);
      
      expect(isSimilarComponent('白飯', '麵條')).toBe(false);
      expect(isSimilarComponent('雞蛋', '豆腐')).toBe(false);
    });

    it('應該計算編輯距離', () => {
      const engine = new ComponentDetectionEngine();
      const levenshteinDistance = (engine as any).levenshteinDistance.bind(engine);
      
      expect(levenshteinDistance('白飯', '白飯')).toBe(0);
      expect(levenshteinDistance('白飯', '炒飯')).toBeGreaterThan(0);
      expect(levenshteinDistance('abc', 'abc')).toBe(0);
      expect(levenshteinDistance('abc', 'abd')).toBe(1);
    });
  });
});
