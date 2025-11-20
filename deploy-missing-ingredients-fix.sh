#!/bin/bash

# 部署缺失食材修復
# Deploy Missing Ingredients Fix

echo "🚀 開始部署缺失食材修復..."
echo ""

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
  echo "❌ 錯誤：請在項目根目錄執行此腳本"
  exit 1
fi

# 顯示新增的食材
echo "📋 新增的食材："
echo "  ✅ 蟹腿（蟹腳）"
echo "  ✅ 豆苗"
echo "  ✅ 魚片"
echo "  ✅ 水菜"
echo "  ✅ 豆腐（更新變體）"
echo ""

# 提交更改
echo "📝 提交更改到 Git..."
git add apps/api/src/data/asianFoodItems.ts
git commit -m "fix: 添加缺失的火鍋食材（蟹腿、豆苗、魚片、水菜）

- 新增蟹腿/蟹腳食材定義
- 新增豆苗食材定義
- 新增魚片食材定義
- 新增水菜食材定義
- 更新豆腐的名稱變體，避免與豆腐干絲混淆
- 所有新食材都包含完整的營養資訊和視覺特徵
- 支持火鍋場景的食材識別"

echo ""
echo "🔄 推送到 GitHub..."
git push origin main

echo ""
echo "⏳ 等待 Render 自動部署..."
echo ""
echo "📊 部署狀態："
echo "  1. 前往 Render Dashboard: https://dashboard.render.com"
echo "  2. 查看 health-nutrition-api 服務"
echo "  3. 等待部署完成（通常需要 2-3 分鐘）"
echo ""
echo "✅ 部署腳本執行完成！"
echo ""
echo "🧪 部署完成後，請測試："
echo "  - 上傳火鍋圖片"
echo "  - 確認能識別：蟹腿/蟹腳、豆苗、魚片、水菜"
echo "  - 確認豆腐不會被誤認為豆腐干絲"
echo ""
