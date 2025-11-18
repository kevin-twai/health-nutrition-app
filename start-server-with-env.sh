#!/bin/bash

# 啟動服務器並加載環境變量
# 使用方法：./start-server-with-env.sh

echo "🔧 正在啟動服務器..."
echo ""

# 檢查 OPENAI_API_KEY 是否已設置
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  警告：OPENAI_API_KEY 環境變量未設置"
    echo "請先設置環境變量："
    echo "  export OPENAI_API_KEY='your-actual-api-key'"
    echo ""
    echo "或者在 .env 文件中設置正確的 API Key"
    echo ""
fi

# 啟動服務器
node apps/api/src/simple-server.js
