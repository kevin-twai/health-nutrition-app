#!/bin/bash

# MongoDB Atlas 連接修復部署腳本

echo "🚀 開始部署 MongoDB Atlas 連接修復..."

# 1. 檢查修改的文件
echo ""
echo "📝 檢查修改的文件..."
git status

# 2. 提交修改
echo ""
echo "💾 提交修改..."
git add apps/api/src/services/MultiStageRecognitionEngine.ts
git add MONGODB_ATLAS_CONNECTION_FIX.md
git add deploy-mongodb-fix.sh

git commit -m "fix: MongoDB Atlas 連接修復 - 添加知識庫後備機制

- 修復 MultiStageRecognitionEngine.parseVisionResponse() 方法
- 添加三層後備機制：MongoDB -> 知識庫 -> 基本項目
- 修復類型轉換問題
- 確保系統在 MongoDB 不可用時仍能正常運作
- 知識庫包含 200+ 亞洲食材的完整營養資訊"

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
echo "   1. 優先使用 MongoDB Atlas（如果可用）"
echo "   2. 自動降級到記憶體知識庫（200+ 食材）"
echo "   3. 確保食物識別永遠有營養資訊"
echo ""
echo "🧪 測試命令："
echo "   curl -X POST https://health-nutrition-aoi.onrender.com/api/photo/recognize \\"
echo "     -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "     -F \"image=@test-image.jpg\""
echo ""
echo "🎉 完成！"
