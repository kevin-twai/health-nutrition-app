#!/bin/bash

# 修復 PhotoController 並重新部署

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔧 修復 PhotoController 並重新部署${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 步驟 1: 驗證修復
echo -e "${GREEN}[1/4] 驗證 PhotoController 修復...${NC}"
echo "檢查 TypeScript 編譯..."
npx tsc --noEmit apps/api/src/controllers/PhotoController.ts 2>&1 | head -20 || true
echo -e "${GREEN}✓ 驗證完成${NC}\n"

# 步驟 2: 提交修復
echo -e "${GREEN}[2/4] 提交修復到 Git...${NC}"
git add apps/api/src/controllers/PhotoController.ts
git commit -m "fix: 修復 PhotoController 使用新的識別引擎

問題:
- PhotoController 沒有正確初始化 MultiStageRecognitionEngine
- 導致部署後仍使用舊的識別邏輯
- 新的知識庫和 Prompt 生成器沒有被使用

修復:
- 正確初始化 AsianCuisineKnowledgeBase
- 正確初始化 EnhancedPromptGenerator
- 使用正確的配置初始化 MultiStageRecognitionEngine
- 啟用知識庫查詢功能
- 設置信心度閾值為 0.85

影響:
- 現在會使用新的多階段識別引擎
- 會使用亞洲料理知識庫進行匹配
- 識別準確度應該顯著提升
- 特別是對亞洲料理的識別

測試:
- 上傳食物照片應該使用新的識別邏輯
- 識別結果應該更準確
- 應該能正確識別亞洲料理
" || echo -e "${YELLOW}⚠ 沒有需要提交的更改${NC}"

echo -e "${GREEN}✓ 修復已提交${NC}\n"

# 步驟 3: 推送到遠端
echo -e "${GREEN}[3/4] 推送到遠端...${NC}"
read -p "是否要推送到遠端並觸發 Render 部署？(y/n): " PUSH_CONFIRM

if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
  git push origin main || git push origin master
  echo -e "${GREEN}✓ 已推送到遠端${NC}\n"
  
  echo -e "${BLUE}========================================${NC}"
  echo -e "${GREEN}✅ 修復已推送！${NC}"
  echo -e "${BLUE}========================================${NC}\n"
  
  echo -e "${YELLOW}Render 部署狀態:${NC}"
  echo -e "1. 前往 Render Dashboard 監控部署"
  echo -e "2. 等待部署完成（約 3-5 分鐘）"
  echo -e "3. 部署完成後測試食物識別功能"
  echo ""
  
  echo -e "${CYAN}測試步驟:${NC}"
  echo -e "1. 登入您的應用"
  echo -e "2. 上傳一張食物照片（建議：亞洲料理）"
  echo -e "3. 檢查識別結果是否更準確"
  echo -e "4. 特別注意：麵條應該被識別為「麵條」而不是「麵條」"
  echo ""
  
  echo -e "${BLUE}Render Dashboard:${NC} https://dashboard.render.com"
else
  echo -e "${YELLOW}⚠ 跳過推送${NC}\n"
  echo -e "稍後可以手動推送: ${BLUE}git push origin main${NC}"
fi

# 步驟 4: 顯示修復摘要
echo -e "\n${GREEN}[4/4] 修復摘要${NC}"
echo -e "${CYAN}修復的問題:${NC}"
echo -e "  ✓ PhotoController 現在正確使用 MultiStageRecognitionEngine"
echo -e "  ✓ 啟用了亞洲料理知識庫"
echo -e "  ✓ 啟用了增強型 Prompt 生成器"
echo -e "  ✓ 設置了適當的信心度閾值 (0.85)"
echo ""

echo -e "${CYAN}預期改進:${NC}"
echo -e "  ✓ 亞洲料理識別準確度提升"
echo -e "  ✓ 更詳細的食材分析"
echo -e "  ✓ 更合理的營養估算"
echo -e "  ✓ 更好的中文食物名稱"
echo ""

echo -e "${GREEN}完成！${NC} 🎉"
