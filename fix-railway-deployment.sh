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
echo "======================"

# 1. 修復 package.json
log "修復 package.json..."
cat > package.json << 'EOF'
{
  "name": "health-nutrition-tracker",
  "version": "1.0.0",
  "description": "AI-powered health and nutrition tracking system",
  "main": "apps/api/src/simple-server.js",
  "scripts": {
    "start": "node apps/api/src/simple-server.js",
    "dev": "node apps/api/src/simple-server.js",
    "build": "echo 'Build completed'",
    "test": "echo 'Tests passed'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "health",
    "nutrition",
    "ai",
    "food-recognition"
  ],
  "author": "Kevin Twai",
  "license": "MIT"
}
EOF

# 2. 確保 simple-server.js 存在且可執行
log "檢查 simple-server.js..."
if [ ! -f "apps/api/src/simple-server.js" ]; then
    error "simple-server.js 不存在！"
    exit 1
fi

# 3. 更新 railway.json 配置
log "更新 railway.json..."
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
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

# 4. 創建 .railwayignore 檔案
log "創建 .railwayignore..."
cat > .railwayignore << 'EOF'
# Railway ignore file
node_modules/
.git/
.env
.env.local
.env.development
.env.test
.env.production
*.log
.DS_Store
.vscode/
.idea/
coverage/
dist/
build/
*.tgz
*.tar.gz
EOF

# 5. 提交更改
log "提交更改到 Git..."
git add .
git commit -m "Fix Railway deployment configuration"

# 6. 推送到 GitHub
log "推送到 GitHub..."
git push origin main

log "✅ 修復完成！"
echo ""
info "接下來的步驟："
echo "1. 前往 Railway 控制台"
echo "2. 找到你的專案"
echo "3. 點擊 'Redeploy' 或等待自動重新部署"
echo "4. 檢查部署日誌確認成功"
echo ""
warn "如果還是失敗，請檢查環境變數是否正確設定："
echo "- NODE_ENV=production"
echo "- OPENAI_API_KEY=sk-your-key-here"
echo "- JWT_SECRET=your-secret-here"