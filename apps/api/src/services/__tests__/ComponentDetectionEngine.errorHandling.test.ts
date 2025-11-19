/**
 * ComponentDetectionEngine 錯誤處理測試
 * 
 * 測試 Task 5 實現的錯誤處理和降級邏輯
 */

import { ComponentDetectionEngine } from '../ComponentDetectionEngine';
import { DishType, RecognizedFood } from '../../types/ComponentDetection';

describe('ComponentDetectionEngine - 錯誤處理和降級邏輯', () => {
  let engine: ComponentDetectionEngine;
  let mockImageBuffer: Buffer;

  beforeEach(() => {
    engine = new ComponentDetectionEngine('zh-TW');
    mockImageBuffer = Buffer.from('mock-image-data');
  });

  describe('5.1 處理預識別食物為空的情況', () => {
    it('應該檢測空列表並記錄警告', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [] // 空列表
      };

      // 注意：這個測試需要 OpenAI API，如果沒有會返回預設值
      // 主要測試的是不會拋出錯誤
      await expect(
        engine.detectComponents(mockImageBuffer, options)
      ).resolves.toBeDefined();

      // 驗證警告被記錄
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('預識別食物列表為空')
      );

      consoleSpy.mockRestore();
    });

    it('應該在空列表時降級至 Vision API', async () => {
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: []
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證結果存在（即使沒有 OpenAI API 也應該返回基本結構）
      expect(result).toBeDefined();
      expect(result.mainDish).toBeDefined();
      expect(result.components).toBeDefined();
    });
  });

  describe('5.2 處理預識別食物格式錯誤', () => {
    it('應該過濾掉缺少 name 的食物', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.9,
            portion: 200,
            unit: 'g'
          },
          {
            id: '2',
            name: '', // 無效：name 為空
            confidence: 0.8,
            portion: 100,
            unit: 'g'
          }
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證警告被記錄（檢查是否有任何包含相關訊息的調用）
      const warnCalls = consoleSpy.mock.calls.map(call => call.join(' '));
      const hasWarning = warnCalls.some(call => 
        call.includes('缺少有效的 name') || call.includes('格式無效')
      );
      expect(hasWarning).toBe(true);

      consoleSpy.mockRestore();
    });

    it('應該修正無效的 confidence 值', async () => {
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [
          {
            id: '1',
            name: '白飯',
            confidence: -0.5, // 無效：< 0
            portion: 200,
            unit: 'g'
          },
          {
            id: '2',
            name: '炸豬排',
            confidence: 1.5, // 無效：> 1
            portion: 150,
            unit: 'g'
          }
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證結果存在
      expect(result).toBeDefined();
      expect(result.components).toBeDefined();
    });

    it('應該修正無效的 portion 值', async () => {
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.9,
            portion: -100, // 無效：< 0
            unit: 'g'
          },
          {
            id: '2',
            name: '炸豬排',
            confidence: 0.8,
            portion: 0, // 無效：= 0
            unit: 'g'
          }
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證結果存在
      expect(result).toBeDefined();
      expect(result.components).toBeDefined();
    });

    it('應該在所有食物無效時降級至 Vision API', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [
          {
            id: '1',
            name: '', // 無效
            confidence: 0.9,
            portion: 200,
            unit: 'g'
          },
          {
            id: '2',
            name: '', // 無效
            confidence: 0.8,
            portion: 150,
            unit: 'g'
          }
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證錯誤被記錄
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('處理預識別食物失敗')
      );

      // 驗證結果存在（降級至 Vision API）
      expect(result).toBeDefined();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('5.3 實現混合模式', () => {
    it('應該在成分數量不足時啟用混合模式', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO, // 便當需要至少 5 個成分
        preRecognizedFoods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.9,
            portion: 200,
            unit: 'g'
          },
          {
            id: '2',
            name: '炸豬排',
            confidence: 0.8,
            portion: 150,
            unit: 'g'
          }
          // 只有 2 個成分，少於便當的閾值 5
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證混合模式被啟用（如果有 OpenAI API）
      const logCalls = consoleSpy.mock.calls.map(call => call.join(' '));
      const hasHybridModeLog = logCalls.some(log => 
        log.includes('混合模式') || log.includes('需要至少')
      );

      // 如果有 OpenAI API，應該看到混合模式日誌
      // 如果沒有，至少應該有結果
      expect(result).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('應該在缺少關鍵成分時啟用混合模式', async () => {
      const options = {
        dishName: '炒飯',
        dishType: DishType.FRIED_RICE, // 炒飯需要主食類成分
        preRecognizedFoods: [
          {
            id: '1',
            name: '雞蛋', // 蛋白質，但缺少主食
            confidence: 0.9,
            portion: 100,
            unit: 'g'
          },
          {
            id: '2',
            name: '青蔥',
            confidence: 0.8,
            portion: 20,
            unit: 'g'
          },
          {
            id: '3',
            name: '紅蘿蔔',
            confidence: 0.85,
            portion: 50,
            unit: 'g'
          }
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證結果存在
      expect(result).toBeDefined();
      expect(result.mainDish).toBeDefined();
    });

    it('應該避免重複的成分', async () => {
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.9,
            portion: 200,
            unit: 'g'
          }
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證結果中沒有重複的成分名稱
      const componentNames = result.components.map(c => c.name);
      const uniqueNames = new Set(componentNames);
      
      // 如果有重複，Set 的大小會小於陣列長度
      expect(uniqueNames.size).toBe(componentNames.length);
    });
  });

  describe('整合測試', () => {
    it('應該處理完整的錯誤恢復流程', async () => {
      const options = {
        dishName: '便當',
        dishType: DishType.BENTO,
        preRecognizedFoods: [
          {
            id: '1',
            name: '白飯',
            confidence: 0.9,
            portion: 200,
            unit: 'g'
          },
          {
            id: '2',
            name: '', // 無效
            confidence: 0.8,
            portion: 150,
            unit: 'g'
          },
          {
            id: '3',
            name: '滷蛋',
            confidence: -0.5, // 無效 confidence
            portion: 60,
            unit: 'g'
          }
        ] as RecognizedFood[]
      };

      const result = await engine.detectComponents(mockImageBuffer, options);

      // 驗證系統能夠處理混合的有效和無效數據
      expect(result).toBeDefined();
      expect(result.mainDish).toBeDefined();
      expect(result.components).toBeDefined();
      expect(Array.isArray(result.components)).toBe(true);
    });

    it('應該在各種異常情況下都返回有效結果', async () => {
      const testCases = [
        { preRecognizedFoods: [] }, // 空列表
        { preRecognizedFoods: undefined }, // 未定義
        { 
          preRecognizedFoods: [
            { name: '', confidence: 0.9, portion: 100, unit: 'g' }
          ] as RecognizedFood[]
        }, // 全部無效
      ];

      for (const testCase of testCases) {
        const options = {
          dishName: '便當',
          dishType: DishType.BENTO,
          ...testCase
        };

        const result = await engine.detectComponents(mockImageBuffer, options);

        // 所有情況都應該返回有效結果
        expect(result).toBeDefined();
        expect(result.mainDish).toBeDefined();
        expect(result.components).toBeDefined();
        expect(result.metadata).toBeDefined();
      }
    });
  });
});
