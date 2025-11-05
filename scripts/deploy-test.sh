#!/bin/bash

# 部署測試腳本
set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# 檢查 Docker 和 Docker Compose
check_dependencies() {
    log "檢查必要工具..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker 未安裝"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose 未安裝"
    fi
    
    log "所有必要工具已安裝"
}

# 清理舊的容器和映像
cleanup() {
    log "清理舊的容器和映像..."
    
    # 停止並移除容器
    docker-compose -f docker-compose.simple.yml --env-file .env.deploy down --remove-orphans || true
    
    # 清理未使用的映像
    docker system prune -f || true
    
    log "清理完成"
}

# 構建映像
build_images() {
    log "構建 Docker 映像..."
    
    # 構建 API (包含 shared-types)
    info "構建 API..."
    docker build -t health-tracker/api:latest -f docker/api/Dockerfile .
    
    log "映像構建完成"
}

# 啟動服務
start_services() {
    log "啟動服務..."
    
    # 啟動所有服務
    info "啟動所有服務..."
    docker-compose -f docker-compose.simple.yml --env-file .env.deploy up -d
    
    # 等待服務就緒
    info "等待服務就緒..."
    sleep 45
    
    log "所有服務已啟動"
}

# 健康檢查
health_check() {
    log "執行健康檢查..."
    
    # 檢查容器狀態
    info "檢查容器狀態..."
    docker-compose -f docker-compose.simple.yml --env-file .env.deploy ps
    
    # 測試 API 健康檢查端點
    info "測試 API 健康檢查..."
    max_attempts=10
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3002/health > /dev/null 2>&1; then
            log "API 健康檢查通過"
            break
        else
            warn "API 健康檢查失敗，嘗試 $attempt/$max_attempts"
            sleep 5
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        error "API 健康檢查失敗"
    fi
    
    # 測試 API 版本端點
    info "測試 API 版本端點..."
    if curl -f http://localhost:3002/api/v1 > /dev/null 2>&1; then
        log "API 版本端點正常"
    else
        warn "API 版本端點無法訪問"
    fi
    
    log "健康檢查完成"
}

# 顯示日誌
show_logs() {
    log "顯示服務日誌..."
    docker-compose -f docker-compose.simple.yml --env-file .env.deploy logs --tail=50
}

# 停止服務
stop_services() {
    log "停止服務..."
    docker-compose -f docker-compose.simple.yml --env-file .env.deploy down
    log "服務已停止"
}

# 主函數
main() {
    case "$1" in
        "start")
            check_dependencies
            cleanup
            start_services
            health_check
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 5
            main start
            ;;
        "logs")
            show_logs
            ;;
        "health")
            health_check
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            echo "使用方法:"
            echo "  $0 start     # 啟動部署測試"
            echo "  $0 stop      # 停止服務"
            echo "  $0 restart   # 重啟服務"
            echo "  $0 logs      # 顯示日誌"
            echo "  $0 health    # 執行健康檢查"
            echo "  $0 cleanup   # 清理容器和映像"
            exit 1
            ;;
    esac
}

main "$@"