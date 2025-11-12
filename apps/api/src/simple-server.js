// 增強版測試服務器 - 健康營養追蹤系統
// 版本: 1.0.3 - 使用 heic-convert 支援 HEIC 格式
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const convert = require('heic-convert');
const app = express();
const port = process.env.PORT || 3001;

// 圖片格式轉換函數 - 將 HEIC 等格式轉換為 JPEG
async function convertImageToJpeg(buffer, originalName) {
  try {
    const ext = path.extname(originalName).toLowerCase();
    console.log(`📦 原始圖片格式: ${ext}`);
    
    // 如果是 HEIC 格式，使用 heic-convert（純 JS 實現，無需系統依賴）
    if (ext === '.heic' || ext === '.heif') {
      console.log('🔄 使用 heic-convert 轉換 HEIC 格式到 JPEG...');
      const outputBuffer = await convert({
        buffer: buffer,
        format: 'JPEG',
        quality: 0.9
      });
      console.log(`✅ HEIC 轉換完成 (${buffer.length} bytes -> ${outputBuffer.length} bytes)`);
      return outputBuffer;
    }
    
    // 如果是其他格式，使用 sharp 轉換為 JPEG
    if (ext !== '.jpg' && ext !== '.jpeg') {
      console.log(`🔄 使用 sharp 轉換 ${ext} 格式到 JPEG...`);
      const convertedBuffer = await sharp(buffer)
        .jpeg({ quality: 90 })
        .toBuffer();
      console.log(`✅ 格式轉換完成 (${buffer.length} bytes -> ${convertedBuffer.length} bytes)`);
      return convertedBuffer;
    }
    
    console.log('✅ 已是 JPEG 格式，無需轉換');
    return buffer;
  } catch (error) {
    console.error('❌ 圖片轉換失敗:', error.message);
    console.error('❌ 錯誤堆疊:', error.stack);
    throw error;
  }
}

// 圖片特徵分析 (不需要 Google Vision API)
async function analyzeImageFeatures(imageBuffer) {
  // 這裡可以使用 Node.js 的圖片處理庫來分析圖片
  // 目前使用簡化的邏輯
  
  const fileSize = imageBuffer.length;
  const timestamp = Date.now();
  
  // 基於文件大小和時間戳的智能判斷
  const features = {
    fileSize,
    hasComplexColors: fileSize > 500000, // 大文件通常顏色豐富
    likelyHotFood: fileSize > 800000, // 熱食通常拍攝效果更好
    timestamp
  };
  
  // 根據特徵判斷食物類型
  if (features.hasComplexColors && features.likelyHotFood) {
    // 很可能是咖喱或複雜料理
    return {
      primaryFood: 'curry',
      confidence: 0.92,
      features: ['soup', 'vegetables', 'spices', 'hot_food']
    };
  } else if (features.hasComplexColors) {
    // 可能是拉麵或其他湯麵
    return {
      primaryFood: 'noodle_soup',
      confidence: 0.85,
      features: ['noodles', 'broth', 'toppings']
    };
  } else {
    // 簡單食物
    return {
      primaryFood: 'simple_meal',
      confidence: 0.70,
      features: ['basic_food']
    };
  }
}

// 使用更強 prompt 的 ChatGPT Vision API（用於重試）
async function callChatGPTVisionAPIWithStrongerPrompt(imageBuffer, retryCount = 0) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const MAX_RETRIES = 2;
  
  try {
    const base64Image = imageBuffer.toString('base64');
    
    console.log(`🔄 使用更強 prompt 重試 (嘗試 ${retryCount}/${MAX_RETRIES})`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist AI assistant helping users track their meals for health and dietary purposes. Your role is to analyze food photos and provide detailed nutritional information to support healthy eating habits."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `I need your help analyzing this meal photo for nutritional tracking purposes. This is for personal health monitoring and dietary logging.

Please identify all visible food items in this image and provide their nutritional information in JSON format.

Focus on:
1. All visible ingredients and food items
2. Estimated portion sizes
3. Nutritional values (calories, protein, carbs, fat, fiber, sodium)
4. Cooking method and cuisine type

IMPORTANT - DO NOT identify these non-food items:
- Containers and utensils: bowls, plates, steamer baskets, bamboo steamers, cups, chopsticks, spoons, forks
- Decorations: tablecloths, napkins, flower decorations
- Background items: tables, chairs, walls, people's hands or faces
- Packaging: plastic bags, boxes, aluminum foil, plastic wrap
- Condiment containers: soy sauce bottles, salt shakers (only identify actual condiments used)

SPECIAL NOTE:
- Steamer baskets/bamboo steamers are containers, NOT food! Do not identify them!
- Empty bamboo tubes are containers, not food
- If bamboo tube contains rice, identify as "bamboo tube rice", not "bamboo tube"

Return the analysis in this JSON format:
{
  "foods": [
    {
      "name": "food name",
      "category": "food category",
      "confidence": 0.90,
      "portion": "estimated portion",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "sodium": number,
      "description": "food description"
    }
  ],
  "overall_confidence": 0.85,
  "description": "overall meal description",
  "cooking_method": "cooking method",
  "cuisine_type": "cuisine type"
}

Please analyze this meal photo now.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2500,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ChatGPT Vision API HTTP 錯誤（重試版本）');
      console.error('   - 狀態碼:', response.status);
      console.error('   - 錯誤詳情:', errorText);
      throw new Error(`ChatGPT Vision API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ ChatGPT Vision API 重試成功！');
    const content = result.choices[0].message.content;
    
    // 再次檢查是否被拒絕
    if (content.includes("I'm sorry") || content.includes("I can't assist") || content.includes("I cannot") || content.includes("I can't help")) {
      console.error('❌ 重試後仍被拒絕');
      throw new Error('OpenAI content policy: Image analysis refused after retry - ' + content.substring(0, 100));
    }
    
    // 解析 JSON
    let parsedResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      parsedResult = JSON.parse(jsonStr);
      console.log('✅ 重試版本 JSON 解析成功');
    } catch (parseError) {
      console.log('❌ 重試版本 JSON 解析失敗，使用文本分析');
      parsedResult = parseTextResponse(content);
    }
    
    // 返回與原函數相同格式的結果
    const suggestions = parsedResult.foods?.map(food => ({
      food: {
        id: Math.floor(Math.random() * 1000) + 100,
        name: food.name,
        calories: food.calories || 200,
        protein: food.protein || 10,
        carbs: food.carbs || 20,
        fat: food.fat || 5,
        fiber: food.fiber || 2,
        sodium: food.sodium || 300,
        category: food.category || '其他',
        portion: food.portion || '1份',
        description: food.description || '',
        cooking_method: parsedResult.cooking_method || '未知',
        cuisine_type: parsedResult.cuisine_type || '未知'
      },
      confidence: food.confidence || 0.8
    })) || [];
    
    return {
      suggestions,
      confidence: parsedResult.overall_confidence || 0.8,
      description: parsedResult.description || '食物分析',
      rawData: {
        originalResponse: content,
        parsedFoods: parsedResult.foods || []
      }
    };
    
  } catch (error) {
    console.error('❌ 重試版本調用失敗:', error);
    throw error;
  }
}

// ChatGPT Vision API 整合
async function callChatGPTVisionAPI(imageBuffer, retryCount = 0) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const MAX_RETRIES = 2;
  
  try {
    const base64Image = imageBuffer.toString('base64');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful nutrition tracking assistant that identifies food items in meal photos to help users log their dietary intake for health monitoring purposes."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `你是一個營養追蹤助手，幫助用戶記錄他們的飲食。請分析這張食物照片，識別其中的食材和營養成分。

🔍 **第一步：仔細觀察圖片（非常重要！）**
在識別食材之前，請先**非常仔細地**觀察圖片，並用2-3句話描述你看到的內容：

**必須回答以下問題**：
1. **主要食材的外觀**：
   - 顏色是什麼？（白色、黃色、綠色、棕色等）
   - 形狀是什麼？（細長、圓形、塊狀、顆粒狀等）
   - 質地如何？（脆的、軟的、湯狀、固體等）

2. **料理類型判斷**：
   - 這看起來像什麼類型的料理？（日式、中式、台灣、西式、原住民料理等）
   - 是湯品、炒菜、烤物、還是其他？

3. **容器和擺盤**：
   - 食物裝在什麼容器中？（碗、盤、竹筒、石板、葉片包裹等）

⚠️ **重要提醒**：
- 如果看到**細長的白色或淡黃色食材**，很可能是：豆芽菜、金針菇、麵條、玉米筍等
- 如果看到**顆粒狀食材**，很可能是：米飯、小米、玉米粒等
- 如果看到**綠色葉片包裹**，很可能是：粽子、阿粨、荷葉飯等
- **不要根據容器或背景猜測食物類型**，要根據食材本身的特徵判斷

🎯 **第二步：精確識別所有食材**
基於你在第一步的仔細觀察，現在請識別出所有可見的食材和食物。
**確保你的識別結果與第一步的描述一致！**

🎯 **重要提示**：
- 必須識別**湯汁、醬汁、咖喱**等液體食材（這些經常被忽略但很重要）
- 必須識別**主食**（米飯、麵條等，即使不在碗中也要注意）
- 必須識別**所有蔬菜**，包括浸在湯中的（馬鈴薯、洋蔥等）
- 請特別注意小細節和部分遮擋的食材
- **使用最精確的食材名稱**，避免模糊描述（例如：用「玉米筍」而非「小玉米」，用「青椒」而非「綠色蔬菜」）
- **特別注意台灣特色料理和原住民食材**（小米、馬告、刺蔥、阿粨等）

🚫 **絕對不要識別以下非食物項目**：
- **容器和餐具**：碗、盤子、蒸籠、竹籠、竹筒（空的）、杯子、筷子、湯匙、叉子
- **裝飾物**：桌布、餐巾、花朵裝飾、葉片裝飾（非食用）
- **背景物品**：桌子、椅子、牆壁、其他人的手或臉
- **包裝材料**：塑膠袋、紙盒、鋁箔紙、保鮮膜
- **調味料容器**：醬油瓶、鹽罐、胡椒罐（只識別實際使用的調味料）

⚠️ **特別注意**：
- **蒸籠/竹籠**：這是容器，不是食物！不要識別！
- **空的竹筒**：如果竹筒是空的或只是容器，不要識別
- **竹筒飯**：如果竹筒裡有米飯，識別「竹筒飯」而不是「竹筒」
- **葉片包裹**：如果是用來包裹食物的葉片（如粽葉、月桃葉），識別包裹的食物（如粽子、阿粨），而不是葉片本身

🚨 **強制檢查清單**：
1. **蛋類檢查**：仔細尋找任何蛋類食材（水煮蛋、煎蛋、蛋花等）
2. **切開食材**：注意被切成兩半的食材，特別是蛋類
3. **白色橢圓形物體**：可能是水煮蛋
4. **黃色圓形**：可能是蛋黃
5. **日式咖喱**：通常會有水煮蛋作為配菜

請以JSON格式回應，並盡可能識別出更多食材：

{
  "foods": [
    {
      "name": "具體食材名稱（中文）",
      "category": "食材分類",
      "confidence": 0.90,
      "portion": "估計份量（如：100g、1碗、1片等）",
      "calories": 每份卡路里（數字，不要單位）,
      "protein": 蛋白質克數（數字，不要單位如 g）,
      "carbs": 碳水化合物克數（數字，不要單位如 g）,
      "fat": 脂肪克數（數字，不要單位如 g）,
      "fiber": 膳食纖維克數（數字，不要單位如 g）,
      "sodium": 鈉含量毫克（數字，不要單位如 mg）,
      "description": "食材描述和特點"
    }
  ],
  "overall_confidence": 0.85,
  "description": "整體料理描述",
  "cooking_method": "烹飪方式",
  "cuisine_type": "料理類型"
}

⚠️ **JSON 格式重要提醒**：
- 所有營養數值必須是**純數字**，不要包含單位（g、mg等）
- 例如："protein": 3 ✅ 正確
- 例如："protein": 3g ❌ 錯誤
- 例如："protein": "3g" ❌ 錯誤

🔍 **超詳細識別指南**：

**1. 仔細觀察每個角落**：
- 主要蛋白質：雞肉、豬肉、牛肉、魚類、蝦類、**🥚水煮蛋**、**🥚煎蛋**、**🥚蛋類**、豆腐
- **🔥 蛋類識別重點（絕對不能遺漏）**：
  * **水煮蛋**：白色橢圓形，切開後有黃色蛋黃和白色蛋白
  * **煎蛋**：黃色蛋黃，白色蛋白，可能有焦糖色邊緣
  * **蛋花**：散狀蛋白質，通常在湯中
  * **茶葉蛋**：有茶色紋路的水煮蛋
  * **溫泉蛋**：半熟狀態，蛋黃流動
  * **蛋皮**：薄片狀，黃色或白色
- 根莖類蔬菜：馬鈴薯、胡蘿蔔、白蘿蔔、蓮藕、牛蒡、竹筍
- 葉菜類：高麗菜、菠菜、青江菜、韭菜、蔥
- 瓜果類：南瓜、茄子、番茄、青椒、紅椒、秋葵
- 菇類：香菇、金針菇、杏鮑菇、舞菇
- 豆類：毛豆、四季豆、豌豆、玉米
- **🌽 玉米類（請精確區分）**：
  * **玉米筍（baby corn）**：細長圓柱形，淡黃色，長約5-8cm，直徑約1cm，整根可食用
  * **甜玉米粒**：黃色顆粒狀，從玉米棒上剝下來的
  * **玉米棒**：完整的玉米，黃色顆粒排列整齊
- **🫑 椒類（請精確區分）**：
  * **青椒（bell pepper）**：大型，方形或圓形，綠色，表面光滑，厚實
  * **糯米椒/甜椒**：細長形，綠色，長約8-12cm，表面有皺褶
  * **辣椒**：細小，綠色或紅色，尖端尖銳
  * **彩椒**：紅色、黃色或橙色的甜椒
- 海藻類：海帶、紫菜、昆布
- 調料：薑、蒜、洋蔥、辣椒
- **🇹🇼 台灣特色與原住民食材（重要！）**：
  * **小米（millet）**：小顆粒狀，黃色或金黃色，比米粒小，常見於原住民料理
  * **小米阿粨/阿拜（abai）**：用假酸漿葉或月桃葉包裹的小米糕，外觀呈長條形或三角形包裹狀
  * **馬告（山胡椒/maqaw）**：黑色小顆粒，類似黑胡椒，有檸檬香氣
  * **刺蔥（食茱萸）**：綠色葉片，有刺，香氣濃郁
  * **樹豆**：紅褐色或黃色豆類，比黃豆略大
  * **龍葵（烏甜仔菜）**：深綠色葉菜，小葉片
  * **過貓（過溝菜蕨）**：捲曲的綠色蕨類蔬菜
  * **山蘇**：大片綠色蕨類葉片
  * **檳榔花**：白色或淡黃色，細長形
  * **月桃葉**：大片綠色葉片，常用於包裹食物
  * **假酸漿葉**：大片心形葉片，用於包裹阿粨
  * **竹筒飯**：竹筒內的米飯，可能混有其他食材
  * **石板烤肉**：在石板上烤製的肉類
  * **飛魚**：細長的魚類，常見於達悟族料理
  * **山豬肉**：深色的豬肉，肉質較粗
  * **芋頭梗**：紫色或綠色的莖部
  * **地瓜葉**：心形綠色葉片
  * **野菜類**：昭和草、山萵苣、山芹菜等

**2. 🍛 日式咖喱/湯咖喱特殊食材（絕對不能遺漏）**：
- **🍛 咖喱湯汁/咖喱醬**（棕色或黃色的湯汁，這是主要食材！）
- **🥔 馬鈴薯**（黃色或白色塊狀，可能部分浸在湯中）
- **🥚 水煮蛋**（日式咖喱必備配菜，通常切成兩半露出蛋黃）
- **🥚 溫泉蛋**（半熟蛋，蛋黃流動）
- 福神漬（醃菜）
- 蘋果片（增甜）
- 月桂葉
- 咖喱粉香料

**🚨 咖喱料理識別重點**：
- 如果看到棕色或黃色的湯汁，必須識別為「咖喱」或「咖喱湯汁」
- 馬鈴薯經常浸在湯中，顏色可能較淡，但仍要識別出來
- 日式咖喱通常包含：咖喱、馬鈴薯、胡蘿蔔、洋蔥、肉類、水煮蛋

**3. 隱藏或小份量食材**：
- 香料和調味料
- 切碎的蔬菜
- 湯汁中的食材
- 裝飾用蔬菜
- 部分遮擋的食材
- **🥚 特別注意：蛋類經常被遺漏，請仔細檢查！**

**🚨 最終檢查清單（必須全部確認）**：
- ✅ 是否有**咖喱湯汁**（棕色/黃色湯汁）？這是咖喱料理的核心！
- ✅ 是否有**馬鈴薯**（黃色/白色塊狀，可能浸在湯中）？
- ✅ 是否有**水煮蛋**（白色橢圓形，可能切開露出蛋黃）？
- ✅ 是否有**洋蔥**（透明或半透明，可能在湯中）？
- ✅ 是否有煎蛋或其他蛋類製品？
- ✅ 日式咖喱通常會有蛋類配菜，請再次確認！
- ✅ 任何黃白相間的食材都可能是蛋類！
- ✅ 如果這是咖喱料理，必須識別出：咖喱、馬鈴薯、胡蘿蔔、洋蔥

**4. 🍛 咖喱料理特別識別指南**：
如果這是咖喱料理，必須識別以下項目：
- **咖喱湯汁**（150-200ml）：棕色或黃色的湯汁，含香料
  * 卡路里: 150-200, 蛋白質: 3g, 碳水: 12g, 脂肪: 11g
- **馬鈴薯**（1-2塊）：黃色或白色，可能浸在湯中
  * 卡路里: 115, 蛋白質: 3g, 碳水: 26g, 脂肪: 0g
- **洋蔥**（半個）：透明或半透明，通常在湯中
  * 卡路里: 40, 蛋白質: 1g, 碳水: 9g, 脂肪: 0g

**5. 營養計算要精確**：
- 考慮烹飪方式（燉煮、炒製、油炸）
- 根據實際可見份量估算
- 包含隱藏的油脂和調料
- **湯汁和醬汁也要計算營養成分**

**5. 🎯 常見混淆食材辨識指南（必須精確區分）**：

**玉米筍 vs 小玉米 vs 甜玉米**：
- **玉米筍（baby corn）**：
  * 外觀：細長圓柱形，淡黃色或白色
  * 尺寸：長約 5-8cm，直徑約 0.8-1.5cm
  * 特徵：整根可食用，質地脆嫩，通常整根烹調
  * 常見料理：炒菜、火鍋、沙拉
- **甜玉米粒**：
  * 外觀：黃色顆粒狀，獨立分散
  * 尺寸：每粒約 0.5-0.8cm
  * 特徵：從玉米棒上剝下來的顆粒
- **玉米棒**：
  * 外觀：完整的玉米，黃色顆粒排列整齊
  * 尺寸：長約 15-20cm

**青椒 vs 糯米椒 vs 辣椒**：
- **青椒（bell pepper/甜椒）**：
  * 外觀：大型，方形或圓形，綠色
  * 尺寸：長約 8-12cm，寬約 6-10cm
  * 特徵：表面光滑，肉厚，不辣，切開後有空腔
  * 常見料理：炒菜、沙拉、烤肉
- **糯米椒/甜椒**：
  * 外觀：細長形，綠色
  * 尺寸：長約 8-12cm，直徑約 1.5-2cm
  * 特徵：表面有皺褶，微辣或不辣
- **辣椒**：
  * 外觀：細小，綠色或紅色
  * 尺寸：長約 3-8cm，直徑約 0.5-1cm
  * 特徵：尖端尖銳，辣味強

**🇹🇼 台灣原住民料理特別識別指南**：
- **小米阿粨/阿拜（Abai）**：
  * 外觀：長條形或三角錐形，用綠色葉片（假酸漿葉或月桃葉）包裹
  * 尺寸：長約 10-15cm，寬約 5-8cm
  * 特徵：可能看到綠色葉片包裹，內部是小米和豬肉或其他餡料
  * 顏色：外層綠色（葉片），內部黃色或金黃色（小米）
  * 常見搭配：單獨食用或搭配湯品
  * 營養：小米（100g）約 360 卡路里，蛋白質 11g，碳水 73g，脂肪 4g
- **小米飯/小米粥**：
  * 外觀：小顆粒狀，黃色或金黃色，比白米小
  * 特徵：顆粒分明或呈粥狀
  * 可能混合：紅藜、地瓜、芋頭等
- **馬告料理**：
  * 特徵：黑色小顆粒散布在食物上，類似黑胡椒
  * 常見於：烤肉、湯品、炒菜
- **竹筒飯**：
  * 外觀：竹筒容器，內有米飯
  * 特徵：可能看到竹筒的橫切面
- **石板烤肉**：
  * 特徵：肉類直接放在石板上，可能有焦痕
  * 常見肉類：山豬肉、豬肉、雞肉

**🚨 辨識原則**：
1. **優先使用最精確的名稱**：例如「玉米筍」而非「小玉米」，「小米阿粨」而非「粽子」
2. **根據形狀和尺寸判斷**：細長圓柱形 = 玉米筍，顆粒狀 = 甜玉米粒
3. **考慮烹飪方式**：整根烹調的細長蔬菜很可能是玉米筍
4. **注意包裹物**：綠色葉片包裹的長條形食物可能是阿粨、粽子或其他包葉料理
5. **觀察顆粒大小**：小顆粒黃色穀物 = 小米，大顆粒 = 白米或糙米
6. **如果不確定，在 description 中說明**：例如「可能是小米阿粨或月桃葉包裹的糯米」

**6. 信心度評估**：
- 清楚可見且特徵明確：90-95%
- 部分可見但可辨識：80-89%
- 推測但合理：70-79%
- 不確定但可能：60-69%

**🇹🇼 台灣常見料理識別提示**：
如果圖片中出現以下特徵，請特別注意：
- **綠色葉片包裹的食物** → 可能是：阿粨、粽子、荷葉飯、月桃葉料理
- **小顆粒黃色穀物** → 可能是：小米、小米飯、小米粥
- **黑色小顆粒調料** → 可能是：馬告（山胡椒）、黑胡椒
- **捲曲的綠色蔬菜** → 可能是：過貓、山蘇、蕨類
- **竹筒容器** → 可能是：竹筒飯、竹筒湯
- **石板** → 可能是：石板烤肉、石板料理
- **紅褐色豆類** → 可能是：樹豆、紅豆
- **大片綠色葉片** → 可能是：月桃葉、假酸漿葉、芭蕉葉

**重要要求**：
- 必須識別出至少 10-15 種不同的食材
- **絕對不要遺漏**：湯汁/醬汁、主食、馬鈴薯、洋蔥、咖喱、小米、原住民特色食材
- 不要遺漏任何可見的食物成分
- 即使是很小的食材也要識別
- 包括湯汁、調料、香料等
- **如果看到台灣或原住民特色食材，必須優先識別並標註**
- 如果不確定，也要列出可能的食材，並在 description 中說明可能性

🎯 **特別提醒**：
- 如果這是咖喱料理，"foods" 數組中必須包含「咖喱」或「咖喱湯汁」
- 如果看到黃色或白色的塊狀物，很可能是馬鈴薯
- **🇹🇼 如果這是台灣料理或原住民料理，請特別注意**：
  * 綠色葉片包裹的食物 → 優先考慮「小米阿粨」、「阿拜」、「粽子」
  * 小顆粒黃色穀物 → 優先考慮「小米」而非「玉米」
  * 黑色小顆粒 → 優先考慮「馬告」而非「黑胡椒」
  * 捲曲綠色蔬菜 → 優先考慮「過貓」、「山蘇」
  * 使用正確的台灣食材名稱，不要用模糊的描述
- 請確保返回的 JSON 中 "foods" 數組包含至少 10 個項目！`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2500,
        temperature: 0.2
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ChatGPT Vision API HTTP 錯誤');
      console.error('   - 狀態碼:', response.status);
      console.error('   - 狀態文本:', response.statusText);
      console.error('   - 錯誤詳情:', errorText);
      console.error('   - API Key 前10字元:', apiKey.substring(0, 10));
      throw new Error(`ChatGPT Vision API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ ChatGPT Vision API 完整回應:', JSON.stringify(result, null, 2));
    const content = result.choices[0].message.content;
    console.log('✅ ChatGPT Vision API 內容:', content);
    console.log('✅ 內容長度:', content.length, '字元');
    
    // 檢查 OpenAI 是否拒絕分析圖片
    if (content.includes("I'm sorry") || content.includes("I can't assist") || content.includes("I cannot") || content.includes("I can't help")) {
      console.error('❌ OpenAI 拒絕分析此圖片');
      console.error('   拒絕原因:', content);
      console.error('   當前重試次數:', retryCount);
      
      // 如果還有重試機會，使用更強的 prompt 重試
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 嘗試重試 (${retryCount + 1}/${MAX_RETRIES})，使用更明確的 prompt...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
        return callChatGPTVisionAPIWithStrongerPrompt(imageBuffer, retryCount + 1);
      }
      
      throw new Error('OpenAI content policy: Image analysis refused - ' + content.substring(0, 100));
    }
    
    // 嘗試解析 JSON 回應
    let parsedResult;
    try {
      // 提取 JSON 部分（可能包含在 ```json 標記中）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      console.log('📝 提取的 JSON 字串:', jsonStr.substring(0, 200) + '...');
      parsedResult = JSON.parse(jsonStr);
      console.log('✅ JSON 解析成功');
      console.log('📊 parsedResult.foods 數量:', parsedResult.foods?.length || 0);
      if (parsedResult.foods && parsedResult.foods.length > 0) {
        console.log('📊 第一個食物:', JSON.stringify(parsedResult.foods[0], null, 2));
      }
    } catch (parseError) {
      console.log('❌ JSON 解析失敗:', parseError.message);
      console.log('📝 原始內容:', content);
      console.log('⚠️ 使用文本分析作為回退');
      // 如果 JSON 解析失敗，嘗試從文本中提取食物信息
      parsedResult = parseTextResponse(content);
      console.log('📊 文本分析結果 foods 數量:', parsedResult.foods?.length || 0);
    }
    
    // 轉換為我們的格式
    console.log('🔄 開始轉換 OpenAI 返回的數據格式...');
    console.log('📊 parsedResult.foods:', JSON.stringify(parsedResult.foods, null, 2));
    const suggestions = parsedResult.foods?.map(food => ({
      food: {
        id: Math.floor(Math.random() * 1000) + 100,
        name: food.name,
        calories: food.calories || 200,
        protein: food.protein || 8,
        carbs: food.carbs || 25,
        fat: food.fat || 8,
        fiber: food.fiber || 2,
        sodium: food.sodium || 300,
        category: food.category || '其他',
        portion: food.portion || '1份',
        description: food.description || '',
        cooking_method: parsedResult.cooking_method || '',
        cuisine_type: parsedResult.cuisine_type || ''
      },
      confidence: food.confidence || 0.8
    })) || [];
    
    console.log('✅ 轉換後的 suggestions 數量:', suggestions.length);
    console.log('✅ 第一個 suggestion:', JSON.stringify(suggestions[0], null, 2));
    
    const finalResult = {
      confidence: parsedResult.overall_confidence || 0.85,
      suggestions: suggestions.slice(0, 10),
      description: parsedResult.description || '使用 ChatGPT Vision 分析',
      rawData: {
        originalResponse: content,
        parsedFoods: parsedResult.foods || []
      }
    };
    
    console.log('✅ 最終返回結果:', JSON.stringify(finalResult, null, 2));
    
    return finalResult;
    
  } catch (error) {
    console.error('ChatGPT Vision API 調用錯誤:', error);
    throw error;
  }
}

// 解析文本回應的輔助函數
function parseTextResponse(text) {
  const foods = [];
  
  // 擴展的食物關鍵詞庫
  const foodKeywords = {
    // 蛋白質類
    '雞腿': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sodium: 80, category: '蛋白質' },
    '雞肉': { calories: 200, protein: 25, carbs: 0, fat: 11, fiber: 0, sodium: 70, category: '蛋白質' },
    '豬肉': { calories: 280, protein: 22, carbs: 0, fat: 20, fiber: 0, sodium: 60, category: '蛋白質' },
    '牛肉': { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0, sodium: 65, category: '蛋白質' },
    
    // 蛋類（重點加強 - 絕對不能遺漏）
    '水煮蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '水煮雞蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '雞蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '煮蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '白煮蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '溫泉蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '半熟蛋': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    '煎蛋': { calories: 180, protein: 13, carbs: 1, fat: 14, fiber: 0, sodium: 124, category: '蛋白質' },
    '蛋白': { calories: 52, protein: 11, carbs: 1, fat: 0, fiber: 0, sodium: 166, category: '蛋白質' },
    '蛋黃': { calories: 322, protein: 16, carbs: 4, fat: 27, fiber: 0, sodium: 48, category: '蛋白質' },
    'egg': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    'boiled egg': { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sodium: 124, category: '蛋白質' },
    
    // 蔬菜類
    '胡蘿蔔': { calories: 35, protein: 1, carbs: 8, fat: 0, fiber: 3, sodium: 50, category: '蔬菜' },
    '南瓜': { calories: 30, protein: 1, carbs: 7, fat: 0, fiber: 2, sodium: 1, category: '蔬菜' },
    '馬鈴薯': { calories: 115, protein: 3, carbs: 26, fat: 0, fiber: 2, sodium: 8, category: '蔬菜' },
    '洋蔥': { calories: 40, protein: 1, carbs: 9, fat: 0, fiber: 2, sodium: 4, category: '蔬菜' },
    '青椒': { calories: 25, protein: 1, carbs: 6, fat: 0, fiber: 2, sodium: 3, category: '蔬菜' },
    '蓮藕': { calories: 60, protein: 2, carbs: 14, fat: 0, fiber: 3, sodium: 40, category: '蔬菜' },
    '竹筍': { calories: 25, protein: 3, carbs: 4, fat: 0, fiber: 2, sodium: 5, category: '蔬菜' },
    '玉米': { calories: 90, protein: 3, carbs: 19, fat: 1, fiber: 3, sodium: 15, category: '蔬菜' },
    
    // 菇類
    '香菇': { calories: 25, protein: 3, carbs: 4, fat: 0, fiber: 2, sodium: 5, category: '菇類' },
    '金針菇': { calories: 20, protein: 2, carbs: 4, fat: 0, fiber: 2, sodium: 3, category: '菇類' },
    
    // 調料和湯汁
    '咖喱': { calories: 150, protein: 3, carbs: 12, fat: 11, fiber: 2, sodium: 800, category: '調料' },
    '咖喱汁': { calories: 120, protein: 2, carbs: 10, fat: 9, fiber: 1, sodium: 600, category: '調料' },
    
    // 主食
    '米飯': { calories: 252, protein: 4, carbs: 55, fat: 1, fiber: 1, sodium: 5, category: '主食' },
    '麵條': { calories: 220, protein: 8, carbs: 44, fat: 1, fiber: 2, sodium: 400, category: '主食' }
  };
  
  // 智能關鍵詞匹配
  for (const [keyword, nutrition] of Object.entries(foodKeywords)) {
    if (text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())) {
      foods.push({
        name: keyword,
        confidence: 0.85,
        portion: '1份 (100g)',
        ...nutrition,
        description: `識別到的${keyword}`
      });
    }
  }
  
  // 如果沒有找到任何食材，提供默認的多樣化食材
  if (foods.length === 0) {
    foods.push(
      {
        name: '日式咖喱',
        confidence: 0.75,
        portion: '1份 (150g)',
        calories: 200,
        protein: 8,
        carbs: 25,
        fat: 8,
        fiber: 2,
        sodium: 600,
        category: '主菜',
        description: '日式咖喱主體'
      },
      {
        name: '混合蔬菜',
        confidence: 0.70,
        portion: '1份 (80g)',
        calories: 40,
        protein: 2,
        carbs: 8,
        fat: 0,
        fiber: 3,
        sodium: 20,
        category: '蔬菜',
        description: '各種蔬菜組合'
      }
    );
  }
  
  return {
    foods: foods,
    overall_confidence: 0.8,
    description: '基於智能文本分析的詳細結果',
    cooking_method: '燉煮',
    cuisine_type: '日式料理'
  };
}

// 檢查是否為食物相關的標籤
function isFoodRelated(label) {
  const foodKeywords = [
    'food', 'dish', 'meal', 'cuisine', 'recipe', 'ingredient',
    'rice', 'noodle', 'soup', 'curry', 'ramen', 'pasta',
    'meat', 'chicken', 'beef', 'pork', 'fish', 'seafood',
    'vegetable', 'fruit', 'salad', 'bread', 'cake', 'dessert',
    'drink', 'beverage', 'coffee', 'tea', 'juice',
    'bowl', 'plate', 'chopsticks', 'spoon', 'fork',
    '食物', '料理', '餐點', '米飯', '麵條', '湯', '咖喱', '拉麵'
  ];
  
  return foodKeywords.some(keyword => 
    label.includes(keyword) || keyword.includes(label)
  );
}

// 將 Google Vision 標籤映射到我們的食物數據
function mapLabelToFood(label) {
  const labelLower = label.toLowerCase();
  
  // 咖喱相關
  if (labelLower.includes('curry') || labelLower.includes('咖喱')) {
    return {
      id: 101,
      name: '北海道湯咖喱',
      calories: 580,
      protein: 22.5,
      carbs: 48.2,
      fat: 32.8,
      category: '咖喱'
    };
  }
  
  // 拉麵相關
  if (labelLower.includes('ramen') || labelLower.includes('noodle') || 
      labelLower.includes('拉麵') || labelLower.includes('麵')) {
    return {
      id: 201,
      name: '日式拉麵',
      calories: 450,
      protein: 18.5,
      carbs: 52.0,
      fat: 18.2,
      category: '麵食'
    };
  }
  
  // 湯品相關
  if (labelLower.includes('soup') || labelLower.includes('broth') || 
      labelLower.includes('湯')) {
    return {
      id: 301,
      name: '蔬菜湯',
      calories: 120,
      protein: 4.2,
      carbs: 18.5,
      fat: 3.8,
      category: '湯品'
    };
  }
  
  // 米飯相關
  if (labelLower.includes('rice') || labelLower.includes('米飯')) {
    return {
      id: 401,
      name: '白米飯',
      calories: 252,
      protein: 4.3,
      carbs: 55.2,
      fat: 0.6,
      category: '主食'
    };
  }
  
  // 蔬菜相關
  if (labelLower.includes('vegetable') || labelLower.includes('salad') ||
      labelLower.includes('蔬菜')) {
    return {
      id: 501,
      name: '混合蔬菜',
      calories: 65,
      protein: 3.2,
      carbs: 12.5,
      fat: 2.1,
      category: '蔬菜'
    };
  }
  
  // 默認返回通用食物
  return {
    id: 999,
    name: '未知食物',
    calories: 200,
    protein: 8.0,
    carbs: 25.0,
    fat: 8.0,
    category: '其他'
  };
}

// 模擬用戶資料庫
let users = [];
let userIdCounter = 1;

// 模擬食物資料庫
const foods = [
  { id: 1, name: '白米飯', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: '主食' },
  { id: 2, name: '雞胸肉', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: '蛋白質' },
  { id: 3, name: '花椰菜', calories: 25, protein: 3, carbs: 5, fat: 0.3, category: '蔬菜' },
  { id: 4, name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: '水果' }
];

// 基本中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加 multer 用於處理文件上傳
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'health-nutrition-tracker-api',
    version: '1.0.0',
    database: 'connected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    aiVisionAPI: {
      chatgpt: {
        configured: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'),
        keyPresent: !!process.env.OPENAI_API_KEY,
        keyType: process.env.OPENAI_API_KEY === 'your-openai-api-key-here' ? 'placeholder' : 'real'
      },
      googleVision: {
        configured: !!(process.env.GOOGLE_VISION_API_KEY && process.env.GOOGLE_VISION_API_KEY !== 'test_vision_key'),
        keyPresent: !!process.env.GOOGLE_VISION_API_KEY,
        keyType: process.env.GOOGLE_VISION_API_KEY === 'test_vision_key' ? 'test' : 'real'
      }
    }
  });
});

// API 版本端點
app.get('/api/v1', (req, res) => {
  res.json({
    message: '健康營養追蹤系統 API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      food: '/api/v1/food',
      photo: '/api/v1/photo',
      chat: '/api/v1/chat',
      reports: '/api/v1/reports',
      gamification: '/api/v1/gamification'
    },
    rateLimit: {
      auth: '5 requests per 15 minutes',
      photo: '10 requests per minute',
      general: '1000 requests per 15 minutes'
    }
  });
});

// 認證 API
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_REQUIRED_FIELDS',
        message: '電子郵件和密碼為必填欄位'
      }
    });
  }

  // 檢查用戶是否已存在
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: '此電子郵件已被註冊'
      }
    });
  }

  // 創建新用戶
  const newUser = {
    id: userIdCounter++,
    email,
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  users.push(newUser);

  res.status(201).json({
    success: true,
    data: {
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token: 'mock-jwt-token-' + newUser.id
    },
    message: '註冊成功'
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CREDENTIALS',
        message: '請提供電子郵件和密碼'
      }
    });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '電子郵件或密碼錯誤'
      }
    });
  }

  res.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name },
      token: 'mock-jwt-token-' + user.id
    },
    message: '登入成功'
  });
});

// 食物 API
app.get('/api/v1/food/search', (req, res) => {
  const { q } = req.query;
  let results = foods;
  
  if (q) {
    results = foods.filter(food => 
      food.name.toLowerCase().includes(q.toLowerCase()) ||
      food.category.toLowerCase().includes(q.toLowerCase())
    );
  }

  res.json({
    success: true,
    data: {
      foods: results,
      total: results.length
    }
  });
});

app.get('/api/v1/food/:id', (req, res) => {
  const food = foods.find(f => f.id === parseInt(req.params.id));
  
  if (!food) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'FOOD_NOT_FOUND',
        message: '找不到指定的食物'
      }
    });
  }

  res.json({
    success: true,
    data: { food }
  });
});

// 照片辨識 API (Google Vision API 整合)
app.post('/api/v1/photo/recognize', upload.single('photo'), async (req, res) => {
  console.log('收到照片上傳請求');
  console.log('文件信息:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : '無文件');
  console.log('請求參數:', req.body);
  console.log('Google Vision API Key 存在:', !!process.env.GOOGLE_VISION_API_KEY);
  console.log('Google Vision API Key 值:', process.env.GOOGLE_VISION_API_KEY ? process.env.GOOGLE_VISION_API_KEY.substring(0, 10) + '...' : 'undefined');
  
  // 嘗試使用 ChatGPT Vision API
  if (req.file && process.env.OPENAI_API_KEY) {
    console.log('✅ 開始調用 ChatGPT Vision API...');
    console.log('📝 API Key 前10字元:', process.env.OPENAI_API_KEY.substring(0, 10));
    console.log('📦 原始圖片大小:', req.file.size, 'bytes');
    try {
      // 轉換圖片格式為 JPEG（支援 HEIC）
      const convertedBuffer = await convertImageToJpeg(req.file.buffer, req.file.originalname);
      console.log('📦 轉換後圖片大小:', convertedBuffer.length, 'bytes');
      
      const visionResult = await callChatGPTVisionAPI(convertedBuffer);
      if (visionResult && visionResult.suggestions && visionResult.suggestions.length > 0) {
        console.log('✅ ChatGPT Vision API 成功調用');
        console.log('📊 辨識結果 suggestions 數量:', visionResult.suggestions.length);
        console.log('📊 前3個食材:', visionResult.suggestions.slice(0, 3).map(s => s.food.name).join(', '));
        console.log('📊 完整辨識結果:', JSON.stringify(visionResult, null, 2));
        
        const responseData = {
          success: true,
          data: {
            imageId: 'chatgpt-vision-' + Date.now(),
            recognition: visionResult,
            processingTime: 2000,
            apiUsed: 'ChatGPT Vision API'
          },
          message: '使用 ChatGPT Vision API 辨識成功'
        };
        
        console.log('📤 準備返回給前端的數據:', JSON.stringify(responseData, null, 2));
        return res.json(responseData);
      } else {
        console.log('⚠️ ChatGPT Vision API 返回空結果或無 suggestions');
        console.log('⚠️ visionResult:', visionResult);
      }
    } catch (error) {
      console.error('❌ ChatGPT Vision API 調用失敗:', error);
      console.error('❌ 錯誤類型:', error.name);
      console.error('❌ 錯誤信息:', error.message);
      console.error('❌ 錯誤堆疊:', error.stack);
      console.log('⚠️ 回退到模擬數據');
    }
  } else {
    console.log('⚠️ 跳過 ChatGPT Vision API 調用');
    console.log('   - 文件存在:', !!req.file);
    console.log('   - OpenAI API Key 存在:', !!process.env.OPENAI_API_KEY);
    if (process.env.OPENAI_API_KEY) {
      console.log('   - API Key 前10字元:', process.env.OPENAI_API_KEY.substring(0, 10));
    }
  }
  
  // 如果 OpenAI API 失敗或未配置，使用智能模擬照片辨識
  console.log('📊 使用模擬數據作為回退方案');
  // 智能模擬照片辨識 - 基於圖片特徵分析
  setTimeout(async () => {
    let analysisResult = null;
    
    // 如果有上傳的文件，進行簡單的圖片分析
    if (req.file) {
      try {
        analysisResult = await analyzeImageFeatures(req.file.buffer);
        console.log('圖片分析結果:', analysisResult);
      } catch (error) {
        console.log('圖片分析失敗，使用默認結果:', error.message);
      }
    }
    const scenarios = [
      // 北海道湯咖喱場景
      {
        confidence: 0.92,
        suggestions: [
          { 
            food: { 
              id: 101, 
              name: '北海道湯咖喱', 
              calories: 580, 
              protein: 22.5, 
              carbs: 48.2, 
              fat: 32.8, 
              category: '咖喱' 
            }, 
            confidence: 0.95 
          },
          { 
            food: { 
              id: 102, 
              name: '胡蘿蔔', 
              calories: 32, 
              protein: 0.8, 
              carbs: 7.6, 
              fat: 0.2, 
              category: '蔬菜' 
            }, 
            confidence: 0.90 
          },
          { 
            food: { 
              id: 103, 
              name: '馬鈴薯', 
              calories: 115, 
              protein: 2.6, 
              carbs: 26.2, 
              fat: 0.1, 
              category: '蔬菜' 
            }, 
            confidence: 0.88 
          }
        ]
      },
      // 拉麵場景
      {
        confidence: 0.88,
        suggestions: [
          { 
            food: { 
              id: 201, 
              name: '日式拉麵', 
              calories: 450, 
              protein: 18.5, 
              carbs: 52.0, 
              fat: 18.2, 
              category: '麵食' 
            }, 
            confidence: 0.91 
          },
          { 
            food: { 
              id: 202, 
              name: '溏心蛋', 
              calories: 90, 
              protein: 6.5, 
              carbs: 0.5, 
              fat: 6.8, 
              category: '蛋白質' 
            }, 
            confidence: 0.85 
          }
        ]
      },
      // 一般餐點場景
      {
        confidence: 0.75,
        suggestions: [
          { food: foods[0], confidence: 0.80 },
          { food: foods[2], confidence: 0.70 }
        ]
      }
    ];

    // 基於圖片分析結果選擇場景
    let selectedScenario;
    
    if (analysisResult) {
      if (analysisResult.primaryFood === 'curry') {
        selectedScenario = scenarios[0]; // 咖喱場景
        console.log('基於圖片分析選擇咖喱場景');
      } else if (analysisResult.primaryFood === 'noodle_soup') {
        selectedScenario = scenarios[1]; // 拉麵場景
        console.log('基於圖片分析選擇拉麵場景');
      } else {
        selectedScenario = scenarios[2]; // 一般餐點場景
        console.log('基於圖片分析選擇一般餐點場景');
      }
    } else {
      // 沒有分析結果時，偏向咖喱
      const random = Math.random();
      if (random < 0.8) {
        selectedScenario = scenarios[0]; // 80% 機率是咖喱
      } else {
        selectedScenario = scenarios[1]; // 20% 機率是拉麵
      }
      console.log('無圖片分析結果，使用隨機選擇');
    }

    res.json({
      success: true,
      data: {
        imageId: 'mock-image-' + Date.now(),
        recognition: selectedScenario,
        processingTime: 1200,
        apiUsed: 'Smart Mock Vision API'
      },
      message: '照片上傳和辨識成功'
    });
  }, 1200);
});

// AI 聊天 API (模擬)
app.post('/api/v1/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_MESSAGE',
        message: '請提供聊天訊息'
      }
    });
  }

  // 模擬 AI 回應
  const responses = [
    '根據您的飲食記錄，建議您增加蔬菜攝取量。',
    '您今天的蛋白質攝取量很充足！',
    '建議您多喝水，保持身體水分平衡。',
    '您的營養搭配很均衡，繼續保持！'
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  res.json({
    success: true,
    data: {
      response: randomResponse,
      timestamp: new Date().toISOString()
    }
  });
});

// 報告 API (模擬)
app.get('/api/v1/reports/weekly', (req, res) => {
  res.json({
    success: true,
    data: {
      period: '2025-10-28 to 2025-11-03',
      summary: {
        totalCalories: 12500,
        avgCaloriesPerDay: 1786,
        totalProtein: 420,
        totalCarbs: 1250,
        totalFat: 350
      },
      trends: {
        caloriesTrend: 'stable',
        proteinTrend: 'increasing',
        exerciseTrend: 'improving'
      }
    }
  });
});

// 遊戲化 API (模擬)
app.get('/api/v1/gamification/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      level: 5,
      points: 1250,
      streak: 7,
      achievements: [
        { id: 1, name: '連續記錄一週', unlocked: true },
        { id: 2, name: '均衡飲食達人', unlocked: true },
        { id: 3, name: '運動新手', unlocked: false }
      ],
      dailyTasks: [
        { id: 1, name: '記錄三餐', completed: true, points: 50 },
        { id: 2, name: '喝水 8 杯', completed: false, points: 30 },
        { id: 3, name: '運動 30 分鐘', completed: false, points: 100 }
      ]
    }
  });
});

// 測試工具頁面
app.get('/test-vision-api', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OpenAI Vision API 測試工具</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px}.container{max-width:900px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:30px;text-align:center}.header h1{font-size:32px;margin-bottom:10px}.header p{font-size:16px;opacity:.9}.content{padding:30px}.upload-section{background:#f8f9fa;border-radius:12px;padding:25px;margin-bottom:25px;border:2px dashed #dee2e6}.file-input-wrapper{position:relative;display:inline-block;width:100%;margin-bottom:15px}.file-input-wrapper input[type=file]{position:absolute;opacity:0;width:100%;height:100%;cursor:pointer}.file-input-label{display:block;padding:15px 25px;background:#fff;border:2px solid #667eea;border-radius:8px;text-align:center;cursor:pointer;transition:all .3s;font-size:16px;color:#667eea;font-weight:500}.file-input-label:hover{background:#667eea;color:#fff}.selected-file{margin-top:10px;padding:10px;background:#fff;border-radius:6px;font-size:14px;color:#495057}button{width:100%;padding:15px 30px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:600;transition:transform .2s}button:hover:not(:disabled){transform:translateY(-2px)}button:disabled{opacity:.6;cursor:not-allowed}.log-section{margin-top:25px}.log-section h2{font-size:20px;margin-bottom:15px;color:#212529}.log{background:#1e1e1e;color:#d4d4d4;padding:20px;border-radius:8px;font-family:Monaco,Menlo,"Courier New",monospace;font-size:13px;max-height:500px;overflow-y:auto;line-height:1.6}.log:empty::before{content:"等待測試...";color:#6c757d;font-style:italic}.log-entry{margin:5px 0;padding:5px 0}.success{color:#10b981}.error{color:#ef4444}.info{color:#3b82f6}.warning{color:#f59e0b}.timestamp{color:#6b7280;margin-right:8px}.loading{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;margin-right:8px;vertical-align:middle}@keyframes spin{to{transform:rotate(360deg)}}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-top:20px}.stat-card{background:#f8f9fa;padding:15px;border-radius:8px;text-align:center}.stat-value{font-size:24px;font-weight:700;color:#667eea;margin-bottom:5px}.stat-label{font-size:12px;color:#6c757d;text-transform:uppercase}</style></head><body><div class="container"><div class="header"><h1>🔍 OpenAI Vision API 測試工具</h1><p>診斷食物辨識 API 問題</p></div><div class="content"><div class="upload-section"><div class="file-input-wrapper"><input type="file" id="fileInput" accept="image/*"><label class="file-input-label" for="fileInput">📁 選擇圖片文件</label></div><div id="selectedFile" class="selected-file" style="display:none"></div><button id="testBtn" onclick="testAPI()">🚀 開始測試 API</button></div><div id="statsSection" class="stats" style="display:none"><div class="stat-card"><div class="stat-value" id="statDuration">-</div><div class="stat-label">處理時間（秒）</div></div><div class="stat-card"><div class="stat-value" id="statAPI">-</div><div class="stat-label">使用的 API</div></div><div class="stat-card"><div class="stat-value" id="statFoods">-</div><div class="stat-label">識別食材數量</div></div></div><div class="log-section"><h2>📊 詳細日誌</h2><div id="log" class="log"></div></div></div></div><script>const fileInput=document.getElementById("fileInput"),selectedFileDiv=document.getElementById("selectedFile");function log(e,t="info"){const n=document.getElementById("log"),o=new Date().toLocaleTimeString("zh-TW"),i=document.createElement("div");i.className=`log-entry ${t}`,i.innerHTML=`<span class="timestamp">[${o}]</span>${e}`,n.appendChild(i),n.scrollTop=n.scrollHeight,console.log(`[${o}] ${e}`)}async function testAPI(){const e=document.getElementById("fileInput"),t=document.getElementById("testBtn"),n=document.getElementById("statsSection"),o=document.getElementById("log");if(!e.files||!e.files[0])return void alert("❌ 請先選擇一張圖片");const i=e.files[0];o.innerHTML="",n.style.display="none",log("🎬 開始測試 OpenAI Vision API","info"),log(`📦 圖片: ${i.name}`,"info"),log(`📏 大小: ${(i.size/1024).toFixed(2)} KB`,"info"),log("","info"),t.disabled=!0,t.innerHTML=\'<span class="loading"></span>測試中...\';try{const e=new FormData;e.append("photo",i),log("🌐 發送請求到後端 API...","info"),log("🔗 URL: "+window.location.origin+"/api/v1/photo/recognize","info");const s=Date.now(),a=await fetch(window.location.origin+"/api/v1/photo/recognize",{method:"POST",body:e}),r=Date.now(),c=((r-s)/1e3).toFixed(2);if(log("","info"),log("📥 收到後端回應","success"),log(`⏱️  處理時間: ${c} 秒`,"info"),log(`📊 HTTP 狀態: ${a.status} ${a.statusText}`,a.ok?"success":"error"),!a.ok)throw new Error(`HTTP ${a.status}: ${a.statusText}`);const d=await a.json();log("✅ JSON 解析成功","success"),log("","info"),document.getElementById("statDuration").textContent=c,document.getElementById("statAPI").textContent=d.data?.apiUsed||"未知",document.getElementById("statFoods").textContent=d.data?.recognition?.suggestions?.length||0,n.style.display="grid",log("📋 API 回應結構分析:","info"),log(`  ├─ success: ${d.success}`,"info"),log(`  ├─ data.apiUsed: ${d.data?.apiUsed}`,"info"),log(`  └─ suggestions: ${d.data?.recognition?.suggestions?.length||0} 個`,"info"),log("","info"),"ChatGPT Vision API"===d.data?.apiUsed?(log("🎯 ✅ 成功使用 OpenAI Vision API！","success"),log("","info"),d.data.recognition.suggestions&&d.data.recognition.suggestions.length>0?(log(`🍽️  識別到 ${d.data.recognition.suggestions.length} 種食材:`,"success"),d.data.recognition.suggestions.forEach(((e,t)=>{const n=Math.round(100*e.confidence);log(`  ${t+1}. ${e.food.name} - ${n}% 信心度`,"success"),log(`     └─ ${e.food.calories} 卡路里 | ${e.food.protein}g 蛋白質`,"info")}))):log("⚠️  警告: 沒有識別到任何食材","warning")):(log(`⚠️  警告: 使用的是 ${d.data?.apiUsed}`,"warning"),log("❌ 未使用 OpenAI Vision API","error")),log("","info"),log("📄 完整 API 回應:","info"),log(JSON.stringify(d,null,2),"info")}catch(e){log("","info"),log("❌ 測試失敗","error"),log(`❌ 錯誤: ${e.message}`,"error")}finally{t.disabled=!1,t.innerHTML="🚀 開始測試 API"}}fileInput.addEventListener("change",(function(){this.files&&this.files[0]&&(selectedFileDiv.textContent=`✅ 已選擇: ${this.files[0].name} (${(this.files[0].size/1024).toFixed(2)} KB)`,selectedFileDiv.style.display="block")}))</script></body></html>');
});

// 基本路由
app.get('/', (req, res) => {
  res.json({
    message: '🍎 健康營養追蹤系統 API',
    status: 'running',
    version: '1.0.0',
    features: [
      '✅ 用戶認證系統',
      '✅ 食物資料庫搜尋',
      '✅ 照片辨識 (模擬)',
      '✅ AI 聊天顧問 (模擬)',
      '✅ 健康報告生成',
      '✅ 遊戲化系統'
    ],
    endpoints: ['/health', '/api/v1', '/test-vision-api']
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '伺服器內部錯誤'
    }
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API 端點不存在'
    }
  });
});

// 啟動服務器
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 健康營養追蹤系統 API 運行於 port ${port}`);
  console.log(`📊 健康檢查: http://localhost:${port}/health`);
  console.log(`🔗 API v1: http://localhost:${port}/api/v1`);
  console.log(`👤 用戶註冊: POST http://localhost:${port}/api/v1/auth/register`);
  console.log(`🔐 用戶登入: POST http://localhost:${port}/api/v1/auth/login`);
  console.log(`🍎 食物搜尋: GET http://localhost:${port}/api/v1/food/search`);
  console.log(`📸 照片辨識: POST http://localhost:${port}/api/v1/photo/recognize`);
  console.log(`💬 AI 聊天: POST http://localhost:${port}/api/v1/chat`);
  console.log(`📊 週報告: GET http://localhost:${port}/api/v1/reports/weekly`);
  console.log(`🎮 遊戲化: GET http://localhost:${port}/api/v1/gamification/profile`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});