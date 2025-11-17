#!/bin/bash
API_URL="https://health-nutrition-api.onrender.com"

echo "🧪 開始完整 API 測試"
echo "================================"

# 1. 健康檢查
echo ""
echo "1️⃣ 健康檢查"
HEALTH=$(curl -s "$API_URL/health")
echo "$HEALTH" | jq -r '.status' | sed 's/^/   狀態: /'
echo "$HEALTH" | jq -r '.uptime' | awk '{printf "   運行時間: %.2f 小時\n", $1/3600}'

# 2. 註冊新用戶
echo ""
echo "2️⃣ 註冊新用戶"
EMAIL="test$(date +%s)@example.com"
echo "   Email: $EMAIL"
REGISTER=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test@123456\",
    \"passwordConfirm\": \"Test@123456\",
    \"name\": \"測試用戶\"
  }")
SUCCESS=$(echo "$REGISTER" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "   ✅ 註冊成功"
  TOKEN=$(echo "$REGISTER" | jq -r '.data.token')
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "   ❌ 註冊失敗"
  echo "$REGISTER" | jq -r '.error.message' | sed 's/^/   錯誤: /'
fi

# 3. 登入
echo ""
echo "3️⃣ 用戶登入"
LOGIN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Test@123456\"
  }")
SUCCESS=$(echo "$LOGIN" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "   ✅ 登入成功"
else
  echo "   ❌ 登入失敗"
  echo "$LOGIN" | jq -r '.error.message' | sed 's/^/   錯誤: /'
fi

# 4. AI 聊天
echo ""
echo "4️⃣ AI 聊天"
CHAT=$(curl -s -X POST "$API_URL/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "我今天吃了什麼？"}')
SUCCESS=$(echo "$CHAT" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "   ✅ AI 聊天成功"
  echo "$CHAT" | jq -r '.data.response' | sed 's/^/   回應: /'
else
  echo "   ❌ AI 聊天失敗"
fi

# 5. 週報告
echo ""
echo "5️⃣ 週報告"
REPORT=$(curl -s "$API_URL/api/v1/reports/weekly")
SUCCESS=$(echo "$REPORT" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "   ✅ 週報告成功"
  echo "$REPORT" | jq -r '.data.period' | sed 's/^/   期間: /'
  echo "$REPORT" | jq -r '.data.summary.avgCaloriesPerDay' | sed 's/^/   平均卡路里: /'
else
  echo "   ❌ 週報告失敗"
fi

# 6. 遊戲化
echo ""
echo "6️⃣ 遊戲化資料"
GAME=$(curl -s "$API_URL/api/v1/gamification/profile")
SUCCESS=$(echo "$GAME" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "   ✅ 遊戲化資料成功"
  echo "$GAME" | jq -r '.data.level' | sed 's/^/   等級: /'
  echo "$GAME" | jq -r '.data.points' | sed 's/^/   積分: /'
  echo "$GAME" | jq -r '.data.streak' | sed 's/^/   連續天數: /'
else
  echo "   ❌ 遊戲化資料失敗"
fi

# 7. 食物搜尋
echo ""
echo "7️⃣ 食物搜尋"
FOOD=$(curl -s "$API_URL/api/v1/food/search?q=雞")
SUCCESS=$(echo "$FOOD" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  COUNT=$(echo "$FOOD" | jq -r '.data.total')
  echo "   ✅ 食物搜尋成功"
  echo "   找到 $COUNT 筆資料"
else
  echo "   ❌ 食物搜尋失敗或無資料"
fi

echo ""
echo "================================"
echo "✅ 測試完成"
