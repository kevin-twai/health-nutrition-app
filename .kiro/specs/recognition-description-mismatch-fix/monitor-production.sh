#!/bin/bash

# 生產環境監控腳本
# 用於監控識別一致性修復功能的生產環境指標

set -e

API_URL="https://health-nutrition-api.onrender.com"
MONITORING_DURATION=300  # 5 分鐘

echo "=========================================="
echo "生產環境監控腳本"
echo "=========================================="
echo ""
echo "API URL: $API_URL"
echo "監控時長: ${MONITORING_DURATION} 秒"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 測試計數器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 測試函數
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "測試 $TOTAL_TESTS: $test_name ... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通過${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ 失敗${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "【階段 1: 服務健康檢查】"
echo "=========================================="

# 測試 1: 健康檢查
run_test "服務健康檢查" "curl -sf $API_URL/health | jq -e '.status == \"healthy\"'"

# 測試 2: 資料庫連接
run_test "資料庫連接" "curl -sf $API_URL/health | jq -e '.database == \"connected\"'"

# 測試 3: Redis 連接
run_test "Redis 連接" "curl -sf $API_URL/health | jq -e '.checks.redis == true'"

# 測試 4: 外部 API 連接
run_test "外部 API 連接" "curl -sf $API_URL/health | jq -e '.checks.external_apis == true'"

echo ""
echo "【階段 2: 監控 API 端點檢查】"
echo "=========================================="

# 測試 5: 監控統計端點
run_test "監控統計端點" "curl -sf $API_URL/api/v1/recognition-monitoring/statistics"

# 測試 6: 監控報告端點
run_test "監控報告端點" "curl -sf $API_URL/api/v1/recognition-monitoring/report?format=json"

# 測試 7: 健康檢查端點
run_test "監控健康檢查" "curl -sf $API_URL/api/v1/recognition-monitoring/health | jq -e '.data.status == \"healthy\"'"

echo ""
echo "【階段 3: 獲取性能指標】"
echo "=========================================="

# 獲取性能統計
echo "獲取性能統計數據..."
STATS=$(curl -sf "$API_URL/api/v1/recognition-monitoring/statistics?timeWindow=$((MONITORING_DURATION * 1000))")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 成功獲取性能統計${NC}"
    echo ""
    echo "性能指標摘要:"
    echo "----------------------------------------"
    
    # 解析並顯示關鍵指標
    TOTAL_SESSIONS=$(echo "$STATS" | jq -r '.totalSessions // 0')
    SUCCESS_SESSIONS=$(echo "$STATS" | jq -r '.successSessions // 0')
    FAILED_SESSIONS=$(echo "$STATS" | jq -r '.failedSessions // 0')
    AVG_PROCESSING_TIME=$(echo "$STATS" | jq -r '.processingTime.average // 0')
    VISION_API_CALLS=$(echo "$STATS" | jq -r '.visionApiCalls.totalCalls // 0')
    VISION_API_AVOIDED=$(echo "$STATS" | jq -r '.visionApiCalls.totalCallsAvoided // 0')
    AVG_CONSISTENCY=$(echo "$STATS" | jq -r '.consistency.averageMatchRate // 0')
    
    echo "總會話數: $TOTAL_SESSIONS"
    echo "成功會話: $SUCCESS_SESSIONS"
    echo "失敗會話: $FAILED_SESSIONS"
    echo "平均處理時間: ${AVG_PROCESSING_TIME}ms"
    echo "Vision API 調用: $VISION_API_CALLS 次"
    echo "避免的 API 調用: $VISION_API_AVOIDED 次"
    echo "平均一致性匹配率: ${AVG_CONSISTENCY}%"
    
    # 檢查關鍵指標
    echo ""
    echo "關鍵指標檢查:"
    echo "----------------------------------------"
    
    # 檢查錯誤率
    if [ "$TOTAL_SESSIONS" -gt 0 ]; then
        ERROR_RATE=$(echo "scale=2; $FAILED_SESSIONS * 100 / $TOTAL_SESSIONS" | bc)
        if (( $(echo "$ERROR_RATE < 5" | bc -l) )); then
            echo -e "${GREEN}✓ 錯誤率: ${ERROR_RATE}% (目標: < 5%)${NC}"
        else
            echo -e "${RED}✗ 錯誤率: ${ERROR_RATE}% (目標: < 5%)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ 尚無會話數據${NC}"
    fi
    
    # 檢查一致性
    if (( $(echo "$AVG_CONSISTENCY >= 90" | bc -l) )); then
        echo -e "${GREEN}✓ 一致性匹配率: ${AVG_CONSISTENCY}% (目標: > 90%)${NC}"
    elif [ "$AVG_CONSISTENCY" != "0" ]; then
        echo -e "${RED}✗ 一致性匹配率: ${AVG_CONSISTENCY}% (目標: > 90%)${NC}"
    else
        echo -e "${YELLOW}⚠ 尚無一致性數據${NC}"
    fi
    
    # 檢查 Vision API 優化
    if [ "$VISION_API_AVOIDED" -gt 0 ]; then
        TOTAL_POTENTIAL=$(echo "$VISION_API_CALLS + $VISION_API_AVOIDED" | bc)
        REDUCTION_RATE=$(echo "scale=2; $VISION_API_AVOIDED * 100 / $TOTAL_POTENTIAL" | bc)
        if (( $(echo "$REDUCTION_RATE >= 60" | bc -l) )); then
            echo -e "${GREEN}✓ API 調用減少率: ${REDUCTION_RATE}% (目標: > 60%)${NC}"
        else
            echo -e "${YELLOW}⚠ API 調用減少率: ${REDUCTION_RATE}% (目標: > 60%)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ 尚無 API 優化數據${NC}"
    fi
    
else
    echo -e "${RED}✗ 無法獲取性能統計${NC}"
fi

echo ""
echo "【階段 4: 獲取性能報告】"
echo "=========================================="

# 獲取文本格式的性能報告
REPORT=$(curl -sf "$API_URL/api/v1/recognition-monitoring/report?format=text&timeWindow=$((MONITORING_DURATION * 1000))")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 成功獲取性能報告${NC}"
    echo ""
    echo "$REPORT"
else
    echo -e "${RED}✗ 無法獲取性能報告${NC}"
fi

echo ""
echo "【階段 5: 記憶體監控】"
echo "=========================================="

# 獲取記憶體使用情況
MEMORY=$(curl -sf "$API_URL/health" | jq -r '.memory')

if [ $? -eq 0 ]; then
    HEAP_USED=$(echo "$MEMORY" | jq -r '.heapUsed')
    HEAP_TOTAL=$(echo "$MEMORY" | jq -r '.heapTotal')
    RSS=$(echo "$MEMORY" | jq -r '.rss')
    
    HEAP_USAGE=$(echo "scale=2; $HEAP_USED * 100 / $HEAP_TOTAL" | bc)
    
    echo "Heap Used: $(echo "scale=2; $HEAP_USED / 1024 / 1024" | bc) MB"
    echo "Heap Total: $(echo "scale=2; $HEAP_TOTAL / 1024 / 1024" | bc) MB"
    echo "RSS: $(echo "scale=2; $RSS / 1024 / 1024" | bc) MB"
    echo "Heap 使用率: ${HEAP_USAGE}%"
    
    if (( $(echo "$HEAP_USAGE < 90" | bc -l) )); then
        echo -e "${GREEN}✓ 記憶體使用正常${NC}"
    else
        echo -e "${YELLOW}⚠ 記憶體使用偏高${NC}"
    fi
else
    echo -e "${RED}✗ 無法獲取記憶體信息${NC}"
fi

echo ""
echo "=========================================="
echo "監控總結"
echo "=========================================="
echo "總測試數: $TOTAL_TESTS"
echo -e "通過: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失敗: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有測試通過！生產環境運行正常。${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 $FAILED_TESTS 個測試失敗。請檢查生產環境。${NC}"
    exit 1
fi
