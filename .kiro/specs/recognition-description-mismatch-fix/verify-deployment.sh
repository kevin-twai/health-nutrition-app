#!/bin/bash

# 部署驗證腳本 - 識別一致性修復
# 用於驗證 Render 部署狀態

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
API_URL="${API_URL:-https://health-nutrition-app.onrender.com}"
MAX_RETRIES=30
RETRY_INTERVAL=10

# 輔助函數
print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# 檢查 Git 狀態
check_git_status() {
  print_header "檢查 Git 狀態"
  
  CURRENT_BRANCH=$(git branch --show-current)
  print_info "當前分支: $CURRENT_BRANCH"
  
  LATEST_COMMIT=$(git log -1 --oneline)
  print_info "最新提交: $LATEST_COMMIT"
  
  # 檢查是否有未推送的提交
  UNPUSHED=$(git log origin/main..main --oneline | wc -l | tr -d ' ')
  if [ "$UNPUSHED" -eq 0 ]; then
    print_success "所有提交已推送到遠端"
  else
    print_warning "有 $UNPUSHED 個未推送的提交"
  fi
}

# 等待部署完成
wait_for_deployment() {
  print_header "等待 Render 部署"
  
  print_info "正在檢查服務可用性..."
  print_info "API URL: $API_URL"
  print_info "最大重試次數: $MAX_RETRIES"
  print_info "重試間隔: ${RETRY_INTERVAL}s"
  echo ""
  
  for i in $(seq 1 $MAX_RETRIES); do
    echo -ne "${BLUE}嘗試 $i/$MAX_RETRIES...${NC} "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}成功！${NC}"
      print_success "服務已啟動並運行"
      return 0
    else
      echo -e "${YELLOW}失敗 (HTTP $HTTP_CODE)${NC}"
      
      if [ $i -lt $MAX_RETRIES ]; then
        echo -ne "${BLUE}等待 ${RETRY_INTERVAL}s 後重試...${NC}"
        sleep $RETRY_INTERVAL
        echo -e " ${GREEN}繼續${NC}"
      fi
    fi
  done
  
  print_error "部署超時或失敗"
  print_info "請檢查 Render Dashboard: https://dashboard.render.com"
  return 1
}

# 驗證部署版本
verify_deployment_version() {
  print_header "驗證部署版本"
  
  # 獲取健康檢查回應
  RESPONSE=$(curl -s "${API_URL}/health" || echo "{}")
  
  # 檢查回應
  if echo "$RESPONSE" | jq . >/dev/null 2>&1; then
    print_success "API 回應格式正確"
    
    # 顯示版本資訊（如果有）
    VERSION=$(echo "$RESPONSE" | jq -r '.version // "unknown"' 2>/dev/null)
    TIMESTAMP=$(echo "$RESPONSE" | jq -r '.timestamp // "unknown"' 2>/dev/null)
    
    print_info "版本: $VERSION"
    print_info "時間戳: $TIMESTAMP"
    
    echo ""
    echo "完整回應:"
    echo "$RESPONSE" | jq .
  else
    print_warning "API 回應格式異常"
    echo "$RESPONSE"
  fi
}

# 快速健康檢查
quick_health_check() {
  print_header "快速健康檢查"
  
  # 測試基本端點
  ENDPOINTS=(
    "/health"
    "/api/v1/health"
  )
  
  for endpoint in "${ENDPOINTS[@]}"; do
    echo -ne "${BLUE}測試 $endpoint...${NC} "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}${endpoint}" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✅ (HTTP $HTTP_CODE)${NC}"
    elif [ "$HTTP_CODE" = "404" ]; then
      echo -e "${YELLOW}⚠️  (HTTP $HTTP_CODE - 端點不存在)${NC}"
    else
      echo -e "${RED}❌ (HTTP $HTTP_CODE)${NC}"
    fi
  done
}

# 檢查部署日誌（提示）
check_deployment_logs() {
  print_header "檢查部署日誌"
  
  print_info "請訪問 Render Dashboard 查看部署日誌："
  print_info "  1. 訪問: https://dashboard.render.com"
  print_info "  2. 選擇服務: health-nutrition-app"
  print_info "  3. 查看 'Logs' 標籤"
  print_info ""
  print_info "關鍵日誌訊息："
  print_info "  ✓ 'Build succeeded'"
  print_info "  ✓ 'Deploy succeeded'"
  print_info "  ✓ 'Server is running on port...'"
  print_info "  ✓ '🔍 ComponentDetectionEngine: 收到 X 個預識別食物'"
}

# 提供下一步指引
next_steps() {
  print_header "下一步"
  
  print_info "部署驗證完成！接下來："
  print_info ""
  print_info "1. 執行煙霧測試："
  print_info "   chmod +x .kiro/specs/recognition-description-mismatch-fix/smoke-test.sh"
  print_info "   AUTH_TOKEN=your_token .kiro/specs/recognition-description-mismatch-fix/smoke-test.sh"
  print_info ""
  print_info "2. 監控性能指標："
  print_info "   - 處理時間"
  print_info "   - Vision API 調用次數"
  print_info "   - 一致性檢查結果"
  print_info ""
  print_info "3. 檢查錯誤率："
  print_info "   - 在 Render Dashboard 查看錯誤日誌"
  print_info "   - 監控 HTTP 5xx 錯誤"
  print_info ""
  print_info "4. 如果測試通過，繼續執行任務 8.2-8.4"
}

# 主函數
main() {
  print_header "🚀 部署驗證 - 識別一致性修復"
  
  print_info "開始驗證部署到測試環境..."
  echo ""
  
  # 執行檢查
  check_git_status
  
  if wait_for_deployment; then
    verify_deployment_version
    quick_health_check
    check_deployment_logs
    next_steps
    
    echo ""
    print_success "部署驗證完成！"
    echo ""
    
    exit 0
  else
    echo ""
    print_error "部署驗證失敗"
    print_info "請檢查 Render Dashboard 並查看錯誤日誌"
    echo ""
    
    exit 1
  fi
}

# 執行主函數
main
