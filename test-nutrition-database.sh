#!/bin/bash

# 營養資料庫測試腳本

echo "🧪 測試營養資料庫"
echo "=================="
echo ""

# 檢查 MongoDB 連接
echo "1️⃣  檢查 MongoDB 連接..."
if ! command -v mongosh &> /dev/null; then
    echo "⚠️  mongosh 未安裝，跳過連接測試"
else
    echo "✅ MongoDB 工具已安裝"
fi

echo ""
echo "2️⃣  執行營養資料庫初始化..."
cd apps/api
npx ts-node src/scripts/seed-nutrition-database.ts

echo ""
echo "✨ 測試完成！"
