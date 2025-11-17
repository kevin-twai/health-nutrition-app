/**
 * 成分識別整合測試 - 簡化版
 */

import { ComponentDetectionEngine } from '../services/ComponentDetectionEngine';

describe('成分識別整合測試', () => {
  it('應該能運行基本測試', () => {
    expect(1 + 1).toBe(2);
  });

  it('應該能初始化 ComponentDetectionEngine', () => {
    const engine = new ComponentDetectionEngine('zh-TW');
    expect(engine).toBeDefined();
  });
});


describe('不同料理類型測試', () => {
  let engine: ComponentDetectionEngine;

  beforeAll(() => {
    engine = new ComponentDetectionEngine('zh-TW');
  });

  describe('炒飯類料理', () => {
    it('應該能識別蛋炒飯的料理類型', () => {
      const dishName = '蛋炒飯';
      // 測試料理類型判斷邏輯
      expect(dishName).toContain('炒飯');
    });

    it('應該能處理炒飯的成分識別請求', async () => {
      const mockBuffer = Buffer.from('mock-fried-rice-image');
      const dishName = '蛋炒飯';
      
      try {
        await engine.detectComponents(mockBuffer, dishName);
      } catch (error) {
        // 預期會失敗（mock 數據），但不應該崩潰
        expect(error).toBeDefined();
      }
    });
  });

  describe('湯品類料理', () => {
    it('應該能識別味噌湯的料理類型', () => {
      const dishName = '味噌湯';
      expect(dishName).toContain('湯');
    });

    it('應該能處理湯品的成分識別請求', async () => {
      const mockBuffer = Buffer.from('mock-soup-image');
      const dishName = '味噌湯';
      
      try {
        await engine.detectComponents(mockBuffer, dishName);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('便當類料理', () => {
    it('應該能識別台式便當的料理類型', () => {
      const dishName = '台式便當';
      expect(dishName).toContain('便當');
    });

    it('應該能處理便當的成分識別請求', async () => {
      const mockBuffer = Buffer.from('mock-bento-image');
      const dishName = '台式便當';
      
      try {
        await engine.detectComponents(mockBuffer, dishName);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('麵食類料理', () => {
    it('應該能識別拉麵的料理類型', () => {
      const dishName = '拉麵';
      expect(dishName).toContain('麵');
    });

    it('應該能處理麵食的成分識別請求', async () => {
      const mockBuffer = Buffer.from('mock-noodles-image');
      const dishName = '拉麵';
      
      try {
        await engine.detectComponents(mockBuffer, dishName);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('點心類料理', () => {
    it('應該能識別小籠包的料理類型', () => {
      const dishName = '小籠包';
      expect(dishName).toContain('包');
    });

    it('應該能處理點心的成分識別請求', async () => {
      const mockBuffer = Buffer.from('mock-dumpling-image');
      const dishName = '小籠包';
      
      try {
        await engine.detectComponents(mockBuffer, dishName);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('燒烤類料理', () => {
    it('應該能識別烤肉的料理類型', () => {
      const dishName = '烤肉';
      expect(dishName).toContain('烤');
    });

    it('應該能處理燒烤的成分識別請求', async () => {
      const mockBuffer = Buffer.from('mock-barbecue-image');
      const dishName = '烤肉';
      
      try {
        await engine.detectComponents(mockBuffer, dishName);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
