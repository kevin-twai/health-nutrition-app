#!/bin/bash

# 測試 Render 上的 Prompt 整合
# 驗證部署後的功能是否正常

set -e

echo "🧪 測試 Render 上的 Prompt 整合..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
API_URL="${RENDER_API_URL:-https://your-api.onrender.com}"

echo -e "${BLUE}📍 API URL: $API_URL${NC}"
echo ""

# 測試 1: 健康檢查
echo "📝 測試 1: 健康檢查"
echo "=" | head -c 60
echo ""

HEALTH_RESPONSE=$(curl -s "$API_URL/health")
STATUS=$(echo $HEALTH_RESPONSE | jq -r '.status' 2>/dev/null || echo "error")

if [ "$STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ 服務健康${NC}"
    
    # 檢查 OpenAI API 配置
    OPENAI_CONFIGURED=$(echo $HEALTH_RESPONSE | jq -r '.aiVisionAPI.chatgpt.configured' 2>/dev/null || echo "false")
    if [ "$OPENAI_CONFIGURED" = "true" ]; then
        echo -e "${GREEN}✅ OpenAI API 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  OpenAI API 未配置${NC}"
    fi
else
    echo -e "${RED}❌ 服務不健康${NC}"
    echo "回應: $HEALTH_RESPONSE"
fi
echo ""

# 測試 2: API 版本檢查
echo "📝 測試 2: API 版本檢查"
echo "=" | head -c 60
echo ""

VERSION_RESPONSE=$(curl -s "$API_URL/api/v1")
VERSION=$(echo $VERSION_RESPONSE | jq -r '.version' 2>/dev/null || echo "unknown")

if [ "$VERSION" != "unknown" ]; then
    echo -e "${GREEN}✅ API 版本: $VERSION${NC}"
else
    echo -e "${RED}❌ 無法獲取 API 版本${NC}"
fi
echo ""

# 測試 3: 測試頁面可訪問性
echo "📝 測試 3: 測試頁面可訪問性"
echo "=" | head -c 60
echo ""

TEST_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/test-vision-api")

if [ "$TEST_PAGE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 測試頁面可訪問${NC}"
    echo "   URL: $API_URL/test-vision-api"
else
    echo -e "${RED}❌ 測試頁面不可訪問 (HTTP $TEST_PAGE_STATUS)${NC}"
fi
echo ""

# 測試 4: 檢查 Prompt 特性（通過日誌或間接方式）
echo "📝 測試 4: Prompt 整合驗證"
echo "=" | head -c 60
echo ""

echo "由於無法直接訪問 prompt 內容，請手動驗證以下特性："
echo ""
echo "請訪問測試頁面並上傳圖片："
echo -e "${BLUE}$API_URL/test-vision-api${NC}"
echo ""
echo "驗證以下改進："
echo "  1. ✅ 計數準確性"
echo "     - 可數食材（蛋、餃子、生蠔等）是否準確計數"
echo "     - 是否避免了數量加倍的錯誤"
echo ""
echo "  2. ✅ 完整性"
echo "     - 是否識別了湯汁/醬汁"
echo "     - 是否識別了主食（米飯、麵條）"
echo "     - 是否識別了蛋類"
echo "     - 是否識別了所有可見蔬菜"
echo "     - 是否識別了調味料"
echo ""
echo "  3. ✅ 份量估算"
echo "     - 份量描述是否包含具體數字和單位"
echo "     - 例如：'1碗白飯 (約180克)' 而非 '一些米飯'"
echo ""
echo "  4. ✅ 原住民料理識別（如適用）"
echo "     - 是否能識別小米阿粨、馬告、竹筒飯等"
echo ""

# 測試 5: 性能測試
echo "📝 測試 5: 響應時間測試"
echo "=" | head -c 60
echo ""

START_TIME=$(date +%s%N)
curl -s "$API_URL/health" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( ($END_TIME - $START_TIME) / 1000000 ))

echo "健康檢查響應時間: ${RESPONSE_TIME}ms"

if [ $RESPONSE_TIME -lt 1000 ]; then
    echo -e "${GREEN}✅ 響應時間良好${NC}"
elif [ $RESPONSE_TIME -lt 3000 ]; then
    echo -e "${YELLOW}⚠️  響應時間可接受${NC}"
else
    echo -e "${RED}❌ 響應時間過長${NC}"
fi
echo ""

# 測試總結
echo "📊 測試總結"
echo "=" | head -c 60
echo ""

echo "自動測試結果："
echo "  - 健康檢查: $([ "$STATUS" = "healthy" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo "  - OpenAI 配置: $([ "$OPENAI_CONFIGURED" = "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${YELLOW}⚠️${NC}")"
echo "  - API 版本: $([ "$VERSION" != "unknown" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo "  - 測試頁面: $([ "$TEST_PAGE_STATUS" = "200" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo "  - 響應時間: $([ $RESPONSE_TIME -lt 1000 ] && echo -e "${GREEN}✅${NC}" || echo -e "${YELLOW}⚠️${NC}")"
echo ""

echo "手動測試項目："
echo "  - 計數準確性: 待驗證"
echo "  - 完整性檢查: 待驗證"
echo "  - 份量估算: 待驗證"
echo "  - 原住民料理: 待驗證"
echo ""

echo "下一步："
echo "  1. 訪問測試頁面進行手動測試"
echo "  2. 上傳多種類型的食物圖片"
echo "  3. 驗證識別結果的改進"
echo "  4. 收集用戶反饋"
echo "  5. 監控錯誤日誌"
echo ""

echo -e "${GREEN}🎉 自動測試完成！${NC}"
echo ""
echo "📚 相關資源："
echo "  - 測試頁面: $API_URL/test-vision-api"
echo "  - 健康檢查: $API_URL/health"
echo "  - API 文檔: $API_URL/api/v1"
echo "  - Render Dashboard: https://dashboard.render.com"
echo ""
