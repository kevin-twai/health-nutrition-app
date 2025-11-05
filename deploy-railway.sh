#!/bin/bash

# Railway 一鍵部署腳本

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🚀 健康營養追蹤系統 - Railway 一鍵部署"
echo "========================================"

# 檢查 Railway CLI
if ! command -v railway &> /dev/null; then
    log "安裝 Railway CLI..."
    npm install -g @railway/cli
fi

# 檢查是否已登入
if ! railway whoami &> /dev/null; then
    info "請先登入 Railway..."
    railway login
fi

# 初始化專案 (如果還沒初始化)
if [ ! -f ".railway" ]; then
    log "初始化 Railway 專案..."
    railway init
fi

# 詢問 OpenAI API 金鑰
if [ -z "$OPENAI_API_KEY" ]; then
    echo ""
    info "請輸入你的 OpenAI API 金鑰："
    info "前往 https://platform.openai.com/api-keys 取得"
    read -p "OpenAI API Key (sk-...): " OPENAI_API_KEY
    
    if [ -z "$OPENAI_API_KEY" ]; then
        error "OpenAI API 金鑰是必填的"
    fi
fi

# 設定環境變數
log "設定環境變數..."
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$(openssl rand -base64 64)"

# 詢問是否需要資料庫
echo ""
read -p "是否需要添加 PostgreSQL 資料庫？(y/N): " add_db
if [[ $add_db =~ ^[Yy]$ ]]; then
    log "添加 PostgreSQL 資料庫..."
    railway add --database postgresql
fi

# 詢問是否有 Google Vision API 金鑰
echo ""
read -p "是否有 Google Vision API 金鑰？(y/N): " has_vision_key
if [[ $has_vision_key =~ ^[Yy]$ ]]; then
    read -p "Google Vision API Key: " GOOGLE_VISION_API_KEY
    if [ ! -z "$GOOGLE_VISION_API_KEY" ]; then
        railway variables set GOOGLE_VISION_API_KEY="$GOOGLE_VISION_API_KEY"
    fi
fi

# 部署應用程式
log "開始部署..."
railway deploy

# 等待部署完成
log "等待部署完成..."
sleep 10

# 取得應用程式 URL
APP_URL=$(railway domain 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)

if [ ! -z "$APP_URL" ]; then
    log "🎉 部署成功！"
    info "應用程式 URL: $APP_URL"
    info "健康檢查: $APP_URL/health"
    info "照片上傳: $APP_URL/photo"
    
    # 測試健康檢查
    echo ""
    info "測試健康檢查..."
    if curl -f "$APP_URL/health" > /dev/null 2>&1; then
        log "✅ 健康檢查通過"
    else
        warn "❌ 健康檢查失敗，請檢查日誌"
        info "查看日誌: railway logs"
    fi
else
    warn "無法取得應用程式 URL，請手動檢查"
    info "執行 'railway domain' 查看 URL"
fi

echo ""
log "部署完成！"
info "有用的命令："
echo "  railway logs     # 查看日誌"
echo "  railway status   # 查看狀態"
echo "  railway domain   # 查看 URL"
echo "  railway variables # 查看環境變數"

echo ""
info "請測試以下功能："
echo "  ✅ 首頁載入"
echo "  ✅ 健康檢查端點 (/health)"
echo "  ✅ 照片上傳功能 (/photo)"
echo "  ✅ AI 食材識別功能"