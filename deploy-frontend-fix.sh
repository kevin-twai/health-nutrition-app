#!/bin/bash

echo "🚀 部署前端 API 修復"
echo "================================"

# 檢查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
  echo "📝 發現未提交的更改"
  
  # 顯示更改的文件
  echo ""
  echo "修改的文件:"
  git status -s
  echo ""
  
  # 添加修改的文件
  echo "📦 添加修改的文件..."
  git add apps/web/next.config.js
  git add apps/web/src/app/page.tsx
  git add apps/web/src/app/photo/page.tsx
  git add apps/web/src/app/reports/page.tsx
  git add apps/web/src/lib/api.ts
  git add FRONTEND_API_FIX.md
  git add deploy-frontend-fix.sh
  
  # 提交更改
  echo "💾 提交更改..."
  git commit -m "fix: 更新前端 API URL 連接到正確的後端

- 修復 next.config.js 中的 API URL
- 更新照片辨識頁面的 API 調用
- 更新報告頁面的 API 調用
- 更新首頁顯示的 API URL
- 創建統一的 API 配置文件 (apps/web/src/lib/api.ts)

後端 URL: https://health-nutrition-api.onrender.com
前端 URL: https://health-nutrition-web.onrender.com"
  
  echo ""
  echo "✅ 更改已提交"
  echo ""
  
  # 詢問是否推送
  read -p "是否推送到遠端倉庫？(y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 推送到遠端..."
    git push origin main
    echo ""
    echo "✅ 推送完成！"
    echo ""
    echo "🎯 Render 會自動檢測更改並重新部署前端"
    echo ""
    echo "📊 監控部署狀態:"
    echo "   前端: https://dashboard.render.com"
    echo ""
    echo "🌐 部署完成後訪問:"
    echo "   前端: https://health-nutrition-web.onrender.com"
    echo "   後端: https://health-nutrition-api.onrender.com"
  else
    echo "⏸️  跳過推送"
    echo ""
    echo "💡 稍後可以手動推送:"
    echo "   git push origin main"
  fi
else
  echo "✅ 沒有未提交的更改"
fi

echo ""
echo "================================"
echo "🎉 完成！"
