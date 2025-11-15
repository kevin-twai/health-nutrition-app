#!/bin/bash

# 單張圖片測試腳本
# 用法: ./test-single-image.sh <image_path> [token]

API_URL="https://health-nutrition-api.onrender.com/api/v1"

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🍽️  食物識別測試工具${NC}"
echo "================================"
echo ""

# 檢查參數
if [ -z "$1" ]; then
    echo -e "${RED}❌ 請提供圖片路徑${NC}"
    echo ""
    echo "用法:"
    echo "  $0 <image_path> [token]"
    echo ""
    echo "範例:"
    echo "  $0 ./my-food.jpg"
    echo "  $0 ./my-food.jpg eyJhbGc..."
    echo ""
    exit 1
fi

IMAGE_PATH=$1
TOKEN=$2

# 檢查圖片是否存在
if [ ! -f "$IMAGE_PATH" ]; then
    echo -e "${RED}❌ 圖片檔案不存在: $IMAGE_PATH${NC}"
    exit 1
fi

echo -e "${BLUE}📸 圖片:${NC} $IMAGE_PATH"
echo ""

# 如果沒有提供 token，嘗試註冊
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠ 未提供 token，註冊新用戶...${NC}"
    
    RANDOM_USER="test_$(date +%s)@example.com"
    RANDOM_PASS="Test123456"
    
    register_response=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$RANDOM_USER\",
            \"password\": \"$RANDOM_PASS\",
            \"name\": \"Test User\"
        }")
    
    TOKEN=$(echo "$register_response" | jq -r '.token // empty')
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 無法取得 token${NC}"
        echo "$register_response" | jq '.'
        exit 1
    fi
    
    echo -e "${GREEN}✓ 成功註冊並取得 token${NC}"
    echo ""
fi

echo -e "${BLUE}🔍 開始識別...${NC}"
echo ""

# 上傳並識別
response=$(curl -s -X POST "$API_URL/photo/recognize" \
    -H "Authorization: Bearer $TOKEN" \
    -F "photo=@$IMAGE_PATH" \
    -w "\n%{http_code}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "================================"
echo ""

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ 識別成功！${NC}"
    echo ""
    
    # 解析結果
    confidence=$(echo "$body" | jq -r '.confidence // 0')
    food_count=$(echo "$body" | jq -r '.foods | length')
    processing_time=$(echo "$body" | jq -r '.processingTime // 0')
    
    echo -e "${BLUE}📊 識別結果:${NC}"
    echo "  信心度: $(echo "scale=0; $confidence * 100" | bc)%"
    echo "  處理時間: ${processing_time}ms"
    echo "  識別到 $food_count 個食物"
    echo ""
    
    # 顯示每個食物的詳細資訊
    echo -e "${BLUE}🍱 食物清單:${NC}"
    echo ""
    
    for i in $(seq 0 $((food_count - 1))); do
        name=$(echo "$body" | jq -r ".foods[$i].name")
        portion=$(echo "$body" | jq -r ".foods[$i].portion.amount")
        unit=$(echo "$body" | jq -r ".foods[$i].portion.unit")
        calories=$(echo "$body" | jq -r ".foods[$i].nutrition.calories")
        protein=$(echo "$body" | jq -r ".foods[$i].nutrition.protein")
        carbs=$(echo "$body" | jq -r ".foods[$i].nutrition.carbohydrates")
        fat=$(echo "$body" | jq -r ".foods[$i].nutrition.fat")
        
        echo -e "${CYAN}$((i + 1)). $name${NC}"
        echo "   份量: $portion $unit"
        echo "   熱量: ${calories} kcal"
        echo "   蛋白質: ${protein}g | 碳水: ${carbs}g | 脂肪: ${fat}g"
        echo ""
    done
    
    # 總營養
    total_calories=$(echo "$body" | jq '[.foods[].nutrition.calories] | add')
    total_protein=$(echo "$body" | jq '[.foods[].nutrition.protein] | add')
    total_carbs=$(echo "$body" | jq '[.foods[].nutrition.carbohydrates] | add')
    total_fat=$(echo "$body" | jq '[.foods[].nutrition.fat] | add')
    
    echo "================================"
    echo -e "${BLUE}📈 總營養成分:${NC}"
    echo "  總熱量: ${total_calories} kcal"
    echo "  總蛋白質: ${total_protein}g"
    echo "  總碳水化合物: ${total_carbs}g"
    echo "  總脂肪: ${total_fat}g"
    echo ""
    
    # 儲存完整回應
    echo "$body" | jq '.' > last-recognition-result.json
    echo -e "${GREEN}✓ 完整結果已儲存到 last-recognition-result.json${NC}"
    
else
    echo -e "${RED}❌ 識別失敗 (HTTP $http_code)${NC}"
    echo ""
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
fi

echo ""
