#!/bin/bash

# 測試 Prompt 準確度改進
# Test Prompt Accuracy Improvements

echo "🧪 測試 Prompt 準確度改進..."
echo "🧪 Testing Prompt Accuracy Improvements..."
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URL
API_URL="https://health-nutrition-api.onrender.com"

echo "📍 API URL: $API_URL"
echo ""

# 1. 測試 API 健康狀態
echo "1️⃣ 測試 API 健康狀態..."
echo "1️⃣ Testing API Health..."

HEALTH_RESPONSE=$(curl -s "$API_URL/health")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API 健康檢查通過${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ API 健康檢查失敗${NC}"
    exit 1
fi

echo ""

# 2. 檢查 Render 部署狀態
echo "2️⃣ 檢查 Render 部署狀態..."
echo "2️⃣ Checking Render Deployment Status..."
echo ""
echo -e "${YELLOW}請訪問 Render Dashboard 查看部署狀態：${NC}"
echo "https://dashboard.render.com"
echo ""
echo "等待部署完成後，請繼續測試..."
echo ""

# 3. 提供測試指導
echo "3️⃣ 測試指導..."
echo "3️⃣ Testing Guide..."
echo ""

echo "📋 火鍋識別測試："
echo "   1. 訪問前端: https://health-nutrition-web.onrender.com/photo"
echo "   2. 上傳日式火鍋照片"
echo "   3. 驗證識別結果："
echo "      - 料理類型: 應為「日式火鍋」或「日式涮涮鍋」"
echo "      - 食材列表: 應包含肉片、豆腐、蔬菜、菇類等"
echo "      - 豆腐識別: 不應誤認為「豆腐干絲」"
echo "      - 整體描述: 不應誤認為炒菜"
echo ""

echo "📋 豆製品識別測試："
echo "   1. 上傳包含豆腐的料理照片"
echo "   2. 驗證識別結果："
echo "      - 豆腐類型: 應準確識別（豆腐、油豆腐、凍豆腐等）"
echo "      - 不應誤認為其他豆製品"
echo "      - 份量估算應合理"
echo ""

echo "📋 亞洲料理識別測試："
echo "   1. 上傳各種亞洲料理照片"
echo "   2. 驗證識別結果："
echo "      - 料理類型應準確"
echo "      - 食材識別應完整"
echo "      - 名稱使用應正確"
echo ""

# 4. 提供測試 API 的 curl 命令範例
echo "4️⃣ API 測試命令範例..."
echo "4️⃣ API Test Command Examples..."
echo ""

echo "# 測試照片識別 API（需要先準備圖片）"
echo "curl -X POST $API_URL/api/photo/recognize \\"
echo "  -H 'Content-Type: multipart/form-data' \\"
echo "  -F 'image=@/path/to/hotpot-image.jpg'"
echo ""

# 5. 監控建議
echo "5️⃣ 監控建議..."
echo "5️⃣ Monitoring Recommendations..."
echo ""

echo "📊 建議監控以下指標："
echo "   - 識別準確度（火鍋料理）"
echo "   - 豆製品誤識別率"
echo "   - 整體用戶滿意度"
echo "   - API 響應時間"
echo ""

# 6. 部署驗證清單
echo "6️⃣ 部署驗證清單..."
echo "6️⃣ Deployment Verification Checklist..."
echo ""

echo "✅ 檢查清單："
echo "   [ ] Render 部署狀態為 'Live'"
echo "   [ ] API 健康檢查通過"
echo "   [ ] 前端可以正常訪問"
echo "   [ ] 照片上傳功能正常"
echo "   [ ] 火鍋識別準確"
echo "   [ ] 豆製品識別準確"
echo "   [ ] 沒有誤識別為炒菜"
echo ""

echo "🎉 測試腳本執行完成！"
echo "🎉 Test Script Completed!"
echo ""
echo "📝 請根據上述指導進行手動測試，並記錄結果。"
echo "📝 Please conduct manual testing according to the above guide and record results."
