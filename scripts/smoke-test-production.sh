#!/bin/bash

# 生產環境煙霧測試腳本
# 用於驗證部署後的基本功能

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 檢查參數
if [ -z "$1" ]; then
    echo "使用方法: $0 <API_URL> [JWT_TOKEN]"
    echo "範例: $0 https://your-app.onrender.com eyJhbGc..."
    exit 1
fi

API_URL="$1"
JWT_TOKEN="${2:-}"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  生產環境煙霧測試${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "API URL: $API_URL"
echo ""

# 測試計數器
total_tests=0
passed_tests=0
failed_tests=0

# 測試函數
test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((passed_tests++))
    ((total_tests++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((failed_tests++))
    ((total_tests++))
}

# 1. 測試健康檢查
echo "1. 測試健康檢查端點..."
echo ""

response=$(curl -s -w "\n%{http_code}" "$API_URL/health" || echo "000")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    test_pass "健康檢查端點正常 (HTTP 200)"
    if echo "$body" | grep -q "ok\|healthy"; then
        test_pass "健康檢查回應正確"
    else
        test_fail "健康檢查回應格式異常"
    fi
else
    test_fail "健康檢查端點失敗 (HTTP $http_code)"
fi

echo ""

# 2. 測試 API 根端點
echo "2. 測試 API 根端點..."
echo ""

response=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1" || echo "000")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
    test_pass "API 根端點可訪問 (HTTP $http_code)"
else
    test_fail "API 根端點失敗 (HTTP $http_code)"
fi

echo ""

# 3. 測試成分識別端點（需要 JWT）
if [ -n "$JWT_TOKEN" ]; then
    echo "3. 測試成分識別端點（需要認證）..."
    echo ""
    
    # 測試端點是否存在
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/api/v1/photo/recognize-with-components" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        || echo "000")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "400" ]; then
        test_pass "成分識別端點存在（需要圖片）"
    elif [ "$http_code" = "401" ]; then
        test_fail "JWT Token 無效或過期"
    elif [ "$http_code" = "404" ]; then
        test_fail "成分識別端點不存在"
    else
        test_pass "成分識別端點可訪問 (HTTP $http_code)"
    fi
    
    echo ""
    
    # 4. 測試成分調整端點
    echo "4. 測試成分調整端點..."
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/api/v1/component-adjustment/add" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"sessionId":"test","component":{"name":"測試"}}' \
        || echo "000")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "400" ] || [ "$http_code" = "200" ]; then
        test_pass "成分調整端點存在"
    elif [ "$http_code" = "401" ]; then
        test_fail "JWT Token 無效或過期"
    elif [ "$http_code" = "404" ]; then
        test_fail "成分調整端點不存在"
    else
        test_pass "成分調整端點可訪問 (HTTP $http_code)"
    fi
    
    echo ""
else
    echo "3. 跳過認證測試（未提供 JWT Token）"
    echo ""
    echo "   提示: 提供 JWT Token 以測試完整功能"
    echo "   使用方法: $0 $API_URL <your-jwt-token>"
    echo ""
fi

# 5. 測試 CORS 配置
echo "5. 測試 CORS 配置..."
echo ""

response=$(curl -s -I -X OPTIONS "$API_URL/api/v1/photo/recognize" \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: POST" || echo "")

if echo "$response" | grep -qi "access-control-allow-origin"; then
    test_pass "CORS 已配置"
else
    test_fail "CORS 未配置或配置錯誤"
fi

echo ""

# 6. 測試響應時間
echo "6. 測試響應時間..."
echo ""

start_time=$(date +%s%N)
curl -s "$API_URL/health" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    test_pass "響應時間良好: ${response_time}ms"
elif [ $response_time -lt 3000 ]; then
    test_pass "響應時間可接受: ${response_time}ms"
else
    test_fail "響應時間過長: ${response_time}ms"
fi

echo ""

# 總結
echo "═══════════════════════════════════════════════════════"
echo "測試總結"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "總測試數: ${BLUE}$total_tests${NC}"
echo -e "通過: ${GREEN}$passed_tests${NC}"
echo -e "失敗: ${RED}$failed_tests${NC}"
echo ""

# 計算通過率
if [ $total_tests -gt 0 ]; then
    pass_rate=$((passed_tests * 100 / total_tests))
    echo -e "通過率: ${BLUE}$pass_rate%${NC}"
    echo ""
fi

# 給出結論
if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}✓ 所有煙霧測試都通過！系統運行正常。${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 $failed_tests 個測試失敗，請檢查系統狀態。${NC}"
    echo ""
    echo "建議："
    echo "  1. 檢查 Render Dashboard 的日誌"
    echo "  2. 確認環境變數已正確設置"
    echo "  3. 驗證部署是否完全成功"
    echo "  4. 檢查服務是否正在運行"
    exit 1
fi
