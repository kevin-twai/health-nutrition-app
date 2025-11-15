#!/bin/bash

# 測試照片上傳到 Render 部署的 API

echo "🧪 測試照片上傳功能"
echo "===================="
echo ""

# 檢查圖片文件是否存在
IMAGE_PATH="$HOME/Downloads/IMG_3177.JPG"

if [ ! -f "$IMAGE_PATH" ]; then
    echo "❌ 錯誤：找不到圖片文件 $IMAGE_PATH"
    echo "請確認文件路徑是否正確"
    exit 1
fi

echo "✅ 找到圖片文件: $IMAGE_PATH"
echo ""

# API 端點
API_URL="https://health-nutrition-api.onrender.com/api/v1/photo/recognize"

echo "📤 正在上傳圖片到 $API_URL"
echo "⏳ 請稍候，這可能需要一些時間..."
echo ""

# 發送請求
curl -X POST "$API_URL" \
  -F "photo=@$IMAGE_PATH" \
  -H "Content-Type: multipart/form-data" \
  --max-time 120 \
  -w "\n\n⏱️  HTTP Status: %{http_code}\n⏱️  Total Time: %{time_total}s\n" \
  -v

echo ""
echo "===================="
echo "✅ 測試完成"
