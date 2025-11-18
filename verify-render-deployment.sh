#!/bin/bash

# 驗證 Render 部署 - EnhancedPromptGenerator 整合版
# 使用方法：./verify-render-deployment.sh https://your-app.onrender.com

if [ -z "$1" ]; then
    echo "❌ 錯誤：請提供 Render 應用的 URL"
    echo "使用方法：./verify-render-deployment.sh https://your-app.onrender.com"
    exit 1
fi

RENDER_URL=$1

echo "🔍 驗證 Render 部署..."
echo "📍 URL: $RENDER_URL"
echo ""

# 測試 1：健康檢查
echo "1️⃣  測試健康檢查..."
health_response=$(curl -s "$RENDER_URL/health")

if [ $? -eq 0 ]; then
    echo "✅ 健康檢查成功"
    
    # 檢查 OpenAI API 配置
    configured=$(echo $health_response | python3 -c "import sys, json; print(json.load(sys.stdin)['aiVisionAPI']['chatgpt']['configured'])" 2>/dev/null)
    
    if [ "$configured" = "True" ]; then
        echo "   ✅ OpenAI API Key 已配置"
    else
        echo "   ⚠️  OpenAI API Key 未配置"
        echo "   請在 Render Dashboard 中設置 OPENAI_API_KEY 環境變量"
    fi
else
    echo "❌ 健康檢查失敗"
    echo "   請檢查服務是否正在運行"
fi

echo ""

# 測試 2：API 版本端點
echo "2️⃣  測試 API 版本端點..."
api_response=$(curl -s "$RENDER_URL/api/v1")

if [ $? -eq 0 ]; then
    echo "✅ API 端點正常"
else
    echo "❌ API 端點失敗"
fi

echo ""

# 測試 3：檢查 EnhancedPromptGenerator 整合
echo "3️⃣  檢查 EnhancedPromptGenerator 整合狀態..."
echo "   請在 Render Dashboard 的 Logs 中查找以下訊息："
echo "   - ✅ 成功導入 EnhancedPromptGenerator"
echo "   - ❌ 無法導入 EnhancedPromptGenerator（如果看到這個，說明有問題）"
echo ""

# 顯示完整的健康檢查響應
echo "📊 完整健康檢查響應："
echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"

echo ""
echo "🎯 驗證完成！"
echo ""
echo "📝 下一步："
echo "   1. 如果 OpenAI API Key 未配置，請在 Render Dashboard 中設置"
echo "   2. 檢查 Render Logs 確認 EnhancedPromptGenerator 成功導入"
echo "   3. 測試照片識別功能"
echo ""
echo "📖 詳細部署指南：RENDER_DEPLOYMENT_ENHANCED_PROMPT.md"
