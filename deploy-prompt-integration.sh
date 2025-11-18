#!/bin/bash

# Prompt 整合部署腳本
# 自動化部署整合後的 prompt 系統到 Render

set -e  # 遇到錯誤立即退出

echo "🚀 開始部署 Prompt 整合到 Render..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步驟 1: 檢查是否有未提交的更改
echo "📋 步驟 1: 檢查 Git 狀態..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  發現未提交的更改${NC}"
    git status -s
    echo ""
    read -p "是否要繼續並提交這些更改？(y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ 部署已取消${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 沒有未提交的更改${NC}"
fi
echo ""

# 步驟 2: 運行測試
echo "🧪 步驟 2: 運行整合測試..."
if node test-prompt-integration.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 測試通過${NC}"
else
    echo -e "${RED}❌ 測試失敗，請檢查錯誤${NC}"
    node test-prompt-integration.js
    exit 1
fi
echo ""

# 步驟 3: 添加文件到 Git
echo "📦 步驟 3: 添加文件到 Git..."
git add apps/api/src/utils/simpleVisionHelper.js
git add PROMPT_INTEGRATION_*.md
git add INTEGRATION_*.md
git add test-prompt-integration.js
git add deploy-prompt-integration.sh
git add DEPLOY_PROMPT_INTEGRATION_TO_RENDER.md
echo -e "${GREEN}✅ 文件已添加${NC}"
echo ""

# 步驟 4: 創建提交
echo "💾 步驟 4: 創建 Git 提交..."
COMMIT_MESSAGE="feat: integrate prompt systems for improved food recognition

- Integrated EnhancedPromptGenerator and simple-server prompt logic
- Added detailed counting accuracy warnings
- Added mandatory checklist (eggs, soups, staples, vegetables, seasonings)
- Added portion calculation guidelines
- Added indigenous cuisine identification support
- All tests passing

Key improvements:
- Better counting accuracy for countable items (e.g., oysters, eggs, dumplings)
- Reduced missing ingredients through mandatory checklist
- More accurate portion estimation with standard portion references
- Support for Taiwanese indigenous cuisine (millet abai, maqaw, bamboo tube rice)

Technical changes:
- Updated apps/api/src/utils/simpleVisionHelper.js with integrated prompt
- Added comprehensive documentation
- Added deployment guide and scripts

Testing:
- All integration tests passing
- Verified all key features present in generated prompts
- Backward compatible with existing code"

git commit -m "$COMMIT_MESSAGE"
echo -e "${GREEN}✅ 提交已創建${NC}"
echo ""

# 步驟 5: 顯示提交信息
echo "📝 步驟 5: 提交信息預覽..."
git log -1 --pretty=format:"%h - %s" --abbrev-commit
echo ""
echo ""

# 步驟 6: 推送到遠程倉庫
echo "🌐 步驟 6: 推送到遠程倉庫..."
read -p "確認推送到 origin main？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo -e "${GREEN}✅ 推送成功${NC}"
else
    echo -e "${YELLOW}⚠️  推送已跳過${NC}"
    echo "你可以稍後手動推送: git push origin main"
    exit 0
fi
echo ""

# 步驟 7: 等待 Render 部署
echo "⏳ 步驟 7: 等待 Render 部署..."
echo "Render 正在自動部署..."
echo ""
echo "你可以在以下位置查看部署狀態："
echo "  🔗 Render Dashboard: https://dashboard.render.com"
echo ""
echo "預計部署時間: 5-10 分鐘"
echo ""

# 步驟 8: 提供後續步驟
echo "📋 步驟 8: 部署後驗證步驟"
echo ""
echo "1. 檢查 Render 部署狀態"
echo "   訪問: https://dashboard.render.com"
echo ""
echo "2. 驗證健康檢查"
echo "   curl https://your-api.onrender.com/health"
echo ""
echo "3. 測試食物識別"
echo "   訪問: https://your-api.onrender.com/test-vision-api"
echo "   上傳測試圖片驗證改進效果"
echo ""
echo "4. 查看部署日誌"
echo "   在 Render Dashboard 中查看 Logs 標籤"
echo ""
echo "5. 監控 API 性能"
echo "   觀察識別準確度和用戶反饋"
echo ""

# 完成
echo -e "${GREEN}🎉 部署腳本執行完成！${NC}"
echo ""
echo "📚 相關文檔："
echo "  - DEPLOY_PROMPT_INTEGRATION_TO_RENDER.md - 詳細部署指南"
echo "  - INTEGRATION_COMPLETE.md - 整合完成報告"
echo "  - PROMPT_INTEGRATION_GUIDE.md - 整合指南"
echo ""
echo "✨ 預期改進："
echo "  ✅ 計數準確性提升（避免數量錯誤）"
echo "  ✅ 減少遺漏（強制檢查清單）"
echo "  ✅ 更準確的份量估算"
echo "  ✅ 支援台灣原住民料理"
echo ""
echo "🔔 記得："
echo "  - 監控部署狀態"
echo "  - 測試功能是否正常"
echo "  - 收集用戶反饋"
echo "  - 記錄改進效果"
echo ""
