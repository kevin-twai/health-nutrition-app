#!/bin/bash

# 自動備份腳本
# 用於 Docker 容器中的定期備份

set -e

# 設定變數
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
LOG_FILE="/var/log/backup.log"

# 日誌函數
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a $LOG_FILE
    exit 1
}

# 檢查環境變數
check_env() {
    local required_vars=(
        "POSTGRES_HOST" "POSTGRES_DB" "POSTGRES_USER" "POSTGRES_PASSWORD"
        "MONGODB_HOST" "MONGODB_DB" "MONGODB_USER" "MONGODB_PASSWORD"
        "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "S3_BACKUP_BUCKET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "環境變數 $var 未設定"
        fi
    done
}

# 備份 PostgreSQL
backup_postgres() {
    log "開始備份 PostgreSQL..."
    
    local backup_file="$BACKUP_DIR/postgres/postgres_backup_$TIMESTAMP.sql"
    
    PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
        -h $POSTGRES_HOST \
        -U $POSTGRES_USER \
        -d $POSTGRES_DB \
        --verbose \
        --no-owner \
        --no-privileges \
        > $backup_file
    
    if [ $? -eq 0 ]; then
        log "PostgreSQL 備份完成: $backup_file"
        
        # 壓縮備份檔案
        gzip $backup_file
        backup_file="${backup_file}.gz"
        
        # 上傳到 S3
        if [ -n "$S3_BACKUP_BUCKET" ]; then
            aws s3 cp $backup_file s3://$S3_BACKUP_BUCKET/postgres/
            log "PostgreSQL 備份已上傳到 S3"
        fi
        
        # 清理本地舊備份 (保留 7 天)
        find $BACKUP_DIR/postgres -name "postgres_backup_*.sql.gz" -mtime +7 -delete
        
    else
        error "PostgreSQL 備份失敗"
    fi
}

# 備份 MongoDB
backup_mongodb() {
    log "開始備份 MongoDB..."
    
    local backup_dir="$BACKUP_DIR/mongodb/mongodb_backup_$TIMESTAMP"
    
    mongodump \
        --host $MONGODB_HOST \
        --db $MONGODB_DB \
        --username $MONGODB_USER \
        --password $MONGODB_PASSWORD \
        --authenticationDatabase admin \
        --out $backup_dir
    
    if [ $? -eq 0 ]; then
        log "MongoDB 備份完成: $backup_dir"
        
        # 壓縮備份目錄
        tar -czf "${backup_dir}.tar.gz" -C $BACKUP_DIR/mongodb $(basename $backup_dir)
        rm -rf $backup_dir
        
        # 上傳到 S3
        if [ -n "$S3_BACKUP_BUCKET" ]; then
            aws s3 cp "${backup_dir}.tar.gz" s3://$S3_BACKUP_BUCKET/mongodb/
            log "MongoDB 備份已上傳到 S3"
        fi
        
        # 清理本地舊備份 (保留 7 天)
        find $BACKUP_DIR/mongodb -name "mongodb_backup_*.tar.gz" -mtime +7 -delete
        
    else
        error "MongoDB 備份失敗"
    fi
}

# 健康檢查
health_check() {
    log "執行健康檢查..."
    
    # 檢查 PostgreSQL 連接
    PGPASSWORD=$POSTGRES_PASSWORD pg_isready -h $POSTGRES_HOST -U $POSTGRES_USER
    if [ $? -eq 0 ]; then
        log "PostgreSQL 連接正常"
    else
        error "PostgreSQL 連接失敗"
    fi
    
    # 檢查 MongoDB 連接
    mongosh --host $MONGODB_HOST --username $MONGODB_USER --password $MONGODB_PASSWORD --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null
    if [ $? -eq 0 ]; then
        log "MongoDB 連接正常"
    else
        error "MongoDB 連接失敗"
    fi
    
    # 檢查 S3 連接
    if [ -n "$S3_BACKUP_BUCKET" ]; then
        aws s3 ls s3://$S3_BACKUP_BUCKET/ > /dev/null
        if [ $? -eq 0 ]; then
            log "S3 連接正常"
        else
            error "S3 連接失敗"
        fi
    fi
}

# 發送通知
send_notification() {
    local status=$1
    local message=$2
    
    # 這裡可以整合 Slack、Email 或其他通知服務
    log "備份狀態: $status - $message"
    
    # 範例: 發送到 Slack (需要設定 SLACK_WEBHOOK_URL)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"健康營養追蹤系統備份 - $status: $message\"}" \
            $SLACK_WEBHOOK_URL
    fi
}

# 主函數
main() {
    log "開始執行備份任務..."
    
    # 檢查環境變數
    check_env
    
    # 執行健康檢查
    health_check
    
    # 執行備份
    backup_postgres
    backup_mongodb
    
    log "備份任務完成"
    send_notification "成功" "所有資料庫備份已完成"
}

# 錯誤處理
trap 'send_notification "失敗" "備份過程中發生錯誤"' ERR

# 執行主函數
main "$@"