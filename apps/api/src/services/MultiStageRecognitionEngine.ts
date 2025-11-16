/**
 * 多階段識別引擎
 * Multi-Stage Recognition Engine for Enhanced Food Recognition
 */

import { DetectedFood, RecognitionResult, FoodItem } from '../types/shared';
import { EnhancedPromptGenerator, PromptGeneratorConfig, PromptTemplateType } from './EnhancedPromptGenerator';
import { AsianCuisineKnowledgeBase } from './AsianCuisineKnowledgeBase';
import { knowledgeBaseQueryOptimizer } from './KnowledgeBaseQueryOptimizer';
import { recognitionResultCache } from './RecognitionResultCache';
import { FoodRepository } from '../repositories/FoodRepository';
import { ImageFeatures, FoodCategory, CuisineType } from '../types/AsianCuisineKnowledgeBase';
import { foodRecognitionPerformanceMonitor } from './FoodRecognitionPerformanceMonitor';
import OpenAI from 'openai';

/**
 * 識別階段
 */
export interface RecognitionStage {
  attempt: number;
  promptType: 'standard' | 'enhanced' | 'specialized' | 'knowledge_base';
  result: StageRecognitionResult;
  confidence: number;
  timestamp: Date;
  processingTime: number;
  apiCalls: number;
}

/**
 * 階段識別結果
 */
export interface StageRecognitionResult {
  foods: DetectedFood[];
  overallConfidence: number;
  description: string;
  cookingMethod?: string;
  cuisineType?: string;
  rawResponse?: any;
}

/**
 * 增強的識別結果
 */
export interface EnhancedRecognitionResult {
  foods: DetectedFood[];
  confidence: number;
  processingTime: number;
  description?: string;
  apiUsed?: string;
  suggestions?: FoodSuggestion[]; // 前端期望的格式
  alternatives?: FoodSuggestion[][]; // 替代選項
  stages: RecognitionStage[]; // 所有識別階段
  finalStage: number; // 最終使用的階段
  totalProcessingTime: number;
  totalApiCalls: number;
}

/**
 * 食物建議
 */
export interface FoodSuggestion {
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number; // 保持 carbs 以兼容前端
    fat: number;
    fiber: number;
    sodium: number;
    category: string;
    portion: string;
    description: string;
    cooking_method?: string;
    cuisine_type?: string;
    visualDescription?: string;
    distinguishingFeatures?: string[];
    alternatives?: string[];
  };
  confidence: number;
  recognitionStage?: number;
  matchedFeatures?: string[];
  uncertaintyReasons?: string[];
}

/**
 * 多階段識別引擎配置
 */
export interface MultiStageEngineConfig {
  minConfidenceThreshold?: number; // 最低信心度閾值（預設 0.85）
  enhancedThreshold?: number; // 進入增強階段的閾值（預設 0.75）
  maxStages?: number; // 最大階段數（預設 3）
  enableKnowledgeBase?: boolean; // 是否啟用知識庫匹配（預設 true）
  language?: 'zh-TW' | 'en';
}

/**
 * 多階段識別引擎類
 */
export class MultiStageRecognitionEngine {
  private openai: OpenAI | null;
  private promptGenerator: EnhancedPromptGenerator;
  private knowledgeBase: AsianCuisineKnowledgeBase;
  private foodRepository: FoodRepository;
  private config: Required<MultiStageEngineConfig>;

  constructor(config: MultiStageEngineConfig = {}) {
    // 初始化 OpenAI 客戶端
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('✅ MultiStageRecognitionEngine: OpenAI Vision API 已初始化');
    } else {
      this.openai = null;
      console.warn('⚠️ MultiStageRecognitionEngine: OPENAI_API_KEY 未設定');
    }

    // 初始化組件
    this.promptGenerator = new EnhancedPromptGenerator(config.language || 'zh-TW');
    this.knowledgeBase = new AsianCuisineKnowledgeBase();
    this.foodRepository = new FoodRepository(null as any, null as any);

    // 設置配置
    this.config = {
      minConfidenceThreshold: config.minConfidenceThreshold ?? 0.85,
      enhancedThreshold: config.enhancedThreshold ?? 0.75,
      maxStages: config.maxStages ?? 3,
      enableKnowledgeBase: config.enableKnowledgeBase ?? true,
      language: config.language || 'zh-TW'
    };

    console.log('✅ MultiStageRecognitionEngine 已初始化', this.config);
  }

  /**
   * 主要識別方法 - 協調多階段識別流程
   */
  async recognize(imageBuffer: Buffer, userId?: string): Promise<EnhancedRecognitionResult> {
    const startTime = Date.now();
    
    // 檢查緩存
    const cachedResult = recognitionResultCache.get(imageBuffer);
    if (cachedResult) {
      console.log('✅ 使用緩存的識別結果');
      return cachedResult;
    }
    
    const stages: RecognitionStage[] = [];
    let totalApiCalls = 0;
    
    // 生成會話 ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 開始性能監控
    foodRecognitionPerformanceMonitor.startRecognitionSession(
      sessionId,
      imageBuffer.length,
      'jpeg',
      userId
    );

    console.log('🔍 MultiStageRecognitionEngine: 開始多階段識別流程', { sessionId });

    try {
      // 第一階段：標準識別
      console.log('📍 階段 1: 標準識別');
      const stage1 = await this.attemptStandard(imageBuffer, sessionId);
      stages.push(stage1);
      totalApiCalls += stage1.apiCalls;

      // 記錄階段性能
      foodRecognitionPerformanceMonitor.recordRecognitionStage(
        sessionId,
        '標準識別',
        1,
        stage1.timestamp.getTime() - stage1.processingTime,
        stage1.timestamp.getTime(),
        stage1.apiCalls,
        stage1.confidence,
        stage1.result.foods.length,
        true
      );

      console.log(`✅ 階段 1 完成 - 信心度: ${stage1.confidence.toFixed(2)}, 識別到 ${stage1.result.foods.length} 個食物`);

      // 檢查是否需要進入第二階段
      if (stage1.confidence >= this.config.minConfidenceThreshold) {
        console.log('✅ 信心度足夠，直接返回結果');
        const result = this.buildFinalResult(stages, stage1, totalApiCalls, startTime);
        
        // 緩存結果
        recognitionResultCache.set(imageBuffer, result);
        
        // 結束性能監控
        foodRecognitionPerformanceMonitor.endRecognitionSession(
          sessionId,
          result.confidence,
          result.foods.length,
          true
        );
        
        return result;
      }

      // 第二階段：增強識別
      console.log('📍 階段 2: 增強識別（信心度不足，使用專門 prompt）');
      const stage2 = await this.attemptEnhanced(imageBuffer, stage1, sessionId);
      stages.push(stage2);
      totalApiCalls += stage2.apiCalls;

      // 記錄階段性能
      foodRecognitionPerformanceMonitor.recordRecognitionStage(
        sessionId,
        '增強識別',
        2,
        stage2.timestamp.getTime() - stage2.processingTime,
        stage2.timestamp.getTime(),
        stage2.apiCalls,
        stage2.confidence,
        stage2.result.foods.length,
        true
      );

      console.log(`✅ 階段 2 完成 - 信心度: ${stage2.confidence.toFixed(2)}, 識別到 ${stage2.result.foods.length} 個食物`);

      // 檢查是否需要進入第三階段
      if (stage2.confidence >= this.config.enhancedThreshold) {
        console.log('✅ 增強識別信心度足夠，返回結果');
        const result = this.buildFinalResult(stages, stage2, totalApiCalls, startTime);
        
        // 緩存結果
        recognitionResultCache.set(imageBuffer, result);
        
        // 結束性能監控
        foodRecognitionPerformanceMonitor.endRecognitionSession(
          sessionId,
          result.confidence,
          result.foods.length,
          true
        );
        
        return result;
      }

      // 第三階段：知識庫匹配（如果啟用）
      if (this.config.enableKnowledgeBase && stages.length < this.config.maxStages) {
        console.log('📍 階段 3: 知識庫匹配（信心度仍不足，使用知識庫）');
        const stage3 = await this.attemptKnowledgeBase(imageBuffer, stages, sessionId);
        stages.push(stage3);
        totalApiCalls += stage3.apiCalls;

        // 記錄階段性能
        foodRecognitionPerformanceMonitor.recordRecognitionStage(
          sessionId,
          '知識庫匹配',
          3,
          stage3.timestamp.getTime() - stage3.processingTime,
          stage3.timestamp.getTime(),
          stage3.apiCalls,
          stage3.confidence,
          stage3.result.foods.length,
          true
        );

        console.log(`✅ 階段 3 完成 - 信心度: ${stage3.confidence.toFixed(2)}, 識別到 ${stage3.result.foods.length} 個食物`);

        const result = this.buildFinalResult(stages, stage3, totalApiCalls, startTime);
        
        // 緩存結果
        recognitionResultCache.set(imageBuffer, result);
        
        // 結束性能監控
        foodRecognitionPerformanceMonitor.endRecognitionSession(
          sessionId,
          result.confidence,
          result.foods.length,
          true
        );
        
        return result;
      }

      // 如果所有階段都完成，返回最佳結果
      const bestStage = this.selectBestStage(stages);
      console.log(`✅ 所有階段完成，選擇階段 ${bestStage.attempt} 作為最終結果`);
      const result = this.buildFinalResult(stages, bestStage, totalApiCalls, startTime);
      
      // 緩存結果
      recognitionResultCache.set(imageBuffer, result);
      
      // 結束性能監控
      foodRecognitionPerformanceMonitor.endRecognitionSession(
        sessionId,
        result.confidence,
        result.foods.length,
        true
      );
      
      return result;

    } catch (error) {
      console.error('❌ MultiStageRecognitionEngine 識別錯誤:', error);
      
      // 記錄失敗的會話
      foodRecognitionPerformanceMonitor.endRecognitionSession(
        sessionId,
        0,
        0,
        false,
        error instanceof Error ? error.name : 'UnknownError'
      );
      
      throw new Error(`多階段識別失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 第一階段：標準識別
   */
  private async attemptStandard(imageBuffer: Buffer, sessionId: string): Promise<RecognitionStage> {
    const stageStartTime = Date.now();
    
    try {
      // 使用亞洲料理通用 prompt
      const prompt = this.promptGenerator.generatePrompt({
        language: this.config.language
      });

      // 調用 OpenAI Vision API
      const apiResult = await this.callVisionAPI(imageBuffer, prompt, sessionId);
      
      // 解析結果
      const foods = await this.parseVisionResponse(apiResult);
      const confidence = this.calculateOverallConfidence(foods);

      const result: StageRecognitionResult = {
        foods,
        overallConfidence: confidence,
        description: apiResult.overallDescription || `識別到 ${foods.length} 個食物項目`,
        cookingMethod: apiResult.cookingMethod,
        cuisineType: apiResult.cuisineType,
        rawResponse: apiResult
      };

      return {
        attempt: 1,
        promptType: 'standard',
        result,
        confidence,
        timestamp: new Date(),
        processingTime: Date.now() - stageStartTime,
        apiCalls: 1
      };
    } catch (error) {
      console.error('❌ 標準識別階段錯誤:', error);
      throw error;
    }
  }

  /**
   * 第二階段：增強識別
   */
  private async attemptEnhanced(
    imageBuffer: Buffer,
    previousStage: RecognitionStage,
    sessionId: string
  ): Promise<RecognitionStage> {
    const stageStartTime = Date.now();

    try {
      // 分析第一階段結果，選擇專門的 prompt
      const promptConfig = this.analyzeAndSelectPrompt(previousStage);

      // 生成增強 prompt
      const prompt = this.promptGenerator.generatePrompt(promptConfig);

      // 調用 OpenAI Vision API
      const apiResult = await this.callVisionAPI(imageBuffer, prompt, sessionId);

      // 解析結果
      const foods = await this.parseVisionResponse(apiResult);
      const confidence = this.calculateOverallConfidence(foods);

      const result: StageRecognitionResult = {
        foods,
        overallConfidence: confidence,
        description: apiResult.overallDescription || `增強識別到 ${foods.length} 個食物項目`,
        cookingMethod: apiResult.cookingMethod,
        cuisineType: apiResult.cuisineType,
        rawResponse: apiResult
      };

      return {
        attempt: 2,
        promptType: 'enhanced',
        result,
        confidence,
        timestamp: new Date(),
        processingTime: Date.now() - stageStartTime,
        apiCalls: 1
      };
    } catch (error) {
      console.error('❌ 增強識別階段錯誤:', error);
      throw error;
    }
  }

  /**
   * 第三階段：知識庫匹配
   */
  private async attemptKnowledgeBase(
    imageBuffer: Buffer,
    previousStages: RecognitionStage[],
    sessionId: string
  ): Promise<RecognitionStage> {
    const stageStartTime = Date.now();

    try {
      // 提取圖片視覺特徵（簡化版）
      const imageFeatures = this.extractImageFeatures(previousStages);

      // 在知識庫中搜索匹配項（使用優化的查詢器）
      const kbStats = knowledgeBaseQueryOptimizer.getStatistics();
      const matches = knowledgeBaseQueryOptimizer.matchFoodItemsByVisualFeatures(imageFeatures, {
        threshold: 0.3,
        visualWeight: 0.6,
        categoryWeight: 0.2,
        cuisineWeight: 0.2
      });
      
      const kbQueryDuration = Date.now() - stageStartTime;
      
      // 檢查是否為緩存命中
      const cacheStats = knowledgeBaseQueryOptimizer.getCacheStatistics();
      const isCacheHit = cacheStats.match.hits > 0;
      
      // 記錄知識庫查詢性能
      foodRecognitionPerformanceMonitor.recordKnowledgeBaseQuery(
        'visualFeatureMatch',
        kbStats.totalFoodItems,
        matches.length,
        kbQueryDuration,
        isCacheHit
      );

      console.log(`📚 知識庫匹配到 ${matches.length} 個可能的食材`);

      // 轉換為 DetectedFood 格式
      const foods: DetectedFood[] = [];
      for (const match of matches.slice(0, 5)) { // 取前5個匹配
        const foodItem = match.foodItem;
        foods.push({
          id: foodItem.id,
          name: foodItem.name,
          confidence: match.confidence,
          estimatedPortion: 100, // 預設份量
          nutrition: this.convertNutritionInfo(foodItem.nutritionPer100g)
        });
      }

      const confidence = this.calculateOverallConfidence(foods);

      const result: StageRecognitionResult = {
        foods,
        overallConfidence: confidence,
        description: `知識庫匹配到 ${foods.length} 個可能的食材`,
        rawResponse: { matches }
      };

      return {
        attempt: 3,
        promptType: 'knowledge_base',
        result,
        confidence,
        timestamp: new Date(),
        processingTime: Date.now() - stageStartTime,
        apiCalls: 0 // 知識庫匹配不調用 API
      };
    } catch (error) {
      console.error('❌ 知識庫匹配階段錯誤:', error);
      throw error;
    }
  }

  /**
   * 調用 OpenAI Vision API
   */
  private async callVisionAPI(imageBuffer: Buffer, prompt: string, sessionId: string): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI API 未初始化');
    }

    const apiStartTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;

    try {
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      console.log('🤖 調用 OpenAI Vision API (gpt-4o)...');
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutrition tracking assistant specializing in Asian cuisine food recognition.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content || '{}';
      console.log('📝 OpenAI 回應長度:', content.length);

      // 清理 OpenAI 回應中的 markdown 代碼塊標記
      let cleanedContent = content.trim();
      
      // 移除 ```json 和 ``` 標記
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.substring(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.substring(3);
      }
      
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3);
      }
      
      cleanedContent = cleanedContent.trim();

      // 解析 JSON 回應
      const parsed = JSON.parse(cleanedContent);
      success = true;
      
      // 記錄 API 調用性能
      foodRecognitionPerformanceMonitor.recordApiCall(
        sessionId,
        'openai-vision',
        apiStartTime,
        Date.now(),
        true,
        {
          endpoint: 'chat.completions',
          requestSize: imageBuffer.length + prompt.length,
          responseSize: content.length,
          statusCode: 200
        }
      );
      
      return parsed;

    } catch (error) {
      console.error('❌ OpenAI Vision API 調用錯誤:', error);
      errorMessage = error instanceof Error ? error.message : '未知錯誤';
      
      // 記錄失敗的 API 調用
      foodRecognitionPerformanceMonitor.recordApiCall(
        sessionId,
        'openai-vision',
        apiStartTime,
        Date.now(),
        false,
        {
          endpoint: 'chat.completions',
          errorMessage,
          statusCode: 500
        }
      );
      
      throw new Error(`OpenAI Vision API 調用失敗: ${errorMessage}`);
    }
  }

  /**
   * 轉換 NutritionInfo 為 NutritionData
   */
  private convertNutritionInfo(nutritionInfo: any): any {
    return {
      calories: nutritionInfo.calories || 0,
      protein: nutritionInfo.protein || 0,
      carbohydrates: nutritionInfo.carbohydrates || nutritionInfo.carbs || 0,
      fat: nutritionInfo.fat || 0,
      fiber: nutritionInfo.fiber || 0,
      sugar: nutritionInfo.sugar || 0,
      sodium: nutritionInfo.sodium || 0,
      vitamins: {
        vitamin_a_mcg: 0,
        vitamin_c_mg: 0,
        vitamin_d_mcg: 0,
        vitamin_e_mg: 0,
        vitamin_k_mcg: 0,
        vitamin_b1_mg: 0,
        vitamin_b2_mg: 0,
        vitamin_b3_mg: 0,
        vitamin_b6_mg: 0,
        vitamin_b12_mcg: 0,
        folate_mcg: 0
      },
      minerals: {
        calcium_mg: nutritionInfo.calcium || 0,
        iron_mg: nutritionInfo.iron || 0,
        magnesium_mg: 0,
        phosphorus_mg: 0,
        potassium_mg: 0,
        zinc_mg: 0
      }
    };
  }

  /**
   * 解析 Vision API 回應
   */
  private async parseVisionResponse(apiResponse: any): Promise<DetectedFood[]> {
    const foods: DetectedFood[] = [];
    const foodsArray = apiResponse.foods || [];

    for (const foodData of foodsArray) {
      try {
        let matchingFood: FoodItem | null = null;

        // 第一層：嘗試在資料庫中搜尋相似的食物
        try {
          const searchResult = await this.foodRepository.search({
            query: foodData.name,
            limit: 1
          });
          const matchingFoods = searchResult.items;
          
          if (matchingFoods.length > 0) {
            matchingFood = matchingFoods[0];
            console.log(`✅ 從資料庫找到: ${matchingFood.name}`);
          }
        } catch (dbError) {
          console.warn(`⚠️ 資料庫查詢失敗: ${dbError instanceof Error ? dbError.message : '未知錯誤'}`);
        }

        // 第二層：如果資料庫沒有找到（無論是錯誤還是空結果），使用知識庫
        if (!matchingFood) {
          console.log(`🔍 資料庫未找到 "${foodData.name}"，嘗試知識庫...`);
          const kbMatches = this.knowledgeBase.searchFoodItemsByName(foodData.name, true);
          
          if (kbMatches.length > 0) {
            const kbFood = kbMatches[0];
            console.log(`✅ 從知識庫找到: ${kbFood.name}`);
            
            // 轉換知識庫的 FoodItem 為 shared.ts 的 FoodItem 格式
            matchingFood = {
              id: kbFood.id,
              name: kbFood.name,
              category: kbFood.category as any,
              nutritionPer100g: {
                calories: kbFood.nutritionPer100g.calories,
                protein: kbFood.nutritionPer100g.protein,
                carbohydrates: kbFood.nutritionPer100g.carbohydrates,
                fat: kbFood.nutritionPer100g.fat,
                fiber: kbFood.nutritionPer100g.fiber,
                sugar: kbFood.nutritionPer100g.sugar || 0,
                sodium: kbFood.nutritionPer100g.sodium
              },
              commonPortions: [
                { name: '100公克', weight: 100, description: '標準份量' },
                { name: '1份', weight: 100, description: '一般份量' }
              ],
              tags: kbFood.tags || []
            };
          } else {
            console.warn(`⚠️ 知識庫也未找到 "${foodData.name}"`);
          }
        }

        if (matchingFood) {
          foods.push({
            id: matchingFood.id,
            name: matchingFood.name,
            confidence: foodData.confidence || 0.5,
            estimatedPortion: foodData.portion || 100,
            nutrition: this.convertNutritionInfo(matchingFood.nutritionPer100g)
          });
        } else {
          // 如果資料庫和知識庫都沒有，創建一個基本的建議
          console.warn(`未找到食物 "${foodData.name}" 的營養資訊，使用預設值`);
          foods.push({
            id: `temp-${Date.now()}-${Math.random()}`,
            name: foodData.name,
            confidence: foodData.confidence || 0.5,
            estimatedPortion: foodData.portion || 100,
            nutrition: this.convertNutritionInfo({
              calories: 0,
              protein: 0,
              carbohydrates: 0,
              fat: 0,
              fiber: 0,
              sodium: 0
            })
          });
        }
      } catch (error) {
        console.error(`解析食物 "${foodData.name}" 時發生錯誤:`, error);
        // 即使發生錯誤，也添加一個基本的食物項目
        foods.push({
          id: `temp-${Date.now()}-${Math.random()}`,
          name: foodData.name,
          confidence: foodData.confidence || 0.3,
          estimatedPortion: foodData.portion || 100,
          nutrition: this.convertNutritionInfo({
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            sodium: 0
          })
        });
      }
    }

    return foods;
  }

  /**
   * 計算整體信心度
   */
  private calculateOverallConfidence(foods: DetectedFood[]): number {
    if (foods.length === 0) return 0;

    const totalConfidence = foods.reduce((sum, food) => sum + food.confidence, 0);
    return totalConfidence / foods.length;
  }

  /**
   * 分析前一階段結果並選擇 prompt
   */
  private analyzeAndSelectPrompt(previousStage: RecognitionStage): PromptGeneratorConfig {
    const config: PromptGeneratorConfig = {
      previousAttempts: previousStage.attempt,
      language: this.config.language
    };

    // 根據第一階段的結果推測料理類型和食材類別
    const result = previousStage.result;

    // 檢測料理類型
    if (result.cuisineType) {
      config.detectedCuisineType = result.cuisineType as CuisineType;
    }

    // 檢測可能的食材類別
    const suspectedCategories: FoodCategory[] = [];
    for (const food of result.foods) {
      // 根據食物名稱推測類別
      if (food.name.includes('豆腐') || food.name.includes('豆干') || food.name.includes('豆皮')) {
        suspectedCategories.push(FoodCategory.BEAN_PRODUCTS);
      }
      if (food.name.includes('麵') || food.name.includes('粉')) {
        suspectedCategories.push(FoodCategory.NOODLES);
      }
      if (food.name.includes('菜') || food.name.includes('椒')) {
        suspectedCategories.push(FoodCategory.VEGETABLES);
      }
    }

    if (suspectedCategories.length > 0) {
      config.suspectedFoodCategories = [...new Set(suspectedCategories)]; // 去重
    }

    return config;
  }

  /**
   * 提取圖片視覺特徵（基於前階段結果）
   */
  private extractImageFeatures(previousStages: RecognitionStage[]): ImageFeatures {
    // 從前階段結果推測視覺特徵
    const allFoods = previousStages.flatMap(stage => stage.result.foods);
    
    // 提取顏色
    const colors: string[] = [];
    const shapes: string[] = [];
    
    for (const food of allFoods) {
      // 根據食物名稱推測顏色和形狀
      if (food.name.includes('綠') || food.name.includes('菜')) {
        colors.push('綠色');
      }
      if (food.name.includes('紅') || food.name.includes('辣椒')) {
        colors.push('紅色');
      }
      if (food.name.includes('黃') || food.name.includes('玉米')) {
        colors.push('黃色');
      }
      if (food.name.includes('白') || food.name.includes('飯') || food.name.includes('豆腐')) {
        colors.push('白色');
      }

      // 推測形狀
      if (food.name.includes('絲') || food.name.includes('條')) {
        shapes.push('細長條狀');
      }
      if (food.name.includes('塊') || food.name.includes('丁')) {
        shapes.push('方塊狀');
      }
      if (food.name.includes('片')) {
        shapes.push('片狀');
      }
    }

    return {
      dominantColors: [...new Set(colors)],
      textureType: 'mixed',
      shapePatterns: [...new Set(shapes)],
      estimatedComplexity: allFoods.length,
      hasMultipleComponents: allFoods.length > 2
    };
  }

  /**
   * 選擇最佳階段結果
   */
  private selectBestStage(stages: RecognitionStage[]): RecognitionStage {
    // 選擇信心度最高的階段
    return stages.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  /**
   * 合併多階段結果
   */
  private mergeResults(stages: RecognitionStage[]): StageRecognitionResult {
    // 收集所有食物
    const allFoods: DetectedFood[] = [];
    const foodMap = new Map<string, DetectedFood>();

    for (const stage of stages) {
      for (const food of stage.result.foods) {
        const key = food.name.toLowerCase();
        
        if (!foodMap.has(key)) {
          foodMap.set(key, food);
        } else {
          // 如果已存在，取信心度較高的
          const existing = foodMap.get(key)!;
          if (food.confidence > existing.confidence) {
            foodMap.set(key, food);
          }
        }
      }
    }

    const mergedFoods = Array.from(foodMap.values());
    const confidence = this.calculateOverallConfidence(mergedFoods);

    return {
      foods: mergedFoods,
      overallConfidence: confidence,
      description: `合併 ${stages.length} 個階段的結果，識別到 ${mergedFoods.length} 個食物`,
      cookingMethod: stages[stages.length - 1].result.cookingMethod,
      cuisineType: stages[stages.length - 1].result.cuisineType
    };
  }

  /**
   * 生成替代選項
   */
  private generateAlternatives(stages: RecognitionStage[]): FoodSuggestion[][] {
    const alternatives: FoodSuggestion[][] = [];

    // 為每個主要食物生成替代選項
    const finalStage = stages[stages.length - 1];
    
    for (const food of finalStage.result.foods) {
      const foodAlternatives: FoodSuggestion[] = [];

      // 從所有階段收集該食物的不同識別結果
      for (const stage of stages) {
        for (const stageFood of stage.result.foods) {
          if (this.areSimilarFoods(food.name, stageFood.name)) {
            foodAlternatives.push({
              food: {
                id: stageFood.id,
                name: stageFood.name,
                calories: Math.round(stageFood.nutrition.calories * stageFood.estimatedPortion / 100),
                protein: Math.round(stageFood.nutrition.protein * stageFood.estimatedPortion / 100 * 10) / 10,
                carbs: Math.round(stageFood.nutrition.carbohydrates * stageFood.estimatedPortion / 100 * 10) / 10,
                fat: Math.round(stageFood.nutrition.fat * stageFood.estimatedPortion / 100 * 10) / 10,
                fiber: Math.round(stageFood.nutrition.fiber * stageFood.estimatedPortion / 100 * 10) / 10,
                sodium: Math.round(stageFood.nutrition.sodium * stageFood.estimatedPortion / 100 * 10) / 10,
                category: '食材',
                portion: `${stageFood.estimatedPortion}g`,
                description: `階段 ${stage.attempt} 識別結果`
              },
              confidence: stageFood.confidence,
              recognitionStage: stage.attempt
            });
          }
        }
      }

      // 去重並排序
      const uniqueAlternatives = this.deduplicateAlternatives(foodAlternatives);
      if (uniqueAlternatives.length > 1) {
        alternatives.push(uniqueAlternatives.slice(0, 3)); // 最多3個替代選項
      }
    }

    return alternatives;
  }

  /**
   * 判斷兩個食物名稱是否相似
   */
  private areSimilarFoods(name1: string, name2: string): boolean {
    const n1 = name1.toLowerCase();
    const n2 = name2.toLowerCase();
    
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  }

  /**
   * 去重替代選項
   */
  private deduplicateAlternatives(alternatives: FoodSuggestion[]): FoodSuggestion[] {
    const seen = new Set<string>();
    const unique: FoodSuggestion[] = [];

    for (const alt of alternatives) {
      const key = alt.food.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(alt);
      }
    }

    // 按信心度排序
    return unique.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 構建最終結果
   */
  private buildFinalResult(
    stages: RecognitionStage[],
    finalStage: RecognitionStage,
    totalApiCalls: number,
    startTime: number
  ): EnhancedRecognitionResult {
    const totalProcessingTime = Date.now() - startTime;

    // 生成替代選項
    const alternatives = this.generateAlternatives(stages);

    // 轉換為前端期望的格式
    const suggestions: FoodSuggestion[] = finalStage.result.foods.map(food => ({
      food: {
        id: food.id,
        name: food.name,
        calories: Math.round(food.nutrition.calories * food.estimatedPortion / 100),
        protein: Math.round(food.nutrition.protein * food.estimatedPortion / 100 * 10) / 10,
        carbs: Math.round(food.nutrition.carbohydrates * food.estimatedPortion / 100 * 10) / 10,
        fat: Math.round(food.nutrition.fat * food.estimatedPortion / 100 * 10) / 10,
        fiber: Math.round(food.nutrition.fiber * food.estimatedPortion / 100 * 10) / 10,
        sodium: Math.round(food.nutrition.sodium * food.estimatedPortion / 100 * 10) / 10,
        category: '食材',
        portion: `${food.estimatedPortion}g`,
        description: `多階段識別結果（階段 ${finalStage.attempt}）`,
        cooking_method: finalStage.result.cookingMethod,
        cuisine_type: finalStage.result.cuisineType
      },
      confidence: food.confidence,
      recognitionStage: finalStage.attempt
    }));

    return {
      foods: finalStage.result.foods,
      suggestions,
      confidence: finalStage.confidence,
      processingTime: totalProcessingTime,
      description: finalStage.result.description,
      apiUsed: 'openai-vision-multistage',
      alternatives,
      stages,
      finalStage: finalStage.attempt,
      totalProcessingTime,
      totalApiCalls
    };
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const isOpenAIConfigured = !!this.openai;
      const kbStats = this.knowledgeBase.getStatistics();

      return {
        status: isOpenAIConfigured ? 'healthy' : 'degraded',
        details: {
          openaiConfigured: isOpenAIConfigured,
          knowledgeBaseItems: kbStats.totalFoodItems,
          dishPatterns: kbStats.totalDishPatterns,
          config: this.config,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : '未知錯誤',
          timestamp: new Date()
        }
      };
    }
  }
}
