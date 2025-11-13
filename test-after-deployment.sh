#!/bin/bash

# 部署後測試腳本
# 等待 Render 部署完成後執行此腳本

echo "🧪 部署後測試"
echo "============================================"
echo ""

# 等待用戶確認部署完成
echo "⏳ 請確認 Render 部署已完成"
echo "   查看: https://dashboard.render.com"
echo ""
read -p "部署完成了嗎？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 請等待部署完成後再執行此腳本"
    exit 1
fi

echo ""
echo "============================================"
echo "測試 1: 檢查 API 健康狀態"
echo "============================================"
echo ""

HEALTH_CHECK=$(curl -s https://health-nutrition-app-w3zm.onrender.com/health)
echo "健康檢查回應: $HEALTH_CHECK"
echo ""

echo "============================================"
echo "測試 2: 測試生蠔圖片（之前成功的）"
echo "============================================"
echo ""

OYSTER_IMAGE="/Users/kevinhktw/Downloads/image/IMG_1791.JPG"

if [ -f "$OYSTER_IMAGE" ]; then
    echo "📤 上傳生蠔圖片..."
    RESULT=$(curl -s -X POST \
      https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
      -F "photo=@$OYSTER_IMAGE" \
      -F "maxResults=5" \
      -F "minConfidence=0.3" \
      -F "language=zh-TW")
    
    API_USED=$(echo "$RESULT" | jq -r '.data.apiUsed')
    SUCCESS=$(echo "$RESULT" | jq -r '.success')
    
    echo "✅ 結果:"
    echo "   成功: $SUCCESS"
    echo "   使用 API: $API_USED"
    echo ""
    
    if [ "$API_USED" = "ChatGPT Vision API" ]; then
        echo "✅ 生蠔圖片測試通過！"
    else
        echo "⚠️  生蠔圖片使用了回退機制"
    fi
else
    echo "⚠️  找不到生蠔圖片，跳過測試"
fi

echo ""
echo "============================================"
echo "測試 3: 測試被拒絕的圖片（重點測試）"
echo "============================================"
echo ""

REJECTED_IMAGE="/Users/kevinhktw/Downloads/image/IMG_3843.JPG"

if [ -f "$REJECTED_IMAGE" ]; then
    echo "📤 上傳之前被拒絕的圖片..."
    echo "   這張圖片之前被 OpenAI 拒絕"
    echo "   現在應該會自動重試並成功"
    echo ""
    
    RESULT=$(curl -s -X POST \
      https://health-nutrition-app-w3zm.onrender.com/api/v1/photo/recognize \
      -F "photo=@$REJECTED_IMAGE" \
      -F "maxResults=10" \
      -F "minConfidence=0.3" \
      -F "language=zh-TW")
    
    API_USED=$(echo "$RESULT" | jq -r '.data.apiUsed')
    SUCCESS=$(echo "$RESULT" | jq -r '.success')
    FOODS_COUNT=$(echo "$RESULT" | jq -r '.data.recognition.suggestions | length')
    
    echo "✅ 結果:"
    echo "   成功: $SUCCESS"
    echo "   使用 API: $API_USED"
    echo "   辨識食材數量: $FOODS_COUNT"
    echo ""
    
    if [ "$API_USED" = "ChatGPT Vision API" ]; then
        echo "🎉 太棒了！之前被拒絕的圖片現在成功了！"
        echo "   重試機制運作正常！"
    else
        echo "⚠️  仍然使用回退機制"
        echo "   請查看 Render 日誌確認重試過程"
    fi
    
    echo ""
    echo "📊 辨識出的食材:"
    echo "$RESULT" | jq -r '.data.recognition.suggestions[].food.name' | head -5
else
    echo "⚠️  找不到測試圖片，跳過測試"
fi

echo ""
echo "============================================"
echo "📝 查看詳細日誌"
echo "============================================"
echo ""
echo "請到 Render Dashboard 查看詳細日誌："
echo "https://dashboard.render.com"
echo ""
echo "關鍵日誌訊息："
echo "  - '❌ OpenAI 拒絕分析此圖片' - 初次被拒絕"
echo "  - '🔄 嘗試重試' - 開始重試"
echo "  - '✅ ChatGPT Vision API 重試成功！' - 重試成功"
echo "  - '❌ 重試後仍被拒絕' - 重試失敗"
echo ""
echo "✅ 測試完成！"
