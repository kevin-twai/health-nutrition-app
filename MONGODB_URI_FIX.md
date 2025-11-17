# 🔧 MongoDB URI 連接錯誤修復

## ❌ 錯誤訊息
```
MongoAPIError: URI must include hostname, domain name, and tld
```

## 🔍 問題原因

你的 `MONGODB_URI` 環境變數格式不正確或不完整。

## ✅ 立即修復步驟

### 步驟 1: 檢查當前的 MONGODB_URI

前往 Render Dashboard → Environment → 找到 `MONGODB_URI`

**常見錯誤格式：**
```
❌ mongodb+srv://health_app_user@health-nutrition-app
❌ mongodb://localhost:27017
❌ mongodb+srv://health_app_user:<password>@
❌ (空白或未設定)
```

### 步驟 2: 取得正確的連接字串

#### 方法 A: 從 MongoDB Atlas 複製

1. 登入 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 點擊你的 Cluster 的 **Connect** 按鈕
3. 選擇 **Connect your application**
4. **Driver**: Node.js
5. **Version**: 6.7 or later
6. 複製完整的連接字串

**正確格式範例：**
```
mongodb+srv://health_app_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/health_nutrition_db?retryWrites=true&w=majority
```

#### 方法 B: 手動構建

如果你知道所有資訊，按以下格式構建：

```
mongodb+srv://[使用者名稱]:[密碼]@[cluster地址]/[資料庫名稱]?retryWrites=true&w=majority&appName=health-nutrition-app
```

**實際範例：**
```
mongodb+srv://health_app_user:MyPass123@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app
```

### 步驟 3: 更新 Render 環境變數

1. 前往 Render Dashboard
2. 選擇你的 Web Service
3. 點擊 **Environment** 標籤
4. 找到 `MONGODB_URI` 並點擊編輯
5. 貼上**完整的**連接字串
6. 點擊 **Save Changes**

### 步驟 4: 重新部署

Render 會自動重新部署。等待部署完成（約 2-3 分鐘）。

### 步驟 5: 驗證連接

查看 Render Logs，應該看到：
```
✅ MongoDB 連接成功
```

## 📋 完整連接字串檢查清單

確認你的連接字串包含以下所有部分：

- [ ] `mongodb+srv://` 或 `mongodb://` 協議
- [ ] 使用者名稱（例如：`health_app_user`）
- [ ] `:` 冒號分隔符
- [ ] 密碼（已 URL encoded）
- [ ] `@` 符號
- [ ] Cluster 地址（例如：`cluster0.xxxxx.mongodb.net`）
- [ ] `/` 斜線
- [ ] 資料庫名稱（例如：`health_nutrition_db`）
- [ ] `?` 問號
- [ ] 連接選項（例如：`retryWrites=true&w=majority`）

## 🔐 密碼特殊字元處理

如果密碼包含特殊字元，必須 URL encode：

| 字元 | Encoded |
|------|---------|
| @    | %40     |
| :    | %3A     |
| /    | %2F     |
| ?    | %3F     |
| #    | %23     |
| [    | %5B     |
| ]    | %5D     |
| $    | %24     |
| &    | %26     |
| +    | %2B     |
| ,    | %2C     |
| ;    | %3B     |
| =    | %3D     |
| %    | %25     |
| space| %20     |

**範例：**
- 原密碼：`Pass@123#`
- Encoded：`Pass%40123%23`
- 完整 URI：`mongodb+srv://user:Pass%40123%23@cluster.mongodb.net/dbname`

## 🧪 測試連接字串

在本地測試連接字串是否正確：

```bash
# 設定環境變數
export MONGODB_URI="你的完整連接字串"

# 測試連接
node -e "
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
console.log('測試 URI:', uri.replace(/:[^:@]+@/, ':****@'));
const client = new MongoClient(uri);
client.connect()
  .then(() => {
    console.log('✅ 連接成功！');
    return client.close();
  })
  .catch(err => {
    console.error('❌ 連接失敗:', err.message);
  });
"
```

## 📝 完整範例

### 範例 1: 標準格式
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/mydatabase?retryWrites=true&w=majority
```

### 範例 2: 包含特殊字元的密碼
```
mongodb+srv://myuser:P%40ssw%23rd@cluster0.abc123.mongodb.net/mydatabase?retryWrites=true&w=majority
```

### 範例 3: 包含 appName
```
mongodb+srv://health_app_user:SecurePass123@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app
```

## 🚨 常見錯誤

### 錯誤 1: 缺少密碼
```
❌ mongodb+srv://user@cluster.mongodb.net/db
✅ mongodb+srv://user:password@cluster.mongodb.net/db
```

### 錯誤 2: 缺少 Cluster 地址
```
❌ mongodb+srv://user:pass@/db
✅ mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/db
```

### 錯誤 3: 密碼未 URL encode
```
❌ mongodb+srv://user:pass@word@cluster.mongodb.net/db
✅ mongodb+srv://user:pass%40word@cluster.mongodb.net/db
```

### 錯誤 4: 缺少資料庫名稱
```
❌ mongodb+srv://user:pass@cluster.mongodb.net
✅ mongodb+srv://user:pass@cluster.mongodb.net/health_nutrition_db
```

## ✅ 修復後的驗證

完成修復後，在 Render Logs 中應該看到：

```
🚀 啟動應用...
📡 連接 MongoDB...
✅ MongoDB 連接成功
📡 連接 PostgreSQL...
✅ PostgreSQL 連接成功
🎉 伺服器運行在 port 10000
```

## 🆘 還是不行？

如果按照以上步驟還是失敗，檢查：

1. **MongoDB Atlas IP 白名單**
   - 前往 Network Access
   - 確認有 `0.0.0.0/0` (允許所有 IP)

2. **資料庫使用者權限**
   - 前往 Database Access
   - 確認使用者有 "Read and write to any database" 權限

3. **Cluster 狀態**
   - 確認 Cluster 正在運行（不是暫停狀態）

4. **連接字串來源**
   - 直接從 MongoDB Atlas 複製，不要手動輸入

---

**修復完成後，記得重新部署並檢查 Logs！** 🎉
