# 遷移文件複製問題修正

## 🔍 問題診斷

### Render 日誌顯示的問題

```
開始執行資料庫遷移...
遷移目錄不存在，跳過遷移
沒有待執行的遷移
```

### 根本原因

TypeScript 編譯器 (`tsc`) 只會編譯 `.ts` 文件，**不會複製** `.sql` 文件到 `dist` 目錄。

在本地開發時，代碼直接從 `src` 目錄運行，所以能找到遷移文件。但在 Render 上：

1. 構建時執行 `npm run build` → 只有 `.ts` 文件被編譯到 `dist`
2. 運行時從 `dist` 目錄啟動 → 找不到 `dist/database/migrations` 目錄
3. 遷移系統報告 "遷移目錄不存在"

## ✅ 解決方案

修改 `apps/api/package.json` 的構建腳本：

### 修改前
```json
"build": "tsc"
```

### 修改後
```json
"build": "tsc && mkdir -p dist/database/migrations && cp -r src/database/migrations/*.sql dist/database/migrations/"
```

### 說明

1. `tsc` - 編譯 TypeScript 文件
2. `mkdir -p dist/database/migrations` - 創建目標目錄（如果不存在）
3. `cp -r src/database/migrations/*.sql dist/database/migrations/` - 複製所有 SQL 文件

## 📊 預期結果

修正後，Render 日誌應該顯示：

```
🔧 開始執行資料庫遷移...
📋 已執行的遷移數量: 0
📁 發現遷移文件數量: 4
🚀 發現 4 個待執行的遷移
⏳ 正在執行遷移: 001_create_user_tables
✅ 遷移完成: 001_create_user_tables
⏳ 正在執行遷移: 002_create_conversation_tables
✅ 遷移完成: 002_create_conversation_tables
⏳ 正在執行遷移: 003_create_gamification_tables
✅ 遷移完成: 003_create_gamification_tables
⏳ 正在執行遷移: 004_create_feedback_tables
✅ 遷移完成: 004_create_feedback_tables
🎉 所有資料庫遷移執行完成！
```

## 🎯 測試步驟

1. **等待 Render 部署完成**（約 2-3 分鐘）

2. **查看 Render 日誌**，確認看到遷移執行訊息

3. **測試 API**：
   ```bash
   # 使用 Postman 或 curl
   curl -X POST https://health-nutrition-api.onrender.com/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test@12345",
       "confirmPassword": "Test@12345",
       "profile": {
         "name": "測試用戶",
         "age": 30,
         "gender": "male",
         "height": 175,
         "weight": 70,
         "activityLevel": "moderately_active"
       }
     }'
   ```

4. **預期回應**：`201 Created` 表示註冊成功

## 💡 為什麼之前能工作？

之前的 `init-db.js` 腳本直接執行 SQL 創建表，所以即使遷移系統找不到文件，基本的表結構也能創建。但這不是最佳實踐，因為：

- 無法追蹤遷移歷史
- 無法管理資料庫版本
- 難以進行增量更新

現在修正後，遷移系統可以正常工作，提供更好的資料庫版本管理。

## 🔄 部署狀態

- ✅ 修改已提交到 Git
- ✅ 修改已推送到 GitHub
- ⏳ 等待 Render 自動部署
- ⏳ 等待測試驗證

---

**修改時間**: 2024-11-15  
**Git Commit**: de54b29
