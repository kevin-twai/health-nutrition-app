#!/bin/bash

# 設置 OpenAI API Key 並重啟服務器

echo "🔑 設置 OpenAI API Key"
echo ""
echo "請輸入你的 OpenAI API Key (格式: sk-...):"
read -r OPENAI_KEY

if [ -z "$OPENAI_KEY" ]; then
    echo "❌ 錯誤：API Key 不能為空"
    exit 1
fi

# 檢查 API Key 格式
if [[ ! "$OPENAI_KEY" =~ ^sk- ]]; then
    echo "⚠️  警告：API Key 格式可能不正確（通常以 sk- 開頭）"
    echo "是否繼續？(y/n)"
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "❌ 已取消"
        exit 1
    fi
fi

echo ""
echo "✅ API Key 已接收"
echo ""

# 停止現有服務器
echo "🛑 停止現有服務器..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "沒有運行中的服務器"

# 設置環境變量並啟動服務器
echo ""
echo "🚀 啟動服務器（使用 OpenAI API Key）..."
echo ""

export OPENAI_API_KEY="$OPENAI_KEY"
node apps/api/src/simple-server.js

