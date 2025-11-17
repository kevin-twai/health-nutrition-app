#!/bin/bash

# 測試 API 健康狀態

API_URL="https://health-nutrition-api.onrender.com"

echo "測試 API 健康狀態..."
echo ""

# 測試根路徑
echo "1. 測試根路徑..."
curl -s "$API_URL/" | head -20
echo ""
echo ""

# 測試 health endpoint
echo "2. 測試 /health..."
curl -s "$API_URL/health" | head -20
echo ""
echo ""

# 測試 API v1
echo "3. 測試 /api/v1..."
curl -s "$API_URL/api/v1" | head -20
echo ""
echo ""

# 測試 photo 路由
echo "4. 測試 /api/v1/photo..."
curl -s "$API_URL/api/v1/photo" | head -20
echo ""
echo ""

# 測試 recognize endpoint (GET - 應該返回 405 Method Not Allowed)
echo "5. 測試 /api/v1/photo/recognize (GET)..."
curl -s -X GET "$API_URL/api/v1/photo/recognize" | head -20
echo ""
echo ""

echo "測試完成！"
