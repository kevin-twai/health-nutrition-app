import { RecognitionResult, DetectedFood } from '@health-tracker/shared-types';

export interface LocalFoodDatabase {
  keywords: string[];
  foods: {
    name: string;
    confidence: number;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export class LocalFoodRecognitionService {
  private readonly foodDatabase: LocalFoodDatabase[] = [
    // 主食類
    {
      keywords: ['rice', '米飯', '飯', 'meal', 'lunch', 'dinner', 'bread', 'white'],
      foods: [
        { name: '白米飯', confidence: 0.92, portion: '1 碗 (150g)', calories: 252, protein: 4.3, carbs: 55.2, fat: 0.6 },
        { name: '炒飯', confidence: 0.85, portion: '1 份 (200g)', calories: 380, protein: 8.5, carbs: 62.4, fat: 12.3 }
      ]
    },
    // 湯麵類
    {
      keywords: ['noodle', 'soup', 'ramen', '拉麵', '湯麵', '麵'],
      foods: [
        { name: '日式拉麵', confidence: 0.94, portion: '1 碗 (400g)', calories: 450, protein: 18.5, carbs: 52.0, fat: 18.2 },
        { name: '味噌拉麵', confidence: 0.91, portion: '1 碗 (420g)', calories: 480, protein: 20.1, carbs: 48.5, fat: 22.8 },
        { name: '豚骨拉麵', confidence: 0.89, portion: '1 碗 (450g)', calories: 520, protein: 22.3, carbs: 50.2, fat: 26.5 }
      ]
    },
    // 咖喱類
    {
      keywords: ['curry', '咖喱', '湯咖喱', 'soup'],
      foods: [
        { name: '北海道湯咖喱', confidence: 0.95, portion: '1 份 (450g)', calories: 580, protein: 22.5, carbs: 48.2, fat: 32.8 },
        { name: '日式咖喱飯', confidence: 0.92, portion: '1 份 (400g)', calories: 520, protein: 18.2, carbs: 65.5, fat: 18.5 },
        { name: '印度咖喱', confidence: 0.88, portion: '1 份 (350g)', calories: 480, protein: 20.1, carbs: 42.8, fat: 28.2 }
      ]
    },
    // 蔬菜類
    {
      keywords: ['vegetable', '蔬菜', 'egg', '蛋', 'carrot', '胡蘿蔔', 'potato', '馬鈴薯'],
      foods: [
        { name: '水煮蛋', confidence: 0.92, portion: '1 顆 (60g)', calories: 90, protein: 6.5, carbs: 0.5, fat: 6.8 },
        { name: '胡蘿蔔', confidence: 0.90, portion: '1 份 (80g)', calories: 32, protein: 0.8, carbs: 7.6, fat: 0.2 },
        { name: '馬鈴薯', confidence: 0.88, portion: '1 顆 (150g)', calories: 115, protein: 2.6, carbs: 26.2, fat: 0.1 }
      ]
    },
    // 肉類
    {
      keywords: ['meat', '肉', 'chicken', '雞', 'beef', '牛', 'pork', '豬'],
      foods: [
        { name: '烤雞腿', confidence: 0.87, portion: '1 隻 (120g)', calories: 285, protein: 26.8, carbs: 0, fat: 18.5 },
        { name: '紅燒肉', confidence: 0.83, portion: '1 份 (100g)', calories: 320, protein: 18.2, carbs: 8.5, fat: 24.1 }
      ]
    }
  ];

  /**
   * 本地食物辨識 (作為 API 失敗時的備用方案)
   */
  async recognizeFood(imageUri: string): Promise<RecognitionResult> {
    const startTime = Date.now();
    
    try {
      // 從圖片 URI 中提取可能的關鍵字
      const fileName = this.extractFileName(imageUri);
      const keywords = this.extractKeywords(fileName);
      
      console.log('本地辨識 - 檔案名稱:', fileName);
      console.log('本地辨識 - 提取關鍵字:', keywords);
      
      // 匹配食物類型
      const matchedFoods = this.matchFoodsByKeywords(keywords);
      
      // 轉換為 DetectedFood 格式
      const detectedFoods: DetectedFood[] = matchedFoods.map(food => ({
        id: this.generateFoodId(food.name),
        name: food.name,
        confidence: food.confidence,
        estimatedPortion: this.parsePortionFromString(food.portion),
        nutrition: {
          calories: food.calories,
          protein: food.protein,
          carbohydrates: food.carbs,
          fat: food.fat,
          fiber: 0, // 預設值
          sugar: 0, // 預設值
          sodium: 0, // 預設值
          vitamins: {
            vitaminA: 0,
            vitaminC: 0,
            vitaminD: 0,
            vitaminE: 0,
            vitaminK: 0,
            thiamine: 0,
            riboflavin: 0,
            niacin: 0,
            vitaminB6: 0,
            folate: 0,
            vitaminB12: 0
          },
          minerals: {
            calcium: 0,
            iron: 0,
            magnesium: 0,
            phosphorus: 0,
            potassium: 0,
            sodium: 0,
            zinc: 0,
            copper: 0,
            manganese: 0,
            selenium: 0
          }
        }
      }));
      
      const processingTime = Math.max(Date.now() - startTime, 1); // 確保至少 1ms
      
      return {
        foods: detectedFoods,
        confidence: detectedFoods.length > 0 ? 0.75 : 0, // 本地辨識的基礎信心度
        processingTime
      };
      
    } catch (error) {
      console.error('本地食物辨識錯誤:', error);
      
      // 返回空結果
      return {
        foods: [],
        confidence: 0,
        processingTime: Math.max(Date.now() - startTime, 1) // 確保至少 1ms
      };
    }
  }

  /**
   * 從 URI 中提取檔案名稱
   */
  private extractFileName(uri: string): string {
    try {
      const parts = uri.split('/');
      const fileName = parts[parts.length - 1];
      return fileName.toLowerCase();
    } catch {
      return '';
    }
  }

  /**
   * 從檔案名稱中提取關鍵字
   */
  private extractKeywords(fileName: string): string[] {
    const keywords: string[] = [];
    
    // 移除副檔名
    const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|gif|bmp|webp)$/i, '');
    
    // 分割檔名 (使用常見分隔符)
    const parts = nameWithoutExt.split(/[._-\s]+/).filter(part => part.length > 2);
    
    keywords.push(...parts);
    
    return keywords;
  }

  /**
   * 根據關鍵字匹配食物
   */
  private matchFoodsByKeywords(keywords: string[]): LocalFoodDatabase['foods'] {
    const matchedFoods: LocalFoodDatabase['foods'] = [];
    
    // 如果沒有關鍵字，返回預設食物
    if (keywords.length === 0) {
      const defaultCategory = this.foodDatabase[2]; // 咖喱類作為預設
      return [defaultCategory.foods[0]];
    }
    
    // 尋找匹配的食物類別 - 使用評分系統找到最佳匹配
    let primaryCategory: LocalFoodDatabase | null = null;
    let bestScore = 0;
    
    for (let i = 0; i < this.foodDatabase.length; i++) {
      const category = this.foodDatabase[i];
      let categoryScore = 0;
      for (const keyword of category.keywords) {
        for (const k of keywords) {
          if (k.includes(keyword) || keyword.includes(k)) {
            // 更具體的匹配給更高分數
            if (k === keyword) {
              categoryScore += 10; // 完全匹配
            } else if (keyword.length > 3) {
              categoryScore += 5; // 較長關鍵字匹配
            } else {
              categoryScore += 1; // 一般匹配
            }
          }
        }
      }
      
      if (categoryScore > bestScore) {
        bestScore = categoryScore;
        primaryCategory = category;
      } else if (categoryScore === bestScore && categoryScore > 0) {
        // 如果分數相同，優先選擇更具體的類別（咖喱 > 主食）
        const currentKeywords = primaryCategory?.keywords || [];
        const newKeywords = category.keywords;
        
        // 檢查是否有更具體的關鍵字匹配
        const hasSpecificMatch = newKeywords.some(keyword => 
          keywords.some(k => k === keyword && keyword.length > 4)
        );
        
        if (hasSpecificMatch) {
          primaryCategory = category;
        }
      }
    }
    
    // 如果沒有匹配，使用預設類別
    if (!primaryCategory) {
      primaryCategory = this.foodDatabase[2]; // 咖喱類
    }
    
    // 選擇主要食物
    const mainFood = primaryCategory.foods[Math.floor(Math.random() * primaryCategory.foods.length)];
    matchedFoods.push({ ...mainFood });
    
    // 根據類型添加配菜
    if (primaryCategory === this.foodDatabase[2]) { // 咖喱類
      const vegetableCategory = this.foodDatabase[3]; // 蔬菜類
      const numSides = Math.min(2, vegetableCategory.foods.length);
      
      for (let i = 0; i < numSides; i++) {
        const sideFood = vegetableCategory.foods[i];
        if (!matchedFoods.some(f => f.name === sideFood.name)) {
          matchedFoods.push({ ...sideFood });
        }
      }
    }
    
    // 添加隨機性到信心度
    matchedFoods.forEach(food => {
      food.confidence = Math.max(0.70, food.confidence + (Math.random() - 0.5) * 0.1);
      food.confidence = Math.min(0.95, food.confidence);
      food.confidence = Math.round(food.confidence * 100) / 100;
    });
    
    return matchedFoods;
  }

  /**
   * 生成食物 ID
   */
  private generateFoodId(name: string): string {
    return `local_${name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
  }

  /**
   * 從份量字串中解析數值
   */
  private parsePortionFromString(portionStr: string): number {
    // 簡單的份量解析，預設為 1 份
    const match = portionStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 1;
  }
}

export const localFoodRecognition = new LocalFoodRecognitionService();