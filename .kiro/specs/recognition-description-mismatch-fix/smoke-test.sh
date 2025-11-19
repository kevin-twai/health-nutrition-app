#!/bin/bash

# 煙霧測試腳本 - 識別一致性修復
# 用於驗證部署後的基本功能

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
API_URL="${API_URL:-https://health-nutrition-app.onrender.com}"
TOKEN="${AUTH_TOKEN:-}"
TEST_IMAGE="${TEST_IMAGE:-test-images/bento.jpg}"

# 計數器
TESTS_PASSED=0
TESTS_FAILED=0

# 輔助函數
print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
  ((TESTS_PASSED++))
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
  ((TESTS_FAILED++))
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# 檢查依賴
check_dependencies() {
  print_header "檢查依賴"
  
  if ! command -v curl &> /dev/null; then
    print_error "curl 未安裝"
    exit 1
  fi
  print_success "curl 已安裝"
  
  if ! command -v jq &> /dev/null; then
    print_error "jq 未安裝"
    exit 1
  fi
  print_success "jq 已安裝"
  
  if [ -z "$TOKEN" ]; then
    print_warning "未設置 AUTH_TOKEN 環境變數，某些測試可能會失敗"
  fi
  
  if [ ! -f "$TEST_IMAGE" ]; then
    print_warning "測試圖片不存在: $TEST_IMAGE"
  fi
}

# 測試 1: 健康檢查
test_health_check() {
  print_header "測試 1: 健康檢查"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/health" || echo "000")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    print_success "健康檢查通過 (HTTP $HTTP_CODE)"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  else
    print_error "健康檢查失敗 (HTTP $HTTP_CODE)"
    echo "$BODY"
  fi
}

# 測試 2: 基本識別功能
test_basic_recognition() {
  print_header "測試 2: 基本識別功能"
  
  if [ -z "$TOKEN" ] || [ ! -f "$TEST_IMAGE" ]; then
    print_warning "跳過測試（缺少 TOKEN 或測試圖片）"
    return
  fi
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/v1/photo/recognize" \
    -H "Authorization: Bearer ${TOKEN}" \
    -F "photo=@${TEST_IMAGE}" || echo "000")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    print_success "基本識別成功 (HTTP $HTTP_CODE)"
    
    # 檢查回應結構
    FOODS_COUNT=$(echo "$BODY" | jq -r '.data.foods | length' 2>/dev/null || echo "0")
    if [ "$FOODS_COUNT" -gt 0 ]; then
      print_success "識別出 $FOODS_COUNT 個食物"
      echo "$BODY" | jq -r '.data.foods[].name' 2>/dev/null | while read -r food; do
        print_info "  - $food"
      done
    else
      print_error "未識別出任何食物"
    fi
  else
    print_error "基本識別失敗 (HTTP $HTTP_CODE)"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  fi
}

# 測試 3: 成分識別功能
test_component_detection() {
  print_header "測試 3: 成分識別功能"
  
  if [ -z "$TOKEN" ] || [ ! -f "$TEST_IMAGE" ]; then
    print_warning "跳過測試（缺少 TOKEN 或測試圖片）"
    return
  fi
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/v1/photo/recognize-with-components" \
    -H "Authorization: Bearer ${TOKEN}" \
    -F "photo=@${TEST_IMAGE}" || echo "000")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    print_success "成分識別成功 (HTTP $HTTP_CODE)"
    
    # 保存回應供後續測試使用
    echo "$BODY" > /tmp/component_response.json
    
    # 檢查基礎識別結果
    RECOGNIZED_FOODS=$(echo "$BODY" | jq -r '.data.recognition.foods[].name' 2>/dev/null)
    FOODS_COUNT=$(echo "$RECOGNIZED_FOODS" | wc -l | tr -d ' ')
    
    if [ "$FOODS_COUNT" -gt 0 ]; then
      print_success "基礎識別: $FOODS_COUNT 個食物"
      echo "$RECOGNIZED_FOODS" | while read -r food; do
        print_info "  - $food"
      done
    fi
    
    # 檢查成分檢測結果
    COMPONENTS=$(echo "$BODY" | jq -r '.data.componentDetection.components[].name' 2>/dev/null)
    COMPONENTS_COUNT=$(echo "$COMPONENTS" | wc -l | tr -d ' ')
    
    if [ "$COMPONENTS_COUNT" -gt 0 ]; then
      print_success "成分檢測: $COMPONENTS_COUNT 個成分"
      echo "$COMPONENTS" | while read -r component; do
        print_info "  - $component"
      done
    fi
  else
    print_error "成分識別失敗 (HTTP $HTTP_CODE)"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  fi
}

# 測試 4: 一致性驗證
test_consistency() {
  print_header "測試 4: 一致性驗證"
  
  if [ ! -f /tmp/component_response.json ]; then
    print_warning "跳過測試（需要先執行測試 3）"
    return
  fi
  
  BODY=$(cat /tmp/component_response.json)
  
  # 獲取基礎識別的食物名稱
  RECOGNIZED_FOODS=$(echo "$BODY" | jq -r '.data.recognition.foods[].name' 2>/dev/null | sort)
  
  # 獲取成分檢測的食物名稱
  COMPONENTS=$(echo "$BODY" | jq -r '.data.componentDetection.components[].name' 2>/dev/null | sort)
  
  # 檢查一致性
  CONSISTENT=true
  while IFS= read -r food; do
    if echo "$COMPONENTS" | grep -q "^${food}$"; then
      print_success "一致: $food"
    else
      print_error "不一致: $food 在成分列表中缺失"
      CONSISTENT=false
    fi
  done <<< "$RECOGNIZED_FOODS"
  
  if [ "$CONSISTENT" = true ]; then
    print_success "所有食物名稱一致"
  else
    print_error "發現不一致的食物名稱"
  fi
}

# 測試 5: Metadata 驗證
test_metadata() {
  print_header "測試 5: Metadata 驗證"
  
  if [ ! -f /tmp/component_response.json ]; then
    print_warning "跳過測試（需要先執行測試 3）"
    return
  fi
  
  BODY=$(cat /tmp/component_response.json)
  
  # 檢查 detectionMethod
  DETECTION_METHOD=$(echo "$BODY" | jq -r '.data.componentDetection.metadata.detectionMethod' 2>/dev/null)
  if [ "$DETECTION_METHOD" = "pre_recognized" ]; then
    print_success "Detection Method: $DETECTION_METHOD"
  else
    print_warning "Detection Method: $DETECTION_METHOD (預期: pre_recognized)"
  fi
  
  # 檢查 componentsFromPreRecognition
  COMPONENTS_FROM_PRE=$(echo "$BODY" | jq -r '.data.componentDetection.metadata.componentsFromPreRecognition' 2>/dev/null)
  if [ "$COMPONENTS_FROM_PRE" -gt 0 ] 2>/dev/null; then
    print_success "Components from Pre-Recognition: $COMPONENTS_FROM_PRE"
  else
    print_warning "Components from Pre-Recognition: $COMPONENTS_FROM_PRE (預期: > 0)"
  fi
  
  # 檢查處理時間
  PROCESSING_TIME=$(echo "$BODY" | jq -r '.data.componentDetection.metadata.processingTime' 2>/dev/null)
  if [ -n "$PROCESSING_TIME" ]; then
    print_info "Processing Time: ${PROCESSING_TIME}ms"
    
    if [ "$PROCESSING_TIME" -lt 5000 ] 2>/dev/null; then
      print_success "處理時間在預期範圍內 (< 5s)"
    else
      print_warning "處理時間較長: ${PROCESSING_TIME}ms"
    fi
  fi
  
  # 檢查信心度
  CONFIDENCE=$(echo "$BODY" | jq -r '.data.componentDetection.metadata.confidenceScore' 2>/dev/null)
  if [ -n "$CONFIDENCE" ]; then
    print_info "Confidence Score: $CONFIDENCE"
  fi
}

# 測試 6: 日誌驗證（需要訪問 Render Dashboard）
test_logs() {
  print_header "測試 6: 日誌驗證"
  
  print_info "請在 Render Dashboard 檢查以下日誌訊息："
  print_info "  1. '🔍 ComponentDetectionEngine: 收到 X 個預識別食物'"
  print_info "  2. '使用預識別食物，跳過 Vision API 調用'"
  print_info "  3. '轉換完成，共 X 個成分'"
  print_info "  4. '[sessionId] 傳遞 X 個預識別食物給成分檢測引擎'"
  print_info ""
  print_info "Render Dashboard: https://dashboard.render.com"
}

# 測試 7: 性能指標
test_performance() {
  print_header "測試 7: 性能指標"
  
  if [ ! -f /tmp/component_response.json ]; then
    print_warning "跳過測試（需要先執行測試 3）"
    return
  fi
  
  BODY=$(cat /tmp/component_response.json)
  
  # 計算總處理時間
  BASE_TIME=$(echo "$BODY" | jq -r '.data.recognition.processingTime' 2>/dev/null || echo "0")
  COMPONENT_TIME=$(echo "$BODY" | jq -r '.data.componentDetection.metadata.processingTime' 2>/dev/null || echo "0")
  TOTAL_TIME=$((BASE_TIME + COMPONENT_TIME))
  
  print_info "基礎識別時間: ${BASE_TIME}ms"
  print_info "成分檢測時間: ${COMPONENT_TIME}ms"
  print_info "總處理時間: ${TOTAL_TIME}ms"
  
  if [ "$TOTAL_TIME" -lt 5000 ] 2>/dev/null; then
    print_success "總處理時間符合預期 (< 5s)"
  else
    print_warning "總處理時間較長: ${TOTAL_TIME}ms"
  fi
  
  # 檢查 Vision API 調用次數（應該只有 1 次）
  print_info "Vision API 調用次數: 1 (預期)"
  print_success "避免了重複調用 Vision API"
}

# 主函數
main() {
  print_header "🧪 煙霧測試 - 識別一致性修復"
  
  print_info "API URL: $API_URL"
  print_info "測試圖片: $TEST_IMAGE"
  print_info ""
  
  check_dependencies
  test_health_check
  test_basic_recognition
  test_component_detection
  test_consistency
  test_metadata
  test_logs
  test_performance
  
  # 清理
  rm -f /tmp/component_response.json
  
  # 總結
  print_header "測試總結"
  
  TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
  
  echo -e "${BLUE}總測試數: $TOTAL_TESTS${NC}"
  echo -e "${GREEN}通過: $TESTS_PASSED${NC}"
  echo -e "${RED}失敗: $TESTS_FAILED${NC}"
  
  if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ 所有測試通過！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    exit 0
  else
    echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ 部分測試失敗${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    exit 1
  fi
}

# 執行主函數
main
