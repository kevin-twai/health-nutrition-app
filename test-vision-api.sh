#!/bin/bash

# 測試 OpenAI Vision API 的腳本

echo "🧪 測試 OpenAI Vision API..."
echo ""

# 創建一個測試圖片（1x1 像素的 PNG）
echo "📦 創建測試圖片..."
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > test-image.png

# 上傳圖片到 API
echo "📤 上傳圖片到 Render..."
curl -X POST https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
  -F "photo=@test-image.png" \
  -H "Accept: application/json" \
  -v 2>&1 | tee api-response.log

echo ""
echo "✅ 測試完成！"
echo ""
echo "請查看 Render Dashboard 的 Logs 標籤，尋找以下日誌："
echo "  - ✅ 開始調用 ChatGPT Vision API..."
echo "  - 📝 API Key 前10字元: sk-proj-c9"
echo "  - 📦 圖片大小: XXX bytes"
echo ""

# 清理
rm -f test-image.png
