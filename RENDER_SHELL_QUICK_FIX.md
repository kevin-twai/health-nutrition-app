# 🚀 Render Shell 快速修正 - 營養資料庫初始化

## 問題診斷

你當前在：`~/project/src` (這就是 `apps/api` 目錄)

錯誤原因：路徑重複了 `src`

---

## ✅ 立即執行（複製貼上）

### 方法 1: 使用絕對路徑 (最簡單)

```bash
npx tsx ./src/scripts/seed-nutrition-database.ts
```

注意：路徑前面是 `./` 而不是 `src/`

### 方法 2: 先確認目錄結構

```bash
# 查看當前目錄
pwd

# 列出文件
ls -la

# 確認 scripts 目錄存在
ls -la src/scripts/
```

然後執行：

```bash
npx tsx ./src/scripts/seed-nutrition-database.ts
```

### 方法 3: 使用 Node 直接執行

```bash
node --loader tsx ./src/scripts/seed-nutrition-database.ts
```

### 方法 4: 使用編譯後的文件

```bash
# 檢查 dist 目錄是否存在
ls -la dist/scripts/

# 如果存在，直接執行
node dist/scripts/seed-nutrition-database.js
```

---

## 🎯 推薦執行順序

### 第一步：確認位置

```bash
pwd
ls -la src/scripts/seed-nutrition-database.ts
```

應該看到文件存在。

### 第二步：執行初始化

```bash
npx tsx ./src/scripts/seed-nutrition-database.ts
```

### 第三步：等待完成

你應該看到：

```
🚀 開始初始化營養資料庫...
📡 連接 MongoDB...
✅ MongoDB 連接成功
📊 開始導入營養資料...
✅ 營養資料導入完成
...
```

---

## 🔧 如果還是失敗

### 備用方案 A: 使用 ts-node

```bash
npx ts-node ./src/scripts/seed-nutrition-database.ts
```

### 備用方案 B: 創建臨時腳本

```bash
cat > seed-temp.js << 'EOF'
const { mongodb } = require('./dist/database/mongodb');
const { NutritionDatabaseSeeder } = require('./dist/database/seeds/nutrition-data');

async function main() {
  try {
    console.log('🚀 開始初始化...');
    await mongodb.connect();
    console.log('✅ MongoDB 連接成功');
    
    await NutritionDatabaseSeeder.seedNutritionDatabase();
    console.log('✅ 資料導入完成');
    
    const db = mongodb.getDb();
    const count = await db.collection('nutrition_database').countDocuments();
    console.log('📊 總數量:', count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 錯誤:', error);
    process.exit(1);
  }
}

main();
EOF

node seed-temp.js
```

### 備用方案 C: 檢查編譯文件

```bash
# 確認 build 已完成
ls -la dist/

# 如果沒有 dist 目錄，先編譯
npm run build

# 然後執行
node dist/scripts/seed-nutrition-database.js
```

---

## 📋 完整診斷步驟

如果上面都不行，執行以下診斷：

```bash
# 1. 確認當前目錄
echo "當前目錄:"
pwd

# 2. 確認文件存在
echo -e "\n檢查 TypeScript 文件:"
ls -la src/scripts/seed-nutrition-database.ts

# 3. 確認 node_modules
echo -e "\n檢查 tsx:"
ls -la node_modules/.bin/tsx

# 4. 確認 MongoDB URI
echo -e "\nMongoDB URI (隱藏密碼):"
echo $MONGODB_URI | sed 's/:.*@/:***@/'

# 5. 測試 MongoDB 連接
echo -e "\n測試 MongoDB 連接:"
npx tsx -e "
const { mongodb } = require('./dist/database/mongodb');
mongodb.connect()
  .then(() => console.log('✅ 連接成功'))
  .catch(err => console.error('❌ 連接失敗:', err.message))
  .finally(() => process.exit(0));
"
```

---

## 💡 最簡單的解決方案

如果你只是想快速導入資料，可以使用這個一行命令：

```bash
npx tsx -e "const{mongodb}=require('./dist/database/mongodb');const{NutritionDatabaseSeeder}=require('./dist/database/seeds/nutrition-data');(async()=>{await mongodb.connect();await NutritionDatabaseSeeder.seedNutritionDatabase();const db=mongodb.getDb();const count=await db.collection('nutrition_database').countDocuments();console.log('✅完成!總數:',count);process.exit(0)})();"
```

---

## ✅ 成功後的驗證

執行以下命令確認資料已導入：

```bash
npx tsx -e "
const { mongodb } = require('./dist/database/mongodb');
(async () => {
  await mongodb.connect();
  const db = mongodb.getDb();
  const count = await db.collection('nutrition_database').countDocuments();
  console.log('📊 營養資料數量:', count);
  
  if (count > 0) {
    const sample = await db.collection('nutrition_database').findOne();
    console.log('✅ 範例資料:', sample.name);
  }
  
  process.exit(0);
})();
"
```

應該顯示：`營養資料數量: 52`

---

## 🎉 完成！

資料導入成功後，你可以：

1. 退出 Shell (輸入 `exit`)
2. 測試 API 端點
3. 繼續下一步開發

---

**現在試試第一個方法！** 🚀

```bash
npx tsx ./src/scripts/seed-nutrition-database.ts
```
