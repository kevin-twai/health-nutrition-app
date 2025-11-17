#!/bin/bash

echo "🧪 快速測試前端與後端連接"
echo "================================"

FRONTEND_URL="https://health-nutrition-web.onrender.com"
BACKEND_URL="https://health-nutrition-api.onrender.com"

# 1. 測試前端
echo ""
echo "1️⃣ 測試前端..."
curl -s -o /dev/null -w "   狀態碼: %{http_code}\n" $FRONTEND_URL

# 2. 測試後端健康檢查
echo ""
echo "2️⃣ 測試後端健康檢查..."
curl -s --max-time 5 $BACKEND_URL/health | jq -r '"   狀態: " + .status + " | 版本: " + .version'

# 3. 測試 API Gateway
echo ""
echo "3️⃣ 測試 API Gateway..."
curl -s --max-time 5 $BACKEND_URL/api/v1 | jq -r '"   版本: " + .version + " | 訊息: " + .message'

# 4. 測試 AI 聊天（不需要認證）
echo ""
echo "4️⃣ 測試 AI 聊天..."
CHAT_RESPONSE=$(curl -s --max-time 5 -X POST $BACKEND_URL/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "測試"}')
CHAT_SUCCESS=$(echo "$CHAT_RESPONSE" | jq -r '.success')
if [ "$CHAT_SUCCESS" = "true" ]; then
  echo "   ✅ AI 聊天正常"
  echo "$CHAT_RESPONSE" | jq -r '"   回應: " + .data.response'
else
  echo "   ⚠️  AI 聊天需要認證或有其他問題"
  echo "$CHAT_RESPONSE" | jq -r '.error.message' | sed 's/^/   錯誤: /'
fi

# 5. 測試食物搜尋
echo ""
echo "5️⃣ 測試食物搜尋..."
FOOD_RESPONSE=$(curl -s --max-time 5 "$BACKEND_URL/api/v1/food/search?q=雞")
FOOD_SUCCESS=$(echo "$FOOD_RESPONSE" | jq -r '.success')
if [ "$FOOD_SUCCESS" = "true" ]; then
  FOOD_COUNT=$(echo "$FOOD_RESPONSE" | jq -r '.data.total')
  echo "   ✅ 食物搜尋正常 (找到 $FOOD_COUNT 筆)"
else
  echo "   ⚠️  食物搜尋無資料或需要認證"
fi

echo ""
echo "================================"
echo "✅ 快速測試完成！"
echo ""
echo "🌐 前端: $FRONTEND_URL"
echo "🔌 後端: $BACKEND_URL"
echo ""
echo "💡 提示:"
echo "   - 如果後端測試都通過，前後端連接應該正常"
echo "   - 某些 API 需要用戶認證才能使用"
echo "   - 在瀏覽器中打開前端查看完整功能"
