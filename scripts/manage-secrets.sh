#!/bin/bash

# 秘密管理腳本
# 用於安全地管理 Kubernetes 秘密

set -e

NAMESPACE="health-nutrition-tracker"

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

# Base64 編碼函數
encode_base64() {
    echo -n "$1" | base64
}

# 建立秘密
create_secrets() {
    log "建立 Kubernetes 秘密..."
    
    # 提示用戶輸入秘密值
    echo "請輸入以下秘密值 (輸入時不會顯示):"
    
    read -s -p "JWT Secret: " JWT_SECRET
    echo
    read -s -p "PostgreSQL Password: " POSTGRES_PASSWORD
    echo
    read -s -p "MongoDB Password: " MONGODB_PASSWORD
    echo
    read -s -p "Redis Password: " REDIS_PASSWORD
    echo
    read -s -p "OpenAI API Key: " OPENAI_API_KEY
    echo
    read -s -p "Google Vision API Key: " GOOGLE_VISION_API_KEY
    echo
    read -s -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
    echo
    read -s -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo
    read -s -p "Notion API Key: " NOTION_API_KEY
    echo
    read -s -p "Line Channel Secret: " LINE_CHANNEL_SECRET
    echo
    read -s -p "Line Channel Access Token: " LINE_CHANNEL_ACCESS_TOKEN
    echo
    
    # 建立秘密 YAML
    cat > /tmp/secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  JWT_SECRET: $(encode_base64 "$JWT_SECRET")
  POSTGRES_PASSWORD: $(encode_base64 "$POSTGRES_PASSWORD")
  MONGODB_PASSWORD: $(encode_base64 "$MONGODB_PASSWORD")
  REDIS_PASSWORD: $(encode_base64 "$REDIS_PASSWORD")
  OPENAI_API_KEY: $(encode_base64 "$OPENAI_API_KEY")
  GOOGLE_VISION_API_KEY: $(encode_base64 "$GOOGLE_VISION_API_KEY")
  AWS_ACCESS_KEY_ID: $(encode_base64 "$AWS_ACCESS_KEY_ID")
  AWS_SECRET_ACCESS_KEY: $(encode_base64 "$AWS_SECRET_ACCESS_KEY")
  NOTION_API_KEY: $(encode_base64 "$NOTION_API_KEY")
  LINE_CHANNEL_SECRET: $(encode_base64 "$LINE_CHANNEL_SECRET")
  LINE_CHANNEL_ACCESS_TOKEN: $(encode_base64 "$LINE_CHANNEL_ACCESS_TOKEN")
---
apiVersion: v1
kind: Secret
metadata:
  name: db-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  postgres-password: $(encode_base64 "$POSTGRES_PASSWORD")
  mongodb-password: $(encode_base64 "$MONGODB_PASSWORD")
  redis-password: $(encode_base64 "$REDIS_PASSWORD")
EOF
    
    # 應用秘密
    kubectl apply -f /tmp/secrets.yaml
    
    # 清理臨時檔案
    rm /tmp/secrets.yaml
    
    log "秘密建立完成"
}

# 更新秘密
update_secret() {
    local secret_name=$1
    local key=$2
    
    if [ -z "$secret_name" ] || [ -z "$key" ]; then
        error "請指定秘密名稱和鍵值"
    fi
    
    read -s -p "輸入新的 $key 值: " new_value
    echo
    
    kubectl patch secret $secret_name -n $NAMESPACE -p="{\"data\":{\"$key\":\"$(encode_base64 "$new_value")\"}}"
    
    log "秘密 $secret_name.$key 更新完成"
}

# 列出秘密
list_secrets() {
    log "列出所有秘密..."
    kubectl get secrets -n $NAMESPACE
}

# 查看秘密詳情
describe_secret() {
    local secret_name=$1
    
    if [ -z "$secret_name" ]; then
        error "請指定秘密名稱"
    fi
    
    kubectl describe secret $secret_name -n $NAMESPACE
}

# 刪除秘密
delete_secret() {
    local secret_name=$1
    
    if [ -z "$secret_name" ]; then
        error "請指定秘密名稱"
    fi
    
    read -p "確定要刪除秘密 $secret_name 嗎? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        kubectl delete secret $secret_name -n $NAMESPACE
        log "秘密 $secret_name 已刪除"
    else
        info "取消刪除操作"
    fi
}

# 從檔案建立秘密
create_from_file() {
    local env_file=$1
    
    if [ -z "$env_file" ] || [ ! -f "$env_file" ]; then
        error "請指定有效的環境變數檔案"
    fi
    
    log "從檔案 $env_file 建立秘密..."
    
    # 讀取環境變數檔案並建立秘密
    kubectl create secret generic app-secrets-from-file \
        --from-env-file=$env_file \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log "從檔案建立秘密完成"
}

# 匯出秘密到檔案
export_secrets() {
    local output_file=${1:-secrets-backup.yaml}
    
    log "匯出秘密到檔案 $output_file..."
    
    kubectl get secrets app-secrets db-secrets -n $NAMESPACE -o yaml > $output_file
    
    warn "注意: 匯出的檔案包含敏感資訊，請妥善保管"
    log "秘密匯出完成: $output_file"
}

# 驗證秘密
validate_secrets() {
    log "驗證秘密配置..."
    
    local required_secrets=("app-secrets" "db-secrets")
    local missing_secrets=()
    
    for secret in "${required_secrets[@]}"; do
        if ! kubectl get secret $secret -n $NAMESPACE &> /dev/null; then
            missing_secrets+=($secret)
        fi
    done
    
    if [ ${#missing_secrets[@]} -eq 0 ]; then
        log "所有必要的秘密都已配置"
    else
        error "缺少以下秘密: ${missing_secrets[*]}"
    fi
    
    # 檢查秘密鍵值
    local app_secret_keys=("JWT_SECRET" "POSTGRES_PASSWORD" "OPENAI_API_KEY")
    for key in "${app_secret_keys[@]}"; do
        if ! kubectl get secret app-secrets -n $NAMESPACE -o jsonpath="{.data.$key}" &> /dev/null; then
            warn "app-secrets 缺少鍵值: $key"
        fi
    done
}

# 主函數
main() {
    case "$1" in
        "create")
            create_secrets
            ;;
        "update")
            update_secret "$2" "$3"
            ;;
        "list")
            list_secrets
            ;;
        "describe")
            describe_secret "$2"
            ;;
        "delete")
            delete_secret "$2"
            ;;
        "from-file")
            create_from_file "$2"
            ;;
        "export")
            export_secrets "$2"
            ;;
        "validate")
            validate_secrets
            ;;
        *)
            echo "使用方法:"
            echo "  $0 create                           # 互動式建立秘密"
            echo "  $0 update <secret> <key>            # 更新特定秘密鍵值"
            echo "  $0 list                             # 列出所有秘密"
            echo "  $0 describe <secret>                # 查看秘密詳情"
            echo "  $0 delete <secret>                  # 刪除秘密"
            echo "  $0 from-file <env-file>             # 從環境變數檔案建立秘密"
            echo "  $0 export [output-file]             # 匯出秘密到檔案"
            echo "  $0 validate                         # 驗證秘密配置"
            echo ""
            echo "範例:"
            echo "  $0 create                           # 建立新秘密"
            echo "  $0 update app-secrets JWT_SECRET    # 更新 JWT 秘密"
            echo "  $0 export backup.yaml               # 匯出秘密到 backup.yaml"
            exit 1
            ;;
    esac
}

main "$@"