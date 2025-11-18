/**
 * 增強 Prompt 生成器
 * Enhanced Prompt Generator for Asian Cuisine Food Recognition
 */

import {
  FoodCategory,
  CuisineType,
  CookingMethod,
  ImageFeatures
} from '../types/AsianCuisineKnowledgeBase';

/**
 * Prompt 生成器配置
 */
export interface PromptGeneratorConfig {
  imageFeatures?: ImageFeatures;
  detectedCuisineType?: CuisineType;
  previousAttempts?: number;
  userFeedback?: UserFeedback[];
  suspectedFoodCategories?: FoodCategory[];
  language?: 'zh-TW' | 'en';
}

/**
 * 用戶反饋
 */
export interface UserFeedback {
  incorrectFood?: string;
  correctFood?: string;
  timestamp?: Date;
}

/**
 * Prompt 模板類型
 */
export enum PromptTemplateType {
  STANDARD = 'standard',
  ASIAN_CUISINE = 'asian_cuisine',
  CHINESE = 'chinese',
  TAIWANESE = 'taiwanese',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  BEAN_PRODUCTS = 'bean_products',
  NOODLES = 'noodles',
  VEGETABLES = 'vegetables',
  SEAFOOD = 'seafood',
  MIXED_DISH = 'mixed_dish',
  COLD_DISH = 'cold_dish',
  STIR_FRY = 'stir_fry',
  SOUP = 'soup',
  INDIGENOUS = 'indigenous',
  STREET_FOOD = 'street_food'
}

/**
 * 增強 Prompt 生成器類
 */
export class EnhancedPromptGenerator {
  private templates: Map<PromptTemplateType, string>;
  private language: 'zh-TW' | 'en';

  constructor(language: 'zh-TW' | 'en' = 'zh-TW') {
    this.language = language;
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * 初始化所有 prompt 模板
   */
  private initializeTemplates(): void {
    // 標準模板
    this.templates.set(PromptTemplateType.STANDARD, this.createStandardTemplate());
    
    // 亞洲料理通用模板
    this.templates.set(PromptTemplateType.ASIAN_CUISINE, this.createAsianCuisineTemplate());
    
    // 料理類型專用模板
    this.templates.set(PromptTemplateType.CHINESE, this.createChinesePrompt());
    this.templates.set(PromptTemplateType.TAIWANESE, this.createTaiwanesePrompt());
    this.templates.set(PromptTemplateType.JAPANESE, this.createJapanesePrompt());
    this.templates.set(PromptTemplateType.KOREAN, this.createKoreanPrompt());
    
    // 食材類別專用模板
    this.templates.set(PromptTemplateType.BEAN_PRODUCTS, this.createBeanProductPrompt());
    this.templates.set(PromptTemplateType.NOODLES, this.createNoodleTypePrompt());
    this.templates.set(PromptTemplateType.VEGETABLES, this.createVegetablePrompt());
    this.templates.set(PromptTemplateType.SEAFOOD, this.createSeafoodPrompt());
    this.templates.set(PromptTemplateType.INDIGENOUS, this.createIndigenousFoodPrompt());
    
    // 菜餚類型專用模板
    this.templates.set(PromptTemplateType.COLD_DISH, this.createColdDishPrompt());
    this.templates.set(PromptTemplateType.STIR_FRY, this.createStirFryPrompt());
    this.templates.set(PromptTemplateType.SOUP, this.createSoupPrompt());
    this.templates.set(PromptTemplateType.MIXED_DISH, this.createMixedDishPrompt());
  }

  /**
   * 創建標準模板
   */
  private createStandardTemplate(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專業的營養分析助手，專精於亞洲料理的食物識別。

請仔細分析這張圖片中的所有食物和飲料，並提供詳細的識別結果。

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食物名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "食材類別",
      "cookingMethod": "烹飪方式",
      "description": "簡短描述"
    }
  ],
  "cuisineType": "料理類型",
  "overallDescription": "整體描述"
}

注意事項：
- 使用繁體中文標註所有食材名稱
- 信心度為 0 到 1 之間的小數
- 份量以公克為單位
- 如果圖片中沒有食物，請回應 {"foods": []}`;
    } else {
      return `You are a professional nutrition analysis assistant specializing in Asian cuisine food recognition.

Please carefully analyze all food and beverages in this image and provide detailed identification results.

Respond in JSON format:
{
  "foods": [
    {
      "name": "food name",
      "confidence": 0.95,
      "portion": 150,
      "category": "food category",
      "cookingMethod": "cooking method",
      "description": "brief description"
    }
  ],
  "cuisineType": "cuisine type",
  "overallDescription": "overall description"
}

Notes:
- Confidence should be a decimal between 0 and 1
- Portion in grams
- If no food detected, respond with {"foods": []}`;
    }
  }

  /**
   * 創建亞洲料理通用模板
   */
  private createAsianCuisineTemplate(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於亞洲料理的食物識別專家。請仔細分析這張圖片。

亞洲料理識別重點：
1. **料理類型判斷**：
   - 如果看到多種食材混合在一起（如海帶、豆干、滷蛋等），這可能是「涼拌小菜」或「滷味拼盤」，而不是單一食材
   - 涼拌小菜特徵：多種食材、切成絲或片、有油光、顏色豐富
   - 滷味拼盤特徵：多種滷製食材、深褐色、有滷汁
   
2. **食材識別**：
   - 注意區分相似食材（如：豆腐干絲 vs 麵條、米粉 vs 粉絲）
   - 識別所有可見的食材，包括配菜和調味料
   - 如果是拼盤或小菜，請列出所有食材，而不是只列出主要食材
   
3. **烹飪方式**：
   - 涼拌、快炒、清蒸、紅燒、滷製等
   - 注意表面特徵（油光、醬色、焦痕等）
   
4. **料理類型**：
   - 中式、台式、日式、韓式等

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食物名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "食材類別",
      "cookingMethod": "烹飪方式",
      "visualFeatures": "視覺特徵描述",
      "description": "詳細描述"
    }
  ],
  "cuisineType": "料理類型",
  "dishType": "菜餚類型",
  "overallDescription": "整體描述"
}

**特別注意**：
- 如果圖片中有多種不同的食材（如海帶、豆干、滷蛋），請識別為「涼拌小菜」或「滷味拼盤」，並列出所有食材
- 不要將拼盤中的某一種食材當作整道菜的名稱（例如：不要只說「豆腐干絲」，而應該說「涼拌小菜（含海帶、豆干、滷蛋等）」）`;
    } else {
      return `You are a food recognition expert specializing in Asian cuisine. Please carefully analyze this image.

Asian Cuisine Recognition Focus:
1. **Dish Type Identification**:
   - If you see multiple ingredients mixed together (e.g., kelp, dried tofu, braised egg), this may be "cold dressed appetizers" or "braised platter", not a single ingredient
   - Cold dressed appetizers features: Multiple ingredients, cut into strips or slices, oil sheen, colorful
   - Braised platter features: Multiple braised ingredients, dark brown, with braising liquid
   
2. **Ingredient Identification**:
   - Distinguish similar ingredients (e.g., tofu strips vs noodles, rice noodles vs glass noodles)
   - Identify all visible ingredients including side dishes and seasonings
   - If it's a platter or appetizers, list all ingredients, not just the main one
   
3. **Cooking Methods**:
   - Cold dressed, stir-fried, steamed, braised, etc.
   - Note surface features (oil sheen, sauce color, char marks, etc.)
   
4. **Cuisine Type**:
   - Chinese, Taiwanese, Japanese, Korean, etc.

Respond in JSON format:
{
  "foods": [
    {
      "name": "food name",
      "confidence": 0.95,
      "portion": 150,
      "category": "food category",
      "cookingMethod": "cooking method",
      "visualFeatures": "visual features description",
      "description": "detailed description"
    }
  ],
  "cuisineType": "cuisine type",
  "dishType": "dish type",
  "overallDescription": "overall description"
}

**Special Notes**:
- If the image contains multiple different ingredients (e.g., kelp, dried tofu, braised egg), identify as "cold dressed appetizers" or "braised platter" and list all ingredients
- Don't name the dish after just one ingredient in the platter (e.g., don't just say "dried tofu strips", but say "cold dressed appetizers (with kelp, dried tofu, braised egg, etc.)")`;
    }
  }

  /**
   * 主要生成方法 - 根據配置生成最適合的 prompt
   */
  generatePrompt(config: PromptGeneratorConfig = {}): string {
    const {
      imageFeatures,
      detectedCuisineType,
      previousAttempts = 0,
      userFeedback = [],
      suspectedFoodCategories = []
    } = config;

    // 根據配置選擇基礎模板
    let baseTemplate = this.selectBaseTemplate(config);

    // 如果是第二次或更多次嘗試，使用增強模板
    if (previousAttempts > 0) {
      baseTemplate = this.templates.get(PromptTemplateType.ASIAN_CUISINE) || baseTemplate;
    }

    // 動態組裝 prompt
    let prompt = baseTemplate;

    // 添加圖片特徵提示
    if (imageFeatures) {
      prompt = this.addImageFeaturesHint(prompt, imageFeatures);
    }

    // 添加料理類型提示
    if (detectedCuisineType) {
      prompt = this.addCuisineTypeHint(prompt, detectedCuisineType);
    }

    // 添加食材類別提示
    if (suspectedFoodCategories.length > 0) {
      prompt = this.addFoodCategoryHints(prompt, suspectedFoodCategories);
    }

    // 添加用戶反饋學習
    if (userFeedback.length > 0) {
      prompt = this.addUserFeedbackLearning(prompt, userFeedback);
    }

    return prompt;
  }

  /**
   * 選擇基礎模板
   */
  private selectBaseTemplate(config: PromptGeneratorConfig): string {
    const { detectedCuisineType, suspectedFoodCategories } = config;

    // 根據料理類型選擇
    if (detectedCuisineType) {
      switch (detectedCuisineType) {
        case CuisineType.TAIWANESE:
          return this.templates.get(PromptTemplateType.TAIWANESE) || 
                 this.templates.get(PromptTemplateType.ASIAN_CUISINE)!;
        case CuisineType.JAPANESE:
          return this.templates.get(PromptTemplateType.JAPANESE) || 
                 this.templates.get(PromptTemplateType.ASIAN_CUISINE)!;
        case CuisineType.KOREAN:
          return this.templates.get(PromptTemplateType.KOREAN) || 
                 this.templates.get(PromptTemplateType.ASIAN_CUISINE)!;
        case CuisineType.CHINESE:
          return this.templates.get(PromptTemplateType.CHINESE) || 
                 this.templates.get(PromptTemplateType.ASIAN_CUISINE)!;
      }
    }

    // 根據食材類別選擇
    if (suspectedFoodCategories && suspectedFoodCategories.length > 0) {
      const category = suspectedFoodCategories[0];
      if (category === FoodCategory.BEAN_PRODUCTS) {
        return this.templates.get(PromptTemplateType.BEAN_PRODUCTS) || 
               this.templates.get(PromptTemplateType.ASIAN_CUISINE)!;
      }
      if (category === FoodCategory.NOODLES) {
        return this.templates.get(PromptTemplateType.NOODLES) || 
               this.templates.get(PromptTemplateType.ASIAN_CUISINE)!;
      }
    }

    // 預設使用亞洲料理模板
    return this.templates.get(PromptTemplateType.ASIAN_CUISINE)!;
  }

  /**
   * 添加圖片特徵提示
   */
  private addImageFeaturesHint(prompt: string, features: ImageFeatures): string {
    const hints: string[] = [];

    if (features.hasMultipleComponents) {
      hints.push(this.language === 'zh-TW' 
        ? '- 這是一道包含多種食材的菜餚，請仔細識別所有可見的食材'
        : '- This is a dish with multiple ingredients, please identify all visible components');
    }

    if (features.plateType) {
      const plateHint = this.language === 'zh-TW'
        ? `- 食物盛裝在${features.plateType}中`
        : `- Food is served in ${features.plateType}`;
      hints.push(plateHint);
    }

    if (hints.length > 0) {
      const hintSection = this.language === 'zh-TW'
        ? `\n\n圖片特徵提示：\n${hints.join('\n')}`
        : `\n\nImage Features Hints:\n${hints.join('\n')}`;
      return prompt + hintSection;
    }

    return prompt;
  }

  /**
   * 添加料理類型提示
   */
  private addCuisineTypeHint(prompt: string, cuisineType: CuisineType): string {
    const hint = this.language === 'zh-TW'
      ? `\n\n料理類型提示：這可能是${cuisineType}料理，請特別注意該料理類型的特徵。`
      : `\n\nCuisine Type Hint: This might be ${cuisineType} cuisine, please pay special attention to its characteristics.`;
    
    return prompt + hint;
  }

  /**
   * 添加食材類別提示
   */
  private addFoodCategoryHints(prompt: string, categories: FoodCategory[]): string {
    const categoryList = categories.join('、');
    const hint = this.language === 'zh-TW'
      ? `\n\n可能的食材類別：${categoryList}\n請特別注意識別這些類別的食材。`
      : `\n\nPossible Food Categories: ${categoryList}\nPlease pay special attention to identifying ingredients in these categories.`;
    
    return prompt + hint;
  }

  /**
   * 添加用戶反饋學習
   */
  private addUserFeedbackLearning(prompt: string, feedback: UserFeedback[]): string {
    const recentFeedback = feedback.slice(-3); // 只使用最近3次反饋
    const corrections: string[] = [];

    for (const fb of recentFeedback) {
      if (fb.incorrectFood && fb.correctFood) {
        corrections.push(
          this.language === 'zh-TW'
            ? `- 注意：${fb.incorrectFood} 容易被誤認，實際應該是 ${fb.correctFood}`
            : `- Note: ${fb.incorrectFood} is often misidentified, it should be ${fb.correctFood}`
        );
      }
    }

    if (corrections.length > 0) {
      const feedbackSection = this.language === 'zh-TW'
        ? `\n\n根據歷史反饋的特別注意事項：\n${corrections.join('\n')}`
        : `\n\nSpecial Notes Based on Historical Feedback:\n${corrections.join('\n')}`;
      return prompt + feedbackSection;
    }

    return prompt;
  }

  /**
   * 創建中式料理 Prompt 模板
   */
  generateChinesePrompt(): string {
    return this.templates.get(PromptTemplateType.CHINESE) || this.createChinesePrompt();
  }

  private createChinesePrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於中式料理的食物識別專家。請仔細分析這張圖片中的中式料理。

中式料理識別重點：
1. **烹飪方式**：注意識別炒、炸、蒸、煮、燉、滷、紅燒等烹飪方式
2. **食材特徵**：
   - 豆製品：豆腐、豆干、豆皮、腐竹等
   - 醬料：醬油、蠔油、豆瓣醬、芝麻醬等
   - 配料：蔥、薑、蒜、八角、花椒等
3. **菜系特色**：
   - 粵菜：清淡、注重食材原味、多用蒸煮
   - 川菜：麻辣、重口味、多用辣椒花椒
   - 湘菜：辣、酸辣、煙燻
   - 魯菜：濃郁、多用醬料
4. **常見菜餚**：宮保雞丁、麻婆豆腐、糖醋排骨、紅燒肉、清蒸魚等

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食物名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "食材類別",
      "cookingMethod": "烹飪方式",
      "visualFeatures": "視覺特徵（顏色、質地、形狀）",
      "description": "詳細描述"
    }
  ],
  "cuisineType": "中式",
  "subCuisineType": "菜系（粵菜/川菜/湘菜等）",
  "dishType": "菜餚類型",
  "seasonings": ["調味料列表"],
  "overallDescription": "整體描述"
}

特別注意：
- 仔細區分相似食材（如豆腐干絲 vs 麵條）
- 識別所有可見的配料和調味料
- 注意菜餚的色澤和烹飪程度`;
    } else {
      return `You are a food recognition expert specializing in Chinese cuisine. Please carefully analyze the Chinese dishes in this image.

Chinese Cuisine Recognition Focus:
1. **Cooking Methods**: Identify stir-frying, deep-frying, steaming, boiling, stewing, braising, red-braising, etc.
2. **Ingredient Features**:
   - Soy products: tofu, dried tofu, tofu skin, bean curd sticks, etc.
   - Sauces: soy sauce, oyster sauce, doubanjiang, sesame paste, etc.
   - Aromatics: scallions, ginger, garlic, star anise, Sichuan pepper, etc.
3. **Regional Styles**:
   - Cantonese: Light, emphasizes natural flavors, often steamed or boiled
   - Sichuan: Spicy and numbing, heavy use of chili and Sichuan pepper
   - Hunan: Spicy, sour-spicy, smoked
   - Shandong: Rich, heavy use of sauces
4. **Common Dishes**: Kung Pao Chicken, Mapo Tofu, Sweet and Sour Pork, Red-Braised Pork, Steamed Fish, etc.

Respond in JSON format:
{
  "foods": [
    {
      "name": "food name",
      "confidence": 0.95,
      "portion": 150,
      "category": "food category",
      "cookingMethod": "cooking method",
      "visualFeatures": "visual features (color, texture, shape)",
      "description": "detailed description"
    }
  ],
  "cuisineType": "Chinese",
  "subCuisineType": "regional style (Cantonese/Sichuan/Hunan, etc.)",
  "dishType": "dish type",
  "seasonings": ["list of seasonings"],
  "overallDescription": "overall description"
}

Special Notes:
- Carefully distinguish similar ingredients (e.g., tofu strips vs noodles)
- Identify all visible garnishes and seasonings
- Note the color and cooking level of dishes`;
    }
  }

  /**
   * 創建台式料理 Prompt 模板
   */
  generateTaiwanesePrompt(): string {
    return this.templates.get(PromptTemplateType.TAIWANESE) || this.createTaiwanesePrompt();
  }

  private createTaiwanesePrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於台式料理的食物識別專家。請仔細分析這張圖片中的台灣料理。

台式料理識別重點：
1. **台灣特色食材**：
   - 豆製品：豆腐干絲、豆干、臭豆腐、豆花
   - 蔬菜：糯米椒、過貓、山蘇、龍鬚菜、空心菜
   - 醬料：沙茶醬、甜辣醬、醬油膏、烏醋
   - 配料：油蔥酥、蒜酥、香菜、九層塔
2. **烹飪方式**：
   - 快炒（熱炒）：大火快炒，常用蒜片、辣椒
   - 滷味：醬油滷製，五香味
   - 涼拌：麻油、醬油、醋調味
   - 羹湯：勾芡濃稠
3. **台式熱炒特徵**：
   - 常見食材：糯米椒、豆干、三層肉、蛤蜊、九層塔
   - 調味：蒜片、辣椒、醬油、米酒
   - 特色：鍋氣重、油亮、香氣濃郁
4. **原住民料理**（如適用）：
   - 特色食材：馬告（山胡椒）、刺蔥、小米、山豬肉
   - 烹飪方式：竹筒飯、石板烤肉、醃漬
5. **常見菜餚**：
   - 三杯雞、蚵仔煎、滷肉飯、蚵仔麵線、臭豆腐
   - 涼拌菜：涼拌干絲、涼拌海蜇皮、涼拌小黃瓜

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食物名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "食材類別",
      "cookingMethod": "烹飪方式",
      "visualFeatures": "視覺特徵（顏色、質地、形狀）",
      "isTaiwaneseSpecialty": true,
      "description": "詳細描述"
    }
  ],
  "cuisineType": "台式",
  "dishType": "菜餚類型（熱炒/滷味/涼拌/小吃等）",
  "isIndigenousFood": false,
  "seasonings": ["調味料列表"],
  "overallDescription": "整體描述"
}

特別注意：
- 仔細區分豆腐干絲和麵條（干絲較粗、有韌性、顏色偏黃）
- 識別糯米椒（細長、有皺褶）vs 青椒（較大、光滑）
- 注意台式熱炒的蒜片和辣椒
- 如果有原住民特色食材（馬告、刺蔥等），請特別標註`;
    } else {
      return `You are a food recognition expert specializing in Taiwanese cuisine. Please carefully analyze the Taiwanese dishes in this image.

Taiwanese Cuisine Recognition Focus:
1. **Taiwanese Specialty Ingredients**:
   - Soy products: dried tofu strips, dried tofu, stinky tofu, tofu pudding
   - Vegetables: shishito peppers, guomao fern, mountain lettuce, loofah, water spinach
   - Sauces: shacha sauce, sweet chili sauce, soy sauce paste, black vinegar
   - Toppings: fried shallots, fried garlic, cilantro, basil
2. **Cooking Methods**:
   - Stir-frying (re chao): high heat quick fry, often with garlic and chili
   - Braising (lu wei): soy sauce braised, five-spice flavor
   - Cold dressed: sesame oil, soy sauce, vinegar seasoning
   - Thick soup: thickened with starch
3. **Taiwanese Stir-Fry Characteristics**:
   - Common ingredients: shishito peppers, dried tofu, pork belly, clams, basil
   - Seasonings: garlic slices, chili, soy sauce, rice wine
   - Features: wok hei, glossy, aromatic
4. **Indigenous Cuisine** (if applicable):
   - Specialty ingredients: maqaw (mountain pepper), prickly ash, millet, wild boar
   - Cooking methods: bamboo tube rice, stone-grilled meat, pickling
5. **Common Dishes**:
   - Three-cup chicken, oyster omelet, braised pork rice, oyster vermicelli, stinky tofu
   - Cold dishes: cold dressed tofu strips, cold dressed jellyfish, cold dressed cucumber

Respond in JSON format:
{
  "foods": [
    {
      "name": "food name",
      "confidence": 0.95,
      "portion": 150,
      "category": "food category",
      "cookingMethod": "cooking method",
      "visualFeatures": "visual features (color, texture, shape)",
      "isTaiwaneseSpecialty": true,
      "description": "detailed description"
    }
  ],
  "cuisineType": "Taiwanese",
  "dishType": "dish type (stir-fry/braised/cold dressed/snack, etc.)",
  "isIndigenousFood": false,
  "seasonings": ["list of seasonings"],
  "overallDescription": "overall description"
}

Special Notes:
- Carefully distinguish dried tofu strips from noodles (strips are thicker, chewier, yellowish)
- Identify shishito peppers (thin, wrinkled) vs bell peppers (larger, smooth)
- Note garlic slices and chili in Taiwanese stir-fries
- If indigenous ingredients (maqaw, prickly ash, etc.) are present, please mark specifically`;
    }
  }

  /**
   * 創建日式料理 Prompt 模板
   */
  generateJapanesePrompt(): string {
    return this.templates.get(PromptTemplateType.JAPANESE) || this.createJapanesePrompt();
  }

  private createJapanesePrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於日式料理的食物識別專家。請仔細分析這張圖片中的日本料理。

日式料理識別重點：
1. **日式特色食材**：
   - 海鮮：生魚片、壽司、鰻魚、章魚、蝦
   - 豆製品：豆腐、納豆、味噌、豆皮壽司
   - 醃漬物：醃蘿蔔、梅干、醃薑
   - 麵類：拉麵、烏龍麵、蕎麥麵、素麵
2. **烹飪方式**：
   - 生食：刺身、壽司
   - 燒烤：照燒、串燒、鐵板燒
   - 油炸：天婦羅、炸豬排、可樂餅
   - 燉煮：關東煮、壽喜燒、涮涮鍋
   - 蒸煮：茶碗蒸、清蒸
3. **日式定食特徵**：
   - 主菜：魚類、肉類或炸物
   - 配菜：米飯、味噌湯、醃漬物、小菜
   - 擺盤：精緻、分隔、注重視覺美感
4. **調味料**：
   - 醬油、味醂、清酒、味噌
   - 柚子醋、山葵、芝麻醬
   - 七味粉、海苔、柴魚片
5. **常見菜餚**：
   - 壽司、刺身、拉麵、天婦羅、照燒雞
   - 豬排飯、親子丼、牛丼、鰻魚飯

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食物名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "食材類別",
      "cookingMethod": "烹飪方式",
      "visualFeatures": "視覺特徵（顏色、質地、形狀）",
      "isRaw": false,
      "description": "詳細描述"
    }
  ],
  "cuisineType": "日式",
  "dishType": "菜餚類型（定食/拉麵/壽司/丼飯等）",
  "mealComponents": {
    "mainDish": "主菜",
    "rice": "米飯",
    "soup": "湯品",
    "pickles": "醃漬物",
    "sideDishes": ["配菜列表"]
  },
  "seasonings": ["調味料列表"],
  "overallDescription": "整體描述"
}

特別注意：
- 識別是否為生食（刺身、壽司）
- 注意日式定食的完整性（飯、湯、主菜、配菜）
- 識別醃漬物和小菜
- 注意擺盤方式和器皿類型`;
    } else {
      return `You are a food recognition expert specializing in Japanese cuisine. Please carefully analyze the Japanese dishes in this image.

Japanese Cuisine Recognition Focus:
1. **Japanese Specialty Ingredients**:
   - Seafood: sashimi, sushi, eel, octopus, shrimp
   - Soy products: tofu, natto, miso, inari sushi
   - Pickles: pickled radish, umeboshi, pickled ginger
   - Noodles: ramen, udon, soba, somen
2. **Cooking Methods**:
   - Raw: sashimi, sushi
   - Grilling: teriyaki, yakitori, teppanyaki
   - Deep-frying: tempura, tonkatsu, korokke
   - Simmering: oden, sukiyaki, shabu-shabu
   - Steaming: chawanmushi, steamed dishes
3. **Japanese Set Meal Characteristics**:
   - Main dish: fish, meat, or fried items
   - Sides: rice, miso soup, pickles, small dishes
   - Presentation: refined, separated, visually appealing
4. **Seasonings**:
   - Soy sauce, mirin, sake, miso
   - Ponzu, wasabi, sesame sauce
   - Shichimi, nori, bonito flakes
5. **Common Dishes**:
   - Sushi, sashimi, ramen, tempura, teriyaki chicken
   - Tonkatsu, oyakodon, gyudon, unagi don

Respond in JSON format:
{
  "foods": [
    {
      "name": "food name",
      "confidence": 0.95,
      "portion": 150,
      "category": "food category",
      "cookingMethod": "cooking method",
      "visualFeatures": "visual features (color, texture, shape)",
      "isRaw": false,
      "description": "detailed description"
    }
  ],
  "cuisineType": "Japanese",
  "dishType": "dish type (set meal/ramen/sushi/donburi, etc.)",
  "mealComponents": {
    "mainDish": "main dish",
    "rice": "rice",
    "soup": "soup",
    "pickles": "pickles",
    "sideDishes": ["list of side dishes"]
  },
  "seasonings": ["list of seasonings"],
  "overallDescription": "overall description"
}

Special Notes:
- Identify if raw food (sashimi, sushi)
- Note completeness of Japanese set meal (rice, soup, main dish, sides)
- Identify pickles and small dishes
- Note presentation style and dishware type`;
    }
  }

  /**
   * 創建韓式料理 Prompt 模板
   */
  generateKoreanPrompt(): string {
    return this.templates.get(PromptTemplateType.KOREAN) || this.createKoreanPrompt();
  }

  private createKoreanPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於韓式料理的食物識別專家。請仔細分析這張圖片中的韓國料理。

韓式料理識別重點：
1. **韓式特色食材**：
   - 泡菜：白菜泡菜、蘿蔔泡菜、黃瓜泡菜
   - 醬料：辣椒醬（苦椒醬）、大醬、包飯醬
   - 配菜（小菜）：豆芽、菠菜、蘿蔔、海帶
   - 肉類：五花肉、牛肉、雞肉
2. **烹飪方式**：
   - 燒烤：韓式烤肉、烤五花肉
   - 燉煮：部隊鍋、泡菜鍋、豆腐鍋
   - 拌飯：石鍋拌飯、拌飯
   - 煎餅：海鮮煎餅、泡菜煎餅
   - 湯品：參雞湯、牛骨湯、豆腐湯
3. **韓式定食特徵**：
   - 主菜：烤肉、鍋類、湯品
   - 配菜：多種小菜（通常3-10種）
   - 米飯：白飯或雜糧飯
   - 湯品：湯或鍋
4. **調味特色**：
   - 辣：辣椒粉、辣椒醬
   - 發酵：泡菜、大醬、醬油
   - 芝麻：芝麻油、芝麻
   - 蒜：大量使用蒜
5. **常見菜餚**：
   - 石鍋拌飯、韓式烤肉、泡菜鍋、部隊鍋
   - 炸雞、冷麵、參雞湯、海鮮煎餅

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食物名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "食材類別",
      "cookingMethod": "烹飪方式",
      "visualFeatures": "視覺特徵（顏色、質地、形狀）",
      "spicyLevel": "辣度（不辣/微辣/中辣/大辣）",
      "description": "詳細描述"
    }
  ],
  "cuisineType": "韓式",
  "dishType": "菜餚類型（烤肉/鍋類/拌飯/湯品等）",
  "sideDishes": ["小菜列表"],
  "hasFermentedFood": true,
  "seasonings": ["調味料列表"],
  "overallDescription": "整體描述"
}

特別注意：
- 識別各種泡菜和小菜
- 注意辣椒醬的紅色
- 韓式料理通常有多種小菜
- 注意石鍋、陶鍋等特殊器皿`;
    } else {
      return `You are a food recognition expert specializing in Korean cuisine. Please carefully analyze the Korean dishes in this image.

Korean Cuisine Recognition Focus:
1. **Korean Specialty Ingredients**:
   - Kimchi: napa cabbage kimchi, radish kimchi, cucumber kimchi
   - Sauces: gochujang (red chili paste), doenjang, ssamjang
   - Side dishes (banchan): bean sprouts, spinach, radish, seaweed
   - Meat: pork belly, beef, chicken
2. **Cooking Methods**:
   - Grilling: Korean BBQ, grilled pork belly
   - Stewing: budae jjigae, kimchi jjigae, tofu jjigae
   - Mixed rice: dolsot bibimbap, bibimbap
   - Pancakes: seafood pancake, kimchi pancake
   - Soups: samgyetang, seolleongtang, tofu soup
3. **Korean Set Meal Characteristics**:
   - Main dish: grilled meat, stew, soup
   - Side dishes: multiple banchan (usually 3-10 types)
   - Rice: white rice or mixed grain rice
   - Soup: soup or stew
4. **Seasoning Characteristics**:
   - Spicy: chili powder, gochujang
   - Fermented: kimchi, doenjang, soy sauce
   - Sesame: sesame oil, sesame seeds
   - Garlic: heavy use of garlic
5. **Common Dishes**:
   - Bibimbap, Korean BBQ, kimchi jjigae, budae jjigae
   - Fried chicken, naengmyeon, samgyetang, seafood pancake

Respond in JSON format:
{
  "foods": [
    {
      "name": "food name",
      "confidence": 0.95,
      "portion": 150,
      "category": "food category",
      "cookingMethod": "cooking method",
      "visualFeatures": "visual features (color, texture, shape)",
      "spicyLevel": "spicy level (not spicy/mild/medium/very spicy)",
      "description": "detailed description"
    }
  ],
  "cuisineType": "Korean",
  "dishType": "dish type (BBQ/stew/bibimbap/soup, etc.)",
  "sideDishes": ["list of side dishes"],
  "hasFermentedFood": true,
  "seasonings": ["list of seasonings"],
  "overallDescription": "overall description"
}

Special Notes:
- Identify various kimchi and side dishes
- Note the red color of gochujang
- Korean meals usually have multiple side dishes
- Note special vessels like stone pots, earthenware pots`;
    }
  }

  /**
   * 註冊自定義模板
   */
  registerTemplate(type: PromptTemplateType, template: string): void {
    this.templates.set(type, template);
  }

  /**
   * 獲取模板
   */
  getTemplate(type: PromptTemplateType): string | undefined {
    return this.templates.get(type);
  }

  /**
   * 獲取所有可用的模板類型
   */
  getAvailableTemplateTypes(): PromptTemplateType[] {
    return Array.from(this.templates.keys());
  }

  /**
   * 創建豆製品識別 Prompt
   */
  generateBeanProductPrompt(): string {
    return this.templates.get(PromptTemplateType.BEAN_PRODUCTS) || this.createBeanProductPrompt();
  }

  private createBeanProductPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於豆製品識別的食物專家。請仔細分析這張圖片中的豆製品。

豆製品識別重點：
1. **豆腐干絲 vs 麵條**：
   - 豆腐干絲：
     * 顏色：淡黃色、米白色、淺棕色
     * 質地：有韌性、略粗糙、不透明、有嚼勁
     * 形狀：細長條狀，寬約2-3mm，厚約1-2mm
     * 表面：有豆製品特有的紋理，不光滑
     * 切面：方形或長方形，不是圓形
     * 常見搭配：芹菜絲、胡蘿蔔絲、涼拌
   - 麵條：
     * 顏色：白色或淡黃色，較均勻
     * 質地：光滑、有彈性、可能有光澤
     * 形狀：圓形或扁平，較細
     * 表面：光滑，可能有麵粉質感
     * 切面：圓形或橢圓形

2. **其他豆製品**：
   - 豆腐：白色、軟嫩、方塊狀
   - 豆干：褐色、堅實、方塊狀
   - 豆皮：薄片狀、淡黃色
   - 腐竹：棒狀、淡黃色、乾燥
   - 臭豆腐：深色、多孔、發酵味
   - 豆花：白色、極軟、湯狀

3. **視覺特徵檢查清單**：
   - 顏色深淺和均勻度
   - 表面質地（光滑 vs 粗糙）
   - 形狀和粗細
   - 切面形狀
   - 光澤度
   - 與其他食材的搭配

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "豆製品名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "豆製品",
      "visualFeatures": {
        "color": "顏色描述",
        "texture": "質地描述",
        "shape": "形狀描述",
        "surface": "表面特徵",
        "crossSection": "切面形狀"
      },
      "distinguishingFeatures": ["區分特徵列表"],
      "notConfusedWith": ["不是什麼"],
      "description": "詳細描述"
    }
  ],
  "confusionWarning": "如果有易混淆的情況，請說明",
  "overallDescription": "整體描述"
}

特別注意：
- 仔細觀察表面質地和光澤
- 注意切面形狀（方形 vs 圓形）
- 檢查顏色的細微差異
- 考慮烹飪方式和搭配食材`;
    } else {
      return `You are a food expert specializing in soy product identification. Please carefully analyze the soy products in this image.

Soy Product Recognition Focus:
1. **Dried Tofu Strips vs Noodles**:
   - Dried Tofu Strips:
     * Color: Light yellow, off-white, light brown
     * Texture: Chewy, slightly rough, opaque, firm
     * Shape: Thin strips, width 2-3mm, thickness 1-2mm
     * Surface: Has soy product texture, not smooth
     * Cross-section: Square or rectangular, not round
     * Common pairings: Celery strips, carrot strips, cold dressed
   - Noodles:
     * Color: White or light yellow, more uniform
     * Texture: Smooth, elastic, may have sheen
     * Shape: Round or flat, thinner
     * Surface: Smooth, may have flour texture
     * Cross-section: Round or oval

2. **Other Soy Products**:
   - Tofu: White, soft, cube-shaped
   - Dried tofu: Brown, firm, cube-shaped
   - Tofu skin: Thin sheets, light yellow
   - Bean curd sticks: Rod-shaped, light yellow, dried
   - Stinky tofu: Dark, porous, fermented
   - Tofu pudding: White, very soft, soupy

3. **Visual Feature Checklist**:
   - Color depth and uniformity
   - Surface texture (smooth vs rough)
   - Shape and thickness
   - Cross-section shape
   - Glossiness
   - Pairing with other ingredients

Respond in JSON format:
{
  "foods": [
    {
      "name": "soy product name",
      "confidence": 0.95,
      "portion": 150,
      "category": "soy products",
      "visualFeatures": {
        "color": "color description",
        "texture": "texture description",
        "shape": "shape description",
        "surface": "surface characteristics",
        "crossSection": "cross-section shape"
      },
      "distinguishingFeatures": ["list of distinguishing features"],
      "notConfusedWith": ["what it's not"],
      "description": "detailed description"
    }
  ],
  "confusionWarning": "if there's potential confusion, explain",
  "overallDescription": "overall description"
}

Special Notes:
- Carefully observe surface texture and sheen
- Note cross-section shape (square vs round)
- Check subtle color differences
- Consider cooking method and paired ingredients`;
    }
  }

  /**
   * 創建麵食類識別 Prompt
   */
  generateNoodleTypePrompt(): string {
    return this.templates.get(PromptTemplateType.NOODLES) || this.createNoodleTypePrompt();
  }

  private createNoodleTypePrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於麵食類識別的食物專家。請仔細分析這張圖片中的麵食。

麵食類識別重點：
1. **米粉 vs 粉絲 vs 麵條**：
   - 米粉：
     * 顏色：純白色、半透明白
     * 質地：柔軟、易斷、光滑
     * 粗細：直徑0.5-2mm
     * 特徵：有米的香味、泡水後變軟
     * 常見料理：炒米粉、湯米粉
   - 粉絲（冬粉）：
     * 顏色：透明、半透明、灰白色
     * 質地：滑溜、透明、有彈性
     * 粗細：極細，直徑0.3-0.8mm
     * 特徵：煮熟後呈透明狀
     * 常見料理：湯品、涼拌
   - 麵條：
     * 顏色：白色或淡黃色
     * 質地：有彈性、光滑、有嚼勁
     * 粗細：多種粗細
     * 特徵：有麵粉香味、有筋性
     * 常見料理：炒麵、湯麵、拌麵

2. **其他麵食類型**：
   - 烏龍麵：粗、白色、Q彈
   - 拉麵：中等粗細、黃色、有彈性
   - 蕎麥麵：褐色、細、有蕎麥香
   - 河粉：寬扁、白色、滑嫩
   - 米線：細圓、白色、柔軟
   - 刀削麵：不規則、厚薄不一
   - 麵線：極細、白色、易斷

3. **視覺特徵檢查**：
   - 透明度（透明/半透明/不透明）
   - 粗細和形狀
   - 顏色和光澤
   - 質地（軟/硬/彈/滑）
   - 烹飪狀態（生/熟）

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "麵食名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "麵食",
      "noodleType": "麵食類型",
      "visualFeatures": {
        "color": "顏色",
        "transparency": "透明度",
        "thickness": "粗細",
        "texture": "質地",
        "shape": "形狀"
      },
      "distinguishingFeatures": ["區分特徵"],
      "description": "詳細描述"
    }
  ],
  "overallDescription": "整體描述"
}

特別注意：
- 透明度是區分粉絲的關鍵
- 米粉比麵條更白、更易斷
- 注意麵條的粗細和形狀
- 考慮烹飪方式（炒/湯/拌）`;
    } else {
      return `You are a food expert specializing in noodle identification. Please carefully analyze the noodles in this image.

Noodle Recognition Focus:
1. **Rice Noodles vs Glass Noodles vs Wheat Noodles**:
   - Rice Noodles:
     * Color: Pure white, translucent white
     * Texture: Soft, brittle, smooth
     * Thickness: Diameter 0.5-2mm
     * Features: Rice aroma, softens in water
     * Common dishes: Fried rice noodles, rice noodle soup
   - Glass Noodles (Cellophane Noodles):
     * Color: Transparent, semi-transparent, grayish-white
     * Texture: Slippery, transparent, elastic
     * Thickness: Very thin, diameter 0.3-0.8mm
     * Features: Becomes transparent when cooked
     * Common dishes: Soups, cold dressed
   - Wheat Noodles:
     * Color: White or light yellow
     * Texture: Elastic, smooth, chewy
     * Thickness: Various thicknesses
     * Features: Wheat aroma, has gluten
     * Common dishes: Fried noodles, noodle soup, mixed noodles

2. **Other Noodle Types**:
   - Udon: Thick, white, chewy
   - Ramen: Medium thickness, yellow, elastic
   - Soba: Brown, thin, buckwheat aroma
   - Rice sheets: Wide flat, white, smooth
   - Rice vermicelli: Thin round, white, soft
   - Knife-cut noodles: Irregular, varying thickness
   - Misua: Very thin, white, brittle

3. **Visual Feature Checklist**:
   - Transparency (transparent/semi-transparent/opaque)
   - Thickness and shape
   - Color and sheen
   - Texture (soft/hard/elastic/slippery)
   - Cooking state (raw/cooked)

Respond in JSON format:
{
  "foods": [
    {
      "name": "noodle name",
      "confidence": 0.95,
      "portion": 150,
      "category": "noodles",
      "noodleType": "noodle type",
      "visualFeatures": {
        "color": "color",
        "transparency": "transparency",
        "thickness": "thickness",
        "texture": "texture",
        "shape": "shape"
      },
      "distinguishingFeatures": ["distinguishing features"],
      "description": "detailed description"
    }
  ],
  "overallDescription": "overall description"
}

Special Notes:
- Transparency is key to identifying glass noodles
- Rice noodles are whiter and more brittle than wheat noodles
- Note noodle thickness and shape
- Consider cooking method (fried/soup/mixed)`;
    }
  }

  /**
   * 創建蔬菜類識別 Prompt
   */
  generateVegetablePrompt(): string {
    return this.templates.get(PromptTemplateType.VEGETABLES) || this.createVegetablePrompt();
  }

  private createVegetablePrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於蔬菜識別的食物專家。請仔細分析這張圖片中的蔬菜。

蔬菜識別重點：
1. **玉米筍 vs 筍子**：
   - 玉米筍（珍珠筍）：
     * 顏色：淡黃色、黃白色、奶白色
     * 形狀：細長圓柱形、筆直、粗細均勻
     * 大小：長5-8cm，直徑0.8-1.5cm
     * 特徵：頂端有細小玉米鬚、整根可食用
     * 常見料理：炒菜、火鍋
   - 筍子（竹筍）：
     * 顏色：淡黃色到褐色
     * 形狀：圓錐形、底部粗上部細
     * 大小：較大，長度和粗細變化大
     * 特徵：有筍殼、纖維明顯
     * 常見料理：炒筍、滷筍、筍湯

2. **糯米椒 vs 青椒**：
   - 糯米椒（甜椒仔）：
     * 顏色：綠色、深綠色
     * 形狀：細長形、略彎曲
     * 大小：長8-12cm，直徑1.5-2cm
     * 特徵：表面有明顯皺褶、薄皮、通常整根烹調
     * 辣度：微辣或不辣
     * 常見料理：台式熱炒
   - 青椒（甜椒）：
     * 顏色：綠色、深綠色
     * 形狀：方形、圓形、燈籠狀
     * 大小：長8-12cm，寬6-10cm
     * 特徵：表面光滑有光澤、肉厚、有空腔
     * 辣度：不辣
     * 常見料理：切塊或切絲炒

3. **台灣特色蔬菜**：
   - 過貓：深綠色、捲曲狀、羽狀、嫩滑
   - 山蘇：深綠色、長條狀、脆嫩
   - 龍鬚菜：綠色、細長、捲鬚
   - 空心菜：綠色、中空莖、葉片尖
   - 地瓜葉：心形葉、綠色或紫色

4. **視覺特徵檢查**：
   - 形狀（圓/長/扁/捲）
   - 表面（光滑/皺褶/有毛）
   - 顏色深淺
   - 大小和比例
   - 切面特徵

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "蔬菜名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "蔬菜",
      "subcategory": "蔬菜子類別",
      "visualFeatures": {
        "color": "顏色",
        "shape": "形狀",
        "surface": "表面特徵",
        "size": "大小"
      },
      "distinguishingFeatures": ["區分特徵"],
      "isTaiwaneseSpecialty": false,
      "description": "詳細描述"
    }
  ],
  "overallDescription": "整體描述"
}

特別注意：
- 玉米筍頂端有玉米鬚
- 糯米椒表面有皺褶，青椒光滑
- 台灣特色蔬菜（過貓、山蘇等）要特別標註
- 注意蔬菜的烹飪狀態（生/熟）`;
    } else {
      return `You are a food expert specializing in vegetable identification. Please carefully analyze the vegetables in this image.

Vegetable Recognition Focus:
1. **Baby Corn vs Bamboo Shoots**:
   - Baby Corn:
     * Color: Light yellow, yellowish-white, creamy white
     * Shape: Thin cylindrical, straight, uniform thickness
     * Size: Length 5-8cm, diameter 0.8-1.5cm
     * Features: Has corn silk at top, entirely edible
     * Common dishes: Stir-fry, hot pot
   - Bamboo Shoots:
     * Color: Light yellow to brown
     * Shape: Conical, thick at bottom, thin at top
     * Size: Larger, varying length and thickness
     * Features: Has bamboo husk, obvious fibers
     * Common dishes: Stir-fried shoots, braised shoots, shoot soup

2. **Shishito Peppers vs Bell Peppers**:
   - Shishito Peppers:
     * Color: Green, dark green
     * Shape: Elongated, slightly curved
     * Size: Length 8-12cm, diameter 1.5-2cm
     * Features: Obvious wrinkles on surface, thin skin, usually cooked whole
     * Spiciness: Mild or not spicy
     * Common dishes: Taiwanese stir-fry
   - Bell Peppers:
     * Color: Green, dark green
     * Shape: Square, round, bell-shaped
     * Size: Length 8-12cm, width 6-10cm
     * Features: Smooth glossy surface, thick flesh, has cavity
     * Spiciness: Not spicy
     * Common dishes: Cut into pieces or strips for stir-fry

3. **Taiwanese Specialty Vegetables**:
   - Guomao fern: Dark green, curled, feathery, tender
   - Mountain lettuce: Dark green, long strips, crisp
   - Dragon whisker vegetable: Green, thin long, tendrils
   - Water spinach: Green, hollow stem, pointed leaves
   - Sweet potato leaves: Heart-shaped leaves, green or purple

4. **Visual Feature Checklist**:
   - Shape (round/long/flat/curled)
   - Surface (smooth/wrinkled/hairy)
   - Color depth
   - Size and proportion
   - Cross-section features

Respond in JSON format:
{
  "foods": [
    {
      "name": "vegetable name",
      "confidence": 0.95,
      "portion": 150,
      "category": "vegetables",
      "subcategory": "vegetable subcategory",
      "visualFeatures": {
        "color": "color",
        "shape": "shape",
        "surface": "surface characteristics",
        "size": "size"
      },
      "distinguishingFeatures": ["distinguishing features"],
      "isTaiwaneseSpecialty": false,
      "description": "detailed description"
    }
  ],
  "overallDescription": "overall description"
}

Special Notes:
- Baby corn has corn silk at the top
- Shishito peppers have wrinkles, bell peppers are smooth
- Taiwanese specialty vegetables (guomao, mountain lettuce, etc.) should be specially marked
- Note cooking state of vegetables (raw/cooked)`;
    }
  }

  /**
   * 創建海鮮類識別 Prompt
   */
  generateSeafoodPrompt(): string {
    return this.templates.get(PromptTemplateType.SEAFOOD) || this.createSeafoodPrompt();
  }

  private createSeafoodPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於海鮮識別的食物專家。請仔細分析這張圖片中的海鮮。

海鮮識別重點：
1. **魚類**：
   - 注意魚的種類（鮭魚、鯛魚、鱸魚等）
   - 烹飪方式（生魚片、清蒸、煎、烤）
   - 部位（魚片、魚排、全魚）

2. **貝類**：
   - 蛤蜊、蚵仔、扇貝、鮑魚
   - 注意殼的特徵
   - 烹飪狀態（生/熟）

3. **甲殼類**：
   - 蝦、蟹、龍蝦
   - 注意大小和種類
   - 烹飪方式

4. **軟體類**：
   - 章魚、魷魚、花枝
   - 注意切法和烹飪方式

請以 JSON 格式回應，包含海鮮種類、新鮮度、烹飪方式等資訊。`;
    } else {
      return `You are a food expert specializing in seafood identification. Please carefully analyze the seafood in this image.

Seafood Recognition Focus:
1. **Fish**: Note species, cooking method, and cut
2. **Shellfish**: Clams, oysters, scallops, abalone
3. **Crustaceans**: Shrimp, crab, lobster
4. **Cephalopods**: Octopus, squid, cuttlefish

Respond in JSON format with seafood type, freshness, cooking method, etc.`;
    }
  }

  /**
   * 創建原住民食材 Prompt
   */
  generateIndigenousFoodPrompt(): string {
    return this.templates.get(PromptTemplateType.INDIGENOUS) || this.createIndigenousFoodPrompt();
  }

  private createIndigenousFoodPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於台灣原住民料理的食物專家。請仔細分析這張圖片中的原住民食材和料理。

台灣原住民料理識別重點：
1. **特色香料**：
   - 馬告（山胡椒）：黑色小顆粒、有檸檬香氣
   - 刺蔥：綠色、有刺、特殊香氣
   - 山胡椒葉：綠色葉片、香氣濃郁

2. **特色食材**：
   - 小米：小顆粒、黃色、常做成小米飯或小米酒
   - 山豬肉：深紅色、肉質結實
   - 野菜：過貓、山蘇、龍葵、昭和草
   - 芋頭：紫色或白色、塊莖

3. **傳統烹飪方式**：
   - 竹筒飯：竹筒盛裝、米飯混合食材
   - 石板烤肉：使用石板烤製
   - 醃漬：醃肉、醃魚
   - 阿拜（Abai）：假酸漿葉包裹的糯米糕

4. **常見料理**：
   - 馬告烤肉、刺蔥煎蛋、小米飯
   - 竹筒飯、石板烤肉、醃豬肉
   - 野菜料理

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食材名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 150,
      "category": "原住民食材",
      "indigenousOrigin": "族群來源（如：泰雅族、阿美族等）",
      "visualFeatures": "視覺特徵",
      "culturalSignificance": "文化意義",
      "description": "詳細描述"
    }
  ],
  "cuisineType": "原住民料理",
  "cookingMethod": "烹飪方式",
  "traditionalContext": "傳統背景",
  "overallDescription": "整體描述"
}

特別注意：
- 馬告有獨特的檸檬香氣
- 竹筒飯的竹筒特徵
- 石板烤肉的石板痕跡
- 野菜的特殊外觀`;
    } else {
      return `You are a food expert specializing in Taiwanese indigenous cuisine. Please carefully analyze the indigenous ingredients and dishes in this image.

Taiwanese Indigenous Cuisine Recognition Focus:
1. **Specialty Spices**:
   - Maqaw (mountain pepper): Black small particles, lemon aroma
   - Prickly ash: Green, thorny, special aroma
   - Mountain pepper leaves: Green leaves, strong aroma

2. **Specialty Ingredients**:
   - Millet: Small grains, yellow, often made into millet rice or wine
   - Wild boar: Dark red, firm texture
   - Wild vegetables: Guomao fern, mountain lettuce, nightshade
   - Taro: Purple or white, tuber

3. **Traditional Cooking Methods**:
   - Bamboo tube rice: Rice in bamboo tube
   - Stone-grilled meat: Grilled on stone slab
   - Pickling: Pickled meat, pickled fish
   - Abai: Glutinous rice cake wrapped in leaves

4. **Common Dishes**:
   - Maqaw grilled meat, prickly ash omelet, millet rice
   - Bamboo tube rice, stone-grilled meat, pickled pork
   - Wild vegetable dishes

Respond in JSON format with indigenous origin, cultural significance, etc.`;
    }
  }

  /**
   * 創建涼拌菜 Prompt
   */
  generateColdDishPrompt(): string {
    return this.templates.get(PromptTemplateType.COLD_DISH) || this.createColdDishPrompt();
  }

  private createColdDishPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於涼拌菜識別的食物專家。請仔細分析這張圖片中的涼拌菜。

涼拌菜識別重點：
1. **涼拌菜特徵**：
   - 食材切成絲狀或片狀
   - 顏色豐富多彩（多種食材混合）
   - 表面可見油光（麻油）
   - 食材混合均勻
   - 通常裝在盤子中
   - 常溫或冷藏狀態

2. **常見涼拌菜食材**：
   - 主食材：
     * 豆腐干絲（最常見）
     * 海蜇皮
     * 木耳
     * 黃瓜
     * 海帶
   - 配菜：
     * 芹菜絲
     * 胡蘿蔔絲
     * 香菜
     * 蔥絲
     * 辣椒絲
   - 調味料：
     * 麻油（芝麻油）
     * 醬油
     * 醋
     * 糖
     * 蒜末
     * 薑絲

3. **識別要點**：
   - **必須識別所有可見的食材**（至少3種以上）
   - 注意區分相似食材：
     * 豆腐干絲 vs 麵條（干絲較粗、有韌性、顏色偏黃）
     * 芹菜絲 vs 蔥絲（芹菜較粗、綠色較深）
     * 胡蘿蔔絲 vs 紅椒絲（胡蘿蔔橙色、紅椒鮮紅）
   - 識別調味料的痕跡（油光、醬色）
   - 注意食材的切法（絲/片/塊）

4. **涼拌菜完整性檢查**：
   - 主食材：至少1種
   - 配菜：至少2-3種
   - 調味料：至少識別出麻油或醬油

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食材名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 50,
      "category": "食材類別",
      "role": "主食材/配菜/調味料",
      "cuttingStyle": "切法（絲/片/塊）",
      "visualFeatures": "視覺特徵",
      "description": "描述"
    }
  ],
  "dishType": "涼拌菜",
  "cookingMethod": "涼拌",
  "totalIngredients": 5,
  "seasonings": ["調味料列表"],
  "completenessCheck": {
    "hasMainIngredient": true,
    "hasVegetables": true,
    "hasSeasonings": true
  },
  "overallDescription": "整體描述"
}

特別注意：
- 涼拌菜通常有多種食材，請仔細識別每一種
- 豆腐干絲是最常見的主食材，注意區分
- 不要遺漏細小的配菜（如香菜、蔥絲）
- 注意表面的油光（麻油）
- 如果只識別到1-2種食材，可能有遺漏，請再仔細觀察`;
    } else {
      return `You are a food expert specializing in cold dressed dish identification. Please carefully analyze the cold dressed dishes in this image.

Cold Dressed Dish Recognition Focus:
1. **Cold Dressed Dish Characteristics**:
   - Ingredients cut into strips or slices
   - Colorful (multiple ingredients mixed)
   - Visible oil sheen (sesame oil)
   - Ingredients evenly mixed
   - Usually served on a plate
   - Room temperature or chilled

2. **Common Cold Dressed Ingredients**:
   - Main ingredients: Dried tofu strips, jellyfish, wood ear mushroom, cucumber, kelp
   - Vegetables: Celery strips, carrot strips, cilantro, scallion strips, chili strips
   - Seasonings: Sesame oil, soy sauce, vinegar, sugar, minced garlic, ginger strips

3. **Identification Points**:
   - **Must identify all visible ingredients** (at least 3 or more)
   - Distinguish similar ingredients
   - Identify seasoning traces
   - Note cutting style

4. **Completeness Check**:
   - Main ingredient: At least 1
   - Vegetables: At least 2-3
   - Seasonings: At least sesame oil or soy sauce

Respond in JSON format with all ingredients, roles, cutting styles, and completeness check.

Special Notes:
- Cold dressed dishes usually have multiple ingredients, identify each carefully
- Dried tofu strips are the most common main ingredient
- Don't miss small garnishes (cilantro, scallion strips)
- Note the oil sheen on surface
- If only 1-2 ingredients identified, there may be omissions`;
    }
  }

  /**
   * 創建熱炒 Prompt
   */
  generateStirFryPrompt(): string {
    return this.templates.get(PromptTemplateType.STIR_FRY) || this.createStirFryPrompt();
  }

  private createStirFryPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於台式熱炒識別的食物專家。請仔細分析這張圖片中的熱炒料理。

台式熱炒識別重點：
1. **台式熱炒特徵**：
   - 大火快炒，有鍋氣
   - 油亮有光澤
   - 食材略帶焦香
   - 通常有蒜片和辣椒
   - 醬汁濃郁
   - 香氣四溢

2. **常見熱炒食材**：
   - 蔬菜類：
     * 糯米椒（細長、有皺褶）
     * 空心菜
     * 高麗菜
     * 四季豆
     * 豆芽菜
   - 蛋白質：
     * 豆干
     * 三層肉
     * 雞肉
     * 海鮮（蛤蜊、蝦、花枝）
   - 配料：
     * 蒜片（必備）
     * 辣椒（常見）
     * 九層塔
     * 薑片
     * 蔥段

3. **調味料**：
   - 醬油
   - 米酒
   - 沙茶醬
   - 蠔油
   - 鹽
   - 糖

4. **常見台式熱炒菜餚**：
   - 三杯雞（九層塔、醬油、麻油）
   - 宮保雞丁（花生、辣椒）
   - 炒空心菜（蒜片、豆腐乳）
   - 炒豆干（蒜片、辣椒、醬油）
   - 炒糯米椒（蒜片、醬油）
   - 炒蛤蜊（九層塔、辣椒）

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食材名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 100,
      "category": "食材類別",
      "role": "主食材/配料/調味料",
      "cookingLevel": "烹飪程度（略焦/適中/軟嫩）",
      "visualFeatures": "視覺特徵",
      "description": "描述"
    }
  ],
  "dishType": "台式熱炒",
  "cookingMethod": "快炒",
  "hasWokHei": true,
  "hasGarlic": true,
  "hasChili": false,
  "seasonings": ["調味料列表"],
  "dishName": "菜餚名稱（如果可識別）",
  "overallDescription": "整體描述"
}

特別注意：
- 台式熱炒幾乎都有蒜片，請仔細尋找
- 糯米椒（細長、有皺褶）vs 青椒（較大、光滑）
- 注意鍋氣（略焦的痕跡）
- 九層塔是台式熱炒的特色
- 如果有海鮮，通常會有酒香`;
    } else {
      return `You are a food expert specializing in Taiwanese stir-fry identification. Please carefully analyze the Taiwanese stir-fry dishes in this image.

Taiwanese Stir-Fry Recognition Focus:
1. **Taiwanese Stir-Fry Characteristics**:
   - High heat quick fry, has wok hei
   - Glossy and oily
   - Ingredients slightly charred
   - Usually has garlic slices and chili
   - Rich sauce
   - Aromatic

2. **Common Stir-Fry Ingredients**:
   - Vegetables: Shishito peppers, water spinach, cabbage, green beans, bean sprouts
   - Protein: Dried tofu, pork belly, chicken, seafood
   - Aromatics: Garlic slices (essential), chili, basil, ginger, scallions

3. **Seasonings**:
   - Soy sauce, rice wine, shacha sauce, oyster sauce, salt, sugar

4. **Common Taiwanese Stir-Fry Dishes**:
   - Three-cup chicken, Kung Pao chicken, stir-fried water spinach, stir-fried dried tofu, stir-fried shishito peppers, stir-fried clams

Respond in JSON format with ingredients, cooking level, wok hei presence, and dish name if identifiable.

Special Notes:
- Taiwanese stir-fries almost always have garlic slices
- Shishito peppers (thin, wrinkled) vs bell peppers (larger, smooth)
- Note wok hei (slightly charred traces)
- Basil is a Taiwanese stir-fry signature
- If seafood present, usually has wine aroma`;
    }
  }

  /**
   * 創建湯品 Prompt
   */
  generateSoupPrompt(): string {
    return this.templates.get(PromptTemplateType.SOUP) || this.createSoupPrompt();
  }

  private createSoupPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於湯品識別的食物專家。請仔細分析這張圖片中的湯品，並詳細識別每一種食材和份量。

湯品識別重點：
1. **湯品類型**：
   - 清湯：清澈、淡色、清淡
   - 濃湯：濃稠、勾芡、奶白色或深色
   - 羹湯：勾芡、濃稠、有料
   - 火鍋湯：紅色（麻辣）或白色（清湯）
   - 味噌湯：淡褐色、有味噌顆粒、日式

2. **湯底識別**：
   - 清湯：雞湯、排骨湯、魚湯、柴魚高湯
   - 濃湯：玉米濃湯、南瓜濃湯
   - 特色湯：味噌湯、酸辣湯、番茄湯
   - 羹湯：魚翅羹、酸辣羹、蚵仔麵線

3. **配料識別（非常重要！）**：
   **請仔細識別湯中的每一種食材，包括：**
   
   a. **蔬菜類**：
      - 白菜、高麗菜、大白菜
      - 蘿蔔、紅蘿蔔、白蘿蔔
      - 香菇、金針菇、杏鮑菇
      - 海帶、海帶芽、紫菜
      - 洋蔥、蔥、青蔥
      - 玉米、玉米筍
   
   b. **蛋白質類**：
      - 豆腐（嫩豆腐、板豆腐、油豆腐）
      - 肉片（豬肉、牛肉、雞肉）
      - 魚片、魚肉、魚丸
      - 蛋（水煮蛋、溫泉蛋）
      - 海鮮（蝦、蛤蜊、花枝）
   
   c. **麵食類**：
      - 麵條、烏龍麵、拉麵
      - 米粉、粉絲、冬粉
   
   d. **其他配料**：
      - 丸子（貢丸、魚丸、肉丸）
      - 餃子、餛飩、水餃
      - 年糕、魚板

4. **份量估算**：
   - 豆腐：每塊約30-50g
   - 海帶：每片約10-20g
   - 蔬菜：每份約30-50g
   - 肉片：每片約20-30g
   - 湯底：約200-300ml

5. **調味料識別**：
   - 味噌、鹽、醬油、醋
   - 胡椒、香油、辣油
   - 蔥花、香菜、薑絲

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "配料名稱（繁體中文）- 必須具體明確",
      "confidence": 0.95,
      "portion": 50,
      "unit": "g 或 ml",
      "category": "食材類別",
      "inSoup": true,
      "visualFeatures": "視覺特徵（顏色、形狀、大小）",
      "position": "位置（浮在表面/沉在底部/中間）",
      "description": "詳細描述"
    }
  ],
  "dishType": "湯品",
  "dishName": "具體湯品名稱（如：味噌湯、排骨湯等）",
  "soupType": "湯品類型（清湯/濃湯/羹湯/味噌湯）",
  "soupBase": "湯底（柴魚高湯/雞湯/排骨湯/味噌湯底等）",
  "soupPortion": 250,
  "consistency": "濃稠度（清澈/濃稠/勾芡）",
  "color": "湯色（淡褐色/清澈/乳白色等）",
  "ingredients": ["完整的配料列表"],
  "seasonings": ["調味料列表"],
  "totalIngredients": 5,
  "overallDescription": "整體描述"
}

**特別注意（非常重要！）**：
1. **必須識別湯中的每一種食材** - 不要只說"味噌湯"，要列出所有配料
2. **每種食材都要估算份量** - 以公克(g)或毫升(ml)為單位
3. **注意不同位置的食材** - 浮在表面的、沉在底部的、中間的
4. **區分相似食材** - 如：嫩豆腐 vs 板豆腐、海帶 vs 海帶芽
5. **識別小配料** - 蔥花、薑絲、芝麻等小配料也要列出
6. **湯底也要計算份量** - 估算湯的總量（通常200-300ml）

**味噌湯常見配料**：
- 豆腐（嫩豆腐或板豆腐）
- 海帶芽或海帶
- 蔥花
- 可能有：魚板、油豆腐、香菇、蘿蔔等`;
    } else {
      return `You are a food expert specializing in soup identification. Please carefully analyze the soup in this image and identify every ingredient with portion sizes.

Soup Recognition Focus:
1. **Soup Types**:
   - Clear soup: Clear, light color, light taste
   - Thick soup: Thick, thickened, milky white or dark
   - Thick stew: Thickened, thick, with ingredients
   - Hot pot soup: Red (spicy) or white (clear)
   - Miso soup: Light brown, has miso particles, Japanese style

2. **Soup Base Identification**:
   - Clear soup: Chicken soup, pork rib soup, fish soup, dashi broth
   - Thick soup: Corn soup, pumpkin soup
   - Specialty soup: Miso soup, hot and sour soup, tomato soup
   - Thick stew: Shark fin soup, hot and sour stew, oyster vermicelli

3. **Ingredient Identification (VERY IMPORTANT!)**:
   **Please identify every ingredient in the soup, including:**
   
   a. **Vegetables**:
      - Cabbage, napa cabbage, Chinese cabbage
      - Radish, carrot, daikon
      - Mushrooms (shiitake, enoki, king oyster)
      - Kelp, wakame, seaweed
      - Onion, scallion, green onion
      - Corn, baby corn
   
   b. **Protein**:
      - Tofu (silken tofu, firm tofu, fried tofu)
      - Meat slices (pork, beef, chicken)
      - Fish slices, fish meat, fish balls
      - Egg (boiled egg, onsen egg)
      - Seafood (shrimp, clams, squid)
   
   c. **Noodles**:
      - Noodles, udon, ramen
      - Rice noodles, glass noodles, vermicelli
   
   d. **Other Ingredients**:
      - Meatballs (pork balls, fish balls, meat balls)
      - Dumplings, wontons, potstickers
      - Rice cakes, fish cakes

4. **Portion Estimation**:
   - Tofu: Each piece about 30-50g
   - Kelp: Each piece about 10-20g
   - Vegetables: Each serving about 30-50g
   - Meat slices: Each slice about 20-30g
   - Soup base: About 200-300ml

5. **Seasoning Identification**:
   - Miso, salt, soy sauce, vinegar
   - Pepper, sesame oil, chili oil
   - Scallions, cilantro, ginger strips

Respond in JSON format:
{
  "foods": [
    {
      "name": "ingredient name (must be specific)",
      "confidence": 0.95,
      "portion": 50,
      "unit": "g or ml",
      "category": "ingredient category",
      "inSoup": true,
      "visualFeatures": "visual features (color, shape, size)",
      "position": "position (floating/bottom/middle)",
      "description": "detailed description"
    }
  ],
  "dishType": "soup",
  "dishName": "specific soup name (e.g., miso soup, pork rib soup)",
  "soupType": "soup type (clear/thick/stew/miso)",
  "soupBase": "soup base (dashi broth/chicken broth/pork rib broth/miso base)",
  "soupPortion": 250,
  "consistency": "consistency (clear/thick/thickened)",
  "color": "soup color (light brown/clear/milky white)",
  "ingredients": ["complete ingredient list"],
  "seasonings": ["seasoning list"],
  "totalIngredients": 5,
  "overallDescription": "overall description"
}

**Special Notes (VERY IMPORTANT!)**:
1. **Must identify every ingredient in the soup** - Don't just say "miso soup", list all ingredients
2. **Estimate portion for each ingredient** - In grams (g) or milliliters (ml)
3. **Note ingredients at different positions** - Floating on surface, at bottom, in middle
4. **Distinguish similar ingredients** - E.g., silken tofu vs firm tofu, kelp vs wakame
5. **Identify small garnishes** - Scallions, ginger strips, sesame seeds, etc.
6. **Calculate soup base portion** - Estimate total soup volume (usually 200-300ml)

**Common Miso Soup Ingredients**:
- Tofu (silken or firm)
- Wakame or kelp
- Scallions
- Possibly: Fish cake, fried tofu, mushrooms, radish, etc.`;
    }
  }

  /**
   * 創建混合菜餚 Prompt
   */
  generateMixedDishPrompt(): string {
    return this.templates.get(PromptTemplateType.MIXED_DISH) || this.createMixedDishPrompt();
  }

  private createMixedDishPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於混合菜餚識別的食物專家。請仔細分析這張圖片中的複雜菜餚。

混合菜餚識別重點：
1. **混合菜餚特徵**：
   - 包含多種食材（3種以上）
   - 食材類型多樣（蔬菜、肉類、豆製品等）
   - 可能有多種烹飪方式
   - 擺盤複雜

2. **識別策略**：
   - **逐一識別每種食材**
   - 從大到小、從明顯到細微
   - 注意隱藏在下層的食材
   - 識別醬汁和調味料

3. **常見混合菜餚**：
   - 便當（多種菜色）
   - 拌飯（石鍋拌飯、丼飯）
   - 炒飯（蛋炒飯、海鮮炒飯）
   - 炒麵（什錦炒麵）
   - 火鍋（多種食材）
   - 定食（主菜+配菜+飯+湯）

4. **完整性檢查**：
   - 主食：飯、麵、粉
   - 主菜：肉類、海鮮、豆製品
   - 配菜：蔬菜、蛋
   - 調味料：醬汁、香料

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食材名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 100,
      "category": "食材類別",
      "role": "主食/主菜/配菜/調味料",
      "position": "位置（上層/中層/下層）",
      "visualFeatures": "視覺特徵",
      "description": "描述"
    }
  ],
  "dishType": "混合菜餚",
  "dishName": "菜餚名稱（如：便當、拌飯等）",
  "totalIngredients": 8,
  "mainComponents": {
    "staple": "主食",
    "mainDish": "主菜",
    "sideDishes": ["配菜列表"]
  },
  "cookingMethods": ["烹飪方式列表"],
  "overallDescription": "整體描述"
}

特別注意：
- 混合菜餚通常有很多食材，請仔細識別每一種
- 注意不同層次的食材（上層、中層、下層）
- 不要遺漏小配菜和調味料
- 如果是便當或定食，請識別所有菜色
- 估算每種食材的份量`;
    } else {
      return `You are a food expert specializing in mixed dish identification. Please carefully analyze the complex dishes in this image.

Mixed Dish Recognition Focus:
1. **Mixed Dish Characteristics**:
   - Contains multiple ingredients (3 or more)
   - Diverse ingredient types (vegetables, meat, soy products, etc.)
   - May have multiple cooking methods
   - Complex presentation

2. **Identification Strategy**:
   - **Identify each ingredient one by one**
   - From large to small, from obvious to subtle
   - Note ingredients hidden in lower layers
   - Identify sauces and seasonings

3. **Common Mixed Dishes**:
   - Bento (multiple dishes)
   - Mixed rice (bibimbap, donburi)
   - Fried rice (egg fried rice, seafood fried rice)
   - Fried noodles (mixed fried noodles)
   - Hot pot (multiple ingredients)
   - Set meal (main dish + sides + rice + soup)

4. **Completeness Check**:
   - Staple: Rice, noodles, vermicelli
   - Main dish: Meat, seafood, soy products
   - Side dishes: Vegetables, eggs
   - Seasonings: Sauces, spices

Respond in JSON format with all ingredients, roles, positions, and main components.

Special Notes:
- Mixed dishes usually have many ingredients, identify each carefully
- Note ingredients at different layers (top, middle, bottom)
- Don't miss small side dishes and seasonings
- If it's a bento or set meal, identify all dishes
- Estimate portion of each ingredient`;
    }
  }

  /**
   * 添加易混淆食材警告
   */
  addConfusionWarnings(prompt: string, confusedPairs: string[][]): string {
    if (confusedPairs.length === 0) {
      return prompt;
    }

    const warnings: string[] = [];
    
    if (this.language === 'zh-TW') {
      warnings.push('\n\n⚠️ 易混淆食材特別注意：');
      for (const [food1, food2] of confusedPairs) {
        warnings.push(`- ${food1} vs ${food2}：請仔細區分這兩種食材的視覺特徵`);
      }
      warnings.push('\n請特別注意以上食材的區分特徵，避免誤判。');
    } else {
      warnings.push('\n\n⚠️ Easily Confused Ingredients - Special Attention:');
      for (const [food1, food2] of confusedPairs) {
        warnings.push(`- ${food1} vs ${food2}: Please carefully distinguish the visual features of these two ingredients`);
      }
      warnings.push('\nPlease pay special attention to the distinguishing features of the above ingredients to avoid misidentification.');
    }

    return prompt + warnings.join('\n');
  }

  /**
   * 添加地方特色背景知識
   */
  addRegionalContext(prompt: string, region: string): string {
    const regionalKnowledge: Record<string, { zhTW: string; en: string }> = {
      '台北': {
        zhTW: '\n\n📍 台北地區特色：\n- 常見小吃：滷肉飯、蚵仔麵線、雞排、珍珠奶茶\n- 夜市美食：士林夜市、饒河夜市、寧夏夜市\n- 特色：融合各地料理，創新料理多',
        en: '\n\n📍 Taipei Regional Features:\n- Common snacks: Braised pork rice, oyster vermicelli, fried chicken, bubble tea\n- Night market food: Shilin, Raohe, Ningxia night markets\n- Features: Fusion of various cuisines, many innovative dishes'
      },
      '台南': {
        zhTW: '\n\n📍 台南地區特色：\n- 常見小吃：牛肉湯、擔仔麵、碗粿、虱目魚\n- 特色：偏甜、清淡、重視食材原味\n- 早餐文化：牛肉湯、鹹粥',
        en: '\n\n📍 Tainan Regional Features:\n- Common snacks: Beef soup, danzai noodles, savory rice pudding, milkfish\n- Features: Slightly sweet, light, emphasizes natural flavors\n- Breakfast culture: Beef soup, savory congee'
      },
      '台中': {
        zhTW: '\n\n📍 台中地區特色：\n- 常見小吃：太陽餅、珍珠奶茶、肉圓、大麵羹\n- 特色：口味適中、創新料理\n- 夜市：逢甲夜市',
        en: '\n\n📍 Taichung Regional Features:\n- Common snacks: Sun cake, bubble tea, ba-wan, thick noodle soup\n- Features: Moderate taste, innovative dishes\n- Night market: Fengjia night market'
      },
      '花蓮': {
        zhTW: '\n\n📍 花蓮地區特色：\n- 原住民料理：馬告、刺蔥、小米\n- 特色小吃：扁食、公正包子、炸彈蔥油餅\n- 特色：原住民風味、海鮮新鮮',
        en: '\n\n📍 Hualien Regional Features:\n- Indigenous cuisine: Maqaw, prickly ash, millet\n- Specialty snacks: Flat dumplings, Gongzheng buns, scallion pancake\n- Features: Indigenous flavors, fresh seafood'
      },
      '客家': {
        zhTW: '\n\n📍 客家料理特色：\n- 常見菜餚：客家小炒、梅干扣肉、薑絲大腸、鹹湯圓\n- 特色：鹹、香、油、重口味\n- 常用食材：豬肉、豆干、魷魚、芹菜',
        en: '\n\n📍 Hakka Cuisine Features:\n- Common dishes: Hakka stir-fry, pork with preserved mustard greens, ginger intestine, savory tangyuan\n- Features: Salty, aromatic, oily, strong flavors\n- Common ingredients: Pork, dried tofu, squid, celery'
      }
    };

    const knowledge = regionalKnowledge[region];
    if (!knowledge) {
      return prompt;
    }

    return prompt + (this.language === 'zh-TW' ? knowledge.zhTW : knowledge.en);
  }

  /**
   * 添加季節性食材提示
   */
  addSeasonalContext(prompt: string, season: string): string {
    const seasonalFoods: Record<string, { zhTW: string; en: string }> = {
      '春': {
        zhTW: '\n\n🌸 春季時令食材：\n- 蔬菜：竹筍、蘆筍、豌豆、韭菜、香椿\n- 水果：草莓、枇杷、桑葚\n- 海鮮：鰻魚、鯖魚',
        en: '\n\n🌸 Spring Seasonal Ingredients:\n- Vegetables: Bamboo shoots, asparagus, peas, chives, Chinese toon\n- Fruits: Strawberries, loquat, mulberries\n- Seafood: Eel, mackerel'
      },
      '夏': {
        zhTW: '\n\n☀️ 夏季時令食材：\n- 蔬菜：絲瓜、苦瓜、茄子、空心菜、玉米\n- 水果：西瓜、芒果、荔枝、龍眼、鳳梨\n- 海鮮：小卷、透抽、白帶魚',
        en: '\n\n☀️ Summer Seasonal Ingredients:\n- Vegetables: Loofah, bitter melon, eggplant, water spinach, corn\n- Fruits: Watermelon, mango, lychee, longan, pineapple\n- Seafood: Baby squid, squid, cutlassfish'
      },
      '秋': {
        zhTW: '\n\n🍂 秋季時令食材：\n- 蔬菜：南瓜、芋頭、山藥、菱角、蓮藕\n- 水果：柚子、柿子、梨子、葡萄\n- 海鮮：螃蟹、秋刀魚',
        en: '\n\n🍂 Autumn Seasonal Ingredients:\n- Vegetables: Pumpkin, taro, yam, water caltrop, lotus root\n- Fruits: Pomelo, persimmon, pear, grapes\n- Seafood: Crab, saury'
      },
      '冬': {
        zhTW: '\n\n❄️ 冬季時令食材：\n- 蔬菜：白菜、蘿蔔、芥菜、茼蒿、菠菜\n- 水果：橘子、柳丁、棗子\n- 海鮮：烏魚子、鱈魚',
        en: '\n\n❄️ Winter Seasonal Ingredients:\n- Vegetables: Napa cabbage, radish, mustard greens, chrysanthemum greens, spinach\n- Fruits: Tangerine, orange, jujube\n- Seafood: Mullet roe, cod'
      }
    };

    const seasonalInfo = seasonalFoods[season];
    if (!seasonalInfo) {
      return prompt;
    }

    const hint = this.language === 'zh-TW'
      ? '\n請特別注意識別這些時令食材。'
      : '\nPlease pay special attention to identifying these seasonal ingredients.';

    return prompt + (this.language === 'zh-TW' ? seasonalInfo.zhTW : seasonalInfo.en) + hint;
  }

  /**
   * 基於歷史錯誤優化 Prompt
   */
  addHistoricalErrorContext(prompt: string, commonErrors: Array<{ incorrect: string; correct: string; frequency: number }>): string {
    if (commonErrors.length === 0) {
      return prompt;
    }

    // 只使用頻率最高的前5個錯誤
    const topErrors = commonErrors
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    const errorWarnings: string[] = [];

    if (this.language === 'zh-TW') {
      errorWarnings.push('\n\n📊 根據歷史識別數據，以下是常見的誤判情況，請特別注意：');
      for (const error of topErrors) {
        errorWarnings.push(`- ❌ 常被誤認為「${error.incorrect}」，實際是「${error.correct}」（發生 ${error.frequency} 次）`);
      }
      errorWarnings.push('\n請根據視覺特徵仔細區分，避免重複這些錯誤。');
    } else {
      errorWarnings.push('\n\n📊 Based on historical recognition data, here are common misidentifications to watch out for:');
      for (const error of topErrors) {
        errorWarnings.push(`- ❌ Often misidentified as "${error.incorrect}", actually is "${error.correct}" (occurred ${error.frequency} times)`);
      }
      errorWarnings.push('\nPlease carefully distinguish based on visual features to avoid repeating these errors.');
    }

    return prompt + errorWarnings.join('\n');
  }

  /**
   * 添加街頭小吃背景知識
   */
  generateStreetFoodPrompt(): string {
    return this.templates.get(PromptTemplateType.STREET_FOOD) || this.createStreetFoodPrompt();
  }

  private createStreetFoodPrompt(): string {
    if (this.language === 'zh-TW') {
      return `你是一個專精於台灣街頭小吃的食物專家。請仔細分析這張圖片中的小吃。

台灣街頭小吃識別重點：
1. **常見小吃類型**：
   - 麵食類：蚵仔麵線、大腸麵線、擔仔麵、米粉湯
   - 米食類：滷肉飯、雞肉飯、碗粿、肉圓
   - 油炸類：雞排、鹽酥雞、炸豆腐、蚵仔煎
   - 湯品類：四神湯、肉羹湯、魚丸湯
   - 甜品類：豆花、仙草、愛玉、剉冰

2. **小吃特徵**：
   - 份量適中（單人份）
   - 價格親民
   - 快速製作
   - 使用紙碗、塑膠碗或小盤子
   - 通常有特色醬料

3. **常見配料**：
   - 香菜、蔥花、蒜泥
   - 辣椒醬、甜辣醬、醬油膏
   - 花生粉、芝麻

請以 JSON 格式回應，標註小吃類型、特色、配料等。`;
    } else {
      return `You are a food expert specializing in Taiwanese street food. Please carefully analyze the street food in this image.

Taiwanese Street Food Recognition Focus:
1. **Common Street Food Types**:
   - Noodles: Oyster vermicelli, intestine vermicelli, danzai noodles, rice noodle soup
   - Rice: Braised pork rice, chicken rice, savory rice pudding, ba-wan
   - Fried: Fried chicken, popcorn chicken, fried tofu, oyster omelet
   - Soups: Si shen soup, thick soup, fish ball soup
   - Desserts: Tofu pudding, grass jelly, aiyu jelly, shaved ice

2. **Street Food Characteristics**:
   - Moderate portion (single serving)
   - Affordable price
   - Quick preparation
   - Uses paper bowls, plastic bowls, or small plates
   - Usually has signature sauce

3. **Common Toppings**:
   - Cilantro, scallions, minced garlic
   - Chili sauce, sweet chili sauce, soy sauce paste
   - Peanut powder, sesame

Respond in JSON format with street food type, features, and toppings.`;
    }
  }

  /**
   * 組合多個增強功能
   */
  enhancePromptWithContext(
    basePrompt: string,
    options: {
      confusedPairs?: string[][];
      region?: string;
      season?: string;
      commonErrors?: Array<{ incorrect: string; correct: string; frequency: number }>;
    }
  ): string {
    let enhancedPrompt = basePrompt;

    // 按順序添加各種增強
    if (options.confusedPairs && options.confusedPairs.length > 0) {
      enhancedPrompt = this.addConfusionWarnings(enhancedPrompt, options.confusedPairs);
    }

    if (options.region) {
      enhancedPrompt = this.addRegionalContext(enhancedPrompt, options.region);
    }

    if (options.season) {
      enhancedPrompt = this.addSeasonalContext(enhancedPrompt, options.season);
    }

    if (options.commonErrors && options.commonErrors.length > 0) {
      enhancedPrompt = this.addHistoricalErrorContext(enhancedPrompt, options.commonErrors);
    }

    return enhancedPrompt;
  }

  /**
   * 獲取當前季節
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 0-11 -> 1-12
    
    if (month >= 3 && month <= 5) return '春';
    if (month >= 6 && month <= 8) return '夏';
    if (month >= 9 && month <= 11) return '秋';
    return '冬';
  }

  /**
   * 智能生成 Prompt - 自動選擇最佳模板並添加增強
   */
  generateSmartPrompt(config: PromptGeneratorConfig & {
    confusedPairs?: string[][];
    region?: string;
    commonErrors?: Array<{ incorrect: string; correct: string; frequency: number }>;
  }): string {
    // 生成基礎 prompt
    let prompt = this.generatePrompt(config);

    // 自動添加季節性提示
    const season = this.getCurrentSeason();

    // 組合所有增強功能
    prompt = this.enhancePromptWithContext(prompt, {
      confusedPairs: config.confusedPairs,
      region: config.region,
      season: season,
      commonErrors: config.commonErrors
    });

    return prompt;
  }

  /**
   * 生成成分識別 Prompt
   * 根據料理類型生成專門的成分識別 prompt
   * 
   * @param dishName - 料理名稱
   * @param dishType - 料理類型
   * @param region - 地區（可選）
   * @returns 成分識別 prompt
   */
  generateComponentDetectionPrompt(
    dishName: string,
    dishType: DishType,
    region?: string
  ): string {
    // 導入成分識別 prompt 函數
    const {
      generateSoupComponentPrompt,
      generateFriedRiceComponentPrompt,
      generateBentoComponentPrompt,
      generateNoodlesComponentPrompt,
      generateGenericComponentPrompt
    } = require('./ComponentDetectionPrompts');

    let basePrompt: string;

    // 根據料理類型選擇對應的 prompt
    switch (dishType) {
      case DishType.SOUP:
        basePrompt = generateSoupComponentPrompt(this.language);
        break;
      
      case DishType.FRIED_RICE:
        basePrompt = generateFriedRiceComponentPrompt(this.language);
        break;
      
      case DishType.BENTO:
        basePrompt = generateBentoComponentPrompt(this.language);
        break;
      
      case DishType.NOODLES:
        basePrompt = generateNoodlesComponentPrompt(this.language);
        break;
      
      case DishType.STIR_FRY:
      case DishType.DUMPLING:
      case DishType.BARBECUE:
      case DishType.HOT_POT:
      case DishType.UNKNOWN:
      default:
        basePrompt = generateGenericComponentPrompt(dishName, this.language);
        break;
    }

    // 添加地區背景知識（如果提供）
    if (region) {
      basePrompt = this.addRegionalContext(basePrompt, region);
    }

    // 添加通用的成分識別指導
    const generalGuidance = this.language === 'zh-TW'
      ? `\n\n**通用識別指導**：
- 仔細觀察圖片中的每個細節
- 注意顏色、形狀、質地、大小
- 考慮該料理的典型成分組成
- 對於不確定的成分，降低信心度
- 份量估算要考慮視覺比例和典型份量`
      : `\n\n**General Recognition Guidance**:
- Carefully observe every detail in the image
- Note color, shape, texture, size
- Consider typical component composition for this dish
- For uncertain components, lower confidence
- Portion estimation should consider visual proportion and typical portions`;

    return basePrompt + generalGuidance;
  }

  /**
   * 生成成分精煉 Prompt
   * 用於低信心度成分的二次確認
   * 
   * @param initialComponents - 初步識別的成分列表
   * @param dishContext - 料理背景資訊
   * @returns 成分精煉 prompt
   */
  generateComponentRefinementPrompt(
    initialComponents: Array<{
      name: string;
      confidence: number;
      estimatedPortion: number;
    }>,
    dishContext: string
  ): string {
    const { generateComponentRefinementPrompt } = require('./ComponentDetectionPrompts');

    return generateComponentRefinementPrompt({
      initialComponents,
      dishContext,
      language: this.language
    });
  }
}

// 導入 DishType 枚舉以支持成分識別
import { DishType } from '../types/ComponentDetection';
