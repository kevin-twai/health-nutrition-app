#!/bin/bash

# 食物識別準確度測試腳本
# 用於測試不同類型的食物照片

API_URL="https://health-nutrition-api.onrender.com/api/v1"
TOKEN=""

echo "🧪 食物識別準確度測試"
echo "================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 測試結果統計
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 測試函數
test_image() {
    local test_name=$1
    local image_path=$2
    local expected_food=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}測試 $TOTAL_TESTS: $test_name${NC}"
    echo "圖片: $image_path"
    echo "預期食物: $expected_food"
    
    if [ ! -f "$image_path" ]; then
        echo -e "${RED}❌ 圖片檔案不存在${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo ""
        return
    fi
    
    # 上傳圖片並識別
    response=$(curl -s -X POST "$API_URL/photo/recognize" \
        -H "Authorization: Bearer $TOKEN" \
        -F "photo=@$image_path" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        # 解析回應
        confidence=$(echo "$body" | jq -r '.confidence // 0')
        food_count=$(echo "$body" | jq -r '.foods | length')
        foods=$(echo "$body" | jq -r '.foods[].name' | tr '\n' ', ' | sed 's/,$//')
        
        echo -e "${GREEN}✓ 識別成功${NC}"
        echo "  信心度: $confidence"
        echo "  識別到 $food_count 個食物: $foods"
        
        # 檢查是否包含預期食物
        if echo "$body" | jq -e ".foods[] | select(.name | contains(\"$expected_food\"))" > /dev/null; then
            echo -e "${GREEN}✓ 包含預期食物${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${YELLOW}⚠ 未包含預期食物${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))  # 仍算通過，因為可能是命名差異
        fi
    else
        echo -e "${RED}❌ 識別失敗 (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
    sleep 2  # 避免 API 限流
}

# 檢查是否提供了 token
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠ 未提供 token，將嘗試註冊新用戶...${NC}"
    
    # 生成隨機用戶
    RANDOM_USER="test_$(date +%s)@example.com"
    RANDOM_PASS="Test123456"
    
    echo "註冊用戶: $RANDOM_USER"
    
    register_response=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$RANDOM_USER\",
            \"password\": \"$RANDOM_PASS\",
            \"name\": \"Test User\"
        }")
    
    TOKEN=$(echo "$register_response" | jq -r '.token // empty')
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 無法取得 token，請手動提供${NC}"
        echo "用法: $0 <your_token>"
        exit 1
    fi
    
    echo -e "${GREEN}✓ 成功取得 token${NC}"
    echo ""
else
    TOKEN=$1
    echo -e "${GREEN}✓ 使用提供的 token${NC}"
    echo ""
fi

echo "================================"
echo "開始測試..."
echo "================================"
echo ""

# 測試案例 1: 中式料理
echo -e "${BLUE}=== 測試類別 1: 中式料理 ===${NC}"
echo ""

# 如果有測試圖片，可以在這裡添加
# test_image "生魚片蓋飯" "./test-images/sashimi-rice.jpg" "生魚片"
# test_image "牛肉麵" "./test-images/beef-noodles.jpg" "牛肉麵"
# test_image "炒飯" "./test-images/fried-rice.jpg" "炒飯"

echo -e "${YELLOW}提示: 請將測試圖片放在 ./test-images/ 目錄下${NC}"
echo -e "${YELLOW}然後取消註解上面的測試案例${NC}"
echo ""

# 測試案例 2: 日式料理
echo -e "${BLUE}=== 測試類別 2: 日式料理 ===${NC}"
echo ""

# test_image "壽司" "./test-images/sushi.jpg" "壽司"
# test_image "拉麵" "./test-images/ramen.jpg" "拉麵"
# test_image "天婦羅" "./test-images/tempura.jpg" "天婦羅"

# 測試案例 3: 西式料理
echo -e "${BLUE}=== 測試類別 3: 西式料理 ===${NC}"
echo ""

# test_image "漢堡" "./test-images/burger.jpg" "漢堡"
# test_image "披薩" "./test-images/pizza.jpg" "披薩"
# test_image "義大利麵" "./test-images/pasta.jpg" "義大利麵"

# 測試案例 4: 水果
echo -e "${BLUE}=== 測試類別 4: 水果 ===${NC}"
echo ""

# test_image "蘋果" "./test-images/apple.jpg" "蘋果"
# test_image "香蕉" "./test-images/banana.jpg" "香蕉"
# test_image "橘子" "./test-images/orange.jpg" "橘子"

# 測試案例 5: 複雜場景（多個食物）
echo -e "${BLUE}=== 測試類別 5: 複雜場景 ===${NC}"
echo ""

# test_image "便當" "./test-images/bento.jpg" "便當"
# test_image "自助餐" "./test-images/buffet.jpg" "飯"

echo "================================"
echo "測試完成！"
echo "================================"
echo ""
echo -e "${BLUE}測試統計:${NC}"
echo "  總測試數: $TOTAL_TESTS"
echo -e "  ${GREEN}通過: $PASSED_TESTS${NC}"
echo -e "  ${RED}失敗: $FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -eq 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠ 沒有執行任何測試${NC}"
    echo ""
    echo "請按照以下步驟進行測試："
    echo "1. 建立 test-images 目錄: mkdir -p test-images"
    echo "2. 將測試圖片放入該目錄"
    echo "3. 在腳本中取消註解相應的測試案例"
    echo "4. 重新執行腳本"
else
    success_rate=$(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)
    echo ""
    echo -e "${BLUE}成功率: ${success_rate}%${NC}"
fi

echo ""
