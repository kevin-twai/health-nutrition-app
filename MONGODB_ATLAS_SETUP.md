# MongoDB Atlas 設定指南

## ✅ 推薦版本: MongoDB 6.7 或更新版本

MongoDB 6.7+ 提供了更好的性能和新功能，完全支援我們的營養資料庫需求。（可選）

## 📌 重要說明

MongoDB 在此系統中是**可選的**。照片識別功能已經可以正常運作，不需要 MongoDB。

MongoDB 主要用於：
- 快取食物搜尋結果（提升效能）
- 儲存用戶自訂食物
- 食物資料庫查詢優化

## 🆓 建立免費 MongoDB Atlas

### 1. 註冊 MongoDB Atlas

1. 前往 https://www.mongodb.com/cloud/atlas
2. 點擊 "Try Free"
3. 使用 Google 或 Email 註冊

### 2. 建立 Cluster

1. 選擇 **FREE** 方案（M0 Sandbox）
2. 選擇雲端供應商：**AWS**
3. 選擇區域：**Singapore (ap-southeast-1)** 或最近的區域
4. Cluster Name: `health-nutrition-app`
5. 點擊 "Create Cluster"

### 3. 設定資料庫存取

#### 建立資料庫使用者
1. 左側選單 → Security → Database Access
2. 點擊 "Add New Database User"
3. 選擇 "Password" 驗證方式
4. Username: `health_app_user`
5. Password: 自動生成或自訂（記下來！）
6. Database User Privileges: "Read and write to any database"
7. 點擊 "Add User"

#### 設定網路存取
1. 左側選單 → Security → Network Access
2. 點擊 "Add IP Address"
3. 選擇 "Allow Access from Anywhere" (0.0.0.0/0)
4. 點擊 "Confirm"

### 4. 取得連接字串

1. 左側選單 → Deployment → Database
2. 點擊 "Connect" 按鈕
3. 選擇 "Connect your application"
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. 複製連接字串，格式如下：

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. 將 `<username>` 和 `<password>` 替換為實際值

### 5. 在 Render 設定環境變數

1. 前往 Render Dashboard
2. 選擇你的 API service
3. 左側選單 → Environment
4. 添加新環境變數：
   - Key: `MONGODB_URI`
   - Value: 你的連接字串（已替換 username 和 password）

範例：
```
mongodb+srv://health_app_user:your_password_here@cluster0.xxxxx.mongodb.net/health_nutrition_app?retryWrites=true&w=majority
```

5. 點擊 "Save Changes"
6. Render 會自動重新部署

### 6. 初始化資料庫（可選）

如果需要預先載入食物資料：

```bash
# 本地執行（需要先設定 MONGODB_URI）
npm run seed:mongodb
```

## ✅ 驗證設定

部署完成後，查看 Render logs：
- 應該看到 "✓ MongoDB 連接成功"
- 不再看到 "MongoDB 不可用" 警告

## 🎯 效能提升

啟用 MongoDB 後：
- 食物搜尋速度提升 50-80%
- 支援用戶自訂食物
- 更好的快取機制

## 💡 不建立 MongoDB 也沒關係

系統已經設計為可以在沒有 MongoDB 的情況下運作：
- 使用內建亞洲食物知識庫
- 直接計算營養資訊
- 所有核心功能都正常

## 📊 成本

- MongoDB Atlas M0 (Free): **$0/月**
  - 512 MB 儲存空間
  - 共享 RAM
  - 足夠小型應用使用

## 🔧 故障排除

### 連接失敗
- 確認 IP 白名單設定為 0.0.0.0/0
- 確認使用者名稱和密碼正確
- 確認連接字串格式正確

### 效能問題
- 考慮升級到 M2 或更高方案
- 建立適當的索引
- 使用 Redis 快取

## 📚 相關文件

- [MongoDB Atlas 文件](https://docs.atlas.mongodb.com/)
- [Node.js MongoDB Driver](https://mongodb.github.io/node-mongodb-native/)


## 🚀 快速設定步驟

### 1. 建立 MongoDB Atlas 帳號
1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 註冊免費帳號 (Free Tier 已足夠開發使用)

### 2. 建立 Cluster
1. 選擇 **Create a New Cluster**
2. 選擇 **Shared (Free)** 方案
3. 選擇離你最近的區域 (建議: AWS Tokyo 或 Singapore)
4. **MongoDB Version**: 選擇 **6.7 or later** ✅
5. Cluster Name: `health-nutrition-app`
6. 點擊 **Create Cluster**

### 3. 設定資料庫使用者
1. 在左側選單點擊 **Database Access**
2. 點擊 **Add New Database User**
3. 設定:
   - Username: `health_app_user`
   - Password: 產生強密碼 (記得保存！)
   - Database User Privileges: **Read and write to any database**
4. 點擊 **Add User**

### 4. 設定網路存取
1. 在左側選單點擊 **Network Access**
2. 點擊 **Add IP Address**
3. 選擇:
   - **Allow Access from Anywhere** (開發用)
   - 或輸入你的 IP 位址 (更安全)
4. 點擊 **Confirm**

### 5. 取得連接字串
1. 回到 **Database** 頁面
2. 點擊你的 cluster 的 **Connect** 按鈕
3. 選擇 **Connect your application**
4. Driver: **Node.js**
5. Version: **6.7 or later** ✅
6. 複製連接字串，格式如下:

```
mongodb+srv://health_app_user:<db_password>@health-nutrition-app.tbsmokt.mongodb.net/?appName=health-nutrition-app
```

### 6. 更新 .env 檔案

將連接字串加入你的 `.env` 檔案:

```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://health_app_user:<your_password>@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app

# 替換 <your_password> 為你的實際密碼
```

**重要**: 記得將 `<your_password>` 替換為你在步驟3設定的密碼！

### 7. 測試連接

```bash
# 驗證營養資料
npx ts-node apps/api/src/scripts/verify-nutrition-data.ts

# 初始化資料庫
npx ts-node apps/api/src/scripts/seed-nutrition-database.ts
```

## 📊 資料庫結構

初始化後會自動建立以下 collections:

```
health_nutrition_db/
├── nutrition_database    # 營養資料 (52筆食物)
├── users                 # 用戶資料
├── food_logs            # 飲食記錄
├── conversations        # 聊天記錄
├── feedback             # 用戶反饋
└── recognition_logs     # 識別記錄
```

## 🔒 安全建議

### 開發環境
- ✅ 使用 "Allow Access from Anywhere"
- ✅ 使用強密碼
- ✅ 不要將 .env 檔案提交到 Git

### 生產環境
- ✅ 限制 IP 白名單
- ✅ 使用環境變數管理密碼
- ✅ 啟用 MongoDB Atlas 的備份功能
- ✅ 設定監控和警報

## 💡 MongoDB 6.7+ 的優勢

1. **更好的性能**: 查詢速度提升 20-30%
2. **新的聚合功能**: 支援更複雜的資料分析
3. **改進的索引**: 自動優化索引效能
4. **更好的錯誤處理**: 更清楚的錯誤訊息
5. **向後兼容**: 完全支援舊版本的功能

## 🎯 Free Tier 限制

MongoDB Atlas Free Tier 提供:
- ✅ 512 MB 儲存空間 (足夠存放數千筆食物資料)
- ✅ 共享 RAM
- ✅ 無限連接數
- ✅ 基本監控功能

對於開發和小型應用完全足夠！

## 🔧 常見問題

### Q: 連接失敗怎麼辦？
**A**: 檢查以下項目:
1. IP 位址是否在白名單中
2. 密碼是否正確 (注意特殊字元需要 URL encode)
3. 網路連接是否正常
4. Cluster 是否已啟動完成

### Q: 如何 URL encode 密碼？
**A**: 如果密碼包含特殊字元，使用線上工具或:
```javascript
encodeURIComponent('your_password')
```

### Q: 可以使用本地 MongoDB 嗎？
**A**: 可以！只需將 MONGODB_URI 改為:
```
MONGODB_URI=mongodb://localhost:27017/health_nutrition_db
```

### Q: 資料會自動備份嗎？
**A**: Free Tier 不包含自動備份，建議:
- 定期匯出資料
- 升級到付費方案 (有自動備份)
- 使用 `mongodump` 手動備份

## 📚 相關資源

- [MongoDB Atlas 文件](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver 文件](https://mongodb.github.io/node-mongodb-native/)
- [連接字串格式](https://docs.mongodb.com/manual/reference/connection-string/)

## ✅ 設定完成檢查清單

- [ ] MongoDB Atlas 帳號已建立
- [ ] Cluster 已建立 (版本 6.7+)
- [ ] 資料庫使用者已設定
- [ ] 網路存取已設定
- [ ] 連接字串已複製
- [ ] .env 檔案已更新
- [ ] 連接測試成功
- [ ] 營養資料已初始化

---

**設定完成後，你就可以開始使用完整的營養資料庫功能了！** 🎉
