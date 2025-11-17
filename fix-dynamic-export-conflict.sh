#!/bin/bash

echo "🔧 修復 dynamic = 'force-dynamic' 與 export 模式衝突"
echo "=========================================================="
echo ""

echo "📝 提交修復..."
git add apps/web/src/app/layout.tsx apps/web/next.config.js
git commit -m "fix: 移除 force-dynamic 以支持 export 模式

- 從 layout.tsx 移除 dynamic = 'force-dynamic'
- 從 layout.tsx 移除 revalidate = 0
- 這些設置與 output: 'export' 不兼容
- Export 模式需要所有頁面都是靜態可渲染的"

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
echo "  ✓ 沒有 'force-dynamic' 錯誤"
echo "  ✓ 沒有 'useContext' 錯誤"
echo "  ✓ 所有頁面成功生成"
echo "  ✓ Export successful"
echo "  ✓ Build successful 🎉"
echo ""
echo "🌐 部署完成後訪問："
echo "   https://health-nutrition-web.onrender.com"
echo ""
