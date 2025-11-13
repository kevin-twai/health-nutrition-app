#!/bin/bash

# 測試照片辨識 API

echo "🧪 測試照片辨識 API"
echo "===================="
echo ""

# 檢查是否有測試圖片
if [ ! -f "test-food.jpg" ]; then
  echo "⚠️  找不到測試圖片 test-food.jpg"
  echo "請提供一張食物照片進行測試"
  exit 1
fi

echo "📤 上傳圖片到 API..."
echo ""

# 調用 API
response=$(curl -s -X POST \
  https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
  -F "photo=@test-food.jpg" \
  -F "maxResults=5" \
  -F "minConfidence=0.3" \
  -F "language=zh-TW")

echo "📥 API 回應:"
echo "$response" | jq '.'

echo ""
echo "✅ 測試完成"
