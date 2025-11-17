#!/bin/bash

# 測試成分識別端點
# Test Component Detection Endpoint

echo "=========================================="
echo "測試亞洲料理成分識別 API"
echo "Testing Asian Cuisine Component Detection API"
echo "=========================================="
echo ""

# API 端點
API_URL="${API_URL:-http://localhost:3001}"
ENDPOINT="${API_URL}/api/v1/photo/recognize-with-components"

# 測試圖片路徑（請替換為實際的測試圖片）
TEST_IMAGE="${1:-test-images/fried-rice.jpg}"

if [ ! -f "$TEST_IMAGE" ]; then
    echo "❌ 錯誤: 找不到測試圖片 $TEST_IMAGE"
    echo "用法: $0 <圖片路徑>"
    echo "範例: $0 test-images/fried-rice.jpg"
    exit 1
fi

echo "📸 測試圖片: $TEST_IMAGE"
echo "🌐 API 端點: $ENDPOINT"
echo ""

# 測試 1: 啟用成分識別（預設）
echo "=========================================="
echo "測試 1: 啟用成分識別"
echo "=========================================="
echo ""

curl -X POST "$ENDPOINT" \
  -F "photo=@$TEST_IMAGE" \
  -F "language=zh-TW" \
  -F "quality=85" \
  -H "Accept: application/json" \
  | jq '.' || echo "❌ 請求失敗或 jq 未安裝"

echo ""
echo ""

# 測試 2: 停用成分識別
echo "=========================================="
echo "測試 2: 停用成分識別（降級至基礎識別）"
echo "=========================================="
echo ""

curl -X POST "${ENDPOINT}?includeComponents=false" \
  -F "photo=@$TEST_IMAGE" \
  -F "language=zh-TW" \
  -F "quality=85" \
  -H "Accept: application/json" \
  | jq '.' || echo "❌ 請求失敗或 jq 未安裝"

echo ""
echo ""
echo "=========================================="
echo "測試完成"
echo "=========================================="
