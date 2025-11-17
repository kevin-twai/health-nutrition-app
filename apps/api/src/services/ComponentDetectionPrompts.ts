/**
 * 成分識別 Prompt 擴展
 * 
 * 此文件包含用於成分識別的 prompt 生成方法
 * 這些方法將被整合到 EnhancedPromptGenerator 類中
 */

import { DishType } from '../types/ComponentDetection';

/**
 * 成分識別 Prompt 配置接口
 */
export interface ComponentDetectionPromptConfig {
  dishName: string;
  dishType: DishType;
  region?: string;
  language?: 'zh-TW' | 'en';
}

/**
 * 成分精煉 Prompt 配置接口
 */
export interface ComponentRefinementPromptConfig {
  initialComponents: Array<{
    name: string;
    confidence: number;
    estimatedPortion: number;
  }>;
  dishContext: string;
  language?: 'zh-TW' | 'en';
}

/**
 * 生成成分識別 Prompt（湯品類）
 */
export function generateSoupComponentPrompt(language: 'zh-TW' | 'en' = 'zh-TW'): string {
  if (language === 'zh-TW') {
    return `請仔細分析這張湯品圖片，識別所有配料和成分：

**湯品成分識別重點：**

1. **湯底類型**：
   - 清湯（清澈、淡色）
   - 濃湯（濃稠、勾芡）
   - 味噌湯（淡褐色、有味噌顆粒）
   - 羹湯（勾芡、濃稠）

2. **固體配料**（請仔細識別每一種）：
   - 蛋白質類：豆腐、肉片、魚片、蛋、海鮮
   - 蔬菜類：白菜、蘿蔔、香菇、海帶、蔥
   - 其他：丸子、餃子、麵條、米粉

3. **份量估算**：
   - 豆腐：每塊約 30-50g
   - 海帶：每片約 10-20g
   - 蔬菜：每份約 30-50g
   - 肉片：每片約 20-30g
   - 湯底：約 200-300ml

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "成分名稱（繁體中文）",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "protein/vegetable/grain/seasoning",
      "cookingMethod": "boiled/steamed/raw",
      "visualFeatures": {
        "color": ["顏色"],
        "shape": "形狀",
        "texture": "質地",
        "position": "浮在表面/沉在底部/中間"
      }
    }
  ],
  "soupBase": {
    "type": "清湯/濃湯/味噌湯/羹湯",
    "estimatedVolume": 250,
    "color": "湯色描述"
  }
}

**特別注意**：
- 必須識別湯中的每一種食材
- 每種食材都要估算份量
- 注意不同位置的食材（表面、底部、中間）
- 湯底也要計算份量`;
  } else {
    return `Please carefully analyze this soup image and identify all ingredients and components:

**Soup Component Recognition Focus:**

1. **Soup Base Type**:
   - Clear soup (clear, light color)
   - Thick soup (thick, thickened)
   - Miso soup (light brown, has miso particles)
   - Stew (thickened, thick)

2. **Solid Ingredients** (identify each carefully):
   - Protein: Tofu, meat slices, fish slices, eggs, seafood
   - Vegetables: Cabbage, radish, mushrooms, kelp, scallions
   - Others: Meatballs, dumplings, noodles, rice noodles

3. **Portion Estimation**:
   - Tofu: Each piece about 30-50g
   - Kelp: Each piece about 10-20g
   - Vegetables: Each serving about 30-50g
   - Meat slices: Each slice about 20-30g
   - Soup base: About 200-300ml

Respond in JSON format:
{
  "components": [
    {
      "name": "component name",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "protein/vegetable/grain/seasoning",
      "cookingMethod": "boiled/steamed/raw",
      "visualFeatures": {
        "color": ["colors"],
        "shape": "shape",
        "texture": "texture",
        "position": "floating/bottom/middle"
      }
    }
  ],
  "soupBase": {
    "type": "clear/thick/miso/stew",
    "estimatedVolume": 250,
    "color": "soup color description"
  }
}

**Special Notes**:
- Must identify every ingredient in the soup
- Estimate portion for each ingredient
- Note ingredients at different positions
- Calculate soup base portion`;
  }
}

/**
 * 生成成分識別 Prompt（炒飯類）
 */
export function generateFriedRiceComponentPrompt(language: 'zh-TW' | 'en' = 'zh-TW'): string {
  if (language === 'zh-TW') {
    return `請仔細分析這張炒飯圖片，識別所有成分：

**炒飯成分識別重點：**

1. **主食**：
   - 米飯類型（白飯、糙米飯、炒飯）
   - 估計份量（通常 150-300g）

2. **蛋白質**：
   - 蛋（炒蛋、蛋絲）
   - 肉類（火腿、香腸、雞肉、蝦仁）
   - 豆製品（豆干）

3. **蔬菜**：
   - 青蔥、蔥花
   - 青豆、玉米
   - 胡蘿蔔丁
   - 其他蔬菜

4. **調味料**（可見的）：
   - 醬油（深色）
   - 蔥花、蒜末

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "成分名稱（繁體中文）",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "stir_fried",
      "visualFeatures": {
        "color": ["顏色"],
        "shape": "形狀",
        "texture": "質地",
        "position": "混合在飯中/表面"
      }
    }
  ],
  "totalPortion": 300
}

**特別注意**：
- 炒飯中的成分通常混合在一起
- 注意識別小顆粒的配料（青豆、玉米、胡蘿蔔丁）
- 蛋通常呈金黃色碎塊
- 估算米飯的總份量`;
  } else {
    return `Please carefully analyze this fried rice image and identify all components:

**Fried Rice Component Recognition Focus:**

1. **Staple**:
   - Rice type (white rice, brown rice, fried rice)
   - Estimated portion (usually 150-300g)

2. **Protein**:
   - Egg (scrambled egg, egg strips)
   - Meat (ham, sausage, chicken, shrimp)
   - Soy products (dried tofu)

3. **Vegetables**:
   - Scallions, chopped scallions
   - Green peas, corn
   - Carrot cubes
   - Other vegetables

4. **Seasonings** (visible):
   - Soy sauce (dark color)
   - Scallions, minced garlic

Respond in JSON format:
{
  "components": [
    {
      "name": "component name",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "stir_fried",
      "visualFeatures": {
        "color": ["colors"],
        "shape": "shape",
        "texture": "texture",
        "position": "mixed in rice/on surface"
      }
    }
  ],
  "totalPortion": 300
}

**Special Notes**:
- Components in fried rice are usually mixed together
- Note small particle ingredients (peas, corn, carrot cubes)
- Egg usually appears as golden yellow pieces
- Estimate total rice portion`;
  }
}

/**
 * 生成成分識別 Prompt（炒菜類）
 */
export function generateStirFryComponentPrompt(language: 'zh-TW' | 'en' = 'zh-TW'): string {
  if (language === 'zh-TW') {
    return `請仔細分析這張炒菜圖片，識別所有成分：

**炒菜成分識別重點：**

1. **主要食材**：
   - 蔬菜類（青江菜、高麗菜、豆芽菜等）
   - 蛋白質（肉絲、雞丁、海鮮、豆製品）
   - 主食（麵條、米飯）- 如果是炒飯或炒麵

2. **混合成分識別**：
   - 炒菜中的成分通常混合在一起
   - 注意識別每一種食材，即使混在一起
   - 區分主要食材和配料

3. **調味料和配料**：
   - 蒜頭、蒜片、蒜末
   - 薑片、薑絲
   - 辣椒、乾辣椒
   - 青蔥、蔥段
   - 花生、腰果（如宮保雞丁）

4. **份量估算**：
   - 主要食材：100-200g
   - 蛋白質：50-150g
   - 配料：5-30g
   - 調味料：3-15g

5. **烹飪特徵**：
   - 所有成分都是炒製的
   - 注意油亮的表面（表示用油量）
   - 顏色變化（炒製後的顏色）

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "成分名稱（繁體中文）",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning/garnish",
      "cookingMethod": "stir_fried",
      "visualFeatures": {
        "color": ["顏色"],
        "shape": "形狀",
        "texture": "質地",
        "position": "混合/表面/底部",
        "cookingDegree": "生/半熟/全熟/過熟"
      }
    }
  ],
  "dishCharacteristics": {
    "oilLevel": "少油/中油/多油",
    "mixingDegree": "分離/部分混合/完全混合",
    "mainIngredient": "主要食材名稱"
  }
}

**特別注意**：
- 炒菜中的成分經常混合在一起，需要仔細識別
- 注意小顆粒的配料（蒜末、薑末、辣椒碎）
- 估算油的使用量（從表面光澤判斷）
- 區分主要食材和調味配料
- 對於炒飯和炒麵，要識別所有混合的成分
- 對於宮保雞丁等特色菜，注意特殊配料（花生、乾辣椒）`;
  } else {
    return `Please carefully analyze this stir-fry image and identify all components:

**Stir-Fry Component Recognition Focus:**

1. **Main Ingredients**:
   - Vegetables (bok choy, cabbage, bean sprouts, etc.)
   - Protein (meat strips, chicken cubes, seafood, soy products)
   - Staple (noodles, rice) - if fried rice or fried noodles

2. **Mixed Component Recognition**:
   - Components in stir-fry are usually mixed together
   - Identify each ingredient even if mixed
   - Distinguish main ingredients from seasonings

3. **Seasonings and Toppings**:
   - Garlic, garlic slices, minced garlic
   - Ginger slices, ginger strips
   - Chili, dried chili
   - Scallions, scallion sections
   - Peanuts, cashews (e.g., Kung Pao Chicken)

4. **Portion Estimation**:
   - Main ingredients: 100-200g
   - Protein: 50-150g
   - Toppings: 5-30g
   - Seasonings: 3-15g

5. **Cooking Characteristics**:
   - All components are stir-fried
   - Note glossy surface (indicates oil amount)
   - Color changes (color after stir-frying)

Respond in JSON format:
{
  "components": [
    {
      "name": "component name",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning/garnish",
      "cookingMethod": "stir_fried",
      "visualFeatures": {
        "color": ["colors"],
        "shape": "shape",
        "texture": "texture",
        "position": "mixed/surface/bottom",
        "cookingDegree": "raw/half-cooked/fully-cooked/overcooked"
      }
    }
  ],
  "dishCharacteristics": {
    "oilLevel": "low oil/medium oil/high oil",
    "mixingDegree": "separated/partially mixed/fully mixed",
    "mainIngredient": "main ingredient name"
  }
}

**Special Notes**:
- Components in stir-fry are often mixed together, need careful identification
- Note small particle toppings (minced garlic, minced ginger, chili flakes)
- Estimate oil usage (judge from surface gloss)
- Distinguish main ingredients from seasoning toppings
- For fried rice and fried noodles, identify all mixed components
- For specialty dishes like Kung Pao Chicken, note special toppings (peanuts, dried chili)`;
  }
}

/**
 * 生成成分識別 Prompt（便當類）
 */
export function generateBentoComponentPrompt(language: 'zh-TW' | 'en' = 'zh-TW'): string {
  if (language === 'zh-TW') {
    return `請仔細分析這張便當圖片，識別各個區域的食物：

**便當成分識別重點：**

1. **主食區**（通常佔 1/3-1/2）：
   - 米飯或其他主食
   - 估計份量

2. **主菜區**（通常 1-2 個）：
   - 主要蛋白質（肉類、魚類、蛋類）
   - 烹飪方式（炸、烤、滷、煎等）
   - 估計份量

3. **配菜區**（通常 2-4 個）：
   - 蔬菜類配菜
   - 醃漬物
   - 其他小菜
   - 各自的份量

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "食物名稱（繁體中文）",
      "confidence": 0.95,
      "estimatedPortion": 100,
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "fried/grilled/braised/steamed",
      "role": "主食/主菜/配菜",
      "position": "左上/右上/左下/右下/中間",
      "visualFeatures": {
        "color": ["顏色"],
        "shape": "形狀",
        "texture": "質地"
      }
    }
  ],
  "bentoLayout": {
    "staple": "主食名稱",
    "mainDish": ["主菜列表"],
    "sideDishes": ["配菜列表"]
  }
}

**特別注意**：
- 便當通常有明確的區域劃分
- 識別每個區域的所有食物
- 注意主菜和配菜的區別
- 估算每個食物的份量`;
  } else {
    return `Please carefully analyze this bento image and identify food in each area:

**Bento Component Recognition Focus:**

1. **Staple Area** (usually 1/3-1/2):
   - Rice or other staple
   - Estimated portion

2. **Main Dish Area** (usually 1-2):
   - Main protein (meat, fish, eggs)
   - Cooking method (fried, grilled, braised, steamed)
   - Estimated portion

3. **Side Dish Area** (usually 2-4):
   - Vegetable side dishes
   - Pickles
   - Other small dishes
   - Individual portions

Respond in JSON format:
{
  "components": [
    {
      "name": "food name",
      "confidence": 0.95,
      "estimatedPortion": 100,
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "fried/grilled/braised/steamed",
      "role": "staple/main dish/side dish",
      "position": "top left/top right/bottom left/bottom right/center",
      "visualFeatures": {
        "color": ["colors"],
        "shape": "shape",
        "texture": "texture"
      }
    }
  ],
  "bentoLayout": {
    "staple": "staple name",
    "mainDish": ["main dish list"],
    "sideDishes": ["side dish list"]
  }
}

**Special Notes**:
- Bentos usually have clear area divisions
- Identify all food in each area
- Note difference between main and side dishes
- Estimate portion of each food`;
  }
}

/**
 * 生成成分識別 Prompt（麵食類）
 */
export function generateNoodlesComponentPrompt(language: 'zh-TW' | 'en' = 'zh-TW'): string {
  if (language === 'zh-TW') {
    return `請仔細分析這張麵食圖片，識別所有成分：

**麵食成分識別重點：**

1. **麵條類型**：
   - 拉麵、烏龍麵、蕎麥麵、米粉、河粉等
   - 估計份量（通常 150-250g）

2. **湯底**（如果是湯麵）：
   - 湯底類型（清湯、濃湯、味噌、豚骨等）
   - 估計湯量（200-400ml）

3. **配料**：
   - 蛋白質：叉燒、肉片、蛋、海鮮
   - 蔬菜：青菜、筍、蔥、海帶
   - 其他：魚板、海苔、芝麻

4. **調味料**（可見的）：
   - 蔥花、薑絲、辣油、芝麻

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "成分名稱（繁體中文）",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "boiled/fried/steamed",
      "visualFeatures": {
        "color": ["顏色"],
        "shape": "形狀",
        "texture": "質地",
        "position": "麵上/湯中/表面"
      }
    }
  ],
  "noodleType": "拉麵/烏龍麵/米粉等",
  "soupBase": {
    "type": "清湯/濃湯/味噌/豚骨",
    "estimatedVolume": 300
  },
  "isDrySoup": false
}

**特別注意**：
- 區分湯麵和乾麵
- 識別麵條的類型
- 注意配料的位置（麵上、湯中、表面）
- 估算麵條和湯的份量`;
  } else {
    return `Please carefully analyze this noodle image and identify all components:

**Noodle Component Recognition Focus:**

1. **Noodle Type**:
   - Ramen, udon, soba, rice noodles, rice sheets, etc.
   - Estimated portion (usually 150-250g)

2. **Soup Base** (if soup noodles):
   - Soup type (clear, thick, miso, tonkotsu, etc.)
   - Estimated soup volume (200-400ml)

3. **Toppings**:
   - Protein: Char siu, meat slices, eggs, seafood
   - Vegetables: Greens, bamboo shoots, scallions, kelp
   - Others: Fish cake, nori, sesame

4. **Seasonings** (visible):
   - Scallions, ginger strips, chili oil, sesame

Respond in JSON format:
{
  "components": [
    {
      "name": "component name",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "boiled/fried/steamed",
      "visualFeatures": {
        "color": ["colors"],
        "shape": "shape",
        "texture": "texture",
        "position": "on noodles/in soup/on surface"
      }
    }
  ],
  "noodleType": "ramen/udon/rice noodles, etc.",
  "soupBase": {
    "type": "clear/thick/miso/tonkotsu",
    "estimatedVolume": 300
  },
  "isDrySoup": false
}

**Special Notes**:
- Distinguish between soup and dry noodles
- Identify noodle type
- Note topping positions (on noodles, in soup, on surface)
- Estimate noodle and soup portions`;
  }
}

/**
 * 生成通用成分識別 Prompt
 */
export function generateGenericComponentPrompt(dishName: string, language: 'zh-TW' | 'en' = 'zh-TW'): string {
  if (language === 'zh-TW') {
    return `請仔細分析這張「${dishName}」的圖片，識別所有可見的成分：

**成分識別重點：**

1. **主要成分**：
   - 主食（米飯、麵條等）
   - 蛋白質（肉類、蛋、豆製品、海鮮）
   - 蔬菜

2. **配料和調味料**：
   - 可見的配料（蔥、蒜、辣椒等）
   - 醬料（醬油、辣醬等）

3. **份量估算**：
   - 為每個成分估算份量（克）
   - 考慮成分在料理中的比例

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "成分名稱（繁體中文）",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning/sauce/garnish",
      "cookingMethod": "raw/boiled/fried/steamed/grilled/braised",
      "visualFeatures": {
        "color": ["顏色"],
        "shape": "形狀",
        "texture": "質地",
        "position": "位置描述"
      }
    }
  ]
}

**特別注意**：
- 識別所有可見的成分
- 估算每個成分的份量
- 注意烹飪方式
- 區分主要成分和配料`;
  } else {
    return `Please carefully analyze this "${dishName}" image and identify all visible components:

**Component Recognition Focus:**

1. **Main Components**:
   - Staple (rice, noodles, etc.)
   - Protein (meat, eggs, soy products, seafood)
   - Vegetables

2. **Toppings and Seasonings**:
   - Visible toppings (scallions, garlic, chili, etc.)
   - Sauces (soy sauce, chili sauce, etc.)

3. **Portion Estimation**:
   - Estimate portion for each component (grams)
   - Consider component proportion in the dish

Respond in JSON format:
{
  "components": [
    {
      "name": "component name",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "category": "grain/protein/vegetable/seasoning/sauce/garnish",
      "cookingMethod": "raw/boiled/fried/steamed/grilled/braised",
      "visualFeatures": {
        "color": ["colors"],
        "shape": "shape",
        "texture": "texture",
        "position": "position description"
      }
    }
  ]
}

**Special Notes**:
- Identify all visible components
- Estimate portion of each component
- Note cooking method
- Distinguish main components from toppings`;
  }
}

/**
 * 生成成分精煉 Prompt（用於低信心度成分的二次確認）
 */
export function generateComponentRefinementPrompt(
  config: ComponentRefinementPromptConfig
): string {
  const { initialComponents, dishContext, language = 'zh-TW' } = config;

  if (language === 'zh-TW') {
    const componentList = initialComponents
      .map((c, i) => `${i + 1}. ${c.name} (信心度: ${(c.confidence * 100).toFixed(0)}%, 份量: ${c.estimatedPortion}g)`)
      .join('\n');

    return `請重新檢查以下成分的識別結果，特別是信心度較低的項目：

**料理背景**：${dishContext}

**初步識別的成分**：
${componentList}

**請仔細檢查並確認：**

1. **成分名稱是否正確**：
   - 是否有誤判的情況？
   - 是否有相似食材被混淆？

2. **份量估算是否合理**：
   - 份量是否符合該料理的典型比例？
   - 是否需要調整？

3. **是否有遺漏的成分**：
   - 圖片中是否還有其他可見的成分未被識別？
   - 是否有隱藏在下層的成分？

請以 JSON 格式回應：
{
  "refinedComponents": [
    {
      "name": "成分名稱（繁體中文）",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "refinementReason": "調整原因（如果有修改）",
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "烹飪方式"
    }
  ],
  "addedComponents": [
    {
      "name": "新增成分名稱",
      "confidence": 0.85,
      "estimatedPortion": 30,
      "reason": "為什麼之前沒有識別到"
    }
  ],
  "removedComponents": [
    {
      "name": "移除的成分名稱",
      "reason": "為什麼移除"
    }
  ],
  "overallConfidence": 0.90
}

**特別注意**：
- 對於信心度低於 70% 的成分，請特別仔細檢查
- 考慮該料理的典型成分組成
- 注意易混淆的食材（如豆腐干絲 vs 麵條）`;
  } else {
    const componentList = initialComponents
      .map((c, i) => `${i + 1}. ${c.name} (confidence: ${(c.confidence * 100).toFixed(0)}%, portion: ${c.estimatedPortion}g)`)
      .join('\n');

    return `Please re-examine the following component identification results, especially items with lower confidence:

**Dish Context**: ${dishContext}

**Initially Identified Components**:
${componentList}

**Please carefully check and confirm:**

1. **Are component names correct**:
   - Are there any misidentifications?
   - Are similar ingredients confused?

2. **Are portion estimates reasonable**:
   - Do portions match typical proportions for this dish?
   - Do they need adjustment?

3. **Are there missing components**:
   - Are there other visible components in the image not identified?
   - Are there components hidden in lower layers?

Respond in JSON format:
{
  "refinedComponents": [
    {
      "name": "component name",
      "confidence": 0.95,
      "estimatedPortion": 50,
      "refinementReason": "reason for adjustment (if modified)",
      "category": "grain/protein/vegetable/seasoning",
      "cookingMethod": "cooking method"
    }
  ],
  "addedComponents": [
    {
      "name": "added component name",
      "confidence": 0.85,
      "estimatedPortion": 30,
      "reason": "why not identified before"
    }
  ],
  "removedComponents": [
    {
      "name": "removed component name",
      "reason": "why removed"
    }
  ],
  "overallConfidence": 0.90
}

**Special Notes**:
- For components with confidence below 70%, please check carefully
- Consider typical component composition for this dish
- Note easily confused ingredients (e.g., dried tofu strips vs noodles)`;
  }
}

/**
 * 生成成分識別 Prompt（點心類）
 */
export function generateDumplingComponentPrompt(language: 'zh-TW' | 'en' = 'zh-TW'): string {
  
  if (language === 'zh-TW') {
    return `請仔細分析這張點心圖片，識別外皮和內餡的成分：

**點心分析重點**：

1. **外皮部分**：
   - 外皮類型（餃子皮、小籠包皮、春捲皮、燒賣皮等）
   - 外皮厚度和質地
   - 估計外皮重量（克）

2. **內餡成分**（這是重點，需要根據視覺線索推測）：
   - 主要蛋白質（豬肉、牛肉、蝦仁、雞肉等）
   - 蔬菜類（高麗菜、韭菜、青蔥、香菇等）
   - 調味料（薑、蒜、香油等）
   - 特殊成分（如小籠包的湯汁、蟹黃等）
   - 各成分的估計重量（克）

3. **烹飪方式**：
   - 蒸（如小籠包、燒賣）
   - 煮（如水餃）
   - 炸（如炸春捲）
   - 煎（如鍋貼）

4. **配料和調味料**：
   - 沾醬（醬油、醋、辣油等）
   - 配菜（薑絲、蒜泥等）
   - 裝飾（魚卵、青豆、蟹黃等）

5. **視覺特徵**：
   - 點心的形狀和大小
   - 外皮的顏色和透明度
   - 是否能看到內餡
   - 表面的裝飾或配料

**特別注意**：
- 內餡通常無法直接看到，需要根據點心類型和常見配方推測
- 小籠包特別注意是否有湯汁（高湯凍）
- 燒賣頂部通常有裝飾（魚卵、蟹黃、青豆等）
- 春捲需要區分生春捲（不油炸）和炸春捲
- 估計份量時，這是**單個點心**的重量

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "成分名稱（繁體中文）",
      "nameEn": "Component Name (English)",
      "category": "grain/protein/vegetable/seasoning/sauce/garnish",
      "estimatedPortion": 15,
      "confidence": 0.85,
      "cookingMethod": "steamed/boiled/deep_fried/fried",
      "visualFeatures": {
        "color": ["顏色1", "顏色2"],
        "shape": "形狀描述",
        "texture": "質地描述",
        "position": "wrapper/filling/topping/condiment"
      },
      "notes": "特別說明（如：推測的內餡成分、小籠包的湯汁等）"
    }
  ],
  "dumplingType": "點心類型（小籠包/餃子/燒賣/春捲等）",
  "totalWeight": 50,
  "wrapperToFillingRatio": "外皮:內餡比例（如 35:55）",
  "cookingMethod": "主要烹飪方式",
  "servingSize": "份量說明（如：單個、一籠6個等）"
}`;
  } else {
    return `Please carefully analyze this dumpling/dim sum image and identify the wrapper and filling components:

**Dumpling Analysis Focus**:

1. **Wrapper Part**:
   - Wrapper type (dumpling skin, xiaolongbao wrapper, spring roll wrapper, shumai wrapper, etc.)
   - Wrapper thickness and texture
   - Estimated wrapper weight (grams)

2. **Filling Components** (This is key, infer from visual clues):
   - Main protein (pork, beef, shrimp, chicken, etc.)
   - Vegetables (cabbage, chives, green onion, mushroom, etc.)
   - Seasonings (ginger, garlic, sesame oil, etc.)
   - Special components (soup jelly in xiaolongbao, crab roe, etc.)
   - Estimated weight of each component (grams)

3. **Cooking Method**:
   - Steamed (xiaolongbao, shumai)
   - Boiled (dumplings)
   - Deep-fried (fried spring rolls)
   - Pan-fried (potstickers)

4. **Condiments and Seasonings**:
   - Dipping sauces (soy sauce, vinegar, chili oil, etc.)
   - Side dishes (ginger strips, minced garlic, etc.)
   - Toppings (fish roe, green peas, crab roe, etc.)

5. **Visual Features**:
   - Shape and size of dumpling
   - Color and transparency of wrapper
   - Can you see the filling
   - Surface decorations or toppings

**Special Notes**:
- Filling usually cannot be seen directly, infer from dumpling type and common recipes
- For xiaolongbao, note if there's soup (soup jelly)
- Shumai typically has topping decoration (fish roe, crab roe, green peas, etc.)
- Spring rolls: distinguish between fresh (not fried) and fried
- When estimating portions, this is the weight of a **single piece**

Respond in JSON format:
{
  "components": [
    {
      "name": "Component Name (Chinese)",
      "nameEn": "Component Name (English)",
      "category": "grain/protein/vegetable/seasoning/sauce/garnish",
      "estimatedPortion": 15,
      "confidence": 0.85,
      "cookingMethod": "steamed/boiled/deep_fried/fried",
      "visualFeatures": {
        "color": ["color1", "color2"],
        "shape": "shape description",
        "texture": "texture description",
        "position": "wrapper/filling/topping/condiment"
      },
      "notes": "Special notes (e.g., inferred filling, soup in xiaolongbao, etc.)"
    }
  ],
  "dumplingType": "Dumpling type (xiaolongbao/dumpling/shumai/spring roll, etc.)",
  "totalWeight": 50,
  "wrapperToFillingRatio": "wrapper:filling ratio (e.g., 35:55)",
  "cookingMethod": "main cooking method",
  "servingSize": "serving size description (e.g., single piece, 6 pieces per steamer, etc.)"
}`;
  }
}

/**
 * 生成成分識別 Prompt（燒烤類）
 */
export function generateBarbecueComponentPrompt(language: 'zh-TW' | 'en' = 'zh-TW'): string {
  
  if (language === 'zh-TW') {
    return `請仔細分析這張燒烤圖片，識別所有食材和配料：

**燒烤分析重點**：

1. **主要肉類**：
   - 肉類種類（豬肉、牛肉、雞肉、羊肉、海鮮等）
   - 肉的部位（五花肉、里肌肉、雞腿、雞翅等）
   - 肉的切法（片狀、塊狀、串燒等）
   - 估計每種肉類的重量（克）
   - 烤製程度（生、半熟、全熟）

2. **蔬菜類**：
   - 蔬菜種類（青椒、洋蔥、香菇、玉米、茄子等）
   - 切法（片狀、塊狀、整顆等）
   - 估計份量（克）
   - 烤製程度

3. **醬料和調味料**：
   - 烤肉醬（甜味、鹹味、辣味等）
   - 醃料（醬油、蒜泥、香油等）
   - 沾醬（辣椒醬、芝麻醬等）
   - 調味料（鹽、胡椒、孜然等）
   - 估計用量（克或毫升）

4. **配菜和包裹食材**：
   - 生菜（用於包肉）
   - 泡菜
   - 蒜片
   - 辣椒
   - 其他配菜

5. **其他食材**：
   - 主食類（吐司、米血糕、年糕等）
   - 加工食品（甜不辣、香腸、貢丸等）
   - 海鮮類（蝦、魷魚、扇貝等）

6. **視覺特徵**：
   - 食材的顏色（烤製後的焦化程度）
   - 表面的醬料塗抹情況
   - 食材的排列方式
   - 烤痕和焦化程度

**特別注意**：
- 烤製過程會使食材縮水，估計份量時考慮烤前重量
- 注意區分不同種類的肉類
- 醬料通常會塗抹在表面，注意識別
- 韓式燒烤通常搭配生菜和泡菜
- 日式燒肉注重肉質本身，醬料較少
- 台式烤肉食材多樣，包括吐司、米血糕等

請以 JSON 格式回應：
{
  "components": [
    {
      "name": "成分名稱（繁體中文）",
      "nameEn": "Component Name (English)",
      "category": "protein/vegetable/seasoning/sauce/grain/garnish",
      "estimatedPortion": 120,
      "confidence": 0.90,
      "cookingMethod": "grilled",
      "visualFeatures": {
        "color": ["烤製後的顏色"],
        "shape": "形狀描述",
        "texture": "質地描述（如：焦化、軟嫩等）",
        "position": "在烤盤上的位置"
      },
      "grillingLevel": "rare/medium/well-done",
      "notes": "特別說明（如：醃製方式、搭配吃法等）"
    }
  ],
  "barbecueStyle": "燒烤風格（韓式/日式/台式/中式等）",
  "totalWeight": 250,
  "meatToVegetableRatio": "肉類:蔬菜比例（如 60:30）",
  "mainProtein": "主要蛋白質種類",
  "accompaniments": ["配菜列表"]
}`;
  } else {
    return `Please carefully analyze this barbecue image and identify all ingredients and condiments:

**Barbecue Analysis Focus**:

1. **Main Meats**:
   - Meat types (pork, beef, chicken, lamb, seafood, etc.)
   - Meat cuts (pork belly, tenderloin, chicken leg, chicken wings, etc.)
   - Cutting style (sliced, cubed, skewered, etc.)
   - Estimated weight of each meat type (grams)
   - Grilling level (rare, medium, well-done)

2. **Vegetables**:
   - Vegetable types (bell pepper, onion, mushroom, corn, eggplant, etc.)
   - Cutting style (sliced, cubed, whole, etc.)
   - Estimated portion (grams)
   - Grilling level

3. **Sauces and Seasonings**:
   - BBQ sauce (sweet, salty, spicy, etc.)
   - Marinade (soy sauce, minced garlic, sesame oil, etc.)
   - Dipping sauce (chili sauce, sesame sauce, etc.)
   - Seasonings (salt, pepper, cumin, etc.)
   - Estimated amount (grams or ml)

4. **Side Dishes and Wrapping Ingredients**:
   - Lettuce (for wrapping meat)
   - Kimchi
   - Garlic slices
   - Chili peppers
   - Other side dishes

5. **Other Ingredients**:
   - Staples (toast, rice blood cake, rice cake, etc.)
   - Processed foods (fish cake, sausage, meatballs, etc.)
   - Seafood (shrimp, squid, scallops, etc.)

6. **Visual Features**:
   - Food color (degree of charring after grilling)
   - Sauce coating on surface
   - Arrangement of ingredients
   - Grill marks and charring level

**Special Notes**:
- Grilling causes food to shrink, consider pre-grilling weight when estimating
- Distinguish between different types of meat
- Sauce is usually coated on surface, note identification
- Korean BBQ typically served with lettuce and kimchi
- Japanese yakiniku focuses on meat quality, less sauce
- Taiwanese BBQ has diverse ingredients including toast, rice blood cake, etc.

Respond in JSON format:
{
  "components": [
    {
      "name": "Component Name (Chinese)",
      "nameEn": "Component Name (English)",
      "category": "protein/vegetable/seasoning/sauce/grain/garnish",
      "estimatedPortion": 120,
      "confidence": 0.90,
      "cookingMethod": "grilled",
      "visualFeatures": {
        "color": ["color after grilling"],
        "shape": "shape description",
        "texture": "texture description (e.g., charred, tender, etc.)",
        "position": "position on grill"
      },
      "grillingLevel": "rare/medium/well-done",
      "notes": "Special notes (e.g., marinating method, serving style, etc.)"
    }
  ],
  "barbecueStyle": "BBQ style (Korean/Japanese/Taiwanese/Chinese, etc.)",
  "totalWeight": 250,
  "meatToVegetableRatio": "meat:vegetable ratio (e.g., 60:30)",
  "mainProtein": "main protein type",
  "accompaniments": ["list of side dishes"]
}`;
  }
}
