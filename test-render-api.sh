#!/bin/bash

# 測試 Render 部署的 API

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 設置 API URL
if [ -z "$API_URL" ]; then
  echo -e "${YELLOW}請設置 API_URL 環境變數${NC}"
  read -p "請輸入您的 Render API URL (例如: https://your-app.onrender.com): " API_URL
  export API_URL
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 測試 Render 部署${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "${CYAN}API URL:${NC} $API_URL\n"

# 測試 1: 健康檢查
echo -e "${GREEN}[1/5] 測試健康檢查...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 健康檢查通過${NC}"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
else
  echo -e "${RED}✘ 健康檢查失敗 (HTTP $HTTP_CODE)${NC}"
  echo "$RESPONSE_BODY"
fi
echo ""

# 測試 2: API 根路徑
echo -e "${GREEN}[2/5] 測試 API 根路徑...${NC}"
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api" 2>/dev/null)
HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ROOT_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✓ API 可訪問 (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${YELLOW}⚠ API 響應異常 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 測試 3: 監控端點（如果存在）
echo -e "${GREEN}[3/5] 測試監控端點...${NC}"
METRICS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/monitoring/metrics" 2>/dev/null)
HTTP_CODE=$(echo "$METRICS_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 監控端點可用${NC}"
  echo "$METRICS_RESPONSE" | head -n-1 | jq . 2>/dev/null || echo "監控數據已返回"
elif [ "$HTTP_CODE" = "404" ]; then
  echo -e "${YELLOW}⚠ 監控端點未啟用 (這是正常的)${NC}"
else
  echo -e "${YELLOW}⚠ 監控端點響應異常 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 測試 4: 食物識別端點（需要認證）
echo -e "${GREEN}[4/5] 測試食物識別端點...${NC}"
echo -e "${YELLOW}注意: 此測試需要認證 token，可能會失敗${NC}"

# 嘗試訪問照片識別端點
PHOTO_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/photo/recognize" 2>/dev/null)
HTTP_CODE=$(echo "$PHOTO_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✓ 食物識別端點存在（需要認證）${NC}"
elif [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ 食物識別端點可訪問${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
  echo -e "${YELLOW}⚠ 食物識別端點未找到${NC}"
else
  echo -e "${YELLOW}⚠ 食物識別端點響應異常 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 測試 5: 響應時間
echo -e "${GREEN}[5/5] 測試響應時間...${NC}"
START_TIME=$(date +%s%N)
curl -s "$API_URL/health" > /dev/null 2>&1
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 1000 ]; then
  echo -e "${GREEN}✓ 響應時間良好: ${RESPONSE_TIME}ms${NC}"
elif [ $RESPONSE_TIME -lt 3000 ]; then
  echo -e "${YELLOW}⚠ 響應時間一般: ${RESPONSE_TIME}ms${NC}"
else
  echo -e "${RED}✘ 響應時間過長: ${RESPONSE_TIME}ms${NC}"
fi
echo ""

# 總結
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 測試總結${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${CYAN}API URL:${NC} $API_URL"
echo -e "${CYAN}測試時間:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo -e "${YELLOW}下一步:${NC}"
echo -e "1. 使用 Web 界面測試食物識別功能"
echo -e "2. 上傳測試圖片驗證準確度"
echo -e "3. 檢查 Render Dashboard 的日誌"
echo -e "4. 監控性能指標"
echo ""

echo -e "${CYAN}詳細測試指南:${NC}"
echo -e "  • 查看部署指南: ${BLUE}cat RENDER_DEPLOYMENT_GUIDE.md${NC}"
echo -e "  • 查看用戶指南: ${BLUE}cat deploy-minimal/docs/USER_GUIDE.md${NC}"
echo ""

echo -e "${GREEN}測試完成！${NC} 🎉"
