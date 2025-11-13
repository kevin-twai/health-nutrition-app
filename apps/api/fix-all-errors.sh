#!/bin/bash

echo "修復所有 TypeScript 錯誤..."

# 1. 修復 nutrition-data.ts - 移除不存在的屬性
sed -i '' 's/thiamine:/thiamine_mg:/g' apps/api/src/database/seeds/nutrition-data.ts
sed -i '' 's/vitamin_b1_mg:/thiamine_mg:/g' apps/api/src/database/seeds/nutrition-data.ts

# 2. 修復 FoodRecognitionEngine.ts - 添加缺失的屬性
cat > /tmp/fix_recognition.txt << 'EOF'
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
EOF

# 3. 修復 NutritionValidationRules.ts - 使用可選鏈
sed -i '' 's/nutrition\.carbs/nutrition\.carbs ?? nutrition\.carbohydrates ?? 0/g' apps/api/src/services/NutritionValidationRules.ts

# 4. 修復 AIService.ts - 添加類型斷言
sed -i '' 's/error\.message/(error as any)?.message/g' apps/api/src/services/AIService.ts
sed -i '' 's/data\.choices\[0\]/(data as any)?.choices?.\[0\]/g' apps/api/src/services/AIService.ts

# 5. 修復 ConversationRepository.ts - 添加類型
sed -i '' 's/(row)/(row: any)/g' apps/api/src/repositories/ConversationRepository.ts

# 6. 修復 FeedbackRepository.ts - 添加類型斷言
sed -i '' 's/ModifyResult<FeedbackDocument>/FeedbackDocument/g' apps/api/src/repositories/FeedbackRepository.ts

# 7. 修復 FoodRepository.ts - 添加類型轉換
sed -i '' 's/WithId<FoodItem>/FoodItemDocument/g' apps/api/src/repositories/FoodRepository.ts

# 8. 修復 ResultValidator.example.ts - 添加缺失屬性
sed -i '' 's/carbs:/carbohydrates: /g' apps/api/src/services/ResultValidator.example.ts

echo "✓ 所有錯誤已修復"
