# 🔧 Render Shell 營養資料庫初始化修正

## 問題
執行 `npm run seed:nutrition` 時出現錯誤：
```
npm error Missing script: "seed:nutrition"
```

## 原因
package.json 中沒有定義 `seed:nutrition` 腳本。

---

## ✅ 解決方案

### 方法 1: 直接執行 TypeScript 腳本 (推薦)

在 Render Shell 中執行：

```bash
npx tsx src/scripts/seed-nutrition-database.ts
```

### 方法 2: 使用 ts-node

如果 tsx 不可用，使用 ts-node：

```bash
npx ts-node src/scripts/seed-nutrition-database.ts
```

### 方法 3: 使用編譯後的 JavaScript

如果 TypeScript 執行有問題，先編譯再執行：

```bash
# 1. 編譯 TypeScript
npm run build

# 2. 執行編譯後的腳本
node dist/scripts/seed-nutrition-database.js
```

---

## 📝 完整執行步驟

### 步驟 1: 進入 Render Shell

1. 登入 [Render Dashboard](https://dashboard.render.com)
2. 選擇你的 Web Service
3. 點擊右上角 **Shell** 按鈕
4. 等待 Shell 連接成功

### 步驟 2: 確認當前目錄

```bash
pwd
```

應該顯示類似：`/opt/render/project/src` 或 `/opt/render/project`

### 步驟 3: 進入 API 目錄

```bash
cd apps/api
```

或者如果已經在正確目錄：

```bash
ls -la
```

確認看到 `src/` 目錄和 `package.json`

### 步驟 4: 執行初始化腳本

```bash
npx tsx src/scripts/seed-nutrition-database.ts
```

### 步驟 5: 等待完成

你應該看到類似以下輸出：

```
🚀 開始初始化營養資料庫...

📡 連接 MongoDB...
✅ MongoDB 連接成功

📊 開始導入營養資料...
✅ 營養資料導入完成

🔍 驗證資料完整性...
✅ 資料驗證通過

📈 資料庫統計:
   總食物數量: 52 筆

   各類別食物數量:
   - 蛋白質: 15 筆
   - 蔬菜: 12 筆
   - 水果: 10 筆
   - 穀物: 8 筆
   - 乳製品: 7 筆

✨ 營養資料庫初始化完成！
```

---

## 🔍 驗證資料是否成功導入

### 方法 1: 使用驗證腳本

```bash
npx tsx src/scripts/verify-nutrition-data.ts
```

### 方法 2: 使用 MongoDB Shell (如果可用)

```bash
npx tsx -e "
const { mongodb } = require('./src/database/mongodb');
mongodb.connect().then(async () => {
  const db = mongodb.getDb();
  const count = await db.collection('nutrition_database').countDocuments();
  console.log('營養資料數量:', count);
  
  const sample = await db.collection('nutrition_database').findOne();
  console.log('範例資料:', JSON.stringify(sample, null, 2));
  
  process.exit(0);
});
"
```

### 方法 3: 測試 API 端點

退出 Shell，然後在本地執行：

```bash
curl https://your-app-name.onrender.com/api/nutrition/search?name=雞肉
```

---

## ❌ 常見錯誤處理

### 錯誤 1: `tsx: command not found`

**解決方案:** 使用 ts-node

```bash
npx ts-node src/scripts/seed-nutrition-database.ts
```

### 錯誤 2: `Cannot find module`

**解決方案:** 確認在正確目錄

```bash
cd apps/api
ls -la src/scripts/
```

### 錯誤 3: `MongoDB connection failed`

**檢查:**
1. MONGODB_URI 環境變數是否正確設定
2. MongoDB Atlas IP 白名單是否包含 0.0.0.0/0

**解決方案:** 檢查環境變數

```bash
echo $MONGODB_URI
```

應該顯示完整的連接字串（密碼會被隱藏）

### 錯誤 4: `Permission denied`

**解決方案:** 確認腳本有執行權限

```bash
chmod +x src/scripts/seed-nutrition-database.ts
npx tsx src/scripts/seed-nutrition-database.ts
```

### 錯誤 5: 腳本執行但沒有輸出

**可能原因:** 腳本正在執行，請耐心等待

**檢查:** 查看 Render Logs

1. 在另一個瀏覽器標籤開啟 Render Dashboard
2. 點擊 **Logs** 標籤
3. 查看是否有相關日誌

---

## 🎯 成功指標

完成後，你應該能：

✅ 看到 "營養資料庫初始化完成" 訊息
✅ 總食物數量顯示 52 筆
✅ 各類別都有資料
✅ API 查詢返回正確的營養資訊

---

## 📚 相關命令參考

### 查看所有可用的 npm 腳本

```bash
npm run
```

### 查看 MongoDB 連接狀態

```bash
npx tsx -e "
const { mongodb } = require('./src/database/mongodb');
mongodb.connect()
  .then(() => console.log('✅ MongoDB 連接成功'))
  .catch(err => console.error('❌ 連接失敗:', err))
  .finally(() => process.exit(0));
"
```

### 清空並重新導入資料

```bash
# 先清空
npx tsx -e "
const { mongodb } = require('./src/database/mongodb');
mongodb.connect().then(async () => {
  const db = mongodb.getDb();
  await db.collection('nutrition_database').deleteMany({});
  console.log('✅ 資料已清空');
  process.exit(0);
});
"

# 再導入
npx tsx src/scripts/seed-nutrition-database.ts
```

---

## 💡 建議

1. **第一次執行** - 使用方法 1 (tsx)
2. **如果失敗** - 嘗試方法 2 (ts-node)
3. **仍然失敗** - 使用方法 3 (編譯後執行)
4. **執行成功後** - 使用驗證腳本確認資料完整性

---

## 🚀 快速執行 (複製貼上)

```bash
# 進入 API 目錄
cd apps/api

# 執行初始化
npx tsx src/scripts/seed-nutrition-database.ts

# 驗證結果
npx tsx src/scripts/verify-nutrition-data.ts
```

---

**準備好了嗎？在 Render Shell 中執行上面的命令！** 🎉

有任何問題隨時告訴我！
