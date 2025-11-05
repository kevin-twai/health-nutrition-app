#!/bin/bash

# 健康營養追蹤系統 - 開發環境設定腳本

set -e

echo "🚀 開始設定健康營養追蹤系統開發環境..."

# 檢查 Node.js 版本
echo "📋 檢查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝。請安裝 Node.js 18+ 版本。"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本過舊 (目前: $(node -v))。請升級到 18+ 版本。"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 檢查 Docker
echo "📋 檢查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝。請安裝 Docker。"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝。請安裝 Docker Compose。"
    exit 1
fi

echo "✅ Docker 版本: $(docker --version)"
echo "✅ Docker Compose 版本: $(docker-compose --version)"

# 安裝相依性
echo "📦 安裝專案相依性..."
npm install

# 建置共享類型
echo "🔧 建置共享類型..."
npm run build --workspace=@health-tracker/shared-types

# 複製環境變數檔案
echo "⚙️  設定環境變數..."
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ 已建立 API 環境變數檔案: apps/api/.env"
    echo "⚠️  請編輯此檔案並填入正確的設定值"
else
    echo "✅ API 環境變數檔案已存在"
fi

# 啟動 Docker 服務
echo "🐳 啟動 Docker 服務..."
docker-compose up -d postgres mongodb redis

# 等待資料庫啟動
echo "⏳ 等待資料庫服務啟動..."
sleep 10

# 檢查服務狀態
echo "📊 檢查服務狀態..."
docker-compose ps

echo ""
echo "🎉 開發環境設定完成！"
echo ""
echo "📝 下一步："
echo "1. 編輯 apps/api/.env 檔案，填入必要的 API 金鑰"
echo "2. 執行 'npm run dev' 啟動開發伺服器"
echo "3. 造訪 http://localhost:3000 檢視網頁應用"
echo "4. 造訪 http://localhost:3001 檢視 API 服務"
echo ""
echo "🔧 常用指令："
echo "- npm run dev          # 啟動開發模式"
echo "- npm run test         # 執行測試"
echo "- npm run lint         # 程式碼檢查"
echo "- make docker-up       # 啟動所有 Docker 服務"
echo "- make docker-down     # 停止所有 Docker 服務"
echo ""