#!/bin/bash

# 測試 token 是否有效

API_URL="https://health-nutrition-api.onrender.com"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
    echo "請提供 token"
    echo "用法: $0 <token>"
    exit 1
fi

echo "測試 token 有效性..."
echo ""

# 測試需要認證的端點
echo "測試 /api/v1/users/profile..."
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/users/profile" \
    -H "Authorization: Bearer $TOKEN")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo "Response:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
    echo "✓ Token 格式正確（API 可以處理）"
else
    echo "✗ API 回應異常"
fi
