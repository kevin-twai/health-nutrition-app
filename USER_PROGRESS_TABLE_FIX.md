# 用戶註冊表名錯誤修正

## 🔍 問題診斷

### 錯誤訊息
```
error: relation "user_progress" does not exist
```

### 根本原因

在 `UserRepository.ts` 中，創建用戶時嘗試插入 `user_progress` 表，但根據遷移文件 `003_create_gamification_tables.sql`，正確的表名應該是 `user_levels`。

這是一個**表名不一致**的問題：
- 代碼中使用: `user_progress`
- 遷移文件中創建: `user_levels`

## ✅ 解決方案

### 修改位置
`apps/api/src/repositories/UserRepository.ts` - 第 269-274 行

### 修改前
```typescript
// 建立用戶進度記錄
const progressQuery = `
  INSERT INTO user_progress (user_id, level, points, streak_days, last_activity_date)
  VALUES ($1, 1, 0, 0, CURRENT_DATE)
`;

await client.query(progressQuery, [newUser.id]);
```

### 修改後
```typescript
// 建立用戶等級記錄
const levelQuery = `
  INSERT INTO user_levels (user_id, level, experience_points, total_points, streak_days, last_activity_date)
  VALUES ($1, 1, 0, 0, 0, CURRENT_DATE)
`;

await client.query(levelQuery, [newUser.id]);
```

### 主要變更

1. **表名**: `user_progress` → `user_levels`
2. **欄位**: 添加了 `experience_points` 和 `total_points` 欄位（根據遷移文件的表結構）
3. **註釋**: 更新為更準確的描述

## 📊 user_levels 表結構

根據 `003_create_gamification_tables.sql`：

```sql
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
    total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 測試步驟

1. **等待 Render 部署完成**（約 2-3 分鐘）

2. **使用 Postman 測試註冊**：
   - URL: `https://health-nutrition-api.onrender.com/api/v1/auth/register`
   - Method: `POST`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
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
   }
   ```

3. **預期回應**：
   - Status: `201 Created`
   - Body:
   ```json
   {
     "success": true,
     "message": "用戶註冊成功",
     "data": {
       "user": {
         "id": "...",
         "email": "test@example.com",
         "profile": {
           "name": "測試用戶",
           ...
         }
       },
       "token": "eyJhbGc..."
     }
   }
   ```

## 📈 已修正的所有問題總結

到目前為止，我們已經修正了以下所有問題：

1. ✅ **遷移文件複製問題** - SQL 文件沒有被複製到 dist 目錄
2. ✅ **中文全文搜索配置問題** - `'chinese'` 配置不存在，改用 `'simple'`
3. ✅ **PostgreSQL 函數語法問題** - 使用單個 `$` 而不是 `$$`
4. ✅ **表名不一致問題** - `user_progress` 應該是 `user_levels`

## 🎉 預期結果

修正後，用戶註冊流程應該能夠：

1. ✅ 創建 `users` 表記錄
2. ✅ 創建 `user_profiles` 表記錄
3. ✅ 創建 `user_preferences` 表記錄
4. ✅ 創建 `user_levels` 表記錄（遊戲化系統）
5. ✅ 返回成功回應和 JWT token

## 🔄 部署狀態

- ✅ 修改已提交到 Git
- ✅ 修改已推送到 GitHub
- ⏳ 等待 Render 自動部署
- ⏳ 等待 Postman 測試驗證

---

**修改時間**: 2024-11-15  
**Git Commit**: 29190b3  
**影響文件**: `apps/api/src/repositories/UserRepository.ts`

## 💡 經驗教訓

這個問題提醒我們：

1. **保持代碼和資料庫架構同步** - 當修改資料庫表結構時，確保所有相關代碼也更新
2. **使用一致的命名** - 在設計階段就確定表名，避免後期混淆
3. **完整的測試** - 在部署前進行端到端測試，可以更早發現這類問題
