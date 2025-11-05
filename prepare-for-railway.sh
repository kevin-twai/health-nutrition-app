#!/bin/bash

# 準備 Railway 部署的腳本

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

echo "🚀 準備 Railway 部署"
echo "===================="

# 檢查 Git 狀態
if [ ! -d ".git" ]; then
    log "初始化 Git 倉庫..."
    git init
fi

# 檢查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    log "提交所有更改..."
    git add .
    git commit -m "Prepare for Railway deployment"
fi

# 生成 JWT 秘密
JWT_SECRET=$(openssl rand -base64 64)

log "✅ 準備完成！"
echo ""
info "接下來請按照以下步驟操作："
echo ""
echo "1. 📤 推送程式碼到 GitHub："
echo "   git remote add origin https://github.com/your-username/health-nutrition-app.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. 🌐 前往 Railway 部署："
echo "   - 開啟 https://railway.app"
echo "   - 使用 GitHub 帳號登入"
echo "   - 點擊 'New Project' → 'Deploy from GitHub repo'"
echo "   - 選擇你的倉庫並部署"
echo ""
echo "3. ⚙️ 設定環境變數："
echo "   NODE_ENV=production"
echo "   OPENAI_API_KEY=sk-your-openai-api-key-here"
echo "   JWT_SECRET=$JWT_SECRET"
echo ""
echo "4. 🔗 取得應用程式 URL："
echo "   - 前往 Settings → Domains → Generate Domain"
echo ""
warn "記得將 OPENAI_API_KEY 替換為你的真實 API 金鑰！"
info "詳細步驟請參考：SIMPLE_RAILWAY_DEPLOY.md"