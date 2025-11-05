#!/bin/bash

# Railway 部署修復腳本

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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
}

echo "🔧 Railway 部署修復工具"
echo "======================="

# 1. 檢查 package.json
log "檢查 package.json 配置..."
if [ ! -f "package.json" ]; then
    error "package.json 不存在"
    exit 1
fi

# 2. 確保所有依賴都已安裝
log "檢查依賴..."
if [ ! -d "node_modules" ]; then
    info "安裝依賴..."
    npm install
fi

# 3. 測試本地啟動
log "測試本地啟動..."
timeout 5s npm start > /dev/null 2>&1 || true

# 4. 檢查 railway.json
log "檢查 Railway 配置..."
if [ ! -f "railway.json" ]; then
    warn "railway.json 不存在，建立預設配置..."
    cat > railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
fi

# 5. 建立 .railwayignore (如果需要)
if [ ! -f ".railwayignore" ]; then
    log "建立 .railwayignore..."
    cat > .railwayignore << EOF
node_modules
.git
.env
*.log
.DS_Store
EOF
fi

# 6. 確保 simple-server.js 存在且可執行
if [ ! -f "apps/api/src/simple-server.js" ]; then
    error "apps/api/src/simple-server.js 不存在"
    exit 1
fi

# 7. 提交更改
log "提交修復..."
git add .
git commit -m "Fix Railway deployment configuration" || true
git push origin main

log "✅ 修復完成！"
echo ""
info "接下來請在 Railway 中："
echo "1. 前往你的專案"
echo "2. 點擊 'Redeploy' 重新部署"
echo "3. 檢查環境變數是否已設定："
echo "   - NODE_ENV=production"
echo "   - OPENAI_API_KEY=sk-your-key-here"
echo "   - JWT_SECRET=your-jwt-secret"
echo ""
warn "如果仍然失敗，請檢查 Railway 的部署日誌"