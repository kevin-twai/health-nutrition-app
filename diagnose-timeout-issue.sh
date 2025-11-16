#!/bin/bash

echo "🔍 診斷前後端連接超時問題"
echo "================================"
echo ""

echo "1️⃣ 測試後端 API 健康狀態..."
curl -s https://health-nutrition-api.onrender.com/health | jq .
echo ""

echo "2️⃣ 測試 CORS preflight 請求..."
curl -X OPTIONS https://health-nutrition-api.onrender.com/api/v1/photo/recognize \
  -H "Origin: https://health-nutrition-web.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v 2>&1 | grep -E "(HTTP|access-control|origin)"
echo ""

echo "3️⃣ 測試簡單的 POST 請求（無文件）..."
curl -X POST https://health-nutrition-api.onrender.com/api/v1/photo/recognize \
  -H "Origin: https://health-nutrition-web.onrender.com" \
  -H "Authorization: Bearer demo-token-for-testing" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v 2>&1 | head -30
echo ""

echo "4️⃣ 測試前端是否能訪問後端..."
echo "請在瀏覽器控制台執行以下命令："
echo ""
echo "fetch('https://health-nutrition-api.onrender.com/health')"
echo "  .then(r => r.json())"
echo "  .then(console.log)"
echo "  .catch(console.error)"
echo ""

echo "5️⃣ 檢查 Render 服務狀態..."
echo "請訪問 Render Dashboard 檢查："
echo "- API 服務是否正常運行"
echo "- 前端服務是否正常運行"
echo "- 查看最近的日誌"
echo ""

echo "6️⃣ 可能的問題："
echo "❌ Render 免費版可能有請求限制或冷啟動延遲"
echo "❌ 前端環境變數未正確設置"
echo "❌ 網絡層面的超時（Render 到 Render 的連接）"
echo "❌ 請求體過大（圖片文件）"
echo ""

echo "7️⃣ 建議的解決方案："
echo "✅ 在 Render Dashboard 中設置前端環境變數 NEXT_PUBLIC_API_URL"
echo "✅ 增加請求超時時間到 120 秒"
echo "✅ 檢查 Render 服務是否處於休眠狀態"
echo "✅ 考慮使用 Render 的內部網絡（如果兩個服務在同一區域）"
