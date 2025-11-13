#!/bin/bash

# 驗證部署包完整性腳本

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}驗證部署包完整性${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 檢查部署包是否存在
echo -e "${GREEN}[1/5] 檢查部署包...${NC}"
if [ ! -f "food-recognition-accuracy-v1.0.0.tar.gz" ]; then
    echo -e "${RED}✘ 部署包不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 部署包存在 ($(ls -lh food-recognition-accuracy-v1.0.0.tar.gz | awk '{print $5}'))${NC}\n"

# 檢查部署目錄
echo -e "${GREEN}[2/5] 檢查部署目錄...${NC}"
if [ ! -d "deploy-minimal" ]; then
    echo -e "${RED}✘ 部署目錄不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 部署目錄存在 ($(du -sh deploy-minimal | awk '{print $1}'))${NC}\n"

# 檢查核心文件
echo -e "${GREEN}[3/5] 檢查核心文件...${NC}"

# 檢查服務文件
SERVICE_COUNT=$(find deploy-minimal/services -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$SERVICE_COUNT" -lt 13 ]; then
    echo -e "${RED}✘ 服務文件不完整 (找到 $SERVICE_COUNT 個，預期 13 個)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 服務文件完整 ($SERVICE_COUNT 個)${NC}"

# 檢查數據文件
DATA_COUNT=$(find deploy-minimal/data -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$DATA_COUNT" -lt 4 ]; then
    echo -e "${RED}✘ 數據文件不完整 (找到 $DATA_COUNT 個，預期 4 個)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 數據文件完整 ($DATA_COUNT 個)${NC}"

# 檢查文檔文件
DOC_COUNT=$(find deploy-minimal/docs -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
if [ "$DOC_COUNT" -lt 8 ]; then
    echo -e "${YELLOW}⚠ 文檔文件可能不完整 (找到 $DOC_COUNT 個)${NC}"
else
    echo -e "${GREEN}✓ 文檔文件完整 ($DOC_COUNT 個)${NC}"
fi

echo ""

# 檢查關鍵文件
echo -e "${GREEN}[4/5] 檢查關鍵文件...${NC}"

CRITICAL_FILES=(
    "deploy-minimal/QUICK_START.md"
    "deploy-minimal/DEPLOYMENT_MANIFEST.md"
    "deploy-minimal/services/AsianCuisineKnowledgeBase.ts"
    "deploy-minimal/services/EnhancedPromptGenerator.ts"
    "deploy-minimal/services/MultiStageRecognitionEngine.ts"
    "deploy-minimal/services/ResultValidator.ts"
    "deploy-minimal/data/asianFoodItems.ts"
    "deploy-minimal/data/dishPatterns.ts"
)

MISSING_FILES=0
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✘ 缺少關鍵文件: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✓ 所有關鍵文件都存在${NC}\n"
else
    echo -e "${RED}✘ 缺少 $MISSING_FILES 個關鍵文件${NC}\n"
    exit 1
fi

# 統計資訊
echo -e "${GREEN}[5/5] 生成統計資訊...${NC}"

TOTAL_FILES=$(find deploy-minimal -type f | wc -l | tr -d ' ')
TOTAL_TS_FILES=$(find deploy-minimal -name "*.ts" | wc -l | tr -d ' ')
TOTAL_MD_FILES=$(find deploy-minimal -name "*.md" | wc -l | tr -d ' ')

echo -e "${BLUE}統計資訊:${NC}"
echo -e "  總文件數: $TOTAL_FILES"
echo -e "  TypeScript 文件: $TOTAL_TS_FILES"
echo -e "  Markdown 文件: $TOTAL_MD_FILES"
echo -e "  服務文件: $SERVICE_COUNT"
echo -e "  數據文件: $DATA_COUNT"
echo -e "  文檔文件: $DOC_COUNT"
echo ""

# 顯示目錄結構
echo -e "${BLUE}目錄結構:${NC}"
tree -L 2 deploy-minimal 2>/dev/null || find deploy-minimal -maxdepth 2 -type d | sed 's|[^/]*/| |g'
echo ""

# 最終結果
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ 部署包驗證通過！${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}下一步:${NC}"
echo -e "1. 查看快速開始指南: ${BLUE}cat deploy-minimal/QUICK_START.md${NC}"
echo -e "2. 查看部署清單: ${BLUE}cat deploy-minimal/DEPLOYMENT_MANIFEST.md${NC}"
echo -e "3. 開始整合到您的項目中"
echo ""

echo -e "${GREEN}部署包已準備就緒！${NC} 🎉"
