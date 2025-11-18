/**
 * Simple Vision Helper - JavaScript 包裝器
 * 
 * 這個模組讓 JavaScript 代碼可以輕鬆使用 TypeScript 的 EnhancedPromptGenerator
 */

// 動態導入 TypeScript 模組
let EnhancedPromptGenerator;

try {
  // 嘗試導入編譯後的 TypeScript 模組
  const module = require('../services/EnhancedPromptGenerator');
  EnhancedPromptGenerator = module.EnhancedPromptGenerator;
} catch (error) {
  console.warn('⚠️ 無法導入 EnhancedPromptGenerator，使用回退方案');
  EnhancedPromptGenerator = null;
}

/**
 * 生成食物識別 prompt
 * @param {Object} options - 選項
 * @param {string} options.cuisineType - 料理類型 (可選)
 * @param {string} options.dishType - 菜餚類型 (可選)
 * @param {number} options.retryCount - 重試次數 (可選)
 * @returns {string} - 生成的 prompt
 */
function generateFoodRecognitionPrompt(options = {}) {
  const {
    cuisineType = 'TAIWANESE',
    dishType = 'MIXED_DISH',
    retryCount = 0
  } = options;

  // 如果 EnhancedPromptGenerator 可用，使用它
  if (EnhancedPromptGenerator) {
    try {
      const generator = new EnhancedPromptGenerator('zh-TW');
      
      // 根據重試次數選擇不同的策略
      if (retryCount > 0) {
        // 重試時使用更嚴謹的 prompt
        return generator.generatePrompt({
          detectedCuisineType: cuisineType,
          suspectedFoodCategories: [dishType],
          previousAttempts: retryCount
        });
      } else {
        // 首次嘗試使用智能 prompt
        return generator.generateSmartPrompt({
          detectedCuisineType: cuisineType,
          suspectedFoodCategories: [dishType]
        });
      }
    } catch (error) {
      console.error('❌ EnhancedPromptGenerator 錯誤:', error);
      // 繼續使用回退方案
    }
  }

  // 回退方案：使用簡化的 prompt
  return generateFallbackPrompt(retryCount);
}

/**
 * 回退方案：生成簡化的 prompt（整合 simple-server.js 的優點）
 * @param {number} retryCount - 重試次數
 * @returns {string} - 簡化的 prompt
 */
function generateFallbackPrompt(retryCount = 0) {
  const isRetry = retryCount > 0;
  
  const basePrompt = `你是一個營養追蹤助手，請分析這張餐點照片，列出所有「清楚可見」的食物食材，並用 JSON 回傳結果。

🎯 核心目標：
1. 幫助使用者記錄飲食，所以要盡可能列出畫面中看得到的每一種食物。
2. 對於「可數的食材」（例如：蛋、餃子、生蠔、蝦子、肉片、番茄片等），必須**逐個仔細計數**，不要估算或加倍。
3. 不要發明畫面中看不到或很模糊的食材。

📌 規則說明：

1）先用 1～2 句簡短描述整道餐點
  - 例如：「一盤咖哩飯，包含白飯、咖哩醬、馬鈴薯、胡蘿蔔和雞肉。」

2）列出所有可見食材（重點）
  - 可數食材（顆 / 個 / 片 / 塊）：
    - 請用肉眼**一個一個數**，只數你「真的看得到」的。
    - 例如：「2個水煮蛋 (約100克)」、「5個餃子 (約150克)」、「3片培根 (約45克)」。
  - 不可數食材（飯、麵、炒青菜、湯、咖喱醬等）：
    - 用「大致份量」描述，例如：
      - 「1碗白飯 (約180克)」
      - 「咖喱醬 (約150克)」
      - 「炒青菜 (約80克)」
      - 「味噌湯 (約250毫升)」

3）請特別注意以下幾類東西：
  - 主食：白飯、糙米飯、麵、麵線、米粉、麵包等
  - 蛋白質：雞肉、豬肉、牛肉、魚、豆腐、蛋、海鮮
  - 蔬菜：青菜、根莖類（馬鈴薯、紅蘿蔔、白蘿蔔）、菇類等
  - 湯與醬汁：湯品、咖喱醬、湯汁、濃湯
  - 飲料：茶、咖啡、果汁等（如果在畫面中）

4）絕對不要當成食物的項目：
  - 碗、盤子、杯子、筷子、湯匙、叉子
  - 桌面、桌布、紙巾、裝飾葉片（不可食用）
  - 醬油瓶、調味料罐、包裝、塑膠袋

🚨 **計數準確性警告（極其重要！）**：

對於可數食材（如生蠔、蛋、餃子等），你**必須**：
1. **逐個計數** - 一個一個數，不要估算
2. **在回應中說明你的計數過程** - 例如："我看到5個生蠔殼"
3. **絕對不要猜測或加倍數量** - 如果看到5個就是5個，不是10個
4. **只數可見的完整食材** - 不要數部分遮擋的

❌ **常見錯誤**：實際5個卻報告10個（這是嚴重錯誤！）
✅ **正確做法**：仔細數每一個，確認後再報告

📏 **份量計算指南**：

**標準份量參考**：
- 1碗白飯 = 150-200克
- 1碗麵條 = 200-250克
- 1份炒青菜 = 80-100克
- 1個水煮蛋 = 50-60克
- 1片雞胸肉 = 100-120克
- 1碗湯 = 200-300毫升
- 1份咖喱醬 = 150-200毫升

**計數方法**：
1. 識別所有可見的食材
2. 一個一個數
3. 再次確認數量
4. 報告精確數字

🇹🇼 **台灣原住民料理特別識別指南**：
- **小米阿粨/阿拜（Abai）**：
  * 外觀：長條形或三角錐形，用綠色葉片（假酸漿葉或月桃葉）包裹
  * 尺寸：長約 10-15cm，寬約 5-8cm
  * 特徵：可能看到綠色葉片包裹，內部是小米和豬肉或其他餡料
  * 顏色：外層綠色（葉片），內部黃色或金黃色（小米）
- **小米飯/小米粥**：
  * 外觀：小顆粒狀，黃色或金黃色，比白米小
  * 特徵：顆粒分明或呈粥狀
- **馬告料理**：
  * 特徵：黑色小顆粒散布在食物上，類似黑胡椒
  * 常見於：烤肉、湯品、炒菜
- **竹筒飯**：
  * 外觀：竹筒容器，內有米飯
  * 特徵：可能看到竹筒的橫切面

5）份量與數量的準則：
  - 名稱與份量說明都必須用「繁體中文」。
  - 對於可數食材：請給出「精確數量」＋「估計重量」。
    - ✅ 範例：
      - "portion": "2個水煮蛋 (約100克)"
      - "portion": "5個餃子 (約150克)"
  - 對於不可數食材：給「大致重量或容量」。
    - ✅ 範例：
      - "portion": "1碗白飯 (約180克)"
      - "portion": "咖喱醬 (約150克)"
  - 營養數值（calories, protein, carbs, fat, fiber, sodium）全部用「數字」表示，不要加單位。

📦 請只回傳以下 JSON 格式（不要加其他說明文字）：

{
  "foods": [
    {
      "name": "具體食材名稱（繁體中文）",
      "category": "食材分類（例如：主食、蛋白質、蔬菜、湯品、飲料、其他）",
      "confidence": 0.0-1.0 之間的數字,
      "portion": "份量描述（繁體中文，例如：150克、1碗 (約200克)、3片 (約50克)、2個 (約100克)）",
      "calories": 數字,
      "protein": 數字,
      "carbs": 數字,
      "fat": 數字,
      "fiber": 數字,
      "sodium": 數字,
      "description": "用繁體中文簡短描述此食材在畫面中的樣子與位置"
    }
  ],
  "overall_confidence": 0.0-1.0 之間的數字,
  "description": "用繁體中文對整道餐點做 1-2 句描述",
  "cooking_method": "烹調方式（例如：煎、炸、烤、燉、涼拌…）",
  "cuisine_type": "料理類型（例如：台式、日式、中式、西式、原住民料理…）"
}

🚨 **強制檢查清單**：
1. **蛋類檢查**：仔細尋找任何蛋類食材（水煮蛋、煎蛋、蛋花等）
2. **湯汁檢查**：是否有湯汁、醬汁、咖喱等液體食材
3. **主食檢查**：是否有米飯、麵條等主食
4. **蔬菜檢查**：是否識別了所有可見的蔬菜
5. **調味料檢查**：是否有明顯的調味料或醬料

**重要要求**：
- 必須識別出至少 5-10 種不同的食材
- **絕對不要遺漏**：湯汁/醬汁、主食、蛋類、蔬菜
- 不要遺漏任何可見的食物成分
- 即使是很小的食材也要識別

請特別記得：
- 寧可少列幾個食材、但每一個都真的看得到，也不要亂猜。
- 對於可數食材，務必一個一個數清楚，再寫進 JSON。`;

  if (isRetry) {
    return `【重試模式】

這是同一張餐點照片的重試分析。

請只列出你「非常有把握」的食材，寧可少列一點，也不要亂猜。

${basePrompt}`;
  }

  return basePrompt;
}

module.exports = {
  generateFoodRecognitionPrompt,
  generateFallbackPrompt
};
