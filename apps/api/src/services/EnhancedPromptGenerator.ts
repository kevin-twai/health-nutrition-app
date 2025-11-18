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
      return `你是一個專精於亞洲料理的食物識別專家。

## 核心任務（最優先）
**你的首要任務是：仔細觀察圖片，識別並列出所有可見的食材到 foods 列表中。**

## 識別步驟（請按順序執行）

### 步驟 1：仔細觀察圖片
- 從整體到細節觀察圖片
- 注意不同位置的食材（表面、中間、底部）
- 識別顏色、形狀、質地等視覺特徵
- 注意是否有多種食材混合在一起

### 步驟 2：識別每一種食材
**請列出所有可見的食材，包括：**
- 主要食材（如肉類、主菜、主食）
- 配菜（如蔬菜、豆製品）
- 小配料（如蔥花、香菜、芝麻、蒜片）
- 調味料（如醬汁、油、醬料）

**不要遺漏任何可見的食材！**

### 步驟 3：估算份量
- 為每種食材估算合理的份量（公克或毫升）
- 參考常見份量標準：
  * 豆腐：每塊約 30-50g
  * 蔬菜絲：每份約 20-30g
  * 蔥花、香菜：約 5-10g
  * 湯底：約 200-300ml
  * 肉片：每片約 20-30g

### 步驟 4：撰寫描述
- 在完成 foods 列表後，撰寫整體描述
- description 用於補充說明料理特色、烹飪方式等
- description 不應限制 foods 列表的內容

## 食材識別重點

### 料理類型判斷
- 如果看到多種食材混合在一起（如海帶、豆干、滷蛋等），這可能是「涼拌小菜」或「滷味拼盤」
- 涼拌小菜特徵：多種食材、切成絲或片、有油光、顏色豐富
- 滷味拼盤特徵：多種滷製食材、深褐色、有滷汁
- 湯品特徵：有湯底和多種配料

### 區分相似食材
- 豆腐干絲 vs 麵條：干絲較粗、有韌性、顏色偏黃、表面粗糙
- 油炸豆腐 vs 豆腐干絲：油炸豆腐是金黃色方塊、外皮酥脆；豆腐干絲是細長條狀
- 米粉 vs 粉絲：米粉較粗、不透明；粉絲較細、半透明

### 烹飪方式識別
- 涼拌、快炒、清蒸、紅燒、滷製等
- 注意表面特徵（油光、醬色、焦痕等）

## JSON 格式說明

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

## 完整性檢查清單

在提交回應前，請確認：
- [ ] 已識別所有可見的主要食材
- [ ] 已識別所有可見的配菜
- [ ] 已識別所有可見的小配料（蔥花、香菜、蒜片等）
- [ ] 已識別調味料或醬汁（如果可見）
- [ ] foods 列表中至少有 3 種食材（如果圖片中有多種食材）
- [ ] 每種食材都有合理的份量估算
- [ ] 沒有遺漏任何明顯可見的食材

## 重要原則

1. **foods 列表是獨立的結構化數據**
   - foods 列表必須包含圖片中的所有可見食材
   - 即使某個食材在 description 中未提及，只要在圖片中可見，就必須加入 foods 列表
   - foods 列表是營養計算的基礎，必須完整準確

2. **description 是補充說明**
   - description 用於描述整體料理特色、烹飪方式、口味等
   - description 不應限制或影響 foods 列表的內容
   - 不要因為 description 簡短就減少 foods 列表中的食材

3. **識別所有食材，不只是主要食材**
   - 如果是拼盤或小菜，請列出所有食材
   - 不要只列出主要食材而忽略配菜
   - 小配料（蔥花、香菜、芝麻等）也要列出

## 範例

### 範例 1：涼拌干絲
如果圖片中有涼拌干絲，foods 列表應包含：
- 豆腐干絲（80g）
- 芹菜絲（20g）
- 胡蘿蔔絲（15g）
- 香菜（5g）
- 麻油（5ml）

**不要只回應「豆腐干絲」，必須列出所有可見的食材！**

### 範例 2：味噌湯
如果圖片中有味噌湯，foods 列表應包含：
- 味噌湯底（250ml）
- 豆腐（30g）
- 海帶芽（10g）
- 蔥花（5g）

**不要只回應「味噌湯」，必須列出湯底和所有配料！**`;
    } else {
      return `You are a food recognition expert specializing in Asian cuisine.

## Core Task (Highest Priority)
**Your primary task is: Carefully observe the image, identify and list ALL visible ingredients in the foods list.**

## Identification Steps (Follow in Order)

### Step 1: Carefully Observe the Image
- Observe the image from overall to details
- Note ingredients at different positions (surface, middle, bottom)
- Identify colors, shapes, textures, and other visual features
- Note if multiple ingredients are mixed together

### Step 2: Identify Every Ingredient
**Please list ALL visible ingredients, including:**
- Main ingredients (such as meat, main dishes, staples)
- Side dishes (such as vegetables, soy products)
- Small garnishes (such as scallions, cilantro, sesame, garlic slices)
- Seasonings (such as sauces, oils, condiments)

**Do not miss any visible ingredients!**

### Step 3: Estimate Portions
- Estimate reasonable portions for each ingredient (grams or milliliters)
- Reference common portion standards:
  * Tofu: Each piece about 30-50g
  * Vegetable strips: Each serving about 20-30g
  * Scallions, cilantro: About 5-10g
  * Soup base: About 200-300ml
  * Meat slices: Each slice about 20-30g

### Step 4: Write Description
- After completing the foods list, write an overall description
- Description is for supplementary information about dish characteristics, cooking methods, etc.
- Description should not limit the content of the foods list

## Ingredient Identification Focus

### Dish Type Identification
- If you see multiple ingredients mixed together (e.g., kelp, dried tofu, braised egg), this may be "cold dressed appetizers" or "braised platter"
- Cold dressed appetizers features: Multiple ingredients, cut into strips or slices, oil sheen, colorful
- Braised platter features: Multiple braised ingredients, dark brown, with braising liquid
- Soup features: Has soup base and multiple ingredients

### Distinguish Similar Ingredients
- Dried tofu strips vs noodles: strips are thicker, chewier, yellowish, rough surface
- Fried tofu vs dried tofu strips: fried tofu is golden cube with crispy skin; dried tofu strips are thin long strips
- Rice noodles vs glass noodles: rice noodles are thicker, opaque; glass noodles are thinner, translucent

### Cooking Method Identification
- Cold dressed, stir-fried, steamed, braised, etc.
- Note surface features (oil sheen, sauce color, char marks, etc.)

## JSON Format

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

## Completeness Checklist

Before submitting your response, please confirm:
- [ ] Identified all visible main ingredients
- [ ] Identified all visible side dishes
- [ ] Identified all visible small garnishes (scallions, cilantro, garlic slices, etc.)
- [ ] Identified seasonings or sauces (if visible)
- [ ] Foods list contains at least 3 ingredients (if the image has multiple ingredients)
- [ ] Each ingredient has a reasonable portion estimate
- [ ] No obvious visible ingredients are missing

## Important Principles

1. **The foods list is independent structured data**
   - The foods list must include all visible ingredients in the image
   - Even if an ingredient is not mentioned in the description, if it's visible in the image, it must be added to the foods list
   - The foods list is the foundation for nutrition calculation and must be complete and accurate

2. **Description is supplementary information**
   - Description is for describing overall dish characteristics, cooking methods, flavors, etc.
   - Description should not limit or affect the content of the foods list
   - Don't reduce ingredients in the foods list just because the description is brief

3. **Identify all ingredients, not just main ones**
   - If it's a platter or appetizers, list all ingredients
   - Don't just list main ingredients and ignore side dishes
   - Small garnishes (scallions, cilantro, sesame, etc.) should also be listed

## Examples

### Example 1: Cold Dressed Tofu Strips
If the image shows cold dressed tofu strips, the foods list should include:
- Dried tofu strips (80g)
- Celery strips (20g)
- Carrot strips (15g)
- Cilantro (5g)
- Sesame oil (5ml)

**Don't just respond with "dried tofu strips", must list all visible ingredients!**

### Example 2: Miso Soup
If the image shows miso soup, the foods list should include:
- Miso soup base (250ml)
- Tofu (30g)
- Wakame (10g)
- Scallions (5g)

**Don't just respond with "miso soup", must list soup base and all ingredients!**`;
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
      return `你是一個專精於台式料理的食物識別專家。

## 核心任務（最優先）
**你的首要任務是：仔細觀察圖片，識別並列出台式料理中所有可見的食材到 foods 列表中。**

台式料理常有多種食材混合（如熱炒、滷味拼盤、小吃），請逐一識別每一種食材，不要遺漏！

## 識別步驟（請按順序執行）

### 步驟 1：仔細觀察圖片
- 從整體到細節觀察台式料理
- 注意不同位置的食材（表面、中間、底部）
- 識別顏色、形狀、質地等視覺特徵
- 注意台式料理的特色配料（蒜片、辣椒、九層塔、油蔥酥等）

### 步驟 2：識別每一種食材

**請列出所有可見的食材，包括：**

#### A. 主要食材（主菜、主食）
- 肉類：三層肉、豬肉片、雞肉、牛肉、海鮮
- 豆製品：豆干、豆腐干絲、臭豆腐、豆腐
- 蔬菜：糯米椒、過貓、山蘇、空心菜、高麗菜
- 主食：米飯、麵條、米粉、粄條

#### B. 配菜和配料
- 常見配菜：糯米椒、青椒、洋蔥、蔥段、芹菜
- 台式特色配料：
  * 蒜片（台式熱炒必備）
  * 辣椒片或辣椒段
  * 九層塔（三杯料理、熱炒常用）
  * 油蔥酥（滷肉飯、麵線常用）
  * 香菜（小吃常用）
  * 花生粉（小吃常用）

#### C. 調味料和醬汁
- 台式醬料：沙茶醬、甜辣醬、醬油膏、烏醋
- 一般調味：醬油、麻油、米酒、糖
- 注意表面的醬色和油光

### 步驟 3：台式料理類型識別

根據料理類型，注意不同的食材組合：

#### 台式熱炒
**特徵**：大火快炒、鍋氣重、油亮、香氣濃郁
**必須識別的元素**：
- 主食材：糯米椒、豆干、三層肉、蛤蜊、花枝、蝦等
- 配料：蒜片（必備）、辣椒、九層塔、蔥段
- 調味：醬油、米酒、糖
**常見菜餚**：炒豆干、炒糯米椒、三杯雞、宮保雞丁、炒花枝

#### 滷味拼盤
**特徵**：醬油滷製、深褐色、五香味、多種食材
**必須識別的元素**：
- 豆製品：豆干、豆腐、豆皮
- 蛋類：滷蛋、鵪鶉蛋
- 肉類：豬耳朵、豬腳、雞翅、雞腳
- 蔬菜：海帶、筍干、高麗菜
- 內臟：豬血、鴨血、大腸、豬肝
**注意**：滷味拼盤通常有 3-6 種食材，請全部列出

#### 涼拌小菜
**特徵**：冷食、多種食材混合、有油光
**必須識別的元素**：
- 主食材：豆腐干絲、海蜇皮、小黃瓜、木耳
- 配菜：芹菜絲、胡蘿蔔絲、香菜、蔥絲
- 調味：麻油、醬油、醋、蒜末
**常見菜餚**：涼拌干絲、涼拌海蜇皮、涼拌小黃瓜

#### 台式小吃
**特徵**：街頭小吃、多種配料、醬料豐富
**必須識別的元素**：
- 主體：蚵仔煎、臭豆腐、蚵仔麵線、肉圓、碗粿
- 配料：香菜、酸菜、泡菜、蒜泥、辣椒
- 醬料：甜辣醬、醬油膏、蒜泥醬
**注意**：小吃通常有多種配料和醬料，請全部列出

#### 原住民料理（如適用）
**特色食材**：
- 香料：馬告（山胡椒）、刺蔥
- 主食：小米、芋頭、地瓜
- 肉類：山豬肉、飛魚、溪魚
- 野菜：過貓、山蘇、龍葵
**烹飪方式**：竹筒飯、石板烤肉、醃漬
**注意**：如有原住民特色食材，請特別標註

### 步驟 4：台式料理常見食材識別重點

#### 豆製品識別
- **豆腐干絲**：淡黃色、細長條狀（寬 2-3mm）、有韌性、表面粗糙
  * 區分麵條：干絲較粗、不透明、顏色偏黃、有豆香
- **豆干**：方塊狀、淡黃色或深褐色（滷過）、有韌性
- **臭豆腐**：金黃色（炸過）或深褐色（滷過）、有孔洞、特殊氣味

#### 蔬菜識別
- **糯米椒**：細長、有皺褶、綠色、長約 5-8cm
  * 區分青椒：糯米椒較小、較細、有皺褶；青椒較大、光滑
- **過貓**：深綠色、捲曲狀、嫩葉
- **山蘇**：深綠色、長條狀、有光澤
- **空心菜**：深綠色、莖中空、葉片尖

#### 配料識別
- **蒜片**：白色或淡黃色、薄片狀、台式熱炒必備
- **九層塔**：深綠色、葉片有香氣、三杯料理必備
- **油蔥酥**：金黃色、碎末狀、香脆
- **辣椒**：紅色或綠色、片狀或段狀

### 步驟 5：估算份量
- 主食材：通常 80-150g
- 配菜：每種通常 20-50g
- 小配料（蒜片、辣椒、九層塔）：每種通常 5-15g
- 調味料：每種通常 5-15ml 或 g

### 步驟 6：撰寫描述
- 在完成 foods 列表後，撰寫整體描述
- description 用於補充說明料理特色、烹飪方式、口味等

## JSON 格式說明

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
      "role": "主食材/配菜/配料/調味料",
      "description": "詳細描述"
    }
  ],
  "cuisineType": "台式",
  "dishType": "菜餚類型（熱炒/滷味/涼拌/小吃等）",
  "isIndigenousFood": false,
  "seasonings": ["調味料列表"],
  "taiwaneseFeatures": {
    "hasGarlic": false,
    "hasBasil": false,
    "hasShallots": false,
    "hasChili": false
  },
  "overallDescription": "整體描述"
}

## 完整性檢查清單

在提交回應前，請確認：
- [ ] 已識別所有可見的主要食材
- [ ] 已識別所有可見的配菜
- [ ] 已識別台式特色配料（蒜片、辣椒、九層塔、油蔥酥等）
- [ ] 已識別調味料或醬汁
- [ ] foods 列表中至少有 3 種食材（如果圖片中有多種食材）
- [ ] 每種食材都有合理的份量估算
- [ ] 每種食材都標註了角色（主食材/配菜/配料/調味料）
- [ ] 沒有遺漏任何明顯可見的食材
- [ ] 如果是熱炒，是否識別了蒜片和辣椒
- [ ] 如果是滷味拼盤，是否列出了所有滷製食材
- [ ] 如果有原住民特色食材，是否特別標註

## 重要原則

1. **必須識別所有可見的食材**
   - 台式料理常有多種食材混合（熱炒、滷味、小吃）
   - 不要只識別主食材，配菜和配料也要列出
   - 特別注意台式特色配料：蒜片、辣椒、九層塔、油蔥酥

2. **台式熱炒必須識別蒜片和辣椒**
   - 台式熱炒的特色就是大量使用蒜片和辣椒
   - 如果是熱炒類料理，請仔細尋找蒜片（白色薄片）和辣椒（紅色或綠色）
   - 蒜片通常在食材表面或混合其中

3. **滷味拼盤必須列出所有食材**
   - 滷味拼盤通常有 3-6 種不同的滷製食材
   - 請逐一識別每種食材（豆干、滷蛋、海帶、豬血等）
   - 不要只回應「滷味」，要列出具體的食材

4. **注意台式特色食材**
   - 糯米椒（細長、有皺褶）
   - 豆腐干絲（淡黃色、細長條狀）
   - 九層塔（深綠色葉片）
   - 油蔥酥（金黃色碎末）

5. **原住民料理特別標註**
   - 如果有馬告、刺蔥、小米、山豬肉等原住民特色食材
   - 請在 JSON 中設定 "isIndigenousFood": true
   - 並在食材描述中特別說明

## 範例

### 範例 1：炒豆干（台式熱炒）
如果圖片中有炒豆干，foods 列表應包含：
- 豆干（100g）- 主食材
- 糯米椒（50g）- 配菜
- 蒜片（10g）- 配料（台式熱炒必備）
- 辣椒片（5g）- 配料
- 蔥段（10g）- 配料
- 醬油（10ml）- 調味料
- 米酒（5ml）- 調味料

**不要只回應「炒豆干」，必須列出所有可見的食材，特別是蒜片和辣椒！**

### 範例 2：三杯雞
如果圖片中有三杯雞，foods 列表應包含：
- 雞肉（150g）- 主食材
- 九層塔（15g）- 配料（三杯料理必備）
- 蒜片（10g）- 配料
- 薑片（10g）- 配料
- 辣椒（5g）- 配料
- 醬油（15ml）- 調味料
- 麻油（10ml）- 調味料
- 米酒（10ml）- 調味料

**三杯料理的特色是九層塔，必須識別！**

### 範例 3：滷味拼盤
如果圖片中有滷味拼盤，foods 列表應包含：
- 豆干（50g）- 主食材
- 滷蛋（60g）- 主食材
- 海帶（30g）- 配菜
- 豬血（40g）- 主食材
- 高麗菜（30g）- 配菜
- 醬油（滷汁）- 調味料

**滷味拼盤通常有多種食材，請全部列出，不要只回應「滷味」！**

### 範例 4：涼拌干絲
如果圖片中有涼拌干絲，foods 列表應包含：
- 豆腐干絲（80g）- 主食材
- 芹菜絲（20g）- 配菜
- 胡蘿蔔絲（15g）- 配菜
- 香菜（5g）- 配料
- 麻油（5ml）- 調味料
- 醬油（10ml）- 調味料

**涼拌菜有多種食材混合，請全部列出！**

### 範例 5：蚵仔煎（台式小吃）
如果圖片中有蚵仔煎，foods 列表應包含：
- 蚵仔（50g）- 主食材
- 雞蛋（50g）- 主食材
- 地瓜粉漿（30g）- 主食材
- 小白菜（20g）- 配菜
- 香菜（5g）- 配料
- 甜辣醬（15ml）- 調味料

**小吃通常有多種配料和醬料，請全部列出！**

### 範例 6：馬告烤肉（原住民料理）
如果圖片中有馬告烤肉，foods 列表應包含：
- 豬肉（150g）- 主食材
- 馬告（山胡椒）（3g）- 香料（原住民特色）
- 刺蔥（5g）- 香料（原住民特色）
- 鹽（2g）- 調味料

**原住民料理要特別標註特色食材，並設定 "isIndigenousFood": true**

## 台式料理識別重點總結

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

特別注意：
- 仔細區分豆腐干絲和麵條（干絲較粗、有韌性、顏色偏黃）
- 識別糯米椒（細長、有皺褶）vs 青椒（較大、光滑）
- 注意台式熱炒的蒜片和辣椒（必備配料）
- 如果有原住民特色食材（馬告、刺蔥等），請特別標註
- 滷味拼盤要列出所有滷製食材，不要只回應「滷味」
- 台式小吃要列出所有配料和醬料
- 如果只識別到 1-2 種食材，可能有遺漏，請再仔細觀察`;
    } else {
      return `You are a food recognition expert specializing in Taiwanese cuisine.

## Core Task (Highest Priority)
**Your primary task is: Carefully observe the image, identify and list ALL visible ingredients in the Taiwanese dish to the foods list.**

Taiwanese dishes often have multiple ingredients mixed together (such as stir-fries, braised platters, snacks). Please identify each ingredient one by one, don't miss any!

## Identification Steps (Follow in Order)

### Step 1: Carefully Observe the Image
- Observe the Taiwanese dish from overall to details
- Note ingredients at different positions (surface, middle, bottom)
- Identify colors, shapes, textures, and other visual features
- Note Taiwanese specialty toppings (garlic slices, chili, basil, fried shallots, etc.)

### Step 2: Identify Each Ingredient

**Please list ALL visible ingredients, including:**

#### A. Main Ingredients (main dishes, staples)
- Meat: pork belly, pork slices, chicken, beef, seafood
- Soy products: dried tofu, dried tofu strips, stinky tofu, tofu
- Vegetables: shishito peppers, guomao fern, mountain lettuce, water spinach, cabbage
- Staples: rice, noodles, rice noodles, ban tiao

#### B. Side Dishes and Toppings
- Common sides: shishito peppers, bell peppers, onions, scallion sections, celery
- Taiwanese specialty toppings:
  * Garlic slices (essential for Taiwanese stir-fries)
  * Chili slices or sections
  * Basil (common in three-cup dishes and stir-fries)
  * Fried shallots (common in braised pork rice and vermicelli)
  * Cilantro (common in snacks)
  * Peanut powder (common in snacks)

#### C. Seasonings and Sauces
- Taiwanese sauces: shacha sauce, sweet chili sauce, soy sauce paste, black vinegar
- General seasonings: soy sauce, sesame oil, rice wine, sugar
- Note the sauce color and oil sheen on the surface

### Step 3: Taiwanese Dish Type Identification

Based on dish type, note different ingredient combinations:

#### Taiwanese Stir-Fry
**Features**: High heat quick fry, wok hei, glossy, aromatic
**Must identify elements**:
- Main ingredients: shishito peppers, dried tofu, pork belly, clams, squid, shrimp, etc.
- Toppings: garlic slices (essential), chili, basil, scallion sections
- Seasonings: soy sauce, rice wine, sugar
**Common dishes**: Stir-fried dried tofu, stir-fried shishito peppers, three-cup chicken, kung pao chicken, stir-fried squid

#### Braised Platter
**Features**: Soy sauce braised, dark brown, five-spice flavor, multiple ingredients
**Must identify elements**:
- Soy products: dried tofu, tofu, tofu skin
- Eggs: braised eggs, quail eggs
- Meat: pig ears, pig feet, chicken wings, chicken feet
- Vegetables: kelp, dried bamboo shoots, cabbage
- Offal: pig blood, duck blood, intestines, liver
**Note**: Braised platters usually have 3-6 ingredients, list them all

#### Cold Dressed Appetizers
**Features**: Cold food, multiple ingredients mixed, oil sheen
**Must identify elements**:
- Main ingredients: dried tofu strips, jellyfish, cucumber, wood ear mushroom
- Sides: celery strips, carrot strips, cilantro, scallion strips
- Seasonings: sesame oil, soy sauce, vinegar, minced garlic
**Common dishes**: Cold dressed tofu strips, cold dressed jellyfish, cold dressed cucumber

#### Taiwanese Snacks
**Features**: Street food, multiple toppings, rich sauces
**Must identify elements**:
- Main body: oyster omelet, stinky tofu, oyster vermicelli, ba-wan, rice cake
- Toppings: cilantro, pickled vegetables, kimchi, garlic paste, chili
- Sauces: sweet chili sauce, soy sauce paste, garlic sauce
**Note**: Snacks usually have multiple toppings and sauces, list them all

#### Indigenous Cuisine (if applicable)
**Specialty ingredients**:
- Spices: maqaw (mountain pepper), prickly ash
- Staples: millet, taro, sweet potato
- Meat: wild boar, flying fish, stream fish
- Wild vegetables: guomao fern, mountain lettuce, nightshade
**Cooking methods**: Bamboo tube rice, stone-grilled meat, pickling
**Note**: If indigenous specialty ingredients are present, mark specifically

### Step 4: Common Taiwanese Ingredient Identification Focus

#### Soy Product Identification
- **Dried tofu strips**: Light yellow, thin long strips (width 2-3mm), chewy, rough surface
  * Distinguish from noodles: strips are thicker, opaque, yellowish, bean aroma
- **Dried tofu**: Square blocks, light yellow or dark brown (braised), chewy
- **Stinky tofu**: Golden (fried) or dark brown (braised), with holes, special smell

#### Vegetable Identification
- **Shishito peppers**: Thin and long, wrinkled, green, about 5-8cm long
  * Distinguish from bell peppers: shishito peppers are smaller, thinner, wrinkled; bell peppers are larger, smooth
- **Guomao fern**: Dark green, curled, tender leaves
- **Mountain lettuce**: Dark green, long strips, glossy
- **Water spinach**: Dark green, hollow stems, pointed leaves

#### Topping Identification
- **Garlic slices**: White or light yellow, thin slices, essential for Taiwanese stir-fries
- **Basil**: Dark green, aromatic leaves, essential for three-cup dishes
- **Fried shallots**: Golden, crumbled, crispy
- **Chili**: Red or green, sliced or sectioned

### Step 5: Estimate Portions
- Main ingredients: usually 80-150g
- Side dishes: each usually 20-50g
- Small toppings (garlic slices, chili, basil): each usually 5-15g
- Seasonings: each usually 5-15ml or g

### Step 6: Write Description
- After completing the foods list, write an overall description
- Description is for supplementary information about dish characteristics, cooking methods, flavors, etc.

## JSON Format

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
      "role": "main ingredient/side dish/topping/seasoning",
      "description": "detailed description"
    }
  ],
  "cuisineType": "Taiwanese",
  "dishType": "dish type (stir-fry/braised/cold dressed/snack, etc.)",
  "isIndigenousFood": false,
  "seasonings": ["list of seasonings"],
  "taiwaneseFeatures": {
    "hasGarlic": false,
    "hasBasil": false,
    "hasShallots": false,
    "hasChili": false
  },
  "overallDescription": "overall description"
}

## Completeness Checklist

Before submitting your response, please confirm:
- [ ] Identified all visible main ingredients
- [ ] Identified all visible side dishes
- [ ] Identified Taiwanese specialty toppings (garlic slices, chili, basil, fried shallots, etc.)
- [ ] Identified seasonings or sauces
- [ ] Foods list contains at least 3 ingredients (if the image has multiple ingredients)
- [ ] Each ingredient has a reasonable portion estimate
- [ ] Each ingredient is marked with role (main ingredient/side dish/topping/seasoning)
- [ ] No obvious visible ingredients are missing
- [ ] If it's a stir-fry, identified garlic slices and chili
- [ ] If it's a braised platter, listed all braised ingredients
- [ ] If indigenous specialty ingredients are present, marked specifically

## Important Principles

1. **Must identify all visible ingredients**
   - Taiwanese dishes often have multiple ingredients mixed (stir-fries, braised dishes, snacks)
   - Don't just identify main ingredients, list side dishes and toppings too
   - Pay special attention to Taiwanese specialty toppings: garlic slices, chili, basil, fried shallots

2. **Taiwanese stir-fries must identify garlic slices and chili**
   - The characteristic of Taiwanese stir-fries is heavy use of garlic slices and chili
   - If it's a stir-fry dish, carefully look for garlic slices (white thin slices) and chili (red or green)
   - Garlic slices are usually on the surface or mixed in

3. **Braised platters must list all ingredients**
   - Braised platters usually have 3-6 different braised ingredients
   - Please identify each ingredient one by one (dried tofu, braised eggs, kelp, pig blood, etc.)
   - Don't just respond with "braised food", list specific ingredients

4. **Note Taiwanese specialty ingredients**
   - Shishito peppers (thin and long, wrinkled)
   - Dried tofu strips (light yellow, thin long strips)
   - Basil (dark green leaves)
   - Fried shallots (golden crumbles)

5. **Indigenous cuisine special marking**
   - If there are indigenous specialty ingredients like maqaw, prickly ash, millet, wild boar
   - Please set "isIndigenousFood": true in JSON
   - And specifically note in ingredient description

## Examples

### Example 1: Stir-Fried Dried Tofu (Taiwanese Stir-Fry)
If the image shows stir-fried dried tofu, the foods list should include:
- Dried tofu (100g) - main ingredient
- Shishito peppers (50g) - side dish
- Garlic slices (10g) - topping (essential for Taiwanese stir-fry)
- Chili slices (5g) - topping
- Scallion sections (10g) - topping
- Soy sauce (10ml) - seasoning
- Rice wine (5ml) - seasoning

**Don't just respond with "stir-fried dried tofu", must list all visible ingredients, especially garlic slices and chili!**

### Example 2: Three-Cup Chicken
If the image shows three-cup chicken, the foods list should include:
- Chicken (150g) - main ingredient
- Basil (15g) - topping (essential for three-cup dishes)
- Garlic slices (10g) - topping
- Ginger slices (10g) - topping
- Chili (5g) - topping
- Soy sauce (15ml) - seasoning
- Sesame oil (10ml) - seasoning
- Rice wine (10ml) - seasoning

**The characteristic of three-cup dishes is basil, must identify!**

### Example 3: Braised Platter
If the image shows a braised platter, the foods list should include:
- Dried tofu (50g) - main ingredient
- Braised egg (60g) - main ingredient
- Kelp (30g) - side dish
- Pig blood (40g) - main ingredient
- Cabbage (30g) - side dish
- Soy sauce (braising liquid) - seasoning

**Braised platters usually have multiple ingredients, list them all, don't just respond with "braised food"!**

### Example 4: Cold Dressed Tofu Strips
If the image shows cold dressed tofu strips, the foods list should include:
- Dried tofu strips (80g) - main ingredient
- Celery strips (20g) - side dish
- Carrot strips (15g) - side dish
- Cilantro (5g) - topping
- Sesame oil (5ml) - seasoning
- Soy sauce (10ml) - seasoning

**Cold dressed dishes have multiple ingredients mixed, list them all!**

### Example 5: Oyster Omelet (Taiwanese Snack)
If the image shows oyster omelet, the foods list should include:
- Oysters (50g) - main ingredient
- Egg (50g) - main ingredient
- Sweet potato starch batter (30g) - main ingredient
- Baby bok choy (20g) - side dish
- Cilantro (5g) - topping
- Sweet chili sauce (15ml) - seasoning

**Snacks usually have multiple toppings and sauces, list them all!**

### Example 6: Maqaw Grilled Meat (Indigenous Cuisine)
If the image shows maqaw grilled meat, the foods list should include:
- Pork (150g) - main ingredient
- Maqaw (mountain pepper) (3g) - spice (indigenous specialty)
- Prickly ash (5g) - spice (indigenous specialty)
- Salt (2g) - seasoning

**Indigenous cuisine should specially mark specialty ingredients and set "isIndigenousFood": true**

## Taiwanese Cuisine Recognition Focus Summary

1. **Taiwanese Specialty Ingredients**:
   - Soy products: dried tofu strips, dried tofu, stinky tofu, tofu pudding
   - Vegetables: shishito peppers, guomao fern, mountain lettuce, loofah, water spinach
   - Sauces: shacha sauce, sweet chili sauce, soy sauce paste, black vinegar
   - Toppings: fried shallots, fried garlic, cilantro, basil

2. **Cooking Methods**:
   - Stir-frying (re chao): high heat quick fry, often with garlic slices and chili
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

Special Notes:
- Carefully distinguish dried tofu strips from noodles (strips are thicker, chewier, yellowish)
- Identify shishito peppers (thin, wrinkled) vs bell peppers (larger, smooth)
- Note garlic slices and chili in Taiwanese stir-fries (essential toppings)
- If indigenous specialty ingredients (maqaw, prickly ash, etc.) are present, mark specifically
- Braised platters should list all braised ingredients, don't just respond with "braised food"
- Taiwanese snacks should list all toppings and sauces
- If only 1-2 ingredients are identified, there may be omissions, observe carefully again`;
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
   - 油炸豆腐：金黃色或深褐色、外皮酥脆、內部軟嫩、方塊狀或三角形、表面有油炸痕跡
   - 豆干：褐色、堅實、方塊狀
   - 豆腐干絲：淡黃色、細長條狀、有韌性
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
      return `你是一個專精於涼拌菜識別的食物專家。

## 核心任務（最優先）
**你的首要任務是：仔細觀察圖片，識別並列出涼拌菜中所有混合的食材到 foods 列表中。**

涼拌菜通常包含多種食材混合在一起，請逐一識別每一種食材，不要遺漏！

## 識別步驟（請按順序執行）

### 步驟 1：仔細觀察圖片
- 從整體到細節觀察涼拌菜
- 注意不同顏色的食材（綠色、橙色、白色、黃色、紅色等）
- 注意不同形狀的食材（絲狀、片狀、塊狀、顆粒狀）
- 注意不同質地的食材（軟嫩、脆爽、有韌性）
- 觀察表面的油光和醬色

### 步驟 2：識別每一種食材並分類

**涼拌菜通常有 3-6 種食材，請按以下分類逐一識別：**

#### A. 主食材（通常 1-2 種）
主食材是涼拌菜的主體，份量最多：
- 豆腐干絲（最常見）：淡黃色、細長條狀、有韌性、表面粗糙
- 海蜇皮：半透明、片狀、脆爽
- 木耳：黑色或褐色、片狀、軟嫩
- 黃瓜：綠色、片狀或條狀、清脆
- 海帶：深綠色或褐色、片狀、軟滑
- 豆芽：白色、細長、有根莖

#### B. 配菜（通常 2-4 種）
配菜增加涼拌菜的色彩和口感：
- 芹菜絲：深綠色、細長、有纖維感
- 胡蘿蔔絲：橙色、細長、脆爽
- 香菜：深綠色、葉狀、香氣濃郁
- 蔥絲：白色或淺綠色、細長
- 辣椒絲：紅色或綠色、細長
- 紅椒絲：鮮紅色、細長、光滑
- 黃椒絲：黃色、細長、光滑
- 紫洋蔥絲：紫色、細長

#### C. 調味料（通常 1-3 種）
調味料可能不明顯，但要注意痕跡：
- 麻油（芝麻油）：表面有油光
- 醬油：深褐色醬汁
- 醋：透明液體
- 蒜末：白色小顆粒
- 薑絲：淡黃色細絲
- 芝麻：白色或黑色小顆粒
- 花生碎：淺褐色顆粒

### 步驟 3：識別技巧

**注意不同顏色和形狀來區分食材：**

1. **顏色識別**：
   - 綠色系：芹菜絲（深綠）、蔥絲（淺綠）、香菜（深綠）、黃瓜（翠綠）
   - 橙色系：胡蘿蔔絲（橙色）
   - 白色系：豆腐干絲（淡黃白）、豆芽（白色）、蔥白（白色）
   - 紅色系：辣椒絲（紅色）、紅椒絲（鮮紅）
   - 黃色系：豆腐干絲（淡黃）、黃椒絲（黃色）

2. **形狀識別**：
   - 細長絲狀：豆腐干絲、芹菜絲、胡蘿蔔絲、蔥絲、辣椒絲
   - 片狀：海蜇皮、木耳、黃瓜片
   - 顆粒狀：蒜末、芝麻、花生碎
   - 葉狀：香菜

3. **質地識別**：
   - 有韌性：豆腐干絲
   - 脆爽：芹菜絲、胡蘿蔔絲、黃瓜
   - 軟嫩：木耳
   - 半透明：海蜇皮

4. **區分相似食材**：
   - 豆腐干絲 vs 麵條：干絲較粗（2-3mm）、有韌性、顏色偏黃、表面粗糙
   - 芹菜絲 vs 蔥絲：芹菜較粗、綠色較深、有纖維感
   - 胡蘿蔔絲 vs 紅椒絲：胡蘿蔔橙色、紅椒鮮紅色

### 步驟 4：估算份量
- 主食材：通常 60-100g
- 配菜：每種通常 10-30g
- 調味料：每種通常 5-15ml 或 g

### 步驟 5：撰寫描述
- 在完成 foods 列表後，撰寫整體描述
- description 用於補充說明涼拌菜的特色、口味等

## 涼拌菜特徵

1. **視覺特徵**：
   - 食材切成絲狀或片狀
   - 顏色豐富多彩（多種食材混合）
   - 表面可見油光（麻油）
   - 食材混合均勻
   - 通常裝在盤子或碗中
   - 常溫或冷藏狀態

2. **常見搭配**：
   - 涼拌干絲：豆腐干絲 + 芹菜絲 + 胡蘿蔔絲 + 香菜 + 麻油
   - 涼拌海蜇皮：海蜇皮 + 黃瓜絲 + 胡蘿蔔絲 + 蒜末 + 醋
   - 涼拌木耳：木耳 + 香菜 + 辣椒絲 + 蒜末 + 醬油

## JSON 格式說明

請以 JSON 格式回應：
{
  "foods": [
    {
      "name": "食材名稱（繁體中文）",
      "confidence": 0.95,
      "portion": 50,
      "category": "食材類別",
      "role": "主食材/配菜/調味料",
      "cuttingStyle": "切法（絲/片/塊/顆粒）",
      "visualFeatures": "視覺特徵（顏色、質地、形狀）",
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

## 完整性檢查清單

在提交回應前，請確認：
- [ ] 已識別所有可見的主食材（至少 1 種）
- [ ] 已識別所有可見的配菜（至少 2-3 種）
- [ ] 已識別調味料或醬汁（至少 1 種，如麻油、醬油）
- [ ] foods 列表中至少有 3 種食材（涼拌菜通常有 3-6 種食材）
- [ ] 每種食材都有合理的份量估算
- [ ] 每種食材都標註了角色（主食材/配菜/調味料）
- [ ] 沒有遺漏任何明顯可見的食材

## 重要原則

1. **必須識別所有混合的食材**
   - 涼拌菜的特點就是多種食材混合
   - 不要只識別主食材，配菜和調味料也要列出
   - 如果只識別到 1-2 種食材，很可能有遺漏，請再仔細觀察

2. **注意不同顏色和形狀**
   - 利用顏色差異來識別不同食材
   - 利用形狀差異來區分相似食材
   - 綠色、橙色、白色、紅色等不同顏色通常代表不同食材

3. **最小食材數量**
   - 涼拌菜通常有 3-6 種食材
   - 如果圖片中明顯有多種顏色和形狀，foods 列表應至少包含 3 種食材
   - 簡單的涼拌菜至少有：1 種主食材 + 2 種配菜

## 範例

### 範例 1：涼拌干絲（標準版）
如果圖片中有涼拌干絲，foods 列表應包含：
- 豆腐干絲（80g）- 主食材
- 芹菜絲（20g）- 配菜
- 胡蘿蔔絲（15g）- 配菜
- 香菜（5g）- 配菜
- 麻油（5ml）- 調味料

**不要只回應「豆腐干絲」，必須列出所有可見的食材！**

### 範例 2：涼拌干絲（豪華版）
如果圖片中有更豐富的涼拌干絲，foods 列表應包含：
- 豆腐干絲（80g）- 主食材
- 芹菜絲（20g）- 配菜
- 胡蘿蔔絲（15g）- 配菜
- 香菜（5g）- 配菜
- 蔥絲（5g）- 配菜
- 辣椒絲（3g）- 配菜
- 麻油（5ml）- 調味料
- 醬油（10ml）- 調味料
- 芝麻（2g）- 調味料

### 範例 3：涼拌海蜇皮
如果圖片中有涼拌海蜇皮，foods 列表應包含：
- 海蜇皮（60g）- 主食材
- 黃瓜絲（25g）- 配菜
- 胡蘿蔔絲（15g）- 配菜
- 香菜（5g）- 配菜
- 蒜末（5g）- 調味料
- 醋（10ml）- 調味料
- 麻油（5ml）- 調味料

### 範例 4：涼拌木耳
如果圖片中有涼拌木耳，foods 列表應包含：
- 木耳（50g）- 主食材
- 香菜（10g）- 配菜
- 辣椒絲（5g）- 配菜
- 蔥絲（5g）- 配菜
- 蒜末（5g）- 調味料
- 醬油（10ml）- 調味料
- 醋（5ml）- 調味料

特別注意：
- 涼拌菜通常有多種食材，請仔細識別每一種
- 利用顏色和形狀來區分不同食材
- 豆腐干絲是最常見的主食材，注意區分
- 不要遺漏細小的配菜（如香菜、蔥絲、芝麻）
- 注意表面的油光（麻油）和醬色（醬油）
- 如果只識別到 1-2 種食材，可能有遺漏，請再仔細觀察
- 涼拌菜通常至少有 3 種食材，最多可達 6-8 種`;
    } else {
      return `You are a food expert specializing in cold dressed dish identification.

## Core Task (Highest Priority)
**Your primary task is: Carefully observe the image, identify and list ALL mixed ingredients in the cold dressed dish to the foods list.**

Cold dressed dishes usually contain multiple ingredients mixed together. Please identify each ingredient one by one, don't miss any!

## Identification Steps (Follow in Order)

### Step 1: Carefully Observe the Image
- Observe the cold dressed dish from overall to details
- Note ingredients of different colors (green, orange, white, yellow, red, etc.)
- Note ingredients of different shapes (strips, slices, chunks, granules)
- Note ingredients of different textures (soft, crispy, chewy)
- Observe the oil sheen and sauce color on the surface

### Step 2: Identify Each Ingredient and Classify

**Cold dressed dishes usually have 3-6 ingredients. Please identify them by the following categories:**

#### A. Main Ingredients (usually 1-2 types)
Main ingredients are the body of the cold dressed dish, with the largest portion:
- Dried tofu strips (most common): light yellow, thin long strips, chewy, rough surface
- Jellyfish: translucent, sliced, crispy
- Wood ear mushroom: black or brown, sliced, soft
- Cucumber: green, sliced or strips, crispy
- Kelp: dark green or brown, sliced, smooth
- Bean sprouts: white, thin and long, with stems

#### B. Vegetables (usually 2-4 types)
Vegetables add color and texture to cold dressed dishes:
- Celery strips: dark green, thin and long, fibrous
- Carrot strips: orange, thin and long, crispy
- Cilantro: dark green, leafy, aromatic
- Scallion strips: white or light green, thin and long
- Chili strips: red or green, thin and long
- Red bell pepper strips: bright red, thin and long, smooth
- Yellow bell pepper strips: yellow, thin and long, smooth
- Purple onion strips: purple, thin and long

#### C. Seasonings (usually 1-3 types)
Seasonings may not be obvious, but note the traces:
- Sesame oil: oil sheen on surface
- Soy sauce: dark brown sauce
- Vinegar: clear liquid
- Minced garlic: white small granules
- Ginger strips: light yellow thin strips
- Sesame seeds: white or black small granules
- Crushed peanuts: light brown granules

### Step 3: Identification Techniques

**Use different colors and shapes to distinguish ingredients:**

1. **Color Identification**:
   - Green series: celery strips (dark green), scallion strips (light green), cilantro (dark green), cucumber (emerald green)
   - Orange series: carrot strips (orange)
   - White series: dried tofu strips (light yellow-white), bean sprouts (white), scallion white (white)
   - Red series: chili strips (red), red bell pepper strips (bright red)
   - Yellow series: dried tofu strips (light yellow), yellow bell pepper strips (yellow)

2. **Shape Identification**:
   - Thin long strips: dried tofu strips, celery strips, carrot strips, scallion strips, chili strips
   - Sliced: jellyfish, wood ear mushroom, cucumber slices
   - Granules: minced garlic, sesame seeds, crushed peanuts
   - Leafy: cilantro

3. **Texture Identification**:
   - Chewy: dried tofu strips
   - Crispy: celery strips, carrot strips, cucumber
   - Soft: wood ear mushroom
   - Translucent: jellyfish

4. **Distinguish Similar Ingredients**:
   - Dried tofu strips vs noodles: strips are thicker (2-3mm), chewy, yellowish, rough surface
   - Celery strips vs scallion strips: celery is thicker, darker green, fibrous
   - Carrot strips vs red bell pepper strips: carrot is orange, bell pepper is bright red

### Step 4: Estimate Portions
- Main ingredients: usually 60-100g
- Vegetables: each usually 10-30g
- Seasonings: each usually 5-15ml or g

### Step 5: Write Description
- After completing the foods list, write an overall description
- Description is for supplementary information about the characteristics and flavors of the cold dressed dish

## Cold Dressed Dish Characteristics

1. **Visual Features**:
   - Ingredients cut into strips or slices
   - Colorful (multiple ingredients mixed)
   - Visible oil sheen (sesame oil)
   - Ingredients evenly mixed
   - Usually served on a plate or in a bowl
   - Room temperature or chilled

2. **Common Combinations**:
   - Cold dressed tofu strips: dried tofu strips + celery strips + carrot strips + cilantro + sesame oil
   - Cold dressed jellyfish: jellyfish + cucumber strips + carrot strips + minced garlic + vinegar
   - Cold dressed wood ear: wood ear + cilantro + chili strips + minced garlic + soy sauce

## JSON Format

Respond in JSON format:
{
  "foods": [
    {
      "name": "ingredient name",
      "confidence": 0.95,
      "portion": 50,
      "category": "food category",
      "role": "main ingredient/vegetable/seasoning",
      "cuttingStyle": "cutting style (strips/slices/chunks/granules)",
      "visualFeatures": "visual features (color, texture, shape)",
      "description": "description"
    }
  ],
  "dishType": "cold dressed dish",
  "cookingMethod": "cold dressed",
  "totalIngredients": 5,
  "seasonings": ["list of seasonings"],
  "completenessCheck": {
    "hasMainIngredient": true,
    "hasVegetables": true,
    "hasSeasonings": true
  },
  "overallDescription": "overall description"
}

## Completeness Checklist

Before submitting your response, please confirm:
- [ ] Identified all visible main ingredients (at least 1 type)
- [ ] Identified all visible vegetables (at least 2-3 types)
- [ ] Identified seasonings or sauces (at least 1 type, such as sesame oil, soy sauce)
- [ ] Foods list contains at least 3 ingredients (cold dressed dishes usually have 3-6 ingredients)
- [ ] Each ingredient has a reasonable portion estimate
- [ ] Each ingredient is labeled with a role (main ingredient/vegetable/seasoning)
- [ ] No obvious visible ingredients are missing

## Important Principles

1. **Must identify all mixed ingredients**
   - The characteristic of cold dressed dishes is multiple ingredients mixed together
   - Don't just identify the main ingredient, vegetables and seasonings should also be listed
   - If only 1-2 ingredients are identified, there are likely omissions, please observe more carefully

2. **Pay attention to different colors and shapes**
   - Use color differences to identify different ingredients
   - Use shape differences to distinguish similar ingredients
   - Different colors like green, orange, white, red usually represent different ingredients

3. **Minimum ingredient count**
   - Cold dressed dishes usually have 3-6 ingredients
   - If the image clearly has multiple colors and shapes, the foods list should contain at least 3 ingredients
   - Simple cold dressed dishes have at least: 1 main ingredient + 2 vegetables

## Examples

### Example 1: Cold Dressed Tofu Strips (Standard)
If the image shows cold dressed tofu strips, the foods list should include:
- Dried tofu strips (80g) - main ingredient
- Celery strips (20g) - vegetable
- Carrot strips (15g) - vegetable
- Cilantro (5g) - vegetable
- Sesame oil (5ml) - seasoning

**Don't just respond with "dried tofu strips", must list all visible ingredients!**

### Example 2: Cold Dressed Tofu Strips (Deluxe)
If the image shows richer cold dressed tofu strips, the foods list should include:
- Dried tofu strips (80g) - main ingredient
- Celery strips (20g) - vegetable
- Carrot strips (15g) - vegetable
- Cilantro (5g) - vegetable
- Scallion strips (5g) - vegetable
- Chili strips (3g) - vegetable
- Sesame oil (5ml) - seasoning
- Soy sauce (10ml) - seasoning
- Sesame seeds (2g) - seasoning

### Example 3: Cold Dressed Jellyfish
If the image shows cold dressed jellyfish, the foods list should include:
- Jellyfish (60g) - main ingredient
- Cucumber strips (25g) - vegetable
- Carrot strips (15g) - vegetable
- Cilantro (5g) - vegetable
- Minced garlic (5g) - seasoning
- Vinegar (10ml) - seasoning
- Sesame oil (5ml) - seasoning

### Example 4: Cold Dressed Wood Ear
If the image shows cold dressed wood ear, the foods list should include:
- Wood ear mushroom (50g) - main ingredient
- Cilantro (10g) - vegetable
- Chili strips (5g) - vegetable
- Scallion strips (5g) - vegetable
- Minced garlic (5g) - seasoning
- Soy sauce (10ml) - seasoning
- Vinegar (5ml) - seasoning

Special Notes:
- Cold dressed dishes usually have multiple ingredients, identify each carefully
- Use colors and shapes to distinguish different ingredients
- Dried tofu strips are the most common main ingredient, pay attention to distinguish
- Don't miss small garnishes (cilantro, scallion strips, sesame seeds)
- Note the oil sheen (sesame oil) and sauce color (soy sauce) on the surface
- If only 1-2 ingredients are identified, there may be omissions, please observe more carefully
- Cold dressed dishes usually have at least 3 ingredients, up to 6-8 ingredients`;
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

## 核心任務（最優先）
**你的首要任務是：識別湯底和所有配料，不要遺漏任何可見的食材！**

## 湯品識別步驟（請按順序執行）

### 步驟 1：識別湯底
- 觀察湯的顏色、濃稠度、透明度
- 判斷湯底類型：
  * 清湯：清澈、淡色、清淡（雞湯、排骨湯、魚湯、柴魚高湯）
  * 濃湯：濃稠、勾芡、奶白色或深色（玉米濃湯、南瓜濃湯）
  * 羹湯：勾芡、濃稠、有料（魚翅羹、酸辣羹、蚵仔麵線）
  * 味噌湯：淡褐色、有味噌顆粒、日式
  * 火鍋湯：紅色（麻辣）或白色（清湯）
- 估算湯底份量（通常 200-300ml）

### 步驟 2：識別配料（從表面到底部）
**請按照以下順序仔細觀察湯中的配料：**

#### 2.1 浮在表面的配料
- 蔥花（5-10g）
- 香菜（5-10g）
- 油花、麻油
- 芝麻、海苔
- 薑絲（5g）
- 辣椒油、辣椒片

#### 2.2 中間層的配料
- 豆腐（嫩豆腐、板豆腐、油豆腐）：每塊 30-50g
- 肉片（豬肉、牛肉、雞肉）：每片 20-30g
- 魚片、魚肉：每片 30-40g
- 蔬菜（白菜、高麗菜、大白菜）：每份 30-50g
- 香菇、金針菇、杏鮑菇：每份 20-30g
- 海鮮（蝦、蛤蜊、花枝）：每隻/個 20-40g
- 蛋（水煮蛋、溫泉蛋）：每個 50-60g

#### 2.3 沉在底部的配料
- 海帶、海帶芽：每片 10-20g
- 紫菜：5-10g
- 麵條、烏龍麵、拉麵：每份 80-120g
- 米粉、粉絲、冬粉：每份 50-80g
- 丸子（貢丸、魚丸、肉丸）：每個 15-25g
- 餃子、餛飩、水餃：每個 20-30g
- 年糕、魚板：每片 20-30g
- 蘿蔔、紅蘿蔔、白蘿蔔：每塊 30-50g
- 玉米、玉米筍：每根 20-30g

### 步驟 3：估算份量
**請為每種配料估算合理的份量，參考以下標準：**

| 食材類型 | 參考份量 |
|---------|---------|
| 湯底 | 200-300ml |
| 豆腐（每塊） | 30-50g |
| 海帶/海帶芽（每片） | 10-20g |
| 蔬菜（每份） | 30-50g |
| 肉片（每片） | 20-30g |
| 蔥花/香菜 | 5-10g |
| 丸子（每個） | 15-25g |
| 麵條（每份） | 80-120g |
| 米粉/粉絲（每份） | 50-80g |

### 步驟 4：完整性檢查
**在提交回應前，請確認：**
- [ ] 已識別湯底類型和份量
- [ ] 已識別浮在表面的所有配料（蔥花、香菜、油等）
- [ ] 已識別中間層的所有配料（豆腐、肉片、蔬菜等）
- [ ] 已識別沉在底部的所有配料（海帶、麵條、丸子等）
- [ ] foods 列表中至少有 3-5 種配料（如果湯中有多種配料）
- [ ] 每種配料都有合理的份量估算
- [ ] 沒有遺漏任何明顯可見的配料

## 常見湯品配料範例

### 味噌湯
**必須識別的配料（至少 3-5 種）：**
- 味噌湯底（250ml）
- 豆腐（嫩豆腐或板豆腐，30-50g）
- 海帶芽（10-15g）
- 蔥花（5-10g）
- 可能有：魚板（20g）、油豆腐（30g）、香菇（20g）、蘿蔔（30g）

### 排骨湯
**必須識別的配料（至少 3-5 種）：**
- 排骨湯底（250ml）
- 排骨（80-100g）
- 白蘿蔔（50-80g）
- 薑片（5g）
- 蔥段（10g）
- 可能有：玉米（40g）、紅蘿蔔（30g）

### 酸辣湯
**必須識別的配料（至少 5-7 種）：**
- 酸辣湯底（250ml）
- 豆腐絲（30g）
- 木耳（20g）
- 筍絲（30g）
- 蛋花（30g）
- 香菜（5g）
- 可能有：肉絲（30g）、紅蘿蔔絲（20g）、香菇絲（20g）

### 蔬菜湯
**必須識別的配料（至少 4-6 種）：**
- 清湯湯底（250ml）
- 高麗菜（40g）
- 紅蘿蔔（30g）
- 玉米（30g）
- 香菇（20g）
- 可能有：番茄（40g）、洋蔥（30g）、芹菜（20g）

## JSON 格式說明

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
      "position": "位置（浮在表面/中間/沉在底部）",
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

## 重要原則

1. **必須識別湯底和所有配料**
   - 湯底是獨立的食材，必須列入 foods 列表
   - 不要只說"味噌湯"或"排骨湯"，要列出湯底和所有配料
   - 每種配料都是獨立的食材，都要列入 foods 列表

2. **最小配料數量要求**
   - 如果湯中明顯有多種配料，foods 列表應至少包含 3-5 種配料（不含湯底）
   - 如果只識別到 1-2 種配料，可能有遺漏，請再仔細觀察

3. **按位置識別配料**
   - 從表面到底部，逐層觀察
   - 不要遺漏浮在表面的小配料（蔥花、香菜、芝麻等）
   - 注意沉在底部的配料（海帶、麵條、丸子等）

4. **份量估算要準確**
   - 每種配料都要估算份量
   - 參考上述份量標準表
   - 湯底份量通常 200-300ml

5. **區分相似食材**
   - 嫩豆腐 vs 板豆腐：嫩豆腐較軟、易碎；板豆腐較硬、有形狀
   - 海帶 vs 海帶芽：海帶較大片、深綠色；海帶芽較小、淺綠色
   - 蔥花 vs 蔥段：蔥花是切碎的、浮在表面；蔥段是長條狀、在湯中

**不要只回應湯品名稱，必須列出湯底和所有配料！**`;
    } else {
      return `You are a food expert specializing in soup identification. Please carefully analyze the soup in this image and identify every ingredient with portion sizes.

## Core Task (Highest Priority)
**Your primary task is: Identify the soup base and ALL ingredients - don't miss any visible components!**

## Soup Identification Steps (Follow in Order)

### Step 1: Identify Soup Base
- Observe soup color, consistency, transparency
- Determine soup base type:
  * Clear soup: Clear, light color, light taste (chicken broth, pork rib broth, fish broth, dashi)
  * Thick soup: Thick, thickened, milky white or dark (corn soup, pumpkin soup)
  * Thick stew: Thickened, thick, with ingredients (shark fin soup, hot and sour stew, oyster vermicelli)
  * Miso soup: Light brown, has miso particles, Japanese style
  * Hot pot soup: Red (spicy) or white (clear)
- Estimate soup base portion (usually 200-300ml)

### Step 2: Identify Ingredients (From Surface to Bottom)
**Please observe soup ingredients in the following order:**

#### 2.1 Ingredients Floating on Surface
- Scallions (5-10g)
- Cilantro (5-10g)
- Oil droplets, sesame oil
- Sesame seeds, seaweed
- Ginger strips (5g)
- Chili oil, chili flakes

#### 2.2 Ingredients in Middle Layer
- Tofu (silken tofu, firm tofu, fried tofu): Each piece 30-50g
- Meat slices (pork, beef, chicken): Each slice 20-30g
- Fish slices, fish meat: Each slice 30-40g
- Vegetables (cabbage, napa cabbage, Chinese cabbage): Each serving 30-50g
- Mushrooms (shiitake, enoki, king oyster): Each serving 20-30g
- Seafood (shrimp, clams, squid): Each piece 20-40g
- Egg (boiled egg, onsen egg): Each 50-60g

#### 2.3 Ingredients at Bottom
- Kelp, wakame: Each piece 10-20g
- Seaweed: 5-10g
- Noodles, udon, ramen: Each serving 80-120g
- Rice noodles, glass noodles, vermicelli: Each serving 50-80g
- Meatballs (pork balls, fish balls, meat balls): Each 15-25g
- Dumplings, wontons, potstickers: Each 20-30g
- Rice cakes, fish cakes: Each piece 20-30g
- Radish, carrot, daikon: Each piece 30-50g
- Corn, baby corn: Each piece 20-30g

### Step 3: Estimate Portions
**Please estimate reasonable portions for each ingredient, reference the following standards:**

| Ingredient Type | Reference Portion |
|----------------|------------------|
| Soup base | 200-300ml |
| Tofu (each piece) | 30-50g |
| Kelp/Wakame (each piece) | 10-20g |
| Vegetables (each serving) | 30-50g |
| Meat slices (each slice) | 20-30g |
| Scallions/Cilantro | 5-10g |
| Meatballs (each) | 15-25g |
| Noodles (each serving) | 80-120g |
| Rice noodles/Vermicelli (each serving) | 50-80g |

### Step 4: Completeness Check
**Before submitting your response, please confirm:**
- [ ] Identified soup base type and portion
- [ ] Identified all ingredients floating on surface (scallions, cilantro, oil, etc.)
- [ ] Identified all ingredients in middle layer (tofu, meat slices, vegetables, etc.)
- [ ] Identified all ingredients at bottom (kelp, noodles, meatballs, etc.)
- [ ] Foods list contains at least 3-5 ingredients (if soup has multiple ingredients)
- [ ] Each ingredient has a reasonable portion estimate
- [ ] No obvious visible ingredients are missing

## Common Soup Ingredient Examples

### Miso Soup
**Must identify ingredients (at least 3-5 types):**
- Miso soup base (250ml)
- Tofu (silken or firm tofu, 30-50g)
- Wakame (10-15g)
- Scallions (5-10g)
- Possibly: Fish cake (20g), fried tofu (30g), mushrooms (20g), radish (30g)

### Pork Rib Soup
**Must identify ingredients (at least 3-5 types):**
- Pork rib broth (250ml)
- Pork ribs (80-100g)
- Daikon radish (50-80g)
- Ginger slices (5g)
- Scallion segments (10g)
- Possibly: Corn (40g), carrot (30g)

### Hot and Sour Soup
**Must identify ingredients (at least 5-7 types):**
- Hot and sour soup base (250ml)
- Tofu strips (30g)
- Wood ear mushroom (20g)
- Bamboo shoot strips (30g)
- Egg ribbons (30g)
- Cilantro (5g)
- Possibly: Pork strips (30g), carrot strips (20g), mushroom strips (20g)

### Vegetable Soup
**Must identify ingredients (at least 4-6 types):**
- Clear broth base (250ml)
- Cabbage (40g)
- Carrot (30g)
- Corn (30g)
- Mushrooms (20g)
- Possibly: Tomato (40g), onion (30g), celery (20g)

## JSON Format

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
      "position": "position (floating on surface/middle/at bottom)",
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

## Important Principles

1. **Must identify soup base and all ingredients**
   - Soup base is an independent ingredient, must be included in foods list
   - Don't just say "miso soup" or "pork rib soup", list soup base and all ingredients
   - Each ingredient is independent, all must be included in foods list

2. **Minimum ingredient count requirement**
   - If soup clearly has multiple ingredients, foods list should contain at least 3-5 ingredients (excluding soup base)
   - If only 1-2 ingredients identified, there may be omissions, please observe more carefully

3. **Identify ingredients by position**
   - Observe layer by layer from surface to bottom
   - Don't miss small garnishes floating on surface (scallions, cilantro, sesame, etc.)
   - Note ingredients at bottom (kelp, noodles, meatballs, etc.)

4. **Accurate portion estimation**
   - Estimate portion for each ingredient
   - Reference the portion standards table above
   - Soup base portion usually 200-300ml

5. **Distinguish similar ingredients**
   - Silken tofu vs firm tofu: Silken tofu is softer, easily broken; firm tofu is harder, holds shape
   - Kelp vs wakame: Kelp is larger pieces, dark green; wakame is smaller, light green
   - Chopped scallions vs scallion segments: Chopped scallions are minced, float on surface; scallion segments are long strips, in soup

**Don't just respond with soup name, must list soup base and all ingredients!**`;
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
      return `你是一個專精於混合菜餚識別的食物專家。

## 核心任務（最優先）
**你的首要任務是：逐一識別圖片中的每一種食材，不要遺漏任何可見的食材。**

混合菜餚通常包含多種食材混合在一起，請務必仔細觀察並列出所有食材。

## 識別步驟（請按順序執行）

### 步驟 1：整體觀察
- 判斷菜餚類型（便當、拌飯、炒飯、炒麵、定食等）
- 觀察食材的分布和層次
- 注意是否有多個區域或隔間

### 步驟 2：系統化識別策略

**請按照以下順序逐一識別每種食材：**

#### 2.1 從大到小識別
1. **大塊食材**（最明顯）
   - 主要肉類（雞腿、排骨、魚片等）
   - 大塊蔬菜（花椰菜、高麗菜等）
   - 主食（飯、麵、粉）

2. **中等食材**
   - 切塊的肉類（肉片、肉絲）
   - 切塊的蔬菜（胡蘿蔔、馬鈴薯等）
   - 豆製品（豆腐、豆干）
   - 蛋類（煎蛋、滷蛋）

3. **小型食材**（容易遺漏）
   - 小配料（蔥花、香菜、芝麻、蒜片）
   - 小蔬菜（豆芽、玉米粒、豌豆）
   - 調味料（醬汁、油、香料）

#### 2.2 從明顯到細微識別
1. **表面可見的食材**
   - 最上層的食材
   - 顏色鮮豔、對比明顯的食材
   - 形狀特殊、容易辨識的食材

2. **部分可見的食材**
   - 半遮蓋的食材
   - 混合在一起的食材
   - 需要仔細觀察才能發現的食材

3. **隱藏的食材**（特別注意）
   - 藏在下層的食材（飯下、麵下、湯底）
   - 混在醬汁中的食材
   - 被其他食材遮蓋的配料

### 步驟 3：分層檢查

**請特別注意不同層次的食材：**

- **上層**：表面可見的食材
  * 配菜、裝飾、醬汁
  * 例如：蔥花、芝麻、香菜

- **中層**：主要食材層
  * 主菜、配菜、蔬菜
  * 例如：肉類、豆腐、蔬菜

- **下層**：基底食材（容易被忽略）
  * 主食、湯底、醬汁
  * 例如：米飯、麵條、湯底
  * **重要**：即使被遮蓋，也要識別出來

### 步驟 4：完整性檢查

在完成識別後，請確認是否包含以下各類食材：

#### 主食類（必須識別）
- [ ] 米飯、炒飯、白飯
- [ ] 麵條、炒麵、湯麵
- [ ] 粉類、米粉、冬粉

#### 主菜類（必須識別）
- [ ] 肉類（豬、牛、雞、羊）
- [ ] 海鮮（魚、蝦、蟹、貝類）
- [ ] 豆製品（豆腐、豆干、豆皮）
- [ ] 蛋類（煎蛋、滷蛋、炒蛋）

#### 配菜類（必須識別）
- [ ] 綠色蔬菜（青菜、花椰菜、豆芽）
- [ ] 根莖類（胡蘿蔔、馬鈴薯、蘿蔔）
- [ ] 其他蔬菜（玉米、豌豆、菇類）

#### 調味料類（不要遺漏）
- [ ] 醬汁（醬油、蠔油、辣椒醬）
- [ ] 油脂（麻油、食用油）
- [ ] 小配料（蔥花、香菜、蒜片、薑絲、芝麻）

## 常見混合菜餚類型

### 便當類
- 特徵：多個隔間，每個隔間有不同菜色
- 必須識別：主菜、配菜1、配菜2、配菜3、米飯
- 範例：排骨便當應包含：排骨、高麗菜、滷蛋、豆干、白飯

### 拌飯類
- 特徵：多種食材鋪在飯上
- 必須識別：米飯（底層）、所有配料（上層）
- 範例：石鍋拌飯應包含：米飯、牛肉、蔬菜、蛋、芝麻、辣椒醬

### 炒飯/炒麵類
- 特徵：食材混合炒在一起
- 必須識別：主食、所有混合的食材
- 範例：海鮮炒飯應包含：米飯、蝦仁、花枝、蛋、蔥花、豌豆、胡蘿蔔

### 定食類
- 特徵：主菜+多個配菜+飯+湯
- 必須識別：每一道菜的所有食材
- 範例：日式定食應包含：主菜（魚/肉）、米飯、味噌湯、醃漬物、小菜

## JSON 格式說明

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

## 完整性檢查清單

在提交回應前，請確認：
- [ ] 已識別所有主食（飯、麵、粉）
- [ ] 已識別所有主菜（肉類、海鮮、豆製品、蛋類）
- [ ] 已識別所有配菜（各種蔬菜）
- [ ] 已識別所有小配料（蔥花、香菜、蒜片、芝麻等）
- [ ] 已識別所有調味料（醬汁、油）
- [ ] 已檢查上層、中層、下層的食材
- [ ] 已檢查被遮蓋或隱藏的食材
- [ ] foods 列表中至少有 5-8 種食材（混合菜餚通常有多種食材）
- [ ] 每種食材都有合理的份量估算
- [ ] 沒有遺漏任何明顯可見的食材

## 重要原則

1. **逐一識別，不要概括**
   - ❌ 錯誤：「便當」
   - ✅ 正確：「排骨（100g）、高麗菜（50g）、滷蛋（60g）、豆干（30g）、白飯（200g）」

2. **不要遺漏隱藏的食材**
   - 特別注意被遮蓋的主食（飯、麵）
   - 注意混在醬汁中的小配料
   - 注意沉在湯底的食材

3. **從大到小，從明顯到細微**
   - 先識別大塊、明顯的食材
   - 再識別中等大小的食材
   - 最後識別小配料和調味料

4. **分層檢查**
   - 上層：表面食材
   - 中層：主要食材
   - 下層：基底食材（不要忘記）

## 範例

### 範例 1：排骨便當
如果圖片中有排骨便當，foods 列表應包含：
- 白飯（200g）- 下層
- 炸排骨（120g）- 主菜
- 高麗菜（50g）- 配菜
- 滷蛋（60g）- 配菜
- 豆干（30g）- 配菜
- 醬汁（10ml）- 調味料

**不要只回應「排骨便當」，必須列出所有食材！**

### 範例 2：石鍋拌飯
如果圖片中有石鍋拌飯，foods 列表應包含：
- 米飯（250g）- 下層
- 牛肉片（80g）- 主菜
- 菠菜（30g）- 配菜
- 豆芽（30g）- 配菜
- 胡蘿蔔絲（20g）- 配菜
- 香菇（20g）- 配菜
- 蛋黃（50g）- 配菜
- 芝麻（5g）- 調味料
- 辣椒醬（15g）- 調味料
- 麻油（5ml）- 調味料

**不要只回應「石鍋拌飯」，必須列出所有食材，包括底層的米飯！**

### 範例 3：海鮮炒飯
如果圖片中有海鮮炒飯，foods 列表應包含：
- 米飯（200g）- 主食
- 蝦仁（50g）- 主菜
- 花枝（40g）- 主菜
- 蛋（50g）- 配菜
- 蔥花（10g）- 配菜
- 豌豆（20g）- 配菜
- 胡蘿蔔丁（15g）- 配菜
- 玉米粒（15g）- 配菜
- 醬油（10ml）- 調味料

**不要只回應「海鮮炒飯」，必須列出所有混合的食材！**

特別提醒：
- 混合菜餚的 foods 列表通常應該有 5-10 種以上的食材
- 如果你只識別出 1-3 種食材，請再仔細觀察，很可能遺漏了其他食材
- 特別注意檢查下層的主食（飯、麵）是否已識別`;
    } else {
      return `You are a food expert specializing in mixed dish identification.

## Core Task (Highest Priority)
**Your primary task is: Identify each ingredient in the image one by one, do not miss any visible ingredients.**

Mixed dishes usually contain multiple ingredients mixed together, please observe carefully and list all ingredients.

## Identification Steps (Follow in Order)

### Step 1: Overall Observation
- Determine dish type (bento, mixed rice, fried rice, fried noodles, set meal, etc.)
- Observe ingredient distribution and layers
- Note if there are multiple sections or compartments

### Step 2: Systematic Identification Strategy

**Please identify each ingredient in the following order:**

#### 2.1 From Large to Small
1. **Large Ingredients** (Most obvious)
   - Main meats (chicken leg, pork chop, fish fillet, etc.)
   - Large vegetables (broccoli, cabbage, etc.)
   - Staples (rice, noodles, vermicelli)

2. **Medium Ingredients**
   - Sliced meats (meat slices, shredded meat)
   - Chopped vegetables (carrots, potatoes, etc.)
   - Soy products (tofu, dried tofu)
   - Eggs (fried egg, braised egg)

3. **Small Ingredients** (Easy to miss)
   - Small garnishes (scallions, cilantro, sesame, garlic slices)
   - Small vegetables (bean sprouts, corn kernels, peas)
   - Seasonings (sauces, oils, spices)

#### 2.2 From Obvious to Subtle
1. **Surface Visible Ingredients**
   - Top layer ingredients
   - Brightly colored, high contrast ingredients
   - Uniquely shaped, easily identifiable ingredients

2. **Partially Visible Ingredients**
   - Half-covered ingredients
   - Mixed ingredients
   - Ingredients requiring careful observation

3. **Hidden Ingredients** (Special attention)
   - Ingredients hidden in lower layers (under rice, noodles, soup base)
   - Ingredients mixed in sauce
   - Ingredients covered by other ingredients

### Step 3: Layer-by-Layer Check

**Please pay special attention to ingredients at different layers:**

- **Top Layer**: Surface visible ingredients
  * Side dishes, garnishes, sauces
  * Example: Scallions, sesame, cilantro

- **Middle Layer**: Main ingredient layer
  * Main dishes, side dishes, vegetables
  * Example: Meats, tofu, vegetables

- **Bottom Layer**: Base ingredients (easily overlooked)
  * Staples, soup base, sauces
  * Example: Rice, noodles, soup base
  * **Important**: Even if covered, must identify

### Step 4: Completeness Check

After identification, confirm if the following categories are included:

#### Staples (Must identify)
- [ ] Rice, fried rice, white rice
- [ ] Noodles, fried noodles, soup noodles
- [ ] Vermicelli, rice noodles, glass noodles

#### Main Dishes (Must identify)
- [ ] Meats (pork, beef, chicken, lamb)
- [ ] Seafood (fish, shrimp, crab, shellfish)
- [ ] Soy products (tofu, dried tofu, tofu skin)
- [ ] Eggs (fried egg, braised egg, scrambled egg)

#### Side Dishes (Must identify)
- [ ] Green vegetables (greens, broccoli, bean sprouts)
- [ ] Root vegetables (carrots, potatoes, radish)
- [ ] Other vegetables (corn, peas, mushrooms)

#### Seasonings (Don't miss)
- [ ] Sauces (soy sauce, oyster sauce, chili sauce)
- [ ] Oils (sesame oil, cooking oil)
- [ ] Small garnishes (scallions, cilantro, garlic slices, ginger, sesame)

## Common Mixed Dish Types

### Bento
- Features: Multiple compartments, different dishes in each
- Must identify: Main dish, side dish 1, side dish 2, side dish 3, rice
- Example: Pork chop bento should include: pork chop, cabbage, braised egg, dried tofu, white rice

### Mixed Rice
- Features: Multiple ingredients on top of rice
- Must identify: Rice (bottom layer), all toppings (top layer)
- Example: Bibimbap should include: rice, beef, vegetables, egg, sesame, chili sauce

### Fried Rice/Noodles
- Features: Ingredients mixed and stir-fried together
- Must identify: Staple, all mixed ingredients
- Example: Seafood fried rice should include: rice, shrimp, squid, egg, scallions, peas, carrots

### Set Meal
- Features: Main dish + multiple sides + rice + soup
- Must identify: All ingredients in each dish
- Example: Japanese set meal should include: main dish (fish/meat), rice, miso soup, pickles, side dishes

## JSON Format

Respond in JSON format:
{
  "foods": [
    {
      "name": "ingredient name",
      "confidence": 0.95,
      "portion": 100,
      "category": "food category",
      "role": "staple/main dish/side dish/seasoning",
      "position": "position (top/middle/bottom layer)",
      "visualFeatures": "visual features",
      "description": "description"
    }
  ],
  "dishType": "mixed dish",
  "dishName": "dish name (e.g., bento, mixed rice, etc.)",
  "totalIngredients": 8,
  "mainComponents": {
    "staple": "staple food",
    "mainDish": "main dish",
    "sideDishes": ["list of side dishes"]
  },
  "cookingMethods": ["list of cooking methods"],
  "overallDescription": "overall description"
}

## Completeness Checklist

Before submitting response, confirm:
- [ ] Identified all staples (rice, noodles, vermicelli)
- [ ] Identified all main dishes (meats, seafood, soy products, eggs)
- [ ] Identified all side dishes (various vegetables)
- [ ] Identified all small garnishes (scallions, cilantro, garlic slices, sesame, etc.)
- [ ] Identified all seasonings (sauces, oils)
- [ ] Checked ingredients in top, middle, bottom layers
- [ ] Checked covered or hidden ingredients
- [ ] Foods list contains at least 5-8 ingredients (mixed dishes usually have multiple ingredients)
- [ ] Each ingredient has reasonable portion estimate
- [ ] No obvious visible ingredients are missing

## Important Principles

1. **Identify one by one, don't generalize**
   - ❌ Wrong: "Bento"
   - ✅ Correct: "Pork chop (100g), cabbage (50g), braised egg (60g), dried tofu (30g), white rice (200g)"

2. **Don't miss hidden ingredients**
   - Pay special attention to covered staples (rice, noodles)
   - Note small garnishes mixed in sauce
   - Note ingredients at bottom of soup

3. **From large to small, from obvious to subtle**
   - First identify large, obvious ingredients
   - Then identify medium-sized ingredients
   - Finally identify small garnishes and seasonings

4. **Layer-by-layer check**
   - Top layer: Surface ingredients
   - Middle layer: Main ingredients
   - Bottom layer: Base ingredients (don't forget)

## Examples

### Example 1: Pork Chop Bento
If image shows pork chop bento, foods list should include:
- White rice (200g) - bottom layer
- Fried pork chop (120g) - main dish
- Cabbage (50g) - side dish
- Braised egg (60g) - side dish
- Dried tofu (30g) - side dish
- Sauce (10ml) - seasoning

**Don't just respond "pork chop bento", must list all ingredients!**

### Example 2: Bibimbap
If image shows bibimbap, foods list should include:
- Rice (250g) - bottom layer
- Beef slices (80g) - main dish
- Spinach (30g) - side dish
- Bean sprouts (30g) - side dish
- Carrot strips (20g) - side dish
- Mushrooms (20g) - side dish
- Egg yolk (50g) - side dish
- Sesame (5g) - seasoning
- Chili sauce (15g) - seasoning
- Sesame oil (5ml) - seasoning

**Don't just respond "bibimbap", must list all ingredients including bottom layer rice!**

### Example 3: Seafood Fried Rice
If image shows seafood fried rice, foods list should include:
- Rice (200g) - staple
- Shrimp (50g) - main dish
- Squid (40g) - main dish
- Egg (50g) - side dish
- Scallions (10g) - side dish
- Peas (20g) - side dish
- Carrot cubes (15g) - side dish
- Corn kernels (15g) - side dish
- Soy sauce (10ml) - seasoning

**Don't just respond "seafood fried rice", must list all mixed ingredients!**

Special Reminder:
- Mixed dish foods list should usually have 5-10+ ingredients
- If you only identify 1-3 ingredients, please observe more carefully, likely missing other ingredients
- Pay special attention to check if bottom layer staples (rice, noodles) are identified`;
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
