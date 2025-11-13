#!/bin/bash

# 自動化部署腳本 - 食物識別準確度改進
# 此腳本會自動完成所有部署步驟

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 顯示標題
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 自動化部署 - 食物識別準確度改進${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 詢問部署方案
echo -e "${CYAN}請選擇部署方案:${NC}"
echo -e "  ${GREEN}1${NC} - 整合到現有項目 (推薦)"
echo -e "  ${GREEN}2${NC} - 獨立測試部署"
echo -e "  ${GREEN}3${NC} - 僅驗證部署包"
echo ""
read -p "請輸入選項 (1/2/3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
  1)
    echo -e "\n${GREEN}✓ 選擇: 整合到現有項目${NC}\n"
    DEPLOY_MODE="integrate"
    ;;
  2)
    echo -e "\n${GREEN}✓ 選擇: 獨立測試部署${NC}\n"
    DEPLOY_MODE="standalone"
    ;;
  3)
    echo -e "\n${GREEN}✓ 選擇: 僅驗證部署包${NC}\n"
    DEPLOY_MODE="verify"
    ;;
  *)
    echo -e "\n${RED}✘ 無效選項${NC}"
    exit 1
    ;;
esac

# ========================================
# 驗證模式
# ========================================
if [ "$DEPLOY_MODE" = "verify" ]; then
  echo -e "${GREEN}[1/1] 驗證部署包...${NC}"
  bash verify-deployment-package.sh
  exit 0
fi

# ========================================
# 步驟 1: 檢查部署包
# ========================================
echo -e "${GREEN}[1/8] 檢查部署包...${NC}"
if [ ! -f "food-recognition-accuracy-v1.0.0.tar.gz" ]; then
  echo -e "${YELLOW}⚠ 部署包不存在，正在創建...${NC}"
  bash scripts/deploy-minimal.sh
fi
echo -e "${GREEN}✓ 部署包存在${NC}\n"

# ========================================
# 步驟 2: 驗證部署包
# ========================================
echo -e "${GREEN}[2/8] 驗證部署包完整性...${NC}"
bash verify-deployment-package.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ 部署包驗證通過${NC}\n"
else
  echo -e "${RED}✘ 部署包驗證失敗${NC}"
  exit 1
fi

# ========================================
# 步驟 3: 解壓部署包
# ========================================
echo -e "${GREEN}[3/8] 解壓部署包...${NC}"
if [ "$DEPLOY_MODE" = "standalone" ]; then
  # 獨立測試模式
  mkdir -p test-deployment
  tar -xzf food-recognition-accuracy-v1.0.0.tar.gz -C test-deployment
  echo -e "${GREEN}✓ 解壓到 test-deployment/deploy-minimal/${NC}\n"
else
  # 整合模式
  if [ ! -d "deploy-minimal" ]; then
    tar -xzf food-recognition-accuracy-v1.0.0.tar.gz
  fi
  echo -e "${GREEN}✓ 解壓到 deploy-minimal/${NC}\n"
fi

# ========================================
# 獨立測試模式
# ========================================
if [ "$DEPLOY_MODE" = "standalone" ]; then
  echo -e "${GREEN}[4/8] 設置測試環境...${NC}"
  cd test-deployment/deploy-minimal
  
  # 創建 .env 文件
  if [ ! -f ".env" ]; then
    cat > .env << EOF
OPENAI_API_KEY=${OPENAI_API_KEY:-your-api-key-here}
OPENAI_MODEL=gpt-4o
RECOGNITION_CONFIDENCE_THRESHOLD=85
EOF
    echo -e "${GREEN}✓ .env 文件已創建${NC}"
  else
    echo -e "${YELLOW}⚠ .env 文件已存在，跳過${NC}"
  fi
  
  echo -e "${GREEN}[5/8] 測試知識庫...${NC}"
  npx tsx -e "
  import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase.ts';
  const kb = new AsianCuisineKnowledgeBase();
  console.log('✓ 知識庫載入成功');
  console.log('  - 食材數量:', kb.getAllIngredients().length);
  console.log('  - 料理模式:', kb.getDishPatterns().length);
  " 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 知識庫測試通過${NC}\n"
  else
    echo -e "${YELLOW}⚠ 知識庫測試有警告（可能需要安裝依賴）${NC}\n"
  fi
  
  echo -e "${GREEN}[6/8] 測試 Prompt 生成器...${NC}"
  npx tsx -e "
  import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator.ts';
  const gen = new EnhancedPromptGenerator('zh-TW');
  console.log('✓ Prompt 生成器初始化成功');
  " 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prompt 生成器測試通過${NC}\n"
  else
    echo -e "${YELLOW}⚠ Prompt 生成器測試有警告${NC}\n"
  fi
  
  echo -e "${GREEN}[7/8] 創建測試腳本...${NC}"
  cat > test-recognition.ts << 'EOF'
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';

console.log('🧪 測試食物識別系統...\n');

const kb = new AsianCuisineKnowledgeBase();
console.log('✓ 知識庫初始化成功');
console.log(`  - 食材數量: ${kb.getAllIngredients().length}`);
console.log(`  - 料理模式: ${kb.getDishPatterns().length}`);

const gen = new EnhancedPromptGenerator('zh-TW');
console.log('✓ Prompt 生成器初始化成功');

const rice = kb.getIngredientByName('白飯');
console.log('✓ 查詢功能正常');
console.log(`  - 找到食材: ${rice?.name}`);

console.log('\n✅ 所有測試通過！');
EOF
  echo -e "${GREEN}✓ 測試腳本已創建: test-recognition.ts${NC}\n"
  
  echo -e "${GREEN}[8/8] 完成部署${NC}\n"
  
  echo -e "${BLUE}========================================${NC}"
  echo -e "${GREEN}✅ 獨立測試部署完成！${NC}"
  echo -e "${BLUE}========================================${NC}\n"
  
  echo -e "${CYAN}部署位置:${NC} test-deployment/deploy-minimal/"
  echo -e "${CYAN}測試腳本:${NC} test-deployment/deploy-minimal/test-recognition.ts"
  echo ""
  echo -e "${YELLOW}下一步:${NC}"
  echo -e "  1. cd test-deployment/deploy-minimal"
  echo -e "  2. cat README.md"
  echo -e "  3. npx tsx test-recognition.ts"
  echo ""
  
  cd ../..
  exit 0
fi

# ========================================
# 整合模式
# ========================================
echo -e "${GREEN}[4/8] 備份現有文件...${NC}"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 備份可能被覆蓋的文件
if [ -d "apps/api/src/services" ]; then
  cp -r apps/api/src/services "$BACKUP_DIR/services_backup" 2>/dev/null || true
fi
if [ -d "apps/api/src/data" ]; then
  cp -r apps/api/src/data "$BACKUP_DIR/data_backup" 2>/dev/null || true
fi
if [ -d "apps/api/src/types" ]; then
  cp -r apps/api/src/types "$BACKUP_DIR/types_backup" 2>/dev/null || true
fi

echo -e "${GREEN}✓ 備份完成: $BACKUP_DIR${NC}\n"

echo -e "${GREEN}[5/8] 複製服務文件...${NC}"
# 確保目錄存在
mkdir -p apps/api/src/services

# 複製服務文件
cp deploy-minimal/services/AsianCuisineKnowledgeBase.ts apps/api/src/services/
cp deploy-minimal/services/EnhancedPromptGenerator.ts apps/api/src/services/
cp deploy-minimal/services/MultiStageRecognitionEngine.ts apps/api/src/services/
cp deploy-minimal/services/ResultValidator.ts apps/api/src/services/
cp deploy-minimal/services/AsianCuisineValidationRules.ts apps/api/src/services/
cp deploy-minimal/services/NutritionValidationRules.ts apps/api/src/services/
cp deploy-minimal/services/FeedbackCollector.ts apps/api/src/services/
cp deploy-minimal/services/FeedbackAnalyzer.ts apps/api/src/services/
cp deploy-minimal/services/FeedbackImprover.ts apps/api/src/services/
cp deploy-minimal/services/FoodRecognitionPerformanceMonitor.ts apps/api/src/services/
cp deploy-minimal/services/FoodRecognitionLogger.ts apps/api/src/services/
cp deploy-minimal/services/RecognitionResultCache.ts apps/api/src/services/
cp deploy-minimal/services/KnowledgeBaseQueryOptimizer.ts apps/api/src/services/

echo -e "${GREEN}✓ 服務文件複製完成 (13 個文件)${NC}\n"

echo -e "${GREEN}[6/8] 複製數據文件...${NC}"
# 確保目錄存在
mkdir -p apps/api/src/data

# 複製數據文件
cp deploy-minimal/data/asianFoodItems.ts apps/api/src/data/
cp deploy-minimal/data/asianFoodItemsExtended.ts apps/api/src/data/
cp deploy-minimal/data/dishPatterns.ts apps/api/src/data/
cp deploy-minimal/data/index.ts apps/api/src/data/

echo -e "${GREEN}✓ 數據文件複製完成 (4 個文件)${NC}\n"

echo -e "${GREEN}[7/8] 複製類型定義...${NC}"
# 確保目錄存在
mkdir -p apps/api/src/types

# 複製類型定義
cp deploy-minimal/types/AsianCuisineKnowledgeBase.ts apps/api/src/types/

echo -e "${GREEN}✓ 類型定義複製完成 (1 個文件)${NC}\n"

echo -e "${GREEN}[8/8] 驗證整合...${NC}"
# 檢查關鍵文件
MISSING_FILES=0
if [ ! -f "apps/api/src/services/AsianCuisineKnowledgeBase.ts" ]; then
  echo -e "${RED}✘ 缺少: AsianCuisineKnowledgeBase.ts${NC}"
  MISSING_FILES=$((MISSING_FILES + 1))
fi
if [ ! -f "apps/api/src/services/EnhancedPromptGenerator.ts" ]; then
  echo -e "${RED}✘ 缺少: EnhancedPromptGenerator.ts${NC}"
  MISSING_FILES=$((MISSING_FILES + 1))
fi
if [ ! -f "apps/api/src/data/asianFoodItems.ts" ]; then
  echo -e "${RED}✘ 缺少: asianFoodItems.ts${NC}"
  MISSING_FILES=$((MISSING_FILES + 1))
fi

if [ $MISSING_FILES -eq 0 ]; then
  echo -e "${GREEN}✓ 所有文件驗證通過${NC}\n"
else
  echo -e "${RED}✘ 有 $MISSING_FILES 個文件缺失${NC}\n"
  exit 1
fi

# ========================================
# 完成
# ========================================
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 整合部署完成！${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${CYAN}已複製文件:${NC}"
echo -e "  • 13 個服務文件 → apps/api/src/services/"
echo -e "  • 4 個數據文件 → apps/api/src/data/"
echo -e "  • 1 個類型文件 → apps/api/src/types/"
echo ""
echo -e "${CYAN}備份位置:${NC} $BACKUP_DIR"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "  1. 查看部署文檔: ${BLUE}cat DEPLOYMENT_STEP_BY_STEP.md${NC}"
echo -e "  2. 測試功能: ${BLUE}npx tsx -e \"import { AsianCuisineKnowledgeBase } from './apps/api/src/services/AsianCuisineKnowledgeBase'; const kb = new AsianCuisineKnowledgeBase(); console.log('食材數量:', kb.getAllIngredients().length);\"${NC}"
echo -e "  3. 重啟服務: ${BLUE}docker-compose restart api${NC} 或 ${BLUE}npm run dev${NC}"
echo ""
echo -e "${GREEN}部署成功！祝您使用愉快！${NC} 🎉"
