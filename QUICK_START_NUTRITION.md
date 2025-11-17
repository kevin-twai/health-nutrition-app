# 🚀 營養資料庫快速開始指南

## 1️⃣ 驗證資料 (30秒)

```bash
npx ts-node apps/api/src/scripts/verify-nutrition-data.ts
```

**預期輸出:**
```
🔍 驗證營養資料...
📊 總食物數量: 52 筆
✅ 所有資料包含必要欄位
✅ 所有食物代碼唯一
📈 各類別統計:
   vegetables: 31 筆
   proteins: 12 筆
   grains: 6 筆
   fruits: 2 筆
   dairy: 1 筆
✨ 驗證完成！
```

## 2️⃣ 初始化資料庫 (需要 MongoDB 運行)

### 方法 A: 使用測試腳本
```bash
./test-nutrition-database.sh
```

### 方法 B: 直接執行
```bash
npx ts-node apps/api/src/scripts/seed-nutrition-database.ts
```

**預期輸出:**
```
🚀 開始初始化營養資料庫...
📡 連接 MongoDB...
✅ MongoDB 連接成功
📊 開始導入營養資料...
成功插入 52 筆營養資料
✅ 營養資料導入完成
🔍 驗證資料完整性...
✅ 資料驗證通過
📈 資料庫統計:
   總食物數量: 52 筆
   各類別食物數量:
   - vegetables: 31 筆
   - proteins: 12 筆
   - grains: 6 筆
   - fruits: 2 筆
   - dairy: 1 筆
✨ 營養資料庫初始化完成！
```

## 3️⃣ 測試營養查詢 (API 測試)

### 啟動 API 服務器
```bash
cd apps/api
npm run dev
```

### 測試查詢食物營養
```bash
# 查詢豆腐營養資訊
curl http://localhost:3000/api/nutrition/search?name=豆腐

# 查詢雞肉營養資訊
curl http://localhost:3000/api/nutrition/search?name=雞肉

# 按類別查詢
curl http://localhost:3000/api/nutrition/category/vegetables
```

## 4️⃣ 整合到照片識別流程

### 測試完整流程
```bash
# 1. 上傳照片進行識別
curl -X POST http://localhost:3000/api/photo/recognize \
  -F "photo=@test-images/chicken.jpg"

# 2. 系統自動:
#    - 識別食物 (OpenAI Vision)
#    - 查詢營養資料庫
#    - 計算營養成分
#    - 返回完整資訊
```

## 📊 資料概覽

### 已包含的食物類別

| 類別 | 數量 | 範例 |
|------|------|------|
| 蔬菜類 | 31筆 | 高麗菜、空心菜、青椒 |
| 蛋白質類 | 12筆 | 雞肉、豬肉、豆腐 |
| 穀物類 | 6筆 | 白飯、米粉、麵條 |
| 水果類 | 2筆 | 蘋果、香蕉 |
| 乳製品 | 1筆 | 全脂牛奶 |

### 營養資訊包含

✅ 熱量 (大卡)  
✅ 三大營養素 (蛋白質、脂肪、碳水化合物)  
✅ 膳食纖維  
✅ 礦物質 (鈉、鈣、鐵、鎂、磷、鉀、鋅)  
✅ 維生素 (A, C, D, E, K, B群)  

## 🔧 常見問題

### Q: MongoDB 連接失敗？
**A:** 確保 MongoDB 正在運行:
```bash
# 檢查 MongoDB 狀態
brew services list | grep mongodb

# 啟動 MongoDB
brew services start mongodb-community
```

### Q: 如何添加新食物？
**A:** 編輯 `apps/api/src/database/seeds/nutrition-data-extended.ts`:
```typescript
{
  food_code: 'TW053',
  food_name: '新食物名稱',
  food_name_en: 'New Food Name',
  category: 'vegetables',
  subcategory: '子類別',
  energy_kcal: 100,
  protein_g: 5.0,
  // ... 其他營養資訊
}
```

### Q: 如何更新現有食物資料？
**A:** 
1. 找到對應的食物代碼
2. 修改營養數值
3. 重新執行初始化腳本

### Q: 資料來源是什麼？
**A:** 台灣食品營養成分資料庫 2023年版

## 📚 相關文件

- [詳細擴充說明](./NUTRITION_DATABASE_EXPANSION.md)
- [完成總結](./NUTRITION_DATABASE_SUMMARY.md)
- [主要任務清單](./.kiro/specs/health-nutrition-tracker/tasks.md)

## 🎯 下一步

1. ✅ 營養資料庫已擴充完成
2. 🔄 測試營養查詢功能
3. 📱 完善 Web 前端顯示
4. 🚀 部署到生產環境

---

**需要幫助？** 查看詳細文件或提出問題！
