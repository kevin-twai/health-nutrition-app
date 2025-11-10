#!/bin/bash

# 測試被 OpenAI 拒絕的圖片
# 這個腳本會測試 IMG_3843.JPG

IMAGE_PATH="/Users/kevinhktw/Downloads/image/IMG_3843.JPG"

echo "🧪 測試被拒絕的圖片"
echo "===================="
echo "圖片: $IMAGE_PATH"
echo ""

if [ ! -f "$IMAGE_PATH" ]; then
  echo "❌ 找不到圖片: $IMAGE_PATH"
  exit 1
fi

echo "📤 上傳圖片到 API（使用改進後的重試機制）..."
echo ""

# 測試遠端 API
curl -X POST \
  https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
  -F "photo=@$IMAGE_PATH" \
  -F "maxResults=10" \
  -F "minConfidence=0.3" \
  -F "language=zh-TW" \
  | jq '.'

echo ""
echo "✅ 測試完成"
echo ""
echo "💡 提示："
echo "  - 如果看到 'ChatGPT Vision API'，表示成功使用 OpenAI"
echo "  - 如果看到 'Mock Data'，表示回退到模擬數據"
echo "  - 檢查 Render 日誌查看重試過程"
