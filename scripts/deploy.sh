#!/bin/bash

# 生產環境部署腳本

set -e

NAMESPACE="health-nutrition-tracker"
DOCKER_REGISTRY="your-registry.com"
VERSION=${1:-latest}

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

# 檢查必要工具
check_dependencies() {
    log "檢查必要工具..."
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl 未安裝"
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker 未安裝"
    fi
    
    log "所有必要工具已安裝"
}

# 建立 Docker 映像
build_images() {
    log "建立 Docker 映像..."
    
    # 建立 API 映像
    info "建立 API 映像..."
    docker build -t $DOCKER_REGISTRY/health-nutrition-tracker/api:$VERSION -f docker/api/Dockerfile .
    docker push $DOCKER_REGISTRY/health-nutrition-tracker/api:$VERSION
    
    # 建立 Web 映像
    info "建立 Web 映像..."
    docker build -t $DOCKER_REGISTRY/health-nutrition-tracker/web:$VERSION -f docker/web/Dockerfile .
    docker push $DOCKER_REGISTRY/health-nutrition-tracker/web:$VERSION
    
    log "Docker 映像建立完成"
}

# 建立命名空間
create_namespace() {
    log "建立 Kubernetes 命名空間..."
    kubectl apply -f k8s/namespace.yaml
}

# 部署配置和秘密
deploy_configs() {
    log "部署配置和秘密..."
    
    # 檢查秘密是否存在
    if ! kubectl get secret app-secrets -n $NAMESPACE &> /dev/null; then
        warn "app-secrets 不存在，請先建立秘密"
        info "請執行: kubectl apply -f k8s/secrets.yaml"
        info "並更新其中的 Base64 編碼值"
        exit 1
    fi
    
    kubectl apply -f k8s/configmap.yaml
    log "配置部署完成"
}

# 部署資料庫
deploy_databases() {
    log "部署資料庫..."
    
    kubectl apply -f k8s/postgres-deployment.yaml
    kubectl apply -f k8s/mongodb-deployment.yaml
    kubectl apply -f k8s/redis-deployment.yaml
    
    # 等待資料庫就緒
    info "等待資料庫就緒..."
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    
    log "資料庫部署完成"
}

# 部署應用服務
deploy_services() {
    log "部署應用服務..."
    
    # 更新映像版本
    sed -i.bak "s|image: health-nutrition-tracker/api:latest|image: $DOCKER_REGISTRY/health-nutrition-tracker/api:$VERSION|g" k8s/api-deployment.yaml
    sed -i.bak "s|image: health-nutrition-tracker/web:latest|image: $DOCKER_REGISTRY/health-nutrition-tracker/web:$VERSION|g" k8s/web-deployment.yaml
    
    kubectl apply -f k8s/api-deployment.yaml
    kubectl apply -f k8s/web-deployment.yaml
    
    # 恢復原始檔案
    mv k8s/api-deployment.yaml.bak k8s/api-deployment.yaml
    mv k8s/web-deployment.yaml.bak k8s/web-deployment.yaml
    
    # 等待服務就緒
    info "等待服務就緒..."
    kubectl wait --for=condition=ready pod -l app=api -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=web -n $NAMESPACE --timeout=300s
    
    log "應用服務部署完成"
}

# 部署 Ingress
deploy_ingress() {
    log "部署 Ingress..."
    kubectl apply -f k8s/ingress.yaml
    log "Ingress 部署完成"
}

# 部署備份任務
deploy_backup() {
    log "部署備份任務..."
    kubectl apply -f k8s/backup-cronjob.yaml
    log "備份任務部署完成"
}

# 執行資料庫遷移
run_migrations() {
    log "執行資料庫遷移..."
    
    # PostgreSQL 遷移
    kubectl run migration --rm -i --restart=Never \
        --namespace=$NAMESPACE \
        --image=$DOCKER_REGISTRY/health-nutrition-tracker/api:$VERSION \
        -- npm run migrate
    
    log "資料庫遷移完成"
}

# 健康檢查
health_check() {
    log "執行健康檢查..."
    
    # 檢查 Pod 狀態
    kubectl get pods -n $NAMESPACE
    
    # 檢查服務狀態
    kubectl get services -n $NAMESPACE
    
    # 檢查 Ingress
    kubectl get ingress -n $NAMESPACE
    
    # 測試 API 連接
    info "等待 API 服務啟動..."
    sleep 30
    
    API_POD=$(kubectl get pods -n $NAMESPACE -l app=api -o jsonpath='{.items[0].metadata.name}')
    if kubectl exec -n $NAMESPACE $API_POD -- curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log "API 健康檢查通過"
    else
        warn "API 健康檢查失敗"
    fi
    
    log "部署完成！"
    info "應用程式現在可以通過 Ingress 存取"
}

# 回滾部署
rollback() {
    local revision=${1:-1}
    log "回滾到修訂版本 $revision..."
    
    kubectl rollout undo deployment/api -n $NAMESPACE --to-revision=$revision
    kubectl rollout undo deployment/web -n $NAMESPACE --to-revision=$revision
    
    kubectl rollout status deployment/api -n $NAMESPACE
    kubectl rollout status deployment/web -n $NAMESPACE
    
    log "回滾完成"
}

# 主函數
main() {
    case "$1" in
        "deploy")
            check_dependencies
            build_images
            create_namespace
            deploy_configs
            deploy_databases
            run_migrations
            deploy_services
            deploy_ingress
            deploy_backup
            health_check
            ;;
        "rollback")
            rollback "$2"
            ;;
        "health-check")
            health_check
            ;;
        *)
            echo "使用方法:"
            echo "  $0 deploy [version]     # 部署應用程式 (預設版本: latest)"
            echo "  $0 rollback [revision]  # 回滾部署 (預設回滾 1 個版本)"
            echo "  $0 health-check         # 執行健康檢查"
            echo ""
            echo "範例:"
            echo "  $0 deploy v1.0.0        # 部署版本 v1.0.0"
            echo "  $0 rollback 2           # 回滾到修訂版本 2"
            exit 1
            ;;
    esac
}

main "$@"