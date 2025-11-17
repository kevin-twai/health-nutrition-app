#!/bin/bash

echo "🧪 測試前端與後端連接"
echo "================================"

FRONTEND_URL="https://health-nutrition-web.onrender.com"
BACKEND_URL="https://health-nutrition-api.onrender.com"

# 1. 測試前端是否運行
echo ""
echo "1️⃣ 測試前端是否運行..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "   ✅ 前端正常運行 (HTTP $FRONTEND_STATUS)"
else
  echo "   ❌ 前端無法訪問 (HTTP $FRONTEND_STATUS)"
fi

# 2. 測試後端是否運行
echo ""
echo "2️⃣ 測試後端是否運行..."
BACKEND_HEALTH=$(curl -s $BACKEND_URL/health | jq -r '.status')
if [ "$BACKEND_HEALTH" = "healthy" ]; then
  echo "   ✅ 後端正常運行 (狀態: $BACKEND_HEALTH)"
  UPTIME=$(curl -s $BACKEND_URL/health | jq -r '.uptime')
  echo "   ⏱️  運行時間: $(echo "scale=2; $UPTIME / 3600" | bc) 小時"
else
  echo "   ❌ 後端無法訪問"
fi

# 3. 測試 API 端點
echo ""
echo "3️⃣ 測試 API 端點..."
API_VERSION=$(curl -s $BACKEND_URL/api/v1 | jq -r '.version')
if [ -n "$API_VERSION" ]; then
  echo "   ✅ API 正常 (版本: $API_VERSION)"
else
  echo "   ❌ API 無法訪問"
fi

# 4. 測試 CORS（模擬前端請求）
echo ""
echo "4️⃣ 測試 CORS 設置..."
CORS_RESPONSE=$(curl -s -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  -o /dev/null \
  -w "%{http_code}" \
  $BACKEND_URL/api/v1/chat)

if [ "$CORS_RESPONSE" = "200" ] || [ "$CORS_RESPONSE" = "204" ]; then
  echo "   ✅ CORS 設置正確 (HTTP $CORS_RESPONSE)"
else
  echo "   ⚠️  CORS 可能需要配置 (HTTP $CORS_RESPONSE)"
fi

# 5. 測試報告 API（不需要認證）
echo ""
echo "5️⃣ 測試報告 API..."
REPORT_RESPONSE=$(curl -s $BACKEND_URL/api/v1/reports/weekly)
REPORT_SUCCESS=$(echo "$REPORT_RESPONSE" | jq -r '.success')
if [ "$REPORT_SUCCESS" = "true" ]; then
  echo "   ✅ 報告 API 正常"
  PERIOD=$(echo "$REPORT_RESPONSE" | jq -r '.data.period')
  echo "   📊 報告期間: $PERIOD"
else
  echo "   ⚠️  報告 API 可能需要認證"
fi

# 6. 測試遊戲化 API（不需要認證）
echo ""
echo "6️⃣ 測試遊戲化 API..."
GAME_RESPONSE=$(curl -s $BACKEND_URL/api/v1/gamification/profile)
GAME_SUCCESS=$(echo "$GAME_RESPONSE" | jq -r '.success')
if [ "$GAME_SUCCESS" = "true" ]; then
  echo "   ✅ 遊戲化 API 正常"
  LEVEL=$(echo "$GAME_RESPONSE" | jq -r '.data.level')
  POINTS=$(echo "$GAME_RESPONSE" | jq -r '.data.points')
  echo "   🎮 等級: $LEVEL, 積分: $POINTS"
else
  echo "   ⚠️  遊戲化 API 可能需要認證"
fi

echo ""
echo "================================"
echo "📊 測試總結"
echo "================================"
echo ""
echo "前端 URL: $FRONTEND_URL"
echo "後端 URL: $BACKEND_URL"
echo ""
echo "✅ 如果所有測試都通過，前後端連接正常！"
echo ""
echo "🌐 訪問前端應用:"
echo "   $FRONTEND_URL"
echo ""
echo "📖 查看 API 文檔:"
echo "   $BACKEND_URL/api/v1"
echo ""
echo "🔍 查看健康狀態:"
echo "   $BACKEND_URL/health"
