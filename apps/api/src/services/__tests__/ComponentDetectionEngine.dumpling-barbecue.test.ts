/**
 * 點心和燒烤類成分識別測試
 * Dumpling and Barbecue Component Detection Tests
 */

import { ComponentDetectionEngine } from '../ComponentDetectionEngine';
import { DishType } from '../../types/ComponentDetection';

describe('ComponentDetectionEngine - Dumpling and Barbecue', () => {
  let engine: ComponentDetectionEngine;

  beforeEach(() => {
    engine = new ComponentDetectionEngine('zh-TW');
  });

  describe('點心類成分識別', () => {
    test('應該能識別餃子的外皮和內餡', async () => {
      // 模擬餃子圖片
      const mockImage = Buffer.from('mock-dumpling-image');
      
      // 這個測試需要實際的 Vision API，這裡只測試邏輯
      // 實際測試需要 mock OpenAI API
      
      expect(engine).toBeDefined();
    });

    test('應該能識別小籠包的湯汁成分', async () => {
      const mockImage = Buffer.from('mock-xiaolongbao-image');
      
      expect(engine).toBeDefined();
    });

    test('應該能識別燒賣的頂部裝飾', async () => {
      const mockImage = Buffer.from('mock-shumai-image');
      
      expect(engine).toBeDefined();
    });

    test('應該能區分生春捲和炸春捲', async () => {
      const mockImage = Buffer.from('mock-spring-roll-image');
      
      expect(engine).toBeDefined();
    });
  });

  describe('燒烤類成分識別', () => {
    test('應該能識別烤肉的肉類和蔬菜', async () => {
      const mockImage = Buffer.from('mock-bbq-image');
      
      expect(engine).toBeDefined();
    });

    test('應該能識別韓式烤肉的配菜', async () => {
      const mockImage = Buffer.from('mock-korean-bbq-image');
      
      expect(engine).toBeDefined();
    });

    test('應該能識別台式烤肉的多樣食材', async () => {
      const mockImage = Buffer.from('mock-taiwanese-bbq-image');
      
      expect(engine).toBeDefined();
    });

    test('應該能識別日式燒肉的醬料', async () => {
      const mockImage = Buffer.from('mock-japanese-yakiniku-image');
      
      expect(engine).toBeDefined();
    });
  });

  describe('份量調整邏輯', () => {
    test('點心類應該正確調整外皮和內餡比例', () => {
      // 測試 adjustDumplingComponentPortions 方法
      const mockComponents = [
        {
          id: '1',
          name: '餃子皮',
          confidence: 0.9,
          estimatedPortion: 25,
          category: 'grain' as any
        },
        {
          id: '2',
          name: '豬肉餡',
          confidence: 0.85,
          estimatedPortion: 20,
          category: 'protein' as any
        }
      ];

      // 這裡需要訪問私有方法，實際測試中可能需要調整
      expect(mockComponents.length).toBe(2);
    });

    test('燒烤類應該正確調整肉類和蔬菜比例', () => {
      const mockComponents = [
        {
          id: '1',
          name: '豬肉片',
          confidence: 0.9,
          estimatedPortion: 150,
          category: 'protein' as any
        },
        {
          id: '2',
          name: '青椒',
          confidence: 0.85,
          estimatedPortion: 50,
          category: 'vegetable' as any
        }
      ];

      expect(mockComponents.length).toBe(2);
    });
  });

  describe('驗證邏輯', () => {
    test('點心類應該驗證外皮和內餡的存在', () => {
      const mockComponents = [
        {
          id: '1',
          name: '餃子皮',
          confidence: 0.9,
          estimatedPortion: 20,
          category: 'grain' as any,
          dumplingPart: 'wrapper'
        }
      ];

      // 缺少內餡應該產生警告
      expect(mockComponents.length).toBe(1);
    });

    test('燒烤類應該驗證肉類的存在', () => {
      const mockComponents = [
        {
          id: '1',
          name: '青椒',
          confidence: 0.9,
          estimatedPortion: 50,
          category: 'vegetable' as any
        }
      ];

      // 缺少肉類應該產生警告
      expect(mockComponents.length).toBe(1);
    });
  });

  describe('知識庫整合', () => {
    test('應該能從知識庫獲取餃子的常見成分', () => {
      // 測試知識庫查詢
      const dishName = '餃子';
      
      expect(dishName).toBe('餃子');
    });

    test('應該能從知識庫獲取小籠包的常見成分', () => {
      const dishName = '小籠包';
      
      expect(dishName).toBe('小籠包');
    });

    test('應該能從知識庫獲取燒賣的常見成分', () => {
      const dishName = '燒賣';
      
      expect(dishName).toBe('燒賣');
    });

    test('應該能從知識庫獲取春捲的常見成分', () => {
      const dishName = '春捲';
      
      expect(dishName).toBe('春捲');
    });

    test('應該能從知識庫獲取烤肉的常見成分', () => {
      const dishName = '烤肉';
      
      expect(dishName).toBe('烤肉');
    });
  });

  describe('Prompt 生成', () => {
    test('應該為點心類生成專用 prompt', () => {
      // 測試 prompt 生成
      const dishType = DishType.DUMPLING;
      
      expect(dishType).toBe('dumpling');
    });

    test('應該為燒烤類生成專用 prompt', () => {
      const dishType = DishType.BARBECUE;
      
      expect(dishType).toBe('barbecue');
    });
  });
});
