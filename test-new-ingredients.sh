#!/bin/bash

# 測試新增的食材
# Test New Ingredients

echo "🧪 測試新增的食材..."
echo ""

API_URL="${API_URL:-https://health-nutrition-api.onrender.com}"

echo "📍 API URL: $API_URL"
echo ""

# 測試食材搜尋
echo "1️⃣ 測試蟹腿/蟹腳..."
curl -s "$API_URL/api/knowledge-base/search?term=蟹腿" | jq -r '.results[0].name // "未找到"'
curl -s "$API_URL/api/knowledge-base/search?term=蟹腳" | jq -r '.results[0].name // "未找到"'
echo ""

echo "2️⃣ 測試豆苗..."
curl -s "$API_URL/api/knowledge-base/search?term=豆苗" | jq -r '.results[0].name // "未找到"'
echo ""

echo "3️⃣ 測試魚片..."
curl -s "$API_URL/api/knowledge-base/search?term=魚片" | jq -r '.results[0].name // "未找到"'
echo ""

echo "4️⃣ 測試水菜..."
curl -s "$API_URL/api/knowledge-base/search?term=水菜" | jq -r '.results[0].name // "未找到"'
echo ""

echo "5️⃣ 測試豆腐..."
curl -s "$API_URL/api/knowledge-base/search?term=豆腐" | jq -r '.results[0].name // "未找到"'
echo ""

echo "6️⃣ 測試白菜..."
curl -s "$API_URL/api/knowledge-base/search?term=白菜" | jq -r '.results[0].name // "未找到"'
echo ""

echo "✅ 測試完成！"
echo ""
echo "💡 提示："
echo "  - 如果顯示「未找到」，請確認 API 已部署最新版本"
echo "  - 如果顯示食材名稱，表示成功！"
echo ""
