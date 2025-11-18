#!/bin/bash

echo "🔧 整合 simple-server.js 與 EnhancedPromptGenerator..."
echo ""

# 備份原始文件
echo "📦 備份原始 simple-server.js..."
cp apps/api/src/simple-server.js apps/api/src/simple-server.js.backup
echo "✅ 備份完成：apps/api/src/simple-server.js.backup"
echo ""

echo "📝 整合步驟："
echo ""
echo "1. ✅ 已創建 simpleVisionHelper.js"
echo "2. ⏳ 需要手動修改 simple-server.js"
echo ""
echo "請按照以下步驟修改 simple-server.js："
echo ""
echo "步驟 1: 在文件頂部添加導入"
echo "----------------------------------------"
echo "const { generateFoodRecognitionPrompt } = require('./utils/simpleVisionHelper');"
echo ""
echo "步驟 2: 修改 callChatGPTVisionAPI 函數"
echo "----------------------------------------"
echo "將內嵌的 prompt 文本替換為："
echo "const prompt = generateFoodRecognitionPrompt({"
echo "  cuisineType: 'TAIWANESE',"
echo "  dishType: 'MIXED_DISH',"
echo "  retryCount: retryCount"
echo "});"
echo ""
echo "步驟 3: 修改 callChatGPTVisionAPIWithStrongerPrompt 函數"
echo "----------------------------------------"
echo "同樣替換內嵌的 prompt 文本"
echo ""
echo "📖 詳細說明請查看：INTEGRATION_SUMMARY.md"
echo ""
echo "✅ 輔助模組已準備好！"

