#!/bin/bash

# 每週審查腳本
# 自動生成每週改進報告

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}每週改進審查${NC}"
echo -e "${BLUE}日期: $(date +%Y-%m-%d)${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 1. 運行準確度測試
echo -e "${GREEN}[1/6] 運行準確度測試...${NC}"
npm run test:accuracy:weekly

# 2. 分析用戶反饋
echo -e "\n${GREEN}[2/6] 分析用戶反饋...${NC}"
npm run feedback:analyze -- --since="7 days ago"

# 3. 審查知識庫
echo -e "\n${GREEN}[3/6] 審查知識庫...${NC}"
npm run kb:review -- --week=current

# 4. 審查 Prompt 效果
echo -e "\n${GREEN}[4/6] 審查 Prompt 效果...${NC}"
npm run prompt:stats -- --week=current

# 5. 檢查性能指標
echo -e "\n${GREEN}[5/6] 檢查性能指標...${NC}"
npm run monitor:weekly-summary

# 6. 生成週報
echo -e "\n${GREEN}[6/6] 生成週報...${NC}"
REPORT_FILE="reports/weekly/report-$(date +%Y%m%d).md"
npm run report:weekly -- --output="$REPORT_FILE"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ 每週審查完成！${NC}"
echo -e "${BLUE}報告已生成: $REPORT_FILE${NC}"
echo -e "${BLUE}========================================${NC}"

# 發送報告（可選）
if [ "$SEND_REPORT" = "true" ]; then
    echo -e "\n${YELLOW}發送報告...${NC}"
    npm run report:send -- --file="$REPORT_FILE" --to="team@nutrition-app.com"
fi
