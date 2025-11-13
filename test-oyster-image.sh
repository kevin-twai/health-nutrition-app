#!/bin/bash

# 測試生蠔圖片辨識

echo "🦪 測試生蠔圖片辨識"
echo "===================="
echo ""

# 檢查圖片檔案
IMAGE_FILE="oyster-test.jpg"

if [ ! -f "$IMAGE_FILE" ]; then
  echo "⚠️  請將生蠔圖片儲存為 $IMAGE_FILE"
  echo ""
  echo "您可以使用以下指令："
  echo "  cp /path/to/your/oyster/image.jpg $IMAGE_FILE"
  exit 1
fi

echo "📤 上傳生蠔圖片到 API..."
echo "圖片檔案: $IMAGE_FILE"
echo ""

# 測試本地 API (如果正在運行)
echo "🔍 測試 1: 本地 API (localhost:3000)"
echo "-----------------------------------"
LOCAL_RESPONSE=$(curl -s -X POST \
  http://localhost:3000/api/v1/photo/recognize \
  -F "photo=@$IMAGE_FILE" \
  -F "maxResults=10" \
  -F "minConfidence=0.3" \
  -F "language=zh-TW" 2>/dev/null)

if [ $? -eq 0 ] && [ ! -z "$LOCAL_RESPONSE" ]; then
  echo "✅ 本地 API 回應:"
  echo "$LOCAL_RESPONSE" | jq '.'
  echo ""
else
  echo "⚠️  本地 API 無法連接（可能未啟動）"
  echo ""
fi

# 測試遠端 API
echo "🔍 測試 2: 遠端 API (Render)"
echo "-----------------------------------"
REMOTE_RESPONSE=$(curl -s -X POST \
  https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
  -F "photo=@$IMAGE_FILE" \
  -F "maxResults=10" \
  -F "minConfidence=0.3" \
  -F "language=zh-TW")

if [ $? -eq 0 ] && [ ! -z "$REMOTE_RESPONSE" ]; then
  echo "✅ 遠端 API 回應:"
  echo "$REMOTE_RESPONSE" | jq '.'
  echo ""
  
  # 分析結果
  echo "📊 辨識結果分析:"
  echo "-----------------------------------"
  
  # 檢查是否成功
  SUCCESS=$(echo "$REMOTE_RESPONSE" | jq -r '.success')
  if [ "$SUCCESS" = "true" ]; then
    echo "✅ 辨識成功"
    
    # 顯示辨識出的食材
    FOODS=$(echo "$REMOTE_RESPONSE" | jq -r '.data.foods[].name')
    FOOD_COUNT=$(echo "$REMOTE_RESPONSE" | jq -r '.data.foods | length')
    echo "🍽️  辨識出 $FOOD_COUNT 種食材:"
    echo "$FOODS" | while read food; do
      echo "   - $food"
    done
    echo ""
    
    # 顯示營養資訊
    CALORIES=$(echo "$REMOTE_RESPONSE" | jq -r '.data.nutrition.calories')
    PROTEIN=$(echo "$REMOTE_RESPONSE" | jq -r '.data.nutrition.protein')
    CARBS=$(echo "$REMOTE_RESPONSE" | jq -r '.data.nutrition.carbohydrates')
    FAT=$(echo "$REMOTE_RESPONSE" | jq -r '.data.nutrition.fat')
    
    echo "📊 營養資訊:"
    echo "   熱量: ${CALORIES}g"
    echo "   蛋白質: ${PROTEIN}g"
    echo "   碳水化合物: ${CARBS}g"
    echo "   脂肪: ${FAT}g"
    echo ""
    
    # 顯示信心度
    CONFIDENCE=$(echo "$REMOTE_RESPONSE" | jq -r '.data.foods[0].confidence')
    echo "🎯 信心度: $CONFIDENCE"
    
  else
    echo "❌ 辨識失敗"
    ERROR=$(echo "$REMOTE_RESPONSE" | jq -r '.error')
    echo "錯誤訊息: $ERROR"
  fi
else
  echo "❌ 遠端 API 無法連接"
fi

echo ""
echo "✅ 測試完成"
