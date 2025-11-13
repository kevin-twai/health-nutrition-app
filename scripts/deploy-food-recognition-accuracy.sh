#!/bin/bash

# 食物識別準確度改進 - 部署腳本
# 版本: 1.0.0
# 日期: 2025-11-13

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查必要的環境變數
check_env() {
    log_info "檢查環境變數..."
    
    required_vars=(
        "OPENAI_API_KEY"
        "DATABASE_URL"
        "MONGODB_URI"
        "REDIS_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "缺少必要的環境變數: $var"
            exit 1
        fi
    done
    
    log_success "環境變數檢查完成"
}

# 備份資料庫
backup_databases() {
    log_info "備份資料庫..."
    
    # 創建備份目錄
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # 備份 PostgreSQL
    log_info "備份 PostgreSQL..."
    npm run backup:postgres -- --output="$BACKUP_DIR/postgres.sql"
    
    # 備份 MongoDB
    log_info "備份 MongoDB..."
    npm run backup:mongodb -- --output="$BACKUP_DIR/mongodb.archive"
    
    log_success "資料庫備份完成: $BACKUP_DIR"
}

# 執行資料庫遷移
run_migrations() {
    log_info "執行資料庫遷移..."
    
    # PostgreSQL 遷移
    npm run migrate:postgres
    
    # MongoDB 索引初始化
    npm run init:mongodb-indexes
    
    # 初始化反饋表索引
    npm run init:feedback-indexes
    
    log_success "資料庫遷移完成"
}

# 初始化知識庫
init_knowledge_base() {
    log_info "初始化知識庫..."
    
    # 載入知識庫數據
    npm run seed:knowledge-base
    
    # 驗證知識庫
    npm run verify:knowledge-base
    
    log_success "知識庫初始化完成"
}

# 建置應用
build_app() {
    log_info "建置應用..."
    
    # 安裝依賴
    npm ci --production
    
    # 建置 TypeScript
    npm run build
    
    # 驗證建置
    npm run verify:build
    
    log_success "應用建置完成"
}

# 運行測試
run_tests() {
    log_info "運行測試..."
    
    # 單元測試
    log_info "運行單元測試..."
    npm run test:unit -- --run
    
    # 整合測試
    log_info "運行整合測試..."
    npm run test:integration -- --run
    
    # 準確度測試
    log_info "運行準確度測試..."
    npm run test:accuracy
    
    log_success "所有測試通過"
}

# 部署應用
deploy_app() {
    log_info "部署應用..."
    
    DEPLOY_METHOD=${DEPLOY_METHOD:-"pm2"}
    
    case $DEPLOY_METHOD in
        "pm2")
            deploy_with_pm2
            ;;
        "docker")
            deploy_with_docker
            ;;
        "kubernetes")
            deploy_with_kubernetes
            ;;
        *)
            log_error "不支援的部署方法: $DEPLOY_METHOD"
            exit 1
            ;;
    esac
    
    log_success "應用部署完成"
}

# 使用 PM2 部署
deploy_with_pm2() {
    log_info "使用 PM2 部署..."
    
    # 檢查 PM2 是否安裝
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 未安裝，請先安裝: npm install -g pm2"
        exit 1
    fi
    
    # 停止舊版本（如果存在）
    pm2 stop nutrition-api || true
    
    # 啟動新版本
    pm2 start ecosystem.config.js --env production
    
    # 保存 PM2 配置
    pm2 save
    
    log_success "PM2 部署完成"
}

# 使用 Docker 部署
deploy_with_docker() {
    log_info "使用 Docker 部署..."
    
    # 建置 Docker 映像
    docker build -f docker/api/Dockerfile -t nutrition-api:latest .
    
    # 使用 Docker Compose 部署
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Docker 部署完成"
}

# 使用 Kubernetes 部署
deploy_with_kubernetes() {
    log_info "使用 Kubernetes 部署..."
    
    # 應用配置
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml
    
    # 部署應用
    kubectl apply -f k8s/api-deployment.yaml
    
    # 等待部署完成
    kubectl rollout status deployment/nutrition-api -n nutrition-app
    
    log_success "Kubernetes 部署完成"
}

# 驗證部署
verify_deployment() {
    log_info "驗證部署..."
    
    # 等待服務啟動
    sleep 10
    
    # 健康檢查
    log_info "執行健康檢查..."
    HEALTH_URL="${API_BASE_URL:-http://localhost:3000}/health"
    
    for i in {1..30}; do
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            log_success "健康檢查通過"
            break
        fi
        
        if [ $i -eq 30 ]; then
            log_error "健康檢查失敗"
            exit 1
        fi
        
        log_info "等待服務啟動... ($i/30)"
        sleep 2
    done
    
    # 功能測試
    log_info "執行功能測試..."
    npm run test:deployment
    
    log_success "部署驗證完成"
}

# 啟用監控
enable_monitoring() {
    log_info "啟用監控..."
    
    # 啟動監控服務
    npm run start:monitoring
    
    # 配置告警
    npm run setup:alerts
    
    log_success "監控已啟用"
}

# 清理
cleanup() {
    log_info "清理臨時文件..."
    
    # 清理舊的建置文件
    rm -rf dist.old
    
    # 清理舊的日誌（保留最近 30 天）
    find logs -name "*.log" -mtime +30 -delete
    
    log_success "清理完成"
}

# 回滾函數
rollback() {
    log_warning "開始回滾..."
    
    # 停止當前版本
    pm2 stop nutrition-api || true
    
    # 恢復資料庫（如果有備份）
    if [ -n "$BACKUP_DIR" ]; then
        log_info "恢復資料庫..."
        npm run restore:postgres -- --file="$BACKUP_DIR/postgres.sql"
        npm run restore:mongodb -- --file="$BACKUP_DIR/mongodb.archive"
    fi
    
    # 切換到上一個版本
    if [ -d "dist.old" ]; then
        rm -rf dist
        mv dist.old dist
    fi
    
    # 重新啟動
    pm2 start ecosystem.config.js --env production
    
    log_success "回滾完成"
}

# 主函數
main() {
    log_info "開始部署食物識別準確度改進功能..."
    log_info "部署時間: $(date)"
    
    # 設置錯誤處理
    trap 'log_error "部署失敗！"; rollback; exit 1' ERR
    
    # 執行部署步驟
    check_env
    backup_databases
    run_migrations
    init_knowledge_base
    build_app
    
    # 可選：運行測試
    if [ "${RUN_TESTS:-true}" = "true" ]; then
        run_tests
    else
        log_warning "跳過測試"
    fi
    
    deploy_app
    verify_deployment
    enable_monitoring
    cleanup
    
    log_success "========================================="
    log_success "部署成功完成！"
    log_success "========================================="
    log_info "API 地址: ${API_BASE_URL:-http://localhost:3000}"
    log_info "監控儀表板: ${API_BASE_URL:-http://localhost:3000}/monitoring/dashboard"
    log_info "健康檢查: ${API_BASE_URL:-http://localhost:3000}/health"
    log_success "========================================="
}

# 執行主函數
main "$@"
