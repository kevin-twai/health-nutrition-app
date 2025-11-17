#!/bin/bash

echo "🔧 切換到 Standalone 模式"
echo "============================"
echo ""

echo "📝 提交修復..."
git add apps/web/next.config.js
git commit -m "fix: 切換到 standalone 模式避免 styled-jsx 錯誤

- 從 output: 'export' 改為 output: 'standalone'
- Export 模式與 styled-jsx 有不可解決的衝突
- Standalone 模式需要 Node.js 服務器但更穩定
- Render 支持 Node.js 服務器，所以這是最佳方案"

echo ""
echo "📤 推送到 Git..."
git push origin main

echo ""
echo "✅ 修復完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Render 會自動觸發新的部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 監控部署日誌，應該看到："
echo "  ✓ 沒有 styled-jsx 錯誤"
echo "  ✓ 構建成功"
echo "  ✓ 服務器啟動成功"
echo "  ✓ Build successful 🎉"
echo ""
echo "⚠️  注意：Standalone 模式需要："
echo "  - Start Command: npm start"
echo "  - 不需要 Publish Directory"
echo ""
echo "🌐 部署完成後訪問："
echo "   https://health-nutrition-web.onrender.com"
echo ""
