#!/bin/bash

echo "🔍 測試後端 API 健康狀態..."
echo ""

# 測試健康端點
echo "1️⃣ 檢查後端健康狀態："
curl -s https://health-nutrition-app-w3zm.onrender.com/health | python3 -m json.tool | grep -A 10 "aiVisionAPI"

echo ""
echo ""
echo "2️⃣ 檢查 OpenAI API Key 配置："
curl -s https://health-nutrition-app-w3zm.onrender.com/health | python3 -c "
import sys, json
data = json.load(sys.stdin)
chatgpt = data.get('aiVisionAPI', {}).get('chatgpt', {})
print(f\"  - Configured: {chatgpt.get('configured')}\" )
print(f\"  - Key Present: {chatgpt.get('keyPresent')}\")
print(f\"  - Key Type: {chatgpt.get('keyType')}\")
"

echo ""
echo ""
echo "✅ 後端健康檢查完成"
echo ""
echo "📋 下一步："
echo "  1. 打開瀏覽器開發者工具 (F12)"
echo "  2. 切換到 Console 標籤"
echo "  3. 清除所有日誌 (點擊 🚫 圖標)"
echo "  4. 上傳圖片並點擊「開始分析」"
echo "  5. 等待 30 秒"
echo "  6. 查找以下日誌："
echo "     - '📤 發送請求到後端 API...'"
echo "     - '📥 收到後端回應，狀態: 200'"
echo "     - '🎯 使用的 API: ChatGPT Vision API'"
echo ""
echo "如果看到 '⚡ 使用本地分析...'，說明 API 調用失敗"
