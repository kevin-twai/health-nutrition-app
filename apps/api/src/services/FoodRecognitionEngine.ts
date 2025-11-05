import { ImageAnnotatorClient } from '@google-cloud/vision';
import { DetectedFood, RecognitionResult } from '@health-tracker/shared-types';
import { FoodRepository } from '../repositories/FoodRepository';

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
  private visionClient: ImageAnnotatorClient;
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
    // 初始化 Google Vision API 客戶端
    this.visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
    
    this.foodRepository = new FoodRepository(null as any, null as any);
  }

  /**
   * 使用 Google Vision API 辨識圖片中的物件
   */
  private async detectObjects(imageBuffer: Buffer): Promise<VisionApiResult[]> {
    try {
      const [result] = await this.visionClient?.objectLocalization({
        image: { content: imageBuffer.toString('base64') }
      });

      const objects = result?.localizedObjectAnnotations || [];
      
      return objects?.map(obj => ({
        description: obj?.name || '',
        score: obj?.score || 0,
        boundingPoly: obj?.boundingPoly
      })) || [];
    } catch (error) {
      console.error('Google Vision API 物件偵測錯誤:', error);
      throw new Error('物件偵測失敗');
    }
  }

  /**
   * 使用 Google Vision API 辨識圖片中的標籤
   */
  private async detectLabels(imageBuffer: Buffer): Promise<VisionApiResult[]> {
    try {
      const [result] = await this.visionClient.labelDetection({
        image: { content: imageBuffer.toString('base64') }
      });

      const labels = result?.labelAnnotations || [];
      
      return labels?.map(label => ({
        description: label?.description || '',
        score: label?.score || 0
      })) || [];
    } catch (error) {
      console.error('Google Vision API 標籤偵測錯誤:', error);
      throw new Error('標籤偵測失敗');
    }
  }

  /**
   * 使用 Google Vision API 辨識圖片中的文字
   */
  private async detectText(imageBuffer: Buffer): Promise<string[]> {
    try {
      const [result] = await this.visionClient.textDetection({
        image: { content: imageBuffer.toString('base64') }
      });

      const detections = result?.textAnnotations || [];
      
      return detections?.map(text => text?.description || '').filter(Boolean) || [];
    } catch (error) {
      console.error('Google Vision API 文字偵測錯誤:', error);
      return [];
    }
  }

  /**
   * 過濾食物相關的辨識結果
   */
  private filterFoodRelatedResults(results: VisionApiResult[]): VisionApiResult[] {
    return results.filter(result => {
      const description = result.description.toLowerCase();
      return Array.from(this.foodKeywords).some(keyword => 
        description.includes(keyword.toLowerCase())
      );
    });
  }

  /**
   * 計算辨識結果的信心度
   */
  private calculateConfidence(
    objectResults: VisionApiResult[],
    labelResults: VisionApiResult[],
    textResults: string[]
  ): number {
    let confidence = 0;
    let factors = 0;

    // 物件辨識信心度 (權重: 40%)
    if (objectResults.length > 0) {
      const avgObjectScore = objectResults.reduce((sum, obj) => sum + obj.score, 0) / objectResults.length;
      confidence += avgObjectScore * 0.4;
      factors += 0.4;
    }

    // 標籤辨識信心度 (權重: 40%)
    if (labelResults.length > 0) {
      const avgLabelScore = labelResults.reduce((sum, label) => sum + label.score, 0) / labelResults.length;
      confidence += avgLabelScore * 0.4;
      factors += 0.4;
    }

    // 文字辨識加分 (權重: 20%)
    if (textResults.length > 0) {
      const hasMenuText = textResults.some(text => 
        /menu|價格|price|\$|NT\$|元/.test(text)
      );
      if (hasMenuText) {
        confidence += 0.2;
        factors += 0.2;
      }
    }

    return factors > 0 ? confidence / factors : 0;
  }

  /**
   * 從辨識結果生成食物建議
   */
  private async generateFoodSuggestions(
    objectResults: VisionApiResult[],
    labelResults: VisionApiResult[]
  ): Promise<DetectedFood[]> {
    const allResults = [...objectResults, ...labelResults];
    const uniqueDescriptions = Array.from(
      new Set(allResults.map(r => r.description.toLowerCase()))
    );

    const suggestions: DetectedFood[] = [];

    for (const description of uniqueDescriptions) {
      try {
        // 在資料庫中搜尋相似的食物
        const searchResult = await this.foodRepository.search({ 
          query: description, 
          limit: 3 
        });
        const matchingFoods = searchResult.items;
        
        for (const food of matchingFoods.slice(0, 3)) { // 最多3個建議
          const originalResult = allResults.find(r => 
            r.description.toLowerCase() === description
          );
          
          suggestions.push({
            id: food.id,
            name: food.name,
            confidence: originalResult?.score || 0.5,
            estimatedPortion: this.estimatePortion(food.name),
            nutrition: food.nutritionPer100g
          });
        }
      } catch (error) {
        console.error(`搜尋食物 "${description}" 時發生錯誤:`, error);
      }
    }

    // 按信心度排序並去重
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .filter((food, index, arr) => 
        arr.findIndex(f => f.id === food.id) === index
      )
      .slice(0, 5); // 最多返回5個建議
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
      // 並行執行多種辨識
      const [objectResults, labelResults, textResults] = await Promise.all([
        this.detectObjects(imageBuffer),
        this.detectLabels(imageBuffer),
        this.detectText(imageBuffer)
      ]);

      // 過濾食物相關結果
      const foodObjects = this.filterFoodRelatedResults(objectResults);
      const foodLabels = this.filterFoodRelatedResults(labelResults);

      // 計算整體信心度
      const overallConfidence = this.calculateConfidence(
        foodObjects,
        foodLabels,
        textResults
      );

      // 生成食物建議
      const detectedFoods = await this.generateFoodSuggestions(
        foodObjects,
        foodLabels
      );

      // 過濾低信心度結果
      const filteredFoods = detectedFoods
        .filter(food => food.confidence >= minConfidence)
        .slice(0, maxResults);

      const processingTime = Date.now() - startTime;

      return {
        foods: filteredFoods,
        confidence: overallConfidence,
        processingTime
      };

    } catch (error) {
      console.error('食物辨識錯誤:', error);
      throw new Error(`食物辨識失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
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
      // 測試 Google Vision API 連接
      const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      await this.visionClient.labelDetection({ image: { content: testImage } });
      
      return {
        status: 'healthy',
        details: {
          visionApiConnected: true,
          supportedCategories: this.getSupportedFoodCategories().length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          visionApiConnected: false,
          error: error instanceof Error ? error.message : '未知錯誤',
          timestamp: new Date()
        }
      };
    }
  }
}