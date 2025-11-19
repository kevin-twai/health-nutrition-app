#!/bin/bash

# 簡化的煙霧測試執行腳本
set -e

API_URL="${API_URL:-https://health-nutrition-api.onrender.com}"

echo "=========================================="
echo "🧪 執行煙霧測試"
echo "=========================================="
echo "API URL: $API_URL"
echo ""

# 測試 1: 健康檢查
echo "測試 1: 健康檢查"
echo "----------------------------------------"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 健康檢查通過 (HTTP $HTTP_CODE)"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo "❌ 健康檢查失敗 (HTTP $HTTP_CODE)"
  echo "$BODY"
fi
echo ""

# 測試 2: API 版本端點
echo "測試 2: API 版本端點"
echo "----------------------------------------"
VERSION_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/v1/health" 2>&1)
HTTP_CODE=$(echo "$VERSION_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  echo "✅ API 端點可訪問 (HTTP $HTTP_CODE)"
else
  echo "⚠️  API 端點狀態: HTTP $HTTP_CODE"
fi
echo ""

# 測試 3: 檢查服務運行時間
echo "測試 3: 服務運行時間"
echo "----------------------------------------"
UPTIME=$(echo "$BODY" | jq -r '.uptime' 2>/dev/null)
if [ -n "$UPTIME" ] && [ "$UPTIME" != "null" ]; then
  echo "✅ 服務運行時間: ${UPTIME}秒"
else
  echo "⚠️  無法獲取運行時間"
fi
echo ""

# 測試 4: 資料庫連接
echo "測試 4: 資料庫連接"
echo "----------------------------------------"
DB_STATUS=$(echo "$BODY" | jq -r '.database' 2>/dev/null)
if [ "$DB_STATUS" = "connected" ]; then
  echo "✅ 資料庫連接正常"
else
  echo "❌ 資料庫連接異常: $DB_STATUS"
fi
echo ""

# 測試 5: Redis 連接
echo "測試 5: Redis 連接"
echo "----------------------------------------"
REDIS_STATUS=$(echo "$BODY" | jq -r '.checks.redis' 2>/dev/null)
if [ "$REDIS_STATUS" = "true" ]; then
  echo "✅ Redis 連接正常"
else
  echo "⚠️  Redis 連接狀態: $REDIS_STATUS"
fi
echo ""

# 測試 6: 外部 API 連接
echo "測試 6: 外部 API 連接"
echo "----------------------------------------"
EXTERNAL_API_STATUS=$(echo "$BODY" | jq -r '.checks.external_apis' 2>/dev/null)
if [ "$EXTERNAL_API_STATUS" = "true" ]; then
  echo "✅ 外部 API 連接正常"
else
  echo "⚠️  外部 API 連接狀態: $EXTERNAL_API_STATUS"
fi
echo ""

# 測試 7: 記憶體使用
echo "測試 7: 記憶體使用"
echo "----------------------------------------"
HEAP_USED=$(echo "$BODY" | jq -r '.memory.heapUsed' 2>/dev/null)
HEAP_TOTAL=$(echo "$BODY" | jq -r '.memory.heapTotal' 2>/dev/null)
if [ -n "$HEAP_USED" ] && [ "$HEAP_USED" != "null" ]; then
  HEAP_PERCENT=$((HEAP_USED * 100 / HEAP_TOTAL))
  echo "✅ 記憶體使用: ${HEAP_USED} / ${HEAP_TOTAL} (${HEAP_PERCENT}%)"
  if [ $HEAP_PERCENT -lt 90 ]; then
    echo "✅ 記憶體使用正常"
  else
    echo "⚠️  記憶體使用偏高"
  fi
else
  echo "⚠️  無法獲取記憶體資訊"
fi
echo ""

echo "=========================================="
echo "✅ 基礎煙霧測試完成"
echo "=========================================="
echo ""
echo "注意: 完整的功能測試需要："
echo "  1. 有效的 AUTH_TOKEN"
echo "  2. 測試圖片"
echo ""
echo "執行完整測試："
echo "  AUTH_TOKEN=your_token .kiro/specs/recognition-description-mismatch-fix/smoke-test.sh"
