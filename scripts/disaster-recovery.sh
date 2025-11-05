#!/bin/bash

# 災難恢復腳本
# 用於從備份恢復資料庫

set -e

NAMESPACE="health-nutrition-tracker"
S3_BACKUP_BUCKET="health-nutrition-backups"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
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
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI 未安裝"
    fi
    
    log "所有必要工具已安裝"
}

# 列出可用的備份
list_backups() {
    local db_type=$1
    log "列出 $db_type 的可用備份..."
    
    aws s3 ls s3://$S3_BACKUP_BUCKET/$db_type/ --recursive | sort -r
}

# 恢復 PostgreSQL
restore_postgres() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        error "請指定 PostgreSQL 備份檔案"
    fi
    
    log "開始恢復 PostgreSQL 資料庫..."
    
    # 下載備份檔案
    log "下載備份檔案: $backup_file"
    aws s3 cp s3://$S3_BACKUP_BUCKET/postgres/$backup_file /tmp/$backup_file
    
    # 建立恢復 Pod
    kubectl run postgres-restore --rm -i --restart=Never \
        --namespace=$NAMESPACE \
        --image=postgres:15 \
        --env="PGPASSWORD=$(kubectl get secret app-secrets -n $NAMESPACE -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d)" \
        -- bash -c "
            dropdb -h postgres-service -U postgres health_nutrition_db --if-exists
            createdb -h postgres-service -U postgres health_nutrition_db
            psql -h postgres-service -U postgres -d health_nutrition_db < /tmp/$backup_file
        " \
        --volume=/tmp/$backup_file:/tmp/$backup_file
    
    log "PostgreSQL 資料庫恢復完成"
}

# 恢復 MongoDB
restore_mongodb() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        error "請指定 MongoDB 備份檔案"
    fi
    
    log "開始恢復 MongoDB 資料庫..."
    
    # 下載備份檔案
    log "下載備份檔案: $backup_file"
    aws s3 cp s3://$S3_BACKUP_BUCKET/mongodb/$backup_file /tmp/$backup_file
    
    # 建立恢復 Pod
    kubectl run mongodb-restore --rm -i --restart=Never \
        --namespace=$NAMESPACE \
        --image=mongo:6.0 \
        -- bash -c "
            cd /tmp
            tar -xzf $backup_file
            mongorestore --host mongodb-service --port 27017 --username admin --password \$(echo \$MONGODB_PASSWORD) --db nutrition_data --drop /tmp/\$(basename $backup_file .tar.gz)/nutrition_data
        " \
        --env="MONGODB_PASSWORD=$(kubectl get secret app-secrets -n $NAMESPACE -o jsonpath='{.data.MONGODB_PASSWORD}' | base64 -d)" \
        --volume=/tmp/$backup_file:/tmp/$backup_file
    
    log "MongoDB 資料庫恢復完成"
}

# 健康檢查
health_check() {
    log "執行健康檢查..."
    
    # 檢查 Pod 狀態
    kubectl get pods -n $NAMESPACE
    
    # 檢查服務狀態
    kubectl get services -n $NAMESPACE
    
    # 測試 API 連接
    API_URL=$(kubectl get ingress health-nutrition-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}')
    if curl -f http://$API_URL/health > /dev/null 2>&1; then
        log "API 健康檢查通過"
    else
        warn "API 健康檢查失敗"
    fi
}

# 主函數
main() {
    case "$1" in
        "list-postgres")
            check_dependencies
            list_backups "postgres"
            ;;
        "list-mongodb")
            check_dependencies
            list_backups "mongodb"
            ;;
        "restore-postgres")
            check_dependencies
            restore_postgres "$2"
            health_check
            ;;
        "restore-mongodb")
            check_dependencies
            restore_mongodb "$2"
            health_check
            ;;
        "full-restore")
            check_dependencies
            restore_postgres "$2"
            restore_mongodb "$3"
            health_check
            ;;
        *)
            echo "使用方法:"
            echo "  $0 list-postgres                    # 列出 PostgreSQL 備份"
            echo "  $0 list-mongodb                     # 列出 MongoDB 備份"
            echo "  $0 restore-postgres <backup_file>   # 恢復 PostgreSQL"
            echo "  $0 restore-mongodb <backup_file>    # 恢復 MongoDB"
            echo "  $0 full-restore <pg_backup> <mongo_backup>  # 完整恢復"
            exit 1
            ;;
    esac
}

main "$@"