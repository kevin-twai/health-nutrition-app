#!/bin/bash

# 測試 Render 上的註冊 API
API_URL="https://health-nutrition-api.onrender.com"

echo "🧪 測試 Render API 註冊功能"
echo "================================"
echo ""

# 生成隨機郵箱避免重複
RANDOM_EMAIL="test$(date +%s)@example.com"

echo "📧 使用郵箱: $RANDOM_EMAIL"
echo ""

# 測試註冊
echo "1️⃣ 測試用戶註冊..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"Test@12345\",
    \"confirmPassword\": \"Test@12345\",
    \"profile\": {
      \"name\": \"測試用戶\",
      \"age\": 30,
      \"gender\": \"male\",
      \"height\": 175,
      \"weight\": 70,
      \"activityLevel\": \"moderately_active\"
    }
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP 狀態碼: $HTTP_CODE"
echo "回應內容:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 註冊成功！"
    
    # 嘗試登入
    echo ""
    echo "2️⃣ 測試用戶登入..."
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$RANDOM_EMAIL\",
        \"password\": \"Test@12345\"
      }")
    
    LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
    LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
    
    echo "HTTP 狀態碼: $LOGIN_HTTP_CODE"
    echo "回應內容:"
    echo "$LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"
    echo ""
    
    if [ "$LOGIN_HTTP_CODE" = "200" ]; then
        echo "✅ 登入成功！"
        echo ""
        echo "🎉 所有測試通過！資料庫已正確初始化。"
    else
        echo "❌ 登入失敗"
    fi
else
    echo "❌ 註冊失敗"
    echo ""
    echo "💡 請檢查 Render 日誌，查看資料庫初始化訊息："
    echo "   - 📊 正在連接 PostgreSQL..."
    echo "   - ✅ PostgreSQL 連接成功"
    echo "   - 🔧 開始執行資料庫遷移..."
    echo "   - 🎉 所有資料庫遷移執行完成！"
fi
