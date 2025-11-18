#!/bin/bash

# 部署到 Render - EnhancedPromptGenerator 整合版
# 使用方法：./deploy-to-render.sh

echo "🚀 準備部署到 Render..."
echo ""

# 檢查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "📝 發現未提交的更改"
    echo ""
    git status -s
    echo ""
    read -p "是否要提交這些更改？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 添加所有更改..."
        git add .
        
        echo ""
        read -p "請輸入提交訊息（按 Enter 使用默認訊息）: " commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="feat: 整合 EnhancedPromptGenerator 並部署到 Render"
        fi
        
        echo "💾 提交更改..."
        git commit -m "$commit_msg"
    else
        echo "❌ 取消部署"
        exit 1
    fi
fi

# 檢查當前分支
current_branch=$(git branch --show-current)
echo "📍 當前分支: $current_branch"
echo ""

# 推送到遠程倉庫
echo "🔄 推送到遠程倉庫..."
git push origin $current_branch

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 成功推送到 Git！"
    echo ""
    echo "📊 Render 將自動開始部署..."
    echo ""
    echo "🔗 請訪問 Render Dashboard 查看部署狀態："
    echo "   https://dashboard.render.com/"
    echo ""
    echo "⚠️  重要提示："
    echo "   1. 確保在 Render Dashboard 中設置了 OPENAI_API_KEY 環境變量"
    echo "   2. 部署完成後，檢查日誌中是否有 '✅ 成功導入 EnhancedPromptGenerator'"
    echo "   3. 測試健康檢查：curl https://your-app.onrender.com/health"
    echo ""
    echo "📖 詳細部署指南請查看：RENDER_DEPLOYMENT_ENHANCED_PROMPT.md"
else
    echo ""
    echo "❌ 推送失敗！"
    echo "請檢查網絡連接和 Git 配置"
    exit 1
fi
