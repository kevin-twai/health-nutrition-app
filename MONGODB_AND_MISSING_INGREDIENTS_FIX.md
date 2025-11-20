# MongoDB 連接與缺失食材修復方案

## 🔍 問題分析

### 1. MongoDB 連接問題
- **現象**：Render 環境已設定 `MONGODB_URI`，但系統仍顯示「MongoDB 不可用」
- **原因**：
  - MongoDB 連接可能在啟動時失敗
  - 連接超時設定太短（5秒）
  - 沒有重試機制

### 2. 食材識別問題
- **現象**：
  - 「蟹**腳**」無法識別（系統只有「蟹**腿**」）
  - 「豆腐」被誤認為「豆腐干絲」
  - 「白菜」被誤認為「青江菜」
  - 缺少「水菜」、「豆苗」、「魚片」等食材

- **根本原因**：
  - `AsianCuisineKnowledgeBase` 使用靜態數據，不從 MongoDB 查詢
  - 靜態數據中缺少這些食材定義

## 🎯 解決方案

### 方案 A：修復 MongoDB 連接（推薦）
1. 增加連接超時時間
2. 添加重試機制
3. 改善錯誤日誌
4. 在 Render 上運行種子腳本填充數據

### 方案 B：擴展靜態數據（快速修復）
1. 在 `asianFoodItems.ts` 中添加缺失的食材
2. 為現有食材添加更多名稱變體
3. 立即部署，無需 MongoDB

## 📋 實施步驟

### 步驟 1：擴展靜態食材數據（立即生效）

需要添加的食材：
- ✅ 豆腐（已存在，需添加變體）
- ❌ 蟹腿/蟹腳（需新增）
- ❌ 豆苗（需新增）
- ❌ 魚片（需新增）
- ❌ 水菜（需新增）
- ✅ 白菜（需檢查變體）

### 步驟 2：改善 MongoDB 連接

```typescript
// apps/api/src/database/mongodb.ts
public async connect(): Promise<void> {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const uri = process.env.MONGODB_URI;
      
      if (!uri) {
        console.warn('⚠️  MONGODB_URI 未設置');
        return;
      }

      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 30000, // 增加到 30 秒
        connectTimeoutMS: 30000,
        retryWrites: true,
        retryReads: true,
      });
      
      await this.client.connect();
      this.db = this.client.db(dbName);
      
      // 測試連接
      await this.db.admin().ping();
      
      console.log('✅ MongoDB 連接成功');
      await this.createIndexes();
      return;
      
    } catch (error) {
      retryCount++;
      console.error(`❌ MongoDB 連接失敗 (嘗試 ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount < maxRetries) {
        console.log(`⏳ ${5 * retryCount} 秒後重試...`);
        await new Promise(resolve => setTimeout(resolve, 5000 * retryCount));
      }
    }
  }
  
  console.warn('⚠️  MongoDB 連接失敗，系統將使用靜態數據');
  this.client = null;
  this.db = null;
}
```

### 步驟 3：在 Render 上種子 MongoDB 數據

```bash
# 在 Render Shell 中執行
cd apps/api
node -r ts-node/register src/scripts/seed-nutrition-database.ts
```

## 🚀 快速修復（推薦先執行）

立即添加缺失的食材到靜態數據：

```typescript
// apps/api/src/data/asianFoodItems.ts

'蟹腿': {
  id: 'crab_leg',
  name: '蟹腿',
  nameVariants: ['蟹腳', '蟹肉', '蟹棒'],
  category: FoodCategory.SEAFOOD,
  // ... 完整定義
},

'豆苗': {
  id: 'pea_shoots',
  name: '豆苗',
  nameVariants: ['豌豆苗', '豆苗菜'],
  category: FoodCategory.LEAFY_GREENS,
  // ... 完整定義
},

'魚片': {
  id: 'fish_fillet',
  name: '魚片',
  nameVariants: ['魚肉片', '鱼片'],
  category: FoodCategory.SEAFOOD,
  // ... 完整定義
},

'水菜': {
  id: 'mizuna',
  name: '水菜',
  nameVariants: ['京水菜', '日本水菜'],
  category: FoodCategory.LEAFY_GREENS,
  // ... 完整定義
}
```

## ✅ 驗證步驟

1. 部署後測試食材識別
2. 檢查 Render 日誌確認 MongoDB 連接狀態
3. 測試火鍋圖片識別

## 📊 預期結果

- ✅ 「蟹腳」和「蟹腿」都能正確識別
- ✅ 「豆腐」不會被誤認為「豆腐干絲」
- ✅ 「白菜」能正確識別
- ✅ 「豆苗」、「魚片」、「水菜」能被識別
- ✅ MongoDB 連接更穩定（如果可用）

## 🎯 下一步

你想要我：
1. **立即添加缺失的食材到靜態數據**（快速修復，5分鐘內完成）
2. **同時修復 MongoDB 連接**（完整解決方案，需要 15 分鐘）
3. **只修復 MongoDB 連接**（需要在 Render 上運行種子腳本）

請告訴我你的選擇！
