#!/bin/bash

# 網際網路部署腳本
# 支援多種部署平台

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

# 檢查必要工具
check_dependencies() {
    log "檢查必要工具..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker 未安裝，請先安裝 Docker"
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git 未安裝，請先安裝 Git"
    fi
    
    log "所有必要工具已安裝"
}

# 準備環境變數
setup_env() {
    log "設定環境變數..."
    
    if [ ! -f .env.production ]; then
        info "建立 .env.production 檔案..."
        cat > .env.production << EOF
# 生產環境配置
NODE_ENV=production

# 資料庫配置
POSTGRES_DB=health_tracker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=\$(openssl rand -base64 32)
MONGODB_DB=health_tracker_nutrition
MONGODB_USER=admin
MONGODB_PASSWORD=\$(openssl rand -base64 32)
REDIS_PASSWORD=\$(openssl rand -base64 32)

# JWT 秘密
JWT_SECRET=\$(openssl rand -base64 64)

# API 金鑰 (請填入真實值)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_VISION_API_KEY=your-google-vision-api-key-here

# AWS 配置 (可選)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-west-2
S3_BACKUP_BUCKET=health-nutrition-backups

# 應用程式 URL
NEXT_PUBLIC_API_URL=https://your-domain.com

# Grafana 管理員密碼
GRAFANA_ADMIN_PASSWORD=\$(openssl rand -base64 32)
EOF
        warn "請編輯 .env.production 檔案並填入正確的 API 金鑰"
        info "特別是 OPENAI_API_KEY 和 GOOGLE_VISION_API_KEY"
    fi
    
    log "環境變數設定完成"
}

# DigitalOcean App Platform 部署
deploy_digitalocean() {
    log "準備 DigitalOcean App Platform 部署..."
    
    info "請按照以下步驟進行部署："
    echo "1. 將程式碼推送到 GitHub"
    echo "2. 登入 DigitalOcean 控制台"
    echo "3. 建立新的 App"
    echo "4. 選擇 GitHub 儲存庫"
    echo "5. 上傳 deploy-simple.yml 配置檔案"
    echo "6. 設定環境變數"
    echo "7. 部署應用程式"
    
    info "部署配置檔案已建立：deploy-simple.yml"
    info "Dockerfile 已建立：Dockerfile.simple"
}

# Railway 部署
deploy_railway() {
    log "準備 Railway 部署..."
    
    if ! command -v railway &> /dev/null; then
        info "安裝 Railway CLI..."
        npm install -g @railway/cli
    fi
    
    info "請按照以下步驟進行部署："
    echo "1. railway login"
    echo "2. railway init"
    echo "3. railway add --database postgresql"
    echo "4. railway deploy"
    
    # 建立 railway.json
    cat > railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.simple"
  },
  "deploy": {
    "startCommand": "node simple-server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
    
    log "Railway 配置檔案已建立：railway.json"
}

# Heroku 部署
deploy_heroku() {
    log "準備 Heroku 部署..."
    
    if ! command -v heroku &> /dev/null; then
        error "Heroku CLI 未安裝，請先安裝"
    fi
    
    # 建立 Procfile
    echo "web: node apps/api/src/simple-server.js" > Procfile
    
    # 建立 app.json
    cat > app.json << EOF
{
  "name": "健康營養追蹤系統",
  "description": "AI 驅動的健康營養追蹤應用程式",
  "repository": "https://github.com/your-username/health-nutrition-app",
  "logo": "https://your-domain.com/logo.png",
  "keywords": ["nodejs", "health", "nutrition", "ai"],
  "image": "heroku/nodejs",
  "addons": [
    "heroku-postgresql:mini",
    "heroku-redis:mini"
  ],
  "env": {
    "NODE_ENV": {
      "description": "Node.js 環境",
      "value": "production"
    },
    "OPENAI_API_KEY": {
      "description": "OpenAI API 金鑰",
      "required": true
    },
    "JWT_SECRET": {
      "description": "JWT 簽名秘密",
      "generator": "secret"
    }
  },
  "formation": {
    "web": {
      "quantity": 1,
      "size": "basic"
    }
  },
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ]
}
EOF
    
    info "請按照以下步驟進行部署："
    echo "1. heroku login"
    echo "2. heroku create your-app-name"
    echo "3. heroku config:set OPENAI_API_KEY=your-key"
    echo "4. git push heroku main"
    
    log "Heroku 配置檔案已建立：Procfile, app.json"
}

# VPS Docker Compose 部署
deploy_vps() {
    log "準備 VPS Docker Compose 部署..."
    
    # 建立簡化的 docker-compose.yml
    cat > docker-compose.internet.yml << EOF
version: '3.8'

services:
  # 簡化的 API 服務
  api:
    build:
      context: .
      dockerfile: Dockerfile.simple
    container_name: health-tracker-api
    environment:
      NODE_ENV: production
      PORT: 3001
      OPENAI_API_KEY: \${OPENAI_API_KEY}
      JWT_SECRET: \${JWT_SECRET}
    ports:
      - "3001:3001"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  # NGINX 反向代理
  nginx:
    image: nginx:alpine
    container_name: health-tracker-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
    restart: unless-stopped

volumes: {}
networks: {}
EOF

    # 建立 NGINX 配置
    cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3001;
    }

    server {
        listen 80;
        server_name _;

        location /health {
            proxy_pass http://api/health;
        }

        location /api/ {
            proxy_pass http://api/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location / {
            proxy_pass http://api/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF
    
    info "VPS 部署檔案已建立："
    echo "- docker-compose.internet.yml"
    echo "- nginx.conf"
    echo ""
    echo "部署步驟："
    echo "1. 將檔案上傳到 VPS"
    echo "2. 設定環境變數：export OPENAI_API_KEY=your-key"
    echo "3. 執行：docker-compose -f docker-compose.internet.yml up -d"
    
    log "VPS 部署配置完成"
}

# 測試部署
test_deployment() {
    local url=$1
    log "測試部署..."
    
    info "測試健康檢查端點..."
    if curl -f "$url/health" > /dev/null 2>&1; then
        log "✅ 健康檢查通過"
    else
        warn "❌ 健康檢查失敗"
    fi
    
    info "測試 API 端點..."
    if curl -f "$url/api/v1" > /dev/null 2>&1; then
        log "✅ API 端點正常"
    else
        warn "❌ API 端點異常"
    fi
    
    log "部署測試完成"
}

# 主函數
main() {
    echo "🚀 健康營養追蹤系統 - 網際網路部署工具"
    echo "================================================"
    
    case "$1" in
        "digitalocean"|"do")
            check_dependencies
            setup_env
            deploy_digitalocean
            ;;
        "railway")
            check_dependencies
            setup_env
            deploy_railway
            ;;
        "heroku")
            check_dependencies
            setup_env
            deploy_heroku
            ;;
        "vps")
            check_dependencies
            setup_env
            deploy_vps
            ;;
        "test")
            test_deployment "$2"
            ;;
        *)
            echo "使用方法:"
            echo "  $0 digitalocean  # 部署到 DigitalOcean App Platform"
            echo "  $0 railway       # 部署到 Railway"
            echo "  $0 heroku        # 部署到 Heroku"
            echo "  $0 vps           # 部署到 VPS (Docker Compose)"
            echo "  $0 test <url>    # 測試部署"
            echo ""
            echo "推薦順序："
            echo "1. Railway (最簡單，免費額度)"
            echo "2. DigitalOcean App Platform (穩定，付費)"
            echo "3. Heroku (經典，有限制)"
            echo "4. VPS (最靈活，需要管理)"
            exit 1
            ;;
    esac
}

main "$@"