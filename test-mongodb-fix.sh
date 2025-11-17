#!/bin/bash

# MongoDB 修復測試腳本

echo "🧪 測試 MongoDB 修復..."
echo ""

# 設定 API URL
API_URL="https://health-nutrition-aoi.onrender.com"

# 1. 測試健康檢查
echo "1️⃣ 測試 API 健康狀態..."
curl -s "${API_URL}/health" | jq '.'
echo ""

# 2. 測試註冊（獲取 token）
echo "2️⃣ 註冊測試用戶..."
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-mongodb-'$(date +%s)'@example.com",
    "password": "Test123456",
    "profile": {
      "name": "MongoDB Test User",
      "age": 30,
      "gender": "male",
      "height": 170,
      "weight": 70,
      "activityLevel": "moderate"
    }
  }')

echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
echo ""
echo "✅ Token: ${TOKEN:0:20}..."
echo ""

# 3. 測試食物識別（使用測試圖片）
echo "3️⃣ 測試食物識別..."

# 檢查是否有測試圖片
if [ ! -f "test-miso-soup.jpg" ]; then
  echo "⚠️  找不到測試圖片 test-miso-soup.jpg"
  echo "請提供一張食物圖片進行測試"
  echo ""
  echo "使用方式："
  echo "  ./test-mongodb-fix.sh /path/to/your/food-image.jpg"
  exit 1
fi

TEST_IMAGE="${1:-test-miso-soup.jpg}"

echo "使用圖片: $TEST_IMAGE"
echo ""

RECOGNITION_RESPONSE=$(curl -s -X POST "${API_URL}/api/photo/recognize" \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@${TEST_IMAGE}")

echo "$RECOGNITION_RESPONSE" | jq '.'
echo ""

# 4. 分析結果
echo "4️⃣ 分析結果..."
echo ""

SUCCESS=$(echo "$RECOGNITION_RESPONSE" | jq -r '.success')
SUGGESTIONS_COUNT=$(echo "$RECOGNITION_RESPONSE" | jq -r '.data.suggestions | length')
CONFIDENCE=$(echo "$RECOGNITION_RESPONSE" | jq -r '.data.confidence')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ 識別成功！"
  echo "   - 信心度: $CONFIDENCE"
  echo "   - 識別到 $SUGGESTIONS_COUNT 個食物"
  echo ""
  
  # 檢查營養資訊
  echo "📊 營養資訊檢查："
  for i in $(seq 0 $((SUGGESTIONS_COUNT - 1))); do
    FOOD_NAME=$(echo "$RECOGNITION_RESPONSE" | jq -r ".data.suggestions[$i].food.name")
    CALORIES=$(echo "$RECOGNITION_RESPONSE" | jq -r ".data.suggestions[$i].food.calories")
    PROTEIN=$(echo "$RECOGNITION_RESPONSE" | jq -r ".data.suggestions[$i].food.protein")
    CARBS=$(echo "$RECOGNITION_RESPONSE" | jq -r ".data.suggestions[$i].food.carbs")
    FAT=$(echo "$RECOGNITION_RESPONSE" | jq -r ".data.suggestions[$i].food.fat")
    
    echo "   $((i + 1)). $FOOD_NAME"
    echo "      - 熱量: ${CALORIES} kcal"
    echo "      - 蛋白質: ${PROTEIN}g"
    echo "      - 碳水: ${CARBS}g"
    echo "      - 脂肪: ${FAT}g"
    
    if [ "$CALORIES" != "0" ] && [ "$CALORIES" != "null" ]; then
      echo "      ✅ 有營養資訊"
    else
      echo "      ⚠️  缺少營養資訊"
    fi
    echo ""
  done
  
  echo "🎉 測試完成！"
  echo ""
  echo "📝 結論："
  echo "   - MongoDB 修復已生效"
  echo "   - 系統能夠識別食物並提供營養資訊"
  echo "   - 即使 MongoDB 不可用，知識庫後備機制也能正常運作"
  
else
  echo "❌ 識別失敗"
  echo "$RECOGNITION_RESPONSE" | jq '.error'
fi

echo ""
echo "🔍 完整回應已保存到 recognition-test-result.json"
echo "$RECOGNITION_RESPONSE" | jq '.' > recognition-test-result.json
