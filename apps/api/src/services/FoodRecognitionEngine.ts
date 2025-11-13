import { DetectedFood, RecognitionResult } from '../types/shared';
import { FoodRepository } from '../repositories/FoodRepository';
import OpenAI from 'openai';

export interface FoodRecognitionOptions {
  maxResults?: number;
  minConfidence?: number;
  language?: string;
}

export interface VisionApiResult {
  description: string;
  score: number;
  boundingPoly?: any;
}

export class FoodRecognitionEngine {
  private openai: OpenAI | null;
  private foodRepository: FoodRepository;
  
  // 食物相關關鍵字映射
  private readonly foodKeywords = new Set([
    'food', 'meal', 'dish', 'cuisine', 'breakfast', 'lunch', 'dinner',
    'rice', 'noodle', 'bread', 'meat', 'chicken', 'beef', 'pork', 'fish',
    'vegetable', 'fruit', 'salad', 'soup', 'drink', 'beverage',
    '食物', '餐點', '料理', '早餐', '午餐', '晚餐', '米飯', '麵條', '麵包',
    '肉類', '雞肉', '牛肉', '豬肉', '魚', '蔬菜', '水果', '沙拉', '湯', '飲料'
  ]);

  constructor() {
    // 初始化 OpenAI 客戶端
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('✅ OpenAI Vision API 已初始化');
    } else {
      this.openai = null;
      console.warn('⚠️ OPENAI_API_KEY 未設定，將使用本地分析');
    }
    
    // 初始化 FoodRepository，傳入 null 表示沒有 MongoDB
    this.foodRepository = new FoodRepository(null, undefined);
  }

  /**
   * 使用 OpenAI Vision API 辨識圖片中的食物
   */
  private async detectFoodWithOpenAI(imageBuffer: Buffer, language: string = 'zh-TW'): Promise<VisionApiResult[]> {
    if (!this.openai) {
      throw new Error('OpenAI API 未初始化');
    }

    try {
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      const prompt = language === 'zh-TW' 
        ? `你是一個營養分析助手。請描述這張圖片中的食物和飲料，幫助用戶記錄他們的飲食。

請列出圖片中所有可見的食物項目，對於每個項目提供：
1. 食物名稱（使用繁體中文）
2. 辨識信心度（0到1之間的小數）
3. 估計份量（以公克為單位）

請以 JSON 格式回應：
{
  "foods": [
    {"name": "白飯", "confidence": 0.95, "portion": 150},
    {"name": "炒青菜", "confidence": 0.90, "portion": 80}
  ]
}

如果圖片中沒有食物，請回應：{"foods": []}

注意：請只辨識食物和飲料，不要分析其他內容。`
        : `You are a nutrition analysis assistant. Please describe the food and beverages in this image to help users track their diet.

List all visible food items in the image. For each item, provide:
1. Food name (in English)
2. Recognition confidence (decimal between 0 and 1)
3. Estimated portion (in grams)

Respond in JSON format:
{
  "foods": [
    {"name": "white rice", "confidence": 0.95, "portion": 150},
    {"name": "stir-fried vegetables", "confidence": 0.90, "portion": 80}
  ]
}

If no food is detected, respond with: {"foods": []}

Note: Only identify food and beverages, do not analyze other content.`;

      console.log('🤖 調用 OpenAI Vision API (gpt-4o)...');
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful nutrition tracking assistant that identifies food items in images to help users log their meals.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content || '{}';
      console.log('📝 OpenAI 回應:', content);

      // 解析 JSON 回應
      const parsed = JSON.parse(content);
      const foods = parsed.foods || [];

      return foods.map((food: any) => ({
        description: food.name || '',
        score: food.confidence || 0.5,
        portion: food.portion || 100
      }));

    } catch (error) {
      console.error('❌ OpenAI Vision API 錯誤:', error);
      throw new Error(`OpenAI Vision API 調用失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }



  /**
   * 估算食物份量 (簡單的啟發式方法)
   */
  private estimatePortion(foodName: string): number {
    const name = foodName.toLowerCase();
    
    // 根據食物類型估算標準份量 (公克)
    if (name.includes('rice') || name.includes('米飯')) return 150;
    if (name.includes('noodle') || name.includes('麵')) return 100;
    if (name.includes('bread') || name.includes('麵包')) return 50;
    if (name.includes('meat') || name.includes('肉')) return 100;
    if (name.includes('fish') || name.includes('魚')) return 120;
    if (name.includes('vegetable') || name.includes('蔬菜')) return 80;
    if (name.includes('fruit') || name.includes('水果')) return 150;
    if (name.includes('soup') || name.includes('湯')) return 200;
    if (name.includes('drink') || name.includes('飲料')) return 250;
    
    return 100; // 預設份量
  }

  /**
   * 主要的食物辨識方法
   */
  async recognizeFood(
    imageBuffer: Buffer,
    options: FoodRecognitionOptions = {}
  ): Promise<RecognitionResult> {
    const startTime = Date.now();
    const {
      maxResults = 5,
      minConfidence = 0.3,
      language = 'zh-TW'
    } = options;

    try {
      // 使用 OpenAI Vision API 辨識
      console.log('🔍 開始使用 OpenAI Vision API 辨識食物...');
      const visionResults = await this.detectFoodWithOpenAI(imageBuffer, language);
      
      console.log(`✅ OpenAI 辨識到 ${visionResults.length} 個食物項目`);

      // 計算整體信心度
      const overallConfidence = visionResults.length > 0
        ? visionResults.reduce((sum, r) => sum + r.score, 0) / visionResults.length
        : 0;

      // 生成食物建議（從資料庫匹配）
      const detectedFoods = await this.generateFoodSuggestionsFromVision(visionResults);

      // 過濾低信心度結果
      const filteredFoods = detectedFoods
        .filter(food => food.confidence >= minConfidence)
        .slice(0, maxResults);

      const processingTime = Date.now() - startTime;

      console.log(`⏱️ 處理時間: ${processingTime}ms, 信心度: ${overallConfidence.toFixed(2)}`);
      console.log(`📋 返回 ${filteredFoods.length} 個食物建議`);

      // 轉換為前端期望的格式
      const suggestions = filteredFoods.map(food => ({
        food: {
          name: food.name,
          portion: `${food.estimatedPortion}g`,
          calories: Math.round(food.nutrition.calories * food.estimatedPortion / 100),
          protein: Math.round(food.nutrition.protein * food.estimatedPortion / 100 * 10) / 10,
          carbs: Math.round((food.nutrition.carbs ?? food.nutrition.carbohydrates ?? 0) * food.estimatedPortion / 100 * 10) / 10,
          fat: Math.round(food.nutrition.fat * food.estimatedPortion / 100 * 10) / 10,
          category: '主食類', // 可以根據食物類型動態設置
          description: `使用 OpenAI Vision API 辨識`
        },
        confidence: food.confidence
      }));

      return {
        foods: filteredFoods,
        confidence: overallConfidence,
        processingTime,
        description: `使用 OpenAI Vision API 辨識到 ${filteredFoods.length} 個食物項目`,
        apiUsed: 'openai-vision'
      } as any;

    } catch (error) {
      console.error('❌ 食物辨識錯誤:', error);
      throw new Error(`食物辨識失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 從 OpenAI Vision 結果生成食物建議
   */
  private async generateFoodSuggestionsFromVision(
    visionResults: VisionApiResult[]
  ): Promise<DetectedFood[]> {
    const suggestions: DetectedFood[] = [];

    for (const result of visionResults) {
      try {
        // 在資料庫中搜尋相似的食物
        const searchResult = await this.foodRepository.search({ 
          query: result.description, 
          limit: 1 
        });
        const matchingFoods = searchResult.items;
        
        if (matchingFoods.length > 0) {
          const food = matchingFoods[0];
          suggestions.push({
            id: food.id,
            name: food.name,
            confidence: result.score,
            estimatedPortion: (result as any).portion || this.estimatePortion(food.name),
            nutrition: food.nutritionPer100g
          });
        } else {
          // 如果資料庫中沒有，創建一個基本的建議
          suggestions.push({
            id: `temp-${Date.now()}-${Math.random()}`,
            name: result.description,
            confidence: result.score,
            estimatedPortion: (result as any).portion || 100,
            nutrition: {
              calories: 0,
              protein: 0,
              carbohydrates: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              sugar: 0,
              sodium: 0
            }
          });
        }
      } catch (error) {
        console.error(`搜尋食物 "${result.description}" 時發生錯誤:`, error);
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 驗證辨識結果的品質
   */
  validateRecognitionQuality(result: RecognitionResult): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 檢查是否有辨識到食物
    if (result.foods.length === 0) {
      issues.push('未辨識到任何食物');
      suggestions.push('請確保圖片清晰且包含食物');
    }

    // 檢查整體信心度
    if (result.confidence < 0.3) {
      issues.push('辨識信心度過低');
      suggestions.push('請嘗試拍攝更清晰的照片或調整光線');
    }

    // 檢查個別食物信心度
    const lowConfidenceFoods = result.foods.filter(food => food.confidence < 0.4);
    if (lowConfidenceFoods.length > 0) {
      issues.push(`${lowConfidenceFoods.length} 個食物辨識信心度較低`);
      suggestions.push('建議手動確認或重新拍攝');
    }

    // 檢查處理時間
    if (result.processingTime > 10000) { // 10秒
      issues.push('處理時間過長');
      suggestions.push('請檢查網路連線或稍後再試');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * 獲取支援的食物類別
   */
  getSupportedFoodCategories(): string[] {
    return [
      '主食類', '蛋白質類', '蔬菜類', '水果類', '乳製品類',
      '油脂類', '飲料類', '點心類', '湯品類', '調味料類'
    ];
  }

  /**
   * 健康檢查
   */
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const isOpenAIConfigured = !!this.openai;
      
      return {
        status: isOpenAIConfigured ? 'healthy' : 'degraded',
        details: {
          openaiConfigured: isOpenAIConfigured,
          supportedCategories: this.getSupportedFoodCategories().length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          openaiConfigured: false,
          error: error instanceof Error ? error.message : '未知錯誤',
          timestamp: new Date()
        }
      };
    }
  }
}