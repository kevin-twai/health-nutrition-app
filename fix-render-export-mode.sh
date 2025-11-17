#!/bin/bash

echo "🔧 修復 Render 前端部署 - Export 模式"
echo "=========================================="
echo ""

# 1. 提交修復
echo "📝 提交配置修復..."
git add apps/web/next.config.js
git commit -m "fix: 切換到 export 模式解決 Render 部署問題

- 移除無效的 onError 配置
- 改用 output: 'export' 生成靜態文件
- 禁用圖片優化
- 避免 styled-jsx SSR 問題
- 簡化配置提高穩定性"

echo ""
echo "📤 推送到 Git..."
git push origin main

echo ""
echo "✅ 代碼已推送！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 接下來在 Render Dashboard 中進行以下設置："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  進入 health-nutrition-web 服務設置"
echo ""
echo "2️⃣  修改 Build Command 為："
echo "   apps/web/ $ npm install && npm run build"
echo ""
echo "3️⃣  修改 Publish Directory 為："
echo "   apps/web/out"
echo ""
echo "4️⃣  點擊 'Save Changes'"
echo ""
echo "5️⃣  點擊 'Manual Deploy' > 'Deploy latest commit'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 為什麼這樣可以解決問題："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✓ export 模式：生成純靜態 HTML/CSS/JS 文件"
echo "✓ 無需 Node.js 服務器：直接用靜態文件服務"
echo "✓ 避免 SSR：完全繞過 styled-jsx 的 SSR 問題"
echo "✓ out 目錄：所有靜態文件輸出到這裡"
echo "✓ 簡單穩定：減少配置複雜度"
echo ""
echo "🌐 部署完成後訪問："
echo "   https://health-nutrition-web.onrender.com"
echo ""
