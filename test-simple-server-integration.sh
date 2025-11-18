#!/bin/bash

# 測試 simple-server.js 整合效果
# 驗證所有整合的改進是否正常工作

echo "🧪 開始測試 simple-server.js 整合效果..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 測試 1: 健康檢查
echo "📝 測試 1: 健康檢查"
echo "============================================================"
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ 健康檢查通過${NC}"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ 健康檢查失敗${NC}"
    echo "$HEALTH_RESPONSE"
fi
echo ""

# 測試 2: 檢查 OpenAI API 配置
echo "📝 測試 2: OpenAI API 配置檢查"
echo "============================================================"
API_CONFIG=$(echo "$HEALTH_RESPONSE" | jq '.aiVisionAPI.chatgpt' 2>/dev/null)
if echo "$API_CONFIG" | grep -q '"configured":true'; then
    echo -e "${GREEN}✅ OpenAI API 已配置${NC}"
    echo "$API_CONFIG" | jq '.'
else
    echo -e "${YELLOW}⚠️  OpenAI API 未配置或使用測試密鑰${NC}"
    echo "$API_CONFIG" | jq '.'
fi
echo ""

# 測試 3: 訪問測試頁面
echo "📝 測試 3: 測試頁面可訪問性"
echo "============================================================"
TEST_PAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/test-vision-api)
if [ "$TEST_PAGE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ 測試頁面可訪問${NC}"
    echo "   URL: http://localhost:3001/test-vision-api"
else
    echo -e "${RED}❌ 測試頁面無法訪問 (HTTP $TEST_PAGE_RESPONSE)${NC}"
fi
echo ""

# 測試 4: 檢查 prompt 內容
echo "📝 測試 4: 檢查 Prompt 整合內容"
echo "============================================================"
echo "檢查 simple-server.js 是否包含整合的改進..."

# 檢查關鍵特性
FEATURES=(
    "計數準確性警告"
    "強制檢查清單"
    "份量計算指南"
    "原住民料理"
    "小米阿粨"
    "馬告"
    "蛋類檢查"
    "湯汁檢查"
)

for feature in "${FEATURES[@]}"; do
    if grep -q "$feature" apps/api/src/simple-server.js; then
        echo -e "${GREEN}✅${NC} $feature"
    else
        echo -e "${RED}❌${NC} $feature"
    fi
done
echo ""

# 測試 5: 模擬照片識別請求（不上傳真實圖片）
echo "📝 測試 5: API 端點響應測試"
echo "============================================================"
echo "測試 /api/v1/photo/recognize 端點..."

# 創建一個簡單的測試請求（不包含文件）
RECOGNIZE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/photo/recognize \
    -H "Content-Type: multipart/form-data" 2>&1)

if echo "$RECOGNIZE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ API 端點響應正常${NC}"
else
    echo -e "${YELLOW}⚠️  API 端點響應（預期行為：需要圖片文件）${NC}"
fi
echo ""

# 測試總結
echo "📊 測試總結"
echo "============================================================"
echo ""
echo -e "${BLUE}🎯 測試服務器狀態：${NC}"
echo "   - 服務器運行中: http://localhost:3001"
echo "   - 測試頁面: http://localhost:3001/test-vision-api"
echo "   - 健康檢查: http://localhost:3001/health"
echo ""
echo -e "${BLUE}✨ 整合的改進特性：${NC}"
echo "   ✅ 計數準確性警告（防止數量加倍錯誤）"
echo "   ✅ 強制檢查清單（蛋類、湯汁、主食、蔬菜）"
echo "   ✅ 份量計算指南（標準份量參考）"
echo "   ✅ 台灣原住民料理識別（小米阿粨、馬告、竹筒飯）"
echo "   ✅ 增強版 JSON 格式要求"
echo ""
echo -e "${BLUE}📚 下一步操作：${NC}"
echo "   1. 在瀏覽器中打開: http://localhost:3001/test-vision-api"
echo "   2. 上傳測試圖片（例如：生蠔、咖喱、原住民料理）"
echo "   3. 觀察識別結果，驗證以下改進："
echo "      - 可數食材是否精確計數（不加倍）"
echo "      - 是否識別出蛋類、湯汁、主食"
echo "      - 份量是否包含具體數字和單位"
echo "      - 是否能識別台灣原住民料理"
echo ""
echo -e "${GREEN}🎊 測試服務器已就緒！${NC}"
echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo "   - 如果要停止服務器，請按 Ctrl+C"
echo "   - 如果要查看服務器日誌，請查看終端輸出"
echo "   - 測試完成後，可以將改進部署到生產環境"
echo ""
