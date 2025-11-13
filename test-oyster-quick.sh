#!/bin/bash

# 快速測試生蠔圖片
# 使用方式: ./test-oyster-quick.sh [圖片路徑]

IMAGE_PATH=${1:-"oyster.jpg"}

if [ ! -f "$IMAGE_PATH" ]; then
  echo "❌ 找不到圖片: $IMAGE_PATH"
  echo ""
  echo "使用方式:"
  echo "  ./test-oyster-quick.sh /path/to/oyster/image.jpg"
  exit 1
fi

echo "🦪 測試生蠔圖片辨識"
echo "===================="
echo "圖片: $IMAGE_PATH"
echo ""

curl -X POST \
  https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
  -F "photo=@$IMAGE_PATH" \
  -F "maxResults=10" \
  -F "minConfidence=0.3" \
  -F "language=zh-TW" \
  | jq '.'
