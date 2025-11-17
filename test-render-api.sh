#!/bin/bash

# 🧪 Render API 測試腳本
# 使用方法: ./test-render-api.sh https://your-app-name.onrender.com

if [ -z "$1" ]; then
  echo "❌ 請提供 Render URL"
  echo "使用方法: ./test-render-api.sh https://your-app-name.onrender.com"
  exit 1
fi

API_URL="$1"
echo "🚀 開始測試 API: $API_URL"
echo "================================"

# 測試 1: 健康檢查
echo ""
echo "📋 測試 1: 健康檢查"
echo "curl $API_URL/health"
curl -s "$API_URL/health" | jq '.'
echo ""

# 測試 2: 食物搜尋 - 雞肉
echo "================================"
echo "📋 測試 2: 食物搜尋 - 雞肉"
echo "curl $API_URL/api/v1/food/search?q=雞肉"
curl -s "$API_URL/api/v1/food/search?q=雞肉" | jq '.'
echo ""

# 測試 3: 食物搜尋 - 白飯
echo "================================"
echo "📋 測試 3: 食物搜尋 - 白飯"
echo "curl $API_URL/api/v1/food/search?q=白飯"
curl -s "$API_URL/api/v1/food/search?q=白飯" | jq '.'
echo ""

# 測試 4: 用戶註冊
echo "================================"
echo "📋 測試 4: 用戶註冊"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
echo "curl -X POST $API_URL/api/v1/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test123456\",
    \"name\": \"測試用戶\"
  }")
echo "$REGISTER_RESPONSE" | jq '.'

# 提取 token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token // empty')
echo ""

if [ -n "$TOKEN" ]; then
  echo "✅ 註冊成功！Token: ${TOKEN:0:20}..."
  
  # 測試 5: 用戶登入
  echo ""
  echo "================================"
  echo "📋 測試 5: 用戶登入"
  echo "curl -X POST $API_URL/api/v1/auth/login"
  curl -s -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"Test123456\"
    }" | jq '.'
  echo ""
  
  # 測試 6: AI 聊天測試
  echo "================================"
  echo "📋 測試 6: AI 聊天測試"
  echo "curl -X POST $API_URL/api/v1/chat"
  curl -s -X POST "$API_URL/api/v1/chat" \
    -H "Content-Type: application/json" \
    -d "{
      \"message\": \"我今天吃了什麼？\"
    }" | jq '.'
  echo ""
  
  # 測試 7: 週報告
  echo "================================"
  echo "📋 測試 7: 週報告"
  echo "curl $API_URL/api/v1/reports/weekly"
  curl -s "$API_URL/api/v1/reports/weekly" | jq '.'
  echo ""
  
  # 測試 8: 遊戲化資料
  echo "================================"
  echo "📋 測試 8: 遊戲化資料"
  echo "curl $API_URL/api/v1/gamification/profile"
  curl -s "$API_URL/api/v1/gamification/profile" | jq '.'
  echo ""
else
  echo "❌ 註冊失敗，跳過後續測試"
fi

echo "================================"
echo "✅ 測試完成！"
