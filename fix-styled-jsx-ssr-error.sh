#!/bin/bash

echo "🔧 修復 styled-jsx SSR 錯誤"
echo "=============================="
echo ""

echo "📝 提交修復..."
git add apps/web/next.config.js apps/web/src/app/photo/page.tsx
git commit -m "fix: 移除 styled-jsx 以避免 SSR 錯誤

- 在 next.config.js 中禁用 styled-jsx 編譯器
- 從 photo/page.tsx 移除 <style jsx>
- 改用 dangerouslySetInnerHTML 的普通 <style> 標籤
- 這樣可以避免 styled-jsx 的 useContext SSR 錯誤"

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
echo "  ✓ 沒有 'useContext' 錯誤"
echo "  ✓ 沒有 styled-jsx 錯誤"
echo "  ✓ 所有頁面成功生成"
echo "  ✓ Export successful"
echo "  ✓ Build successful 🎉"
echo ""
echo "🌐 部署完成後訪問："
echo "   https://health-nutrition-web.onrender.com"
echo ""
