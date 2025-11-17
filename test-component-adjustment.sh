#!/bin/bash

# 成分調整 API 測試腳本

API_URL="http://localhost:3000/api/v1"
SESSION_ID=""

echo "=========================================="
echo "成分調整 API 測試"
echo "=========================================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 測試函數
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "${YELLOW}測試: ${name}${NC}"
    echo "端點: ${method} ${endpoint}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${API_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X ${method} \
            -H "Content-Type: application/json" \
            -d "${data}" \
            "${API_URL}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ 成功 (HTTP ${http_code})${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ 失敗 (HTTP ${http_code})${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# 步驟 1: 首先需要執行食物識別以獲取 sessionId
echo "=========================================="
echo "步驟 1: 執行食物識別（需要先有圖片）"
echo "=========================================="
echo ""
echo "請先執行以下命令獲取 sessionId:"
echo "curl -X POST ${API_URL}/photo/recognize-with-components \\"
echo "  -F \"photo=@your_food_image.jpg\""
echo ""
echo "然後將返回的 sessionId 設置到此腳本中"
echo ""

# 如果沒有 sessionId，使用測試 ID
if [ -z "$SESSION_ID" ]; then
    echo -e "${YELLOW}警告: 未設置 SESSION_ID，使用測試 ID${NC}"
    SESSION_ID="test_session_123"
    echo ""
fi

echo "使用 SESSION_ID: ${SESSION_ID}"
echo ""

# 步驟 2: 添加成分
echo "=========================================="
echo "步驟 2: 添加成分"
echo "=========================================="
echo ""

test_endpoint \
    "添加青蔥成分" \
    "POST" \
    "/component-adjustment/add" \
    "{
        \"sessionId\": \"${SESSION_ID}\",
        \"component\": {
            \"name\": \"青蔥\",
            \"estimatedPortion\": 10,
            \"cookingMethod\": \"stir_fried\",
            \"category\": \"garnish\"
        }
    }"

# 步驟 3: 調整份量
echo "=========================================="
echo "步驟 3: 調整份量"
echo "=========================================="
echo ""

test_endpoint \
    "調整成分份量" \
    "POST" \
    "/component-adjustment/update-portion" \
    "{
        \"sessionId\": \"${SESSION_ID}\",
        \"componentId\": \"comp_1\",
        \"newPortion\": 250
    }"

# 步驟 4: 重新計算營養
echo "=========================================="
echo "步驟 4: 重新計算營養"
echo "=========================================="
echo ""

test_endpoint \
    "重新計算營養" \
    "POST" \
    "/component-adjustment/recalculate" \
    "{
        \"sessionId\": \"${SESSION_ID}\"
    }"

# 步驟 5: 獲取會話狀態
echo "=========================================="
echo "步驟 5: 獲取會話狀態"
echo "=========================================="
echo ""

test_endpoint \
    "獲取會話狀態" \
    "GET" \
    "/component-adjustment/session/${SESSION_ID}" \
    ""

# 步驟 6: 獲取調整歷史
echo "=========================================="
echo "步驟 6: 獲取調整歷史"
echo "=========================================="
echo ""

test_endpoint \
    "獲取調整歷史" \
    "GET" \
    "/component-adjustment/history/${SESSION_ID}" \
    ""

# 步驟 7: 移除成分
echo "=========================================="
echo "步驟 7: 移除成分"
echo "=========================================="
echo ""

test_endpoint \
    "移除成分" \
    "POST" \
    "/component-adjustment/remove" \
    "{
        \"sessionId\": \"${SESSION_ID}\",
        \"componentId\": \"comp_2\"
    }"

echo "=========================================="
echo "測試完成"
echo "=========================================="
echo ""
echo "注意事項:"
echo "1. 確保 API 服務器正在運行 (npm run dev)"
echo "2. 首先執行食物識別以獲取有效的 sessionId"
echo "3. 將獲取的 sessionId 設置到此腳本的 SESSION_ID 變數中"
echo "4. 某些測試可能會失敗，因為它們依賴於實際的識別結果"
echo ""
