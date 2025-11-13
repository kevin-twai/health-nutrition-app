/**
 * MultiStageRecognitionEngine 測試
 */

import { MultiStageRecognitionEngine } from '../MultiStageRecognitionEngine';

// Mock OpenAI
jest.mock('openai');

// Mock 其他依賴
jest.mock('../EnhancedPromptGenerator');
jest.mock('../AsianCuisineKnowledgeBase');
jest.mock('../../repositories/FoodRepository');

describe('MultiStageRecognitionEngine', () => {
  let engine: MultiStageRecognitionEngine;
  let testImageBuffer: Buffer;

  beforeEach(() => {
    // 設定環境變數
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    engine = new MultiStageRecognitionEngine({
      minConfidenceThreshold: 0.85,
      enhancedThreshold: 0.75,
      maxStages: 3,
      enableKnowledgeBase: true,
      language: 'zh-TW'
    });
    
    testImageBuffer = Buffer.from('fake-image-data');
    
    jest.clearAllMocks();
  });

  describe('構造函數', () => {
    it('應該正確初始化引擎', () => {
      expect(engine).toBeDefined();
    });

    it('應該使用預設配置', () => {
      const defaultEngine = new MultiStageRecognitionEngine();
      expect(defaultEngine).toBeDefined();
    });

    it('應該在沒有 API key 時發出警告', () => {
      delete process.env.OPENAI_API_KEY;
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      new MultiStageRecognitionEngine();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('OPENAI_API_KEY 未設定')
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('healthCheck', () => {
    it('應該返回健康狀態', async () => {
      const health = await engine.healthCheck();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('details');
      expect(health.details).toHaveProperty('openaiConfigured');
      expect(health.details).toHaveProperty('knowledgeBaseItems');
      expect(health.details).toHaveProperty('config');
    });

    it('應該在 OpenAI 配置時返回 healthy', async () => {
      const health = await engine.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.details.openaiConfigured).toBe(true);
    });

    it('應該在沒有 OpenAI 配置時返回 degraded', async () => {
      delete process.env.OPENAI_API_KEY;
      const degradedEngine = new MultiStageRecognitionEngine();
      
      const health = await degradedEngine.healthCheck();
      
      expect(health.status).toBe('degraded');
      expect(health.details.openaiConfigured).toBe(false);
    });
  });

  describe('recognize - 多階段流程', () => {
    it('應該定義 recognize 方法', () => {
      expect(typeof engine.recognize).toBe('function');
    });

    // 注意：由於需要 mock OpenAI API，這裡只測試方法存在
    // 實際的整合測試應該在有真實 API 或完整 mock 的環境中進行
  });

  describe('配置選項', () => {
    it('應該接受自定義信心度閾值', () => {
      const customEngine = new MultiStageRecognitionEngine({
        minConfidenceThreshold: 0.9,
        enhancedThreshold: 0.8
      });
      
      expect(customEngine).toBeDefined();
    });

    it('應該接受自定義最大階段數', () => {
      const customEngine = new MultiStageRecognitionEngine({
        maxStages: 2
      });
      
      expect(customEngine).toBeDefined();
    });

    it('應該允許禁用知識庫匹配', () => {
      const customEngine = new MultiStageRecognitionEngine({
        enableKnowledgeBase: false
      });
      
      expect(customEngine).toBeDefined();
    });

    it('應該支援英文語言', () => {
      const englishEngine = new MultiStageRecognitionEngine({
        language: 'en'
      });
      
      expect(englishEngine).toBeDefined();
    });
  });
});
