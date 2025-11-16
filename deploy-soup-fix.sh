#!/bin/bash

# 湯品識別修復部署腳本

echo "🍜 開始部署湯品識別修復..."

# 1. 檢查修改的文件
echo ""
echo "📝 檢查修改的文件..."
git status

# 2. 提交修改
echo ""
echo "💾 提交修改..."
git add apps/api/src/services/MultiStageRecognitionEngine.ts
git add apps/api/src/data/asianFoodItemsExtended.ts
git add apps/api/src/data/asianFoodItems.ts
git add deploy-soup-fix.sh
git add SOUP_RECOGNITION_FIX.md

git commit -m "fix: 添加湯品到知識庫並修復數據加載

- 修復 parseVisionResponse 邏輯：當資料庫返回空結果時也觸發知識庫
- 修復知識庫數據加載：合併 ASIAN_FOOD_ITEMS 和 ASIAN_FOOD_ITEMS_EXTENDED
- 添加常見湯品到知識庫：
  * 味噌湯（日式）- 35 kcal
  * 蛋花湯（中式）- 45 kcal
  * 貢丸湯（台式）- 55 kcal
  * 酸辣湯（川式）- 50 kcal
- 每個湯品包含完整營養資訊和視覺特徵
- 添加詳細日誌以追蹤查詢流程
- 知識庫現在包含 204+ 食材"

# 3. 推送到 GitHub
echo ""
echo "📤 推送到 GitHub..."
git push origin main

# 4. 等待 Render 自動部署
echo ""
echo "⏳ Render 將自動開始部署..."
echo ""
echo "📊 監控部署狀態："
echo "   https://dashboard.render.com/"
echo ""
echo "✅ 部署完成後，系統將："
echo "   1. 優先查詢 MongoDB"
echo "   2. 如果 MongoDB 無結果，自動使用知識庫"
echo "   3. 知識庫現在包含 4 種常見湯品"
echo "   4. 每個湯品都有完整營養資訊"
echo ""
echo "🧪 測試命令："
echo "   上傳味噌湯圖片，應該能看到："
echo "   - 食物名稱：味噌湯"
echo "   - 熱量：35 kcal"
echo "   - 蛋白質：2.5g"
echo "   - 碳水：4.0g"
echo "   - 脂肪：1.0g"
echo ""
echo "🎉 完成！"
