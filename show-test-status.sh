#!/bin/bash

# 顯示測試狀態的腳本

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           🎉 測試服務器已就緒！                                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${BLUE}📍 訪問地址${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎯 測試頁面（推薦）:${NC} http://localhost:3001/test-vision-api"
echo -e "${GREEN}📊 健康檢查:${NC}         http://localhost:3001/health"
echo -e "${GREEN}🔗 API 根路徑:${NC}       http://localhost:3001/api/v1"
echo ""

echo -e "${BLUE}✨ 整合的改進特性${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅${NC} 計數準確性警告    - 防止數量加倍錯誤"
echo -e "${GREEN}✅${NC} 強制檢查清單      - 確保識別蛋類、湯汁、主食、蔬菜"
echo -e "${GREEN}✅${NC} 份量計算指南      - 提供標準份量參考"
echo -e "${GREEN}✅${NC} 原住民料理識別    - 支持小米阿粨、馬告、竹筒飯"
echo -e "${GREEN}✅${NC} 增強版 JSON 格式  - 確保數據格式正確"
echo ""

echo -e "${BLUE}🚀 快速開始測試${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}1.${NC} 在瀏覽器中打開: ${CYAN}http://localhost:3001/test-vision-api${NC}"
echo -e "${YELLOW}2.${NC} 點擊「選擇圖片文件」按鈕"
echo -e "${YELLOW}3.${NC} 選擇一張食物照片"
echo -e "${YELLOW}4.${NC} 點擊「開始測試 API」按鈕"
echo -e "${YELLOW}5.${NC} 查看「詳細日誌」區域的識別結果"
echo ""

echo -e "${BLUE}📸 建議測試的圖片類型${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${MAGENTA}•${NC} 生蠔圖片       → 測試計數準確性"
echo -e "${MAGENTA}•${NC} 日式咖喱飯     → 測試檢查清單（蛋類、湯汁、主食）"
echo -e "${MAGENTA}•${NC} 拉麵           → 測試湯汁識別"
echo -e "${MAGENTA}•${NC} 原住民料理     → 測試特殊食材識別"
echo -e "${MAGENTA}•${NC} 便當           → 測試完整性"
echo ""

echo -e "${BLUE}🔍 驗證重點${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${MAGENTA}計數準確性:${NC} 可數食材數量是否精確（不加倍）"
echo -e "${MAGENTA}完整性:${NC}     是否識別蛋類、湯汁、主食、蔬菜"
echo -e "${MAGENTA}份量準確性:${NC} 份量是否包含具體數字和單位"
echo -e "${MAGENTA}特殊食材:${NC}   是否能識別台灣原住民料理"
echo ""

echo -e "${BLUE}⚠️  當前狀態${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# 檢查服務器狀態
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服務器運行中${NC}"
else
    echo -e "${RED}❌ 服務器未運行${NC}"
fi

# 檢查 OpenAI API 配置
API_STATUS=$(curl -s http://localhost:3001/health | jq -r '.aiVisionAPI.chatgpt.configured' 2>/dev/null)
if [ "$API_STATUS" = "true" ]; then
    echo -e "${GREEN}✅ OpenAI API 已配置${NC}"
else
    echo -e "${YELLOW}⚠️  OpenAI API 未配置（使用模擬模式）${NC}"
fi
echo ""

echo -e "${BLUE}📚 相關文檔${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${MAGENTA}•${NC} TEST_READY_REPORT.md              - 測試就緒報告"
echo -e "${MAGENTA}•${NC} SIMPLE_SERVER_TEST_GUIDE.md       - 完整測試指南"
echo -e "${MAGENTA}•${NC} QUICK_TEST_SUMMARY.md             - 快速測試摘要"
echo ""

echo -e "${BLUE}🎯 測試完成後${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}如果效果良好:${NC}"
echo "  1. 運行 TypeScript 整合測試"
echo "     ${CYAN}node test-typescript-prompt-integration.js${NC}"
echo ""
echo "  2. 部署到生產環境"
echo "     ${CYAN}./deploy-typescript-prompt-integration.sh${NC}"
echo ""
echo -e "${YELLOW}如果發現問題:${NC}"
echo "  1. 記錄具體問題和測試案例"
echo "  2. 調整 apps/api/src/simple-server.js 中的 prompt"
echo "  3. 重新測試驗證"
echo ""

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           🎊 開始測試吧！祝測試順利！                           ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
