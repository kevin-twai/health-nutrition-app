#!/bin/bash

# 端到端測試執行腳本
set -e

echo "🚀 開始執行端到端測試..."

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查環境變數
check_env() {
    echo -e "${BLUE}檢查環境變數...${NC}"
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}警告: DATABASE_URL 未設定，使用預設測試資料庫${NC}"
        export DATABASE_URL="postgresql://test:test@localhost:5432/health_tracker_test"
    fi
    
    if [ -z "$REDIS_URL" ]; then
        echo -e "${YELLOW}警告: REDIS_URL 未設定，使用預設Redis配置${NC}"
        export REDIS_URL="redis://localhost:6379"
    fi
    
    if [ -z "$MONGODB_URL" ]; then
        echo -e "${YELLOW}警告: MONGODB_URL 未設定，使用預設MongoDB配置${NC}"
        export MONGODB_URL="mongodb://localhost:27017/health_tracker_test"
    fi
}

# 啟動測試服務
start_services() {
    echo -e "${BLUE}啟動測試服務...${NC}"
    
    # 檢查Docker是否運行
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}錯誤: Docker 未運行，請先啟動Docker${NC}"
        exit 1
    fi
    
    # 啟動測試資料庫
    echo "啟動測試資料庫..."
    docker-compose -f docker-compose.test.yml up -d postgres redis mongodb
    
    # 等待服務啟動
    echo "等待服務啟動..."
    sleep 10
    
    # 檢查服務狀態
    if ! docker-compose -f docker-compose.test.yml ps | grep -q "Up"; then
        echo -e "${RED}錯誤: 測試服務啟動失敗${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}測試服務啟動成功${NC}"
}

# 準備測試資料
prepare_test_data() {
    echo -e "${BLUE}準備測試資料...${NC}"
    
    # 執行資料庫遷移
    cd apps/api
    npm run db:migrate:test
    
    # 載入測試種子資料
    npm run db:seed:test
    
    cd ../..
    echo -e "${GREEN}測試資料準備完成${NC}"
}

# 執行後端端到端測試
run_api_e2e_tests() {
    echo -e "${BLUE}執行後端端到端測試...${NC}"
    
    cd apps/api
    
    # 設定測試環境
    export NODE_ENV=test
    export JWT_SECRET=test-secret-key-for-e2e-tests
    
    # 執行端到端測試
    npm run test -- --testPathPattern=e2e --verbose --detectOpenHandles
    
    local api_exit_code=$?
    cd ../..
    
    if [ $api_exit_code -ne 0 ]; then
        echo -e "${RED}後端端到端測試失敗${NC}"
        return $api_exit_code
    fi
    
    echo -e "${GREEN}後端端到端測試通過${NC}"
}

# 執行效能測試
run_performance_tests() {
    echo -e "${BLUE}執行效能測試...${NC}"
    
    cd apps/api
    
    # 執行效能測試
    npm run test -- --testPathPattern=performance --verbose --detectOpenHandles
    
    local perf_exit_code=$?
    cd ../..
    
    if [ $perf_exit_code -ne 0 ]; then
        echo -e "${RED}效能測試失敗${NC}"
        return $perf_exit_code
    fi
    
    echo -e "${GREEN}效能測試通過${NC}"
}

# 執行安全性測試
run_security_tests() {
    echo -e "${BLUE}執行安全性測試...${NC}"
    
    cd apps/api
    
    # 執行安全性測試
    npm run test -- --testPathPattern=security --verbose --detectOpenHandles
    
    local security_exit_code=$?
    cd ../..
    
    if [ $security_exit_code -ne 0 ]; then
        echo -e "${RED}安全性測試失敗${NC}"
        return $security_exit_code
    fi
    
    echo -e "${GREEN}安全性測試通過${NC}"
}

# 執行前端端到端測試
run_mobile_e2e_tests() {
    echo -e "${BLUE}執行移動應用端到端測試...${NC}"
    
    cd apps/mobile
    
    # 執行移動應用端到端測試
    npm run test -- --testPathPattern=e2e --verbose
    
    local mobile_exit_code=$?
    cd ../..
    
    if [ $mobile_exit_code -ne 0 ]; then
        echo -e "${RED}移動應用端到端測試失敗${NC}"
        return $mobile_exit_code
    fi
    
    echo -e "${GREEN}移動應用端到端測試通過${NC}"
}

# 執行網頁應用端到端測試
run_web_e2e_tests() {
    echo -e "${BLUE}執行網頁應用端到端測試...${NC}"
    
    cd apps/web
    
    # 執行網頁應用端到端測試
    npm run test -- --testPathPattern=e2e --verbose
    
    local web_exit_code=$?
    cd ../..
    
    if [ $web_exit_code -ne 0 ]; then
        echo -e "${RED}網頁應用端到端測試失敗${NC}"
        return $web_exit_code
    fi
    
    echo -e "${GREEN}網頁應用端到端測試通過${NC}"
}

# 生成測試報告
generate_test_report() {
    echo -e "${BLUE}生成測試報告...${NC}"
    
    # 建立報告目錄
    mkdir -p test-reports
    
    # 合併測試結果
    echo "# 端到端測試報告" > test-reports/e2e-report.md
    echo "" >> test-reports/e2e-report.md
    echo "測試執行時間: $(date)" >> test-reports/e2e-report.md
    echo "" >> test-reports/e2e-report.md
    
    # 檢查各個測試結果
    if [ -f "apps/api/coverage/lcov-report/index.html" ]; then
        echo "## 後端測試覆蓋率" >> test-reports/e2e-report.md
        echo "詳細報告請查看: apps/api/coverage/lcov-report/index.html" >> test-reports/e2e-report.md
        echo "" >> test-reports/e2e-report.md
    fi
    
    if [ -f "apps/mobile/coverage/lcov-report/index.html" ]; then
        echo "## 移動應用測試覆蓋率" >> test-reports/e2e-report.md
        echo "詳細報告請查看: apps/mobile/coverage/lcov-report/index.html" >> test-reports/e2e-report.md
        echo "" >> test-reports/e2e-report.md
    fi
    
    echo -e "${GREEN}測試報告已生成: test-reports/e2e-report.md${NC}"
}

# 清理測試環境
cleanup() {
    echo -e "${BLUE}清理測試環境...${NC}"
    
    # 停止測試服務
    docker-compose -f docker-compose.test.yml down -v
    
    # 清理測試資料
    rm -rf apps/api/test-data
    rm -rf apps/mobile/test-data
    rm -rf apps/web/test-data
    
    echo -e "${GREEN}測試環境清理完成${NC}"
}

# 主要執行流程
main() {
    local start_time=$(date +%s)
    
    # 設定錯誤處理
    trap cleanup EXIT
    
    echo -e "${GREEN}=== 健康營養追蹤系統端到端測試 ===${NC}"
    echo ""
    
    # 檢查參數
    local test_type=${1:-"all"}
    
    case $test_type in
        "api")
            check_env
            start_services
            prepare_test_data
            run_api_e2e_tests
            ;;
        "performance")
            check_env
            start_services
            prepare_test_data
            run_performance_tests
            ;;
        "security")
            check_env
            start_services
            prepare_test_data
            run_security_tests
            ;;
        "mobile")
            run_mobile_e2e_tests
            ;;
        "web")
            run_web_e2e_tests
            ;;
        "all")
            check_env
            start_services
            prepare_test_data
            
            # 執行所有測試
            run_api_e2e_tests
            run_performance_tests
            run_security_tests
            run_mobile_e2e_tests
            run_web_e2e_tests
            ;;
        *)
            echo -e "${RED}錯誤: 未知的測試類型 '$test_type'${NC}"
            echo "可用選項: all, api, performance, security, mobile, web"
            exit 1
            ;;
    esac
    
    # 生成報告
    generate_test_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${GREEN}=== 測試完成 ===${NC}"
    echo -e "${GREEN}總執行時間: ${duration}秒${NC}"
    echo ""
}

# 執行主函數
main "$@"