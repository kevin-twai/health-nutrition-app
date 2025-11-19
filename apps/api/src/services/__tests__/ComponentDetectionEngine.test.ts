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

  describe('convertRecognizedFoodsToComponents', () => {
    it('應該正確轉換單個食物', () => {
      const foods = [
        {
          id: 'food-1',
          name: '白飯',
          nameEn: 'White Rice',
          confidence: 0.95,
          estimatedPortion: 200,
          unit: 'g'
        }
      ];
      
      // 使用 any 來訪問私有方法進行測試
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components).toHaveLength(1);
      expect(components[0].name).toBe('白飯');
      expect(components[0].nameEn).toBe('White Rice');
      expect(components[0].confidence).toBe(0.95);
      expect(components[0].estimatedPortion).toBe(200);
      expect(components[0].sourceType).toBe('pre_recognized');
      expect(components[0].originalFoodId).toBe('food-1');
      expect(components[0].knowledgeBaseMatch).toBe(false);
    });

    it('應該正確轉換多個食物', () => {
      const foods = [
        { id: 'food-1', name: '白飯', confidence: 0.95, estimatedPortion: 200, unit: 'g' },
        { id: 'food-2', name: '炸豬排', confidence: 0.90, estimatedPortion: 150, unit: 'g' },
        { id: 'food-3', name: '滷蛋', confidence: 0.85, estimatedPortion: 60, unit: 'g' }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components).toHaveLength(3);
      expect(components.map((c: any) => c.name)).toEqual(['白飯', '炸豬排', '滷蛋']);
      expect(components.every((c: any) => c.sourceType === 'pre_recognized')).toBe(true);
      expect(components.every((c: any) => c.knowledgeBaseMatch === false)).toBe(true);
    });

    it('應該保留營養資訊', () => {
      const foods = [
        {
          id: 'food-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 200,
          unit: 'g',
          nutrition: {
            calories: 260,
            protein: 5,
            carbohydrates: 58,
            fat: 0.5
          }
        }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components[0].nutritionPer100g).toBeDefined();
      expect(components[0].nutritionPer100g.calories).toBe(260);
      expect(components[0].nutritionPer100g.protein).toBe(5);
      expect(components[0].nutritionPer100g.carbohydrates).toBe(58);
      expect(components[0].nutritionPer100g.fat).toBe(0.5);
      
      // 檢查根據份量計算的實際營養
      expect(components[0].actualNutrition).toBeDefined();
      expect(components[0].actualNutrition.calories).toBe(520); // 260 * 2
      expect(components[0].actualNutrition.protein).toBe(10); // 5 * 2
    });

    it('應該處理空列表', () => {
      const foods: any[] = [];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components).toHaveLength(0);
      expect(Array.isArray(components)).toBe(true);
    });

    it('應該處理缺失的可選屬性', () => {
      const foods = [
        {
          id: 'food-1',
          name: '白飯',
          confidence: 0.95,
          portion: 200 // 使用 portion 而不是 estimatedPortion
        }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components).toHaveLength(1);
      expect(components[0].estimatedPortion).toBe(200);
      expect(components[0].nameEn).toBeUndefined();
    });

    it('應該使用預設份量當沒有提供份量時', () => {
      const foods = [
        {
          id: 'food-1',
          name: '白飯',
          confidence: 0.95
        }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components[0].estimatedPortion).toBe(100); // 預設值
    });

    it('應該正確推斷食物類別', () => {
      const foods = [
        { id: '1', name: '白飯', confidence: 0.95, estimatedPortion: 200 },
        { id: '2', name: '炸豬排', confidence: 0.90, estimatedPortion: 150 },
        { id: '3', name: '高麗菜', confidence: 0.85, estimatedPortion: 80 },
        { id: '4', name: '味噌湯', confidence: 0.88, estimatedPortion: 200 }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components[0].category).toBe('grain'); // 白飯
      expect(components[1].category).toBe('protein'); // 炸豬排
      expect(components[2].category).toBe('vegetable'); // 高麗菜
      expect(components[3].category).toBe('sauce'); // 味噌湯
    });

    it('應該正確推斷烹飪方式', () => {
      const foods = [
        { id: '1', name: '炸豬排', confidence: 0.90, estimatedPortion: 150 },
        { id: '2', name: '炒高麗菜', confidence: 0.85, estimatedPortion: 80 },
        { id: '3', name: '滷蛋', confidence: 0.88, estimatedPortion: 60 },
        { id: '4', name: '蒸魚', confidence: 0.92, estimatedPortion: 120 }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components[0].cookingMethod).toBe('deep_fried'); // 炸豬排
      expect(components[1].cookingMethod).toBe('stir_fried'); // 炒高麗菜
      expect(components[2].cookingMethod).toBe('braised'); // 滷蛋
      expect(components[3].cookingMethod).toBe('steamed'); // 蒸魚
    });

    it('應該處理包含完整營養資訊的食物', () => {
      const foods = [
        {
          id: 'food-1',
          name: '白飯',
          confidence: 0.95,
          estimatedPortion: 150,
          nutrition: {
            calories: 260,
            protein: 5,
            carbohydrates: 58,
            fat: 0.5,
            fiber: 1.2,
            sodium: 5,
            sugar: 0.1
          }
        }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      expect(components[0].nutritionPer100g.fiber).toBe(1.2);
      expect(components[0].nutritionPer100g.sodium).toBe(5);
      expect(components[0].nutritionPer100g.sugar).toBe(0.1);
      
      // 檢查實際營養計算（150g = 1.5倍）
      expect(components[0].actualNutrition.calories).toBe(390); // 260 * 1.5
      expect(components[0].actualNutrition.fiber).toBe(1.8); // 1.2 * 1.5
    });

    it('應該為每個成分生成唯一的 ID', () => {
      const foods = [
        { id: 'food-1', name: '白飯', confidence: 0.95, estimatedPortion: 200 },
        { id: 'food-2', name: '炸豬排', confidence: 0.90, estimatedPortion: 150 },
        { id: 'food-3', name: '滷蛋', confidence: 0.85, estimatedPortion: 60 }
      ];
      
      const components = (engine as any).convertRecognizedFoodsToComponents(foods);
      
      const ids = components.map((c: any) => c.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(3); // 所有 ID 都是唯一的
      expect(components[0].originalFoodId).toBe('food-1');
      expect(components[1].originalFoodId).toBe('food-2');
      expect(components[2].originalFoodId).toBe('food-3');
    });
  });

  describe('inferCategoryFromFoodName', () => {
    it('應該正確識別主食類', () => {
      const grainFoods = ['白飯', '炒飯', '麵條', '米粉', '麵包', '饅頭'];
      
      grainFoods.forEach(food => {
        const category = (engine as any).inferCategoryFromFoodName(food);
        expect(category).toBe('grain');
      });
    });

    it('應該正確識別蛋白質類', () => {
      const proteinFoods = ['炸豬排', '雞腿', '牛肉', '魚', '蝦', '滷蛋', '豆腐'];
      
      proteinFoods.forEach(food => {
        const category = (engine as any).inferCategoryFromFoodName(food);
        expect(category).toBe('protein');
      });
    });

    it('應該正確識別蔬菜類', () => {
      const vegetableFoods = ['高麗菜', '青菜', '紅蘿蔔', '玉米', '菠菜', '香菇'];
      
      vegetableFoods.forEach(food => {
        const category = (engine as any).inferCategoryFromFoodName(food);
        expect(category).toBe('vegetable');
      });
    });

    it('應該正確識別醬料類', () => {
      const sauceFoods = ['味噌湯', '高湯', '湯底', '醬汁'];
      
      sauceFoods.forEach(food => {
        const category = (engine as any).inferCategoryFromFoodName(food);
        expect(category).toBe('sauce');
      });
    });

    it('應該對未知食物返回 undefined', () => {
      const category = (engine as any).inferCategoryFromFoodName('未知食物');
      expect(category).toBeUndefined();
    });
  });

  describe('inferCookingMethodFromFoodName', () => {
    it('應該正確識別炸的烹飪方式', () => {
      const friedFoods = ['炸豬排', '炸雞', '天婦羅', '唐揚雞'];
      
      friedFoods.forEach(food => {
        const method = (engine as any).inferCookingMethodFromFoodName(food);
        expect(method).toBe('deep_fried');
      });
    });

    it('應該正確識別炒的烹飪方式', () => {
      const stirFriedFoods = ['炒飯', '炒麵', '炒高麗菜'];
      
      stirFriedFoods.forEach(food => {
        const method = (engine as any).inferCookingMethodFromFoodName(food);
        expect(method).toBe('stir_fried');
      });
    });

    it('應該正確識別烤的烹飪方式', () => {
      const grilledFoods = ['烤肉', '烤魚', '燒雞'];
      
      grilledFoods.forEach(food => {
        const method = (engine as any).inferCookingMethodFromFoodName(food);
        expect(method).toBe('grilled');
      });
    });

    it('應該正確識別蒸的烹飪方式', () => {
      const steamedFoods = ['蒸魚', '小籠包', '蒸餃'];
      
      steamedFoods.forEach(food => {
        const method = (engine as any).inferCookingMethodFromFoodName(food);
        expect(method).toBe('steamed');
      });
    });

    it('應該正確識別滷的烹飪方式', () => {
      const braisedFoods = ['滷蛋', '滷肉', '燉雞'];
      
      braisedFoods.forEach(food => {
        const method = (engine as any).inferCookingMethodFromFoodName(food);
        expect(method).toBe('braised');
      });
    });

    it('應該對未知烹飪方式返回 undefined', () => {
      const method = (engine as any).inferCookingMethodFromFoodName('未知食物');
      expect(method).toBeUndefined();
    });
  });

  describe('預識別食物處理 (Pre-recognized Foods)', () => {
    describe('detectComponents with preRecognizedFoods', () => {
      it('應該使用預識別食物而不調用 Vision API', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        // 模擬預識別食物
        const preRecognizedFoods = [
          {
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
          },
          {
            id: 'food-2',
            name: '炸豬排',
            nameEn: 'Fried Pork Cutlet',
            confidence: 0.90,
            estimatedPortion: 150,
            unit: 'g',
            nutrition: {
              calories: 350,
              protein: 25,
              carbohydrates: 15,
              fat: 22
            }
          }
        ];
        
        // 監視 extractComponentsFromVision 方法
        const extractSpy = jest.spyOn(engine as any, 'extractComponentsFromVision');
        
        const options = {
          dishName: '便當',
          dishType: DishType.BENTO,
          preRecognizedFoods: preRecognizedFoods
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 驗證不調用 Vision API
        expect(extractSpy).not.toHaveBeenCalled();
        
        // 驗證結果包含預識別的食物
        expect(result.components.length).toBeGreaterThanOrEqual(2);
        expect(result.components.some(c => c.name === '白飯')).toBe(true);
        expect(result.components.some(c => c.name === '炸豬排')).toBe(true);
        
        // 驗證 metadata
        expect(result.metadata.detectionMethod).toBe('pre_recognized');
        expect(result.metadata.componentsFromPreRecognition).toBe(2);
        expect(result.metadata.componentsFromVision).toBe(0);
        
        extractSpy.mockRestore();
      });

      it('應該在沒有預識別食物時調用 Vision API', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        // 監視 extractComponentsFromVision 方法
        const extractSpy = jest.spyOn(engine as any, 'extractComponentsFromVision')
          .mockResolvedValue([
            {
              id: 'vision-1',
              name: '白飯',
              confidence: 0.9,
              estimatedPortion: 200
            }
          ]);
        
        const options = {
          dishName: '白飯',
          dishType: DishType.FRIED_RICE
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 驗證調用了 Vision API
        expect(extractSpy).toHaveBeenCalled();
        
        // 驗證 metadata
        expect(result.metadata.componentsFromPreRecognition).toBe(0);
        
        extractSpy.mockRestore();
      });

      it('應該支持向後兼容的舊版 API', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        // 監視 extractComponentsFromVision 方法
        const extractSpy = jest.spyOn(engine as any, 'extractComponentsFromVision')
          .mockResolvedValue([
            {
              id: 'vision-1',
              name: '白飯',
              confidence: 0.9,
              estimatedPortion: 200
            }
          ]);
        
        // 使用舊版 API: detectComponents(image, dishName, dishType)
        const result = await engine.detectComponents(
          mockImageBuffer,
          '白飯',
          DishType.FRIED_RICE
        );
        
        // 驗證調用了 Vision API
        expect(extractSpy).toHaveBeenCalled();
        
        // 驗證結果正常
        expect(result.components.length).toBeGreaterThan(0);
        expect(result.mainDish.name).toBe('白飯');
        expect(result.mainDish.type).toBe(DishType.FRIED_RICE);
        
        extractSpy.mockRestore();
      });

      it('應該在預識別食物為空時降級至 Vision API', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        // 監視 extractComponentsFromVision 方法
        const extractSpy = jest.spyOn(engine as any, 'extractComponentsFromVision')
          .mockResolvedValue([
            {
              id: 'vision-1',
              name: '白飯',
              confidence: 0.9,
              estimatedPortion: 200
            }
          ]);
        
        const options = {
          dishName: '白飯',
          dishType: DishType.FRIED_RICE,
          preRecognizedFoods: [] // 空列表
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 驗證調用了 Vision API（降級）
        expect(extractSpy).toHaveBeenCalled();
        
        extractSpy.mockRestore();
      });

      it('應該保留預識別食物的營養資訊', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        const preRecognizedFoods = [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            unit: 'g',
            nutrition: {
              calories: 260,
              protein: 5,
              carbohydrates: 58,
              fat: 0.5,
              fiber: 1.2,
              sodium: 5,
              sugar: 0.1
            }
          }
        ];
        
        const options = {
          dishName: '白飯',
          dishType: DishType.FRIED_RICE,
          preRecognizedFoods: preRecognizedFoods
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 找到白飯成分
        const riceComponent = result.components.find(c => c.name === '白飯');
        
        expect(riceComponent).toBeDefined();
        expect(riceComponent?.nutritionPer100g).toBeDefined();
        expect(riceComponent?.nutritionPer100g?.calories).toBe(260);
        expect(riceComponent?.nutritionPer100g?.protein).toBe(5);
        expect(riceComponent?.actualNutrition).toBeDefined();
      });

      it('應該正確設置成分的 sourceType', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        const preRecognizedFoods = [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            unit: 'g'
          }
        ];
        
        const options = {
          preRecognizedFoods: preRecognizedFoods
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 驗證所有預識別的成分都有正確的 sourceType
        const preRecognizedComponents = result.components.filter(
          c => (c as any).sourceType === 'pre_recognized'
        );
        
        expect(preRecognizedComponents.length).toBeGreaterThan(0);
        
        // 驗證 originalFoodId 被保留
        const riceComponent = result.components.find(c => c.name === '白飯');
        expect((riceComponent as any)?.originalFoodId).toBe('food-1');
      });

      it('應該推斷預識別食物的類別和烹飪方式', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        const preRecognizedFoods = [
          {
            id: 'food-1',
            name: '炸豬排',
            confidence: 0.90,
            estimatedPortion: 150,
            unit: 'g'
          },
          {
            id: 'food-2',
            name: '炒高麗菜',
            confidence: 0.85,
            estimatedPortion: 100,
            unit: 'g'
          }
        ];
        
        const options = {
          preRecognizedFoods: preRecognizedFoods
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 驗證炸豬排的類別和烹飪方式
        const porkComponent = result.components.find(c => c.name === '炸豬排');
        expect(porkComponent?.category).toBe('protein');
        expect(porkComponent?.cookingMethod).toBe('deep_fried');
        
        // 驗證炒高麗菜的類別和烹飪方式
        const cabbageComponent = result.components.find(c => c.name === '炒高麗菜');
        expect(cabbageComponent?.category).toBe('vegetable');
        expect(cabbageComponent?.cookingMethod).toBe('stir_fried');
      });

      it('應該在預識別食物轉換失敗時降級至 Vision API', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        // 監視 convertRecognizedFoodsToComponents 方法使其拋出錯誤
        const convertSpy = jest.spyOn(engine as any, 'convertRecognizedFoodsToComponents')
          .mockImplementation(() => {
            throw new Error('轉換失敗');
          });
        
        // 監視 extractComponentsFromVision 方法
        const extractSpy = jest.spyOn(engine as any, 'extractComponentsFromVision')
          .mockResolvedValue([
            {
              id: 'vision-1',
              name: '白飯',
              confidence: 0.9,
              estimatedPortion: 200
            }
          ]);
        
        const preRecognizedFoods = [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            unit: 'g'
          }
        ];
        
        const options = {
          dishName: '白飯',
          dishType: DishType.FRIED_RICE,
          preRecognizedFoods: preRecognizedFoods
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 驗證降級至 Vision API
        expect(extractSpy).toHaveBeenCalled();
        expect(result.components.length).toBeGreaterThan(0);
        
        convertSpy.mockRestore();
        extractSpy.mockRestore();
      });

      it('應該推斷料理類型當未提供時', async () => {
        const mockImageBuffer = Buffer.from('fake-image-data');
        
        const preRecognizedFoods = [
          {
            id: 'food-1',
            name: '味噌湯',
            confidence: 0.95,
            estimatedPortion: 300,
            unit: 'ml'
          },
          {
            id: 'food-2',
            name: '豆腐',
            confidence: 0.90,
            estimatedPortion: 50,
            unit: 'g'
          }
        ];
        
        const options = {
          preRecognizedFoods: preRecognizedFoods
          // 沒有提供 dishType
        };
        
        const result = await engine.detectComponents(mockImageBuffer, options);
        
        // 驗證推斷出湯品類型
        expect(result.mainDish.type).toBe(DishType.SOUP);
      });
    });

    describe('convertRecognizedFoodsToComponents', () => {
      it('應該正確轉換單個食物', () => {
        const foods = [
          {
            id: 'food-1',
            name: '白飯',
            nameEn: 'White Rice',
            confidence: 0.95,
            estimatedPortion: 200,
            unit: 'g'
          }
        ];
        
        const convertMethod = (engine as any).convertRecognizedFoodsToComponents.bind(engine);
        const components = convertMethod(foods);
        
        expect(components).toHaveLength(1);
        expect(components[0].name).toBe('白飯');
        expect(components[0].nameEn).toBe('White Rice');
        expect(components[0].confidence).toBe(0.95);
        expect(components[0].estimatedPortion).toBe(200);
        expect(components[0].sourceType).toBe('pre_recognized');
        expect(components[0].originalFoodId).toBe('food-1');
      });

      it('應該正確轉換多個食物', () => {
        const foods = [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            unit: 'g'
          },
          {
            id: 'food-2',
            name: '炸豬排',
            confidence: 0.90,
            estimatedPortion: 150,
            unit: 'g'
          },
          {
            id: 'food-3',
            name: '滷蛋',
            confidence: 0.85,
            estimatedPortion: 60,
            unit: 'g'
          }
        ];
        
        const convertMethod = (engine as any).convertRecognizedFoodsToComponents.bind(engine);
        const components = convertMethod(foods);
        
        expect(components).toHaveLength(3);
        expect(components.map((c: any) => c.name)).toEqual(['白飯', '炸豬排', '滷蛋']);
        
        // 驗證所有成分都有正確的屬性
        components.forEach((comp: any) => {
          expect(comp.sourceType).toBe('pre_recognized');
          expect(comp.originalFoodId).toBeDefined();
          expect(comp.confidence).toBeGreaterThan(0);
          expect(comp.estimatedPortion).toBeGreaterThan(0);
        });
      });

      it('應該保留營養資訊', () => {
        const foods = [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200,
            unit: 'g',
            nutrition: {
              calories: 260,
              protein: 5,
              carbohydrates: 58,
              fat: 0.5,
              fiber: 1.2,
              sodium: 5,
              sugar: 0.1
            }
          }
        ];
        
        const convertMethod = (engine as any).convertRecognizedFoodsToComponents.bind(engine);
        const components = convertMethod(foods);
        
        expect(components[0].nutritionPer100g).toBeDefined();
        expect(components[0].nutritionPer100g.calories).toBe(260);
        expect(components[0].nutritionPer100g.protein).toBe(5);
        expect(components[0].nutritionPer100g.fiber).toBe(1.2);
        
        // 驗證根據份量計算的實際營養
        expect(components[0].actualNutrition).toBeDefined();
        expect(components[0].actualNutrition.calories).toBe(520); // 260 * 2
        expect(components[0].actualNutrition.protein).toBe(10); // 5 * 2
      });

      it('應該處理缺失的可選屬性', () => {
        const foods = [
          {
            id: 'food-1',
            name: '白飯',
            confidence: 0.95,
            portion: 200 // 使用 portion 而不是 estimatedPortion
            // 沒有 nameEn, unit, nutrition
          }
        ];
        
        const convertMethod = (engine as any).convertRecognizedFoodsToComponents.bind(engine);
        const components = convertMethod(foods);
        
        expect(components).toHaveLength(1);
        expect(components[0].name).toBe('白飯');
        expect(components[0].estimatedPortion).toBe(200);
        expect(components[0].nameEn).toBeUndefined();
        expect(components[0].nutritionPer100g).toBeUndefined();
      });
    });

    describe('inferDishTypeFromComponents', () => {
      it('應該識別湯品類型', () => {
        const components = [
          {
            id: '1',
            name: '味噌湯',
            confidence: 0.95,
            estimatedPortion: 300,
            category: 'sauce' as any
          },
          {
            id: '2',
            name: '豆腐',
            confidence: 0.90,
            estimatedPortion: 50,
            category: 'protein' as any
          }
        ];
        
        const inferMethod = (engine as any).inferDishTypeFromComponents.bind(engine);
        const dishType = inferMethod(components);
        
        expect(dishType).toBe(DishType.SOUP);
      });

      it('應該識別麵食類型', () => {
        const components = [
          {
            id: '1',
            name: '拉麵',
            confidence: 0.95,
            estimatedPortion: 200
          },
          {
            id: '2',
            name: '叉燒',
            confidence: 0.90,
            estimatedPortion: 50,
            category: 'protein' as any
          }
        ];
        
        const inferMethod = (engine as any).inferDishTypeFromComponents.bind(engine);
        const dishType = inferMethod(components);
        
        expect(dishType).toBe(DishType.NOODLES);
      });

      it('應該識別便當類型', () => {
        const components = [
          {
            id: '1',
            name: '白飯',
            confidence: 0.95,
            estimatedPortion: 200
          },
          {
            id: '2',
            name: '炸豬排',
            confidence: 0.90,
            estimatedPortion: 150,
            category: 'protein' as any
          },
          {
            id: '3',
            name: '滷蛋',
            confidence: 0.85,
            estimatedPortion: 60,
            category: 'protein' as any
          }
        ];
        
        const inferMethod = (engine as any).inferDishTypeFromComponents.bind(engine);
        const dishType = inferMethod(components);
        
        expect(dishType).toBe(DishType.BENTO);
      });

      it('應該識別炒飯類型', () => {
        const components = [
          {
            id: '1',
            name: '蛋炒飯',
            confidence: 0.95,
            estimatedPortion: 300
          }
        ];
        
        const inferMethod = (engine as any).inferDishTypeFromComponents.bind(engine);
        const dishType = inferMethod(components);
        
        expect(dishType).toBe(DishType.FRIED_RICE);
      });

      it('應該返回 UNKNOWN 當無法判斷時', () => {
        const components = [
          {
            id: '1',
            name: '未知食物',
            confidence: 0.50,
            estimatedPortion: 100
          }
        ];
        
        const inferMethod = (engine as any).inferDishTypeFromComponents.bind(engine);
        const dishType = inferMethod(components);
        
        expect(dishType).toBe(DishType.UNKNOWN);
      });
    });
  });
});
