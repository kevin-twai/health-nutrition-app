#!/bin/bash

echo "🔧 最終修復剩餘錯誤..."

# 1. 修復 Food.ts 第 224 行 - minerals 可能為 undefined
sed -i '' 's/nutritionPer100g\.minerals\.sodium/(nutritionPer100g.minerals?.sodium || 0)/g' apps/api/src/models/Food.ts

# 2. 修復 NutritionCalculator.ts 第 384 行
sed -i '' 's/total\.minerals\.sodium/(total.minerals?.sodium || 0)/g' apps/api/src/services/NutritionCalculator.ts

# 3. 修復 FoodRecognitionEngine.ts - 移除 suggestions 屬性
sed -i '' '/suggestions: suggestions,/d' apps/api/src/services/FoodRecognitionEngine.ts

echo "✅ 修復完成！"
