#!/bin/bash

# 批次圖片測試腳本
# 自動測試指定資料夾中的所有圖片並生成詳細報告

API_URL="https://health-nutrition-api.onrender.com"
TOKEN=""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}🍽️  批次食物識別測試工具${NC}"
echo "================================"
echo ""

# 檢查參數
if [ -z "$1" ]; then
    echo -e "${RED}❌ 請提供圖片資料夾路徑${NC}"
    echo ""
    echo "用法:"
    echo "  $0 <folder_path> [token]"
    echo ""
    echo "範例:"
    echo "  $0 ~/Downloads/Testimg"
    echo "  $0 ~/Downloads/Testimg eyJhbGc..."
    echo ""
    exit 1
fi

IMAGE_FOLDER=$1
TOKEN=$2

# 展開 ~ 為實際路徑
IMAGE_FOLDER="${IMAGE_FOLDER/#\~/$HOME}"

# 檢查資料夾是否存在
if [ ! -d "$IMAGE_FOLDER" ]; then
    echo -e "${RED}❌ 資料夾不存在: $IMAGE_FOLDER${NC}"
    exit 1
fi

echo -e "${BLUE}📁 測試資料夾:${NC} $IMAGE_FOLDER"
echo ""

# 計算圖片數量
IMAGE_COUNT=$(find "$IMAGE_FOLDER" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | wc -l | tr -d ' ')

if [ "$IMAGE_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ 資料夾中沒有找到圖片檔案${NC}"
    echo "支援的格式: JPG, JPEG, PNG, WEBP"
    exit 1
fi

echo -e "${GREEN}✓ 找到 $IMAGE_COUNT 張圖片${NC}"
echo ""

# 如果沒有提供 token，嘗試註冊
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠ 未提供 token，註冊新用戶...${NC}"
    
    RANDOM_USER="test_$(date +%s)@example.com"
    RANDOM_PASS="Test123456"
    
    register_response=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$RANDOM_USER\",
            \"password\": \"$RANDOM_PASS\",
            \"name\": \"Batch Test User\"
        }")
    
    TOKEN=$(echo "$register_response" | jq -r '.token // empty' 2>/dev/null)
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        echo -e "${RED}❌ 無法自動註冊取得 token${NC}"
        echo ""
        echo "請手動提供 token："
        echo "  1. 前往 https://health-nutrition-tracker-api.onrender.com"
        echo "  2. 註冊或登入取得 token"
        echo "  3. 重新執行: $0 $IMAGE_FOLDER <your_token>"
        echo ""
        echo "或使用測試 token（如果有的話）"
        exit 1
    fi
    
    echo -e "${GREEN}✓ 成功註冊並取得 token${NC}"
    echo ""
fi

# 建立結果目錄
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULT_DIR="test-results-$TIMESTAMP"
mkdir -p "$RESULT_DIR"

echo -e "${BLUE}📊 測試結果將儲存到: $RESULT_DIR${NC}"
echo ""
echo "================================"
echo -e "${CYAN}開始批次測試...${NC}"
echo "================================"
echo ""

# 統計變數
TOTAL_TESTS=0
SUCCESSFUL_TESTS=0
FAILED_TESTS=0
TOTAL_FOODS=0
TOTAL_CALORIES=0
TOTAL_PROCESSING_TIME=0

# 建立 CSV 報告標題
CSV_FILE="$RESULT_DIR/test-report.csv"
echo "檔名,狀態,信心度,處理時間(ms),食物數量,總熱量(kcal),食物清單" > "$CSV_FILE"

# 建立詳細報告
REPORT_FILE="$RESULT_DIR/detailed-report.md"
echo "# 批次測試詳細報告" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "測試時間: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"
echo "測試資料夾: $IMAGE_FOLDER" >> "$REPORT_FILE"
echo "圖片數量: $IMAGE_COUNT" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 遍歷所有圖片
find "$IMAGE_FOLDER" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | sort | while read -r image_path; do
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    filename=$(basename "$image_path")
    
    echo -e "${BLUE}[$TOTAL_TESTS/$IMAGE_COUNT] 測試: $filename${NC}"
    
    # 上傳並識別
    response=$(curl -s -X POST "$API_URL/api/v1/photo/recognize" \
        -H "Authorization: Bearer $TOKEN" \
        -F "photo=@$image_path" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        # 檢查是否有 foods 陣列
        has_foods=$(echo "$body" | jq -r 'has("foods")')
        
        if [ "$has_foods" = "true" ]; then
            # 解析結果
            confidence=$(echo "$body" | jq -r '.confidence // 0')
            food_count=$(echo "$body" | jq -r '.foods | length // 0')
            processing_time=$(echo "$body" | jq -r '.processingTime // 0')
            
            # 計算總熱量
            calories=$(echo "$body" | jq '[.foods[]?.nutrition?.calories // 0] | add // 0')
            
            # 取得食物清單
            foods=$(echo "$body" | jq -r '.foods[]?.name // empty' | tr '\n' '; ' | sed 's/;$//')
            
            # 顯示結果
            if [ -n "$confidence" ] && [ "$confidence" != "null" ] && [ "$confidence" != "0" ]; then
                confidence_percent=$(echo "scale=0; $confidence * 100" | bc 2>/dev/null || echo "0")
            else
                confidence_percent="0"
            fi
            echo -e "  ${GREEN}✓ 成功${NC} | 信心度: ${confidence_percent}% | 食物: $food_count 個 | 熱量: ${calories} kcal | 時間: ${processing_time}ms"
        else
            # 沒有 foods 陣列，視為失敗
            echo -e "  ${RED}✗ 失敗${NC} - 回應格式錯誤"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            echo "\"$filename\",失敗,0,0,0,0,\"回應格式錯誤\"" >> "$CSV_FILE"
            echo "## $TOTAL_TESTS. $filename" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            echo "- **狀態**: ❌ 失敗 - 回應格式錯誤" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            echo '```' >> "$REPORT_FILE"
            echo "$body" | jq '.' 2>/dev/null >> "$REPORT_FILE" || echo "$body" >> "$REPORT_FILE"
            echo '```' >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            echo "---" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            echo ""
            sleep 2
            continue
        fi
        
        # 更新統計
        SUCCESSFUL_TESTS=$((SUCCESSFUL_TESTS + 1))
        TOTAL_FOODS=$((TOTAL_FOODS + ${food_count:-0}))
        
        # 安全地計算總熱量
        if [ -n "$calories" ] && [ "$calories" != "null" ]; then
            TOTAL_CALORIES=$(echo "$TOTAL_CALORIES + $calories" | bc 2>/dev/null || echo "$TOTAL_CALORIES")
        fi
        
        # 安全地計算處理時間
        if [ -n "$processing_time" ] && [ "$processing_time" != "null" ]; then
            TOTAL_PROCESSING_TIME=$((TOTAL_PROCESSING_TIME + processing_time))
        fi
        
        # 儲存 JSON 結果
        echo "$body" | jq '.' > "$RESULT_DIR/${filename%.* }.json"
        
        # 寫入 CSV
        echo "\"$filename\",成功,$confidence,$processing_time,$food_count,$calories,\"$foods\"" >> "$CSV_FILE"
        
        # 寫入詳細報告
        echo "## $TOTAL_TESTS. $filename" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "- **狀態**: ✅ 成功" >> "$REPORT_FILE"
        echo "- **信心度**: ${confidence_percent}%" >> "$REPORT_FILE"
        echo "- **處理時間**: ${processing_time}ms" >> "$REPORT_FILE"
        echo "- **識別到**: $food_count 個食物" >> "$REPORT_FILE"
        echo "- **總熱量**: ${calories} kcal" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "### 食物清單" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        
        # 列出每個食物的詳細資訊
        for i in $(seq 0 $((food_count - 1))); do
            name=$(echo "$body" | jq -r ".foods[$i].name")
            portion=$(echo "$body" | jq -r ".foods[$i].portion.amount")
            unit=$(echo "$body" | jq -r ".foods[$i].portion.unit")
            cal=$(echo "$body" | jq -r ".foods[$i].nutrition.calories")
            protein=$(echo "$body" | jq -r ".foods[$i].nutrition.protein")
            carbs=$(echo "$body" | jq -r ".foods[$i].nutrition.carbohydrates")
            fat=$(echo "$body" | jq -r ".foods[$i].nutrition.fat")
            
            echo "$((i + 1)). **$name**" >> "$REPORT_FILE"
            echo "   - 份量: $portion $unit" >> "$REPORT_FILE"
            echo "   - 熱量: ${cal} kcal" >> "$REPORT_FILE"
            echo "   - 蛋白質: ${protein}g | 碳水: ${carbs}g | 脂肪: ${fat}g" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        done
        
        echo "---" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        
    else
        echo -e "  ${RED}✗ 失敗${NC} (HTTP $http_code)"
        
        FAILED_TESTS=$((FAILED_TESTS + 1))
        
        # 寫入 CSV
        echo "\"$filename\",失敗,0,0,0,0,\"\"" >> "$CSV_FILE"
        
        # 寫入詳細報告
        echo "## $TOTAL_TESTS. $filename" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "- **狀態**: ❌ 失敗 (HTTP $http_code)" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
        if echo "$body" | jq '.' 2>/dev/null >> "$REPORT_FILE"; then
            :
        else
            echo "$body" >> "$REPORT_FILE"
        fi
        echo '```' >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "---" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi
    
    echo ""
    
    # 避免 API 限流
    sleep 2
done

# 計算統計數據
if [ $SUCCESSFUL_TESTS -gt 0 ]; then
    AVG_PROCESSING_TIME=$((TOTAL_PROCESSING_TIME / SUCCESSFUL_TESTS))
    AVG_FOODS=$(echo "scale=1; $TOTAL_FOODS / $SUCCESSFUL_TESTS" | bc)
    AVG_CALORIES=$(echo "scale=0; $TOTAL_CALORIES / $SUCCESSFUL_TESTS" | bc)
    SUCCESS_RATE=$(echo "scale=1; $SUCCESSFUL_TESTS * 100 / $TOTAL_TESTS" | bc)
else
    AVG_PROCESSING_TIME=0
    AVG_FOODS=0
    AVG_CALORIES=0
    SUCCESS_RATE=0
fi

# 顯示統計結果
echo "================================"
echo -e "${CYAN}測試完成！${NC}"
echo "================================"
echo ""
echo -e "${BLUE}📊 測試統計:${NC}"
echo "  總測試數: $TOTAL_TESTS"
echo -e "  ${GREEN}成功: $SUCCESSFUL_TESTS${NC}"
echo -e "  ${RED}失敗: $FAILED_TESTS${NC}"
echo -e "  ${CYAN}成功率: ${SUCCESS_RATE}%${NC}"
echo ""
echo -e "${BLUE}📈 識別統計:${NC}"
echo "  總食物數: $TOTAL_FOODS"
echo "  平均每張: $AVG_FOODS 個食物"
echo "  總熱量: ${TOTAL_CALORIES} kcal"
echo "  平均熱量: ${AVG_CALORIES} kcal/張"
echo ""
echo -e "${BLUE}⏱️  效能統計:${NC}"
echo "  平均處理時間: ${AVG_PROCESSING_TIME}ms"
echo ""
echo "================================"
echo -e "${GREEN}✓ 測試結果已儲存${NC}"
echo "================================"
echo ""
echo "📁 結果目錄: $RESULT_DIR"
echo "  - detailed-report.md (詳細報告)"
echo "  - test-report.csv (CSV 格式)"
echo "  - *.json (每張圖片的 JSON 結果)"
echo ""
echo "查看報告:"
echo "  cat $RESULT_DIR/detailed-report.md"
echo "  open $RESULT_DIR/test-report.csv"
echo ""

# 寫入統計到報告
echo "## 測試統計" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| 項目 | 數值 |" >> "$REPORT_FILE"
echo "|------|------|" >> "$REPORT_FILE"
echo "| 總測試數 | $TOTAL_TESTS |" >> "$REPORT_FILE"
echo "| 成功 | $SUCCESSFUL_TESTS |" >> "$REPORT_FILE"
echo "| 失敗 | $FAILED_TESTS |" >> "$REPORT_FILE"
echo "| 成功率 | ${SUCCESS_RATE}% |" >> "$REPORT_FILE"
echo "| 總食物數 | $TOTAL_FOODS |" >> "$REPORT_FILE"
echo "| 平均每張 | $AVG_FOODS 個 |" >> "$REPORT_FILE"
echo "| 總熱量 | ${TOTAL_CALORIES} kcal |" >> "$REPORT_FILE"
echo "| 平均熱量 | ${AVG_CALORIES} kcal |" >> "$REPORT_FILE"
echo "| 平均處理時間 | ${AVG_PROCESSING_TIME}ms |" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo -e "${CYAN}測試完成！祝你有美好的一天！${NC} 🎉"
echo ""
