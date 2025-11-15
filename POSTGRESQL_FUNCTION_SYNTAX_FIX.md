# PostgreSQL 函數語法錯誤修正

## 🔍 問題診斷

### 錯誤訊息
```
❌ 遷移執行失敗: error: syntax error at or near "$"
position: '10545'
```

### 根本原因

在 PostgreSQL 中定義函數時，需要使用 **dollar-quoted 字符串** 來包裹函數體。正確的語法是使用 `$$` 而不是單個 `$`。

**錯誤的語法**:
```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS INTEGER AS $      -- ❌ 單個 $ 會導致語法錯誤
BEGIN
    RETURN 1;
END;
$ LANGUAGE plpgsql;       -- ❌ 單個 $ 會導致語法錯誤
```

**正確的語法**:
```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS INTEGER AS $$     -- ✅ 使用 $$
BEGIN
    RETURN 1;
END;
$$ LANGUAGE plpgsql;      -- ✅ 使用 $$
```

## ✅ 解決方案

### 修改的函數

在 `003_create_gamification_tables.sql` 中修正了兩個函數：

#### 1. calculate_level_requirement

**修改前**:
```sql
CREATE OR REPLACE FUNCTION calculate_level_requirement(level INTEGER)
RETURNS INTEGER AS $
BEGIN
    RETURN ROUND(100 * POWER(level, 1.5));
END;
$ LANGUAGE plpgsql;
```

**修改後**:
```sql
CREATE OR REPLACE FUNCTION calculate_level_requirement(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN ROUND(100 * POWER(level, 1.5));
END;
$$ LANGUAGE plpgsql;
```

#### 2. calculate_level_from_experience

**修改前**:
```sql
CREATE OR REPLACE FUNCTION calculate_level_from_experience(experience_points INTEGER)
RETURNS INTEGER AS $
DECLARE
    level INTEGER := 1;
    required_exp INTEGER;
BEGIN
    WHILE true LOOP
        required_exp := calculate_level_requirement(level + 1);
        IF experience_points < required_exp THEN
            EXIT;
        END IF;
        level := level + 1;
    END LOOP;
    
    RETURN level;
END;
$ LANGUAGE plpgsql;
```

**修改後**:
```sql
CREATE OR REPLACE FUNCTION calculate_level_from_experience(experience_points INTEGER)
RETURNS INTEGER AS $$
DECLARE
    level INTEGER := 1;
    required_exp INTEGER;
BEGIN
    WHILE true LOOP
        required_exp := calculate_level_requirement(level + 1);
        IF experience_points < required_exp THEN
            EXIT;
        END IF;
        level := level + 1;
    END LOOP;
    
    RETURN level;
END;
$$ LANGUAGE plpgsql;
```

## 📚 PostgreSQL Dollar-Quoted 字符串說明

### 為什麼使用 $$？

1. **避免轉義問題**: 函數體中可能包含單引號，使用 $$ 可以避免複雜的轉義
2. **提高可讀性**: 代碼更清晰，不需要處理引號嵌套
3. **標準語法**: 這是 PostgreSQL 推薦的函數定義方式

### 其他有效的分隔符

除了 `$$`，你也可以使用自定義標籤：

```sql
-- 使用自定義標籤
CREATE FUNCTION my_func() RETURNS INTEGER AS $BODY$
BEGIN
    RETURN 1;
END;
$BODY$ LANGUAGE plpgsql;

-- 或者
CREATE FUNCTION my_func() RETURNS INTEGER AS $function$
BEGIN
    RETURN 1;
END;
$function$ LANGUAGE plpgsql;
```

但 `$$` 是最常用和推薦的方式。

## 🎯 測試步驟

1. **等待 Render 部署完成**（約 2-3 分鐘）

2. **查看 Render 日誌**，確認所有遷移成功：
   ```
   🔧 開始執行資料庫遷移...
   📁 發現遷移文件數量: 4
   🚀 發現 2 個待執行的遷移
   ⏳ 正在執行遷移: 003_create_gamification_tables
   ✅ 遷移完成: 003_create_gamification_tables
   ⏳ 正在執行遷移: 004_create_feedback_tables
   ✅ 遷移完成: 004_create_feedback_tables
   🎉 所有資料庫遷移執行完成！
   ```

3. **測試用戶註冊**：
   ```bash
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

4. **預期回應**：`201 Created`

## 📊 已修正的問題總結

到目前為止，我們已經修正了以下問題：

1. ✅ **遷移文件複製問題** - SQL 文件沒有被複製到 dist 目錄
2. ✅ **中文全文搜索配置問題** - `'chinese'` 配置不存在
3. ✅ **PostgreSQL 函數語法問題** - 使用單個 `$` 而不是 `$$`

## 🔄 部署狀態

- ✅ 修改已提交到 Git
- ✅ 修改已推送到 GitHub
- ⏳ 等待 Render 自動部署
- ⏳ 等待測試驗證

---

**修改時間**: 2024-11-15  
**Git Commit**: ed47d84  
**影響文件**: `apps/api/src/database/migrations/003_create_gamification_tables.sql`
